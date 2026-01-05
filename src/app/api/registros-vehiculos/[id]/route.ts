import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET: Obtener un registro específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const registroId = parseInt(id)

    const registro = await prisma.registroVehiculo.findUnique({
      where: { id: registroId },
      include: {
        tipoVehiculo: true,
        servicio: {
          include: {
            categoria: true
          }
        },
        estadoCarro: true,
        estadoPago: true,
        serviciosExtras: {
          include: {
            servicioExtra: true
          }
        }
      }
    })

    if (!registro) {
      return NextResponse.json(
        { error: 'Registro no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(registro)
  } catch (error) {
    console.error('Error al obtener registro:', error)
    return NextResponse.json(
      { error: 'Error al obtener registro' },
      { status: 500 }
    )
  }
}

// PUT: Actualizar un registro
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const registroId = parseInt(id)
    const data = await request.json()

    // Verificar que el registro existe
    const registroExistente = await prisma.registroVehiculo.findUnique({
      where: { id: registroId }
    })

    if (!registroExistente) {
      return NextResponse.json(
        { error: 'Registro no encontrado' },
        { status: 404 }
      )
    }

    // Validar campos requeridos
    const camposRequeridos = [
      'nombre', 'cedula', 'telefono', 'placa',
      'tipoVehiculoId', 'servicioId', 'estadoCarroId', 'estadoPagoId',
      'precioTotal'
    ]

    for (const campo of camposRequeridos) {
      if (!data[campo]) {
        return NextResponse.json(
          { error: `El campo ${campo} es requerido` },
          { status: 400 }
        )
      }
    }

    // Primero eliminar los servicios extras existentes
    await prisma.registroVehiculoServicioExtra.deleteMany({
      where: { registroVehiculoId: registroId }
    })

    // Actualizar registro
    const registro = await prisma.registroVehiculo.update({
      where: { id: registroId },
      data: {
        nombre: data.nombre,
        cedula: data.cedula,
        telefono: data.telefono,
        placa: data.placa,
        tipoVehiculoId: parseInt(data.tipoVehiculoId),
        servicioId: parseInt(data.servicioId),
        estadoCarroId: parseInt(data.estadoCarroId),
        estadoPagoId: parseInt(data.estadoPagoId),
        precioTotal: parseFloat(data.precioTotal),
        precioTotalBs: data.precioTotalBs ? parseFloat(data.precioTotalBs) : null,
        tasaCambio: data.tasaCambio ? parseFloat(data.tasaCambio) : null,
        referenciaPago: data.referenciaPago,
        notas: data.notas,
        serviciosExtras: data.serviciosExtrasIds?.length > 0 ? {
          create: data.serviciosExtrasIds.map((extraId: number) => ({
            servicioExtraId: extraId
          }))
        } : undefined
      },
      include: {
        tipoVehiculo: true,
        servicio: true,
        estadoCarro: true,
        estadoPago: true,
        serviciosExtras: {
          include: {
            servicioExtra: true
          }
        }
      }
    })

    return NextResponse.json(registro)
  } catch (error) {
    console.error('Error al actualizar registro:', error)
    return NextResponse.json(
      { error: 'Error al actualizar registro' },
      { status: 500 }
    )
  }
}

// DELETE: Eliminar un registro
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const registroId = parseInt(id)

    // Verificar que el registro existe
    const registroExistente = await prisma.registroVehiculo.findUnique({
      where: { id: registroId }
    })

    if (!registroExistente) {
      return NextResponse.json(
        { error: 'Registro no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar registro (con cascada elimina los servicios extras relacionados)
    await prisma.registroVehiculo.delete({
      where: { id: registroId }
    })

    return NextResponse.json({ success: true, message: 'Registro eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar registro:', error)
    return NextResponse.json(
      { error: 'Error al eliminar registro' },
      { status: 500 }
    )
  }
}