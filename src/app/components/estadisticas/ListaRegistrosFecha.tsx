"use client"

import { useState } from 'react'
import {
  Car,
  User,
  Calendar,
  DollarSign,
  ChevronDown,
  ChevronUp,
  CreditCard,
  FileText,
  XCircle,
  MessageSquare,
  Phone,
  Hash,
  Wrench,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react'

// Interface basada en el endpoint actualizado
interface ServicioExtra {
  id: number
  nombre: string
  descripcion: string | null
  precio: number
}

interface RegistroFecha {
  id: number
  placa: string
  nombre: string
  cedula: string
  telefono: string
  color: string | null
  fechaHora: string
  tipoVehiculo: string
  servicio: string
  precioServicio: number
  precioTotal: number
  precioTotalBs: number
  estadoPago: string
  estadoCarro: string
  referenciaPago: string | null
  notas: string | null
  tasaCambio: number | null
  serviciosExtras: Array<{
    servicioExtra: ServicioExtra
  }>
  totalExtras: number
}

interface ListaRegistrosFechaProps {
  registros: RegistroFecha[]
  cargando: boolean
  onActualizarEstado?: (id: number, nuevoEstado: string) => void
}

export default function ListaRegistrosFecha({ 
  registros, 
  cargando,
  onActualizarEstado 
}: ListaRegistrosFechaProps) {
  const [paginaActual, setPaginaActual] = useState(1)
  const [registrosPorPagina] = useState(10)
  const [registroExpandido, setRegistroExpandido] = useState<number | null>(null)
  const [actualizandoEstado, setActualizandoEstado] = useState<number | null>(null)

  if (cargando) {
    return (
      <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-[#869dfc]/10 p-5 md:p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex justify-between">
             <div className="h-8 bg-slate-100 rounded-xl w-1/3"></div>
             <div className="h-8 bg-slate-100 rounded-xl w-1/6"></div>
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-50 rounded-2xl border border-slate-100"></div>
          ))}
        </div>
      </div>
    )
  }

  if (registros.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-[#869dfc]/10 p-10 text-center">
        <div className="w-16 h-16 bg-[#f4f6fc] rounded-full flex items-center justify-center mx-auto mb-4">
           <Car className="h-8 w-8 text-[#869dfc]" />
        </div>
        <h3 className="text-lg font-bold text-[#140f07] mb-2">Sin registros</h3>
        <p className="text-slate-500 text-sm">
          No encontramos vehículos para el período seleccionado.
        </p>
      </div>
    )
  }

  const totalPaginas = Math.ceil(registros.length / registrosPorPagina)
  const indexUltimoRegistro = paginaActual * registrosPorPagina
  const indexPrimerRegistro = indexUltimoRegistro - registrosPorPagina
  const registrosActuales = registros.slice(indexPrimerRegistro, indexUltimoRegistro)

  const formatFecha = (fechaString: string) => {
    const fecha = new Date(fechaString)
    return {
      fecha: fecha.toLocaleDateString('es-VE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      hora: fecha.toLocaleTimeString('es-VE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }
  }

  const toggleExpandir = (id: number) => {
    setRegistroExpandido(registroExpandido === id ? null : id)
  }

  const tieneInformacionAdicional = (registro: RegistroFecha) => {
    return (registro.referenciaPago && registro.referenciaPago.trim().length > 0) ||
           (registro.notas && registro.notas.trim().length > 0) ||
           (registro.serviciosExtras && registro.serviciosExtras.length > 0) ||
           (registro.color && registro.color.trim().length > 0) ||
           (registro.tasaCambio !== null)
  }

  const manejarCambioEstado = async (id: number, nuevoEstadoId: number) => {
    setActualizandoEstado(id)
    try {
      const response = await fetch(`/api/registros-vehiculos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estadoPagoId: nuevoEstadoId })
      })

      if (response.ok) {
        if (onActualizarEstado) {
          const nuevoEstadoTexto = opcionesEstado.find(e => e.id === nuevoEstadoId)?.nombre || 'Pendiente'
          onActualizarEstado(id, nuevoEstadoTexto)
        }
        window.location.reload()
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'No se pudo actualizar el estado'}`)
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error)
      alert('Error al conectar con el servidor')
    } finally {
      setActualizandoEstado(null)
    }
  }

  const opcionesEstado = [
    { id: 1, nombre: 'Pendiente', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Clock className="h-3 w-3" /> },
    { id: 2, nombre: 'Pagado', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="h-3 w-3" /> },
    { id: 3, nombre: 'Colaboración', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <HelpCircle className="h-3 w-3" /> }
  ]

  const obtenerClaseEstado = (estadoNombre: string) => {
    const estado = opcionesEstado.find(e => e.nombre.toLowerCase() === estadoNombre.toLowerCase())
    return estado?.color || 'bg-slate-100 text-slate-700 border-slate-200'
  }

  return (
    <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-[#869dfc]/10 p-5 md:p-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
        <div>
          <h3 className="text-xl font-black text-[#140f07]">Registros del Período</h3>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Mostrando <span className="font-bold text-[#122a4e]">{indexPrimerRegistro + 1}-{Math.min(indexUltimoRegistro, registros.length)}</span> de {registros.length}
          </p>
        </div>
      </div>

      {/* Lista de registros */}
      <div className="space-y-4">
        {registrosActuales.map((registro) => {
          const { fecha, hora } = formatFecha(registro.fechaHora)
          const tieneExtras = tieneInformacionAdicional(registro)
          const estadoActual = opcionesEstado.find(e => e.nombre.toLowerCase() === registro.estadoPago.toLowerCase())

          return (
            <div
              key={registro.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:border-[#869dfc]/30 transition-all duration-300 group"
            >
              {/* Header del registro (Resumen) */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => toggleExpandir(registro.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Icono y Placa */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#122a4e] rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-[#122a4e]/10">
                      <Car className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-[#140f07] leading-none">{registro.placa}</h4>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-xs font-bold text-[#4260ad] uppercase tracking-wider">{registro.nombre.split(' ')[0]}</span>
                         <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{hora}</span>
                      </div>
                    </div>
                  </div>

                  {/* Precio y Chevron */}
                  <div className="text-right">
                     <p className="text-lg font-black text-[#122a4e]">${Number(registro.precioTotal).toFixed(2)}</p>
                     <div className="flex items-center justify-end gap-1 mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${obtenerClaseEstado(registro.estadoPago)}`}>
                           {estadoActual?.icon}
                           {registro.estadoPago}
                        </span>
                     </div>
                  </div>
                </div>
              </div>

              {/* Detalles expandidos */}
              {registroExpandido === registro.id && (
                <div className="bg-[#f8f9fc] border-t border-slate-100 p-5 animate-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Columna 1: Info Cliente y Estado */}
                    <div className="space-y-4">
                       <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
                          <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cliente</h5>
                          <div className="flex items-center gap-3 text-sm">
                             <User className="h-4 w-4 text-[#4260ad]" />
                             <span className="font-bold text-[#140f07]">{registro.nombre}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                             <Hash className="h-4 w-4 text-[#4260ad]" />
                             <span className="font-medium text-slate-600">{registro.cedula}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                             <Phone className="h-4 w-4 text-[#4260ad]" />
                             <span className="font-medium text-slate-600">{registro.telefono}</span>
                          </div>
                       </div>

                       <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                          <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Estado de Pago</h5>
                          <div className="relative" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={estadoActual?.id || 1}
                              onChange={(e) => manejarCambioEstado(registro.id, parseInt(e.target.value))}
                              disabled={actualizandoEstado === registro.id}
                              className="w-full appearance-none bg-[#f4f6fc] border border-transparent rounded-xl px-4 py-2.5 text-sm font-bold text-[#140f07] focus:bg-white focus:border-[#869dfc] outline-none transition-all"
                            >
                              {opcionesEstado.map((estado) => (
                                <option key={estado.id} value={estado.id}>
                                  {estado.nombre}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                              {actualizandoEstado === registro.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronDown className="h-4 w-4" />}
                            </div>
                          </div>
                       </div>
                    </div>

                    {/* Columna 2: Info Servicio y Financiero */}
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
                           <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Servicio</h5>
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-600">Vehículo:</span>
                              <span className="font-bold text-[#140f07]">{registro.tipoVehiculo}</span>
                           </div>
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-600">Servicio:</span>
                              <span className="font-bold text-[#140f07]">{registro.servicio}</span>
                           </div>
                           {registro.color && (
                             <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">Color:</span>
                                <div className="flex items-center gap-1.5">
                                   <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                                   <span className="font-medium text-slate-700">{registro.color}</span>
                                </div>
                             </div>
                           )}
                        </div>

                        <div className="bg-[#122a4e] p-4 rounded-xl shadow-lg shadow-[#122a4e]/20 text-white space-y-3 relative overflow-hidden">
                           <DollarSign className="absolute -right-2 -bottom-2 h-16 w-16 text-white/5 rotate-12" />
                           <div className="relative z-10">
                              <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
                                 <span className="text-xs font-medium text-white/70">Total USD</span>
                                 <span className="text-lg font-black">${Number(registro.precioTotal).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                 <span className="text-xs font-medium text-white/70">Total Bs</span>
                                 <span className="text-base font-bold text-[#869dfc]">
                                    Bs {Number(registro.precioTotalBs || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                 </span>
                              </div>
                           </div>
                        </div>
                    </div>

                  </div>

                  {/* Bloque Extras / Notas */}
                  {(registro.serviciosExtras?.length > 0 || registro.notas || registro.referenciaPago) && (
                     <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 gap-3">
                        {registro.serviciosExtras?.length > 0 && (
                           <div className="bg-white p-3 rounded-xl border border-slate-100">
                              <h6 className="text-xs font-bold text-[#4260ad] uppercase mb-2 flex items-center gap-1.5">
                                 <Wrench className="h-3.5 w-3.5" /> Servicios Extra
                              </h6>
                              <div className="flex flex-wrap gap-2">
                                 {registro.serviciosExtras.map((extra, idx) => (
                                    <span key={idx} className="text-xs font-medium bg-[#e2e2f6] text-[#122a4e] px-2 py-1 rounded-md border border-[#869dfc]/20">
                                       {extra.servicioExtra.nombre} (${Number(extra.servicioExtra.precio).toFixed(2)})
                                    </span>
                                 ))}
                              </div>
                           </div>
                        )}
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                           {registro.referenciaPago && (
                              <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center gap-2">
                                 <FileText className="h-4 w-4 text-purple-500" />
                                 <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Referencia</span>
                                    <span className="text-xs font-mono font-bold text-slate-700">{registro.referenciaPago}</span>
                                 </div>
                              </div>
                           )}
                           {registro.notas && (
                              <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-start gap-2">
                                 <MessageSquare className="h-4 w-4 text-amber-500 mt-0.5" />
                                 <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Notas</span>
                                    <span className="text-xs font-medium text-slate-600 italic">{registro.notas}</span>
                                 </div>
                              </div>
                           )}
                        </div>
                     </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-8 pt-6 border-t border-slate-100 gap-4">
          <div className="text-xs font-medium text-slate-500 text-center sm:text-left">
            Página <span className="font-bold text-[#140f07]">{paginaActual}</span> de {totalPaginas}
          </div>

          <div className="flex gap-2 justify-center sm:justify-end">
            <button
              onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
              disabled={paginaActual === 1}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-[#e2e2f6] hover:text-[#4260ad] hover:border-[#869dfc]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Anterior
            </button>
            <button
              onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
              disabled={paginaActual === totalPaginas}
              className="px-4 py-2 bg-[#122a4e] text-white rounded-xl text-sm font-bold hover:bg-[#4260ad] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-[#122a4e]/20"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}