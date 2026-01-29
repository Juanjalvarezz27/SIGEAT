"use client"

import { useState } from 'react'
import { Calendar, Plus, ChevronDown, ChevronUp, FileText, Lock, Car, Wrench, CheckCircle, Receipt } from 'lucide-react'
import { RegistroForm, FormularioDatos, Servicio, ServicioExtra, VehiculoEncontrado } from '../../../types/formularioTypes'

interface CamposServicioProps {
  form: RegistroForm
  datos: FormularioDatos
  serviciosFiltrados: Servicio[]
  serviciosExtrasSeleccionados: ServicioExtra[]
  serviciosExtrasAbierto: boolean
  infoAdicionalAbierto: boolean
  vehiculoEncontrado: VehiculoEncontrado | null
  onServicioExtraChange: (servicioExtra: ServicioExtra) => void
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  onToggleServiciosExtras: () => void
  onToggleInfoAdicional: () => void
}

export default function CamposServicio({
  form,
  datos,
  serviciosFiltrados,
  serviciosExtrasSeleccionados,
  serviciosExtrasAbierto,
  infoAdicionalAbierto,
  vehiculoEncontrado,
  onServicioExtraChange,
  onChange,
  onToggleServiciosExtras,
  onToggleInfoAdicional
}: CamposServicioProps) {
  const serviciosExtrasTotal = serviciosExtrasSeleccionados.reduce((sum, extra) => sum + Number(extra.precio), 0)

  return (
    <>
      {/* Información del Servicio */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-base font-bold text-[#140f07] mb-5 flex items-center gap-2 border-b border-slate-50 pb-2">
          <div className="p-1.5 bg-[#e2e2f6] rounded-lg">
             <Calendar className="h-4 w-4 text-[#4260ad]" />
          </div>
          Información del Servicio
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Tipo de Vehículo */}
          <div>
            <label className="block text-xs font-bold text-[#122a4e] uppercase tracking-wider mb-1.5 ml-1">
              Tipo de Vehículo *
            </label>
            <div className="relative">
              <select
                name="tipoVehiculoId"
                value={form.tipoVehiculoId}
                onChange={onChange}
                required
                disabled={!!vehiculoEncontrado}
                className={`w-full px-4 py-3 border border-transparent rounded-xl focus:bg-white focus:border-[#869dfc] focus:ring-0 font-medium outline-none transition-all appearance-none ${
                  vehiculoEncontrado 
                    ? 'bg-slate-100 text-slate-500 cursor-not-allowed pr-10' 
                    : 'bg-[#f4f6fc] text-[#140f07]'
                }`}
              >
                <option value="">Seleccionar tipo</option>
                {datos?.tiposVehiculo.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                 {vehiculoEncontrado ? (
                    <Lock className="h-4 w-4 text-slate-400" />
                 ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                 )}
              </div>
            </div>
            {vehiculoEncontrado && (
              <div className="mt-1.5 flex items-center text-xs text-[#4260ad] font-medium animate-in fade-in">
                <Lock className="h-3 w-3 mr-1" />
                Vehículo registrado previamente
              </div>
            )}
          </div>

          {/* Servicio */}
          <div>
            <label className="block text-xs font-bold text-[#122a4e] uppercase tracking-wider mb-1.5 ml-1">
              Servicio *
            </label>
            <div className="relative">
              <select
                name="servicioId"
                value={form.servicioId}
                onChange={onChange}
                required
                disabled={!form.tipoVehiculoId}
                className={`w-full px-4 py-3 border border-transparent rounded-xl focus:bg-white focus:border-[#869dfc] focus:ring-0 font-medium outline-none transition-all appearance-none ${
                  !form.tipoVehiculoId
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-[#f4f6fc] text-[#140f07]'
                }`}
              >
                <option value="">
                  {form.tipoVehiculoId ? 'Seleccionar servicio' : 'Selecciona vehículo primero'}
                </option>
                {serviciosFiltrados.map(servicio => (
                  <option key={servicio.id} value={servicio.id}>
                    {servicio.nombre} - ${Number(servicio.precio).toFixed(2)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Estado del Carro */}
          <div>
            <label className="block text-xs font-bold text-[#122a4e] uppercase tracking-wider mb-1.5 ml-1 items-center gap-1.5">
               <Wrench className="h-3.5 w-3.5 text-[#4260ad]" />
               Estado del Carro *
            </label>
            <div className="relative">
              <select
                name="estadoCarroId"
                value={form.estadoCarroId}
                onChange={onChange}
                required
                className="w-full px-4 py-3 bg-[#f4f6fc] border border-transparent rounded-xl focus:bg-white focus:border-[#869dfc] focus:ring-0 text-[#140f07] font-medium outline-none transition-all appearance-none"
              >
                {datos?.estadosCarro.map(estado => (
                  <option key={estado.id} value={estado.id}>
                    {estado.nombre}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Estado de Pago */}
          <div>
            <label className="block text-xs font-bold text-[#122a4e] uppercase tracking-wider mb-1.5 ml-1 items-center gap-1.5">
               <CheckCircle className="h-3.5 w-3.5 text-[#4260ad]" />
               Estado de Pago *
            </label>
            <div className="relative">
              <select
                name="estadoPagoId"
                value={form.estadoPagoId}
                onChange={onChange}
                required
                className="w-full px-4 py-3 bg-[#f4f6fc] border border-transparent rounded-xl focus:bg-white focus:border-[#869dfc] focus:ring-0 text-[#140f07] font-medium outline-none transition-all appearance-none"
              >
                {datos?.estadosPago.map(estado => (
                  <option key={estado.id} value={estado.id}>
                    {estado.nombre}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Servicios Extras */}
      {datos?.serviciosExtras && datos.serviciosExtras.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <button
            type="button"
            onClick={onToggleServiciosExtras}
            className="w-full flex items-center justify-between p-5 bg-white hover:bg-[#f8f9fc] active:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#e2e2f6] flex items-center justify-center text-[#4260ad]">
                 <Plus className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-[#140f07] text-sm">Servicios Extras</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {serviciosExtrasSeleccionados.length > 0
                    ? `${serviciosExtrasSeleccionados.length} seleccionados (+$${serviciosExtrasTotal.toFixed(2)})`
                    : 'Ninguno seleccionado'
                  }
                </p>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${serviciosExtrasAbierto ? 'rotate-180' : ''}`} />
          </button>

          {serviciosExtrasAbierto && (
            <div className="px-5 pb-5 border-t border-slate-50 pt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {datos.serviciosExtras.map(extra => {
                  const isSelected = serviciosExtrasSeleccionados.some(se => se.id === extra.id)
                  return (
                    <div
                      key={extra.id}
                      onClick={() => onServicioExtraChange(extra)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 group ${
                        isSelected
                          ? 'bg-[#e2e2f6] border-[#869dfc] shadow-sm'
                          : 'bg-white border-slate-200 hover:border-[#869dfc]/50'
                      }`}
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                         isSelected ? 'bg-[#4260ad] border-[#4260ad]' : 'border-slate-300 bg-white'
                      }`}>
                         {isSelected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-start">
                            <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-[#122a4e]' : 'text-slate-700'}`}>{extra.nombre}</h4>
                            <span className={`text-sm font-bold ml-2 ${isSelected ? 'text-[#4260ad]' : 'text-slate-500'}`}>${Number(extra.precio).toFixed(2)}</span>
                         </div>
                         {extra.descripcion && (
                           <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{extra.descripcion}</p>
                         )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {serviciosExtrasSeleccionados.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-50 space-y-3">
                    <div>
                      <h4 className="text-xs font-bold text-[#122a4e] uppercase tracking-wider mb-2">Seleccionados:</h4>
                      <div className="flex flex-wrap gap-2">
                        {serviciosExtrasSeleccionados.map(extra => (
                          <span
                            key={extra.id}
                            className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-[#e2e2f6] text-[#122a4e] border border-[#869dfc]/20"
                          >
                            <span className="truncate max-w-37.5">{extra.nombre}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                onServicioExtraChange(extra)
                              }}
                              className="ml-1.5 p-0.5 hover:bg-[#4260ad]/10 rounded-full text-[#4260ad] transition-colors"
                            >
                              <Plus className="h-3 w-3 rotate-45" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center bg-[#f8f9fc] p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-600 font-bold text-xs uppercase">Total extras:</span>
                      <span className="text-sm font-black text-[#4260ad]">
                        +${serviciosExtrasTotal.toFixed(2)}
                      </span>
                    </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Información Adicional */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <button
          type="button"
          onClick={onToggleInfoAdicional}
          className="w-full flex items-center justify-between p-5 bg-white hover:bg-[#f8f9fc] active:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#e2e2f6] flex items-center justify-center text-[#4260ad]">
               <FileText className="h-5 w-5" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-[#140f07] text-sm">Información Adicional</h3>
              <p className="text-xs text-slate-500 font-medium">Referencia y notas (Opcional)</p>
            </div>
          </div>
          <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${infoAdicionalAbierto ? 'rotate-180' : ''}`} />
        </button>

        {infoAdicionalAbierto && (
          <div className="px-5 pb-5 border-t border-slate-50 pt-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#122a4e] uppercase tracking-wider mb-1.5 ml-1 items-center gap-1.5">
                <Receipt className="h-3.5 w-3.5 text-[#4260ad]" />
                Referencia de Pago
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                name="referenciaPago"
                value={form.referenciaPago}
                onChange={onChange}
                className="w-full px-4 py-3 bg-[#f4f6fc] border border-transparent rounded-xl focus:bg-white focus:border-[#869dfc] focus:ring-0 text-[#140f07] placeholder-slate-400 font-mono font-medium outline-none transition-all"
                placeholder="000000"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#122a4e] uppercase tracking-wider mb-1.5 ml-1 items-center gap-1.5">
                 <FileText className="h-3.5 w-3.5 text-[#4260ad]" />
                 Notas
              </label>
              <textarea
                name="notas"
                value={form.notas}
                onChange={onChange}
                rows={3}
                className="w-full px-4 py-3 bg-[#f4f6fc] border border-transparent rounded-xl focus:bg-white focus:border-[#869dfc] focus:ring-0 text-[#140f07] placeholder-slate-400 font-medium outline-none transition-all resize-none"
                placeholder="Detalles adicionales..."
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}