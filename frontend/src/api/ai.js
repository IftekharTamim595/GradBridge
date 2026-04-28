import apiClient from './apiClient'

/**
 * AI API handler for GradBridge
 */
export const analyzeResume = async (file, role = 'fullstack') => {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('role', role);
    return apiClient.post('/ai/resume/analyze/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const getResumeInsights = async (resumeText) => {
    return apiClient.post('/ai/resume-insights/', { resume_text: resumeText })
};

export const chatWithAI = async (message, context = {}) => {
    return apiClient.post('/ai/chat/', { message, context })
};

const aiApi = {
    analyzeResume,
    getResumeInsights,
    chat: chatWithAI,
    getJobMatches: async () => {
        return apiClient.get('/jobs/recommendations/')
    }
}

export default aiApi
