import prisma from '@/src/lib/prisma'

export async function seedVehiculos() {
  console.log('Verificando tipos de vehiculo...')
  
  const tipos = await prisma.tipoVehiculo.findMany()
  
  if (tipos.length === 0) {
    await prisma.tipoVehiculo.createMany({
      data: [
        // CARRO TIPO SEDAN
        { nombre: 'Sedan', categoria: 'carro' },
        
        // CAMIONETAS: PICK UP Y TIPO TUCSON
        { nombre: 'Pick up', categoria: 'camioneta' },
        { nombre: 'Tucson', categoria: 'camioneta' },
        
        // CAMIONES: 350 - TRITÓN - REY CAMIÓN
        { nombre: 'Camion 350', categoria: 'camion_350' },
        { nombre: 'Triton', categoria: 'camion_350' },
        { nombre: 'Rey Camion', categoria: 'camion_350' },
        
        // CAMIONES: 750 - NPR - FVR
        { nombre: 'Camion 750', categoria: 'camion_750' },
        { nombre: 'NPR', categoria: 'camion_750' },
        { nombre: 'FVR', categoria: 'camion_750' },
        
        // GANDOLAS
        { nombre: 'Gandola', categoria: 'gandola' },
        
        // BUCETAS
        { nombre: 'Buceta', categoria: 'buceta' },
        
        // BUS Y MINIBUS 24 PUESTOS
        { nombre: 'Bus 24 puestos', categoria: 'bus_24' },
        { nombre: 'MiniBus 24 puestos', categoria: 'bus_24' },
        
        // BUS TIPO ENCAVA
        { nombre: 'Encava', categoria: 'encava' },
        
        // MOTOS
        { nombre: 'Moto', categoria: 'moto' },
        { nombre: 'Moto 650', categoria: 'moto_650' }
      ]
    })
    console.log('Tipos de vehiculo creados')
  } else {
    console.log(`${tipos.length} tipo(s) de vehiculo ya existen`)
  }
}