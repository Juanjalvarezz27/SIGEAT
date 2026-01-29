"use client"

import { useState, useEffect, useCallback } from 'react'
import { Car, Users, Calendar, ShieldCheck, Clock } from 'lucide-react'
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

  // Función de carga envuelta en useCallback para mantener referencia estable
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
      if (!response.ok) throw new Error('Error al cargar vehículos')

      const data = await response.json()
      if (data.success) {
        setVehiculos(data.datos.vehiculos)
        setPaginacion(data.datos.paginacion)
        setEstadisticas({
          totalClientes: data.datos.paginacion.totalVehiculos,
          ultimaActualizacion: new Date()
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setVehiculos([])
    } finally {
      setCargando(false)
    }
  }, [paginacion.paginaActual, paginacion.porPagina, busqueda.termino, busqueda.tipo])

  // EFECTO DE CARGA: Se dispara cuando cambia la página o la búsqueda
  useEffect(() => {
    cargarVehiculos()
  }, [cargarVehiculos])

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
    <div className="min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header Principal */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-16 h-16 bg-[#122a4e] rounded-3xl flex items-center justify-center shadow-xl shadow-[#122a4e]/20 shrink-0">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#140f07] tracking-tight">
                Clientes y Vehículos
              </h1>
              <p className="text-sm font-medium text-[#122a4e]/60">
                Base de datos centralizada de registros históricos
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-3xl border border-[#869dfc]/10 p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-center gap-5">
            <div className="w-14 h-14 bg-[#f4f6fc] rounded-2xl flex items-center justify-center shrink-0">
               <ShieldCheck className="h-7 w-7 text-[#4260ad]" />
            </div>
            <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Base de Datos</p>
               <div className="flex items-baseline gap-2">
                 <p className="text-3xl font-black text-[#140f07]">
                   {estadisticas.totalClientes.toLocaleString()}
                 </p>
                 <span className="text-sm font-bold text-[#4260ad]">Vehículos únicos</span>
               </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#869dfc]/10 p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-center gap-5">
            <div className="w-14 h-14 bg-[#f4f6fc] rounded-2xl flex items-center justify-center shrink-0">
               <Clock className="h-7 w-7 text-[#4260ad]" />
            </div>
            <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sincronización</p>
               <p className="text-xl font-black text-[#140f07]">
                 {formatFecha(estadisticas.ultimaActualizacion)}
               </p>
               <p className="text-xs font-medium text-slate-400 mt-1">Última consulta realizada</p>
            </div>
          </div>
        </div>

        {/* Buscador Integrado */}
        <div className="mb-8">
          <BuscadorVehiculos
            onBuscar={handleBuscar}
            cargando={cargando}
            busquedaActual={busqueda}
          />
        </div>

        {/* Listado de Vehículos */}
        <div className="bg-[#fcfdff] rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40">
          <ListaVehiculos
            vehiculos={vehiculos}
            cargando={cargando}
            paginacion={paginacion}
            onCambiarPagina={handleCambiarPagina}
          />
        </div>

      </div>
    </div>
  )
}