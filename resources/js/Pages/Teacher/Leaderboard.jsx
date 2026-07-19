import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import TeacherLayout from '../../Layouts/TeacherLayout';
import { Trophy, Medal, Star, TrendingUp, Download } from 'lucide-react';
import axios from 'axios';
import { downloadLeaderboardPdf, downloadFilteredResultsPdf } from '../../Core/Utils/PdfGenerator';

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [downloadingStudentId, setDownloadingStudentId] = useState(null);
    const [courses, setCourses] = useState([]);
    const [courseFilter, setCourseFilter] = useState('');

    const handleDownloadStudentResults = async (student) => {
        if (!student.registration_id || student.registration_id === 'N/A') {
            alert('Cannot download results: Student has no Registration ID');
            return;
        }

        setDownloadingStudentId(student.user_id);
        const token = localStorage.getItem('auth_token');
        
        try {
            const url = `/api/results?download=true&search=${encodeURIComponent(student.registration_id)}`;
            const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
            
            if (!res.data || res.data.length === 0) {
                alert('No exam results found for this student.');
                return;
            }

            await downloadFilteredResultsPdf(res.data);
        } catch (error) {
            console.error("Error downloading student results PDF", error);
            alert("Failed to download PDF. Please try again.");
        } finally {
            setDownloadingStudentId(null);
        }
    };

    useEffect(() => {
        const fetchCourses = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) return;
            try {
                const res = await axios.get('/api/courses', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCourses(res.data);
            } catch (error) {
                console.error("Error fetching courses", error);
            }
        };
        fetchCourses();
    }, []);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setIsLoading(true);
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const url = courseFilter ? `/api/leaderboard?course_id=${courseFilter}` : '/api/leaderboard';
                const res = await axios.get(url, config);
                setLeaderboard(res.data);
            } catch (error) {
                console.error("Error fetching leaderboard", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, [courseFilter]);

    const getRankColor = (rank) => {
        if (rank === 1) return 'bg-primary-light text-primary-hover border-primary-light-hover ';
        if (rank === 2) return 'bg-bg-hover text-text-base border-border-base ';
        if (rank === 3) return 'bg-primary-light text-primary-hover border-primary-light-hover ';
        return 'bg-bg-card text-text-base border-border-base ';
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return <Trophy className="w-6 h-6 text-primary" />;
        if (rank === 2) return <Medal className="w-6 h-6 text-text-muted" />;
        if (rank === 3) return <Medal className="w-6 h-6 text-primary" />;
        return <span className="text-lg font-bold w-6 text-center">{rank}</span>;
    };

    return (
        <TeacherLayout title="Global Leaderboard">
            <Head title="Leaderboard" />

            <div className="max-w-7xl mx-auto">
                <div className="bg-bg-card border border-border-base rounded-md p-6 mb-6 text-text-base shadow-sm relative overflow-hidden transition-colors">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary opacity-10 rounded-full blur-2xl"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">Global Leaderboard</h2>
                            <p className="text-text-muted opacity-90 text-sm">Top performing students across all courses and batches.</p>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-stretch space-x-4">
                            <div className="p-3 bg-bg-hover rounded-md border border-border-base flex items-center space-x-3 transition-colors">
                                <TrendingUp className="w-6 h-6 text-primary" />
                                <div>
                                    <div className="text-xs text-text-muted uppercase tracking-wider font-semibold">Total Students</div>
                                    <div className="text-xl font-bold">{leaderboard.length} Ranked</div>
                                </div>
                            </div>
                            <button
                                onClick={() => downloadLeaderboardPdf(leaderboard)}
                                className="flex items-center justify-center bg-primary text-white px-5 rounded-md hover:bg-primary-hover transition-colors shadow-sm border border-primary-hover"
                                title="Download PDF Report"
                            >
                                <Download className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-bg-card rounded-md shadow-sm border border-border-base transition-colors overflow-hidden">
                    <div className="p-4 border-b border-border-base bg-bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="relative max-w-xs w-full">
                            <select
                                value={courseFilter}
                                onChange={(e) => setCourseFilter(e.target.value)}
                                className="w-full px-4 py-2 bg-bg-base border border-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text-base transition-colors"
                            >
                                <option value="">All Courses</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>{course.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {isLoading ? (
                        <div className="flex justify-center items-center py-24">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className="text-center py-24 text-text-muted ">
                            <Trophy className="w-16 h-16 mx-auto text-text-muted mb-4" />
                            <p className="text-lg">No leaderboard data available yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border-base ">
                            {leaderboard.map((student, index) => {
                                const rank = index + 1;
                                const isTop3 = rank <= 3;

                                return (
                                    <div key={student.user_id || index} className={`p-4 sm:px-6 flex items-center transition-colors hover:bg-bg-base ${isTop3 ? 'py-5' : 'py-4'}`}>
                                        <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full border-2 ${getRankColor(rank)}`}>
                                            {getRankIcon(rank)}
                                        </div>

                                        <div className="ml-4 sm:ml-6 flex-1 flex items-center">
                                            <div className="relative">
                                                {student.profile_image ? (
                                                    <img src={student.profile_image} alt={student.student_name} className={`rounded-full object-cover border-2 border-bg-card shadow-sm ${isTop3 ? 'w-14 h-14' : 'w-10 h-10'}`} />
                                                ) : (
                                                    <div className={`rounded-full bg-primary-light-hover flex items-center justify-center text-primary-hover font-bold border-2 border-bg-card shadow-sm ${isTop3 ? 'w-14 h-14 text-xl' : 'w-10 h-10 text-lg'}`}>
                                                        {student.student_name ? student.student_name.charAt(0).toUpperCase() : '?'}
                                                    </div>
                                                )}
                                                {isTop3 && (
                                                    <div className="absolute -bottom-1 -right-1 bg-primary-light-hover rounded-full p-0.5 border-2 border-bg-card ">
                                                        <Star className="w-3 h-3 text-primary fill-current" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-3 sm:ml-4">
                                                <div className={`font-semibold text-text-base capitalize ${isTop3 ? 'text-lg sm:text-xl' : 'text-base'}`}>
                                                    {student.student_name}
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-center text-text-muted text-xs sm:text-sm mt-0.5 space-y-1 sm:space-y-0 sm:space-x-3">
                                                    <span>{student.registration_id || student.student_email}</span>
                                                    {student.course && student.course !== 'N/A' && (
                                                        <>
                                                            <span className="hidden sm:inline text-border-base">•</span>
                                                            <span className="bg-bg-hover px-1.5 py-0.5 rounded text-xs border border-border-base font-medium">{student.course}</span>
                                                        </>
                                                    )}
                                                    {student.batch && student.batch !== 'N/A' && (
                                                        <>
                                                            <span className="hidden sm:inline text-border-base">•</span>
                                                            <span className="bg-bg-hover px-1.5 py-0.5 rounded text-xs border border-border-base">{student.batch}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="ml-4 flex items-center space-x-3.5">
                                            <div className="text-right">
                                                <div className={`font-black ${isTop3 ? 'text-2xl text-primary ' : 'text-xl text-text-base '}`}>
                                                    {student.average_marks ? `${Math.round(student.average_marks)}%` : '0%'}
                                                </div>
                                                <div className="text-xs text-text-muted uppercase tracking-wider font-semibold">Avg Score</div>
                                            </div>
                                            <button
                                                onClick={() => handleDownloadStudentResults(student)}
                                                disabled={downloadingStudentId === student.user_id}
                                                className={`p-2 bg-primary-light hover:bg-primary-light-hover text-primary rounded-md transition-colors border border-primary-light-hover flex items-center justify-center shrink-0 ${downloadingStudentId === student.user_id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                title="Download Student's Exam Papers"
                                            >
                                                {downloadingStudentId === student.user_id ? (
                                                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <Download className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </TeacherLayout>
    );
}
