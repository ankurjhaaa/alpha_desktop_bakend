import React from 'react';
import { Head } from '@inertiajs/react';
import TeacherLayout from '../../Layouts/TeacherLayout';
import { CheckCircle, Info, Mail, Phone, Globe, MapPin, User, Layout, Shield, Target, Heart } from 'lucide-react';

export default function AboutUs() {
    return (
        <TeacherLayout title="About Alpha Graphics">
            <Head title="About Us" />

            <div className="max-w-5xl mx-auto space-y-6 pb-12">
                
                {/* Header Card */}
                <div className="bg-bg-card rounded-xl shadow-sm border border-border-base p-8 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        
                        <div className="flex items-center space-x-6">
                            <div className="w-[90px] h-[90px] bg-bg-base p-2 rounded-lg shadow-sm border border-border-base flex items-center justify-center flex-shrink-0">
                                <img src="/assets/images/logo.png" alt="Alpha Graphics Logo" className="max-w-full max-h-full object-contain" />
                            </div>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-black text-text-base tracking-tight mb-2">About Alpha Graphics</h1>
                                <p className="text-primary font-bold text-lg">Empowering Digital Skills Since 2004</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="w-[130px] h-[160px] bg-bg-base rounded-md shadow-md border-2 border-primary/20 overflow-hidden mb-3">
                                <img src="/assets/images/director.png" alt="Director" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                            </div>
                            <h3 className="text-base font-bold text-text-base">[Director Name]</h3>
                            <p className="text-sm text-text-muted font-medium">Director, Alpha Graphics</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        
                        <div className="bg-bg-card rounded-xl shadow-sm border border-border-base p-8 h-full">
                            <h2 className="text-xl font-bold text-text-base mb-4 flex items-center">
                                <Info className="w-5 h-5 mr-2 text-primary" /> Overview
                            </h2>
                            <div className="space-y-4 text-text-muted leading-relaxed">
                                <p>
                                    Alpha Graphics is a leading Computer Training Institute established in 2004 and registered under the Government of India. For over two decades, we have been dedicated to providing quality computer education and helping students build successful careers in today's digital world.
                                </p>
                                <p>
                                    Our training programs are designed to combine practical knowledge with industry-relevant skills, ensuring that students are well prepared for employment, higher education, and professional growth. We strive to create a supportive learning environment where every student can develop confidence, technical expertise, and problem-solving abilities.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-primary/5 rounded-xl shadow-sm border border-primary/20 p-6 h-full">
                            <h2 className="text-lg font-bold text-primary mb-3 flex items-center">
                                <User className="w-5 h-5 mr-2" /> About the Director
                            </h2>
                            <p className="text-sm text-text-base leading-relaxed font-medium">
                                Mr. [Director Name], Director of Alpha Graphics, has been instrumental in shaping the institute's vision of delivering quality computer education. Under his leadership, Alpha Graphics has continuously focused on practical learning, skill development, and career-oriented training. His commitment to academic excellence and student success has helped the institute earn the trust of thousands of students over the years.
                            </p>
                        </div>
                    </div>
                </div>

                {/* App Info row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="bg-bg-card rounded-xl shadow-sm border border-border-base p-8 h-full">
                            <h2 className="text-xl font-bold text-text-base mb-4 flex items-center">
                                <Layout className="w-5 h-5 mr-2 text-primary" /> About This Desktop Application
                            </h2>
                            <div className="space-y-4 text-text-muted leading-relaxed">
                                <p>
                                    The Alpha Graphics Desktop Application has been developed to simplify and manage the institute's academic and administrative activities in a secure, fast, and user-friendly way. It is designed to support students, teachers, and administrators by providing a centralized platform for tests, results, and institute operations.
                                </p>
                                <p>
                                    This application helps improve efficiency, reduce manual work, and deliver a smooth digital experience for daily academic use.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="bg-bg-card rounded-xl shadow-sm border border-border-base p-6 h-full">
                            <h2 className="text-lg font-bold text-text-base mb-4 flex items-center">
                                <Shield className="w-5 h-5 mr-2 text-primary" /> Why Choose Us?
                            </h2>
                            <ul className="space-y-3">
                                {[
                                    'Experienced & Qualified Faculty',
                                    'Industry-Oriented Practical Training',
                                    'Modern Computer Labs & Resources',
                                    'Student-Centered Teaching',
                                    'Regular Assessments',
                                    'Career Guidance Support',
                                    'Friendly Learning Environment',
                                    '20+ Years of Excellence'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start">
                                        <CheckCircle className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-text-muted">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Key Features */}
                <div className="bg-bg-card rounded-xl shadow-sm border border-border-base p-8">
                    <h2 className="text-xl font-bold text-text-base mb-6">Key Features</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            'Student Login & Secure Authentication',
                            'Test & Examination Management',
                            'Subject-wise & Course-wise Assessments',
                            'Automatic Result Generation',
                            'Performance Tracking & Reports',
                            'Admin Dashboard for Management',
                            'Easy-to-Use Desktop Interface',
                            'Fast, Reliable & Secure Operation',
                            'Academic Record Management',
                            'Better Organization of Activities'
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center p-3 bg-bg-base rounded-md border border-border-base">
                                <div className="w-2 h-2 rounded-full bg-primary mr-3 flex-shrink-0" />
                                <span className="text-sm font-medium text-text-base">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mission & Vision */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-bg-card rounded-xl shadow-sm border border-border-base p-8 border-t-4 border-t-primary">
                        <h2 className="text-xl font-bold text-text-base mb-3 flex items-center">
                            <Target className="w-5 h-5 mr-2 text-primary" /> Our Mission
                        </h2>
                        <p className="text-text-muted leading-relaxed">
                            To provide high-quality, affordable, and practical computer education that empowers students with the knowledge and skills required to succeed in today's competitive technology-driven world.
                        </p>
                    </div>
                    <div className="bg-bg-card rounded-xl shadow-sm border border-border-base p-8 border-t-4 border-t-primary">
                        <h2 className="text-xl font-bold text-text-base mb-3 flex items-center">
                            <Globe className="w-5 h-5 mr-2 text-primary" /> Our Vision
                        </h2>
                        <p className="text-text-muted leading-relaxed">
                            To become one of the most trusted and recognized computer training institutes by delivering excellence in education, promoting innovation, and preparing students for successful careers in the IT industry.
                        </p>
                    </div>
                </div>

                {/* App Info & Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-bg-card rounded-xl shadow-sm border border-border-base p-8">
                        <h2 className="text-xl font-bold text-text-base mb-5">Application Information</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between border-b border-border-base pb-2">
                                <span className="text-text-muted">Application Name</span>
                                <span className="font-semibold text-text-base text-right">Alpha Graphics Desktop Application</span>
                            </div>
                            <div className="flex justify-between border-b border-border-base pb-2">
                                <span className="text-text-muted">Version</span>
                                <span className="font-semibold text-text-base">1.0.0</span>
                            </div>
                            <div className="flex justify-between border-b border-border-base pb-2">
                                <span className="text-text-muted">Platform</span>
                                <span className="font-semibold text-text-base">Windows Desktop</span>
                            </div>
                            <div className="flex justify-between border-b border-border-base pb-2">
                                <span className="text-text-muted">Purpose</span>
                                <span className="font-semibold text-text-base text-right">Test Management & Institute Administration</span>
                            </div>
                            <div className="flex justify-between pt-1">
                                <span className="text-text-muted">Developer</span>
                                <span className="font-semibold text-text-base">Brolytics Technologies</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-bg-card rounded-xl shadow-sm border border-border-base p-8">
                        <h2 className="text-xl font-bold text-text-base mb-5">Contact & Support</h2>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <MapPin className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-text-base">Alpha Graphics</h4>
                                    <p className="text-sm text-text-muted">Patna, Bihar, India</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Mail className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                                <span className="text-sm text-text-base font-medium">[Institute Email]</span>
                            </div>
                            <div className="flex items-center">
                                <Phone className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                                <span className="text-sm text-text-base font-medium">[Contact Number]</span>
                            </div>
                            <div className="flex items-center">
                                <Globe className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                                <span className="text-sm text-text-base font-medium">[Website URL]</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Our Commitment */}
                <div className="bg-primary-light-hover/30 rounded-xl border border-primary-light p-8 text-center mt-4">
                    <Heart className="w-8 h-8 text-primary mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-text-base mb-3">Our Commitment</h2>
                    <p className="text-text-base font-medium leading-relaxed max-w-4xl mx-auto">
                        At Alpha Graphics, we believe that education is the foundation of success. Our commitment is to inspire learners, encourage continuous improvement, and equip every student with the confidence and technical skills needed to achieve their professional goals.
                    </p>
                </div>

                {/* Developed By */}
                <div className="bg-bg-card rounded-xl shadow-sm border border-border-base p-8 mt-8">
                    <h2 className="text-2xl font-black text-text-base mb-4 text-center">Developed By Brolytics Technologies</h2>
                    <div className="max-w-4xl mx-auto text-center space-y-4 text-text-muted leading-relaxed">
                        <p>
                            This desktop application is proudly developed by Brolytics Technologies, a software development company dedicated to delivering innovative, secure, and user-friendly digital solutions for education and business.
                        </p>
                        <p>
                            Brolytics Technologies specializes in developing modern desktop applications, web applications, mobile applications, ERP systems, and customized software solutions that improve productivity, streamline operations, and enhance user experience.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 pt-4">
                            <a href="mailto:[Brolytics Email]" className="flex items-center text-primary hover:underline font-medium">
                                <Mail className="w-4 h-4 mr-2" /> [Brolytics Email]
                            </a>
                            <a href="https://[Brolytics Website URL]" target="_blank" rel="noopener noreferrer" className="flex items-center text-primary hover:underline font-medium">
                                <Globe className="w-4 h-4 mr-2" /> [Brolytics Website URL]
                            </a>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="pt-8 text-center pb-4">
                    <p className="text-text-muted font-medium">
                        © 2026 Alpha Graphics. All Rights Reserved.
                    </p>
                    <p className="text-sm text-text-muted mt-1">
                        Developed by Brolytics Technologies.
                    </p>
                </div>

            </div>
        </TeacherLayout>
    );
}
