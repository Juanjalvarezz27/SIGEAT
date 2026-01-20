// app/components/monedero/FormularioGasto.tsx
"use client"

import { useState, useEffect, useRef } from 'react'
import { X, AlertCircle, Wallet, DollarSign, TrendingDown } from 'lucide-react'
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
  
  // Referencia para el mensaje de error (autoscroll)
  const errorRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState({
    descripcion: '',
    monto: '',
    moneda: 'BS',
    notas: '',
    metodoPagoId: '',
    tasaBCV: ''
  })

  // Efecto para autoscroll cuando hay error
  useEffect(() => {
    if (error && errorRef.current) {
      // Esperar un momento para que el DOM se actualice
      setTimeout(() => {
        errorRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }, 100)
    }
  }, [error])

  // Inicializar con la tasa actual o datos del gasto a editar
  useEffect(() => {
    if (isOpen) {
      if (!datosFormulario) {
        cargarDatosFormulario()
      }

      if (modoEdicion && gastoEditar) {
        // Precargar datos del gasto a editar
        setFormData({
          descripcion: gastoEditar.descripcion,
          monto: gastoEditar.moneda === 'USD' 
            ? gastoEditar.montoUSD.toString() 
            : gastoEditar.montoBS.toString(),
          moneda: gastoEditar.moneda,
          notas: gastoEditar.notas || '',
          metodoPagoId: gastoEditar.metodoPago?.id?.toString() || '',
          tasaBCV: gastoEditar.moneda === 'USD' ? (tasa?.toString() || '') : ''
        })
        
        // Guardar el monto original para validación
        setMontoOriginalBS(gastoEditar.montoBS)
      } else {
        // Para nuevo gasto, inicializar según la moneda
        if (formData.moneda === 'USD' && tasa) {
          setFormData(prev => ({ ...prev, tasaBCV: tasa.toString() }))
        }
        setMontoOriginalBS(0)
      }
    }
  }, [isOpen, modoEdicion, gastoEditar, tasa, formData.moneda])

  // Efecto para actualizar tasa BCV cuando cambia la moneda a USD
  useEffect(() => {
    if (isOpen && formData.moneda === 'USD' && tasa) {
      setFormData(prev => ({ ...prev, tasaBCV: tasa.toString() }))
    }
  }, [isOpen, formData.moneda, tasa])

  // Filtrar métodos de pago según moneda seleccionada
  const metodosPagoFiltrados = datosFormulario?.metodosPago.filter(metodo =>
    metodo.tipo === formData.moneda
  ) || []

  // Cuando se cambia la moneda o se cargan datos, seleccionar método de pago
  useEffect(() => {
    if (isOpen && datosFormulario && metodosPagoFiltrados.length > 0) {
      if (!modoEdicion && !formData.metodoPagoId) {
        // Para nuevo gasto, seleccionar primer método disponible
        const primerMetodo = metodosPagoFiltrados[0]
        if (primerMetodo) {
          setFormData(prev => ({ ...prev, metodoPagoId: primerMetodo.id.toString() }))
        }
      }
      
      // En modo edición, si el método de pago no está en los filtrados, resetearlo
      if (modoEdicion && !metodosPagoFiltrados.some(m => m.id.toString() === formData.metodoPagoId)) {
        const primerMetodo = metodosPagoFiltrados[0]
        if (primerMetodo) {
          setFormData(prev => ({ ...prev, metodoPagoId: primerMetodo.id.toString() }))
        }
      }
    }
  }, [isOpen, formData.moneda, datosFormulario, modoEdicion])

  const cargarDatosFormulario = async () => {
    try {
      const response = await fetch('/api/monedero/datos-iniciales')
      if (response.ok) {
        const data = await response.json()
        setDatosFormulario({
          metodosPago: data.metodosPago
        })
      }
    } catch (error) {
      console.error('Error cargando datos formulario:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    setFormData(prev => {
      const newData = { ...prev, [name]: value }

      // Si cambia la moneda y NO estamos en modo edición, seleccionar automáticamente el primer método
      if (name === 'moneda' && datosFormulario && !modoEdicion) {
        const metodosDisponibles = datosFormulario.metodosPago.filter(m => m.tipo === value)
        if (metodosDisponibles.length > 0) {
          newData.metodoPagoId = metodosDisponibles[0].id.toString()
        } else {
          newData.metodoPagoId = ''
        }
        
        // Si cambia a USD, usar tasa actual automáticamente
        if (value === 'USD' && tasa) {
          newData.tasaBCV = tasa.toString()
        } else if (value === 'BS') {
          newData.tasaBCV = ''
        }
      }

      return newData
    })
  }

  // Calcular montos para validación
  const calcularMontoBs = () => {
    const montoNum = parseFloat(formData.monto) || 0
    const tasaNum = parseFloat(formData.tasaBCV) || tasa || 1

    if (formData.moneda === 'USD') {
      return montoNum * tasaNum
    } else {
      return montoNum
    }
  }

  const validarFormulario = () => {
    // Limpiar error anterior
    setError('')

    if (!formData.descripcion.trim()) {
      setError('La descripción es requerida')
      return false
    }

    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      setError('El monto debe ser mayor a cero')
      return false
    }

    if (!formData.metodoPagoId) {
      setError('Selecciona un método de pago')
      return false
    }

    // Validar tasa BCV solo para gastos en USD
    if (formData.moneda === 'USD') {
      if (!formData.tasaBCV || parseFloat(formData.tasaBCV) <= 0) {
        setError('La tasa BCV es requerida para gastos en dólares')
        return false
      }
    }

    // Validación de saldo para NUEVO gasto
    if (!modoEdicion) {
      const montoBs = calcularMontoBs()
      if (montoBs > saldoActualBs) {
        setError(`No puedes gastar más de tu saldo actual (Bs ${saldoActualBs.toFixed(2)})`)
        return false
      }
    }
    
    // Validación de saldo para EDICIÓN de gasto
    if (modoEdicion && gastoEditar) {
      const nuevoMontoBs = calcularMontoBs()
      
      // Calcular la diferencia: nuevo monto - monto original
      const diferencia = nuevoMontoBs - montoOriginalBS
      
      // Si la diferencia es positiva (estamos aumentando el gasto), validar
      if (diferencia > 0) {
        if (diferencia > saldoActualBs) {
          setError(`No puedes aumentar el gasto en Bs ${diferencia.toFixed(2)}. Saldo insuficiente (Bs ${saldoActualBs.toFixed(2)})`)
          return false
        }
      }
      
      // Si la diferencia es muy grande (más del saldo actual + monto original), también validar
      if (nuevoMontoBs > saldoActualBs + montoOriginalBS) {
        setError(`El nuevo monto (Bs ${nuevoMontoBs.toFixed(2)}) excede el saldo disponible`)
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validarFormulario()) {
      return
    }

    setLoading(true)

    try {
      const url = modoEdicion && gastoEditar
        ? `/api/monedero/gastos/${gastoEditar.id}`
        : '/api/monedero/gastos'

      const method = modoEdicion ? 'PUT' : 'POST'

      // Para gastos en BS, usar tasa por defecto si no se especifica
      // Para USD, SIEMPRE usar la tasa actual (no se puede cambiar)
      const tasaBCV = formData.moneda === 'USD' 
        ? (tasa || parseFloat(formData.tasaBCV) || 1)
        : (parseFloat(formData.tasaBCV) || tasa || 1)

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          monto: parseFloat(formData.monto),
          tasaBCV: tasaBCV
        })
      })

      if (response.ok) {
        // Resetear formulario si no es edición
        if (!modoEdicion) {
          setFormData({
            descripcion: '',
            monto: '',
            moneda: 'BS',
            notas: '',
            metodoPagoId: datosFormulario?.metodosPago
              .filter(m => m.tipo === 'BS')[0]?.id.toString() || '',
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
      console.error('Error:', error)
      setError(`Error de conexión al ${modoEdicion ? 'actualizar' : 'registrar'} el gasto`)
    } finally {
      setLoading(false)
    }
  }

  // Calcular resumen
  const tasaNum = formData.moneda === 'USD' 
    ? (tasa || parseFloat(formData.tasaBCV) || 1)
    : (parseFloat(formData.tasaBCV) || tasa || 1)
    
  const montoBs = calcularMontoBs()
  const montoUSD = formData.moneda === 'USD'
    ? parseFloat(formData.monto) || 0
    : montoBs / tasaNum

  // Calcular diferencia para mostrar en resumen
  const diferenciaMontoBS = modoEdicion ? montoBs - montoOriginalBS : 0
  const saldoDespuesGasto = modoEdicion 
    ? saldoActualBs - diferenciaMontoBS
    : saldoActualBs - montoBs

  // Determinar si el saldo después será positivo o negativo
  const saldoPositivo = saldoDespuesGasto >= 0

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del modal */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 min-w-10 min-h-10 aspect-square bg-linear-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shrink-0">
              <X className="h-5 w-5 text-white rotate-45" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {modoEdicion ? 'Editar Gasto' : 'Registrar Gasto'}
              </h2>
              <p className="text-gray-600 mt-1 text-sm">
                {modoEdicion ? 'Modificar gasto existente' : 'Nuevo gasto del monedero'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 pb-8">
            {/* Mensaje de error con ref para autoscroll */}
            {error && (
              <div 
                ref={errorRef}
                className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start"
              >
                <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <input
                type="text"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Compra de insumos de limpieza"
              />
            </div>

            {/* Monto y Moneda */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
                {modoEdicion && (
                  <p className="text-xs text-gray-500 mt-1">
                    Original: Bs {montoOriginalBS.toFixed(2)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moneda *
                </label>
                <select
                  name="moneda"
                  value={formData.moneda}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="BS">Bolívares (Bs)</option>
                  <option value="USD">Dólares ($)</option>
                </select>
              </div>
            </div>

            {/* Tasa BCV para gastos en USD (SOLO LECTURA) */}
            {formData.moneda === 'USD' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tasa BCV para conversión *
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={tasaNum.toFixed(2)}
                    readOnly
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                  />
                  <span className="ml-2 text-sm text-gray-500 whitespace-nowrap">
                    (Tasa actual)
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    Tasa obtenida automáticamente
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (tasa) {
                        setFormData(prev => ({ ...prev, tasaBCV: tasa.toString() }))
                      }
                    }}
                    className="text-xs text-blue-500 hover:text-blue-700"
                  >
                    Actualizar
                  </button>
                </div>
                {/* Input oculto para enviar la tasa */}
                <input
                  type="hidden"
                  name="tasaBCV"
                  value={tasaNum}
                />
              </div>
            )}

            {/* Método de Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de pago *
              </label>
              <select
                name="metodoPagoId"
                value={formData.metodoPagoId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar método</option>
                {metodosPagoFiltrados.map(metodo => (
                  <option key={metodo.id} value={metodo.id}>
                    {metodo.nombre}
                  </option>
                ))}
              </select>
              {metodosPagoFiltrados.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  No hay métodos de pago disponibles para {formData.moneda === 'BS' ? 'bolívares' : 'dólares'}
                </p>
              )}
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas (opcional)
              </label>
              <textarea
                name="notas"
                value={formData.notas}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Información adicional sobre este gasto..."
              />
            </div>

            {/* Resumen de conversión - SIMPLIFICADO */}
            <div className="bg-linear-to-r from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                <TrendingDown className="h-4 w-4 mr-2 text-gray-600" />
                {modoEdicion ? 'Resumen del Cambio' : 'Resumen del Gasto'}
              </h3>
              
              <div className="space-y-4">
                {/* Saldo Actual */}
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <Wallet className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm text-gray-700">Saldo Actual</span>
                  </div>
                  <span className="font-semibold text-green-600">
                    Bs {saldoActualBs.toFixed(2)}
                  </span>
                </div>

                {/* Monto del Gasto */}
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="h-4 w-4 bg-red-100 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs text-red-600 font-bold">-</span>
                    </div>
                    <span className="text-sm text-gray-700">Monto del Gasto</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">
                      {formData.moneda === 'USD' 
                        ? `$${parseFloat(formData.monto) || 0} USD`
                        : `Bs ${parseFloat(formData.monto) || 0}`
                      }
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      (Bs {montoBs.toFixed(2)})
                    </div>
                  </div>
                </div>

                {/* Diferencia (solo en edición) */}
                {modoEdicion && diferenciaMontoBS !== 0 && (
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${diferenciaMontoBS > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                    <span className="text-sm text-gray-700">Cambio</span>
                    <span className={`font-semibold ${diferenciaMontoBS > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {diferenciaMontoBS > 0 ? '+' : ''}Bs {Math.abs(diferenciaMontoBS).toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Saldo Después - DESTACADO */}
                <div className={`mt-4 p-4 rounded-xl ${saldoPositivo ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DollarSign className={`h-5 w-5 mr-2 ${saldoPositivo ? 'text-green-600' : 'text-red-600'}`} />
                      <span className={`font-semibold ${saldoPositivo ? 'text-green-700' : 'text-red-700'}`}>
                        {modoEdicion ? 'Nuevo Saldo' : 'Saldo Después'}
                      </span>
                    </div>
                    <span className={`text-lg font-bold ${saldoPositivo ? 'text-green-600' : 'text-red-600'}`}>
                      Bs {saldoDespuesGasto.toFixed(2)}
                    </span>
                  </div>
                  <p className={`text-xs mt-2 ${saldoPositivo ? 'text-green-600' : 'text-red-600'}`}>
                    {saldoPositivo 
                      ? '✓ Tu saldo seguirá siendo positivo'
                      : '⚠️ Tu saldo quedará en negativo'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Botones con márgenes */}
            <div className="flex gap-3 pt-6 pb-2"> {/* Añadido pb-2 para margen inferior */}
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading 
                  ? (modoEdicion ? 'Actualizando...' : 'Registrando...') 
                  : (modoEdicion ? 'Actualizar Gasto' : 'Registrar Gasto')
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}