import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Task } from '../../store/taskStore';
import { format, startOfWeek, addDays, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';

// Couleurs pour les différents statuts
const COLORS = {
  completed: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    ring: 'ring-green-400',
    fill: '#10B981'
  },
  inProgress: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    ring: 'ring-blue-400',
    fill: '#3B82F6'
  },
  pending: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    ring: 'ring-gray-400',
    fill: '#D1D5DB'
  },
  unassigned: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    ring: 'ring-yellow-400',
    fill: '#FCD34D'
  }
};
// Couleurs pour les axes
const AXIS_COLORS = {
  today: '#4F46E5',
  default: '#6B7280'
};

interface InteractiveChartProps {
  tasks: Task[];
  onBarClick: (date: string, status?: string) => void;
}

/**
 * Composant InteractiveChart - Affiche un graphique en barres interactif des tâches par statut
 * @param {Task[]} tasks - Liste des tâches à afficher
 * @param {(date: string, status?: string) => void} onBarClick - Callback appelé lors du clic sur une barre
 */
export default function InteractiveChart({ tasks = [], onBarClick }: InteractiveChartProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const { data, weekRange } = useMemo(() => {
    setIsLoading(true);
    setError(null);
    try {
      const currentDate = new Date();
      const weekStart = startOfWeek(currentDate, { locale: fr });
      const weekEnd = addDays(weekStart, 6);
      
      const weekRange = `${format(weekStart, 'dd MMMM', { locale: fr })} - ${format(weekEnd, 'dd MMMM yyyy', { locale: fr })}`;
      
      const data = Array.from({ length: 7 }, (_, index) => {
        const date = addDays(weekStart, index);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayTasks = tasks.filter(task => task.date === dateStr);
        
        const counts = dayTasks.reduce((acc, task) => {
          acc[task.status] = (acc[task.status] || 0) + 1;
          if (!task.technicianId) acc.unassigned = (acc.unassigned || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        return {
          name: format(date, 'EEE', { locale: fr }),
          fullDate: format(date, 'dd/MM', { locale: fr }),
          date: dateStr,
          completed: counts.completed || 0,
          inProgress: counts.in_progress || 0,
          pending: counts.pending || 0,
          unassigned: counts.unassigned || 0,
          isToday: isToday(date)
        };
      });

      return { data, weekRange };
    } catch (err) {
      setError('Erreur lors du chargement des données');
      return { data: [], weekRange: '' };
    } finally {
      setIsLoading(false);
    }
  }, [tasks]);

  interface TooltipProps {
    active?: boolean;
    payload?: { value: number; dataKey: string; payload: { date: string; fullDate: string } }[];
    label?: string;
  }

  const CustomTooltip = ({ active, payload = [], label }: TooltipProps) => {
    if (active && payload.length > 0) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
      const date = payload[0].payload.fullDate;
      
      return (
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <p className="text-sm font-medium text-gray-900 mb-2">{label} ({date})</p>
          {payload.map((entry: any, index: number) => (
            <div 
              key={index}
              className="flex items-center justify-between space-x-4 text-sm"
              onClick={() => onBarClick(payload[0].payload.date, entry.dataKey)}
            >
              <span className={`
                px-2 py-0.5 rounded-full cursor-pointer hover:opacity-80
                ${COLORS[entry.dataKey as keyof typeof COLORS].bg} ${COLORS[entry.dataKey as keyof typeof COLORS].text}
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
    setSelectedStatus((prevStatus) => (prevStatus === entry.dataKey ? null : entry.dataKey));
  };

  interface LegendProps {
    payload?: { dataKey: string }[];
  }

  const CustomLegend = ({ payload }: LegendProps) => {
    if (!payload || payload.length === 0) {
      return null;
    }
  
    return (
      <div className="flex justify-center space-x-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <button
            key={index}
            onClick={() => handleLegendClick(entry)}
            className={`
              px-3 py-1 rounded-full text-sm transition-colors
              ${selectedStatus === entry.dataKey ? 'ring-2 ring-offset-2' : ''}
              ${COLORS[entry.dataKey as keyof typeof COLORS].bg} ${COLORS[entry.dataKey as keyof typeof COLORS].text} ${COLORS[entry.dataKey as keyof typeof COLORS].ring}
            `}
          >
            {entry.dataKey === 'completed' ? 'Terminées' :
             entry.dataKey === 'inProgress' ? 'En cours' :
             entry.dataKey === 'pending' ? 'En attente' : 'Non assignées'}
          </button>
        ))}
      </div>
    );
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center h-80">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center h-80">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6" role="region" aria-label="Graphique des tâches">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Suivi hebdomadaire</h3>
          <p className="text-sm text-gray-500 mt-1">{weekRange}</p>
        </div>
        <div className="text-sm text-gray-500">
          Cliquez sur les barres ou la légende pour filtrer
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            onClick={(state) => {
              if (state?.activeTooltipIndex !== undefined) {
                onBarClick(data[state.activeTooltipIndex].date, selectedStatus || undefined);
              }
            }}
            role="graphics-document"
            aria-label="Graphique en barres des tâches par statut"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              aria-label="Day of the week"
              tick={({ x, y, payload }) => (
                <g transform={`translate(${x},${y})`}>
                  <text 
                    x={0} 
                    y={0} 
                    dy={16} 
                    textAnchor="middle" 
                    fill={payload.isToday ? AXIS_COLORS.today : AXIS_COLORS.default}
                    className={payload.isToday ? 'font-medium' : ''}
                  >
                    {payload.value}
                  </text>
                </g>
              )}
            />
            <YAxis aria-label="Number of tasks" />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            <Bar
              dataKey="completed"
              name="Terminées"
              stackId="a"
              fill={COLORS.completed.fill}
              cursor="pointer"
              opacity={!selectedStatus || selectedStatus === 'completed' ? 1 : 0.3}
            />
            <Bar
              dataKey="inProgress"
              name="En cours"
              stackId="a"
              fill={COLORS.inProgress.fill}
              cursor="pointer"
              opacity={!selectedStatus || selectedStatus === 'inProgress' ? 1 : 0.3}
            />
            <Bar
              dataKey="pending"
              name="En attente"
              stackId="a"
              fill={COLORS.pending.fill}
              cursor="pointer"
              opacity={!selectedStatus || selectedStatus === 'pending' ? 1 : 0.3}
            />
            <Bar
              dataKey="unassigned"
              name="Non assignées"
              stackId="a"
              fill={COLORS.unassigned.fill}
              cursor="pointer"
              opacity={!selectedStatus || selectedStatus === 'unassigned' ? 1 : 0.3}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
