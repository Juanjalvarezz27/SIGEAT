import { NextResponse } from 'next/server'
import prisma from '@/src/lib/prisma'

export async function GET() {
  try {
    // Obtener todos los usuarios con sus datos básicos
    const usuarios = await prisma.usuarioSistema.findMany({
      select: {
        id: true,
        username: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Formatear las fechas en dd/mm/yyyy
    const usuariosFormateados = usuarios.map(usuario => ({
      id: usuario.id,
      username: usuario.username,
      createdAt: usuario.createdAt.toISOString(),
      // Formato dd/mm/yyyy sin hora
      fechaCreacionFormateada: usuario.createdAt.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      // Si quieres mantener la hora en otro campo (opcional)
      fechaConHora: usuario.createdAt.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }))

    // Estadísticas
    const totalUsuarios = usuarios.length

    return NextResponse.json({
      success: true,
      data: {
        usuarios: usuariosFormateados,
        total: totalUsuarios,
        estadisticas: {
          total: totalUsuarios,
          ultimaActualizacion: new Date().toISOString()
        }
      }
    })

  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor al obtener usuarios' 
      },
      { status: 500 }
    )
  }
}