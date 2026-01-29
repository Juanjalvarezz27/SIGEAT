"use client"

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, X, Star, Loader2, DollarSign, List, Info } from 'lucide-react'
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

  const fetchServiciosExtra = async () => {
    try {
      setLoading(true)
      let url = '/api/servicios-extra'
      if (searchTerm) {
        url += `?search=${encodeURIComponent(searchTerm)}`
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error('Error al cargar servicios extra')
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const formatPrice = (price: number) => {
    const priceNumber = typeof price === 'string' ? parseFloat(price) : price
    if (isNaN(priceNumber)) return '$0.00'
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(priceNumber)
  }

  const resetForm = () => {
    setFormData({ nombre: '', descripcion: '', precio: '' })
    setIsEditing(false)
    setSelectedId(null)
  }

  const handleCreate = () => {
    resetForm()
    setShowModal(true)
  }

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

  const handleCloseModal = () => {
    setShowModal(false)
    setTimeout(() => resetForm(), 300)
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      const url = '/api/servicios-extra'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: isEditing ? selectedId : undefined,
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim() || null,
          precio: parseFloat(formData.precio)
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Error al guardar')

      toast.success(isEditing ? 'Servicio extra actualizado' : 'Servicio extra creado')
      handleCloseModal()
      fetchServiciosExtra()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error desconocido')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/servicios-extra?id=${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Error al eliminar')

      toast.success('Servicio extra eliminado')
      setDeleteConfirm(null)
      fetchServiciosExtra()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error desconocido')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header y búsqueda responsive */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Bloque Total y Nuevo */}
        <div className="bg-[#f4f6fc] p-1.5 rounded-2xl flex items-center justify-center gap-2 w-full lg:w-fit mx-auto lg:mx-0">
           <div className="bg-white px-5 py-2 rounded-xl shadow-sm text-center border border-slate-50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Extras</p>
              <p className="text-lg font-black text-[#122a4e]">{serviciosExtra.length}</p>
           </div>
           <button
            onClick={handleCreate}
            className="h-full px-8 py-2 bg-[#4260ad] hover:bg-[#122a4e] text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-[#4260ad]/20 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Nuevo
          </button>
        </div>

        {/* Buscador */}
        <div className="w-full lg:max-w-md">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#4260ad]" />
              <input
                type="text"
                placeholder="Buscar servicios extra..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#869dfc] focus:ring-0 text-sm font-medium outline-none transition-colors"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-red-500 rounded-lg">
                  <X className="h-4 w-4" />
                </button>
              )}
           </div>
        </div>
      </div>

      {/* Lista Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-[#4260ad] animate-spin mb-2" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sincronizando...</span>
        </div>
      ) : serviciosExtra.length === 0 ? (
        <div className="py-12 bg-[#f8f9fc] rounded-4xl border border-dashed border-slate-200 text-center">
           <Star className="h-10 w-10 text-slate-300 mx-auto mb-3" />
           <p className="text-slate-500 font-bold">No se encontraron servicios extra</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {serviciosExtra.map((servicio) => (
            <div key={servicio.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:border-[#869dfc]/30 transition-all duration-300 group relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-[#f4f6fc] rounded-xl text-[#122a4e] group-hover:bg-[#e2e2f6] transition-colors">
                  <Star className="h-5 w-5" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(servicio)} className="p-2 text-slate-400 hover:text-[#4260ad] hover:bg-[#e2e2f6] rounded-xl">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeleteConfirm(servicio.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h4 className="font-bold text-[#140f07] text-lg mb-1 leading-tight">{servicio.nombre}</h4>
              <p className="text-xs text-slate-500 line-clamp-2 min-h-8">{servicio.descripcion || 'Sin descripción'}</p>
              
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-50">
                <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Precio</span>
                   <span className="text-xl font-black text-[#122a4e]">{formatPrice(servicio.precio)}</span>
                </div>
                <div className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-black text-slate-500 uppercase">
                  {servicio._count.registros} Usos
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-[#122a4e]/60 backdrop-blur-sm">
          <div className="bg-[#fcfdff] rounded-4xl shadow-2xl w-full max-w-md overflow-hidden border border-white/20">
            <div className="bg-white px-6 py-5 border-b border-slate-100 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#e2e2f6] rounded-xl text-[#4260ad]">
                     <Star className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-black text-[#140f07]">{isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
               </div>
               <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5">Nombre del Servicio *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-transparent rounded-xl focus:border-[#869dfc] focus:ring-0 text-sm font-bold text-[#140f07] outline-none shadow-sm"
                  placeholder="Ej: Aspirado de Maleta"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5">Precio ($) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4260ad]" />
                  <input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-transparent rounded-xl focus:border-[#869dfc] focus:ring-0 text-sm font-black text-[#122a4e] outline-none shadow-sm"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5">Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-transparent rounded-xl focus:border-[#869dfc] focus:ring-0 text-sm font-medium outline-none resize-none shadow-sm"
                  placeholder="Detalles adicionales del servicio..."
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={handleCloseModal} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-[#4260ad] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#4260ad]/20">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmación Eliminar */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-4xl p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500">
              <Trash2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black text-[#140f07] mb-2">Confirmar Eliminación</h3>
            <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">¿Estás seguro de que deseas eliminar este servicio extra? Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm">Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-600/20">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}