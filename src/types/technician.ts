export interface Technician {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  skills: string[];
  availability: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  assignedTasks: string[]; // IDs des tâches assignées
  maxWeeklyHours: number;
  currentWeeklyHours: number;
  createdAt: string;
  updatedAt: string;
}
