import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  withCredentials: true
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    console.log('API Token exists:', !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  googleAuth: () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const url = `${baseUrl}/auth/google`;
    console.log('Google OAuth URL:', url);
    console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
    window.open(url, '_self');
  },
  githubAuth: () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    window.open(`${baseUrl}/auth/github`, '_self');
  },
  linkedinAuth: () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    window.open(`${baseUrl}/auth/linkedin`, '_self');
  }
};

// Tasks API
export const tasksAPI = {
  getTasks: (params = {}) => api.get('/tasks', { params }),
  getTask: (id) => api.get(`/tasks/${id}`),
  createTask: (taskData) => api.post('/tasks', taskData),
  updateTask: (id, taskData) => {
    return api.put(`/tasks/${id}`, taskData).then(response => {
      // Handle the nested response format from backend
      if (response.data && response.data.data && response.data.data.task) {
        return { data: response.data.data.task };
      } else if (response.data && response.data.data) {
        return { data: response.data.data };
      }
      return response;
    });
  },
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  shareTask: (id, email) => api.post(`/tasks/${id}/share`, { email })
};

export const updateTask = async (taskId, updates) => {
  try {
    console.log('API: Updating task', taskId, 'with:', updates);
    const response = await api.put(`/tasks/${taskId}`, updates);
    console.log('API: Raw response:', response.data);
    
    // Handle the nested response format from backend
    let result;
    if (response.data && response.data.data && response.data.data.task) {
      result = response.data.data.task;
    } else if (response.data && response.data.data) {
      result = response.data.data;
    } else if (response.data) {
      result = response.data;
    } else {
      result = response.data;
    }
    
    console.log('API: Processed result:', result);
    return result;
  } catch (error) {
    console.error('Update task error:', error);
    throw new Error(`Failed to update task: ${error.response?.status || 'Unknown error'}`);
  }
};

export default api; 