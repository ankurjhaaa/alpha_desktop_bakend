import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import StudentLayout from '../../Layouts/StudentLayout';
import { User, Phone, BookOpen, Clock, Calendar, MapPin, Loader2, Award } from 'lucide-react';
import axios from 'axios';

export default function Profile() {
    const [student, setStudent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStudentDetails = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            try {
                const res = await axios.get('/api/student/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStudent(res.data);
            } catch (error) {
                console.error("Error fetching student details", error);
                alert("Failed to load profile details.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudentDetails();
    }, []);

    const formatDate = (isoDate) => {
        if (!isoDate) return 'N/A';
        try {
            const date = new Date(isoDate);
            return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
        } catch (e) {
            return 'Invalid Date';
        }
    };

    if (isLoading) {
        return (
            <StudentLayout title="My Profile">
                <div className="flex justify-center items-center py-24">
                    <Loader2 className="animate-spin text-primary w-8 h-8" />
                </div>
            </StudentLayout>
        );
    }

    if (!student) {
        return (
            <StudentLayout title="My Profile">
                <div className="text-center py-24 text-text-muted">Profile not found.</div>
            </StudentLayout>
        );
    }

    const isActive = student.is_active === 1 || student.is_active === true;

    return (
        <StudentLayout title="My Profile">
            <Head title="Profile" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                
                {/* Profile Card & Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-bg-card rounded-md border border-border-base p-6 flex flex-col items-center text-center transition-colors shadow-sm">
                        <div className="w-24 h-24 rounded-full bg-primary-light-hover flex items-center justify-center border-4 border-white shadow-sm mb-4 overflow-hidden">
                            {student.profile_image ? (
                                <img src={student.profile_image} alt={student.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl font-bold text-primary">{student.name.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-text-base mb-1 capitalize">{student.name}</h2>
                        <p className="text-text-muted text-sm mb-1">{student.email}</p>
                        {student.registration_id && (
                            <p className="text-text-muted/70 text-xs mb-3">Admission No: {student.registration_id}</p>
                        )}
                        <span className={`px-3 py-1 rounded-md font-bold text-xs ${isActive ? 'bg-primary-light text-primary-hover' : 'bg-danger-light text-danger-text'}`}>
                            {isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    <div className="bg-bg-card rounded-md border border-border-base p-5 transition-colors shadow-sm">
                        <h3 className="text-sm font-bold text-text-base mb-4 uppercase tracking-wide border-b border-border-base/50 pb-2">Personal Info</h3>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-md bg-bg-hover flex items-center justify-center mr-3 text-text-muted">
                                    <User className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-medium text-text-muted/70 uppercase">Father's Name</p>
                                    <p className="text-sm font-medium text-text-base">{student.father_name || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-md bg-bg-hover flex items-center justify-center mr-3 text-text-muted">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-medium text-text-muted/70 uppercase">Phone</p>
                                    <p className="text-sm font-medium text-text-base">{student.phone || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-md bg-bg-hover flex items-center justify-center mr-3 text-text-muted">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-medium text-text-muted/70 uppercase">Date of Birth</p>
                                    <p className="text-sm font-medium text-text-base">{formatDate(student.dob)}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-md bg-bg-hover flex items-center justify-center mr-3 text-text-muted">
                                    <User className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-medium text-text-muted/70 uppercase">Gender</p>
                                    <p className="text-sm font-medium text-text-base">{student.gender || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-md bg-bg-hover flex items-center justify-center mr-3 text-text-muted">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-medium text-text-muted/70 uppercase">Address</p>
                                    <p className="text-sm font-medium text-text-base">{student.address || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-md bg-bg-hover flex items-center justify-center mr-3 text-text-muted">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-medium text-text-muted/70 uppercase">Joined</p>
                                    <p className="text-sm font-medium text-text-base">{formatDate(student.created_at)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Batches and Exams */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Enrolled Batches */}
                    <div className="bg-bg-card rounded-md border border-border-base p-6 transition-colors shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-text-base flex items-center">
                                <BookOpen className="w-5 h-5 mr-2 text-primary" />
                                Enrolled Batches
                            </h3>
                        </div>

                        {(!student.batches || student.batches.length === 0) ? (
                            <div className="p-8 text-center bg-bg-base rounded-md border border-border-base/50">
                                <p className="text-sm text-text-muted">No batches enrolled yet.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-bg-base border-b border-border-base">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold text-text-base">Batch Name</th>
                                            <th className="px-4 py-3 font-semibold text-text-base">Course</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {student.batches.map((batch, index) => (
                                            <tr key={batch.id} className="border-b border-border-base/50 hover:bg-bg-hover transition-colors last:border-0">
                                                <td className="px-4 py-3 font-medium text-text-base whitespace-nowrap">{batch.name}</td>
                                                <td className="px-4 py-3 text-text-muted whitespace-nowrap">{batch.course?.name || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Recent Exams */}
                    <div className="bg-bg-card rounded-md border border-border-base p-6 transition-colors shadow-sm">
                        <h3 className="text-lg font-bold text-text-base mb-4 flex items-center">
                            <Award className="w-5 h-5 mr-2 text-primary" />
                            Recent Exams
                        </h3>

                        {(!student.exam_results || student.exam_results.length === 0) ? (
                            <div className="p-8 text-center bg-bg-base rounded-md border border-border-base/50">
                                <p className="text-sm text-text-muted">No exams taken yet.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-bg-base border-b border-border-base">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold text-text-base">Exam Title</th>
                                            <th className="px-4 py-3 font-semibold text-text-base">Attempted On</th>
                                            <th className="px-4 py-3 font-semibold text-text-base text-right">Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {student.exam_results.map((result) => (
                                            <tr key={result.id} className="border-b border-border-base/50 hover:bg-bg-hover transition-colors last:border-0">
                                                <td className="px-4 py-3 font-medium text-text-base">
                                                    {result.mcq_paper?.title || 'Unknown Exam'}
                                                </td>
                                                <td className="px-4 py-3 text-text-muted text-xs">
                                                    {formatDate(result.created_at)}
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold">
                                                    <span className={`px-2 py-1 rounded-md text-xs ${result.percentage >= 75 ? 'bg-primary-light text-primary-hover' : result.percentage >= 50 ? 'bg-primary-light text-primary-hover' : 'bg-danger-light text-danger-text'}`}>
                                                        {result.score} / {result.total_questions} ({result.percentage}%)
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </StudentLayout>
    );
}
