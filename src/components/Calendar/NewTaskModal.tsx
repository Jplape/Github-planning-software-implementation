import { X } from 'lucide-react';
import { Task } from '../../store/taskStore';
import TaskForm from '../Tasks/TaskForm';
import { useTaskStore } from '../../store/taskStore';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string;
  taskToEdit?: Task | null;
}

export default function NewTaskModal({ isOpen, onClose, selectedDate, taskToEdit }: NewTaskModalProps) {
  const { addTask, updateTask } = useTaskStore();

  const handleSubmit = (formData: Partial<Task>) => {
    // Validation stricte des champs obligatoires
    if (!formData.title || !formData.date) {
      console.error("Title and date are required to create or update a task.");
      return;
    }

    // Complétez les champs requis avec des valeurs par défaut
    const completeFormData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: formData.title,
      date: formData.date,
      startTime: formData.startTime || '00:00', // Valeur par défaut
      duration: formData.duration || 60,       // Valeur par défaut (1h)
      technicianId: formData.technicianId || '', // Facultatif
      client: formData.client || 'Unknown',    // Valeur par défaut pour `client`
      status: formData.status || 'pending',    // Valeur par défaut pour `status`
      priority: formData.priority || 'low',    // Valeur par défaut pour `priority`
    };
    

    // Mise à jour ou création de la tâche
    if (taskToEdit) {
      updateTask(taskToEdit.id, formData); // Mise à jour avec des données partielles
    } else {
      addTask(completeFormData); // Création avec des données complètes
    }

    // Fermer le modal après soumission
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-start justify-center z-50 overflow-y-auto">
      <div className="min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</div>
        
        <div className="relative inline-block bg-white rounded-lg text-left align-middle w-full max-w-2xl my-8 sm:my-16">
          {/* Header */}
          <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-lg z-10">
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
          <div className="px-6 py-4 max-h-[calc(100vh-16rem)] overflow-y-auto">
            <TaskForm
              initialData={taskToEdit || { date: selectedDate }}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}