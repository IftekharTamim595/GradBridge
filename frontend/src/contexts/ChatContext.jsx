import React, { createContext, useContext, useState, useEffect } from 'react'

import { useChatSocket } from '../hooks/useChatSocket'

const ChatContext = createContext()

export const useChat = () => useContext(ChatContext)

export const ChatProvider = ({ children }) => {
    // State: isOpen (boolean), isMinimized (boolean), activeUser (user object), activeConversationId (int)
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [activeUser, setActiveUser] = useState(null)
    const [activeConversationId, setActiveConversationId] = useState(null)

    // Centralized Socket Logic
    // We pass the activeConversationId to the hook so it manages the connection automatically
    const { messages, sendMessage, isConnected, setInitialMessages, setMessages } = useChatSocket(activeConversationId)

    // Function to open chat with a specific user
    const openChatWithUser = (user) => {
        // If already chatting with this user, just ensure it's open/maximized
        if (activeUser?.id === user.id) {
            setIsOpen(true)
            setIsMinimized(false)
            return
        }

        setActiveUser(user)
        setActiveConversationId(null) // Will fetch/create in ChatWindow
        setIsOpen(true)
        setIsMinimized(false)
    }

    const closeChat = () => {
        setIsOpen(false)
        setActiveUser(null)
        setActiveConversationId(null)
    }

    const minimizeChat = () => {
        setIsMinimized(!isMinimized)
    }

    return (
        <ChatContext.Provider value={{
            isOpen,
            isMinimized,
            activeUser,
            activeConversationId,
            setActiveConversationId,
            openChatWithUser,
            closeChat,
            minimizeChat,
            // Expose socket state/actions
            messages,
            sendMessage,
            isConnected,
            setInitialMessages,
            setMessages
        }}>
            {children}
        </ChatContext.Provider>
    )
}
