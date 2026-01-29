"use client"

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, X, Layers, Loader2, ChevronRight } from 'lucide-react'
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

  const fetchCategorias = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/categorias')
      if (!response.ok) throw new Error('Error al cargar categorías')
      const data = await response.json()
      setCategorias(data)
    } catch (error) {
      toast.error('Error al cargar categorías')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategorias()
  }, [])

  const filteredCategorias = categorias.filter(categoria =>
    categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ nombre: e.target.value })
  }

  const resetForm = () => {
    setFormData({ nombre: '' })
    setIsEditing(false)
    setSelectedCategoriaId(null)
  }

  const handleCreate = () => {
    resetForm()
    setShowModal(true)
  }

  const handleEdit = (categoria: Categoria) => {
    setFormData({ nombre: categoria.nombre })
    setIsEditing(true)
    setSelectedCategoriaId(categoria.id)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setTimeout(() => resetForm(), 300)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    try {
      const response = await fetch('/api/categorias', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: isEditing ? selectedCategoriaId : undefined,
          nombre: formData.nombre.trim()
        })
      })
      if (!response.ok) throw new Error('Error al guardar')
      toast.success(isEditing ? 'Actualizada' : 'Creada')
      handleCloseModal()
      fetchCategorias()
    } catch (error) {
      toast.error('Error al procesar la solicitud')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/categorias?id=${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Error al eliminar')
      toast.success('Categoría eliminada')
      setDeleteConfirm(null)
      fetchCategorias()
    } catch (error) {
      toast.error('No se pudo eliminar')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header y búsqueda */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Bloque Total y Nuevo */}
        <div className="bg-[#f4f6fc] p-1.5 rounded-2xl flex items-center justify-center gap-2 w-full lg:w-fit mx-auto lg:mx-0">
           <div className="bg-white px-5 py-2 rounded-xl shadow-sm text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Categorías</p>
              <p className="text-lg font-black text-[#122a4e]">{categorias.length}</p>
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
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#869dfc] focus:ring-0 text-sm font-medium outline-none transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
           </div>
        </div>
      </div>

      {/* Lista de categorías */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-[#4260ad] animate-spin mb-2" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cargando...</span>
        </div>
      ) : filteredCategorias.length === 0 ? (
        <div className="py-12 bg-[#f8f9fc] rounded-4xl border border-dashed border-slate-200 text-center">
           <Layers className="h-10 w-10 text-slate-300 mx-auto mb-3" />
           <p className="text-slate-500 font-bold">No hay categorías para mostrar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategorias.map((categoria) => (
            <div 
              key={categoria.id} 
              className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:border-[#869dfc]/30 transition-all duration-300 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-[#f4f6fc] rounded-xl text-[#122a4e] group-hover:bg-[#e2e2f6] transition-colors">
                  <Layers className="h-5 w-5" />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(categoria)}
                    className="p-2 text-slate-400 hover:text-[#4260ad] hover:bg-[#e2e2f6] rounded-xl transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(categoria.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h4 className="font-bold text-[#140f07] text-base mb-4">{categoria.nombre}</h4>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  ID: #{categoria.id}
                </span>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg text-xs font-bold text-slate-500">
                  <ChevronRight className="h-3 w-3 text-[#4260ad]" />
                  {categoria.servicios?.length || 0} Servicios
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#f8f9fc] rounded-4xl shadow-2xl w-full max-w-sm overflow-hidden border border-white/20">
            <div className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#e2e2f6] rounded-xl">
                     <Layers className="h-5 w-5 text-[#4260ad]" />
                  </div>
                  <h3 className="text-lg font-black text-[#140f07]">{isEditing ? 'Editar' : 'Nueva'}</h3>
               </div>
               <button onClick={handleCloseModal} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5">
                  Nombre de Categoría *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-transparent rounded-xl focus:border-[#869dfc] focus:ring-0 text-sm font-bold text-[#140f07] outline-none shadow-sm"
                  placeholder="Ej: Lavados Especiales"
                  required
                  autoFocus
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#4260ad] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#4260ad]/20"
                >
                  {isEditing ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminar */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-4xl p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500">
              <Trash2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black text-[#140f07] mb-2">¿Eliminar categoría?</h3>
            <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
              Esta acción no se puede deshacer. Los servicios asociados podrían quedar sin categoría.
            </p>
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