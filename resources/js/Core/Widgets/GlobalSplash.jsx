import React, { useState, useEffect } from 'react';

export default function GlobalSplash() {
    const [show, setShow] = useState(false);
    const [fadingOut, setFadingOut] = useState(false);

    useEffect(() => {
        const hasShown = sessionStorage.getItem('splash_shown');
        if (!hasShown) {
            setShow(true);
            
            // Start fading out at 2000ms
            const fadeTimer = setTimeout(() => {
                setFadingOut(true);
            }, 2000);
            
            // Completely hide at 2500ms
            const hideTimer = setTimeout(() => {
                setShow(false);
                sessionStorage.setItem('splash_shown', 'true');
            }, 2500);
            
            return () => {
                clearTimeout(fadeTimer);
                clearTimeout(hideTimer);
            };
        }
    }, []);

    if (!show) return null;

    return (
        <div className={`fixed inset-0 z-[99999] bg-bg-base flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${fadingOut ? 'opacity-0' : 'opacity-100'}`}>
            <div className={`transform transition-all duration-1000 ease-out ${fadingOut ? 'scale-110 opacity-0' : 'scale-100 opacity-100'}`}>
                <div className="w-48 h-48 sm:w-64 sm:h-64 mb-8 bg-bg-card rounded-3xl shadow-2xl p-6 border border-border-base flex items-center justify-center relative overflow-hidden animate-pulse">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"></div>
                    <img 
                        src="/assets/images/logo.png" 
                        alt="Alpha Graphics Logo" 
                        className="w-full h-full object-contain relative z-10"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                </div>
            </div>
            
            <div className={`flex flex-col items-center transition-all duration-700 delay-300 ${fadingOut ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'}`}>
                <h1 className="text-3xl sm:text-5xl font-black text-text-base tracking-tight mb-3 text-center px-4">Alpha Graphics</h1>
                <p className="text-primary font-bold text-lg sm:text-xl tracking-widest uppercase text-center px-4">Empowering Digital Skills</p>
                
                <div className="mt-12 flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    );
}
