import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/src/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/src/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.username) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener el usuario actual en sesión
    const usuario = await prisma.usuarioSistema.findUnique({
      where: {
        username: session.user.username
      },
      select: {
        username: true,
        createdAt: true
      }
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Formatear la fecha en dd/mm/yyyy
    const fechaFormateada = usuario.createdAt.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })

    const usuarioFormateado = {
      username: usuario.username,
      createdAt: usuario.createdAt.toISOString(),
      fechaCreacionFormateada: fechaFormateada
    }

    return NextResponse.json(usuarioFormateado)

  } catch (error) {
    console.error('Error al obtener perfil:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}