import apiClient from './apiClient';

export const analyzeResume = async (file, role) => {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('role', role);

    const response = await apiClient.post('/ai/resume/analyze/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
