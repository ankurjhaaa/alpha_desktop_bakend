import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import TeacherLayout from '../../Layouts/TeacherLayout';
import { ArrowLeft, Check, X, User } from 'lucide-react';
import axios from 'axios';

export default function StudentExamAnswersPage({ examId, studentId }) {
    const [questions, setQuestions] = useState([]);
    const [studentData, setStudentData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnswers = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            try {
                // Endpoint gives specific student's answers for specific exam
                const res = await axios.get(`/api/teacher/exams/${examId}/student/${studentId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setQuestions(res.data.answers || []);
                setStudentData(res.data.student || { name: 'Student' });
            } catch (error) {
                console.error("Error fetching student answers", error);
                // Mock data for demo
                setStudentData({ name: "Alex Johnson", id: studentId });
                setQuestions([
                    {
                        id: 1,
                        question_text: "What is the capital of France?",
                        option_a: "London", option_b: "Berlin", option_c: "Paris", option_d: "Madrid",
                        correct_answer: "C",
                        selected_answer: "C",
                    },
                    {
                        id: 2,
                        question_text: "Which planet is known as the Red Planet?",
                        option_a: "Earth", option_b: "Mars", option_c: "Jupiter", option_d: "Saturn",
                        correct_answer: "B",
                        selected_answer: "A",
                    }
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnswers();
    }, [examId, studentId]);

    if (isLoading) {
        return (
            <TeacherLayout title="Student Answers">
                <div className="flex justify-center items-center py-24">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
            </TeacherLayout>
        );
    }

    return (
        <TeacherLayout title={`Answers: ${studentData?.name}`}>
            <Head title="Student Answers" />

            <div className="mb-6 flex items-center justify-between">
                <Link href={`/teacher/exams/${examId}/results`} className="inline-flex items-center text-sm font-medium text-text-muted hover:text-primary transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Leaderboard
                </Link>

                <div className="flex items-center bg-bg-card px-4 py-2 rounded-md shadow-sm border border-border-base ">
                    <User className="w-4 h-4 mr-2 text-text-muted" />
                    <span className="font-bold text-text-base ">{studentData?.name}</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">
                {questions.length === 0 ? (
                    <div className="bg-bg-card rounded-md p-12 text-center text-text-muted border border-border-base ">
                        No answers found for this student.
                    </div>
                ) : (
                    questions.map((q, index) => {
                        const isCorrect = q.selected_answer === q.correct_answer;
                        const isUnattempted = !q.selected_answer;

                        return (
                            <div key={q.id} className="bg-bg-card rounded-md shadow-sm border border-border-base overflow-hidden transition-colors">
                                <div className={`p-4 border-b flex items-center font-bold ${isCorrect ? 'bg-emerald-500/10 text-emerald-600 border-primary-light ' :
                                        isUnattempted ? 'bg-bg-base border-border-base text-text-base ' :
                                            'bg-danger-light border-danger-light text-danger-text '
                                    }`}>
                                    <div className="flex-1">Question {index + 1}</div>
                                    <div className="flex items-center">
                                        {isCorrect ? (
                                            <><Check className="w-5 h-5 mr-1" /> Correct</>
                                        ) : isUnattempted ? (
                                            <><span className="w-5 h-5 mr-1 text-center font-bold">-</span> Unattempted</>
                                        ) : (
                                            <><X className="w-5 h-5 mr-1" /> Incorrect</>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-text-base mb-6 leading-relaxed">
                                        {q.question_text}
                                    </h3>

                                    <div className="space-y-3">
                                        {['A', 'B', 'C', 'D'].map(optLabel => {
                                            const optText = q[`option_${optLabel.toLowerCase()}`];
                                            if (!optText) return null;

                                            const isSelected = q.selected_answer === optLabel;
                                            const isActualCorrect = q.correct_answer === optLabel;

                                            let borderClass = 'border-border-base ';
                                            let bgClass = 'bg-bg-card ';
                                            let textClass = 'text-text-base ';
                                            let icon = null;

                                            if (isActualCorrect) {
                                                borderClass = 'border-primary';
                                                bgClass = 'bg-emerald-500/10 text-emerald-600 ';
                                                textClass = 'text-primary-hover font-medium';
                                                icon = <Check className="w-5 h-5 text-primary ml-auto" />;
                                            } else if (isSelected && !isCorrect) {
                                                borderClass = 'border-danger';
                                                bgClass = 'bg-danger-light ';
                                                textClass = 'text-danger-text font-medium';
                                                icon = <X className="w-5 h-5 text-danger ml-auto" />;
                                            }

                                            return (
                                                <div key={optLabel} className={`p-4 rounded-md border-2 flex items-center ${borderClass} ${bgClass} transition-colors`}>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 ${isActualCorrect ? 'bg-primary text-white' :
                                                            (isSelected && !isCorrect) ? 'bg-danger text-white' :
                                                                'bg-bg-hover text-text-muted '
                                                        }`}>
                                                        {optLabel}
                                                    </div>
                                                    <span className={`text-lg ${textClass}`}>{optText}</span>
                                                    {icon}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </TeacherLayout>
    );
}
