import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/src/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    // Validaciones básicas
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Validar formato de username (solo letras, números y guiones bajos)
    const usernameRegex = /^[a-zA-Z0-9_]+$/
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: 'Username solo puede contener letras, números y guiones bajos (_)' },
        { status: 400 }
      )
    }

    // Validar longitud de username
    if (username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { error: 'Username debe tener entre 3 y 30 caracteres' },
        { status: 400 }
      )
    }

    // Validar contraseña
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    // Validaciones adicionales de contraseña
    const passwordValidations = {
      hasNumber: /\d/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }

    if (!passwordValidations.hasNumber) {
      return NextResponse.json(
        { error: 'La contraseña debe contener al menos un número' },
        { status: 400 }
      )
    }

    if (!passwordValidations.hasUppercase || !passwordValidations.hasLowercase) {
      return NextResponse.json(
        { error: 'La contraseña debe contener mayúsculas y minúsculas' },
        { status: 400 }
      )
    }

    if (!passwordValidations.hasSpecialChar) {
      return NextResponse.json(
        { error: 'La contraseña debe contener al menos un carácter especial (!@#$%^&*)' },
        { status: 400 }
      )
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await prisma.usuarioSistema.findUnique({
      where: { username }
    })

    if (usuarioExistente) {
      return NextResponse.json(
        { error: 'El username ya está en uso' },
        { status: 409 }
      )
    }

    // Hash de la contraseña con bcryptjs
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Crear el usuario
    const nuevoUsuario = await prisma.usuarioSistema.create({
      data: {
        username,
        password: hashedPassword
      },
      select: {
        id: true,
        username: true,
        createdAt: true
      }
    })

    // Formatear fecha para respuesta
    const usuarioFormateado = {
      ...nuevoUsuario,
      createdAt: nuevoUsuario.createdAt.toISOString(),
      fechaCreacionFormateada: nuevoUsuario.createdAt.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    return NextResponse.json({
      message: 'Usuario creado exitosamente',
      usuario: usuarioFormateado
    }, { status: 201 })

  } catch (error) {
    console.error('Error al crear usuario:', error)
    
    // Manejar errores específicos de Prisma
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint') || error.message.includes('P2002')) {
        return NextResponse.json(
          { error: 'El username ya está en uso' },
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

// Opcional: Endpoint GET para listar usuarios (solo para desarrollo)
export async function GET(request: NextRequest) {
  try {
    const usuarios = await prisma.usuarioSistema.findMany({
      select: {
        id: true,
        username: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limitar a 50 usuarios
    })

    const usuariosFormateados = usuarios.map((usuario: { createdAt: { toLocaleDateString: (arg0: string, arg1: { year: string; month: string; day: string }) => any } }) => ({
      ...usuario,
      fechaCreacionFormateada: usuario.createdAt.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }))

    return NextResponse.json({
      count: usuarios.length,
      usuarios: usuariosFormateados
    })

  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}