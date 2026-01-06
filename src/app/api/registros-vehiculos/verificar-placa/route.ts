import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Obtener la placa de los query parameters
    const { searchParams } = new URL(request.url)
    let placa = searchParams.get('placa')

    if (!placa) {
      return NextResponse.json(
        { error: 'La placa es requerida' },
        { status: 400 }
      )
    }

    // Limpiar espacios de la placa
    placa = placa.replace(/\s/g, '').toUpperCase()

    // Buscar el vehículo por placa
    const vehiculo = await prisma.registroVehiculo.findFirst({
      where: {
        placa: placa
      },
      orderBy: {
        fechaHora: 'desc'
      },
      take: 1 // Tomar solo el último registro de esa placa
    })

    if (!vehiculo) {
      return NextResponse.json({
        encontrado: false,
        mensaje: 'Vehículo no encontrado, complete el formulario'
      })
    }

    return NextResponse.json({
      encontrado: true,
      vehiculo: {
        id: vehiculo.id,
        nombre: vehiculo.nombre,
        cedula: vehiculo.cedula,
        telefono: vehiculo.telefono,
        placa: vehiculo.placa,
        tipoVehiculoId: vehiculo.tipoVehiculoId,
        color: vehiculo.color,
        fechaHora: vehiculo.fechaHora
      },
      mensaje: 'Vehículo encontrado, se han precargado los datos'
    })

  } catch (error) {
    console.error('Error al verificar placa:', error)
    return NextResponse.json(
      { error: 'Error al verificar placa' },
      { status: 500 }
    )
  }
}