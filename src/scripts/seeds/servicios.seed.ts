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

  // 3. Datos de servicios actualizados
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
  ]

  // 4. Usar upsert en lugar de delete/create para evitar problemas de clave foránea
  console.log('Procesando servicios...')
  
  let serviciosCreados = 0
  let serviciosActualizados = 0

  for (const servicio of serviciosData) {
    try {
      // Verificar si el servicio ya existe
      const existingService = await prisma.servicio.findUnique({
        where: { nombre: servicio.nombre }
      })

      if (existingService) {
        // Actualizar servicio existente
        await prisma.servicio.update({
          where: { id: existingService.id },
          data: {
            descripcion: servicio.descripcion,
            precio: servicio.precio,
            categoriaId: categoriaMap[servicio.categoria]
          }
        })
        serviciosActualizados++
      } else {
        // Crear nuevo servicio
        await prisma.servicio.create({
          data: {
            nombre: servicio.nombre,
            descripcion: servicio.descripcion,
            precio: servicio.precio,
            categoriaId: categoriaMap[servicio.categoria]
          }
        })
        serviciosCreados++
      }
    } catch (error) {
      console.error(`Error procesando servicio ${servicio.nombre}:`, error)
    }
  }

  // 5. Eliminar servicios que ya no existen en la nueva estructura
  // Primero obtenemos todos los servicios actuales
  const serviciosActualesNombres = serviciosData.map(s => s.nombre)
  
  // Buscar servicios que existen en la BD pero no en nuestra nueva lista
  const serviciosAEliminar = await prisma.servicio.findMany({
    where: {
      NOT: {
        nombre: {
          in: serviciosActualesNombres
        }
      }
    }
  })

  // Solo eliminamos servicios que no tienen registros relacionados
  for (const servicio of serviciosAEliminar) {
    try {
      // Verificar si tiene registros relacionados
      const registrosRelacionados = await prisma.registroVehiculo.count({
        where: { servicioId: servicio.id }
      })

      if (registrosRelacionados === 0) {
        // No tiene registros, podemos eliminar
        await prisma.servicio.delete({
          where: { id: servicio.id }
        })
        console.log(`Servicio eliminado: ${servicio.nombre}`)
      } else {
        // Tiene registros, solo desactivar o mantener
        console.log(`Servicio ${servicio.nombre} tiene ${registrosRelacionados} registros, no se puede eliminar`)
      }
    } catch (error) {
      console.error(`Error al procesar servicio ${servicio.nombre}:`, error)
    }
  }

  console.log(`Servicios procesados: ${serviciosCreados} creados, ${serviciosActualizados} actualizados`)
  console.log('Seed completado')
}