import { useState } from 'react';
import TaskItem from './TaskItem';
import ShareTaskModal from './ShareTaskModal';

const TaskList = ({ 
  tasks = [], 
  loading, 
  onEdit, 
  onDelete, 
  onShare, 
  onStatusChange,
  viewMode = 'list',
  setViewMode,
  sortBy,
  sortOrder,
  onSortChange,
  sortOptions = [],
  pagination, 
  onPageChange 
}) => {
  const [shareModal, setShareModal] = useState({ show: false, taskId: null });
  
  // Debug logging
  // console.log('TaskList received tasks:', tasks);
  // console.log('TaskList loading:', loading);
  // console.log('TaskList tasks length:', tasks?.length);

  const handleShare = (taskId) => {
    setShareModal({ show: true, taskId });
  };

  const handleShareSubmit = async (email) => {
    try {
      await onShare(shareModal.taskId, email);
      setShareModal({ show: false, taskId: null });
    } catch {
      // error handled in parent
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading Skeleton */}
        {[...Array(3)].map((_, index) => (
          <div key={index} className="glass-dark rounded-2xl border border-[#00eaff]/20 p-6 shadow-dark animate-pulse">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-12 w-12 bg-[#1a1a1a]/50 rounded-xl"></div>
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-[#1a1a1a]/50 rounded-lg w-3/4"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-[#1a1a1a]/50 rounded-full w-16"></div>
                  <div className="h-6 bg-[#1a1a1a]/50 rounded-full w-20"></div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-10 w-10 bg-[#1a1a1a]/50 rounded-xl"></div>
                <div className="h-10 w-10 bg-[#1a1a1a]/50 rounded-xl"></div>
                <div className="h-10 w-10 bg-[#1a1a1a]/50 rounded-xl"></div>
              </div>
            </div>
            <div className="h-4 bg-[#1a1a1a]/50 rounded-lg w-full mb-4"></div>
            <div className="flex justify-between items-center pt-4 border-t border-[#00eaff]/10">
              <div className="flex gap-4">
                <div className="h-6 bg-[#1a1a1a]/50 rounded-lg w-24"></div>
                <div className="h-6 bg-[#1a1a1a]/50 rounded-lg w-32"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="glass-dark rounded-2xl border border-[#00eaff]/20 p-12 shadow-dark text-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="h-20 w-20 bg-gradient-to-br from-[#00eaff] to-[#a259ff] rounded-2xl flex items-center justify-center border border-[#00eaff] shadow-cyan">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            {/* Floating particles */}
            <div className="absolute -top-2 -right-2 h-4 w-4 bg-[#43e97b] rounded-full animate-pulse"></div>
            <div className="absolute -bottom-2 -left-2 h-3 w-3 bg-[#f1c27d] rounded-full animate-pulse delay-1000"></div>
          </div>
          <div className="max-w-md">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-[#00eaff] to-[#a259ff] text-transparent bg-clip-text mb-3">
              No tasks yet
            </h3>
            <p className="text-base text-[#b0b8c1] leading-relaxed">
              Start by creating a new task to manage your workflow and boost your productivity. 
              Your tasks will appear here with beautiful styling and real-time updates.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#00eaff]">
            <div className="h-2 w-2 bg-[#00eaff] rounded-full animate-pulse"></div>
            <span>Ready to get started</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sort Controls */}
      {sortOptions && sortOptions.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-sm text-[#b0b8c1]">Sort by:</label>
            <select
              id="sort-select"
              name="sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value, sortOrder)}
              className="bg-[#1a1a1a] border border-[#00eaff]/20 rounded-lg px-3 py-1 text-sm text-[#b0b8c1] focus:outline-none focus:border-[#00eaff]"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1 rounded-lg text-[#b0b8c1] hover:text-[#00eaff] hover:bg-[#00eaff]/10 transition-all duration-300"
              aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>
          
          {/* View Mode Toggle */}
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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Task Items */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
        {tasks.map((task) => (
          <TaskItem
            key={task._id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onShare={handleShare}
            onStatusChange={onStatusChange}
            viewMode={viewMode}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="glass-dark rounded-2xl border border-[#00eaff]/20 p-6 shadow-dark">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-center sm:text-left">
              <div className="text-sm text-[#b0b8c1] mb-1">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="text-xs text-[#b0b8c1]/60">
                {pagination.totalTasks} total tasks
              </div>
            </div>
            <div className="flex gap-3 justify-center sm:justify-end">
              <button
                onClick={() => onPageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 text-sm transition-all duration-300 ${
                  pagination.hasPrev
                    ? 'bg-gradient-to-r from-[#00eaff] to-[#a259ff] text-[#0a0a0a] hover:brightness-110 shadow-cyan'
                    : 'bg-[#1a1a1a] text-[#6b7280] cursor-not-allowed border border-[#333]'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Previous</span>
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
                  const pageNum = index + 1;
                  const isActive = pageNum === pagination.currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-[#00eaff] to-[#a259ff] text-[#0a0a0a] shadow-cyan'
                          : 'text-[#b0b8c1] hover:text-[#00eaff] hover:bg-[#00eaff]/10'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => onPageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 text-sm transition-all duration-300 ${
                  pagination.hasNext
                    ? 'bg-gradient-to-r from-[#00eaff] to-[#a259ff] text-[#0a0a0a] hover:brightness-110 shadow-cyan'
                    : 'bg-[#1a1a1a] text-[#6b7280] cursor-not-allowed border border-[#333]'
                }`}
              >
                <span className="hidden sm:inline">Next</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareModal.show && (
        <ShareTaskModal
          onSubmit={handleShareSubmit}
          onCancel={() => setShareModal({ show: false, taskId: null })}
        />
      )}
    </div>
  );
};

export default TaskList;
