"use client";

import { useState } from 'react';
import { Car, DollarSign, Wallet, Plus, CalendarDays } from 'lucide-react';
import StatCard from '@/components/StatCard';
import CarList from '@/components/CarList';
import AddCarModal from '@/components/AddCarModal';
import WeeklyChart from '@/components/WeeklyChart'; // Importamos la gráfica nueva
import { listaCarros as datosIniciales } from '@/data/mockData';

export default function Home() {
  // Estado para manejar la lista de carros y el modal
  const [carros, setCarros] = useState(datosIniciales);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Lógica de Negocio: Calcular totales automáticamente
  // Esto suma el dinero en tiempo real. Si agregas un carro, esto cambia.
  const totalIngresos = carros
    .filter(c => c.estado === 'Pagado')
    .reduce((acc, curr) => acc + curr.precio, 0);
    
  const totalPorCobrar = carros
    .filter(c => c.estado !== 'Pagado') // Todo lo que no sea 'Pagado' es deuda
    .reduce((acc, curr) => acc + curr.precio, 0);

  // 2. Función para agregar un carro nuevo desde el Modal
  const handleAddCar = (nuevoCarro: any) => {
    // Agregamos el nuevo carro al PRINCIPIO de la lista para que se vea arriba
    setCarros([nuevoCarro, ...carros]);
  };

  // Fecha actual para el header
  const fechaHoy = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });

  return (
    <main className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900">
      
      {/* --- HEADER --- */}
      <header className="bg-white px-6 pt-10 pb-6 rounded-b-[2rem] shadow-sm mb-6 sticky top-0 z-10 border-b border-slate-100">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-slate-400 text-sm font-medium capitalize flex items-center gap-1">
              <CalendarDays size={14}/> {fechaHoy}
            </p>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              Hola, Daniel <span className="animate-pulse">👋</span>
            </h1>
          </div>
          {/* Avatar Simulado */}
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold border-4 border-slate-50 shadow-md">
            DA
          </div>
        </div>
      </header>

      {/* --- SECCIÓN 1: ESTADÍSTICAS (KPIs) --- */}
      <section className="px-5 mb-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-end mb-3 px-1">
          <h2 className="text-lg font-bold text-slate-800">Balance del Día</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {/* Tarjeta Principal: Ingresos Reales */}
          <StatCard 
            title="Dinero en Caja" 
            value={`$ ${totalIngresos.toFixed(2)}`} 
            icon={DollarSign} 
            color="green" 
          />

          <div className="grid grid-cols-2 gap-3">
            {/* Contadores Secundarios */}
            <StatCard 
              title="Vehículos" 
              value={`${carros.length}`} 
              icon={Car} 
              color="blue" 
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

      {/* --- SECCIÓN 2: GRÁFICA SEMANAL (EL FACTOR WOW) --- */}
      <section className="px-5 mb-8 animate-in slide-in-from-bottom-8 duration-700 delay-100">
        <WeeklyChart />
      </section>

      {/* --- SECCIÓN 3: LISTA OPERATIVA --- */}
      <section className="px-5 animate-in slide-in-from-bottom-8 duration-700 delay-200">
        <div className="flex justify-between items-end mb-4 px-1">
          <h2 className="text-lg font-bold text-slate-800">Vehículos en Patio</h2>
          <span className="text-xs text-slate-400 font-medium bg-white px-2 py-1 rounded-full border border-slate-100 shadow-sm">
            En vivo
          </span>
        </div>
        
        {/* Aquí renderizamos la lista con el botón de WhatsApp */}
        <CarList carros={carros} />
      </section>

      {/* --- BOTÓN FLOTANTE (FAB) --- */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-300 flex items-center justify-center transition-all hover:scale-110 active:scale-90 z-40"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {/* --- MODAL PARA AGREGAR CARROS --- */}
      <AddCarModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddCar}
      />

    </main>
  );
}