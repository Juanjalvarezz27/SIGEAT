import prisma from '@/src/lib/prisma'

export async function seedServicios() {
  console.log('Verificando servicios...')
  
  const servicios = await prisma.servicio.findMany()
  
  if (servicios.length === 0) {
    const serviciosData = [
      // ========== CARRO TIPO SEDAN ==========
      { nombre: 'Sencillo Sedan', categoria: 'carro', precio: 6.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de Vidrios y Tablero' },
      { nombre: 'Especial Sedan', categoria: 'carro', precio: 12.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de vidrios, Embellecimiento interno, Restaurador de Plásticos y gomas' },
      { nombre: 'Premium Sedan', categoria: 'carro', precio: 15.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de de Vidrios, Embellecimiento interno, Restaurador de plásticos y gomas, Lavado de motor y Chasis' },
      
      // ========== CAMIONETAS: PICK UP Y TIPO TUCSON ==========
      { nombre: 'Sencillo Pick up/Tucson', categoria: 'camioneta', precio: 8.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de Vidrios y Tablero' },
      { nombre: 'Especial Pick up/Tucson', categoria: 'camioneta', precio: 20.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de vidrios, Embellecimiento interno, Restaurador de Plásticos y gomas' },
      { nombre: 'Premium Pick up/Tucson', categoria: 'camioneta', precio: 25.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de de Vidrios, Embellecimiento interno, Restaurador de plásticos y gomas, Lavado de motor y Chasis' },
      
      // ========== CAMIONES: 350 - TRITÓN - REY CAMIÓN ==========
      { nombre: 'Sencillo Camion 350/Triton/Rey', categoria: 'camion_350', precio: 15.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de Vidrios y Tablero' },
      { nombre: 'Especial Camion 350/Triton/Rey', categoria: 'camion_350', precio: 25.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de vidrios, Embellecimiento interno, Restaurador de Plásticos y gomas' },
      { nombre: 'Premium Camion 350/Triton/Rey', categoria: 'camion_350', precio: 35.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de de Vidrios, Embellecimiento interno, Restaurador de plásticos y gomas, Lavado de motor y Chasis' },
      
      // ========== CAMIONES: 750 - NPR - FVR ==========
      { nombre: 'Sencillo Camion 750/NPR/FVR', categoria: 'camion_750', precio: 30.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de Vidrios y Tablero' },
      { nombre: 'Especial Camion 750/NPR/FVR', categoria: 'camion_750', precio: 40.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de vidrios, Embellecimiento interno, Restaurador de Plásticos y gomas' },
      { nombre: 'Premium Camion 750/NPR/FVR', categoria: 'camion_750', precio: 45.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de de Vidrios, Embellecimiento interno, Restaurador de plásticos y gomas, Lavado de motor y Chasis' },
      
      // ========== GANDOLAS ==========
      { nombre: 'Sencillo Gandola', categoria: 'gandola', precio: 55.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de Vidrios y Tablero' },
      { nombre: 'Especial Gandola', categoria: 'gandola', precio: 60.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de vidrios, Embellecimiento interno, Restaurador de Plásticos y gomas' },
      { nombre: 'Premium Gandola', categoria: 'gandola', precio: 65.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de de Vidrios, Embellecimiento interno, Restaurador de plásticos y gomas, Lavado de motor y Chasis' },
      
      // ========== BUCETAS ==========
      { nombre: 'Sencillo Buceta', categoria: 'buceta', precio: 15.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de Vidrios y Tablero' },
      { nombre: 'Especial Buceta', categoria: 'buceta', precio: 35.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de vidrios, Embellecimiento interno, Restaurador de Plásticos y gomas' },
      { nombre: 'Premium Buceta', categoria: 'buceta', precio: 30.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de de Vidrios, Embellecimiento interno, Restaurador de plásticos y gomas, Lavado de motor y Chasis' },
      
      // ========== BUS Y MINIBUS 24 PUESTOS ==========
      { nombre: 'Sencillo Bus 24 puestos', categoria: 'bus_24', precio: 25.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de Vidrios y Tablero' },
      { nombre: 'Especial Bus 24 puestos', categoria: 'bus_24', precio: 35.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de vidrios, Embellecimiento interno, Restaurador de Plásticos y gomas' },
      { nombre: 'Premium Bus 24 puestos', categoria: 'bus_24', precio: 35.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de de Vidrios, Embellecimiento interno, Restaurador de plásticos y gomas, Lavado de motor y Chasis' },
      
      // ========== BUS TIPO ENCAVA ==========
      { nombre: 'Sencillo Encava', categoria: 'encava', precio: 30.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de Vidrios y Tablero' },
      { nombre: 'Especial Encava', categoria: 'encava', precio: 40.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de vidrios, Embellecimiento interno, Restaurador de Plásticos y gomas' },
      { nombre: 'Premium Encava', categoria: 'encava', precio: 45.00, descripcion: 'Lavado, Aspirado, Secado, Limpieza de de Vidrios, Embellecimiento interno, Restaurador de plásticos y gomas, Lavado de motor y Chasis' },
      
      // ========== MOTOS ==========
      { nombre: 'Basica Moto', categoria: 'moto', precio: 3.50, descripcion: 'Lavado y desengrasado de cadena' },
      { nombre: 'Especial Premium Moto', categoria: 'moto', precio: 5.00, descripcion: 'Lavado y tension y desengrasado de cadena, restauracion de plasticos y gomas' },
      
      // ========== MOTOS 650 ==========
      { nombre: 'Basica Moto 650', categoria: 'moto_650', precio: 5.00, descripcion: 'Lavado y desengrasado de cadena' },
      { nombre: 'Especial Premium Moto 650', categoria: 'moto_650', precio: 10.00, descripcion: 'Lavado y tension y desengrasado de cadena, restauracion de plasticos y gomas' }
    ]
    
    await prisma.servicio.createMany({
      data: serviciosData
    })
    
    // Contar por categoría
    const categoriasCount: Record<string, number> = {}
    serviciosData.forEach(servicio => {
      categoriasCount[servicio.categoria] = (categoriasCount[servicio.categoria] || 0) + 1
    })
    
    console.log(`${serviciosData.length} servicios creados:`)
    Object.entries(categoriasCount).forEach(([categoria, count]) => {
      console.log(`  ${categoria}: ${count} servicios`)
    })
  } else {
    console.log(`${servicios.length} servicios ya existen`)
  }
}