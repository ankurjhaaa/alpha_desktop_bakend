import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import TeacherLayout from '../../Layouts/TeacherLayout';
import { Trophy, Medal, Star, TrendingUp } from 'lucide-react';
import axios from 'axios';

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            try {
                const res = await axios.get('/api/leaderboard', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLeaderboard(res.data);
            } catch (error) {
                console.error("Error fetching leaderboard", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const getRankColor = (rank) => {
        if (rank === 1) return 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700/50';
        if (rank === 2) return 'bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600';
        if (rank === 3) return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-500 dark:border-amber-800/50';
        return 'bg-white text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
        if (rank === 2) return <Medal className="w-6 h-6 text-slate-400" />;
        if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
        return <span className="text-lg font-bold w-6 text-center">{rank}</span>;
    };

    return (
        <TeacherLayout title="Global Leaderboard">
            <Head title="Leaderboard" />

            <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 mb-8 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Global Leaderboard</h2>
                            <p className="text-blue-100 opacity-90">Top performing students across all courses and batches.</p>
                        </div>
                        <div className="mt-6 md:mt-0 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 flex items-center space-x-3">
                            <TrendingUp className="w-8 h-8 text-yellow-300" />
                            <div>
                                <div className="text-sm text-blue-100 uppercase tracking-wider font-semibold">Total Students</div>
                                <div className="text-2xl font-bold">{leaderboard.length} Ranked</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors overflow-hidden">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-24">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className="text-center py-24 text-slate-500 dark:text-slate-400">
                            <Trophy className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                            <p className="text-lg">No leaderboard data available yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {leaderboard.map((student, index) => {
                                const rank = index + 1;
                                const isTop3 = rank <= 3;
                                
                                return (
                                    <div key={student.id || index} className={`p-4 sm:px-6 flex items-center transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30 ${isTop3 ? 'py-5' : 'py-4'}`}>
                                        <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full border-2 ${getRankColor(rank)}`}>
                                            {getRankIcon(rank)}
                                        </div>
                                        
                                        <div className="ml-4 sm:ml-6 flex-1 flex items-center">
                                            <div className="relative">
                                                {student.profile_image ? (
                                                    <img src={student.profile_image} alt={student.name} className={`rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm ${isTop3 ? 'w-14 h-14' : 'w-10 h-10'}`} />
                                                ) : (
                                                    <div className={`rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold border-2 border-white dark:border-slate-800 shadow-sm ${isTop3 ? 'w-14 h-14 text-xl' : 'w-10 h-10 text-lg'}`}>
                                                        {student.name ? student.name.charAt(0).toUpperCase() : '?'}
                                                    </div>
                                                )}
                                                {isTop3 && (
                                                    <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-0.5 border-2 border-white dark:border-slate-800">
                                                        <Star className="w-3 h-3 text-white fill-current" />
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="ml-4">
                                                <h3 className={`font-bold text-slate-900 dark:text-white ${isTop3 ? 'text-lg' : 'text-base'}`}>
                                                    {student.name}
                                                </h3>
                                                {student.course && (
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{student.course.name}</p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="ml-4 text-right">
                                            <div className={`font-black ${isTop3 ? 'text-2xl text-blue-600 dark:text-blue-400' : 'text-xl text-slate-700 dark:text-slate-300'}`}>
                                                {student.total_marks || student.score || 0}
                                            </div>
                                            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Points</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </TeacherLayout>
    );
}
