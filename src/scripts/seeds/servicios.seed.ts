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

  // 3. Crear servicios - ACTUALIZADO CON NUEVOS PRECIOS
  const serviciosData = [
    // CARRO - Sencillo
    { 
      nombre: 'Sencillo Sedan', 
      categoria: 'Carro', 
      precio: 8.00, 
      descripcion: 'Lavado, Aspirado, Secado, Limpieza de Vidrios y Tablero' 
    },
    // CARRO - Premium (se eliminó el "Especial")
    { 
      nombre: 'Premium Sedan', 
      categoria: 'Carro', 
      precio: 20.00, 
      descripcion: 'Lavado, Aspirado, Secado, Limpieza de Vidrios, Embellecimiento interno, Restaurador de plásticos y gomas, Lavado de motor y Chasis' 
    },

    // CAMIONETA - Sencillo
    { 
      nombre: 'Sencillo Pick up/Tucson', 
      categoria: 'Camioneta', 
      precio: 11.00, 
      descripcion: 'Lavado, Aspirado, Secado, Limpieza de Vidrios y Tablero' 
    },
    // CAMIONETA - Premium (se eliminó el "Especial")
    { 
      nombre: 'Premium Pick up/Tucson', 
      categoria: 'Camioneta', 
      precio: 30.00, 
      descripcion: 'Lavado, Aspirado, Secado, Limpieza de Vidrios, Embellecimiento interno, Restaurador de plásticos y gomas, Lavado de motor y Chasis' 
    },

    // CAMION 350 - Sencillo
    { 
      nombre: 'Sencillo Camion 350/Triton/Rey', 
      categoria: 'Camion 350', 
      precio: 20.00, 
      descripcion: 'Lavado, Aspirado, Secado, Limpieza de Vidrios y Tablero' 
    },
    // CAMION 350 - Premium (se eliminó el "Especial")
    { 
      nombre: 'Premium Camion 350/Triton/Rey', 
      categoria: 'Camion 350', 
      precio: 40.00, 
      descripcion: 'Lavado, Aspirado, Secado, Limpieza de Vidrios, Embellecimiento interno, Restaurador de plásticos y gomas, Lavado de motor y Chasis' 
    },

    // CAMION 750 - Sencillo
    { 
      nombre: 'Sencillo Camion 750/NPR/FVR', 
      categoria: 'Camion 750', 
      precio: 35.00, 
      descripcion: 'Lavado, Aspirado, Secado, Limpieza de Vidrios y Tablero' 
    },
    // CAMION 750 - Premium (se eliminó el "Especial")
    { 
      nombre: 'Premium Camion 750/NPR/FVR', 
      categoria: 'Camion 750', 
      precio: 60.00, 
      descripcion: 'Lavado, Aspirado, Secado, Limpieza de Vidrios, Embellecimiento interno, Restaurador de plásticos y gomas, Lavado de motor y Chasis' 
    },

    // GANDOLA - Sencillo
    { 
      nombre: 'Sencillo Gandola', 
      categoria: 'Gandola', 
      precio: 60.00, 
      descripcion: 'Lavado, Aspirado, Secado, Limpieza de Vidrios y Tablero' 
    },
    // GANDOLA - Premium (se eliminó el "Especial")
    { 
      nombre: 'Premium Gandola', 
      categoria: 'Gandola', 
      precio: 70.00, 
      descripcion: 'Lavado, Aspirado, Secado, Limpieza de Vidrios, Embellecimiento interno, Restaurador de plásticos y gomas, Lavado de motor y Chasis' 
    },

    // BUCETA - Sencillo
    { 
      nombre: 'Sencillo Buceta', 
      categoria: 'Buceta', 
      precio: 20.00, 
      descripcion: 'Lavado, Aspirado, Secado, Limpieza de Vidrios y Tablero' 
    },
    // BUCETA - Premium (se eliminó el "Especial")
    { 
      nombre: 'Premium Buceta', 
      categoria: 'Buceta', 
      precio: 40.00, 
      descripcion: 'Lavado, Aspirado, Secado, Limpieza de Vidrios, Embellecimiento interno, Restaurador de plásticos y gomas, Lavado de motor y Chasis' 
    },

    // BUS 24 - Sencillo
    { 
      nombre: 'Sencillo Bus 24 puestos', 
      categoria: 'Bus 24', 
      precio: 30.00, 
      descripcion: 'Lavado, Aspirado, Secado, Limpieza de Vidrios y Tablero' 
    },
    // BUS 24 - Premium (se eliminó el "Especial")
    { 
      nombre: 'Premium Bus 24 puestos', 
      categoria: 'Bus 24', 
      precio: 60.00, 
      descripcion: 'Lavado, Aspirado, Secado, Limpieza de Vidrios, Embellecimiento interno, Restaurador de plásticos y gomas, Lavado de motor y Chasis' 
    },

    // ENCAVA - Sencillo
    { 
      nombre: 'Sencillo Encava', 
      categoria: 'Encava', 
      precio: 40.00, 
      descripcion: 'Lavado, Aspirado, Secado, Limpieza de Vidrios y Tablero' 
    },
    // ENCAVA - Premium (se eliminó el "Especial")
    { 
      nombre: 'Premium Encava', 
      categoria: 'Encava', 
      precio: 80.00, 
      descripcion: 'Lavado, Aspirado, Secado, Limpieza de Vidrios, Embellecimiento interno, Restaurador de plásticos y gomas, Lavado de motor y Chasis' 
    },

    // MOTO - Básica
    { 
      nombre: 'Basica Moto', 
      categoria: 'Moto', 
      precio: 4.00, 
      descripcion: 'Lavado y desengrasado de cadena' 
    },
    // NOTA: Se eliminó el servicio "Especial Premium Moto"

    // MOTO 650 - Básica
    { 
      nombre: 'Basica Moto 650', 
      categoria: 'Moto 650', 
      precio: 6.00, 
      descripcion: 'Lavado y desengrasado de cadena' 
    }
    // NOTA: Se eliminó el servicio "Especial Premium Moto 650"
  ]

  // 4. Primero eliminar servicios existentes para evitar duplicados
  console.log('Eliminando servicios existentes...')
  await prisma.servicio.deleteMany({})
  console.log('Servicios eliminados')

  // 5. Crear los nuevos servicios
  console.log('Creando nuevos servicios...')
  
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
  console.log('Seed completado')
}