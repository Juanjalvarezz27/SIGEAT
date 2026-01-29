"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { Car, Clock, DollarSign, CheckCircle, XCircle, AlertCircle, RefreshCw, Edit, Trash2, Hourglass, Wrench, CheckCheck, User, CreditCard, MessageCircle, ChevronDown, ChevronUp, Receipt, FileText, Search } from 'lucide-react'
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

  const [buscando, setBuscando] = useState(false)
  const [busqueda, setBusqueda] = useState({
    termino: '',
    tipo: 'placa'
  })

  const [desplegablesAbiertos, setDesplegablesAbiertos] = useState<{ [key: number]: boolean }>({})
  const toastShownRef = useRef(false)

  const normalizarTexto = useCallback((texto: string): string => {
    if (!texto) return ''

    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
  }, [])

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

      setDesplegablesAbiertos({})

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

  useEffect(() => {
    fetchRegistros()
  }, [refreshKey])

  const realizarBusqueda = useCallback((termino: string, tipo: string) => {
    if (termino.trim() === '') {
      setRegistros(registrosOriginales)
      setBuscando(false)

      if (onRegistrosChange && registrosOriginales.length > 0) {
        const totalRegistros = registrosOriginales.length
        const totalIngresos = registrosOriginales.reduce((sum, reg) => sum + Number(reg.precioTotal), 0)
        onRegistrosChange({ totalRegistros, totalIngresos })
      }
      return
    }

    setBuscando(true)
    const terminoNormalizado = normalizarTexto(termino)

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

    if (onRegistrosChange) {
      const totalRegistros = resultados.length
      const totalIngresos = resultados.reduce((sum, reg) => sum + Number(reg.precioTotal), 0)
      onRegistrosChange({ totalRegistros, totalIngresos })
    }

    setBuscando(false)
  }, [registrosOriginales, onRegistrosChange, normalizarTexto])

  const handleBuscar = useCallback((termino: string, tipo: string) => {
    setBusqueda({ termino, tipo })
    realizarBusqueda(termino, tipo)
  }, [realizarBusqueda])

  const handleRefresh = async () => {
    await fetchRegistros()
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
  
  let serviciosExtrasTexto = '';
  if (registro.serviciosExtras.length > 0) {
    const extras = registro.serviciosExtras.map(extra => extra.servicioExtra.nombre).join(', ');
    serviciosExtrasTexto = `\n• *Servicios extras:* ${extras}`;
  }
  
  const precioTexto = registro.precioTotalBs 
    ? `\n• *Total:* $${Number(registro.precioTotal).toFixed(2)} (Bs ${Number(registro.precioTotalBs).toFixed(2)})`
    : `\n• *Total:* $${Number(registro.precioTotal).toFixed(2)}`;
  
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
        return 'text-emerald-700 bg-emerald-50 border-emerald-200'
      case 'pendiente':
        return 'text-amber-700 bg-amber-50 border-amber-200'
      case 'cancelado':
        return 'text-red-700 bg-red-50 border-red-200'
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200'
    }
  }

  const getEstadoPagoIcon = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pagado':
        return <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
      case 'pendiente':
        return <Clock className="h-3.5 w-3.5 mr-1.5" />
      case 'cancelado':
        return <XCircle className="h-3.5 w-3.5 mr-1.5" />
      default:
        return null
    }
  }

  const getEstadoCarroColor = (estado: string, id: number) => {
    switch (id) {
      case 1:
        return 'text-amber-700 bg-amber-50 border-amber-200'
      case 2:
        return 'text-[#122a4e] bg-[#e2e2f6] border-[#869dfc]/30'
      case 3:
        return 'text-emerald-700 bg-emerald-50 border-emerald-200'
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200'
    }
  }

  const getEstadoCarroIcon = (id: number) => {
    switch (id) {
      case 1:
        return <Hourglass className="h-3.5 w-3.5 mr-1.5" />
      case 2:
        return <Wrench className="h-3.5 w-3.5 mr-1.5" />
      case 3:
        return <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
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
      <div className="space-y-4 mt-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="animate-pulse space-y-4">
              <div className="flex justify-between items-center">
                 <div className="h-10 w-10 bg-slate-100 rounded-xl"></div>
                 <div className="h-6 bg-slate-100 rounded w-1/4"></div>
                 <div className="h-8 w-16 bg-slate-100 rounded-lg"></div>
              </div>
              <div className="h-16 bg-slate-50 rounded-xl w-full"></div>
              <div className="grid grid-cols-2 gap-3">
                 <div className="h-12 bg-slate-100 rounded-xl"></div>
                 <div className="h-12 bg-slate-100 rounded-xl"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error && registros.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-red-100 p-8 mt-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-[#140f07] mb-2">Error de conexión</h3>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-[#122a4e] text-white font-medium rounded-xl hover:bg-[#4260ad] transition-colors flex items-center mx-auto"
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
      <div className="mb-6">
        <BuscadorVehiculos
          onBuscar={handleBuscar}
          cargando={buscando}
          busquedaActual={busqueda}
        />
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-between px-2">
          <div className="text-sm font-medium text-[#122a4e]/70">
            Mostrando <span className="font-bold text-[#140f07]">{registros.length}</span> {registros.length === 1 ? 'vehículo' : 'vehículos'}
            {busqueda.termino && registrosOriginales.length > 0 && (
              <span className="text-[#869dfc] ml-1">
                (de {registrosOriginales.length})
              </span>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-[#4260ad] hover:bg-[#e2e2f6] rounded-xl transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {registros.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10 text-center">
            {busqueda.termino ? (
              <>
                <div className="w-16 h-16 bg-[#f4f6fc] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-[#869dfc]" />
                </div>
                <h3 className="text-lg font-bold text-[#140f07] mb-2">Sin resultados</h3>
                <p className="text-slate-500 text-sm mb-6">
                  No se encontraron coincidencias para "<span className="font-semibold text-[#122a4e]">{busqueda.termino}</span>"
                </p>
                <button
                  onClick={() => handleBuscar('', busqueda.tipo)}
                  className="px-5 py-2.5 text-sm font-medium text-[#4260ad] bg-[#e2e2f6] hover:bg-[#4260ad] hover:text-white rounded-xl transition-all"
                >
                  Limpiar filtros
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-[#f4f6fc] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Car className="h-8 w-8 text-[#869dfc]" />
                </div>
                <h3 className="text-lg font-bold text-[#140f07] mb-2">Todo limpio</h3>
                <p className="text-slate-500 text-sm">Aún no hay vehículos registrados hoy.</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {registros.map(registro => {
              const tieneInfoAdicional = tieneInformacionAdicional(registro)
              const desplegableAbierto = desplegablesAbiertos[registro.id] || false

              return (
                <div
                  key={registro.id}
                  className="bg-white rounded-3xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden"
                >
                  {/* Encabezado: Icono, Título y Acciones */}
                  <div className="p-5 pb-0">
                    <div className="flex justify-between items-start">
                       <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-[#122a4e] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#122a4e]/20 shrink-0">
                             <Car className="h-6 w-6" />
                          </div>
                          <div>
                             <h3 className="text-xl font-black text-[#140f07] leading-tight">{registro.placa}</h3>
                             <div className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <span className="text-[#4260ad] font-bold uppercase text-xs">{registro.tipoVehiculo.nombre}</span>
                                {registro.color && (
                                   <>
                                     <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                     <span className="text-xs">{registro.color}</span>
                                   </>
                                )}
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex gap-1">
                          <button onClick={() => handleEditar(registro)} className="p-2 text-slate-300 hover:text-[#4260ad] transition-colors">
                             <Edit className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleEliminarClick(registro)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                             <Trash2 className="h-5 w-5" />
                          </button>
                       </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-5">
                     
                     {/* Caja de Usuario */}
                     <div className="bg-[#f8f9fc] rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm shrink-0">
                           <User className="h-5 w-5 text-[#122a4e]" />
                        </div>
                        <div className="min-w-0">
                           <p className="text-[#140f07] font-bold text-sm truncate">{registro.nombre}</p>
                           <p className="text-slate-500 text-xs font-medium">{registro.cedula}</p>
                        </div>
                     </div>

                     {/* Fecha y Servicio */}
                     <div className="space-y-3">
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                           <Clock className="h-3.5 w-3.5" />
                           {formatFecha(registro.fechaHora)}
                        </div>
                        
                        <div className="flex items-center gap-2">
                           <CreditCard className="h-4 w-4 text-[#122a4e]" />
                           <span className="text-[#140f07] font-bold text-sm">{registro.servicio.nombre}</span>
                        </div>

                        {/* Badges de Estado */}
                        <div className="flex flex-wrap gap-2">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold border ${getEstadoCarroColor(registro.estadoCarro.nombre, registro.estadoCarro.id)}`}>
                                {getEstadoCarroIcon(registro.estadoCarro.id)}
                                {registro.estadoCarro.nombre}
                            </span>
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold border ${getEstadoPagoColor(registro.estadoPago.nombre)}`}>
                                {getEstadoPagoIcon(registro.estadoPago.nombre)}
                                {registro.estadoPago.nombre}
                            </span>
                        </div>
                     </div>

                     {/* Cajas de Totales */}
                     <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#122a4e] rounded-2xl p-4 text-center text-white shadow-lg shadow-[#122a4e]/20">
                           <span className="text-[10px] font-bold text-[#869dfc] uppercase tracking-wider block mb-1">Total USD</span>
                           <span className="text-xl font-black">${Number(registro.precioTotal).toFixed(2)}</span>
                        </div>
                        <div className="bg-[#f4f6fc] rounded-2xl p-4 text-center border border-slate-100">
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total BS</span>
                           <span className="text-xl font-black text-[#140f07]">{registro.precioTotalBs ? Number(registro.precioTotalBs).toFixed(2) : '0.00'}</span>
                        </div>
                     </div>

                     {/* Botón WhatsApp */}
                     <button
                        onClick={() => abrirWhatsApp(registro)}
                        className="w-full bg-[#e2e2f6] text-[#122a4e] font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#d0d6f5] transition-colors"
                     >
                        <MessageCircle className="h-5 w-5" />
                        WhatsApp
                     </button>

                     {/* Extras y Chips */}
                     {registro.serviciosExtras.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                           <span className="text-xs font-bold text-slate-300 uppercase py-1">Extras:</span>
                           {registro.serviciosExtras.map((extra, idx) => (
                              <span key={idx} className="text-xs font-medium text-[#4260ad] border border-[#869dfc]/20 px-2.5 py-1 rounded-lg bg-white">
                                 {extra.servicioExtra.nombre}
                              </span>
                           ))}
                        </div>
                     )}

                     {/* Expandible (Notas) */}
                     {tieneInfoAdicional && (
                        <div className="border-t border-slate-50 pt-3">
                           <button
                             onClick={() => toggleDesplegable(registro.id)}
                             className="w-full flex items-center justify-center gap-1 text-xs font-medium text-slate-400 hover:text-[#4260ad] transition-colors"
                           >
                              {desplegableAbierto ? 'Ocultar detalles' : 'Ver notas y referencia'}
                              <ChevronDown className={`h-3 w-3 transition-transform ${desplegableAbierto ? 'rotate-180' : ''}`} />
                           </button>

                           {desplegableAbierto && (
                              <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                                  {registro.referenciaPago && registro.referenciaPago.trim() !== '' && (
                                     <div className="bg-[#f8f9fc] p-3 rounded-xl border border-slate-100">
                                         <p className="text-xs font-bold text-[#122a4e] mb-1 flex items-center gap-1">
                                            <Receipt className="h-3 w-3" /> Referencia
                                         </p>
                                         <p className="text-sm font-mono text-slate-600">{registro.referenciaPago}</p>
                                     </div>
                                  )}
                                  {registro.notas && registro.notas.trim() !== '' && (
                                     <div className="bg-[#f8f9fc] p-3 rounded-xl border border-slate-100">
                                         <p className="text-xs font-bold text-[#122a4e] mb-1 flex items-center gap-1">
                                            <FileText className="h-3 w-3" /> Notas
                                         </p>
                                         <p className="text-sm text-slate-600 italic">{registro.notas}</p>
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
        message={`¿Estás seguro de que deseas eliminar el registro de ${registroAEliminar?.placa} - ${registroAEliminar?.nombre}?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </>
  )
}