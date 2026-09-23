import api from './api';

export const getTasks = async (params = {}) => {
    const response = await api.get('/Task', { params });
    return response.data;
};

export const getTaskById = async (id) => {
    const response = await api.get(`/Task/${id}`);
    return response.data;
};

export const createTask = async (data) => {
    const response = await api.post('/Task', data);
    return response.data;
};

export const updateTask = async (id, data) => {
    const response = await api.put(`/Task/${id}`, data);
    return response.data;
};

export const updateTaskStatus = async (id, status) => {
    const response = await api.put(`/Task/${id}/status`, { status });
    return response.data;
};

export const deleteTask = async (id) => {
    const response = await api.delete(`/Task/${id}`);
    return response.data;
};