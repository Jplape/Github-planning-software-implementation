import { Link } from 'react-router-dom';
import { Clock, User, MapPin, Wrench, FileText, ExternalLink } from 'lucide-react';
import { Task } from '../../store/taskStore';
import { useTeamStore } from '../../store/teamStore';
import { useTaskStore } from '../../store/taskStore';
import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import TaskStatusDropdown from './TaskStatusDropdown';

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

export default function TaskList({ tasks, onEditTask }: TaskListProps) {
  const { members } = useTeamStore();
  const { updateTask } = useTaskStore();

  const formatTaskDate = (dateString: string) => {
    if (!dateString) return 'Date non définie';
    
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) {
        return 'Date invalide';
      }
      return format(date, 'dd MMMM yyyy', { locale: fr });
    } catch {
      return 'Date invalide';
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    updateTask(taskId, { status: newStatus });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date & Heure
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tâche
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Client & Équipement
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Technicien
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Priorité
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              État
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map((task) => {
            const technician = members.find(m => m.id === Number(task.technicianId));
            
            return (
              <tr
                key={task.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onEditTask(task)}
              >
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityStyle(task.priority)}`}>
                    {task.priority === 'high' ? 'Haute' :
                     task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {formatTaskDate(task.date)}
                    </span>
                    {task.startTime && (
                      <span className="text-sm text-gray-500">
                        {task.startTime}
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {task.title}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityStyle(task.priority)}`}>
                      {task.priority === 'high' ? 'Haute' :
                       task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-col space-y-1">
                    <Link
                      to={`/clients?search=${encodeURIComponent(task.client)}`}
                      className="flex items-center text-sm text-indigo-600 hover:text-indigo-900 group"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                      {task.client}
                      <ExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    {task.equipment && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Wrench className="h-4 w-4 text-gray-400 mr-1" />
                        {task.equipment}
                        {task.serialNumber && (
                          <span className="ml-1 text-xs text-gray-400">
                            ({task.serialNumber})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {technician ? (
                    <Link
                      to={`/teams?member=${technician.id}`}
                      className="flex items-center text-sm text-indigo-600 hover:text-indigo-900 group"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <User className="h-4 w-4 text-gray-400 mr-1" />
                      {technician.name}
                      <ExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-500 italic">
                      Non assigné
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <TaskStatusDropdown
                    status={task.status}
                    onChange={(newStatus) => handleStatusChange(task.id, newStatus)}
                  />
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/intervention-reports?task=${task.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FileText className="h-5 w-5" />
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
