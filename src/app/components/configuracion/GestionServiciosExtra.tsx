"use client"

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, X, Star, Loader2, DollarSign, List } from 'lucide-react'
import { toast } from 'react-toastify'

interface ServicioExtra {
  id: number
  nombre: string
  descripcion: string | null
  precio: number
  _count: {
    registros: number
  }
}

interface FormData {
  nombre: string
  descripcion: string
  precio: string
}

export default function GestionServiciosExtra() {
  const [serviciosExtra, setServiciosExtra] = useState<ServicioExtra[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    descripcion: '',
    precio: ''
  })
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  // Cargar servicios extra
  const fetchServiciosExtra = async () => {
    try {
      setLoading(true)
      let url = '/api/servicios-extra'
      if (searchTerm) {
        url += `?search=${encodeURIComponent(searchTerm)}`
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Error al cargar servicios extra')
      }

      const data = await response.json()
      setServiciosExtra(data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar servicios extra')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServiciosExtra()
  }, [searchTerm])

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

    // Formatear precio - manejo seguro de números
    const formatPrice = (price: number) => {
    const priceNumber = typeof price === 'string' ? parseFloat(price) : price
    
    if (isNaN(priceNumber)) {
        return '$0.00'
    }
    
    return new Intl.NumberFormat('es-VE', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(priceNumber)
    }

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      precio: ''
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
  const handleEdit = (servicio: ServicioExtra) => {
    setFormData({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion || '',
      precio: servicio.precio.toString()
    })
    setIsEditing(true)
    setSelectedId(servicio.id)
    setShowModal(true)
  }

  // Cerrar modal
  const handleCloseModal = () => {
    setShowModal(false)
    setTimeout(() => resetForm(), 300)
  }

  // Validar formulario
  const validateForm = () => {
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido')
      return false
    }

    if (!formData.precio.trim()) {
      toast.error('El precio es requerido')
      return false
    }

    const precio = parseFloat(formData.precio)
    if (isNaN(precio) || precio < 0) {
      toast.error('El precio debe ser un número válido y positivo')
      return false
    }

    return true
  }

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const url = '/api/servicios-extra'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: isEditing ? selectedId : undefined,
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim() || null,
          precio: parseFloat(formData.precio)
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar')
      }

      toast.success(isEditing ? 'Servicio extra actualizado' : 'Servicio extra creado')
      handleCloseModal()
      fetchServiciosExtra()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error desconocido')
    }
  }

  // Eliminar servicio extra
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/servicios-extra?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar')
      }

      toast.success('Servicio extra eliminado')
      setDeleteConfirm(null)
      fetchServiciosExtra()
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
            <h3 className="text-lg font-semibold text-gray-900">Servicios Extra</h3>
            <p className="text-gray-600 text-sm">
              {serviciosExtra.length} servicio{serviciosExtra.length !== 1 ? 's' : ''} extra
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="px-4 py-2.5 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors flex items-center justify-center space-x-2 w-full md:w-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Servicio Extra</span>
          </button>
        </div>

        {/* Búsqueda */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar servicios extra por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
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

      {/* Lista de servicios extra */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
          </div>
        ) : serviciosExtra.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
            <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No se encontraron resultados' : 'No hay servicios extra registrados'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza creando tu primer servicio extra'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={handleCreate}
                className="px-4 py-2.5 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
              >
                Crear Primer Servicio Extra
              </button>
            )}
          </div>
        ) : (
          serviciosExtra.map((servicio) => (
            <div key={servicio.id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{servicio.nombre}</h4>
                  {servicio.descripcion && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {servicio.descripcion}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEdit(servicio)}
                    className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(servicio.id)}
                    className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                        ID: {servicio.id}
                    </span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm font-semibold text-green-600">
                    <span>{formatPrice(servicio.precio)}</span>
                    </div>
                </div>
                </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para crear/editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 bg-linear-to-r from-amber-500 to-orange-600">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {isEditing ? 'Editar Servicio Extra' : 'Nuevo Servicio Extra'}
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
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  placeholder="Ej: Encerado, Aspirado interior, etc."
                  required
                  autoFocus
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción (Opcional)
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
                  placeholder="Describe brevemente el servicio extra..."
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio (USD) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    placeholder="0.00"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Ingresa el precio en dólares (USD)
                </p>
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
                  className="flex-1 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
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
                ¿Estás seguro de que deseas eliminar este servicio extra?
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