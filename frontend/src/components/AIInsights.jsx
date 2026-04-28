import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Send, Loader, Bot, User as UserIcon } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import aiApi from '../api/ai'

const AIInsights = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hi ${user?.first_name || 'there'}! I'm your GradBridge AI assistant. How can I help with your career today?` }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || isTyping) return

    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      const response = await aiApi.chat(input)
      const botMsg = { role: 'assistant', content: response.data.reply }
      setMessages(prev => [...prev, botMsg])
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again later." }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-white border-l border-slate-200 shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-primary rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
                  <Sparkles className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-heading text-slate-900">Career Assistant</h2>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Online</span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-200' : 'bg-brand-alt'}`}>
                      {msg.role === 'user' ? <UserIcon size={14} className="text-slate-600" /> : <Bot size={14} className="text-brand-primary" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                      ? 'bg-brand-primary text-white rounded-tr-none' 
                      : 'bg-slate-100 text-slate-700 rounded-tl-none shadow-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-lg bg-brand-alt flex items-center justify-center shrink-0">
                      <Bot size={14} className="text-brand-primary" />
                    </div>
                    <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none flex gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-6 border-t border-slate-100 bg-white">
              <form onSubmit={handleSend} className="relative">
                <input
                  type="text"
                  placeholder="Ask about career paths, resume tips..."
                  className="w-full pl-5 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none text-sm"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-brand-primary text-white rounded-xl shadow-lg shadow-brand-primary/20 disabled:opacity-50 hover:bg-brand-primaryHover transition-all"
                >
                  <Send size={18} />
                </button>
              </form>
              <p className="text-[10px] text-center text-slate-400 mt-4">
                Powered by GradBridge AI • Expert Career Guidance
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default AIInsights
