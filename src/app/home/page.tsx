"use client"

import { useState, useEffect } from 'react'
import { Car, Calendar, DollarSign, Plus, X } from 'lucide-react'
import ListaRegistros from '../components/registro-vehiculo/ListaRegistros'
import FormularioRegistro from '../components/registro-vehiculo/FormularioRegistro'
import useTasaBCV from '../hooks/useTasaBCV'
import { toast } from 'react-toastify'

export default function HomeDashboard() {
  const { tasa, loading: loadingTasa, error: errorTasa, actualizar: actualizarTasa } = useTasaBCV()
  const [refreshKey, setRefreshKey] = useState(0)
  const [estadisticas, setEstadisticas] = useState({
    totalRegistros: 0,
    totalIngresos: 0,
    totalIngresosBs: 0
  })
  const [modalAbierto, setModalAbierto] = useState(false)

  const handleRegistroCreado = () => {
    // Incrementar el contador para forzar actualización
    setRefreshKey(prev => prev + 1)
    
    // Mostrar notificación de éxito
    toast.success('¡Vehículo registrado con éxito!', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    })
    
    // Cerrar modal
    setModalAbierto(false)
  }

  const handleRegistrosChange = (nuevasEstadisticas: { totalRegistros: number; totalIngresos: number }) => {
    // Calcular total en bolívares si hay tasa
    const totalIngresosBs = tasa ? nuevasEstadisticas.totalIngresos * tasa : 0
    
    setEstadisticas({
      ...nuevasEstadisticas,
      totalIngresosBs
    })
  }

  const getFechaActual = () => {
    return new Date().toLocaleDateString('es-VE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Caracas'
    })
  }

  // Actualizar total en bolívares cuando cambia la tasa
  useEffect(() => {
    if (tasa) {
      setEstadisticas(prev => ({
        ...prev,
        totalIngresosBs: prev.totalIngresos * tasa
      }))
    }
  }, [tasa])

  // Cerrar modal con Escape key
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalAbierto) {
        setModalAbierto(false)
      }
    }

    window.addEventListener('keydown', handleEscKey)
    return () => window.removeEventListener('keydown', handleEscKey)
  }, [modalAbierto])

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Header principal */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 min-w-12 min-h-12 aspect-square bg-linear-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <Car className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Registro de Vehículos
              </h1>
              <p className="text-gray-600 mt-1 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {getFechaActual()}
              </p>
            </div>
          </div>

          {/* Estadísticas principales */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {/* Tarjeta de Tasa BCV */}
            <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">TASA BCV</p>
                  <div className="flex items-baseline mt-1">
                    {loadingTasa ? (
                      <div className="animate-pulse flex space-x-2">
                        <div className="h-5 sm:h-6 w-12 sm:w-16 bg-gray-200 rounded"></div>
                      </div>
                    ) : errorTasa ? (
                      <div className="text-red-600">
                        <p className="text-xs">Error</p>
                        <button
                          onClick={actualizarTasa}
                          className="text-xs text-blue-500 hover:text-blue-700"
                        >
                          Reintentar
                        </button>
                      </div>
                    ) : tasa ? (
                      <span className="text-lg sm:text-xl font-bold text-gray-900">Bs {tasa.toFixed(2)}</span>
                    ) : (
                      <span className="text-xs sm:text-sm font-semibold text-yellow-600">N/A</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={actualizarTasa}
                  disabled={loadingTasa}
                  className={`ml-2 p-1.5 sm:p-2 rounded-lg transition ${
                    loadingTasa
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                  aria-label="Actualizar tasa"
                >
                  <svg 
                    className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${loadingTasa ? 'animate-spin' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Tarjeta de Total Hoy USD */}
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-blue-700">TOTAL HOY $</p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600">
                    ${estadisticas.totalIngresos.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
              </div>
            </div>

            {/* Tarjeta de Total Hoy Bs */}
            <div className="bg-green-50 rounded-xl border border-green-100 p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-green-700">TOTAL HOY Bs</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">
                    Bs {estadisticas.totalIngresosBs.toFixed(2)}
                  </p>
                </div>
                <div className="text-green-400">
                  <svg className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Tarjeta de Vehículos Hoy */}
            <div className="bg-purple-50 rounded-xl border border-purple-100 p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-purple-700">VEHÍCULOS</p>
                  <p className="text-lg sm:text-2xl font-bold text-purple-600">
                    {estadisticas.totalRegistros}
                  </p>
                </div>
                <Car className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Sección Registros del Día - Sin box */}
        <div className="mb-8">

          
          {/* Lista de registros directamente, sin box contenedor */}
          <ListaRegistros 
            refreshKey={refreshKey}
            onRegistrosChange={handleRegistrosChange}
          />
        </div>
      </div>

      {/* Botón flotante para abrir formulario */}
      <button
        onClick={() => setModalAbierto(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 sm:w-16 sm:h-16 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 active:scale-95"
        aria-label="Nuevo registro"
      >
        <Plus className="h-6 w-6 sm:h-7 sm:w-7" />
      </button>

      {/* Overlay para el modal */}
      {modalAbierto && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setModalAbierto(false)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 min-w-10 min-h-10 aspect-square bg-linear-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <Car className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Nuevo Registro
                  </h2>
                  <p className="text-gray-600 mt-1 text-sm">Registra un nuevo vehículo</p>
                </div>
              </div>
              <button
                onClick={() => setModalAbierto(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Contenido del modal con scroll */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="p-4 sm:p-6">
                <FormularioRegistro 
                  onRegistroCreado={handleRegistroCreado}
                />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}