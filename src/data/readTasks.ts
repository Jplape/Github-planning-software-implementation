import { supabase } from '../lib/supabaseClient';

async function readTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*');

  if (error) {
    console.error('Error reading tasks:', error);
    return;
  }

  console.log('Tasks:', data);
}

readTasks();
