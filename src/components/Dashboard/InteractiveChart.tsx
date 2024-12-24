import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Task } from '../../store/taskStore';
import { format, startOfWeek, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

interface InteractiveChartProps {
  tasks: Task[];
  onBarClick: (date: string, status?: string) => void;
}

export default function InteractiveChart({ tasks, onBarClick }: InteractiveChartProps) {
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const generateWeekData = () => {
    const currentDate = new Date();
    const weekStart = startOfWeek(currentDate, { locale: fr });
    
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(weekStart, index);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayTasks = tasks.filter(task => task.date === dateStr);
      
      return {
        name: format(date, 'EEE', { locale: fr }),
        date: dateStr,
        completed: dayTasks.filter(task => task.status === 'completed').length,
        inProgress: dayTasks.filter(task => task.status === 'in_progress').length,
        pending: dayTasks.filter(task => task.status === 'pending').length,
        unassigned: dayTasks.filter(task => !task.technicianId).length,
      };
    });
  };

  const data = generateWeekData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
      return (
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div 
              key={index}
              className="flex items-center justify-between space-x-4 text-sm"
              onClick={() => onBarClick(payload[0].payload.date, entry.dataKey)}
            >
              <span className={`
                px-2 py-0.5 rounded-full cursor-pointer hover:opacity-80
                ${entry.dataKey === 'completed' ? 'bg-green-100 text-green-800' :
                  entry.dataKey === 'inProgress' ? 'bg-blue-100 text-blue-800' :
                  entry.dataKey === 'pending' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'}
              `}>
                {entry.dataKey === 'completed' ? 'Terminées' :
                 entry.dataKey === 'inProgress' ? 'En cours' :
                 entry.dataKey === 'pending' ? 'En attente' : 'Non assignées'}: {entry.value}
              </span>
            </div>
          ))}
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-900">
              Total: {total} tâches
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleLegendClick = (entry: any) => {
    setSelectedStatus(selectedStatus === entry.dataKey ? null : entry.dataKey);
  };

  const CustomLegend = ({ payload }: any) => (
    <div className="flex justify-center space-x-4 mt-4">
      {payload.map((entry: any, index: number) => (
        <button
          key={index}
          onClick={() => handleLegendClick(entry)}
          className={`
            px-3 py-1 rounded-full text-sm transition-colors
            ${selectedStatus === entry.dataKey ? 'ring-2 ring-offset-2' : ''}
            ${entry.dataKey === 'completed' ? 'bg-green-100 text-green-800 ring-green-400' :
              entry.dataKey === 'inProgress' ? 'bg-blue-100 text-blue-800 ring-blue-400' :
              entry.dataKey === 'pending' ? 'bg-gray-100 text-gray-800 ring-gray-400' :
              'bg-yellow-100 text-yellow-800 ring-yellow-400'}
          `}
        >
          {entry.dataKey === 'completed' ? 'Terminées' :
           entry.dataKey === 'inProgress' ? 'En cours' :
           entry.dataKey === 'pending' ? 'En attente' : 'Non assignées'}
        </button>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Suivi hebdomadaire</h3>
        <div className="text-sm text-gray-500">
          Cliquez sur les barres ou la légende pour filtrer
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            onMouseMove={(state) => {
              if (state.activeTooltipIndex !== undefined) {
                setHoveredBar(data[state.activeTooltipIndex].date);
              }
            }}
            onMouseLeave={() => setHoveredBar(null)}
            onClick={(state) => {
              if (state.activeTooltipIndex !== undefined) {
                onBarClick(data[state.activeTooltipIndex].date, selectedStatus || undefined);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            <Bar
              dataKey="completed"
              name="Terminées"
              stackId="a"
              fill="#10B981"
              cursor="pointer"
              opacity={!selectedStatus || selectedStatus === 'completed' ? 1 : 0.3}
            />
            <Bar
              dataKey="inProgress"
              name="En cours"
              stackId="a"
              fill="#3B82F6"
              cursor="pointer"
              opacity={!selectedStatus || selectedStatus === 'inProgress' ? 1 : 0.3}
            />
            <Bar
              dataKey="pending"
              name="En attente"
              stackId="a"
              fill="#D1D5DB"
              cursor="pointer"
              opacity={!selectedStatus || selectedStatus === 'pending' ? 1 : 0.3}
            />
            <Bar
              dataKey="unassigned"
              name="Non assignées"
              stackId="a"
              fill="#FCD34D"
              cursor="pointer"
              opacity={!selectedStatus || selectedStatus === 'unassigned' ? 1 : 0.3}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}