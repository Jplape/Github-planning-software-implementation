export type { Task } from '../types/task';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useCalendarStore } from './calendarStore';
import { Task } from '../types/task';
import { generateDemoTasks } from '../data/demoTasks';

interface Stats {
  activeInterventions: number;
  completedTasks: number;
  pendingTasks: number;
  unassignedTasks: number;
  highPriorityTasks: number;
  todayTasks: number;
  todayCompletedTasks: number;
  activeTechnicians: number;
  availableTechnicians: number;
  totalTasks: number;
  totalMembers: number;
  totalWeeklyInterventions: number;
  completedWeeklyInterventions: number;
  weeklyCompletionPercentage: string;
}

interface TaskState {
  tasks: Task[];
  lastTaskId: number;
  lastUpdate: number;
  stats: Stats;
  filters: {
    dateRange?: {
      startDate: Date;
      endDate: Date;
    };
  };
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, newDate: string) => void;
  getTasksByDate: (date: string) => Task[];
  getTasksByDateRange: (startDate: Date, endDate: Date) => Task[];
  getTechnicianTasks: (technicianId: string, date: string) => Task[];
  clearFilters: () => void;
  setDateRangeFilter: (range: { startDate: Date; endDate: Date }) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: generateDemoTasks(),
      lastTaskId: 0,
      lastUpdate: Date.now(),
      stats: {
        activeInterventions: 0,
        completedTasks: 0,
        pendingTasks: 0,
        unassignedTasks: 0,
        highPriorityTasks: 0,
        todayTasks: 0,
        todayCompletedTasks: 0,
        activeTechnicians: 0,
        availableTechnicians: 0,
        totalTasks: 0,
        totalMembers: 0,
        totalWeeklyInterventions: 0,
        completedWeeklyInterventions: 0,
        weeklyCompletionPercentage: '0.0'
      },
      filters: {},

      addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        const nextId = get().lastTaskId + 1;
        const taskId = `TASK-${nextId.toString().padStart(3, '0')}`;
        
        const newTask = {
          ...task,
          id: taskId,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          tasks: [...state.tasks, newTask],
          lastTaskId: nextId,
          lastUpdate: Date.now()
        }));
        useCalendarStore.getState().updateLastSync();
      },

      updateTask: (id: string, updates: Partial<Task>) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date().toISOString() }
              : task
          ),
          lastUpdate: Date.now()
        }));
        useCalendarStore.getState().updateLastSync();
      },

      deleteTask: (id: string) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
          lastUpdate: Date.now()
        }));
        useCalendarStore.getState().updateLastSync();
      },

      moveTask: (taskId: string, newDate: string) => {
        const task = get().tasks.find(t => t.id === taskId);
        if (!task) return;

        if (task.technicianId) {
          const technicianTasks = get().getTechnicianTasks(task.technicianId, newDate);
          const hasConflict = technicianTasks.some(existingTask => {
            if (existingTask.id === taskId) return false;
            
            const existingStart = getTimeInMinutes(existingTask.startTime);
            const existingEnd = existingStart + existingTask.duration;
            const newStart = getTimeInMinutes(task.startTime);
            const newEnd = newStart + task.duration;
            
            return (
              (newStart >= existingStart && newStart < existingEnd) ||
              (newEnd > existingStart && newEnd <= existingEnd) ||
              (newStart <= existingStart && newEnd >= existingEnd)
            );
          });

          if (hasConflict) {
            throw new Error("Le technicien a déjà une tâche prévue à cet horaire");
          }
        }

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? { ...t, date: newDate, updatedAt: new Date().toISOString() }
              : t
          ),
          lastUpdate: Date.now()
        }));
        useCalendarStore.getState().updateLastSync();
      },

      getTasksByDate: (date: string) => {
        return get().tasks.filter((task) => task.date === date);
      },

      getTasksByDateRange: (startDate: Date, endDate: Date) => {
        return get().tasks.filter((task) => {
          const taskDate = new Date(task.date);
          return taskDate >= startDate && taskDate <= endDate;
        });
      },

      getTechnicianTasks: (technicianId: string, date: string) => {
        return get().tasks.filter(
          task => task.technicianId === technicianId && task.date === date
        );
      },
      
      clearFilters: () => {
        set({
          filters: {}
        });
      },
      
      setDateRangeFilter: (range: { startDate: Date; endDate: Date }) => {
        set((state) => ({
          filters: {
            ...state.filters,
            dateRange: range
          }
        }));
      },
    }),
    {
      name: 'task-storage',
      version: 1,
      partialize: (state) => ({
        tasks: state.tasks,
        lastTaskId: state.lastTaskId,
        lastUpdate: state.lastUpdate
      })
    }
  )
);

function getTimeInMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}
