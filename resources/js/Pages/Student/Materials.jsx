import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import StudentLayout from '../../Layouts/StudentLayout';
import { FileText, Download, ExternalLink, Filter, Search, Eye } from 'lucide-react';
import axios from 'axios';
import FilePreviewModal from '../../Core/Widgets/FilePreviewModal';

export default function Materials() {
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [previewMaterial, setPreviewMaterial] = useState(null);
    const [typeFilter, setTypeFilter] = useState('');

    useEffect(() => {
        const fetchMaterials = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            try {
                let url = '/api/materials?';
                if (searchQuery) url += `search=${searchQuery}&`;

                const res = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMaterials(res.data);
            } catch (error) {
                console.error("Error fetching materials", error);
            } finally {
                setIsLoading(false);
            }
        };

        const debounce = setTimeout(() => fetchMaterials(), 500);
        return () => clearTimeout(debounce);
    }, [searchQuery, typeFilter]);

    return (
        <StudentLayout title="Study Materials">
            <Head title="Materials" />

            <div className="bg-bg-card rounded-md shadow-sm border border-border-base transition-colors">
                <div className="p-6 border-b border-border-base flex flex-col md:flex-row md:items-center justify-between gap-4">
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

                <div className="p-6">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : materials.length === 0 ? (
                        <div className="text-center py-12 text-text-muted ">
                            No study materials found for your enrolled courses.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {materials.map((item) => (
                                <div key={item.id} className="bg-bg-base border border-border-base rounded-md p-5 hover:shadow-md transition-shadow group flex flex-col">
                                    <div className="flex items-start mb-4">
                                        <div className="w-12 h-12 rounded-md bg-primary-light-hover flex items-center justify-center text-primary flex-shrink-0">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <h3 className="font-bold text-text-base line-clamp-2">{item.title}</h3>
                                            <div className="flex items-center text-xs text-text-muted mt-1">
                                                {item.batch && <span className="uppercase font-semibold tracking-wider">Batch: {item.batch.name}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-text-muted mb-6 flex-1 line-clamp-3">
                                        {item.description}
                                    </p>
                                    <div className="mt-auto">
                                        {item.file_url && (
                                            <button
                                                onClick={() => setPreviewMaterial(item)}
                                                className="flex items-center justify-center w-full py-2.5 px-4 bg-bg-card border border-border-base hover:bg-bg-base text-primary rounded-md font-medium transition-colors"
                                            >
                                                <Eye className="w-4 h-4 mr-2" /> View Material
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <FilePreviewModal 
                isOpen={!!previewMaterial}
                onClose={() => setPreviewMaterial(null)}
                fileUrl={previewMaterial?.file_url}
                title={previewMaterial?.title}
            />
        </StudentLayout>
    );
}
