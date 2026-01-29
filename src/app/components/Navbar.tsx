"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu, X, Home, User, CarFront, Users, Settings,
  LogOut, CircleDollarSign
} from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import ModalConfirmacion from './ui/ModalConfirmacion'

interface NavRoute {
  name: string
  path: string
  icon: React.ReactNode
  roles: string[]
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
      icon: <CircleDollarSign className="h-4 w-4" />,
      roles: ['admin'] // Solo admin
    },
    {
      name: 'Monedero',
      path: '/home/monedero',
      icon: <CircleDollarSign  className="h-4 w-4" />,
      roles: ['admin'] // Solo admin
    },
    {
      name: 'Vehiculos',
      path: '/home/vehiculos',
      icon: <CarFront className="h-4 w-4" />,
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
      <nav className="sticky top-0 z-50 w-full bg-[#122a4e] shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-[#4260ad] rounded-xl text-white shadow-lg shadow-[#140f07]/10">
                  <CarFront className="h-6 w-6" />
                </div>
                <span className="text-xl font-bold text-white font-montserrat ml-2">
                  Autolavado
                </span>
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
        isScrolled ? 'bg-[#122a4e]/95 backdrop-blur-sm shadow-md' : 'bg-[#122a4e]'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-[#4260ad] rounded-xl text-white shadow-lg shadow-[#140f07]/10">
                <CarFront className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-white font-montserrat ml-2">
                Autolavado
              </span>

              {/* Badge de rol (opcional) */}
              {showRoleBadge && isAuthenticated && (
                <span className="text-xs px-2 py-1 rounded-full bg-[#4260ad] text-white border border-[#869dfc]/30">
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
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      pathname === route.path
                        ? 'bg-[#4260ad] text-white shadow-md shadow-[#140f07]/20'
                        : 'text-gray-300 hover:bg-[#4260ad]/50 hover:text-white'
                    }`}
                  >
                    {route.icon}
                    {route.name}
                  </Link>
                ))}

                {/* Botón Logout Desktop */}
                <div className="ml-4 border-l border-[#869dfc]/20 pl-4">
                  <button
                    type="button"
                    onClick={() => setShowLogoutModal(true)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#869dfc] hover:bg-[#4260ad]/20 hover:text-white transition-colors"
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
                  className="p-2 rounded-md text-white hover:bg-[#4260ad] transition-colors"
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
              isOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="border-t border-[#869dfc]/20 bg-[#122a4e]">
                <div className="px-2 pt-2 pb-3 space-y-1">
                  {filteredRoutes.map((route) => (
                    <Link
                      key={route.path}
                      href={route.path}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                        pathname === route.path
                          ? 'bg-[#4260ad] text-white shadow-sm'
                          : 'text-gray-300 hover:bg-[#4260ad]/30 hover:text-white'
                      }`}
                      onClick={() => setIsOpen(false)} // Cierra menú al navegar
                    >
                      {route.icon}
                      {route.name}
                    </Link>
                  ))}

                  {/* Botón Logout Móvil */}
                  <div className="border-t border-[#869dfc]/20 pt-2 mt-2 px-3 py-2">
                    <button
                      type="button"
                      onClick={() => setShowLogoutModal(true)}
                      className="flex w-full items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-[#869dfc] hover:bg-[#4260ad]/20 hover:text-white transition-colors"
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