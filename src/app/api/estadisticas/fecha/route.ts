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

    // Consulta CORREGIDA - INCLUYENDO serviciosExtras
    const registros = await prisma.registroVehiculo.findMany({
      where: {
        fechaHora: {
          gte: inicio,
          lte: fin
        }
      },
      include: {
        tipoVehiculo: true,
        servicio: true,
        estadoPago: true,
        estadoCarro: true,
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

    // Estadísticas
    const totalRegistros = registros.length
    const totalIngresos = registros.reduce(
      (sum, r) => sum + Number(r.precioTotal),
      0
    )
    const ingresosBs = registros.reduce(
      (sum, r) => sum + (Number(r.precioTotalBs) || 0),
      0
    )

    const promedioPorVehiculo =
      totalRegistros > 0 ? totalIngresos / totalRegistros : 0

    // Días incluidos (correcto)
    const MS_PER_DAY = 1000 * 60 * 60 * 24
    const totalDias =
      Math.round((fin.getTime() - inicio.getTime()) / MS_PER_DAY) + 1

    const vehiculosPorDia = totalRegistros / totalDias

    // Agrupar por tipo
    const registrosPorTipo: Record<string, number> = {}
    registros.forEach(r => {
      const tipo = r.tipoVehiculo.nombre
      registrosPorTipo[tipo] = (registrosPorTipo[tipo] || 0) + 1
    })

    const registrosPorTipoArray = Object.entries(registrosPorTipo)
      .map(([tipo, cantidad]) => ({
        tipo,
        cantidad,
        porcentaje: totalRegistros
          ? (cantidad / totalRegistros) * 100
          : 0
      }))
      .sort((a, b) => b.cantidad - a.cantidad)

    // Formato frontend CORREGIDO
    const registrosFormateados = registros.map(r => {
      // Calcular total de servicios extras
      const totalExtras = r.serviciosExtras.reduce((sum, extra) => {
        return sum + Number(extra.servicioExtra.precio)
      }, 0)

      return {
        id: r.id,
        placa: r.placa,
        nombre: r.nombre,
        cedula: r.cedula,
        telefono: r.telefono,
        color: r.color,
        fechaHora: r.fechaHora.toISOString(),
        tipoVehiculo: r.tipoVehiculo.nombre,
        servicio: r.servicio.nombre,
        precioServicio: Number(r.servicio.precio),
        precioTotal: Number(r.precioTotal),
        precioTotalBs: r.precioTotalBs ? Number(r.precioTotalBs) : 0,
        estadoPago: r.estadoPago.nombre,
        estadoCarro: r.estadoCarro.nombre,
        referenciaPago: r.referenciaPago,
        notas: r.notas,
        tasaCambio: r.tasaCambio ? Number(r.tasaCambio) : null,
        serviciosExtras: r.serviciosExtras.map(extra => ({
          servicioExtra: {
            id: extra.servicioExtra.id,
            nombre: extra.servicioExtra.nombre,
            descripcion: extra.servicioExtra.descripcion,
            precio: Number(extra.servicioExtra.precio)
          }
        })),
        totalExtras: totalExtras
      }
    })

    // Formateo de fecha legible
    const formatDate = (date: string) => {
      const [y, m, d] = date.split('-').map(Number)
      const meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ]
      return `${d} de ${meses[m - 1]} de ${y}`
    }

    return NextResponse.json({
      success: true,
      datos: {
        registros: registrosFormateados,
        estadisticas: {
          totalRegistros,
          totalIngresos,
          ingresosBs,
          promedioPorVehiculo,
          vehiculosPorDia,
          totalDias,
          fechaInicio: formatDate(fechaInicioParam),
          fechaFin: formatDate(fechaFinParam),
          registrosPorTipo: registrosPorTipoArray
        }
      }
    })
  } catch (error) {
    console.error('Error en endpoint /api/estadisticas/fecha:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno' },
      { status: 500 }
    )
  }
}