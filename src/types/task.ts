export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'pending-sync';
  priority: 'haute' | 'moyenne' | 'basse';
  due_date: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
  intervention?: {
    client_id: string;
    date: string;
    start_time?: string;
    duration?: string;
    equipment?: string;
    serial_number?: string;
    intervention_number?: number;
    technician_id?: string;
  };
}
