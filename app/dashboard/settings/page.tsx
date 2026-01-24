'use client';

import { useEffect, useState } from 'react';
import apiClient from '../lib/apiClient';
import { useAppSelector } from '../lib/hooks';
import { useToast } from '../lib/components/ToastContainer';

interface BusinessConfig {
  id?: string;
  customer_id?: string;
  business_description?: string;
  support_email?: string;
  support_phone?: string;
  payment_qr_codes?: string[];
  created_at?: string;
  updated_at?: string;
}

export default function SettingsPage() {
  const [config, setConfig] = useState<BusinessConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    business_description: '',
    support_email: '',
    support_phone: '',
    payment_qr_codes: [] as string[]
  });

  const { email, business_name } = useAppSelector((state) => state.customer);

  // Fetch existing config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await apiClient.get<BusinessConfig>('/dashboard/business-config');
        setConfig(response.data);
        setFormData({
          business_description: response.data.business_description || '',
          support_email: response.data.support_email || '',
          support_phone: response.data.support_phone || '',
          payment_qr_codes: response.data.payment_qr_codes || []
        });
      } catch (error: any) {
        if (error.response?.status === 404) {
          // No config exists - show onboarding
          setConfig(null);
        } else {
          console.error('Failed to fetch config:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const uploadQRCode = async (file: File): Promise<string> => {
    try {
      // 1. Get presigned URL
      const uploadResponse = await apiClient.post<{ upload_url: string; file_url: string }>(
        '/dashboard/business-config/upload-payment-qr',
        {
          file_name: file.name,
          content_type: file.type
        }
      );

      const { upload_url, file_url } = uploadResponse.data;

      // 2. Upload to S3
      await fetch(upload_url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
          'x-amz-acl': 'public-read'
        }
      });

      return file_url;
    } catch (error) {
      console.error('Failed to upload QR code:', error);
      throw error;
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => uploadQRCode(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      
      setFormData(prev => ({
        ...prev,
        payment_qr_codes: [...prev.payment_qr_codes, ...uploadedUrls]
      }));
    } catch (error) {
      showToast('Failed to upload QR codes. Please try again.', 'error');
    } finally {
      setUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const removeQRCode = (urlToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      payment_qr_codes: prev.payment_qr_codes.filter(url => url !== urlToRemove)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (config) {
        // Update existing config
        await apiClient.put('/dashboard/business-config', formData);
      } else {
        // Create new config
        await apiClient.post('/dashboard/business-config', formData);
      }
      
      // Deploy persistent menu after saving
      try {
        await apiClient.post('/dashboard/business-config/deploy-persistent-menu');
        showToast('Business configuration saved and menu deployed successfully!', 'success');
      } catch (deployError: any) {
        console.error('Failed to deploy menu:', deployError);
        showToast('Configuration saved but failed to deploy menu. You can try again from settings.', 'warning');
      }
      
      // Refetch config
      const response = await apiClient.get<BusinessConfig>('/dashboard/business-config');
      setConfig(response.data);
    } catch (error: any) {
      console.error('Failed to save config:', error);
      showToast(error.response?.data?.detail || 'Failed to save configuration. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-20 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Business Settings</h1>
        <p className="text-gray-600 mt-2">
          {config ? 'Manage your business configuration and Instagram menu' : 'Set up your business to start selling'}
        </p>
      </div>

      {/* Welcome Banner for First Time */}
      {!config && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">👋 Welcome to Your Dashboard!</h2>
          <p className="text-blue-800">
            Let's set up your business information. This will be used to configure your Instagram shopping experience.
          </p>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Business Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Description
          </label>
          <textarea
            value={formData.business_description}
            onChange={(e) => setFormData({ ...formData, business_description: e.target.value })}
            placeholder="What does your business do? (e.g., We sell handmade jewelry and custom accessories)"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            maxLength={1000}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.business_description.length}/1000 characters
          </p>
        </div>

        {/* Support Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Support Email
          </label>
          <input
            type="email"
            value={formData.support_email}
            onChange={(e) => setFormData({ ...formData, support_email: e.target.value })}
            placeholder="support@yourbusiness.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Support Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Support Phone
          </label>
          <input
            type="tel"
            value={formData.support_phone}
            onChange={(e) => setFormData({ ...formData, support_phone: e.target.value })}
            placeholder="+1234567890"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Payment QR Codes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment QR Codes
          </label>
          <p className="text-sm text-gray-500 mb-3">
            Upload QR codes for eSewa, Khalti, FonePay, or other payment methods
          </p>

          {/* QR Code Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
            {formData.payment_qr_codes.map((url, index) => (
              <div key={url} className="relative group">
                <img
                  src={url}
                  alt={`QR Code ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => removeQRCode(url)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}

            {/* Upload Button */}
            <label className="w-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600 mb-2"></div>
                  <span className="text-xs text-gray-500">Uploading...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-xs text-gray-500">Add QR Code</span>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {saving ? 'Saving & Deploying Menu...' : config ? 'Update & Deploy Menu' : 'Save & Deploy Menu'}
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">ℹ️ What happens when you save?</h3>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Saves your business configuration</li>
            <li>Automatically deploys persistent menu to Instagram DMs</li>
            <li>Customers can browse products and place orders</li>
            <li>Your payment QR codes will be shown at checkout</li>
            <li>Support info will be accessible to buyers</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
