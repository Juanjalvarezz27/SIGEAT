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
    
    if (totalPaginas <= 7) {
      // Mostrar todas las páginas
      for (let i = 1; i <= totalPaginas; i++) {
        paginas.push(i)
      }
    } else {
      // Lógica para mostrar con puntos suspensivos
      if (paginaActual <= 4) {
        for (let i = 1; i <= 5; i++) {
          paginas.push(i)
        }
        paginas.push('...')
        paginas.push(totalPaginas)
      } else if (paginaActual >= totalPaginas - 3) {
        paginas.push(1)
        paginas.push('...')
        for (let i = totalPaginas - 4; i <= totalPaginas; i++) {
          paginas.push(i)
        }
      } else {
        paginas.push(1)
        paginas.push('...')
        for (let i = paginaActual - 1; i <= paginaActual + 1; i++) {
          paginas.push(i)
        }
        paginas.push('...')
        paginas.push(totalPaginas)
      }
    }
    
    return paginas
  }

  // Calcular rangos de items mostrados
  const inicioItem = totalItems > 0 ? (paginaActual - 1) * limite + 1 : 0
  const finItem = Math.min(paginaActual * limite, totalItems)

  if (totalPaginas <= 1 && totalItems <= limite) {
    return null
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Información de items mostrados */}
      <div className="text-sm text-gray-600">
        Mostrando <span className="font-semibold text-gray-900">{inicioItem}-{finItem}</span> de{' '}
        <span className="font-semibold text-gray-900">{totalItems}</span> gastos
      </div>

      {/* Controles de paginación */}
      <div className="flex items-center gap-1">
        {/* Botón Anterior */}
        <button
          onClick={() => tieneAnterior && onChangePagina(paginaActual - 1)}
          disabled={!tieneAnterior}
          className={`p-2 rounded-lg border transition ${
            tieneAnterior
              ? 'hover:bg-gray-100 border-gray-300 text-gray-700'
              : 'opacity-50 cursor-not-allowed border-gray-200 text-gray-400'
          }`}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Números de página */}
        <div className="flex items-center gap-1">
          {getPaginasMostradas().map((pagina, index) => {
            if (pagina === '...') {
              return (
                <span key={`dots-${index}`} className="px-3 py-1 text-gray-400">
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              )
            }

            const esPaginaActual = pagina === paginaActual
            return (
              <button
                key={pagina}
                onClick={() => onChangePagina(Number(pagina))}
                className={`w-9 h-9 flex items-center justify-center rounded-lg border transition ${
                  esPaginaActual
                    ? 'bg-blue-600 border-blue-600 text-white font-semibold'
                    : 'hover:bg-gray-100 border-gray-300 text-gray-700'
                }`}
                aria-label={`Ir a página ${pagina}`}
                aria-current={esPaginaActual ? 'page' : undefined}
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
          className={`p-2 rounded-lg border transition ${
            tieneSiguiente
              ? 'hover:bg-gray-100 border-gray-300 text-gray-700'
              : 'opacity-50 cursor-not-allowed border-gray-200 text-gray-400'
          }`}
          aria-label="Página siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}