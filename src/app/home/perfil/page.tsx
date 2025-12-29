"use client"

import { useState, useEffect } from 'react'
import { User } from "lucide-react"
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
    <div className="min-h-screen ">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header con el mismo estilo de icono */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 min-w-10 min-h-10 aspect-square bg-linear-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Mi Perfil
                </h1>
                <p className="text-gray-600 mt-1">Administra tu información personal</p>
              </div>
            </div>
            
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

        {/* Información adicional - con icono cuadrado */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start space-x-4">
              {/* Icono cuadrado como en el header */}
              <div className="w-10 h-10 min-w-10 min-h-10 aspect-square bg-linear-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
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