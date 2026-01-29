"use client"

import { useState } from 'react'
import { ChevronDown, Tag, Layers, Car, Star, Settings2 } from 'lucide-react'
import GestionServicios from './GestionServicios'
import GestionCategorias from './GestionCategorias'
import GestionTiposVehiculo from './GestionTiposVehiculo'
import GestionServiciosExtra from './GestionServiciosExtra'

export default function GestionConfiguracion() {
  const [expanded, setExpanded] = useState({
    servicios: false,
    categorias: false,
    tiposVehiculo: false,
    serviciosExtra: false
  })

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const sections = [
    {
      id: 'servicios' as const,
      title: 'Servicios Base',
      subtitle: 'Configura precios y servicios principales',
      icon: <Tag className="h-5 w-5" />,
      component: <GestionServicios />,
      color: 'text-[#4260ad]',
      bgColor: 'bg-[#e2e2f6]'
    },
    {
      id: 'serviciosExtra' as const,
      title: 'Servicios Extra',
      subtitle: 'Complementos y adicionales para servicios',
      icon: <Star className="h-5 w-5" />,
      component: <GestionServiciosExtra />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      id: 'categorias' as const,
      title: 'Categorías',
      subtitle: 'Agrupación de servicios por jerarquía',
      icon: <Layers className="h-5 w-5" />,
      component: <GestionCategorias />,
      color: 'text-slate-600',
      bgColor: 'bg-slate-100'
    },
    {
      id: 'tiposVehiculo' as const,
      title: 'Tipos de Vehículo',
      subtitle: 'Administra los tamaños y tipos permitidos',
      icon: <Car className="h-5 w-5" />,
      component: <GestionTiposVehiculo />,
      color: 'text-[#122a4e]',
      bgColor: 'bg-slate-200'
    }
  ]

  return (
    <div className="space-y-4">
      {/* Encabezado de la sección */}
      <div className="flex items-center gap-3 px-2 mb-6">
        <Settings2 className="h-5 w-5 text-[#122a4e]" />
        <h2 className="text-sm font-black text-[#122a4e] uppercase tracking-[0.2em]">Panel de Control</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sections.map((section) => (
          <div 
            key={section.id}
            className="bg-white rounded-4xl border border-[#869dfc]/10 shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden transition-all duration-300"
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full p-5 sm:p-6 flex items-center justify-between group transition-colors hover:bg-[#fcfdff]"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${section.bgColor} ${section.color} rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                  {section.icon}
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-black text-[#140f07] leading-none mb-1">
                    {section.title}
                  </h3>
                  <p className="text-xs font-medium text-slate-400">
                    {section.subtitle}
                  </p>
                </div>
              </div>
              <div className={`p-2 rounded-xl bg-[#f4f6fc] text-slate-400 transition-all duration-300 ${expanded[section.id] ? 'rotate-180 bg-[#122a4e] text-white' : ''}`}>
                <ChevronDown className="h-5 w-5" />
              </div>
            </button>

            <div 
              className={`grid transition-all duration-300 ease-in-out ${
                expanded[section.id] ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <div className="p-5 sm:p-8 border-t border-slate-50 bg-[#fcfdff]">
                  {section.component}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}