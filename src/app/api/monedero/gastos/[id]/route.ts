import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET: Obtener un gasto específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // params es una Promise
) {
  try {
    const { id } = await params // Desempaquetar la Promise
    const gasto = await prisma.gasto.findUnique({
      where: { id: parseInt(id) },
      include: {
        metodoPago: true
      }
    })

    if (!gasto) {
      return NextResponse.json(
        { error: 'Gasto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ gasto })

  } catch (error) {
    console.error('Error al obtener gasto:', error)
    return NextResponse.json(
      { error: 'Error al obtener gasto' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT: Actualizar un gasto existente
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // params es una Promise
) {
  try {
    const { id } = await params // Desempaquetar la Promise
    const gastoId = parseInt(id)
    const body = await request.json()

    // Verificar si el gasto existe
    const gastoExistente = await prisma.gasto.findUnique({
      where: { id: gastoId }
    })

    if (!gastoExistente) {
      return NextResponse.json(
        { error: 'Gasto no encontrado' },
        { status: 404 }
      )
    }

    // Validar datos requeridos
    if (!body.descripcion || !body.monto || !body.moneda || !body.tasaBCV || !body.metodoPagoId) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    const monto = parseFloat(body.monto)
    const tasaBCV = parseFloat(body.tasaBCV)

    if (monto <= 0 || tasaBCV <= 0) {
      return NextResponse.json(
        { error: 'El monto y la tasa BCV deben ser mayores a cero' },
        { status: 400 }
      )
    }

    // Calcular montos convertidos
    let montoUSD, montoBS

    if (body.moneda === 'USD') {
      montoUSD = monto
      montoBS = monto * tasaBCV
    } else {
      montoBS = monto
      montoUSD = monto / tasaBCV
    }

    // Actualizar el gasto
    const gastoActualizado = await prisma.gasto.update({
      where: { id: gastoId },
      data: {
        descripcion: body.descripcion,
        monto: monto,
        moneda: body.moneda,
        tasaBCV: tasaBCV,
        montoUSD: montoUSD,
        montoBS: montoBS,
        notas: body.notas || null,
        metodoPagoId: parseInt(body.metodoPagoId)
      },
      include: {
        metodoPago: true
      }
    })

    return NextResponse.json({
      message: 'Gasto actualizado correctamente',
      gasto: gastoActualizado
    })

  } catch (error) {
    console.error('Error al actualizar gasto:', error)
    return NextResponse.json(
      { error: 'Error al actualizar gasto' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE: Eliminar un gasto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // params es una Promise
) {
  try {
    const { id } = await params // Desempaquetar la Promise
    const gastoId = parseInt(id)

    // Verificar si el gasto existe
    const gastoExistente = await prisma.gasto.findUnique({
      where: { id: gastoId }
    })

    if (!gastoExistente) {
      return NextResponse.json(
        { error: 'Gasto no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar el gasto
    await prisma.gasto.delete({
      where: { id: gastoId }
    })

    return NextResponse.json({
      message: 'Gasto eliminado correctamente'
    })

  } catch (error) {
    console.error('Error al eliminar gasto:', error)
    return NextResponse.json(
      { error: 'Error al eliminar gasto' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}