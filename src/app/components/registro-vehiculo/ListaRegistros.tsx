"use client"

import { useState, useEffect, useRef } from 'react'
import { Car, Clock, DollarSign, CheckCircle, XCircle, AlertCircle, RefreshCw, Edit, Trash2, Hourglass, Wrench, CheckCheck, User, Phone, CreditCard } from 'lucide-react'
import ModalEditarRegistro from './ModalEditarRegistro'
import ModalConfirmacion from '../ui/ModalConfirmacion'
import { toast } from 'react-toastify'

interface RegistroVehiculo {
  id: number
  nombre: string
  cedula: string
  telefono: string
  placa: string
  fechaHora: string
  precioTotal: number
  precioTotalBs: number | null
  tipoVehiculoId: number
  servicioId: number
  estadoCarroId: number
  estadoPagoId: number
  referenciaPago: string | null
  notas: string | null
  tipoVehiculo: {
    id: number
    nombre: string
    categoria: string
  }
  servicio: {
    id: number
    nombre: string
    precio: number
    categoriaId: number
    categoria: {
      id: number
      nombre: string
    }
  }
  estadoCarro: {
    id: number
    nombre: string
  }
  estadoPago: {
    id: number
    nombre: string
  }
  serviciosExtras: Array<{
    servicioExtra: {
      id: number
      nombre: string
      precio: number
    }
  }>
}

interface ListaRegistrosProps {
  refreshKey?: number
  onRegistrosChange?: (estadisticas: { totalRegistros: number; totalIngresos: number }) => void
}

export default function ListaRegistros({ refreshKey = 0, onRegistrosChange }: ListaRegistrosProps) {
  const [registros, setRegistros] = useState<RegistroVehiculo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [datosFormulario, setDatosFormulario] = useState<any>(null)
  const [registroEditando, setRegistroEditando] = useState<RegistroVehiculo | null>(null)
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false)
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false)
  const [registroAEliminar, setRegistroAEliminar] = useState<RegistroVehiculo | null>(null)

  // Referencia para evitar doble toast
  const toastShownRef = useRef(false)

  // Cargar datos del formulario
  useEffect(() => {
    const fetchDatosFormulario = async () => {
      try {
        const response = await fetch('/api/registros-vehiculos/datos-formulario')
        if (response.ok) {
          const data = await response.json()
          setDatosFormulario(data)
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
      setError(null)

      // Notificar estadísticas SOLO si existe la función
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

  // Cargar registros al montar el componente o cuando cambie refreshKey
  useEffect(() => {
    fetchRegistros()
  }, [refreshKey])

  const handleRefresh = async () => {
    await fetchRegistros()
  }

  const handleEditar = (registro: RegistroVehiculo) => {
    setRegistroEditando(registro)
    setModalEditarAbierto(true)
  }

  const handleEliminarClick = (registro: RegistroVehiculo) => {
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

      // Actualizar lista
      await fetchRegistros()
      
      // Resetear flag de toast
      toastShownRef.current = false
      
      // Mostrar toast de éxito
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
        
        // Resetear después de mostrar
        setTimeout(() => {
          toastShownRef.current = false
        }, 100)
      }

    } catch (err) {
      setError('Error al eliminar el registro')
      console.error(err)
      
      // Mostrar toast de error
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
        
        // Resetear después de mostrar
        setTimeout(() => {
          toastShownRef.current = false
        }, 100)
      }
    }
  }

  const handleUpdate = async () => {
    await fetchRegistros()
    
    // Resetear flag de toast
    toastShownRef.current = false
    
    // Mostrar toast de éxito (solo una vez)
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
      
      // Resetear después de mostrar
      setTimeout(() => {
        toastShownRef.current = false
      }, 100)
    }
  }

  const formatFecha = (fechaString: string) => {
    try {
      // La fecha viene de la BD en formato ISO
      const fecha = new Date(fechaString)
      
      // Verificar si es una fecha válida
      if (isNaN(fecha.getTime())) {
        return 'Hora inválida'
      }
      
      // Formatear la hora y fecha
      return fecha.toLocaleString('es-VE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/Caracas'
      })
    } catch (error) {
      console.error('Error al formatear fecha:', error, fechaString)
      return 'Error'
    }
  }

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
      case 1: // Pendiente
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 2: // En proceso
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 3: // Completado
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getEstadoCarroIcon = (id: number) => {
    switch (id) {
      case 1: // Pendiente
        return <Hourglass className="h-3.5 w-3.5 mr-1" />
      case 2: // En proceso
        return <Wrench className="h-3.5 w-3.5 mr-1" />
      case 3: // Completado
        return <CheckCheck className="h-3.5 w-3.5 mr-1" />
      default:
        return null
    }
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

  if (registros.length === 0) {
    return (
      <div className="text-center py-8">
        <Car className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-gray-900 mb-1">No hay registros hoy</h3>
        <p className="text-gray-600 text-sm">Los registros del día aparecerán aquí</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {/* Contador de registros */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs sm:text-sm text-gray-600">
            Mostrando <span className="font-semibold">{registros.length}</span> registros
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`flex items-center text-xs sm:text-sm font-medium ${
              refreshing
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:text-blue-700'
            }`}
            aria-label="Actualizar lista"
          >
            <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>

        {/* Lista de registros */}
        <div className="space-y-3">
          {registros.map(registro => (
            <div
              key={registro.id}
              className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-4 hover:border-gray-300 transition hover:shadow-sm"
            >
              {/* Header móvil: Placa y acciones */}
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Car className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
                  </div>
                  <div>
                    <div className="flex flex-col">
                      <span className="font-bold text-base sm:text-lg text-gray-900">{registro.placa}</span>
                      <span className="text-xs text-gray-500">
                        {registro.tipoVehiculo.nombre}
                      </span>
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

              {/* Información principal - Diseño vertical para móvil */}
              <div className="space-y-3">
                {/* Cliente y hora - En fila en móvil */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{registro.nombre}</p>
                      <p className="text-xs text-gray-500 font-mono">{registro.cedula}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <span>{formatFecha(registro.fechaHora)}</span>
                  </div>
                </div>

                {/* Servicio y estados - En columnas para móvil */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Servicio */}
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-start">
                      <CreditCard className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-blue-700 font-medium">Servicio</p>
                        <p className="text-sm font-semibold text-blue-600 truncate">{registro.servicio.nombre}</p>
                      </div>
                    </div>
                  </div>

                  {/* Estados */}
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

                {/* Precios - En fila compacta para móvil */}
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

                {/* Teléfono y servicios extras */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-sm text-gray-700">{registro.telefono}</span>
                    </div>
                    
                    {/* SECCIÓN EXTRAS MODIFICADA */}
                    {registro.serviciosExtras.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-xs font-medium text-gray-500 mr-1">
                          Extras:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {/* Se eliminó el slice para mostrar todos */}
                          {registro.serviciosExtras.map((extra, idx) => (
                            <span
                              key={idx}
                              // Se eliminaron las clases de truncamiento (truncate, max-w)
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
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de edición */}
      <ModalEditarRegistro
        isOpen={modalEditarAbierto}
        onClose={() => setModalEditarAbierto(false)}
        registro={registroEditando}
        onUpdate={handleUpdate}
        datosFormulario={datosFormulario}
      />

      {/* Modal de confirmación para eliminar */}
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