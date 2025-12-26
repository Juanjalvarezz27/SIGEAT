"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

export default function LogoutButton() {
  const handleLogout = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center cursor-pointer gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
    >
      <LogOut className="h-4 w-4" />
      Cerrar Sesión
    </button>
  )
}