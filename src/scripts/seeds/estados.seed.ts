import prisma from '@/src/lib/prisma'

export async function seedEstados() {
  console.log('Verificando estados...')
  
  const estadosCarro = await prisma.estadoCarro.findMany()
  
  if (estadosCarro.length === 0) {
    await prisma.estadoCarro.createMany({
      data: [
        { nombre: 'Pendiente' },
        { nombre: 'En proceso' },
        { nombre: 'Completado' }
      ]
    })
    console.log('Estados de carro creados')
  }
  
const estadosPago = await prisma.estadoPago.findMany()

if (estadosPago.length === 0) {
  await prisma.estadoPago.createMany({
    data: [
      { nombre: 'Pendiente' },
      { nombre: 'Pagado' },
      { nombre: 'Colaboración' } 
    ]
  })
  console.log('Estados de pago creados')
} else {
  const existeColaboracion = await prisma.estadoPago.findFirst({
    where: { nombre: 'Colaboración' }
  })
  
  if (!existeColaboracion) {
    await prisma.estadoPago.create({
      data: { nombre: 'Colaboración' }
    })
    console.log('Estado "Colaboración" agregado')
  }
}}