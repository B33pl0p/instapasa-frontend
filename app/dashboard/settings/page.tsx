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
    <Box sx={{ py: 4, backgroundColor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            Business Settings
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {config ? 'Manage your business configuration and Instagram menu' : 'Set up your business to start selling'}
          </Typography>
        </Box>

        {/* Welcome Banner for First Time */}
        {!config && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              👋 Welcome to Your Dashboard!
            </Typography>
            <Typography variant="body2">
              Let's set up your business information. This will be used to configure your Instagram shopping experience.
            </Typography>
          </Alert>
        )}

        {/* Form Card */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3}>
              {/* Business Description */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
                  Business Description
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.business_description}
                  onChange={(e) => setFormData({ ...formData, business_description: e.target.value })}
                  placeholder="What does your business do? (e.g., We sell handmade jewelry and custom accessories)"
                  inputProps={{ maxLength: 1000 }}
                  variant="outlined"
                />
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                  {formData.business_description.length}/1000 characters
                </Typography>
              </Box>

              {/* Support Email and Phone */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
                  Support Email
                </Typography>
                <TextField
                  fullWidth
                  type="email"
                  value={formData.support_email}
                  onChange={(e) => setFormData({ ...formData, support_email: e.target.value })}
                  placeholder="support@yourbusiness.com"
                  variant="outlined"
                />
                </Box>

              {/* Support Phone */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
                  Support Phone
                </Typography>
                <TextField
                  fullWidth
                  type="tel"
                  value={formData.support_phone}
                  onChange={(e) => setFormData({ ...formData, support_phone: e.target.value })}
                  placeholder="+1234567890"
                  variant="outlined"
                />
              </Box>
              </Stack>

              {/* Payment QR Codes */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Payment QR Codes
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Upload QR codes for eSewa, Khalti, FonePay, or other payment methods
                </Typography>

                {/* QR Code Grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                  {formData.payment_qr_codes.map((url, index) => (
                    <Box key={url}>
                      <Paper
                        sx={{
                          position: 'relative',
                          overflow: 'hidden',
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
                        <Tooltip title="Delete">
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
                              color: 'white',
                              '&:hover': {
                                backgroundColor: 'error.dark',
                              },
                            }}
                            size="small"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Paper>
                    </Box>
                  ))}

                  {/* Upload Button */}
                  <Paper
                      component="label"
                      sx={{
                        height: 120,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        opacity: uploading ? 0.6 : 1,
                        transition: 'all 0.2s',
                        border: '2px dashed',
                        borderColor: 'divider',
                        '&:hover': {
                          borderColor: 'primary.main',
                          backgroundColor: 'action.hover',
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
                          <CircularProgress size={24} sx={{ mb: 1 }} />
                          <Typography variant="caption">Uploading...</Typography>
                        </>
                      ) : (
                        <>
                          <CloudUploadIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                          <Typography variant="caption" sx={{ textAlign: 'center' }}>
                            Add QR Code
                          </Typography>
                        </>
                      )}
                    </Paper>
                </Box>
              </Box>
            </Stack>

            {/* Action Buttons */}
            <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving || uploading}
                sx={{ flexGrow: { xs: 1, sm: 0 } }}
              >
                {saving ? 'Saving...' : config ? 'Update & Deploy Menu' : 'Save & Deploy Menu'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card sx={{ backgroundColor: 'action.hover' }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
              ℹ️ What happens when you save?
            </Typography>
            <Box component="ul" sx={{ ml: 2, mb: 0 }}>
              <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                Saves your business configuration
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                Automatically deploys persistent menu to Instagram DMs
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                Customers can browse products and place orders
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                Your payment QR codes will be shown at checkout
              </Typography>
              <Typography component="li" variant="body2">
                Support info will be accessible to buyers
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
