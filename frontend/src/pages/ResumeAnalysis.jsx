import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertTriangle, Play, Loader2, ArrowRight, Award, Briefcase, Zap, RefreshCw } from 'lucide-react';
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
            const response = await analyzeResume(file, role);
            console.log('AI Analysis Response:', response.data);
            setResult(response.data);
        } catch (err) {
            console.error('Analysis Error:', err);
            setError(err.response?.data?.error || 'Failed to analyze resume. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-amber-500';
        return 'text-rose-600';
    };

    const getProgressBarColor = (score) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-amber-500';
        return 'bg-rose-600';
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <h1 className="text-4xl font-heading font-bold text-slate-900 mb-3">
                        AI Resume Insights
                    </h1>
                    <p className="text-slate-500 text-lg">
                        Upload your resume to get instant, AI-powered feedback and Career scoring.
                    </p>
                </motion.div>

                <AnimatePresence mode="wait">
                    {loading && (
                        <motion.div
                            key="loading-state"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-xl"
                        >
                            <div className="relative w-24 h-24 mx-auto mb-8">
                                <div className="absolute inset-0 border-4 border-blue-100 rounded-full" />
                                <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin" />
                                <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600" size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-3">Analyzing your Profile</h2>
                            <p className="text-slate-500 max-w-sm mx-auto text-lg leading-relaxed">
                                Our AI is auditing your resume against industry standards for <span className="text-blue-600 font-bold">{role.replace('_', ' ')}</span> roles...
                            </p>
                        </motion.div>
                    )}

                    {!loading && !result && (
                        <motion.div
                            key="analysis-form"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white border border-slate-200 rounded-3xl p-10 shadow-xl"
                        >
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Target Role</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[
                                            { id: 'backend', label: 'Backend' },
                                            { id: 'frontend', label: 'Frontend' },
                                            { id: 'fullstack', label: 'Fullstack' },
                                            { id: 'ml_engineer', label: 'AI/ML' }
                                        ].map((r) => (
                                            <button
                                                key={r.id}
                                                type="button"
                                                onClick={() => setRole(r.id)}
                                                className={`py-3 rounded-xl border text-sm font-bold transition-all ${role === r.id
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/25'
                                                        : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                                                    }`}
                                            >
                                                {r.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-12 transition-all hover:border-blue-400/50 bg-slate-50/50 group">
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="text-center space-y-4">
                                        <div className="w-20 h-20 mx-auto bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                            {file ? <FileText className="w-10 h-10 text-blue-600" /> : <Upload className="w-10 h-10 text-slate-400" />}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">
                                                {file ? file.name : "Upload Resume"}
                                            </h3>
                                            <p className="text-slate-500">PDF files only (max 5MB)</p>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium"
                                    >
                                        <AlertTriangle className="w-5 h-5 shrink-0" />
                                        {error}
                                    </motion.div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || !file}
                                    className="w-full bg-slate-900 text-white rounded-2xl py-4 font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Start AI Audit
                                    <Play size={20} fill="currentColor" />
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {!loading && result && (
                        <motion.div
                            key="analysis-result"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            {/* Score & Breakdown Cards */}
                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="md:col-span-1 bg-white border border-slate-200 rounded-3xl p-10 text-center relative overflow-hidden shadow-sm">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Overall Rating</h3>
                                    <div className="relative">
                                        <span className={`text-8xl font-heading font-bold ${getScoreColor(result?.score || 0)}`}>
                                            {result?.score || 0}
                                        </span>
                                        <span className="text-slate-300 text-2xl font-bold ml-1">/100</span>
                                    </div>
                                    <div className="mt-10 h-3 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${result?.score || 0}%` }}
                                            transition={{ duration: 1.2, ease: "easeOut" }}
                                            className={`h-full ${getProgressBarColor(result?.score || 0)}`}
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-10 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-900 mb-8">Detailed Performance</h3>
                                    <div className="space-y-6">
                                        {[
                                            { label: "Skill Alignment", key: "skill_match", max: 40, icon: Zap },
                                            { label: "Project Relevance", key: "project_relevance", max: 30, icon: Briefcase },
                                            { label: "Experience Depth", key: "experience_depth", max: 20, icon: Award },
                                            { label: "Structure & Layout", key: "structure", max: 10, icon: FileText }
                                        ].map((item) => (
                                            <div key={item.key}>
                                                <div className="flex justify-between text-xs font-bold mb-2">
                                                    <span className="flex items-center gap-2 text-slate-500">
                                                        <item.icon className="w-4 h-4 text-blue-500" /> {item.label}
                                                    </span>
                                                    <span className="text-slate-900">
                                                        {result.breakdown?.[item.key] || 0} / {item.max}
                                                    </span>
                                                </div>
                                                <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${((result.breakdown?.[item.key] || 0) / item.max) * 100}%` }}
                                                        className="h-full bg-blue-600 rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Strengths & Improvement Grid */}
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm">
                                    <h3 className="text-lg font-bold text-green-600 mb-6 flex items-center gap-2">
                                        <CheckCircle className="w-6 h-6" /> Key Strengths
                                    </h3>
                                    <ul className="space-y-4">
                                        {result?.insights?.strengths?.length > 0 ? result.insights.strengths.map((str, i) => (
                                            <li key={i} className="flex items-start gap-4 text-slate-600 text-base leading-relaxed">
                                                <div className="mt-2 w-2 h-2 rounded-full bg-green-500 shrink-0" />
                                                {str}
                                            </li>
                                        )) : (
                                            <p className="text-slate-400 italic">No specific strengths identified for this profile.</p>
                                        )}
                                    </ul>
                                </div>

                                <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm">
                                    <h3 className="text-lg font-bold text-amber-600 mb-6 flex items-center gap-2">
                                        <AlertTriangle className="w-6 h-6" /> Improvement Areas
                                    </h3>
                                    <ul className="space-y-4">
                                        {result?.insights?.gaps?.length > 0 ? result.insights.gaps.map((gap, i) => (
                                            <li key={i} className="flex items-start gap-4 text-slate-600 text-base leading-relaxed">
                                                <div className="mt-2 w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                                {gap}
                                            </li>
                                        )) : (
                                            <p className="text-slate-400 italic">No critical gaps detected by the AI.</p>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {/* Skills & Missing Skills */}
                            <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm">
                                <div className="grid md:grid-cols-2 gap-10">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 mb-6">Skills Detected</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {result?.skills_found?.length > 0 ? result.skills_found.map(skill => (
                                                <span key={skill} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-600 font-medium">
                                                    {skill}
                                                </span>
                                            )) : <p className="text-slate-400 italic">No matching skills found.</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-rose-600 mb-6">Missing Key Skills</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {result?.missing_skills?.length > 0 ? result.missing_skills.slice(0, 10).map(skill => (
                                                <span key={skill} className="px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-lg text-sm text-rose-600 font-bold">
                                                    {skill}
                                                </span>
                                            )) : <p className="text-slate-400 italic">Excellent! All core skills detected.</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center pt-10">
                                <button
                                    onClick={() => setResult(null)}
                                    className="px-8 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center gap-2 mx-auto shadow-sm"
                                >
                                    <RefreshCw className="w-5 h-5" /> Analyze Another Resume
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ResumeAnalysis;
