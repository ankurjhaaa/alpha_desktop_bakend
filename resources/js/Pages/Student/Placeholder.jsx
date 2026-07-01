import React from 'react';
import { Head } from '@inertiajs/react';
import StudentLayout from '../../Layouts/StudentLayout';
import { Construction } from 'lucide-react';

export default function Placeholder({ title }) {
    return (
        <StudentLayout title={title}>
            <Head title={title} />
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
                    <Construction className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{title}</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md">
                    This module is currently under construction. It will mirror the functionality found in the Flutter application very soon.
                </p>
            </div>
        </StudentLayout>
    );
}
