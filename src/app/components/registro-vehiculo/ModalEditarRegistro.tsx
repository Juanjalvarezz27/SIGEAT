"use client"

import { useState, useEffect, useRef } from 'react'
import { X, AlertCircle, Plus, ChevronDown, ChevronUp, FileText, Palette } from 'lucide-react'
import useTasaBCV from '../../hooks/useTasaBCV'
import { 
  ModalEditarRegistroProps,
  RegistroVehiculoCompleto,
  FormularioDatos,
  Servicio,
  ServicioExtra,
  TipoVehiculo,
  EstadoCarro,
  EstadoPago
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
    color: '', // NUEVO: campo color agregado
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
      setForm({
        nombre: registro.nombre,
        cedula: registro.cedula,
        telefono: registro.telefono,
        placa: registro.placa,
        color: registro.color || '', // NUEVO: inicializar con valor del registro
        tipoVehiculoId: registro.tipoVehiculoId.toString(),
        servicioId: registro.servicioId.toString(),
        estadoCarroId: registro.estadoCarroId.toString(),
        estadoPagoId: registro.estadoPagoId.toString(),
        referenciaPago: registro.referenciaPago || '',
        notas: registro.notas || '',
        serviciosExtrasIds: registro.serviciosExtras.map(se => se.servicioExtra.id)
      })

      // Inicializar servicios extras seleccionados
      const extrasSeleccionados = registro.serviciosExtras
        .map(se => se.servicioExtra)
        .filter(extra => datosFormulario.serviciosExtras.some(de => de.id === extra.id))

      setServiciosExtrasSeleccionados(extrasSeleccionados)

      // Filtrar servicios según tipo de vehículo
      filtrarServicios(registro.tipoVehiculoId.toString())
    }
  }, [registro, datosFormulario])

  // Filtrar servicios según tipo de vehículo
  const filtrarServicios = (tipoVehiculoId: string) => {
    if (!datosFormulario || !tipoVehiculoId) {
      setServiciosFiltrados([])
      return
    }

    const tipoSeleccionado = datosFormulario.tiposVehiculo.find(t => t.id === parseInt(tipoVehiculoId))
    if (!tipoSeleccionado) return

    const serviciosFiltrados = datosFormulario.servicios.filter(
      servicio => servicio.categoria.nombre === tipoSeleccionado.categoria
    )

    setServiciosFiltrados(serviciosFiltrados)
  }

  // Calcular precio total
  useEffect(() => {
    if (!datosFormulario || !form.servicioId) {
      setPrecioTotal(0)
      setPrecioTotalBs(null)
      return
    }

    const servicio = datosFormulario.servicios.find(s => s.id === parseInt(form.servicioId))
    if (!servicio) return

    let total = Number(servicio.precio)

    // Sumar servicios extras
    serviciosExtrasSeleccionados.forEach(extra => {
      total += Number(extra.precio)
    })

    setPrecioTotal(total)

    // Calcular en Bs si hay tasa
    if (tasa) {
      setPrecioTotalBs(total * tasa)
    } else {
      setPrecioTotalBs(null)
    }
  }, [form.servicioId, serviciosExtrasSeleccionados, tasa, datosFormulario])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Validaciones específicas por campo
    let processedValue = value

    if (name === 'cedula' || name === 'telefono' || name === 'referenciaPago') {
      // Solo permitir números
      processedValue = value.replace(/[^0-9]/g, '')
    } else if (name === 'placa') {
      // Máximo 8 caracteres y convertir a mayúsculas
      processedValue = value.slice(0, 8).toUpperCase()
    }

    // Si cambia el tipo de vehículo, limpiar servicio seleccionado
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

    // Validación adicional
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

    // NUEVO: Validar campo color
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

      // Notificar éxito y cerrar modal
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
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl max-h-[90vh]">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Editar Registro
                </h2>
                <p className="text-gray-600 mt-1 text-sm">
                  {registro.placa} - {registro.nombre}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Contenido */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="px-6 py-4">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-red-700 font-medium">{error}</p>
                    {(form.cedula.length < 6 || form.telefono.length < 10 || form.placa.length < 5 || !form.color) && (
                      <ul className="mt-2 text-sm text-red-600 space-y-1">
                        {form.cedula.length < 6 && <li>• Cédula: mínimo 6 dígitos</li>}
                        {form.telefono.length < 10 && <li>• Teléfono: mínimo 10 dígitos</li>}
                        {form.placa.length < 5 && <li>• Placa: mínimo 5 caracteres</li>}
                        {!form.color && <li>• Color del vehículo: campo requerido</li>}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información del Cliente - CON CAMPO COLOR */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
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
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cédula *
                      </label>
                      <input
                        type="text"
                        name="cedula"
                        value={form.cedula}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        name="telefono"
                        value={form.telefono}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Placa *
                      </label>
                      <input
                        type="text"
                        name="placa"
                        value={form.placa}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition uppercase"
                      />
                    </div>
                    {/* NUEVO: Campo Color */}
                    <div className="sm:col-span-2">
                      <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Palette className="h-4 w-4 mr-2 text-blue-500" />
                        Color del Vehículo *
                      </label>
                      <input
                        type="text"
                        name="color"
                        value={form.color}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="Ej: Rojo, Azul, Negro, Blanco, Plateado..."
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Especifica el color principal del vehículo
                      </p>
                    </div>
                  </div>
                </div>

                {/* Información del Servicio */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Información del Servicio
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Vehículo *
                      </label>
                      <select
                        name="tipoVehiculoId"
                        value={form.tipoVehiculoId}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                      >
                        <option value="">Seleccionar tipo</option>
                        {datosFormulario.tiposVehiculo.map(tipo => (
                          <option key={tipo.id} value={tipo.id}>
                            {tipo.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Servicio *
                      </label>
                      <select
                        name="servicioId"
                        value={form.servicioId}
                        onChange={handleChange}
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
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                      >
                        {datosFormulario.estadosCarro.map(estado => (
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
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                      >
                        {datosFormulario.estadosPago.map(estado => (
                          <option key={estado.id} value={estado.id}>
                            {estado.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Servicios Extras - Desplegable y responsivo */}
                {datosFormulario.serviciosExtras.length > 0 && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setServiciosExtrasAbierto(!serviciosExtrasAbierto)}
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
                        {/* Grid responsivo para servicios extras */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {datosFormulario.serviciosExtras.map(extra => {
                            const isSelected = serviciosExtrasSeleccionados.some(se => se.id === extra.id)
                            return (
                              <div
                                key={extra.id}
                                className={`p-3 border rounded-xl cursor-pointer transition-all hover:shadow-sm ${
                                  isSelected
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                                onClick={() => handleServicioExtraChange(extra)}
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
                                          handleServicioExtraChange(extra)
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

                {/* Información Adicional desplegable */}
                <div>
                  <button
                    type="button"
                    onClick={() => setInfoAdicionalAbierto(!infoAdicionalAbierto)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition"
                  >
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-500 mr-3" />
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">Información Adicional </h3>
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
                            Referencia de Pago
                            <span className="text-xs text-gray-500 ml-1">(solo números, opcional)</span>
                          </label>
                          <input
                            type="text"
                            name="referenciaPago"
                            value={form.referenciaPago}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
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
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Resumen de Pago - CON TEXTO AJUSTADO */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Resumen de Pago
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 sm:p-5 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                      <div>
                        <span className="text-gray-700 text-sm sm:text-base">Subtotal servicios:</span>
                        <div className="text-xs sm:text-sm text-gray-600 mt-1">
                          Servicio principal
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-base sm:text-lg">
                          ${(precioTotal - serviciosExtrasTotal).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    {serviciosExtrasSeleccionados.length > 0 && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 text-sm sm:text-base">Servicios extras:</span>
                          <span className="font-semibold text-sm sm:text-base">+${serviciosExtrasTotal.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                    
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-gray-900 font-semibold text-base sm:text-lg">Total en USD:</span>
                      <span className="text-lg sm:text-xl font-bold text-blue-600">
                        ${precioTotal.toFixed(2)}
                      </span>
                    </div>
                    
                    {precioTotalBs !== null && (
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        {/* TEXTO MÁS PEQUEÑO para Total en Bolívares */}
                        <span className="text-gray-900 font-semibold text-sm sm:text-base">Total en Bs:</span>
                        <span className="text-base sm:text-lg font-bold text-green-600">
                          Bs {precioTotalBs.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="pt-4 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-3 sm:mt-0 inline-flex w-full justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:w-auto"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !form.color} // NUEVO: deshabilitar si no hay color
                    className={`inline-flex w-full justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto ${
                      loading || !form.color
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-linear-to-r from-blue-500 to-blue-600'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Guardando...
                      </span>
                    ) : (
                      'Guardar Cambios'
                    )}
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