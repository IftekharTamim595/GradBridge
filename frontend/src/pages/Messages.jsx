import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import apiClient from '../api/apiClient'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Send, MoreVertical, Phone, Video, Info, ArrowLeft, Loader } from 'lucide-react'
import Footer from '../components/Footer'
import { useAuth } from '../contexts/AuthContext'

import { useModal } from '../contexts/ModalContext'
import { useChat } from '../contexts/ChatContext'

const Messages = () => {
    const { user } = useAuth()
    const { showModal } = useModal()
    const {
        messages,
        sendMessage,
        isConnected,
        setInitialMessages,
        setActiveConversationId
    } = useChat()

    const [conversations, setConversations] = useState([])
    const [selectedConversation, setSelectedConversation] = useState(null)
    const [loading, setLoading] = useState(true)
    const [inputText, setInputText] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [searchParams] = useSearchParams()
    const conversationIdParam = searchParams.get('conversation')

    // No local socket hook anymore - it's in context
    const messagesEndRef = useRef(null)

    useEffect(() => {
        fetchConversations()
    }, [])

    useEffect(() => {
        if (conversations.length > 0 && conversationIdParam && !selectedConversation) {
            const target = conversations.find(c => c.id === parseInt(conversationIdParam))
            if (target) {
                setSelectedConversation(target)
            }
        }
    }, [conversations, conversationIdParam])

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.id)
        }
    }, [selectedConversation])

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

        // Update sidebar last message if we have new messages
        if (messages.length > 0 && selectedConversation) {
            const lastMsg = messages[messages.length - 1]
            setConversations(prev => {
                if (!Array.isArray(prev)) return []
                const updated = prev.map(c => {
                    if (c.id === selectedConversation.id) {
                        // Avoid unnecessary updates if already matches
                        if (c.last_message?.id === lastMsg.id && c.last_message?.content === lastMsg.content) return c
                        return { ...c, last_message: lastMsg }
                    }
                    return c
                })
                // Sort by latest message
                return updated.sort((a, b) => {
                    const dateA = new Date(a.last_message?.created_at || a.created_at)
                    const dateB = new Date(b.last_message?.created_at || b.created_at)
                    return dateB - dateA
                })
            })
        }
    }, [messages, selectedConversation])



    const fetchConversations = async () => {
        try {
            const response = await apiClient.get('/chat/conversations/')
            // Handle both pagination ({ results: [...] }) and list ([...]) responses
            const rawData = response.data.results ? response.data.results : response.data
            const data = Array.isArray(rawData) ? rawData : []

            // Group by User ID (Messenger style)
            // If multiple conversations exist for the same user, pick the most recent one
            const uniqueConversations = Array.from(
                data.reduce((map, convo) => {
                    const otherUser = getOtherParticipant(convo)
                    if (otherUser?.id) {
                        const existing = map.get(otherUser.id)
                        if (!existing || new Date(convo.last_message?.created_at) > new Date(existing.last_message?.created_at)) {
                            map.set(otherUser.id, convo)
                        }
                    }
                    return map
                }, new Map()).values()
            ).sort((a, b) => new Date(b.last_message?.created_at || b.created_at) - new Date(a.last_message?.created_at || a.created_at))

            setConversations(uniqueConversations)
        } catch (error) {
            console.error('Error fetching conversations:', error)
            showModal({ type: 'error', message: 'Failed to load conversations' })
            setConversations([])
        } finally {
            setLoading(false)
        }
    }

    const fetchMessages = async (conversationId) => {
        try {
            const response = await apiClient.get(`/chat/messages/${conversationId}/`)
            setInitialMessages(response.data)
        } catch (error) {
            console.error('Error fetching messages:', error)
            showModal({ type: 'error', message: 'Failed to load messages' })
        }
    }

    const handleSend = (e) => {
        e.preventDefault()
        if (!inputText.trim() || !isConnected) return

        sendMessage(inputText)
        setInputText('')

        // Optimistically update last message in conversation list
        setConversations(prev => {
            if (!Array.isArray(prev)) return []
            return prev.map(c => {
                if (c.id === selectedConversation.id) {
                    return {
                        ...c,
                        last_message: {
                            content: inputText,
                            created_at: new Date().toISOString(),
                            is_read: true // Sent by me
                        }
                    }
                }
                return c
            }).sort((a, b) => new Date(b.last_message?.created_at || b.created_at) - new Date(a.last_message?.created_at || a.created_at))
        })
    }

    const getOtherParticipant = (conversation) => {
        return conversation.participants.find(p => p.id !== user?.id)
    }

    const filteredConversations = Array.isArray(conversations) ? conversations.filter(c => {
        const otherUser = getOtherParticipant(c)
        const name = `${otherUser?.first_name} ${otherUser?.last_name}`.toLowerCase()
        return name.includes(searchQuery.toLowerCase())
    }) : []

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 pt-16 flex items-center justify-center">
                <div className="text-slate-400">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900 pt-20 pb-8 flex items-center justify-center px-4">
            <div className="w-full max-w-[1200px] h-[calc(100vh-100px)] bg-slate-800 rounded-2xl shadow-2xl flex overflow-hidden border border-slate-700">

                {/* Sidebar - Fixed Width 350px */}
                <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-[350px] flex-col border-r border-slate-700 bg-slate-800`}>
                    {/* Sidebar Header */}
                    <div className="p-4 border-b border-slate-700 shrink-0">
                        <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Conversation List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {filteredConversations.length > 0 ? (
                            filteredConversations.map(conversation => {
                                const otherUser = getOtherParticipant(conversation)
                                const isActive = selectedConversation?.id === conversation.id
                                return (
                                    <div
                                        key={conversation.id}
                                        onClick={() => {
                                            setSelectedConversation(conversation)
                                            setActiveConversationId(conversation.id)
                                        }}
                                        className={`p-3 mx-2 my-1 rounded-lg cursor-pointer transition-colors flex items-center space-x-3 ${isActive
                                            ? 'bg-indigo-600/20 hover:bg-indigo-600/30'
                                            : 'hover:bg-slate-700/50'
                                            }`}
                                    >
                                        <div className="relative shrink-0">
                                            <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-slate-300 font-bold text-lg select-none">
                                                {otherUser?.first_name?.[0]}{otherUser?.last_name?.[0]}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline">
                                                <h3 className={`text-sm font-semibold truncate ${isActive ? 'text-indigo-400' : 'text-slate-200'}`}>
                                                    {otherUser?.first_name} {otherUser?.last_name}
                                                </h3>
                                                <span className="text-xs text-slate-400 shrink-0 ml-2">
                                                    {conversation.last_message?.created_at &&
                                                        new Date(conversation.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                    }
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-400 truncate mt-0.5">
                                                {conversation.last_message?.sender?.id === user?.id && <span className="text-slate-500">You: </span>}
                                                {conversation.last_message?.content || 'Start a conversation'}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="p-8 text-center text-slate-500 text-sm">
                                <p>No conversations found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Area - Flex Column */}
                <div className={`${!selectedConversation ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-slate-900/50 min-w-0`}>
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="h-16 px-6 border-b border-slate-700 flex items-center justify-between bg-slate-800 shrink-0">
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => setSelectedConversation(null)}
                                        className="md:hidden text-slate-400 hover:text-white mr-2"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold select-none">
                                        {getOtherParticipant(selectedConversation)?.first_name?.[0]}
                                        {getOtherParticipant(selectedConversation)?.last_name?.[0]}
                                    </div>
                                    <div className="leading-tight">
                                        <h3 className="font-bold text-white text-sm">
                                            {getOtherParticipant(selectedConversation)?.first_name} {getOtherParticipant(selectedConversation)?.last_name}
                                        </h3>
                                        <p className="text-xs text-emerald-400 flex items-center mt-0.5">
                                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5 shadow-sm shadow-emerald-400/50"></span>
                                            {isConnected ? 'Online' : 'Offline'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 text-slate-400">
                                    <button className="hover:text-indigo-400 transition-colors p-2 hover:bg-slate-700/50 rounded-full"><Phone size={20} /></button>
                                    <button className="hover:text-indigo-400 transition-colors p-2 hover:bg-slate-700/50 rounded-full"><Video size={20} /></button>
                                    <button className="hover:text-indigo-400 transition-colors p-2 hover:bg-slate-700/50 rounded-full"><Info size={20} /></button>
                                </div>
                            </div>

                            {/* Messages Feed */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                {messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
                                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center">
                                            <Send size={24} className="text-slate-600" />
                                        </div>
                                        <p className="text-sm">No messages yet. Say hello!</p>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isMe = (msg.sender?.id || msg.sender_id) === user?.id
                                        return (
                                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div
                                                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-md ${isMe
                                                        ? 'bg-indigo-600 text-white rounded-br-none'
                                                        : 'bg-slate-700 text-slate-200 rounded-bl-none'
                                                        }`}
                                                >
                                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                                    <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-slate-400'} opacity-70`}>
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-slate-800 shrink-0">
                                <form onSubmit={handleSend} className="flex items-center space-x-3 max-w-4xl mx-auto w-full">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            placeholder="Type a message..."
                                            value={inputText}
                                            onChange={(e) => setInputText(e.target.value)}
                                            disabled={!isConnected}
                                            className="w-full bg-slate-700/50 text-white placeholder-slate-400 rounded-full pl-5 pr-12 py-3 border border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50 text-sm"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!inputText.trim() || !isConnected}
                                            className="absolute right-1.5 top-1.5 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
                            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-xl border border-slate-700 animate-pulse-slow">
                                <Send size={40} className="text-indigo-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Your Messages</h3>
                            <p className="max-w-xs text-center text-slate-400">Select a conversation from the left to start chatting.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Messages
