"use client"

import { DollarSign } from 'lucide-react'
import { RegistroForm, FormularioDatos, ServicioExtra } from '../../../types/formularioTypes'

interface CamposPagoProps {
  form: RegistroForm
  datos: FormularioDatos | null
  serviciosFiltrados: any[]
  serviciosExtrasSeleccionados: ServicioExtra[]
  precioServicio: number
  precioTotal: number
  precioTotalBs: number | null
  tasa: number | null
  loadingTasa: boolean
}

export default function CamposPago({
  form,
  datos,
  serviciosFiltrados,
  serviciosExtrasSeleccionados,
  precioServicio,
  precioTotal,
  precioTotalBs,
  tasa,
  loadingTasa
}: CamposPagoProps) {
  const serviciosExtrasTotal = serviciosExtrasSeleccionados.reduce((sum, extra) => sum + Number(extra.precio), 0)

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="text-base font-bold text-[#140f07] mb-5 flex items-center gap-2 border-b border-slate-50 pb-2">
        <div className="p-1.5 bg-[#e2e2f6] rounded-lg">
           <DollarSign className="h-4 w-4 text-[#4260ad]" />
        </div>
        Resumen de Pago
      </h3>
      
      <div className="bg-[#f8f9fc] rounded-xl p-5 space-y-4">
        {/* Servicio principal */}
        <div className="flex justify-between items-start pb-3 border-b border-slate-200">
          <div>
            <span className="text-slate-600 text-sm font-medium">Servicio principal</span>
            {form.servicioId && (
              <div className="text-xs font-bold text-[#140f07] mt-0.5">
                {serviciosFiltrados.find(s => s.id === parseInt(form.servicioId))?.nombre}
              </div>
            )}
          </div>
          <div className="text-right">
            <span className="font-bold text-[#140f07] text-base">
              ${precioServicio.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Servicios extras */}
        {serviciosExtrasSeleccionados.length > 0 && (
          <div className="space-y-3 pb-3 border-b border-slate-200">
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Extras</div>
              {serviciosExtrasSeleccionados.map(extra => (
                <div key={extra.id} className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 truncate pr-2 flex items-center">
                     <span className="w-1 h-1 bg-slate-300 rounded-full mr-2"></span>
                     {extra.nombre}
                  </span>
                  <span className="font-medium text-slate-700 whitespace-nowrap">+${Number(extra.precio).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-slate-500 text-xs font-medium">Subtotal extras</span>
              <span className="font-bold text-[#4260ad] text-sm">+${serviciosExtrasTotal.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Totales */}
        <div className="pt-1 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[#122a4e] font-bold text-lg">Total USD</span>
              <span className="text-xl font-black text-[#122a4e]">
                ${precioTotal.toFixed(2)}
              </span>
            </div>

            {/* Conversión BCV */}
            <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Tasa BCV del día</span>
                  {loadingTasa ? (
                    <span className="animate-pulse">Cargando...</span>
                  ) : tasa ? (
                    <span className="font-mono">Bs {tasa.toFixed(2)}</span>
                  ) : (
                    <span className="text-amber-500">No disponible</span>
                  )}
                </div>
                
                {precioTotalBs !== null && (
                  <div className="flex justify-between items-center pt-1 border-t border-slate-50">
                    <span className="text-slate-600 font-bold text-sm">Total en Bolívares</span>
                    <span className="text-lg font-black text-emerald-600">
                      Bs {precioTotalBs.toFixed(2)}
                    </span>
                  </div>
                )}
            </div>
        </div>
      </div>
    </div>
  )
}