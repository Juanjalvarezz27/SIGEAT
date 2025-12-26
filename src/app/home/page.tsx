import LogoutButton from "../components/login/LogoutButton"
import { Car, Users, DollarSign, Calendar } from "lucide-react"

export default async function HomeDashboard() {

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <header className="bg-linear-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white mb-8">
        <div className="flex justify-between items-center">
          <div>
            <p className="opacity-90">Panel de Control - AutoLavado SilaV</p>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Vehículos Hoy</p>
                <p className="text-3xl font-bold mt-2">12</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Car className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Clientes Activos</p>
                <p className="text-3xl font-bold mt-2">48</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Ingresos Hoy</p>
                <p className="text-3xl font-bold mt-2">$350.00</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Próximos</p>
                <p className="text-3xl font-bold mt-2">5</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-xl font-bold mb-6">Acciones Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Nuevo Registro", icon: "➕", color: "bg-blue-100 text-blue-600" },
              { label: "Buscar Vehículo", icon: "🔍", color: "bg-green-100 text-green-600" },
              { label: "Reportes", icon: "📊", color: "bg-purple-100 text-purple-600" },
              { label: "Configuración", icon: "⚙️", color: "bg-gray-100 text-gray-600" },
            ].map((action, index) => (
              <button
                key={index}
                className={`${action.color} p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:opacity-90 transition-opacity`}
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mensaje de bienvenida */}
        <div className="mt-8 p-6 bg-linear-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
          <h3 className="font-bold text-lg text-indigo-800 mb-2">¡Sistema listo para usar!</h3>
          <p className="text-indigo-700">
            El sistema de gestión de vehículos está completamente configurado. 
            Puedes comenzar a registrar vehículos, servicios y gestionar clientes.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>AutoLavado SilaV © {new Date().getFullYear()} - Sistema de Gestión</p>
        <p className="mt-1">Versión 1.0.0</p>
      </footer>
    </div>
  )
}