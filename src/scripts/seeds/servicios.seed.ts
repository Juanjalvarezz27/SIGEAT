import prisma from '@/src/lib/prisma'

export async function seedServicios() {
  console.log('Iniciando seed de servicios...')

  // 1. Crear las categorías
  const categorias = [
    'Carro',
    'Camioneta',
    'Camion 350',
    'Camion 750',
    'Gandola',
    'Buceta',
    'Bus 24',
    'Encava',
    'Moto',
    'Moto 650'
  ]

  // Crear categorías
  for (const nombre of categorias) {
    await prisma.categoriaServicio.upsert({
      where: { nombre },
      update: {},
      create: { nombre }
    })
  }

  // 2. Obtener IDs de categorías
  const categoriasBD = await prisma.categoriaServicio.findMany()
  const categoriaMap: Record<string, number> = {}
  categoriasBD.forEach(cat => {
    categoriaMap[cat.nombre] = cat.id
  })

  // 3. Crear servicios
  const serviciosData = [
    // CARRO
    { nombre: 'Sencillo Sedan', categoria: 'Carro', precio: 6.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de Vidrios y Tablero' },
    { nombre: 'Especial Sedan', categoria: 'Carro', precio: 12.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de vidrios, Embellecimiento interno, Restaurador de Plásticos y gomas' },
    { nombre: 'Premium Sedan', categoria: 'Carro', precio: 15.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de de Vidrios, Embellecimiento interno, Restaurador de plásticos y gomas, Lavado de motor y Chasis' },
    
    // CAMIONETA
    { nombre: 'Sencillo Pick up/Tucson', categoria: 'Camioneta', precio: 8.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de Vidrios y Tablero' },
    { nombre: 'Especial Pick up/Tucson', categoria: 'Camioneta', precio: 20.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de vidrios, Embellecimiento interno, Restaurador de Plásticos y gomas' },
    { nombre: 'Premium Pick up/Tucson', categoria: 'Camioneta', precio: 25.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de de Vidrios, Embellecimiento interno, Restaurador de plásticos y gomas, Lavado de motor y Chasis' },
    
    // CAMION 350
    { nombre: 'Sencillo Camion 350/Triton/Rey', categoria: 'Camion 350', precio: 15.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de Vidrios y Tablero' },
    { nombre: 'Especial Camion 350/Triton/Rey', categoria: 'Camion 350', precio: 25.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de vidrios, Embellecimiento interno, Restaurador de Plásticos y gomas' },
    { nombre: 'Premium Camion 350/Triton/Rey', categoria: 'Camion 350', precio: 35.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de de Vidrios, Embellecimiento interno, Restaurador de plásticos y gomas, Lavado de motor y Chasis' },
    
    // CAMION 750
    { nombre: 'Sencillo Camion 750/NPR/FVR', categoria: 'Camion 750', precio: 30.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de Vidrios y Tablero' },
    { nombre: 'Especial Camion 750/NPR/FVR', categoria: 'Camion 750', precio: 40.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de vidrios, Embellecimiento interno, Restaurador de Plásticos y gomas' },
    { nombre: 'Premium Camion 750/NPR/FVR', categoria: 'Camion 750', precio: 45.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de de Vidrios, Embellecimiento interno, Restaurador de plásticos y gomas, Lavado de motor y Chasis' },
    
    // GANDOLA
    { nombre: 'Sencillo Gandola', categoria: 'Gandola', precio: 55.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de Vidrios y Tablero' },
    { nombre: 'Especial Gandola', categoria: 'Gandola', precio: 60.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de vidrios, Embellecimiento interno, Restaurador de Plásticos y gomas' },
    { nombre: 'Premium Gandola', categoria: 'Gandola', precio: 65.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de de Vidrios, Embellecimiento interno, Restaurador de plásticos y gomas, Lavado de motor y Chasis' },
    
    // BUCETA
    { nombre: 'Sencillo Buceta', categoria: 'Buceta', precio: 15.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de Vidrios y Tablero' },
    { nombre: 'Especial Buceta', categoria: 'Buceta', precio: 35.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de vidrios, Embellecimiento interno, Restaurador de Plásticos y gomas' },
    { nombre: 'Premium Buceta', categoria: 'Buceta', precio: 30.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de de Vidrios, Embellecimiento interno, Restaurador de plásticos y gomas, Lavado de motor y Chasis' },
    
    // BUS 24
    { nombre: 'Sencillo Bus 24 puestos', categoria: 'Bus 24', precio: 25.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de Vidrios y Tablero' },
    { nombre: 'Especial Bus 24 puestos', categoria: 'Bus 24', precio: 35.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de vidrios, Embellecimiento interno, Restaurador de Plásticos y gomas' },
    { nombre: 'Premium Bus 24 puestos', categoria: 'Bus 24', precio: 35.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de de Vidrios, Embellecimiento interno, Restaurador de plásticos y gomas, Lavado de motor y Chasis' },
    
    // ENCAVA
    { nombre: 'Sencillo Encava', categoria: 'Encava', precio: 30.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de Vidrios y Tablero' },
    { nombre: 'Especial Encava', categoria: 'Encava', precio: 40.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de vidrios, Embellecimiento interno, Restaurador de Plásticos y gomas' },
    { nombre: 'Premium Encava', categoria: 'Encava', precio: 45.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de de Vidrios, Embellecimiento interno, Restaurador de plásticos y gomas, Lavado de motor y Chasis' },
    
    // MOTO
    { nombre: 'Basica Moto', categoria: 'Moto', precio: 3.50, descripcion: 'Lavado y desengrasado de cadena' },
    { nombre: 'Especial Premium Moto', categoria: 'Moto', precio: 5.00, descripcion: 'Lavado y tension y desengrasado de cadena, restauracion de plasticos y gomas' },
    
    // MOTO 650
    { nombre: 'Basica Moto 650', categoria: 'Moto 650', precio: 5.00, descripcion: 'Lavado y desengrasado de cadena' },
    { nombre: 'Especial Premium Moto 650', categoria: 'Moto 650', precio: 10.00, descripcion: 'Lavado y tension y desengrasado de cadena, restauracion de plasticos y gomas' }
  ]

  // Verificar si ya hay servicios
  const serviciosExistentes = await prisma.servicio.findMany()

  if (serviciosExistentes.length === 0) {
    // Crear servicios
    for (const servicio of serviciosData) {
      await prisma.servicio.create({
        data: {
          nombre: servicio.nombre,
          descripcion: servicio.descripcion,
          precio: servicio.precio,
          categoriaId: categoriaMap[servicio.categoria]
        }
      })
    }
    
    console.log(`${serviciosData.length} servicios creados`)
  } else {
    console.log(`Ya existen ${serviciosExistentes.length} servicios`)
  }
  
  console.log('Seed completado')
}