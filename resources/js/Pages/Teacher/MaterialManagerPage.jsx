import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import TeacherLayout from '../../Layouts/TeacherLayout';
import CustomButton from '../../Core/Widgets/CustomButton';
import CustomTextField from '../../Core/Widgets/CustomTextField';
import Modal from '../../Core/Widgets/Modal';
import { Search, Plus, Edit2, Trash2, Filter, FileText, Download, ExternalLink } from 'lucide-react';
import axios from 'axios';

export default function MaterialManagerPage() {
    const [materials, setMaterials] = useState([]);
    const [courses, setCourses] = useState([]);
    const [topics, setTopics] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [courseFilter, setCourseFilter] = useState('');
    const [topicFilter, setTopicFilter] = useState('');
    
    // Modals state
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Edit state
    const [editingMaterial, setEditingMaterial] = useState(null);
    
    // Form state
    const [formData, setFormData] = useState({ 
        title: '', 
        description: '',
        course_id: '',
        topic_id: '',
        material_type: 'pdf',
        url: ''
    });
    const [file, setFile] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            const coursesRes = await axios.get('/api/courses', config);
            setCourses(coursesRes.data);

            let url = '/api/materials?';
            if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
            if (courseFilter) url += `course_id=${courseFilter}&`;
            if (topicFilter) url += `topic_id=${topicFilter}&`;
            
            const res = await axios.get(url, config);
            setMaterials(res.data);
        } catch (error) {
            console.error("Error fetching materials", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTopics = async (courseId) => {
        if (!courseId) {
            setTopics([]);
            return;
        }
        const token = localStorage.getItem('auth_token');
        try {
            const res = await axios.get(`/api/topics?course_id=${courseId}`, { headers: { Authorization: `Bearer ${token}` } });
            setTopics(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => fetchData(), 500);
        return () => clearTimeout(debounce);
    }, [searchQuery, courseFilter, topicFilter]);

    useEffect(() => {
        if (courseFilter) fetchTopics(courseFilter);
        else setTopics([]);
    }, [courseFilter]);

    const handleCourseChangeForm = async (courseId) => {
        setFormData({ ...formData, course_id: courseId, topic_id: '' });
        if (courseId) {
            fetchTopics(courseId);
        } else {
            setTopics([]);
        }
    };

    const openModal = async (material = null) => {
        setEditingMaterial(material);
        setFile(null);
        
        if (material) {
            setFormData({
                title: material.title || '',
                description: material.description || '',
                course_id: material.course_id || '',
                topic_id: material.topic_id || '',
                material_type: material.material_type || 'pdf',
                url: material.url || ''
            });
            if (material.course_id) {
                await fetchTopics(material.course_id);
            }
        } else {
            const initialCourse = courses.length > 0 ? courses[0].id : '';
            setFormData({ 
                title: '', description: '', course_id: initialCourse, topic_id: '', material_type: 'pdf', url: '' 
            });
            if (initialCourse) {
                await fetchTopics(initialCourse);
            }
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingMaterial(null);
        setFile(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.course_id) return alert('Title and Course are required');
        if (formData.material_type === 'video' && !formData.url) return alert('Video URL is required');
        if (formData.material_type !== 'video' && !file && !editingMaterial && !formData.url) return alert('File or URL is required');

        const token = localStorage.getItem('auth_token');
        
        try {
            const payload = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined) {
                    payload.append(key, formData[key]);
                }
            });
            
            if (file) {
                payload.append('file', file);
            }

            const config = { 
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json'
                } 
            };
            
            if (editingMaterial) {
                payload.append('_method', 'PUT');
                await axios.post(`/api/materials/${editingMaterial.id}`, payload, config);
            } else {
                await axios.post('/api/materials', payload, config);
            }
            fetchData();
            closeModal();
        } catch (error) {
            console.error("Error saving material", error);
            alert(error.response?.data?.message || 'Failed to save material');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this material?')) return;
        
        const token = localStorage.getItem('auth_token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        try {
            await axios.delete(`/api/materials/${id}`, config);
            fetchData();
        } catch (error) {
            console.error("Error deleting material", error);
            alert(error.response?.data?.message || 'Failed to delete material');
        }
    };

    return (
        <TeacherLayout title="Study Materials">
            <Head title="Materials Manager" />

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        <div className="relative max-w-xs">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Filter className="w-4 h-4 text-slate-400" />
                            </div>
                            <select
                                value={courseFilter}
                                onChange={(e) => { setCourseFilter(e.target.value); setTopicFilter(''); }}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white appearance-none"
                            >
                                <option value="">All Courses</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        {courseFilter && (
                            <div className="relative max-w-xs">
                                <select
                                    value={topicFilter}
                                    onChange={(e) => setTopicFilter(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white appearance-none"
                                >
                                    <option value="">All Topics</option>
                                    {topics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                                </select>
                            </div>
                        )}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search materials..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>
                    <CustomButton onPressed={() => openModal()} icon={Plus} className="py-2 px-4 whitespace-nowrap">
                        Add Material
                    </CustomButton>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Title</th>
                                <th className="px-6 py-4 font-semibold">Course & Topic</th>
                                <th className="px-6 py-4 font-semibold">Type</th>
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
                            ) : materials.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">No materials found.</td>
                                </tr>
                            ) : (
                                materials.map((item) => (
                                    <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-medium text-slate-900 dark:text-white">{item.title}</div>
                                                    <div className="text-xs text-slate-500 truncate max-w-xs">{item.description}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-sm">
                                                <span className="font-medium">{item.course?.name}</span>
                                                {item.topic && <span className="text-xs text-slate-500">{item.topic.title}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300 uppercase">
                                                {item.material_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                {item.url && (
                                                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors" title="View/Download">
                                                        {item.material_type === 'video' ? <ExternalLink className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                                                    </a>
                                                )}
                                                <button onClick={() => openModal(item)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Edit Material">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete Material">
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

            {/* Add/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingMaterial ? "Edit Material" : "Add New Material"} maxWidth="2xl">
                <form onSubmit={handleSave} className="space-y-5">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Select Course</label>
                            <select
                                value={formData.course_id}
                                onChange={(e) => handleCourseChangeForm(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                                required
                            >
                                <option value="">Select Course</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                                {topics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                            </select>
                        </div>
                    </div>

                    <CustomTextField
                        label="Title"
                        placeholder="e.g. Chapter 1 Notes"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description (Optional)</label>
                        <textarea
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                            rows="2"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Material Type</label>
                        <select
                            value={formData.material_type}
                            onChange={(e) => setFormData({ ...formData, material_type: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                            required
                        >
                            <option value="pdf">PDF Document</option>
                            <option value="video">Video (YouTube/Link)</option>
                            <option value="link">External Link</option>
                            <option value="doc">Word/Other Document</option>
                        </select>
                    </div>

                    {formData.material_type === 'video' || formData.material_type === 'link' ? (
                        <CustomTextField
                            label="URL / Link"
                            placeholder="https://..."
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            required
                        />
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Upload File {editingMaterial && '(Leave empty to keep existing)'}</label>
                            <input
                                type="file"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <CustomButton variant="secondary" onPressed={closeModal}>Cancel</CustomButton>
                        <CustomButton type="submit">{editingMaterial ? 'Save Changes' : 'Upload Material'}</CustomButton>
                    </div>
                </form>
            </Modal>
        </TeacherLayout>
    );
}
