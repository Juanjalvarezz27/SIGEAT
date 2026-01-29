"use client"

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, X, Car, Loader2, ChevronDown, Filter } from 'lucide-react'
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

  const fetchCategorias = async () => {
    try {
      setLoadingCategorias(true)
      const response = await fetch('/api/categorias')
      if (!response.ok) throw new Error('Error al cargar categorías')
      const data = await response.json()
      setCategorias(data)
    } catch (error) {
      toast.error('Error al cargar categorías')
    } finally {
      setLoadingCategorias(false)
    }
  }

  const fetchTiposVehiculo = async () => {
    try {
      setLoading(true)
      let url = '/api/tipos-vehiculo'
      if (filterCategoria) url += `?categoria=${filterCategoria}`
      const response = await fetch(url)
      if (!response.ok) throw new Error('Error al cargar tipos')
      const data = await response.json()
      setTiposVehiculo(data)
    } catch (error) {
      toast.error('Error al cargar tipos de vehículo')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategorias() }, [])
  useEffect(() => { fetchTiposVehiculo() }, [filterCategoria])

  const filteredTiposVehiculo = tiposVehiculo.filter(tipo =>
    tipo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tipo.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData({
      nombre: '',
      categoria: categorias.length > 0 ? categorias[0].id.toString() : ''
    })
    setIsEditing(false)
    setSelectedId(null)
  }

  const handleCreate = () => {
    resetForm()
    setShowModal(true)
  }

  const handleEdit = (tipo: TipoVehiculo) => {
    const categoria = categorias.find(c => c.nombre === tipo.categoria)
    setFormData({
      nombre: tipo.nombre,
      categoria: categoria ? categoria.id.toString() : ''
    })
    setIsEditing(true)
    setSelectedId(tipo.id)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setTimeout(() => resetForm(), 300)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nombre.trim() || !formData.categoria.trim()) {
      toast.error('Datos incompletos'); return
    }
    const categoriaSeleccionada = categorias.find(c => c.id.toString() === formData.categoria)
    if (!categoriaSeleccionada) return

    try {
      const response = await fetch('/api/tipos-vehiculo', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: isEditing ? selectedId : undefined,
          nombre: formData.nombre.trim(),
          categoria: categoriaSeleccionada.nombre.trim()
        })
      })
      if (!response.ok) throw new Error('Error al guardar')
      toast.success(isEditing ? 'Actualizado' : 'Creado')
      handleCloseModal()
      fetchTiposVehiculo()
    } catch (error) {
      toast.error('Error al procesar')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/tipos-vehiculo?id=${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Error al eliminar')
      toast.success('Eliminado')
      setDeleteConfirm(null)
      fetchTiposVehiculo()
    } catch (error) {
      toast.error('No se pudo eliminar')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header y búsqueda responsive */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Bloque Total y Nuevo - Centrado en móvil */}
        <div className="bg-[#f4f6fc] p-1.5 rounded-2xl flex items-center justify-center gap-2 w-full lg:w-fit mx-auto lg:mx-0">
           <div className="bg-white px-5 py-2 rounded-xl shadow-sm text-center border border-slate-50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Tipos</p>
              <p className="text-lg font-black text-[#122a4e]">{tiposVehiculo.length}</p>
           </div>
           <button
            onClick={handleCreate}
            disabled={loadingCategorias || categorias.length === 0}
            className="h-full px-8 py-2 bg-[#4260ad] hover:bg-[#122a4e] text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-[#4260ad]/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" /> Nuevo
          </button>
        </div>

        {/* Buscador y Filtro - Apilado en móvil */}
        <div className="flex flex-col sm:flex-row w-full lg:max-w-xl gap-3">
           <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#4260ad]" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#869dfc] focus:ring-0 text-sm font-medium outline-none transition-colors"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-500 rounded-lg">
                  <X className="h-4 w-4" />
                </button>
              )}
           </div>
           <div className="relative group w-full sm:w-56">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Filter className="h-4 w-4" />
              </div>
              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="w-full pl-9 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#869dfc] focus:ring-0 text-sm font-bold text-[#140f07] outline-none appearance-none cursor-pointer"
              >
                <option value="">Todas las categorías</option>
                {categorias.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
           </div>
        </div>
      </div>

      {/* Lista Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-[#4260ad] animate-spin mb-2" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cargando...</span>
        </div>
      ) : filteredTiposVehiculo.length === 0 ? (
        <div className="py-12 bg-[#f8f9fc] rounded-4xl border border-dashed border-slate-200 text-center">
           <Car className="h-10 w-10 text-slate-300 mx-auto mb-3" />
           <p className="text-slate-500 font-bold">Sin resultados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTiposVehiculo.map((tipo) => (
            <div key={tipo.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:border-[#869dfc]/30 transition-all duration-300 group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-[#f4f6fc] rounded-xl text-[#122a4e] group-hover:bg-[#e2e2f6] transition-colors">
                  <Car className="h-5 w-5" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(tipo)} className="p-2 text-slate-400 hover:text-[#4260ad] hover:bg-[#e2e2f6] rounded-xl">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeleteConfirm(tipo.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h4 className="font-bold text-[#140f07] text-lg mb-1">{tipo.nombre}</h4>
              <p className="text-xs font-bold text-[#4260ad] uppercase tracking-wider">{tipo.categoria}</p>
              
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-50">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ID: #{tipo.id}</span>
                <div className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-black text-slate-500 uppercase">
                  {tipo._count.registros} Registros
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
                  <div className="p-2 bg-[#e2e2f6] rounded-xl text-[#4260ad]">
                     <Car className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-black text-[#140f07]">{isEditing ? 'Editar Tipo' : 'Nuevo Tipo'}</h3>
               </div>
               <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5">Nombre del Vehículo *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-transparent rounded-xl focus:border-[#869dfc] focus:ring-0 text-sm font-bold text-[#140f07] outline-none shadow-sm"
                  placeholder="Ej: Sedán Grande"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5">Categoría Asignada *</label>
                <div className="relative">
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-transparent rounded-xl focus:border-[#869dfc] focus:ring-0 text-sm font-bold text-[#140f07] outline-none appearance-none shadow-sm"
                    required
                  >
                    <option value="">Selecciona una</option>
                    {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
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
          <div className="bg-white rounded-4xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500">
              <Trash2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black text-[#140f07] mb-2">¿Eliminar tipo?</h3>
            <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">Se perderá el vínculo con los registros existentes de este tipo de vehículo.</p>
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