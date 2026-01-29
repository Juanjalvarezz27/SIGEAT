"use client"

import { DollarSign, Calculator, RefreshCw, TrendingUp, Clock, TrendingDown, Wallet } from 'lucide-react'
import { MonederoData } from '../../types/monedero' 

interface CardsMonederoProps {
  tasa: number | null
  loadingTasa: boolean
  errorTasa: string | null
  data: MonederoData | null
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-3xl border border-slate-100 p-5 h-40 animate-pulse">
             <div className="h-8 w-8 bg-slate-200 rounded-lg mb-4"></div>
             <div className="h-6 w-24 bg-slate-200 rounded mb-2"></div>
             <div className="h-8 w-32 bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  const saldoActualUSD = tasa ? (data?.saldoActualBs || 0) / tasa : 0

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Card 1: Saldo Actual (Destacada) */}
        <div className="bg-[#122a4e] rounded-3xl p-5 relative overflow-hidden shadow-lg shadow-[#122a4e]/20 group sm:col-span-2 lg:col-span-1 order-1">
          <div className="relative z-10 flex flex-col justify-between h-full min-h-35">
            <div className="flex justify-between items-start">
               <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                  <Wallet className="h-5 w-5 text-white" />
               </div>
               <span className="text-[#869dfc] text-xs font-bold uppercase tracking-wider bg-[#122a4e]/50 px-2 py-1 rounded-lg">Saldo Disponible</span>
            </div>
            <div>
               <p className="text-3xl font-black text-white tracking-tight mb-1">
                 Bs {data ? formatBS(data.saldoActualBs) : '0.00'}
               </p>
               <div className="flex items-center gap-2">
                  <span className="text-white/60 text-sm font-medium">Equivalente:</span>
                  <span className="text-white font-bold text-sm bg-white/10 px-2 py-0.5 rounded">
                    {formatUSD(saldoActualUSD)}
                  </span>
               </div>
            </div>
          </div>
          {/* Fondo Decorativo */}
          <div className="absolute -right-4 -bottom-4 bg-[#4260ad] w-24 h-24 rounded-full opacity-20 blur-2xl group-hover:opacity-30 transition-opacity"></div>
        </div>

        {/* Card 2: Tasa BCV */}
        <div className="bg-white rounded-3xl border border-[#869dfc]/10 p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:border-[#869dfc]/30 transition-colors order-2">
          <div className="flex flex-col justify-between h-full min-h-35">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#f4f6fc] rounded-xl text-[#122a4e]">
                     <TrendingUp className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tasa BCV</span>
               </div>
               <button
                  onClick={onActualizarTasa}
                  disabled={loadingTasa}
                  className="p-1.5 text-[#4260ad] hover:bg-[#e2e2f6] rounded-lg transition-colors"
               >
                  <RefreshCw className={`h-4 w-4 ${loadingTasa ? 'animate-spin' : ''}`} />
               </button>
            </div>
            
            <div>
               {errorTasa ? (
                  <div className="text-red-500 text-sm font-medium">Error de conexión</div>
               ) : tasa ? (
                  <p className="text-2xl font-black text-[#140f07]">Bs {tasa.toFixed(2)}</p>
               ) : (
                  <p className="text-xl font-bold text-amber-500">No disponible</p>
               )}
               <p className="text-xs text-slate-400 font-medium mt-1">Valor actual del dólar</p>
            </div>
          </div>
        </div>

        {/* Card 3: Total Gastos */}
        <div className="bg-white rounded-3xl border border-red-100 p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative overflow-hidden order-3">
           <div className="relative z-10 flex flex-col justify-between h-full min-h-35">
              <div className="flex items-center gap-2">
                 <div className="p-2 bg-red-50 rounded-xl text-red-500">
                    <TrendingDown className="h-5 w-5" />
                 </div>
                 <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Total Gastos</span>
              </div>
              
              <div>
                 <p className="text-2xl font-black text-[#140f07]">Bs {data ? formatBS(data.totalGastosBs) : '0.00'}</p>
                 <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                       {data?.cantidadGastos || 0} movimientos
                    </span>
                 </div>
              </div>
           </div>
        </div>

        {/* Card 4: Información / Actualizar */}
        <div className="bg-[#f8f9fc] rounded-3xl border border-slate-200 p-5 flex flex-col justify-between h-full min-h-35 order-4">
           <div className="flex items-center gap-2">
              <div className="p-2 bg-white rounded-xl text-slate-400 shadow-sm">
                 <Clock className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</span>
           </div>
           
           <div>
              <p className="text-sm font-bold text-[#140f07] mb-3">
                 Última actualización: <br/>
                 <span className="text-[#4260ad] font-mono text-xs">
                    {data?.fechaCalculo ? new Date(data.fechaCalculo).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) : '--:--'}
                 </span>
              </p>
              <button
                onClick={onRefreshAll}
                disabled={refreshing}
                className="w-full py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#4260ad] hover:border-[#4260ad] transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                 <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
                 {refreshing ? 'Actualizando...' : 'Actualizar Datos'}
              </button>
           </div>
        </div>

      </div>

      {/* Botón para registrar gasto (Floating Action Button style or Full Width) */}
      <div className="mb-8">
        <button
          onClick={onAbrirFormulario}
          className="group w-full py-4 bg-[#e2e2f6] hover:bg-[#d0d6f5] text-[#122a4e] rounded-2xl transition-all duration-300 border border-[#869dfc]/20 flex items-center justify-center gap-3 shadow-sm hover:shadow-md active:scale-[0.99]"
        >
          <div className="bg-white p-2 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
             <Calculator className="h-6 w-6 text-[#4260ad]" />
          </div>
          <div className="text-left">
             <span className="block text-sm font-bold text-[#122a4e]">Registrar Nuevo Gasto</span>
             <span className="block text-xs font-medium text-[#122a4e]/60">Calculadora y conversión automática</span>
          </div>
        </button>
      </div>
    </>
  )
}