import api from './api';

export const getNotifications = async () => {
    const response = await api.get('/Notification');
    return response.data;
};

export const markAsRead = async (id) => {
    const response = await api.put(
        `/Notification/${id}/read`
    );

    return response.data;
};