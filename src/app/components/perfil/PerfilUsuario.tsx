"use client"

import { useState } from 'react'
import { User, Calendar, Lock, Eye, EyeOff, CheckCircle, XCircle, ShieldCheck, Key } from "lucide-react"
import { toast } from 'react-toastify'
import { useAuth } from '../../hooks/useAuth' 

interface PerfilUsuarioProps {
  usuario: {
    username: string
    fechaCreacionFormateada: string
  } | null
  loading: boolean
  error: string | null
  onRetry: () => void
}

interface CambioPasswordForm {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

interface PasswordValidation {
  minLength: boolean
  hasNumber: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasSpecialChar: boolean
}

export default function PerfilUsuario({
  usuario,
  loading,
  error,
  onRetry
}: PerfilUsuarioProps) {
  const { getRoleDisplayName } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [formData, setFormData] = useState<CambioPasswordForm>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showValidations, setShowValidations] = useState(false)
  const [showSamePasswordError, setShowSamePasswordError] = useState(false)

  const passwordValidations: PasswordValidation = {
    minLength: formData.newPassword.length >= 8,
    hasNumber: /\d/.test(formData.newPassword),
    hasUppercase: /[A-Z]/.test(formData.newPassword),
    hasLowercase: /[a-z]/.test(formData.newPassword),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword)
  }

  const isPasswordValid = Object.values(passwordValidations).every(v => v)
  const passwordsMatch = formData.newPassword === formData.confirmPassword && formData.newPassword !== ''
  const isSamePassword = formData.oldPassword === formData.newPassword && formData.oldPassword !== ''
  const isFormValid = formData.oldPassword !== '' && isPasswordValid && passwordsMatch && !isSamePassword

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (name === 'newPassword') {
      setShowValidations(value.length > 0)
    }

    if (name === 'newPassword' || name === 'oldPassword') {
      if (formData.oldPassword && formData.newPassword && formData.oldPassword === formData.newPassword) {
        setShowSamePasswordError(true)
      } else {
        setShowSamePasswordError(false)
      }
    }
  }

  const handleSubmitPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFormValid) {
      if (isSamePassword) {
        toast.error('La nueva contraseña no puede ser igual a la actual', { position: "top-right" })
      } else {
        toast.error('Por favor, completa todos los campos correctamente', { position: "top-right" })
      }
      return
    }

    if (!usuario?.username) {
      toast.error('No se pudo identificar el usuario', { position: "top-right" })
      return
    }

    setIsChangingPassword(true)

    try {
      const response = await fetch('/api/usuarios/cambiar-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usuario.username,
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('La contraseña actual es incorrecta.', { position: "top-right" })
        } else {
          toast.error(data.error || 'Error al cambiar la contraseña', { position: "top-right" })
        }
        return
      }

      toast.success('¡Contraseña cambiada exitosamente!', { position: "top-right" })
      setShowModal(false)
      resetForm()

    } catch (error) {
      toast.error('Error de conexión.', { position: "top-right" })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const resetForm = () => {
    setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' })
    setShowValidations(false)
    setShowSamePasswordError(false)
    setShowOldPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    resetForm()
  }

  return (
    <>
      {/* Modal Cambio de Contraseña */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#122a4e]/60 backdrop-blur-sm">
          <div className="bg-[#fcfdff] rounded-4xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-white/20 animate-in zoom-in-95 duration-200">
            {/* Header del modal */}
            <div className="bg-white px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#e2e2f6] rounded-xl text-[#4260ad]">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#140f07]">Cambiar Contraseña</h3>
                  <p className="text-xs font-medium text-slate-400">Actualiza tus credenciales de acceso</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmitPasswordChange} className="space-y-5">
                {/* Contraseña Actual */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5">Actual</label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      name="oldPassword"
                      value={formData.oldPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-transparent rounded-xl focus:border-[#4260ad] focus:ring-0 text-sm font-bold text-[#140f07] outline-none shadow-sm"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#4260ad]"
                    >
                      {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Nueva Contraseña */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5">Nueva</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-white border border-transparent rounded-xl focus:ring-0 text-sm font-bold text-[#140f07] outline-none shadow-sm ${
                        showSamePasswordError ? 'border-red-500 text-red-600' : 'focus:border-[#4260ad]'
                      }`}
                      placeholder="Nueva contraseña segura"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#4260ad]"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {showSamePasswordError && (
                    <div className="mt-2 flex items-center gap-1.5 text-red-500">
                      <XCircle className="h-3.5 w-3.5" />
                      <span className="text-xs font-bold">No puede ser igual a la actual</span>
                    </div>
                  )}

                  {showValidations && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-bold ${passwordValidations.minLength ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                        {passwordValidations.minLength ? <CheckCircle className="h-3 w-3" /> : <div className="w-1.5 h-1.5 bg-slate-300 rounded-full mx-0.5"></div>} 8+ Caracteres
                      </div>
                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-bold ${passwordValidations.hasNumber ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                        {passwordValidations.hasNumber ? <CheckCircle className="h-3 w-3" /> : <div className="w-1.5 h-1.5 bg-slate-300 rounded-full mx-0.5"></div>} Número
                      </div>
                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-bold ${passwordValidations.hasUppercase ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                        {passwordValidations.hasUppercase ? <CheckCircle className="h-3 w-3" /> : <div className="w-1.5 h-1.5 bg-slate-300 rounded-full mx-0.5"></div>} Mayúscula
                      </div>
                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-bold ${passwordValidations.hasSpecialChar ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                        {passwordValidations.hasSpecialChar ? <CheckCircle className="h-3 w-3" /> : <div className="w-1.5 h-1.5 bg-slate-300 rounded-full mx-0.5"></div>} Símbolo
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirmar */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5">Confirmar</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-white border border-transparent rounded-xl focus:ring-0 text-sm font-bold text-[#140f07] outline-none shadow-sm ${
                        formData.confirmPassword && !passwordsMatch ? 'border-red-500 text-red-600' : 'focus:border-[#4260ad]'
                      }`}
                      placeholder="Repite la contraseña"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#4260ad]"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isChangingPassword}
                    className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!isFormValid || isChangingPassword}
                    className={`flex-1 py-3 bg-[#4260ad] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#4260ad]/20 transition-all ${
                      !isFormValid || isChangingPassword ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#122a4e]'
                    }`}
                  >
                    {isChangingPassword ? 'Guardando...' : 'Confirmar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tarjeta de Perfil */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-[#869dfc]/10 overflow-hidden h-full">
        {/* Header Visual */}
        <div className="bg-[#122a4e] p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Ficha de Usuario</h2>
              <p className="text-[#869dfc] text-sm font-medium mt-1">Datos personales y seguridad</p>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
              <User className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-8 bg-[#fcfdff]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-[#4260ad] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cargando...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <ShieldCheck className="h-10 w-10 text-red-400 mx-auto mb-3" />
              <p className="text-slate-600 font-medium mb-4">{error}</p>
              <button onClick={onRetry} className="px-6 py-2 bg-[#122a4e] text-white rounded-xl font-bold text-sm">Reintentar</button>
            </div>
          ) : usuario ? (
            <div className="space-y-6">
              
              {/* Username Field */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-[#f4f6fc] rounded-xl flex items-center justify-center text-[#122a4e]">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuario</p>
                  <p className="text-lg font-bold text-[#140f07]">{usuario.username}</p>
                </div>
              </div>

              {/* Rol Field */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-[#e2e2f6] rounded-xl flex items-center justify-center text-[#4260ad]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nivel de Acceso</p>
                  <p className="text-lg font-bold text-[#140f07]">{getRoleDisplayName()}</p>
                </div>
              </div>

              {/* Fecha Creación */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Miembro desde</p>
                  <p className="text-lg font-bold text-[#140f07]">{usuario.fechaCreacionFormateada}</p>
                </div>
              </div>

              {/* Acción Cambiar Contraseña */}
              <button
                onClick={() => setShowModal(true)}
                className="w-full py-4 mt-4 bg-[#122a4e] hover:bg-[#0f2240] text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-[#122a4e]/20 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Key className="h-4 w-4" />
                Actualizar Contraseña
              </button>

            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}