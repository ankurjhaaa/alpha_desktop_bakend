import React, { useState, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    LayoutDashboard, BookOpen, Trophy, BookText,
    MessageSquare, Info, LogOut, Menu, Bell, Code,
    Plus, Minus, User, Laptop, Palette
} from 'lucide-react';
import { cn } from '../Core/utils';

export default function StudentLayout({ children, title = 'Student Dashboard' }) {
    const { url } = usePage();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [zoom, setZoom] = useState(() => {
        const saved = localStorage.getItem('app_zoom');
        return saved ? parseInt(saved, 10) : 100;
    });

    useEffect(() => {
        localStorage.setItem('app_zoom', zoom);
    }, [zoom]);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        const role = localStorage.getItem('user_role');
        if (!token) {
            router.visit('/');
        } else if (role !== 'student') {
            router.visit(`/${role}`);
        }
    }, []);

    const userName = typeof window !== 'undefined' ? localStorage.getItem('user_name') || 'Student' : 'Student';
    const initial = userName.charAt(0).toUpperCase();

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_role');
        router.visit('/');
    };

    const menuItems = [
        { title: 'Dashboard', icon: LayoutDashboard, href: '/student' },
        { title: 'Exams', icon: BookOpen, href: '/student/exams' },
        { title: 'Study Materials', icon: BookText, href: '/student/materials' },
        { title: 'Feedbacks', icon: MessageSquare, href: '/student/feedbacks' },
        { title: 'Leaderboard', icon: Trophy, href: '/student/leaderboard' },
        { title: 'My Profile', icon: User, href: '/student/profile' },
        { title: 'Themes', icon: Palette, href: '/student/themes' },
        { title: 'About Us', icon: Info, href: '/student/about' },
    ];

    const isActive = (href) => {
        if (href === '/student') return url === '/student';
        return url.startsWith(href);
    };

    const Sidebar = () => (
        <div className="w-72 bg-bg-card border-r border-border-base h-full flex flex-col transition-colors">
            <div className="py-8 border-b border-border-base flex flex-col items-center">
                <div className="w-40 h-40 flex items-center justify-center overflow-hidden mb-4">
                    <img src="/assets/images/logo.png" alt="Logo" className="w-full h-full object-contain" onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                    }} />
                    <User className="w-16 h-16 text-primary hidden" />
                </div>
                <h2 className="text-xl font-bold text-text-base ">Alpha Graphics</h2>
            </div>
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                {menuItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.title}
                            href={item.href}
                            className={cn(
                                "flex items-center space-x-4 px-4 py-3 rounded-lg transition-colors",
                                active
                                    ? "bg-primary-light text-primary-hover font-semibold"
                                    : "text-text-muted hover:bg-bg-base hover:text-text-base font-medium"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.title}</span>
                        </Link>
                    );
                })}
            </div>
            <div className="p-4">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-4 px-4 py-3 rounded-lg bg-danger-light text-danger-text font-medium hover:bg-danger-hover hover:text-white transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-bg-base [#0F172A] overflow-hidden transition-colors">
            <div className="hidden lg:block h-full">
                <Sidebar />
            </div>

            {isSidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
                    <div className="fixed inset-y-0 left-0 w-72 z-50 transform transition-transform duration-300">
                        <Sidebar />
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <header className="h-[70px] bg-bg-card border-b border-border-base flex items-center justify-between px-6 shrink-0 transition-colors">
                    <div className="flex items-center space-x-4">
                        <button className="lg:hidden text-text-muted " onClick={() => setIsSidebarOpen(true)}>
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-bold text-text-base truncate">
                            {title}
                        </h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="p-2 text-text-muted hover:bg-bg-hover rounded-full transition-colors">
                            <Bell className="w-6 h-6" />
                        </button>
                        <div className="w-10 h-10 rounded-full bg-primary-light-hover flex items-center justify-center text-primary-hover font-bold text-lg">
                            {initial}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6" style={{ zoom: `${zoom}%` }}>
                    {children}
                </main>

                <footer className="h-10 bg-bg-card border-t border-border-base flex items-center justify-between px-6 shrink-0 text-sm text-text-muted transition-colors">
                    <div className="w-24 hidden md:block" />
                    <div className="flex items-center space-x-2 font-medium">
                        <Code className="w-4 h-4" />
                        <span>Developed by Brotytics Technologies</span>
                    </div>
                    <div className="flex items-center space-x-3 w-24 justify-end">
                        <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="hover:text-text-base "><Minus className="w-4 h-4" /></button>
                        <span className="font-bold">{zoom}%</span>
                        <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="hover:text-text-base "><Plus className="w-4 h-4" /></button>
                    </div>
                </footer>
            </div>
        </div>
    );
}
