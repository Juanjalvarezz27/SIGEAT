export default function WeeklyChart() {
  const data = [
    { day: 'Lun', height: 'h-16', amount: '$40' },
    { day: 'Mar', height: 'h-24', amount: '$65' },
    { day: 'Mié', height: 'h-20', amount: '$50' },
    { day: 'Jue', height: 'h-32', amount: '$90' },
    { day: 'Vie', height: 'h-40', amount: '$120' },
    { day: 'Sáb', height: 'h-28', amount: '$85', active: true }, // El día actual
    { day: 'Dom', height: 'h-12', amount: '$30' },
  ];

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-800">Comportamiento Semanal</h3>
        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+15% vs semana pasada</span>
      </div>

      <div className="flex justify-between items-end gap-2 h-48">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center gap-2 flex-1 group">
            {/* Tooltip con el precio al pasar el mouse */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-slate-500 mb-1">
              {item.amount}
            </div>
            {/* La Barra */}
            <div 
              className={`w-full max-w-[30px] rounded-t-lg transition-all duration-1000 ease-out ${
                item.active ? 'bg-blue-600 shadow-lg shadow-blue-200' : 'bg-slate-100 group-hover:bg-blue-200'
              } ${item.height}`}
            ></div>
            {/* El día */}
            <span className={`text-xs font-medium ${item.active ? 'text-blue-600' : 'text-slate-400'}`}>
              {item.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}