import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET: Obtener registros del día actual (Venezuela)
export async function GET(request: NextRequest) {
  try {
    // Obtener fecha actual en hora de Venezuela
    const ahoraUTC = new Date()
    
    // Convertir a hora de Venezuela (UTC-4) para la consulta
    const offsetVenezuela = -4 * 60 // UTC-4 en minutos
    const ahoraVenezuela = new Date(ahoraUTC.getTime() + offsetVenezuela * 60000)
    
    const hoy = new Date(ahoraVenezuela)
    hoy.setHours(0, 0, 0, 0)

    const manana = new Date(hoy)
    manana.setDate(manana.getDate() + 1)

    const registros = await prisma.registroVehiculo.findMany({
      where: {
        fechaHora: {
          gte: hoy,
          lt: manana
        }
      },
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
      },
      orderBy: {
        fechaHora: 'desc'
      }
    })

    return NextResponse.json(registros)
  } catch (error) {
    console.error('Error al obtener registros:', error)
    return NextResponse.json(
      { error: 'Error al obtener registros' },
      { status: 500 }
    )
  }
}

// POST: Crear nuevo registro
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

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

    // Crear registro - La fecha se genera automáticamente en la BD con timezone correcto
    const registro = await prisma.registroVehiculo.create({
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
        // NO establecer fechaHora aquí - se genera automáticamente en la BD
        serviciosExtras: data.serviciosExtrasIds?.length > 0 ? {
          create: data.serviciosExtrasIds.map((id: number) => ({
            servicioExtraId: id
          }))
        } : undefined
      },
      include: {
        tipoVehiculo: true,
        servicio: true,
        estadoCarro: true,
        estadoPago: true
      }
    })

    return NextResponse.json(registro, { status: 201 })
  } catch (error) {
    console.error('Error al crear registro:', error)
    return NextResponse.json(
      { error: 'Error al crear registro' },
      { status: 500 }
    )
  }
}