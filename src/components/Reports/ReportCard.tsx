import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FileText, User, Wrench, Building2 } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface Report {
  id: string;
  date: string;
  equipment: string;
  client: string;
  technician: string;
  status: 'completed' | 'pending' | 'in_progress';
  description: string;
}

interface ReportCardProps {
  report: Report;
  onClick: () => void;
}

export default function ReportCard({ report, onClick }: ReportCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:border-indigo-500 cursor-pointer transition-all duration-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <FileText className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">{report.id}</h3>
            <p className="text-sm text-gray-500">
              {format(new Date(report.date), 'dd MMMM yyyy', { locale: fr })}
            </p>
          </div>
        </div>
        <StatusBadge status={report.status} size="sm" />
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <Building2 className="h-4 w-4 mr-2 text-gray-400" />
          {report.client}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Wrench className="h-4 w-4 mr-2 text-gray-400" />
          {report.equipment}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <User className="h-4 w-4 mr-2 text-gray-400" />
          {report.technician}
        </div>
      </div>

      {report.description && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 line-clamp-2">
            {report.description}
          </p>
        </div>
      )}
    </div>
  );
}