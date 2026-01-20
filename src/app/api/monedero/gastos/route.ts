// app/api/monedero/gastos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET: Obtener todos los gastos
export async function GET(request: NextRequest) {
  try {
    // Opcional: filtrar por fecha
    const { searchParams } = new URL(request.url)
    const fecha = searchParams.get('fecha')
    
    let whereClause: any = {}
    
    if (fecha) {
      const fechaInicio = new Date(fecha)
      fechaInicio.setHours(0, 0, 0, 0)
      const fechaFin = new Date(fechaInicio)
      fechaFin.setDate(fechaFin.getDate() + 1)
      
      whereClause.fechaHora = {
        gte: fechaInicio,
        lt: fechaFin
      }
    }
    
    const gastos = await prisma.gasto.findMany({
      where: whereClause,
      include: {
        metodoPago: true
      },
      orderBy: {
        fechaHora: 'desc'
      }
    })
    
    // Obtener datos para formulario
    const metodosPago = await prisma.metodoPago.findMany({
      orderBy: { nombre: 'asc' }
    })
    
    // Calcular totales
    const totalUSD = gastos.reduce((sum, gasto) => sum + Number(gasto.montoUSD), 0)
    const totalBS = gastos.reduce((sum, gasto) => sum + Number(gasto.montoBS), 0)
    
    return NextResponse.json({
      gastos,
      totales: {
        totalUSD,
        totalBS
      },
      datosFormulario: {
        metodosPago
      }
    })
    
  } catch (error) {
    console.error('Error al obtener gastos:', error)
    return NextResponse.json(
      { error: 'Error al obtener gastos' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST: Crear un nuevo gasto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      descripcion, 
      monto, 
      moneda, 
      tasaBCV, 
      notas, 
      metodoPagoId
    } = body
    
    console.log('📝 Datos recibidos:', { descripcion, monto, moneda, tasaBCV, notas, metodoPagoId })
    
    // Validaciones
    if (!descripcion || !monto || !moneda || !metodoPagoId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }
    
    // Convertir valores
    const montoNum = parseFloat(monto)
    
    // Para USD necesitamos tasaBCV obligatoriamente
    if (moneda === 'USD' && !tasaBCV) {
      return NextResponse.json(
        { error: 'La tasa BCV es requerida para gastos en USD' },
        { status: 400 }
      )
    }
    
    // Para BS también necesitamos tasaBCV
    if (moneda === 'BS' && !tasaBCV) {
      return NextResponse.json(
        { error: 'La tasa BCV es requerida para gastos en BS' },
        { status: 400 }
      )
    }
    
    const tasaNum = parseFloat(tasaBCV)
    
    // Validar que el monto sea positivo
    if (montoNum <= 0) {
      return NextResponse.json(
        { error: 'El monto debe ser mayor a cero' },
        { status: 400 }
      )
    }
    
    // Validar que la tasa sea positiva
    if (tasaNum <= 0) {
      return NextResponse.json(
        { error: 'La tasa BCV debe ser mayor a cero' },
        { status: 400 }
      )
    }
    
    // Calcular montos en ambas monedas
    let montoUSD: number
    let montoBS: number
    
    if (moneda === 'USD') {
      montoUSD = montoNum
      montoBS = montoNum * tasaNum
    } else { // BS
      montoBS = montoNum
      montoUSD = montoNum / tasaNum
    }
    
    console.log('🧮 Cálculos:', { montoUSD, montoBS, tasaNum })
    
    // Crear el gasto
    const nuevoGasto = await prisma.gasto.create({
      data: {
        descripcion,
        monto: montoNum,
        moneda,
        tasaBCV: tasaNum,
        montoUSD,
        montoBS,
        notas: notas || null,
        metodoPagoId: parseInt(metodoPagoId)
      },
      include: {
        metodoPago: true
      }
    })
    
    console.log('Gasto creado:', nuevoGasto)
    
    return NextResponse.json({
      success: true,
      gasto: nuevoGasto,
      message: 'Gasto registrado exitosamente'
    })
    
  } catch (error) {
    console.error('Error al crear gasto:', error)
    return NextResponse.json(
      { error: 'Error al crear gasto' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}