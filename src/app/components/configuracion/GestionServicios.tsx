"use client"

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Tag, DollarSign, X, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'

interface Servicio {
  id: number
  nombre: string
  descripcion: string | null
  categoriaId: number
  precio: number
  categoria: {
    id: number
    nombre: string
  }
}

interface Categoria {
  id: number
  nombre: string
}

interface FormData {
  nombre: string
  descripcion: string
  categoriaId: string
  precio: string
}

export default function GestionServicios() {
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    descripcion: '',
    categoriaId: '',
    precio: ''
  })
  const [selectedServicioId, setSelectedServicioId] = useState<number | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<number, boolean>>({})

  // Orden de categorías específico
  const categoriaOrder = ['Sencillo', 'Especial', 'Premium']

  // Cargar datos
  const fetchData = async () => {
    try {
      setLoading(true)

      // Cargar servicios
      const serviciosRes = await fetch('/api/servicios')
      if (!serviciosRes.ok) throw new Error('Error al cargar servicios')
      const serviciosData = await serviciosRes.json()
      
      // Ordenar servicios por categoría según el orden especificado
      const serviciosOrdenados = serviciosData.sort((a: Servicio, b: Servicio) => {
        const orderA = categoriaOrder.indexOf(a.categoria.nombre)
        const orderB = categoriaOrder.indexOf(b.categoria.nombre)
        
        // Si ambas categorías están en el orden especificado
        if (orderA !== -1 && orderB !== -1) {
          return orderA - orderB
        }
        
        // Si solo A está en el orden especificado
        if (orderA !== -1) return -1
        
        // Si solo B está en el orden especificado
        if (orderB !== -1) return 1
        
        // Si ninguna está en el orden especificado, orden alfabético
        return a.categoria.nombre.localeCompare(b.categoria.nombre)
      })
      
      setServicios(serviciosOrdenados)

      // Cargar categorías
      const categoriasRes = await fetch('/api/categorias')
      if (!categoriasRes.ok) throw new Error('Error al cargar categorías')
      const categoriasData = await categoriasRes.json()
      
      // Ordenar categorías según el orden especificado
      const categoriasOrdenadas = categoriasData.sort((a: Categoria, b: Categoria) => {
        const orderA = categoriaOrder.indexOf(a.nombre)
        const orderB = categoriaOrder.indexOf(b.nombre)
        
        if (orderA !== -1 && orderB !== -1) {
          return orderA - orderB
        }
        
        if (orderA !== -1) return -1
        if (orderB !== -1) return 1
        
        return a.nombre.localeCompare(b.nombre)
      })
      
      setCategorias(categoriasOrdenadas)

    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Filtrar servicios
  const filteredServicios = servicios.filter(servicio => {
    const matchesSearch = servicio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      servicio.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      servicio.categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || servicio.categoria.id.toString() === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      descripcion: '',
      categoriaId: '',
      precio: ''
    })
    setIsEditing(false)
    setSelectedServicioId(null)
  }

  // Abrir modal para crear
  const handleCreate = () => {
    resetForm()
    setShowModal(true)
  }

  // Abrir modal para editar
  const handleEdit = (servicio: Servicio) => {
    setFormData({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion || '',
      categoriaId: servicio.categoriaId.toString(),
      precio: servicio.precio.toString()
    })
    setIsEditing(true)
    setSelectedServicioId(servicio.id)
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

    if (!formData.nombre || !formData.categoriaId || !formData.precio) {
      toast.error('Nombre, categoría y precio son requeridos')
      return
    }

    const precio = parseFloat(formData.precio)
    if (isNaN(precio) || precio <= 0) {
      toast.error('El precio debe ser un número mayor a 0')
      return
    }

    try {
      const url = '/api/servicios'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: isEditing ? selectedServicioId : undefined,
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim() || null,
          categoriaId: parseInt(formData.categoriaId),
          precio: precio
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar')
      }

      toast.success(isEditing ? 'Servicio actualizado' : 'Servicio creado')
      handleCloseModal()
      fetchData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error desconocido')
    }
  }

  // Eliminar servicio
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/servicios?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar')
      }

      toast.success('Servicio eliminado')
      setDeleteConfirm(null)
      fetchData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error desconocido')
    }
  }

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price)
  }

  // Limpiar filtros
  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
  }

  // Toggle descripción
  const toggleDescription = (id: number) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // Función para obtener el color según la categoría
  const getCategoryColor = (categoriaNombre: string) => {
    switch (categoriaNombre.toLowerCase()) {
      case 'sencillo':
        return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' }
      case 'especial':
        return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' }
      case 'premium':
        return { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' }
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
    }
  }

  // Vista de tarjeta para grid
  const ServicioCard = ({ servicio }: { servicio: Servicio }) => {
    const isExpanded = expandedDescriptions[servicio.id] || false
    const hasDescription = servicio.descripcion && servicio.descripcion.length > 0
    const categoryColor = getCategoryColor(servicio.categoria.nombre)

    return (
      <div className={`bg-white rounded-lg shadow-sm border ${categoryColor.border} hover:shadow-md transition-all duration-200`}>
        <div className="p-4">
          {/* Header con nombre y acciones */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0 pr-2">
              <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                {servicio.nombre}
              </h3>
            </div>
            <div className="flex items-center space-x-1 shrink-0">
              <button
                onClick={() => handleEdit(servicio)}
                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                title="Editar"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDeleteConfirm(servicio.id)}
                className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                title="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Información del servicio */}
          <div className="space-y-2">
            {/* Categoría y precio en línea */}
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColor.bg} ${categoryColor.text}`}>
                {servicio.categoria.nombre}
              </span>
              <div className="flex items-center font-semibold text-green-600">
                <span className="text-sm">{formatPrice(servicio.precio)}</span>
              </div>
            </div>

            {/* Descripción con toggle */}
            {hasDescription && (
              <div className="pt-2 border-t border-gray-100">
                <button
                  onClick={() => toggleDescription(servicio.id)}
                  className="flex items-center justify-between w-full text-left text-xs text-gray-600 hover:text-gray-800"
                >
                  <span className="font-medium">{isExpanded ? 'Ocultar Descripcion' : 'Ver Descripcion'}</span>
                  {isExpanded ? (
                    <svg className="h-3.5 w-3.5 ml-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="h-3.5 w-3.5 ml-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-2 pt-2">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {servicio.descripcion}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Header principal */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Servicios</h1>
            <p className="text-gray-600 text-sm mt-1">
              {filteredServicios.length} de {servicios.length} servicios
            </p>
          </div>
          
          {/* Botón Nuevo Servicio - Texto centrado en responsive */}
          <button
            onClick={handleCreate}
            className="px-4 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 shadow-sm w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            <span className="text-center">Nuevo Servicio</span>
          </button>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Barra de búsqueda */}
            <div className="lg:col-span-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar servicios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
              </div>
            </div>

            {/* Filtro por categoría - Estilo mejorado */}
            <div className="lg:col-span-4">
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                  <Tag className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none cursor-pointer text-sm transition-all duration-200 hover:border-gray-400"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.25em 1.25em',
                  }}
                >
                  <option value="" className="text-gray-400">Todas las categorías</option>
                  {categorias.map(categoria => (
                    <option key={categoria.id} value={categoria.id} className="text-gray-700">
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="absolute right-8 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Botón limpiar filtros */}
            <div className="lg:col-span-3">
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={clearFilters}
                  className="w-full h-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm flex items-center justify-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Limpiar filtros</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="h-10 w-10 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Cargando servicios...</p>
            </div>
          </div>
        ) : filteredServicios.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {servicios.length === 0 ? 'No hay servicios registrados' : 'No se encontraron resultados'}
            </h3>
            <p className="text-gray-600 text-sm max-w-md mx-auto mb-6">
              {servicios.length === 0
                ? 'Comienza creando tu primer servicio para administrar tus ofertas.'
                : 'Intenta ajustar los filtros o cambiar los términos de búsqueda.'
              }
            </p>
            {servicios.length === 0 && (
              <button
                onClick={handleCreate}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-sm"
              >
                Crear Primer Servicio
              </button>
            )}
          </div>
        ) : (
          // Grid de 3 columnas con servicios ordenados
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServicios.map((servicio) => (
              <ServicioCard key={servicio.id} servicio={servicio} />
            ))}
          </div>
        )}
      </div>

      {/* Modal para crear/editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-500 p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del servicio *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="Ej: Lavado Básico de Auto"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  name="categoriaId"
                  value={formData.categoriaId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none cursor-pointer transition-all duration-200 hover:border-gray-400"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 1rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                  required
                >
                  <option value="" className="text-gray-400">Selecciona una categoría</option>
                  {categorias.map(categoria => (
                    <option key={categoria.id} value={categoria.id} className="text-gray-700">
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio (USD) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-colors text-sm"
                  placeholder="Describe el servicio, incluye detalles importantes para el cliente..."
                />
              </div>

              <div className="flex space-x-3 pt-4 sticky bottom-0 bg-white pb-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm"
                >
                  {isEditing ? 'Actualizar Servicio' : 'Crear Servicio'}
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
                ¿Eliminar servicio?
              </h3>

              <p className="text-center text-gray-600 text-sm mb-6">
                Esta acción eliminará permanentemente el servicio.
                ¿Estás seguro de continuar?
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors text-sm"
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