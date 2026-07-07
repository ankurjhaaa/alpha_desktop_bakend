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
    const [batches, setBatches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [batchFilter, setBatchFilter] = useState(() => {
        if (typeof window !== 'undefined') {
            return new URLSearchParams(window.location.search).get('batch_id') || '';
        }
        return '';
    });

    // Modals state
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Edit state
    const [editingMaterial, setEditingMaterial] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        batch_id: '',
    });
    const [file, setFile] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const batchesRes = await axios.get('/api/batches', config);
            setBatches(batchesRes.data);

            let url = '/api/materials?';
            if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
            if (batchFilter) url += `batch_id=${batchFilter}&`;

            const res = await axios.get(url, config);
            setMaterials(res.data);
        } catch (error) {
            console.error("Error fetching materials", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => fetchData(), 500);
        return () => clearTimeout(debounce);
    }, [searchQuery, batchFilter]);


    const openModal = async (material = null) => {
        setEditingMaterial(material);
        setFile(null);

        if (material) {
            setFormData({
                title: material.title || '',
                description: material.description || '',
                batch_id: material.batch_id || '',
            });
        } else {
            const initialBatch = batches.length > 0 ? batches[0].id : '';
            setFormData({
                title: '', description: '', batch_id: initialBatch,
            });
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
        if (!formData.title || !formData.batch_id) return alert('Title and Batch are required');
        if (!file && !editingMaterial) return alert('File is required');

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
            await fetchData();
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
            await fetchData();
        } catch (error) {
            console.error("Error deleting material", error);
            alert(error.response?.data?.message || 'Failed to delete material');
        }
    };

    return (
        <TeacherLayout title="Study Materials">
            <Head title="Materials Manager" />

            <div className="bg-bg-card rounded-md shadow-sm border border-border-base transition-colors">
                <div className="p-6 border-b border-border-base flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        <div className="relative max-w-xs">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Filter className="w-4 h-4 text-text-muted" />
                            </div>
                            <select
                                value={batchFilter}
                                onChange={(e) => setBatchFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-bg-base border border-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text-base appearance-none"
                            >
                                <option value="">All Batches</option>
                                {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                            <input
                                type="text"
                                placeholder="Search materials..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-bg-base border border-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text-base "
                            />
                        </div>
                    </div>
                    <CustomButton onPressed={() => openModal()} icon={Plus} className="py-2 px-4 whitespace-nowrap">
                        Add Material
                    </CustomButton>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-text-muted ">
                        <thead className="bg-bg-base text-text-base border-b border-border-base ">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Title</th>
                                <th className="px-6 py-4 font-semibold">Batch</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </td>
                                </tr>
                            ) : materials.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-text-muted">No materials found.</td>
                                </tr>
                            ) : (
                                materials.map((item) => (
                                    <tr key={item.id} className="border-b border-border-base hover:bg-bg-base">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-md bg-primary-light-hover flex items-center justify-center text-primary ">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-medium text-text-base ">{item.title}</div>
                                                    <div className="text-xs text-text-muted truncate max-w-xs">{item.description}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-sm">
                                                <span className="font-medium">{item.batch?.name || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                {item.file_url && (
                                                    <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="p-2 text-primary hover:bg-primary-light rounded-md transition-colors" title="View/Download">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                )}
                                                <button onClick={() => openModal(item)} className="p-2 text-primary hover:bg-primary-light rounded-md transition-colors" title="Edit Material">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(item.id)} className="p-2 text-danger-text hover:bg-danger-light rounded-md transition-colors" title="Delete Material">
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

                    <div>
                        <label className="block text-sm font-medium text-text-base mb-1.5">Select Batch</label>
                        <select
                            value={formData.batch_id}
                            onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
                            className="w-full px-4 py-2 bg-bg-base border border-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text-base "
                            required
                        >
                            <option value="">Select Batch</option>
                            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>

                    <CustomTextField
                        label="Title"
                        placeholder="e.g. Chapter 1 Notes"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-text-base mb-1.5">Description (Optional)</label>
                        <textarea
                            className="w-full px-4 py-2 bg-bg-base border border-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text-base "
                            rows="2"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-base mb-1.5">Upload File {editingMaterial && '(Leave empty to keep existing)'}</label>
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="w-full px-3 py-1.5 text-sm bg-bg-base border border-border-base rounded-md file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary-hover hover:file:bg-primary-light-hover"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 border-t border-border-base ">
                        <CustomButton type="button" variant="secondary" onPressed={closeModal}>Cancel</CustomButton>
                        <CustomButton type="submit">{editingMaterial ? 'Save Changes' : 'Upload Material'}</CustomButton>
                    </div>
                </form>
            </Modal>
        </TeacherLayout>
    );
}
