"use client"

import { useState, useEffect } from 'react'
import { TrendingUp, ChevronDown, ChevronUp, Calculator, List, BarChart3 } from 'lucide-react'
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
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header Principal */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-[#122a4e] rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-[#122a4e]/20">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#140f07] tracking-tight">
                Estadísticas
              </h1>
              <p className="text-sm font-medium text-[#122a4e]/60">
                Análisis financiero y operativo
              </p>
            </div>
          </div>
        </div>

        {/* Filtro de Fechas */}
        <FiltroFecha
          onFiltrar={buscarRegistros}
          cargando={cargando}
          infoPeriodo={infoPeriodo}
        />

        {/* Resumen de Estadísticas (KPIs) */}
        <div className="mb-6">
          <ResumenEstadisticas
            estadisticas={estadisticas}
            cargando={cargando}
          />
        </div>

        {/* Acordeón: Lista de Registros */}
        <div className="mb-6">
          <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-[#869dfc]/10 overflow-hidden transition-all duration-300">
            <button
              onClick={() => setMostrarRegistros(!mostrarRegistros)}
              className="w-full p-5 flex items-center justify-between hover:bg-[#f8f9fc] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#e2e2f6] rounded-xl flex items-center justify-center shrink-0">
                  <List className="h-5 w-5 text-[#4260ad]" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-[#140f07]">
                    Detalle de Registros
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Ver listado completo del período
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#4260ad] bg-[#e2e2f6] px-2 py-1 rounded-lg">
                  {mostrarRegistros ? 'Ocultar' : 'Ver'}
                </span>
                {mostrarRegistros ? (
                  <ChevronUp className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
              </div>
            </button>

            {mostrarRegistros && (
              <div className="border-t border-slate-100 bg-[#f8f9fc] p-4">
                <ListaRegistrosFecha
                  registros={registros}
                  cargando={cargando}
                  onActualizarEstado={(id, nuevoEstado) => {
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

        {/* Acordeón: Calculadora Semanal */}
        <div className="mb-20">
          <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-[#869dfc]/10 overflow-hidden transition-all duration-300">
            <button
              onClick={() => setMostrarCalculadora(!mostrarCalculadora)}
              className="w-full p-5 flex items-center justify-between hover:bg-[#f8f9fc] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#122a4e] rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-[#122a4e]/10">
                  <Calculator className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-[#140f07]">
                    Calculadora de Nómina
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Calcular pagos semanales
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#4260ad] bg-[#e2e2f6] px-2 py-1 rounded-lg">
                  {mostrarCalculadora ? 'Ocultar' : 'Calcular'}
                </span>
                {mostrarCalculadora ? (
                  <ChevronUp className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
              </div>
            </button>

            {mostrarCalculadora && (
              <div className="border-t border-slate-100 bg-[#f8f9fc] p-4">
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