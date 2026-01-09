import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/src/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, role = 'usuario' } = body

    // Validaciones básicas
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Validar que el rol sea válido
    const validRoles = ['admin', 'usuario']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Rol inválido' },
        { status: 400 }
      )
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.usuarioSistema.findUnique({
      where: { username }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario ya existe' },
        { status: 409 }
      )
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear usuario
    const newUser = await prisma.usuarioSistema.create({
      data: {
        username,
        password: hashedPassword,
        role // Agregar el rol
      }
    })

    // Retornar respuesta sin la contraseña
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json(
      { 
        message: 'Usuario creado exitosamente',
        user: userWithoutPassword 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creando usuario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}