import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import TeacherLayout from '../../Layouts/TeacherLayout';
import CustomButton from '../../Core/Widgets/CustomButton';
import CustomTextField from '../../Core/Widgets/CustomTextField';
import Modal from '../../Core/Widgets/Modal';
import { Search, Plus, Edit2, Trash2, Filter, Mail, Phone, MapPin } from 'lucide-react';
import axios from 'axios';

export default function StudentsPage() {
 const [students, setStudents] = useState([]);
 const [batches, setBatches] = useState([]);
 const [courses, setCourses] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 
 // Filters
 const [searchQuery, setSearchQuery] = useState('');
 const [courseFilter, setCourseFilter] = useState('');
 const [batchFilter, setBatchFilter] = useState('');
 
 // Modals state
 const [isModalOpen, setIsModalOpen] = useState(false);
 
 // Edit state
 const [editingStudent, setEditingStudent] = useState(null);
 
 // Form state
 const [formData, setFormData] = useState({ 
 name: '', 
 email: '',
 password: '',
 phone: '',
 father_name: '',
 registration_id: '',
 address: '',
 gender: 'Male',
 dob: '',
 batch_id: ''
 });

 const fetchData = async () => {
 setIsLoading(true);
 const token = localStorage.getItem('auth_token');
 if (!token) return;

 try {
 const config = { headers: { Authorization: `Bearer ${token}` } };
 
 const [coursesRes, batchesRes] = await Promise.all([
 axios.get('/api/courses', config),
 axios.get('/api/batches', config)
 ]);
 
 setCourses(coursesRes.data);
 setBatches(batchesRes.data);

 let url = '/api/students?';
 if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
 if (courseFilter) url += `course_id=${courseFilter}&`;
 if (batchFilter) url += `batch_id=${batchFilter}&`;
 
 const studentsRes = await axios.get(url, config);
 setStudents(studentsRes.data);
 } catch (error) {
 console.error("Error fetching data", error);
 } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
 const debounce = setTimeout(() => fetchData(), 500);
 return () => clearTimeout(debounce);
 }, [searchQuery, courseFilter, batchFilter]);

 const openModal = (student = null) => {
 setEditingStudent(student);
 if (student) {
 setFormData({
 name: student.name || '',
 email: student.email || '',
 password: '',
 phone: student.phone || '',
 father_name: student.father_name || '',
 registration_id: student.registration_id || '',
 address: student.address || '',
 gender: student.gender || 'Male',
 dob: student.dob || '',
 batch_id: (student.batches && student.batches.length > 0) ? student.batches[0].id : ''
 });
 } else {
 setFormData({ 
 name: '', email: '', password: '', phone: '', father_name: '', registration_id: '', address: '', gender: 'Male', dob: '', batch_id: '' 
 });
 }
 setIsModalOpen(true);
 };

 const closeModal = () => {
 setIsModalOpen(false);
 setEditingStudent(null);
 };

 const handleSave = async (e) => {
 e.preventDefault();
 if (!formData.name || !formData.email) return alert('Name and Email are required');
 if (!editingStudent && !formData.password) return alert('Password is required for new students');

 const token = localStorage.getItem('auth_token');
 const config = { headers: { Authorization: `Bearer ${token}` } };
 
 try {
 const payload = { ...formData, is_active: '1' };
 if (!payload.password) delete payload.password;
 if (payload.batch_id) {
 payload['batch_ids'] = [payload.batch_id];
 }

 if (editingStudent) {
 await axios.put(`/api/students/${editingStudent.id}`, payload, config);
 } else {
 await axios.post('/api/students', payload, config);
 }
 fetchData();
 closeModal();
 } catch (error) {
 console.error("Error saving student", error);
 alert(error.response?.data?.message || 'Failed to save student');
 }
 };

 const handleDelete = async (id) => {
 if (!confirm('Are you sure you want to delete this student?')) return;
 
 const token = localStorage.getItem('auth_token');
 const config = { headers: { Authorization: `Bearer ${token}` } };
 
 try {
 await axios.delete(`/api/students/${id}`, config);
 fetchData();
 } catch (error) {
 console.error("Error deleting student", error);
 alert(error.response?.data?.message || 'Failed to delete student');
 }
 };

 return (
 <TeacherLayout title="Students">
 <Head title="Students Management" />

 <div className="bg-bg-card rounded-xl shadow-sm border border-border-base transition-colors">
 <div className="p-6 border-b border-border-base flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div className="flex flex-col sm:flex-row gap-4 flex-1">
 <div className="relative max-w-xs">
 <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
 <Filter className="w-4 h-4 text-text-muted" />
 </div>
 <select
 value={courseFilter}
 onChange={(e) => { setCourseFilter(e.target.value); setBatchFilter(''); }}
 className="w-full pl-10 pr-4 py-2 bg-bg-base border border-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-base appearance-none"
 >
 <option value="">All Courses</option>
 {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
 </select>
 </div>
 <div className="relative max-w-xs">
 <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
 <Filter className="w-4 h-4 text-text-muted" />
 </div>
 <select
 value={batchFilter}
 onChange={(e) => setBatchFilter(e.target.value)}
 className="w-full pl-10 pr-4 py-2 bg-bg-base border border-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-base appearance-none"
 >
 <option value="">All Batches</option>
 {batches.filter(b => !courseFilter || b.course_id.toString() === courseFilter).map(b => (
 <option key={b.id} value={b.id}>{b.name}</option>
 ))}
 </select>
 </div>
 <div className="relative flex-1 max-w-md">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
 <input
 type="text"
 placeholder="Search students..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-10 pr-4 py-2 bg-bg-base border border-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-base "
 />
 </div>
 </div>
 <CustomButton onPressed={() => openModal()} icon={Plus} className="py-2 px-4 whitespace-nowrap">
 New Student
 </CustomButton>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left text-sm text-text-muted ">
 <thead className="bg-bg-base text-text-base border-b border-border-base ">
 <tr>
 <th className="px-6 py-4 font-semibold">Student</th>
 <th className="px-6 py-4 font-semibold">Contact</th>
 <th className="px-6 py-4 font-semibold">Batch</th>
 <th className="px-6 py-4 font-semibold">Status</th>
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
 ) : students.length === 0 ? (
 <tr>
 <td colSpan="5" className="px-6 py-12 text-center text-text-muted">No students found.</td>
 </tr>
 ) : (
 students.map((student) => (
 <tr key={student.id} className="border-b border-border-base hover:bg-bg-base">
 <td className="px-6 py-4">
 <div className="flex items-center">
 <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary-light-hover flex items-center justify-center">
 <span className="text-primary font-bold">{student.name.charAt(0).toUpperCase()}</span>
 </div>
 <div className="ml-4">
 <div className="font-medium text-text-base ">{student.name}</div>
 {student.registration_id && <div className="text-xs text-text-muted">Reg: {student.registration_id}</div>}
 </div>
 </div>
 </td>
 <td className="px-6 py-4">
 <div className="flex flex-col space-y-1">
 <div className="flex items-center text-text-muted ">
 <Mail className="w-3.5 h-3.5 mr-2" />
 {student.email}
 </div>
 {student.phone && (
 <div className="flex items-center text-text-muted ">
 <Phone className="w-3.5 h-3.5 mr-2" />
 {student.phone}
 </div>
 )}
 </div>
 </td>
 <td className="px-6 py-4">
 {student.batches && student.batches.length > 0 ? (
 <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-light text-primary-hover ">
 {student.batches[0].name}
 </span>
 ) : (
 <span className="text-text-muted italic text-xs">No batch</span>
 )}
 </td>
 <td className="px-6 py-4">
 <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-light ">
 Active
 </span>
 </td>
 <td className="px-6 py-4 text-right">
 <div className="flex items-center justify-end space-x-2">
 <button onClick={() => openModal(student)} className="p-2 text-primary hover:bg-primary-light rounded-lg transition-colors" title="Edit Student">
 <Edit2 className="w-4 h-4" />
 </button>
 <button onClick={() => handleDelete(student.id)} className="p-2 text-danger-text hover:bg-danger-light rounded-lg transition-colors" title="Delete Student">
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

 {/* Add/Edit Student Modal */}
 <Modal isOpen={isModalOpen} onClose={closeModal} title={editingStudent ? "Edit Student" : "Add New Student"} maxWidth="3xl">
 <form onSubmit={handleSave} className="space-y-6">
 <div>
 <h4 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wider">Required Fields</h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <CustomTextField
 label="Full Name"
 placeholder="e.g. John Doe"
 value={formData.name}
 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
 required
 />
 <CustomTextField
 label="Email Address"
 type="email"
 placeholder="john@example.com"
 value={formData.email}
 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
 required
 />
 <CustomTextField
 label={editingStudent ? "New Password (Optional)" : "Password"}
 type="password"
 placeholder="********"
 value={formData.password}
 onChange={(e) => setFormData({ ...formData, password: e.target.value })}
 required={!editingStudent}
 />
 </div>
 </div>

 <div className="h-px bg-bg-hover " />
 
 <div>
 <h4 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wider">Additional Details</h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <CustomTextField
 label="Phone Number"
 placeholder="+1234567890"
 value={formData.phone}
 onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
 />
 <CustomTextField
 label="Father's Name"
 placeholder="Father's Name"
 value={formData.father_name}
 onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
 />
 <CustomTextField
 label="Registration / Admission No"
 placeholder="REG12345"
 value={formData.registration_id}
 onChange={(e) => setFormData({ ...formData, registration_id: e.target.value })}
 />
 <div>
 <label className="block text-sm font-medium text-text-base mb-1.5">Gender</label>
 <select
 value={formData.gender}
 onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
 className="w-full px-4 py-2 bg-bg-base border border-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-base "
 >
 <option value="Male">Male</option>
 <option value="Female">Female</option>
 <option value="Other">Other</option>
 </select>
 </div>
 <CustomTextField
 label="Date of Birth"
 type="date"
 value={formData.dob}
 onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
 />
 <div>
 <label className="block text-sm font-medium text-text-base mb-1.5">Assign Batch (Optional)</label>
 <select
 value={formData.batch_id}
 onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
 className="w-full px-4 py-2 bg-bg-base border border-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-base "
 >
 <option value="">None (No Batch)</option>
 {batches.map(b => (
 <option key={b.id} value={b.id}>{b.name}</option>
 ))}
 </select>
 </div>
 <div className="md:col-span-2">
 <CustomTextField
 label="Address"
 placeholder="Full address here..."
 value={formData.address}
 onChange={(e) => setFormData({ ...formData, address: e.target.value })}
 />
 </div>
 </div>
 </div>
 
 <div className="flex justify-end space-x-3 pt-6 border-t border-border-base ">
 <CustomButton variant="secondary" onPressed={closeModal}>Cancel</CustomButton>
 <CustomButton type="submit">{editingStudent ? 'Save Changes' : 'Register Student'}</CustomButton>
 </div>
 </form>
 </Modal>
 </TeacherLayout>
 );
}
