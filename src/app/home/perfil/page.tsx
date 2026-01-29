"use client"

import { useState, useEffect } from 'react'
import { User, ShieldCheck } from "lucide-react"
import PerfilUsuario from '../../components/perfil/PerfilUsuario'

interface UsuarioPerfil {
  username: string
  fechaCreacionFormateada: string
}

export default function Perfil() {
  const [usuario, setUsuario] = useState<UsuarioPerfil | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPerfil()
  }, [])

  const fetchPerfil = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/perfil')
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('No autorizado. Inicia sesión.')
        }
        throw new Error('Error al cargar los datos')
      }
      
      const data = await response.json()
      setUsuario(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener datos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header Principal Estilizado */}
        <div className="mb-10">
          <div className="flex flex-row items-start sm:items-center gap-5">
            <div className="w-16 h-16 bg-[#122a4e] rounded-3xl flex items-center justify-center shadow-xl shadow-[#122a4e]/20 shrink-0">
              <User className="h-8 w-8 text-white" />
            </div>
            <div className="min-w-0 flex-1 pt-1 sm:pt-0">
              <h1 className="text-3xl font-black text-[#140f07] tracking-tight leading-tight">
                Mi Perfil
              </h1>
              <p className="text-sm font-medium text-[#122a4e]/60 mt-1 flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                Administra tu información personal
              </p>
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Componente del Formulario */}
          <div className="bg-white rounded-[2.5rem] border border-[#869dfc]/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <PerfilUsuario 
              usuario={usuario}
              loading={loading}
              error={error}
              onRetry={fetchPerfil}
            />
          </div>

          {/* Tarjeta de Información Adicional */}
          <div className="bg-[#f8f9fc] rounded-3xl border border-slate-200 p-6 sm:p-8">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 shadow-sm text-[#4260ad]">
                <User className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#140f07] mb-2">Estado de la cuenta</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {usuario 
                    ? (
                      <span>
                        Esta es tu información personal de acceso al sistema. <br className="hidden sm:block" />
                        Tu cuenta fue registrada exitosamente el <strong className="text-[#122a4e]">{usuario.fechaCreacionFormateada}</strong>.
                      </span>
                    )
                    : 'Cargando información de tu cuenta...'
                  }
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}