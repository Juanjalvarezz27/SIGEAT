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
      if (!response.ok) throw new Error('Error al cargar la lista')
      const data: ListaUsuariosResponse = await response.json()
      if (!data.success) throw new Error(data.error)

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

  // Estilos de Roles más sutiles y modernos
  const getRoleStyles = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          container: 'bg-[#122a4e] text-white border-[#122a4e]',
          icon: <ShieldCheck className="h-3 w-3" />,
          label: 'Admin'
        }
      case 'usuario':
        return {
          container: 'bg-white text-slate-600 border-slate-200 shadow-sm',
          icon: <User className="h-3 w-3 text-slate-400" />,
          label: 'Estándar'
        }
      default:
        return {
          container: 'bg-gray-100 text-gray-500',
          icon: <User className="h-3 w-3" />,
          label: role
        }
    }
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
      const response = await fetch(`/api/usuarios/${usuarioAEliminar.id}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      toast.success(`Usuario eliminado`)
      setUsuarioAEliminar(null)
      fetchUsuarios()
    } catch (error) {
      toast.error('Error al eliminar')
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
    <div className="space-y-6">
      
      {/* Estadísticas (Grid compacta en móvil) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm col-span-2 md:col-span-1 flex items-center justify-between">
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total</p>
              <p className="text-xl font-black text-[#140f07]">{totalUsuarios}</p>
           </div>
           <div className="w-8 h-8 bg-[#f4f6fc] rounded-lg flex items-center justify-center text-[#122a4e]">
              <Users className="h-4 w-4" />
           </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Admins</p>
              <p className="text-xl font-black text-[#122a4e]">{totalAdmins}</p>
           </div>
           <div className="w-8 h-8 bg-[#e2e2f6] rounded-lg flex items-center justify-center text-[#4260ad]">
              <ShieldCheck className="h-4 w-4" />
           </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Usuarios</p>
              <p className="text-xl font-black text-[#122a4e]">{totalUsuariosEstandar}</p>
           </div>
           <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500">
              <User className="h-4 w-4" />
           </div>
        </div>
      </div>

      {/* Buscador y Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#4260ad]" />
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-[#869dfc] focus:ring-0 text-sm font-medium outline-none transition-all"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-500 rounded-lg">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleFilterChange('admins')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              showSoloAdmins ? 'bg-[#122a4e] text-white border-[#122a4e]' : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Admin
          </button>
          <button
            onClick={() => handleFilterChange('usuarios')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              showSoloUsuarios ? 'bg-[#4260ad] text-white border-[#4260ad]' : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            <User className="h-3.5 w-3.5" /> User
          </button>
        </div>
      </div>

      {/* Lista de Usuarios (Diseño Optimizado) */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 text-[#4260ad] animate-spin mx-auto" />
          </div>
        ) : filteredUsuarios.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium text-sm">No se encontraron usuarios</p>
          </div>
        ) : (
          filteredUsuarios.map((usuario) => {
            const roleStyle = getRoleStyles(usuario.role)
            return (
              <div 
                key={usuario.id} 
                className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between shadow-[0_2px_8px_rgb(0,0,0,0.02)] hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  {/* Avatar con Inicial */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black uppercase shrink-0 shadow-sm ${
                    usuario.role === 'admin' ? 'bg-[#122a4e] text-white' : 'bg-[#e2e2f6] text-[#4260ad]'
                  }`}>
                    {usuario.username.charAt(0)}
                  </div>
                  
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-[#140f07] truncate">{usuario.username}</h4>
                      
                      {/* BADGE DEL ROL (Ahora al lado del nombre y más pequeño) */}
                      <div className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${roleStyle.container}`}>
                        {roleStyle.icon}
                        {roleStyle.label}
                      </div>

                      {usuarioActualId === usuario.id && (
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                          TÚ
                        </span>
                      )}
                    </div>
                  
                  </div>
                </div>

                {/* Botón Eliminar */}
                {isAdmin && usuarioActualId !== usuario.id && (
                  <button
                    onClick={() => setUsuarioAEliminar(usuario)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all ml-2 shrink-0"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Modal Confirmación (Sin cambios funcionales, solo estilo) */}
      {usuarioAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#122a4e]/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-black text-[#140f07]">¿Eliminar usuario?</h3>
              <p className="text-sm text-slate-500 mt-1 px-4">
                Se perderá el acceso para <span className="font-bold text-[#140f07]">{usuarioAEliminar.username}</span> permanentemente.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setUsuarioAEliminar(null)} disabled={eliminando} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm">Cancelar</button>
              <button onClick={handleEliminarUsuario} disabled={eliminando} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-600/20 flex items-center justify-center gap-2">
                {eliminando && <Loader2 className="h-4 w-4 animate-spin" />} Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}