import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/src/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const searchType = searchParams.get('searchType') || 'placa'
    const skip = (page - 1) * limit

    // Construir condiciones de búsqueda con optimización
    let whereCondition: any = {}

    if (search && search.length >= 3) {
      if (searchType === 'placa') {
        whereCondition.placa = {
          contains: search,
          mode: 'insensitive'
        }
      } else if (searchType === 'nombre') {
        whereCondition.nombre = {
          contains: search,
          mode: 'insensitive'
        }
      } else if (searchType === 'cedula') {
        whereCondition.cedula = {
          contains: search,
          mode: 'insensitive'
        }
      }
    }

    // Primero contar total para paginación (más eficiente)
    const totalPlacasRaw = await prisma.registroVehiculo.groupBy({
      by: ['placa'],
      where: whereCondition,
      _count: {
        _all: true
      }
    })

    const total = totalPlacasRaw.length

    if (total === 0) {
      return NextResponse.json({
        success: true,
        datos: {
          vehiculos: [],
          paginacion: {
            paginaActual: page,
            totalPaginas: 1,
            totalVehiculos: 0,
            porPagina: limit
          }
        }
      })
    }

    // Obtener placas únicas para la página actual
    const placasUnicas = await prisma.registroVehiculo.groupBy({
      by: ['placa'],
      where: whereCondition,
      _count: {
        _all: true
      },
      _max: {
        fechaHora: true,
        nombre: true,
        cedula: true,
        telefono: true
      },
      orderBy: {
        _max: {
          fechaHora: 'desc'
        }
      },
      skip: skip,
      take: limit
    })

    // Para cada placa, obtener información detallada
    const vehiculosConDetalles = await Promise.all(
      placasUnicas.map(async (item) => {
        // Obtener el último registro completo para esta placa
        const ultimoRegistro = await prisma.registroVehiculo.findFirst({
          where: { placa: item.placa },
          include: {
            tipoVehiculo: true,
            estadoCarro: true
          },
          orderBy: {
            fechaHora: 'desc'
          }
        })

        // Obtener todos los registros para estadísticas (limitado)
        const todosRegistros = await prisma.registroVehiculo.findMany({
          where: { placa: item.placa },
          include: {
            servicio: true,
            estadoPago: true
          },
          orderBy: {
            fechaHora: 'desc'
          },
          take: 50 // Limitar para no sobrecargar
        })

        // Calcular total gastado
        const totalGastado = todosRegistros.reduce((sum, r) => 
          sum + Number(r.precioTotal || 0), 0
        )
        
        // Obtener servicios únicos
        const serviciosUsados = Array.from(
          new Set(todosRegistros.map(r => r.servicio.nombre))
        )

        // Obtener historial limitado
        const historial = todosRegistros.map(r => ({
          id: r.id,
          fecha: r.fechaHora,
          servicio: r.servicio.nombre,
          precio: Number(r.precioTotal || 0),
          estadoPago: r.estadoPago.nombre,
          referenciaPago: r.referenciaPago || null,
          notas: r.notas || null
        }))

        return {
          placa: item.placa,
          cliente: {
            nombre: ultimoRegistro?.nombre || item._max.nombre || '',
            cedula: ultimoRegistro?.cedula || item._max.cedula || '',
            telefono: ultimoRegistro?.telefono || item._max.telefono || '',
            color: ultimoRegistro?.color || ''
          },
          vehiculo: {
            tipo: ultimoRegistro?.tipoVehiculo?.nombre || 'No especificado',
            estado: ultimoRegistro?.estadoCarro?.nombre || 'No especificado'
          },
          estadisticas: {
            totalVisitas: item._count._all || 0,
            ultimaVisita: ultimoRegistro?.fechaHora || item._max.fechaHora || new Date(),
            totalGastado: totalGastado,
            serviciosUsados: serviciosUsados
          },
          historial: historial
        }
      })
    )

    return NextResponse.json({
      success: true,
      datos: {
        vehiculos: vehiculosConDetalles,
        paginacion: {
          paginaActual: page,
          totalPaginas: Math.ceil(total / limit),
          totalVehiculos: total,
          porPagina: limit
        }
      }
    })
  } catch (error) {
    console.error('Error en endpoint /api/vehiculos:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}