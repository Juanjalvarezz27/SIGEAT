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
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row md:flex-row gap-4 items-start lg:items-center md:items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                Mi Perfil 
                <User className="h-7 w-7 text-gray-700" />
              </h1>
            <Link 
              href="/home/usuarios"
              className="inline-flex items-center justify-center space-x-2 px-4 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md whitespace-nowrap"
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-center sm:items-start flex-col sm:flex-row gap-4">
              <div className="w-12 h-12 bg-linear-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full mb-3">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-700">Información</span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Sobre tu cuenta</h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  Esta es tu información personal de acceso al sistema. Aquí puedes ver tus datos 
                  básicos y gestionar la seguridad de tu cuenta.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}