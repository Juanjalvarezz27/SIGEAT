"use client"

import { User, AlertCircle, Palette, Phone, FileDigit } from 'lucide-react'
import { RegistroForm, VehiculoEncontrado } from '../../../types/formularioTypes'

interface CamposClienteProps {
  form: RegistroForm
  vehiculoEncontrado: VehiculoEncontrado | null
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
}

export default function CamposCliente({ form, vehiculoEncontrado, onChange }: CamposClienteProps) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="text-base font-bold text-[#140f07] mb-5 flex items-center gap-2 border-b border-slate-50 pb-2">
        <div className="p-1.5 bg-[#e2e2f6] rounded-lg">
            <User className="h-4 w-4 text-[#4260ad]" />
        </div>
        Información del Cliente
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Nombre */}
        <div>
          <label className="block text-xs font-bold text-[#122a4e] uppercase tracking-wider mb-1.5 ml-1">
            Nombre Completo *
          </label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={onChange}
            required
            className={`w-full px-4 py-3 border border-transparent rounded-xl focus:bg-white focus:border-[#869dfc] focus:ring-0 text-[#140f07] font-medium outline-none transition-all placeholder-slate-400 ${
              vehiculoEncontrado 
                ? 'bg-slate-100 text-slate-500 cursor-not-allowed' 
                : 'bg-[#f4f6fc]'
            }`}
            disabled={!!vehiculoEncontrado}
            placeholder="Ej: Juan Pérez"
          />
          {vehiculoEncontrado && (
            <div className="mt-1.5 flex items-center text-xs text-[#4260ad] font-medium animate-in fade-in">
              <span className="w-1.5 h-1.5 bg-[#4260ad] rounded-full mr-1.5"></span>
              Cliente registrado previamente
            </div>
          )}
        </div>

        {/* Cédula */}
        <div>
          <label className="block text-xs font-bold text-[#122a4e] uppercase tracking-wider mb-1.5 ml-1 items-center gap-1.5">
            Cédula *
            <span className="text-[10px] font-normal text-slate-400 normal-case tracking-normal">(solo números)</span>
          </label>
          <div className="relative">
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
                className={`w-full px-4 py-3 border border-transparent rounded-xl focus:bg-white focus:border-[#869dfc] focus:ring-0 text-[#140f07] font-medium outline-none transition-all placeholder-slate-400 ${
                  vehiculoEncontrado 
                    ? 'bg-slate-100 text-slate-500 cursor-not-allowed' 
                    : 'bg-[#f4f6fc]'
                }`}
                placeholder="12345678"
                disabled={!!vehiculoEncontrado}
              />
              <FileDigit className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
          {form.cedula && form.cedula.length > 0 && form.cedula.length < 6 && (
            <p className="mt-1 text-xs text-red-500 font-medium flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                Mínimo 6 dígitos
            </p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-xs font-bold text-[#122a4e] uppercase tracking-wider mb-1.5 ml-1 items-center gap-1.5">
            Teléfono *
            <span className="text-[10px] font-normal text-slate-400 normal-case tracking-normal">(solo números)</span>
          </label>
          <div className="relative">
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
                className={`w-full px-4 py-3 border border-transparent rounded-xl focus:bg-white focus:border-[#869dfc] focus:ring-0 text-[#140f07] font-medium outline-none transition-all placeholder-slate-400 ${
                  vehiculoEncontrado 
                    ? 'bg-slate-100 text-slate-500 cursor-not-allowed' 
                    : 'bg-[#f4f6fc]'
                }`}
                placeholder="04121234567"
                disabled={!!vehiculoEncontrado}
              />
              <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
          {form.telefono && form.telefono.length > 0 && form.telefono.length < 10 && (
            <p className="mt-1 text-xs text-red-500 font-medium flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                Mínimo 10 dígitos
            </p>
          )}
        </div>

        {/* Color */}
        <div>
          <label className="block text-xs font-bold text-[#122a4e] uppercase tracking-wider mb-1.5 ml-1 items-center gap-1.5">
             Color del Vehículo *
          </label>
          <div className="relative">
              <input
                type="text"
                name="color"
                value={form.color}
                onChange={onChange}
                required
                className="w-full px-4 py-3 bg-[#f4f6fc] border border-transparent rounded-xl focus:bg-white focus:border-[#869dfc] focus:ring-0 text-[#140f07] font-medium outline-none transition-all placeholder-slate-400"
                placeholder="Ej: Rojo, Azul, Negro..."
              />
              <Palette className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  )
}