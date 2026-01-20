"use client"

import { AlertTriangle, X } from 'lucide-react'

interface ModalConfirmacionProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  titulo: string
  mensaje: string
  confirmarTexto?: string
  cancelarTexto?: string
  esDestructivo?: boolean
  loading?: boolean
}

export default function ModalConfirmacion({
  isOpen,
  onClose,
  onConfirm,
  titulo,
  mensaje,
  confirmarTexto = 'Confirmar',
  cancelarTexto = 'Cancelar',
  esDestructivo = true,
  loading = false
}: ModalConfirmacionProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-100 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del modal */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 min-w-10 min-h-10 aspect-square rounded-xl flex items-center justify-center shrink-0 ${
              esDestructivo ? 'bg-red-500' : 'bg-yellow-500'
            }`}>
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {titulo}
              </h2>
              <p className="text-gray-600 mt-1 text-sm">Confirmación requerida</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="p-6">
          <div className="mb-6">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${
                esDestructivo ? 'bg-red-100' : 'bg-yellow-100'
              } mb-4`}>
                <AlertTriangle className={`h-6 w-6 ${
                  esDestructivo ? 'text-red-600' : 'text-yellow-600'
                }`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {titulo}
              </h3>
              <p className="text-gray-600">{mensaje}</p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              {cancelarTexto}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-3 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
                esDestructivo 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Procesando...' : confirmarTexto}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}