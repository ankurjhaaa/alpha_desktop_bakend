import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import TeacherLayout from '../../Layouts/TeacherLayout';
import CustomButton from '../../Core/Widgets/CustomButton';
import CustomTextField from '../../Core/Widgets/CustomTextField';
import Modal from '../../Core/Widgets/Modal';
import { Search, Plus, Edit2, Trash2, Filter, FileText, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

export default function McqManagerPage() {
    const [papers, setPapers] = useState([]);
    const [batches, setBatches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [batchFilter, setBatchFilter] = useState('');
    
    // Modals state
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Edit state
    const [editingPaper, setEditingPaper] = useState(null);
    
    // Dependencies data for the form
    const [topics, setTopics] = useState([]);
    const [students, setStudents] = useState([]);
    
    // Form state
    const [formData, setFormData] = useState({ 
        title: '', 
        description: '',
        exam_date: '',
        exam_password: '',
        start_time: '',
        end_time: '',
        invigilators: '',
        batch_id: '',
        topic_id: '',
        selected_student_ids: []
    });

    const fetchData = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            const batchesRes = await axios.get('/api/batches', config);
            setBatches(batchesRes.data);

            let url = '/api/mcq_papers?';
            if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
            if (batchFilter) url += `batch_id=${batchFilter}&`;
            
            const papersRes = await axios.get(url, config);
            setPapers(papersRes.data);
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => fetchData(), 500);
        return () => clearTimeout(debounce);
    }, [searchQuery, batchFilter]);

    // Handle batch selection change in form to load topics and students
    const fetchTopicsAndStudents = async (batchId) => {
        const token = localStorage.getItem('auth_token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        try {
            const batch = batches.find(b => b.id.toString() === batchId.toString());
            
            if (batch && batch.course_id) {
                const topicsRes = await axios.get(`/api/topics?course_id=${batch.course_id}`, config);
                setTopics(topicsRes.data);
            } else {
                setTopics([]);
            }
            
            const studentsRes = await axios.get(`/api/students?batch_id=${batchId}`, config);
            setStudents(studentsRes.data);
            
            // Auto select all students if new paper
            if (!editingPaper) {
                setFormData(prev => ({ ...prev, selected_student_ids: studentsRes.data.map(s => s.id) }));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleBatchChange = (batchId) => {
        setFormData({ ...formData, batch_id: batchId, topic_id: '', selected_student_ids: [] });
        if (batchId) {
            fetchTopicsAndStudents(batchId);
        } else {
            setTopics([]);
            setStudents([]);
        }
    };

    const openModal = async (paper = null) => {
        setEditingPaper(paper);
        
        if (paper) {
            setFormData({
                title: paper.title || '',
                description: paper.description || '',
                exam_date: paper.exam_date || '',
                exam_password: paper.exam_password || '',
                start_time: paper.start_time || '',
                end_time: paper.end_time || '',
                invigilators: paper.invigilators || '',
                batch_id: paper.batch_id || '',
                topic_id: paper.topic_id || '',
                selected_student_ids: paper.selected_student_ids ? paper.selected_student_ids.map(Number) : []
            });
            if (paper.batch_id) {
                await fetchTopicsAndStudents(paper.batch_id);
            }
        } else {
            const initialBatch = batches.length > 0 ? batches[0].id : '';
            setFormData({ 
                title: '', description: '', exam_date: '', exam_password: '', start_time: '', end_time: '', invigilators: '', batch_id: initialBatch, topic_id: '', selected_student_ids: [] 
            });
            if (initialBatch) {
                await fetchTopicsAndStudents(initialBatch);
            }
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingPaper(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.batch_id) return alert('Title and Batch are required');

        const token = localStorage.getItem('auth_token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        try {
            if (editingPaper) {
                await axios.put(`/api/mcq_papers/${editingPaper.id}`, formData, config);
            } else {
                await axios.post('/api/mcq_papers', formData, config);
            }
            fetchData();
            closeModal();
        } catch (error) {
            console.error("Error saving paper", error);
            alert(error.response?.data?.message || 'Failed to save paper');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this paper? All questions will be lost.')) return;
        
        const token = localStorage.getItem('auth_token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        try {
            await axios.delete(`/api/mcq_papers/${id}`, config);
            fetchData();
        } catch (error) {
            console.error("Error deleting paper", error);
            alert(error.response?.data?.message || 'Failed to delete paper');
        }
    };

    return (
        <TeacherLayout title="MCQ Papers">
            <Head title="MCQ Papers Management" />

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        <div className="relative max-w-xs">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Filter className="w-4 h-4 text-slate-400" />
                            </div>
                            <select
                                value={batchFilter}
                                onChange={(e) => setBatchFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white appearance-none"
                            >
                                <option value="">All Batches</option>
                                {batches.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search papers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>
                    <CustomButton onPressed={() => openModal()} icon={Plus} className="py-2 px-4 whitespace-nowrap">
                        Create Paper
                    </CustomButton>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Title</th>
                                <th className="px-6 py-4 font-semibold">Batch</th>
                                <th className="px-6 py-4 font-semibold">Schedule</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </td>
                                </tr>
                            ) : papers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">No papers found.</td>
                                </tr>
                            ) : (
                                papers.map((paper) => (
                                    <tr key={paper.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-medium text-slate-900 dark:text-white">{paper.title}</div>
                                                    {paper.topic && <div className="text-xs text-slate-500">Topic: {paper.topic.title}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {paper.batch ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                                    {paper.batch.name}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 italic text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-xs text-slate-500 dark:text-slate-400 space-y-1">
                                                {paper.exam_date && <div>Date: {paper.exam_date}</div>}
                                                {(paper.start_time || paper.end_time) && (
                                                    <div className="flex items-center">
                                                        <Clock className="w-3.5 h-3.5 mr-1" />
                                                        {paper.start_time ? new Date(paper.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''} 
                                                        {paper.end_time ? ` - ${new Date(paper.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : ''}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link href={`/teacher/mcq-questions/${paper.id}`} className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors" title="Manage Questions">
                                                    <CheckCircle className="w-4 h-4" />
                                                </Link>
                                                <button onClick={() => openModal(paper)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Edit Paper">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(paper.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete Paper">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Paper Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingPaper ? "Edit MCQ Paper" : "Create MCQ Paper"} maxWidth="3xl">
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Select Batch</label>
                            <select
                                value={formData.batch_id}
                                onChange={(e) => handleBatchChange(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                                required
                            >
                                <option value="">Select Batch</option>
                                {batches.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Select Topic (Optional)</label>
                            <select
                                value={formData.topic_id}
                                onChange={(e) => setFormData({ ...formData, topic_id: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                            >
                                <option value="">No Topic</option>
                                {topics.map(t => (
                                    <option key={t.id} value={t.id}>{t.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <CustomTextField
                        label="Paper Title"
                        placeholder="e.g. Flutter Basics Midterm"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description (Optional)</label>
                        <textarea
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                            rows="3"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CustomTextField
                            label="Exam Date (Optional)"
                            type="date"
                            value={formData.exam_date}
                            onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                        />
                        <CustomTextField
                            label="Exam Password (Optional)"
                            placeholder="Enter password"
                            value={formData.exam_password}
                            onChange={(e) => setFormData({ ...formData, exam_password: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CustomTextField
                            label="Start Time (Optional)"
                            type="datetime-local"
                            value={formData.start_time ? formData.start_time.slice(0, 16) : ''}
                            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        />
                        <CustomTextField
                            label="End Time (Optional)"
                            type="datetime-local"
                            value={formData.end_time ? formData.end_time.slice(0, 16) : ''}
                            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Eligible Students</label>
                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg max-h-48 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900/50">
                            {students.length === 0 ? (
                                <p className="text-sm text-slate-500 italic text-center py-4">No students found in this batch.</p>
                            ) : (
                                <div className="space-y-2">
                                    <label className="flex items-center p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium border-b border-slate-200 dark:border-slate-700 pb-3 mb-2">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 mr-3"
                                            checked={formData.selected_student_ids.length === students.length && students.length > 0}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFormData({ ...formData, selected_student_ids: students.map(s => s.id) });
                                                } else {
                                                    setFormData({ ...formData, selected_student_ids: [] });
                                                }
                                            }}
                                        />
                                        Select All
                                    </label>
                                    {students.map(student => (
                                        <label key={student.id} className="flex items-center p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 mr-3"
                                                checked={formData.selected_student_ids.includes(student.id)}
                                                onChange={(e) => {
                                                    const ids = formData.selected_student_ids;
                                                    if (e.target.checked) {
                                                        setFormData({ ...formData, selected_student_ids: [...ids, student.id] });
                                                    } else {
                                                        setFormData({ ...formData, selected_student_ids: ids.filter(id => id !== student.id) });
                                                    }
                                                }}
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{student.name}</span>
                                                <span className="text-xs text-slate-500">{student.email}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <CustomButton variant="secondary" onPressed={closeModal}>Cancel</CustomButton>
                        <CustomButton type="submit">{editingPaper ? 'Save Changes' : 'Create Paper'}</CustomButton>
                    </div>
                </form>
            </Modal>
        </TeacherLayout>
    );
}
