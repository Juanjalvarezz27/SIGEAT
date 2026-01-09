"use client"

import { useState, useEffect } from 'react'
import {
  Users,
  User,
  Calendar,
  Shield,
  ShieldCheck,
  Search,
  Hash,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff
} from "lucide-react"
import { toast } from 'react-toastify'
import { useAuth } from '../../hooks/useAuth'

interface Usuario {
  id: number
  username: string
  role: string
  fechaCreacionFormateada: string
  createdAt: string
}

interface ListaUsuariosResponse {
  success: boolean
  data: {
    usuarios: Usuario[]
    total: number
    estadisticas: {
      total: number
      admins: number
      usuariosEstandar: number
      ultimaActualizacion: string
    }
  }
  error?: string
}

export default function ListaUsuarios() {
  const { user, isAdmin } = useAuth()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [totalUsuarios, setTotalUsuarios] = useState(0)
  const [totalAdmins, setTotalAdmins] = useState(0)
  const [totalUsuariosEstandar, setTotalUsuariosEstandar] = useState(0)
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<Usuario | null>(null)
  const [eliminando, setEliminando] = useState(false)
  const [showSoloAdmins, setShowSoloAdmins] = useState(false)
  const [showSoloUsuarios, setShowSoloUsuarios] = useState(false)

  const usuarioActualId = user?.id ? parseInt(user.id) : null

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
      setTotalAdmins(data.data.estadisticas.admins)
      setTotalUsuariosEstandar(data.data.estadisticas.usuariosEstandar)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener datos')
    } finally {
      setLoading(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
      case 'usuario':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin'
      case 'usuario':
        return 'Usuario'
      default:
        return role
    }
  }

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? <ShieldCheck className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />
  }

  const filteredUsuarios = usuarios.filter(usuario => {
    const matchesSearch = usuario.username.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAdminFilter = !showSoloAdmins || usuario.role === 'admin'
    const matchesUserFilter = !showSoloUsuarios || usuario.role === 'usuario'
    
    return matchesSearch && matchesAdminFilter && matchesUserFilter
  })

  const handleEliminarUsuario = async () => {
    if (!usuarioAEliminar) return

    setEliminando(true)

    try {
      const response = await fetch(`/api/usuarios/${usuarioAEliminar.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar el usuario')
      }

      toast.success(`✅ Usuario "${usuarioAEliminar.username}" eliminado exitosamente!`, {
        position: "top-right",
        autoClose: 5000,
      })

      setUsuarioAEliminar(null)
      fetchUsuarios()

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error desconocido', {
        position: "top-right",
      })
    } finally {
      setEliminando(false)
    }
  }

  const handleFilterChange = (filterType: 'admins' | 'usuarios') => {
    if (filterType === 'admins') {
      setShowSoloAdmins(!showSoloAdmins)
      setShowSoloUsuarios(false)
    } else {
      setShowSoloUsuarios(!showSoloUsuarios)
      setShowSoloAdmins(false)
    }
  }

  return (
    <>
      {usuarioAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="bg-linear-to-r from-red-500 to-red-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Confirmar Eliminación</h3>
                  <p className="text-red-100 text-sm mt-1">Esta acción no se puede deshacer</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="h-8 w-8 text-red-600" />
                </div>

                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  ¿Eliminar usuario <span className="text-red-600">{usuarioAEliminar.username}</span>?
                </h4>

                {usuarioActualId === usuarioAEliminar.id && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-yellow-800 mb-1">¡Esta es tu propia cuenta!</p>
                        <p className="text-xs text-yellow-700">
                          No puedes eliminar tu propia cuenta.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {usuarioAEliminar.role === 'admin' && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mt-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <ShieldCheck className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-purple-800 mb-1">Usuario Administrador</p>
                        <p className="text-xs text-purple-700">
                          Estás a punto de eliminar un administrador.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-red-800 mb-1">Advertencia</p>
                      <ul className="text-xs text-red-700 space-y-1">
                        <li>• Esta acción eliminará permanentemente el usuario</li>
                        <li>• El usuario no podrá acceder al sistema</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setUsuarioAEliminar(null)}
                  disabled={eliminando}
                  className="flex-1 cursor-pointer py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleEliminarUsuario}
                  disabled={eliminando || usuarioActualId === usuarioAEliminar.id || !isAdmin}
                  className={`flex-1 cursor-pointer py-3 rounded-xl font-medium transition-all flex items-center justify-center space-x-2 ${
                    usuarioActualId === usuarioAEliminar.id || !isAdmin
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-linear-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {eliminando ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Eliminando...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span>Eliminar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-linear-to-r from-blue-500 to-blue-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Gestión de Usuarios</h2>
              <p className="text-blue-100 text-sm mt-1">
                {isAdmin ? 'Administra todos los usuarios del sistema' : 'Consulta la lista de usuarios'}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleFilterChange('admins')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-1 ${
                    showSoloAdmins
                      ? 'bg-purple-100 text-purple-700 border border-purple-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                  <span>Admins ({totalAdmins})</span>
                </button>
                <button
                  onClick={() => handleFilterChange('usuarios')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-1 ${
                    showSoloUsuarios
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <User className="h-3.5 w-3.5 shrink-0" />
                  <span>Usuarios ({totalUsuariosEstandar})</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-3 gap-3">
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
                    <p className="text-sm text-gray-500">Administradores</p>
                    <p className="text-2xl font-bold text-gray-900">{totalAdmins}</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Usuarios estándar</p>
                    <p className="text-2xl font-bold text-gray-900">{totalUsuariosEstandar}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-10 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
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
                className="px-4 py-2 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <>
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
                      : 'Registra el primer usuario usando el formulario de agregar usuario'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {filteredUsuarios.map((usuario) => (
                    <div
                      key={usuario.id}
                      className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-200 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getRoleColor(usuario.role)}`}>
                              {getRoleIcon(usuario.role)}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-gray-900">{usuario.username}</p>
                              {usuarioActualId === usuario.id && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full whitespace-nowrap">
                                  Tú
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Calendar className="h-3 w-3 text-gray-400 shrink-0" />
                              <p className="text-xs text-gray-500">{usuario.fechaCreacionFormateada}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          {/* Badge del rol e ID - SOLO para desktop */}
                          <div className="hidden sm:flex items-center space-x-3">
                            {/* Badge del rol */}
                            <div className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getRoleColor(usuario.role)} whitespace-nowrap`}>
                              <div className="flex items-center space-x-1">
                                {getRoleIcon(usuario.role)}
                                <span className="truncate">{getRoleDisplayName(usuario.role)}</span>
                              </div>
                            </div>

                            {/* Información de ID */}
                            <div className="flex items-center space-x-1 text-gray-500">
                              <Hash className="h-3 w-3 shrink-0" />
                              <span className="text-xs font-mono whitespace-nowrap">ID: {usuario.id}</span>
                            </div>
                          </div>

                          {/* Botón de eliminar - SOLO para admins y no para sí mismo */}
                          {isAdmin && usuarioActualId !== usuario.id && (
                            <button
                              onClick={() => setUsuarioAEliminar(usuario)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Información adicional para móviles */}
                      <div className="sm:hidden mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Hash className="h-3 w-3 shrink-0" />
                            <span className="text-xs font-mono">ID: {usuario.id}</span>
                          </div>
                          
                          <div className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getRoleColor(usuario.role)} whitespace-nowrap`}>
                            <div className="flex items-center space-x-1">
                              {getRoleIcon(usuario.role)}
                              <span className="truncate">{getRoleDisplayName(usuario.role)}</span>
                            </div>
                          </div>
                        </div>

                        {usuarioActualId === usuario.id && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full whitespace-nowrap">
                            Tú
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}