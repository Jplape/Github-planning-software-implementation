import { useState } from 'react';
import { Task } from '../../types/task';
import { format, parseISO, isValid, isToday, isTomorrow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, MapPin, User, AlertCircle, ChevronDown } from 'lucide-react';
import { Progress } from '../ui/Progress';

interface TaskSummaryProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const sortOptions = [
  { value: 'date-desc', label: 'Date (récent)' },
  { value: 'date-asc', label: 'Date (ancien)' },
  { value: 'priority', label: 'Priorité' },
  { value: 'client', label: 'Client' },
];

export default function TaskSummary({ tasks, onTaskClick }: TaskSummaryProps) {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [showFilters, setShowFilters] = useState(false);

  const filteredTasks = tasks
    .filter(task => selectedStatus === 'all' ? true : task.status === selectedStatus)
    .filter(task => task.date && isValid(parseISO(task.date)))
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'priority':
          return (b.priority || 0) - (a.priority || 0);
        case 'client':
          return (a.client || '').localeCompare(b.client || '');
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

  const formatTaskDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) {
        return 'Date invalide';
      }
      if (isToday(date)) {
        return 'Aujourd\'hui';
      }
      if (isTomorrow(date)) {
        return 'Demain';
      }
      return format(date, 'dd MMMM yyyy', { locale: fr });
    } catch {
      return 'Date invalide';
    }
  };

  const getPriorityStyle = (priority: number) => {
    if (priority > 7) return 'bg-red-100 text-red-800';
    if (priority > 4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusStyle = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'Terminée';
      case 'in_progress':
        return 'En cours';
      default:
        return 'En attente';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Résumé des tâches</h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          Filtres et tri
          <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as typeof selectedStatus)}
              className="w-full rounded-md border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Toutes les tâches</option>
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminées</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trier par</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-md border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <div
              key={task.id}
              onClick={() => onTaskClick(task)}
              className="p-4 rounded-lg border border-gray-200 hover:border-indigo-500 cursor-pointer transition-colors group"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                    {task.priority && task.priority > 7 && (
                      <div className="flex items-center mt-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Tâche urgente
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-2 py-1 text-xs rounded-full border ${getStatusStyle(task.status)}`}>
                    {getStatusLabel(task.status)}
                  </span>
                  {task.priority && (
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityStyle(task.priority)}`}>
                      Priorité {task.priority}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mt-3 space-y-2">
                {task.status === 'in_progress' && task.progress && (
                  <div className="space-y-1">
                    <Progress value={task.progress} className="h-2" />
                    <div className="text-xs text-gray-500 text-right">
                      {task.progress}% complété
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTaskDate(task.date)} à {task.startTime || 'Heure non définie'}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {task.client || 'Client non défini'}
                  </div>
                  {task.technicianId && (
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      ID Technicien: {task.technicianId}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            Aucune tâche à afficher
          </div>
        )}
      </div>
    </div>
  );
}
