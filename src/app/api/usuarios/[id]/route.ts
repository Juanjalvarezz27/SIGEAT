import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/src/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/src/lib/auth"

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Obtener sesión actual
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión.' },
        { status: 401 }
      )
    }

    // Obtener el ID de los params
    const { id } = await context.params
    const userId = parseInt(id)

    if (isNaN(userId) || userId <= 0) {
      return NextResponse.json(
        { error: 'ID de usuario inválido' },
        { status: 400 }
      )
    }

    // Verificar si el usuario existe
    const usuario = await prisma.usuarioSistema.findUnique({
      where: { id: userId }
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Obtener ID del usuario en sesión desde el token
    const usuarioSesionId = parseInt(session.user.id)

    // Prevenir que el usuario se elimine a sí mismo
    if (userId === usuarioSesionId) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propia cuenta' },
        { status: 400 }
      )
    }

    // No permitir eliminar el último usuario del sistema
    const totalUsuarios = await prisma.usuarioSistema.count()
    if (totalUsuarios <= 1) {
      return NextResponse.json(
        { error: 'No se puede eliminar el último usuario del sistema' },
        { status: 400 }
      )
    }

    // Eliminar el usuario
    await prisma.usuarioSistema.delete({
      where: { id: userId }
    })

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
      idEliminado: userId
    }, { status: 200 })

  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    
    // Manejar error de integridad referencial
    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint') || error.message.includes('P2003')) {
        return NextResponse.json(
          { error: 'No se puede eliminar el usuario porque tiene registros asociados' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}