import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import TeacherLayout from '../../Layouts/TeacherLayout';
import { ArrowLeft, User, Phone, BookOpen, Clock, Calendar, MapPin, Loader2, Plus, X, Award, Eye, Download } from 'lucide-react';
import axios from 'axios';
import CustomButton from '../../Core/Widgets/CustomButton';
import { downloadExamResultPdf } from '../../Core/Utils/PdfGenerator';

export default function StudentViewPage({ studentId }) {
    const [student, setStudent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [allBatches, setAllBatches] = useState([]);
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBatchId, setSelectedBatchId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Remove Batch state
    const [batchToRemove, setBatchToRemove] = useState(null);
    const [isRemovingBatch, setIsRemovingBatch] = useState(false);
    const [batchRemoveError, setBatchRemoveError] = useState(null);

    const fetchStudentDetails = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            const res = await axios.get(`/api/students/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudent(res.data);
        } catch (error) {
            console.error("Error fetching student details", error);
            alert("Failed to load student details.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchBatches = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            const res = await axios.get('/api/batches', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllBatches(res.data);
        } catch (error) {
            console.error("Error fetching batches", error);
        }
    };

    useEffect(() => {
        fetchStudentDetails();
        fetchBatches();
    }, [studentId]);

    const attachBatch = async () => {
        if (!selectedBatchId) {
            alert('Please select a batch.');
            return;
        }

        setIsSubmitting(true);
        const token = localStorage.getItem('auth_token');
        
        try {
            await axios.post(`/api/students/${studentId}/batches`, {
                batch_id: selectedBatchId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            await fetchStudentDetails();
            setIsModalOpen(false);
            setSelectedBatchId('');
            alert('Batch enrolled successfully!');
        } catch (error) {
            console.error("Error attaching batch", error);
            alert(error.response?.data?.message || 'Failed to enroll in batch.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveBatch = async () => {
        if (!batchToRemove) return;
        setIsRemovingBatch(true);
        setBatchRemoveError(null);
        const token = localStorage.getItem('auth_token');
        try {
            await axios.delete(`/api/students/${studentId}/batches/${batchToRemove.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchStudentDetails();
            setBatchToRemove(null);
        } catch (error) {
            console.error("Error removing batch", error);
            setBatchRemoveError(error.response?.data?.message || "Failed to remove batch.");
        } finally {
            setIsRemovingBatch(false);
        }
    };

    const toggleStudentStatus = async () => {
        if (!student) return;
        setIsSubmitting(true);
        const token = localStorage.getItem('auth_token');
        const currentStatus = student.is_active === 1 || student.is_active === true;
        const newStatus = !currentStatus;
        
        try {
            await axios.put(`/api/students/${studentId}`, {
                is_active: newStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            await fetchStudentDetails();
        } catch (error) {
            console.error("Error updating student status", error);
            alert(error.response?.data?.message || 'Failed to update student status.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (isoDate) => {
        if (!isoDate) return 'N/A';
        try {
            const date = new Date(isoDate);
            return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
        } catch (e) {
            return 'Invalid Date';
        }
    };

    const handleDownloadPdf = async (result) => {
        const studentBatch = student?.batches?.find(b => b.id === result.mcq_paper?.batch_id) || student?.batches?.[0]; // Fallback to first batch if unknown
        const data = {
            examName: result.mcq_paper?.title || 'Unknown Exam',
            studentName: student?.name || 'Unknown',
            regNumber: student?.registration_id || '',
            score: result.score || 0,
            total: result.total_questions || 100,
            percentage: result.percentage || 0,
            examDate: result.created_at || new Date().toISOString(),
            fatherName: student?.father_name || 'N/A',
            course: studentBatch?.course?.name || 'N/A',
            batch: studentBatch?.name || 'N/A',
            batchTiming: studentBatch?.schedule_time || 'N/A',
        };
        await downloadExamResultPdf(data);
    };

    if (isLoading) {
        return (
            <TeacherLayout title="Student Profile">
                <div className="flex justify-center items-center py-24">
                    <Loader2 className="animate-spin text-primary w-8 h-8" />
                </div>
            </TeacherLayout>
        );
    }

    if (!student) {
        return (
            <TeacherLayout title="Student Profile">
                <div className="text-center py-24 text-text-muted">Student not found.</div>
            </TeacherLayout>
        );
    }

    const isActive = student.is_active === 1 || student.is_active === true;

    return (
        <TeacherLayout title="Student Profile">
            <Head title={student.name} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
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
                        <h2 className="text-xl font-bold text-text-base mb-1">{student.name}</h2>
                        <p className="text-text-muted text-sm mb-1">{student.email}</p>
                        {student.registration_id && (
                            <p className="text-text-muted/70 text-xs mb-3">Admission No: <span className="font-bold text-text-muted">{student.registration_id}</span></p>
                        )}
                        <button
                            onClick={toggleStudentStatus}
                            disabled={isSubmitting}
                            className={`px-4 py-1.5 rounded-full font-bold text-xs shadow-sm transition-all border ${isActive ? 'bg-primary-light/50 text-primary border-primary-light hover:bg-danger-light hover:text-danger hover:border-danger-light' : 'bg-danger-light/50 text-danger border-danger-light hover:bg-primary-light hover:text-primary hover:border-primary-light'}`}
                            title={isActive ? 'Click to Deactivate' : 'Click to Activate'}
                        >
                            {isSubmitting ? 'Updating...' : (isActive ? '● Active' : '○ Inactive')}
                        </button>
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
                            <CustomButton onPressed={() => setIsModalOpen(true)} icon={Plus} className="py-1.5 px-3 text-sm whitespace-nowrap">
                                Enroll
                            </CustomButton>
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
                                            <th className="px-4 py-3 font-semibold text-text-base text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {student.batches.map((batch, index) => (
                                            <tr key={batch.id} className="border-b border-border-base/50 hover:bg-bg-hover transition-colors last:border-0">
                                                <td className="px-4 py-3 font-medium text-text-base whitespace-nowrap">{batch.name}</td>
                                                <td className="px-4 py-3 text-text-muted whitespace-nowrap">{batch.course?.name || '-'}</td>
                                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                                    <button 
                                                        onClick={() => setBatchToRemove(batch)}
                                                        className="text-danger-text hover:bg-danger-light p-1.5 rounded-md transition-colors"
                                                        title="Remove from Batch"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </td>
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
                                            <th className="px-4 py-3 font-semibold text-text-base text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {student.exam_results.map((result) => (
                                            <tr key={result.id} className="border-b border-border-base/50 hover:bg-bg-hover transition-colors last:border-0">
                                                <td className="px-4 py-3 font-medium text-text-base">
                                                    <Link href={`/teacher/exams/${result.mcq_paper_id}/student/${student.id}`} className="hover:text-primary transition-colors">
                                                        {result.mcq_paper?.title || 'Unknown Exam'}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3 text-text-muted text-xs">
                                                    {formatDate(result.created_at)}
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold">
                                                    <span className={`px-2 py-1 rounded-md text-xs ${result.percentage >= 75 ? 'bg-primary-light text-primary-hover' : result.percentage >= 50 ? 'bg-primary-light text-primary-hover' : 'bg-danger-light text-danger-text'}`}>
                                                        {result.score} / {result.total_questions} ({result.percentage}%)
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <Link
                                                            href={`/teacher/exams/${result.mcq_paper_id}/student/${student.id}`}
                                                            className="p-1.5 bg-bg-hover text-primary rounded-md hover:bg-primary-light-hover transition-colors"
                                                            title="View Answers"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDownloadPdf(result)}
                                                            className="p-1.5 bg-danger-light text-danger-text rounded-md hover:bg-danger hover:text-white transition-colors"
                                                            title="Download PDF"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                    </div>
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

            {/* Enroll Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-bg-card rounded-md border border-border-base w-full max-w-sm overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-border-base/50">
                            <h3 className="text-lg font-bold text-text-base">Enroll in Batch</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 text-text-muted hover:text-text-base hover:bg-bg-hover rounded-md transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-base mb-1.5 flex items-center">
                                    <BookOpen className="w-4 h-4 mr-1 text-text-muted" />
                                    Select Batch
                                </label>
                                <select
                                    value={selectedBatchId}
                                    onChange={(e) => setSelectedBatchId(e.target.value)}
                                    className="w-full px-3 py-2 bg-bg-base border border-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text-base appearance-none text-sm"
                                >
                                    <option value="">-- Choose a batch --</option>
                                    {allBatches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-md border border-border-base hover:bg-bg-hover text-text-base text-sm font-semibold transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <CustomButton 
                                    onPressed={attachBatch} 
                                    isLoading={isSubmitting}
                                    className="px-4 py-2 font-semibold text-sm"
                                >
                                    Enroll
                                </CustomButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Remove Batch Confirmation Modal */}
            {batchToRemove && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-bg-card rounded-xl shadow-2xl max-w-md w-full border border-border-base overflow-hidden">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-danger-light text-danger-text rounded-full flex items-center justify-center mx-auto mb-4">
                                <X className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-text-base mb-2">Remove Batch?</h2>
                            <p className="text-text-muted font-medium mb-6">
                                Are you sure you want to remove the student from <strong>{batchToRemove.name}</strong>?
                            </p>
                            
                            {batchRemoveError && (
                                <div className="mb-4 p-3 bg-danger-light text-danger-text rounded-md text-sm font-bold text-left border border-danger">
                                    {batchRemoveError}
                                </div>
                            )}

                            <div className="flex space-x-3">
                                <button 
                                    onClick={() => {
                                        setBatchToRemove(null);
                                        setBatchRemoveError(null);
                                    }} 
                                    disabled={isRemovingBatch}
                                    className="flex-1 px-4 py-2 border border-border-base rounded-md hover:bg-bg-hover transition-colors font-semibold"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleRemoveBatch}
                                    disabled={isRemovingBatch}
                                    className="flex-1 px-4 py-2 bg-danger hover:bg-danger-hover text-white font-bold rounded-md flex items-center justify-center transition-colors disabled:opacity-50"
                                >
                                    {isRemovingBatch ? 'Removing...' : 'Yes, Remove'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </TeacherLayout>
    );
}
