export function getPriorityStyles(priority: number) {
  switch (priority) {
    case 1: // High priority
      return {
        bg: 'bg-red-50',
        border: 'border-red-500',
        hover: 'hover:bg-red-100'
      };
    case 2: // Medium priority
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-500',
        hover: 'hover:bg-yellow-100'
      };
    case 3: // Low priority
      return {
        bg: 'bg-green-50',
        border: 'border-green-500',
        hover: 'hover:bg-green-100'
      };
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-500',
        hover: 'hover:bg-gray-100'
      };
  }
}
