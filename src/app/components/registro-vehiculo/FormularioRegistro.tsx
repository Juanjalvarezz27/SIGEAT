"use client"

import { useState, useEffect, useRef } from 'react'
import { Car, DollarSign, Calendar, Phone, User, AlertCircle, ChevronDown, ChevronUp, Plus, FileText } from 'lucide-react'
import useTasaBCV from '../../hooks/useTasaBCV'

interface TipoVehiculo {
  id: number
  nombre: string
  categoria: string
}

interface Servicio {
  id: number
  nombre: string
  precio: number
  categoriaId: number
  categoria: {
    id: number
    nombre: string
  }
}

interface EstadoCarro {
  id: number
  nombre: string
}

interface EstadoPago {
  id: number
  nombre: string
}

interface ServicioExtra {
  id: number
  nombre: string
  precio: number
  descripcion?: string
}

interface CategoriaServicio {
  id: number
  nombre: string
  servicios: Servicio[]
}

interface FormularioDatos {
  tiposVehiculo: TipoVehiculo[]
  servicios: Servicio[]
  estadosCarro: EstadoCarro[]
  estadosPago: EstadoPago[]
  serviciosExtras: ServicioExtra[]
  categorias: CategoriaServicio[]
}

interface RegistroForm {
  nombre: string
  cedula: string
  telefono: string
  placa: string
  tipoVehiculoId: string
  servicioId: string
  estadoCarroId: string
  estadoPagoId: string
  referenciaPago: string
  notas: string
  serviciosExtrasIds: number[]
}

interface FormularioRegistroProps {
  onRegistroCreado: () => void
}

export default function FormularioRegistro({ onRegistroCreado }: FormularioRegistroProps) {
  const { tasa, loading: loadingTasa } = useTasaBCV()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [datos, setDatos] = useState<FormularioDatos | null>(null)
  const [form, setForm] = useState<RegistroForm>({
    nombre: '',
    cedula: '',
    telefono: '',
    placa: '',
    tipoVehiculoId: '',
    servicioId: '',
    estadoCarroId: '',
    estadoPagoId: '',
    referenciaPago: '',
    notas: '',
    serviciosExtrasIds: []
  })

  const [serviciosFiltrados, setServiciosFiltrados] = useState<Servicio[]>([])
  const [serviciosExtrasSeleccionados, setServiciosExtrasSeleccionados] = useState<ServicioExtra[]>([])
  const [serviciosExtrasAbierto, setServiciosExtrasAbierto] = useState(false)
  const [infoAdicionalAbierto, setInfoAdicionalAbierto] = useState(false)
  const [precioTotal, setPrecioTotal] = useState(0)
  const [precioTotalBs, setPrecioTotalBs] = useState<number | null>(null)

  const formRef = useRef<HTMLFormElement>(null)

  // Cargar datos del formulario solo una vez
  useEffect(() => {
    const fetchDatosFormulario = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/registros-vehiculos/datos-formulario')

        if (!response.ok) throw new Error('Error al cargar datos')

        const data = await response.json()
        setDatos(data)

        // Encontrar IDs de estados "Pendiente"
        const estadoPendienteCarro = data.estadosCarro.find((e: EstadoCarro) => e.nombre.toLowerCase() === 'pendiente')
        const estadoPendientePago = data.estadosPago.find((e: EstadoPago) => e.nombre.toLowerCase() === 'pendiente')

        // Actualizar el formulario con los estados por defecto
        setForm(prev => ({
          ...prev,
          estadoCarroId: estadoPendienteCarro ? estadoPendienteCarro.id.toString() :
            data.estadosCarro.length > 0 ? data.estadosCarro[0].id.toString() : '',
          estadoPagoId: estadoPendientePago ? estadoPendientePago.id.toString() :
            data.estadosPago.length > 0 ? data.estadosPago[0].id.toString() : ''
        }))
      } catch (err) {
        setError('Error al cargar los datos del formulario')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchDatosFormulario()
  }, []) // Solo se ejecuta una vez al montar

  // Filtrar servicios cuando cambia el tipo de vehículo
  useEffect(() => {
    if (!datos || !form.tipoVehiculoId) {
      setServiciosFiltrados([])
      return
    }

    const tipoSeleccionado = datos.tiposVehiculo.find(t => t.id === parseInt(form.tipoVehiculoId))
    if (!tipoSeleccionado) return

    // Filtrar servicios por categoría del tipo de vehículo
    const serviciosFiltrados = datos.servicios.filter(
      servicio => servicio.categoria.nombre === tipoSeleccionado.categoria
    )

    setServiciosFiltrados(serviciosFiltrados)

    // Limpiar servicio seleccionado si no está en los filtrados
    if (form.servicioId && !serviciosFiltrados.some(s => s.id === parseInt(form.servicioId))) {
      setForm(prev => ({ ...prev, servicioId: '' }))
    }
  }, [form.tipoVehiculoId, datos])

  // Calcular precio total
  useEffect(() => {
    if (!datos || !form.servicioId) {
      setPrecioTotal(0)
      setPrecioTotalBs(null)
      return
    }

    const servicio = datos.servicios.find(s => s.id === parseInt(form.servicioId))
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
  }, [form.servicioId, serviciosExtrasSeleccionados, tasa, datos])

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

    setForm(prev => ({ ...prev, [name]: processedValue }))
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
    setSubmitting(true)
    setError(null)

    // Validación adicional
    if (!form.cedula || form.cedula.length < 6) {
      setError('La cédula debe tener al menos 6 dígitos')
      setSubmitting(false)
      return
    }

    if (!form.telefono || form.telefono.length < 10) {
      setError('El teléfono debe tener al menos 10 dígitos')
      setSubmitting(false)
      return
    }

    if (!form.placa || form.placa.length < 5) {
      setError('La placa debe tener entre 5 y 8 caracteres')
      setSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/registros-vehiculos', {
        method: 'POST',
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
        throw new Error(errorData.error || 'Error al crear registro')
      }

      // Encontrar IDs de estados "Pendiente" para resetear
      const estadoPendienteCarro = datos?.estadosCarro.find(e => e.nombre.toLowerCase() === 'pendiente')
      const estadoPendientePago = datos?.estadosPago.find(e => e.nombre.toLowerCase() === 'pendiente')

      // Limpiar formulario
      setForm({
        nombre: '',
        cedula: '',
        telefono: '',
        placa: '',
        tipoVehiculoId: '',
        servicioId: '',
        estadoCarroId: estadoPendienteCarro ? estadoPendienteCarro.id.toString() : '',
        estadoPagoId: estadoPendientePago ? estadoPendientePago.id.toString() : '',
        referenciaPago: '',
        notas: '',
        serviciosExtrasIds: []
      })
      setServiciosExtrasSeleccionados([])
      setServiciosExtrasAbierto(false)
      setInfoAdicionalAbierto(false)

      // Notificar a la página principal
      onRegistroCreado()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear registro')
    } finally {
      setSubmitting(false)
    }
  }

  const serviciosExtrasTotal = serviciosExtrasSeleccionados.reduce((sum, extra) => sum + Number(extra.precio), 0)

  // Función para obtener el precio del servicio seleccionado
  const getPrecioServicioSeleccionado = () => {
    if (!datos || !form.servicioId) return 0
    const servicio = datos.servicios.find(s => s.id === parseInt(form.servicioId))
    return servicio ? Number(servicio.precio) : 0
  }

  const precioServicio = getPrecioServicioSeleccionado()

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-red-700 font-medium">{error}</p>
            {(form.cedula.length < 6 || form.telefono.length < 10 || form.placa.length < 5) && (
              <ul className="mt-2 text-sm text-red-600 space-y-1">
                {form.cedula.length < 6 && <li>• Cédula: mínimo 6 dígitos</li>}
                {form.telefono.length < 10 && <li>• Teléfono: mínimo 10 dígitos</li>}
                {form.placa.length < 5 && <li>• Placa: mínimo 5 caracteres</li>}
              </ul>
            )}
          </div>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {/* Información del Cliente */}
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
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
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
                onChange={handleChange}
                required
                minLength={6}
                maxLength={8}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="12345678"
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
                onChange={handleChange}
                required
                minLength={10}
                maxLength={11}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="04121234567"
              />
              {form.telefono && form.telefono.length < 10 && (
                <p className="mt-1 text-xs text-red-500">Mínimo 10 dígitos</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placa del Vehículo *
                <span className="text-xs text-gray-500 ml-1">(máx. 8 caracteres)</span>
              </label>
              <input
                type="text"
                name="placa"
                value={form.placa}
                onChange={handleChange}
                required
                minLength={5}
                maxLength={8}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition uppercase font-medium"
                placeholder="ABC-123"
              />
              <div className="mt-1 flex justify-between">
                {form.placa && form.placa.length < 5 && (
                  <span className="text-xs text-red-500">Mínimo 5 caracteres</span>
                )}
              </div>
            </div>
          </div>
        </div>

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
              </label>
              <select
                name="tipoVehiculoId"
                value={form.tipoVehiculoId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
              >
                <option value="">Seleccionar tipo</option>
                {datos?.tiposVehiculo.map(tipo => (
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
                onChange={handleChange}
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

        {/* Servicios Extras - En tarjetas responsivas */}
        {datos?.serviciosExtras && datos.serviciosExtras.length > 0 && (
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
                    Referencia de Pago (Opcional)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="referenciaPago"
                    value={form.referenciaPago}
                    onChange={handleChange}
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
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                    placeholder="Observaciones adicionales..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Información de Pago */}
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

            {/* Total en Bs - TEXTO MÁS PEQUEÑO */}
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

        {/* Botón de enviar */}
        <div className="pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={submitting || !form.servicioId}
            className={`w-full px-6 py-3.5 rounded-xl font-semibold text-lg transition ${
              submitting || !form.servicioId
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-linear-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg'
            }`}
          >
            {submitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Procesando...
              </span>
            ) : (
              'Registrar Vehículo'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}