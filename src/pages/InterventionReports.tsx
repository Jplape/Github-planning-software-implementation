import { useState } from 'react';
import { Search, Download, Filter, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ReportCard from '../components/Reports/ReportCard';
import StatusBadge from '../components/Reports/StatusBadge';

interface Report {
  id: string;
  date: string;
  equipment: string;
  client: string;
  technician: string;
  status: 'completed' | 'pending' | 'in_progress';
  description: string;
}

const reports: Report[] = [
  {
    id: "R2024-001",
    date: "2024-03-15",
    equipment: "Climatisation industrielle XR-500",
    client: "Entreprise ABC",
    technician: "Thomas Martin",
    status: "completed",
    description: "Maintenance préventive effectuée"
  },
  {
    id: "R2024-002",
    date: "2024-03-14",
    equipment: "Système de ventilation V-200",
    client: "Société XYZ",
    technician: "Sophie Bernard",
    status: "completed",
    description: "Remplacement des filtres"
  },
  {
    id: "R2024-003",
    date: "2024-03-13",
    equipment: "Pompe à chaleur HP-100",
    client: "Entreprise ABC",
    technician: "Thomas Martin",
    status: "pending",
    description: "En attente de pièces"
  }
];

export default function InterventionReports() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'in_progress'>('all');

  const handleExport = (format: string) => {
    toast.success(`Export en ${format} démarré`);
  };
   const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.equipment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.technician.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rapports d'intervention</h2>
          <p className="mt-1 text-sm text-gray-500">
            Consultez et gérez les rapports d'intervention
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => handleExport('pdf')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-5 w-5 mr-2" />
            Exporter
          </button>
          <button
             className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouveau rapport
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Rechercher un rapport..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-400" />
              <div className="flex space-x-2">
                {(['all', 'completed', 'in_progress', 'pending'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      statusFilter === status
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'all' ? 'Tous' :
                     status === 'completed' ? 'Terminés' :
                     status === 'in_progress' ? 'En cours' : 'En attente'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onClick={() => setSelectedReport(report)}
            />
          ))}
        </div>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Rapport {selectedReport.id}
                </h3>
                <StatusBadge status={selectedReport.status} />
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Fermer</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Date</h4>
                <p className="mt-1">{new Date(selectedReport.date).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Équipement</h4>
                <p className="mt-1">{selectedReport.equipment}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Client</h4>
                <p className="mt-1">{selectedReport.client}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Technicien</h4>
                <p className="mt-1">{selectedReport.technician}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Description</h4>
                <p className="mt-1">{selectedReport.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}