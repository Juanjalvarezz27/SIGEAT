"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { CarFront, User, AlertCircle, Loader2, Eye, EyeOff, KeyRound } from "lucide-react"

export default function LoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Usuario o contraseña incorrectos")
      } else {
        router.push("/home")
        router.refresh()
      }
    } catch (error) {
      setError("Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(18,42,78,0.08)] p-8 border border-[#869dfc]/20">
          <div className="flex flex-col items-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#122a4e] rounded-2xl shadow-lg shadow-[#4260ad]/20 mb-5 transform -rotate-3">
              <CarFront className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-black text-[#140f07] tracking-tight">Autolavado</h1>
            <p className="text-[#4260ad] font-medium text-sm mt-1">Sistema de Gestión</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                <span className="text-sm font-semibold text-red-800">{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#122a4e] uppercase tracking-wider ml-1 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3.5 bg-[#f4f6fc] border-2 border-transparent rounded-xl focus:bg-white focus:border-[#869dfc] focus:ring-0 text-[#140f07] placeholder-[#122a4e]/30 font-medium outline-none transition-all duration-200"
                placeholder="Ingresa tu usuario"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#122a4e] uppercase tracking-wider ml-1 flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5" />
                Contraseña
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 pr-12 bg-[#f4f6fc] border-2 border-transparent rounded-xl focus:bg-white focus:border-[#869dfc] focus:ring-0 text-[#140f07] placeholder-[#122a4e]/30 font-medium outline-none transition-all duration-200"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#869dfc] hover:text-[#4260ad] focus:outline-none transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 bg-[#4260ad] hover:bg-[#122a4e] text-white font-bold rounded-xl shadow-lg shadow-[#4260ad]/30 hover:shadow-xl hover:shadow-[#122a4e]/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Accediendo...</span>
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}