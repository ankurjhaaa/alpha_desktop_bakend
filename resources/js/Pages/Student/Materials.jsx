import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import StudentLayout from '../../Layouts/StudentLayout';
import { FileText, Download, ExternalLink, Filter, Search } from 'lucide-react';
import axios from 'axios';

export default function Materials() {
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    useEffect(() => {
        const fetchMaterials = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            try {
                let url = '/api/student/materials?';
                if (searchQuery) url += `search=${searchQuery}&`;
                if (typeFilter) url += `type=${typeFilter}&`;

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

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                    <div className="relative max-w-xs">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Filter className="w-4 h-4 text-slate-400" />
                        </div>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white appearance-none"
                        >
                            <option value="">All Types</option>
                            <option value="pdf">PDFs</option>
                            <option value="video">Videos</option>
                            <option value="doc">Documents</option>
                            <option value="link">Links</option>
                        </select>
                    </div>
                </div>

                <div className="p-6">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : materials.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                            No study materials found for your enrolled courses.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {materials.map((item) => (
                                <div key={item.id} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-md transition-shadow group flex flex-col">
                                    <div className="flex items-start mb-4">
                                        <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2">{item.title}</h3>
                                            <div className="flex items-center text-xs text-slate-500 mt-1">
                                                <span className="uppercase font-semibold tracking-wider">{item.material_type}</span>
                                                {item.topic && <span className="mx-2">•</span>}
                                                {item.topic && <span>{item.topic.title}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 flex-1 line-clamp-3">
                                        {item.description}
                                    </p>
                                    <div className="mt-auto">
                                        {item.url && (
                                            <a 
                                                href={item.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="flex items-center justify-center w-full py-2.5 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 rounded-lg font-medium transition-colors"
                                            >
                                                {item.material_type === 'video' ? (
                                                    <><ExternalLink className="w-4 h-4 mr-2" /> Watch Video</>
                                                ) : item.material_type === 'link' ? (
                                                    <><ExternalLink className="w-4 h-4 mr-2" /> Open Link</>
                                                ) : (
                                                    <><Download className="w-4 h-4 mr-2" /> Download File</>
                                                )}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </StudentLayout>
    );
}
