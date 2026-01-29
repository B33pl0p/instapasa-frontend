'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await login({ email, password });
      router.push('/dashboard/message');
    } catch (error: unknown) {
      setIsLoading(false);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status: number; data?: { detail?: string } } };
        if (axiosError.response?.status === 401) {
          setErrors({ 
            general: 'Unable to sign in. Please check your email and password are correct.' 
          });
        } else if (axiosError.response?.status === 400) {
          setErrors({ 
            general: 'Invalid email format. Please check and try again.' 
          });
        } else if (axiosError.response?.status === 429) {
          setErrors({ 
            general: 'Too many login attempts. Please try again later.' 
          });
        } else {
          setErrors({ 
            general: 'Something went wrong. Please try again later.' 
          });
        }
      } else {
        setErrors({ 
          general: 'Network error. Please check your connection and try again.' 
        });
      }
      setShowError(true);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md">
        {/* Form Container */}
        <div className="rounded-lg bg-[#2A2A2A] p-6 sm:p-8 shadow-lg">
          <h1 className="mb-1 sm:mb-2 text-2xl sm:text-3xl font-bold text-white">Welcome Back</h1>
          <p className="mb-4 sm:mb-6 text-xs sm:text-sm text-gray-400">
            Sign in with your account to continue
          </p>

          {errors.general && showError && (
            <div className="mb-4 rounded-lg bg-linear-to-r from-red-500/10 to-red-600/10 border border-red-400/30 backdrop-blur-sm p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <svg
                  className="h-5 w-5 text-red-400 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-300 mb-0.5">Authentication Failed</p>
                  <p className="text-xs sm:text-sm text-red-200/80">{errors.general}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowError(false)}
                  className="text-red-400 hover:text-red-300 transition-colors shrink-0"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs sm:text-sm font-medium text-white"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // Clear error when user starts typing again
                    if (showError && errors.general) {
                      setShowError(false);
                    }
                  }}
                  placeholder="Enter your email"
                  className={`w-full rounded-md bg-[#1A1A1A] py-2 sm:py-2.5 pl-10 pr-4 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border border-red-500 focus:ring-red-500'
                      : 'border border-gray-700 focus:ring-[#8A38F5]'
                  }`}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs sm:text-sm font-medium text-white"
              >
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                   onChange={(e) => {
                    setPassword(e.target.value);
                    // Clear error when user starts typing again
                    if (showError && errors.general) {
                      setShowError(false);
                    }
                  }}
                  placeholder="Enter your password"
                  className={`w-full rounded-md bg-[#1A1A1A] py-2 sm:py-2.5 pl-10 pr-10 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
                    errors.password
                      ? 'border border-red-500 focus:ring-red-500'
                      : 'border border-gray-700 focus:ring-[#8A38F5]'
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <VisibilityOff className="h-4 sm:h-5 w-4 sm:w-5" />
                  ) : (
                    <Visibility className="h-4 sm:h-5 w-4 sm:w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                href="#"
                className="text-xs sm:text-sm text-gray-400 hover:text-gray-300"
              >
                Forgot Password
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-md bg-[#8A38F5] py-2 sm:py-2.5 px-4 font-semibold text-sm sm:text-base text-white transition-colors hover:bg-[#7A28E5] focus:outline-none focus:ring-2 focus:ring-[#8A38F5] focus:ring-offset-2 focus:ring-offset-[#2A2A2A] ${
                isLoading
                  ? 'cursor-not-allowed opacity-60'
                  : ''
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="mr-2 h-4 sm:h-5 w-4 sm:w-5 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Sign Up Link */}
            <div className="text-center text-xs sm:text-sm text-gray-400">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="font-medium text-[#8A38F5] hover:text-[#7A28E5]"
              >
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
