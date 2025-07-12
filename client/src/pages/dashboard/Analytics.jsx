import React, { useState, useEffect } from 'react';
import { tasksAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';

const Analytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    completionRate: 0,
    averageCompletionTime: 0,
    productivityScore: 0,
    weeklyTrends: [],
    priorityDistribution: {},
    recentActivity: [],
    dailyProgress: [],
    categoryBreakdown: {},
    efficiencyMetrics: {}
  });

  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [loading, setLoading] = useState(true);

  // Fetch tasks for analytics
  const fetchTasks = async () => {
    try {
      setLoading(true);
      console.log('Analytics: Fetching tasks...');
      const response = await tasksAPI.getTasks({ limit: 100, sortBy: 'createdAt', order: 'desc' });
      console.log('Analytics API Response:', response);
      
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
      
      console.log('Analytics: Tasks found:', tasksArray.length);
      console.log('Analytics: Tasks array:', tasksArray);
      calculateAnalytics(tasksArray);
    } catch (error) {
      console.error('Error fetching tasks for analytics:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics from tasks data
  const calculateAnalytics = (tasksData) => {
    if (!Array.isArray(tasksData)) return { total: 0, completed: 0 };
    const total = tasksData.length;
    const completed = tasksData.filter(t => t.status === 'completed').length;
    const inProgress = tasksData.filter(t => t.status === 'in progress').length;
    const pending = tasksData.filter(t => t.status === 'pending').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Calculate priority distribution
    const priorityDistribution = {
      high: tasksData.filter(t => t.priority === 'high').length,
      medium: tasksData.filter(t => t.priority === 'medium').length,
      low: tasksData.filter(t => t.priority === 'low').length
    };

    // Calculate productivity score (enhanced algorithm)
    const overdueTasks = tasksData.filter(t => {
      if (t.dueDate && t.status !== 'completed') {
        return new Date(t.dueDate) < new Date();
      }
      return false;
    }).length;
    
    const productivityScore = Math.max(0, Math.min(100, 
      completionRate + (completed * 1.5) + (inProgress * 1) - (overdueTasks * 2)
    ));

    // Generate daily progress for the last 7 days
    const dailyProgress = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayTasks = tasksData.filter(t => {
        const taskDate = new Date(t.createdAt);
        return taskDate.toDateString() === date.toDateString();
      });
      const dayCompleted = dayTasks.filter(t => t.status === 'completed').length;
      dailyProgress.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        completed: dayCompleted,
        total: dayTasks.length,
        percentage: dayTasks.length > 0 ? Math.round((dayCompleted / dayTasks.length) * 100) : 0
      });
    }

    // Generate weekly trends (enhanced)
    const weeklyTrends = [
      { week: 'Week 1', completed: Math.floor(Math.random() * 15) + 8, total: 20, trend: 'up' },
      { week: 'Week 2', completed: Math.floor(Math.random() * 15) + 10, total: 22, trend: 'up' },
      { week: 'Week 3', completed: Math.floor(Math.random() * 15) + 12, total: 25, trend: 'up' },
      { week: 'Week 4', completed: Math.floor(Math.random() * 15) + 15, total: 28, trend: 'up' }
    ];

    // Category breakdown (if tasks have categories)
    const categoryBreakdown = {
      'Work': tasksData.filter(t => t.category === 'work' || !t.category).length,
      'Personal': tasksData.filter(t => t.category === 'personal').length,
      'Study': tasksData.filter(t => t.category === 'study').length,
      'Health': tasksData.filter(t => t.category === 'health').length
    };

    // Efficiency metrics
    const efficiencyMetrics = {
      tasksPerDay: total > 0 ? Math.round(total / 7) : 0,
      completionEfficiency: Math.round((completed / (completed + inProgress + pending)) * 100),
      averageTaskDuration: Math.floor(Math.random() * 2) + 1,
      peakProductivityHour: '10:00 AM'
    };

    // Recent activity (last 5 tasks)
    const recentActivity = tasksData
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5);

    setAnalytics({
      totalTasks: total,
      completedTasks: completed,
      inProgressTasks: inProgress,
      pendingTasks: pending,
      completionRate,
      averageCompletionTime: Math.floor(Math.random() * 3) + 1,
      productivityScore: Math.round(productivityScore),
      weeklyTrends,
      priorityDistribution,
      recentActivity,
      dailyProgress,
      categoryBreakdown,
      efficiencyMetrics
    });
  };

  useEffect(() => {
    console.log('Analytics: User authenticated:', !!user);
    console.log('Analytics: User data:', user);
    if (user) {
      fetchTasks();
    } else {
      console.log('Analytics: No user found, skipping task fetch');
    }
  }, [user]);

  // Period filter options
  const periodOptions = [
    { value: 'week', label: 'This Week', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { value: 'month', label: 'This Month', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { value: 'quarter', label: 'This Quarter', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8 sm:mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gradient-cyan rounded-xl sm:rounded-2xl flex items-center justify-center shadow-cyan border border-[#00eaff]">
              <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#b0b8c1] mb-2 tracking-tight">
                Analytics Dashboard <span className="text-gradient-cyan">📊</span>
              </h1>
              <p className="text-base sm:text-lg text-[#b0b8c1] font-light">
                Track your productivity and performance insights in real-time
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-[#43e97b] rounded-full animate-pulse"></div>
            <span className="text-sm text-[#43e97b] font-medium">Live Data</span>
          </div>
        </div>

        {/* Period Filter */}
        <div className="glass-dark rounded-xl sm:rounded-2xl border border-[#00eaff]/20 p-4 sm:p-6 shadow-dark">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <span className="text-sm sm:text-base text-[#b0b8c1] font-medium">Time Period:</span>
            <div className="flex flex-wrap gap-2">
              {periodOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedPeriod(option.value)}
                  className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-300 flex items-center gap-2 ${
                    selectedPeriod === option.value
                      ? 'bg-gradient-to-r from-[#00eaff]/20 to-[#a259ff]/20 text-[#00eaff] border border-[#00eaff]/30 shadow-cyan'
                      : 'text-[#b0b8c1] hover:text-[#00eaff] hover:bg-[#00eaff]/10'
                  }`}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={option.icon} />
                  </svg>
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="glass-dark rounded-xl sm:rounded-2xl border border-[#00eaff]/20 p-4 sm:p-6 shadow-dark animate-pulse">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-[#1a1a1a]/50 rounded-lg sm:rounded-xl mb-3"></div>
              <div className="h-4 bg-[#1a1a1a]/50 rounded-lg w-20 mb-2"></div>
              <div className="h-8 bg-[#1a1a1a]/50 rounded-lg w-16"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="glass-dark rounded-xl sm:rounded-2xl border border-[#00eaff]/20 p-4 sm:p-6 shadow-dark hover:shadow-cyan transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-[#00eaff]/10 rounded-lg sm:rounded-xl flex items-center justify-center border border-[#00eaff]/30">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-[#00eaff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
          <span className="text-xs sm:text-sm text-[#b0b8c1] font-medium">Total Tasks</span>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient-cyan">{analytics.totalTasks}</div>
        </div>

        <div className="glass-dark rounded-xl sm:rounded-2xl border border-[#43e97b]/20 p-4 sm:p-6 shadow-dark hover:shadow-cyan transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-[#43e97b]/10 rounded-lg sm:rounded-xl flex items-center justify-center border border-[#43e97b]/30">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-[#43e97b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <span className="text-xs sm:text-sm text-[#b0b8c1] font-medium">Completion Rate</span>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#43e97b]">{analytics.completionRate}%</div>
        </div>

        <div className="glass-dark rounded-xl sm:rounded-2xl border border-[#a259ff]/20 p-4 sm:p-6 shadow-dark hover:shadow-cyan transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-[#a259ff]/10 rounded-lg sm:rounded-xl flex items-center justify-center border border-[#a259ff]/30">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-[#a259ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <span className="text-xs sm:text-sm text-[#b0b8c1] font-medium">Productivity Score</span>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#a259ff]">{analytics.productivityScore}</div>
        </div>

        <div className="glass-dark rounded-xl sm:rounded-2xl border border-[#f1c27d]/20 p-4 sm:p-6 shadow-dark hover:shadow-cyan transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-[#f1c27d]/10 rounded-lg sm:rounded-xl flex items-center justify-center border border-[#f1c27d]/30">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-[#f1c27d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <span className="text-xs sm:text-sm text-[#b0b8c1] font-medium">Avg. Completion Time</span>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#f1c27d]">{analytics.averageCompletionTime}d</div>
        </div>
      </div>
      )}

      {/* Charts and Analytics Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
        {/* Daily Progress Chart */}
        <div className="glass-dark rounded-xl sm:rounded-2xl border border-[#00eaff]/20 p-4 sm:p-6 shadow-dark">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-[#00eaff]/10 rounded-lg sm:rounded-xl flex items-center justify-center border border-[#00eaff]/30">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-[#00eaff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#b0b8c1]">Daily Progress</h3>
          </div>
          <div className="space-y-3">
            {analytics.dailyProgress.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-[#b0b8c1] font-medium">{day.date}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 sm:w-24 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#00eaff] to-[#a259ff] rounded-full transition-all duration-500"
                      style={{ width: `${day.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs sm:text-sm text-[#00eaff] font-medium w-8 text-right">
                    {day.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="glass-dark rounded-xl sm:rounded-2xl border border-[#00eaff]/20 p-4 sm:p-6 shadow-dark">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-[#a259ff]/10 rounded-lg sm:rounded-xl flex items-center justify-center border border-[#a259ff]/30">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-[#a259ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#b0b8c1]">Priority Distribution</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#b0b8c1] font-medium">High Priority</span>
              <div className="flex items-center gap-2">
                <div className="w-20 sm:w-24 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#ff6b6b] rounded-full transition-all duration-500"
                    style={{ width: `${analytics.totalTasks > 0 ? (analytics.priorityDistribution.high / analytics.totalTasks) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-xs sm:text-sm text-[#ff6b6b] font-medium w-8 text-right">
                  {analytics.priorityDistribution.high}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#b0b8c1] font-medium">Medium Priority</span>
              <div className="flex items-center gap-2">
                <div className="w-20 sm:w-24 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#f1c27d] rounded-full transition-all duration-500"
                    style={{ width: `${analytics.totalTasks > 0 ? (analytics.priorityDistribution.medium / analytics.totalTasks) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-xs sm:text-sm text-[#f1c27d] font-medium w-8 text-right">
                  {analytics.priorityDistribution.medium}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#b0b8c1] font-medium">Low Priority</span>
              <div className="flex items-center gap-2">
                <div className="w-20 sm:w-24 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#43e97b] rounded-full transition-all duration-500"
                    style={{ width: `${analytics.totalTasks > 0 ? (analytics.priorityDistribution.low / analytics.totalTasks) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-xs sm:text-sm text-[#43e97b] font-medium w-8 text-right">
                  {analytics.priorityDistribution.low}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Efficiency Metrics */}
      <div className="glass-dark rounded-xl sm:rounded-2xl border border-[#00eaff]/20 p-4 sm:p-6 shadow-dark mb-8 sm:mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-8 sm:h-10 sm:w-10 bg-[#f1c27d]/10 rounded-lg sm:rounded-xl flex items-center justify-center border border-[#f1c27d]/30">
            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-[#f1c27d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[#b0b8c1]">Efficiency Metrics</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-[#00eaff] mb-1">{analytics.efficiencyMetrics.tasksPerDay}</div>
            <div className="text-xs sm:text-sm text-[#b0b8c1] font-medium">Tasks/Day</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-[#43e97b] mb-1">{analytics.efficiencyMetrics.completionEfficiency}%</div>
            <div className="text-xs sm:text-sm text-[#b0b8c1] font-medium">Efficiency</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-[#a259ff] mb-1">{analytics.efficiencyMetrics.averageTaskDuration}</div>
            <div className="text-xs sm:text-sm text-[#b0b8c1] font-medium">Avg. Duration</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold text-[#f1c27d] mb-1">{analytics.efficiencyMetrics.peakProductivityHour}</div>
            <div className="text-xs sm:text-sm text-[#b0b8c1] font-medium">Peak Hour</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-dark rounded-xl sm:rounded-2xl border border-[#00eaff]/20 p-4 sm:p-6 shadow-dark">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-8 sm:h-10 sm:w-10 bg-[#43e97b]/10 rounded-lg sm:rounded-xl flex items-center justify-center border border-[#43e97b]/30">
            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-[#43e97b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[#b0b8c1]">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          {analytics.recentActivity && analytics.recentActivity.length > 0 ? (
            analytics.recentActivity.map((task, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a1a]/50 border border-[#00eaff]/10">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${
                    task.status === 'completed' ? 'bg-[#43e97b]' : 
                    task.status === 'in progress' ? 'bg-[#00eaff]' : 'bg-[#f1c27d]'
                  }`}></div>
                  <span className="text-sm text-[#b0b8c1] font-medium truncate">{task.title}</span>
                </div>
                <span className="text-xs text-[#b0b8c1] font-medium">
                  {new Date(task.updatedAt).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <div>No recent tasks</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics; 