import React from 'react'
import { motion } from 'framer-motion'
import { Clock, Mail, CheckCircle } from 'lucide-react'

const RecruiterPending = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md"
            >
                <div className="card text-center">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-24 h-24 bg-indigo-600/20 rounded-full flex items-center justify-center">
                                <Clock className="text-brand-primary" size={48} />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                                <span className="text-yellow-400 text-xl">!</span>
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-brand-textMain mb-4">
                        Account Under Review
                    </h1>

                    {/* Description */}
                    <p className="text-brand-textSecondary mb-6 leading-relaxed">
                        Your recruiter account has been successfully created and is currently pending admin approval.
                    </p>

                    {/* What's Next */}
                    <div className="bg-brand-alt rounded-lg p-6 mb-6 text-left">
                        <h2 className="text-lg font-semibold text-brand-textMain mb-4 flex items-center gap-2">
                            <CheckCircle className="text-brand-success" size={20} />
                            What happens next?
                        </h2>
                        <ul className="space-y-3 text-brand-textSecondary text-sm">
                            <li className="flex items-start gap-3">
                                <span className="text-brand-primary font-bold mt-0.5">1.</span>
                                <span>Our admin team will review your account within 24-48 hours.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-brand-primary font-bold mt-0.5">2.</span>
                                <span>You'll receive an email notification once your account is approved.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-brand-primary font-bold mt-0.5">3.</span>
                                <span>After approval, you'll have full access to hiring features and student search.</span>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Support */}
                    <div className="text-sm text-brand-textSecondary mb-6">
                        <p className="mb-2">Need faster approval?</p>
                        <a
                            href="mailto:support@gradbridge.com"
                            className="inline-flex items-center gap-2 text-brand-primary hover:text-indigo-300 font-medium"
                        >
                            <Mail size={16} />
                            Contact Support
                        </a>
                    </div>

                    {/* Back to Home */}
                    <a
                        href="/"
                        className="btn-secondary inline-block w-full"
                    >
                        Back to Home
                    </a>
                </div>
            </motion.div>
        </div>
    )
}

export default RecruiterPending
