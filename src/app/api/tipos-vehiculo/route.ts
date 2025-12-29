import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET: Obtener todos los tipos de vehículo
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const categoria = searchParams.get('categoria')

    let where = {}
    if (categoria) {
      where = {
        categoria: categoria
      }
    }

    const tiposVehiculo = await prisma.tipoVehiculo.findMany({
      include: {
        _count: {
          select: { registros: true }
        }
      },
      where,
      orderBy: {
        nombre: 'asc'
      }
    })

    return NextResponse.json(tiposVehiculo)
  } catch (error) {
    console.error('Error al obtener tipos de vehículo:', error)
    return NextResponse.json(
      { error: 'Error al obtener tipos de vehículo' },
      { status: 500 }
    )
  }
}

// POST: Crear un nuevo tipo de vehículo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, categoria } = body

    if (!nombre || !categoria) {
      return NextResponse.json(
        { error: 'Nombre y categoría son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si ya existe un tipo con el mismo nombre
    const existing = await prisma.tipoVehiculo.findUnique({
      where: { nombre }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe un tipo de vehículo con este nombre' },
        { status: 400 }
      )
    }

    const tipoVehiculo = await prisma.tipoVehiculo.create({
      data: {
        nombre,
        categoria
      }
    })

    return NextResponse.json(tipoVehiculo, { status: 201 })
  } catch (error) {
    console.error('Error al crear tipo de vehículo:', error)
    return NextResponse.json(
      { error: 'Error al crear tipo de vehículo' },
      { status: 500 }
    )
  }
}

// PUT: Actualizar un tipo de vehículo
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, nombre, categoria } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      )
    }

    // Verificar si el tipo de vehículo existe
    const existing = await prisma.tipoVehiculo.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Tipo de vehículo no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si el nuevo nombre ya existe (excluyendo el actual)
    if (nombre && nombre !== existing.nombre) {
      const nombreExistente = await prisma.tipoVehiculo.findUnique({
        where: { nombre }
      })

      if (nombreExistente) {
        return NextResponse.json(
          { error: 'Ya existe un tipo de vehículo con este nombre' },
          { status: 400 }
        )
      }
    }

    const tipoVehiculo = await prisma.tipoVehiculo.update({
      where: { id },
      data: {
        nombre,
        categoria
      }
    })

    return NextResponse.json(tipoVehiculo)
  } catch (error) {
    console.error('Error al actualizar tipo de vehículo:', error)
    return NextResponse.json(
      { error: 'Error al actualizar tipo de vehículo' },
      { status: 500 }
    )
  }
}

// DELETE: Eliminar un tipo de vehículo
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      )
    }

    // Verificar si hay registros asociados
    const registrosAsociados = await prisma.registroVehiculo.findFirst({
      where: {
        tipoVehiculoId: parseInt(id)
      }
    })

    if (registrosAsociados) {
      return NextResponse.json(
        { error: 'No se puede eliminar porque hay registros asociados' },
        { status: 400 }
      )
    }

    await prisma.tipoVehiculo.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ message: 'Tipo de vehículo eliminado' })
  } catch (error) {
    console.error('Error al eliminar tipo de vehículo:', error)
    return NextResponse.json(
      { error: 'Error al eliminar tipo de vehículo' },
      { status: 500 }
    )
  }
}