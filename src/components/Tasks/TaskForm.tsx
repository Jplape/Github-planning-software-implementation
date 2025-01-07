import { useState, useEffect } from 'react';
import { Task } from '../../store/taskStore';
import { Clock, Info } from 'lucide-react';
import { format } from 'date-fns';
import { useTeamStore } from '../../store/teamStore';

interface TaskFormProps {
  initialData?: Partial<Task>;
  onSubmit: (formData: Partial<Task>) => void;
}

const timeOptions = [
  '07:30', '08:00', '08:30',
  '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00'
];

interface FormData {
  title: string;
  description: string;
  client: string;
  equipment: string;
  brand: string;
  model: string;
  serialNumber: string;
  date: string;
  startTime: string;
  endTime: string;
  priority: Task['priority'];
  technicianId: string;
  status: Task['status'];
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

const defaultFormData: FormData = {
  title: '',
  description: '',
  client: '',
  equipment: '',
  brand: '',
  model: '',
  serialNumber: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  startTime: '08:00',
  endTime: '09:00',
  priority: 'moyenne',
  technicianId: '',
  status: 'pending'
};

export default function TaskForm({ initialData, onSubmit }: TaskFormProps) {
  const { members } = useTeamStore();
  const [formData, setFormData] = useState<FormData>(() => ({
    ...defaultFormData,
    ...initialData,
    date: initialData?.intervention?.date || defaultFormData.date,
    startTime: initialData?.intervention?.start_time || defaultFormData.startTime,
    endTime: calculateEndTime(
      initialData?.intervention?.start_time || defaultFormData.startTime,
      initialData?.intervention?.duration ? parseInt(initialData.intervention.duration) : 60
    )
  }));

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        endTime: calculateEndTime(
          initialData.intervention?.start_time || prev.startTime,
          initialData.intervention?.duration ? parseInt(initialData.intervention.duration) : 60
        )
      }));
    }
  }, [initialData]);

  function calculateEndTime(startTime: string, duration: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }

  function calculateDuration(startTime: string, endTime: string): number {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    return (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = calculateDuration(formData.startTime, formData.endTime);
    
    onSubmit({
      ...formData,
      intervention: {
        ...formData.intervention,
        client_id: formData.client,
        date: formData.date,
        start_time: formData.startTime,
        duration: duration.toString()
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-2xl mx-auto h-[calc(100vh-14rem)] overflow-y-auto">
      {/* Section Informations générales */}
      <div className="bg-gray-50 p-3 rounded-lg space-y-3">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Informations générales</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Titre</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Client</label>
            <input
              type="text"
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Section Équipement */}
      <div className="bg-gray-50 p-3 rounded-lg space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-900">Informations sur l'équipement</h4>
          <div className="flex items-center text-xs text-gray-500">
            <Info className="h-4 w-4 mr-1" />
            Champs optionnels
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Équipement</label>
            <input
              type="text"
              value={formData.equipment}
              onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Type d'équipement"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Marque</label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Marque de l'équipement"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Modèle</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Référence du modèle"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">N° série</label>
            <input
              type="text"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Numéro de série"
            />
          </div>
        </div>
      </div>

      {/* Section Planification */}
      <div className="bg-gray-50 p-3 rounded-lg space-y-3">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Planification</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date d'intervention</label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Technicien assigné</label>
            <select
              value={formData.technicianId}
              onChange={(e) => setFormData({ ...formData, technicianId: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Sélectionner un technicien</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Heure de début</label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <select
                value={formData.startTime}
                onChange={(e) => {
                  const newStartTime = e.target.value;
                  const duration = calculateDuration(formData.startTime, formData.endTime);
                  setFormData({
                    ...formData,
                    startTime: newStartTime,
                    endTime: calculateEndTime(newStartTime, duration)
                  });
                }}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Heure de fin</label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <select
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {timeOptions.map((time) => (
                  <option 
                    key={time} 
                    value={time} 
                    disabled={time <= formData.startTime}
                  >
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Section État */}
      <div className="bg-gray-50 p-3 rounded-lg space-y-3">
        <h4 className="text-sm font-medium text-gray-900 mb-2">État</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Priorité</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="basse">Basse</option>
              <option value="moyenne">Moyenne</option>
              <option value="haute">Haute</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Statut</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="pending">En attente</option>
              <option value="pending-sync">En attente de synchronisation</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminée</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-3">
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {initialData ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </form>
  );
}
