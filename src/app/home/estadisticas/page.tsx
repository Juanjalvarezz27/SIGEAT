"use client"

import { useState, useEffect } from 'react'
import { TrendingUp } from 'lucide-react'
import FiltroFecha from '../../components/estadisticas/FiltroFecha'
import ResumenEstadisticas from '../../components/estadisticas/ResumenEstadisticas'
import ListaRegistrosFecha from '../../components/estadisticas/ListaRegistrosFecha'

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

  // helper local (NO Date global)
  const formatFecha = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`

  // Cargar registros del día actual
  useEffect(() => {
    const hoy = new Date()
    const hoyStr = formatFecha(hoy)

    buscarRegistros(hoyStr, hoyStr)
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

        {/* Resumen */}
        <div className="mb-6">
          <ResumenEstadisticas
            estadisticas={estadisticas}
            cargando={cargando}
          />
        </div>

        {/* Lista */}
        <ListaRegistrosFecha
          registros={registros}
          cargando={cargando}
        />
      </div>
    </div>
  )
}