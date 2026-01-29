"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Car, User, Hash, X, Loader2, ChevronDown } from 'lucide-react'

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
        return 'Ej: ABC123, XYZ...'
      case 'nombre':
        return 'Ej: Juan Pérez...'
      case 'cedula':
        return 'Ej: 12345678...'
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
    <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-[#869dfc]/10 p-5 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-2">
        <div className="flex-1">
          <h3 className="text-lg font-black text-[#140f07] flex items-center gap-2">
            <div className="p-1.5 bg-[#e2e2f6] rounded-lg">
                <Search className="h-4 w-4 text-[#4260ad]" />
            </div>
            Filtrar Registros
          </h3>
          <p className="text-xs font-medium text-slate-500 mt-1 ml-1">
            Busca por placa, nombre o documento
          </p>
        </div>
      </div>

      {/* Barra de búsqueda principal */}
      <div className="mb-2">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Select tipo de búsqueda */}
          <div className="relative shrink-0 w-full sm:w-44">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              {tipoBusqueda === 'placa' && <Car className="h-4 w-4 text-[#4260ad]" />}
              {tipoBusqueda === 'nombre' && <User className="h-4 w-4 text-[#4260ad]" />}
              {tipoBusqueda === 'cedula' && <Hash className="h-4 w-4 text-[#4260ad]" />}
            </div>
            <select
              value={tipoBusqueda}
              onChange={handleTipoChange}
              className="w-full pl-10 pr-8 py-3.5 bg-[#f4f6fc] border border-transparent rounded-xl focus:bg-white focus:border-[#869dfc] focus:ring-0 text-[#122a4e] font-bold text-sm appearance-none transition-all outline-none"
              disabled={cargando}
            >
              <option value="placa">Placa</option>
              <option value="nombre">Nombre</option>
              <option value="cedula">Cédula</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Input de búsqueda */}
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#4260ad] transition-colors" />
            <input
              ref={inputRef}
              type="text"
              value={terminoBusqueda}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholder()}
              className="w-full pl-11 pr-10 py-3.5 bg-[#f4f6fc] border border-transparent rounded-xl focus:bg-white focus:border-[#869dfc] focus:ring-0 text-[#140f07] placeholder-slate-400 font-medium outline-none transition-all"
              disabled={cargando}
            />
            {terminoBusqueda && (
              <button
                type="button"
                onClick={handleLimpiar}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-slate-400 hover:text-[#4260ad] hover:bg-[#e2e2f6] rounded-full transition-all"
                title="Limpiar búsqueda"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Contador de caracteres y estado */}
        <div className="flex items-center justify-between mt-3 px-1">
          <div className="text-xs font-medium">
            {terminoBusqueda.length > 0 && (
              <span className="flex items-center gap-1.5 text-[#122a4e]/70">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4260ad]"></span>
                Buscando por <span className="font-bold text-[#122a4e] uppercase">{getTipoTexto()}</span>
                {mostrarBusquedaPendiente && (
                  <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded ml-1">
                    Mínimo 3 caracteres
                  </span>
                )}
              </span>
            )}
          </div>
          <div className="text-xs font-medium text-slate-400">
            {terminoBusqueda.length > 0 && (
              <span>
                {terminoBusqueda.length} chars
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Indicador de búsqueda en curso */}
      {cargando && (
        <div className="flex items-center justify-center p-3 bg-[#e2e2f6] border border-[#869dfc]/20 rounded-xl mb-2 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 text-[#4260ad] animate-spin" />
            <span className="text-sm text-[#122a4e] font-bold">Buscando resultados...</span>
          </div>
        </div>
      )}

      {/* Información de búsqueda actual (Resultados encontrados) */}
      {terminoBusqueda.length >= 3 && !cargando && busquedaActual.termino === terminoBusqueda && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-2 flex justify-between items-center animate-in fade-in slide-in-from-top-1">
           <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium">
              <Search className="h-4 w-4" />
              <span>Resultados para "<span className="font-bold">{terminoBusqueda}</span>"</span>
           </div>
           <button
              onClick={handleLimpiar}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-800 hover:underline px-2"
            >
              Limpiar
            </button>
        </div>
      )}
    </div>
  )
}