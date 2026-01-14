"use client"

import { useState, useEffect } from 'react'
import {
  Car, User, Calendar, DollarSign, Phone, Hash,
  ChevronDown, ChevronUp, CheckCircle, Clock, Tag,
  FileText, MessageSquare, Wrench, TrendingUp
} from 'lucide-react'

interface HistorialRegistro {
  id: number
  fecha: Date | string  // Permitir string también
  servicio: string
  precio: number
  estadoPago: string
  referenciaPago?: string | null
  notas?: string | null
}

interface Vehiculo {
  placa: string
  cliente: {
    nombre: string
    cedula: string
    telefono: string
    color?: string
  }
  vehiculo: {
    tipo: string
    estado: string
  }
  estadisticas: {
    totalVisitas: number
    ultimaVisita: Date | string  // Permitir string también
    totalGastado: number
    serviciosUsados: string[]
  }
  historial: HistorialRegistro[]
}

interface ListaVehiculosProps {
  vehiculos: Vehiculo[]
  cargando: boolean
  paginacion: {
    paginaActual: number
    totalPaginas: number
    totalVehiculos: number
    porPagina: number
  }
  onCambiarPagina: (pagina: number) => void
}

export default function ListaVehiculos({
  vehiculos,
  cargando,
  paginacion,
  onCambiarPagina
}: ListaVehiculosProps) {
  const [vehiculoExpandido, setVehiculoExpandido] = useState<string | null>(null)
  const [historialExpandido, setHistorialExpandido] = useState<string | null>(null)

  // Resetear estados expandidos cuando cambia la página
  useEffect(() => {
    setVehiculoExpandido(null)
    setHistorialExpandido(null)
  }, [paginacion.paginaActual])

  // Función para generar ID único para historial
  const generarHistorialId = (placa: string, historialId: number) => {
    return `${placa}-${historialId}`
  }

  const formatFecha = (fechaInput: Date | string) => {
    try {
      const fecha = new Date(fechaInput)
      if (isNaN(fecha.getTime())) {
        return 'Fecha inválida'
      }
      return fecha.toLocaleDateString('es-VE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.error('Error al formatear fecha:', error, fechaInput)
      return 'Error en fecha'
    }
  }

  const formatFechaCorta = (fechaInput: Date | string) => {
    try {
      const fecha = new Date(fechaInput)
      if (isNaN(fecha.getTime())) {
        return 'Fecha inválida'
      }
      return fecha.toLocaleDateString('es-VE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    } catch (error) {
      console.error('Error al formatear fecha corta:', error, fechaInput)
      return 'Error'
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num)
  }

  // Función para cambiar de página con validación
  const handleCambiarPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= paginacion.totalPaginas) {
      onCambiarPagina(pagina)
    }
  }

  // Función para generar números de página con validación
  const generarNumerosPagina = () => {
    const numerosPagina: number[] = []
    const maxPaginasMostrar = 5
    
    if (paginacion.totalPaginas <= maxPaginasMostrar) {
      // Mostrar todas las páginas
      for (let i = 1; i <= paginacion.totalPaginas; i++) {
        numerosPagina.push(i)
      }
    } else {
      let inicio = Math.max(1, paginacion.paginaActual - 2)
      let fin = Math.min(paginacion.totalPaginas, inicio + maxPaginasMostrar - 1)
      
      // Ajustar si no hay suficientes páginas al final
      if (fin - inicio + 1 < maxPaginasMostrar) {
        inicio = Math.max(1, fin - maxPaginasMostrar + 1)
      }
      
      for (let i = inicio; i <= fin; i++) {
        numerosPagina.push(i)
      }
    }
    
    return numerosPagina
  }

  if (cargando) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  if (vehiculos.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="text-center py-8 md:py-12">
          <Car className="h-10 w-10 md:h-12 md:w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay vehículos</h3>
          <p className="text-gray-600 px-4 md:px-0">
            No se encontraron vehículos con los criterios de búsqueda
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
      {/* Header con estadísticas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Vehículos Registrados</h3>
          <p className="text-sm text-gray-600 mt-1">
            Mostrando {vehiculos.length} de {paginacion.totalVehiculos} vehículos
          </p>
        </div>
        <div className="text-sm text-gray-600">
          Página {paginacion.paginaActual} de {paginacion.totalPaginas}
        </div>
      </div>

      {/* Lista de vehículos */}
      <div className="space-y-4">
        {vehiculos.map((vehiculo) => (
          <div
            key={vehiculo.placa}
            className="border border-gray-200 rounded-xl hover:border-gray-300 transition-colors overflow-hidden"
          >
            {/* Header del vehículo */}
            <div
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setVehiculoExpandido(vehiculoExpandido === vehiculo.placa ? null : vehiculo.placa)}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                        <Car className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-gray-900 text-lg">
                            {vehiculo.placa}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            vehiculo.estadisticas.totalVisitas > 5
                              ? 'bg-emerald-100 text-emerald-800'
                              : vehiculo.estadisticas.totalVisitas > 2
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {vehiculo.estadisticas.totalVisitas} visita{vehiculo.estadisticas.totalVisitas !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            <span className="truncate max-w-30">{vehiculo.cliente.nombre}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex md:hidden items-center">
                      {vehiculoExpandido === vehiculo.placa ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm mt-5">
                    <div className="flex items-center justify-center">
                      <Car className="h-3 w-3 text-gray-400 mr-1 shrink-0" />
                      <span className="truncate">{vehiculo.vehiculo.tipo}</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <DollarSign className="h-3 w-3 text-gray-400 mr-1 shrink-0" />
                      <span className="truncate">${formatNumber(vehiculo.estadisticas.totalGastado)}</span>
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex items-center ml-4">
                  {vehiculoExpandido === vehiculo.placa ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Detalles expandidos */}
            {vehiculoExpandido === vehiculo.placa && (
              <div className="border-t border-gray-100 p-4 bg-gray-50">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Columna 1 - Información del cliente */}
                  <div className="space-y-3">
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900">Información del Cliente</h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Nombre completo</p>
                          <p className="text-sm font-medium text-gray-900 bg-blue-50 p-2 rounded-lg">
                            {vehiculo.cliente.nombre}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Cédula</p>
                            <div className="flex items-center space-x-1 bg-gray-50 p-2 rounded-lg">
                              <Hash className="h-3 w-3 text-gray-500" />
                              <span className="text-sm font-medium text-gray-900">{vehiculo.cliente.cedula}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Teléfono</p>
                            <div className="flex items-center space-x-1 bg-gray-50 p-2 rounded-lg">
                              <Phone className="h-3 w-3 text-gray-500" />
                              <span className="text-sm font-medium text-gray-900">{vehiculo.cliente.telefono}</span>
                            </div>
                          </div>
                        </div>
                        {vehiculo.cliente.color && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Color del vehículo</p>
                            <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                              <span className="text-sm font-medium text-gray-900">{vehiculo.cliente.color}</span>
                              <div 
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: vehiculo.cliente.color.toLowerCase() }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Columna 2 - Estadísticas */}
                  <div className="space-y-3">
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900">Estadísticas</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-xs text-green-700 mb-1">Visitas</p>
                            <p className="text-lg font-bold text-green-900">
                              {vehiculo.estadisticas.totalVisitas}
                            </p>
                          </div>
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-xs text-blue-700 mb-1">Gastado</p>
                            <p className="text-lg font-bold text-blue-900">
                              ${formatNumber(vehiculo.estadisticas.totalGastado)}
                            </p>
                          </div>
                        </div>
                        <div className="bg-amber-50 p-3 rounded-lg">
                          <p className="text-xs text-amber-700 mb-1">Última visita</p>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-amber-600" />
                            <p className="text-sm font-bold text-amber-900">
                              {formatFecha(vehiculo.estadisticas.ultimaVisita)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Columna 3 - Servicios usados */}
                  <div className="space-y-3">
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Wrench className="h-4 w-4 text-emerald-600" />
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900">Servicios Utilizados</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-emerald-50 p-3 rounded-lg">
                          <p className="text-sm text-emerald-700 mb-1">Servicios distintos</p>
                          <p className="text-lg font-bold text-emerald-900">
                            {vehiculo.estadisticas.serviciosUsados.length}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs text-gray-600 font-medium">Lista de servicios:</p>
                          <div className="max-h-32 overflow-y-auto pr-1 space-y-1">
                            {vehiculo.estadisticas.serviciosUsados.map((servicio, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" />
                                <span className="text-xs text-gray-700 truncate flex-1">{servicio}</span>
                                <span className="text-xs text-gray-500 shrink-0">
                                  {vehiculo.historial.filter(h => h.servicio === servicio).length}x
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Historial de visitas */}
                <div className="mt-4">
                  <button
                    onClick={() => setHistorialExpandido(
                      historialExpandido === vehiculo.placa ? null : vehiculo.placa
                    )}
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="font-medium text-gray-900">
                        Historial de visitas ({vehiculo.historial.length})
                      </span>
                    </div>
                    {historialExpandido === vehiculo.placa ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </button>

                  {historialExpandido === vehiculo.placa && (
                    <div className="mt-3 space-y-3">
                      {vehiculo.historial.map((registro) => (
                        <div key={registro.id} className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                              <span className="text-sm font-medium text-gray-900">
                                {formatFecha(registro.fecha)}
                              </span>
                            </div>
                            <div className="font-semibold text-gray-900 text-lg">
                              ${formatNumber(registro.precio)}
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <div className="flex items-center space-x-2">
                              <Wrench className="h-4 w-4 text-gray-400 shrink-0" />
                              <span className="text-sm text-gray-700">{registro.servicio}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {registro.referenciaPago && (
                              <div className="flex items-start space-x-2">
                                <FileText className="h-3 w-3 text-purple-500 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-purple-600 truncate">
                                    Ref: {registro.referenciaPago}
                                  </p>
                                </div>
                              </div>
                            )}
                            
                            {registro.notas && (
                              <div className="flex items-start space-x-2">
                                <MessageSquare className="h-3 w-3 text-gray-400 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-600 wrap-break-word">
                                    {registro.notas}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Paginación */}
      {paginacion.totalPaginas > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 pt-6 border-t border-gray-200 gap-3">
          <div className="text-sm text-gray-600 text-center sm:text-left">
            Mostrando {(paginacion.paginaActual - 1) * paginacion.porPagina + 1} - 
            {Math.min(paginacion.paginaActual * paginacion.porPagina, paginacion.totalVehiculos)} de {paginacion.totalVehiculos} vehículos
          </div>
          
          <div className="flex flex-col xs:flex-row gap-2 justify-center sm:justify-end">
            <button
              onClick={() => handleCambiarPagina(paginacion.paginaActual - 1)}
              disabled={paginacion.paginaActual === 1}
              className="px-4 py-2.5 sm:px-3 sm:py-1.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>
            
            {/* Números de página */}
            <div className="flex items-center gap-1">
              {generarNumerosPagina().map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handleCambiarPagina(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    paginacion.paginaActual === pageNum
                      ? 'bg-blue-500 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleCambiarPagina(paginacion.paginaActual + 1)}
              disabled={paginacion.paginaActual === paginacion.totalPaginas}
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