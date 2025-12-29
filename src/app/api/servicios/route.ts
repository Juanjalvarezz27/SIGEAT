import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/src/lib/prisma'

// GET - Obtener todos los servicios con sus categorías
export async function GET() {
  try {
    const servicios = await prisma.servicio.findMany({
      include: {
        categoria: {
          select: {
            id: true,
            nombre: true
          }
        }
      },
      orderBy: {
        nombre: 'asc'
      }
    })
    
    return NextResponse.json(servicios)
  } catch (error) {
    console.error('Error al obtener servicios:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear un nuevo servicio
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, descripcion, categoriaId, precio } = body

    if (!nombre || !categoriaId || !precio) {
      return NextResponse.json(
        { error: 'Nombre, categoría y precio son requeridos' },
        { status: 400 }
      )
    }

    if (typeof precio !== 'number' || precio <= 0) {
      return NextResponse.json(
        { error: 'El precio debe ser un número mayor a 0' },
        { status: 400 }
      )
    }

    // Verificar si la categoría existe
    const categoria = await prisma.categoriaServicio.findUnique({
      where: { id: categoriaId }
    })

    if (!categoria) {
      return NextResponse.json(
        { error: 'La categoría seleccionada no existe' },
        { status: 404 }
      )
    }

    // Verificar si ya existe un servicio con el mismo nombre
    const servicioExistente = await prisma.servicio.findUnique({
      where: { nombre }
    })

    if (servicioExistente) {
      return NextResponse.json(
        { error: 'Ya existe un servicio con este nombre' },
        { status: 409 }
      )
    }

    // Crear el servicio
    const servicio = await prisma.servicio.create({
      data: {
        nombre,
        descripcion: descripcion || null,
        categoriaId,
        precio
      },
      include: {
        categoria: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    })

    return NextResponse.json(servicio, { status: 201 })
  } catch (error) {
    console.error('Error al crear servicio:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un servicio
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, nombre, descripcion, categoriaId, precio } = body

    if (!id || !nombre || !categoriaId || !precio) {
      return NextResponse.json(
        { error: 'ID, nombre, categoría y precio son requeridos' },
        { status: 400 }
      )
    }

    if (typeof precio !== 'number' || precio <= 0) {
      return NextResponse.json(
        { error: 'El precio debe ser un número mayor a 0' },
        { status: 400 }
      )
    }

    // Verificar si el servicio existe
    const servicioExistente = await prisma.servicio.findUnique({
      where: { id }
    })

    if (!servicioExistente) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si la categoría existe
    const categoria = await prisma.categoriaServicio.findUnique({
      where: { id: categoriaId }
    })

    if (!categoria) {
      return NextResponse.json(
        { error: 'La categoría seleccionada no existe' },
        { status: 404 }
      )
    }

    // Verificar si el nuevo nombre ya existe en otro servicio
    if (nombre !== servicioExistente.nombre) {
      const nombreExistente = await prisma.servicio.findUnique({
        where: { nombre }
      })
      
      if (nombreExistente) {
        return NextResponse.json(
          { error: 'Ya existe otro servicio con este nombre' },
          { status: 409 }
        )
      }
    }

    // Actualizar el servicio
    const servicioActualizado = await prisma.servicio.update({
      where: { id },
      data: {
        nombre,
        descripcion: descripcion || null,
        categoriaId,
        precio
      },
      include: {
        categoria: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    })

    return NextResponse.json(servicioActualizado)
  } catch (error) {
    console.error('Error al actualizar servicio:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un servicio
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID del servicio es requerido' },
        { status: 400 }
      )
    }

    const servicio = await prisma.servicio.findUnique({
      where: { id: parseInt(id) },
      include: {
        registros: true
      }
    })

    if (!servicio) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }

    if (servicio.registros.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar el servicio porque tiene registros asociados' },
        { status: 400 }
      )
    }

    await prisma.servicio.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json(
      { message: 'Servicio eliminado exitosamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error al eliminar servicio:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}