"use client"

import { useState, useEffect } from 'react'
import { Car, Calendar, DollarSign, Plus, X, RefreshCw } from 'lucide-react'
import ListaRegistros from '../components/registro-vehiculo/ListaRegistros'
import FormularioRegistro from '../components/registro-vehiculo/FormularioRegistro'
import useTasaBCV from '../hooks/useTasaBCV'
import { toast } from 'react-toastify'

export default function HomeDashboard() {
  const { tasa, loading: loadingTasa, error: errorTasa, actualizar: actualizarTasa } = useTasaBCV()
  const [refreshKey, setRefreshKey] = useState(0)
  
  // 1. Simplificamos el estado: Solo guardamos los datos origen, NO el cálculo
  const [estadisticas, setEstadisticas] = useState({
    totalRegistros: 0,
    totalIngresos: 0
  })
  
  const [modalAbierto, setModalAbierto] = useState(false)

  // 2. Calculamos los Bs. en tiempo real (Derived State)
  // Esto garantiza que siempre esté sincronizado, sin importar qué cargue primero
  const totalIngresosBs = tasa ? estadisticas.totalIngresos * tasa : 0

  const handleRegistroCreado = () => {
    setRefreshKey(prev => prev + 1)
    toast.success('¡Vehículo registrado con éxito!', {
      position: "top-right",
      autoClose: 3000,
    })
    setModalAbierto(false)
  }

  // 3. Simplificamos el manejador: Solo actualiza los datos crudos
  const handleRegistrosChange = (nuevasEstadisticas: { totalRegistros: number; totalIngresos: number }) => {
    setEstadisticas(nuevasEstadisticas)
  }

  const getFechaActual = () => {
    const fecha = new Date().toLocaleDateString('es-VE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Caracas'
    })
    return fecha.charAt(0).toUpperCase() + fecha.slice(1)
  }

  // 4. Eliminamos el useEffect que escuchaba [tasa], ya no es necesario.

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
        
        {/* Header Compacto */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="shrink-0 bg-[#122a4e] text-white p-2.5 rounded-xl shadow-md shadow-[#122a4e]/20">
            <Car className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-black text-[#140f07] leading-tight">
              Registro de Vehículos
            </h1>
            <div className="flex items-center text-xs font-semibold text-[#122a4e]/60 mt-0.5">
              <Calendar className="h-3 w-3 mr-1.5" />
              <span>{getFechaActual()}</span>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          
          {/* Tarjeta 1: Tasa BCV */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#869dfc]/10 flex flex-col justify-between min-h-25">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] sm:text-xs font-bold text-[#122a4e] bg-[#f4f6fc] px-1.5 py-0.5 rounded">BCV</span>
              <button onClick={actualizarTasa} disabled={loadingTasa} className="text-[#4260ad] hover:bg-slate-50 rounded-full p-1 transition-colors">
                <RefreshCw className={`h-3.5 w-3.5 ${loadingTasa ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="mt-auto">
              {loadingTasa ? (
                <div className="h-6 w-16 bg-gray-100 animate-pulse rounded"></div>
              ) : errorTasa ? (
                <span className="text-xs text-red-500 font-medium">Error de conexión</span>
              ) : tasa ? (
                <p className="text-xl sm:text-2xl font-black text-[#140f07]">Bs {tasa.toFixed(2)}</p>
              ) : (
                <span className="text-xs text-yellow-600 font-medium">No disponible</span>
              )}
            </div>
          </div>

          {/* Tarjeta 2: Total USD */}
          <div className="bg-[#122a4e] rounded-2xl p-4 shadow-lg shadow-[#122a4e]/20 relative overflow-hidden group min-h-25 flex flex-col justify-end">
            <DollarSign className="absolute -right-2 -top-2 h-20 w-20 text-white/5 rotate-12" />
            <div className="relative z-10">
              <p className="text-[#869dfc] font-bold text-[10px] sm:text-xs uppercase tracking-wider mb-1">Total USD</p>
              <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                ${estadisticas.totalIngresos.toFixed(2)}
              </h3>
            </div>
          </div>

          {/* Tarjeta 3: Total Bs (CORREGIDA) */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#869dfc]/10 flex flex-col justify-end min-h-25">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#122a4e]"></div>
              <p className="text-[#122a4e]/60 font-bold text-[10px] sm:text-xs uppercase tracking-wider">Total Bs</p>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#140f07] truncate" title={totalIngresosBs.toLocaleString('es-VE')}>
              {/* Usamos la variable calculada al vuelo */}
              {loadingTasa 
                ? 'Calculando...' 
                : totalIngresosBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              }
            </h3>
          </div>

          {/* Tarjeta 4: Vehículos */}
          <div className="bg-[#4260ad] rounded-2xl p-4 shadow-md shadow-[#4260ad]/20 relative overflow-hidden min-h-25 flex flex-col justify-end">
            <Car className="absolute -right-2 -bottom-2 h-16 w-16 text-white/10 -rotate-12" />
            <div className="relative z-10">
              <p className="text-white/80 font-bold text-[10px] sm:text-xs uppercase tracking-wider mb-1">Vehículos</p>
              <h3 className="text-3xl sm:text-4xl font-black text-white">
                {estadisticas.totalRegistros}
              </h3>
            </div>
          </div>

        </div>

        {/* Lista de Registros */}
        <div className="mb-20">
          <ListaRegistros 
            refreshKey={refreshKey}
            onRegistrosChange={handleRegistrosChange}
          />
        </div>
      </div>

      {/* Botón flotante */}
      <button
        onClick={() => setModalAbierto(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#122a4e] text-white rounded-2xl flex items-center justify-center shadow-xl shadow-[#122a4e]/40 hover:bg-[#4260ad] hover:scale-105 transition-all duration-300 active:scale-95"
        aria-label="Nuevo registro"
      >
        <Plus className="h-7 w-7" />
      </button>

      {/* Modal */}
      {modalAbierto && (
        <div 
          className="fixed inset-0 z-60 bg-[#122a4e]/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => setModalAbierto(false)}
        >
          <div 
            className="bg-[#f8f9fc] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-white/20 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-white px-5 py-4 border-b border-[#122a4e]/5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#e2e2f6] rounded-lg flex items-center justify-center shrink-0">
                  <Car className="h-4 w-4 text-[#122a4e]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#140f07]">Nuevo Registro</h2>
                </div>
              </div>
              <button
                onClick={() => setModalAbierto(false)}
                className="p-1.5 rounded-lg hover:bg-[#e2e2f6] text-[#122a4e]/50 hover:text-[#122a4e] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-70px)] bg-[#f8f9fc]">
              <div className="p-5">
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