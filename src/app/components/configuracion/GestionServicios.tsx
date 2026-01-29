"use client"

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Tag, DollarSign, X, Loader2, Info, ChevronDown } from 'lucide-react'
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

  const categoriaOrder = ['Sencillo', 'Especial', 'Premium']

  const fetchData = async () => {
    try {
      setLoading(true)
      const serviciosRes = await fetch('/api/servicios')
      if (!serviciosRes.ok) throw new Error('Error al cargar servicios')
      const serviciosData = await serviciosRes.json()
      
      const serviciosOrdenados = serviciosData.sort((a: Servicio, b: Servicio) => {
        const orderA = categoriaOrder.indexOf(a.categoria.nombre)
        const orderB = categoriaOrder.indexOf(b.categoria.nombre)
        if (orderA !== -1 && orderB !== -1) return orderA - orderB
        if (orderA !== -1) return -1
        if (orderB !== -1) return 1
        return a.categoria.nombre.localeCompare(b.categoria.nombre)
      })
      
      setServicios(serviciosOrdenados)

      const categoriasRes = await fetch('/api/categorias')
      if (!categoriasRes.ok) throw new Error('Error al cargar categorías')
      const categoriasData = await categoriasRes.json()
      
      const categoriasOrdenadas = categoriasData.sort((a: Categoria, b: Categoria) => {
        const orderA = categoriaOrder.indexOf(a.nombre)
        const orderB = categoriaOrder.indexOf(b.nombre)
        if (orderA !== -1 && orderB !== -1) return orderA - orderB
        if (orderA !== -1) return -1
        if (orderB !== -1) return 1
        return a.nombre.localeCompare(b.nombre)
      })
      
      setCategorias(categoriasOrdenadas)
    } catch (error) {
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredServicios = servicios.filter(servicio => {
    const matchesSearch = servicio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      servicio.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      servicio.categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || servicio.categoria.id.toString() === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData({ nombre: '', descripcion: '', categoriaId: '', precio: '' })
    setIsEditing(false)
    setSelectedServicioId(null)
  }

  const handleCreate = () => {
    resetForm()
    setShowModal(true)
  }

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

  const handleCloseModal = () => {
    setShowModal(false)
    setTimeout(() => resetForm(), 300)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nombre || !formData.categoriaId || !formData.precio) {
      toast.error('Datos incompletos'); return
    }
    const precio = parseFloat(formData.precio)
    if (isNaN(precio) || precio <= 0) {
      toast.error('Precio inválido'); return
    }

    try {
      const response = await fetch('/api/servicios', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: isEditing ? selectedServicioId : undefined,
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim() || null,
          categoriaId: parseInt(formData.categoriaId),
          precio: precio
        })
      })
      if (!response.ok) throw new Error('Error al guardar')
      toast.success(isEditing ? 'Actualizado' : 'Creado')
      handleCloseModal()
      fetchData()
    } catch (error) {
      toast.error('Ocurrió un error')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/servicios?id=${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Error al eliminar')
      toast.success('Servicio eliminado')
      setDeleteConfirm(null)
      fetchData()
    } catch (error) {
      toast.error('No se pudo eliminar')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
  }

  const getCategoryColor = (categoriaNombre: string) => {
    switch (categoriaNombre.toLowerCase()) {
      case 'sencillo': return { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' }
      case 'especial': return { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' }
      case 'premium': return { bg: 'bg-[#122a4e]', text: 'text-white', dot: 'bg-[#869dfc]' }
      default: return { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' }
    }
  }

  const ServicioCard = ({ servicio }: { servicio: Servicio }) => {
    const isExpanded = expandedDescriptions[servicio.id] || false
    const categoryStyle = getCategoryColor(servicio.categoria.nombre)

    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-[#869dfc]/30 transition-colors duration-200 group">
        <div className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${categoryStyle.bg} ${categoryStyle.text}`}>
               <span className={`w-1.5 h-1.5 rounded-full ${categoryStyle.dot}`}></span>
               {servicio.categoria.nombre}
            </div>
            <div className="flex gap-1">
              <button onClick={() => handleEdit(servicio)} className="p-2 text-slate-400 hover:text-[#4260ad] hover:bg-[#e2e2f6] rounded-xl transition-colors">
                <Edit className="h-4 w-4" />
              </button>
              <button onClick={() => setDeleteConfirm(servicio.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <h3 className="font-bold text-[#140f07] text-base leading-snug mb-2 line-clamp-2">
            {servicio.nombre}
          </h3>
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
             <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Precio Base</span>
                <span className="text-xl font-black text-[#122a4e]">{formatPrice(servicio.precio)}</span>
             </div>
             {servicio.descripcion && (
               <button 
                onClick={() => setExpandedDescriptions(prev => ({ ...prev, [servicio.id]: !isExpanded }))}
                className={`p-2 rounded-xl transition-colors ${isExpanded ? 'bg-[#122a4e] text-white' : 'bg-[#f4f6fc] text-slate-400'}`}
               >
                 <Info className="h-4 w-4" />
               </button>
             )}
          </div>

          {isExpanded && servicio.descripcion && (
            <div className="mt-4 p-3 bg-[#f8f9fc] rounded-xl">
               <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                 "{servicio.descripcion}"
               </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Acciones: Centrado y apilado dinámico */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Bloque Total y Nuevo: Centrado en responsive */}
        <div className="bg-[#f4f6fc] p-1.5 rounded-2xl flex flex-row items-center justify-center gap-2 w-full lg:w-fit">
           <div className="bg-white px-5 py-2 rounded-xl shadow-sm text-center flex-1 lg:flex-none">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Servicios</p>
              <p className="text-lg font-black text-[#122a4e]">{servicios.length}</p>
           </div>
           <button
            onClick={handleCreate}
            className="px-8 py-2.5 h-full bg-[#4260ad] hover:bg-[#122a4e] text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-[#4260ad]/20 flex items-center justify-center gap-2 flex-1 lg:flex-none"
          >
            <Plus className="h-4 w-4" /> Nuevo
          </button>
        </div>

        {/* Buscador y Filtro: Uno debajo del otro en móvil */}
        <div className="flex flex-col sm:flex-row w-full lg:max-w-xl gap-3">
           <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#4260ad]" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#869dfc] focus:ring-0 text-sm font-medium outline-none transition-colors shadow-sm"
              />
           </div>
           <div className="relative group w-full sm:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#869dfc] focus:ring-0 text-sm font-bold text-[#140f07] outline-none appearance-none cursor-pointer shadow-sm"
              >
                <option value="">Todas las categorías</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
           </div>
        </div>
      </div>

      {/* Lista de Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-[#4260ad] animate-spin mb-2" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sincronizando...</span>
        </div>
      ) : filteredServicios.length === 0 ? (
        <div className="py-12 bg-[#f8f9fc] rounded-[2.5rem] border border-dashed border-slate-200 text-center">
           <Tag className="h-10 w-10 text-slate-300 mx-auto mb-3" />
           <p className="text-slate-500 font-bold">No se encontraron servicios</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServicios.map((servicio) => (
            <ServicioCard key={servicio.id} servicio={servicio} />
          ))}
        </div>
      )}

      {/* Modales */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
          <div className="bg-[#f8f9fc] rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20">
            <div className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#e2e2f6] rounded-xl">
                     <Tag className="h-5 w-5 text-[#4260ad]" />
                  </div>
                  <h3 className="text-lg font-black text-[#140f07]">{isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
               </div>
               <button onClick={handleCloseModal} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Nombre</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required className="w-full px-4 py-3 bg-white border border-transparent rounded-xl focus:border-[#869dfc] focus:ring-0 text-sm font-medium outline-none shadow-sm" placeholder="Ej: Lavado Premium" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Categoría</label>
                  <div className="relative">
                    <select name="categoriaId" value={formData.categoriaId} onChange={handleInputChange} required className="w-full px-4 py-3 bg-white border border-transparent rounded-xl focus:border-[#869dfc] focus:ring-0 text-sm font-bold text-[#140f07] outline-none appearance-none shadow-sm">
                      <option value="">Seleccionar</option>
                      {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Precio ($)</label>
                  <input type="number" name="precio" value={formData.precio} onChange={handleInputChange} step="0.01" min="0.01" required className="w-full px-4 py-3 bg-white border border-transparent rounded-xl focus:border-[#869dfc] focus:ring-0 text-sm font-black text-[#122a4e] outline-none shadow-sm" placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Descripción</label>
                <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 bg-white border border-transparent rounded-xl focus:border-[#869dfc] focus:ring-0 text-sm font-medium outline-none resize-none shadow-sm" placeholder="Detalles del servicio..." />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={handleCloseModal} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-[#4260ad] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#4260ad]/20">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminar */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-xl font-black text-[#140f07] mb-2">¿Eliminar servicio?</h3>
            <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">Esta acción es permanente y no se podrá recuperar la configuración del servicio.</p>
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