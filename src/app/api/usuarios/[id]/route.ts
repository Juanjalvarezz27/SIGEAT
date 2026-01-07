import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// GET: Obtener un usuario específico
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const usuarioId = parseInt(id)

    // CORRECCIÓN: Usar prisma.usuarioSistema en lugar de prisma.usuario
    const usuario = await prisma.usuarioSistema.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        username: true, // CORRECCIÓN: username en lugar de nombre/email
        createdAt: true
      }
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(usuario)
  } catch (error) {
    console.error('Error al obtener usuario:', error)
    return NextResponse.json(
      { error: 'Error al obtener usuario' },
      { status: 500 }
    )
  }
}

// PUT: Actualizar un usuario existente
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const usuarioId = parseInt(id)
    const data = await request.json()

    // Validar que el usuario existe - CORRECCIÓN: Usar usuarioSistema
    const usuarioExistente = await prisma.usuarioSistema.findUnique({
      where: { id: usuarioId }
    })

    if (!usuarioExistente) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Validar campos requeridos - CORRECCIÓN: username en lugar de nombre/email
    if (!data.username) {
      return NextResponse.json(
        { error: 'Username es requerido' },
        { status: 400 }
      )
    }

    // Verificar si el username ya existe en otro usuario
    if (data.username !== usuarioExistente.username) {
      const usernameExistente = await prisma.usuarioSistema.findFirst({
        where: {
          username: data.username,
          id: { not: usuarioId }
        }
      })

      if (usernameExistente) {
        return NextResponse.json(
          { error: 'El username ya está registrado por otro usuario' },
          { status: 400 }
        )
      }
    }

    // Preparar datos para actualizar
    const updateData: any = {
      username: data.username, // CORRECCIÓN: username en lugar de nombre
    }

    // Actualizar contraseña si se proporciona
    if (data.password && data.password.trim() !== '') {
      const salt = await bcrypt.genSalt(10)
      updateData.password = await bcrypt.hash(data.password, salt)
    }

    // CORRECCIÓN: Usar prisma.usuarioSistema.update
    const usuario = await prisma.usuarioSistema.update({
      where: { id: usuarioId },
      data: updateData,
      select: {
        id: true,
        username: true, // CORRECCIÓN: username en lugar de nombre/email/rol
        createdAt: true
      }
    })

    return NextResponse.json(usuario)
  } catch (error: any) {
    console.error('Error al actualizar usuario:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'El username ya está registrado' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error al actualizar usuario' },
      { status: 500 }
    )
  }
}

// DELETE: Eliminar un usuario
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const usuarioId = parseInt(id)

    // Verificar que el usuario existe - CORRECCIÓN: Usar usuarioSistema
    const usuarioExistente = await prisma.usuarioSistema.findUnique({
      where: { id: usuarioId }
    })

    if (!usuarioExistente) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // No permitir eliminar el último usuario (no hay rol en este esquema)
    const totalUsuarios = await prisma.usuarioSistema.count()

    if (totalUsuarios <= 1) {
      return NextResponse.json(
        { error: 'No se puede eliminar el único usuario del sistema' },
        { status: 400 }
      )
    }

    // Eliminar usuario - CORRECCIÓN: Usar usuarioSistema.delete
    await prisma.usuarioSistema.delete({
      where: { id: usuarioId }
    })

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado correctamente',
      idEliminado: usuarioId
    })
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    return NextResponse.json(
      { error: 'Error al eliminar usuario' },
      { status: 500 }
    )
  }
}