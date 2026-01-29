"use client"

import GestionConfiguracion from '../../components/configuracion/GestionConfiguracion'
import { Settings, Sliders } from 'lucide-react'

export default function ConfiguracionPage() {
  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header Principal Estilizado */}
<div className="mb-10">
  {/* Cambiamos flex-col por flex-row siempre, alineando al inicio */}
  <div className="flex flex-row items-start sm:items-center gap-4 sm:gap-6">
    
    {/* Ajustamos el tamaño del icono: más pequeño en móvil, grande en desktop */}
    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#122a4e] rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl shadow-[#122a4e]/20 shrink-0">
      <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
    </div>

    <div className="min-w-0 flex-1">
      {/* Reducimos un poco el texto en móvil para que no rompa la línea */}
      <h1 className="text-2xl sm:text-3xl font-black text-[#140f07] tracking-tight leading-tight">
        Configuración
      </h1>
      
      {/* El párrafo ahora fluye mejor al estar al lado */}
      <p className="text-xs sm:text-sm font-medium text-[#122a4e]/60 flex items-center gap-1.5 mt-0.5 sm:mt-1">
        <Sliders className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate sm:whitespace-normal">
          Administra servicios y categorías
        </span>
      </p>
    </div>

  </div>
</div>
        {/* Componente principal con los acordeones optimizados */}
        <div className="space-y-6">
          <GestionConfiguracion />
        </div>

      </div>
    </div>
  )
}