"use client"

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronUp, Settings, Tag, Layers } from 'lucide-react'
import GestionServicios from './GestionServicios'
import GestionCategorias from './GestionCategorias'

export default function GestionConfiguracion() {
  // Estado inicial: ambos desplegables cerrados
  const [expanded, setExpanded] = useState({
    servicios: false,
    categorias: false
  })

  const [heights, setHeights] = useState({
    servicios: '0px',
    categorias: '0px'
  })

  const serviciosRef = useRef<HTMLDivElement>(null)
  const categoriasRef = useRef<HTMLDivElement>(null)

  const toggleSection = (section: 'servicios' | 'categorias') => {
    setExpanded(prev => {
      const newState = !prev[section]
      
      // Actualizar altura después de un breve delay para que React actualice el DOM
      setTimeout(() => {
        if (section === 'servicios' && serviciosRef.current) {
          setHeights(prev => ({
            ...prev,
            servicios: newState ? `${serviciosRef.current!.scrollHeight}px` : '0px'
          }))
        } else if (section === 'categorias' && categoriasRef.current) {
          setHeights(prev => ({
            ...prev,
            categorias: newState ? `${categoriasRef.current!.scrollHeight}px` : '0px'
          }))
        }
      }, 10)
      
      return {
        ...prev,
        [section]: newState
      }
    })
  }

  // Actualizar alturas cuando cambia el contenido
  useEffect(() => {
    if (expanded.servicios && serviciosRef.current) {
      setHeights(prev => ({
        ...prev,
        servicios: `${serviciosRef.current!.scrollHeight}px`
      }))
    }
    if (expanded.categorias && categoriasRef.current) {
      setHeights(prev => ({
        ...prev,
        categorias: `${categoriasRef.current!.scrollHeight}px`
      }))
    }
  }, [expanded.servicios, expanded.categorias])

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 space-y-4">

        {/* Desplegable - Servicios */}
        <div className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-sm">
          <button
            onClick={() => toggleSection('servicios')}
            className="w-full px-5 py-4 bg-linear-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Tag className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">Servicios</h3>
              </div>
            </div>
            <div className={`transform transition-transform duration-300 ${expanded.servicios ? 'rotate-180' : ''}`}>
              {expanded.servicios ? (
                <ChevronUp className="h-5 w-5 text-blue-600" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500 group-hover:text-blue-500" />
              )}
            </div>
          </button>
          
          {/* Contenido con animación de altura */}
          <div 
            ref={serviciosRef}
            style={{ 
              maxHeight: heights.servicios,
              overflow: 'hidden'
            }}
            className="transition-all duration-300 ease-in-out"
          >
            <div className="p-5 border-t border-gray-200">
              <GestionServicios />
            </div>
          </div>
        </div>

        {/* Desplegable - Categorías */}
        <div className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-sm">
          <button
            onClick={() => toggleSection('categorias')}
            className="w-full px-5 py-4 bg-linear-to-r from-indigo-50 to-purple-100 hover:from-indigo-100 hover:to-purple-200 transition-all duration-300 flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Layers className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors duration-300">Categorías</h3>
              </div>
            </div>
            <div className={`transform transition-transform duration-300 ${expanded.categorias ? 'rotate-180' : ''}`}>
              {expanded.categorias ? (
                <ChevronUp className="h-5 w-5 text-indigo-600" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500 group-hover:text-indigo-500" />
              )}
            </div>
          </button>
          
          {/* Contenido con animación de altura */}
          <div 
            ref={categoriasRef}
            style={{ 
              maxHeight: heights.categorias,
              overflow: 'hidden'
            }}
            className="transition-all duration-300 ease-in-out"
          >
            <div className="p-5 border-t border-gray-200">
              <GestionCategorias />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}