"use client"

import { useState } from "react"
import { Filter, Search, ChevronDown, ChevronUp, CalendarRange, Calendar } from "lucide-react"

interface FiltroFechaProps {
  onFiltrar: (fechaInicio: string, fechaFin: string) => void
  cargando: boolean
  infoPeriodo?: {
    fechaInicio: string
    fechaFin: string
    totalDias: number
    fechaConsulta: string
  }
}

export default function FiltroFecha({
  onFiltrar,
  cargando,
  infoPeriodo
}: FiltroFechaProps) {
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false)

  const opcionesRapidas = [
    { nombre: "Hoy" },
    { nombre: "Ayer" },
    { nombre: "Últimos 3 días" },
    { nombre: "Ver semana" }
  ]

  const format = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`

  const handleOpcionRapida = (opcion: { nombre: string }) => {
    const hoy = new Date()
    let inicio = ""
    let fin = ""

    switch (opcion.nombre) {
      case "Hoy":
        inicio = fin = format(hoy)
        break

      case "Ayer":
        const ayer = new Date(hoy)
        ayer.setDate(hoy.getDate() - 1)
        inicio = fin = format(ayer)
        break

      case "Últimos 3 días":
        const inicio3 = new Date(hoy)
        inicio3.setDate(hoy.getDate() - 2)
        inicio = format(inicio3)
        fin = format(hoy)
        break

      case "Ver semana":
        const diaSemana = hoy.getDay()
        const diffLunes = diaSemana === 0 ? -6 : 1 - diaSemana
        const lunes = new Date(hoy)
        lunes.setDate(hoy.getDate() + diffLunes)
        const domingo = new Date(lunes)
        domingo.setDate(lunes.getDate() + 6)
        inicio = format(lunes)
        fin = format(domingo)
        break

      default:
        return
    }

    setFechaInicio(inicio)
    setFechaFin(fin)
    onFiltrar(inicio, fin)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!fechaInicio || !fechaFin) {
      alert("Por favor selecciona ambas fechas")
      return
    }

    if (fechaFin < fechaInicio) {
      alert("La fecha fin no puede ser anterior a la fecha inicio")
      return
    }

    onFiltrar(fechaInicio, fechaFin)
  }

  return (
    <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-[#869dfc]/10 p-5 mb-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-black text-[#140f07] flex items-center gap-2">
            <div className="p-1.5 bg-[#e2e2f6] rounded-lg">
                <Filter className="h-4 w-4 text-[#4260ad]" />
            </div>
            Filtro por Fecha
          </h3>
          <p className="text-xs font-medium text-slate-500 mt-1 ml-1">
            Consulta registros por período específico
          </p>
        </div>

        <button
          onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
          className={`flex items-center justify-center sm:justify-start gap-2 text-sm font-bold px-4 py-2.5 rounded-xl transition-all w-full sm:w-auto ${
             mostrarFiltrosAvanzados 
             ? 'bg-[#122a4e] text-white shadow-lg shadow-[#122a4e]/20' 
             : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#122a4e]'
          }`}
        >
          {mostrarFiltrosAvanzados ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          <span>Filtros avanzados</span>
        </button>
      </div>

      {/* Info Periodo */}
      {infoPeriodo && (
        <div className="mb-6 bg-[#f8f9fc] border border-slate-100 rounded-2xl p-4 text-sm shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-1 bg-white rounded-md border border-slate-100 shadow-sm shrink-0">
               <CalendarRange className="h-4 w-4 text-[#4260ad]" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-[#140f07]">
              <div className="flex items-center gap-2 font-bold">
                 <span>{infoPeriodo.fechaInicio}</span>
                 <span className="text-[#4260ad]">→</span>
                 <span>{infoPeriodo.fechaFin}</span>
              </div>
              <span className="text-xs font-bold text-[#4260ad] bg-[#e2e2f6] px-2 py-0.5 rounded-md w-fit mt-1 sm:mt-0">
                {infoPeriodo.totalDias} días
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Opciones Rápidas */}
      <div className="mb-2">
        <p className="text-xs font-bold text-[#122a4e]/70 uppercase tracking-wider mb-3">
          Opciones rápidas
        </p>
        <div className="flex flex-wrap gap-2">
          {opcionesRapidas.map(opcion => (
            <button
              key={opcion.nombre}
              onClick={() => handleOpcionRapida(opcion)}
              className="px-4 py-2 bg-white hover:bg-[#e2e2f6] border border-slate-200 hover:border-[#869dfc]/30 rounded-xl text-sm font-bold text-slate-600 hover:text-[#4260ad] transition-all whitespace-nowrap active:scale-95"
            >
              {opcion.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Filtros Avanzados */}
      {mostrarFiltrosAvanzados && (
        <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-[#f8f9fc] border border-slate-100 rounded-2xl p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Fecha inicio */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#122a4e] ml-1 uppercase tracking-wider">
                      Fecha inicio
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4260ad] transition-colors pointer-events-none">
                         <Calendar className="h-4 w-4" />
                      </div>
                      <input
                        type="date"
                        value={fechaInicio}
                        onChange={e => setFechaInicio(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-transparent rounded-xl focus:bg-white focus:border-[#869dfc] focus:ring-0 text-[#140f07] font-medium text-sm outline-none transition-colors shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Fecha fin */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#122a4e] ml-1 uppercase tracking-wider">
                      Fecha fin
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4260ad] transition-colors pointer-events-none">
                         <Calendar className="h-4 w-4" />
                      </div>
                      <input
                        type="date"
                        value={fechaFin}
                        onChange={e => setFechaFin(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-transparent rounded-xl focus:bg-white focus:border-[#869dfc] focus:ring-0 text-[#140f07] font-medium text-sm outline-none transition-colors shadow-sm"
                      />
                    </div>
                  </div>
              </div>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={cargando}
              className="w-full h-12 bg-[#4260ad] hover:bg-[#122a4e] text-white rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-[#4260ad]/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <Search className="h-4 w-4" />
              {cargando ? "Buscando..." : "Buscar registros"}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}