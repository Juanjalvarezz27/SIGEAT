"use client"

import { useState, useEffect } from 'react'
import { TrendingUp, ChevronDown, ChevronUp, Calculator, List } from 'lucide-react'
import FiltroFecha from '../../components/estadisticas/FiltroFecha'
import ResumenEstadisticas from '../../components/estadisticas/ResumenEstadisticas'
import ListaRegistrosFecha from '../../components/estadisticas/ListaRegistrosFecha'
import CalculadoraSemananal from '../../components/estadisticas/CalculadoraSemananal'

// Interface actualizada basada en el esquema Prisma
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

interface Estadisticas {
  totalRegistros: number
  totalIngresos: number
  ingresosBs: number
  promedioPorVehiculo: number
  vehiculosPorDia: number
  fechaInicio: string
  fechaFin: string
  totalDias: number
  registrosPorTipo: Array<{
    tipo: string
    cantidad: number
    porcentaje: number
  }>
}

export default function Estadisticas() {
  const [cargando, setCargando] = useState(false)
  const [registros, setRegistros] = useState<RegistroFecha[]>([])
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    totalRegistros: 0,
    totalIngresos: 0,
    ingresosBs: 0,
    promedioPorVehiculo: 0,
    vehiculosPorDia: 0,
    fechaInicio: '',
    fechaFin: '',
    totalDias: 0,
    registrosPorTipo: []
  })

  const [infoPeriodo, setInfoPeriodo] = useState({
    fechaInicio: '',
    fechaFin: '',
    totalDias: 0,
    fechaConsulta: ''
  })

  const [totalSemanaActual, setTotalSemanaActual] = useState<number>(0)
  const [cargandoSemana, setCargandoSemana] = useState<boolean>(true)
  const [mostrarRegistros, setMostrarRegistros] = useState<boolean>(false)
  const [mostrarCalculadora, setMostrarCalculadora] = useState<boolean>(false)

  // helper local (NO Date global)
  const formatFecha = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`

  // Función para calcular el lunes de esta semana
  const getLunesDeEstaSemana = () => {
    const hoy = new Date()
    const dia = hoy.getDay() // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    
    // Calcular lunes de esta semana
    const lunes = new Date(hoy)
    const diffLunes = dia === 0 ? -6 : 1 - dia // Si es domingo, retroceder 6 días
    lunes.setDate(hoy.getDate() + diffLunes)
    
    return lunes
  }

  // Función para calcular el domingo de esta semana
  const getDomingoDeEstaSemana = () => {
    const lunes = getLunesDeEstaSemana()
    const domingo = new Date(lunes)
    domingo.setDate(lunes.getDate() + 6)
    return domingo
  }

  // Cargar total de la semana actual
  const cargarTotalSemanaActual = async () => {
    setCargandoSemana(true)
    try {
      const lunes = getLunesDeEstaSemana()
      const domingo = getDomingoDeEstaSemana()
      
      const fechaInicio = formatFecha(lunes)
      const fechaFin = formatFecha(domingo)

      const response = await fetch(
        `/api/estadisticas/semana?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
      )

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setTotalSemanaActual(data.datos.totalIngresos)
        }
      }
    } catch (error) {
      console.error('Error al cargar total de la semana:', error)
      setTotalSemanaActual(0)
    } finally {
      setCargandoSemana(false)
    }
  }

  // Cargar registros del día actual
  useEffect(() => {
    const hoy = new Date()
    const hoyStr = formatFecha(hoy)

    buscarRegistros(hoyStr, hoyStr)
    cargarTotalSemanaActual()
  }, [])

  const buscarRegistros = async (
    fechaInicio: string,
    fechaFin: string
  ) => {
    setCargando(true)

    try {
      const response = await fetch(
        `/api/estadisticas/fecha?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
      )

      if (!response.ok) {
        throw new Error('Error al cargar estadísticas')
      }

      const data = await response.json()

      if (data.success) {
        setRegistros(data.datos.registros)
        setEstadisticas(data.datos.estadisticas)

        setInfoPeriodo({
          fechaInicio: data.datos.estadisticas.fechaInicio,
          fechaFin: data.datos.estadisticas.fechaFin,
          totalDias: data.datos.estadisticas.totalDias,
          fechaConsulta: new Date().toLocaleDateString('es-VE', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        })
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al cargar las estadísticas. Intenta nuevamente.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <TrendingUp className="h-6 w-6 mr-3 text-blue-500" />
            Estadísticas por Fecha
          </h1>
          <p className="text-gray-600 mt-2">
            Consulta y analiza los registros por período específico o por mes
          </p>
        </div>

        {/* Filtro */}
        <FiltroFecha
          onFiltrar={buscarRegistros}
          cargando={cargando}
          infoPeriodo={infoPeriodo}
        />

        {/* Resumen (SIEMPRE VISIBLE) */}
        <div className="mb-6">
          <ResumenEstadisticas
            estadisticas={estadisticas}
            cargando={cargando}
          />
        </div>

        {/* Lista de Registros - EN DESPLEGABLE */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header del desplegable */}
            <button
              onClick={() => setMostrarRegistros(!mostrarRegistros)}
              className="w-full p-4 md:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <List className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Registros del Período
                  </h3>
                </div>
              </div>
              <div className="flex items-center">
                <span className="mr-3 text-sm text-gray-500">
                  {mostrarRegistros ? 'Ocultar' : 'Mostrar'}
                </span>
                {mostrarRegistros ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </button>

            {/* Contenido desplegable */}
            {mostrarRegistros && (
            <div className="border-t border-gray-200">
              <ListaRegistrosFecha
                registros={registros}
                cargando={cargando}
                onActualizarEstado={(id, nuevoEstado) => {
                  // Actualizar el estado local si es necesario
                  setRegistros(prev => prev.map(registro =>
                    registro.id === id 
                      ? { ...registro, estadoPago: nuevoEstado }
                      : registro
                  ))
                }}
              />
            </div>
            )}
          </div>
        </div>

        {/* Calculadora Semanal - EN DESPLEGABLE AL FINAL */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header del desplegable */}
            <button
              onClick={() => setMostrarCalculadora(!mostrarCalculadora)}
              className="w-full p-4 md:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <Calculator className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Calculadora Semanal 
                  </h3>
                </div>
              </div>
              <div className="flex items-center ">
                <span className="mr-3 p-0.5 text-sm text-gray-500">
                  {mostrarCalculadora ? 'Ocultar' : 'Mostrar'}
                </span>
                {mostrarCalculadora ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </button>

            {/* Contenido desplegable */}
            {mostrarCalculadora && (
              <div className="border-t border-gray-200">
                <CalculadoraSemananal
                  totalSemanaUSD={totalSemanaActual}
                  cargando={cargandoSemana}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}