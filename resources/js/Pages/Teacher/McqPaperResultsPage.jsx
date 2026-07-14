import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import TeacherLayout from '../../Layouts/TeacherLayout';
import { ArrowLeft, Trophy, FileText, CheckCircle, Search, Download, RotateCcw } from 'lucide-react';
import axios from 'axios';
import { downloadExamResultPdf } from '../../Core/Utils/PdfGenerator';

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
                const resultsRes = await axios.get(`/api/mcq_papers/${examId}/results`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const mappedResults = resultsRes.data.map(r => ({
                    id: r.id,
                    student: { 
                        id: r.user_id, 
                        name: r.student_name, 
                        email: r.student_email,
                        registration_id: r.registration_id,
                        father_name: r.father_name
                    },
                    course: r.course_name,
                    batch: r.batch_name,
                    batch_timing: r.batch_timing,
                    score: r.score,
                    percentage: r.percentage,
                    submitted_at: r.submitted_at,
                    status: r.status
                }));
                setResults(mappedResults);
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

    const handleDownloadPdf = async (result) => {
        const data = {
            examName: examData?.title || 'Exam',
            studentName: result.student?.name || 'Unknown',
            regNumber: result.student?.registration_id || '',
            score: result.score || 0,
            total: examData?.total_marks || examData?.questions_count || 100,
            percentage: result.percentage || 0,
            examDate: result.submitted_at || new Date().toISOString(),
            fatherName: result.student?.father_name || 'N/A',
            course: result.course || 'N/A',
            batch: result.batch || 'N/A',
            batchTiming: result.batch_timing || 'N/A',
        };
        await downloadExamResultPdf(data);
    };

    const handleRevoke = async (result) => {
        if (!confirm(`Are you sure you want to revoke the exam result for ${result.student?.name}? They will be able to take the exam again.`)) {
            return;
        }

        const token = localStorage.getItem('auth_token');
        try {
            await axios.delete(`/api/mcq_papers/${examId}/results/${result.student.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Remove the revoked result from the local state
            setResults(prev => prev.filter(r => r.student.id !== result.student.id));
            alert('Exam result revoked successfully.');
        } catch (error) {
            console.error('Error revoking result:', error);
            alert('Failed to revoke exam result.');
        }
    };

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


            <div className="bg-bg-card rounded-md shadow-sm border border-border-base transition-colors overflow-hidden">
                <div className="p-6 md:p-8 bg-bg-card border-b border-border-base flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center mb-4 md:mb-0">
                        <div className="w-14 h-14 bg-primary-light-hover rounded-md flex items-center justify-center text-primary mr-5">
                            <Trophy className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-text-base ">{examData?.title}</h2>
                            <p className="text-text-muted mt-1 flex items-center">
                                <FileText className="w-4 h-4 mr-1" />
                                {results.filter(r => r.status !== 'missed').length} Submissions • {examData?.total_marks || examData?.questions_count || 100} Total Marks
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
                            className="w-full pl-10 pr-4 py-2 bg-bg-card border border-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text-base shadow-sm"
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
                        <tbody className="divide-y divide-border-base ">
                            {filteredResults.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-text-muted ">
                                        No submissions found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredResults.map((result, index) => {
                                    const rank = result.status === 'missed' ? '-' : index + 1;
                                    const score = result.score || 0;
                                    const total = examData?.total_marks || examData?.questions_count || 100;
                                    const percentage = Math.round((score / total) * 100);
                                    const isMissed = result.status === 'missed';

                                    return (
                                        <tr key={result.id || index} className={`hover:bg-bg-base transition-colors ${isMissed ? 'opacity-70' : ''}`}>
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
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden font-bold mr-3 ${isMissed ? 'bg-bg-hover text-text-muted' : 'bg-primary-light-hover text-primary-hover'}`}>
                                                        {result.student?.profile_image ? (
                                                            <img src={result.student.profile_image} alt={result.student.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            result.student?.name?.charAt(0).toUpperCase() || '?'
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-text-base ">{result.student?.name || 'Unknown'}</div>
                                                        <div className="text-xs text-text-muted mt-0.5">
                                                            {isMissed ? 'Did not submit' : `Submitted ${new Date(result.submitted_at || Date.now()).toLocaleDateString()}`}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {isMissed ? (
                                                    <span className="text-sm font-medium text-text-muted">N/A</span>
                                                ) : (
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-lg font-bold text-text-base ">{score}</span>
                                                        <div className={`mt-1 w-24 h-1.5 rounded-full bg-bg-hover overflow-hidden`}>
                                                            <div
                                                                className={`h-full ${percentage >= 80 ? 'bg-primary' : percentage >= 50 ? 'bg-primary' : 'bg-danger'}`}
                                                                style={{ width: `${percentage}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                {isMissed ? (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-danger-light text-danger-text">
                                                        Missed
                                                    </span>
                                                ) : (
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <Link
                                                            href={`/teacher/exams/${examId}/student/${result.student?.id || 1}`}
                                                            className="inline-flex items-center px-4 py-2 bg-bg-card border border-border-base rounded-md text-sm font-medium text-primary hover:bg-bg-base transition-colors"
                                                        >
                                                            View Answers
                                                            <CheckCircle className="w-4 h-4 ml-2" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleRevoke(result)}
                                                            className="inline-flex items-center px-3 py-2 bg-warning-light text-warning-text rounded-md hover:bg-warning hover:text-white transition-colors"
                                                            title="Revoke Result"
                                                        >
                                                            <RotateCcw className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDownloadPdf(result)}
                                                            className="inline-flex items-center px-3 py-2 bg-danger-light text-danger-text rounded-md hover:bg-danger hover:text-white transition-colors"
                                                            title="Download PDF Result"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
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
