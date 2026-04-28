import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'


/**
 * Error Boundary component to catch and gracefully handle React component errors.
 * Prevents blank screens and provides recovery options.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render shows the fallback UI
        return { hasError: true }
    }

    componentDidCatch(error, errorInfo) {
        // Log error to console for debugging
        console.error('ErrorBoundary caught an error:', error, errorInfo)
        this.setState({ error, errorInfo })
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
                    <div className="max-w-md w-full text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 rounded-2xl mb-6">
                            <AlertTriangle className="text-red-400\" size={40} />
                        </div>

                        <h1 className="text-2xl font-bold text-brand-textMain mb-3">
                            Something went wrong
                        </h1>

                        <p className="text-brand-textSecondary mb-8">
                            An unexpected error occurred. This has been logged and we're working on a fix.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={this.handleRetry}
                                className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-brand-primary hover:bg-brand-primaryHover text-white hover:scale-[1.03] active:scale-[0.97] shadow-sm transition-all duration-200 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                            >
                                <RefreshCw size={18} />
                                <span>Try Again</span>
                            </button>

                            <a
                                href="/"
                                className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-brand-alt hover:bg-brand-primary hover:text-white text-brand-textMain rounded-lg font-medium transition-colors"
                            >
                                <Home size={18} />
                                <span>Go Home</span>
                            </a>
                        </div>

                        {/* Development error details */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-8 text-left bg-white border border-brand-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 rounded-lg p-4 border border-brand-border">
                                <summary className="text-sm text-brand-textSecondary cursor-pointer hover:text-slate-300">
                                    Error Details (Development Only)
                                </summary>
                                <pre className="mt-3 text-xs text-red-600 overflow-auto max-h-40">
                                    {this.state.error?.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
