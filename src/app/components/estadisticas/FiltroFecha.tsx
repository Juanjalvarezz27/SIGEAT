"use client"

import { useState } from "react"
import { Filter, Search, ChevronDown, ChevronUp, Info } from "lucide-react"

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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold flex items-center mb-1">
            <Filter className="h-5 w-5 mr-2 text-blue-500 shrink-0" />
            Filtro por Fecha
          </h3>
          <p className="text-sm text-gray-600">
            Consulta registros por período específico
          </p>
        </div>

        <button
          onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
          className="flex items-center justify-center sm:justify-start gap-1 text-sm text-gray-700 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
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
        <div className="mb-4 md:mb-6 bg-blue-50 border border-blue-100 rounded-xl p-3 md:p-4 text-sm">
          <div className="flex items-start">
            <Info className="mr-2 text-blue-500 shrink-0 mt-0.5" />
            <div className="flex flex-wrap items-center gap-1">
              <strong className="whitespace-nowrap">{infoPeriodo.fechaInicio}</strong>
              <span className="text-blue-400 mx-1">→</span>
              <strong className="whitespace-nowrap">{infoPeriodo.fechaFin}</strong>
              <span className="text-gray-600 ml-1 whitespace-nowrap">
                ({infoPeriodo.totalDias} días)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Opciones Rápidas */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-2">
          Opciones rápidas
        </p>
        <div className="flex flex-wrap gap-2">
          {opcionesRapidas.map(opcion => (
            <button
              key={opcion.nombre}
              onClick={() => handleOpcionRapida(opcion)}
              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg text-sm font-medium text-blue-700 transition-colors whitespace-nowrap"
            >
              {opcion.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Filtros Avanzados */}
      {mostrarFiltrosAvanzados && (
        <div className="pt-4 border-t border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Rango de fechas específico
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Fecha inicio
                  </label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={e => setFechaInicio(e.target.value)}
                    className="w-full max-w-full box-border border border-gray-300 rounded-xl px-3 md:px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Fecha fin
                  </label>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={e => setFechaFin(e.target.value)}
                    className="w-full max-w-full box-border border border-gray-300 rounded-xl px-3 md:px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full sm:w-auto px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
