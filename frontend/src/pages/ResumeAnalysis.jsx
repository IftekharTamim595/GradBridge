import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertTriangle, Play, Loader2, ArrowRight, Award, Briefcase, Zap } from 'lucide-react';
import { analyzeResume } from '../api/ai';

const ResumeAnalysis = () => {
    const [file, setFile] = useState(null);
    const [role, setRole] = useState('fullstack');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please upload a resume (PDF).');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const data = await analyzeResume(file, role);
            setResult(data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to analyze resume. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getProgressBarColor = (score) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 text-center"
                >
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
                        AI Resume Insights
                    </h1>
                    <p className="text-slate-400">
                        Upload your resume to get instant, AI-powered feedback and Career scoring.
                    </p>
                </motion.div>

                {!result && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-xl"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Target Role</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {['backend', 'frontend', 'fullstack', 'ml_engineer'].map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setRole(r)}
                                            className={`p-3 rounded-lg border transition-all duration-200 capitalize ${role === r
                                                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25'
                                                    : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'
                                                }`}
                                        >
                                            {r.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* File Upload */}
                            <div className="relative border-2 border-dashed border-slate-600 rounded-xl p-8 transition-colors hover:border-blue-500/50 group">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 mx-auto bg-slate-700/50 rounded-full flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                        {file ? <FileText className="w-8 h-8 text-blue-400" /> : <Upload className="w-8 h-8 text-slate-400" />}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-white">
                                            {file ? file.name : "Drop your resume here or click to browse"}
                                        </h3>
                                        <p className="text-sm text-slate-400 mt-1">PDF files only, max 5MB</p>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-200"
                                >
                                    <AlertTriangle className="w-5 h-5" />
                                    {error}
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !file}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Analyzing Resume...
                                    </>
                                ) : (
                                    <>
                                        Run Analysis <Play className="w-5 h-5 fill-current" />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                )}

                {result && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        {/* Top Stats */}
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Main Score */}
                            <div className="md:col-span-1 bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
                                <h3 className="text-slate-400 mb-4 relative z-10">Overall Score</h3>
                                <div className="relative z-10">
                                    <span className={`text-6xl font-bold ${getScoreColor(result.score)}`}>{result.score}</span>
                                    <span className="text-slate-500 text-xl">/100</span>
                                </div>
                                <div className="mt-4 h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${result.score}%` }}
                                        className={`h-full ${getProgressBarColor(result.score)}`}
                                    />
                                </div>
                            </div>

                            {/* Breakdown */}
                            <div className="md:col-span-2 bg-slate-800/50 border border-slate-700 rounded-2xl p-6 relative overflow-hidden">
                                <h3 className="text-lg font-bold text-white mb-4">Detailed Breakdown</h3>
                                <div className="space-y-4">
                                    {[
                                        { label: "Skill Match", key: "skill_match", max: 40, icon: Zap },
                                        { label: "Project Relevance", key: "project_relevance", max: 30, icon: Briefcase },
                                        { label: "Experience Depth", key: "experience_depth", max: 20, icon: Award },
                                        { label: "Structure", key: "structure", max: 10, icon: FileText }
                                    ].map((item) => (
                                        <div key={item.key}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="flex items-center gap-2 text-slate-300">
                                                    <item.icon className="w-4 h-4 text-blue-400" /> {item.label}
                                                </span>
                                                <span className="font-mono text-slate-200">
                                                    {result.breakdown[item.key]}/{item.max}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(result.breakdown[item.key] / item.max) * 100}%` }}
                                                    className="h-full bg-blue-500"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Insights */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="bg-slate-800/50 border border-green-500/20 rounded-2xl p-6"
                            >
                                <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" /> Strengths
                                </h3>
                                <ul className="space-y-2">
                                    {result.insights.strengths.map((str, i) => (
                                        <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                                            {str}
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-6">
                                    <h4 className="text-sm font-semibold text-slate-400 mb-2">Detailed Skills Found:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {result.skills_found.map(skill => (
                                            <span key={skill} className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-200 border border-slate-600">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="bg-slate-800/50 border border-amber-500/20 rounded-2xl p-6"
                            >
                                <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" /> Areas for Improvement
                                </h3>

                                {result.insights.gaps.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-slate-400 mb-2">Gaps Identified:</h4>
                                        <ul className="space-y-2 mb-4">
                                            {result.insights.gaps.map((gap, i) => (
                                                <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                                                    {gap}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div>
                                    <h4 className="text-sm font-medium text-slate-400 mb-2">Recommendations:</h4>
                                    <ul className="space-y-2">
                                        {result.insights.recommendations.map((rec, i) => (
                                            <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                                                <ArrowRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                                {rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {result.missing_skills.length > 0 && (
                                    <div className="mt-6">
                                        <h4 className="text-sm font-semibold text-slate-400 mb-2">Missing Key Skills:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {result.missing_skills.slice(0, 8).map(skill => (
                                                <span key={skill} className="px-2 py-1 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-300">
                                                    {skill}
                                                </span>
                                            ))}
                                            {result.missing_skills.length > 8 && (
                                                <span className="px-2 py-1 text-xs text-slate-500">+{result.missing_skills.length - 8} more</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        <div className="text-center pt-8">
                            <button
                                onClick={() => setResult(null)}
                                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center gap-2 mx-auto"
                            >
                                <RefreshCw className="w-4 h-4" /> Analyze Another Resume
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ResumeAnalysis;
