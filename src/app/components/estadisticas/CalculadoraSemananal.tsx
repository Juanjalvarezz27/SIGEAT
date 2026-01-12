"use client"

import { useState, useEffect } from 'react'
import { Calculator, DollarSign, Users, Percent, Calendar, RefreshCw } from 'lucide-react'
import useTasaBCV from '../../hooks/useTasaBCV'

interface CalculadoraSemananalProps {
  totalSemanaUSD: number
  cargando: boolean
}

export default function CalculadoraSemananal({ totalSemanaUSD, cargando }: CalculadoraSemananalProps) {
  const { tasa, loading: loadingTasa, actualizar, ultimaActualizacion } = useTasaBCV()
  const [numTrabajadores, setNumTrabajadores] = useState<number>(1)
  const [totalSemanaBS, setTotalSemanaBS] = useState<number>(0)
  const [porcentajeDistribuir, setPorcentajeDistribuir] = useState<number>(30)
  const [totalDistribuirBS, setTotalDistribuirBS] = useState<number>(0)
  const [totalDistribuirUSD, setTotalDistribuirUSD] = useState<number>(0)
  const [porPersonaBS, setPorPersonaBS] = useState<number>(0)
  const [porPersonaUSD, setPorPersonaUSD] = useState<number>(0)
  const [fechasSemana, setFechasSemana] = useState<{ inicio: string; fin: string }>({ inicio: '', fin: '' })

  // Calcular fechas de la semana actual (lunes a domingo)
  useEffect(() => {
    const calcularSemanaActual = () => {
      const hoy = new Date()
      const dia = hoy.getDay() // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
      
      // Calcular lunes de esta semana
      const lunes = new Date(hoy)
      const diffLunes = dia === 0 ? -6 : 1 - dia // Si es domingo, retroceder 6 días
      lunes.setDate(hoy.getDate() + diffLunes)
      
      // Calcular domingo de esta semana
      const domingo = new Date(lunes)
      domingo.setDate(lunes.getDate() + 6)
      
      // Formatear fechas
      const formatFecha = (fecha: Date) => {
        const dia = fecha.getDate().toString().padStart(2, '0')
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0')
        const anio = fecha.getFullYear()
        return `${dia}/${mes}/${anio}`
      }
      
      setFechasSemana({
        inicio: formatFecha(lunes),
        fin: formatFecha(domingo)
      })
    }
    
    calcularSemanaActual()
  }, [])

  // Calcular todos los valores cuando cambia la tasa o el total en USD
  useEffect(() => {
    if (tasa !== null && totalSemanaUSD > 0) {
      // Calcular total en Bs
      const totalBS = totalSemanaUSD * tasa
      setTotalSemanaBS(totalBS)
      
      // Calcular el 30% (o porcentaje seleccionado)
      const porcentaje = porcentajeDistribuir / 100
      const distribuirBS = totalBS * porcentaje
      const distribuirUSD = totalSemanaUSD * porcentaje
      
      setTotalDistribuirBS(distribuirBS)
      setTotalDistribuirUSD(distribuirUSD)
      
      // Calcular por persona
      if (numTrabajadores > 0) {
        setPorPersonaBS(distribuirBS / numTrabajadores)
        setPorPersonaUSD(distribuirUSD / numTrabajadores)
      } else {
        setPorPersonaBS(0)
        setPorPersonaUSD(0)
      }
    } else {
      // Resetear valores
      setTotalSemanaBS(0)
      setTotalDistribuirBS(0)
      setTotalDistribuirUSD(0)
      setPorPersonaBS(0)
      setPorPersonaUSD(0)
    }
  }, [tasa, totalSemanaUSD, numTrabajadores, porcentajeDistribuir])

  // Formatear números con separadores de miles
  const formatNumber = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat('es-VE', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num)
  }

  // Formatear fecha de última actualización
  const formatFechaActualizacion = () => {
    if (!ultimaActualizacion) return 'No disponible'
    
    const fecha = new Date(ultimaActualizacion)
    return fecha.toLocaleTimeString('es-VE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const handleActualizarTasa = async () => {
    await actualizar()
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">


      {cargando ? (
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="h-32 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Total de la semana */}
          <div className="mb-6">
            <div className="bg-linear-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center md:text-left">
                  <p className="text-sm text-blue-700 font-medium mb-1">Total generado esta semana</p>
                  <p className="text-2xl md:text-3xl font-bold text-blue-900">
                    ${formatNumber(totalSemanaUSD)}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">Ingresos en dólares</p>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-sm text-green-700 font-medium mb-1">Equivalente en bolívares</p>
                  <p className="text-2xl md:text-3xl font-bold text-green-900">
                    Bs {formatNumber(totalSemanaBS)}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    Tasa: Bs {tasa ? formatNumber(tasa, 5) : '0.00'} por $
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Configuración de distribución */}
          <div className="mb-6">
            <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
              <Percent className="h-5 w-5 mr-2 text-purple-500" />
              Configurar distribución
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Porcentaje a distribuir */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Porcentaje a distribuir
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={porcentajeDistribuir}
                    onChange={(e) => setPorcentajeDistribuir(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="w-20 text-center">
                    <span className="text-lg font-bold text-purple-700">{porcentajeDistribuir}%</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Número de trabajadores */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="h-4 w-4 inline mr-1" />
                  Número de trabajadores
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setNumTrabajadores(prev => Math.max(1, prev - 1))}
                    className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center text-gray-700 font-bold"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={numTrabajadores}
                    onChange={(e) => setNumTrabajadores(Math.max(1, Number(e.target.value)))}
                    className="flex-1 h-10 border border-gray-300 rounded-lg px-3 text-center font-semibold text-gray-900"
                  />
                  <button
                    onClick={() => setNumTrabajadores(prev => prev + 1)}
                    className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center text-gray-700 font-bold"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Cantidad de personas para repartir
                </p>
              </div>
            </div>
          </div>

          {/* Resultados de la distribución */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Total a distribuir */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <h5 className="text-sm font-semibold text-purple-900 mb-2">Total a distribuir</h5>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-700">En dólares:</span>
                  <span className="font-bold text-purple-900">
                    ${formatNumber(totalDistribuirUSD)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-700">En bolívares:</span>
                  <span className="font-bold text-purple-900">
                    Bs {formatNumber(totalDistribuirBS)}
                  </span>
                </div>
                <div className="pt-2 border-t border-purple-200">
                  <p className="text-xs text-purple-600">
                    {porcentajeDistribuir}% del total semanal
                  </p>
                </div>
              </div>
            </div>

            {/* Por persona */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <h5 className="text-sm font-semibold text-emerald-900 mb-2">Por trabajador</h5>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-emerald-700">En dólares:</span>
                  <span className="font-bold text-emerald-900">
                    ${formatNumber(porPersonaUSD)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-emerald-700">En bolívares:</span>
                  <span className="font-bold text-emerald-900">
                    Bs {formatNumber(porPersonaBS)}
                  </span>
                </div>
                <div className="pt-2 border-t border-emerald-200">
                  <p className="text-xs text-emerald-600">
                    {numTrabajadores} trabajador{numTrabajadores !== 1 ? 'es' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Resumen */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h5 className="text-sm font-semibold text-amber-900 mb-2">Resumen</h5>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-amber-700">Semana:</span>
                  <span className="font-medium text-amber-900">
                    ${formatNumber(totalSemanaUSD)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-amber-700">Distribuir:</span>
                  <span className="font-medium text-amber-900">
                    ${formatNumber(totalDistribuirUSD)} ({porcentajeDistribuir}%)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-amber-700">Restante:</span>
                  <span className="font-medium text-amber-900">
                    ${formatNumber(totalSemanaUSD - totalDistribuirUSD)}
                  </span>
                </div>
              </div>
            </div>
          </div>

        {/* Información adicional */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">

            {/* Tasa BCV */}
            <div className="flex items-center justify-center gap-2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-blue-600 mr-1" />
                  <span className="text-sm font-medium text-blue-700">
                    Tasa BCV:{' '}
                    {loadingTasa
                      ? 'Cargando...'
                      : tasa
                      ? `Bs ${formatNumber(tasa, 2)}`
                      : 'N/D'}
                  </span>
                </div>

                {ultimaActualizacion && (
                  <p className="text-xs text-blue-500 mt-1 text-center">
                    Actualizada: {formatFechaActualizacion()}
                  </p>
                )}
              </div>

              <button
                onClick={handleActualizarTasa}
                disabled={loadingTasa}
                className="p-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Actualizar tasa"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loadingTasa ? 'animate-spin' : ''}`}
                />
              </button>
            </div>

            {/* Botón restablecer */}
            <button
              onClick={() => {
                setPorcentajeDistribuir(30)
                setNumTrabajadores(1)
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Restablecer valores
            </button>

          </div>
        </div>


        </>
      )}
    </div>
  )
}