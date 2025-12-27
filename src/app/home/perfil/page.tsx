"use client"

import { useState, useEffect } from 'react'
import { User } from "lucide-react"
import PerfilUsuario from '../../components/perfil/PerfilUsuario'
import AgregarUsuarioBento from '../../components/perfil/AgregarUsuario'
import ListaUsuarios from '../../components/perfil/ListaUsuarios'

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
    <div className="p-1">
      {/* Header para la página completa (mantenido en la página) */}
      <div className="mb-8 text-center">
        <div className="w-20 h-20 mx-auto mb-4 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
          <User className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-500 text-sm mt-1">Sistema de Gestión de Usuarios</p>
      </div>

      {/* Grid de dos columnas en desktop, una en mobile */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Columna izquierda: Componente PerfilUsuario */}
          <PerfilUsuario 
            usuario={usuario}
            loading={loading}
            error={error}
            onRetry={fetchPerfil}
          />

          {/* Columna derecha: Bento para agregar usuarios */}
          <div>
            <AgregarUsuarioBento />
          </div>

        </div>

        {/* Lista de usuarios - Debajo de las dos cards */}
        <div className="mt-6">
          <ListaUsuarios />
        </div>
      </div>
    </div>
  )
}