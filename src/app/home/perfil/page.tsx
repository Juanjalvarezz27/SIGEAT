"use client"

import { useState, useEffect } from 'react'
import { User, Settings } from "lucide-react"
import PerfilUsuario from '../../components/perfil/PerfilUsuario'
import Link from 'next/link'

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
    <div className="min-h-screen ">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Mi Perfil
              </h1>
            </div>
            
            <Link 
              href="/home/usuarios"
              className="flex items-center justify-center sm:justify-start space-x-2 px-4 py-2.5 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow w-full sm:w-auto"
            >
              <Settings className="h-4 w-4" />
              <span className='text-lg'>Gestionar Usuarios</span>
            </Link>
          </div>
        </div>

        {/* Tarjeta principal del perfil */}
        <div className="max-w-2xl mx-auto">
          <PerfilUsuario 
            usuario={usuario}
            loading={loading}
            error={error}
            onRetry={fetchPerfil}
          />
        </div>

        {/* Información adicional */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sobre tu cuenta</h3>
                <p className="text-gray-600 mb-3">
                  {usuario 
                    ? `Esta es tu información personal de acceso al sistema. Tu cuenta fue creada el ${usuario.fechaCreacionFormateada}.`
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