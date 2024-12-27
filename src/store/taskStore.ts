export type { Task } from '../types/task';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useCalendarStore } from './calendarStore';
import { Task } from '../types/task';
import { generateDemoTasks } from '../data/demoTasks';

interface TaskState {
  tasks: Task[];
  lastTaskId: number;
  lastUpdate: number;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, newDate: string) => void;
  getTasksByDate: (date: string) => Task[];
  getTasksByDateRange: (startDate: Date, endDate: Date) => Task[];
  getTechnicianTasks: (technicianId: string, date: string) => Task[];
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: generateDemoTasks(),
      lastTaskId: 0,
      lastUpdate: Date.now(),

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
