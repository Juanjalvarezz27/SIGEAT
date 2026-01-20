"use client"

import { Receipt, Edit, Trash2, Calendar, CreditCard, DollarSign, Clock, StickyNote } from 'lucide-react'
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
    // Formato ultra corto: 20 Ene • 01:01 PM
    const fechaFmt = fecha.toLocaleDateString('es-VE', { day: 'numeric', month: 'short' })
    const horaFmt = fecha.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', hour12: true })
    return `${fechaFmt} • ${horaFmt}`
  }

  if (gastos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 bg-white rounded-xl border border-dashed border-gray-300">
        <Receipt className="h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">Sin movimientos</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {gastos.map((gasto) => {
        const isUSD = gasto.moneda === 'USD'
        
        return (
          <div 
            key={gasto.id} 
            className="relative bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all"
          >
            <div className="p-3">
              {/* --- FILA SUPERIOR: Icono + Título + Info --- */}
              <div className="flex gap-3 mb-3">
                {/* Icono Cuadrado */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  isUSD ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  <DollarSign className="h-5 w-5" />
                </div>

                {/* Info Central */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900 text-base truncate pr-2">
                      {gasto.descripcion}
                    </h3>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                      isUSD ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {gasto.moneda}
                    </span>
                  </div>

                  {/* Metadatos en una sola línea compacta */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                    <div className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                      <CreditCard className="h-3 w-3" />
                      <span className="truncate max-w-20">{gasto.metodoPago?.nombre || 'General'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap">
                      <Clock className="h-3 w-3" />
                      <span>{getFechaCorta(gasto.fechaHora)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- FILA INFERIOR: Precio y Botones --- */}
              <div className="flex items-end justify-between border-t border-gray-50 pt-2 mt-1">
                {/* Precios */}
                <div>
                  <div className="font-bold text-lg text-gray-900 leading-none">
                    Bs {formatBS(gasto.montoBS)}
                  </div>
                  <div className="text-sm text-gray-700 mt-1 font-medium">
                    {formatUSD(gasto.montoUSD)} 
                    {isUSD && <span className="text-gray-400 font-normal ml-1 text-[10px]"></span>}
                  </div>
                </div>

                {/* Botones (Compactos) */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditar(gasto)}
                    className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-100 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEliminar(gasto)}
                    className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-100 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Notas (Footer pequeño) */}
            {gasto.notas && (
              <div className="bg-yellow-50/50 px-3 py-1.5 border-t border-yellow-100/50 flex items-center gap-2">
                <StickyNote className="h-3 w-3 text-yellow-600 shrink-0" />
                <p className="text-sm text-gray-600 truncate">
                  {gasto.notas}
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}