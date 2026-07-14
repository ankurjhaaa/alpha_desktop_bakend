import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import TeacherLayout from '../../Layouts/TeacherLayout';
import CustomButton from '../../Core/Widgets/CustomButton';
import { Search, Download, Filter, BookOpen, Layers, FileQuestion, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { downloadFilteredResultsPdf } from '../../Core/Utils/PdfGenerator';

export default function AllResultsPage() {
    const [results, setResults] = useState([]);
    const [pagination, setPagination] = useState(null);
    
    // Filter options
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [exams, setExams] = useState([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);

    // Active Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [courseFilter, setCourseFilter] = useState('');
    const [batchFilter, setBatchFilter] = useState('');
    const [examFilter, setExamFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const hasActiveFilters = searchQuery || courseFilter || batchFilter || examFilter;

    // Fetch filters options
    useEffect(() => {
        const fetchFilters = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) return;
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const [coursesRes, batchesRes, examsRes] = await Promise.all([
                    axios.get('/api/courses', config),
                    axios.get('/api/batches', config),
                    axios.get('/api/mcq_papers', config)
                ]);
                setCourses(coursesRes.data);
                setBatches(batchesRes.data);
                setExams(examsRes.data);
            } catch (error) {
                console.error("Error fetching filter options", error);
            }
        };
        fetchFilters();
    }, []);

    // Fetch results
    const fetchResults = async (page = 1) => {
        setIsLoading(true);
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            let url = `/api/results?page=${page}&`;
            if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
            if (courseFilter) url += `course_id=${courseFilter}&`;
            if (batchFilter) url += `batch_id=${batchFilter}&`;
            if (examFilter) url += `exam_id=${examFilter}&`;

            const res = await axios.get(url, config);
            setResults(res.data.data || []);
            setPagination({
                current_page: res.data.current_page,
                last_page: res.data.last_page,
                total: res.data.total,
                from: res.data.from,
                to: res.data.to,
            });
            setCurrentPage(res.data.current_page);
        } catch (error) {
            console.error("Error fetching results", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            setCurrentPage(1);
            fetchResults(1);
        }, 500);
        return () => clearTimeout(debounce);
    }, [searchQuery, courseFilter, batchFilter, examFilter]);

    const handleDownload = async () => {
        if (!hasActiveFilters) return;
        setIsDownloading(true);
        const token = localStorage.getItem('auth_token');
        try {
            let url = `/api/results?download=true&`;
            if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
            if (courseFilter) url += `course_id=${courseFilter}&`;
            if (batchFilter) url += `batch_id=${batchFilter}&`;
            if (examFilter) url += `exam_id=${examFilter}&`;

            const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
            await downloadFilteredResultsPdf(res.data);
        } catch (error) {
            console.error("Error downloading PDF data", error);
            alert("Failed to download PDF. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <TeacherLayout>
            <Head title="Global Results - Alpha Graphics" />

            <div className="max-w-7xl mx-auto space-y-6 pb-12">
                <div className="bg-bg-card border border-border-base rounded-md p-6 relative overflow-hidden transition-colors shadow-sm">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary opacity-10 rounded-full blur-2xl"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold mb-1 text-text-base">Global Results</h2>
                            <p className="text-text-muted text-sm">View and download all student exam results.</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <CustomButton
                                onClick={handleDownload}
                                disabled={!hasActiveFilters || isDownloading || results.length === 0}
                                className={`flex items-center space-x-2 px-4 py-2 ${(!hasActiveFilters || results.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Download className="w-4 h-4" />
                                <span>{isDownloading ? 'Generating...' : 'Download PDF'}</span>
                            </CustomButton>
                        </div>
                    </div>
                </div>

                <div className="bg-bg-card border border-border-base rounded-md shadow-sm">
                    <div className="p-4 border-b border-border-base bg-bg-base/50">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative">
                                <Search className="w-5 h-5 absolute left-3 top-2.5 text-text-muted" />
                                <input
                                    type="text"
                                    placeholder="Search by student name or reg ID..."
                                    className="pl-10 pr-4 py-2 w-full bg-bg-base border border-border-base rounded-md focus:outline-none focus:border-primary text-text-base text-sm transition-colors"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            
                            <div className="relative">
                                <BookOpen className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
                                <select
                                    value={courseFilter}
                                    onChange={(e) => setCourseFilter(e.target.value)}
                                    className="pl-9 pr-4 py-2 w-full bg-bg-base border border-border-base rounded-md focus:outline-none focus:border-primary text-text-base text-sm appearance-none transition-colors"
                                >
                                    <option value="">All Courses</option>
                                    {courses.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="relative">
                                <Layers className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
                                <select
                                    value={batchFilter}
                                    onChange={(e) => setBatchFilter(e.target.value)}
                                    className="pl-9 pr-4 py-2 w-full bg-bg-base border border-border-base rounded-md focus:outline-none focus:border-primary text-text-base text-sm appearance-none transition-colors"
                                >
                                    <option value="">All Batches</option>
                                    {batches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="relative">
                                <FileQuestion className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
                                <select
                                    value={examFilter}
                                    onChange={(e) => setExamFilter(e.target.value)}
                                    className="pl-9 pr-4 py-2 w-full bg-bg-base border border-border-base rounded-md focus:outline-none focus:border-primary text-text-base text-sm appearance-none transition-colors"
                                >
                                    <option value="">All Exams</option>
                                    {exams.map(e => (
                                        <option key={e.id} value={e.id}>{e.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-bg-hover text-text-muted border-b border-border-base text-xs uppercase tracking-wider">
                                    <th className="p-4 font-semibold">Student</th>
                                    <th className="p-4 font-semibold">Course / Batch</th>
                                    <th className="p-4 font-semibold">Exam Title</th>
                                    <th className="p-4 font-semibold text-center">Score</th>
                                    <th className="p-4 font-semibold text-center">Percentage</th>
                                    <th className="p-4 font-semibold text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-text-muted">
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                                <p>Loading results...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : results.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-12 text-center text-text-muted">
                                            <div className="flex flex-col items-center justify-center">
                                                <Filter className="w-12 h-12 mb-3 text-border-base" />
                                                <p className="text-lg font-medium text-text-base">No results found</p>
                                                <p className="text-sm">Try adjusting your filters to find what you're looking for.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    results.map((result) => (
                                        <tr key={result.id} className="border-b border-border-base hover:bg-bg-hover/50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-semibold text-text-base">{result.student_name}</div>
                                                <div className="text-xs text-text-muted mt-1">{result.registration_id}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-text-base">{result.course}</div>
                                                <div className="text-xs text-text-muted mt-1">{result.batch}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-text-base font-medium">{result.exam_title}</div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="inline-block px-2.5 py-1 bg-bg-base border border-border-base rounded-md text-sm font-semibold">
                                                    {result.score} / {result.total_questions}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`inline-block px-2.5 py-1 rounded-md text-sm font-bold ${
                                                    result.percentage >= 50 
                                                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-200' 
                                                        : 'bg-red-500/10 text-red-600 border border-red-200'
                                                }`}>
                                                    {Number(result.percentage).toFixed(1)}%
                                                </span>
                                            </td>
                                            <td className="p-4 text-right text-sm text-text-muted">
                                                {new Date(result.date).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.last_page > 1 && (
                        <div className="p-4 border-t border-border-base flex items-center justify-between bg-bg-base/50">
                            <div className="text-sm text-text-muted">
                                Showing <span className="font-medium text-text-base">{pagination.from || 0}</span> to <span className="font-medium text-text-base">{pagination.to || 0}</span> of <span className="font-medium text-text-base">{pagination.total}</span> results
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => fetchResults(currentPage - 1)}
                                    disabled={currentPage === 1 || isLoading}
                                    className="p-2 border border-border-base rounded-md hover:bg-bg-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="py-2 px-4 border border-border-base rounded-md bg-bg-card font-medium text-sm">
                                    {currentPage} / {pagination.last_page}
                                </span>
                                <button
                                    onClick={() => fetchResults(currentPage + 1)}
                                    disabled={currentPage === pagination.last_page || isLoading}
                                    className="p-2 border border-border-base rounded-md hover:bg-bg-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </TeacherLayout>
    );
}
