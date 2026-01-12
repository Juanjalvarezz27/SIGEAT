import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/src/lib/prisma'

/**
 * Construye una fecha LOCAL (sin UTC)
 */
const buildLocalDate = (date: string, end = false) => {
  const [year, month, day] = date.split('-').map(Number)

  if (end) {
    return new Date(year, month - 1, day, 23, 59, 59, 999)
  }

  return new Date(year, month - 1, day, 0, 0, 0, 0)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fechaInicioParam = searchParams.get('fechaInicio')
    const fechaFinParam = searchParams.get('fechaFin')

    if (!fechaInicioParam || !fechaFinParam) {
      return NextResponse.json(
        { error: 'Fechas de inicio y fin son requeridas' },
        { status: 400 }
      )
    }

    // Strings YYYY-MM-DD (SIN UTC)
    const inicio = buildLocalDate(fechaInicioParam)
    const fin = buildLocalDate(fechaFinParam, true)

    // Consulta para obtener solo el total
    const totalIngresos = await prisma.registroVehiculo.aggregate({
      where: {
        fechaHora: {
          gte: inicio,
          lte: fin
        }
      },
      _sum: {
        precioTotal: true
      }
    })

    const totalRegistros = await prisma.registroVehiculo.count({
      where: {
        fechaHora: {
          gte: inicio,
          lte: fin
        }
      }
    })

    return NextResponse.json({
      success: true,
      datos: {
        totalIngresos: Number(totalIngresos._sum.precioTotal || 0),
        totalRegistros,
        fechaInicio: fechaInicioParam,
        fechaFin: fechaFinParam
      }
    })
  } catch (error) {
    console.error('Error en endpoint /api/estadisticas/semana:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno' },
      { status: 500 }
    )
  }
}