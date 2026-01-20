import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Datos iniciales para métodos de pago según moneda
    const metodosExistentes = await prisma.metodoPago.findMany()
    
    if (metodosExistentes.length === 0) {
      await prisma.metodoPago.createMany({
        data: [
          // Métodos SOLO para Bolívares
          { nombre: 'Efectivo Bs', tipo: 'BS', descripcion: 'Pago en efectivo bolívares' },
          { nombre: 'Pago Móvil', tipo: 'BS', descripcion: 'Pago móvil bancario' },
          { nombre: 'Transferencia Bs', tipo: 'BS', descripcion: 'Transferencia bancaria en bolívares' },
          { nombre: 'Punto de Venta', tipo: 'BS', descripcion: 'Tarjeta de débito/crédito en bolívares' },
          
          // Métodos SOLO para Dólares
          { nombre: 'Efectivo $', tipo: 'USD', descripcion: 'Pago en efectivo dólares' },
          { nombre: 'Zelle', tipo: 'USD', descripcion: 'Transferencia Zelle' },
          { nombre: 'Binance', tipo: 'USD', descripcion: 'Pago por Binance' },
          { nombre: 'PayPal', tipo: 'USD', descripcion: 'Pago por PayPal' }
          
          // NOTA: Eliminamos 'Transferencia Mixta' y 'Otro' que eran tipo 'AMBOS'
        ]
      })
    }
    
    // Obtener datos actualizados
    const metodosPago = await prisma.metodoPago.findMany({
      orderBy: [{ tipo: 'asc' }, { nombre: 'asc' }]
    })
    
    return NextResponse.json({
      metodosPago,
      message: 'Datos iniciales cargados exitosamente'
    })
    
  } catch (error) {
    console.error('Error al cargar datos iniciales:', error)
    return NextResponse.json(
      { error: 'Error al cargar datos iniciales' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}