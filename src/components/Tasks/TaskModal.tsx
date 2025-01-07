import { X } from 'lucide-react';
import { Task } from '../../store/taskStore';
import TaskForm from './TaskForm';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: Partial<Task>) => void;
  taskToEdit?: Task | null;
}

export default function TaskModal({ isOpen, onClose, onSubmit, taskToEdit }: TaskModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-start justify-center z-50 overflow-y-auto">
      <div className="min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</div>
        
        <div className="relative inline-block bg-white rounded-lg text-left align-middle w-full max-w-2xl my-8 sm:my-16 transform transition-all sm:max-w-lg">
          {/* Header */}
          <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-lg z-10 shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {taskToEdit ? 'Modifier la tâche' : 'Nouvelle tâche'}
              </h3>
              <button 
                onClick={onClose}
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-6 py-4 h-[calc(100vh-14rem)] overflow-y-auto">
            <TaskForm
              initialData={taskToEdit || undefined}
              onSubmit={onSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
