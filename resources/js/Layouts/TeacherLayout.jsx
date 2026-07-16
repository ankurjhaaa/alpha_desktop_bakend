import React, { useState, useEffect, useRef } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    LayoutDashboard, BookOpen, Layers, Users, FileQuestion,
    Database, Trophy, BookText, MessageSquare, Info,
    LogOut, Menu, Bell, Code, Plus, Minus, Laptop, Palette, ArrowLeft, ClipboardList
} from 'lucide-react';
import { cn } from '../Core/utils';

export default function TeacherLayout({ children, title = 'Teacher Dashboard' }) {
    const { url } = usePage();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [zoom, setZoom] = useState(() => {
        const saved = localStorage.getItem('app_zoom');
        return saved ? parseInt(saved, 10) : 100;
    });
    const [sidebarWidth, setSidebarWidth] = useState(() => {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('sidebar_width') : null;
        return saved ? parseInt(saved, 10) : 288;
    });
    const [navbarHeight, setNavbarHeight] = useState(() => {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('navbar_height') : null;
        return saved ? parseInt(saved, 10) : 70;
    });
    const [logoHeight, setLogoHeight] = useState(() => {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('logo_height') : null;
        return saved ? parseInt(saved, 10) : 230;
    });
    const [footerHeight, setFooterHeight] = useState(() => {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('footer_height') : null;
        return saved ? parseInt(saved, 10) : 40;
    });
    const [linkHeight, setLinkHeight] = useState(() => {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('link_height') : null;
        return saved ? parseInt(saved, 10) : 48;
    });

    const isDraggingRef = useRef(false);
    const isDraggingNavbarRef = useRef(false);
    const isDraggingLogoRef = useRef(false);
    const complexDragRef = useRef({ type: null, startY: 0, startHeight: 0 });

    useEffect(() => {
        localStorage.setItem('sidebar_width', sidebarWidth);
    }, [sidebarWidth]);

    useEffect(() => {
        localStorage.setItem('navbar_height', navbarHeight);
    }, [navbarHeight]);

    useEffect(() => {
        localStorage.setItem('logo_height', logoHeight);
    }, [logoHeight]);

    useEffect(() => {
        localStorage.setItem('footer_height', footerHeight);
    }, [footerHeight]);

    useEffect(() => {
        localStorage.setItem('link_height', linkHeight);
    }, [linkHeight]);

    const handleMouseDown = (e) => {
        e.preventDefault();
        isDraggingRef.current = true;
        document.body.style.cursor = 'col-resize';
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
        if (!isDraggingRef.current) return;
        const newWidth = Math.min(Math.max(200, e.clientX), 600);
        setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
        document.body.style.cursor = '';
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    const handleNavbarMouseDown = (e) => {
        e.preventDefault();
        isDraggingNavbarRef.current = true;
        document.body.style.cursor = 'row-resize';
        document.addEventListener('mousemove', handleNavbarMouseMove);
        document.addEventListener('mouseup', handleNavbarMouseUp);
    };

    const handleNavbarMouseMove = (e) => {
        if (!isDraggingNavbarRef.current) return;
        const newHeight = Math.min(Math.max(50, e.clientY), 300);
        setNavbarHeight(newHeight);
    };

    const handleNavbarMouseUp = () => {
        isDraggingNavbarRef.current = false;
        document.body.style.cursor = '';
        document.removeEventListener('mousemove', handleNavbarMouseMove);
        document.removeEventListener('mouseup', handleNavbarMouseUp);
    };

    const handleLogoMouseDown = (e) => {
        e.preventDefault();
        isDraggingLogoRef.current = true;
        document.body.style.cursor = 'row-resize';
        document.addEventListener('mousemove', handleLogoMouseMove);
        document.addEventListener('mouseup', handleLogoMouseUp);
    };

    const handleLogoMouseMove = (e) => {
        if (!isDraggingLogoRef.current) return;
        const newHeight = Math.min(Math.max(80, e.clientY), 500);
        setLogoHeight(newHeight);
    };

    const handleLogoMouseUp = () => {
        isDraggingLogoRef.current = false;
        document.body.style.cursor = '';
        document.removeEventListener('mousemove', handleLogoMouseMove);
        document.removeEventListener('mouseup', handleLogoMouseUp);
    };

    const handleFooterMouseDown = (e) => {
        e.preventDefault();
        complexDragRef.current = { type: 'footer', startY: e.clientY, startHeight: footerHeight };
        document.body.style.cursor = 'row-resize';
        document.addEventListener('mousemove', handleComplexMouseMove);
        document.addEventListener('mouseup', handleComplexMouseUp);
    };

    const handleLinkMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        complexDragRef.current = { type: 'link', startY: e.clientY, startHeight: linkHeight };
        document.body.style.cursor = 'row-resize';
        document.addEventListener('mousemove', handleComplexMouseMove);
        document.addEventListener('mouseup', handleComplexMouseUp);
    };

    const handleComplexMouseMove = (e) => {
        const { type, startY, startHeight } = complexDragRef.current;
        if (type === 'footer') {
            setFooterHeight(Math.max(30, startHeight - (e.clientY - startY)));
        } else if (type === 'link') {
            setLinkHeight(Math.max(30, startHeight + (e.clientY - startY)));
        }
    };

    const handleComplexMouseUp = () => {
        complexDragRef.current = { type: null };
        document.body.style.cursor = '';
        document.removeEventListener('mousemove', handleComplexMouseMove);
        document.removeEventListener('mouseup', handleComplexMouseUp);
    };

    useEffect(() => {
        localStorage.setItem('app_zoom', zoom);
    }, [zoom]);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        const role = localStorage.getItem('user_role');
        if (!token) {
            router.visit('/');
        } else if (role !== 'teacher') {
            router.visit(`/${role}`);
        }
    }, []);

    const userName = typeof window !== 'undefined' ? localStorage.getItem('user_name') || 'Teacher' : 'Teacher';
    const userImage = typeof window !== 'undefined' ? localStorage.getItem('user_profile_image') : null;
    const initial = userName.charAt(0).toUpperCase();

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_role');
        router.visit('/');
    };

    const menuItems = [
        { title: 'Dashboard', icon: LayoutDashboard, href: '/teacher' },
        { title: 'Courses', icon: BookOpen, href: '/teacher/courses' },
        { title: 'Batches', icon: Layers, href: '/teacher/batches' },
        { title: 'Students', icon: Users, href: '/teacher/students' },
        { title: 'Questions', icon: FileQuestion, href: '/teacher/mcq-papers' },
        { title: 'Question Bank', icon: Database, href: '/teacher/question-bank' },
        { title: 'Leaderboard', icon: Trophy, href: '/teacher/leaderboard' },
        { title: 'Results', icon: ClipboardList, href: '/teacher/results' },
        { title: 'Study Materials', icon: BookText, href: '/teacher/materials' },
        { title: 'Student Feedbacks', icon: MessageSquare, href: '/teacher/feedbacks' },
        { title: 'Themes', icon: Palette, href: '/teacher/themes' },
        { title: 'About Us', icon: Info, href: '/teacher/about' },
    ];

    const isActive = (href) => {
        if (href === '/teacher') return url === '/teacher';
        return url.startsWith(href);
    };

    const Sidebar = () => (
        <div className="w-full bg-bg-card border-r border-border-base h-full flex flex-col transition-colors">
            <div className="border-b border-border-base flex flex-col items-center justify-center relative shrink-0" style={{ height: logoHeight }}>
                <div className="w-full h-full p-6 flex items-center justify-center overflow-hidden">
                    <img src="/assets/images/logo.png" alt="Logo" className="w-full h-full object-contain" onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                    }} />
                    <Laptop className="w-16 h-16 text-primary hidden" />
                </div>
                <div 
                    className="absolute bottom-0 -mb-1 left-0 w-full h-2 cursor-row-resize hover:bg-primary/50 z-50 transition-colors"
                    onMouseDown={handleLogoMouseDown}
                />
            </div>
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                {menuItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <div key={item.title} className="relative group">
                            <Link
                                href={item.href}
                                style={{ height: linkHeight }}
                                className={cn(
                                    "flex items-center space-x-4 px-4 rounded-md transition-colors",
                                    active
                                        ? "bg-primary-light text-primary font-semibold"
                                        : "text-text-muted hover:bg-bg-hover hover:text-text-base font-medium"
                                )}
                            >
                                <item.icon className="w-5 h-5 shrink-0" />
                                <span>{item.title}</span>
                            </Link>
                            <div 
                                className="absolute bottom-0 left-0 w-full h-2 cursor-row-resize opacity-0 group-hover:opacity-100 group-hover:delay-[5000ms] transition-opacity duration-300 bg-primary/20 hover:bg-primary/50 z-50"
                                onMouseDown={handleLinkMouseDown}
                            />
                        </div>
                    );
                })}
            </div>
            <div className="p-4">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-4 px-4 py-3 rounded-md bg-danger-light text-danger-text font-medium hover:bg-danger-hover hover:text-white transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-bg-base overflow-hidden transition-colors relative">
            {/* Global Watermark */}
            <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center opacity-5">
                <img src="/assets/images/logo.png" alt="Watermark" className="w-[400px] md:w-[600px] lg:w-[800px] h-auto object-contain grayscale" />
            </div>
            <div className="hidden lg:block h-full relative shrink-0" style={{ width: sidebarWidth }}>
                <Sidebar />
                <div 
                    className="absolute top-0 -right-1 w-2 h-full cursor-col-resize hover:bg-primary/50 z-50 transition-colors"
                    onMouseDown={handleMouseDown}
                />
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
                <header className="bg-bg-card border-b border-border-base flex items-center justify-between px-6 shrink-0 transition-colors relative" style={{ height: navbarHeight }}>
                    <div className="flex items-center space-x-4">
                        <button className="lg:hidden text-text-muted" onClick={() => setIsSidebarOpen(true)}>
                            <Menu className="w-6 h-6" />
                        </button>
                        <button 
                            onClick={() => window.history.back()} 
                            className="flex p-2 -ml-2 text-text-muted hover:bg-bg-hover hover:text-text-base rounded-full transition-colors"
                            title="Go Back"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-bold text-text-base truncate">
                            {title}
                        </h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={handleLogout}
                            className="flex items-center space-x-2 px-3 py-2 text-danger-text hover:bg-danger-light rounded-md transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-semibold text-sm">Logout</span>
                        </button>
                    </div>
                    <div 
                        className="absolute bottom-0 -mb-1 left-0 w-full h-2 cursor-row-resize hover:bg-primary/50 z-50 transition-colors"
                        onMouseDown={handleNavbarMouseDown}
                    />
                </header>

                <main className="flex-1 overflow-y-auto p-6" style={{ zoom: `${zoom}%` }}>
                    {children}
                </main>

                <footer className="bg-bg-card border-t border-border-base flex items-center justify-between px-6 shrink-0 text-sm text-text-muted transition-colors relative" style={{ height: footerHeight }}>
                    <div 
                        className="absolute top-0 -mt-1 left-0 w-full h-2 cursor-row-resize hover:bg-primary/50 z-50 transition-colors"
                        onMouseDown={handleFooterMouseDown}
                    />
                    <div className="w-24 hidden md:block" />
                    <div className="flex items-center space-x-2 font-medium">
                        <Code className="w-4 h-4" />
                        <span>Developed by Brolytics Technologies</span>
                    </div>
                    <div className="flex items-center space-x-3 w-24 justify-end">
                        <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="hover:text-text-base"><Minus className="w-4 h-4" /></button>
                        <span className="font-bold">{zoom}%</span>
                        <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="hover:text-text-base"><Plus className="w-4 h-4" /></button>
                    </div>
                </footer>
            </div>
        </div>
    );
}
