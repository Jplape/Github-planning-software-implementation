export type { Task } from '../types/task';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useCalendarStore } from './calendarStore';
import { Task } from '../types/task';
import { exampleInterventions } from '../data/exampleInterventions';
import { supabase } from '../lib/supabaseClient';

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
  init: () => Promise<void>;
  subscribeToTasks: () => any;
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
  persist<TaskState>(
    (set, get) => ({
      tasks: [],
      lastTaskId: 0,
      lastUpdate: Date.now(),

      // Initialize store by loading tasks from Supabase
      init: async () => {
        try {
          const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: true });

          if (error) throw error;

          set({
            tasks: data,
            lastUpdate: Date.now()
          });
        } catch (error) {
          console.error('Error initializing tasks:', error);
          // Fallback to demo tasks if Supabase fails
          set({
            tasks: exampleInterventions,
            lastUpdate: Date.now()
          });
        }
      },
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

      addTask: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        const tempId = `temp-${Date.now()}`;
        
        // Optimistic update
        set((state) => ({
          tasks: [...state.tasks, {
            ...task,
            id: tempId,
            createdAt: now,
            updatedAt: now,
            status: 'pending-sync'
          }],
          lastUpdate: Date.now()
        }));
        
        try {
          // Try to sync immediately
          const { data, error } = await supabase
            .from('tasks')
            .insert({
              ...task,
              created_at: now,
              updated_at: now
            })
            .select()
            .single();

          if (error) throw error;

          // Update with real ID
          set((state) => ({
            tasks: state.tasks.map(t => 
              t.id === tempId ? { ...data, status: 'synced' } : t
            ),
            lastUpdate: Date.now()
          }));
          
          useCalendarStore.getState().updateLastSync();
        } catch (error) {
          console.error('Error adding task:', error);
          // Cache for later sync
          const cache = await caches.open('api-cache');
          await cache.put(
            new Request('/api/tasks'),
            new Response(JSON.stringify({
              method: 'POST',
              body: {
                ...task,
                id: tempId,
                createdAt: now,
                updatedAt: now
              }
            }))
          );
          
          // Register sync
          const registration = await navigator.serviceWorker.ready;
          await registration.sync.register('sync-tasks');
          throw error;
        }
      },

      updateTask: async (id: string, updates: Partial<Task>) => {
        try {
          const now = new Date().toISOString();
          
          // Update in Supabase
          const { data, error } = await supabase
            .from('tasks')
            .update({
              ...updates,
              updated_at: now
            })
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          // Update local state
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id
                ? { ...task, ...data }
                : task
            ),
            lastUpdate: Date.now()
          }));
          
          useCalendarStore.getState().updateLastSync();
        } catch (error) {
          console.error('Error updating task:', error);
          throw error;
        }
      },

      deleteTask: async (id: string) => {
        try {
          // Delete from Supabase
          const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);

          if (error) throw error;

          // Update local state
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
            lastUpdate: Date.now()
          }));
          
          useCalendarStore.getState().updateLastSync();
        } catch (error) {
          console.error('Error deleting task:', error);
          throw error;
        }
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

      // Initialize realtime subscription
      subscribeToTasks: () => {
        return supabase
          .channel('tasks')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'tasks'
          }, (payload) => {
            switch (payload.eventType) {
              case 'INSERT':
                set((state) => ({
                  tasks: [...state.tasks, payload.new as Task],
                  lastUpdate: Date.now()
                }));
                break;
              case 'UPDATE':
                set((state) => ({
                  tasks: state.tasks.map((task) =>
                    task.id === payload.new.id ? payload.new as Task : task
                  ),
                  lastUpdate: Date.now()
                }));
                break;
              case 'DELETE':
                set((state) => ({
                  tasks: state.tasks.filter((task) => task.id !== (payload.old as Task).id),
                  lastUpdate: Date.now()
                }));
                break;
            }
            useCalendarStore.getState().updateLastSync();
          })
          .subscribe();
      },
    }),
    {
      name: 'task-storage',
      version: 1,
      partialize: (state) => ({
        tasks: state.tasks,
        lastTaskId: state.lastTaskId,
        lastUpdate: state.lastUpdate,
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
        init: () => Promise.resolve(),
        subscribeToTasks: () => {},
        addTask: () => {},
        updateTask: () => {},
        deleteTask: () => {},
        moveTask: () => {},
        getTasksByDate: () => [],
        getTasksByDateRange: () => [],
        getTechnicianTasks: () => [],
        clearFilters: () => {},
        setDateRangeFilter: () => {}
      })
    }
  )
);

function getTimeInMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}
