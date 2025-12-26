"use client"

import { Lock, User, AlertCircle, Loader2 } from "lucide-react"

export default function Perfil() {

  return (

          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">PERFILLL</h1>
            <p className="text-gray-600 mt-2">Sistema de Gestión de Vehículos</p>
          </div>

  )
}