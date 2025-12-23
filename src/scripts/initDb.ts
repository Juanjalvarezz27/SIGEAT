import { seedUsuarios } from './seeds/usuarios.seed'
import { seedEstados } from './seeds/estados.seed'
import { seedVehiculos } from './seeds/vehiculos.seed'
import { seedServicios } from './seeds/servicios.seed'
import { seedExtras } from './seeds/extras.seed'

export async function def() {
  console.log('Inicializando base de datos...')
  
  try {
    // Ejecutar seeds en orden
    await seedUsuarios()
    await seedEstados()
    await seedVehiculos()
    await seedServicios()
    await seedExtras()
    
    console.log('Base de datos inicializada correctamente')
    
  } catch (error) {
    console.error('Error inicializando BD:', error)
    throw error
  }
}

// Para ejecución directa
if (require.main === module) {
  def().catch(console.error)
}