"use client"

import { useState } from 'react'
import { User, Calendar, Shield, Lock, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react"
import { toast } from 'react-toastify'

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

  // Validaciones de nueva contraseña
  const passwordValidations: PasswordValidation = {
    minLength: formData.newPassword.length >= 8,
    hasNumber: /\d/.test(formData.newPassword),
    hasUppercase: /[A-Z]/.test(formData.newPassword),
    hasLowercase: /[a-z]/.test(formData.newPassword),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword)
  }

  const isPasswordValid = Object.values(passwordValidations).every(v => v)
  const passwordsMatch = formData.newPassword === formData.confirmPassword && formData.newPassword !== ''
  const isFormValid = formData.oldPassword !== '' && isPasswordValid && passwordsMatch

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (name === 'newPassword' && value.length > 0 && !showValidations) {
      setShowValidations(true)
    }
    if (name === 'newPassword' && value.length === 0) {
      setShowValidations(false)
    }
  }

  const handleSubmitPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isFormValid) {
      toast.error('Por favor, completa todos los campos correctamente')
      return
    }

    if (!usuario?.username) {
      toast.error('No se pudo identificar el usuario')
      return
    }

    setIsChangingPassword(true)

    try {
      const response = await fetch('/api/usuarios/cambiar-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: usuario.username,
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cambiar la contraseña')
      }

      // Éxito
      toast.success('✅ Contraseña cambiada exitosamente!', {
        position: "top-right",
        autoClose: 5000,
      })

      // Cerrar modal y limpiar formulario
      setShowModal(false)
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setShowValidations(false)

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error desconocido', {
        position: "top-right",
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const resetForm = () => {
    setFormData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setShowValidations(false)
    setShowOldPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
  }

  return (
    <>
      {/* Modal para cambiar contraseña */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="bg-linear-to-r from-blue-500 to-blue-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Cambiar Contraseña</h3>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Lock className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              <form onSubmit={handleSubmitPasswordChange} className="space-y-5">
                {/* Contraseña actual */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña actual
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      name="oldPassword"
                      value={formData.oldPassword}
                      onChange={handleInputChange}
                      className="w-full text-sm  px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all pr-12"
                      placeholder="Ingresa tu contraseña actual"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showOldPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Nueva contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="w-full text-sm  px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all pr-12"
                      placeholder="Crea una nueva contraseña"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  {/* Validaciones de contraseña */}
                  {showValidations && (
                    <div className="mt-3 space-y-1.5">
                      <div className="flex flex-wrap gap-2">
                        <div className={`flex items-center space-x-1.5 px-2 py-1 rounded-lg text-xs ${passwordValidations.minLength ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {passwordValidations.minLength ? 
                            <CheckCircle className="h-3 w-3" /> : 
                            <XCircle className="h-3 w-3" />
                          }
                          <span>8+ caracteres</span>
                        </div>
                        <div className={`flex items-center space-x-1.5 px-2 py-1 rounded-lg text-xs ${passwordValidations.hasNumber ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {passwordValidations.hasNumber ? 
                            <CheckCircle className="h-3 w-3" /> : 
                            <XCircle className="h-3 w-3" />
                          }
                          <span>Número</span>
                        </div>
                        <div className={`flex items-center space-x-1.5 px-2 py-1 rounded-lg text-xs ${passwordValidations.hasUppercase ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {passwordValidations.hasUppercase ? 
                            <CheckCircle className="h-3 w-3" /> : 
                            <XCircle className="h-3 w-3" />
                          }
                          <span>Mayúscula</span>
                        </div>
                        <div className={`flex items-center space-x-1.5 px-2 py-1 rounded-lg text-xs ${passwordValidations.hasLowercase ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {passwordValidations.hasLowercase ? 
                            <CheckCircle className="h-3 w-3" /> : 
                            <XCircle className="h-3 w-3" />
                          }
                          <span>Minúscula</span>
                        </div>
                        <div className={`flex items-center space-x-1.5 px-2 py-1 rounded-lg text-xs ${passwordValidations.hasSpecialChar ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {passwordValidations.hasSpecialChar ? 
                            <CheckCircle className="h-3 w-3" /> : 
                            <XCircle className="h-3 w-3" />
                          }
                          <span>Carácter especial</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirmar nueva contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full text-sm  px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-12 ${
                        formData.confirmPassword ? 
                          (passwordsMatch ? 'border-green-500 focus:border-green-500' : 'border-red-500 focus:border-red-500') : 
                          'border-gray-300 focus:border-blue-500'
                      }`}
                      placeholder="Repite la nueva contraseña"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {formData.confirmPassword && (
                    <div className="mt-2 flex items-center space-x-2">
                      {passwordsMatch ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-xs text-green-600">Las contraseñas coinciden</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-xs text-red-600">Las contraseñas no coinciden</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Botones del modal */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                    className="flex-1 py-3 cursor-pointer bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!isFormValid || isChangingPassword}
                    className={`flex-1 py-3 cursor-pointer rounded-xl font-medium transition-all ${
                      isFormValid && !isChangingPassword
                        ? 'bg-linear-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 cursor-pointer'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isChangingPassword ? (
                      <div className="flex  items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Cambiando...
                      </div>
                    ) : (
                      'Aceptar'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Componente principal del perfil */}
      <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-full">
        {/* Header con azul degradado (solo azul) */}
        <div className="bg-linear-to-r from-blue-500 to-blue-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Información del Perfil</h2>
            </div>
            <div className="w-12 ml-4 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <User className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {loading ? (
            <div className="py-10 flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Cargando perfil...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <div className="text-red-500 mb-4">
                <Shield className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all"
              >
                Reintentar
              </button>
            </div>
          ) : usuario ? (
            <div className="space-y-6">

              {/* Campos de información */}
              <div className="space-y-4">
                {/* Username */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-200 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Username</p>
                      <p className="font-medium text-gray-900">{usuario.username}</p>
                    </div>
                  </div>
                </div>

                {/* Cuenta creada */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-200 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Cuenta creada</p>
                      <p className="font-medium text-gray-900">{usuario.fechaCreacionFormateada}</p>
                    </div>
                  </div>
                </div>

                {/* Botón para cambiar contraseña - SEPARADO después de Cuenta creada */}                
                  <button
                    onClick={() => setShowModal(true)}
                    className="w-full py-3 bg-linear-to-r cursor-pointer from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center space-x-2"
                  >
                    <Lock className="h-4 w-4" />
                    <span>Cambiar contraseña</span>
                  </button>
                </div>
              </div>
          ) : null}
        </div>
      </div>
    </>
  )
}