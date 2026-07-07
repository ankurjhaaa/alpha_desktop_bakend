import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import TeacherLayout from '../../Layouts/TeacherLayout';
import CustomButton from '../../Core/Widgets/CustomButton';
import CustomTextField from '../../Core/Widgets/CustomTextField';
import Modal from '../../Core/Widgets/Modal';
import { Plus, Edit2, Trash2, ArrowLeft, Image as ImageIcon, Upload, Copy } from 'lucide-react';
import axios from 'axios';

export default function McqQuestionManager({ paperId }) {
    const [questions, setQuestions] = useState([]);
    const [paper, setPaper] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Modals state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isJsonImportModalOpen, setIsJsonImportModalOpen] = useState(false);

    // Import state
    const [bankQuestions, setBankQuestions] = useState([]);
    const [selectedBankQuestions, setSelectedBankQuestions] = useState([]);
    const [courses, setCourses] = useState([]);
    const [topics, setTopics] = useState([]);
    const [importCourseFilter, setImportCourseFilter] = useState('');
    const [importTopicFilter, setImportTopicFilter] = useState('');
    const [isImporting, setIsImporting] = useState(false);

    // Range Import state
    const [importTab, setImportTab] = useState('manual'); // 'manual' or 'range'
    const [rangeStart, setRangeStart] = useState('');
    const [rangeEnd, setRangeEnd] = useState('');

    // JSON Import state
    const [jsonImportText, setJsonImportText] = useState('');

    // Edit state
    const [editingQuestion, setEditingQuestion] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'A',
    });

    const fetchData = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [questionsRes, paperRes] = await Promise.all([
                axios.get(`/api/mcq_questions?mcq_paper_id=${paperId}`, config),
                axios.get(`/api/mcq_papers/${paperId}`, config)
            ]);

            setQuestions(questionsRes.data);
            setPaper(paperRes.data);
        } catch (error) {
            console.error("Error fetching questions or paper details", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [paperId]);

    const fetchCoursesForImport = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) return;
        try {
            const res = await axios.get('/api/courses', { headers: { Authorization: `Bearer ${token}` } });
            setCourses(res.data);
        } catch (error) {
            console.error("Error fetching courses", error);
        }
    };

    const fetchTopicsForImport = async (courseId) => {
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

    const fetchBankQuestions = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) return;
        try {
            let url = '/api/question-bank?';
            if (importCourseFilter) url += `course_id=${importCourseFilter}&`;
            if (importTopicFilter) url += `topic_id=${importTopicFilter}`;

            const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
            setBankQuestions(res.data);
        } catch (error) {
            console.error("Error fetching bank questions", error);
        }
    };

    useEffect(() => {
        if (importCourseFilter) {
            fetchTopicsForImport(importCourseFilter);
        } else {
            setTopics([]);
            setImportTopicFilter('');
        }
    }, [importCourseFilter]);

    useEffect(() => {
        if (isImportModalOpen) {
            fetchBankQuestions();
        }
    }, [importCourseFilter, importTopicFilter, isImportModalOpen]);

    const openImportModal = () => {
        setIsImportModalOpen(true);
        setSelectedBankQuestions([]);
        setImportTab('manual');
        setRangeStart('');
        setRangeEnd('');

        // Default to paper's course and topic if available
        if (paper) {
            if (paper.batch && paper.batch.course_id) {
                setImportCourseFilter(paper.batch.course_id.toString());
            }
            if (paper.topic_id) {
                setImportTopicFilter(paper.topic_id.toString());
            }
        }

        fetchCoursesForImport();
    };

    const handleRangeImportSubmit = async () => {
        if (!rangeStart || !rangeEnd) return alert('Please enter both start and end numbers');
        if (parseInt(rangeStart) < 1) return alert('Start number must be at least 1');
        if (parseInt(rangeStart) > parseInt(rangeEnd)) return alert('Start number cannot be greater than end number');

        setIsImporting(true);
        const token = localStorage.getItem('auth_token');

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const payload = {
                start_number: parseInt(rangeStart),
                end_number: parseInt(rangeEnd),
                course_id: importCourseFilter || null,
                topic_id: importTopicFilter || null,
            };

            const res = await axios.post(`/api/mcq_papers/${paperId}/import-questions`, payload, config);
            alert(res.data.message || 'Questions imported successfully');

            await fetchData();
            setIsImportModalOpen(false);
            setRangeStart('');
            setRangeEnd('');
        } catch (error) {
            console.error("Error importing questions by range", error);
            alert(error.response?.data?.message || 'Failed to import questions by range');
        } finally {
            setIsImporting(false);
        }
    };

    const handleImportSubmit = async () => {
        if (selectedBankQuestions.length === 0) return alert('Select at least one question');

        setIsImporting(true);
        const token = localStorage.getItem('auth_token');

        try {
            const questionsToImport = selectedBankQuestions.map(id => {
                const q = bankQuestions.find(bq => bq.id === id);
                let correctOpt = 'a';
                if (q.correct_answer && Array.isArray(q.options) && q.options.length > 0) {
                    const ansStr = q.correct_answer.toLowerCase().trim();
                    const idx = q.options.findIndex(opt => opt && opt.toLowerCase().trim() === ansStr);
                    if (idx === 0) correctOpt = 'a';
                    else if (idx === 1) correctOpt = 'b';
                    else if (idx === 2) correctOpt = 'c';
                    else if (idx === 3) correctOpt = 'd';
                }

                return {
                    mcq_paper_id: paperId,
                    question_text: q.question_text,
                    option_a: q.options[0] || '',
                    option_b: q.options[1] || '',
                    option_c: q.options[2] || '',
                    option_d: q.options[3] || '',
                    correct_option: correctOpt,
                    is_active: true
                };
            });

            await axios.post('/api/mcq_questions/bulk', { questions: questionsToImport }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            await fetchData();
            setIsImportModalOpen(false);
            setSelectedBankQuestions([]);
        } catch (error) {
            console.error("Error importing questions", error);
            alert('Failed to import questions');
        } finally {
            setIsImporting(false);
        }
    };

    const handleImportJson = async () => {
        if (!jsonImportText.trim()) return alert("Please paste JSON data");

        let parsedJson;
        try {
            parsedJson = JSON.parse(jsonImportText);
            if (!Array.isArray(parsedJson)) {
                return alert("Invalid JSON format. Expected an array of questions.");
            }
        } catch (e) {
            return alert("Error parsing JSON. Make sure it is valid.");
        }

        setIsImporting(true);
        const token = localStorage.getItem('auth_token');

        try {
            const questionsToImport = parsedJson.map(q => {
                let correctOpt = 'a';
                if (q.correct_answer && Array.isArray(q.options) && q.options.length > 0) {
                    const ansStr = q.correct_answer.toLowerCase().trim();
                    const idx = q.options.findIndex(opt => opt && opt.toLowerCase().trim() === ansStr);
                    if (idx === 0) correctOpt = 'a';
                    else if (idx === 1) correctOpt = 'b';
                    else if (idx === 2) correctOpt = 'c';
                    else if (idx === 3) correctOpt = 'd';
                }

                return {
                    mcq_paper_id: paperId,
                    question_text: q.question,
                    option_a: q.options && q.options[0] ? q.options[0] : '',
                    option_b: q.options && q.options[1] ? q.options[1] : '',
                    option_c: q.options && q.options[2] ? q.options[2] : '',
                    option_d: q.options && q.options[3] ? q.options[3] : '',
                    correct_option: correctOpt,
                    is_active: true
                };
            });

            await axios.post('/api/mcq_questions/bulk', { questions: questionsToImport }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            await fetchData();
            setIsJsonImportModalOpen(false);
            setJsonImportText('');
        } catch (error) {
            console.error("Error importing JSON questions", error);
            alert(error.response?.data?.message || 'Failed to import JSON questions');
        } finally {
            setIsImporting(false);
        }
    };

    const copyJsonFormat = () => {
        const format = `[
  {
    "question": "Sample?",
    "options": ["A", "B", "C", "D"],
    "correct_answer": "A"
  }
]`;
        navigator.clipboard.writeText(format);
        alert("JSON format copied to clipboard!");
    };

    const openModal = (question = null) => {
        setEditingQuestion(question);

        if (question) {
            setFormData({
                question_text: question.question_text || '',
                option_a: question.option_a || '',
                option_b: question.option_b || '',
                option_c: question.option_c || '',
                option_d: question.option_d || '',
                correct_option: question.correct_option || 'A',
            });
            setImagePreview(question.image_url || null);
        } else {
            setFormData({
                question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingQuestion(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.question_text || !formData.option_a || !formData.option_b) return alert('Question and at least options A & B are required');

        const token = localStorage.getItem('auth_token');

        try {
            const payload = {
                mcq_paper_id: paperId,
                ...formData
            };

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            };

            if (editingQuestion) {
                await axios.put(`/api/mcq_questions/${editingQuestion.id}`, payload, config);
            } else {
                await axios.post('/api/mcq_questions', payload, config);
            }
            await fetchData();
            closeModal();
        } catch (error) {
            console.error("Error saving question", error);
            alert(error.response?.data?.message || 'Failed to save question');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this question?')) return;

        const token = localStorage.getItem('auth_token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            await axios.delete(`/api/mcq_questions/${id}`, config);
            await fetchData();
        } catch (error) {
            console.error("Error deleting question", error);
            alert(error.response?.data?.message || 'Failed to delete question');
        }
    };

    return (
        <TeacherLayout title={`Questions for Paper #${paperId}`}>
            <Head title="Manage Questions" />

            <div className="mb-4">
                <Link href="/teacher/mcq-papers" className="inline-flex items-center text-sm font-medium text-text-muted hover:text-primary transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Papers
                </Link>
            </div>

            <div className="bg-bg-card rounded-md shadow-sm border border-border-base transition-colors">
                <div className="p-6 border-b border-border-base flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-bold text-text-base ">
                        Total Questions: {questions.length}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        <CustomButton onPressed={() => setIsJsonImportModalOpen(true)} variant="secondary" icon={Upload} className="py-2 px-4 whitespace-nowrap">
                            Import JSON
                        </CustomButton>
                        <CustomButton onPressed={() => openImportModal()} variant="secondary" className="py-2 px-4 whitespace-nowrap">
                            Import from Bank
                        </CustomButton>
                        <CustomButton onPressed={() => openModal()} icon={Plus} className="py-2 px-4 whitespace-nowrap">
                            Add Question
                        </CustomButton>
                    </div>
                </div>

                <div className="p-6">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : questions.length === 0 ? (
                        <div className="text-center py-12 text-text-muted ">
                            No questions added yet.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {questions.map((q, index) => (
                                <div key={q.id} className="border border-border-base rounded-md p-5 hover:border-primary-light-hover transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-start">
                                                <span className="font-bold text-primary mr-2">Q{index + 1}.</span>
                                                <h3 className="text-text-base font-medium">{q.question_text}</h3>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 ml-4">
                                            <span className="px-2 py-1 bg-bg-hover text-text-muted text-xs rounded-md font-medium">
                                                {q.marks} Mark{q.marks !== 1 && 's'}
                                            </span>
                                            <button onClick={() => openModal(q)} className="p-1.5 text-primary hover:bg-primary-light rounded-md transition-colors" title="Edit Question">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(q.id)} className="p-1.5 text-danger-text hover:bg-danger-light rounded-md transition-colors" title="Delete Question">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-7">
                                        {['A', 'B', 'C', 'D'].map(opt => {
                                            const optText = q[`option_${opt.toLowerCase()}`];
                                            if (!optText) return null;

                                            const isCorrect = q.correct_option === opt;
                                            return (
                                                <div key={opt} className={`p-2 rounded-md text-sm border ${isCorrect ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-medium' : 'bg-bg-base border-border-base text-text-muted '}`}>
                                                    <span className="font-bold mr-2">{opt}.</span>
                                                    {optText}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {q.explanation && (
                                        <div className="mt-4 ml-7 p-3 bg-primary-light border border-primary-light rounded-md text-sm text-text-base ">
                                            <span className="font-semibold mr-1">Explanation:</span> {q.explanation}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Question Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingQuestion ? "Edit Question" : "Add New Question"} maxWidth="4xl">
                <form onSubmit={handleSave} className="space-y-5">

                    <div>
                        <label className="block text-sm font-medium text-text-base mb-1.5">Question Text</label>
                        <textarea
                            className="w-full px-4 py-2 bg-bg-base border border-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text-base "
                            rows="3"
                            value={formData.question_text}
                            onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CustomTextField
                            label="Option A"
                            value={formData.option_a}
                            onChange={(e) => setFormData({ ...formData, option_a: e.target.value })}
                            required
                        />
                        <CustomTextField
                            label="Option B"
                            value={formData.option_b}
                            onChange={(e) => setFormData({ ...formData, option_b: e.target.value })}
                            required
                        />
                        <CustomTextField
                            label="Option C (Optional)"
                            value={formData.option_c}
                            onChange={(e) => setFormData({ ...formData, option_c: e.target.value })}
                        />
                        <CustomTextField
                            label="Option D (Optional)"
                            value={formData.option_d}
                            onChange={(e) => setFormData({ ...formData, option_d: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-base mb-1.5">Correct Option</label>
                        <select
                            value={formData.correct_option}
                            onChange={(e) => setFormData({ ...formData, correct_option: e.target.value })}
                            className="w-full px-4 py-2 bg-bg-base border border-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text-base "
                            required
                        >
                            <option value="A">Option A</option>
                            <option value="B">Option B</option>
                            <option value="C">Option C</option>
                            <option value="D">Option D</option>
                        </select>
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 border-t border-border-base ">
                        <CustomButton type="button" variant="secondary" onPressed={closeModal}>Cancel</CustomButton>
                        <CustomButton type="submit">
                            {editingQuestion ? 'Save Changes' : 'Add Question'}
                        </CustomButton>
                    </div>
                </form>
            </Modal>

            {/* Import from Question Bank Modal */}
            <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Import from Question Bank" maxWidth="4xl">
                <div className="space-y-4">


                    {/* Tabs */}
                    <div className="flex border-b border-border-base">
                        <button
                            type="button"
                            className={`py-2 px-4 font-medium text-sm transition-colors ${importTab === 'manual' ? 'border-b-2 border-primary text-primary' : 'text-text-muted hover:text-text-base'}`}
                            onClick={() => setImportTab('manual')}
                        >
                            Manual Select
                        </button>
                        <button
                            type="button"
                            className={`py-2 px-4 font-medium text-sm transition-colors ${importTab === 'range' ? 'border-b-2 border-primary text-primary' : 'text-text-muted hover:text-text-base'}`}
                            onClick={() => setImportTab('range')}
                        >
                            Range Select
                        </button>
                    </div>

                    {importTab === 'manual' ? (
                        <>
                            <div className="max-h-96 overflow-y-auto border border-border-base rounded-md p-4 bg-bg-base ">
                                {bankQuestions.length === 0 ? (
                                    <p className="text-center text-text-muted text-sm py-4">No questions found in the Question Bank.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {bankQuestions.map((q, i) => (
                                            <label key={q.id} className="flex items-start p-3 border border-border-base rounded-md hover:bg-bg-hover cursor-pointer transition-colors">
                                                <input
                                                    type="checkbox"
                                                    className="mt-1 w-4 h-4 rounded-md text-primary focus:ring-primary border-border-base mr-3"
                                                    checked={selectedBankQuestions.includes(q.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedBankQuestions([...selectedBankQuestions, q.id]);
                                                        } else {
                                                            setSelectedBankQuestions(selectedBankQuestions.filter(id => id !== q.id));
                                                        }
                                                    }}
                                                />
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-text-base">Q{i + 1}. {q.question_text}</h4>
                                                    <div className="text-xs text-text-muted mt-1 truncate">
                                                        {q.options?.join(', ')}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-border-base ">
                                <div className="text-sm font-medium text-text-base">
                                    Selected: {selectedBankQuestions.length}
                                </div>
                                <div className="flex space-x-3">
                                    <CustomButton type="button" variant="secondary" onPressed={() => setIsImportModalOpen(false)} disabled={isImporting}>Cancel</CustomButton>
                                    <CustomButton onPressed={handleImportSubmit} disabled={isImporting || selectedBankQuestions.length === 0}>
                                        {isImporting ? 'Importing...' : 'Import Selected'}
                                    </CustomButton>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-4 border border-border-base rounded-md bg-bg-base space-y-4">
                            <p className="text-sm text-text-muted mb-4">
                                Enter the start and end question numbers to import. Make sure this exam has a topic assigned, otherwise range import won't work.
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <CustomTextField
                                    label="Start Question No."
                                    type="number"
                                    placeholder="e.g. 1"
                                    value={rangeStart}
                                    onChange={(e) => setRangeStart(e.target.value)}
                                    min="1"
                                />
                                <CustomTextField
                                    label="End Question No."
                                    type="number"
                                    placeholder="e.g. 50"
                                    value={rangeEnd}
                                    onChange={(e) => setRangeEnd(e.target.value)}
                                    min="1"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-border-base ">
                                <CustomButton type="button" variant="secondary" onPressed={() => setIsImportModalOpen(false)} disabled={isImporting}>Cancel</CustomButton>
                                <CustomButton onPressed={handleRangeImportSubmit} disabled={isImporting || !rangeStart || !rangeEnd}>
                                    {isImporting ? 'Importing...' : 'Import Range'}
                                </CustomButton>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Import JSON Modal */}
            <Modal isOpen={isJsonImportModalOpen} onClose={() => setIsJsonImportModalOpen(false)} title="Import JSON Questions" maxWidth="2xl">
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-text-base">Paste your JSON array here:</span>
                        <button onClick={copyJsonFormat} className="flex items-center text-sm text-primary hover:text-primary-hover font-medium">
                            <Copy className="w-4 h-4 mr-1" /> Copy Format
                        </button>
                    </div>
                    <textarea
                        className="w-full px-4 py-3 bg-bg-base border border-border-base rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary text-text-base "
                        rows="12"
                        placeholder={`[
  {
    "question": "Sample?",
    "options": ["A", "B", "C", "D"],
    "correct_answer": "A"
  }
]`}
                        value={jsonImportText}
                        onChange={(e) => setJsonImportText(e.target.value)}
                    />
                    <div className="flex justify-end space-x-3 pt-4">
                        <CustomButton type="button" variant="secondary" onPressed={() => setIsJsonImportModalOpen(false)} disabled={isImporting}>Cancel</CustomButton>
                        <CustomButton onPressed={handleImportJson} disabled={isImporting}>{isImporting ? 'Importing...' : 'Import Questions'}</CustomButton>
                    </div>
                </div>
            </Modal>
        </TeacherLayout>
    );
}
