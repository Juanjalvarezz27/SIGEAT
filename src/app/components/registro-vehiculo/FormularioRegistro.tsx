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
        const data = result.datosFormulario
        setDatos(data)

        const estadoPendienteCarro = data.estadosCarro.find((e: any) => e.nombre.toLowerCase() === 'pendiente')
        const estadoPendientePago = data.estadosPago.find((e: any) => e.nombre.toLowerCase() === 'pendiente')

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

  // Efecto para limpiar datos del cliente cuando se borra la placa
  useEffect(() => {
    const MIN_CARACTERES_BUSQUEDA = 6

    if ((form.placa === '' || form.placa.length < MIN_CARACTERES_BUSQUEDA) &&
      (form.nombre || form.cedula || form.telefono || form.color || form.tipoVehiculoId)) {
      
      setForm(prev => ({
        ...prev,
        nombre: '',
        cedula: '',
        telefono: '',
        color: '',
        tipoVehiculoId: ''
      }))
      setVehiculoEncontrado(null)
      setMostrarFormularioCompleto(false)
      setMensajePlaca('')
    }
  }, [form.placa])

  // Función debounced para buscar placa - Memorizada para evitar recreación
  const buscarPlaca = useCallback(
    debounce(async (placa: string) => {
      const MIN_CARACTERES_BUSQUEDA = 6

      if (!placa || placa.length < MIN_CARACTERES_BUSQUEDA) {
        setVehiculoEncontrado(null)
        setMensajePlaca('')
        return
      }

      setBuscandoPlaca(true)
      setMensajePlaca('')

      try {
        const response = await fetch(`/api/registros-vehiculos/verificar-placa?placa=${encodeURIComponent(placa)}`)

        if (!response.ok) throw new Error('Error al buscar placa')

        const data = await response.json()

        if (data.encontrado) {
          setVehiculoEncontrado(data.vehiculo)
          setMensajePlaca(data.mensaje)

          setForm(prev => ({
            ...prev,
            nombre: data.vehiculo.nombre,
            cedula: data.vehiculo.cedula,
            telefono: data.vehiculo.telefono,
            color: data.vehiculo.color || '',
            tipoVehiculoId: data.vehiculo.tipoVehiculoId.toString()
          }))

          // Sin timeout para respuesta inmediata
          setMostrarFormularioCompleto(true)
        } else {
          setVehiculoEncontrado(null)
          setMensajePlaca(data.mensaje)
          setMostrarFormularioCompleto(true)
        }
      } catch (err) {
        console.error('Error al buscar placa:', err)
        setMensajePlaca('Error al verificar placa')
      } finally {
        setBuscandoPlaca(false)
      }
    }, 800),
    []
  )

  const handlePlacaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, '').toUpperCase()
    value = value.slice(0, 8)

    setForm(prev => ({ ...prev, placa: value }))

    const MIN_CARACTERES_BUSQUEDA = 6
    if (value.length >= MIN_CARACTERES_BUSQUEDA) {
      buscarPlaca(value)
    } else {
      setMensajePlaca('')
    }
  }, [buscarPlaca])

  // Memorizar handleChange para evitar re-renderizados innecesarios en hijos
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    let processedValue = value

    if (name === 'cedula' || name === 'telefono' || name === 'referenciaPago') {
      processedValue = value.replace(/[^0-9]/g, '')
    } else if (name === 'placa') {
      processedValue = value.replace(/\s/g, '').toUpperCase().slice(0, 8)
    }

    setForm(prev => ({ ...prev, [name]: processedValue }))
  }, [])

  useEffect(() => {
    if (!datos || !form.tipoVehiculoId) {
      setServiciosFiltrados([])
      return
    }

    const tipoSeleccionado = datos.tiposVehiculo.find(t => t.id === parseInt(form.tipoVehiculoId))
    if (!tipoSeleccionado) return

    const serviciosFiltrados = datos.servicios.filter(
      servicio => servicio.categoria &&
        servicio.categoria.nombre &&
        servicio.categoria.nombre === tipoSeleccionado.categoria
    )

    setServiciosFiltrados(serviciosFiltrados)

    if (form.servicioId && !serviciosFiltrados.some(s => s.id === parseInt(form.servicioId))) {
      setForm(prev => ({ ...prev, servicioId: '' }))
    }
  }, [form.tipoVehiculoId, datos])

  useEffect(() => {
    if (!datos || !form.servicioId) {
      setPrecioTotal(0)
      setPrecioTotalBs(null)
      return
    }

    const servicio = datos.servicios.find(s => s.id === parseInt(form.servicioId))
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
  }, [form.servicioId, serviciosExtrasSeleccionados, tasa, datos])

  const handleServicioExtraChange = useCallback((servicioExtra: ServicioExtra) => {
    setServiciosExtrasSeleccionados(prevSeleccionados => {
      const isSelected = prevSeleccionados.some(se => se.id === servicioExtra.id)
      
      let nuevosSeleccionados;
      if (isSelected) {
        nuevosSeleccionados = prevSeleccionados.filter(se => se.id !== servicioExtra.id)
      } else {
        nuevosSeleccionados = [...prevSeleccionados, servicioExtra]
      }

      // Actualizar form dentro del callback para asegurar sincronía
      setForm(prevForm => ({
        ...prevForm,
        serviciosExtrasIds: nuevosSeleccionados.map(s => s.id)
      }))

      return nuevosSeleccionados
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const MIN_CARACTERES_PLACA = 6

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

    if (!form.placa || form.placa.length < MIN_CARACTERES_PLACA || form.placa.length > 8) {
      setError('La placa debe tener entre 6 y 8 caracteres')
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

      const estadoPendienteCarro = datos?.estadosCarro.find((e: any) => e.nombre.toLowerCase() === 'pendiente')
      const estadoPendientePago = datos?.estadosPago.find((e: any) => e.nombre.toLowerCase() === 'pendiente')

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
      setError(null)

      onRegistroCreado()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear registro')
    } finally {
      setSubmitting(false)
    }
  }

  const getPrecioServicioSeleccionado = () => {
    if (!datos || !form.servicioId) return 0
    const servicio = datos.servicios.find(s => s.id === parseInt(form.servicioId))
    return servicio ? Number(servicio.precio) : 0
  }

  const precioServicio = getPrecioServicioSeleccionado()

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-100 rounded-xl w-1/3"></div>
          <div className="space-y-4">
            <div className="h-12 bg-slate-50 rounded-xl"></div>
            <div className="h-12 bg-slate-50 rounded-xl"></div>
            <div className="h-12 bg-slate-50 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  const MIN_CARACTERES_BUSQUEDA = 6

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-red-700 font-bold text-sm">Error en el formulario</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
        {/* Campo de Placa con Búsqueda (SIN ESPACIOS) */}
        <div>
          <h3 className="text-base font-bold text-[#140f07] mb-4 flex items-center gap-2">
            <div className="p-1.5 bg-[#e2e2f6] rounded-lg">
                <Car className="h-4 w-4 text-[#4260ad]" />
            </div>
            Verificar Placa del Vehículo
          </h3>
          
          <div className="bg-[#f4f6fc] rounded-2xl p-5 border border-[#869dfc]/20">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-[#122a4e] uppercase tracking-wider mb-1.5 ml-1">
                  Placa del Vehículo *
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    name="placa"
                    value={form.placa}
                    onChange={handlePlacaChange}
                    onKeyDown={(e) => {
                      if (e.key === ' ') e.preventDefault()
                    }}
                    onPaste={(e) => {
                      e.preventDefault()
                      const pastedText = e.clipboardData.getData('text/plain')
                      const cleanedText = pastedText.replace(/\s/g, '').toUpperCase().slice(0, 8)
                      const syntheticEvent = { target: { name: 'placa', value: cleanedText } } as React.ChangeEvent<HTMLInputElement>
                      handlePlacaChange(syntheticEvent)
                    }}
                    required
                    minLength={MIN_CARACTERES_BUSQUEDA}
                    maxLength={8}
                    // OPTIMIZACIÓN: Removed transition-all, focus:ring. Added transition-colors only.
                    className="w-full px-4 py-3.5 pl-11 bg-white border border-transparent rounded-xl focus:border-[#869dfc] focus:outline-none text-[#140f07] placeholder-slate-400 font-black text-lg tracking-widest uppercase transition-colors duration-100 shadow-sm"
                    placeholder="ABC123"
                    disabled={submitting}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                     {buscandoPlaca ? (
                        <Loader2 className="h-5 w-5 text-[#4260ad] animate-spin" />
                     ) : (
                        <Search className="h-5 w-5 text-slate-400 group-focus-within:text-[#4260ad] transition-colors" />
                     )}
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-300">
                    {form.placa.length}/8
                  </div>
                </div>

                {/* Mensajes informativos - Sin animaciones CSS pesadas */}
                <div className="mt-3 space-y-2">
                  {mensajePlaca && (
                    <div className={`text-sm font-medium p-3 rounded-xl flex items-center gap-2 ${
                      vehiculoEncontrado
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : form.placa.length >= MIN_CARACTERES_BUSQUEDA
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {vehiculoEncontrado ? (
                        <Sparkles className="h-4 w-4 shrink-0" />
                      ) : form.placa.length >= MIN_CARACTERES_BUSQUEDA ? (
                        <ArrowRight className="h-4 w-4 shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 shrink-0" />
                      )}
                      {mensajePlaca}
                    </div>
                  )}
                  
                  {vehiculoEncontrado && (
                    <div className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg w-fit">
                      Datos del cliente cargados automáticamente
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Componentes del formulario completo */}
        {(mostrarFormularioCompleto || vehiculoEncontrado) && (
          <div className="space-y-8">
            
            <CamposCliente
              form={form}
              vehiculoEncontrado={vehiculoEncontrado}
              onChange={handleChange}
            />

            <CamposServicio
              form={form}
              datos={datos!}
              serviciosFiltrados={serviciosFiltrados}
              serviciosExtrasSeleccionados={serviciosExtrasSeleccionados}
              serviciosExtrasAbierto={serviciosExtrasAbierto}
              infoAdicionalAbierto={infoAdicionalAbierto}
              vehiculoEncontrado={vehiculoEncontrado}
              onServicioExtraChange={handleServicioExtraChange}
              onChange={handleChange}
              onToggleServiciosExtras={() => setServiciosExtrasAbierto(!serviciosExtrasAbierto)}
              onToggleInfoAdicional={() => setInfoAdicionalAbierto(!infoAdicionalAbierto)}
            />

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
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting || !form.servicioId || !form.color}
                className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-transform active:scale-[0.99] flex items-center justify-center gap-3 ${
                  submitting || !form.servicioId || !form.color
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-[#4260ad] text-white hover:bg-[#122a4e] shadow-[#4260ad]/30'
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Registrar Vehículo'
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}