"use client"

import { useState, useEffect, useRef } from 'react'
import { X, AlertCircle, Wallet, DollarSign, ArrowDown, Receipt, RefreshCw, ChevronDown } from 'lucide-react'
import useTasaBCV from '../../hooks/useTasaBCV'
import { Gasto, MetodoPago } from '../../types/monedero'

interface FormularioGastoProps {
  isOpen: boolean
  onClose: () => void
  onGastoRegistrado: () => void
  saldoActualBs: number
  modoEdicion?: boolean
  gastoEditar?: Gasto | null
}

export default function FormularioGasto({
  isOpen,
  onClose,
  onGastoRegistrado,
  saldoActualBs,
  modoEdicion = false,
  gastoEditar = null
}: FormularioGastoProps) {
  const { tasa } = useTasaBCV()
  const [datosFormulario, setDatosFormulario] = useState<{ metodosPago: MetodoPago[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [montoOriginalBS, setMontoOriginalBS] = useState<number>(0)
  
  const errorRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState({
    descripcion: '',
    monto: '',
    moneda: 'BS',
    notas: '',
    metodoPagoId: '',
    tasaBCV: ''
  })

  // Auto-scroll al error
  useEffect(() => {
    if (error && errorRef.current) {
      setTimeout(() => {
        errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }
  }, [error])

  // Inicialización de datos
  useEffect(() => {
    if (isOpen) {
      if (!datosFormulario) cargarDatosFormulario()

      if (modoEdicion && gastoEditar) {
        setFormData({
          descripcion: gastoEditar.descripcion,
          monto: gastoEditar.moneda === 'USD' ? gastoEditar.montoUSD.toString() : gastoEditar.montoBS.toString(),
          moneda: gastoEditar.moneda,
          notas: gastoEditar.notas || '',
          metodoPagoId: gastoEditar.metodoPago?.id?.toString() || '',
          tasaBCV: gastoEditar.moneda === 'USD' ? (tasa?.toString() || '') : ''
        })
        setMontoOriginalBS(gastoEditar.montoBS)
      } else {
        if (formData.moneda === 'USD' && tasa) {
          setFormData(prev => ({ ...prev, tasaBCV: tasa.toString() }))
        }
        setMontoOriginalBS(0)
      }
    }
  }, [isOpen, modoEdicion, gastoEditar, tasa, formData.moneda])

  // Actualizar tasa si es USD
  useEffect(() => {
    if (isOpen && formData.moneda === 'USD' && tasa) {
      setFormData(prev => ({ ...prev, tasaBCV: tasa.toString() }))
    }
  }, [isOpen, formData.moneda, tasa])

  const metodosPagoFiltrados = datosFormulario?.metodosPago.filter(metodo =>
    metodo.tipo === formData.moneda
  ) || []

  // Selección automática de método de pago
  useEffect(() => {
    if (isOpen && datosFormulario && metodosPagoFiltrados.length > 0) {
      if (!modoEdicion && !formData.metodoPagoId) {
        const primerMetodo = metodosPagoFiltrados[0]
        if (primerMetodo) setFormData(prev => ({ ...prev, metodoPagoId: primerMetodo.id.toString() }))
      }
      
      if (modoEdicion && !metodosPagoFiltrados.some(m => m.id.toString() === formData.metodoPagoId)) {
        const primerMetodo = metodosPagoFiltrados[0]
        if (primerMetodo) setFormData(prev => ({ ...prev, metodoPagoId: primerMetodo.id.toString() }))
      }
    }
  }, [isOpen, formData.moneda, datosFormulario, modoEdicion])

  const cargarDatosFormulario = async () => {
    try {
      const response = await fetch('/api/monedero/datos-iniciales')
      if (response.ok) {
        const data = await response.json()
        setDatosFormulario({ metodosPago: data.metodosPago })
      }
    } catch (error) {
      console.error('Error cargando datos:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      const newData = { ...prev, [name]: value }
      if (name === 'moneda' && datosFormulario && !modoEdicion) {
        const metodosDisponibles = datosFormulario.metodosPago.filter(m => m.tipo === value)
        newData.metodoPagoId = metodosDisponibles.length > 0 ? metodosDisponibles[0].id.toString() : ''
        if (value === 'USD' && tasa) newData.tasaBCV = tasa.toString()
        else if (value === 'BS') newData.tasaBCV = ''
      }
      return newData
    })
  }

  const calcularMontoBs = () => {
    const montoNum = parseFloat(formData.monto) || 0
    const tasaNum = parseFloat(formData.tasaBCV) || tasa || 1
    return formData.moneda === 'USD' ? montoNum * tasaNum : montoNum
  }

  const validarFormulario = () => {
    setError('')
    if (!formData.descripcion.trim()) { setError('La descripción es requerida'); return false }
    if (!formData.monto || parseFloat(formData.monto) <= 0) { setError('El monto debe ser mayor a cero'); return false }
    if (!formData.metodoPagoId) { setError('Selecciona un método de pago'); return false }
    if (formData.moneda === 'USD' && (!formData.tasaBCV || parseFloat(formData.tasaBCV) <= 0)) {
      setError('La tasa BCV es requerida'); return false
    }

    if (!modoEdicion) {
      const montoBs = calcularMontoBs()
      if (montoBs > saldoActualBs) {
        setError(`Saldo insuficiente (Disponible: Bs ${saldoActualBs.toFixed(2)})`); return false
      }
    } else if (modoEdicion && gastoEditar) {
      const nuevoMontoBs = calcularMontoBs()
      const diferencia = nuevoMontoBs - montoOriginalBS
      if (diferencia > 0 && diferencia > saldoActualBs) {
        setError(`Saldo insuficiente para el aumento (Faltan Bs ${(diferencia - saldoActualBs).toFixed(2)})`); return false
      }
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validarFormulario()) return

    setLoading(true)
    try {
      const url = modoEdicion && gastoEditar ? `/api/monedero/gastos/${gastoEditar.id}` : '/api/monedero/gastos'
      const method = modoEdicion ? 'PUT' : 'POST'
      const tasaBCV = formData.moneda === 'USD' 
        ? (tasa || parseFloat(formData.tasaBCV) || 1)
        : (parseFloat(formData.tasaBCV) || tasa || 1)

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, monto: parseFloat(formData.monto), tasaBCV })
      })

      if (response.ok) {
        if (!modoEdicion) {
          setFormData({
            descripcion: '', monto: '', moneda: 'BS', notas: '',
            metodoPagoId: datosFormulario?.metodosPago.filter(m => m.tipo === 'BS')[0]?.id.toString() || '',
            tasaBCV: ''
          })
          setMontoOriginalBS(0)
        }
        onGastoRegistrado()
        onClose()
      } else {
        const errorData = await response.json()
        setError(errorData.error || `Error al ${modoEdicion ? 'actualizar' : 'registrar'} el gasto`)
      }
    } catch (error) {
      setError(`Error de conexión`)
    } finally {
      setLoading(false)
    }
  }

  // Cálculos para resumen
  const tasaNum = formData.moneda === 'USD' ? (tasa || parseFloat(formData.tasaBCV) || 1) : (parseFloat(formData.tasaBCV) || tasa || 1)
  const montoBs = calcularMontoBs()
  const diferenciaMontoBS = modoEdicion ? montoBs - montoOriginalBS : 0
  const saldoDespuesGasto = modoEdicion ? saldoActualBs - diferenciaMontoBS : saldoActualBs - montoBs
  const saldoPositivo = saldoDespuesGasto >= 0

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-3xl bg-[#f8f9fc] text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-white/20">
          
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-[#122a4e]/5 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                <Receipt className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#140f07]">
                  {modoEdicion ? 'Editar Gasto' : 'Nuevo Gasto'}
                </h2>
                <p className="text-red-500 text-sm font-medium">
                  {modoEdicion ? 'Modificar registro' : 'Registrar salida'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-[#e2e2f6] text-[#122a4e]/50 hover:text-[#122a4e] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Contenido */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)] bg-[#f8f9fc]">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {error && (
                <div ref={errorRef} className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              {/* Formulario Inputs */}
              <div className="space-y-4">
                {/* Descripción */}
                <div>
                  <label className="block text-xs font-bold text-[#122a4e] uppercase tracking-wider mb-1.5 ml-1">
                    Descripción *
                  </label>
                  <input
                    type="text"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-transparent rounded-xl focus:border-red-400 focus:ring-0 text-[#140f07] font-medium outline-none transition-colors shadow-sm"
                    placeholder="Ej: Insumos de limpieza"
                  />
                </div>

                {/* Monto y Moneda */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#122a4e] uppercase tracking-wider mb-1.5 ml-1">
                      Monto *
                    </label>
                    <input
                      type="number"
                      name="monto"
                      value={formData.monto}
                      onChange={handleInputChange}
                      required
                      min="0.01"
                      step="0.01"
                      className="w-full px-4 py-3 bg-white border border-transparent rounded-xl focus:border-red-400 focus:ring-0 text-[#140f07] font-bold outline-none transition-colors shadow-sm"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#122a4e] uppercase tracking-wider mb-1.5 ml-1">
                      Moneda *
                    </label>
                    <div className="relative">
                      <select
                        name="moneda"
                        value={formData.moneda}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white border border-transparent rounded-xl focus:border-red-400 focus:ring-0 text-[#140f07] font-bold outline-none appearance-none shadow-sm"
                      >
                        <option value="BS">Bolívares (Bs)</option>
                        <option value="USD">Dólares ($)</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Tasa BCV (Solo USD) */}
                {formData.moneda === 'USD' && (
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-blue-700 uppercase">Tasa de Cambio</p>
                      <p className="text-lg font-black text-blue-900">Bs {tasaNum.toFixed(2)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => tasa && setFormData(prev => ({ ...prev, tasaBCV: tasa.toString() }))}
                      className="p-2 bg-white rounded-lg text-blue-600 shadow-sm hover:bg-blue-50 transition-colors"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Método de Pago */}
                <div>
                  <label className="block text-xs font-bold text-[#122a4e] uppercase tracking-wider mb-1.5 ml-1">
                    Método de Pago *
                  </label>
                  <div className="relative">
                    <select
                      name="metodoPagoId"
                      value={formData.metodoPagoId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white border border-transparent rounded-xl focus:border-red-400 focus:ring-0 text-[#140f07] font-medium outline-none appearance-none shadow-sm"
                    >
                      <option value="">Seleccionar método</option>
                      {metodosPagoFiltrados.map(metodo => (
                        <option key={metodo.id} value={metodo.id}>
                          {metodo.nombre}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                  {metodosPagoFiltrados.length === 0 && (
                    <p className="text-xs text-red-500 mt-1 font-medium ml-1">
                      No hay métodos disponibles para esta moneda
                    </p>
                  )}
                </div>

                {/* Notas */}
                <div>
                  <label className="block text-xs font-bold text-[#122a4e] uppercase tracking-wider mb-1.5 ml-1">
                    Notas <span className="text-slate-400 font-normal normal-case">(Opcional)</span>
                  </label>
                  <textarea
                    name="notas"
                    value={formData.notas}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-3 bg-white border border-transparent rounded-xl focus:border-red-400 focus:ring-0 text-[#140f07] font-medium outline-none resize-none shadow-sm placeholder-slate-400"
                    placeholder="Detalles adicionales..."
                  />
                </div>
              </div>

              {/* Resumen del Gasto */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <h3 className="text-sm font-bold text-[#140f07] mb-4 flex items-center gap-2">
                  <div className="p-1 bg-[#122a4e] rounded-md">
                     <Wallet className="h-3 w-3 text-white" />
                  </div>
                  Impacto en Saldo
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Saldo Actual</span>
                    <span className="font-bold text-[#140f07]">Bs {saldoActualBs.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm p-3 bg-red-50 rounded-xl border border-red-100">
                    <div className="flex items-center gap-2">
                       <ArrowDown className="h-4 w-4 text-red-500" />
                       <span className="text-red-700 font-bold">Gasto</span>
                    </div>
                    <div className="text-right">
                       <span className="block font-bold text-red-700">
                         {formData.moneda === 'USD' ? `$${parseFloat(formData.monto) || 0}` : `Bs ${parseFloat(formData.monto) || 0}`}
                       </span>
                       <span className="block text-xs text-red-500 font-medium">
                         (Bs {montoBs.toFixed(2)})
                       </span>
                    </div>
                  </div>

                  <div className={`mt-2 pt-3 border-t border-slate-100 flex justify-between items-center ${saldoPositivo ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="text-sm font-bold uppercase tracking-wide">Nuevo Saldo</span>
                    <span className="text-lg font-black">Bs {saldoDespuesGasto.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="w-full px-6 py-3.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:text-[#122a4e] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full px-6 py-3.5 font-bold text-white rounded-xl shadow-lg transition-all flex items-center justify-center ${
                    loading 
                      ? 'bg-slate-300 cursor-not-allowed shadow-none'
                      : 'bg-red-600 hover:bg-red-700 shadow-red-600/20 active:scale-[0.98]'
                  }`}
                >
                  {loading 
                    ? (modoEdicion ? 'Actualizando...' : 'Registrando...') 
                    : (modoEdicion ? 'Guardar Cambios' : 'Registrar Gasto')
                  }
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  )
}