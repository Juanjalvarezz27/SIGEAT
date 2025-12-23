import prisma from '@/src/lib/prisma'
import bcrypt from 'bcryptjs'

export async function seedUsuarios() {
  console.log('Verificando usuarios...')
  
  const usuariosExistentes = await prisma.usuarioSistema.count()
  
  if (usuariosExistentes === 0) {
    const hash = await bcrypt.hash('autolavado123', 10)
    
    await prisma.usuarioSistema.create({
      data: {
        username: 'admin',
        password: hash
      }
    })
    
    console.log('Usuario admin creado')
  } else {
    console.log(`${usuariosExistentes} usuario(s) ya existen`)
  }
}