import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const getTasks = () => api.get('/tasks');
export const createTask = (data) => api.post('/tasks', data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const toggleTask = (id) => api.patch(`/tasks/${id}/toggle`);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
