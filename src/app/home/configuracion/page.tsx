import GestionConfiguracion from '../../components/configuracion/GestionConfiguracion'
import { Settings } from 'lucide-react'

export default function ConfiguracionPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 aspect-square bg-linear-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
              <p className="text-gray-600 mt-1">Administra servicios y categorías del sistema</p>
            </div>
          </div>
        </div>

        {/* Componente principal con desplegables */}
        <GestionConfiguracion />

      </div>
    </div>
  )
}