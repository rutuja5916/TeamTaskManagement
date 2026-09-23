import api from './api';

export const getTeams = async () => {
    const response = await api.get('/Team');
    return response.data;
};

export const getTeamById = async (id) => {
    const response = await api.get(`/Team/${id}`);
    return response.data;
};

export const createTeam = async (data) => {
    const response = await api.post('/Team', data);
    return response.data;
};

export const updateTeam = async (id, data) => {
    const response = await api.put(`/Team/${id}`, data);
    return response.data;
};

export const deleteTeam = async (id) => {
    const response = await api.delete(`/Team/${id}`);
    return response.data;
};

export const addTeamMember = async (teamId, userId) => {
    const response = await api.post(
        `/Team/${teamId}/members`,
        { userId }
    );

    return response.data;
};

export const getTeamMembers = async (teamId) => {
    const response = await api.get(
        `/Team/${teamId}/members`
    );

    return response.data;
};