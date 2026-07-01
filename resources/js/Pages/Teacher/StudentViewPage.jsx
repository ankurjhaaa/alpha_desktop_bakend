import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import TeacherLayout from '../../Layouts/TeacherLayout';
import { ArrowLeft, User, Mail, Phone, BookOpen, Award, Clock } from 'lucide-react';
import axios from 'axios';

export default function StudentViewPage({ studentId }) {
 const [student, setStudent] = useState(null);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 const fetchStudentData = async () => {
 const token = localStorage.getItem('auth_token');
 if (!token) return;

 try {
 // Assuming an endpoint exists to fetch specific student details + progress
 const res = await axios.get(`/api/teacher/students/${studentId}`, {
 headers: { Authorization: `Bearer ${token}` }
 });
 setStudent(res.data);
 } catch (error) {
 console.error("Error fetching student details", error);
 // Mock data for demo
 setStudent({
 id: studentId,
 name: "Alex Johnson",
 email: "alex@example.com",
 phone: "+1 555-0198",
 enrollment_date: "2023-09-01T00:00:00Z",
 courses: [
 { id: 1, name: "Advanced Mathematics", progress: 85 },
 { id: 2, name: "Physics 101", progress: 60 }
 ],
 recent_exams: [
 { id: 101, title: "Midterm Math", score: 92, total: 100, date: "2024-03-15T10:00:00Z" },
 { id: 102, title: "Physics Quiz 1", score: 75, total: 100, date: "2024-03-10T14:30:00Z" }
 ]
 });
 } finally {
 setIsLoading(false);
 }
 };

 fetchStudentData();
 }, [studentId]);

 if (isLoading) {
 return (
 <TeacherLayout title="Student Details">
 <div className="flex justify-center items-center py-24">
 <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
 </div>
 </TeacherLayout>
 );
 }

 if (!student) {
 return (
 <TeacherLayout title="Student Details">
 <div className="text-center py-24 text-text-muted">Student not found.</div>
 </TeacherLayout>
 );
 }

 return (
 <TeacherLayout title={`Student: ${student.name}`}>
 <Head title={student.name} />

 <div className="mb-6">
 <Link href="/teacher/students" className="inline-flex items-center text-sm font-medium text-text-muted hover:text-primary transition-colors">
 <ArrowLeft className="w-4 h-4 mr-1" />
 Back to Students List
 </Link>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 
 {/* Profile Card */}
 <div className="lg:col-span-1">
 <div className="bg-bg-card rounded-2xl shadow-sm border border-border-base p-6 text-center transition-colors">
 <div className="w-32 h-32 mx-auto rounded-full bg-primary-light-hover flex items-center justify-center text-primary-hover text-4xl font-bold mb-4 border-4 border-white shadow-md">
 {student.name.charAt(0).toUpperCase()}
 </div>
 <h2 className="text-2xl font-bold text-text-base mb-1">{student.name}</h2>
 <p className="text-text-muted text-sm mb-6">Enrolled {new Date(student.enrollment_date || Date.now()).toLocaleDateString()}</p>
 
 <div className="space-y-3 text-left">
 <div className="flex items-center p-3 rounded-lg bg-bg-base ">
 <Mail className="w-5 h-5 text-text-muted mr-3" />
 <span className="text-text-base ">{student.email}</span>
 </div>
 <div className="flex items-center p-3 rounded-lg bg-bg-base ">
 <Phone className="w-5 h-5 text-text-muted mr-3" />
 <span className="text-text-base ">{student.phone || 'N/A'}</span>
 </div>
 </div>
 </div>
 </div>

 {/* Progress and Activity */}
 <div className="lg:col-span-2 space-y-6">
 
 {/* Courses */}
 <div className="bg-bg-card rounded-2xl shadow-sm border border-border-base p-6 transition-colors">
 <h3 className="text-lg font-bold text-text-base mb-4 flex items-center">
 <BookOpen className="w-5 h-5 mr-2 text-primary" />
 Enrolled Courses
 </h3>
 
 <div className="space-y-4">
 {student.courses && student.courses.length > 0 ? student.courses.map(course => (
 <div key={course.id} className="border border-border-base p-4 rounded-xl">
 <div className="flex justify-between items-center mb-2">
 <h4 className="font-bold text-text-base ">{course.name}</h4>
 <span className="text-sm font-semibold text-primary ">{course.progress}%</span>
 </div>
 <div className="w-full bg-bg-hover rounded-full h-2">
 <div className="bg-primary h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
 </div>
 </div>
 )) : (
 <p className="text-text-muted ">No courses enrolled.</p>
 )}
 </div>
 </div>

 {/* Recent Exams */}
 <div className="bg-bg-card rounded-2xl shadow-sm border border-border-base p-6 transition-colors">
 <h3 className="text-lg font-bold text-text-base mb-4 flex items-center">
 <Award className="w-5 h-5 mr-2 text-yellow-500" />
 Recent Exam Performances
 </h3>
 
 <div className="overflow-x-auto">
 <table className="w-full text-left text-sm">
 <thead>
 <tr className="border-b border-border-base text-text-muted uppercase tracking-wider">
 <th className="pb-3 font-semibold">Exam Title</th>
 <th className="pb-3 font-semibold">Date</th>
 <th className="pb-3 font-semibold text-right">Score</th>
 </tr>
 </thead>
 <tbody>
 {student.recent_exams && student.recent_exams.length > 0 ? student.recent_exams.map(exam => {
 const percentage = Math.round((exam.score / exam.total) * 100);
 return (
 <tr key={exam.id} className="border-b border-border-base last:border-0">
 <td className="py-4 font-medium text-text-base ">
 <Link href={`/teacher/exams/${exam.id}/student/${student.id}`} className="hover:text-primary transition-colors">
 {exam.title}
 </Link>
 </td>
 <td className="py-4 text-text-muted ">
 <div className="flex items-center">
 <Clock className="w-4 h-4 mr-1" />
 {new Date(exam.date).toLocaleDateString()}
 </div>
 </td>
 <td className="py-4 text-right font-bold text-text-base ">
 <span className={`px-2.5 py-1 rounded-lg text-sm ${percentage >= 75 ? 'bg-green-100 text-green-700 ' : percentage >= 50 ? 'bg-yellow-100 text-yellow-700 ' : 'bg-danger-light text-danger-text '}`}>
 {exam.score}/{exam.total} ({percentage}%)
 </span>
 </td>
 </tr>
 );
 }) : (
 <tr>
 <td colSpan="3" className="py-4 text-center text-text-muted ">No recent exams found.</td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>

 </div>
 </div>
 </TeacherLayout>
 );
}
