/**
 * Centralized URL utilities for resolving API and media URLs.
 * All components should use these helpers instead of hardcoding backend URLs.
 */

/**
 * The base URL for the backend API (without trailing /api).
 * In development: http://localhost:8000
 * In production: configured via VITE_API_BASE_URL env var
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

/**
 * Resolves a media/file path to a full URL.
 * If the path is already an absolute URL (starts with http), returns as-is.
 * Otherwise, prepends the API base URL.
 *
 * @param {string} path - The media path or full URL
 * @returns {string} The resolved full URL
 */
export const getMediaUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${API_BASE_URL}${path}`
}
