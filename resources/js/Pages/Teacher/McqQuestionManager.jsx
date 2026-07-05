import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import TeacherLayout from '../../Layouts/TeacherLayout';
import CustomButton from '../../Core/Widgets/CustomButton';
import CustomTextField from '../../Core/Widgets/CustomTextField';
import Modal from '../../Core/Widgets/Modal';
import { Plus, Edit2, Trash2, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

export default function McqQuestionManager({ paperId }) {
    const [questions, setQuestions] = useState([]);
    const [paper, setPaper] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Modals state
    const [isModalOpen, setIsModalOpen] = useState(false);

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
        explanation: '',
        marks: '1',
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Get paper details (assuming endpoint exists, or just use questions endpoint if it returns paper data)
            const questionsRes = await axios.get(`/api/mcq_papers/${paperId}/questions`, config);
            setQuestions(questionsRes.data);

            // In a real app we'd fetch paper details too to show title
        } catch (error) {
            console.error("Error fetching questions", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [paperId]);

    const openModal = (question = null) => {
        setEditingQuestion(question);
        setImageFile(null);

        if (question) {
            setFormData({
                question_text: question.question_text || '',
                option_a: question.option_a || '',
                option_b: question.option_b || '',
                option_c: question.option_c || '',
                option_d: question.option_d || '',
                correct_option: question.correct_option || 'A',
                explanation: question.explanation || '',
                marks: question.marks?.toString() || '1',
            });
            setImagePreview(question.image_url || null);
        } else {
            setFormData({
                question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A', explanation: '', marks: '1'
            });
            setImagePreview(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingQuestion(null);
        setImageFile(null);
        setImagePreview(null);
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
            setImagePreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.question_text || !formData.option_a || !formData.option_b) return alert('Question and at least options A & B are required');

        const token = localStorage.getItem('auth_token');

        try {
            const payload = new FormData();
            payload.append('mcq_paper_id', paperId);
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined) {
                    payload.append(key, formData[key]);
                }
            });

            if (imageFile) {
                payload.append('image', imageFile);
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json'
                }
            };

            if (editingQuestion) {
                payload.append('_method', 'PUT'); // Laravel spoofing for PUT with FormData
                await axios.post(`/api/mcq_questions/${editingQuestion.id}`, payload, config);
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
                    <CustomButton onPressed={() => openModal()} icon={Plus} className="py-2 px-4 whitespace-nowrap">
                        Add Question
                    </CustomButton>
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
                                            {q.image_url && (
                                                <div className="mt-3 ml-7">
                                                    <img src={q.image_url} alt="Question" className="max-h-32 rounded-md border border-border-base " />
                                                </div>
                                            )}
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

                    <div className="flex items-center space-x-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-text-base mb-1.5">Question Image (Optional)</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="w-full px-3 py-1.5 text-sm bg-bg-base border border-border-base rounded-md file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary-hover hover:file:bg-primary-light-hover"
                            />
                        </div>
                        {imagePreview && (
                            <div className="relative w-24 h-24 rounded-md border border-border-base overflow-hidden bg-bg-hover flex items-center justify-center">
                                <img src={imagePreview} alt="Preview" className="max-w-full max-h-full object-contain" />
                            </div>
                        )}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <CustomTextField
                            label="Marks"
                            type="number"
                            value={formData.marks}
                            onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-base mb-1.5">Explanation (Optional)</label>
                        <textarea
                            className="w-full px-4 py-2 bg-bg-base border border-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text-base "
                            rows="2"
                            value={formData.explanation}
                            onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 border-t border-border-base ">
                        <CustomButton type="button" variant="secondary" onPressed={closeModal}>Cancel</CustomButton>
                        <CustomButton type="submit">{editingQuestion ? 'Save Changes' : 'Add Question'}</CustomButton>
                    </div>
                </form>
            </Modal>
        </TeacherLayout>
    );
}
