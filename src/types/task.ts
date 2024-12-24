export interface Task {
  id: string;
  title: string;
  client: string;
  date: string;
  startTime: string;
  duration: number;
  technicianId?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  description?: string;
  equipment?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  createdAt: string;
  updatedAt: string;
}