import { supabase } from '../lib/supabaseClient';

async function insertDemoTasks() {
  const demoData = [
    {
      title: 'Révision client A',
      description: 'Révision annuelle des équipements',
      status: 'pending',
      due_date: new Date('2024-03-15T09:00:00'),
      assigned_to: null
    },
    {
      title: 'Installation nouveau système',
      description: 'Installation système de surveillance',
      status: 'in_progress',
      due_date: new Date('2024-03-20T14:00:00'),
      assigned_to: null
    },
    {
      title: 'Formation utilisateurs',
      description: 'Formation sur le nouveau logiciel',
      status: 'completed',
      due_date: new Date('2024-03-10T10:00:00'),
      assigned_to: null
    }
  ];

  const { data, error } = await supabase
    .from('tasks')
    .insert(demoData)
    .select();

  if (error) {
    console.error('Error inserting tasks:', error);
    return;
  }

  console.log('Inserted tasks:', data);
}

insertDemoTasks();
