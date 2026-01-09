import prisma from '@/src/lib/prisma'
import bcrypt from 'bcryptjs'

export async function seedUsuarios() {
  console.log('Verificando usuarios...')

  const usuariosExistentes = await prisma.usuarioSistema.count()

  if (usuariosExistentes === 0) {
    const hash = await bcrypt.hash('1234', 10)

    await prisma.usuarioSistema.create({
      data: {
        username: 'admin',
        password: hash,
        role: 'admin' 
      }
    })

    console.log('Usuario admin creado con rol "admin"')
  } else {
    console.log(`${usuariosExistentes} usuario(s) ya existen`)
    
    // Opcional: Actualizar usuario admin existente
    const adminExists = await prisma.usuarioSistema.findUnique({
      where: { username: 'admin' }
    })
    
    if (adminExists && adminExists.role !== 'admin') {
      await prisma.usuarioSistema.update({
        where: { id: adminExists.id },
        data: { role: 'admin' }
      })
      console.log('Usuario admin actualizado con rol "admin"')
    }
  }
}