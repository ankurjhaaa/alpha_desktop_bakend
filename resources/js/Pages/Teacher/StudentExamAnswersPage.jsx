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
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            </TeacherLayout>
        );
    }

    return (
        <TeacherLayout title={`Answers: ${studentData?.name}`}>
            <Head title="Student Answers" />

            <div className="mb-6 flex items-center justify-between">
                <Link href={`/teacher/exams/${examId}/results`} className="inline-flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Leaderboard
                </Link>
                
                <div className="flex items-center bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                    <User className="w-4 h-4 mr-2 text-slate-400" />
                    <span className="font-bold text-slate-800 dark:text-white">{studentData?.name}</span>
                </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
                {questions.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        No answers found for this student.
                    </div>
                ) : (
                    questions.map((q, index) => {
                        const isCorrect = q.selected_answer === q.correct_answer;
                        const isUnattempted = !q.selected_answer;
                        
                        return (
                            <div key={q.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
                                <div className={`p-4 border-b flex items-center font-bold ${
                                    isCorrect ? 'bg-green-50 border-green-100 text-green-800 dark:bg-green-900/20 dark:border-green-900/50 dark:text-green-400' :
                                    isUnattempted ? 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-300' :
                                    'bg-red-50 border-red-100 text-red-800 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400'
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
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 leading-relaxed">
                                        {q.question_text}
                                    </h3>
                                    
                                    <div className="space-y-3">
                                        {['A', 'B', 'C', 'D'].map(optLabel => {
                                            const optText = q[`option_${optLabel.toLowerCase()}`];
                                            if (!optText) return null;
                                            
                                            const isSelected = q.selected_answer === optLabel;
                                            const isActualCorrect = q.correct_answer === optLabel;
                                            
                                            let borderClass = 'border-slate-200 dark:border-slate-700';
                                            let bgClass = 'bg-white dark:bg-slate-800';
                                            let textClass = 'text-slate-700 dark:text-slate-300';
                                            let icon = null;
                                            
                                            if (isActualCorrect) {
                                                borderClass = 'border-green-500';
                                                bgClass = 'bg-green-50 dark:bg-green-900/20';
                                                textClass = 'text-green-900 dark:text-green-300 font-medium';
                                                icon = <Check className="w-5 h-5 text-green-500 ml-auto" />;
                                            } else if (isSelected && !isCorrect) {
                                                borderClass = 'border-red-500';
                                                bgClass = 'bg-red-50 dark:bg-red-900/20';
                                                textClass = 'text-red-900 dark:text-red-300 font-medium';
                                                icon = <X className="w-5 h-5 text-red-500 ml-auto" />;
                                            }

                                            return (
                                                <div key={optLabel} className={`p-4 rounded-xl border-2 flex items-center ${borderClass} ${bgClass} transition-colors`}>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 ${
                                                        isActualCorrect ? 'bg-green-500 text-white' :
                                                        (isSelected && !isCorrect) ? 'bg-red-500 text-white' :
                                                        'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
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
