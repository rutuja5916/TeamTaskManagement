import api from './api';

export const getComments = async (taskId) => {
    const response = await api.get(`/Task/${taskId}/comments`);
    return response.data;
};

export const createComment = async (taskId, data) => {
    const response = await api.post(
        `/Task/${taskId}/comments`,
        data
    );

    return response.data;
};

export const deleteComment = async (commentId) => {
    const response = await api.delete(`/Comment/${commentId}`);
    return response.data;
};