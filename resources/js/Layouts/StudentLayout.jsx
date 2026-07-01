import React, { useState, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { 
    LayoutDashboard, BookOpen, Trophy, BookText, 
    MessageSquare, Info, LogOut, Menu, Bell, Code, 
    Plus, Minus, User, Laptop
} from 'lucide-react';
import ThemeToggleButton from '../Core/Widgets/ThemeToggleButton';
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
        { title: 'About Us', icon: Info, href: '/student/about' },
    ];

    const isActive = (href) => {
        if (href === '/student') return url === '/student';
        return url.startsWith(href);
    };

    const Sidebar = () => (
        <div className="w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 h-full flex flex-col transition-colors">
            <div className="py-8 border-b border-slate-200 dark:border-slate-700 flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-white border-2 border-blue-100 shadow-lg flex items-center justify-center p-2 overflow-hidden mb-4">
                    <img src="/assets/images/logo.png" alt="Logo" className="w-full h-full object-contain" onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                    }} />
                    <User className="w-16 h-16 text-blue-600 hidden" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Alpha Graphics</h2>
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
                                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold" 
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200 font-medium"
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
                    className="w-full flex items-center space-x-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-[#0F172A] overflow-hidden transition-colors">
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
                <header className="h-[70px] bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 shrink-0 transition-colors">
                    <div className="flex items-center space-x-4">
                        <button className="lg:hidden text-slate-600 dark:text-slate-300" onClick={() => setIsSidebarOpen(true)}>
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white truncate">
                            {title}
                        </h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <ThemeToggleButton />
                        <button className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                            <Bell className="w-6 h-6" />
                        </button>
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-lg">
                            {initial}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6" style={{ zoom: `${zoom}%` }}>
                    {children}
                </main>

                <footer className="h-10 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 shrink-0 text-sm text-slate-500 dark:text-slate-400 transition-colors">
                    <div className="w-24 hidden md:block" />
                    <div className="flex items-center space-x-2 font-medium">
                        <Code className="w-4 h-4" />
                        <span>Developed by Brotytics Technologies</span>
                    </div>
                    <div className="flex items-center space-x-3 w-24 justify-end">
                        <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="hover:text-slate-900 dark:hover:text-white"><Minus className="w-4 h-4" /></button>
                        <span className="font-bold">{zoom}%</span>
                        <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="hover:text-slate-900 dark:hover:text-white"><Plus className="w-4 h-4" /></button>
                    </div>
                </footer>
            </div>
        </div>
    );
}
