import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import TeacherLayout from '../../Layouts/TeacherLayout';
import CustomButton from '../../Core/Widgets/CustomButton';
import CustomTextField from '../../Core/Widgets/CustomTextField';
import Modal from '../../Core/Widgets/Modal';
import { Search, Plus, Edit2, Trash2, Layers, Users, BookOpen, FileQuestion, Filter } from 'lucide-react';
import axios from 'axios';

export default function BatchManager() {
    const [batches, setBatches] = useState([]);
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [courseFilter, setCourseFilter] = useState('');

    // Modals state
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Edit state
    const [editingBatch, setEditingBatch] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        course_id: '',
        schedule_time: '',
        start_date: '',
        end_date: ''
    });

    const fetchData = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const coursesRes = await axios.get('/api/courses', config);
            setCourses(coursesRes.data);

            let url = '/api/batches?';
            if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
            if (courseFilter) url += `course_id=${courseFilter}&`;

            const batchesRes = await axios.get(url, config);
            setBatches(batchesRes.data);
        } catch (error) {
            console.error("Error fetching data", error);
            alert("Failed to fetch batches");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => fetchData(), 500);
        return () => clearTimeout(debounce);
    }, [searchQuery, courseFilter]);

    const openModal = (batch = null) => {
        setEditingBatch(batch);
        if (batch) {
            setFormData({
                name: batch.name,
                course_id: batch.course_id,
                schedule_time: batch.schedule_time || '',
                start_date: batch.start_date || '',
                end_date: batch.end_date || ''
            });
        } else {
            setFormData({
                name: '',
                course_id: courses.length > 0 ? courses[0].id : '',
                schedule_time: '',
                start_date: '',
                end_date: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBatch(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.course_id) return alert('Batch name and Course are required');

        const token = localStorage.getItem('auth_token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            const payload = { ...formData, is_active: true, is_hidden: false };
            if (editingBatch) {
                await axios.put(`/api/batches/${editingBatch.id}`, payload, config);
            } else {
                await axios.post('/api/batches', payload, config);
            }
            await fetchData();
            closeModal();
        } catch (error) {
            console.error("Error saving batch", error);
            alert(error.response?.data?.message || 'Failed to save batch');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this batch? All related data will be lost.')) return;

        const token = localStorage.getItem('auth_token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            await axios.delete(`/api/batches/${id}`, config);
            await fetchData();
        } catch (error) {
            console.error("Error deleting batch", error);
            alert(error.response?.data?.message || 'Failed to delete batch');
        }
    };

    return (
        <TeacherLayout title="Batches">
            <Head title="Batch Manager" />

            <div className="bg-bg-card rounded-md shadow-sm border border-border-base transition-colors">
                <div className="p-6 border-b border-border-base flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        <div className="relative max-w-xs">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Filter className="w-4 h-4 text-text-muted" />
                            </div>
                            <select
                                value={courseFilter}
                                onChange={(e) => setCourseFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-bg-base border border-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text-base transition-colors appearance-none"
                            >
                                <option value="">All Courses</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>{course.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                            <input
                                type="text"
                                placeholder="Search batches..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-bg-base border border-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text-base transition-colors"
                            />
                        </div>
                    </div>
                    <CustomButton onPressed={() => openModal()} icon={Plus} className="py-2 px-4 whitespace-nowrap">
                        Add Batch
                    </CustomButton>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-text-muted ">
                        <thead className="bg-bg-base text-text-base border-b border-border-base ">
                            <tr>
                                <th className="px-6 py-4 font-semibold">ID</th>
                                <th className="px-6 py-4 font-semibold">Batch Name</th>
                                <th className="px-6 py-4 font-semibold">Course</th>
                                <th className="px-6 py-4 font-semibold">Schedule</th>
                                <th className="px-6 py-4 font-semibold">Duration</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </td>
                                </tr>
                            ) : batches.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-text-muted">No batches found.</td>
                                </tr>
                            ) : (
                                batches.map((batch) => (
                                    <tr key={batch.id} className="border-b border-border-base hover:bg-bg-base transition-colors">
                                        <td className="px-6 py-4">{batch.id}</td>
                                        <td className="px-6 py-4 font-bold text-text-base text-base">
                                            {batch.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-light-hover text-primary-hover ">
                                                {batch.course?.name || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-text-base ">{batch.schedule_time || '-'}</td>
                                        <td className="px-6 py-4 text-text-muted ">
                                            <div className="text-xs">
                                                <div>Start: {batch.start_date || '-'}</div>
                                                <div>End: {batch.end_date || '-'}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-1.5">
                                                <Link href={`/teacher/students?batch_id=${batch.id}`} className="p-2 text-primary hover:bg-primary-light rounded-md transition-colors" title="View Students">
                                                    <Users className="w-4 h-4" />
                                                </Link>
                                                <Link href={`/teacher/mcq-papers?batch_id=${batch.id}`} className="p-2 text-primary hover:bg-primary-light rounded-md transition-colors" title="View MCQ Papers">
                                                    <FileQuestion className="w-4 h-4" />
                                                </Link>
                                                <Link href={`/teacher/materials?batch_id=${batch.id}`} className="p-2 text-primary hover:bg-emerald-500/10 text-emerald-600 rounded-md transition-colors" title="View Materials">
                                                    <BookOpen className="w-4 h-4" />
                                                </Link>
                                                <div className="w-px h-4 bg-bg-hover mx-1"></div>
                                                <button onClick={() => openModal(batch)} className="p-2 text-primary hover:bg-primary-light rounded-md transition-colors" title="Edit Batch">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(batch.id)} className="p-2 text-danger-text hover:bg-danger-light rounded-md transition-colors" title="Delete Batch">
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

            {/* Add/Edit Batch Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingBatch ? "Edit Batch" : "Add New Batch"} maxWidth="2xl">
                <form onSubmit={handleSave} className="space-y-5">

                    <div>
                        <label className="block text-sm font-medium text-text-base mb-1.5">Select Course</label>
                        <select
                            required
                            value={formData.course_id}
                            onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                            className="w-full px-4 py-2.5 bg-bg-base border border-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text-base transition-colors"
                        >
                            {courses.length === 0 && <option value="">No courses available</option>}
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>{course.name}</option>
                            ))}
                        </select>
                    </div>

                    <CustomTextField
                        label="Batch Name"
                        placeholder="e.g. Morning Batch 2026"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <CustomTextField
                        label="Schedule"
                        placeholder="e.g. 10 AM - 12 PM"
                        value={formData.schedule_time}
                        onChange={(e) => setFormData({ ...formData, schedule_time: e.target.value })}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-base mb-1.5">Start Date</label>
                            <input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                className="w-full px-4 py-2 bg-bg-base border border-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text-base transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-base mb-1.5">End Date</label>
                            <input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                className="w-full px-4 py-2 bg-bg-base border border-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text-base transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 border-t border-border-base ">
                        <CustomButton type="button" variant="secondary" onPressed={closeModal}>Cancel</CustomButton>
                        <CustomButton type="submit">{editingBatch ? 'Save Changes' : 'Create Batch'}</CustomButton>
                    </div>
                </form>
            </Modal>
        </TeacherLayout>
    );
}
