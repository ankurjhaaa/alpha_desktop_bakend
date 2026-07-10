import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import StudentLayout from '../../Layouts/StudentLayout';
import CustomButton from '../../Core/Widgets/CustomButton';
import { Search, FileText, Clock, PlayCircle, CheckCircle, Lock, LockOpen, ArrowRight, X } from 'lucide-react';
import axios from 'axios';
import { router } from '@inertiajs/react';

export default function ExamsPage() {
    const [papers, setPapers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all'); // all, upcoming, past

    // Modal state
    const [selectedExam, setSelectedExam] = useState(null);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const fetchPapers = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            let url = '/api/student/exams?';
            if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;

            const res = await axios.get(url, config);
            let fetchedPapers = res.data;

            // Client-side filtering based on date and completion status
            const now = new Date();
            if (filter === 'upcoming') {
                fetchedPapers = fetchedPapers.filter(p => !p.is_completed && (!p.end_time || new Date(p.end_time) > now));
            } else if (filter === 'past') {
                fetchedPapers = fetchedPapers.filter(p => p.is_completed || (p.end_time && new Date(p.end_time) <= now));
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
        if (paper.is_completed) return { label: 'Completed', color: 'text-primary bg-primary-light ' };

        const now = new Date();
        if (paper.start_time && new Date(paper.start_time) > now) {
            return { label: 'Upcoming', color: 'text-primary bg-primary-light ' };
        }
        if (paper.end_time && new Date(paper.end_time) < now) {
            return { label: 'Missed', color: 'text-danger-text bg-danger-light ' };
        }

        return { label: 'Available', color: 'text-primary bg-primary-light-hover ' };
    };

    const handleExamClick = (paper) => {
        setSelectedExam(paper);
        setPassword('');
        setPasswordError('');
    };

    const handleStartExam = async (e) => {
        e.preventDefault();
        
        if (selectedExam.requires_password) {
            setIsVerifying(true);
            setPasswordError('');
            try {
                await axios.post(`/api/student/exams/${selectedExam.id}/verify`, { password }, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
                });
                
                sessionStorage.setItem(`exam_pwd_${selectedExam.id}`, password);
                router.visit(`/student/exams/${selectedExam.id}/take`);
            } catch (error) {
                if (error.response && (error.response.status === 403 || error.response.status === 422)) {
                    setPasswordError('Incorrect password. Please try again.');
                } else {
                    setPasswordError('Failed to verify password.');
                }
            } finally {
                setIsVerifying(false);
            }
        } else {
            router.visit(`/student/exams/${selectedExam.id}/take`);
        }
    };

    return (
        <StudentLayout title="My Exams">
            <Head title="Exams" />

            <div className="bg-bg-card rounded-md shadow-sm border border-border-base transition-colors">
                <div className="p-6 border-b border-border-base flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex space-x-2">
                        {['all', 'upcoming', 'past'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === f
                                        ? 'bg-primary-light-hover text-primary-hover '
                                        : 'bg-bg-hover text-text-muted hover:bg-bg-hover '
                                    }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search exams..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-bg-base border border-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text-base "
                        />
                    </div>
                </div>

                <div className="p-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : papers.length === 0 ? (
                        <div className="text-center py-12 text-text-muted ">
                            No exams found.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {papers.map((paper) => {
                                const status = getExamStatus(paper);
                                const isAvailable = status.label === 'Available';
                                const isCompleted = status.label === 'Completed';

                                return (
                                    <div key={paper.id} className="bg-bg-card border border-border-base rounded-md p-5 hover:shadow-md transition-shadow relative overflow-hidden">
                                        {/* Status Badge */}
                                        <div className={`absolute top-4 right-4 px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                                            {status.label}
                                        </div>

                                        <div className="flex items-start mb-4 mt-2">
                                            <div className="w-12 h-12 rounded-md bg-primary-light flex items-center justify-center text-primary flex-shrink-0">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div className="ml-4 pr-16">
                                                <h3 className="font-bold text-text-base text-lg leading-tight line-clamp-2">{paper.title}</h3>
                                                {paper.course && <p className="text-sm text-text-muted mt-1">{paper.course.name}</p>}
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-6 text-sm text-text-muted ">
                                            <div className="flex items-center">
                                                <Clock className="w-4 h-4 mr-2 text-text-muted" />
                                                <span>
                                                    {paper.start_time ? new Date(paper.start_time).toLocaleDateString() : 'No date set'}
                                                    {(paper.start_time || paper.end_time) && ' • '}
                                                    {paper.start_time ? new Date(paper.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    {paper.end_time ? ` - ${new Date(paper.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                                                </span>
                                            </div>
                                            {paper.requires_password && (
                                                <div className="flex items-center text-primary ">
                                                    <Lock className="w-4 h-4 mr-2" />
                                                    <span>Password protected</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t border-border-base ">
                                            {isCompleted ? (
                                                <Link href={`/student/exams/${paper.id}/result`} className="flex items-center justify-center w-full py-2 px-4 bg-emerald-500/10 text-emerald-600 hover:bg-primary-light text-primary-hover rounded-md font-medium transition-colors">
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    View Results
                                                </Link>
                                            ) : isAvailable ? (
                                                <button onClick={() => handleExamClick(paper)} className="flex items-center justify-center w-full py-2 px-4 bg-primary hover:bg-primary-hover text-primary-text rounded-md font-medium transition-colors">
                                                    <PlayCircle className="w-4 h-4 mr-2" />
                                                    Start Exam
                                                </button>
                                            ) : (
                                                <button disabled className="flex items-center justify-center w-full py-2 px-4 bg-bg-hover text-text-muted rounded-md font-medium cursor-not-allowed">
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

            {/* Exam Instructions Modal */}
            {selectedExam && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-bg-card rounded-xl shadow-2xl max-w-2xl w-full border border-border-base overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-border-base">
                            <h2 className="text-2xl font-bold text-text-base">{selectedExam.title}</h2>
                            <button onClick={() => setSelectedExam(null)} className="text-text-muted hover:text-text-base transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="p-6 text-text-base max-h-[70vh] overflow-y-auto">
                            <div className="bg-primary-light/10 p-5 rounded-md border-l-4 border-primary mb-6">
                                <h3 className="font-bold text-lg mb-3 flex items-center">
                                    <span className="bg-primary text-primary-text w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">!</span>
                                    Strict Security Rules:
                                </h3>
                                <ul className="list-disc pl-6 space-y-2 text-sm text-text-muted font-medium">
                                    <li><strong>Do not refresh or reload the page</strong> during the exam.</li>
                                    <li><strong>Do not switch tabs or minimize the browser.</strong></li>
                                    <li>Any violation will result in <strong>automatic immediate submission</strong> of your exam.</li>
                                    <li>Your progress is saved locally as you answer.</li>
                                    <li>Once time runs out, the exam is submitted automatically.</li>
                                </ul>
                            </div>

                            <form onSubmit={handleStartExam}>
                                {selectedExam.requires_password && (
                                    <div className="mb-6 bg-bg-base p-5 rounded-md border border-border-base shadow-inner">
                                        <label className="block text-sm font-bold mb-2 text-text-base">This exam is password protected</label>
                                        {passwordError && <p className="text-danger-text text-sm mb-2 font-medium">{passwordError}</p>}
                                        <input 
                                            type="password" 
                                            placeholder="Enter exam password provided by teacher" 
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 bg-bg-card border border-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-shadow shadow-sm"
                                            autoFocus
                                        />
                                    </div>
                                )}
                                
                                <div className="flex space-x-3 pt-2">
                                    <button type="button" onClick={() => setSelectedExam(null)} className="flex-1 px-4 py-3 border border-border-base rounded-md hover:bg-bg-hover transition-colors font-semibold">Cancel</button>
                                    <button 
                                        type="submit"
                                        disabled={isVerifying || (selectedExam.requires_password && !password)}
                                        className="flex-[2] px-6 py-3 bg-primary hover:bg-primary-hover text-primary-text font-bold rounded-md flex items-center justify-center transition-transform active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-md"
                                    >
                                        {isVerifying ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Accept Rules & Start Exam'} 
                                        {!isVerifying && <ArrowRight className="ml-2 w-5 h-5" />}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </StudentLayout>
    );
}
