import type { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onComplete: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskItem({ task, onComplete, onDelete }: TaskItemProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-gray-800 font-medium break-words">{task.title}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
              {task.category}
            </span>
            <span className="text-xs text-gray-500">{formatDate(task.createdAt)}</span>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onComplete(task)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Mark as complete"
          >
            ✓
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
