import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/src/lib/prisma'

// GET - Obtener todas las categorías 
export async function GET() {
  try {
    const categorias = await prisma.categoriaServicio.findMany({
      orderBy: {
        nombre: 'asc'
      },
      include: {
        servicios: {
          select: {
            id: true
          }
        }
      }
    })
    
    return NextResponse.json(categorias)
  } catch (error) {
    console.error('Error al obtener categorías:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nueva categoría
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre } = body

    if (!nombre || nombre.trim() === '') {
      return NextResponse.json(
        { error: 'El nombre de la categoría es requerido' },
        { status: 400 }
      )
    }

    // Verificar si ya existe
    const categoriaExistente = await prisma.categoriaServicio.findUnique({
      where: { nombre: nombre.trim() }
    })

    if (categoriaExistente) {
      return NextResponse.json(
        { error: 'Ya existe una categoría con este nombre' },
        { status: 409 }
      )
    }

    const categoria = await prisma.categoriaServicio.create({
      data: {
        nombre: nombre.trim()
      }
    })

    return NextResponse.json(categoria, { status: 201 })
  } catch (error) {
    console.error('Error al crear categoría:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar categoría
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, nombre } = body

    if (!id || !nombre || nombre.trim() === '') {
      return NextResponse.json(
        { error: 'ID y nombre son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si existe
    const categoriaExistente = await prisma.categoriaServicio.findUnique({
      where: { id }
    })

    if (!categoriaExistente) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si el nuevo nombre ya existe en otra categoría
    if (nombre !== categoriaExistente.nombre) {
      const nombreExistente = await prisma.categoriaServicio.findUnique({
        where: { nombre: nombre.trim() }
      })
      
      if (nombreExistente) {
        return NextResponse.json(
          { error: 'Ya existe otra categoría con este nombre' },
          { status: 409 }
        )
      }
    }

    const categoriaActualizada = await prisma.categoriaServicio.update({
      where: { id },
      data: {
        nombre: nombre.trim()
      }
    })

    return NextResponse.json(categoriaActualizada)
  } catch (error) {
    console.error('Error al actualizar categoría:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar categoría
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID de la categoría es requerido' },
        { status: 400 }
      )
    }

    const categoria = await prisma.categoriaServicio.findUnique({
      where: { id: parseInt(id) },
      include: {
        servicios: true
      }
    })

    if (!categoria) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      )
    }

    if (categoria.servicios.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar la categoría porque tiene servicios asociados' },
        { status: 400 }
      )
    }

    await prisma.categoriaServicio.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json(
      { message: 'Categoría eliminada exitosamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error al eliminar categoría:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}