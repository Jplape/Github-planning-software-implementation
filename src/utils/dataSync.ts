import { useTaskStore } from '../store/taskStore';
import { useTeamStore } from '../store/teamStore';
import { useClientStore } from '../store/clientStore';
import { useCalendarStore } from '../store/calendarStore';
import { syncTaskStatus } from './taskSync';
import { validateTaskTime, sortTasksByTime } from './calendarTaskSync';
import { calculateStats } from './dashboardUtils';

export async function syncAllData() {
  const { tasks, updateTask } = useTaskStore.getState();
  const { members, syncWorkload } = useTeamStore.getState();
  const { clients } = useClientStore.getState();
  const { events } = useCalendarStore.getState();

  // Sync task statuses
  tasks.forEach(task => {
    if (!validateTaskTime(task)) {
      updateTask(task.id, { status: 'pending' });
    }
  });

  // Sync team workload
  syncWorkload();

  // Sync calendar events
  const sortedTasks = sortTasksByTime(tasks);
  const calendarEvents = sortedTasks.map(task => ({
    id: task.id,
    title: task.title,
    start: new Date(`${task.date}T${task.startTime}`),
    end: new Date(`${task.date}T${task.startTime}`),
    extendedProps: {
      status: task.status,
      priority: task.priority,
      technicianId: task.technicianId || null
    }
  }));

  useCalendarStore.setState({ events: calendarEvents });

  // Calculate and sync dashboard stats
  const stats = calculateStats(tasks, members);
  useTaskStore.setState({ stats });

  return {
    tasks,
    members,
    clients,
    events: calendarEvents,
    stats
  };
}

export function useSyncData() {
  return {
    syncAllData,
    syncTaskStatus,
    validateTaskTime,
    sortTasksByTime,
    calculateStats
  };
}
