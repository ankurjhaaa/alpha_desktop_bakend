import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../../Core/Widgets/Modal';
import CustomTextField from '../../Core/Widgets/CustomTextField';
import CustomButton from '../../Core/Widgets/CustomButton';

export default function ForgotPasswordModal({ isOpen, onClose, onSuccess }) {
    const [forgotStep, setForgotStep] = useState(1); // 1 = Email, 2 = OTP, 3 = Password Reset
    const [forgotEmail, setForgotEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotError, setForgotError] = useState(null);
    const [forgotSuccessMessage, setForgotSuccessMessage] = useState(null);

    // Reset states when modal is opened/closed
    useEffect(() => {
        if (!isOpen) {
            setForgotStep(1);
            setForgotEmail('');
            setOtpCode('');
            setNewPassword('');
            setConfirmPassword('');
            setForgotError(null);
            setForgotSuccessMessage(null);
        }
    }, [isOpen]);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!forgotEmail) {
            setForgotError('Please enter your email address');
            return;
        }

        setForgotLoading(true);
        setForgotError(null);
        setForgotSuccessMessage(null);

        try {
            const res = await axios.post('/api/forgot-password/send-otp', { email: forgotEmail });
            setForgotSuccessMessage(res.data.message || 'OTP sent successfully!');
            setForgotStep(2);
        } catch (err) {
            setForgotError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setForgotLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otpCode) {
            setForgotError('Please enter the OTP');
            return;
        }

        setForgotLoading(true);
        setForgotError(null);
        setForgotSuccessMessage(null);

        try {
            const res = await axios.post('/api/forgot-password/verify-otp', {
                email: forgotEmail,
                otp: otpCode
            });
            setForgotSuccessMessage(res.data.message || 'OTP verified successfully!');
            setForgotStep(3);
        } catch (err) {
            setForgotError(err.response?.data?.message || 'Invalid or expired OTP.');
        } finally {
            setForgotLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) {
            setForgotError('Please fill in both fields');
            return;
        }
        if (newPassword !== confirmPassword) {
            setForgotError('Passwords do not match');
            return;
        }
        if (newPassword.length < 8) {
            setForgotError('Password must be at least 8 characters long');
            return;
        }

        setForgotLoading(true);
        setForgotError(null);
        setForgotSuccessMessage(null);

        try {
            const res = await axios.post('/api/forgot-password/reset', {
                email: forgotEmail,
                otp: otpCode,
                password: newPassword,
                password_confirmation: confirmPassword
            });
            if (onSuccess) {
                onSuccess(res.data.message || 'Password reset successfully! You can now log in.');
            }
            onClose();
        } catch (err) {
            setForgotError(err.response?.data?.message || 'Password reset failed. Please try again.');
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Reset Your Password"
            maxWidth="md"
        >
            {forgotSuccessMessage && (
                <div className="p-3 bg-primary-light text-primary-text text-sm rounded-md mb-4 font-medium">
                    {forgotSuccessMessage}
                </div>
            )}

            {forgotStep === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                    <p className="text-text-muted text-sm leading-relaxed">
                        Enter the email address registered with your account. We will send you a 6-digit OTP code to verify your identity.
                    </p>
                    <CustomTextField
                        label="Email Address"
                        type="email"
                        placeholder="your-email@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                    />
                    {forgotError && (
                        <div className="p-2.5 bg-danger-light text-danger-text text-xs rounded-md mt-2 font-medium">
                            {forgotError}
                        </div>
                    )}
                    <div className="flex justify-end pt-4 space-x-3">
                        <CustomButton 
                            type="button" 
                            variant="secondary" 
                            onPressed={onClose}
                            disabled={forgotLoading}
                        >
                            Cancel
                        </CustomButton>
                        <CustomButton 
                            type="submit" 
                            disabled={forgotLoading}
                        >
                            {forgotLoading ? 'Sending...' : 'Send OTP'}
                        </CustomButton>
                    </div>
                </form>
            )}

            {forgotStep === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <p className="text-text-muted text-sm leading-relaxed">
                        We have sent a 6-digit verification code to <span className="font-semibold">{forgotEmail}</span>. Please enter the code below.
                    </p>
                    <CustomTextField
                        label="6-Digit OTP"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        required
                    />
                    {forgotError && (
                        <div className="p-2.5 bg-danger-light text-danger-text text-xs rounded-md mt-2 font-medium">
                            {forgotError}
                        </div>
                    )}
                    <div className="flex justify-between pt-4 items-center">
                        <button 
                            type="button" 
                            onClick={() => setForgotStep(1)} 
                            className="text-primary font-bold text-sm hover:underline"
                            disabled={forgotLoading}
                        >
                            Back to Email
                        </button>
                        <div className="flex space-x-3">
                            <CustomButton 
                                type="button" 
                                variant="secondary" 
                                onPressed={onClose}
                                disabled={forgotLoading}
                            >
                                Cancel
                            </CustomButton>
                            <CustomButton 
                                type="submit" 
                                disabled={forgotLoading}
                            >
                                {forgotLoading ? 'Verifying...' : 'Verify OTP'}
                            </CustomButton>
                        </div>
                    </div>
                </form>
            )}

            {forgotStep === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                    <p className="text-text-muted text-sm leading-relaxed">
                        Choose a secure new password for your account (minimum 8 characters).
                    </p>
                    <CustomTextField
                        label="New Password"
                        type="password"
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <CustomTextField
                        label="Confirm New Password"
                        type="password"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    {forgotError && (
                        <div className="p-2.5 bg-danger-light text-danger-text text-xs rounded-md mt-2 font-medium">
                            {forgotError}
                        </div>
                    )}
                    <div className="flex justify-end pt-4 space-x-3">
                        <CustomButton 
                            type="button" 
                            variant="secondary" 
                            onPressed={onClose}
                            disabled={forgotLoading}
                        >
                            Cancel
                        </CustomButton>
                        <CustomButton 
                            type="submit" 
                            disabled={forgotLoading}
                        >
                            {forgotLoading ? 'Resetting...' : 'Set New Password'}
                        </CustomButton>
                    </div>
                </form>
            )}
        </Modal>
    );
}
