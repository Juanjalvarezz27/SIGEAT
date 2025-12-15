// components/StatCard.tsx
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'red'; // Para diferenciar visualmente
}

export default function StatCard({ title, value, icon: Icon, color = 'blue' }: StatCardProps) {
  
  // Mapeo de colores de fondo suave para el icono
  const colorStyles = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
      {/* Círculo del icono */}
      <div className={`p-3 rounded-xl ${colorStyles[color]}`}>
        <Icon size={24} />
      </div>
      
      {/* Texto */}
      <div>
        <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
    </div>
  );
}