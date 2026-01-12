"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu, X, Home, User, Car, Droplets, Users, Settings,
  ChartColumnDecreasing as CarIcon, ChartColumnDecreasing,
  LogOut
} from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import ModalConfirmacion from './ui/ModalConfirmacion'

interface NavRoute {
  name: string
  path: string
  icon: React.ReactNode
  roles: string[] // Roles permitidos para esta ruta
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [filteredRoutes, setFilteredRoutes] = useState<NavRoute[]>([])

  const pathname = usePathname()
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const isLoading = status === 'loading'
  const userRole = session?.user?.role || 'usuario'

  // Definir todas las rutas con sus roles permitidos
  const allRoutes: NavRoute[] = [
    { 
      name: 'Inicio', 
      path: '/home', 
      icon: <Home className="h-4 w-4" />,
      roles: ['admin', 'usuario'] 
    },
    { 
      name: 'Estadisticas', 
      path: '/home/estadisticas', 
      icon: <ChartColumnDecreasing className="h-4 w-4" />,
      roles: ['admin'] // Solo admin
    },
    { 
      name: 'Vehiculos', 
      path: '/home/vehiculos', 
      icon: <Car className="h-4 w-4" />,
      roles: ['admin'] // Solo admin
    },
    { 
      name: 'Configuracion', 
      path: '/home/configuracion', 
      icon: <Settings className="h-4 w-4" />,
      roles: ['admin'] // Solo admin
    },
    { 
      name: 'Usuarios', 
      path: '/home/usuarios', 
      icon: <Users className="h-4 w-4" />,
      roles: ['admin'] // Solo admin
    },
    { 
      name: 'Perfil', 
      path: '/home/perfil', 
      icon: <User className="h-4 w-4" />,
      roles: ['admin', 'usuario'] 
    },
  ]

  // Filtrar rutas basadas en el rol del usuario
  useEffect(() => {
    if (userRole) {
      const filtered = allRoutes.filter(route => 
        route.roles.includes(userRole)
      )
      setFilteredRoutes(filtered)
    }
  }, [userRole])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleMenuToggle = () => {
    if (!isOpen) {
      setIsOpen(true)
      setIsAnimating(true)
    } else {
      setIsAnimating(false)
      setTimeout(() => setIsOpen(false), 300)
    }
  }

  const handleLogoutConfirm = () => {
    signOut({ callbackUrl: '/' })
  }

  if (isLoading) {
    return (
      <nav className="sticky top-0 z-50 w-full bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="relative flex items-center justify-center">
                  <div className="relative">
                    <CarIcon className="h-8 w-8 text-blue-600" />
                    <Droplets className="h-4 w-4 text-blue-400 absolute -top-1 -right-1" />
                  </div>
                  <span className="text-xl font-bold text-gray-900 font-montserrat ml-4">
                    Autolavado
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  // Mostrar rol actual (opcional, para depuración)
  const showRoleBadge = false

  return (
    <>
      <nav className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-white'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative flex items-center justify-center">
                <div className="relative">
                  <Car className="h-8 w-8 text-blue-600" />
                  <Droplets className="h-4 w-4 text-blue-400 absolute -top-1 -right-1" />
                </div>
                <span className="text-xl font-bold text-gray-900 font-montserrat ml-4">
                  Autolavado
                </span>
              </div>
              
              {/* Badge de rol (opcional) */}
              {showRoleBadge && isAuthenticated && (
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                  {userRole}
                </span>
              )}
            </div>

            {/* Menú Desktop */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-1">
                {filteredRoutes.map((route) => (
                  <Link
                    key={route.path}
                    href={route.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === route.path
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {route.icon}
                    {route.name}
                  </Link>
                ))}

                {/* Botón Logout Desktop */}
                <div className="ml-4 border-l pl-4">
                  <button
                    type="button"
                    onClick={() => setShowLogoutModal(true)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Salir</span>
                  </button>
                </div>
              </div>
            )}

            {/* Botón menú móvil */}
            {isAuthenticated && (
              <div className="md:hidden">
                <button
                  onClick={handleMenuToggle}
                  className="p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label="Toggle menu"
                >
                  {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            )}
          </div>

          {/* Menú Móvil */}
          {isAuthenticated && (
            <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="border-t border-gray-100">
                <div className="px-2 pt-2 pb-3 space-y-1">
                  {filteredRoutes.map((route) => (
                    <Link
                      key={route.path}
                      href={route.path}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                        pathname === route.path
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {route.icon}
                      {route.name}
                    </Link>
                  ))}

                  {/* Botón Logout Móvil */}
                  <div className="border-t border-gray-100 pt-2 mt-2 px-3 py-2">
                    <button
                      type="button"
                      onClick={() => setShowLogoutModal(true)}
                      className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Modal de Confirmación */}
      <ModalConfirmacion
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        title="Cerrar Sesión"
        message="¿Estás seguro de que deseas cerrar sesión?"
        confirmText="Cerrar Sesión"
        cancelText="Cancelar"
        type="danger"
      />
    </>
  )
}