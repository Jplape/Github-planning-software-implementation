import { useState, useEffect } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { useTechnicianStore } from '../../store/technicianStore';
import { Task } from '../../types/task';
import { Spinner } from '../ui/Progress';


interface InterventionFormProps {
  intervention?: Task;
  onSave: () => void;
  onCancel: () => void;
}

export default function InterventionForm({ 
  intervention, 
  onSave, 
  onCancel 
}: InterventionFormProps) {
  const { addTask, updateTask } = useTaskStore();
  const { technicians, loading, error, fetchTechnicians } = useTechnicianStore();

  useEffect(() => {
    fetchTechnicians();
  }, [fetchTechnicians]);
  
  const [formData, setFormData] = useState({
    title: intervention?.title || '',
    description: intervention?.description || '',
    due_date: intervention?.due_date || new Date().toISOString().split('T')[0],
    priority: intervention?.priority || 'moyenne',
    status: intervention?.status || 'pending' as 'pending' | 'in_progress' | 'completed' | 'pending-sync',
    assigned_to: intervention?.assigned_to || '',
    intervention: {
      client_id: intervention?.intervention?.client_id || '',
      date: intervention?.intervention?.date || new Date().toISOString().split('T')[0],
      start_time: intervention?.intervention?.start_time || '',
      duration: intervention?.intervention?.duration || '0',
      equipment: intervention?.intervention?.equipment || '',
      serial_number: intervention?.intervention?.serial_number || '',
      intervention_number: intervention?.intervention?.intervention_number || 0
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create task record
      const taskData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        due_date: formData.due_date,
        assigned_to: formData.assigned_to,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        intervention: {
          client_id: formData.intervention.client_id,
          date: formData.intervention.date,
          start_time: formData.intervention.start_time,
          duration: formData.intervention.duration,
          equipment: formData.intervention.equipment,
          serial_number: formData.intervention.serial_number,
          intervention_number: formData.intervention.intervention_number
        }
      };

      if (intervention) {
        // Update existing records
        await updateTask(intervention.id, taskData);
      } else {
        // Create new records
        await addTask(taskData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving intervention:', error);
      alert('Une erreur est survenue lors de la sauvegarde de l\'intervention');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            value={formData.intervention.date}
            onChange={(e) => setFormData({
              ...formData,
              intervention: {
                ...formData.intervention,
                date: e.target.value
              }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Due Date
          </label>
          <input
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ 
              ...formData, 
              due_date: e.target.value 
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Priorité
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'haute' | 'moyenne' | 'basse' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="basse">Faible</option>
            <option value="moyenne">Moyenne</option>
            <option value="haute">Haute</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Statut
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'pending' | 'in_progress' | 'completed' | 'pending-sync' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="pending">En attente</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminée</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Technicien
        </label>
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Spinner className="h-5 w-5" />
            <span className="ml-2">Chargement des techniciens...</span>
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm">
            Erreur lors du chargement des techniciens: {error && typeof error === 'object' && error !== null && 'message' in error ? (error as {message: string}).message : String(error)}
            <div className="mt-2 text-xs">
              Vérifiez que la table des techniciens existe dans Supabase
            </div>
          </div>
        ) : technicians.length === 0 ? (
          <div className="text-yellow-600 text-sm">
            Aucun technicien trouvé. Vérifiez la configuration de la base de données.
          </div>
        ) : (
          <select
            value={formData.assigned_to}
            onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          >
            <option value="">Sélectionner un technicien</option>
            {technicians.map(tech => (
              <option key={tech.id} value={tech.id}>
                {tech.firstName} {tech.lastName}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Client
          </label>
          <input
            type="text"
            value={formData.intervention.client_id}
            onChange={(e) => setFormData({
              ...formData,
              intervention: {
                ...formData.intervention,
                client_id: e.target.value
              }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Équipement
          </label>
          <input
            type="text"
            value={formData.intervention.equipment}
            onChange={(e) => setFormData({
              ...formData,
              intervention: {
                ...formData.intervention,
                equipment: e.target.value
              }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Validation
        </button>
      </div>
    </form>
  );
}
