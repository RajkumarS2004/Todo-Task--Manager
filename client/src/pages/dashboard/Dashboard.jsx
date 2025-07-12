import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { tasksAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentTasks, setRecentTasks] = useState([]);
  const [productivityScore, setProductivityScore] = useState(0);
  const [streakDays, setStreakDays] = useState(0);

  // Fetch tasks for dashboard overview
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getTasks({ limit: 10, sortBy: 'createdAt', order: 'desc' });
      console.log('Dashboard API Response:', response);
      
      // Handle different response formats
      let tasksArray = [];
      if (response && response.data) {
        // Check if response.data has a data property with tasks (backend format)
        if (response.data.data && response.data.data.tasks && Array.isArray(response.data.data.tasks)) {
          tasksArray = response.data.data.tasks;
        }
        // Check if response.data has a tasks property
        else if (response.data.tasks && Array.isArray(response.data.tasks)) {
          tasksArray = response.data.tasks;
        }
        // Check if response.data is an array (direct tasks)
        else if (Array.isArray(response.data)) {
          tasksArray = response.data;
        }
        // Check if response.data has a data property that is an array
        else if (response.data.data && Array.isArray(response.data.data)) {
          tasksArray = response.data.data;
        }
      }
      
      console.log('Dashboard tasks found:', tasksArray.length);
      console.log('Dashboard tasks array:', tasksArray);
      setTasks(tasksArray);
      setRecentTasks(tasksArray.slice(0, 5)); // Show only 5 most recent
      
      // Calculate productivity metrics
      calculateProductivityMetrics(tasksArray);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      toast.error('Failed to load dashboard data');
      setTasks([]);
      setRecentTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateProductivityMetrics = (taskList) => {
    // Ensure taskList is an array
    if (!Array.isArray(taskList)) {
      taskList = [];
    }
    
    const total = taskList.length;
    const completed = taskList.filter(t => t && t.status === 'completed').length;
    const inProgress = taskList.filter(t => t && t.status === 'in progress').length;
    const overdue = taskList.filter(t => {
      if (t && t.dueDate && t.status !== 'completed') {
        return new Date(t.dueDate) < new Date();
      }
      return false;
    }).length;

    // Calculate productivity score (0-100)
    const score = total > 0 ? Math.round(((completed * 2) + inProgress - overdue) / (total * 2) * 100) : 0;
    setProductivityScore(Math.max(0, Math.min(100, score)));

    // Calculate streak (simplified - in real app would track daily completion)
    const todayCompleted = taskList.filter(t => 
      t && t.status === 'completed' && 
      t.updatedAt && new Date(t.updatedAt).toDateString() === new Date().toDateString()
    ).length;
    setStreakDays(todayCompleted > 0 ? 1 : 0); // Simplified streak calculation
  };

  useEffect(() => {
    console.log('Dashboard: User authenticated:', !!user);
    console.log('Dashboard: User data:', user);
    if (user) {
      fetchTasks();
    } else {
      console.log('Dashboard: No user found, skipping task fetch');
    }
  }, [user]);

  // Calculate dashboard stats
  const totalTasks = Array.isArray(tasks) ? tasks.length : 0;
  const completedTasks = Array.isArray(tasks) ? tasks.filter(t => t && t.status === 'completed').length : 0;
  const overdueTasks = Array.isArray(tasks) ? tasks.filter(t => {
    if (t && t.dueDate && t.status !== 'completed') {
      return new Date(t.dueDate) < new Date();
    }
    return false;
  }).length : 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Enhanced quick action cards with modern design
  const quickActions = [
    {
      title: 'Create Task',
      description: 'Add new task',
      icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
      href: '/dashboard/tasks',
      gradient: 'from-[#00eaff] to-[#a259ff]',
      bgGradient: 'from-[#1a1a1a] to-[#1a1a1a]',
      borderColor: 'border-[#00eaff]',
      hoverGradient: 'hover:from-[#00eaff]/20 hover:to-[#a259ff]/20',
      badge: 'New'
    },
    {
      title: 'View Tasks',
      description: 'Manage tasks',
      icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
      href: '/dashboard/tasks',
      gradient: 'from-[#f1c27d] to-[#bfa06a]',
      bgGradient: 'from-[#1a1a1a] to-[#1a1a1a]',
      borderColor: 'border-[#f1c27d]',
      hoverGradient: 'hover:from-[#f1c27d]/20 hover:to-[#bfa06a]/20',
      count: totalTasks
    },
    {
      title: 'Analytics',
      description: 'View insights',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      href: '/dashboard/analytics',
      gradient: 'from-[#00eaff] to-[#a259ff]',
      bgGradient: 'from-[#1a1a1a] to-[#1a1a1a]',
      borderColor: 'border-[#00eaff]',
      hoverGradient: 'hover:from-[#00eaff]/20 hover:to-[#a259ff]/20'
    },
    {
      title: 'Share Tasks',
      description: 'Collaborate',
      icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z',
      href: '/dashboard/tasks',
      gradient: 'from-[#f1c27d] to-[#bfa06a]',
      bgGradient: 'from-[#1a1a1a] to-[#1a1a1a]',
      borderColor: 'border-[#f1c27d]',
      hoverGradient: 'hover:from-[#f1c27d]/20 hover:to-[#bfa06a]/20',
      badge: 'Live'
    }
  ];

  // Productivity insights
  const productivityInsights = [
    {
      title: 'Productivity Score',
      value: `${productivityScore}%`,
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      color: 'text-[#00eaff]',
      bgColor: 'bg-[#00eaff]/10',
      borderColor: 'border-[#00eaff]/30'
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'text-[#43e97b]',
      bgColor: 'bg-[#43e97b]/10',
      borderColor: 'border-[#43e97b]/30'
    },
    {
      title: 'Streak Days',
      value: `${streakDays} days`,
      icon: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z',
      color: 'text-[#f1c27d]',
      bgColor: 'bg-[#f1c27d]/10',
      borderColor: 'border-[#f1c27d]/30'
    },
    {
      title: 'Overdue Tasks',
      value: overdueTasks,
      icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'text-[#ff6b6b]',
      bgColor: 'bg-[#ff6b6b]/10',
      borderColor: 'border-[#ff6b6b]/30'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      {/* Welcome Header */}
      <div className="mb-8 sm:mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-4">
          <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gradient-cyan rounded-xl sm:rounded-2xl flex items-center justify-center shadow-cyan border border-[#00eaff]">
            <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#b0b8c1] mb-2 tracking-tight">
              Welcome back, <span className="text-gradient-cyan capitalize">{user?.name}</span>! 👋
            </h1>
            <p className="text-base sm:text-lg text-[#b0b8c1] font-light">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-[#43e97b] rounded-full animate-pulse"></div>
            <span className="text-sm text-[#43e97b] font-medium">Live</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
        {productivityInsights.map((insight, index) => (
          <div key={index} className="glass-dark rounded-xl sm:rounded-2xl border border-[#00eaff]/20 p-4 sm:p-6 shadow-dark hover:shadow-cyan transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className={`h-10 w-10 sm:h-12 sm:w-12 ${insight.bgColor} rounded-lg sm:rounded-xl flex items-center justify-center border ${insight.borderColor} group-hover:scale-110 transition-transform duration-200`}>
                <svg className={`h-5 w-5 sm:h-6 sm:w-6 ${insight.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={insight.icon} />
                </svg>
              </div>
            </div>
            <span className="text-xs sm:text-sm text-[#b0b8c1] font-medium">{insight.title}</span>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient-cyan">{insight.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8 sm:mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gradient-cyan tracking-tight">Quick Actions</h2>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 bg-[#00eaff] rounded-full animate-pulse"></div>
            <span className="text-sm text-[#00eaff] font-medium">Real-time</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.href}
              className="group glass-dark rounded-xl sm:rounded-2xl border border-[#00eaff]/20 p-4 sm:p-6 shadow-dark hover:shadow-cyan transition-all duration-300 flex flex-col items-center text-center gap-3 relative overflow-hidden"
              aria-label={action.title}
            >
              <div className={`h-12 w-12 sm:h-16 sm:w-16 flex items-center justify-center rounded-xl sm:rounded-2xl border ${action.borderColor} bg-gradient-to-br ${action.bgGradient} group-hover:scale-110 transition-transform duration-300`}>
                <svg className={`h-6 w-6 sm:h-8 sm:w-8 bg-gradient-to-r ${action.gradient} bg-clip-text text-transparent`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                </svg>
              </div>
              
              <div className="flex items-center justify-center gap-2">
                <h3 className={`text-sm sm:text-base font-bold bg-gradient-to-r ${action.gradient} bg-clip-text text-transparent`}>
                  {action.title}
                </h3>
                {action.badge && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-[#ff6b6b] to-[#ff8e8e] text-white rounded-full">
                    {action.badge}
                  </span>
                )}
              </div>
              
              <p className="text-xs sm:text-sm text-[#b0b8c1]">{action.description}</p>
              
              {action.count !== undefined && (
                <span className="text-xs sm:text-sm font-bold text-[#00eaff] bg-[#00eaff]/10 px-2 py-1 rounded-full border border-[#00eaff]/20">
                  {action.count} tasks
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gradient-cyan tracking-tight">Recent Tasks</h2>
            <div className="h-1.5 w-1.5 bg-[#43e97b] rounded-full animate-pulse"></div>
          </div>
          <Link 
            to="/dashboard/tasks" 
            className="text-sm sm:text-base text-[#00eaff] hover:text-[#a259ff] font-medium transition-colors flex items-center gap-1 group"
            aria-label="View all tasks"
          >
            View All 
            <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="glass-dark rounded-xl sm:rounded-2xl border border-[#00eaff]/20 p-4 sm:p-6 animate-pulse h-24 sm:h-32" />
            ))}
          </div>
        ) : recentTasks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {recentTasks.map((task) => (
              <div key={task._id} className="glass-dark rounded-xl sm:rounded-2xl border border-[#00eaff]/20 p-4 sm:p-6 shadow-dark hover:shadow-cyan transition-all duration-300 group">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm sm:text-base font-semibold text-[#00eaff] line-clamp-1 flex-1 group-hover:text-[#a259ff] transition-colors duration-200">
                    {task.title}
                  </h3>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full font-medium ${
                    task.status === 'completed' 
                      ? 'bg-[#43e97b]/20 text-[#43e97b] border border-[#43e97b]/30'
                      : task.status === 'in progress'
                      ? 'bg-[#00eaff]/20 text-[#00eaff] border border-[#00eaff]/30'
                      : 'bg-[#f1c27d]/20 text-[#f1c27d] border border-[#f1c27d]/30'
                  }`}>
                    {task.status}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#b0b8c1] line-clamp-2 mb-4">{task.description}</p>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full font-medium ${
                      task.priority === 'high' 
                        ? 'bg-[#ff6b6b]/20 text-[#ff6b6b] border border-[#ff6b6b]/30'
                        : task.priority === 'medium'
                        ? 'bg-[#f1c27d]/20 text-[#f1c27d] border border-[#f1c27d]/30'
                        : 'bg-[#43e97b]/20 text-[#43e97b] border border-[#43e97b]/30'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  <span className="text-[#b0b8c1]">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-cyan rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-cyan border border-[#00eaff]">
              <svg className="h-8 w-8 sm:h-10 sm:w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gradient-cyan mb-3">No tasks yet</h3>
            <p className="text-base sm:text-lg text-[#b0b8c1] mb-6 max-w-md mx-auto font-light">
              Start by creating your first task to boost productivity and track your progress!
            </p>
            <Link 
              to="/dashboard/tasks" 
              className="btn-primary inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold"
              aria-label="Create first task"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create First Task
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 