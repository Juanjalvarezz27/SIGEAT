"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Home, User, Car, Droplets, Users, Car as CarIcon } from 'lucide-react'
import LogoutButton from './login/LogoutButton'
import { useSession } from 'next-auth/react'

interface NavRoute {
  name: string
  path: string
  icon: React.ReactNode
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const isLoading = status === 'loading'

  // Definir las rutas con iconos - solo se muestran cuando hay sesión
  const routes: NavRoute[] = [
    { name: 'Inicio', path: '/home', icon: <Home className="h-4 w-4" /> },
    { name: 'Usuarios', path: '/home/usuarios', icon: <Users className="h-4 w-4" /> },
    { name: 'Perfil', path: '/home/perfil', icon: <User className="h-4 w-4" /> },
    // Agrega más rutas aquí según necesites
  ]

  // Efecto para cerrar el menú al cambiar de ruta
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Efecto para el scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Manejar apertura/cierre del menú con animación
  const handleMenuToggle = () => {
    if (!isOpen) {
      setIsOpen(true)
      setIsAnimating(true)
    } else {
      setIsAnimating(false)
      setTimeout(() => setIsOpen(false), 300) // Espera a que termine la animación
    }
  }

  // Si está cargando, mostrar un navbar básico
  if (isLoading) {
    return (
      <nav className="sticky top-0 z-50 w-full bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="relative flex items-center justify-center">
                  <div className="relative">
                    {/* Icono de carro con efecto de agua */}
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

  return (
    <nav className={`sticky top-0 z-50 w-full transition-all duration-200 ${
      isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-white'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y nombre - siempre visible pero NO clickable */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center">
              {/* Logo con icono de carro y efectos de limpieza */}
              <div className="relative">
                <Car className="h-8 w-8 text-blue-600" />
                <Droplets className="h-4 w-4 text-blue-400 absolute -top-1 -right-1" />
              </div>
              <span className="text-xl font-bold text-gray-900 font-montserrat ml-4">
                Autolavado
              </span>
            </div>
          </div>

          {/* Menú Desktop - solo cuando hay sesión */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-1">
              {routes.map((route) => (
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
              
              {/* Botón de logout */}
              <div className="ml-4 border-l pl-4">
                <LogoutButton />
              </div>
            </div>
          )}

          {/* Botón menú móvil - solo cuando hay sesión */}
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

        {/* Menú Móvil con animación - solo cuando hay sesión */}
        {isAuthenticated && (
          <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="border-t border-gray-100">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {routes.map((route) => (
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
                
                {/* Sección de logout móvil */}
                <div className="border-t border-gray-100 pt-2 mt-2 px-3 py-2">
                  <LogoutButton />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}