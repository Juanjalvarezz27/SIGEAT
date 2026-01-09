"use client"

import { useState, useEffect } from 'react'
import {
  UserPlus,
  Key,
  User,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Shield,
  ShieldCheck
} from "lucide-react"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAuth } from '../../hooks/useAuth' 

interface FormData {
  username: string
  password: string
  confirmPassword: string
  role: string // Agregar campo role
}

interface PasswordValidation {
  minLength: boolean
  hasNumber: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasSpecialChar: boolean
}

export default function AgregarUsuario() {
  const { isAdmin } = useAuth() // Usar el hook para obtener si es admin
  
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'usuario' // Valor por defecto CAMBIADO A 'usuario' 👈
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showValidations, setShowValidations] = useState(false)
  const [touchedFields, setTouchedFields] = useState({
    password: false,
    confirmPassword: false
  })

  // Ocultar validaciones cuando la contraseña está vacía
  useEffect(() => {
    if (formData.password.length > 0) {
      setShowValidations(true)
    } else {
      setShowValidations(false)
    }
  }, [formData.password])

  // Validaciones de contraseña
  const passwordValidations: PasswordValidation = {
    minLength: formData.password.length >= 8,
    hasNumber: /\d/.test(formData.password),
    hasUppercase: /[A-Z]/.test(formData.password),
    hasLowercase: /[a-z]/.test(formData.password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
  }

  const isPasswordValid = Object.values(passwordValidations).every(v => v)
  const passwordsMatch = formData.password === formData.confirmPassword && formData.password !== ''
  const isFormValid = formData.username !== '' && isPasswordValid && passwordsMatch

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Marcar campo como "touched" cuando se empieza a escribir
    if (name === 'password' && !touchedFields.password) {
      setTouchedFields(prev => ({ ...prev, password: true }))
    }
    if (name === 'confirmPassword' && !touchedFields.confirmPassword) {
      setTouchedFields(prev => ({ ...prev, confirmPassword: true }))
    }
  }

  const handleBlur = (field: 'password' | 'confirmPassword') => {
    setTouchedFields(prev => ({ ...prev, [field]: true }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFormValid) {
      toast.error('Por favor, completa todos los campos correctamente')
      return
    }

    // Si el usuario no es admin, no debería poder crear usuarios (esto ya debería estar protegido por el middleware)
    if (!isAdmin) {
      toast.error('No tienes permisos para crear usuarios')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password,
          role: formData.role // Enviar el rol seleccionado
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el usuario')
      }

      // Mostrar toast de éxito
      toast.success(`Usuario "${formData.username}" creado exitosamente como ${formData.role === 'admin' ? 'Administrador' : 'Usuario Estándar'}!`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })

      // Limpiar formulario
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
        role: 'usuario' // Resetear a usuario por defecto 👈
      })
      setShowValidations(false)
      setTouchedFields({
        password: false,
        confirmPassword: false
      })

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error desconocido', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para obtener el ícono según el rol
  const getRoleIcon = () => {
    return formData.role === 'admin' ? <ShieldCheck className="h-4 w-4" /> : <User className="h-4 w-4" />
  }

  // Función para obtener el color del badge según el rol
  const getRoleBadgeColor = () => {
    return formData.role === 'admin' 
      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' 
      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
  }

  return (
    <>
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-full">
        {/* Header del Bento */}
        <div className="bg-linear-to-r from-blue-500 to-blue-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Agregar Nuevo Usuario</h2>
              <p className="text-blue-100 text-sm mt-1">
                {isAdmin ? 'Puedes crear usuarios con diferentes roles' : 'No tienes permisos para crear usuarios'}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Contenido del formulario */}
        <div className="p-6">
          {/* Verificar si el usuario actual es admin */}
          {!isAdmin ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Acceso Restringido</h3>
              <p className="text-gray-600 mb-4">Solo los administradores pueden crear nuevos usuarios.</p>
              <p className="text-sm text-gray-500">
                Contacta con un administrador si necesitas crear un nuevo usuario.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Username</span>
                  </div>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full text-sm px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Ingresa el nombre de usuario"
                  required
                />
              </div>

              {/* Campo Rol (solo visible para admins) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Rol del Usuario</span>
                  </div>
                </label>
                <div className="space-y-3">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full text-sm px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="usuario">Usuario Estándar</option>
                    <option value="admin">Administrador</option>
                  </select>
                  
                  {/* Descripción según el rol */}
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-600">
                      {formData.role === 'admin' 
                        ? 'Los administradores tienen acceso completo a todas las funcionalidades del sistema, incluyendo la gestión de usuarios y configuración.'
                        : 'Los usuarios estándar tienen acceso limitado a las funcionalidades básicas del sistema.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Campo Contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Key className="h-4 w-4" />
                    <span>Contraseña</span>
                  </div>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('password')}
                    className="w-full text-sm px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all pr-12"
                    placeholder="Crea una contraseña segura"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Validaciones de contraseña - Solo se muestran cuando hay texto */}
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

              {/* Campo Confirmar Contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('confirmPassword')}
                    className={`w-full px-4 text-sm py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-12 ${
                      touchedFields.confirmPassword && formData.confirmPassword
                        ? (passwordsMatch ? 'border-green-500 focus:border-green-500' : 'border-red-500 focus:border-red-500')
                        : 'border-gray-300 focus:border-blue-500'
                    }`}
                    placeholder="Repite la contraseña"
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

                {/* Mensaje de coincidencia - Solo se muestra cuando hay texto y se ha salido del campo */}
                {touchedFields.confirmPassword && formData.confirmPassword && (
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

              {/* Botón de submit - CON CURSOR POINTER */}
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`w-full py-3.5 rounded-xl font-medium transition-all flex items-center justify-center space-x-2 ${
                  isFormValid && !isSubmitting
                    ? 'bg-linear-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-sm hover:shadow cursor-pointer'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creando usuario...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    <span>Registrar Usuario</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}