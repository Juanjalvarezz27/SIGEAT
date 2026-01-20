"use client"

import { DollarSign, Calculator, RefreshCw, TrendingUp, Clock, TrendingDown } from 'lucide-react'
import { MonederoData } from '../../types/monedero' 

interface CardsMonederoProps {
  tasa: number | null
  loadingTasa: boolean
  errorTasa: string | null
  data: MonederoData | null // Cambiar tipo
  loading: boolean
  refreshing: boolean
  onRefreshAll: () => void
  onActualizarTasa: () => void
  onAbrirFormulario: () => void
}
export default function CardsMonedero({
  tasa,
  loadingTasa,
  errorTasa,
  data,
  loading,
  refreshing,
  onRefreshAll,
  onActualizarTasa,
  onAbrirFormulario
}: CardsMonederoProps) {
  
  const formatBS = (num: number) => {
    return new Intl.NumberFormat('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num)
  }

  const formatUSD = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 h-32 animate-pulse"></div>
        ))}
      </div>
    )
  }

  const saldoActualUSD = tasa ? (data?.saldoActualBs || 0) / tasa : 0

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {/* Card 1: Tasa BCV */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">TASA BCV</p>
              <div className="flex items-baseline mt-1">
                {errorTasa ? (
                  <div className="text-red-600">
                    <p className="text-xs">Error</p>
                    <button
                      onClick={onActualizarTasa}
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
              onClick={onActualizarTasa}
              disabled={loadingTasa}
              className={`ml-2 p-1.5 sm:p-2 rounded-lg transition ${
                loadingTasa
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
              aria-label="Actualizar tasa"
            >
              <TrendingUp className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${loadingTasa ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              {loadingTasa ? 'Actualizando...' : 'Tasa del día'}
            </p>
          </div>
        </div>

        {/* Card 2: Saldo Actual */}
        <div className="bg-green-50 rounded-xl border border-green-100 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-green-700">SALDO ACTUAL</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600">
                Bs {data ? formatBS(data.saldoActualBs) : '0.00'}
              </p>
            </div>
            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
          </div>
          <div className="mt-4 pt-3 border-t border-green-200">
            <div className="text-xs text-green-600">
              {formatUSD(saldoActualUSD)}
            </div>
          </div>
        </div>

        {/* Card 3: Total Gastos */}
        <div className="bg-red-50 rounded-xl border border-red-100 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-red-700">TOTAL GASTOS</p>
              <p className="text-lg sm:text-2xl font-bold text-red-600">
                Bs {data ? formatBS(data.totalGastosBs) : '0.00'}
              </p>
            </div>
            <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-red-400" />
          </div>
          <div className="mt-4 pt-3 border-t border-red-200">
            <div className="text-xs text-red-600">
              {data?.cantidadGastos || 0} gastos
            </div>
          </div>
        </div>

        {/* Card 4: Información */}
        <div className="bg-purple-50 rounded-xl border border-purple-100 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-purple-700">ÚLTIMA ACT.</p>
              <p className="text-lg sm:text-xl font-bold text-purple-600">
                {data?.fechaCalculo ? new Date(data.fechaCalculo).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }) : '--:--'}
              </p>
            </div>
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
          </div>
          <div className="mt-4 pt-3 border-t border-purple-200">
            <button
              onClick={onRefreshAll}
              disabled={refreshing}
              className="flex items-center text-xs text-purple-600 hover:text-purple-700"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </div>
      </div>

      {/* Botón para registrar gasto */}
      <div className="mb-6">
        <button
          onClick={onAbrirFormulario}
          className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
        >
          <span className="font-medium">Registrar Nuevo Gasto</span>
          <Calculator className="h-5 w-5" />
        </button>
      </div>
    </>
  )
}