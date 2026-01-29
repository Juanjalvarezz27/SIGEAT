"use client"

import { Car, DollarSign, TrendingUp, CalendarRange, PieChart } from 'lucide-react'

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
      <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-[#869dfc]/10 p-5 md:p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex justify-between items-center">
             <div className="h-8 bg-slate-100 rounded-xl w-1/3"></div>
             <div className="h-8 bg-slate-100 rounded-xl w-1/4"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-slate-100 rounded-2xl"></div>
            ))}
          </div>
          <div className="h-40 bg-slate-50 rounded-2xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-[#869dfc]/10 p-5 md:p-6">
      
      {/* Encabezado */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-[#140f07] flex items-center gap-2">
              <div className="p-1.5 bg-[#e2e2f6] rounded-lg">
                 <TrendingUp className="h-5 w-5 text-[#4260ad]" />
              </div>
              Resumen de Estadísticas
            </h3>
            <p className="text-sm font-medium text-slate-500 mt-1 ml-1">
              Indicadores clave de rendimiento
            </p>
          </div>
          
          {/* Rango de Fechas */}
          <div className="bg-[#f8f9fc] border border-slate-100 rounded-2xl p-3 flex items-center gap-3 shadow-sm">
            <div className="p-2 bg-white rounded-xl border border-slate-100 text-[#4260ad]">
               <CalendarRange className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Período Seleccionado</span>
               <div className="flex items-center gap-2 text-sm font-bold text-[#140f07]">
                  <span>{estadisticas.fechaInicio}</span>
                  <span className="text-slate-300">→</span>
                  <span>{estadisticas.fechaFin}</span>
                  <span className="ml-2 px-2 py-0.5 bg-[#122a4e] text-white text-[10px] rounded-md">
                    {estadisticas.totalDias} días
                  </span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Tarjeta 1: Total USD (Principal) */}
        <div className="bg-[#122a4e] rounded-2xl p-5 relative overflow-hidden group shadow-lg shadow-[#122a4e]/20">
          <div className="relative z-10 flex flex-col justify-between h-full min-h-27.5">
             <div className="flex justify-between items-start">
                <span className="text-[#869dfc] text-xs font-bold uppercase tracking-wider">Total Ingresos</span>
                <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                   <DollarSign className="h-4 w-4 text-white" />
                </div>
             </div>
             <div>
                <h4 className="text-3xl font-black text-white tracking-tight">
                  ${estadisticas.totalIngresos.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h4>
                <p className="text-white/40 text-xs font-medium mt-1">Facturación total en USD</p>
             </div>
          </div>
          <DollarSign className="absolute -right-4 -bottom-4 h-24 w-24 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-500" />
        </div>

        {/* Tarjeta 2: Total Bs */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:border-[#869dfc]/30 transition-colors relative overflow-hidden group">
          <div className="relative z-10 flex flex-col justify-between h-full min-h-27.5">
             <div className="flex justify-between items-start">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Bolívares</span>
                <div className="p-1.5 bg-[#f4f6fc] rounded-lg">
                   <span className="text-xs font-bold text-[#140f07]">Bs</span>
                </div>
             </div>
             <div>
                <h4 className="text-2xl font-black text-[#140f07] tracking-tight">
                  {estadisticas.ingresosBs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h4>
                <p className="text-slate-400 text-xs font-medium mt-1">Equivalente a tasa del día</p>
             </div>
          </div>
        </div>

        {/* Tarjeta 3: Total Vehículos */}
        <div className="bg-[#4260ad] rounded-2xl p-5 relative overflow-hidden group shadow-lg shadow-[#4260ad]/20">
          <div className="relative z-10 flex flex-col justify-between h-full min-h-27.5">
             <div className="flex justify-between items-start">
                <span className="text-white/80 text-xs font-bold uppercase tracking-wider">Vehículos</span>
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                   <Car className="h-4 w-4 text-white" />
                </div>
             </div>
             <div>
                <h4 className="text-3xl font-black text-white tracking-tight">
                  {estadisticas.totalRegistros.toLocaleString()}
                </h4>
                <p className="text-white/60 text-xs font-medium mt-1">Total registrados</p>
             </div>
          </div>
          <Car className="absolute -right-4 -bottom-4 h-24 w-24 text-white/10 -rotate-12 group-hover:scale-110 transition-transform duration-500" />
        </div>

        {/* Tarjeta 4: Promedio Ticket */}
        <div className="bg-[#f8f9fc] border border-slate-100 rounded-2xl p-5 relative overflow-hidden">
          <div className="relative z-10 flex flex-col justify-between h-full min-h-27.5">
             <div className="flex justify-between items-start">
                <span className="text-[#4260ad] text-xs font-bold uppercase tracking-wider">Ticket Promedio</span>
                <div className="p-1.5 bg-white rounded-lg shadow-sm">
                   <TrendingUp className="h-4 w-4 text-[#4260ad]" />
                </div>
             </div>
             <div>
                <h4 className="text-2xl font-black text-[#140f07] tracking-tight">
                  ${estadisticas.promedioPorVehiculo.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h4>
                <p className="text-slate-400 text-xs font-medium mt-1">Por vehículo</p>
             </div>
          </div>
        </div>
      </div>

      {/* Distribución por tipo */}
      {estadisticas.registrosPorTipo.length > 0 && (
        <div className="border-t border-slate-100 pt-6">
          <h4 className="text-sm font-bold text-[#140f07] mb-5 flex items-center gap-2 uppercase tracking-wider">
            <PieChart className="h-4 w-4 text-[#4260ad]" />
            Distribución por Tipo
          </h4>
          <div className="space-y-4">
            {estadisticas.registrosPorTipo.map((item, index) => (
              <div key={index} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                     <span className="text-[#140f07] font-bold">{item.tipo}</span>
                     <span className="text-xs text-slate-400 font-medium">({item.cantidad} vehículos)</span>
                  </div>
                  <span className="font-bold text-[#4260ad]">
                    {item.porcentaje.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-[#f4f6fc] rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-[#4260ad] h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(66,96,173,0.3)]"
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