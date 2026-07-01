import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import TeacherLayout from '../../Layouts/TeacherLayout';
import { MessageSquare, Calendar, User } from 'lucide-react';
import axios from 'axios';

export default function Feedbacks() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            try {
                const res = await axios.get('/api/teacher/feedbacks', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFeedbacks(res.data);
            } catch (error) {
                console.error("Error fetching feedbacks", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFeedbacks();
    }, []);

    return (
        <TeacherLayout title="Student Feedbacks">
            <Head title="Feedbacks" />

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors p-6">
                
                {isLoading ? (
                    <div className="flex justify-center items-center py-24">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                ) : feedbacks.length === 0 ? (
                    <div className="text-center py-24 text-slate-500 dark:text-slate-400">
                        <MessageSquare className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                        <p className="text-lg">No feedbacks received yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {feedbacks.map((item) => (
                            <div key={item.id} className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white">{item.student?.name || 'Anonymous Student'}</h3>
                                            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-full">
                                        {item.subject || 'General'}
                                    </span>
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                                    "{item.message}"
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </TeacherLayout>
    );
}
