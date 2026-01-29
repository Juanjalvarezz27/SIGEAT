"use client"

import { useState } from 'react'
import { Users, UserPlus, Shield } from "lucide-react"
import AgregarUsuarioBento from '../../components/perfil/AgregarUsuario'
import ListaUsuarios from '../../components/perfil/ListaUsuarios'

export default function Usuarios() {
  const [activeTab, setActiveTab] = useState<'lista' | 'agregar'>('lista')

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header Principal */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-[#122a4e] rounded-3xl flex items-center justify-center shadow-xl shadow-[#122a4e]/20 shrink-0">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#140f07] tracking-tight">
                Gestión de Usuarios
              </h1>
              <p className="text-sm font-medium text-[#122a4e]/60 flex items-center gap-2">
                <Shield className="h-3.5 w-3.5" />
                Control de acceso y permisos del sistema
              </p>
            </div>
          </div>

          {/* Tabs de Navegación Estilizados */}
          <div className="bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl border border-white/40 shadow-sm flex w-full lg:w-auto">
            <button
              onClick={() => setActiveTab('lista')}
              className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                activeTab === 'lista'
                  ? 'bg-[#122a4e] text-white shadow-lg shadow-[#122a4e]/20'
                  : 'text-slate-500 hover:text-[#122a4e] hover:bg-white/50'
              }`}
            >
              <Users className="h-4 w-4" />
              Lista de Usuarios
            </button>
            <button
              onClick={() => setActiveTab('agregar')}
              className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                activeTab === 'agregar'
                  ? 'bg-[#4260ad] text-white shadow-lg shadow-[#4260ad]/20'
                  : 'text-slate-500 hover:text-[#4260ad] hover:bg-white/50'
              }`}
            >
              <UserPlus className="h-4 w-4" />
              Nuevo Usuario
            </button>
          </div>
        </div>

        {/* Contenido Dinámico */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeTab === 'lista' ? (
            <div className="space-y-6">
              <div className="bg-white rounded-4xl border border-[#869dfc]/10 shadow-sm overflow-hidden p-6 sm:p-8">
                <ListaUsuarios />
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              
              <div className="bg-white rounded-[2.5rem] border border-[#869dfc]/10 shadow-xl shadow-[#122a4e]/5 overflow-hidden p-1">
                <AgregarUsuarioBento />
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}