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
  role: string
}

interface PasswordValidation {
  minLength: boolean
  hasNumber: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasSpecialChar: boolean
}

export default function AgregarUsuario() {
  const { isAdmin } = useAuth()
  
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'usuario'
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showValidations, setShowValidations] = useState(false)
  const [touchedFields, setTouchedFields] = useState({
    password: false,
    confirmPassword: false
  })

  useEffect(() => {
    if (formData.password.length > 0) {
      setShowValidations(true)
    } else {
      setShowValidations(false)
    }
  }, [formData.password])

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
          role: formData.role
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el usuario')
      }

      toast.success(`Usuario "${formData.username}" creado exitosamente como ${formData.role === 'admin' ? 'Administrador' : 'Usuario Estándar'}!`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })

      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
        role: 'usuario'
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

  return (
    <>
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

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-[#869dfc]/10 overflow-hidden h-full">
        {/* Header del Bento con colores del sistema */}
        <div className="bg-[#122a4e] p-8 relative overflow-hidden">
          {/* Elemento decorativo de fondo */}
          <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 transform translate-x-8"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Nuevo Usuario</h2>
              <p className="text-[#869dfc] text-sm mt-1 font-medium">
                {isAdmin ? 'Crea credenciales de acceso seguras' : 'Acceso restringido'}
              </p>
            </div>
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-inner border border-white/10">
              <UserPlus className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        {/* Contenido del formulario */}
        <div className="p-8 bg-[#fcfdff]">
          {!isAdmin ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
                <Shield className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-[#140f07] mb-2">Acceso Restringido</h3>
              <p className="text-slate-500 mb-6 font-medium">Solo los administradores pueden crear nuevos usuarios.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-[#122a4e] uppercase tracking-widest mb-2 ml-1">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5" />
                    Username
                  </div>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full text-sm px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-[#4260ad] focus:ring-4 focus:ring-[#4260ad]/10 outline-none transition-all font-medium text-[#140f07] placeholder-slate-400"
                  placeholder="Ej: operador_caja"
                  required
                />
              </div>

              {/* Rol */}
              <div>
                <label className="block text-xs font-bold text-[#122a4e] uppercase tracking-widest mb-2 ml-1">
                  <div className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5" />
                    Nivel de Acceso
                  </div>
                </label>
                <div className="space-y-4">
                  <div className="relative">
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full text-sm px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-[#4260ad] focus:ring-4 focus:ring-[#4260ad]/10 outline-none transition-all appearance-none font-bold text-[#140f07] cursor-pointer"
                    >
                      <option value="usuario">Usuario Estándar</option>
                      <option value="admin">Administrador</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                      {formData.role === 'admin' ? <ShieldCheck className="h-5 w-5 text-[#4260ad]" /> : <User className="h-5 w-5 text-slate-400" />}
                    </div>
                  </div>
                  
                  <div className={`rounded-xl p-4 text-sm font-medium border ${formData.role === 'admin' ? 'bg-[#e2e2f6] text-[#122a4e] border-[#869dfc]/20' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                    <p>
                      {formData.role === 'admin' 
                        ? '⚡ Acceso total: Gestión de usuarios, configuración del sistema y reportes financieros completos.'
                        : '👤 Acceso limitado: Registro de operaciones básicas y consulta de movimientos diarios.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-xs font-bold text-[#122a4e] uppercase tracking-widest mb-2 ml-1">
                  <div className="flex items-center gap-2">
                    <Key className="h-3.5 w-3.5" />
                    Contraseña
                  </div>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('password')}
                    className="w-full text-sm px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-[#4260ad] focus:ring-4 focus:ring-[#4260ad]/10 outline-none transition-all pr-12 font-medium placeholder-slate-400"
                    placeholder="Mínimo 8 caracteres"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-[#4260ad] transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Validaciones */}
                {showValidations && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold border ${passwordValidations.minLength ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                      {passwordValidations.minLength ? <CheckCircle className="h-3.5 w-3.5" /> : <div className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-1 mr-1"></div>}
                      <span>8+ Caracteres</span>
                    </div>
                    <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold border ${passwordValidations.hasNumber ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                      {passwordValidations.hasNumber ? <CheckCircle className="h-3.5 w-3.5" /> : <div className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-1 mr-1"></div>}
                      <span>Número</span>
                    </div>
                    <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold border ${passwordValidations.hasUppercase ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                      {passwordValidations.hasUppercase ? <CheckCircle className="h-3.5 w-3.5" /> : <div className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-1 mr-1"></div>}
                      <span>Mayúscula</span>
                    </div>
                    <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold border ${passwordValidations.hasLowercase ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                      {passwordValidations.hasLowercase ? <CheckCircle className="h-3.5 w-3.5" /> : <div className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-1 mr-1"></div>}
                      <span>Minúscula</span>
                    </div>
                    <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold border col-span-2 ${passwordValidations.hasSpecialChar ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                      {passwordValidations.hasSpecialChar ? <CheckCircle className="h-3.5 w-3.5" /> : <div className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-1 mr-1"></div>}
                      <span>Carácter Especial (!@#$...)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label className="block text-xs font-bold text-[#122a4e] uppercase tracking-widest mb-2 ml-1">
                  Confirmar
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('confirmPassword')}
                    className={`w-full text-sm px-5 py-3.5 bg-white border rounded-2xl outline-none transition-all pr-12 font-medium ${
                      touchedFields.confirmPassword && formData.confirmPassword
                        ? (passwordsMatch ? 'border-emerald-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10' : 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10')
                        : 'border-slate-200 focus:border-[#4260ad] focus:ring-4 focus:ring-[#4260ad]/10'
                    }`}
                    placeholder="Repite la contraseña"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-[#4260ad] transition-colors p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {touchedFields.confirmPassword && formData.confirmPassword && (
                  <div className="mt-2 ml-1 flex items-center space-x-2">
                    {passwordsMatch ? (
                      <>
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-xs font-bold text-emerald-600">Coinciden correctamente</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3.5 w-3.5 text-red-500" />
                        <span className="text-xs font-bold text-red-600">No coinciden</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Botón Submit */}
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center space-x-2 shadow-lg active:scale-[0.98] ${
                  isFormValid && !isSubmitting
                    ? 'bg-[#4260ad] hover:bg-[#122a4e] text-white shadow-[#4260ad]/25 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    <span>Crear Usuario</span>
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