import prisma from '@/src/lib/prisma'
import bcrypt from 'bcryptjs'

export async function seedUsuarios() {
  console.log('Iniciando carga de usuarios administradores...')

  // 1. Creamos el hash de la contraseña '1234' una sola vez
  const hash = await bcrypt.hash('1234', 10)

  // 3. Asegurar usuario: AdminJuan
  await prisma.usuarioSistema.upsert({
    where: { username: 'AdminJuan' },
    update: { 
      role: 'admin', // Si ya existe, nos aseguramos que sea admin
    },
    create: {
      username: 'AdminJuan',
      password: hash,
      role: 'admin'
    }
  })
  console.log('Usuario AdminJuan verificado')
  
  console.log('Carga de usuarios completada.')
}