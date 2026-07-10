import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Clock, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import axios from 'axios';

export default function ExamTakingPage({ paperId }) {
    const [questions, setQuestions] = useState([]);
    const [examData, setExamData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    // Timer state
    const [remainingTime, setRemainingTime] = useState(null);

    const fetchQuestions = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('auth_token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        const pwd = sessionStorage.getItem(`exam_pwd_${paperId}`) || '';

        try {
            const paperRes = await axios.get(`/api/student/exams`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const currentPaper = paperRes.data.find(p => p.id == paperId);
            setExamData(currentPaper);

            const questionsRes = await axios.post(`/api/student/exams/${paperId}/verify`, { password: pwd }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setQuestions(questionsRes.data.questions || []);
            setFetchError(null);
            
            // Exam successfully started
            localStorage.setItem(`exam_in_progress_${paperId}`, 'true');

            // Load saved drafts
            const draft = localStorage.getItem(`exam_draft_${paperId}`);
            if (draft) {
                try {
                    setAnswers(JSON.parse(draft));
                } catch (e) { }
            }
        } catch (error) {
            console.error("Error fetching exam", error);
            if (error.response && (error.response.status === 403 || error.response.status === 422)) {
                setFetchError('Unauthorized or password missing. Please start the exam from the Exams page.');
            } else {
                setFetchError('Failed to load exam. Please try again later.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Anti-cheat: Check if exam was already in progress (page refresh)
        const inProgress = localStorage.getItem(`exam_in_progress_${paperId}`);
        if (inProgress === 'true') {
            alert("Security Violation: Page refresh detected during an active exam. Your exam has been automatically submitted.");
            
            const draft = JSON.parse(localStorage.getItem(`exam_draft_${paperId}`) || '{}');
            const token = localStorage.getItem('auth_token');
            setIsSubmitting(true);
            setIsLoading(true);
            
            axios.post(`/api/student/exams/${paperId}/submit`, { answers: draft }, {
                headers: { Authorization: `Bearer ${token}` }
            }).finally(() => {
                localStorage.removeItem(`exam_in_progress_${paperId}`);
                localStorage.removeItem(`exam_draft_${paperId}`);
                sessionStorage.removeItem(`exam_pwd_${paperId}`);
                router.visit(`/student/exams/${paperId}/result`);
            });
            return;
        }

        fetchQuestions();
    }, [paperId]);

    useEffect(() => {
        if (examData && examData.end_time) {
            const endTime = new Date(examData.end_time).getTime();

            const timer = setInterval(() => {
                const now = new Date().getTime();
                const distance = endTime - now;

                if (distance < 0) {
                    clearInterval(timer);
                    setRemainingTime({ hours: 0, minutes: 0, seconds: 0 });
                    submitExam(true); // Auto submit
                } else {
                    setRemainingTime({
                        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                        seconds: Math.floor((distance % (1000 * 60)) / 1000)
                    });
                }
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [examData]);

    const handleSelectOption = (questionId, optionLabel) => {
        const newAnswers = { ...answers, [questionId]: optionLabel };
        setAnswers(newAnswers);
        localStorage.setItem(`exam_draft_${paperId}`, JSON.stringify(newAnswers));
    };

    const submitExam = async (autoSubmit = false) => {
        if (!autoSubmit) {
            if (!confirm('Are you sure you want to submit your answers? You cannot change them after submission.')) {
                return;
            }
        }

        setIsSubmitting(true);
        const token = localStorage.getItem('auth_token');

        // Prevent stale state on auto-submit closure
        const currentAnswers = autoSubmit ? JSON.parse(localStorage.getItem(`exam_draft_${paperId}`) || '{}') : answers;

        try {
            const res = await axios.post(`/api/student/exams/${paperId}/submit`, { answers: currentAnswers }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            localStorage.removeItem(`exam_draft_${paperId}`);
            localStorage.removeItem(`exam_in_progress_${paperId}`);
            sessionStorage.removeItem(`exam_pwd_${paperId}`);

            // Navigate to results page
            router.visit(`/student/exams/${paperId}/result`);
        } catch (error) {
            console.error("Error submitting exam", error);
            if (!autoSubmit) {
                alert("Failed to submit exam. Please try again.");
            }
            setIsSubmitting(false);
        }
    };

    // Anti-cheat: Submit on tab switch
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && !isSubmitting && !isLoading) {
                alert("Warning: You switched tabs! The exam has been automatically submitted due to security rules.");
                submitExam(true);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [isSubmitting, isLoading, paperId]);

    // Prevent body scroll to guarantee sticky layout
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    // Add beforeunload warning
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (!isSubmitting && !isLoading) {
                e.preventDefault();
                e.returnValue = "Refreshing or leaving this page will automatically submit your exam. Are you sure?";
                return e.returnValue;
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isSubmitting, isLoading]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-base ">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-bg-base text-text-base p-6">
                <h2 className="text-2xl font-bold mb-4 text-danger-text text-center">{fetchError}</h2>
                <button onClick={() => router.visit('/student/exams')} className="px-6 py-3 bg-primary hover:bg-primary-hover text-primary-text font-bold rounded-md transition-colors">Go Back to Exams</button>
            </div>
        );
    }

    if (questions.length === 0 && !isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-bg-base text-text-base ">
                <h2 className="text-2xl font-bold mb-4">No Questions Found</h2>
                <button onClick={() => router.visit('/student/exams')} className="px-4 py-2 bg-primary text-primary-text rounded-md">Go Back</button>
            </div>
        );
    }

    const question = questions[currentIndex];
    const isLastQuestion = currentIndex === questions.length - 1;
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="fixed inset-0 bg-bg-base text-text-base flex flex-col md:flex-row overflow-hidden">
            <Head title="Taking Exam" />

            {/* Left Main Section */}
            <div className="flex-1 flex flex-col h-full bg-bg-base relative border-r border-border-base overflow-hidden">
                {/* Header (Mobile Timer & Info) */}
                <header className="h-16 flex items-center justify-between px-6 border-b border-border-base shrink-0 bg-bg-card">
                    <div className="font-bold text-lg">
                        Question {currentIndex + 1} of {questions.length}
                    </div>
                    {/* Mobile Timer */}
                    <div className="md:hidden">
                        {remainingTime && (
                            <div className={`flex items-center font-bold px-3 py-1 rounded-md ${remainingTime.minutes < 5 && remainingTime.hours === 0 ? 'bg-danger-light text-danger-text ' : 'bg-bg-hover text-text-base '}`}>
                                <Clock className="w-4 h-4 mr-2" />
                                {String(remainingTime.hours).padStart(2, '0')}:{String(remainingTime.minutes).padStart(2, '0')}:{String(remainingTime.seconds).padStart(2, '0')}
                            </div>
                        )}
                    </div>
                </header>

                {/* Question Area */}
                <main className="flex-1 overflow-y-auto p-6 md:p-10">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8">
                            <h2 className="text-xl md:text-2xl font-bold leading-relaxed">
                                {question.question_text}
                            </h2>
                            {question.image_url && (
                                <img src={question.image_url} alt="Question" className="mt-6 max-h-72 rounded-md border border-border-base object-contain" />
                            )}
                        </div>

                        {/* Options */}
                        <div className="space-y-4">
                            {['A', 'B', 'C', 'D'].map(optLabel => {
                                const optText = question[`option_${optLabel.toLowerCase()}`];
                                if (!optText) return null;
                                const isSelected = answers[question.id] === optLabel;

                                return (
                                    <button
                                        key={optLabel}
                                        onClick={() => handleSelectOption(question.id, optLabel)}
                                        className={`w-full text-left p-4 sm:p-5 rounded-md border-2 transition-all flex items-center group cursor-pointer ${isSelected
                                            ? 'border-primary bg-primary-light/50 '
                                            : 'border-border-base hover:border-primary-light-hover bg-bg-card '
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mr-4 transition-colors ${isSelected
                                            ? 'bg-primary text-primary-text '
                                            : 'bg-bg-hover text-text-muted group-hover:bg-primary-light-hover '
                                            }`}>
                                            {optLabel}
                                        </div>
                                        <span className={`text-lg cursor-pointer ${isSelected ? 'font-semibold' : ''}`}>{optText}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </main>

                {/* Bottom Navigation */}
                <div className="h-20 border-t border-border-base bg-bg-card flex items-center justify-between px-6 shrink-0">
                    <button
                        onClick={() => setCurrentIndex(prev => prev - 1)}
                        disabled={currentIndex === 0}
                        className="px-6 py-3 rounded-md border border-border-base font-medium text-text-muted hover:bg-bg-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Previous
                    </button>
                    
                    <button
                        onClick={() => setCurrentIndex(prev => prev + 1)}
                        disabled={currentIndex === questions.length - 1}
                        className="px-6 py-3 rounded-md bg-primary hover:bg-primary-hover text-primary-text font-bold flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        Next
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                </div>
            </div>

            {/* Right Sidebar Section */}
            <aside className="w-full md:w-80 lg:w-96 bg-bg-card flex flex-col shrink-0 overflow-y-auto">
                {/* Desktop Timer */}
                <div className="hidden md:flex flex-col items-center justify-center p-6 border-b border-border-base">
                    <h3 className="text-sm font-semibold text-text-muted mb-2 uppercase tracking-wider">Time Remaining</h3>
                    {remainingTime ? (
                        <div className={`text-3xl font-bold flex items-center ${remainingTime.minutes < 5 && remainingTime.hours === 0 ? 'text-danger-text animate-pulse' : 'text-primary'}`}>
                            <Clock className="w-6 h-6 mr-3" />
                            {String(remainingTime.hours).padStart(2, '0')}:{String(remainingTime.minutes).padStart(2, '0')}:{String(remainingTime.seconds).padStart(2, '0')}
                        </div>
                    ) : (
                        <div className="text-xl font-bold text-text-muted">Loading...</div>
                    )}
                </div>

                {/* Question Grid */}
                <div className="p-6 flex-1">
                    <h3 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wider">Question Palette</h3>
                    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-5 gap-3">
                        {questions.map((q, idx) => {
                            const isAnswered = !!answers[q.id];
                            const isCurrent = currentIndex === idx;
                            
                            let boxClass = "border-border-base text-text-muted hover:bg-bg-hover";
                            if (isCurrent) {
                                boxClass = "border-primary bg-primary text-primary-text ring-2 ring-primary/30";
                            } else if (isAnswered) {
                                boxClass = "border-emerald-500 bg-emerald-50 text-emerald-600";
                            }

                            return (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-md border font-semibold text-sm transition-all cursor-pointer ${boxClass}`}
                                >
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Submit Action */}
                <div className="p-6 border-t border-border-base bg-bg-base shrink-0 mt-auto">
                    <div className="flex justify-between text-sm mb-4">
                        <span className="text-text-muted">Answered: <span className="font-bold text-emerald-600">{Object.keys(answers).length}</span></span>
                        <span className="text-text-muted">Remaining: <span className="font-bold">{questions.length - Object.keys(answers).length}</span></span>
                    </div>
                    <button
                        onClick={() => submitExam()}
                        disabled={isSubmitting}
                        className="w-full py-4 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg flex items-center justify-center transition-colors disabled:opacity-70 cursor-pointer shadow-md"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                        {!isSubmitting && <CheckCircle className="w-5 h-5 ml-2" />}
                    </button>
                </div>
            </aside>
        </div>
    );
}
