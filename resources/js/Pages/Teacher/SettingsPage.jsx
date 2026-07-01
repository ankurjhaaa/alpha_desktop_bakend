import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import TeacherLayout from '../../Layouts/TeacherLayout';
import CustomButton from '../../Core/Widgets/CustomButton';
import CustomTextField from '../../Core/Widgets/CustomTextField';
import { Save, Settings as SettingsIcon, Image as ImageIcon, Briefcase } from 'lucide-react';
import axios from 'axios';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        company_name: '',
        company_email: '',
        company_phone: '',
        company_address: '',
        logo_url: '',
        signature_url: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            try {
                const res = await axios.get('/api/settings', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSettings({
                    company_name: res.data.company_name || '',
                    company_email: res.data.company_email || '',
                    company_phone: res.data.company_phone || '',
                    company_address: res.data.company_address || '',
                    logo_url: res.data.logo_url || '',
                    signature_url: res.data.signature_url || ''
                });
            } catch (error) {
                console.error("Error fetching settings", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const token = localStorage.getItem('auth_token');

        try {
            await axios.post('/api/settings', settings, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            alert("Settings updated successfully!");
        } catch (error) {
            console.error("Error updating settings", error);
            alert("Failed to update settings");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <TeacherLayout title="Platform Settings">
            <Head title="Settings" />

            <div className="max-w-7xl mx-auto">
                {isLoading ? (
                    <div className="flex justify-center items-center py-24">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="space-y-6">

                        <div className="bg-bg-card rounded-md shadow-sm border border-border-base overflow-hidden transition-colors">
                            <div className="p-6 border-b border-border-base bg-bg-base flex items-center">
                                <Briefcase className="w-5 h-5 mr-3 text-primary " />
                                <div>
                                    <h2 className="text-xl font-bold text-text-base ">Global Settings</h2>
                                    <p className="text-sm text-text-muted mt-1">Configure branding and global details used across the platform.</p>
                                </div>
                            </div>

                            <div className="p-6 sm:p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <CustomTextField
                                        label="Company Name"
                                        value={settings.company_name}
                                        onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                                    />
                                    <CustomTextField
                                        label="Company Email"
                                        type="email"
                                        value={settings.company_email}
                                        onChange={(e) => setSettings({ ...settings, company_email: e.target.value })}
                                    />
                                    <CustomTextField
                                        label="Company Phone"
                                        value={settings.company_phone}
                                        onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
                                    />
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-text-base mb-1.5">Company Address</label>
                                        <textarea
                                            className="w-full px-4 py-2 bg-bg-base border border-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text-base "
                                            rows="2"
                                            value={settings.company_address}
                                            onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-bg-card rounded-md shadow-sm border border-border-base overflow-hidden transition-colors">
                            <div className="p-6 border-b border-border-base bg-bg-base flex items-center">
                                <ImageIcon className="w-5 h-5 mr-3 text-primary " />
                                <div>
                                    <h2 className="text-xl font-bold text-text-base ">Media URLs</h2>
                                    <p className="text-sm text-text-muted mt-1">Links to assets used for branding and PDFs.</p>
                                </div>
                            </div>

                            <div className="p-6 sm:p-8 space-y-6">
                                <CustomTextField
                                    label="Logo URL"
                                    value={settings.logo_url}
                                    onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                                />
                                <CustomTextField
                                    label="Signature URL"
                                    value={settings.signature_url}
                                    onChange={(e) => setSettings({ ...settings, signature_url: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <CustomButton type="submit" disabled={isSaving} icon={Save} className="w-full sm:w-auto px-8 py-3 text-lg">
                                {isSaving ? 'Saving...' : 'Save Settings'}
                            </CustomButton>
                        </div>
                    </form>
                )}
            </div>
        </TeacherLayout>
    );
}
