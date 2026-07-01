import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { cn } from '../utils';

export default function ThemeToggleButton({ className }) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
            setIsDark(true);
        }
    };

    return (
        <button
            onClick={toggleTheme}
            className={cn(
                "p-3 rounded-full bg-slate-200/50 hover:bg-slate-300/50 text-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-700/50 dark:text-white backdrop-blur-md transition-all duration-200 shadow-sm",
                className
            )}
            title="Toggle Theme"
        >
            {isDark ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
        </button>
    );
}
