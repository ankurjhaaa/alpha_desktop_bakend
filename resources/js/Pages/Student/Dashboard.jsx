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
    
    const now = new Date();
    
    // Upcoming: Not completed AND (no end_time OR end_time is in the future)
    const upcomingExams = exams.filter(e => {
        if (e.is_completed === true) return false;
        if (!e.end_time) return true;
        return new Date(e.end_time) > now;
    });

    // Missed: Not completed AND (end_time is in the past)
    const missedExams = exams.filter(e => {
        if (e.is_completed === true) return false;
        if (!e.end_time) return false;
        return new Date(e.end_time) <= now;
    });

    // For the stat card, total pending could mean upcoming + missed, or just upcoming. Let's just use upcoming.
    const pendingExamsCount = upcomingExams.length;

    let avgPercentage = 0;
    if (completedExams.length > 0) {
        avgPercentage = completedExams.reduce((sum, e) => sum + (parseFloat(e.percentage) || 0), 0) / completedExams.length;
    }

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid': return 'text-primary bg-primary-light ';
            case 'partial': return 'text-primary bg-primary-light ';
            case 'unpaid': return 'text-danger-text bg-danger-light ';
            default: return 'text-text-muted bg-bg-hover ';
        }
    };

    const StatCard = ({ title, value, icon: Icon, colorClass, bgClass }) => (
        <div className="bg-bg-card p-6 rounded-md border border-border-base shadow-sm flex flex-col justify-center transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-md ${bgClass}`}>
                    <Icon className={`w-6 h-6 ${colorClass}`} />
                </div>
            </div>
            <h3 className="text-3xl font-bold text-text-base mb-1">{value}</h3>
            <p className="text-text-muted font-medium text-sm">{title}</p>
        </div>
    );

    return (
        <StudentLayout title="Student Dashboard">
            <Head title="Student Dashboard" />

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="Enrolled Batches" value={batches.length} icon={Layers} colorClass="text-primary " bgClass="bg-primary-light-hover " />
                        <StatCard title="Exams Taken" value={completedExams.length} icon={CheckCircle} colorClass="text-primary " bgClass="bg-primary-light " />
                        <StatCard title="Upcoming Exams" value={pendingExamsCount} icon={Clock} colorClass="text-primary " bgClass="bg-primary-light " />
                        <StatCard title="Avg. Score" value={completedExams.length === 0 ? 'N/A' : `${avgPercentage.toFixed(1)}%`} icon={TrendingUp} colorClass="text-primary " bgClass="bg-primary-light " />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                        {/* Enrolled Batches */}
                        <div className="xl:col-span-7 bg-bg-card rounded-md border border-border-base shadow-sm p-6 transition-colors">
                            <h2 className="text-lg font-bold text-text-base mb-6">My Batches</h2>
                            {batches.length === 0 ? (
                                <p className="text-text-muted text-center py-8">You are not enrolled in any batches yet.</p>
                            ) : (
                                <div className="space-y-6">
                                    {batches.map((batch, i) => (
                                        <div key={i}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="p-3 rounded-md bg-primary-light-hover/50 ">
                                                        <BookOpen className="w-6 h-6 text-primary " />
                                                    </div>
                                                    <div className="ml-4">
                                                        <p className="text-base font-semibold text-text-base ">
                                                            {batch.name || 'Unknown Batch'}
                                                        </p>
                                                        {batch.course && (
                                                            <p className="text-sm text-text-muted mt-0.5">
                                                                Course: {batch.course.name}
                                                            </p>
                                                        )}
                                                        {batch.schedule_time && (
                                                            <p className="text-sm text-text-muted mt-0.5">
                                                                {batch.schedule_time}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                {batch.pivot?.status && (
                                                    <div className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${getStatusColor(batch.pivot.status)}`}>
                                                        {batch.pivot.status}
                                                    </div>
                                                )}
                                            </div>
                                            {i !== batches.length - 1 && <hr className="mt-6 border-border-base " />}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Upcoming and Missed Exams */}
                        <div className="xl:col-span-5 space-y-6">
                            
                            {/* Upcoming Exams */}
                            <div className="bg-bg-card rounded-md border border-border-base shadow-sm p-6 transition-colors">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-bold text-text-base ">Upcoming Exams</h2>
                                    <Link href="/student/exams" className="text-primary text-sm font-semibold hover:underline">View All</Link>
                                </div>
                                {upcomingExams.length === 0 ? (
                                    <p className="text-text-muted text-center py-8">No upcoming exams. You are all caught up!</p>
                                ) : (
                                    <div className="space-y-4">
                                        {upcomingExams.slice(0, 5).map((exam, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 rounded-md border border-primary-light bg-primary-light/50 ">
                                                <div className="flex items-center">
                                                    <FileQuestion className="w-5 h-5 text-primary mr-4 flex-shrink-0" />
                                                    <div>
                                                        <h4 className="font-semibold text-text-base text-sm mb-1 line-clamp-1">{exam.title || 'Exam'}</h4>
                                                        <p className="text-xs text-text-muted ">
                                                            {exam.exam_date ? `Exam Date: ${exam.exam_date}` : 'Available Now'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="px-2 py-1 rounded-md bg-primary-light-hover text-primary-hover text-[10px] font-bold ml-2">
                                                    READY
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Missed Exams */}
                            {missedExams.length > 0 && (
                                <div className="bg-bg-card rounded-md border border-border-base shadow-sm p-6 transition-colors">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-lg font-bold text-text-base ">Missed Exams</h2>
                                        <Link href="/student/exams?filter=past" className="text-primary text-sm font-semibold hover:underline">View All</Link>
                                    </div>
                                    <div className="space-y-4">
                                        {missedExams.slice(0, 5).map((exam, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 rounded-md border border-danger-text/20 bg-danger-light/50 ">
                                                <div className="flex items-center">
                                                    <FileQuestion className="w-5 h-5 text-danger-text mr-4 flex-shrink-0" />
                                                    <div>
                                                        <h4 className="font-semibold text-text-base text-sm mb-1 line-clamp-1">{exam.title || 'Exam'}</h4>
                                                        <p className="text-xs text-text-muted ">
                                                            {exam.exam_date ? `Missed Date: ${exam.exam_date}` : 'Expired'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="px-2 py-1 rounded-md bg-danger-text/10 text-danger-text text-[10px] font-bold ml-2">
                                                    MISSED
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </StudentLayout>
    );
}
