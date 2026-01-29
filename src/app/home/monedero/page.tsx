"use client"

import { useState, useEffect } from 'react'
import { DollarSign, Receipt, Wallet, ArrowLeftRight, ChevronDown, ListFilter } from 'lucide-react'
import useTasaBCV from '../../hooks/useTasaBCV'
import CardsMonedero from '../../components/monedero/CardsMonedero'
import ListaGastos from '../../components/monedero/ListaGastos'
import FormularioGasto from '../../components/monedero/FormularioGasto'
import ModalConfirmacion from '../../components/monedero/ModalConfirmacion'
import Paginacion from '../../components/monedero/Paginacion'
import { Gasto, MonederoData } from '../../types/monedero'

export default function MonederoPage() {
  const [data, setData] = useState<MonederoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  // Estados para modales
  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false)
  const [modalEdicionAbierto, setModalEdicionAbierto] = useState(false)
  const [modalConfirmacionAbierto, setModalConfirmacionAbierto] = useState(false)
  
  // Estados para gasto seleccionado
  const [gastoSeleccionado, setGastoSeleccionado] = useState<Gasto | null>(null)
  const [eliminando, setEliminando] = useState(false)
  
  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1)
  const limite = 30

  const { tasa, loading: loadingTasa, error: errorTasa, actualizar: actualizarTasa } = useTasaBCV()

  const fetchMonedero = async (pagina: number = paginaActual) => {
    try {
      setRefreshing(true)
      const response = await fetch(`/api/monedero?page=${pagina}&limit=${limite}`)
      if (!response.ok) throw new Error('Error al cargar datos')
      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchMonedero(1)
  }, [])

  const handleCambioPagina = (nuevaPagina: number) => {
    setPaginaActual(nuevaPagina)
    fetchMonedero(nuevaPagina)
  }

  const handleRefreshAll = async () => {
    await Promise.all([
      fetchMonedero(paginaActual),
      actualizarTasa()
    ])
  }

  const handleGastoRegistrado = () => {
    setPaginaActual(1)
    fetchMonedero(1)
  }

  const handleEditarGasto = (gasto: Gasto) => {
    setGastoSeleccionado(gasto)
    setModalEdicionAbierto(true)
  }

  const handleEliminarGasto = (gasto: Gasto) => {
    setGastoSeleccionado(gasto)
    setModalConfirmacionAbierto(true)
  }

  const handleConfirmarEliminacion = async () => {
    if (!gastoSeleccionado) return
    setEliminando(true)
    try {
      const response = await fetch(`/api/monedero/gastos/${gastoSeleccionado.id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setModalConfirmacionAbierto(false)
        setGastoSeleccionado(null)
        const currentGastos = data?.ultimosGastos || []
        if (currentGastos.length === 1 && paginaActual > 1) {
          setPaginaActual(prev => prev - 1)
          fetchMonedero(paginaActual - 1)
        } else {
          fetchMonedero(paginaActual)
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setEliminando(false)
    }
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

        {/* Header Estilizado */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-8">
            <div className="w-16 h-16 bg-[#122a4e] rounded-3xl flex items-center justify-center shadow-xl shadow-[#122a4e]/20 shrink-0">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#140f07] tracking-tight">
                Mi Monedero
              </h1>
              <p className="text-sm font-medium text-[#122a4e]/60 flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                Control de gastos y flujo de caja
              </p>
            </div>
          </div>

          {/* Tarjetas de Resumen (Finanzas) */}
          <CardsMonedero
            tasa={tasa}
            loadingTasa={loadingTasa}
            errorTasa={errorTasa}
            data={data}
            loading={loading}
            refreshing={refreshing}
            onRefreshAll={handleRefreshAll}
            onActualizarTasa={actualizarTasa}
            onAbrirFormulario={() => setModalRegistroAbierto(true)}
          />
        </div>

        {/* Sección de Movimientos */}
        <div className="bg-white rounded-[2.5rem] border border-[#869dfc]/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          
          {/* Sub-header de la lista */}
          <div className="p-6 sm:p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#f4f6fc] rounded-2xl">
                <ArrowLeftRight className="h-6 w-6 text-[#4260ad]" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#140f07]">Movimientos</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Historial Reciente</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
               <div className="hidden sm:flex px-4 py-2 bg-[#f8f9fc] rounded-xl border border-slate-100 text-xs font-bold text-slate-500">
                  Página {paginaActual} de {data?.paginacion.totalPaginas || 1}
               </div>
            </div>
          </div>

          {/* Lista de Gastos */}
          <div className="px-6 py-6 sm:px-8 bg-[#fcfdff]">
            <ListaGastos 
              gastos={data?.ultimosGastos || []}
              onEditar={handleEditarGasto}
              onEliminar={handleEliminarGasto}
            />
          </div>

          {/* Footer de Paginación */}
          {data?.paginacion && data.paginacion.totalPaginas > 1 && (
            <div className="bg-white px-6 py-6 sm:px-8 border-t border-slate-50">
              <Paginacion
                paginaActual={data.paginacion.paginaActual}
                totalPaginas={data.paginacion.totalPaginas}
                limite={data.paginacion.limite}
                totalItems={data.paginacion.totalItems}
                tieneSiguiente={data.paginacion.tieneSiguiente}
                tieneAnterior={data.paginacion.tieneAnterior}
                onChangePagina={handleCambioPagina}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Modales */}
      <FormularioGasto
        isOpen={modalRegistroAbierto}
        onClose={() => setModalRegistroAbierto(false)}
        onGastoRegistrado={handleGastoRegistrado}
        saldoActualBs={data?.saldoActualBs || 0}
      />

      <FormularioGasto
        isOpen={modalEdicionAbierto}
        onClose={() => {
          setModalEdicionAbierto(false)
          setGastoSeleccionado(null)
        }}
        onGastoRegistrado={handleGastoRegistrado}
        saldoActualBs={data?.saldoActualBs || 0}
        modoEdicion={true}
        gastoEditar={gastoSeleccionado}
      />

      <ModalConfirmacion
        isOpen={modalConfirmacionAbierto}
        onClose={() => {
          setModalConfirmacionAbierto(false)
          setGastoSeleccionado(null)
        }}
        onConfirm={handleConfirmarEliminacion}
        titulo="¿Eliminar movimiento?"
        mensaje={`Esta acción restará el monto del gasto "${gastoSeleccionado?.descripcion}" de tus reportes, pero devolverá el dinero a tu saldo disponible.`}
        confirmarTexto="Confirmar"
        esDestructivo={true}
        loading={eliminando}
      />
    </div>
  )
}