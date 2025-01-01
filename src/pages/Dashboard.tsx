import { Clock, Users, Wrench, Building, CheckCircle } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useTeamStore } from '../store/teamStore';
import StatCard from '../components/Dashboard/StatCard';
import InteractiveChart from '../components/Dashboard/InteractiveChart';
import NotificationCenter from '../components/Dashboard/NotificationCenter';
import TaskSummary from '../components/Dashboard/TaskSummary';
import { calculateStats } from '../utils/dashboardUtils';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { tasks } = useTaskStore();
  const { members } = useTeamStore();
  const navigate = useNavigate();

  const stats = calculateStats(tasks, members);

  const mainStats = [
    { 
      name: 'Interventions en cours', 
      value: stats.activeInterventions.toString(), 
      icon: Clock, 
      color: 'bg-blue-500',
      description: 'Progression des interventions en cours',
      trend: {
        value: ((stats.activeInterventions / (stats.activeInterventions + stats.completedTasks)) * 100).toFixed(1),
        label: 'du total des interventions'
      },
      link: '/tasks?status=in_progress'
    },
    { 
      name: 'Taches non assignées de la semaine', 
      value: stats.unassignedTasks.toString(), 
      icon: Building, 
      color: 'bg-yellow-500',
      description: 'Techniciens disponibles cette semaine',
      trend: {
        value: ((stats.unassignedTasks / stats.totalTasks) * 100).toFixed(1),
        label: 'du total des tâches'
      },
      link: '/tasks?filter=unassigned'
    },
    { 
      name: 'Techniciens disponibles ce jour',
      value: `${stats.availableTechnicians}/${stats.totalMembers}`, 
      icon: Users, 
      color: 'bg-green-500',
      description: 'Techniciens prêts pour de nouvelles interventions',
      trend: {
        value: ((stats.availableTechnicians / stats.totalMembers) * 100).toFixed(1),
        label: 'de disponibilité'
      },
      link: '/teams?status=available'
    },
    { 
      name: 'Interventions cette semaine', 
      value: stats.totalWeeklyInterventions.toString(), 
      icon: Wrench, 
      color: 'bg-purple-500',
      description: `Interventions prévues cette semaine (${stats.completedWeeklyInterventions} complétées)`,
      trend: {
        value: stats.weeklyCompletionPercentage,
        label: 'de complétion'
      },
      link: '/tasks?filter=this_week'
    },
    {
      name: 'Tâches complétées cette semaine',
      value: stats.completedWeeklyInterventions.toString(),
      icon: CheckCircle,
      color: 'bg-teal-500',
      description: `Tâches terminées cette semaine avec techniciens assignés`,
      trend: {
        value: stats.weeklyCompletionPercentage,
        label: 'de complétion'
      },
      link: '/tasks?status=completed'
    },
    {
      name: 'Tâches complétées aujourd\'hui',
      value: stats.todayCompletedTasks.toString(),
      icon: CheckCircle,
      color: 'bg-orange-500',
      description: `Tâches terminées aujourd'hui avec techniciens assignés`,
      trend: {
        value: ((stats.todayCompletedTasks / stats.todayTasks) * 100).toFixed(1),
        label: 'de complétion'
      },
      link: '/tasks?status=completed&date=today'
    }
  ];

  const handleBarClick = (date: string, status?: string) => {
    let url = `/calendar?date=${date}`;
    if (status) {
      url += `&status=${status}`;
    }
    navigate(url);
  };

  const handleTaskClick = (task: any) => {
    navigate(`/tasks?id=${task.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {mainStats.map((stat) => (
          <StatCard key={stat.name} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InteractiveChart tasks={tasks} onBarClick={handleBarClick} />
        </div>
        <div>
          <NotificationCenter tasks={tasks} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaskSummary tasks={tasks} onTaskClick={handleTaskClick} />
      </div>
    </div>
  );
}
