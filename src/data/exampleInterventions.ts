import { Task } from '../types/task';

export const exampleInterventions: Task[] = [
  {
    id: '1',
    number: 1,
    title: 'Installation climatisation',
    description: 'Installation d\'une climatisation chez M. Dupont',
    date: '2024-04-15',
    startTime: '09:00',
    duration: 3,
    priority: 'moyenne',
    status: 'pending',
    client: 'Dupont',
    createdAt: '2024-04-01T09:00:00Z',
    updatedAt: '2024-04-01T09:00:00Z'
  },
  {
    id: '2',
    number: 2,
    title: 'Maintenance chaudière',
    description: 'Contrôle annuel de la chaudière chez Mme Martin',
    date: '2024-04-18',
    startTime: '14:00',
    duration: 2,
    priority: 'haute',
    status: 'pending',
    client: 'Martin',
    createdAt: '2024-04-01T09:00:00Z',
    updatedAt: '2024-04-01T09:00:00Z'
  }
];
