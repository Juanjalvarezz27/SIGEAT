import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Obtener ingresos (precioTotalBs de registros)
    const registros = await prisma.registroVehiculo.findMany({
      where: {
        precioTotalBs: {
          not: null
        }
      },
      select: {
        precioTotalBs: true
      }
    })

    // Calcular total de ingresos en Bs
    const totalIngresosBs = registros.reduce((sum, registro) => {
      return sum + Number(registro.precioTotalBs)
    }, 0)

    // Obtener TOTAL de gastos (para cálculo de saldo)
    const totalGastosCount = await prisma.gasto.count()
    const totalGastosResult = await prisma.gasto.aggregate({
      _sum: {
        montoBS: true
      }
    })
    const totalGastosBs = totalGastosResult._sum.montoBS || 0

    // Obtener gastos PAGINADOS para la lista
    const gastos = await prisma.gasto.findMany({
      skip,
      take: limit,
      orderBy: {
        fechaHora: 'desc'
      },
      include: {
        metodoPago: true
      }
    })

    // Calcular total de páginas
    const totalPaginas = Math.ceil(totalGastosCount / limit)

    // Calcular saldo actual (ingresos - gastos)
    const saldoActualBs = totalIngresosBs - Number(totalGastosBs)

    // Formatear los gastos para mostrar
    const ultimosGastos = gastos.map(gasto => ({
      id: gasto.id,
      descripcion: gasto.descripcion,
      montoBS: Number(gasto.montoBS),
      montoUSD: Number(gasto.montoUSD),
      moneda: gasto.moneda,
      tasaBCV: Number(gasto.tasaBCV),
      fechaHora: gasto.fechaHora.toISOString(),
      notas: gasto.notas,
      metodoPago: {
        id: gasto.metodoPago.id,
        nombre: gasto.metodoPago.nombre
      }
    }))

    return NextResponse.json({
      totalIngresosBs: Number(totalIngresosBs.toFixed(2)),
      totalGastosBs: Number(totalGastosBs.toFixed(2)),
      saldoActualBs: Number(saldoActualBs.toFixed(2)),
      cantidadIngresos: registros.length,
      cantidadGastos: totalGastosCount,
      ultimosGastos,
      paginacion: {
        paginaActual: page,
        totalPaginas,
        limite: limit,
        totalItems: totalGastosCount,
        tieneSiguiente: page < totalPaginas,
        tieneAnterior: page > 1
      },
      fechaCalculo: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error en endpoint monedero:', error)
    return NextResponse.json(
      { 
        error: 'Error al calcular saldo',
        totalIngresosBs: 0,
        totalGastosBs: 0,
        saldoActualBs: 0,
        cantidadIngresos: 0,
        cantidadGastos: 0,
        ultimosGastos: [],
        paginacion: {
          paginaActual: 1,
          totalPaginas: 1,
          limite: 10,
          totalItems: 0,
          tieneSiguiente: false,
          tieneAnterior: false
        }
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}