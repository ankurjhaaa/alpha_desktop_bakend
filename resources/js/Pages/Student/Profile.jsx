import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import StudentLayout from '../../Layouts/StudentLayout';
import CustomButton from '../../Core/Widgets/CustomButton';
import CustomTextField from '../../Core/Widgets/CustomTextField';
import { User, Lock, Save, KeyRound } from 'lucide-react';
import axios from 'axios';

export default function Profile() {
 const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
 const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' });
 const [isLoading, setIsLoading] = useState(true);
 const [isSaving, setIsSaving] = useState(false);
 const [isSavingPassword, setIsSavingPassword] = useState(false);

 useEffect(() => {
 const fetchProfile = async () => {
 const token = localStorage.getItem('auth_token');
 if (!token) return;

 try {
 // Fetch profile data. Note: endpoints might differ
 const res = await axios.get('/api/user', {
 headers: { Authorization: `Bearer ${token}` }
 });
 setProfile({
 name: res.data.name || '',
 email: res.data.email || '',
 phone: res.data.phone || ''
 });
 } catch (error) {
 console.error("Error fetching profile", error);
 // Mock for display if endpoint missing
 setProfile({ name: localStorage.getItem('user_name') || '', email: 'student@example.com', phone: '' });
 } finally {
 setIsLoading(false);
 }
 };

 fetchProfile();
 }, []);

 const handleUpdateProfile = async (e) => {
 e.preventDefault();
 setIsSaving(true);
 const token = localStorage.getItem('auth_token');
 
 try {
 await axios.put('/api/user/profile', profile, {
 headers: { Authorization: `Bearer ${token}` }
 });
 localStorage.setItem('user_name', profile.name);
 alert("Profile updated successfully!");
 } catch (error) {
 console.error("Error updating profile", error);
 alert(error.response?.data?.message || 'Failed to update profile');
 } finally {
 setIsSaving(false);
 }
 };

 const handleUpdatePassword = async (e) => {
 e.preventDefault();
 if (passwords.new_password !== passwords.confirm_password) {
 return alert("New passwords do not match!");
 }

 setIsSavingPassword(true);
 const token = localStorage.getItem('auth_token');
 
 try {
 await axios.put('/api/user/password', passwords, {
 headers: { Authorization: `Bearer ${token}` }
 });
 alert("Password updated successfully!");
 setPasswords({ current_password: '', new_password: '', confirm_password: '' });
 } catch (error) {
 console.error("Error updating password", error);
 alert(error.response?.data?.message || 'Failed to update password');
 } finally {
 setIsSavingPassword(false);
 }
 };

 if (isLoading) {
 return (
 <StudentLayout title="My Profile">
 <div className="flex justify-center items-center py-24">
 <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
 </div>
 </StudentLayout>
 );
 }

 return (
 <StudentLayout title="My Profile">
 <Head title="Profile" />

 <div className="max-w-3xl mx-auto space-y-6">
 
 {/* Profile Information */}
 <div className="bg-bg-card rounded-2xl shadow-sm border border-border-base overflow-hidden transition-colors">
 <div className="p-6 border-b border-border-base bg-bg-base flex items-center">
 <User className="w-5 h-5 mr-3 text-primary " />
 <h2 className="text-xl font-bold text-text-base ">Personal Information</h2>
 </div>
 
 <form onSubmit={handleUpdateProfile} className="p-6 sm:p-8 space-y-6">
 <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-border-base ">
 <div className="w-24 h-24 rounded-full bg-primary-light-hover flex items-center justify-center text-primary-hover text-3xl font-bold border-4 border-white shadow-sm">
 {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
 </div>
 <div>
 <h3 className="text-xl font-bold text-text-base ">{profile.name || 'Student'}</h3>
 <p className="text-text-muted ">Student Account</p>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <CustomTextField
 label="Full Name"
 value={profile.name}
 onChange={(e) => setProfile({ ...profile, name: e.target.value })}
 required
 />
 <CustomTextField
 label="Email Address"
 type="email"
 value={profile.email}
 onChange={(e) => setProfile({ ...profile, email: e.target.value })}
 required
 />
 <CustomTextField
 label="Phone Number"
 value={profile.phone}
 onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
 />
 </div>

 <div className="flex justify-end pt-4">
 <CustomButton type="submit" disabled={isSaving} icon={Save}>
 {isSaving ? 'Saving...' : 'Save Changes'}
 </CustomButton>
 </div>
 </form>
 </div>

 {/* Password Change */}
 <div className="bg-bg-card rounded-2xl shadow-sm border border-border-base overflow-hidden transition-colors">
 <div className="p-6 border-b border-border-base bg-bg-base flex items-center">
 <KeyRound className="w-5 h-5 mr-3 text-danger-text " />
 <h2 className="text-xl font-bold text-text-base ">Security & Password</h2>
 </div>
 
 <form onSubmit={handleUpdatePassword} className="p-6 sm:p-8 space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <CustomTextField
 label="Current Password"
 type="password"
 value={passwords.current_password}
 onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
 required
 />
 <div className="hidden md:block"></div>
 <CustomTextField
 label="New Password"
 type="password"
 value={passwords.new_password}
 onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
 required
 />
 <CustomTextField
 label="Confirm New Password"
 type="password"
 value={passwords.confirm_password}
 onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
 required
 />
 </div>

 <div className="flex justify-end pt-4">
 <CustomButton type="submit" disabled={isSavingPassword || !passwords.new_password} icon={Lock}>
 {isSavingPassword ? 'Updating...' : 'Update Password'}
 </CustomButton>
 </div>
 </form>
 </div>

 </div>
 </StudentLayout>
 );
}
