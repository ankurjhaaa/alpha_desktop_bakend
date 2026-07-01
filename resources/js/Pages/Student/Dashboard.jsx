import React, { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import StudentLayout from '../../Layouts/StudentLayout';
import { Layers, CheckCircle, Clock, TrendingUp, BookOpen, FileQuestion } from 'lucide-react';
import axios from 'axios';

export default function StudentDashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [batches, setBatches] = useState([]);
    const [exams, setExams] = useState([]);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [profileRes, examsRes] = await Promise.all([
                axios.get('/api/student/profile', config),
                axios.get('/api/student/exams', config),
            ]);

            setProfile(profileRes.data);
            setBatches(profileRes.data.batches || []);
            setExams(examsRes.data || []);
        } catch (error) {
            console.error("Error fetching student dashboard data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const completedExams = exams.filter(e => e.is_completed === true);
    const pendingExams = exams.filter(e => e.is_completed !== true);
    let avgPercentage = 0;
    if (completedExams.length > 0) {
        avgPercentage = completedExams.reduce((sum, e) => sum + (parseFloat(e.percentage) || 0), 0) / completedExams.length;
    }

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
            case 'partial': return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30';
            case 'unpaid': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
            default: return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800';
        }
    };

    const StatCard = ({ title, value, icon: Icon, colorClass, bgClass }) => (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-center transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${bgClass}`}>
                    <Icon className={`w-6 h-6 ${colorClass}`} />
                </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{value}</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{title}</p>
        </div>
    );

    return (
        <StudentLayout title="Student Dashboard">
            <Head title="Student Dashboard" />

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="Enrolled Batches" value={batches.length} icon={Layers} colorClass="text-blue-600 dark:text-blue-400" bgClass="bg-blue-100 dark:bg-blue-900/30" />
                        <StatCard title="Exams Taken" value={completedExams.length} icon={CheckCircle} colorClass="text-green-600 dark:text-green-400" bgClass="bg-green-100 dark:bg-green-900/30" />
                        <StatCard title="Pending Exams" value={pendingExams.length} icon={Clock} colorClass="text-orange-600 dark:text-orange-400" bgClass="bg-orange-100 dark:bg-orange-900/30" />
                        <StatCard title="Avg. Score" value={completedExams.length === 0 ? 'N/A' : `${avgPercentage.toFixed(1)}%`} icon={TrendingUp} colorClass="text-purple-600 dark:text-purple-400" bgClass="bg-purple-100 dark:bg-purple-900/30" />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                        {/* Enrolled Batches */}
                        <div className="xl:col-span-7 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 transition-colors">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">My Batches</h2>
                            {batches.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">You are not enrolled in any batches yet.</p>
                            ) : (
                                <div className="space-y-6">
                                    {batches.map((batch, i) => (
                                        <div key={i}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="p-3 rounded-lg bg-blue-100/50 dark:bg-blue-900/30">
                                                        <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <p className="text-base font-semibold text-slate-900 dark:text-white">
                                                            {batch.name || 'Unknown Batch'}
                                                        </p>
                                                        {batch.course && (
                                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                                                Course: {batch.course.name}
                                                            </p>
                                                        )}
                                                        {batch.schedule_time && (
                                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                                                {batch.schedule_time}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                {batch.pivot?.status && (
                                                    <div className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${getStatusColor(batch.pivot.status)}`}>
                                                        {batch.pivot.status}
                                                    </div>
                                                )}
                                            </div>
                                            {i !== batches.length - 1 && <hr className="mt-6 border-slate-100 dark:border-slate-700" />}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Upcoming Exams */}
                        <div className="xl:col-span-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 transition-colors">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Upcoming Exams</h2>
                                <Link href="/student/exams" className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline">View All</Link>
                            </div>
                            {pendingExams.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">No pending exams. You are all caught up!</p>
                            ) : (
                                <div className="space-y-4">
                                    {pendingExams.slice(0, 5).map((exam, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10">
                                            <div className="flex items-center">
                                                <FileQuestion className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-4" />
                                                <div>
                                                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{exam.title || 'Exam'}</h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        {exam.exam_date ? `Exam Date: ${exam.exam_date}` : 'Available Now'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[10px] font-bold">
                                                READY
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </StudentLayout>
    );
}
