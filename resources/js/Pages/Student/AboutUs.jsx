import React from 'react';
import { Head } from '@inertiajs/react';
import StudentLayout from '../../Layouts/StudentLayout';
import { Info, Mail, Phone, Globe, MapPin } from 'lucide-react';

export default function AboutUs() {
    return (
        <StudentLayout title="About Us">
            <Head title="About Us" />

            <div className="max-w-7xl mx-auto">
                <div className="bg-bg-card rounded-md shadow-sm border border-border-base overflow-hidden transition-colors">

                    <div className="h-48 bg-gradient-to-r from-primary to-primary-hover flex flex-col items-center justify-center text-white p-6 text-center">
                        <div className="w-20 h-20 bg-bg-card p-2 rounded-md shadow-lg mb-4 flex items-center justify-center">
                            <img src="/assets/images/logo.png" alt="Alpha Graphics" className="max-w-full max-h-full object-contain" onError={(e) => {
                                e.target.style.display = 'none';
                            }} />
                            <Info className="w-8 h-8 text-primary hidden" />
                        </div>
                        <h1 className="text-3xl font-bold">Alpha Graphics</h1>
                        <p className="text-primary-light mt-2">Empowering Education through Technology</p>
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="prose prose-slate max-w-none mb-12">
                            <h2 className="text-2xl font-bold text-text-base mb-4">Our Mission</h2>
                            <p className="text-text-muted leading-relaxed text-lg mb-6">
                                Alpha Graphics is dedicated to revolutionizing the learning experience by providing state-of-the-art digital tools for educators and students. We believe in creating seamless, interactive, and accessible educational environments that foster growth, collaboration, and excellence.
                            </p>

                            <h2 className="text-2xl font-bold text-text-base mb-4">Key Features</h2>
                            <ul className="space-y-3 text-text-muted text-lg">
                                <li className="flex items-center"><span className="w-2 h-2 bg-primary rounded-full mr-3"></span> Comprehensive Course & Batch Management</li>
                                <li className="flex items-center"><span className="w-2 h-2 bg-primary rounded-full mr-3"></span> Advanced MCQ Examination Engine</li>
                                <li className="flex items-center"><span className="w-2 h-2 bg-primary rounded-full mr-3"></span> Real-time Leaderboards & Analytics</li>
                                <li className="flex items-center"><span className="w-2 h-2 bg-primary rounded-full mr-3"></span> Secure Study Material Distribution</li>
                            </ul>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-border-base ">
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-primary-light rounded-md flex items-center justify-center text-primary flex-shrink-0">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-text-base mb-1">Office Location</h4>
                                    <p className="text-text-muted ">123 Tech Park Avenue<br />Silicon Valley, CA 94025</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-primary-light rounded-md flex items-center justify-center text-primary flex-shrink-0">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-text-base mb-1">Contact Phone</h4>
                                    <p className="text-text-muted ">+1 (555) 123-4567<br />Mon-Fri, 9am - 5pm</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-primary-light rounded-md flex items-center justify-center text-primary flex-shrink-0">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-text-base mb-1">Email Support</h4>
                                    <p className="text-text-muted ">support@alphagraphics.com<br />contact@alphagraphics.com</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-primary-light rounded-md flex items-center justify-center text-primary flex-shrink-0">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-text-base mb-1">Website</h4>
                                    <p className="text-text-muted ">www.alphagraphics.com<br />portal.alphagraphics.com</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-border-base text-center">
                            <p className="text-text-muted font-medium">
                                Developed with ❤️ by Brotytics Technologies
                            </p>
                            <p className="text-sm text-text-muted mt-2">
                                Version 1.0.0
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
