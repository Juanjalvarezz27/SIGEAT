"use client"

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, X, Layers, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'

interface Categoria {
  id: number
  nombre: string
  servicios?: { id: number }[] 
}

interface FormData {
  nombre: string
}

export default function GestionCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState<FormData>({
    nombre: ''
  })
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<number | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  // Cargar categorías
  const fetchCategorias = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/categorias')
      
      if (!response.ok) {
        throw new Error('Error al cargar categorías')
      }
      
      const data = await response.json()
      setCategorias(data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar categorías')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategorias()
  }, [])

  // Filtrar categorías
  const filteredCategorias = categorias.filter(categoria =>
    categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      nombre: e.target.value
    })
  }

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      nombre: ''
    })
    setIsEditing(false)
    setSelectedCategoriaId(null)
  }

  // Abrir modal para crear
  const handleCreate = () => {
    resetForm()
    setShowModal(true)
  }

  // Abrir modal para editar
  const handleEdit = (categoria: Categoria) => {
    setFormData({
      nombre: categoria.nombre
    })
    setIsEditing(true)
    setSelectedCategoriaId(categoria.id)
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

    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    try {
      const url = '/api/categorias'
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: isEditing ? selectedCategoriaId : undefined,
          nombre: formData.nombre.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar')
      }

      toast.success(isEditing ? 'Categoría actualizada' : 'Categoría creada')
      handleCloseModal()
      fetchCategorias()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error desconocido')
    }
  }

  // Eliminar categoría
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/categorias?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar')
      }

      toast.success('Categoría eliminada')
      setDeleteConfirm(null)
      fetchCategorias()
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
            <h3 className="text-lg font-semibold text-gray-900">Lista de Categorías</h3>
            <p className="text-gray-600 text-sm">
              {categorias.length} categoría{categorias.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="px-4 py-2.5 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors flex items-center justify-center space-x-2 w-full md:w-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Categoría</span>
          </button>
        </div>

        {/* Búsqueda */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar categorías..."
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
        </div>
      </div>

      {/* Lista de categorías */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          </div>
        ) : filteredCategorias.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
            <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {categorias.length === 0 ? 'No hay categorías registradas' : 'No se encontraron resultados'}
            </h3>
            <p className="text-gray-600 mb-4">
              {categorias.length === 0 
                ? 'Comienza creando tu primera categoría'
                : 'Intenta con otros términos de búsqueda'
              }
            </p>
            {categorias.length === 0 && (
              <button
                onClick={handleCreate}
                className="px-4 py-2.5 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors"
              >
                Crear Primera Categoría
              </button>
            )}
          </div>
        ) : (
          filteredCategorias.map((categoria) => (
            <div key={categoria.id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{categoria.nombre}</h4>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEdit(categoria)}
                    className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(categoria.id)}
                    className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  ID: {categoria.id}
                </span>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                  Servicios: {categoria.servicios?.length || 0}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para crear/editar - SIMPLIFICADO */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 bg-linear-to-r from-indigo-500 to-purple-600">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
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
                  placeholder="Ej: Lavado"
                  required
                  autoFocus
                />
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
                  className="flex-1 py-3 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors"
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
                ¿Estás seguro de que deseas eliminar esta categoría? 
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