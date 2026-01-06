"use client"

import { User, AlertCircle } from 'lucide-react'
import { RegistroForm, VehiculoEncontrado } from '../../../types/formularioTypes'

interface CamposClienteProps {
  form: RegistroForm
  vehiculoEncontrado: VehiculoEncontrado | null
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
}

export default function CamposCliente({ form, vehiculoEncontrado, onChange }: CamposClienteProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <User className="h-5 w-5 mr-2 text-blue-500" />
        Información del Cliente
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre Completo *
          </label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={onChange}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            disabled={!!vehiculoEncontrado}
          />
          {vehiculoEncontrado && (
            <div className="mt-1 text-xs text-blue-600">
              Datos cargados automáticamente
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cédula *
            <span className="text-xs text-gray-500 ml-1">(solo números)</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            name="cedula"
            value={form.cedula}
            onChange={onChange}
            required
            minLength={6}
            maxLength={8}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="12345678"
            disabled={!!vehiculoEncontrado}
          />
          {form.cedula && form.cedula.length < 6 && (
            <p className="mt-1 text-xs text-red-500">Mínimo 6 dígitos</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono *
            <span className="text-xs text-gray-500 ml-1">(solo números)</span>
          </label>
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            name="telefono"
            value={form.telefono}
            onChange={onChange}
            required
            minLength={10}
            maxLength={11}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="04121234567"
            disabled={!!vehiculoEncontrado}
          />
          {form.telefono && form.telefono.length < 10 && (
            <p className="mt-1 text-xs text-red-500">Mínimo 10 dígitos</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color del Vehículo *
          </label>
          <input
            type="text"
            name="color"
            value={form.color}
            onChange={onChange}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="Ej: Rojo, Azul, Negro..."
          />
        </div>
      </div>
    </div>
  )
}