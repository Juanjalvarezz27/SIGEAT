"use client"

import { useState, useEffect } from 'react'
import {
  Users,
  User,
  Calendar,
  ShieldCheck,
  Search,
  Hash,
  Trash2,
  AlertTriangle,
  Loader2,
  Filter,
  X
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
        return 'bg-[#122a4e] text-white border-[#122a4e]'
      case 'usuario':
        return 'bg-[#e2e2f6] text-[#4260ad] border-[#e2e2f6]'
      default:
        return 'bg-gray-100 text-gray-500 border-gray-200'
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador'
      case 'usuario': return 'Estándar'
      default: return role
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
      {/* Modal Confirmación Eliminación */}
      {usuarioAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-4xl shadow-2xl max-w-md w-full overflow-hidden border border-white/20">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>

              <h3 className="text-xl font-black text-[#140f07] mb-2">
                ¿Eliminar acceso?
              </h3>
              
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Estás a punto de eliminar al usuario <strong className="text-[#122a4e]">{usuarioAEliminar.username}</strong>. 
                Esta acción es irreversible y perderá todo acceso al sistema.
              </p>

              {/* Advertencias específicas */}
              {usuarioActualId === usuarioAEliminar.id && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-6 flex items-start gap-3 text-left">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-amber-800">Acción no permitida</p>
                    <p className="text-xs text-amber-700 mt-0.5">No puedes eliminar tu propia cuenta.</p>
                  </div>
                </div>
              )}

              {usuarioAEliminar.role === 'admin' && usuarioActualId !== usuarioAEliminar.id && (
                <div className="bg-[#f4f6fc] border border-[#e2e2f6] rounded-xl p-3 mb-6 flex items-start gap-3 text-left">
                  <ShieldCheck className="h-5 w-5 text-[#4260ad] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-[#122a4e]">Usuario Administrador</p>
                    <p className="text-xs text-slate-600 mt-0.5">Verifica si es necesario reasignar sus responsabilidades.</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setUsuarioAEliminar(null)}
                  disabled={eliminando}
                  className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEliminarUsuario}
                  disabled={eliminando || usuarioActualId === usuarioAEliminar.id || !isAdmin}
                  className="flex-1 py-3.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {eliminando ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Procesando...</span>
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

      {/* Contenedor Principal */}
      <div className="space-y-6">
        
        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
             <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Usuarios</p>
                <p className="text-2xl font-black text-[#140f07]">{totalUsuarios}</p>
             </div>
             <div className="w-10 h-10 bg-[#f4f6fc] rounded-xl flex items-center justify-center text-[#122a4e]">
                <Users className="h-5 w-5" />
             </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
             <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Admins</p>
                <p className="text-2xl font-black text-[#122a4e]">{totalAdmins}</p>
             </div>
             <div className="w-10 h-10 bg-[#e2e2f6] rounded-xl flex items-center justify-center text-[#4260ad]">
                <ShieldCheck className="h-5 w-5" />
             </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
             <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estándar</p>
                <p className="text-2xl font-black text-[#122a4e]">{totalUsuariosEstandar}</p>
             </div>
             <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500">
                <User className="h-5 w-5" />
             </div>
          </div>
        </div>

        {/* Buscador y Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#4260ad]" />
            <input
              type="text"
              placeholder="Buscar por nombre de usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#869dfc] focus:ring-0 text-sm font-medium outline-none transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-500 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleFilterChange('admins')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                showSoloAdmins
                  ? 'bg-[#122a4e] text-white border-[#122a4e] shadow-md shadow-[#122a4e]/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#4260ad] hover:text-[#4260ad]'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Admins
            </button>
            <button
              onClick={() => handleFilterChange('usuarios')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                showSoloUsuarios
                  ? 'bg-[#4260ad] text-white border-[#4260ad] shadow-md shadow-[#4260ad]/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#4260ad] hover:text-[#4260ad]'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              Usuarios
            </button>
          </div>
        </div>

        {/* Lista de Usuarios */}
        <div className="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden min-h-75">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 text-[#4260ad] animate-spin mb-3" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Cargando directorio...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-[#140f07]">Error de Carga</h3>
              <p className="text-slate-500 text-sm mt-1 mb-6 max-w-xs">{error}</p>
              <button 
                onClick={fetchUsuarios}
                className="px-6 py-2.5 bg-[#122a4e] text-white rounded-xl font-bold text-sm shadow-lg hover:bg-[#0f2240] transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : filteredUsuarios.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-[#f4f6fc] rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-[#869dfc]" />
              </div>
              <h3 className="text-lg font-bold text-[#140f07]">Sin resultados</h3>
              <p className="text-slate-500 text-sm mt-1">
                {searchTerm ? `No se encontraron usuarios para "${searchTerm}"` : 'No hay usuarios registrados'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredUsuarios.map((usuario) => (
                <div 
                  key={usuario.id} 
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-[#fcfdff] transition-colors group gap-4"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar / Inicial */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black uppercase shrink-0 ${
                      usuario.role === 'admin' ? 'bg-[#122a4e] text-white' : 'bg-[#e2e2f6] text-[#4260ad]'
                    }`}>
                      {usuario.username.charAt(0)}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-[#140f07]">{usuario.username}</h4>
                        {usuarioActualId === usuario.id && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                            Tú
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
                          <Hash className="h-3 w-3" /> ID: {usuario.id}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
                          <Calendar className="h-3 w-3" /> {usuario.fechaCreacionFormateada}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-50">
                    <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${getRoleColor(usuario.role)}`}>
                      {getRoleIcon(usuario.role)}
                      {getRoleDisplayName(usuario.role)}
                    </div>

                    {isAdmin && usuarioActualId !== usuario.id && (
                      <button
                        onClick={() => setUsuarioAEliminar(usuario)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-100 sm:opacity-0 group-hover:opacity-100"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}