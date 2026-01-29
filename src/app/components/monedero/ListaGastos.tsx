"use client"

import { Receipt, Edit, Trash2, CreditCard, DollarSign, Clock, StickyNote, FileText } from 'lucide-react'
import { Gasto } from '../../types/monedero'

interface ListaGastosProps {
  gastos: Gasto[]
  onEditar: (gasto: Gasto) => void
  onEliminar: (gasto: Gasto) => void
}

export default function ListaGastos({ gastos, onEditar, onEliminar }: ListaGastosProps) {
  const formatBS = (num: number) => {
    return new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)
  }

  const formatUSD = (num: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num)
  }

  const getFechaCorta = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    const fechaFmt = fecha.toLocaleDateString('es-VE', { day: 'numeric', month: 'short' })
    const horaFmt = fecha.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', hour12: true })
    return `${fechaFmt}, ${horaFmt}`
  }

  if (gastos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-3xl border border-dashed border-slate-200">
        <div className="w-12 h-12 bg-[#f4f6fc] rounded-full flex items-center justify-center mb-3">
           <Receipt className="h-6 w-6 text-[#869dfc]" />
        </div>
        <p className="text-sm font-medium text-slate-500">No hay movimientos registrados</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {gastos.map((gasto) => {
        return (
          <div 
            key={gasto.id} 
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:border-[#869dfc]/30 transition-all duration-300"
          >
            <div className="p-4 sm:p-5">
              
              {/* Encabezado: Icono, Título y Acciones */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3 items-start overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-[#122a4e] flex items-center justify-center shrink-0 shadow-md shadow-[#122a4e]/10 text-white">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-[#140f07] text-base truncate leading-tight">
                      {gasto.descripcion}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs font-medium text-slate-400">
                       <Clock className="h-3 w-3" />
                       <span>{getFechaCorta(gasto.fechaHora)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-1 shrink-0 ml-2">
                  <button
                    onClick={() => onEditar(gasto)}
                    className="p-2 text-slate-400 hover:text-[#4260ad] hover:bg-[#e2e2f6] rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEliminar(gasto)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Cuerpo: Montos y Detalles */}
              <div className="bg-[#f8f9fc] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 mb-3">
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Monto en Bs</p>
                    <p className="text-xl font-black text-[#140f07]">Bs {formatBS(gasto.montoBS)}</p>
                 </div>
                 <div className="text-right pl-4 border-l border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Ref. USD</p>
                    <p className="text-base font-bold text-[#4260ad]">{formatUSD(gasto.montoUSD)}</p>
                 </div>
              </div>

              {/* Footer: Tags y Notas */}
              <div className="flex flex-wrap items-center gap-2">
                 <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600">
                    <CreditCard className="h-3 w-3 text-[#4260ad]" />
                    <span className="truncate max-w-25">{gasto.metodoPago?.nombre || 'General'}</span>
                 </div>
                 
                 <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600">
                    <span className="font-bold text-[#122a4e]">{gasto.moneda}</span>
                 </div>

                 {gasto.notas && (
                   <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#fff8e1] border border-[#ffecb3] text-xs font-medium text-amber-700 max-w-full">
                      <StickyNote className="h-3 w-3 shrink-0" />
                      <span className="truncate">{gasto.notas}</span>
                   </div>
                 )}
              </div>

            </div>
          </div>
        )
      })}
    </div>
  )
}