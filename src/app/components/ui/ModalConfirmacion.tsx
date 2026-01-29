"use client"

import { AlertTriangle, Info, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react'

interface ModalConfirmacionProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info' | 'success'
}

export default function ModalConfirmacion({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger'
}: ModalConfirmacionProps) {
  if (!isOpen) return null

  // Configuración de estilos e íconos por tipo
  const typeConfig = {
    danger: {
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700 shadow-red-200',
      mainIcon: <AlertCircle className="h-6 w-6 text-red-600" />,
      watermark: <AlertCircle className="h-32 w-32 text-red-50 opacity-50" />
    },
    warning: {
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      button: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200',
      mainIcon: <AlertTriangle className="h-6 w-6 text-amber-600" />,
      watermark: <AlertTriangle className="h-32 w-32 text-amber-50 opacity-50" />
    },
    info: {
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      button: 'bg-[#4260ad] hover:bg-[#122a4e] shadow-blue-200',
      mainIcon: <Info className="h-6 w-6 text-blue-600" />,
      watermark: <Info className="h-32 w-32 text-blue-50 opacity-50" />
    },
    success: {
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-700 shadow-green-200',
      mainIcon: <CheckCircle2 className="h-6 w-6 text-green-600" />,
      watermark: <CheckCircle2 className="h-32 w-32 text-green-50 opacity-50" />
    }
  }

  // Fallback a 'danger' si el tipo no existe
  const styles = typeConfig[type] || typeConfig.danger

  return (
    <div className="fixed inset-0 z-70 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        
        {/* Overlay: Negro al 50% como solicitaste */}
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        />

        {/* Modal Panel */}
        <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-lg border border-white/20">
          
          {/* Marca de agua decorativa en el fondo */}
          <div className="absolute -top-6 -right-6 pointer-events-none transform rotate-12">
            {styles.watermark}
          </div>

          <div className="relative z-10 bg-white px-6 pb-6 pt-8 sm:p-8">
            <div className="sm:flex sm:items-start">
              {/* Círculo del ícono */}
              <div className={`mx-auto flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${styles.iconBg} sm:mx-0 transition-transform transform hover:scale-105 duration-200`}>
                {styles.mainIcon}
              </div>
              
              <div className="mt-4 text-center sm:ml-5 sm:mt-0 sm:text-left">
                <h3 className="text-xl font-black leading-6 text-[#140f07]">
                  {title}
                </h3>
                <div className="mt-3">
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="bg-[#f8f9fc] px-6 py-4 sm:flex sm:flex-row-reverse sm:px-8 gap-3 border-t border-slate-100">
            <button
              type="button"
              className={`inline-flex w-full justify-center rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg transition-all active:scale-95 sm:w-auto ${styles.button}`}
              onClick={() => {
                onConfirm()
                onClose()
              }}
            >
              {confirmText}
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-xl bg-white border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 active:bg-slate-100 sm:mt-0 sm:w-auto transition-colors"
              onClick={onClose}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}