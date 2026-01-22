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
  Tag,
  FileText,
  XCircle,
  PlusCircle,
  MessageSquare,
  Phone,
  Hash,
  Wrench,
  Loader2
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 md:mb-6"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 md:h-16 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  if (registros.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="text-center py-8 md:py-12">
          <Car className="h-10 w-10 md:h-12 md:w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay registros</h3>
          <p className="text-gray-600 px-4 md:px-0">
            No se encontraron registros para el período seleccionado
          </p>
        </div>
      </div>
    )
  }

  // Calcular paginación
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
        minute: '2-digit'
      })
    }
  }

  const toggleExpandir = (id: number) => {
    setRegistroExpandido(registroExpandido === id ? null : id)
  }

  // Función para verificar información adicional
  const tieneInformacionAdicional = (registro: RegistroFecha) => {
    const tieneRefPago = registro.referenciaPago && registro.referenciaPago.trim().length > 0
    const tieneNotas = registro.notas && registro.notas.trim().length > 0
    const tieneServiciosExtras = registro.serviciosExtras && registro.serviciosExtras.length > 0
    const tieneColor = registro.color && registro.color.trim().length > 0
    const tieneTasaCambio = registro.tasaCambio !== null

    return tieneRefPago || tieneNotas || tieneServiciosExtras || tieneColor || tieneTasaCambio
  }

  // Función para manejar el cambio de estado
  const manejarCambioEstado = async (id: number, nuevoEstadoId: number) => {
    setActualizandoEstado(id)
    
    try {
      const response = await fetch(`/api/registros-vehiculos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estadoPagoId: nuevoEstadoId
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Si se proporcionó un callback, llamarlo
        if (onActualizarEstado) {
          const nuevoEstadoTexto = opcionesEstado.find(e => e.id === nuevoEstadoId)?.nombre || 'Pendiente'
          onActualizarEstado(id, nuevoEstadoTexto)
        }
        
        // Recargar la página para ver los cambios
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

  // Opciones de estado de pago - Actualizadas con Colaboración
  const opcionesEstado = [
    { id: 1, nombre: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
    { id: 2, nombre: 'Pagado', color: 'bg-green-100 text-green-800' },
    { id: 3, nombre: 'Colaboración', color: 'bg-blue-100 text-blue-800' }
  ]

  // Obtener clase CSS para el estado actual
  const obtenerClaseEstado = (estadoNombre: string) => {
    const estado = opcionesEstado.find(e => 
      e.nombre.toLowerCase() === estadoNombre.toLowerCase()
    )
    return estado?.color || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Registros del Período</h3>
          <p className="text-sm text-gray-600 mt-1">
            Mostrando {indexPrimerRegistro + 1}-{Math.min(indexUltimoRegistro, registros.length)} de {registros.length} registros
          </p>
        </div>
      </div>

      {/* Lista de registros */}
      <div className="space-y-3 md:space-y-4">
        {registrosActuales.map((registro) => {
          const { fecha, hora } = formatFecha(registro.fechaHora)
          const tieneExtras = tieneInformacionAdicional(registro)
          
          // Determinar el estado actual
          const estadoActual = opcionesEstado.find(e => 
            e.nombre.toLowerCase() === registro.estadoPago.toLowerCase()
          )

          return (
            <div
              key={registro.id}
              className="border border-gray-200 rounded-xl hover:border-gray-300 transition-colors overflow-hidden"
            >
              {/* Header del registro */}
              <div
                className="p-3 md:p-4 cursor-pointer"
                onClick={() => toggleExpandir(registro.id)}
              >
                {/* Primera fila: Placa y Estado */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                      <Car className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-900 text-sm md:text-base">
                        {registro.placa}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Select para cambiar estado */}
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={estadoActual?.id || 1}
                        onChange={(e) => manejarCambioEstado(registro.id, parseInt(e.target.value))}
                        disabled={actualizandoEstado === registro.id}
                        className={`appearance-none px-3 py-1 text-xs font-medium rounded-full pr-8 cursor-pointer transition-all ${
                          obtenerClaseEstado(registro.estadoPago)
                        } ${actualizandoEstado === registro.id ? 'opacity-70' : 'hover:opacity-90'} border-none focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500`}
                      >
                        {opcionesEstado.map((estado) => (
                          <option 
                            key={estado.id} 
                            value={estado.id}
                            className={`${estado.color} bg-white`}
                          >
                            {estado.nombre}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                        {actualizandoEstado === registro.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                    
                    {registroExpandido === registro.id ? (
                      <ChevronUp className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Segunda fila: Nombre y Precio */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  {/* Nombre cliente */}
                  <div className="flex items-center space-x-2 text-gray-600">
                    <User className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
                    <span className="text-sm truncate max-w-45 md:max-w-none">
                      {registro.nombre}
                    </span>
                  </div>

                  {/* Precio y fecha */}
                  <div className="flex flex-col items-end">
                    <div className="font-semibold text-gray-900 text-sm md:text-base">
                      ${Number(registro.precioTotal).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{fecha}</span>
                      <span className="mx-1">•</span>
                      <span>{hora}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalles expandidos */}
              {registroExpandido === registro.id && (
                <div className="border-t border-gray-100 p-3 md:p-4 bg-gray-50">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Columna 1 - Información del cliente y vehículo */}
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg border border-gray-200 p-3">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Información del Cliente</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Nombre</span>
                            <span className="text-sm font-medium text-gray-900">{registro.nombre}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Cédula</span>
                            <span className="text-sm font-medium text-gray-900 flex items-center">
                              <Hash className="h-3 w-3 mr-1" />
                              {registro.cedula}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Teléfono</span>
                            <span className="text-sm font-medium text-gray-900 flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {registro.telefono}
                            </span>
                          </div>
                          {registro.color && registro.color.trim().length > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Color</span>
                              <span className="text-sm font-medium text-gray-900">{registro.color}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-white rounded-lg border border-gray-200 p-3">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Detalles del Servicio</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Tipo de Vehículo</span>
                            <span className="text-sm font-medium text-gray-900">{registro.tipoVehiculo}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Servicio Principal</span>
                            <span className="text-sm font-medium text-gray-900">{registro.servicio}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Columna 2 - Montos */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="text-sm text-gray-600">Total USD</p>
                            <p className="text-xs text-gray-500">Servicio: ${Number(registro.precioServicio).toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-blue-600 text-lg">
                            ${Number(registro.precioTotal).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-600">Total Bs</span>
                        </div>
                        <span className="font-semibold text-green-600">
                          Bs {Number(registro.precioTotalBs || 0).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </span>
                      </div>

                      {/* Tasa de cambio si existe */}
                      {registro.tasaCambio && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="text-xs text-gray-600">Tasa de cambio:</span>
                          <span className="text-xs font-medium text-gray-900">
                            Bs {Number(registro.tasaCambio).toFixed(2)} por $
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Columna 3 - Información adicional */}
                    <div className="space-y-3">
                      {/* Servicios extra */}
                      {registro.serviciosExtras && registro.serviciosExtras.length > 0 && (
                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <Wrench className="h-4 w-4 text-emerald-500" />
                            <span className="text-sm font-medium text-gray-900">Servicios Extra</span>
                            <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full">
                              {registro.serviciosExtras.length}
                            </span>
                          </div>
                          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {registro.serviciosExtras.map((extra, index) => (
                              <div
                                key={index}
                                className="flex flex-col p-2 bg-emerald-50 rounded"
                              >
                                <div className="flex justify-between items-start">
                                  <span className="text-sm font-medium text-emerald-700">
                                    {extra.servicioExtra.nombre}
                                  </span>
                                  <span className="text-sm font-semibold text-emerald-800">
                                    ${Number(extra.servicioExtra.precio).toFixed(2)}
                                  </span>
                                </div>
                                {extra.servicioExtra.descripcion && (
                                  <p className="text-xs text-emerald-600 mt-1">
                                    {extra.servicioExtra.descripcion}
                                  </p>
                                )}
                              </div>
                            ))}
                            <div className="pt-2 border-t border-emerald-200">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Total extras:</span>
                                <span className="font-semibold text-emerald-700">
                                  ${registro.totalExtras.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Referencia de pago */}
                      {registro.referenciaPago && registro.referenciaPago.trim().length > 0 && (
                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <FileText className="h-4 w-4 text-purple-500" />
                            <span className="text-sm font-medium text-gray-900">Referencia de Pago</span>
                          </div>
                          <div className="bg-purple-50 p-2 rounded">
                            <code className="text-sm text-purple-700 font-mono break-all">
                              {registro.referenciaPago}
                            </code>
                          </div>
                        </div>
                      )}

                      {/* Notas */}
                      {registro.notas && registro.notas.trim().length > 0 && (
                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <MessageSquare className="h-4 w-4 text-amber-500" />
                            <span className="text-sm font-medium text-gray-900">Notas</span>
                          </div>
                          <p className="text-sm text-gray-700 bg-amber-50 p-2 rounded whitespace-pre-wrap">
                            {registro.notas}
                          </p>
                        </div>
                      )}

                      {/* Indicador si no hay información adicional */}
                      {!tieneExtras && (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
                          <XCircle className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">
                            Sin información adicional
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 pt-6 border-t border-gray-200 gap-3">
          <div className="text-sm text-gray-600 text-center sm:text-left">
            Página {paginaActual} de {totalPaginas}
          </div>

          <div className="flex flex-col xs:flex-row gap-2 justify-center sm:justify-end">
            <button
              onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
              disabled={paginaActual === 1}
              className="px-4 py-2.5 sm:px-3 sm:py-1.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>
            <button
              onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
              disabled={paginaActual === totalPaginas}
              className="px-4 py-2.5 sm:px-3 sm:py-1.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}