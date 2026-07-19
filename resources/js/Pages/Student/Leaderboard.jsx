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
                <div className="bg-bg-card border border-border-base rounded-md p-6 mb-6 text-text-base shadow-sm relative overflow-hidden transition-colors">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary opacity-10 rounded-full blur-2xl"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">Student Leaderboard</h2>
                            <p className="text-text-muted opacity-90 text-sm">See how you rank among your peers.</p>
                        </div>
                        <div className="mt-4 md:mt-0 p-3 bg-bg-hover rounded-md border border-border-base flex items-center space-x-3 transition-colors">
                            <Trophy className="w-6 h-6 text-primary" />
                            <div>
                                <div className="text-xs text-text-muted uppercase tracking-wider font-semibold">Total Students</div>
                                <div className="text-xl font-bold">{leaderboard.length} Ranked</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-bg-card rounded-md shadow-sm border border-border-base transition-colors overflow-hidden">
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
                                const isCurrentUser = student.student_email === localStorage.getItem('user_email');

                                return (
                                    <div key={student.user_id || index} className={`p-4 sm:px-6 flex items-center transition-colors ${isCurrentUser ? 'bg-primary-light/50 ' : 'hover:bg-bg-base '} ${isTop3 ? 'py-5' : 'py-4'}`}>
                                        <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full border-2 ${getRankColor(rank)}`}>
                                            {getRankIcon(rank)}
                                        </div>

                                        <div className="ml-4 sm:ml-6 flex-1 flex items-center">
                                            <div className="relative">
                                                {student.profile_image ? (
                                                    <img src={student.profile_image} alt={student.student_name} className={`rounded-full object-cover border-2 border-white shadow-sm ${isTop3 ? 'w-14 h-14' : 'w-10 h-10'}`} />
                                                ) : (
                                                    <div className={`rounded-full bg-primary-light-hover flex items-center justify-center text-primary-hover font-bold border-2 border-white shadow-sm ${isTop3 ? 'w-14 h-14 text-xl' : 'w-10 h-10 text-lg'}`}>
                                                        {student.student_name ? student.student_name.charAt(0).toUpperCase() : '?'}
                                                    </div>
                                                )}
                                                {isTop3 && (
                                                    <div className="absolute -bottom-1 -right-1 bg-primary-light-hover rounded-full p-0.5 border-2 border-white ">
                                                        <Star className="w-3 h-3 text-primary-text fill-current" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="ml-4">
                                                <h3 className={`font-bold capitalize ${isCurrentUser ? 'text-primary-hover ' : 'text-text-base '} ${isTop3 ? 'text-lg' : 'text-base'}`}>
                                                    {student.student_name} {isCurrentUser && "(You)"}
                                                </h3>
                                                <div className="flex flex-col sm:flex-row sm:items-center text-text-muted text-xs sm:text-sm mt-0.5 space-y-1 sm:space-y-0 sm:space-x-3">
                                                    <span>{student.registration_id || student.student_email}</span>
                                                    {student.course && student.course !== 'N/A' && (
                                                        <>
                                                            <span className="hidden sm:inline text-border-base">•</span>
                                                            <span className="bg-bg-hover px-1.5 py-0.5 rounded text-xs border border-border-base font-medium">{student.course}</span>
                                                        </>
                                                    )}
                                                    {student.batch && student.batch !== 'N/A' && (
                                                        <>
                                                            <span className="hidden sm:inline text-border-base">•</span>
                                                            <span className="bg-bg-hover px-1.5 py-0.5 rounded text-xs border border-border-base capitalize">{student.batch}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="ml-4 text-right">
                                             <div className={`font-black ${isTop3 ? 'text-2xl text-primary ' : 'text-xl text-text-base '}`}>
                                                 {student.average_marks ? `${Math.round(student.average_marks)}%` : '0%'}
                                             </div>
                                             <div className="text-xs text-text-muted uppercase tracking-wider font-semibold">Avg Score</div>
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
