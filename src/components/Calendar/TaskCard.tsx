import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Clock, AlertCircle, User, MapPin } from 'lucide-react';
import { Task } from '../../store/taskStore';
import { Menu, MenuItem } from '@mui/material';
import React, { useState } from 'react';
import { useTeamStore } from '../../store/teamStore';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onContextMenu: (e: React.MouseEvent, task: Task) => void;
  compact?: boolean;
  variant?: 'default' | 'month';
  style?: React.CSSProperties;
}

export default function TaskCard({ 
  task, 
  onEdit, 
  compact = false,
  style = {} 
}: TaskCardProps) {
  const { members } = useTeamStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const assignedTechnician = task.technicianId
    ? members.find(m => m.id === task.technicianId)
    : null;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: String(task.id),
    data: {
      type: 'task',
      task
    }
  });

  const dragStyle = transform ? {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : undefined,
  } : undefined;

  const getPriorityStyles = (priority: number) => {
    switch (priority) {
      case 1: // high
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          hover: 'hover:bg-red-100',
          dot: 'bg-red-500'
        };
      case 2: // medium
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-700',
          hover: 'hover:bg-orange-100',
          dot: 'bg-orange-500'
        };
      default:
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          hover: 'hover:bg-green-100',
          dot: 'bg-green-500'
        };
    }
  };

  const priorityStyles = getPriorityStyles(task.priority);

  const getStatusBadgeStyle = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleContextMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleContextMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewDetails = () => {
    handleContextMenuClose();
    // Logique pour afficher les détails de la tâche
    console.log('Voir les détails:', task);
  };

  const handleViewTechnician = () => {
    // Logique pour afficher le technicien assigné
    handleContextMenuClose();
    if (assignedTechnician) {
      console.log('Technicien:', assignedTechnician.name);
    } else {
      console.log('Aucun technicien assigné');
    }
  };

  const handleReport = () => {
    // Logique pour afficher le rapport d'intervention
    handleContextMenuClose();
    if (task.reportNumber) {
      console.log('Rapport d\'intervention:', task.reportNumber);
    } else {
      console.log('Rapport d\'intervention à rédiger');
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...dragStyle, ...style }}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        onEdit(task);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      handleContextMenuOpen(e);
      }}
      className={`
        group relative rounded-lg cursor-move transition-all duration-200
        border-l-4 border-r-4 ${priorityStyles.border} ${priorityStyles.bg} ${priorityStyles.hover}
        ${isDragging ? 'ring-2 ring-indigo-500 shadow-lg z-50' : 'hover:shadow-md'}
        ${compact ? 'p-2' : 'p-3'}
        h-full overflow-hidden flex flex-col
        ${getStatusBadgeStyle(task.status)}
      `}
    >
      <div className="flex items-start justify-between mb-1">
        <span className={`font-medium ${priorityStyles.text} ${compact ? 'text-xs' : 'text-sm'} truncate flex-1`}>
          {task.number} - 
          {task.title}
        </span>
        {task.priority === 1 && !compact && (
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 ml-1" />
        )}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleContextMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>Voir les détails</MenuItem>
        <MenuItem onClick={handleViewTechnician}>Voir le technicien</MenuItem>
        <MenuItem onClick={handleReport}>Rapport d'intervention</MenuItem>
      </Menu>
    </div>

      <div className={`flex flex-col ${compact ? 'gap-0.5' : 'gap-1'} flex-1`}>
        <div className="flex items-center text-xs text-gray-600">
          <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
          <span>{task.startTime}</span>
        </div>

        {!compact && assignedTechnician && (
          <div className="flex items-center text-xs text-gray-600">
            <User className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{assignedTechnician.name}</span>
          </div>
        )}

        {!compact && (
          <div className="flex items-center text-xs text-gray-600">
            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{task.client}</span>
          </div>
        )}

        <span className={`text-xs px-2 py-0.5 rounded-full mt-1 ${getStatusBadgeStyle(task.status)}`}>
          {task.status === 'completed' ? 'Terminée' :
           task.status === 'in_progress' ? 'En cours' :
           'En attente'}
        </span>
      </div>
    </div>
  );
}
