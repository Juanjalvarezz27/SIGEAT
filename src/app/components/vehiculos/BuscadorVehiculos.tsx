"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Car, User, Hash } from 'lucide-react'

interface BuscadorVehiculosProps {
  onBuscar: (search: string, searchType: string) => void
  cargando: boolean
  busquedaActual: {
    termino: string
    tipo: string
  }
}

export default function BuscadorVehiculos({ onBuscar, cargando, busquedaActual }: BuscadorVehiculosProps) {
  const [terminoBusqueda, setTerminoBusqueda] = useState(busquedaActual.termino)
  const [tipoBusqueda, setTipoBusqueda] = useState(busquedaActual.tipo)
  const [tiempoEspera, setTiempoEspera] = useState<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sincronizar con cambios externos
  useEffect(() => {
    setTerminoBusqueda(busquedaActual.termino)
    setTipoBusqueda(busquedaActual.tipo)
  }, [busquedaActual])

  // Función para manejar cambios en el input
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevoTermino = e.target.value
    setTerminoBusqueda(nuevoTermino)

    // Cancelar el timer anterior si existe
    if (tiempoEspera) {
      clearTimeout(tiempoEspera)
    }

    // Si está vacío, buscar inmediatamente
    if (nuevoTermino.trim() === '') {
      onBuscar('', tipoBusqueda)
      return
    }

    // Configurar un nuevo timer para buscar después de 500ms sin escribir
    const nuevoTimer = setTimeout(() => {
      // Solo buscar si tiene al menos 3 caracteres
      if (nuevoTermino.length >= 3) {
        onBuscar(nuevoTermino, tipoBusqueda)
      }
    }, 500)

    setTiempoEspera(nuevoTimer)
  }, [tiempoEspera, tipoBusqueda, onBuscar])

  // Función para manejar cambio de tipo
  const handleTipoChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoTipo = e.target.value
    setTipoBusqueda(nuevoTipo)
    
    // Si hay término de búsqueda, ejecutar búsqueda con el nuevo tipo
    if (terminoBusqueda.trim() !== '') {
      onBuscar(terminoBusqueda, nuevoTipo)
    }
  }, [terminoBusqueda, onBuscar])

  // Ejecutar búsqueda cuando se presiona Enter
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && terminoBusqueda.trim() !== '') {
      // Cancelar cualquier timer pendiente
      if (tiempoEspera) {
        clearTimeout(tiempoEspera)
        setTiempoEspera(null)
      }
      
      // Ejecutar búsqueda inmediatamente
      onBuscar(terminoBusqueda, tipoBusqueda)
    }
  }, [terminoBusqueda, tipoBusqueda, tiempoEspera, onBuscar])

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (tiempoEspera) {
        clearTimeout(tiempoEspera)
      }
    }
  }, [tiempoEspera])

  const handleLimpiar = useCallback(() => {
    setTerminoBusqueda('')
    
    // Cancelar timer si existe
    if (tiempoEspera) {
      clearTimeout(tiempoEspera)
      setTiempoEspera(null)
    }
    
    // Ejecutar búsqueda inmediatamente (vacía)
    onBuscar('', tipoBusqueda)
    
    // Enfocar el input
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [tiempoEspera, tipoBusqueda, onBuscar])

  const getPlaceholder = useCallback(() => {
    switch (tipoBusqueda) {
      case 'placa':
        return 'Ej: ABC123, XYZ789...'
      case 'nombre':
        return 'Ej: Juan Pérez, María García...'
      case 'cedula':
        return 'Ej: V12345678, E87654321...'
      default:
        return 'Buscar...'
    }
  }, [tipoBusqueda])

  const getTipoTexto = useCallback(() => {
    switch (tipoBusqueda) {
      case 'placa':
        return 'Placa'
      case 'nombre':
        return 'Nombre'
      case 'cedula':
        return 'Cédula'
      default:
        return 'Placa'
    }
  }, [tipoBusqueda])

  // Calcular si debería mostrar el indicador de búsqueda pendiente
  const mostrarBusquedaPendiente = terminoBusqueda.length > 0 && terminoBusqueda.length < 3

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-1">
            <Search className="h-5 w-5 mr-2 text-blue-500 shrink-0" />
            Buscar en los registros
          </h3>
          <p className="text-sm text-gray-600">
            Escribe para buscar - La búsqueda se ejecuta automáticamente después de 500ms
          </p>
        </div>
      </div>

      {/* Barra de búsqueda principal */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Select tipo de búsqueda */}
          <div className="relative shrink-0 w-full sm:w-48">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {tipoBusqueda === 'placa' && <Car className="h-4 w-4 text-gray-400" />}
              {tipoBusqueda === 'nombre' && <User className="h-4 w-4 text-gray-400" />}
              {tipoBusqueda === 'cedula' && <Hash className="h-4 w-4 text-gray-400" />}
            </div>
            <select
              value={tipoBusqueda}
              onChange={handleTipoChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              disabled={cargando}
            >
              <option value="placa">Placa</option>
              <option value="nombre">Nombre</option>
              <option value="cedula">Cédula</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Input de búsqueda */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={terminoBusqueda}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholder()}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={cargando}
            />
            {terminoBusqueda && (
              <button
                type="button"
                onClick={handleLimpiar}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Limpiar búsqueda"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Contador de caracteres y estado */}
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-gray-500">
            {terminoBusqueda.length > 0 && (
              <>
                Buscando por <span className="font-medium">{getTipoTexto()}</span>
                {mostrarBusquedaPendiente && (
                  <span className="text-amber-600 ml-1">
                    (escribe al menos 3 caracteres para buscar)
                  </span>
                )}
              </>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {terminoBusqueda.length > 0 && (
              <span className="text-blue-600">
                {terminoBusqueda.length} caracter{terminoBusqueda.length !== 1 ? 'es' : ''}
                {mostrarBusquedaPendiente && ' (mínimo 3)'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Indicador de búsqueda en curso */}
      {cargando && (
        <div className="flex items-center justify-center p-3 bg-blue-50 border border-blue-200 rounded-xl mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-700 font-medium">Buscando...</span>
          </div>
        </div>
      )}

      {/* Indicador de búsqueda pendiente (menos de 3 caracteres) */}
      {mostrarBusquedaPendiente && !cargando && (
        <div className="flex items-center justify-center p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <span className="text-sm text-amber-700">
              Escribe al menos 3 caracteres para buscar automáticamente
            </span>
          </div>
        </div>
      )}

      {/* Información de búsqueda actual */}
      {terminoBusqueda.length >= 3 && !cargando && busquedaActual.termino === terminoBusqueda && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                Mostrando resultados para: "<span className="font-medium">{terminoBusqueda}</span>"
              </span>
            </div>
            <button
              onClick={handleLimpiar}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Limpiar búsqueda
            </button>
          </div>
        </div>
      )}
    </div>
  )
}