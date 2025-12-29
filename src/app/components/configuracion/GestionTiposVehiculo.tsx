"use client"

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, X, Car, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'

interface TipoVehiculo {
  id: number
  nombre: string
  categoria: string
  _count: {
    registros: number
  }
}

interface Categoria {
  id: number
  nombre: string
  servicios?: { id: number }[]
}

interface FormData {
  nombre: string
  categoria: string
}

export default function GestionTiposVehiculo() {
  const [tiposVehiculo, setTiposVehiculo] = useState<TipoVehiculo[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCategorias, setLoadingCategorias] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategoria, setFilterCategoria] = useState('')
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    categoria: ''
  })
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  // Cargar categorías
  const fetchCategorias = async () => {
    try {
      setLoadingCategorias(true)
      const response = await fetch('/api/categorias')

      if (!response.ok) {
        throw new Error('Error al cargar categorías')
      }

      const data = await response.json()
      setCategorias(data)
    } catch (error) {
      console.error('Error al cargar categorías:', error)
      toast.error('Error al cargar categorías')
    } finally {
      setLoadingCategorias(false)
    }
  }

  // Cargar tipos de vehículo
  const fetchTiposVehiculo = async () => {
    try {
      setLoading(true)
      let url = '/api/tipos-vehiculo'
      if (filterCategoria) {
        url += `?categoria=${filterCategoria}`
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Error al cargar tipos de vehículo')
      }

      const data = await response.json()
      setTiposVehiculo(data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar tipos de vehículo')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategorias()
  }, [])

  useEffect(() => {
    fetchTiposVehiculo()
  }, [filterCategoria])

  // Filtrar tipos de vehículo
  const filteredTiposVehiculo = tiposVehiculo.filter(tipo =>
    tipo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tipo.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Obtener nombre de categoría por ID
  const getNombreCategoria = (categoriaId: string) => {
    const categoria = categorias.find(c => c.id.toString() === categoriaId)
    return categoria ? categoria.nombre : categoriaId
  }

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      nombre: '',
      categoria: categorias.length > 0 ? categorias[0].id.toString() : ''
    })
    setIsEditing(false)
    setSelectedId(null)
  }

  // Abrir modal para crear
  const handleCreate = () => {
    resetForm()
    setShowModal(true)
  }

  // Abrir modal para editar
  const handleEdit = (tipo: TipoVehiculo) => {
    // Encontrar el ID de la categoría por nombre
    const categoria = categorias.find(c => c.nombre === tipo.categoria)
    
    setFormData({
      nombre: tipo.nombre,
      categoria: categoria ? categoria.id.toString() : ''
    })
    setIsEditing(true)
    setSelectedId(tipo.id)
    setShowModal(true)
  }

  // Cerrar modal
  const handleCloseModal = () => {
    setShowModal(false)
    setTimeout(() => resetForm(), 300)
  }

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre.trim() || !formData.categoria.trim()) {
      toast.error('Nombre y categoría son requeridos')
      return
    }

    // Obtener el nombre de la categoría seleccionada
    const categoriaSeleccionada = categorias.find(c => c.id.toString() === formData.categoria)
    if (!categoriaSeleccionada) {
      toast.error('Categoría no válida')
      return
    }

    try {
      const url = '/api/tipos-vehiculo'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: isEditing ? selectedId : undefined,
          nombre: formData.nombre.trim(),
          categoria: categoriaSeleccionada.nombre.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar')
      }

      toast.success(isEditing ? 'Tipo de vehículo actualizado' : 'Tipo de vehículo creado')
      handleCloseModal()
      fetchTiposVehiculo()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error desconocido')
    }
  }

  // Eliminar tipo de vehículo
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/tipos-vehiculo?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar')
      }

      toast.success('Tipo de vehículo eliminado')
      setDeleteConfirm(null)
      fetchTiposVehiculo()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error desconocido')
    }
  }

  return (
    <>
      {/* Header y búsqueda */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Lista de Tipos de Vehículo</h3>
            <p className="text-gray-600 text-sm">
              {tiposVehiculo.length} tipo{tiposVehiculo.length !== 1 ? 's' : ''} de vehículo
            </p>
          </div>
          <button
            onClick={handleCreate}
            disabled={loadingCategorias || categorias.length === 0}
            className="px-4 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Tipo</span>
          </button>
        </div>

        {/* Filtros y búsqueda */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="relative">
            {loadingCategorias ? (
              <div className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
              </div>
            ) : (
              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Todas las categorías</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.nombre}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Lista de tipos de vehículo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        ) : filteredTiposVehiculo.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {tiposVehiculo.length === 0 ? 'No hay tipos de vehículo registrados' : 'No se encontraron resultados'}
            </h3>
            <p className="text-gray-600 mb-4">
              {tiposVehiculo.length === 0
                ? loadingCategorias || categorias.length === 0
                  ? 'Cargando categorías...'
                  : 'Comienza creando tu primer tipo de vehículo'
                : 'Intenta con otros términos de búsqueda'
              }
            </p>
            {tiposVehiculo.length === 0 && categorias.length > 0 && (
              <button
                onClick={handleCreate}
                className="px-4 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Crear Primer Tipo
              </button>
            )}
          </div>
        ) : (
          filteredTiposVehiculo.map((tipo) => (
            <div key={tipo.id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{tipo.nombre}</h4>
                  <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    {tipo.categoria}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEdit(tipo)}
                    className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(tipo.id)}
                    className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  ID: {tipo.id}
                </span>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                  Registros: {tipo._count.registros}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para crear/editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 bg-linear-to-r from-blue-500 to-cyan-600">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {isEditing ? 'Editar Tipo de Vehículo' : 'Nuevo Tipo de Vehículo'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Ej: Sedán, SUV, Motocicleta"
                  required
                  autoFocus
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                {loadingCategorias ? (
                  <div className="w-full px-3 py-2.5 border border-gray-300 rounded-lg flex items-center justify-center">
                    <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                    <span className="ml-2 text-sm text-gray-600">Cargando categorías...</span>
                  </div>
                ) : categorias.length === 0 ? (
                  <div className="text-center py-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      No hay categorías disponibles. Primero crea una categoría.
                    </p>
                  </div>
                ) : (
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  >
                    <option value="">Selecciona una categoría</option>
                    {categorias.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingCategorias || categorias.length === 0}
                  className="flex-1 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEditing ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Confirmar Eliminación
              </h3>

              <p className="text-center text-gray-600 text-sm mb-6">
                ¿Estás seguro de que deseas eliminar este tipo de vehículo?
                Esta acción no se puede deshacer.
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}