import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Obtener todos los registros del día de hoy
    const hoy = new Date()
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

    // Obtener datos del formulario - INCLUIR CATEGORÍA EN SERVICIOS
    const [tiposVehiculo, servicios, estadosCarro, estadosPago, serviciosExtras] = await Promise.all([
      prisma.tipoVehiculo.findMany({
        orderBy: { nombre: 'asc' }
      }),
      prisma.servicio.findMany({
        orderBy: { nombre: 'asc' },
        include: {
          categoria: true
        }
      }),
      prisma.estadoCarro.findMany({
        orderBy: { nombre: 'asc' }
      }),
      prisma.estadoPago.findMany({
        orderBy: { nombre: 'asc' }
      }),
      prisma.servicioExtra.findMany({
        orderBy: { nombre: 'asc' }
      })
    ])

    return NextResponse.json({
      registros,
      datosFormulario: {
        tiposVehiculo,
        servicios, 
        estadosCarro,
        estadosPago,
        serviciosExtras
      }
    })
  } catch (error) {
    console.error('Error al obtener registros:', error)
    return NextResponse.json(
      { error: 'Error al obtener registros' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}