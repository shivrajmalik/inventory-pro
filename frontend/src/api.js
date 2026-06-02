import axios from 'axios';

// Use relative URLs so Vite dev-server proxy forwards /api/* → FastAPI on :8000
const api = axios.create({
  baseURL: '',
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  login: async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const response = await api.post('/api/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  register: async (username, password) => {
    const response = await api.post('/api/auth/register', { username, password });
    return response.data;
  },
  me: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  }
};

export const productsAPI = {
  getAll: () => api.get('/api/products').then(res => res.data),
  getOne: (id) => api.get(`/api/products/${id}`).then(res => res.data),
  create: (data) => api.post('/api/products', data).then(res => res.data),
  update: (id, data) => api.put(`/api/products/${id}`, data).then(res => res.data),
  delete: (id) => api.delete(`/api/products/${id}`).then(res => res.data),
};

export const customersAPI = {
  getAll: () => api.get('/api/customers').then(res => res.data),
  getOne: (id) => api.get(`/api/customers/${id}`).then(res => res.data),
  create: (data) => api.post('/api/customers', data).then(res => res.data),
  update: (id, data) => api.put(`/api/customers/${id}`, data).then(res => res.data),
  delete: (id) => api.delete(`/api/customers/${id}`).then(res => res.data),
};

export const ordersAPI = {
  getAll: () => api.get('/api/orders').then(res => res.data),
  getOne: (id) => api.get(`/api/orders/${id}`).then(res => res.data),
  create: (data) => api.post('/api/orders', data).then(res => res.data),
  delete: (id) => api.delete(`/api/orders/${id}`).then(res => res.data),
};

export const statsAPI = {
  getStats: () => api.get('/api/stats').then(res => res.data),
};

export default api;
