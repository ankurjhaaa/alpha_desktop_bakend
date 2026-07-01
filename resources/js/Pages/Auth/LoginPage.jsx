import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Mail, Lock, BookOpen, LineChart, Laptop, ArrowRight } from 'lucide-react';
import CustomTextField from '../../Core/Widgets/CustomTextField';
import CustomButton from '../../Core/Widgets/CustomButton';
import ThemeToggleButton from '../../Core/Widgets/ThemeToggleButton';
import axios from 'axios';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please enter email and password');
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            const response = await axios.post('/api/login', { email, password });
            if (response.data.token) {
                localStorage.setItem('auth_token', response.data.token);
                localStorage.setItem('user_role', response.data.role);
                localStorage.setItem('user_name', response.data.user?.name || '');
                localStorage.setItem('user_email', response.data.user?.email || '');

                if (response.data.role === 'teacher') {
                    router.visit('/teacher');
                } else {
                    router.visit('/student');
                }
            } else {
                setError('Invalid credentials');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Connection error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const FeatureRow = ({ icon: Icon, text }) => (
        <div className="flex items-center space-x-6">
            <div className="p-3 rounded-xl bg-blue-100/50 dark:bg-white/10 border border-blue-200/50 dark:border-white/5 text-blue-800 dark:text-white">
                <Icon className="w-7 h-7" />
            </div>
            <p className="text-xl font-semibold text-slate-800 dark:text-white tracking-tight">
                {text}
            </p>
        </div>
    );

    return (
        <>
            <Head title="Login - Alpha Graphics" />
            
            <div className="min-h-screen relative overflow-hidden bg-white dark:bg-[#0F172A] dark:bg-gradient-to-br dark:from-[#1A1A2E] dark:to-[#0F172A] transition-colors duration-300 flex items-center justify-center">
                {/* Background Decorators */}
                <div className="absolute -top-40 -left-20 w-96 h-96 rounded-full bg-blue-500/5 dark:bg-white/5 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -right-10 w-[500px] h-[500px] rounded-full bg-blue-500/5 dark:bg-white/5 blur-3xl pointer-events-none" />
                
                {/* Theme Toggle */}
                <div className="absolute top-6 right-6 z-50">
                    <ThemeToggleButton />
                </div>

                <div className="container mx-auto px-6 h-full flex flex-col lg:flex-row items-center justify-center lg:py-0 py-12 relative z-10 w-full">
                    
                    {/* Hero Section */}
                    <div className="w-full lg:w-1/2 flex flex-col items-start justify-center lg:pr-20 mb-16 lg:mb-0">
                        <div className="p-1.5 rounded-full bg-white shadow-xl dark:shadow-none dark:bg-white/10 mb-14">
                            <div className="w-40 h-40 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                <img 
                                    src="/assets/images/logo.png" 
                                    alt="Logo"
                                    className="w-full h-full object-contain p-4"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'block';
                                    }}
                                />
                                <BookOpen className="w-20 h-20 text-blue-700 dark:text-blue-500 hidden" />
                            </div>
                        </div>
                        
                        <h2 className="text-2xl font-semibold text-slate-800 dark:text-white/90 mb-1">
                            Welcome to
                        </h2>
                        <h1 className="text-5xl lg:text-7xl font-black text-[#1E1E1E] dark:text-white leading-tight tracking-tight mb-6">
                            Alpha Graphics
                        </h1>
                        <p className="text-lg lg:text-xl text-slate-700 dark:text-white/80 leading-relaxed font-medium mb-14 max-w-2xl">
                            Your gateway to interactive learning and creative excellence with our Test Series App. Sign in to access your personalized dashboard, practice with tailored test series, track your progress, and explore endless possibilities for academic and competitive success.
                        </p>
                        
                        <div className="flex flex-col space-y-6">
                            <FeatureRow icon={BookOpen} text="Comprehensive Test Series" />
                            <FeatureRow icon={LineChart} text="In-Depth Performance Analytics" />
                            <FeatureRow icon={Laptop} text="Interactive Online Exam" />
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="w-full lg:w-1/2 flex justify-center">
                        <div className="w-full max-w-[560px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[24px] border border-slate-200 dark:border-white/10 p-10 lg:p-14 shadow-2xl">
                            
                            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                                Welcome Back
                            </h2>
                            <p className="text-slate-600 dark:text-white/60 text-lg font-medium mb-12">
                                Please enter your credentials to access your account
                            </p>

                            {error && (
                                <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleLogin} className="flex flex-col gap-6">
                                <CustomTextField
                                    label="Email Address"
                                    hintText="name@example.com"
                                    prefixIcon={Mail}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />

                                <CustomTextField
                                    label="Password"
                                    hintText="••••••••"
                                    isPassword={true}
                                    prefixIcon={Lock}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />

                                <div className="flex justify-end mt-2">
                                    <button
                                        type="button"
                                        className="text-blue-700 dark:text-blue-400 font-bold hover:underline"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>

                                <div className="mt-8">
                                    <CustomButton 
                                        type="submit" 
                                        isLoading={isLoading}
                                        className="w-full text-lg py-5"
                                    >
                                        Sign In to Dashboard
                                        <ArrowRight className="ml-3 w-6 h-6" />
                                    </CustomButton>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}
