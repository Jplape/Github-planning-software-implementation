import { Task } from '../store/taskStore';
import { parseISO, isValid } from 'date-fns';

export function validateTaskTime(task: Task): boolean {
  if (!task.startTime || !task.date) {
    console.error('Invalid task - missing startTime or date:', task);
    return false;
  }
  
  try {
    // Validate date
    const date = parseISO(task.date);
    if (!isValid(date)) {
      console.error('Invalid task date:', task.date);
      return false;
    }

    // Validate time format and values
    const [hours, minutes] = task.startTime.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
      console.error('Invalid task time format:', task.startTime);
      return false;
    }
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      console.error('Invalid task time values:', task.startTime);
      return false;
    }

    // Validate duration
    if (typeof task.duration !== 'number' || task.duration <= 0) {
      console.error('Invalid task duration:', task.duration);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating task:', error, task);
    return false;
  }
}

export function getTaskPosition(task: Task, hourHeight: number, startHour: number): {
  top: number;
  height: number;
} {
  if (!validateTaskTime(task)) {
    return { top: 0, height: hourHeight };
  }

  const [hours, minutes] = task.startTime.split(':').map(Number);
  const startMinutes = hours * 60 + minutes;
  const relativeMinutes = startMinutes - startHour * 60;
  
  const top = (relativeMinutes / 60) * hourHeight;
  const height = Math.max((task.duration / 60) * hourHeight, 30); // Minimum height of 30px
  
  return { top, height };
}

export function sortTasksByTime(tasks: Task[]): Task[] {
  return [...tasks]
    .filter(validateTaskTime)
    .sort((a, b) => {
      // Sort by time first
      const timeCompare = a.startTime.localeCompare(b.startTime);
      if (timeCompare !== 0) return timeCompare;
      
      // Then by priority
      const priorityOrder: { [key: number]: number } = { 1: 0, 2: 1, 3: 2 }; // Match priority numbers to sort order
      const aPriority = a.priority in priorityOrder ? a.priority : 3;
      const bPriority = b.priority in priorityOrder ? b.priority : 3;
      return priorityOrder[aPriority] - priorityOrder[bPriority];
    });
}

export function formatTaskTime(time: string | undefined): string {
  if (!time) return '';
  
  try {
    const [hours, minutes] = time.split(':').map(Number);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch {
    return '';
  }
}
