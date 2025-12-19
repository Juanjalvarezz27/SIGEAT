// components/StatCard.tsx
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'red';
  subtitle?: string; // Nueva propiedad opcional
}

export default function StatCard({ title, value, icon: Icon, color = 'blue', subtitle }: StatCardProps) {
  const colorStyles = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colorStyles[color]}`}>
        <Icon size={24} />
      </div>

      <div className="flex-1">
        <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 mb-1">{value}</h3>
        {subtitle && (
          <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
        )}
      </div>
    </div>
  );
}