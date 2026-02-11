import axios from 'axios'

const apiClient = axios.create({
    baseURL: 'http://localhost:8000/api',
})

// Attach token on every request - only if valid
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken')
    // Validate token is not null, undefined, or string representations of these
    if (token && token !== 'undefined' && token !== 'null' && token.trim() !== '') {
        config.headers.Authorization = `Bearer ${token}`
    } else {
        delete config.headers.Authorization
    }
    return config
})

// Response interceptor to handle 401s and token errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized - auto logout and redirect
        if (error.response?.status === 401) {
            console.warn('Unauthorized access (401). Session expired or invalid token.');

            // Only redirect if not already on login/register pages to avoid loops
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
                // Clear all auth data
                localStorage.removeItem('authToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');

                // Redirect to login
                window.location.href = '/login';
            }
        }

        // Suppress "Given token not valid" alert spam
        if (error.response?.data?.code === 'token_not_valid' ||
            (error.response?.data?.detail && error.response.data.detail.includes('token'))) {
            console.warn('Token invalid or expired:', error.response.data);
        }

        return Promise.reject(error);
    }
)

export default apiClient
