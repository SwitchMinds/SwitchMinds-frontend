import React, { useState, useEffect } from 'react';
import { LoginFormWithGoogle } from '@/components/auth/LoginFormWithGoogle';
import { SignupFormWithGoogle } from '@/components/auth/SignupFormWithGoogle';
import { OTPVerification } from '@/components/auth/OTPVerification';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { ResetPasswordOTP } from '@/components/auth/ResetPasswordOTP';
import { NewPasswordForm } from '@/components/auth/NewPasswordForm';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';
import { useAuthState } from '@/contexts/AuthStateContext';

type AuthStep = 'login' | 'signup' | 'verify-otp' | 'forgot-password' | 'reset-otp' | 'new-password' | 'password-reset-success';

export const AuthPage: React.FC = () => {
  const { authState, setAuthState } = useAuthState();
  const [currentStep, setCurrentStep] = useState<AuthStep>(authState || 'login');
  const [signupData, setSignupData] = useState<{ email: string; username: string } | null>(null);
  const [resetData, setResetData] = useState<{ email: string; resetToken?: string } | null>(null);
  const navigate = useNavigate();

  // Handle automatic redirect after successful login
  useAuthRedirect();

  // Reset auth state when component unmounts
  useEffect(() => {
    return () => {
      setAuthState(null);
    };
  }, [setAuthState]);

  const handleSwitchToSignup = () => {
    setCurrentStep('signup');
    setAuthState('signup');
  };

  const handleSwitchToLogin = () => {
    setCurrentStep('login');
    setAuthState('login');
  };

  const handleSwitchToForgotPassword = () => setCurrentStep('forgot-password');

  const handleSignupSuccess = (email: string, username: string) => {
    setSignupData({ email, username });
    setCurrentStep('verify-otp');
  };

  const handleNeedVerification = (email: string) => {
    const username = email.split('@')[0];
    setSignupData({ email, username });
    setCurrentStep('verify-otp');
  };

  const handleVerificationSuccess = () => {
    setCurrentStep('login');
    setSignupData(null);
  };

  const handleBackToSignup = () => {
    setCurrentStep('signup');
    setSignupData(null);
  };

  const handleBackToLogin = () => {
    setCurrentStep('login');
    setSignupData(null);
    setResetData(null);
  };

  const handleForgotPasswordOTPSent = (email: string) => {
    setResetData({ email });
    setCurrentStep('reset-otp');
  };

  const handleResetOTPVerified = (resetToken: string) => {
    setResetData(prev => prev ? { ...prev, resetToken } : null);
    setCurrentStep('new-password');
  };

  const handlePasswordReset = () => {
    setCurrentStep('password-reset-success');
    setResetData(null);
  };

  const handleBackToForgotPassword = () => {
    setCurrentStep('forgot-password');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="w-full max-w-md">
          {currentStep === 'login' && (
            <LoginFormWithGoogle 
              onSwitchToSignup={handleSwitchToSignup}
              onNeedVerification={handleNeedVerification}
              onForgotPassword={handleSwitchToForgotPassword}
            />
          )}
          
          {currentStep === 'signup' && (
            <SignupFormWithGoogle 
              onSwitchToLogin={handleSwitchToLogin}
              onSignupSuccess={handleSignupSuccess}
            />
          )}
          
          {currentStep === 'verify-otp' && signupData && (
            <OTPVerification
              email={signupData.email}
              username={signupData.username}
              onVerificationSuccess={handleVerificationSuccess}
              onBack={currentStep === 'verify-otp' && signupData.username === signupData.email.split('@')[0] ? handleBackToLogin : handleBackToSignup}
            />
          )}

          {currentStep === 'forgot-password' && (
            <ForgotPasswordForm
              onOTPSent={handleForgotPasswordOTPSent}
              onBack={handleBackToLogin}
            />
          )}

          {currentStep === 'reset-otp' && resetData && (
            <ResetPasswordOTP
              email={resetData.email}
              onOTPVerified={handleResetOTPVerified}
              onBack={handleBackToForgotPassword}
            />
          )}

          {currentStep === 'new-password' && resetData && resetData.resetToken && (
            <NewPasswordForm
              email={resetData.email}
              resetToken={resetData.resetToken}
              onPasswordReset={handlePasswordReset}
            />
          )}

          {currentStep === 'password-reset-success' && (
            <div className="bg-white/90 backdrop-blur-sm rounded-lg border-0 shadow-xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Password Reset Successful!</h2>
              <Alert className="border-green-200 bg-green-50 mb-6">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Your password has been successfully updated. You can now sign in with your new password.
                </AlertDescription>
              </Alert>
              <Button 
                onClick={handleBackToLogin}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Continue to Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
