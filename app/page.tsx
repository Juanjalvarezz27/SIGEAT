// page principal
"use client";

import { useState, useEffect, useRef } from 'react';
import { Car, DollarSign, Wallet, Plus, CalendarDays } from 'lucide-react';
import StatCard from '@/components/StatCard';
import CarList from '@/components/CarList';
import AddCarModal from '@/components/AddCarModal';
import WeeklyChart from '@/components/WeeklyChart';
import { listaCarros as datosIniciales } from '@/data/mockData';

export default function Home() {
  const [carros, setCarros] = useState(datosIniciales);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  // Calcular altura del header después del render inicial
  useEffect(() => {
    if (headerRef.current) {
      const height = headerRef.current.offsetHeight;
      setHeaderHeight(height);
    }
  }, [carros]); // Recalcular cuando cambien los carros (conteos)

  const handleUpdateEstado = (id: number, nuevoEstado: 'Pagado' | 'Pendiente' | 'En Proceso') => {
    setCarros(carros.map(carro => 
      carro.id === id ? { ...carro, estado: nuevoEstado } : carro
    ));
  };

  const totalIngresos = carros
    .filter(c => c.estado === 'Pagado')
    .reduce((acc, curr) => acc + curr.precio, 0);

  const totalPorCobrar = carros
    .filter(c => c.estado !== 'Pagado')
    .reduce((acc, curr) => acc + curr.precio, 0);

  const pendientesCount = carros.filter(c => c.estado === 'Pendiente').length;
  const enProcesoCount = carros.filter(c => c.estado === 'En Proceso').length;
  const pagadosCount = carros.filter(c => c.estado === 'Pagado').length;

  const handleAddCar = (nuevoCarro: any) => {
    setCarros([nuevoCarro, ...carros]);
  };

  const fechaHoy = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'short' 
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header fijo */}
      <header 
        ref={headerRef}
        className="top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-700 px-6 pt-8 pb-4 shadow-xl border-b border-blue-800/20 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/80 text-sm font-medium capitalize flex items-center gap-1">
                <CalendarDays size={14}/> {fechaHoy}
              </p>
              <h1 className="text-xl font-extrabold text-white tracking-tight">
                Gestión de Vehículos <span className="animate-pulse">🚗</span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-white/80 text-xs">Cliente Demo</p>
                <p className="text-white font-bold text-sm">Taller Automotriz</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center text-white font-bold border-2 border-white/30 backdrop-blur-sm">
                TA
              </div>
            </div>
          </div>
          
          {/* Mini estadísticas en el header */}
          <div className="flex items-center gap-4 mt-3 text-white/90 text-xs font-semibold">
            <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>{pagadosCount} Pagados</span>
            </div>
            <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span>{enProcesoCount} Proceso</span>
            </div>
            <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span>{pendientesCount} Pendientes</span>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal con padding-top dinámico */}
      <main className='mt-4'>
        
        {/* Sección de Balance */}
        <section className="mb-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-end mb-3 px-1">
            <h2 className="text-lg font-bold text-slate-800">Balance del Día</h2>
            <span className="text-xs text-slate-500 font-medium">
              Total: {carros.length} vehículos
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <StatCard
              title="Dinero en Caja"
              value={`$ ${totalIngresos.toFixed(2)}`}
              icon={DollarSign}
              color="green"
            />

            <div className="grid grid-cols-2 gap-3">
              <StatCard
                title="Vehículos"
                value={`${carros.length}`}
                icon={Car}
                color="blue"
                subtitle={`${enProcesoCount + pendientesCount} activos`}
              />
              <StatCard
                title="Por Cobrar"
                value={`$ ${totalPorCobrar.toFixed(2)}`}
                icon={Wallet}
                color="red"
              />
            </div>
          </div>
        </section>

        {/* Gráfica Semanal */}
        <section className="mb-8">
          <WeeklyChart />
        </section>

        {/* Lista de Vehículos */}
        <section>
          <div className="flex justify-between items-end mb-4 px-1">
            <h2 className="text-lg font-bold text-slate-800">Vehículos en Patio</h2>
            <span className="text-xs text-slate-400 font-medium bg-white px-2 py-1 rounded-full border border-slate-100 shadow-sm">
              En tiempo real
            </span>
          </div>

          <CarList 
            carros={carros} 
            onUpdateEstado={handleUpdateEstado}
          />
        </section>

      </main>

      {/* Botón flotante para agregar vehículos */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-lg shadow-blue-300 flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-40 animate-bounce"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {/* Modal */}
      <AddCarModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddCar}
      />
    </div>
  );
}