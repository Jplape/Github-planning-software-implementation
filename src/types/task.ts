export interface Task {
  number: number;
  id: string;
  title: string;
  client: string;
  date: string;
  startTime: string;
  duration: number;
  technicianId?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'pending-sync';
  priority: 'haute' | 'moyenne' | 'basse';
  progress?: number;
  description?: string;
  equipment?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  createdAt: string;
  updatedAt: string;
  reportNumber?: string;
}
