import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import StudentLayout from '../../Layouts/StudentLayout';
import { Trophy, Medal, Star } from 'lucide-react';
import axios from 'axios';

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            try {
                const res = await axios.get('/api/student/leaderboard', {
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
        if (rank === 1) return 'bg-primary-light text-primary-hover border-primary-light-hover ';
        if (rank === 2) return 'bg-bg-hover text-text-base border-border-base ';
        if (rank === 3) return 'bg-primary-light text-primary-hover border-primary-light-hover ';
        return 'bg-bg-card text-text-base border-border-base ';
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return <Trophy className="w-6 h-6 text-primary" />;
        if (rank === 2) return <Medal className="w-6 h-6 text-text-muted" />;
        if (rank === 3) return <Medal className="w-6 h-6 text-primary" />;
        return <span className="text-lg font-bold w-6 text-center">{rank}</span>;
    };

    return (
        <StudentLayout title="Leaderboard">
            <Head title="Leaderboard" />

            <div className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-r from-primary to-primary-hover rounded-2xl p-8 mb-8 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-bg-card opacity-10 rounded-full blur-2xl"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Student Leaderboard</h2>
                            <p className="text-primary-light opacity-90">See how you rank among your peers.</p>
                        </div>
                        <Trophy className="w-16 h-16 text-primary-light-hover opacity-80 hidden md:block" />
                    </div>
                </div>

                <div className="bg-bg-card rounded-xl shadow-sm border border-border-base transition-colors overflow-hidden">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-24">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className="text-center py-24 text-text-muted ">
                            <Trophy className="w-16 h-16 mx-auto text-text-muted mb-4" />
                            <p className="text-lg">No leaderboard data available yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 ">
                            {leaderboard.map((student, index) => {
                                const rank = index + 1;
                                const isTop3 = rank <= 3;
                                const isCurrentUser = student.id == localStorage.getItem('user_id'); // If available

                                return (
                                    <div key={student.id || index} className={`p-4 sm:px-6 flex items-center transition-colors ${isCurrentUser ? 'bg-primary-light/50 ' : 'hover:bg-bg-base '} ${isTop3 ? 'py-5' : 'py-4'}`}>
                                        <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full border-2 ${getRankColor(rank)}`}>
                                            {getRankIcon(rank)}
                                        </div>

                                        <div className="ml-4 sm:ml-6 flex-1 flex items-center">
                                            <div className="relative">
                                                {student.profile_image ? (
                                                    <img src={student.profile_image} alt={student.name} className={`rounded-full object-cover border-2 border-white shadow-sm ${isTop3 ? 'w-14 h-14' : 'w-10 h-10'}`} />
                                                ) : (
                                                    <div className={`rounded-full bg-primary-light-hover flex items-center justify-center text-primary-hover font-bold border-2 border-white shadow-sm ${isTop3 ? 'w-14 h-14 text-xl' : 'w-10 h-10 text-lg'}`}>
                                                        {student.name ? student.name.charAt(0).toUpperCase() : '?'}
                                                    </div>
                                                )}
                                                {isTop3 && (
                                                    <div className="absolute -bottom-1 -right-1 bg-primary-light-hover rounded-full p-0.5 border-2 border-white ">
                                                        <Star className="w-3 h-3 text-white fill-current" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="ml-4">
                                                <h3 className={`font-bold ${isCurrentUser ? 'text-primary-hover ' : 'text-text-base '} ${isTop3 ? 'text-lg' : 'text-base'}`}>
                                                    {student.name} {isCurrentUser && "(You)"}
                                                </h3>
                                                {student.course && (
                                                    <p className="text-sm text-text-muted mt-0.5">{student.course.name}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="ml-4 text-right">
                                            <div className={`font-black ${isTop3 ? 'text-2xl text-primary ' : 'text-xl text-text-base '}`}>
                                                {student.total_marks || student.score || 0}
                                            </div>
                                            <div className="text-xs text-text-muted uppercase tracking-wider font-semibold">Points</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </StudentLayout>
    );
}
