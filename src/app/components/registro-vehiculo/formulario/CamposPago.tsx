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
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <DollarSign className="h-5 w-5 mr-2 text-blue-500" />
        Resumen de Pago
      </h3>
      <div className="bg-gray-50 rounded-xl p-4 sm:p-5 space-y-3">
        {/* Servicio principal */}
        <div className="flex justify-between items-center pb-2 border-b border-gray-200">
          <div>
            <span className="text-gray-700 text-sm sm:text-base">Servicio principal:</span>
            {form.servicioId && (
              <div className="text-xs sm:text-sm text-gray-600 mt-1">
                {serviciosFiltrados.find(s => s.id === parseInt(form.servicioId))?.nombre}
              </div>
            )}
          </div>
          <div className="text-right">
            <span className="font-semibold text-base sm:text-lg">
              ${precioServicio.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Servicios extras */}
        {serviciosExtrasSeleccionados.length > 0 && (
          <>
            <div className="space-y-1.5">
              <div className="text-sm font-medium text-gray-700">Servicios extras:</div>
              {serviciosExtrasSeleccionados.map(extra => (
                <div key={extra.id} className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600 truncate max-w-37.5">• {extra.nombre}</span>
                  <span className="font-medium whitespace-nowrap">${Number(extra.precio).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-gray-700 text-sm sm:text-base">Subtotal servicios extras:</span>
              <span className="font-semibold text-sm sm:text-base">${serviciosExtrasTotal.toFixed(2)}</span>
            </div>
          </>
        )}

        {/* Total en USD */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <span className="text-gray-900 font-semibold text-base sm:text-lg">Total en USD:</span>
          <span className="text-lg sm:text-xl font-bold text-blue-600">
            ${precioTotal.toFixed(2)}
          </span>
        </div>

        {/* Tasa BCV */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <div>
            <span className="text-gray-700 text-sm sm:text-base">Tasa BCV:</span>
          </div>
          <div>
            {loadingTasa ? (
              <span className="text-sm text-gray-500">...</span>
            ) : tasa ? (
              <span className="font-semibold text-sm sm:text-base">Bs {tasa.toFixed(2)}</span>
            ) : (
              <span className="text-xs sm:text-sm text-yellow-600">—</span>
            )}
          </div>
        </div>

        {/* Total en Bs */}
        {precioTotalBs !== null && (
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-gray-900 font-semibold text-sm sm:text-base">Total en Bolívares:</span>
            <span className="text-base sm:text-lg font-bold text-green-600">
              Bs {precioTotalBs.toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}