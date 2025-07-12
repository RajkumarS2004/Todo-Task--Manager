import React, { useState } from 'react';

const TaskFilters = ({ filters, onFiltersChange, onFilterChange }) => {
  const [dark] = useState(false);

  const handleChange = (name, value) => {
    const changeHandler = onFiltersChange || onFilterChange;
    changeHandler({ [name]: value });
  };

  return (
    <div className="space-y-6">
      {/* Status Filter */}
      <div>
        <label htmlFor="status-filter" className={`block text-sm font-semibold ${dark ? 'text-[#f1c27d]' : 'text-[#bfa06a]'} mb-3`}>
          Status
        </label>
        <select
          id="status-filter"
          name="status"
          value={filters.status}
          onChange={(e) => handleChange('status', e.target.value)}
          className={`w-full px-4 py-3 rounded-2xl border ${dark ? 'border-[#bfa06a]/30 bg-[#232526]/50 text-[#e2e8f0]' : 'border-[#f1c27d]/30 bg-white/50 text-[#6b7280]'} focus:outline-none focus:ring-2 ${dark ? 'focus:ring-[#bfa06a]' : 'focus:ring-[#f1c27d]'} focus:border-transparent transition-all duration-300`}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Priority Filter */}
      <div>
        <label htmlFor="priority-filter" className={`block text-sm font-semibold ${dark ? 'text-[#f1c27d]' : 'text-[#bfa06a]'} mb-3`}>
          Priority
        </label>
        <select
          id="priority-filter"
          name="priority"
          value={filters.priority}
          onChange={(e) => handleChange('priority', e.target.value)}
          className={`w-full px-4 py-3 rounded-2xl border ${dark ? 'border-[#bfa06a]/30 bg-[#232526]/50 text-[#e2e8f0]' : 'border-[#f1c27d]/30 bg-white/50 text-[#6b7280]'} focus:outline-none focus:ring-2 ${dark ? 'focus:ring-[#bfa06a]' : 'focus:ring-[#f1c27d]'} focus:border-transparent transition-all duration-300`}
        >
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Sort By */}
      <div>
        <label htmlFor="sort-by-filter" className={`block text-sm font-semibold ${dark ? 'text-[#f1c27d]' : 'text-[#bfa06a]'} mb-3`}>
          Sort By
        </label>
        <select
          id="sort-by-filter"
          name="sortBy"
          value={filters.sortBy}
          onChange={(e) => handleChange('sortBy', e.target.value)}
          className={`w-full px-4 py-3 rounded-2xl border ${dark ? 'border-[#bfa06a]/30 bg-[#232526]/50 text-[#e2e8f0]' : 'border-[#f1c27d]/30 bg-white/50 text-[#6b7280]'} focus:outline-none focus:ring-2 ${dark ? 'focus:ring-[#bfa06a]' : 'focus:ring-[#f1c27d]'} focus:border-transparent transition-all duration-300`}
        >
          <option value="createdAt">Created Date</option>
          <option value="updatedAt">Updated Date</option>
          <option value="dueDate">Due Date</option>
          <option value="title">Title</option>
          <option value="priority">Priority</option>
          <option value="status">Status</option>
        </select>
      </div>

      {/* Sort Order */}
      <div>
        <label htmlFor="sort-order-filter" className={`block text-sm font-semibold ${dark ? 'text-[#f1c27d]' : 'text-[#bfa06a]'} mb-3`}>
          Sort Order
        </label>
        <select
          id="sort-order-filter"
          name="order"
          value={filters.order}
          onChange={(e) => handleChange('order', e.target.value)}
          className={`w-full px-4 py-3 rounded-2xl border ${dark ? 'border-[#bfa06a]/30 bg-[#232526]/50 text-[#e2e8f0]' : 'border-[#f1c27d]/30 bg-white/50 text-[#6b7280]'} focus:outline-none focus:ring-2 ${dark ? 'focus:ring-[#bfa06a]' : 'focus:ring-[#f1c27d]'} focus:border-transparent transition-all duration-300`}
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      {/* Items Per Page */}
      <div>
        <label htmlFor="limit-filter" className={`block text-sm font-semibold ${dark ? 'text-[#f1c27d]' : 'text-[#bfa06a]'} mb-3`}>
          Items Per Page
        </label>
        <select
          id="limit-filter"
          name="limit"
          value={filters.limit}
          onChange={(e) => handleChange('limit', parseInt(e.target.value))}
          className={`w-full px-4 py-3 rounded-2xl border ${dark ? 'border-[#bfa06a]/30 bg-[#232526]/50 text-[#e2e8f0]' : 'border-[#f1c27d]/30 bg-white/50 text-[#6b7280]'} focus:outline-none focus:ring-2 ${dark ? 'focus:ring-[#bfa06a]' : 'focus:ring-[#f1c27d]'} focus:border-transparent transition-all duration-300`}
        >
          <option value={10}>10 items</option>
          <option value={20}>20 items</option>
          <option value={50}>50 items</option>
          <option value={100}>100 items</option>
        </select>
      </div>

      {/* Clear Filters Button */}
      <button
        onClick={() => {
          const changeHandler = onFiltersChange || onFilterChange;
          changeHandler({
            status: '',
            priority: '',
            sortBy: 'createdAt',
            order: 'desc',
            limit: 20,
            page: 1
          });
        }}
        className={`w-full py-3 px-4 bg-gradient-to-r from-[#e2b07a] to-[#f1c27d] text-white rounded-2xl font-semibold shadow-lg hover:from-[#f1c27d] hover:to-[#bfa06a] transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 transform`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Clear Filters
      </button>
    </div>
  );
};

export default TaskFilters; 