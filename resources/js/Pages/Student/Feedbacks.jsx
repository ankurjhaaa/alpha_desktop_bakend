import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import StudentLayout from '../../Layouts/StudentLayout';
import CustomButton from '../../Core/Widgets/CustomButton';
import CustomTextField from '../../Core/Widgets/CustomTextField';
import { Send, MessageSquare } from 'lucide-react';
import axios from 'axios';

export default function Feedbacks() {
    const [formData, setFormData] = useState({ subject: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const token = localStorage.getItem('auth_token');
        try {
            await axios.post('/api/student/feedbacks', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Feedback submitted successfully. Thank you!");
            setFormData({ subject: '', message: '' });
            router.visit('/student'); // Redirect to dashboard after submission
        } catch (error) {
            console.error("Error submitting feedback", error);
            alert("Failed to submit feedback. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <StudentLayout title="Submit Feedback">
            <Head title="Feedbacks" />

            <div className="max-w-7xl mx-auto">
                <div className="bg-bg-card border border-border-base rounded-md p-6 mb-6 text-text-base shadow-sm relative overflow-hidden transition-colors">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary opacity-10 rounded-full blur-2xl"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">Submit Feedback</h2>
                            <p className="text-text-muted opacity-90 text-sm">Let us know if you have any issues, suggestions, or questions.</p>
                        </div>
                        <div className="mt-4 md:mt-0 p-3 bg-bg-hover rounded-md border border-border-base flex items-center space-x-3 transition-colors hidden md:flex">
                            <MessageSquare className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                </div>

                <div className="bg-bg-card rounded-md shadow-sm border border-border-base overflow-hidden transition-colors">
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <CustomTextField
                            label="Subject"
                            placeholder="e.g. Issue with recent exam, Suggestion for new material..."
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            required
                        />

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

                        <div className="pt-4">
                            <CustomButton type="submit" disabled={isSubmitting || !formData.subject || !formData.message} icon={Send} className="w-full justify-center py-3 text-lg">
                                {isSubmitting ? 'Submitting...' : 'Send Feedback'}
                            </CustomButton>
                        </div>
                    </form>
                </div>
            </div>
        </StudentLayout>
    );
}
