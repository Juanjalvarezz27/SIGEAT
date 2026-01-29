"use client"

import { useState, useEffect } from 'react'
import {
  Car, User, Calendar, DollarSign, Phone, Hash,
  ChevronDown, ChevronUp, CheckCircle, Clock, 
  FileText, MessageSquare, Wrench, TrendingUp,
  LayoutList, UserCircle2, Wallet
} from 'lucide-react'

interface HistorialRegistro {
  id: number
  fecha: Date | string
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
    ultimaVisita: Date | string
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

  useEffect(() => {
    setVehiculoExpandido(null)
    setHistorialExpandido(null)
  }, [paginacion.paginaActual])

  const formatFecha = (fechaInput: Date | string) => {
    try {
      const fecha = new Date(fechaInput)
      if (isNaN(fecha.getTime())) return 'Fecha inválida'
      return fecha.toLocaleDateString('es-VE', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      })
    } catch (error) {
      return 'Error en fecha'
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-VE', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    }).format(num)
  }

  const handleCambiarPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= paginacion.totalPaginas) {
      onCambiarPagina(pagina)
    }
  }

  const generarNumerosPagina = () => {
    const numerosPagina: number[] = []
    const maxPaginasMostrar = 5
    if (paginacion.totalPaginas <= maxPaginasMostrar) {
      for (let i = 1; i <= paginacion.totalPaginas; i++) numerosPagina.push(i)
    } else {
      let inicio = Math.max(1, paginacion.paginaActual - 2)
      let fin = Math.min(paginacion.totalPaginas, inicio + maxPaginasMostrar - 1)
      if (fin - inicio + 1 < maxPaginasMostrar) inicio = Math.max(1, fin - maxPaginasMostrar + 1)
      for (let i = inicio; i <= fin; i++) numerosPagina.push(i)
    }
    return numerosPagina
  }

  if (cargando) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-[#869dfc]/10 p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-100 rounded-xl w-1/4"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-slate-50 rounded-2xl"></div>
          ))}
        </div>
      </div>
    )
  }

  if (vehiculos.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-[#869dfc]/10 p-10 text-center">
        <div className="w-16 h-16 bg-[#f4f6fc] rounded-full flex items-center justify-center mx-auto mb-4">
          <Car className="h-8 w-8 text-[#869dfc]" />
        </div>
        <h3 className="text-lg font-bold text-[#140f07]">No se encontraron vehículos</h3>
        <p className="text-slate-500 text-sm mt-2">Intenta ajustar los criterios de búsqueda.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-[#869dfc]/10 p-5 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-3 border-b border-slate-50 pb-5">
        <div>
          <h3 className="text-xl font-black text-[#140f07] flex items-center gap-2">
            <LayoutList className="h-5 w-5 text-[#4260ad]" />
            Base de Datos de Vehículos
          </h3>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Total registrados: <span className="text-[#122a4e] font-bold">{paginacion.totalVehiculos}</span>
          </p>
        </div>
        <div className="px-4 py-2 bg-[#f8f9fc] rounded-xl border border-slate-100 text-xs font-bold text-[#4260ad]">
          PÁGINA {paginacion.paginaActual} DE {paginacion.totalPaginas}
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-4">
        {vehiculos.map((vehiculo) => (
          <div
            key={vehiculo.placa}
            className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:border-[#869dfc]/40 transition-colors shadow-sm group"
          >
            {/* Header Clickable */}
            <div
              className="p-4 cursor-pointer hover:bg-[#fcfdff]"
              onClick={() => setVehiculoExpandido(vehiculoExpandido === vehiculo.placa ? null : vehiculo.placa)}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#122a4e] rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-[#122a4e]/10">
                    <Car className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-[#140f07] text-xl tracking-tight">{vehiculo.placa}</span>
                      <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-lg ${
                        vehiculo.estadisticas.totalVisitas > 5 ? 'bg-emerald-100 text-emerald-700' :
                        vehiculo.estadisticas.totalVisitas > 2 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {vehiculo.estadisticas.totalVisitas} Visitas
                      </span>
                    </div>
                    <p className="text-sm font-bold text-[#4260ad] flex items-center gap-1.5 mt-0.5">
                      <UserCircle2 className="h-3.5 w-3.5" />
                      {vehiculo.cliente.nombre}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0">
                  <div className="text-center md:text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inversión Total</p>
                    <p className="text-lg font-black text-[#122a4e]">${formatNumber(vehiculo.estadisticas.totalGastado)}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-[#f4f6fc] text-slate-400 group-hover:text-[#4260ad] transition-colors">
                    {vehiculoExpandido === vehiculo.placa ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Expansión de Detalles */}
            {vehiculoExpandido === vehiculo.placa && (
              <div className="bg-[#f8f9fc] border-t border-slate-100 p-5 space-y-6 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Info Cliente */}
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <User className="h-3.5 w-3.5" /> Ficha Cliente
                    </h4>
                    <div className="space-y-3">
                      <div className="p-2.5 bg-[#fcfdff] rounded-xl border border-slate-50">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Documento / Cédula</p>
                        <p className="text-sm font-bold text-[#140f07] flex items-center gap-2 mt-0.5">
                          <Hash className="h-3.5 w-3.5 text-[#4260ad]" /> {vehiculo.cliente.cedula}
                        </p>
                      </div>
                      <div className="p-2.5 bg-[#fcfdff] rounded-xl border border-slate-50">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Contacto Directo</p>
                        <p className="text-sm font-bold text-[#140f07] flex items-center gap-2 mt-0.5">
                          <Phone className="h-3.5 w-3.5 text-[#4260ad]" /> {vehiculo.cliente.telefono}
                        </p>
                      </div>
                      {vehiculo.cliente.color && (
                        <div className="flex items-center justify-between p-2.5 bg-[#fcfdff] rounded-xl border border-slate-50">
                          <span className="text-xs font-bold text-slate-500">Color: {vehiculo.cliente.color}</span>
                          <div className="w-4 h-4 rounded-full shadow-inner border border-slate-200" style={{ backgroundColor: vehiculo.cliente.color.toLowerCase() }} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Resumen Operativo */}
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5" /> Métricas
                    </h4>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                        <p className="text-[10px] font-black text-emerald-600 uppercase">Visitas</p>
                        <p className="text-xl font-black text-emerald-900">{vehiculo.estadisticas.totalVisitas}</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                        <p className="text-[10px] font-black text-blue-600 uppercase">Invertido</p>
                        <p className="text-xl font-black text-blue-900">${formatNumber(vehiculo.estadisticas.totalGastado)}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <p className="text-[10px] font-black text-amber-600 uppercase mb-1">Última Actividad</p>
                      <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                        <Calendar className="h-3.5 w-3.5" /> {formatFecha(vehiculo.estadisticas.ultimaVisita)}
                      </div>
                    </div>
                  </div>

                  {/* Servicios */}
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Wrench className="h-3.5 w-3.5" /> Servicios Frecuentes
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                      {vehiculo.estadisticas.serviciosUsados.map((servicio, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-[#f8f9fc] rounded-xl border border-slate-50">
                          <span className="text-xs font-bold text-slate-700 truncate pr-2">{servicio}</span>
                          <span className="bg-white px-2 py-0.5 rounded-lg text-[10px] font-black text-[#4260ad] border border-slate-100 shrink-0">
                            {vehiculo.historial.filter(h => h.servicio === servicio).length}x
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Historial Desplegable */}
                <div className="mt-4">
                  <button
                    onClick={() => setHistorialExpandido(historialExpandido === vehiculo.placa ? null : vehiculo.placa)}
                    className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all font-bold text-sm border ${
                      historialExpandido === vehiculo.placa 
                        ? 'bg-[#122a4e] text-white border-[#122a4e]' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-[#4260ad]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4" />
                      Visitas
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${historialExpandido === vehiculo.placa ? 'bg-white/10' : 'bg-slate-100 text-slate-500'}`}>
                        {vehiculo.historial.length}
                      </span>
                    </div>
                    {historialExpandido === vehiculo.placa ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>

                  {historialExpandido === vehiculo.placa && (
                    <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
                      {vehiculo.historial.map((registro) => (
                        <div key={registro.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                          {/* Top del Registro: Servicio, Fecha y Precio */}
                          <div className="p-4 flex flex-col sm:flex-row justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2.5 bg-[#f4f6fc] rounded-xl text-[#4260ad] shrink-0">
                                <Calendar className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-black text-[#140f07] leading-tight mb-1">{formatFecha(registro.fecha)}</p>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-bold px-2 py-0.5 bg-[#e2e2f6] text-[#122a4e] rounded-lg truncate max-w-37.5">
                                    {registro.servicio}
                                  </span>
                                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border ${
                                    registro.estadoPago.toLowerCase() === 'pagado' 
                                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                      : 'bg-amber-50 text-amber-600 border-amber-100'
                                  }`}>
                                    {registro.estadoPago}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest sm:hidden">Monto</span>
                               <p className="text-xl font-black text-[#122a4e] tracking-tight">
                                 ${formatNumber(registro.precio)}
                               </p>
                            </div>
                          </div>

                          {/* Footer del Registro: Ref y Notas */}
                          {(registro.referenciaPago || registro.notas) && (
                            <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {registro.referenciaPago && (
                                <div className="flex items-center gap-2 bg-[#f8f9fc] p-2 rounded-xl border border-slate-50">
                                  <FileText className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-tighter">REF: {registro.referenciaPago}</span>
                                </div>
                              )}
                              {registro.notas && (
                                <div className="flex items-start gap-2 bg-amber-50/50 p-2 rounded-xl border border-amber-100/50">
                                  <MessageSquare className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                                  <p className="text-[11px] text-amber-700 italic leading-snug line-clamp-2">
                                    {registro.notas}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
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
        <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            MOSTRANDO <span className="text-[#140f07]">{vehiculos.length}</span> DE <span className="text-[#140f07]">{paginacion.totalVehiculos}</span> VEHÍCULOS
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCambiarPagina(paginacion.paginaActual - 1)}
              disabled={paginacion.paginaActual === 1}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-[#e2e2f6] hover:text-[#4260ad] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <ChevronDown className="h-5 w-5 rotate-90" />
            </button>
            
            <div className="flex items-center gap-1.5 px-2">
              {generarNumerosPagina().map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handleCambiarPagina(pageNum)}
                  className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${
                    paginacion.paginaActual === pageNum
                      ? 'bg-[#122a4e] text-white shadow-lg shadow-[#122a4e]/20 scale-110'
                      : 'bg-white border border-slate-200 text-slate-400 hover:border-[#4260ad] hover:text-[#4260ad]'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleCambiarPagina(paginacion.paginaActual + 1)}
              disabled={paginacion.paginaActual === paginacion.totalPaginas}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-[#e2e2f6] hover:text-[#4260ad] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <ChevronDown className="h-5 w-5 -rotate-90" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}