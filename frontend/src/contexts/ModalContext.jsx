import React, { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

const ModalContext = createContext()

export const useModal = () => {
    const context = useContext(ModalContext)
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider')
    }
    return context
}

export const ModalProvider = ({ children }) => {
    const [modal, setModal] = useState({
        isOpen: false,
        type: 'info', // 'success', 'error', 'info', 'warning'
        title: '',
        message: '',
        onConfirm: null,
        confirmText: 'OK',
        cancelText: 'Cancel'
    })

    const showModal = useCallback(({ type = 'info', title, message, onConfirm = null, confirmText = 'OK', cancelText = 'Cancel' }) => {
        setModal({
            isOpen: true,
            type,
            title,
            message,
            onConfirm,
            confirmText,
            cancelText
        })
    }, [])

    const closeModal = useCallback(() => {
        setModal(prev => ({ ...prev, isOpen: false }))
    }, [])

    return (
        <ModalContext.Provider value={{ showModal, closeModal }}>
            {children}
            <AnimatePresence>
                {modal.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex items-start space-x-4">
                                    <div className={`shrink-0 p-3 rounded-xl ${modal.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                                            modal.type === 'error' ? 'bg-red-500/10 text-red-400' :
                                                modal.type === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                                                    'bg-indigo-500/10 text-indigo-400'
                                        }`}>
                                        {modal.type === 'success' && <CheckCircle size={24} />}
                                        {modal.type === 'error' && <AlertCircle size={24} />}
                                        {modal.type === 'warning' && <AlertCircle size={24} />}
                                        {modal.type === 'info' && <Info size={24} />}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-white mb-2">
                                            {modal.title || (
                                                modal.type === 'success' ? 'Success' :
                                                    modal.type === 'error' ? 'Error' :
                                                        modal.type === 'warning' ? 'Warning' :
                                                            'Information'
                                            )}
                                        </h3>
                                        <p className="text-slate-300 leading-relaxed">
                                            {modal.message}
                                        </p>
                                    </div>
                                    <button
                                        onClick={closeModal}
                                        className="shrink-0 text-slate-400 hover:text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="mt-8 flex justify-end space-x-3">
                                    {modal.onConfirm && (
                                        <button
                                            onClick={closeModal}
                                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                                        >
                                            {modal.cancelText}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            if (modal.onConfirm) modal.onConfirm()
                                            closeModal()
                                        }}
                                        className={`px-6 py-2 rounded-lg font-medium text-white transition-transform hover:scale-105 ${modal.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-500' :
                                                modal.type === 'error' ? 'bg-red-600 hover:bg-red-500' :
                                                    modal.type === 'warning' ? 'bg-amber-600 hover:bg-amber-500' :
                                                        'bg-indigo-600 hover:bg-indigo-500'
                                            }`}
                                    >
                                        {modal.confirmText}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </ModalContext.Provider>
    )
}

export default ModalContext
