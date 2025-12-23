import prisma from '@/src/lib/prisma'

export async function seedExtras() {
  console.log('Verificando servicios extra...')
  
  const extras = await prisma.servicioExtra.findMany()
  
  if (extras.length === 0) {
    await prisma.servicioExtra.createMany({
      data: [
        { nombre: 'Lavado de motor', precio: 10.00, descripcion: 'Lavado completo del motor' },
        { nombre: 'Encerado', precio: 15.00, descripcion: 'Encerado de carroceria' },
        { nombre: 'Pulido', precio: 20.00, descripcion: 'Pulido de pintura' },
        { nombre: 'Desmanchado', precio: 25.00, descripcion: 'Remocion de manchas dificiles' },
        { nombre: 'Lavado de chasis', precio: 30.00, descripcion: 'Lavado especial del chasis' },
        { nombre: 'Pulido de faros', precio: 8.00, descripcion: 'Pulido de faros delanteros' },
        { nombre: 'Limpieza de tapiceria', precio: 12.00, descripcion: 'Limpieza profunda de tapiceria' }
      ]
    })
    console.log(`Servicios extra creados`)
  }
}