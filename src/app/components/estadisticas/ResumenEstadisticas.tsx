"use client"

import { Car, DollarSign, TrendingUp, Users, Calendar, Clock, PieChart } from 'lucide-react'

interface ResumenEstadisticasProps {
  estadisticas: {
    totalRegistros: number
    totalIngresos: number
    ingresosBs: number
    promedioPorVehiculo: number
    vehiculosPorDia: number
    fechaInicio: string
    fechaFin: string
    totalDias: number
    registrosPorTipo: Array<{ tipo: string; cantidad: number; porcentaje: number }>
  }
  cargando: boolean
}

export default function ResumenEstadisticas({ estadisticas, cargando }: ResumenEstadisticasProps) {
  if (cargando) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4 md:mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 md:h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
      {/* Encabezado con rango de fechas - VERSIÓN MEJORADA */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-3 md:mb-3">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-500 shrink-0" />
              Resumen de Estadísticas
            </h3>
            
            {/* NUEVO DISEÑO PARA INFORMACIÓN DE FECHAS */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 md:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                {/* Fecha Inicio */}
                <div className="flex items-center bg-white p-2 rounded-lg border border-gray-200 flex-1 min-w-0">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 mb-0.5">Desde</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {estadisticas.fechaInicio}
                    </p>
                  </div>
                </div>
                
                {/* Flecha - solo visible en tablet/desktop */}
                <div className="hidden sm:flex items-center justify-center text-gray-300">
                  <span className="text-lg">→</span>
                </div>
                
                {/* Fecha Fin */}
                <div className="flex items-center bg-white p-2 rounded-lg border border-gray-200 flex-1 min-w-0">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 mb-0.5">Hasta</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {estadisticas.fechaFin}
                    </p>
                  </div>
                </div>
                
                {/* Total Días */}
                <div className="flex items-center bg-blue-50 p-2 rounded-lg border border-blue-100">
                  <Clock className="h-4 w-4 text-blue-500 mr-2 shrink-0" />
                  <div>
                    <p className="text-xs text-blue-600 mb-0.5">Período</p>
                    <p className="text-sm font-semibold text-blue-700">
                      {estadisticas.totalDias} día(s)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {/* Tarjeta 1: Total Vehículos */}
        <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-blue-700 font-medium truncate">Total Vehículos</p>
              <p className="text-xl md:text-2xl font-bold text-blue-900 mt-1 truncate">
                {estadisticas.totalRegistros.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center shrink-0 ml-2">
              <Car className="h-5 w-5 text-blue-700" />
            </div>
          </div>
          <div className="mt-3 text-xs text-blue-600 truncate">
            {estadisticas.vehiculosPorDia.toFixed(1)} por día
          </div>
        </div>

        {/* Tarjeta 2: Total USD */}
        <div className="bg-linear-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-green-700 font-medium truncate">Total USD</p>
              <p className="text-xl md:text-2xl font-bold text-green-900 mt-1 truncate">
                ${estadisticas.totalIngresos.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center shrink-0 ml-2">
              <DollarSign className="h-5 w-5 text-green-700" />
            </div>
          </div>
          <div className="mt-3 text-xs text-green-600 truncate">
            ${estadisticas.promedioPorVehiculo.toFixed(2)} por vehículo
          </div>
        </div>

        {/* Tarjeta 3: Total Bs */}
        <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-purple-700 font-medium truncate">Total Bs</p>
              <p className="text-xl md:text-2xl font-bold text-purple-900 mt-1 truncate">
                Bs {estadisticas.ingresosBs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center shrink-0 ml-2">
              <DollarSign className="h-5 w-5 text-purple-700" />
            </div>
          </div>
          <div className="mt-3 text-xs text-purple-600 truncate">
            En moneda nacional
          </div>
        </div>

        {/* Tarjeta 4: Promedio USD */}
        <div className="bg-linear-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-orange-700 font-medium truncate">Promedio USD</p>
              <p className="text-xl md:text-2xl font-bold text-orange-900 mt-1 truncate">
                ${estadisticas.promedioPorVehiculo.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-200 rounded-lg flex items-center justify-center shrink-0 ml-2">
              <TrendingUp className="h-5 w-5 text-orange-700" />
            </div>
          </div>
          <div className="mt-3 text-xs text-orange-600 truncate">
            Por vehículo atendido
          </div>
        </div>
      </div>

      {/* Distribución por tipo de vehículo */}
      {estadisticas.registrosPorTipo.length > 0 && (
        <div className="border-t border-gray-200 pt-4 md:pt-6">
          <h4 className="text-base font-semibold text-gray-900 mb-3 md:mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-gray-500 shrink-0" />
            Distribución por Tipo de Vehículo
          </h4>
          <div className="space-y-2 md:space-y-3">
            {estadisticas.registrosPorTipo.map((item, index) => (
              <div key={index} className="space-y-1 md:space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 truncate mr-2">{item.tipo}</span>
                  <span className="font-medium text-gray-900 whitespace-nowrap">
                    {item.cantidad.toLocaleString()} ({item.porcentaje.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2">
                  <div
                    className="bg-blue-500 h-1.5 md:h-2 rounded-full transition-all duration-500"
                    style={{ width: `${item.porcentaje}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}