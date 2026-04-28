import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Maximize2, Send, Loader } from 'lucide-react'
import { useChat } from '../../contexts/ChatContext'

import { useAuth } from '../../contexts/AuthContext'
import apiClient from '../../api/apiClient'

const ChatWindow = () => {
    const {
        isOpen,
        isMinimized,
        activeUser,
        activeConversationId,
        setActiveConversationId,
        closeChat,
        minimizeChat,
        // Socket state from context
        messages,
        sendMessage,
        isConnected,
        setInitialMessages,
        setMessages
    } = useChat()

    const { user: currentUser } = useAuth()
    const [inputText, setInputText] = useState('')
    const [loading, setLoading] = useState(false)

    // Removed local useChatSocket hook - using context instead

    const messagesEndRef = useRef(null)

    // Fetch or Start Conversation when window opens with a user
    useEffect(() => {
        const initChat = async () => {
            if (!activeUser || activeConversationId) return // Already setup or no user

            setLoading(true)
            try {
                // Start/Get conversation via API
                const response = await apiClient.post('/chat/conversations/start/', {
                    user_id: activeUser.id
                })
                const conversation = response.data
                setActiveConversationId(conversation.id)

                // Fetch history if any
                if (conversation.id) {
                    const msgsRes = await apiClient.get(`/chat/messages/${conversation.id}/`)
                    setInitialMessages(msgsRes.data)
                }
            } catch (error) {
                console.error('Error initializing chat:', error)
            } finally {
                setLoading(false)
            }
        }

        if (isOpen && activeUser) {
            initChat()
        }
    }, [isOpen, activeUser, activeConversationId]) // Depend on ID to skip re-fetch if set

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isOpen, isMinimized])

    const handleSend = (e) => {
        e.preventDefault()
        if (!inputText.trim() || !isConnected) return

        sendMessage(inputText)
        setInputText('')
    }

    // If not open, render nothing
    if (!isOpen) return null

    return (
        <div className={`fixed bottom-0 right-4 z-50 flex flex-col bg-white border border-brand-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 border-x border-t border-brand-border rounded-t-lg shadow-2xl transition-all duration-300 ${isMinimized ? 'h-12 w-64' : 'h-[450px] w-80 md:w-96'}`}>

            {/* Header */}
            <div
                className="flex items-center justify-between px-4 py-3 bg-brand-primary hover:bg-brand-primaryHover text-white hover:scale-[1.03] active:scale-[0.97] shadow-sm transition-all duration-200 rounded-t-lg cursor-pointer hover:bg-indigo-700 transition-colors"
                onClick={minimizeChat}
            >
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full absolute bottom-0 right-0 border border-indigo-600"></div>
                        <div className="w-8 h-8 bg-brand-alt rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">
                            {activeUser?.first_name?.[0]}{activeUser?.last_name?.[0]}
                        </div>
                    </div>
                    <span className="font-semibold text-brand-textMain truncate max-w-[120px]">
                        {activeUser?.first_name} {activeUser?.last_name}
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={(e) => { e.stopPropagation(); minimizeChat(); }} className="text-indigo-200 hover:text-brand-primary">
                        {isMinimized ? <Maximize2 size={16} /> : <Minus size={16} />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); closeChat(); }} className="text-indigo-200 hover:text-brand-primary">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Body (Hidden if minimized) */}
            {!isMinimized && (
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white scrollbar-thin scrollbar-thumb-brand-border scrollbar-track-transparent">
                        {loading ? (
                            <div className="flex justify-center items-center h-full">
                                <Loader className="animate-spin text-brand-primary" />
                            </div>
                        ) : (
                            <>
                                {messages.length === 0 && (
                                    <p className="text-center text-brand-textMuted text-sm mt-4">No messages yet. Say hi!</p>
                                )}
                                {messages.map((msg, idx) => {
                                    // Check if sender is current user.
                                    // Handle both API format (sender object) and Socket format (sender nested or flattened)
                                    // API: sender object. Socket: sender object or sender_id.
                                    const senderId = msg.sender?.id || msg.sender_id
                                    const isMe = senderId === currentUser?.id

                                    return (
                                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div
                                                className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${isMe
                                                    ? 'bg-brand-primary hover:bg-brand-primaryHover text-white hover:scale-[1.03] active:scale-[0.97] shadow-sm transition-all duration-200 text-white rounded-br-none'
                                                    : 'bg-brand-alt text-brand-textMain rounded-bl-none'
                                                    }`}
                                            >
                                                <p>{msg.content}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-3 bg-white border border-brand-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 border-t border-brand-border">
                        <div className="relative">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Type a message..."
                                className="w-full pl-4 pr-10 py-2 bg-brand-alt text-brand-textMain rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 text-sm"
                                disabled={!isConnected}
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim() || !isConnected}
                                className="absolute right-1 top-1 p-1.5 bg-brand-primary hover:bg-brand-primaryHover text-white hover:scale-[1.03] active:scale-[0.97] shadow-sm transition-all duration-200 text-white rounded-full hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                            >
                                <Send size={14} />
                            </button>
                        </div>
                        {!isConnected && !loading && (
                            <p className="text-[10px] text-red-600 mt-1 text-center">Disconnected</p>
                        )}
                    </form>
                </>
            )}
        </div>
    )
}

export default ChatWindow
