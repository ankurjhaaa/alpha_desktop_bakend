import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [themeName, setThemeName] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('app_theme') || 'light';
        }
        return 'light';
    });

    const themes = [
        'light', 'dark', 'monochrome', 'ocean', 
        'rose', 'emerald', 'purple', 'sunset', 
        'forest', 'midnight'
    ];

    useEffect(() => {
        const root = document.documentElement;
        // Apply the data-theme attribute
        root.setAttribute('data-theme', themeName);
        localStorage.setItem('app_theme', themeName);
    }, [themeName]);

    return (
        <ThemeContext.Provider value={{ themeName, setThemeName, themes }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
