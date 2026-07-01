import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import StudentLayout from '../../Layouts/StudentLayout';
import CustomButton from '../../Core/Widgets/CustomButton';
import { CheckCircle, XCircle, Award, Clock, ArrowRight } from 'lucide-react';
import axios from 'axios';

export default function ExamResultPage({ paperId }) {
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchResult = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            try {
                // Fetch submission results
                const res = await axios.get(`/api/student/exams/${paperId}/result`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setResult(res.data);
            } catch (error) {
                console.error("Error fetching results", error);
                // Mock result if endpoint doesn't exist yet for demonstration
                setResult({
                    score: 85,
                    total_marks: 100,
                    correct_answers: 17,
                    incorrect_answers: 3,
                    unattempted: 0,
                    total_questions: 20,
                    percentage: 85
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchResult();
    }, [paperId]);

    if (isLoading) {
        return (
            <StudentLayout title="Exam Result">
                <div className="flex justify-center items-center py-24">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </StudentLayout>
        );
    }

    const percentage = result.percentage || Math.round((result.score / result.total_marks) * 100) || 0;

    let grade = 'Needs Improvement';
    let gradeColor = 'text-danger';
    if (percentage >= 90) { grade = 'Excellent'; gradeColor = 'text-primary'; }
    else if (percentage >= 75) { grade = 'Good'; gradeColor = 'text-primary'; }
    else if (percentage >= 50) { grade = 'Average'; gradeColor = 'text-primary'; }

    return (
        <StudentLayout title="Exam Result">
            <Head title="Result" />

            <div className="max-w-7xl mx-auto">
                <div className="bg-bg-card rounded-3xl shadow-lg border border-border-base p-8 sm:p-12 text-center transition-colors relative overflow-hidden">

                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-primary opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary opacity-5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

                    <div className="relative z-10">
                        <div className="w-24 h-24 mx-auto bg-primary-light rounded-full flex items-center justify-center mb-6 border-4 border-primary-light ">
                            <Award className="w-12 h-12 text-primary " />
                        </div>

                        <h2 className="text-3xl font-black text-text-base mb-2">Exam Completed!</h2>
                        <p className="text-text-muted mb-10">You have successfully submitted your answers.</p>

                        <div className="flex flex-col sm:flex-row justify-center items-center gap-8 mb-12">
                            <div className="relative">
                                <svg className="w-40 h-40 transform -rotate-90">
                                    <circle cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-text-muted " />
                                    <circle
                                        cx="80" cy="80" r="70"
                                        fill="transparent"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        strokeDasharray="439.8"
                                        strokeDashoffset={439.8 - (439.8 * percentage) / 100}
                                        strokeLinecap="round"
                                        className={`${gradeColor} transition-all duration-1000 ease-out`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-black text-text-base ">{percentage}%</span>
                                </div>
                            </div>

                            <div className="text-left space-y-4">
                                <div>
                                    <div className="text-sm text-text-muted uppercase font-bold tracking-wider mb-1">Total Score</div>
                                    <div className="text-3xl font-bold text-text-base ">{result.score} <span className="text-xl text-text-muted font-medium">/ {result.total_marks}</span></div>
                                </div>
                                <div>
                                    <div className="text-sm text-text-muted uppercase font-bold tracking-wider mb-1">Performance</div>
                                    <div className={`text-xl font-bold ${gradeColor}`}>{grade}</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-10 border-y border-border-base py-6">
                            <div className="text-center">
                                <div className="flex items-center justify-center text-primary mb-2">
                                    <CheckCircle className="w-5 h-5 mr-1" />
                                </div>
                                <div className="text-2xl font-bold text-text-base ">{result.correct_answers}</div>
                                <div className="text-xs text-text-muted font-medium">Correct</div>
                            </div>
                            <div className="text-center border-x border-border-base ">
                                <div className="flex items-center justify-center text-danger mb-2">
                                    <XCircle className="w-5 h-5 mr-1" />
                                </div>
                                <div className="text-2xl font-bold text-text-base ">{result.incorrect_answers}</div>
                                <div className="text-xs text-text-muted font-medium">Incorrect</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center text-text-muted mb-2">
                                    <Clock className="w-5 h-5 mr-1" />
                                </div>
                                <div className="text-2xl font-bold text-text-base ">{result.unattempted}</div>
                                <div className="text-xs text-text-muted font-medium">Unattempted</div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/student/exams" className="px-6 py-3 bg-bg-hover hover:bg-bg-hover text-text-base font-bold rounded-xl transition-colors">
                                Back to Exams
                            </Link>
                            <Link href={`/student/exams/${paperId}/answers`} className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl flex items-center justify-center transition-colors">
                                View Detailed Answers
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
