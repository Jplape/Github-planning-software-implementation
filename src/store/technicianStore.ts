import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { Technician } from '../types/technician';

interface TechnicianStore {
  technicians: Technician[];
  loading: boolean;
  error: string | null;
  
  // Opérations CRUD
  fetchTechnicians: () => Promise<void>;
  addTechnician: (technician: Omit<Technician, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTechnician: (id: string, updates: Partial<Technician>) => Promise<void>;
  deleteTechnician: (id: string) => Promise<void>;
  
  // Gestion des assignations
  assignTask: (technicianId: string, taskId: string) => Promise<void>;
  unassignTask: (technicianId: string, taskId: string) => Promise<void>;
  
  // Gestion de la disponibilité
  updateAvailability: (technicianId: string, availability: Technician['availability']) => Promise<void>;
  
  // Calcul des heures
  updateWeeklyHours: (technicianId: string, hours: number) => Promise<void>;
}

export const useTechnicianStore = create<TechnicianStore>((set, get) => ({
  technicians: [],
  loading: false,
  error: null,

  fetchTechnicians: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('technicians')
        .select('*')
        .order('lastName', { ascending: true });

      if (error) throw error;
      set({ technicians: data || [], loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Une erreur inconnue est survenue',
        loading: false 
      });
    }
  },

  addTechnician: async (technician) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('technicians')
        .insert([{
          ...technician,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        technicians: [...state.technicians, data],
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Une erreur inconnue est survenue',
        loading: false 
      });
    }
  },

  updateTechnician: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('technicians')
        .update({
          ...updates,
          updatedAt: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        technicians: state.technicians.map(t => 
          t.id === id ? { ...t, ...data } : t
        ),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Une erreur inconnue est survenue',
        loading: false 
      });
    }
  },

  deleteTechnician: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('technicians')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set((state) => ({
        technicians: state.technicians.filter(t => t.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Une erreur inconnue est survenue',
        loading: false 
      });
    }
  },

  assignTask: async (technicianId, taskId) => {
    set({ loading: true, error: null });
    try {
      await get().updateTechnician(technicianId, {
        assignedTasks: [
          ...get().technicians.find(t => t.id === technicianId)?.assignedTasks || [],
          taskId
        ]
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Une erreur inconnue est survenue',
        loading: false 
      });
    }
  },

  unassignTask: async (technicianId, taskId) => {
    set({ loading: true, error: null });
    try {
      await get().updateTechnician(technicianId, {
        assignedTasks: get()
          .technicians
          .find(t => t.id === technicianId)
          ?.assignedTasks
          .filter(id => id !== taskId) || []
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Une erreur inconnue est survenue',
        loading: false 
      });
    }
  },

  updateAvailability: async (technicianId, availability) => {
    await get().updateTechnician(technicianId, { availability });
  },

  updateWeeklyHours: async (technicianId, hours) => {
    await get().updateTechnician(technicianId, { 
      currentWeeklyHours: hours 
    });
  }
}));
