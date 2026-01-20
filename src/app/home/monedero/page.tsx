"use client"

import { useState, useEffect } from 'react'
import { DollarSign, Receipt } from 'lucide-react'
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
  const limite = 30 // 30 items por página como solicitaste

  // Usar el hook de tasa BCV
  const { tasa, loading: loadingTasa, error: errorTasa, actualizar: actualizarTasa } = useTasaBCV()

  const fetchMonedero = async (pagina: number = paginaActual) => {
    try {
      setRefreshing(true)
      const response = await fetch(`/api/monedero?page=${pagina}&limit=${limite}`)

      if (!response.ok) {
        throw new Error('Error al cargar datos del monedero')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    fetchMonedero(1)
  }, [])

  // Manejar cambio de página
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
    // Volver a la primera página después de registrar un nuevo gasto
    setPaginaActual(1)
    fetchMonedero(1)
  }

  // Manejar edición de gasto
  const handleEditarGasto = (gasto: Gasto) => {
    setGastoSeleccionado(gasto)
    setModalEdicionAbierto(true)
  }

  // Manejar eliminación de gasto
  const handleEliminarGasto = (gasto: Gasto) => {
    setGastoSeleccionado(gasto)
    setModalConfirmacionAbierto(true)
  }

  // Confirmar eliminación
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
        
        // Recargar los datos manteniendo la página actual
        // Pero si eliminamos el último item de la página, ir a la anterior
        const currentGastos = data?.ultimosGastos || []
        if (currentGastos.length === 1 && paginaActual > 1) {
          setPaginaActual(prev => prev - 1)
          fetchMonedero(paginaActual - 1)
        } else {
          fetchMonedero(paginaActual)
        }
      } else {
        const errorData = await response.json()
        console.error('Error al eliminar:', errorData.error)
        alert('Error al eliminar el gasto')
      }
    } catch (error) {
      console.error('Error de conexión:', error)
      alert('Error de conexión al eliminar el gasto')
    } finally {
      setEliminando(false)
    }
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">

        {/* Header principal */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
            <div className="w-14 h-14 min-w-14 bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <DollarSign className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Monedero Total
              </h1>
              <p className="text-gray-500 mt-1 text-sm sm:text-base">
                Gestión inteligente de tus finanzas
              </p>
            </div>
          </div>

          {/* Cards de estadísticas */}
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

        {/* Últimos gastos con paginación */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            {/* Título de la sección */}
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Receipt className="h-5 w-5 text-gray-600" />
              </div>
              Movimientos
            </h2>
            
            {/* Info de paginación en móvil */}
            <div className="sm:hidden text-sm text-gray-600">
              Página {paginaActual} de {data?.paginacion.totalPaginas || 1}
            </div>
          </div>

          {/* Lista de gastos */}
          <ListaGastos 
            gastos={data?.ultimosGastos || []}
            onEditar={handleEditarGasto}
            onEliminar={handleEliminarGasto}
          />

          {/* Paginación */}
          {data?.paginacion && data.paginacion.totalPaginas > 1 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
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
      
      {/* Modal Registro */}
      <FormularioGasto
        isOpen={modalRegistroAbierto}
        onClose={() => setModalRegistroAbierto(false)}
        onGastoRegistrado={handleGastoRegistrado}
        saldoActualBs={data?.saldoActualBs || 0}
      />

      {/* Modal Edición */}
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

      {/* Modal Confirmación */}
      <ModalConfirmacion
        isOpen={modalConfirmacionAbierto}
        onClose={() => {
          setModalConfirmacionAbierto(false)
          setGastoSeleccionado(null)
        }}
        onConfirm={handleConfirmarEliminacion}
        titulo="Eliminar Gasto"
        mensaje={`¿Estás seguro de que quieres eliminar el gasto "${gastoSeleccionado?.descripcion}"?`}
        confirmarTexto="Eliminar"
        esDestructivo={true}
        loading={eliminando}
      />
    </div>
  )
}