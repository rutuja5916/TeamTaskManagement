import api from './api';

export const getDashboard = async () => {
    const response = await api.get('/Dashboard');
    return response.data;
};