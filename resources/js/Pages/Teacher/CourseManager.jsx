import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import TeacherLayout from '../../Layouts/TeacherLayout';
import CustomButton from '../../Core/Widgets/CustomButton';
import CustomTextField from '../../Core/Widgets/CustomTextField';
import Modal from '../../Core/Widgets/Modal';
import { Search, Plus, Edit2, Trash2, BookOpen, ListTree, X } from 'lucide-react';
import axios from 'axios';

export default function CourseManager() {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modals state
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [isTopicsModalOpen, setIsTopicsModalOpen] = useState(false);

    // Edit state
    const [editingCourse, setEditingCourse] = useState(null);

    // Form state
    const [formData, setFormData] = useState({ name: '', description: '', topics: [] });
    const [topicInput, setTopicInput] = useState('');

    const fetchCourses = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const query = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
            const res = await axios.get(`/api/courses${query}`, config);
            setCourses(res.data);
        } catch (error) {
            console.error("Error fetching courses", error);
            alert("Failed to fetch courses");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => fetchCourses(), 500);
        return () => clearTimeout(debounce);
    }, [searchQuery]);

    const openCourseModal = (course = null) => {
        setEditingCourse(course);
        if (course) {
            setFormData({
                name: course.name,
                description: course.description || '',
                topics: course.topics ? course.topics.map(t => typeof t === 'string' ? t : t.title) : []
            });
        } else {
            setFormData({ name: '', description: '', topics: [] });
        }
        setIsCourseModalOpen(true);
    };

    const openTopicsModal = (course) => {
        setEditingCourse(course);
        setFormData({
            ...course,
            topics: course.topics ? course.topics.map(t => typeof t === 'string' ? t : t.title) : []
        });
        setIsTopicsModalOpen(true);
    };

    const closeModals = () => {
        setIsCourseModalOpen(false);
        setIsTopicsModalOpen(false);
        setEditingCourse(null);
        setTopicInput('');
    };

    const handleSaveCourse = async (e) => {
        e.preventDefault();
        if (!formData.name) return alert('Course name is required');

        const token = localStorage.getItem('auth_token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            if (editingCourse) {
                await axios.put(`/api/courses/${editingCourse.id}`, { ...formData, is_active: true }, config);
            } else {
                await axios.post('/api/courses', { ...formData, is_active: true }, config);
            }
            await fetchCourses();
            closeModals();
        } catch (error) {
            console.error("Error saving course", error);
            alert(error.response?.data?.message || 'Failed to save course');
        }
    };

    const handleSaveTopics = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('auth_token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            await axios.put(`/api/courses/${editingCourse.id}`, {
                name: editingCourse.name,
                description: editingCourse.description,
                is_active: true,
                topics: formData.topics
            }, config);
            await fetchCourses();
            closeModals();
        } catch (error) {
            console.error("Error saving topics", error);
            alert(error.response?.data?.message || 'Failed to save topics');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this course?')) return;

        const token = localStorage.getItem('auth_token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            await axios.delete(`/api/courses/${id}`, config);
            await fetchCourses();
        } catch (error) {
            console.error("Error deleting course", error);
            alert(error.response?.data?.message || 'Failed to delete course');
        }
    };

    const addTopic = () => {
        if (topicInput.trim()) {
            setFormData({ ...formData, topics: [...formData.topics, topicInput.trim()] });
            setTopicInput('');
        }
    };

    const removeTopic = (index) => {
        const newTopics = [...formData.topics];
        newTopics.splice(index, 1);
        setFormData({ ...formData, topics: newTopics });
    };

    return (
        <TeacherLayout title="Courses">
            <Head title="Course Manager" />

            <div className="bg-bg-card rounded-md shadow-sm border border-border-base transition-colors">
                <div className="p-6 border-b border-border-base flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-bg-base border border-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text-base transition-colors"
                        />
                    </div>
                    <CustomButton onPressed={() => openCourseModal()} icon={Plus} className="py-2 px-4 whitespace-nowrap">
                        Add Course
                    </CustomButton>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-text-muted ">
                        <thead className="bg-bg-base text-text-base border-b border-border-base ">
                            <tr>
                                <th className="px-6 py-4 font-semibold">ID</th>
                                <th className="px-6 py-4 font-semibold">Course Name</th>
                                <th className="px-6 py-4 font-semibold">Description</th>
                                <th className="px-6 py-4 font-semibold">Topics / Chapters</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </td>
                                </tr>
                            ) : courses.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-text-muted">No courses found.</td>
                                </tr>
                            ) : (
                                courses.map((course) => (
                                    <tr key={course.id} className="border-b border-border-base hover:bg-bg-base transition-colors">
                                        <td className="px-6 py-4">{course.id}</td>
                                        <td className="px-6 py-4 font-medium text-text-base ">
                                            <div className="flex items-center">
                                                <BookOpen className="w-4 h-4 mr-2 text-primary" />
                                                {course.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate" title={course.description}>{course.description || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-light text-primary-hover ">
                                                {course.topics?.length || 0} Topics
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button onClick={() => openTopicsModal(course)} className="p-2 text-primary hover:bg-primary-light rounded-md transition-colors" title="Manage Topics">
                                                    <ListTree className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => openCourseModal(course)} className="p-2 text-primary hover:bg-primary-light rounded-md transition-colors" title="Edit Course">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(course.id)} className="p-2 text-danger-text hover:bg-danger-light rounded-md transition-colors" title="Delete Course">
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

            {/* Add/Edit Course Modal */}
            <Modal isOpen={isCourseModalOpen} onClose={closeModals} title={editingCourse ? "Edit Course" : "Add New Course"} maxWidth="2xl">
                <form onSubmit={handleSaveCourse} className="space-y-6">
                    <CustomTextField
                        label="Course Name"
                        placeholder="e.g. Flutter Development"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <div>
                        <label className="block text-sm font-medium text-text-base mb-1.5">Description (Optional)</label>
                        <textarea
                            className="w-full px-4 py-2 bg-bg-base border border-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text-base transition-colors min-h-[100px]"
                            placeholder="Enter course description..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {!editingCourse && (
                        <>
                            <div className="h-px bg-bg-hover my-6" />
                            <div>
                                <label className="block text-sm font-medium text-primary mb-3">Course Topics / Chapters (Optional)</label>
                                <div className="flex space-x-3 mb-4">
                                    <input
                                        type="text"
                                        placeholder="e.g., Introduction to Dart"
                                        value={topicInput}
                                        onChange={(e) => setTopicInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
                                        className="flex-1 px-4 py-2 bg-bg-base border border-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text-base transition-colors"
                                    />
                                    <button type="button" onClick={addTopic} className="px-4 py-2 bg-bg-hover text-text-base rounded-md hover:bg-bg-hover font-medium transition-colors">
                                        Add
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                    {formData.topics.length === 0 ? (
                                        <p className="text-sm text-text-muted italic">No topics added yet.</p>
                                    ) : (
                                        formData.topics.map((topic, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-bg-base border border-border-base rounded-md">
                                                <div className="flex items-center">
                                                    <div className="w-6 h-6 rounded-full bg-primary-light-hover text-primary flex items-center justify-center text-xs font-bold mr-3">{i + 1}</div>
                                                    <span className="text-sm font-medium text-text-base ">{topic}</span>
                                                </div>
                                                <button type="button" onClick={() => removeTopic(i)} className="text-danger hover:text-danger-text p-1">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end space-x-3 pt-6 border-t border-border-base ">
                        <CustomButton type="button" variant="secondary" onPressed={closeModals}>Cancel</CustomButton>
                        <CustomButton type="submit">{editingCourse ? 'Save Changes' : 'Create Course'}</CustomButton>
                    </div>
                </form>
            </Modal>

            {/* Manage Topics Modal */}
            <Modal isOpen={isTopicsModalOpen} onClose={closeModals} title={`Topics - ${editingCourse?.name}`} maxWidth="2xl">
                <form onSubmit={handleSaveTopics} className="space-y-6">
                    <p className="text-sm text-text-muted ">Add or remove topics for this course. Click "Save Changes" at the bottom to apply.</p>

                    <div>
                        <div className="flex space-x-3 mb-6">
                            <input
                                type="text"
                                placeholder="Topic Title"
                                value={topicInput}
                                onChange={(e) => setTopicInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
                                className="flex-1 px-4 py-2 bg-bg-base border border-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text-base transition-colors"
                            />
                            <button type="button" onClick={addTopic} className="px-4 py-2 bg-bg-hover text-text-base rounded-md hover:bg-bg-hover font-medium flex items-center transition-colors">
                                <Plus className="w-4 h-4 mr-1" /> Add
                            </button>
                        </div>
                        <h4 className="font-bold text-text-base mb-3">Topics List ({formData.topics.length})</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                            {formData.topics.length === 0 ? (
                                <p className="text-sm text-text-muted italic text-center py-4">No topics added yet.</p>
                            ) : (
                                formData.topics.map((topic, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-bg-base border border-border-base rounded-md">
                                        <div className="flex items-center">
                                            <div className="w-6 h-6 rounded-full bg-primary-light-hover text-primary flex items-center justify-center text-xs font-bold mr-3">{i + 1}</div>
                                            <span className="text-sm font-medium text-text-base ">{topic}</span>
                                        </div>
                                        <button type="button" onClick={() => removeTopic(i)} className="text-danger hover:bg-danger-light hover:text-danger-text p-1.5 rounded-md transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 border-t border-border-base ">
                        <CustomButton type="button" variant="secondary" onPressed={closeModals}>Cancel</CustomButton>
                        <CustomButton type="submit">Save Changes</CustomButton>
                    </div>
                </form>
            </Modal>
        </TeacherLayout>
    );
}
