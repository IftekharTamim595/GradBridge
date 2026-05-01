import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useModal } from '../contexts/ModalContext'
import { API_BASE_URL } from '../utils/url'

export const useChatSocket = (conversationId) => {
    const { isAuthenticated } = useAuth()
    const { showModal } = useModal()
    const [messages, setMessages] = useState([])
    const [isConnected, setIsConnected] = useState(false)
    const socketRef = useRef(null)
    const reconnectTimeoutRef = useRef(null)
    const reconnectAttempts = useRef(0)

    const connect = useCallback(() => {
        if (!conversationId || !isAuthenticated) return

        // Close existing connection if any
        if (socketRef.current) {
            if (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING) {
                socketRef.current.close()
            }
        }

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const token = localStorage.getItem('authToken')

        if (!token) {
            console.warn('No access token found for WebSocket connection')
            // Optionally retry or handle logout
            return
        }

        let wsHost = window.location.host;
        try {
            const apiUrl = new URL(API_BASE_URL);
            wsHost = apiUrl.host;
        } catch (e) {
            console.warn('Invalid API_BASE_URL, falling back to window.location.host');
        }

        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // If API is on a different port (8000), we typically force ws: unless it's a production https url
        // But let's trust the protocol of the window or the API url.
        // Actually, if we are on localhost:5173 (http) and backend is localhost:8000 (http), we want ws://localhost:8000

        const wsUrl = `${wsProtocol}//${wsHost}/ws/chat/${conversationId}/?token=${token}`

        const socket = new WebSocket(wsUrl)
        socketRef.current = socket

        socket.onopen = () => {
            console.log('WebSocket Connected')
            setIsConnected(true)
            reconnectAttempts.current = 0 // Reset attempts on success
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
        }

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data)
            setMessages((prev) => [...prev, data])
        }

        socket.onclose = (event) => {
            console.log('WebSocket Disconnected', event.code, event.reason)
            setIsConnected(false)

            // Only reconnect if not closed cleanly
            if (!event.wasClean) {
                if (reconnectAttempts.current < 5) {
                    const timeout = Math.min(1000 * (2 ** reconnectAttempts.current), 30000)
                    reconnectAttempts.current += 1
                    console.log(`Reconnecting in ${timeout}ms...`)
                    reconnectTimeoutRef.current = setTimeout(connect, timeout)

                    if (reconnectAttempts.current === 1) {
                        showModal({ type: 'error', message: 'Chat disconnected. Reconnecting...' })
                    }
                } else {
                    showModal({ type: 'error', message: 'Connection lost. Please refresh the page.' })
                }
            }
        }

        socket.onerror = (error) => {
            console.error('WebSocket Error:', error)
        }

    }, [conversationId, isAuthenticated, showModal])

    useEffect(() => {
        connect()

        return () => {
            if (socketRef.current) {
                socketRef.current.close()
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
            }
        }
    }, [connect])

    const sendMessage = (content) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ message: content }))
        } else {
            console.error('WebSocket not connected')
        }
    }

    // Helper to merge initial API messages with socket messages
    const setInitialMessages = (initialMessages) => {
        setMessages(initialMessages)
    }

    return { messages, sendMessage, isConnected, setInitialMessages, setMessages }
}
