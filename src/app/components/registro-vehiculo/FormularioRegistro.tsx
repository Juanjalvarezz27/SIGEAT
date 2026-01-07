"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { Car, AlertCircle, Search, Loader2, Sparkles, ArrowRight } from 'lucide-react'
import useTasaBCV from '../../hooks/useTasaBCV'
import { debounce } from 'lodash'
import CamposCliente from './formulario/CamposCliente'
import CamposServicio from './formulario/CamposServicio'
import CamposPago from './formulario/CamposPago'
import {
  FormularioDatos,
  RegistroForm,
  VehiculoEncontrado,
  ServicioExtra,
  Servicio
} from '../../types/formularioTypes'

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
    color: '',
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

  // Nuevos estados para la verificación de placa
  const [buscandoPlaca, setBuscandoPlaca] = useState(false)
  const [vehiculoEncontrado, setVehiculoEncontrado] = useState<VehiculoEncontrado | null>(null)
  const [mostrarFormularioCompleto, setMostrarFormularioCompleto] = useState(false)
  const [mensajePlaca, setMensajePlaca] = useState<string>('')

  const formRef = useRef<HTMLFormElement>(null)

  // Cargar datos del formulario solo una vez
  useEffect(() => {
    const fetchDatosFormulario = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/registros-vehiculos/datos-formulario')

        if (!response.ok) throw new Error('Error al cargar datos')

        const result = await response.json()
        const data = result.datosFormulario // Acceder a datosFormulario
        setDatos(data)

        // Encontrar IDs de estados "Pendiente"
        const estadoPendienteCarro = data.estadosCarro.find((e: any) => e.nombre.toLowerCase() === 'pendiente')
        const estadoPendientePago = data.estadosPago.find((e: any) => e.nombre.toLowerCase() === 'pendiente')

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
  }, [])

  // Función debounced para buscar placa
  const buscarPlaca = useCallback(
    debounce(async (placa: string) => {
      if (!placa || placa.length < 5) {
        setVehiculoEncontrado(null)
        setMensajePlaca('')
        return
      }

      setBuscandoPlaca(true)
      setMensajePlaca('')

      try {
        const response = await fetch(`/api/registros-vehiculos/verificar-placa?placa=${encodeURIComponent(placa)}`)

        if (!response.ok) {
          throw new Error('Error al buscar placa')
        }

        const data = await response.json()

        if (data.encontrado) {
          setVehiculoEncontrado(data.vehiculo)
          setMensajePlaca(data.mensaje)

          // Auto-completar información del cliente y color
          setForm(prev => ({
            ...prev,
            nombre: data.vehiculo.nombre,
            cedula: data.vehiculo.cedula,
            telefono: data.vehiculo.telefono,
            color: data.vehiculo.color || '',
            tipoVehiculoId: data.vehiculo.tipoVehiculoId.toString()
          }))

          // Mostrar formulario completo
          setTimeout(() => {
            setMostrarFormularioCompleto(true)
          }, 500)
        } else {
          setVehiculoEncontrado(null)
          setMensajePlaca(data.mensaje)
          // Mostrar formulario completo si no se encuentra
          setMostrarFormularioCompleto(true)
        }
      } catch (err) {
        console.error('Error al buscar placa:', err)
        setMensajePlaca('Error al verificar placa')
      } finally {
        setBuscandoPlaca(false)
      }
    }, 800), // Debounce de 800ms
    []
  )

  // Manejar cambio en campo placa (SIN ESPACIOS)
  const handlePlacaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Eliminar espacios y convertir a mayúsculas
    let value = e.target.value.replace(/\s/g, '').toUpperCase()

    // Limitar a 8 caracteres
    value = value.slice(0, 8)

    setForm(prev => ({ ...prev, placa: value }))
    setMensajePlaca('')
    setVehiculoEncontrado(null)

    // Resetear datos del cliente si se borra la placa
    if (value.length < 5) {
      setForm(prev => ({
        ...prev,
        nombre: '',
        cedula: '',
        telefono: '',
        color: '',
        tipoVehiculoId: ''
      }))
      setMostrarFormularioCompleto(false)
      return
    }

    // Si la placa tiene al menos 5 caracteres, buscar
    if (value.length >= 5) {
      buscarPlaca(value)
    }
  }

  // Manejar cambio general en formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Validaciones específicas por campo
    let processedValue = value

    if (name === 'cedula' || name === 'telefono' || name === 'referenciaPago') {
      // Solo permitir números
      processedValue = value.replace(/[^0-9]/g, '')
    } else if (name === 'placa') {
      // Eliminar espacios y convertir a mayúsculas
      processedValue = value.replace(/\s/g, '').toUpperCase().slice(0, 8)
    }

    setForm(prev => ({ ...prev, [name]: processedValue }))
  }

  // Filtrar servicios cuando cambia el tipo de vehículo
  useEffect(() => {
    if (!datos || !form.tipoVehiculoId) {
      setServiciosFiltrados([])
      return
    }

    const tipoSeleccionado = datos.tiposVehiculo.find(t => t.id === parseInt(form.tipoVehiculoId))
    if (!tipoSeleccionado) return

    // Filtrar servicios por categoría del tipo de vehículo
    // Agregar verificación de seguridad para categoria
    const serviciosFiltrados = datos.servicios.filter(
      servicio => servicio.categoria && 
                 servicio.categoria.nombre && 
                 servicio.categoria.nombre === tipoSeleccionado.categoria
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

    if (!form.color || form.color.trim() === '') {
      setError('El color del vehículo es requerido')
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
      const estadoPendienteCarro = datos?.estadosCarro.find((e: any) => e.nombre.toLowerCase() === 'pendiente')
      const estadoPendientePago = datos?.estadosPago.find((e: any) => e.nombre.toLowerCase() === 'pendiente')

      // Limpiar formulario
      setForm({
        nombre: '',
        cedula: '',
        telefono: '',
        placa: '',
        color: '',
        tipoVehiculoId: '',
        servicioId: '',
        estadoCarroId: estadoPendienteCarro ? estadoPendienteCarro.id.toString() : '',
        estadoPagoId: estadoPendientePago ? estadoPendientePago.id.toString() : '',
        referenciaPago: '',
        notas: '',
        serviciosExtrasIds: []
      })

      setVehiculoEncontrado(null)
      setMensajePlaca('')
      setMostrarFormularioCompleto(false)
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

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {/* Campo de Placa con Búsqueda (SIN ESPACIOS) */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Car className="h-5 w-5 mr-2 text-blue-500" />
            Verificar Placa del Vehículo
          </h3>
          <div className="bg-blue-50 rounded-xl p-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Placa del Vehículo *
                  <span className="text-xs text-gray-500 ml-1">(sin espacios)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="placa"
                    value={form.placa}
                    onChange={handlePlacaChange}
                    onKeyDown={(e) => {
                      // Prevenir la tecla espacio
                      if (e.key === ' ') {
                        e.preventDefault()
                      }
                    }}
                    onPaste={(e) => {
                      // Limpiar espacios al pegar
                      e.preventDefault()
                      const pastedText = e.clipboardData.getData('text/plain')
                      const cleanedText = pastedText.replace(/\s/g, '').toUpperCase().slice(0, 8)
                      const syntheticEvent = {
                        target: {
                          name: 'placa',
                          value: cleanedText
                        }
                      } as React.ChangeEvent<HTMLInputElement>
                      handlePlacaChange(syntheticEvent)
                    }}
                    required
                    minLength={5}
                    maxLength={8}
                    className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition uppercase font-medium tracking-wider"
                    placeholder="Ej: ABC123"
                    disabled={submitting}
                  />
                  <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  {buscandoPlaca && (
                    <Loader2 className="absolute right-3 top-3.5 h-4 w-4 text-blue-500 animate-spin" />
                  )}
                  {/* Contador de caracteres */}
                  <div className="absolute right-3 top-3.5 text-xs text-gray-400 font-mono">
                    {form.placa.length}/8
                  </div>
                </div>

                {/* Mensajes informativos */}
                <div className="mt-2 space-y-1">
                  {/* Mensaje sobre espacios */}
                  <div className="flex items-center text-xs text-gray-500">
                    <AlertCircle className="h-3 w-3 mr-1 shrink-0" />
                    <span>No se permiten espacios. La placa se convertirá automáticamente a mayúsculas.</span>
                  </div>

                  {/* Mensaje de búsqueda */}
                  {mensajePlaca && (
                    <div className={`text-sm font-medium p-2 rounded-lg ${
                      vehiculoEncontrado
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : form.placa.length >= 5
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    }`}>
                      <div className="flex items-center">
                        {vehiculoEncontrado ? (
                          <>
                            <Sparkles className="h-4 w-4 mr-2 shrink-0" />
                            {mensajePlaca}
                          </>
                        ) : form.placa.length >= 5 ? (
                          <>
                            <ArrowRight className="h-4 w-4 mr-2 shrink-0" />
                            {mensajePlaca}
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 mr-2 shrink-0" />
                            Ingresa al menos 5 caracteres para buscar
                          </>
                        )}
                      </div>
                      {vehiculoEncontrado && (
                        <div className="mt-1 text-xs text-green-600">
                          Se han precargado los datos del cliente
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Componentes del formulario completo */}
        {(mostrarFormularioCompleto || vehiculoEncontrado) && (
          <>
            {/* Componente CamposCliente */}
            <CamposCliente
              form={form}
              vehiculoEncontrado={vehiculoEncontrado}
              onChange={handleChange}
            />

            {/* Componente CamposServicio */}
            <CamposServicio
              form={form}
              datos={datos!}
              serviciosFiltrados={serviciosFiltrados}
              serviciosExtrasSeleccionados={serviciosExtrasSeleccionados}
              serviciosExtrasAbierto={serviciosExtrasAbierto}
              infoAdicionalAbierto={infoAdicionalAbierto}
              onServicioExtraChange={handleServicioExtraChange}
              onChange={handleChange}
              onToggleServiciosExtras={() => setServiciosExtrasAbierto(!serviciosExtrasAbierto)}
              onToggleInfoAdicional={() => setInfoAdicionalAbierto(!infoAdicionalAbierto)}
            />

            {/* Componente CamposPago */}
            <CamposPago
              form={form}
              datos={datos}
              serviciosFiltrados={serviciosFiltrados}
              serviciosExtrasSeleccionados={serviciosExtrasSeleccionados}
              precioServicio={precioServicio}
              precioTotal={precioTotal}
              precioTotalBs={precioTotalBs}
              tasa={tasa}
              loadingTasa={loadingTasa}
            />

            {/* Botón de enviar */}
            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting || !form.servicioId || !form.color}
                className={`w-full px-6 py-3.5 rounded-xl font-semibold text-lg transition ${
                  submitting || !form.servicioId || !form.color
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
          </>
        )}
      </form>
    </div>
  )
}