import React from 'react';
import { useTheme } from '../../Core/Providers/ThemeProvider';
import TeacherLayout from '../../Layouts/TeacherLayout';
import { Check, Palette } from 'lucide-react';
import { cn } from '../../Core/utils';

export default function ThemeSettings() {
    const { themeName, setThemeName, themes } = useTheme();

    // Tailwind v4 @theme variables resolve at the :root level. 
    // To show accurate previews, we must map the colors explicitly here.
    const themeColors = {
        light: { base: '#f8fafc', primary: '#2563eb', card: '#ffffff', sidebar: '#ffffff', text: '#0f172a', muted: '#64748b' },
        dark: { base: '#09090b', primary: '#fafafa', card: '#18181b', sidebar: '#18181b', text: '#fafafa', muted: '#a1a1aa' },
        monochrome: { base: '#ffffff', primary: '#000000', card: '#ffffff', sidebar: '#f4f4f5', text: '#000000', muted: '#52525b' },
        ocean: { base: '#f0f9ff', primary: '#0284c7', card: '#ffffff', sidebar: '#f0f9ff', text: '#0c4a6e', muted: '#0369a1' },
        rose: { base: '#fff1f2', primary: '#e11d48', card: '#ffffff', sidebar: '#fff1f2', text: '#881337', muted: '#be123c' },
        emerald: { base: '#ecfdf5', primary: '#059669', card: '#ffffff', sidebar: '#ecfdf5', text: '#064e3b', muted: '#047857' },
        purple: { base: '#faf5ff', primary: '#9333ea', card: '#ffffff', sidebar: '#faf5ff', text: '#581c87', muted: '#7e22ce' },
        sunset: { base: '#fff7ed', primary: '#ea580c', card: '#ffffff', sidebar: '#fff7ed', text: '#9a3412', muted: '#c2410c' },
        forest: { base: '#052e16', primary: '#4ade80', card: '#14532d', sidebar: '#14532d', text: '#f0fdf4', muted: '#bbf7d0' },
        midnight: { base: '#020617', primary: '#fbbf24', card: '#0f172a', sidebar: '#0f172a', text: '#f8fafc', muted: '#cbd5e1' },
    };

    return (
        <TeacherLayout title="Theme Settings">
            <div className="max-w-6xl mx-auto">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {themes.map((theme) => {
                        const isSelected = theme === themeName;
                        const colors = themeColors[theme] || themeColors.light;

                        return (
                            <button
                                key={theme}
                                onClick={() => setThemeName(theme)}
                                className={cn(
                                    "flex flex-col text-left rounded-2xl border-2 transition-all overflow-hidden bg-bg-card hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-primary/20",
                                    isSelected ? "border-primary shadow-md" : "border-border-base hover:border-primary-light-hover"
                                )}
                            >
                                {/* Mini Preview */}
                                <div className="h-40 w-full relative border-b border-border-base" style={{ backgroundColor: colors.base }}>
                                    {/* Sidebar mock */}
                                    <div className="absolute top-0 left-0 bottom-0 w-1/4 border-r" style={{ backgroundColor: colors.sidebar, borderColor: 'rgba(0,0,0,0.05)' }}>
                                        <div className="w-1/2 h-4 mx-auto mt-4 rounded" style={{ backgroundColor: colors.primary, opacity: 0.8 }} />
                                        <div className="w-2/3 h-2 mx-auto mt-6 rounded" style={{ backgroundColor: colors.muted, opacity: 0.3 }} />
                                        <div className="w-2/3 h-2 mx-auto mt-2 rounded" style={{ backgroundColor: colors.muted, opacity: 0.3 }} />
                                        <div className="w-2/3 h-2 mx-auto mt-2 rounded" style={{ backgroundColor: colors.muted, opacity: 0.3 }} />
                                    </div>
                                    {/* Header mock */}
                                    <div className="absolute top-0 right-0 h-6 w-3/4 border-b flex items-center justify-end px-2" style={{ backgroundColor: colors.card, borderColor: 'rgba(0,0,0,0.05)' }}>
                                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors.primary, opacity: 0.8 }} />
                                    </div>
                                    {/* Content mock */}
                                    <div className="absolute top-8 left-1/4 ml-2 right-2 space-y-2">
                                        <div className="h-4 w-1/3 rounded" style={{ backgroundColor: colors.text, opacity: 0.8 }} />
                                        <div className="flex space-x-2">
                                            <div className="flex-1 h-12 rounded shadow-sm border" style={{ backgroundColor: colors.card, borderColor: 'rgba(0,0,0,0.05)' }} />
                                            <div className="flex-1 h-12 rounded shadow-sm border" style={{ backgroundColor: colors.card, borderColor: 'rgba(0,0,0,0.05)' }} />
                                            <div className="flex-1 h-12 rounded shadow-sm" style={{ backgroundColor: colors.primary }} />
                                        </div>
                                    </div>
                                    {/* Overlay if selected */}
                                    {isSelected && (
                                        <div className="absolute inset-0 bg-black/5 flex items-center justify-center backdrop-blur-[1px]">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: colors.primary }}>
                                                <Check className="w-6 h-6" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Label */}
                                <div className="p-4 bg-bg-card flex items-center justify-between w-full">
                                    <span className="font-semibold text-text-base capitalize flex items-center space-x-2">
                                        <Palette className="w-4 h-4 mr-1" style={{ color: colors.primary }} />
                                        {theme} Theme
                                    </span>
                                    {isSelected && (
                                        <span className="text-xs font-bold px-2 py-1 bg-primary-light text-primary border border-primary-light-hover rounded-full">
                                            Active
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </TeacherLayout>
    );
}
