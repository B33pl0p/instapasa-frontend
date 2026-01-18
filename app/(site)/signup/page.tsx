'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, type SignupData } from '../lib/auth';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [formData, setFormData] = useState<SignupData>({
    email: '',
    password: '',
    business_name: '',
    instagram_username: '',
    phone: '',
    brand_description: '',
    tone: '',
    website: '',
    company_contact_person: '',
    contact_person_role: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.business_name.trim()) {
      newErrors.business_name = 'Company name is required';
    }

    if (!formData.instagram_username.trim()) {
      newErrors.instagram_username = 'Instagram handle is required';
    } else if (!/^[a-zA-Z0-9._]+$/.test(formData.instagram_username)) {
      newErrors.instagram_username = 'Invalid Instagram handle format';
    }

    // Optional field validation
    if (formData.brand_description && formData.brand_description.split(/\s+/).length > 50) {
      newErrors.brand_description = 'Description must be 50 words or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    // If password changes, check if it matches confirm password
    if (name === 'password' && confirmPassword) {
      if (value !== confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: 'Passwords do not match',
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.confirmPassword;
          return newErrors;
        });
      }
    }
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    setConfirmPassword(value);
    // Clear error when user starts typing
    if (errors.confirmPassword) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.confirmPassword;
        return newErrors;
      });
    }
    // Also check if passwords match in real-time
    if (formData.password && value && formData.password !== value) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: 'Passwords do not match',
      }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Prepare data - remove empty optional fields
      const submitData: SignupData = {
        email: formData.email,
        password: formData.password,
        business_name: formData.business_name,
        instagram_username: formData.instagram_username,
      };

      // Add optional fields only if they have values
      if (formData.phone?.trim()) submitData.phone = formData.phone.trim();
      if (formData.brand_description?.trim())
        submitData.brand_description = formData.brand_description.trim();
      if (formData.tone?.trim()) submitData.tone = formData.tone.trim();
      if (formData.website?.trim()) submitData.website = formData.website.trim();
      if (formData.company_contact_person?.trim())
        submitData.company_contact_person = formData.company_contact_person.trim();
      if (formData.contact_person_role?.trim())
        submitData.contact_person_role = formData.contact_person_role.trim();

      await signup(submitData);
      router.push('/message');
    } catch (error: any) {
      setIsLoading(false);
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.detail || 'Registration failed';
        if (errorMessage.includes('email') || errorMessage.includes('Email')) {
          setErrors({ email: 'This email is already registered' });
        } else if (
          errorMessage.includes('instagram') ||
          errorMessage.includes('Instagram')
        ) {
          setErrors({
            instagram_username: 'This Instagram username is already registered',
          });
        } else {
          setErrors({ general: errorMessage });
        }
      } else {
        setErrors({ general: 'An error occurred. Please try again.' });
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white">Welcome</h1>
          <p className="text-gray-400">
            Please enter the following information to complete the signup process
          </p>
        </div>

        {/* Form Container */}
        <div className="rounded-lg bg-[#2A2A2A] p-8 shadow-lg">
          {errors.general && (
            <div className="mb-4 rounded-md bg-red-500/20 border border-red-500/50 p-3 text-sm text-red-300">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Company Name */}
              <div>
                <label
                  htmlFor="business_name"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  Company Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="business_name"
                  name="business_name"
                  type="text"
                  value={formData.business_name}
                  onChange={handleChange}
                  placeholder="Enter the name of your company/store"
                  className={`w-full rounded-md bg-[#1A1A1A] py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
                    errors.business_name
                      ? 'border border-red-500 focus:ring-red-500'
                      : 'border border-gray-700 focus:ring-[#8A38F5]'
                  }`}
                  disabled={isLoading}
                />
                {errors.business_name && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.business_name}
                  </p>
                )}
              </div>

              {/* Contact Number */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  Contact Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your contact number"
                  className={`w-full rounded-md bg-[#1A1A1A] py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
                    errors.phone
                      ? 'border border-red-500 focus:ring-red-500'
                      : 'border border-gray-700 focus:ring-[#8A38F5]'
                  }`}
                  disabled={isLoading}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Instagram Handle */}
            <div>
              <label
                htmlFor="instagram_username"
                className="mb-2 block text-sm font-medium text-white"
              >
                Instagram Handle <span className="text-red-400">*</span>
              </label>
              <input
                id="instagram_username"
                name="instagram_username"
                type="text"
                value={formData.instagram_username}
                onChange={handleChange}
                placeholder="Enter your instagram handle"
                className={`w-full rounded-md bg-[#1A1A1A] py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
                  errors.instagram_username
                    ? 'border border-red-500 focus:ring-red-500'
                    : 'border border-gray-700 focus:ring-[#8A38F5]'
                }`}
                disabled={isLoading}
              />
              {errors.instagram_username && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.instagram_username}
                </p>
              )}
            </div>

            {/* Company Description */}
            <div>
              <label
                htmlFor="brand_description"
                className="mb-2 block text-sm font-medium text-white"
              >
                Company Description
              </label>
              <textarea
                id="brand_description"
                name="brand_description"
                value={formData.brand_description}
                onChange={handleChange}
                placeholder="Brief description of company (50 words)"
                rows={3}
                className={`w-full rounded-md bg-[#1A1A1A] py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 resize-none ${
                  errors.brand_description
                    ? 'border border-red-500 focus:ring-red-500'
                    : 'border border-gray-700 focus:ring-[#8A38F5]'
                }`}
                disabled={isLoading}
              />
              {errors.brand_description && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.brand_description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Email Address */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  Email Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg
                      className="h-5 w-5 text-gray-400"
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
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={`w-full rounded-md bg-[#1A1A1A] py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
                      errors.email
                        ? 'border border-red-500 focus:ring-red-500'
                        : 'border border-gray-700 focus:ring-[#8A38F5]'
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg
                      className="h-5 w-5 text-gray-400"
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
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={`w-full rounded-md bg-[#1A1A1A] py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
                      errors.password
                        ? 'border border-red-500 focus:ring-red-500'
                        : 'border border-gray-700 focus:ring-[#8A38F5]'
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg
                      className="h-5 w-5 text-gray-400"
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
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    placeholder="Confirm your password"
                    className={`w-full rounded-md bg-[#1A1A1A] py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
                      errors.confirmPassword
                        ? 'border border-red-500 focus:ring-red-500'
                        : 'border border-gray-700 focus:ring-[#8A38F5]'
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-md bg-[#8A38F5] py-2.5 px-4 font-semibold text-white transition-colors hover:bg-[#7A28E5] focus:outline-none focus:ring-2 focus:ring-[#8A38F5] focus:ring-offset-2 focus:ring-offset-[#2A2A2A] ${
                isLoading ? 'cursor-not-allowed opacity-60' : ''
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="mr-2 h-5 w-5 animate-spin"
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
                  Creating account...
                </span>
              ) : (
                'Sign Up'
              )}
            </button>

            {/* Sign In Link */}
            <div className="text-center text-sm text-gray-400">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-[#8A38F5] hover:text-[#7A28E5]"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
