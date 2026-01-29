"use client"

import { AlertTriangle, X, Loader2 } from 'lucide-react'

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
      className="fixed inset-0 z-100 bg-black/50 flex items-center justify-center p-4 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-[#f8f9fc] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-white/20 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header optimizado */}
        <div className="bg-white border-b border-[#122a4e]/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              esDestructivo ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'
            }`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#140f07] leading-tight">
                {titulo}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-xl hover:bg-[#e2e2f6] text-[#122a4e]/50 hover:text-[#122a4e] transition-colors disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <div className="mb-8">
            <p className="text-slate-600 font-medium leading-relaxed text-center sm:text-left">
              {mensaje}
            </p>
          </div>

          {/* Botones estilo App */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:flex-1 px-6 py-3.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 active:bg-slate-100 transition-colors disabled:opacity-50"
            >
              {cancelarTexto}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`w-full sm:flex-1 px-6 py-3.5 font-bold text-white rounded-2xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                esDestructivo 
                  ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' 
                  : 'bg-[#4260ad] hover:bg-[#122a4e] shadow-[#4260ad]/20'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                confirmarTexto
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}