"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { Car, Clock, DollarSign, CheckCircle, XCircle, AlertCircle, RefreshCw, Edit, Trash2, Hourglass, Wrench, CheckCheck, User, Phone, CreditCard, MessageCircle, ChevronDown, ChevronUp, Receipt, FileText, Palette, Search } from 'lucide-react'
import ModalEditarRegistro from './ModalEditarRegistro'
import ModalConfirmacion from '../ui/ModalConfirmacion'
import BuscadorVehiculos from '../vehiculos/BuscadorVehiculos'
import { toast } from 'react-toastify'
import {
  RegistroVehiculoCompleto,
  ListaRegistrosProps,
  FormularioDatos
} from '../../types/formularioTypes'

export default function ListaRegistros({ refreshKey = 0, onRegistrosChange }: ListaRegistrosProps) {
  const [registros, setRegistros] = useState<RegistroVehiculoCompleto[]>([])
  const [registrosOriginales, setRegistrosOriginales] = useState<RegistroVehiculoCompleto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [datosFormulario, setDatosFormulario] = useState<FormularioDatos | null>(null)
  const [registroEditando, setRegistroEditando] = useState<RegistroVehiculoCompleto | null>(null)
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false)
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false)
  const [registroAEliminar, setRegistroAEliminar] = useState<RegistroVehiculoCompleto | null>(null)

  // Estados para el buscador
  const [buscando, setBuscando] = useState(false)
  const [busqueda, setBusqueda] = useState({
    termino: '',
    tipo: 'placa'
  })

  // Estado para controlar qué registros tienen el desplegable abierto
  const [desplegablesAbiertos, setDesplegablesAbiertos] = useState<{ [key: number]: boolean }>({})

  // Referencia para evitar doble toast
  const toastShownRef = useRef(false)

  // Función para normalizar texto (sin acentos, minúsculas)
  const normalizarTexto = useCallback((texto: string): string => {
    if (!texto) return ''

    return texto
      .toLowerCase()
      .normalize('NFD') // Separar acentos
      .replace(/[\u0300-\u036f]/g, '') // Eliminar diacríticos
      .trim()
  }, [])

  // Cargar datos del formulario
  useEffect(() => {
    const fetchDatosFormulario = async () => {
      try {
        const response = await fetch('/api/registros-vehiculos/datos-formulario')
        if (response.ok) {
          const result = await response.json()
          setDatosFormulario(result.datosFormulario)
        }
      } catch (err) {
        console.error('Error al cargar datos del formulario:', err)
      }
    }

    fetchDatosFormulario()
  }, [])

  const fetchRegistros = async () => {
    try {
      setRefreshing(true)
      const response = await fetch('/api/registros-vehiculos')

      if (!response.ok) throw new Error('Error al cargar registros')

      const data = await response.json()
      setRegistros(data)
      setRegistrosOriginales(data)
      setError(null)

      // Resetear desplegables cuando se cargan nuevos registros
      setDesplegablesAbiertos({})

      // Notificar estadísticas
      if (onRegistrosChange && typeof onRegistrosChange === 'function') {
        const totalRegistros = data.length
        const totalIngresos = data.reduce((sum: number, reg: any) => sum + Number(reg.precioTotal), 0)
        onRegistrosChange({ totalRegistros, totalIngresos })
      }
    } catch (err) {
      setError('Error al cargar los registros del día')
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Cargar registros al montar o cuando cambie refreshKey
  useEffect(() => {
    fetchRegistros()
  }, [refreshKey])

  // Función para realizar la búsqueda (llamada desde BuscadorVehiculos)
  const realizarBusqueda = useCallback((termino: string, tipo: string) => {
    // Si no hay término, mostrar todos los registros
    if (termino.trim() === '') {
      setRegistros(registrosOriginales)
      setBuscando(false)

      // Actualizar estadísticas
      if (onRegistrosChange && registrosOriginales.length > 0) {
        const totalRegistros = registrosOriginales.length
        const totalIngresos = registrosOriginales.reduce((sum, reg) => sum + Number(reg.precioTotal), 0)
        onRegistrosChange({ totalRegistros, totalIngresos })
      }
      return
    }

    setBuscando(true)

    // Normalizar el término de búsqueda
    const terminoNormalizado = normalizarTexto(termino)

    // Filtrar registros
    const resultados = registrosOriginales.filter(registro => {
      let valor: string = ''

      switch (tipo) {
        case 'placa':
          valor = normalizarTexto(registro.placa || '')
          break
        case 'nombre':
          valor = normalizarTexto(registro.nombre || '')
          break
        case 'cedula':
          valor = normalizarTexto(registro.cedula || '')
          break
        default:
          valor = normalizarTexto(registro.placa || '')
      }

      return valor.includes(terminoNormalizado)
    })

    setRegistros(resultados)

    // Actualizar estadísticas con resultados filtrados
    if (onRegistrosChange) {
      const totalRegistros = resultados.length
      const totalIngresos = resultados.reduce((sum, reg) => sum + Number(reg.precioTotal), 0)
      onRegistrosChange({ totalRegistros, totalIngresos })
    }

    setBuscando(false)
  }, [registrosOriginales, onRegistrosChange, normalizarTexto])

  // Función para manejar la búsqueda desde el componente BuscadorVehiculos
  const handleBuscar = useCallback((termino: string, tipo: string) => {
    // Actualizar estado de búsqueda
    setBusqueda({ termino, tipo })

    // Ejecutar búsqueda
    realizarBusqueda(termino, tipo)
  }, [realizarBusqueda])

  const handleRefresh = async () => {
    await fetchRegistros()
    // Limpiar búsqueda al refrescar
    setBusqueda({ termino: '', tipo: 'placa' })
  }

  const handleEditar = (registro: RegistroVehiculoCompleto) => {
    setRegistroEditando(registro)
    setModalEditarAbierto(true)
  }

  const handleEliminarClick = (registro: RegistroVehiculoCompleto) => {
    setRegistroAEliminar(registro)
    setModalEliminarAbierto(true)
  }

  const handleEliminarConfirmado = async () => {
    if (!registroAEliminar) return

    try {
      const response = await fetch(`/api/registros-vehiculos/${registroAEliminar.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar registro')
      }

      await fetchRegistros()
      toastShownRef.current = false

      if (!toastShownRef.current) {
        toastShownRef.current = true
        toast.success('¡Registro eliminado con éxito!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        })

        setTimeout(() => {
          toastShownRef.current = false
        }, 100)
      }

    } catch (err) {
      setError('Error al eliminar el registro')
      console.error(err)

      if (!toastShownRef.current) {
        toastShownRef.current = true
        toast.error('Error al eliminar el registro', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        })

        setTimeout(() => {
          toastShownRef.current = false
        }, 100)
      }
    }
  }

  const handleUpdate = async () => {
    await fetchRegistros()
    toastShownRef.current = false

    if (!toastShownRef.current) {
      toastShownRef.current = true
      toast.success('¡Registro actualizado con éxito!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })

      setTimeout(() => {
        toastShownRef.current = false
      }, 100)
    }
  }

  const formatFecha = (fechaString: string) => {
    try {
      const fecha = new Date(fechaString)

      if (isNaN(fecha.getTime())) {
        return 'Hora inválida'
      }

      const fechaAjustada = new Date(fecha.getTime() + (4 * 60 * 60 * 1000))

      return fechaAjustada.toLocaleString('es-VE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    } catch (error) {
      console.error('Error al formatear fecha:', error, fechaString)
      return 'Error'
    }
  }

  const formatTelefonoWhatsApp = (telefono: string): string => {
    let numeroLimpio = telefono.replace(/[\s\-\(\)]/g, '')

    if (numeroLimpio.startsWith('0')) {
      numeroLimpio = numeroLimpio.substring(1)
    }

    if (numeroLimpio.startsWith('58')) {
      return `+${numeroLimpio}`
    }

    if (numeroLimpio.startsWith('4')) {
      return `+58${numeroLimpio}`
    }

    return numeroLimpio
  }

const abrirWhatsApp = (registro: RegistroVehiculoCompleto) => {
  const numeroWhatsApp = formatTelefonoWhatsApp(registro.telefono);
  
  const categoriaServicio = registro.servicio.categoria?.nombre || '';
  
  // Construir sección de servicios extras si existen
  let serviciosExtrasTexto = '';
  if (registro.serviciosExtras.length > 0) {
    const extras = registro.serviciosExtras.map(extra => extra.servicioExtra.nombre).join(', ');
    serviciosExtrasTexto = `\n• *Servicios extras:* ${extras}`;
  }
  
  // Construir sección de precio
  const precioTexto = registro.precioTotalBs 
    ? `\n• *Total:* $${Number(registro.precioTotal).toFixed(2)} (Bs ${Number(registro.precioTotalBs).toFixed(2)})`
    : `\n• *Total:* $${Number(registro.precioTotal).toFixed(2)}`;
  
  // Construir sección de notas si existen
  let notasTexto = '';
  if (registro.notas && registro.notas.trim() !== '') {
    notasTexto = `\n\n*Notas adicionales:*\n${registro.notas}`;
  }
  
  const mensaje = encodeURIComponent(
`Hola ${registro.nombre}, somos Nova Cars.

Le informamos que su vehículo ya está listo y puede pasar a recogerlo cuando desee.

*Detalles del servicio:*

• *Vehículo:* ${registro.placa} (${registro.tipoVehiculo.nombre})
• *Color:* ${registro.color || 'No especificado'}
• *Servicio:* ${registro.servicio.nombre}${categoriaServicio ? ` (${categoriaServicio})` : ''}${serviciosExtrasTexto}${precioTexto}
• *Estado:* ${registro.estadoCarro.nombre}
• *Estado de pago:* ${registro.estadoPago.nombre}${notasTexto}

*¡Gracias por confiar en Nova Cars!*`
  );

  window.open(`https://wa.me/${numeroWhatsApp}?text=${mensaje}`, '_blank');
};

  const getEstadoPagoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pagado':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'pendiente':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'cancelado':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getEstadoPagoIcon = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pagado':
        return <CheckCircle className="h-3.5 w-3.5 mr-1" />
      case 'pendiente':
        return <Clock className="h-3.5 w-3.5 mr-1" />
      case 'cancelado':
        return <XCircle className="h-3.5 w-3.5 mr-1" />
      default:
        return null
    }
  }

  const getEstadoCarroColor = (estado: string, id: number) => {
    switch (id) {
      case 1:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 2:
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 3:
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getEstadoCarroIcon = (id: number) => {
    switch (id) {
      case 1:
        return <Hourglass className="h-3.5 w-3.5 mr-1" />
      case 2:
        return <Wrench className="h-3.5 w-3.5 mr-1" />
      case 3:
        return <CheckCheck className="h-3.5 w-3.5 mr-1" />
      default:
        return null
    }
  }

  const toggleDesplegable = (registroId: number) => {
    setDesplegablesAbiertos(prev => ({
      ...prev,
      [registroId]: !prev[registroId]
    }))
  }

  const tieneInformacionAdicional = (registro: RegistroVehiculoCompleto) => {
    return (registro.referenciaPago && registro.referenciaPago.trim() !== '') ||
           (registro.notas && registro.notas.trim() !== '')
  }

  if (loading && registros.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error && registros.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="text-center py-6">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900 mb-2">Error al cargar registros</h3>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center mx-auto text-sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Componente de búsqueda separado */}
      <BuscadorVehiculos
        onBuscar={handleBuscar}
        cargando={buscando}
        busquedaActual={busqueda}
      />

      <div className="space-y-3">
        {/* Contador de registros */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs sm:text-sm text-gray-600">
            Mostrando <span className="font-semibold">{registros.length}</span> registro{registros.length !== 1 ? 's' : ''}
            {busqueda.termino && registrosOriginales.length > 0 && (
              <span className="text-gray-400 ml-2">
                (de {registrosOriginales.length} total)
              </span>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            title="Actualizar lista"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {registros.length === 0 ? (
          <div className="text-center py-8">
            {busqueda.termino ? (
              <>
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-900 mb-1">No se encontraron resultados</h3>
                <p className="text-gray-600 text-sm mb-4">
                  No hay registros que coincidan con "<span className="font-medium">{busqueda.termino}</span>"
                  en {busqueda.tipo === 'placa' ? 'placas' : busqueda.tipo === 'nombre' ? 'nombres' : 'cédulas'}
                </p>
                <button
                  onClick={() => handleBuscar('', busqueda.tipo)}
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                >
                  Mostrar todos los registros
                </button>
              </>
            ) : (
              <>
                <Car className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-900 mb-1">No hay registros hoy</h3>
                <p className="text-gray-600 text-sm">Los registros del día aparecerán aquí</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {registros.map(registro => {
              const tieneInfoAdicional = tieneInformacionAdicional(registro)
              const desplegableAbierto = desplegablesAbiertos[registro.id] || false

              return (
                <div
                  key={registro.id}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-4 hover:border-gray-300 transition hover:shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                        <Car className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
                      </div>
                      <div>
                        <div className="flex flex-col">
                          <span className="font-bold text-base sm:text-lg text-gray-900">{registro.placa}</span>
                          <div className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
                            <span>{registro.tipoVehiculo.nombre}</span>
                            {registro.color && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="flex items-center">
                                  <Palette className="h-3 w-3 mr-1 text-gray-400" />
                                  {registro.color}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditar(registro)}
                        className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        aria-label="Editar registro"
                      >
                        <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                      <button
                        onClick={() => handleEliminarClick(registro)}
                        className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        aria-label="Eliminar registro"
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{registro.nombre}</p>
                          <p className="text-sm text-gray-500 font-mono">{registro.cedula}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span>{formatFecha(registro.fechaHora)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-start">
                          <CreditCard className="h-4 w-4 text-blue-500 mr-2 mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-blue-700 font-medium">Servicio</p>
                            <p className="text-sm font-semibold text-blue-600 truncate">{registro.servicio.nombre}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Estado carro:</span>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                            getEstadoCarroColor(registro.estadoCarro.nombre, registro.estadoCarro.id)
                          }`}>
                            {getEstadoCarroIcon(registro.estadoCarro.id)}
                            <span>{registro.estadoCarro.nombre}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Estado pago:</span>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                            getEstadoPagoColor(registro.estadoPago.nombre)
                          }`}>
                            {getEstadoPagoIcon(registro.estadoPago.nombre)}
                            <span>{registro.estadoPago.nombre}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                      <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <DollarSign className="h-3.5 w-3.5 text-blue-500 mr-1.5" />
                            <span className="text-xs text-gray-600">USD</span>
                          </div>
                          <span className="font-bold text-sm sm:text-base text-blue-600">
                            ${Number(registro.precioTotal).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-lg p-2 sm:p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Bs</span>
                          <span className="font-bold text-sm sm:text-base text-green-600">
                            Bs {registro.precioTotalBs ? Number(registro.precioTotalBs).toFixed(2) : '0.00'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
                          <div className="flex items-center space-x-2">
                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-sm text-gray-700">{registro.telefono}</span>
                          </div>

                          <button
                            onClick={() => abrirWhatsApp(registro)}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg border border-green-200 transition-colors w-full sm:w-auto"
                            aria-label="Enviar mensaje por WhatsApp"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">Enviar WhatsApp</span>
                          </button>
                        </div>

                        {registro.serviciosExtras.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-xs font-medium text-gray-500 mr-1">
                              Extras:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {registro.serviciosExtras.map((extra, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-50 text-blue-700 border border-blue-100"
                                >
                                  {extra.servicioExtra.nombre}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {tieneInfoAdicional && (
                      <div className="pt-2 border-t border-gray-100">
                        <button
                          onClick={() => toggleDesplegable(registro.id)}
                          className="flex items-center justify-between w-full p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                          aria-expanded={desplegableAbierto}
                          aria-controls={`info-adicional-${registro.id}`}
                        >
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="font-medium">Información adicional</span>
                          </div>
                          {desplegableAbierto ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>

                        {desplegableAbierto && (
                          <div
                            id={`info-adicional-${registro.id}`}
                            className="mt-2 space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            {registro.referenciaPago && registro.referenciaPago.trim() !== '' && (
                              <div className="space-y-1">
                                <div className="flex items-center text-xs text-gray-500">
                                  <Receipt className="h-3.5 w-3.5 mr-1.5" />
                                  <span className="font-medium">Referencia de Pago:</span>
                                </div>
                                <p className="text-sm text-gray-800 bg-white p-2 rounded border border-gray-200 wrap-break-word">
                                  {registro.referenciaPago}
                                </p>
                              </div>
                            )}

                            {registro.notas && registro.notas.trim() !== '' && (
                              <div className="space-y-1">
                                <div className="flex items-center text-xs text-gray-500">
                                  <FileText className="h-3.5 w-3.5 mr-1.5" />
                                  <span className="font-medium">Notas:</span>
                                </div>
                                <p className="text-sm text-gray-800 bg-white p-2 rounded border border-gray-200 wrap-break-word whitespace-pre-wrap">
                                  {registro.notas}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {datosFormulario && (
        <ModalEditarRegistro
          isOpen={modalEditarAbierto}
          onClose={() => setModalEditarAbierto(false)}
          registro={registroEditando}
          onUpdate={handleUpdate}
          datosFormulario={datosFormulario}
        />
      )}

      <ModalConfirmacion
        isOpen={modalEliminarAbierto}
        onClose={() => setModalEliminarAbierto(false)}
        onConfirm={handleEliminarConfirmado}
        title="Eliminar Registro"
        message={`¿Estás seguro de que deseas eliminar el registro de ${registroAEliminar?.placa} - ${registroAEliminar?.nombre}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </>
  )
}