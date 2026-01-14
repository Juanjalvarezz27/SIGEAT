"use client"

import { useState, useEffect, useCallback } from 'react'
import { Car, Users, Calendar, TrendingUp } from 'lucide-react'
import BuscadorVehiculos from '../../components/vehiculos/BuscadorVehiculos'
import ListaVehiculos from '../../components/vehiculos/ListaVehiculos'

interface HistorialRegistro {
  id: number
  fecha: Date
  servicio: string
  precio: number
  estadoPago: string
  referenciaPago: string | null
  notas: string | null
}

interface Vehiculo {
  placa: string
  cliente: {
    nombre: string
    cedula: string
    telefono: string
    color: string
  }
  vehiculo: {
    tipo: string
    estado: string
  }
  estadisticas: {
    totalVisitas: number
    ultimaVisita: Date
    totalGastado: number
    serviciosUsados: string[]
  }
  historial: HistorialRegistro[]
}

export default function Vehiculos() {
  const [cargando, setCargando] = useState(false)
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [busqueda, setBusqueda] = useState({ termino: '', tipo: 'placa' })
  const [paginacion, setPaginacion] = useState({
    paginaActual: 1,
    totalPaginas: 1,
    totalVehiculos: 0,
    porPagina: 20
  })
  const [estadisticas, setEstadisticas] = useState({
    totalClientes: 0,
    ultimaActualizacion: new Date()
  })

  // Debounce para búsqueda automática
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }

  // Cargar datos con debounce
  const cargarVehiculos = useCallback(async () => {
    setCargando(true)
    try {
      const params = new URLSearchParams({
        page: paginacion.paginaActual.toString(),
        limit: paginacion.porPagina.toString(),
        search: busqueda.termino,
        searchType: busqueda.tipo
      })

      const response = await fetch(`/api/vehiculos?${params}`)

      if (!response.ok) {
        throw new Error('Error al cargar vehículos')
      }

      const data = await response.json()

      if (data.success) {
        setVehiculos(data.datos.vehiculos)
        setPaginacion(data.datos.paginacion)
        
        // Calcular estadísticas
        setEstadisticas({
          totalClientes: data.datos.paginacion.totalVehiculos,
          ultimaActualizacion: new Date()
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setVehiculos([])
      setPaginacion({
        paginaActual: 1,
        totalPaginas: 1,
        totalVehiculos: 0,
        porPagina: 20
      })
    } finally {
      setCargando(false)
    }
  }, [busqueda.termino, busqueda.tipo, paginacion.paginaActual])

  // Efecto para búsqueda automática
  useEffect(() => {
    if (busqueda.termino.length === 0 || busqueda.termino.length >= 3) {
      const debouncedSearch = debounce(cargarVehiculos, 500)
      debouncedSearch()
    }
  }, [busqueda.termino, busqueda.tipo, cargarVehiculos])

  // Cargar datos iniciales
  useEffect(() => {
    cargarVehiculos()
  }, [paginacion.paginaActual])

  const handleBuscar = (termino: string, tipo: string) => {
    setBusqueda({ termino, tipo })
    setPaginacion(prev => ({ ...prev, paginaActual: 1 }))
  }

  const handleCambiarPagina = (pagina: number) => {
    setPaginacion(prev => ({ ...prev, paginaActual: pagina }))
  }

  const formatFecha = (fecha: Date) => {
    return fecha.toLocaleDateString('es-VE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Car className="h-6 w-6 mr-3 text-blue-500" />
            Base de Datos de Clientes y Vehículos
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona y consulta toda la información de clientes y sus vehículos
          </p>
        </div>

        {/* Estadísticas */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Total Clientes */}
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Clientes registrados</p>
                    <div className="flex items-baseline space-x-2">
                      <p className="text-2xl font-bold text-gray-900">
                        {estadisticas.totalClientes.toLocaleString()}
                      </p>
                      <span className="text-sm text-gray-500">
                        vehículos únicos
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Separador */}
              <div className="hidden md:block h-8 w-px bg-gray-200"></div>

              {/* Última actualización */}
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Última actualización</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatFecha(estadisticas.ultimaActualizacion)}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Buscador */}
        <div className="mb-6">
          <BuscadorVehiculos
            onBuscar={handleBuscar}
            cargando={cargando}
            busquedaActual={busqueda}
          />
        </div>

        {/* Lista de vehículos */}
        <ListaVehiculos
          vehiculos={vehiculos}
          cargando={cargando}
          paginacion={paginacion}
          onCambiarPagina={handleCambiarPagina}
        />
      </div>
    </div>
  )
}