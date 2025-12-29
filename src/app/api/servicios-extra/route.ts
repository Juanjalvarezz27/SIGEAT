import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Función para convertir Decimal a número
const decimalToNumber = (value: any): number => {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseFloat(value)
  // Si es un objeto Decimal de Prisma
  if (value && typeof value === 'object' && 'toNumber' in value) {
    return value.toNumber()
  }
  return parseFloat(value.toString())
}

// GET: Obtener todos los servicios extra
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')

    let where = {}
    if (search) {
      where = {
        OR: [
          { nombre: { contains: search, mode: 'insensitive' } },
          { descripcion: { contains: search, mode: 'insensitive' } }
        ]
      }
    }

    const serviciosExtra = await prisma.servicioExtra.findMany({
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

    // Convertir Decimal a número para el frontend
    const serviciosExtraConvertidos = serviciosExtra.map(servicio => ({
      ...servicio,
      precio: decimalToNumber(servicio.precio)
    }))

    return NextResponse.json(serviciosExtraConvertidos)
  } catch (error) {
    console.error('Error al obtener servicios extra:', error)
    return NextResponse.json(
      { error: 'Error al obtener servicios extra' },
      { status: 500 }
    )
  }
}

// POST: Crear un nuevo servicio extra
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, descripcion, precio } = body

    if (!nombre || !precio) {
      return NextResponse.json(
        { error: 'Nombre y precio son requeridos' },
        { status: 400 }
      )
    }

    const precioNumber = parseFloat(precio)
    if (isNaN(precioNumber) || precioNumber < 0) {
      return NextResponse.json(
        { error: 'Precio debe ser un número válido' },
        { status: 400 }
      )
    }

    // Verificar si ya existe un servicio con el mismo nombre
    const existing = await prisma.servicioExtra.findUnique({
      where: { nombre }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe un servicio extra con este nombre' },
        { status: 400 }
      )
    }

    const servicioExtra = await prisma.servicioExtra.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        precio: precioNumber
      },
      include: {
        _count: {
          select: { registros: true }
        }
      }
    })

    // Convertir Decimal a número para la respuesta
    const servicioExtraConvertido = {
      ...servicioExtra,
      precio: decimalToNumber(servicioExtra.precio)
    }

    return NextResponse.json(servicioExtraConvertido, { status: 201 })
  } catch (error) {
    console.error('Error al crear servicio extra:', error)
    return NextResponse.json(
      { error: 'Error al crear servicio extra' },
      { status: 500 }
    )
  }
}

// PUT: Actualizar un servicio extra
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, nombre, descripcion, precio } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      )
    }

    // Verificar si el servicio extra existe
    const existing = await prisma.servicioExtra.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Servicio extra no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si el nuevo nombre ya existe (excluyendo el actual)
    if (nombre && nombre !== existing.nombre) {
      const nombreExistente = await prisma.servicioExtra.findUnique({
        where: { nombre }
      })

      if (nombreExistente) {
        return NextResponse.json(
          { error: 'Ya existe un servicio extra con este nombre' },
          { status: 400 }
        )
      }
    }

    let precioNumber = decimalToNumber(existing.precio)
    if (precio !== undefined) {
      precioNumber = parseFloat(precio)
      if (isNaN(precioNumber) || precioNumber < 0) {
        return NextResponse.json(
          { error: 'Precio debe ser un número válido' },
          { status: 400 }
        )
      }
    }

    const servicioExtra = await prisma.servicioExtra.update({
      where: { id },
      data: {
        nombre: nombre?.trim() || existing.nombre,
        descripcion: descripcion?.trim() || null,
        precio: precioNumber
      },
      include: {
        _count: {
          select: { registros: true }
        }
      }
    })

    // Convertir Decimal a número para la respuesta
    const servicioExtraConvertido = {
      ...servicioExtra,
      precio: decimalToNumber(servicioExtra.precio)
    }

    return NextResponse.json(servicioExtraConvertido)
  } catch (error) {
    console.error('Error al actualizar servicio extra:', error)
    return NextResponse.json(
      { error: 'Error al actualizar servicio extra' },
      { status: 500 }
    )
  }
}

// DELETE: Eliminar un servicio extra
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
    const registrosAsociados = await prisma.registroVehiculoServicioExtra.findFirst({
      where: {
        servicioExtraId: parseInt(id)
      }
    })

    if (registrosAsociados) {
      return NextResponse.json(
        { error: 'No se puede eliminar porque hay registros asociados' },
        { status: 400 }
      )
    }

    await prisma.servicioExtra.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ message: 'Servicio extra eliminado' })
  } catch (error) {
    console.error('Error al eliminar servicio extra:', error)
    return NextResponse.json(
      { error: 'Error al eliminar servicio extra' },
      { status: 500 }
    )
  }
}