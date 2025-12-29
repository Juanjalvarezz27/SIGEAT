"use client"

import { useState } from 'react'
import { Users, UserPlus } from "lucide-react"
import AgregarUsuarioBento from '../../components/perfil/AgregarUsuario'
import ListaUsuarios from '../../components/perfil/ListaUsuarios'

export default function Usuarios() {
  const [activeTab, setActiveTab] = useState<'lista' | 'agregar'>('lista')

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-4">
        
        {/* Header */}
        <div className="mb-8">
          {/* Contenedor responsive: grid en sm, flex en md/lg */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-1 md:flex md:items-center md:justify-between mb-6">
            
            {/* Título y descripción */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 aspect-square bg-linear-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
                <p className="text-gray-500 text-sm">Administra todos los usuarios del sistema</p>
              </div>
            </div>

            {/* Tabs de navegación */}
                <div className="flex  bg-white rounded-2xl shadow-sm border border-gray-200 p-1.5 max-w-md">
                <button
                    onClick={() => setActiveTab('lista')}
                    className={`flex-1 cursor-pointer py-2.5 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'lista'
                        ? 'bg-linear-to-r from-blue-500 to-blue-600 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80'
                    }`}
                >
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-semibold">Lista de Usuarios</span>
                </button>
                
                <button
                    onClick={() => setActiveTab('agregar')}
                    className={`flex-1 cursor-pointer py-2.5 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'agregar'
                        ? 'bg-linear-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80'
                    }`}
                >
                    <UserPlus className="h-4 w-4" />
                    <span className="text-sm font-semibold">Agregar Usuario</span>
                </button>
                </div>
          </div>
        </div>

        {/* Contenido según tab activo */}
        <div className="space-y-6">
          {activeTab === 'lista' ? (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Todos los Usuarios Registrados</h2>
                <p className="text-gray-600">
                  Visualiza y gestiona todos los usuarios con acceso al sistema de vehículos.
                </p>
              </div>
              <ListaUsuarios />
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Registrar Nuevo Usuario</h2>
                <p className="text-gray-600">
                  Crea una nueva cuenta de acceso para personal autorizado.
                </p>
              </div>
              
              {/* Contenedor del formulario con ancho normal */}
              <div className="flex justify-center">
                <div className="w-full max-w-2xl"> {/* Ancho normal, máximo 2xl */}
                  <AgregarUsuarioBento />
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}