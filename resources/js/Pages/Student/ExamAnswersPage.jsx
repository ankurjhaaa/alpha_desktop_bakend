import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import StudentLayout from '../../Layouts/StudentLayout';
import { Check, X, ArrowLeft } from 'lucide-react';
import axios from 'axios';

export default function ExamAnswersPage({ paperId }) {
 const [questions, setQuestions] = useState([]);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 const fetchAnswers = async () => {
 const token = localStorage.getItem('auth_token');
 if (!token) return;

 try {
 // In a real app, this endpoint returns questions + student's selected_answer
 const res = await axios.get(`/api/student/exams/${paperId}/answers`, {
 headers: { Authorization: `Bearer ${token}` }
 });
 setQuestions(res.data);
 } catch (error) {
 console.error("Error fetching answers", error);
 // Mock data for demo if endpoint fails
 setQuestions([
 {
 id: 1,
 question_text: "What is the capital of France?",
 option_a: "London", option_b: "Berlin", option_c: "Paris", option_d: "Madrid",
 correct_answer: "C",
 selected_answer: "C",
 explanation: "Paris is the capital and most populous city of France."
 },
 {
 id: 2,
 question_text: "Which planet is known as the Red Planet?",
 option_a: "Earth", option_b: "Mars", option_c: "Jupiter", option_d: "Saturn",
 correct_answer: "B",
 selected_answer: "A",
 explanation: "Mars is the fourth planet from the Sun and the second-smallest planet in the Solar System, being larger than only Mercury. It is often referred to as the 'Red Planet'."
 }
 ]);
 } finally {
 setIsLoading(false);
 }
 };

 fetchAnswers();
 }, [paperId]);

 return (
 <StudentLayout title="Detailed Answers">
 <Head title="Answers" />

 <div className="mb-6">
 <Link href={`/student/exams/${paperId}/result`} className="inline-flex items-center text-sm font-medium text-text-muted hover:text-primary transition-colors">
 <ArrowLeft className="w-4 h-4 mr-1" />
 Back to Results
 </Link>
 </div>

 <div className="max-w-4xl mx-auto space-y-6">
 {isLoading ? (
 <div className="flex justify-center items-center py-24 bg-bg-card rounded-2xl border border-border-base ">
 <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
 </div>
 ) : (
 questions.map((q, index) => {
 const isCorrect = q.selected_answer === q.correct_answer;
 const isUnattempted = !q.selected_answer;
 
 return (
 <div key={q.id} className="bg-bg-card rounded-2xl shadow-sm border border-border-base overflow-hidden transition-colors">
 <div className={`p-4 border-b flex items-center font-bold ${
 isCorrect ? 'bg-emerald-500/10 text-emerald-600 border-green-100 ' :
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
 borderClass = 'border-green-500';
 bgClass = 'bg-emerald-500/10 text-emerald-600 ';
 textClass = 'text-green-900 font-medium';
 icon = <Check className="w-5 h-5 text-green-500 ml-auto" />;
 } else if (isSelected && !isCorrect) {
 borderClass = 'border-danger';
 bgClass = 'bg-danger-light ';
 textClass = 'text-danger-text font-medium';
 icon = <X className="w-5 h-5 text-danger ml-auto" />;
 }

 return (
 <div key={optLabel} className={`p-4 rounded-xl border-2 flex items-center ${borderClass} ${bgClass} transition-colors`}>
 <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 ${
 isActualCorrect ? 'bg-green-500 text-white' :
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

 {q.explanation && (
 <div className="mt-6 p-4 bg-primary-light border border-primary-light rounded-xl">
 <h4 className="font-bold text-primary-hover mb-1">Explanation:</h4>
 <p className="text-primary-hover text-sm leading-relaxed">
 {q.explanation}
 </p>
 </div>
 )}
 </div>
 </div>
 );
 })
 )}
 </div>
 </StudentLayout>
 );
}
