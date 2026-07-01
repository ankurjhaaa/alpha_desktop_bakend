import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import TeacherLayout from '../../Layouts/TeacherLayout';
import { ArrowLeft, Trophy, FileText, CheckCircle, Search } from 'lucide-react';
import axios from 'axios';

export default function McqPaperResultsPage({ examId }) {
    const [results, setResults] = useState([]);
    const [examData, setExamData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchResults = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            try {
                // Fetch the exam info (can also get it from list)
                const paperRes = await axios.get('/api/mcq_papers', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const paper = paperRes.data.find(p => p.id == examId);
                setExamData(paper);

                // Fetch student submissions for this specific exam
                const resultsRes = await axios.get(`/api/teacher/exams/${examId}/results`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setResults(resultsRes.data);
            } catch (error) {
                console.error("Error fetching results", error);
                // Mock data for demo
                setExamData({ id: examId, title: "Midterm Physics Examination", total_marks: 100 });
                setResults([
                    { student: { id: 1, name: "Alex Johnson" }, score: 92, submitted_at: "2024-03-15T11:00:00Z" },
                    { student: { id: 2, name: "Emma Smith" }, score: 85, submitted_at: "2024-03-15T11:15:00Z" },
                    { student: { id: 3, name: "Michael Brown" }, score: 70, submitted_at: "2024-03-15T10:45:00Z" },
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [examId]);

    const filteredResults = results.filter(r =>
        r.student?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => b.score - a.score); // Sort by highest score by default

    if (isLoading) {
        return (
            <TeacherLayout title="Exam Results">
                <div className="flex justify-center items-center py-24">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
            </TeacherLayout>
        );
    }

    return (
        <TeacherLayout title={`Results: ${examData?.title || 'Exam'}`}>
            <Head title="Exam Results" />

            <div className="mb-6">
                <Link href="/teacher/mcq-manager" className="inline-flex items-center text-sm font-medium text-text-muted hover:text-primary transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to MCQ Manager
                </Link>
            </div>

            <div className="bg-bg-card rounded-2xl shadow-sm border border-border-base transition-colors overflow-hidden">
                <div className="p-6 md:p-8 bg-gradient-to-r from-bg-base to-white border-b border-border-base flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center mb-4 md:mb-0">
                        <div className="w-14 h-14 bg-primary-light-hover rounded-2xl flex items-center justify-center text-primary mr-5">
                            <Trophy className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-text-base ">{examData?.title}</h2>
                            <p className="text-text-muted mt-1 flex items-center">
                                <FileText className="w-4 h-4 mr-1" />
                                {results.length} Submissions • {examData?.total_marks} Total Marks
                            </p>
                        </div>
                    </div>

                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-bg-card border border-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-base shadow-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-bg-base ">
                            <tr className="text-text-muted uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Rank</th>
                                <th className="px-6 py-4 font-semibold">Student Name</th>
                                <th className="px-6 py-4 font-semibold text-center">Score</th>
                                <th className="px-6 py-4 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 ">
                            {filteredResults.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-text-muted ">
                                        No submissions found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredResults.map((result, index) => {
                                    const rank = index + 1;
                                    const score = result.score || 0;
                                    const total = examData?.total_marks || 100;
                                    const percentage = Math.round((score / total) * 100);

                                    return (
                                        <tr key={result.id || index} className="hover:bg-bg-base transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${rank === 1 ? 'bg-primary-light text-primary-hover' :
                                                        rank === 2 ? 'bg-bg-hover text-text-base' :
                                                            rank === 3 ? 'bg-primary-light text-primary-hover' :
                                                                'bg-bg-hover text-text-muted '
                                                    }`}>
                                                    {rank}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-primary-light-hover flex items-center justify-center text-primary-hover font-bold mr-3">
                                                        {result.student?.name?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-text-base ">{result.student?.name || 'Unknown'}</div>
                                                        <div className="text-xs text-text-muted mt-0.5">Submitted {new Date(result.submitted_at || Date.now()).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-lg font-bold text-text-base ">{score}</span>
                                                    <div className={`mt-1 w-24 h-1.5 rounded-full bg-bg-hover overflow-hidden`}>
                                                        <div
                                                            className={`h-full ${percentage >= 80 ? 'bg-primary' : percentage >= 50 ? 'bg-primary' : 'bg-danger'}`}
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <Link
                                                    href={`/teacher/exams/${examId}/student/${result.student?.id || 1}`}
                                                    className="inline-flex items-center px-4 py-2 bg-bg-card border border-border-base rounded-lg text-sm font-medium text-primary hover:bg-bg-base transition-colors"
                                                >
                                                    View Answers
                                                    <CheckCircle className="w-4 h-4 ml-2" />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </TeacherLayout>
    );
}
