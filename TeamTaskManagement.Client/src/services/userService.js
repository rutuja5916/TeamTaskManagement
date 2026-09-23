import api from './api';

export const getUsers = async () => {
    const response = await api.get('/User');
    return response.data;
};

export const getUserById = async (id) => {
    const response = await api.get(`/User/${id}`);
    return response.data;
};

export const updateUserStatus = async (id, isActive) => {
    const response = await api.put(
        `/User/${id}/status`,
        { isActive }
    );

    return response.data;
};

export const updateUserRole = async (id, roleId) => {
    const response = await api.put(
        `/User/${id}/role`,
        { roleId }
    );

    return response.data;
};