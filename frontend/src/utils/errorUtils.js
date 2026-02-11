/**
 * Error parsing utilities for Django REST Framework responses
 */

/**
 * Parse API error response into user-friendly message
 * @param {Error} error - Axios error object
 * @returns {string} - Formatted error message
 */
export const parseApiError = (error) => {
    if (!error?.response?.data) {
        if (error?.message === 'Network Error') {
            return 'Unable to connect to server. Please check your internet connection.'
        }
        return error?.message || 'An unexpected error occurred'
    }

    const data = error.response.data

    // Handle string response
    if (typeof data === 'string') return data

    // Handle array response
    if (Array.isArray(data)) return data.join('\n')

    // Handle object response
    if (typeof data === 'object') {
        // Common DRF error keys
        if (data.detail) return data.detail
        if (data.message) return data.message
        if (data.error) return data.error
        if (data.non_field_errors) {
            return Array.isArray(data.non_field_errors)
                ? data.non_field_errors.join(' ')
                : data.non_field_errors
        }

        // Parse field-specific errors
        return Object.entries(data)
            .map(([key, value]) => {
                const fieldName = formatFieldName(key)
                const messages = Array.isArray(value) ? value.join(' ') : value
                return `${fieldName}: ${messages}`
            })
            .join('\n')
    }

    return 'An unexpected error occurred'
}

/**
 * Format field name from snake_case to Title Case
 * @param {string} fieldName - Snake case field name
 * @returns {string} - Formatted title case name
 */
export const formatFieldName = (fieldName) => {
    return fieldName
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

/**
 * Get HTTP status-specific error messages
 * @param {number} status - HTTP status code
 * @returns {string} - User-friendly status message
 */
export const getStatusMessage = (status) => {
    const messages = {
        400: 'Invalid request. Please check your input.',
        401: 'Session expired. Please login again.',
        403: 'You do not have permission to perform this action.',
        404: 'The requested resource was not found.',
        409: 'This action conflicts with existing data.',
        422: 'Unable to process request. Please check your data.',
        429: 'Too many requests. Please wait a moment.',
        500: 'Server error. Please try again later.',
        502: 'Server is temporarily unavailable.',
        503: 'Service unavailable. Please try again later.',
    }
    return messages[status] || `Request failed with status ${status}`
}

/**
 * Parse auth-specific errors with helpful messages
 * @param {Error} error - Axios error object
 * @returns {string} - Auth-specific error message
 */
export const parseAuthError = (error) => {
    const data = error?.response?.data

    if (!data) {
        return parseApiError(error)
    }

    // Email already exists
    if (data.email?.includes('already exists') || data.email?.includes('already registered')) {
        return 'This email is already registered. Please login or use a different email.'
    }

    // Username already exists
    if (data.username?.includes('already exists') || data.username?.includes('already taken')) {
        return 'This username is already taken. Please choose a different one.'
    }

    // Password errors
    if (data.password) {
        const pwdErrors = Array.isArray(data.password) ? data.password : [data.password]
        if (pwdErrors.some(e => e.includes('too short') || e.includes('at least'))) {
            return 'Password is too short. Please use at least 8 characters.'
        }
        if (pwdErrors.some(e => e.includes('too common'))) {
            return 'Password is too common. Please choose a stronger password.'
        }
        if (pwdErrors.some(e => e.includes('numeric'))) {
            return 'Password cannot be entirely numeric.'
        }
        return pwdErrors.join(' ')
    }

    // Invalid credentials
    if (data.detail?.includes('credentials') || data.detail?.includes('password')) {
        return 'Invalid email or password. Please try again.'
    }

    // Token expired
    if (data.detail?.includes('token') || data.code === 'token_not_valid') {
        return 'Your session has expired. Please login again.'
    }

    return parseApiError(error)
}

export default { parseApiError, parseAuthError, formatFieldName, getStatusMessage }
