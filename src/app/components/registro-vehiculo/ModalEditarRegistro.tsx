"use client"

import { useState, useEffect } from 'react'
import { X, AlertCircle, Plus, ChevronDown, Edit, FileText, Palette, User, Car, Wrench, CheckCircle, CreditCard, DollarSign, Receipt } from 'lucide-react'
import useTasaBCV from '../../hooks/useTasaBCV'
import {
  ModalEditarRegistroProps,
  FormularioDatos,
  Servicio,
  ServicioExtra
} from '../../types/formularioTypes'

export default function ModalEditarRegistro({
  isOpen,
  onClose,
  registro,
  onUpdate,
  datosFormulario
}: ModalEditarRegistroProps) {
  const { tasa } = useTasaBCV()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    placa: '',
    color: '', 
    tipoVehiculoId: '',
    servicioId: '',
    estadoCarroId: '',
    estadoPagoId: '',
    referenciaPago: '',
    notas: '',
    serviciosExtrasIds: [] as number[]
  })

  const [serviciosFiltrados, setServiciosFiltrados] = useState<Servicio[]>([])
  const [serviciosExtrasSeleccionados, setServiciosExtrasSeleccionados] = useState<ServicioExtra[]>([])
  const [serviciosExtrasAbierto, setServiciosExtrasAbierto] = useState(false)
  const [infoAdicionalAbierto, setInfoAdicionalAbierto] = useState(false)
  const [precioTotal, setPrecioTotal] = useState(0)
  const [precioTotalBs, setPrecioTotalBs] = useState<number | null>(null)

  // Inicializar formulario con datos del registro
  useEffect(() => {
    if (registro && datosFormulario) {
      if (!datosFormulario.serviciosExtras || !datosFormulario.tiposVehiculo) {
        console.error('Estructura de datosFormulario incompleta:', datosFormulario)
        return
      }

      setForm({
        nombre: registro.nombre,
        cedula: registro.cedula,
        telefono: registro.telefono,
        placa: registro.placa,
        color: registro.color || '', 
        tipoVehiculoId: registro.tipoVehiculoId.toString(),
        servicioId: registro.servicioId.toString(),
        estadoCarroId: registro.estadoCarroId.toString(),
        estadoPagoId: registro.estadoPagoId.toString(),
        referenciaPago: registro.referenciaPago || '',
        notas: registro.notas || '',
        serviciosExtrasIds: registro.serviciosExtras.map(se => se.servicioExtra.id)
      })

      const extrasSeleccionados = registro.serviciosExtras
        .map(se => se.servicioExtra)
        .filter(extra => datosFormulario.serviciosExtras.some(de => de.id === extra.id))

      setServiciosExtrasSeleccionados(extrasSeleccionados)
      filtrarServicios(registro.tipoVehiculoId.toString())
    }
  }, [registro, datosFormulario])

  const filtrarServicios = (tipoVehiculoId: string) => {
    if (!datosFormulario || !tipoVehiculoId) {
      setServiciosFiltrados([])
      return
    }

    const tipoSeleccionado = datosFormulario.tiposVehiculo.find(t => t.id === parseInt(tipoVehiculoId))
    if (!tipoSeleccionado) return

    const serviciosFiltrados = datosFormulario.servicios.filter(
      servicio => servicio.categoria && 
                  servicio.categoria.nombre && 
                  servicio.categoria.nombre === tipoSeleccionado.categoria
    )

    setServiciosFiltrados(serviciosFiltrados)
  }

  useEffect(() => {
    if (!datosFormulario || !form.servicioId) {
      setPrecioTotal(0)
      setPrecioTotalBs(null)
      return
    }

    const servicio = datosFormulario.servicios.find(s => s.id === parseInt(form.servicioId))
    if (!servicio) return

    let total = Number(servicio.precio)

    serviciosExtrasSeleccionados.forEach(extra => {
      total += Number(extra.precio)
    })

    setPrecioTotal(total)

    if (tasa) {
      setPrecioTotalBs(total * tasa)
    } else {
      setPrecioTotalBs(null)
    }
  }, [form.servicioId, serviciosExtrasSeleccionados, tasa, datosFormulario])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    let processedValue = value

    if (name === 'cedula' || name === 'telefono' || name === 'referenciaPago') {
      processedValue = value.replace(/[^0-9]/g, '')
    } else if (name === 'placa') {
      processedValue = value.slice(0, 8).toUpperCase()
    }

    if (name === 'tipoVehiculoId') {
      setForm(prev => ({
        ...prev,
        [name]: processedValue,
        servicioId: ''
      }))
      filtrarServicios(processedValue)
    } else {
      setForm(prev => ({ ...prev, [name]: processedValue }))
    }
  }

  const handleServicioExtraChange = (servicioExtra: ServicioExtra) => {
    const isSelected = serviciosExtrasSeleccionados.some(se => se.id === servicioExtra.id)

    if (isSelected) {
      setServiciosExtrasSeleccionados(prev => prev.filter(se => se.id !== servicioExtra.id))
      setForm(prev => ({
        ...prev,
        serviciosExtrasIds: prev.serviciosExtrasIds.filter(id => id !== servicioExtra.id)
      }))
    } else {
      setServiciosExtrasSeleccionados(prev => [...prev, servicioExtra])
      setForm(prev => ({
        ...prev,
        serviciosExtrasIds: [...prev.serviciosExtrasIds, servicioExtra.id]
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!form.cedula || form.cedula.length < 6) {
      setError('La cédula debe tener al menos 6 dígitos')
      setLoading(false)
      return
    }

    if (!form.telefono || form.telefono.length < 10) {
      setError('El teléfono debe tener al menos 10 dígitos')
      setLoading(false)
      return
    }

    if (!form.placa || form.placa.length < 5) {
      setError('La placa debe tener entre 5 y 8 caracteres')
      setLoading(false)
      return
    }

    if (!form.color || form.color.trim() === '') {
      setError('El color del vehículo es requerido')
      setLoading(false)
      return
    }

    if (!registro) {
      setError('No hay registro seleccionado')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/registros-vehiculos/${registro.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          precioTotal,
          precioTotalBs,
          tasaCambio: tasa
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar registro')
      }

      onUpdate()
      onClose()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar registro')
    } finally {
      setLoading(false)
    }
  }

  const serviciosExtrasTotal = serviciosExtrasSeleccionados.reduce((sum, extra) => sum + Number(extra.precio), 0)

  if (!isOpen || !registro || !datosFormulario) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Overlay optimizado: Sin blur, solo color sólido semitransparente */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal optimizado: Sin sombras complejas ni transiciones pesadas */}
        <div className="relative transform overflow-hidden rounded-3xl bg-[#f8f9fc] text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl max-h-[90vh] border border-white/20">
          
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-[#122a4e]/5 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#e2e2f6] rounded-xl flex items-center justify-center shrink-0">
                <Edit className="h-5 w-5 text-[#122a4e]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#140f07]">
                  Editar Registro
                </h2>
                <p className="text-[#4260ad] text-sm font-medium">
                  {registro.placa} - {registro.nombre}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-[#e2e2f6] text-[#122a4e]/50 hover:text-[#122a4e] transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Contenido con scroll optimizado */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)] bg-[#f8f9fc] overscroll-contain">
            <div className="px-6 py-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-red-700 font-bold text-sm">Error:</p>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Bloque 1: Información del Cliente */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100">
                  <h3 className="text-base font-bold text-[#140f07] mb-4 flex items-center gap-2 border-b border-slate-50 pb-2">
                    <User className="h-4 w-4 text-[#4260ad]" />
                    Información del Cliente
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#122a4e] uppercase tracking-wider mb-1.5 ml-1">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-[#f4f6fc] border border-transparent rounded-xl focus:bg-white focus:border-[#869dfc] focus:ring-0 text-[#140f07] font-medium outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#122a4e] uppercase tracking-wider mb-1.5 ml-1">
                        Cédula *
                      </label>
                      <input
                        type="text"
                        name="cedula"
                        value={form.cedula}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-[#f4f6fc] border border-transparent rounded-xl focus:bg-white focus:border-[#869dfc] focus:ring-0 text-[#140f07] font-medium outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#122a4e] uppercase tracking-wider mb-1.5 ml-1">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        name="telefono"
                        value={form.telefono}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-[#f4f6fc] border border-transparent rounded-xl focus:bg-white focus:border-[#869dfc] focus:ring-0 text-[#140f07] font-medium outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#122a4e] uppercase tracking-wider mb-1.5 ml-1">
                        Placa *
                      </label>
                      <input
                        type="text"
                        name="placa"
                        value={form.placa}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-[#f4f6fc] border border-transparent rounded-xl focus:bg-white focus:border-[#869dfc] focus:ring-0 text-[#140f07] font-bold outline-none uppercase"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="flex text-xs font-bold text-[#122a4e] uppercase tracking-wider mb-1.5 ml-1 items-center gap-1.5">
                        <Palette className="h-3.5 w-3.5 text-[#4260ad]" />
                        Color del Vehículo *
                      </label>
                      <input
                        type="text"
                        name="color"
                        value={form.color}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-[#f4f6fc] border border-transparent rounded-xl focus:bg-white focus:border-[#869dfc] focus:ring-0 text-[#140f07] font-medium outline-none"
                        placeholder="Ej: Rojo, Azul, Negro..."
                      />
                    </div>
                  </div>
                </div>

                {/* Bloque 2: Información del Servicio */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100">
                  <h3 className="text-base font-bold text-[#140f07] mb-4 flex items-center gap-2 border-b border-slate-50 pb-2">
                    <Car className="h-4 w-4 text-[#4260ad]" />
                    Información del Servicio
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#122a4e] uppercase tracking-wider mb-1.5 ml-1">
                        Tipo de Vehículo *
                      </label>
                      <div className="relative">
                        <select
                          name="tipoVehiculoId"
                          value={form.tipoVehiculoId}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-[#f4f6fc] border border-transparent rounded-xl focus:bg-white focus:border-[#869dfc] focus:ring-0 text-[#140f07] font-medium outline-none appearance-none"
                        >
                          <option value="">Seleccionar tipo</option>
                          {datosFormulario.tiposVehiculo.map(tipo => (
                            <option key={tipo.id} value={tipo.id}>
                              {tipo.nombre}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#122a4e] uppercase tracking-wider mb-1.5 ml-1">
                        Servicio *
                      </label>
                      <div className="relative">
                        <select
                          name="servicioId"
                          value={form.servicioId}
                          onChange={handleChange}
                          required
                          disabled={!form.tipoVehiculoId}
                          className={`w-full px-4 py-3 border border-transparent rounded-xl focus:bg-white focus:border-[#869dfc] focus:ring-0 font-medium outline-none appearance-none ${
                            !form.tipoVehiculoId
                              ? 'bg-slate-100 text-slate-400'
                              : 'bg-[#f4f6fc] text-[#140f07]'
                          }`}
                        >
                          <option value="">
                            {form.tipoVehiculoId ? 'Seleccionar servicio' : 'Selecciona vehículo'}
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
                    <div>
                      <label className="flex text-xs font-bold text-[#122a4e] uppercase tracking-wider mb-1.5 ml-1 items-center gap-1.5">
                        <Wrench className="h-3.5 w-3.5 text-[#4260ad]" />
                        Estado del Carro *
                      </label>
                      <div className="relative">
                        <select
                          name="estadoCarroId"
                          value={form.estadoCarroId}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-[#f4f6fc] border border-transparent rounded-xl focus:bg-white focus:border-[#869dfc] focus:ring-0 text-[#140f07] font-medium outline-none appearance-none"
                        >
                          {datosFormulario.estadosCarro.map(estado => (
                            <option key={estado.id} value={estado.id}>
                              {estado.nombre}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="flex text-xs font-bold text-[#122a4e] uppercase tracking-wider mb-1.5 ml-1 items-center gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5 text-[#4260ad]" />
                        Estado de Pago *
                      </label>
                      <div className="relative">
                        <select
                          name="estadoPagoId"
                          value={form.estadoPagoId}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-[#f4f6fc] border border-transparent rounded-xl focus:bg-white focus:border-[#869dfc] focus:ring-0 text-[#140f07] font-medium outline-none appearance-none"
                        >
                          {datosFormulario.estadosPago.map(estado => (
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

                {/* Bloque 3: Servicios Extras */}
                {datosFormulario && datosFormulario.serviciosExtras && datosFormulario.serviciosExtras.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setServiciosExtrasAbierto(!serviciosExtrasAbierto)}
                      className="w-full flex items-center justify-between p-5 bg-white active:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#e2e2f6] flex items-center justify-center text-[#4260ad]">
                           <Plus className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-[#140f07] text-sm">Servicios Extras</h3>
                          <p className="text-xs text-slate-500 font-medium">
                            {serviciosExtrasSeleccionados.length > 0
                              ? `${serviciosExtrasSeleccionados.length} seleccionados`
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
                          {datosFormulario.serviciosExtras.map(extra => {
                            const isSelected = serviciosExtrasSeleccionados.some(se => se.id === extra.id)
                            return (
                              <div
                                key={extra.id}
                                onClick={() => handleServicioExtraChange(extra)}
                                className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 ${
                                  isSelected
                                    ? 'bg-[#e2e2f6] border-[#869dfc]'
                                    : 'bg-white border-slate-200'
                                }`}
                              >
                                <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                                   isSelected ? 'bg-[#4260ad] border-[#4260ad]' : 'border-slate-300 bg-white'
                                }`}>
                                   {isSelected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                   <div className="flex justify-between items-start">
                                      <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-[#122a4e]' : 'text-slate-700'}`}>{extra.nombre}</h4>
                                      <span className={`text-sm font-bold ml-2 ${isSelected ? 'text-[#4260ad]' : 'text-slate-500'}`}>${Number(extra.precio).toFixed(2)}</span>
                                   </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Bloque 4: Información Adicional */}
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setInfoAdicionalAbierto(!infoAdicionalAbierto)}
                    className="w-full flex items-center justify-between p-5 bg-white active:bg-gray-50 transition-colors"
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
                          name="referenciaPago"
                          value={form.referenciaPago}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-[#f4f6fc] border border-transparent rounded-xl focus:bg-white focus:border-[#869dfc] focus:ring-0 text-[#140f07] font-mono font-medium outline-none"
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
                          onChange={handleChange}
                          rows={3}
                          className="w-full px-4 py-3 bg-[#f4f6fc] border border-transparent rounded-xl focus:bg-white focus:border-[#869dfc] focus:ring-0 text-[#140f07] font-medium outline-none resize-none"
                          placeholder="Detalles adicionales..."
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Bloque 5: Resumen de Pago */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100">
                  <h3 className="text-base font-bold text-[#140f07] mb-4 flex items-center gap-2 border-b border-slate-50 pb-2">
                    <DollarSign className="h-4 w-4 text-[#4260ad]" />
                    Resumen de Pago
                  </h3>
                  <div className="bg-[#f8f9fc] rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center text-sm text-slate-600">
                      <span>Subtotal:</span>
                      <span className="font-bold text-[#140f07]">${(precioTotal - serviciosExtrasTotal).toFixed(2)}</span>
                    </div>

                    {serviciosExtrasSeleccionados.length > 0 && (
                      <div className="flex justify-between items-center text-sm text-slate-600">
                        <span>Extras:</span>
                        <span className="font-bold text-[#4260ad]">+${serviciosExtrasTotal.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="h-px bg-slate-200 my-2"></div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#122a4e] font-bold text-base">Total USD:</span>
                      <span className="text-xl font-black text-[#122a4e]">${precioTotal.toFixed(2)}</span>
                    </div>

                    {precioTotalBs !== null && (
                      <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100 mt-2">
                        <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Total Bs:</span>
                        <span className="text-base font-bold text-emerald-600">Bs {precioTotalBs.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-6 py-3.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl active:bg-slate-50 hover:text-[#122a4e]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !form.color}
                    className={`w-full sm:flex-1 px-6 py-3.5 font-bold text-white rounded-xl shadow-lg flex items-center justify-center ${
                      loading || !form.color
                        ? 'bg-slate-300 cursor-not-allowed shadow-none'
                        : 'bg-[#4260ad] active:bg-[#122a4e] shadow-[#4260ad]/30'
                    }`}
                  >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}