import React, { useState, useEffect, useCallback } from 'react';
import { tasksAPI, updateTask } from '../../services/api';
import { toast } from 'react-toastify';
import TaskList from '../../components/TaskList';
import TaskForm from '../../components/TaskForm';
import TaskFilters from '../../components/TaskFilters';
import ShareTaskModal from '../../components/ShareTaskModal';
import { useAuth } from '../../hooks/useAuth';

const Tasks = () => {
  const { user, isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showEditTask, setShowEditTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: '',
    category: 'all',
    dueDate: 'all'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTasks: 0,
    limit: 10
  });
  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch tasks
  const fetchTasks = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      
      // Check authentication
      console.log('Authentication status:', { isAuthenticated, user: user?.email });
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      const params = {
        page,
        limit: pagination.limit,
        sortBy,
        order: sortOrder,
        ...filters
      };
      console.log('Fetching tasks with params:', params);
      const response = await tasksAPI.getTasks(params);
      console.log('API Response:', response);
      
      // Handle different response formats
      let tasksArray = [];
      let totalPages = 1;
      let totalTasks = 0;
      
      if (response && response.data) {
        // Check if response.data is an array (direct tasks)
        if (Array.isArray(response.data)) {
          tasksArray = response.data;
          totalTasks = response.data.length;
        }
        // Check if response.data has a tasks property
        else if (response.data.tasks && Array.isArray(response.data.tasks)) {
          tasksArray = response.data.tasks;
          totalTasks = response.data.totalTasks || response.data.tasks.length;
          totalPages = response.data.totalPages || 1;
        }
        // Check if response.data has a data property with tasks (backend format)
        else if (response.data.data && response.data.data.tasks && Array.isArray(response.data.data.tasks)) {
          tasksArray = response.data.data.tasks;
          totalTasks = response.data.data.totalTasks || response.data.data.tasks.length;
          totalPages = response.data.data.totalPages || 1;
        }
        // Check if response.data has a data property that is an array
        else if (response.data.data && Array.isArray(response.data.data)) {
          tasksArray = response.data.data;
          totalTasks = response.data.totalTasks || response.data.data.length;
          totalPages = response.data.totalPages || 1;
        }
      }
      
      console.log('Tasks found:', tasksArray.length);
      console.log('Tasks array:', tasksArray);
      setTasks(tasksArray);
      setPagination(prev => ({
        ...prev,
        currentPage: page,
        totalPages: totalPages,
        totalTasks: totalTasks,
        hasNext: page * pagination.limit < totalTasks,
        hasPrev: page > 1
      }));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, sortBy, sortOrder, filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Create task
  const handleCreateTask = async (taskData) => {
    try {
      console.log('Creating task with data:', taskData);
      const response = await tasksAPI.createTask(taskData);
      console.log('Create task response:', response);
      
      // Handle different response formats
      let newTask = null;
      if (response && response.data) {
        // Check if response.data is the task directly (most common case)
        if (response.data._id) {
          newTask = response.data;
        }
        // Check if response.data has a task property
        else if (response.data.task && response.data.task._id) {
          newTask = response.data.task;
        }
        // Check if response.data has a data property with task (backend format)
        else if (response.data.data && response.data.data.task && response.data.data.task._id) {
          newTask = response.data.data.task;
        }
        // Check if response.data has a data property that is the task directly
        else if (response.data.data && response.data.data._id) {
          newTask = response.data.data;
        }
      }
      
      if (newTask) {
        console.log('New task created:', newTask);
        setTasks(prev => [newTask, ...prev]);
        setShowAddTask(false); // Hide the form after creating
        toast.success('Task created successfully! 🎉');
        fetchTasks(); // Refresh to update pagination
      } else {
        console.error('Invalid response format:', response);
        console.error('Response data:', response?.data);
        toast.error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    try {
      await tasksAPI.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task && task._id !== taskId));
      toast.success('Task deleted successfully! 🗑️');
      fetchTasks(); // Refresh to update pagination
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  // Share task
  const handleShareTask = (task) => {
    setSelectedTask(task);
    setShowShareModal(true);
  };

  // Handle page change
  const handlePageChange = (page) => {
    fetchTasks(page);
  };

  // Handle filters change
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Handle sort change
  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Calculate task statistics
  const taskStats = {
    total: pagination.totalTasks,
    completed: tasks.filter(t => t && t.status === 'completed').length,
    inProgress: tasks.filter(t => t && t.status === 'in progress').length,
    pending: tasks.filter(t => t && t.status === 'pending').length,
    overdue: tasks.filter(t => {
      if (t && t.dueDate && t.status !== 'completed') {
        return new Date(t.dueDate) < new Date();
      }
      return false;
    }).length
  };

  // Sort options
  const sortOptions = [
    { value: 'createdAt', label: 'Date Created', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { value: 'dueDate', label: 'Due Date', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { value: 'priority', label: 'Priority', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { value: 'title', label: 'Title', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' }
  ];

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowEditTask(true);
  };

  const handleUpdateTask = async (updatedTask) => {
    try {
      console.log('Updating task:', editingTask._id, 'with data:', updatedTask);
      
      // Call your API to update the task
      const result = await updateTask(editingTask._id, updatedTask);
      console.log('Update result:', result);

      // Update your local state
      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.map((task) =>
          task._id === editingTask._id ? result : task
        );
        console.log('Updated tasks:', updatedTasks);
        return updatedTasks;
      });
      
      setShowEditTask(false);
      setEditingTask(null);
      toast.success('Task updated successfully! ✨');
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task. Please try again.');
    }
  };

  // Handle status change
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      console.log('Updating status for task:', taskId, 'to:', newStatus);
      
      const result = await updateTask(taskId, { status: newStatus });
      console.log('Status update result:', result);
      
      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.map((task) =>
          task._id === taskId ? result : task
        );
        console.log('Tasks after status update:', updatedTasks);
        return updatedTasks;
      });
      
      toast.success(`Task status updated to ${newStatus}! ✨`);
    } catch (error) {
      console.error('Failed to update task status:', error);
      toast.error('Failed to update task status. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      {/* Blue Background Overlay when adding task */}
      {showAddTask && (
        <div className="fixed inset-0 bg-gradient-to-br from-[#00eaff]/20 to-[#a259ff]/20 backdrop-blur-sm z-40 transition-all duration-500" />
      )}

      {/* Header */}
      <div className="mb-8 sm:mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gradient-cyan rounded-xl sm:rounded-2xl flex items-center justify-center shadow-cyan border border-[#00eaff]">
              <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#b0b8c1] mb-2 tracking-tight">
                Task Management <span className="text-gradient-cyan">📋</span>
              </h1>
              <p className="text-base sm:text-lg text-[#b0b8c1] font-light">
                Organize and track your tasks efficiently with real-time updates
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Add Task Button */}
            <button
              onClick={() => setShowAddTask(!showAddTask)}
              className={`px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 ${
                showAddTask
                  ? 'bg-gradient-to-r from-[#ff6b6b] to-[#ff8e8e] text-white shadow-lg'
                  : 'bg-gradient-to-r from-[#00eaff] to-[#a259ff] text-[#0a0a0a] hover:brightness-110 shadow-cyan'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {showAddTask ? 'Cancel' : 'Add Task'}
            </button>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-[#43e97b] rounded-full animate-pulse"></div>
              <span className="text-sm text-[#43e97b] font-medium">Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-6 mb-8 sm:mb-12">
        <div className="glass-dark rounded-xl sm:rounded-2xl border border-[#00eaff]/20 p-4 sm:p-6 shadow-dark hover:shadow-cyan transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-[#00eaff]/10 rounded-lg sm:rounded-xl flex items-center justify-center border border-[#00eaff]/30">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-[#00eaff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
          <span className="text-xs sm:text-sm text-[#b0b8c1] font-medium">Total Tasks</span>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient-cyan">{taskStats.total}</div>
        </div>

        <div className="glass-dark rounded-xl sm:rounded-2xl border border-[#43e97b]/20 p-4 sm:p-6 shadow-dark hover:shadow-cyan transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-[#43e97b]/10 rounded-lg sm:rounded-xl flex items-center justify-center border border-[#43e97b]/30">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-[#43e97b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <span className="text-xs sm:text-sm text-[#b0b8c1] font-medium">Completed</span>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#43e97b]">{taskStats.completed}</div>
        </div>

        <div className="glass-dark rounded-xl sm:rounded-2xl border border-[#00eaff]/20 p-4 sm:p-6 shadow-dark hover:shadow-cyan transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-[#00eaff]/10 rounded-lg sm:rounded-xl flex items-center justify-center border border-[#00eaff]/30">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-[#00eaff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <span className="text-xs sm:text-sm text-[#b0b8c1] font-medium">In Progress</span>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#00eaff]">{taskStats.inProgress}</div>
        </div>

        <div className="glass-dark rounded-xl sm:rounded-2xl border border-[#f1c27d]/20 p-4 sm:p-6 shadow-dark hover:shadow-cyan transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-[#f1c27d]/10 rounded-lg sm:rounded-xl flex items-center justify-center border border-[#f1c27d]/30">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-[#f1c27d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <span className="text-xs sm:text-sm text-[#b0b8c1] font-medium">Pending</span>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#f1c27d]">{taskStats.pending}</div>
        </div>

        <div className="glass-dark rounded-xl sm:rounded-2xl border border-[#ff6b6b]/20 p-4 sm:p-6 shadow-dark hover:shadow-cyan transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-[#ff6b6b]/10 rounded-lg sm:rounded-xl flex items-center justify-center border border-[#ff6b6b]/30">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-[#ff6b6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <span className="text-xs sm:text-sm text-[#b0b8c1] font-medium">Overdue</span>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#ff6b6b]">{taskStats.overdue}</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
        {/* Left Sidebar - Filters */}
        <div className="lg:col-span-1">
          <div className="glass-dark rounded-2xl border border-[#00eaff]/20 p-6 shadow-dark sticky top-6">
            <h2 className="text-lg font-bold text-[#00eaff] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </h2>
            <TaskFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Add Task Form - Overlay */}
          {showAddTask && (
            <div className="relative z-50">
              <div className="glass-dark rounded-2xl border border-[#00eaff]/20 p-6 shadow-cyan">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-[#00eaff] flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create New Task
                  </h2>
                </div>
                <TaskForm 
                  onSubmit={handleCreateTask} 
                  onCancel={() => setShowAddTask(false)}
                />
              </div>
            </div>
          )}

          {/* Task List */}
          <div className="glass-dark rounded-2xl border border-[#00eaff]/20 p-6 shadow-dark">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#00eaff] flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Task List ({taskStats.total})
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'bg-[#00eaff]/20 text-[#00eaff] border border-[#00eaff]/30' 
                      : 'text-[#b0b8c1] hover:text-[#00eaff] hover:bg-[#00eaff]/10'
                  }`}
                  aria-label="Switch to list view"
                  title="Switch to list view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'grid' 
                      ? 'bg-[#00eaff]/20 text-[#00eaff] border border-[#00eaff]/30' 
                      : 'text-[#b0b8c1] hover:text-[#00eaff] hover:bg-[#00eaff]/10'
                  }`}
                  aria-label="Switch to grid view"
                  title="Switch to grid view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>
            </div>
            
            <TaskList
              tasks={tasks}
              loading={loading}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onShare={handleShareTask}
              onStatusChange={handleStatusChange}
              viewMode={viewMode}
              setViewMode={setViewMode}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
              sortOptions={sortOptions}
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>

      {/* Share Task Modal */}
      {showShareModal && selectedTask && (
        <ShareTaskModal
          task={selectedTask}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Edit Task Modal */}
      {showEditTask && editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowEditTask(false)} />
          
          {/* Modal */}
          <div className="relative z-10 w-full max-w-2xl">
            <TaskForm 
              task={editingTask}
              onSubmit={handleUpdateTask} 
              onCancel={() => {
                setShowEditTask(false);
                setEditingTask(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks; 