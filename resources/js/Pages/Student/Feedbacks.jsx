import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import StudentLayout from '../../Layouts/StudentLayout';
import CustomButton from '../../Core/Widgets/CustomButton';
import { Send, MessageSquare, Star, Plus, X, Calendar, User } from 'lucide-react';
import axios from 'axios';

export default function Feedbacks() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({ rating: 5, message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchFeedbacks = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            const response = await axios.get('/api/student/feedbacks', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFeedbacks(response.data.data || []);
        } catch (error) {
            console.error("Error fetching feedbacks", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const token = localStorage.getItem('auth_token');
        try {
            await axios.post('/api/student/feedbacks', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFormData({ rating: 5, message: '' });
            setIsModalOpen(false);
            fetchFeedbacks(); // Refresh the list
        } catch (error) {
            console.error("Error submitting feedback", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <StudentLayout title="My Feedbacks">
            <Head title="Feedbacks" />

            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-text-base">My Feedbacks</h2>
                        <p className="text-text-muted text-sm mt-1">View your previous feedbacks or submit a new one.</p>
                    </div>
                    <CustomButton onClick={() => setIsModalOpen(true)} icon={Plus}>
                        Add Feedback
                    </CustomButton>
                </div>

                <div className="bg-bg-card rounded-md shadow-sm border border-border-base transition-colors p-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-24">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                        </div>
                    ) : feedbacks.length === 0 ? (
                        <div className="text-center py-24 text-text-muted ">
                            <MessageSquare className="w-16 h-16 mx-auto text-text-muted mb-4 opacity-50" />
                            <p className="text-lg font-medium">No feedbacks submitted yet.</p>
                            <p className="text-sm mt-2 opacity-80">Click 'Add Feedback' to share your experience with us.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {feedbacks.map((item) => (
                                <div key={item.id} className="bg-bg-base rounded-md border border-border-base p-5 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-text-base">Me</h3>
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

                {/* Add Feedback Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 backdrop-blur-sm p-4">
                        <div className="relative w-full max-w-lg rounded-xl bg-bg-card shadow-2xl border border-border-base">
                            <div className="flex items-center justify-between border-b border-border-base px-6 py-4">
                                <h3 className="text-xl font-bold text-text-base">Submit New Feedback</h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-lg p-2 text-text-muted hover:bg-bg-hover hover:text-text-base transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-text-base mb-3">Your Rating</label>
                                    <div className="flex items-center space-x-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                type="button"
                                                key={star}
                                                onClick={() => setFormData({ ...formData, rating: star })}
                                                className={`p-1 transition-colors focus:outline-none ${formData.rating >= star ? 'text-yellow-400' : 'text-border-base hover:text-yellow-200'}`}
                                            >
                                                <Star className="w-8 h-8" fill={formData.rating >= star ? 'currentColor' : 'none'} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-base mb-2">Your Message</label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-bg-base border border-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text-base min-h-[150px]"
                                        placeholder="Describe your issue or suggestion in detail..."
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="pt-4 border-t border-border-base flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-sm font-medium text-text-base bg-bg-base border border-border-base rounded-md hover:bg-bg-hover transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <CustomButton type="submit" disabled={isSubmitting || !formData.message} icon={Send} className="py-2">
                                        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                                    </CustomButton>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}
