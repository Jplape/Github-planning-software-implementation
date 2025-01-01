import { format, startOfWeek, endOfWeek, addDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Task } from '../store/taskStore';
import { TeamMember } from '../store/teamStore';
import { AlertTriangle, CheckCircle, AlertOctagon } from 'lucide-react';

export function calculateStats(tasks: Task[], members: TeamMember[]) {
  const currentDate = new Date();
  const dateStr = format(currentDate, 'yyyy-MM-dd');
  const startOfCurrentWeek = startOfWeek(currentDate, { locale: fr });

  // Include tasks in progress from today and previous dates
  const activeInterventions = tasks.filter(task => 
    task.status === 'in_progress' && 
    (task.date === dateStr || new Date(task.date) < currentDate)
  ).length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const unassignedTasks = tasks.filter(task => !task.technicianId).length;
  const highPriorityTasks = tasks.filter(task => task.priority > 7).length;
  const todayTasks = tasks.filter(task => task.date === dateStr);
  const todayCompletedTasks = todayTasks.filter(task => task.status === 'completed').length;
  const activeTechnicians = members.filter(member => member.status !== 'offline').length;
  
  // Get technicians assigned to tasks for today
  const todayAssignedTechnicians = new Set(
    tasks
      .filter(task => task.date === dateStr && task.technicianId)
      .map(task => task.technicianId?.toString())
  );
  
  // Available technicians are those not assigned to any tasks today
  const availableTechnicians = members.filter(member => 
    !todayAssignedTechnicians.has(member.id.toString())
  ).length;

  // Get completed tasks with technician info
  const completedTasksThisWeek = tasks.filter(task => {
    const taskDate = new Date(task.date);
    return task.status === 'completed' && 
      taskDate >= startOfCurrentWeek && 
      taskDate <= endOfWeek(startOfCurrentWeek, { locale: fr });
  });

  const completedTasksToday = completedTasksThisWeek.filter(task => 
    task.date === dateStr
  );

  // Map technician IDs to names
  const technicianMap = new Map(members.map(member => [Number(member.id), member.name]));

  return {
    activeInterventions,
    completedTasks,
    pendingTasks,
    unassignedTasks,
    highPriorityTasks,
    todayTasks: todayTasks.length,
    todayCompletedTasks,
    activeTechnicians,
    availableTechnicians,
    totalTasks: tasks.length,
    totalMembers: members.length,
    totalWeeklyInterventions: tasks.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate >= startOfCurrentWeek && taskDate <= endOfWeek(startOfCurrentWeek, { locale: fr });
    }).length,
    completedWeeklyInterventions: completedTasksThisWeek.length,
    completedWeeklyTasks: completedTasksThisWeek.map(task => ({
      ...task,
      technicianName: task.technicianId ? technicianMap.get(Number(task.technicianId)) : 'Non assigné'
    })),
    completedTodayTasks: completedTasksToday.map(task => ({
      ...task,
      technicianName: task.technicianId ? technicianMap.get(Number(task.technicianId)) : 'Non assigné'
    })),
    weeklyCompletionPercentage: (
      (completedTasksThisWeek.length / 
      tasks.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate >= startOfCurrentWeek && 
          taskDate <= endOfWeek(startOfCurrentWeek, { locale: fr });
      }).length) * 100
    ).toFixed(1)
  };
}

export function generateAlerts(stats: ReturnType<typeof calculateStats>) {
  return [
    {
      type: 'warning' as const,
      message: `${stats.unassignedTasks} tâches non assignées`,
      icon: AlertTriangle,
      color: 'text-yellow-500',
      link: '/tasks?filter=unassigned'
    },
    {
      type: 'urgent' as const,
      message: `${stats.highPriorityTasks} interventions haute priorité`,
      icon: AlertOctagon,
      color: 'text-red-500',
      link: '/tasks?filter=high-priority'
    },
    {
      type: 'info' as const,
      message: `${stats.activeInterventions}/5 interventions en cours`,
      icon: CheckCircle,
      color: 'text-green-500',
      link: '/tasks?status=in_progress'
    }
  ].filter(alert => {
    if (alert.type === 'warning' && stats.unassignedTasks === 0) return false;
    if (alert.type === 'urgent' && stats.highPriorityTasks === 0) return false;
    return true;
  });
}

export function generateWeekData(tasks: Task[]) {
  const currentDate = new Date();
  const startOfCurrentWeek = startOfWeek(currentDate, { locale: fr });
  
  return Array.from({ length: 7 }, (_, index) => {
    const day = addDays(startOfCurrentWeek, index);
    const dayTasks = tasks.filter(task => task.date === format(day, 'yyyy-MM-dd'));
    
    return {
      name: format(day, 'EEE', { locale: fr }),
      total: dayTasks.length,
      completed: dayTasks.filter(task => task.status === 'completed').length,
      inProgress: dayTasks.filter(task => task.status === 'in_progress').length,
      pending: dayTasks.filter(task => task.status === 'pending').length,
      isToday: isSameDay(day, currentDate),
    };
  });
}
