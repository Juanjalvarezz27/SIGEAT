export interface MetodoPago {
  id: number
  nombre: string
  tipo: string // Solo "BS" o "USD"
}

export interface Gasto {
  id: number
  descripcion: string
  montoBS: number
  montoUSD: number
  moneda: string
  tasaBCV: number
  fechaHora: string
  notas: string | null
  metodoPago?: {
    nombre: string
    id: number
  }
}

export interface PaginacionData {
  paginaActual: number
  totalPaginas: number
  limite: number
  totalItems: number
  tieneSiguiente: boolean
  tieneAnterior: boolean
}

export interface MonederoData {
  totalIngresosBs: number
  totalGastosBs: number
  saldoActualBs: number
  cantidadIngresos: number
  cantidadGastos: number
  ultimosGastos: Gasto[]
  paginacion: PaginacionData
  fechaCalculo: string
}