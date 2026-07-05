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

    // Timer state
    const [remainingTime, setRemainingTime] = useState(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            try {
                // Assuming we have an endpoint that gives paper details AND questions for the student
                // We'll use the teacher endpoint for questions and paper endpoint for paper details
                // In a real app, there'd be a specific student endpoint `GET /student/exams/{id}/take`

                const questionsRes = await axios.get(`/api/mcq_papers/${paperId}/questions`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setQuestions(questionsRes.data);

                // Fetch paper details to get end_time for timer (mocking if not available)
                const paperRes = await axios.get(`/api/mcq_papers`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const currentPaper = paperRes.data.find(p => p.id == paperId);
                setExamData(currentPaper);

                // Load saved drafts
                const draft = localStorage.getItem(`exam_draft_${paperId}`);
                if (draft) {
                    try {
                        setAnswers(JSON.parse(draft));
                    } catch (e) { }
                }
            } catch (error) {
                console.error("Error fetching exam", error);
            } finally {
                setIsLoading(false);
            }
        };

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

        try {
            const res = await axios.post(`/api/student/exams/${paperId}/submit`, { answers }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            localStorage.removeItem(`exam_draft_${paperId}`);

            // Navigate to results page, pass data via state/session or just redirect
            router.visit(`/student/exams/${paperId}/result`);
        } catch (error) {
            console.error("Error submitting exam", error);
            alert("Failed to submit exam. Please try again.");
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-base ">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (questions.length === 0) {
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
        <div className="min-h-screen bg-bg-base flex flex-col text-text-base transition-colors">
            <Head title="Taking Exam" />

            {/* Header */}
            <header className="bg-bg-card border-b border-border-base h-16 flex items-center justify-between px-6 sticky top-0 z-10 shrink-0">
                <div className="font-bold text-lg hidden sm:block">
                    Question {currentIndex + 1} of {questions.length}
                </div>

                {remainingTime ? (
                    <div className={`flex items-center font-bold px-4 py-1.5 rounded-full ${remainingTime.minutes < 5 && remainingTime.hours === 0 ? 'bg-danger-light text-danger-text ' : 'bg-bg-hover text-text-base '}`}>
                        <Clock className="w-4 h-4 mr-2" />
                        {String(remainingTime.hours).padStart(2, '0')}:{String(remainingTime.minutes).padStart(2, '0')}:{String(remainingTime.seconds).padStart(2, '0')}
                    </div>
                ) : (
                    <div className="font-bold text-lg sm:hidden">
                        Q{currentIndex + 1}/{questions.length}
                    </div>
                )}

                <button
                    onClick={() => submitExam()}
                    disabled={isSubmitting}
                    className="font-bold text-primary hover:text-primary-hover disabled:opacity-50 transition-colors"
                >
                    Finish
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center">
                <div className="w-full max-w-3xl">
                    <div className="bg-bg-card rounded-md shadow-xl shadow-slate-200/50 border border-border-base p-6 sm:p-10">

                        {/* Progress */}
                        <div className="mb-8">
                            <div className="flex justify-between text-sm font-medium text-text-muted mb-2">
                                <span>Progress</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full bg-bg-hover rounded-full h-2.5">
                                <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>

                        {/* Question */}
                        <div className="mb-10">
                            <h2 className="text-xl sm:text-2xl font-bold leading-relaxed">
                                {question.question_text}
                            </h2>
                            {question.image_url && (
                                <img src={question.image_url} alt="Question" className="mt-6 max-h-64 rounded-md border border-border-base " />
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
                                        className={`w-full text-left p-4 sm:p-5 rounded-md border-2 transition-all flex items-center group ${isSelected
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
                                        <span className={`text-lg ${isSelected ? 'font-semibold' : ''}`}>{optText}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between mt-12 pt-8 border-t border-border-base ">
                            <button
                                onClick={() => setCurrentIndex(prev => prev - 1)}
                                disabled={currentIndex === 0}
                                className="px-6 py-3 rounded-md border border-border-base font-medium text-text-muted hover:bg-bg-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Previous
                            </button>

                            {isLastQuestion ? (
                                <button
                                    onClick={() => submitExam()}
                                    disabled={isSubmitting}
                                    className="px-8 py-3 rounded-md bg-primary hover:bg-primary-hover text-primary-text font-bold flex items-center transition-colors disabled:opacity-70"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                                    <CheckCircle className="w-5 h-5 ml-2" />
                                </button>
                            ) : (
                                <button
                                    onClick={() => setCurrentIndex(prev => prev + 1)}
                                    className="px-8 py-3 rounded-md bg-primary hover:bg-primary-hover text-primary-text font-bold flex items-center transition-colors"
                                >
                                    Next
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
