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

            <div className="max-w-7xl mx-auto mt-8">
                <div className="bg-bg-card rounded-md shadow-lg border border-border-base overflow-hidden transition-colors">

                    <div className="bg-gradient-to-r from-primary to-primary-hover p-8 text-white text-center">
                        <div className="w-16 h-16 bg-bg-card/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
                            <MessageSquare className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">We value your feedback!</h2>
                        <p className="text-primary-light">Let us know if you have any issues, suggestions, or questions for your teachers.</p>
                    </div>

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
