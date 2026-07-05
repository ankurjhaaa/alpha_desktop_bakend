import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Mail, Lock, BookOpen, LineChart, Laptop, ArrowRight } from 'lucide-react';
import CustomTextField from '../../Core/Widgets/CustomTextField';
import CustomButton from '../../Core/Widgets/CustomButton';
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
        <div className="flex items-center space-x-4">
            <div className="p-2.5 rounded-md bg-primary-light-hover/50 border border-primary-light-hover/50 text-primary-hover ">
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-lg font-semibold text-text-base tracking-tight">
                {text}
            </p>
        </div>
    );

    return (
        <>
            <Head title="Login - Alpha Graphics" />

            <div className="min-h-screen relative overflow-hidden bg-bg-base transition-colors duration-300 flex items-center justify-center">
                {/* Background Decorators */}
                <div className="absolute -top-40 -left-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -right-10 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

                {/* Theme Toggle */}
                <div className="absolute top-6 right-6 z-10 flex space-x-2">
                </div>

                <div className="max-w-7xl mx-auto px-6 h-full flex flex-col lg:flex-row items-center justify-center lg:py-0 py-12 relative z-10 w-full">

                    {/* Hero Section */}
                    <div className="w-full lg:w-1/2 flex flex-col items-start justify-center lg:pr-12 mb-10 lg:mb-0">
                        <img
                            src="/assets/images/logo.png"
                            alt="Logo"
                            className="w-48 h-48 object-contain mb-8"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                            }}
                        />
                        <BookOpen className="w-48 h-48 text-primary-hover mb-8 hidden" />

                        <h2 className="text-xl font-semibold text-text-muted mb-1">
                            Welcome to
                        </h2>
                        <h1 className="text-4xl lg:text-5xl font-black text-text-base leading-tight tracking-tight mb-4">
                            Alpha Graphics
                        </h1>
                        <p className="text-base text-text-muted leading-relaxed font-medium mb-8 max-w-2xl">
                            Your gateway to interactive learning and creative excellence with our Test Series App. Sign in to access your personalized dashboard, practice with tailored test series, track your progress, and explore endless possibilities for academic and competitive success.
                        </p>

                        <div className="flex flex-col space-y-4">
                            <FeatureRow icon={BookOpen} text="Comprehensive Test Series" />
                            <FeatureRow icon={LineChart} text="In-Depth Performance Analytics" />
                            <FeatureRow icon={Laptop} text="Interactive Online Exam" />
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
                        <div className="w-full max-w-[460px] bg-bg-card/90 backdrop-blur-xl rounded-md border border-border-base p-8 lg:p-10 shadow-xl">

                            <h2 className="text-2xl lg:text-3xl font-black text-text-base tracking-tight mb-2">
                                Welcome Back
                            </h2>
                            <p className="text-text-muted text-base font-medium mb-8">
                                Please enter your credentials to access your account
                            </p>

                            {error && (
                                <div className="mb-6 p-4 rounded-md bg-danger-light text-danger-text text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleLogin} className="flex flex-col gap-5">
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

                                <div className="flex justify-end mt-1">
                                    <button
                                        type="button"
                                        className="text-primary font-bold hover:underline text-sm"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>

                                <div className="mt-6">
                                    <CustomButton
                                        type="submit"
                                        isLoading={isLoading}
                                        className="w-full py-4 text-base"
                                    >
                                        Sign In to Dashboard
                                        <ArrowRight className="ml-2 w-5 h-5" />
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
