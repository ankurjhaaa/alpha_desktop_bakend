import React, { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import TeacherLayout from '../../Layouts/TeacherLayout';
import { Users, BookOpen, Layers, FileQuestion, ArrowUp, UserPlus, Calendar, RefreshCw } from 'lucide-react';
import CustomButton from '../../Core/Widgets/CustomButton';
import axios from 'axios';

export default function TeacherDashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalCourses: 0,
        totalBatches: 0,
        totalMcqPapers: 0
    });
    const [recentStudents, setRecentStudents] = useState([]);
    const [upcomingBatches, setUpcomingBatches] = useState([]);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [coursesRes, batchesRes, studentsRes, mcqRes] = await Promise.all([
                axios.get('/api/courses', config),
                axios.get('/api/batches', config),
                axios.get('/api/students', config),
                axios.get('/api/mcq_papers', config),
            ]);

            const courses = coursesRes.data;
            const batches = batchesRes.data;
            const students = studentsRes.data;
            const mcqs = mcqRes.data;

            setStats({
                totalCourses: courses.length,
                totalBatches: batches.length,
                totalStudents: students.length,
                totalMcqPapers: mcqs.length
            });

            setUpcomingBatches(batches.slice(0, 3));
            setRecentStudents([...students].reverse().slice(0, 4));
        } catch (error) {
            console.error("Error fetching dashboard data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const StatCard = ({ title, value, icon: Icon, colorClass, bgClass }) => (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-center transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${bgClass}`}>
                    <Icon className={`w-6 h-6 ${colorClass}`} />
                </div>
                <div className="flex items-center text-green-600 dark:text-green-400 font-bold text-sm bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-md">
                    <ArrowUp className="w-4 h-4 mr-1" />
                    Live
                </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{value}</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{title}</p>
        </div>
    );

    return (
        <TeacherLayout title="Dashboard">
            <Head title="Teacher Dashboard" />

            <div className="flex justify-end mb-6">
                <CustomButton onPressed={fetchDashboardData} icon={RefreshCw} className="py-2 px-4 text-sm" variant="secondary">
                    Refresh Data
                </CustomButton>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="Total Students" value={stats.totalStudents} icon={Users} colorClass="text-blue-600 dark:text-blue-400" bgClass="bg-blue-100 dark:bg-blue-900/30" />
                        <StatCard title="Total Courses" value={stats.totalCourses} icon={BookOpen} colorClass="text-green-600 dark:text-green-400" bgClass="bg-green-100 dark:bg-green-900/30" />
                        <StatCard title="Total Batches" value={stats.totalBatches} icon={Layers} colorClass="text-orange-600 dark:text-orange-400" bgClass="bg-orange-100 dark:bg-orange-900/30" />
                        <StatCard title="Total MCQ Papers" value={stats.totalMcqPapers} icon={FileQuestion} colorClass="text-purple-600 dark:text-purple-400" bgClass="bg-purple-100 dark:bg-purple-900/30" />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                        {/* Recent Activity */}
                        <div className="xl:col-span-7 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 transition-colors">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Recent Enrollments</h2>
                            {recentStudents.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">No recent students found.</p>
                            ) : (
                                <div className="space-y-6">
                                    {recentStudents.map((student, i) => (
                                        <div key={i}>
                                            <div className="flex items-start">
                                                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                                    <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                        New student <span className="font-bold">{student.name}</span> joined.
                                                    </p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                        {student.email}
                                                    </p>
                                                </div>
                                            </div>
                                            {i !== recentStudents.length - 1 && <hr className="mt-6 border-slate-100 dark:border-slate-700" />}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Upcoming Batches */}
                        <div className="xl:col-span-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 transition-colors">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Upcoming Batches</h2>
                                <Link href="/teacher/batches" className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline">View All</Link>
                            </div>
                            {upcomingBatches.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">No upcoming batches scheduled.</p>
                            ) : (
                                <div className="space-y-4">
                                    {upcomingBatches.map((batch, i) => (
                                        <div key={i} className="flex p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10">
                                            <div className="w-1 h-auto bg-blue-500 rounded-full mr-4" />
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white mb-1.5">{batch.name}</h4>
                                                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 space-x-4">
                                                    <div className="flex items-center">
                                                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                                        {batch.schedule_time || 'TBD'}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                                                        {batch.course?.name || 'General Course'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </TeacherLayout>
    );
}
