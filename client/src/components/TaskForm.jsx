import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const TaskForm = ({ task, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    dueDate: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
      });
    }
  }, [task]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    setLoading(true);

    try {
      if (task) {
        await onSubmit(formData);
      } else {
        await onSubmit(formData);
      }
    } catch (error) {
      console.error('Task form error:', error);
      toast.error('Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-dark rounded-xl sm:rounded-2xl border border-[#00eaff]/20 p-4 sm:p-6 shadow-dark max-w-2xl w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-cyan rounded-xl sm:rounded-2xl flex items-center justify-center shadow-cyan border border-[#00eaff]">
            <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={task ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
            </svg>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#b0b8c1]">
              {task ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-sm sm:text-base text-[#b0b8c1] font-light">
              {task ? 'Update your task details' : 'Add a new task to your workflow'}
            </p>
          </div>
        </div>
        
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 rounded-lg sm:rounded-xl glass-dark border border-[#00eaff]/20 text-[#00eaff] hover:bg-[#00eaff]/10 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm sm:text-base font-medium text-[#00eaff] mb-2">
            Task Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-[#1a1a1a]/50 border border-[#00eaff]/20 rounded-lg sm:rounded-xl text-[#b0b8c1] placeholder-[#b0b8c1]/50 focus:outline-none focus:border-[#00eaff]/40 focus:ring-2 focus:ring-[#00eaff]/20 transition-all duration-300"
            placeholder="Enter task title"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm sm:text-base font-medium text-[#00eaff] mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 bg-[#1a1a1a]/50 border border-[#00eaff]/20 rounded-lg sm:rounded-xl text-[#b0b8c1] placeholder-[#b0b8c1]/50 focus:outline-none focus:border-[#00eaff]/40 focus:ring-2 focus:ring-[#00eaff]/20 transition-all duration-300 resize-none"
            placeholder="Enter task description"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="priority" className="block text-sm sm:text-base font-medium text-[#00eaff] mb-2">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#1a1a1a]/50 border border-[#00eaff]/20 rounded-lg sm:rounded-xl text-[#b0b8c1] focus:outline-none focus:border-[#00eaff]/40 focus:ring-2 focus:ring-[#00eaff]/20 transition-all duration-300"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm sm:text-base font-medium text-[#00eaff] mb-2">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#1a1a1a]/50 border border-[#00eaff]/20 rounded-lg sm:rounded-xl text-[#b0b8c1] focus:outline-none focus:border-[#00eaff]/40 focus:ring-2 focus:ring-[#00eaff]/20 transition-all duration-300"
            >
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm sm:text-base font-medium text-[#00eaff] mb-2">
            Due Date
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#1a1a1a]/50 border border-[#00eaff]/20 rounded-lg sm:rounded-xl text-[#b0b8c1] focus:outline-none focus:border-[#00eaff]/40 focus:ring-2 focus:ring-[#00eaff]/20 transition-all duration-300"
          />
        </div>

        {/* Priority Indicator */}
        <div className="flex items-center gap-4 p-4 rounded-lg sm:rounded-xl glass-dark border border-[#00eaff]/20">
          <div className={`h-4 w-4 rounded-full ${
            formData.priority === 'high' ? 'bg-[#ff6b6b]' :
            formData.priority === 'medium' ? 'bg-[#f1c27d]' :
            'bg-[#43e97b]'
          }`} />
          <div>
            <p className="text-sm sm:text-base font-medium text-[#00eaff] capitalize">
              {formData.priority} Priority
            </p>
            <p className="text-xs sm:text-sm text-[#b0b8c1]">
              {formData.priority === 'high' ? 'Urgent - needs immediate attention' :
               formData.priority === 'medium' ? 'Important - should be done soon' :
               'Normal - can be done when convenient'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-lg sm:rounded-xl glass-dark border border-[#00eaff]/20 text-[#00eaff] hover:bg-[#00eaff]/10 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-6 py-3 rounded-lg sm:rounded-xl font-medium flex items-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {task ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {task ? 'Update Task' : 'Create Task'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm; 