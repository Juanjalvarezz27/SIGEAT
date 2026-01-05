import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Obtener todos los datos necesarios para el formulario
    const [tiposVehiculo, servicios, estadosCarro, estadosPago, serviciosExtras, categorias] = await Promise.all([
      prisma.tipoVehiculo.findMany({
        orderBy: { nombre: 'asc' }
      }),
      prisma.servicio.findMany({
        include: { categoria: true },
        orderBy: { nombre: 'asc' }
      }),
      prisma.estadoCarro.findMany({
        orderBy: { nombre: 'asc' }
      }),
      prisma.estadoPago.findMany({
        orderBy: { nombre: 'asc' }
      }),
      prisma.servicioExtra.findMany({
        orderBy: { nombre: 'asc' }
      }),
      prisma.categoriaServicio.findMany({
        include: {
          servicios: {
            orderBy: { nombre: 'asc' }
          }
        },
        orderBy: { nombre: 'asc' }
      })
    ])

    return NextResponse.json({
      tiposVehiculo,
      servicios,
      estadosCarro,
      estadosPago,
      serviciosExtras,
      categorias
    })
  } catch (error) {
    console.error('Error al obtener datos del formulario:', error)
    return NextResponse.json(
      { error: 'Error al obtener datos' },
      { status: 500 }
    )
  }
}