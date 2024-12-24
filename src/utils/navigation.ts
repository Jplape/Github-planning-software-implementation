import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Building2, 
  ClipboardList,
  BarChart3,
  FileText
} from 'lucide-react';

export const navigation = [
  { name: 'Tableau de bord', to: '/', icon: LayoutDashboard },
  { name: 'Calendrier', to: '/calendar', icon: Calendar },
  { name: 'Équipes', to: '/teams', icon: Users },
  { name: 'Clients', to: '/clients', icon: Building2 },
  { name: 'Tâches', to: '/tasks', icon: ClipboardList },
  { name: 'Statistiques', to: '/statistics', icon: BarChart3 },
  { name: 'Rapports d\'intervention', to: '/intervention-reports', icon: FileText },
];