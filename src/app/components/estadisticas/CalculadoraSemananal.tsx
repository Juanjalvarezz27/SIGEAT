"use client"

import { useState, useEffect } from 'react'
import { Calculator, DollarSign, Users, Percent, RefreshCw, Briefcase, User, Wallet } from 'lucide-react'
import useTasaBCV from '../../hooks/useTasaBCV'

interface CalculadoraSemananalProps {
  totalSemanaUSD: number
  cargando: boolean
}

export default function CalculadoraSemananal({ totalSemanaUSD, cargando }: CalculadoraSemananalProps) {
  const { tasa, loading: loadingTasa, actualizar, ultimaActualizacion } = useTasaBCV()
  const [numTrabajadores, setNumTrabajadores] = useState<number>(1)
  const [totalSemanaBS, setTotalSemanaBS] = useState<number>(0)
  const [porcentajeDistribuir, setPorcentajeDistribuir] = useState<number>(30)
  const [totalDistribuirBS, setTotalDistribuirBS] = useState<number>(0)
  const [totalDistribuirUSD, setTotalDistribuirUSD] = useState<number>(0)
  const [porPersonaBS, setPorPersonaBS] = useState<number>(0)
  const [porPersonaUSD, setPorPersonaUSD] = useState<number>(0)

  // Calcular todos los valores cuando cambia la tasa o el total en USD
  useEffect(() => {
    if (tasa !== null && totalSemanaUSD > 0) {
      // Calcular total en Bs
      const totalBS = totalSemanaUSD * tasa
      setTotalSemanaBS(totalBS)
      
      // Calcular el porcentaje seleccionado
      const porcentaje = porcentajeDistribuir / 100
      const distribuirBS = totalBS * porcentaje
      const distribuirUSD = totalSemanaUSD * porcentaje
      
      setTotalDistribuirBS(distribuirBS)
      setTotalDistribuirUSD(distribuirUSD)
      
      // Calcular por persona
      if (numTrabajadores > 0) {
        setPorPersonaBS(distribuirBS / numTrabajadores)
        setPorPersonaUSD(distribuirUSD / numTrabajadores)
      } else {
        setPorPersonaBS(0)
        setPorPersonaUSD(0)
      }
    } else {
      // Resetear valores
      setTotalSemanaBS(0)
      setTotalDistribuirBS(0)
      setTotalDistribuirUSD(0)
      setPorPersonaBS(0)
      setPorPersonaUSD(0)
    }
  }, [tasa, totalSemanaUSD, numTrabajadores, porcentajeDistribuir])

  // Formatear números
  const formatNumber = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat('es-VE', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num)
  }

  const formatFechaActualizacion = () => {
    if (!ultimaActualizacion) return 'No disponible'
    const fecha = new Date(ultimaActualizacion)
    return fecha.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
  }

  const handleActualizarTasa = async () => {
    await actualizar()
  }

  if (cargando) {
    return (
      <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-[#869dfc]/10 p-5 md:p-6 mb-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-100 rounded-xl w-1/3"></div>
          <div className="h-40 bg-slate-100 rounded-2xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 bg-slate-100 rounded-2xl"></div>
            <div className="h-32 bg-slate-100 rounded-2xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-[#869dfc]/10 p-5 md:p-6 mb-6">
      
  
      {/* Hero Card: Total Generado */}
      <div className="bg-[#122a4e] rounded-2xl p-6 relative overflow-hidden shadow-lg shadow-[#122a4e]/20 mb-8">
         <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div>
               <p className="text-[#869dfc] font-bold text-xs uppercase tracking-wider mb-1">Ingreso Total Semanal</p>
               <h2 className="text-4xl font-black text-white tracking-tight">
                 ${formatNumber(totalSemanaUSD)}
               </h2>
               <p className="text-white/50 text-sm font-medium mt-1">Total recaudado en servicios</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
               <p className="text-white/80 text-xs font-bold uppercase mb-1">Equivalente BCV</p>
               <p className="text-xl font-bold text-white">Bs {formatNumber(totalSemanaBS)}</p>
            </div>
         </div>
         {/* Decorative Icon */}
         <DollarSign className="absolute -top-6 -right-6 h-40 w-40 text-white/5 rotate-12" />
      </div>

      {/* Controles de Distribución */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        
        {/* Slider Porcentaje */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
           <div className="flex justify-between items-center mb-4">
              <label className="flex items-center gap-2 text-sm font-bold text-[#140f07]">
                 <Percent className="h-4 w-4 text-[#4260ad]" />
                 Porcentaje a Repartir
              </label>
              <span className="bg-[#e2e2f6] text-[#4260ad] px-3 py-1 rounded-lg text-sm font-black">
                 {porcentajeDistribuir}%
              </span>
           </div>
           <input
             type="range"
             min="0"
             max="100"
             step="1"
             value={porcentajeDistribuir}
             onChange={(e) => setPorcentajeDistribuir(Number(e.target.value))}
             className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#4260ad]"
           />
           <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase mt-2">
              <span>Empresa (0%)</span>
              <span>Totalidad (100%)</span>
           </div>
        </div>

        {/* Contador Trabajadores */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
           <label className="flex items-center gap-2 text-sm font-bold text-[#140f07] mb-4">
              <Users className="h-4 w-4 text-[#4260ad]" />
              Trabajadores Activos
           </label>
           <div className="flex items-center gap-3">
              <button
                onClick={() => setNumTrabajadores(prev => Math.max(1, prev - 1))}
                className="w-10 h-10 rounded-xl bg-[#f4f6fc] hover:bg-[#e2e2f6] text-[#122a4e] font-bold text-lg flex items-center justify-center transition-colors"
              >
                -
              </button>
              <div className="flex-1 bg-[#f4f6fc] border border-transparent h-10 rounded-xl flex items-center justify-center font-black text-[#140f07] text-lg">
                 {numTrabajadores}
              </div>
              <button
                onClick={() => setNumTrabajadores(prev => prev + 1)}
                className="w-10 h-10 rounded-xl bg-[#122a4e] hover:bg-[#4260ad] text-white font-bold text-lg flex items-center justify-center transition-colors shadow-md shadow-[#122a4e]/20"
              >
                +
              </button>
           </div>
        </div>
      </div>

      {/* Resultados Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
         
         {/* Card 1: Total Distribuir */}
         <div className="bg-[#4260ad] text-white p-5 rounded-2xl relative overflow-hidden shadow-lg shadow-[#4260ad]/20 group">
            <div className="relative z-10">
               <div className="flex items-center gap-2 mb-3 opacity-90">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Total Nómina</span>
               </div>
               <div className="space-y-1">
                  <p className="text-2xl font-black">${formatNumber(totalDistribuirUSD)}</p>
                  <p className="text-sm font-medium opacity-80">Bs {formatNumber(totalDistribuirBS)}</p>
               </div>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 transition-opacity">
               <Users className="h-24 w-24 -mr-4 -mb-4 rotate-12" />
            </div>
         </div>

         {/* Card 2: Por Persona */}
         <div className="bg-[#e2e2f6] text-[#122a4e] p-5 rounded-2xl relative overflow-hidden border border-[#869dfc]/20">
            <div className="relative z-10">
               <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-[#4260ad]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4260ad]">Por Trabajador</span>
               </div>
               <div className="space-y-1">
                  <p className="text-2xl font-black">${formatNumber(porPersonaUSD)}</p>
                  <p className="text-sm font-medium text-[#122a4e]/70">Bs {formatNumber(porPersonaBS)}</p>
               </div>
            </div>
         </div>

         {/* Card 3: Restante (Empresa) */}
         <div className="bg-[#f8f9fc] text-slate-600 p-5 rounded-2xl relative overflow-hidden border border-slate-200">
            <div className="relative z-10">
               <div className="flex items-center gap-2 mb-3">
                  <Wallet className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Restante ({100 - porcentajeDistribuir}%)</span>
               </div>
               <div className="space-y-1">
                  <p className="text-2xl font-black text-[#140f07]">${formatNumber(totalSemanaUSD - totalDistribuirUSD)}</p>
                  <p className="text-xs font-medium text-slate-400">Fondo de empresa</p>
               </div>
            </div>
         </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
         <div className="flex items-center gap-3 bg-[#f8f9fc] px-4 py-2 rounded-xl border border-slate-100">
            <div className="bg-white p-1.5 rounded-lg border border-slate-100 shadow-sm">
               <RefreshCw className={`h-3.5 w-3.5 text-[#4260ad] ${loadingTasa ? 'animate-spin' : ''}`} />
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] font-bold text-slate-400 uppercase">Tasa BCV</span>
               <span className="text-xs font-bold text-[#140f07]">
                  {loadingTasa ? '...' : tasa ? `Bs ${formatNumber(tasa, 2)}` : 'N/A'}
               </span>
            </div>
            <button 
               onClick={handleActualizarTasa}
               className="ml-1 text-[10px] text-[#4260ad] font-bold hover:underline"
            >
               Actualizar
            </button>
         </div>

         <button
            onClick={() => {
               setPorcentajeDistribuir(30)
               setNumTrabajadores(1)
            }}
            className="text-xs font-bold text-slate-400 hover:text-[#4260ad] transition-colors"
         >
            Restablecer valores
         </button>
      </div>

    </div>
  )
}