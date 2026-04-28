import axios from 'axios'

const apiClient = axios.create({
    baseURL: 'http://localhost:8000/api',
})

// Attach token on every request
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken')
    if (token && token !== 'undefined' && token !== 'null' && token.trim() !== '') {
        config.headers.Authorization = `Bearer ${token}`
    } else {
        delete config.headers.Authorization
    }
    return config
})

// Track if we're currently refreshing to avoid multiple refresh calls
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

// Response interceptor to handle 401s with token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Don't retry auth endpoints
            if (originalRequest.url?.includes('/auth/login') ||
                originalRequest.url?.includes('/auth/register') ||
                originalRequest.url?.includes('/auth/google')) {
                return Promise.reject(error)
            }

            if (isRefreshing) {
                // Queue the request while refresh is in progress
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`
                    return apiClient(originalRequest)
                }).catch(err => {
                    return Promise.reject(err)
                })
            }

            originalRequest._retry = true
            isRefreshing = true

            const refreshToken = localStorage.getItem('refreshToken')

            if (!refreshToken) {
                // No refresh token, logout
                isRefreshing = false
                processQueue(error, null)
                localStorage.clear()
                window.location.href = '/login'
                return Promise.reject(error)
            }

            try {
                // Attempt to refresh the token
                const response = await axios.post('http://localhost:8000/api/auth/token/refresh/', {
                    refresh: refreshToken
                })

                const { access } = response.data
                localStorage.setItem('authToken', access)
                isRefreshing = false
                processQueue(null, access)

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${access}`
                return apiClient(originalRequest)
            } catch (refreshError) {
                // Refresh failed, logout
                isRefreshing = false
                processQueue(refreshError, null)
                localStorage.clear()

                const currentPath = window.location.pathname
                if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
                    window.location.href = '/login'
                }
                return Promise.reject(refreshError)
            }
        }

        // Suppress token error spam
        if (error.response?.data?.code === 'token_not_valid' ||
            (error.response?.data?.detail && error.response.data.detail.includes('token'))) {
            console.warn('Token invalid or expired:', error.response.data)
        }

        return Promise.reject(error)
    }
)

export default apiClient
