import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import TeacherLayout from '../../Layouts/TeacherLayout';
import CustomButton from '../../Core/Widgets/CustomButton';
import CustomTextField from '../../Core/Widgets/CustomTextField';
import Modal from '../../Core/Widgets/Modal';
import { Plus, Edit2, Trash2, Filter, Upload, Copy } from 'lucide-react';
import axios from 'axios';

export default function QuestionBankPage() {
    const [questions, setQuestions] = useState([]);
    const [courses, setCourses] = useState([]);
    const [topics, setTopics] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [courseFilter, setCourseFilter] = useState('');
    const [topicFilter, setTopicFilter] = useState('');

    // Modals state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // Edit state
    const [editingQuestion, setEditingQuestion] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A',
    });
    const [jsonImportText, setJsonImportText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchCourses = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const coursesRes = await axios.get('/api/courses', config);
            setCourses(coursesRes.data);
        } catch (error) {
            console.error("Error fetching courses", error);
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

    const fetchQuestions = async () => {
        if (!courseFilter || !topicFilter) return;
        setIsLoading(true);
        const token = localStorage.getItem('auth_token');
        try {
            const res = await axios.get(`/api/question-bank?course_id=${courseFilter}&topic_id=${topicFilter}`, { headers: { Authorization: `Bearer ${token}` } });
            setQuestions(res.data);
        } catch (error) {
            console.error("Error fetching questions", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (courseFilter) {
            fetchTopics(courseFilter);
        } else {
            setTopics([]);
            setTopicFilter('');
            setQuestions([]);
        }
    }, [courseFilter]);

    useEffect(() => {
        if (courseFilter && topicFilter) {
            fetchQuestions();
        } else {
            setQuestions([]);
        }
    }, [topicFilter]);

    const openModal = (question = null) => {
        setEditingQuestion(question);

        if (question) {
            const options = question.options || ['', '', '', ''];

            // Map correct answer logic (it could be A, B, C, D or the actual text)
            let correctOpt = 'A';
            const rawCorrect = question.correct_answer || 'A';
            if (['A', 'B', 'C', 'D'].includes(rawCorrect.toUpperCase())) {
                correctOpt = rawCorrect.toUpperCase();
            } else {
                const idx = options.indexOf(rawCorrect);
                if (idx >= 0 && idx < 4) {
                    correctOpt = ['A', 'B', 'C', 'D'][idx];
                }
            }

            setFormData({
                question_text: question.question_text || '',
                option_a: options[0] || '',
                option_b: options[1] || '',
                option_c: options[2] || '',
                option_d: options[3] || '',
                correct_answer: correctOpt,
            });
        } else {
            setFormData({
                question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A'
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

        setIsSubmitting(true);
        const token = localStorage.getItem('auth_token');

        try {
            const payload = {
                course_id: courseFilter,
                topic_id: topicFilter,
                question_text: formData.question_text,
                options: [formData.option_a, formData.option_b, formData.option_c, formData.option_d],
                correct_answer: formData.correct_answer
            };

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            };

            if (editingQuestion) {
                await axios.put(`/api/question-bank/${editingQuestion.id}`, payload, config);
            } else {
                await axios.post('/api/question-bank', payload, config);
            }
            await fetchQuestions();
            closeModal();
        } catch (error) {
            console.error("Error saving question", error);
            alert(error.response?.data?.message || 'Failed to save question');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this question?')) return;

        const token = localStorage.getItem('auth_token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            await axios.delete(`/api/question-bank/${id}`, config);
            await fetchQuestions();
        } catch (error) {
            console.error("Error deleting question", error);
            alert(error.response?.data?.message || 'Failed to delete question');
        }
    };

    const openImportModal = () => {
        if (!courseFilter || !topicFilter) {
            alert("Please select a course and topic first.");
            return;
        }
        setJsonImportText('');
        setIsImportModalOpen(true);
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

        setIsSubmitting(true);
        const token = localStorage.getItem('auth_token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        try {
            await axios.post('/api/question-bank/import', {
                course_id: courseFilter,
                topic_id: topicFilter,
                questions: parsedJson
            }, config);

            fetchQuestions();
            setIsImportModalOpen(false);
        } catch (error) {
            console.error("Error importing questions", error);
            alert(error.response?.data?.message || 'Failed to import. Check format.');
        } finally {
            setIsSubmitting(false);
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

    return (
        <TeacherLayout title="Question Bank">
            <Head title="Question Bank" />

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
                                className="w-full pl-10 pr-4 py-2 bg-bg-base border border-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text-base appearance-none"
                            >
                                <option value="">Select Course</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        {courseFilter && (
                            <div className="relative max-w-xs">
                                <select
                                    value={topicFilter}
                                    onChange={(e) => setTopicFilter(e.target.value)}
                                    className="w-full px-4 py-2 bg-bg-base border border-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text-base appearance-none"
                                >
                                    <option value="">Select Topic</option>
                                    {topics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="flex space-x-3">
                        <CustomButton
                            variant="secondary"
                            onPressed={openImportModal}
                            icon={Upload}
                            disabled={!courseFilter || !topicFilter || isLoading}
                        >
                            Import JSON
                        </CustomButton>
                        <CustomButton
                            onPressed={() => openModal()}
                            icon={Plus}
                            disabled={!courseFilter || !topicFilter || isLoading}
                        >
                            Add Manual
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
                            {(!courseFilter || !topicFilter) ? "Please select a course and topic." : "No questions found. Add some or import from JSON."}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {questions.map((q, index) => {
                                const options = q.options || [];
                                const correctAns = q.correct_answer || 'A';

                                return (
                                    <div key={q.id} className="border border-border-base rounded-md p-5 hover:border-primary-light-hover transition-colors">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-start">
                                                    <span className="font-bold text-primary mr-2">Q{index + 1}.</span>
                                                    <h3 className="text-text-base font-medium">{q.question_text}</h3>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 ml-4">
                                                <button onClick={() => openModal(q)} className="p-1.5 text-primary hover:bg-primary-light rounded-md transition-colors" title="Edit Question">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(q.id)} className="p-1.5 text-danger-text hover:bg-danger-light rounded-md transition-colors" title="Delete Question">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-7">
                                            {options.map((optText, i) => {
                                                if (!optText) return null;
                                                const optLetter = ['A', 'B', 'C', 'D'][i];
                                                const isCorrect = (correctAns.toUpperCase() === optLetter) || (correctAns === optText);

                                                return (
                                                    <div key={i} className={`p-2 rounded-md text-sm border ${isCorrect ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-medium' : 'bg-bg-base border-border-base text-text-muted '}`}>
                                                        <span className="font-bold mr-2">{optLetter}.</span>
                                                        {optText}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Question Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingQuestion ? "Edit Question" : "Add New Question"} maxWidth="3xl">
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
                            label="Option C"
                            value={formData.option_c}
                            onChange={(e) => setFormData({ ...formData, option_c: e.target.value })}
                        />
                        <CustomTextField
                            label="Option D"
                            value={formData.option_d}
                            onChange={(e) => setFormData({ ...formData, option_d: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-base mb-1.5">Correct Option</label>
                        <select
                            value={formData.correct_answer}
                            onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
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
                        <CustomButton type="button" variant="secondary" onPressed={closeModal} disabled={isSubmitting}>Cancel</CustomButton>
                        <CustomButton type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : (editingQuestion ? 'Save Changes' : 'Add Question')}</CustomButton>
                    </div>
                </form>
            </Modal>

            {/* Import JSON Modal */}
            <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Import JSON Questions" maxWidth="2xl">
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-text-base ">Paste your JSON array here:</span>
                        <button onClick={copyJsonFormat} className="flex items-center text-sm text-primary hover:text-primary-hover font-medium">
                            <Copy className="w-4 h-4 mr-1" /> Copy Format
                        </button>
                    </div>
                    <textarea
                        className="w-full px-4 py-3 bg-bg-base border border-border-base rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary text-text-base "
                        rows="15"
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
                        <CustomButton type="button" variant="secondary" onPressed={() => setIsImportModalOpen(false)} disabled={isSubmitting}>Cancel</CustomButton>
                        <CustomButton onPressed={handleImportJson} disabled={isSubmitting}>{isSubmitting ? 'Importing...' : 'Import Questions'}</CustomButton>
                    </div>
                </div>
            </Modal>
        </TeacherLayout>
    );
}
