"use client"

import { useState } from 'react'
import { Calendar, Plus, ChevronDown, ChevronUp, FileText, Lock } from 'lucide-react'
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
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-500" />
          Información del Servicio
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Vehículo *
              {vehiculoEncontrado && (
                <span className="ml-2 text-xs text-blue-600 flex items-center">
                  <Lock className="h-3 w-3 mr-1" />
                  Bloqueado (vehículo ya registrado)
                </span>
              )}
            </label>
            <div className="relative">
              <select
                name="tipoVehiculoId"
                value={form.tipoVehiculoId}
                onChange={onChange}
                required
                disabled={!!vehiculoEncontrado}
                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition appearance-none ${
                  vehiculoEncontrado 
                    ? 'bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed pr-10' 
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value="">Seleccionar tipo</option>
                {datos?.tiposVehiculo.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
              {vehiculoEncontrado && (
                <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              )}
            </div>
            {vehiculoEncontrado && (
              <p className="mt-1 text-xs text-gray-600">
                Tipo de vehículo: {datos?.tiposVehiculo.find(t => t.id === parseInt(form.tipoVehiculoId))?.nombre}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Servicio *
            </label>
            <select
              name="servicioId"
              value={form.servicioId}
              onChange={onChange}
              required
              disabled={!form.tipoVehiculoId}
              className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                !form.tipoVehiculoId
                  ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                  : 'border-gray-300 bg-white'
              }`}
            >
              <option value="">
                {form.tipoVehiculoId ? 'Seleccionar servicio' : 'Selecciona un tipo de vehículo primero'}
              </option>
              {serviciosFiltrados.map(servicio => (
                <option key={servicio.id} value={servicio.id}>
                  {servicio.nombre} - ${Number(servicio.precio).toFixed(2)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado del Carro *
            </label>
            <select
              name="estadoCarroId"
              value={form.estadoCarroId}
              onChange={onChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            >
              {datos?.estadosCarro.map(estado => (
                <option key={estado.id} value={estado.id}>
                  {estado.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado de Pago *
            </label>
            <select
              name="estadoPagoId"
              value={form.estadoPagoId}
              onChange={onChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            >
              {datos?.estadosPago.map(estado => (
                <option key={estado.id} value={estado.id}>
                  {estado.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Servicios Extras */}
      {datos?.serviciosExtras && datos.serviciosExtras.length > 0 && (
        <div>
          <button
            type="button"
            onClick={onToggleServiciosExtras}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition"
          >
            <div className="flex items-center">
              <Plus className="h-5 w-5 text-blue-500 mr-3" />
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Servicios Extras</h3>
                <p className="text-sm text-gray-600">
                  {serviciosExtrasSeleccionados.length > 0
                    ? `${serviciosExtrasSeleccionados.length} seleccionados - Total: $${serviciosExtrasTotal.toFixed(2)}`
                    : 'Selecciona servicios adicionales'
                  }
                </p>
              </div>
            </div>
            {serviciosExtrasAbierto ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {serviciosExtrasAbierto && (
            <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {datos.serviciosExtras.map(extra => {
                  const isSelected = serviciosExtrasSeleccionados.some(se => se.id === extra.id)
                  return (
                    <div
                      key={extra.id}
                      className={`p-3 border rounded-xl cursor-pointer transition-all hover:shadow-sm ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => onServicioExtraChange(extra)}
                    >
                      <div className="flex items-start justify-between h-full">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start">
                            <div className={`mt-0.5 shrink-0 w-5 h-5 rounded border mr-3 flex items-center justify-center ${
                              isSelected
                                ? 'bg-blue-500 border-blue-500'
                                : 'border-gray-300'
                            }`}>
                              {isSelected && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                                {extra.nombre}
                              </h4>
                              {extra.descripcion && (
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  {extra.descripcion}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="ml-2 shrink-0 text-right">
                          <div className="text-base sm:text-lg font-semibold text-blue-600 whitespace-nowrap">
                            ${Number(extra.precio).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 hidden sm:block">
                            {isSelected ? 'Seleccionado' : 'Click para seleccionar'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {serviciosExtrasSeleccionados.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-col gap-3">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Servicios extras seleccionados:</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {serviciosExtrasSeleccionados.map(extra => (
                          <span
                            key={extra.id}
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-blue-100 text-blue-700 border border-blue-200"
                          >
                            <span className="truncate max-w-30">{extra.nombre}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                onServicioExtraChange(extra)
                              }}
                              className="ml-1.5 text-blue-500 hover:text-blue-700 text-sm"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium text-sm sm:text-base">Total servicios extras:</span>
                      <span className="text-base sm:text-lg font-bold text-blue-600">
                        +${serviciosExtrasTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Información Adicional */}
      <div>
        <button
          type="button"
          onClick={onToggleInfoAdicional}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition"
        >
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-blue-500 mr-3" />
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Información Adicional</h3>
              <p className="text-sm text-gray-600">
                Referencia de pago y notas adicionales (Opcional)
              </p>
            </div>
          </div>
          {infoAdicionalAbierto ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>

        {infoAdicionalAbierto && (
          <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referencia de Pago (Opcional)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="referenciaPago"
                  value={form.referenciaPago}
                  onChange={onChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Ej: 123456789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                  <span className="text-xs text-gray-500 ml-1">(opcional)</span>
                </label>
                <textarea
                  name="notas"
                  value={form.notas}
                  onChange={onChange}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                  placeholder="Observaciones adicionales..."
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}