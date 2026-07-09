import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import TeacherLayout from '../../Layouts/TeacherLayout';
import { MessageSquare, Calendar, User, Star } from 'lucide-react';
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

            <div className="bg-bg-card rounded-md shadow-sm border border-border-base transition-colors p-6">

                {isLoading ? (
                    <div className="flex justify-center items-center py-24">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                ) : feedbacks.length === 0 ? (
                    <div className="text-center py-24 text-text-muted ">
                        <MessageSquare className="w-16 h-16 mx-auto text-text-muted mb-4" />
                        <p className="text-lg">No feedbacks received yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {feedbacks.map((item) => (
                            <div key={item.id} className="bg-bg-base rounded-md border border-border-base p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-primary-light-hover flex items-center justify-center text-primary-hover ">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-text-base ">{item.student?.name || 'Anonymous Student'}</h3>
                                            <div className="flex items-center text-xs text-text-muted mt-0.5">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} className={`w-4 h-4 ${item.rating >= star ? 'text-yellow-400' : 'text-border-base'}`} fill={item.rating >= star ? 'currentColor' : 'none'} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-text-base text-sm leading-relaxed">
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
