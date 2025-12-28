import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/src/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, oldPassword, newPassword } = body

    console.log('Cambiando contraseña para usuario:', username)

    // Validaciones básicas
    if (!username || !oldPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Buscar usuario
    const usuario = await prisma.usuarioSistema.findUnique({
      where: { username }
    })

    if (!usuario) {
      console.error('Usuario no encontrado:', username)
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    console.log('Usuario encontrado, verificando contraseña...')

    // Verificar contraseña antigua
    const isOldPasswordValid = await bcrypt.compare(oldPassword, usuario.password)
    console.log('Contraseña válida:', isOldPasswordValid)
    
    if (!isOldPasswordValid) {
      return NextResponse.json(
        { error: 'La contraseña actual es incorrecta' },
        { status: 401 }
      )
    }

    // Validar que la nueva contraseña sea diferente
    const isSamePassword = await bcrypt.compare(newPassword, usuario.password)
    if (isSamePassword) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe ser diferente a la actual' },
        { status: 400 }
      )
    }

    // Validaciones de nueva contraseña
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    const passwordValidations = {
      hasNumber: /\d/.test(newPassword),
      hasUppercase: /[A-Z]/.test(newPassword),
      hasLowercase: /[a-z]/.test(newPassword),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
    }

    if (!passwordValidations.hasNumber) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe contener al menos un número' },
        { status: 400 }
      )
    }

    if (!passwordValidations.hasUppercase) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe contener al menos una mayúscula' },
        { status: 400 }
      )
    }

    if (!passwordValidations.hasLowercase) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe contener al menos una minúscula' },
        { status: 400 }
      )
    }

    if (!passwordValidations.hasSpecialChar) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe contener al menos un carácter especial (!@#$%^&*(),.?":{}|<>)' },
        { status: 400 }
      )
    }

    // Hash de la nueva contraseña
    const salt = await bcrypt.genSalt(10)
    const hashedNewPassword = await bcrypt.hash(newPassword, salt)
    console.log('Nuevo hash generado')

    // Actualizar contraseña
    await prisma.usuarioSistema.update({
      where: { username },
      data: { password: hashedNewPassword }
    })

    console.log('Contraseña actualizada exitosamente')

    return NextResponse.json({
      success: true,
      message: '¡Contraseña cambiada exitosamente!'
    }, { status: 200 })

  } catch (error) {
    console.error('Error al cambiar contraseña:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor. Inténtalo de nuevo más tarde.' },
      { status: 500 }
    )
  }
}