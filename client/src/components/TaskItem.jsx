import React from 'react';

const TaskItem = ({ task, onEdit, onDelete, onShare, onStatusChange, viewMode = 'list' }) => {

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-[#43e97b]/10',
          text: 'text-[#43e97b]',
          border: 'border-[#43e97b]/30',
          icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
          gradient: 'from-[#43e97b]/20 to-[#38f9d7]/20'
        };
      case 'in progress':
        return {
          bg: 'bg-[#00eaff]/10',
          text: 'text-[#00eaff]',
          border: 'border-[#00eaff]/30',
          icon: 'M13 10V3L4 14h7v7l9-11h-7z',
          gradient: 'from-[#00eaff]/20 to-[#a259ff]/20'
        };
      default:
        return {
          bg: 'bg-[#f1c27d]/10',
          text: 'text-[#f1c27d]',
          border: 'border-[#f1c27d]/30',
          icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
          gradient: 'from-[#f1c27d]/20 to-[#bfa06a]/20'
        };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return {
          bg: 'bg-[#ff6b6b]/10',
          text: 'text-[#ff6b6b]',
          border: 'border-[#ff6b6b]/30',
          gradient: 'from-[#ff6b6b]/20 to-[#ff8e8e]/20'
        };
      case 'medium':
        return {
          bg: 'bg-[#f1c27d]/10',
          text: 'text-[#f1c27d]',
          border: 'border-[#f1c27d]/30',
          gradient: 'from-[#f1c27d]/20 to-[#bfa06a]/20'
        };
      default:
        return {
          bg: 'bg-[#43e97b]/10',
          text: 'text-[#43e97b]',
          border: 'border-[#43e97b]/30',
          gradient: 'from-[#43e97b]/20 to-[#38f9d7]/20'
        };
    }
  };

  const statusColors = getStatusColor(task.status);
  const priorityColors = getPriorityColor(task.priority);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = task.dueDate && task.status !== 'completed' && new Date(task.dueDate) < new Date();

  return (
    <div className={`group relative ${viewMode === 'grid' ? 'h-full' : ''}`}>
      {/* Hover Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#00eaff]/5 to-[#a259ff]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Main Task Card */}
      <div className={`relative glass-dark rounded-2xl border border-[#00eaff]/20 p-6 shadow-dark hover:shadow-cyan transition-all duration-500 group-hover:scale-[1.02] group-hover:border-[#00eaff]/40 ${viewMode === 'grid' ? 'h-full flex flex-col' : ''}`}>
        
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Status Icon */}
            <div className={`h-12 w-12 ${statusColors.bg} rounded-xl flex items-center justify-center border ${statusColors.border} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
              <svg className={`h-6 w-6 ${statusColors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={statusColors.icon} />
              </svg>
            </div>

            {/* Task Title and Meta */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gradient-cyan mb-2 group-hover:text-[#a259ff] transition-colors duration-300 line-clamp-1">
                {task.title}
              </h3>
              
              {/* Priority and Status Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${priorityColors.bg} ${priorityColors.text} ${priorityColors.border} shadow-sm`}>
                  {task.priority}
                </span>
                <select
                  value={task.status}
                  onChange={(e) => onStatusChange && onStatusChange(task._id, e.target.value)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors.bg} ${statusColors.text} ${statusColors.border} shadow-sm bg-transparent cursor-pointer hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-[#00eaff]/30`}
                >
                  <option value="pending">Pending</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                {isOverdue && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#ff6b6b]/20 text-[#ff6b6b] border border-[#ff6b6b]/30 shadow-sm animate-pulse">
                    Overdue
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => onEdit(task)}
              className="p-2 rounded-xl bg-gradient-to-br from-[#00eaff]/20 to-[#a259ff]/20 border border-[#00eaff]/30 text-[#00eaff] hover:from-[#00eaff]/30 hover:to-[#a259ff]/30 hover:scale-110 transition-all duration-300 shadow-lg"
              title="Edit task"
              aria-label="Edit task"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>

            <button
              onClick={() => onShare(task._id)}
              className="p-2 rounded-xl bg-gradient-to-br from-[#f1c27d]/20 to-[#bfa06a]/20 border border-[#f1c27d]/30 text-[#f1c27d] hover:from-[#f1c27d]/30 hover:to-[#bfa06a]/30 hover:scale-110 transition-all duration-300 shadow-lg"
              title="Share task"
              aria-label="Share task"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>

            <button
              onClick={() => onDelete(task._id)}
              className="p-2 rounded-xl bg-gradient-to-br from-[#ff6b6b]/20 to-[#ff8e8e]/20 border border-[#ff6b6b]/30 text-[#ff6b6b] hover:from-[#ff6b6b]/30 hover:to-[#ff8e8e]/30 hover:scale-110 transition-all duration-300 shadow-lg"
              title="Delete task"
              aria-label="Delete task"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <div className="mb-4">
            <p className="text-sm text-[#b0b8c1] leading-relaxed line-clamp-2 group-hover:text-[#e2e8f0] transition-colors duration-300">
              {task.description}
            </p>
          </div>
        )}

        {/* Footer with Dates */}
        <div className={`flex items-center justify-between pt-4 border-t border-[#00eaff]/10 ${viewMode === 'grid' ? 'mt-auto' : ''}`}>
          <div className="flex items-center gap-4 text-xs text-[#b0b8c1]">
            {task.dueDate && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isOverdue ? 'bg-[#ff6b6b]/10 border border-[#ff6b6b]/20' : 'bg-[#00eaff]/10 border border-[#00eaff]/20'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className={isOverdue ? 'text-[#ff6b6b] font-medium' : 'text-[#00eaff]'}>
                  Due: {formatDate(task.dueDate)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a1a]/50 border border-[#00eaff]/10">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Progress Indicator for In Progress Tasks */}
          {task.status === 'in progress' && (
            <div className="flex items-center gap-2">
              <div className="w-16 h-2 bg-[#1a1a1a]/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#00eaff] to-[#a259ff] rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
              <span className="text-xs text-[#00eaff] font-medium">60%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskItem; 