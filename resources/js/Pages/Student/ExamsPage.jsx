import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import StudentLayout from '../../Layouts/StudentLayout';
import CustomButton from '../../Core/Widgets/CustomButton';
import { Search, FileText, Clock, PlayCircle, CheckCircle, Lock, LockOpen } from 'lucide-react';
import axios from 'axios';

export default function ExamsPage() {
    const [papers, setPapers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all'); // all, upcoming, past

    const fetchPapers = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            let url = '/api/student/mcq_papers?';
            if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
            
            const res = await axios.get(url, config);
            let fetchedPapers = res.data;
            
            // Client-side filtering based on date
            const now = new Date();
            if (filter === 'upcoming') {
                fetchedPapers = fetchedPapers.filter(p => !p.end_time || new Date(p.end_time) > now);
            } else if (filter === 'past') {
                fetchedPapers = fetchedPapers.filter(p => p.end_time && new Date(p.end_time) <= now);
            }
            
            setPapers(fetchedPapers);
        } catch (error) {
            console.error("Error fetching exams", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => fetchPapers(), 500);
        return () => clearTimeout(debounce);
    }, [searchQuery, filter]);

    const getExamStatus = (paper) => {
        if (paper.submission) return { label: 'Completed', color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' };
        
        const now = new Date();
        if (paper.start_time && new Date(paper.start_time) > now) {
            return { label: 'Upcoming', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400' };
        }
        if (paper.end_time && new Date(paper.end_time) < now) {
            return { label: 'Missed', color: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400' };
        }
        
        return { label: 'Available', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400' };
    };

    return (
        <StudentLayout title="My Exams">
            <Head title="Exams" />

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex space-x-2">
                        {['all', 'upcoming', 'past'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    filter === f 
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                                }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search exams..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                        />
                    </div>
                </div>

                <div className="p-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : papers.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                            No exams found.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {papers.map((paper) => {
                                const status = getExamStatus(paper);
                                const isAvailable = status.label === 'Available';
                                const isCompleted = status.label === 'Completed';

                                return (
                                    <div key={paper.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-md transition-shadow relative overflow-hidden">
                                        {/* Status Badge */}
                                        <div className={`absolute top-4 right-4 px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                                            {status.label}
                                        </div>
                                        
                                        <div className="flex items-start mb-4 mt-2">
                                            <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div className="ml-4 pr-16">
                                                <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight line-clamp-2">{paper.title}</h3>
                                                {paper.course && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{paper.course.name}</p>}
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-6 text-sm text-slate-600 dark:text-slate-400">
                                            <div className="flex items-center">
                                                <Clock className="w-4 h-4 mr-2 text-slate-400" />
                                                <span>
                                                    {paper.start_time ? new Date(paper.start_time).toLocaleDateString() : 'No date set'}
                                                    {(paper.start_time || paper.end_time) && ' • '}
                                                    {paper.start_time ? new Date(paper.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                                                    {paper.end_time ? ` - ${new Date(paper.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : ''}
                                                </span>
                                            </div>
                                            {paper.exam_password && (
                                                <div className="flex items-center text-amber-600 dark:text-amber-500">
                                                    <Lock className="w-4 h-4 mr-2" />
                                                    <span>Password protected</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                                            {isCompleted ? (
                                                <Link href={`/student/exams/${paper.id}/result`} className="flex items-center justify-center w-full py-2 px-4 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 rounded-lg font-medium transition-colors">
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    View Results
                                                </Link>
                                            ) : isAvailable ? (
                                                <Link href={`/student/exams/${paper.id}/take`} className="flex items-center justify-center w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                                                    <PlayCircle className="w-4 h-4 mr-2" />
                                                    Start Exam
                                                </Link>
                                            ) : (
                                                <button disabled className="flex items-center justify-center w-full py-2 px-4 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-lg font-medium cursor-not-allowed">
                                                    <Lock className="w-4 h-4 mr-2" />
                                                    Exam Unavailable
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </StudentLayout>
    );
}
