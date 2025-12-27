import { NextResponse } from 'next/server'
import prisma from '@/src/lib/prisma'

export async function GET() {
  try {
    // Obtener SOLO el primer usuario (solo username)
    const usuario = await prisma.usuarioSistema.findFirst({
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

    // Formatear la fecha
    const usuarioFormateado = {
      username: usuario.username,
      createdAt: usuario.createdAt.toISOString(),
      fechaCreacionFormateada: usuario.createdAt.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
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