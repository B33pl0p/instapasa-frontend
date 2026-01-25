'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';
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
  company_story?: string;
  shipping_policy?: string;
  return_policy?: string;
  payment_methods?: string;
  warranty_info?: string;
  bulk_order_info?: string;
  special_offers?: string;
  contact_info?: string;
  hours_of_operation?: string;
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
    payment_qr_codes: [] as string[],
    company_story: '',
    shipping_policy: '',
    return_policy: '',
    payment_methods: '',
    warranty_info: '',
    bulk_order_info: '',
    special_offers: '',
    contact_info: '',
    hours_of_operation: ''
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
          payment_qr_codes: response.data.payment_qr_codes || [],
          company_story: response.data.company_story || '',
          shipping_policy: response.data.shipping_policy || '',
          return_policy: response.data.return_policy || '',
          payment_methods: response.data.payment_methods || '',
          warranty_info: response.data.warranty_info || '',
          bulk_order_info: response.data.bulk_order_info || '',
          special_offers: response.data.special_offers || '',
          contact_info: response.data.contact_info || '',
          hours_of_operation: response.data.hours_of_operation || ''
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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography color="textSecondary">Loading settings...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 6, backgroundColor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 800, 
                mb: 1,
                background: 'linear-gradient(135deg, primary.main 0%, secondary.main 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Business Settings
            </Typography>
          </Box>
          <Typography variant="body1" color="textSecondary" sx={{ fontSize: '1.1rem' }}>
            {config ? 'Manage your business configuration and Instagram menu' : 'Set up your business to start selling'}
          </Typography>
        </Box>

        {/* Welcome Banner for First Time */}
        {!config && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 4,
              backgroundColor: 'info.lighter',
              border: '1px solid',
              borderColor: 'info.light',
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, color: 'info.dark' }}>
              Welcome to Your Dashboard
            </Typography>
            <Typography variant="body2" sx={{ color: 'info.dark' }}>
              Let's set up your business information. This will be used to configure your Instagram shopping experience.
            </Typography>
          </Alert>
        )}

        {/* Form Card */}
        <Card 
          sx={{ 
            mb: 4,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
            <Stack spacing={4}>
              {/* Business Description */}
              <Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
                    Business Description
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Tell your customers who you are and what you do
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.business_description}
                  onChange={(e) => setFormData({ ...formData, business_description: e.target.value })}
                  placeholder="What does your business do? (e.g., We sell handmade jewelry and custom accessories)"
                  inputProps={{ maxLength: 1000 }}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'action.hover',
                    }
                  }}
                />
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                  {formData.business_description.length}/1000 characters
                </Typography>
              </Box>

              {/* Support Email and Phone */}
              <Box sx={{ pt: 2 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
                    Contact Information
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    How customers can reach you
                  </Typography>
                </Box>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.primary' }}>
                      Support Email
                    </Typography>
                    <TextField
                      fullWidth
                      type="email"
                      value={formData.support_email}
                      onChange={(e) => setFormData({ ...formData, support_email: e.target.value })}
                      placeholder="support@yourbusiness.com"
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    />
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.primary' }}>
                      Support Phone
                    </Typography>
                    <TextField
                      fullWidth
                      type="tel"
                      value={formData.support_phone}
                      onChange={(e) => setFormData({ ...formData, support_phone: e.target.value })}
                      placeholder="+1234567890"
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    />
                  </Box>
                </Stack>
              </Box>

              {/* Payment QR Codes */}
              <Box sx={{ pt: 2 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
                    Payment QR Codes
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Upload QR codes for eSewa, Khalti, FonePay, or other payment methods
                  </Typography>
                </Box>

                {/* QR Code Grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                  {formData.payment_qr_codes.map((url, index) => (
                    <Box key={url}>
                      <Card
                        sx={{
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                            transform: 'translateY(-4px)',
                          },
                          '&:hover .delete-btn': {
                            opacity: 1,
                          },
                        }}
                      >
                        <Box
                          component="img"
                          src={url}
                          alt={`QR Code ${index + 1}`}
                          sx={{
                            width: '100%',
                            height: 120,
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                        <IconButton
                          className="delete-btn"
                          onClick={() => removeQRCode(url)}
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            backgroundColor: 'error.main',
                            color: 'error.contrastText',
                            '&:hover': {
                              backgroundColor: 'error.dark',
                            },
                          }}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Card>
                    </Box>
                  ))}

                  {/* Upload Button */}
                  <Card
                    component="label"
                    sx={{
                      height: 120,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      opacity: uploading ? 0.6 : 1,
                      transition: 'all 0.3s ease',
                      border: '2px dashed',
                      borderColor: 'divider',
                      backgroundColor: 'action.hover',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'primary.lighter',
                      },
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                      disabled={uploading}
                    />
                    {uploading ? (
                      <>
                        <CircularProgress size={28} sx={{ mb: 1 }} />
                        <Typography variant="caption">Uploading...</Typography>
                      </>
                    ) : (
                      <>
                        <CloudUploadIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                        <Typography variant="caption" sx={{ textAlign: 'center', fontWeight: 600 }}>
                          Add QR Code
                        </Typography>
                      </>
                    )}
                  </Card>
                </Box>
              </Box>

              {/* Divider */}
              <Box sx={{ borderTop: '1px solid', borderColor: 'divider', my: 2 }} />

              {/* Optional Policy Fields */}
              <Box sx={{ pt: 2 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
                    Business Policies & Information
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Add detailed information to help answer customer questions automatically (all optional)
                  </Typography>
                </Box>

                <Stack spacing={3}>
                  {/* Company Story */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                      Company Story
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                      Your mission, values, and brand story
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      value={formData.company_story}
                      onChange={(e) => setFormData({ ...formData, company_story: e.target.value })}
                      placeholder="Tell us your brand story..."
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    />
                  </Box>

                  {/* Shipping Policy */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                      Shipping Policy
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                      Delivery times, costs, and coverage areas
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      value={formData.shipping_policy}
                      onChange={(e) => setFormData({ ...formData, shipping_policy: e.target.value })}
                      placeholder="e.g., Free shipping across Nepal. Delivery within 3-5 business days..."
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    />
                  </Box>

                  {/* Return Policy */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                      Return Policy
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                      Return window, conditions, and refund process
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      value={formData.return_policy}
                      onChange={(e) => setFormData({ ...formData, return_policy: e.target.value })}
                      placeholder="e.g., 30-day return window. Items must be unused and in original packaging..."
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    />
                  </Box>

                  {/* Payment Methods */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                      Payment Methods
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                      Accepted payment types (e.g., COD, bank transfer, digital wallets)
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      value={formData.payment_methods}
                      onChange={(e) => setFormData({ ...formData, payment_methods: e.target.value })}
                      placeholder="e.g., Cash on Delivery, eSewa, Khalti, Bank Transfer..."
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    />
                  </Box>

                  {/* Warranty Info */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                      Warranty Information
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                      Product warranty details and coverage
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      value={formData.warranty_info}
                      onChange={(e) => setFormData({ ...formData, warranty_info: e.target.value })}
                      placeholder="e.g., 1-year warranty on all products. Manufacturing defects covered..."
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    />
                  </Box>

                  {/* Bulk Order Info */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                      Bulk Order Discounts
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                      Discounts and benefits for bulk purchases
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      value={formData.bulk_order_info}
                      onChange={(e) => setFormData({ ...formData, bulk_order_info: e.target.value })}
                      placeholder="e.g., 10% off for orders above Rs. 5000. Custom pricing for bulk orders..."
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    />
                  </Box>

                  {/* Special Offers */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                      Special Offers & Promotions
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                      Current promotions and seasonal deals
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      value={formData.special_offers}
                      onChange={(e) => setFormData({ ...formData, special_offers: e.target.value })}
                      placeholder="e.g., Summer sale: 20% off all items. Buy 2, get 1 free on selected products..."
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    />
                  </Box>

                  {/* Contact Info */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                      Additional Contact Channels
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                      Other ways to reach you (WhatsApp, Facebook, etc.)
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      value={formData.contact_info}
                      onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                      placeholder="e.g., WhatsApp: +977-9800000000, Facebook: facebook.com/yourbusiness..."
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    />
                  </Box>

                  {/* Hours of Operation */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                      Hours of Operation
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                      Business hours and holidays
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      value={formData.hours_of_operation}
                      onChange={(e) => setFormData({ ...formData, hours_of_operation: e.target.value })}
                      placeholder="e.g., Mon-Fri: 10 AM - 6 PM, Sat: 10 AM - 4 PM, Closed on Sundays..."
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    />
                  </Box>
                </Stack>
              </Box>
            </Stack>

            {/* Action Buttons */}
            <Box sx={{ mt: 5, pt: 4, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving || uploading}
                sx={{ 
                  flexGrow: { xs: 1, sm: 0 },
                  fontWeight: 700,
                  py: 1.5,
                  px: 4,
                }}
              >
                {saving ? 'Saving...' : config ? 'Update & Deploy' : 'Save & Deploy'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card 
          sx={{ 
            backgroundColor: 'info.lighter',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            border: '1px solid',
            borderColor: 'info.light',
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5, color: 'info.dark' }}>
              What happens when you save?
            </Typography>
            <Box component="ul" sx={{ ml: 2, mb: 0, '& li': { mb: 1.5, color: 'info.dark', fontWeight: 500 } }}>
              <Typography component="li" variant="body2">
                Saves your business configuration securely
              </Typography>
              <Typography component="li" variant="body2">
                Automatically deploys persistent menu to Instagram DMs
              </Typography>
              <Typography component="li" variant="body2">
                Customers can browse products and place orders
              </Typography>
              <Typography component="li" variant="body2">
                Your payment QR codes will be shown at checkout
              </Typography>
              <Typography component="li" variant="body2">
                Support info will be accessible to all buyers
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
