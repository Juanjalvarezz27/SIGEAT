"use client"

import { useState, useEffect } from 'react'
import { 
  Users, 
  User, 
  Calendar, 
  Shield, 
  Search,
  RefreshCw,
  Hash
} from "lucide-react"

interface Usuario {
  id: number
  username: string
  fechaCreacionFormateada: string
  createdAt: string
}

interface ListaUsuariosResponse {
  error: string
  success: boolean
  data: {
    usuarios: Usuario[]
    total: number
    estadisticas: {
      total: number
      ultimaActualizacion: string
    }
  }
}

export default function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [totalUsuarios, setTotalUsuarios] = useState(0)

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const fetchUsuarios = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/usuarios/lista')
      
      if (!response.ok) {
        throw new Error('Error al cargar la lista de usuarios')
      }
      
      const data: ListaUsuariosResponse = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Error en la respuesta del servidor')
      }
      
      setUsuarios(data.data.usuarios)
      setTotalUsuarios(data.data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener datos')
    } finally {
      setLoading(false)
    }
  }

  // Filtrar usuarios por búsqueda
  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-500 to-blue-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Todos los Usuarios</h2>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Users className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {/* Barra de búsqueda y estadísticas */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total usuarios</p>
                  <p className="text-2xl font-bold text-gray-900">{totalUsuarios}</p>
                </div>
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Mostrando</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredUsuarios.length}</p>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Search className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Estado de carga */}
        {loading ? (
          <div className="py-10 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Cargando lista de usuarios...</p>
            <p className="text-gray-500 text-sm mt-2">Obteniendo información del sistema</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <div className="text-red-500 mb-4">
              <Shield className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchUsuarios}
              className="px-4 py-2 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-gray-600 hover:to-blue-700 transition-all"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <>
            {/* Lista de usuarios */}
            {filteredUsuarios.length === 0 ? (
              <div className="py-10 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No se encontraron resultados' : 'No hay usuarios registrados'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? `No se encontraron usuarios que coincidan con "${searchTerm}"`
                    : 'Registra el primer usuario usando el formulario de arriba'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-125 overflow-y-auto pr-2">
                {filteredUsuarios.map((usuario, index) => (
                  <div 
                    key={usuario.id} 
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-linear-to-br from-blue-300 to-blue-600 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900">{usuario.username}</p>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <p className="text-xs text-gray-500">{usuario.fechaCreacionFormateada}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Hash className="h-3 w-3" />
                          <span className="text-xs font-mono">ID: {usuario.id}</span>
                        </div>
                        <div className="mt-2">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg">
                            Usuario
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </>
        )}
      </div>
    </div>
  )
}