"use client"

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

interface PaginacionProps {
  paginaActual: number
  totalPaginas: number
  limite: number
  totalItems: number
  tieneSiguiente: boolean
  tieneAnterior: boolean
  onChangePagina: (pagina: number) => void
  className?: string
}

export default function Paginacion({
  paginaActual,
  totalPaginas,
  limite,
  totalItems,
  tieneSiguiente,
  tieneAnterior,
  onChangePagina,
  className = ''
}: PaginacionProps) {
  // Calcular rangos para mostrar
  const getPaginasMostradas = () => {
    const paginas: (number | string)[] = []
    
    if (totalPaginas <= 5) {
      for (let i = 1; i <= totalPaginas; i++) {
        paginas.push(i)
      }
    } else {
      if (paginaActual <= 3) {
        for (let i = 1; i <= 4; i++) paginas.push(i)
        paginas.push('...')
        paginas.push(totalPaginas)
      } else if (paginaActual >= totalPaginas - 2) {
        paginas.push(1)
        paginas.push('...')
        for (let i = totalPaginas - 3; i <= totalPaginas; i++) paginas.push(i)
      } else {
        paginas.push(1)
        paginas.push('...')
        paginas.push(paginaActual)
        paginas.push('...')
        paginas.push(totalPaginas)
      }
    }
    
    return paginas
  }

  const inicioItem = totalItems > 0 ? (paginaActual - 1) * limite + 1 : 0
  const finItem = Math.min(paginaActual * limite, totalItems)

  if (totalPaginas <= 1 && totalItems <= limite) {
    return null
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 ${className}`}>
      {/* Información de items mostrados */}
      <div className="text-xs font-medium text-slate-500 bg-[#f8f9fc] px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
        Mostrando <span className="font-bold text-[#122a4e]">{inicioItem}-{finItem}</span> de{' '}
        <span className="font-bold text-[#122a4e]">{totalItems}</span> registros
      </div>

      {/* Controles de paginación */}
      <div className="flex items-center gap-1.5">
        {/* Botón Anterior */}
        <button
          onClick={() => tieneAnterior && onChangePagina(paginaActual - 1)}
          disabled={!tieneAnterior}
          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all border ${
            tieneAnterior
              ? 'bg-white border-slate-200 text-[#122a4e] hover:bg-[#e2e2f6] hover:text-[#4260ad] hover:border-[#869dfc]/30 shadow-sm'
              : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Números de página */}
        <div className="flex items-center gap-1.5">
          {getPaginasMostradas().map((pagina, index) => {
            if (pagina === '...') {
              return (
                <div key={`dots-${index}`} className="w-8 h-10 flex items-center justify-center text-slate-300">
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              )
            }

            const esPaginaActual = pagina === paginaActual
            return (
              <button
                key={pagina}
                onClick={() => onChangePagina(Number(pagina))}
                className={`w-10 h-10 text-sm font-bold rounded-xl transition-all border ${
                  esPaginaActual
                    ? 'bg-[#122a4e] border-[#122a4e] text-white shadow-md shadow-[#122a4e]/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#122a4e] shadow-sm'
                }`}
              >
                {pagina}
              </button>
            )
          })}
        </div>

        {/* Botón Siguiente */}
        <button
          onClick={() => tieneSiguiente && onChangePagina(paginaActual + 1)}
          disabled={!tieneSiguiente}
          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all border ${
            tieneSiguiente
              ? 'bg-white border-slate-200 text-[#122a4e] hover:bg-[#e2e2f6] hover:text-[#4260ad] hover:border-[#869dfc]/30 shadow-sm'
              : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
          }`}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}