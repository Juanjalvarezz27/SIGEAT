import prisma from '@/src/lib/prisma'

export async function seedVehiculos() {
  console.log('Verificando tipos de vehiculo...')

  const tipos = await prisma.tipoVehiculo.findMany()

  if (tipos.length === 0) {
    await prisma.tipoVehiculo.createMany({
      data: [
        // CARRO 
        { nombre: 'Sedan', categoria: 'Carro' },

        // CAMIONETAS: PICK UP Y TIPO TUCSON
        { nombre: 'Pick up', categoria: 'Camioneta' },
        { nombre: 'Tucson', categoria: 'Camioneta' },

        // CAMIONES: 350 - TRITÓN - REY CAMIÓN 
        { nombre: 'Camion 350', categoria: 'Camion 350' },
        { nombre: 'Triton', categoria: 'Camion 350' },
        { nombre: 'Rey Camion', categoria: 'Camion 350' },

        // CAMIONES: 750 - NPR - FVR 
        { nombre: 'Camion 750', categoria: 'Camion 750' },
        { nombre: 'NPR', categoria: 'Camion 750' },
        { nombre: 'FVR', categoria: 'Camion 750' },

        // GANDOLAS 
        { nombre: 'Gandola', categoria: 'Gandola' },

        // BUCETAS 
        { nombre: 'Buceta', categoria: 'Buceta' },

        // BUS Y MINIBUS 24 PUESTOS 
        { nombre: 'Bus 24 puestos', categoria: 'Bus 24' },
        { nombre: 'MiniBus 24 puestos', categoria: 'Bus 24' },

        // BUS TIPO ENCAVA 
        { nombre: 'Encava', categoria: 'Encava' },

        // MOTOS 
        { nombre: 'Moto', categoria: 'Moto' },
        
        // MOTO 650 
        { nombre: 'Moto 650', categoria: 'Moto 650' }
      ]
    })
    console.log('Tipos de vehiculo creados')
  } else {
    console.log(`${tipos.length} tipo(s) de vehiculo ya existen`)
  }
}