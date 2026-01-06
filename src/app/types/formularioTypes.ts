export interface TipoVehiculo {
  id: number
  nombre: string
  categoria: string
}

export interface Servicio {
  id: number
  nombre: string
  precio: number
  categoriaId: number
  categoria: {
    id: number
    nombre: string
  }
}

export interface EstadoCarro {
  id: number
  nombre: string
}

export interface EstadoPago {
  id: number
  nombre: string
}

export interface ServicioExtra {
  id: number
  nombre: string
  precio: number
  descripcion?: string
}

export interface CategoriaServicio {
  id: number
  nombre: string
  servicios: Servicio[]
}

export interface FormularioDatos {
  tiposVehiculo: TipoVehiculo[]
  servicios: Servicio[]
  estadosCarro: EstadoCarro[]
  estadosPago: EstadoPago[]
  serviciosExtras: ServicioExtra[]
  categorias: CategoriaServicio[]
}

export interface RegistroForm {
  nombre: string
  cedula: string
  telefono: string
  placa: string
  color: string
  tipoVehiculoId: string
  servicioId: string
  estadoCarroId: string
  estadoPagoId: string
  referenciaPago: string
  notas: string
  serviciosExtrasIds: number[]
}

export interface VehiculoEncontrado {
  id: number
  nombre: string
  cedula: string
  telefono: string
  placa: string
  tipoVehiculoId: number
  color: string
  fechaHora: string
}

export interface RegistroVehiculoCompleto {
  id: number
  nombre: string
  cedula: string
  telefono: string
  placa: string
  fechaHora: string
  precioTotal: number
  precioTotalBs: number | null
  tipoVehiculoId: number
  servicioId: number
  estadoCarroId: number
  estadoPagoId: number
  referenciaPago: string | null
  notas: string | null
  color: string | null 
  tipoVehiculo: TipoVehiculo
  servicio: Servicio
  estadoCarro: EstadoCarro
  estadoPago: EstadoPago
  serviciosExtras: Array<{
    servicioExtra: ServicioExtra
  }>
}

export interface ListaRegistrosProps {
  refreshKey?: number
  onRegistrosChange?: (estadisticas: { totalRegistros: number; totalIngresos: number }) => void
}

export interface ModalEditarRegistroProps {
  isOpen: boolean
  onClose: () => void
  registro: RegistroVehiculoCompleto | null
  onUpdate: () => void
  datosFormulario: FormularioDatos | null
}