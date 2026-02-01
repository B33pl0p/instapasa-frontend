'use client';

import { Suspense, useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Stack,
  Avatar,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
} from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';
import WarningIcon from '@mui/icons-material/Warning';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import IntegrationCard from './(components)/IntegrationCard';
import { useInstagramAuth } from './(components)/useInstagramAuth';
import { profileService } from '../lib/services/profileService';
import type { SellerProfile, UpdateProfileRequest } from '../lib/types/profile';
import { useToast } from '../lib/components/ToastContainer';
import { useRouter } from 'next/navigation';
import apiClient from '../lib/apiClient';

function MessageContent() {
  const router = useRouter();
  const { showToast } = useToast();
  const { status: instagramStatus, disconnect: disconnectInstagram } = useInstagramAuth();
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [togglingMessages, setTogglingMessages] = useState(false);

  const [profileData, setProfileData] = useState({
    business_name: '',
    brand_description: '',
    tone: 'friendly',
    phone: '',
    website: '',
    company_contact_person: '',
    contact_person_role: '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileService.getProfile();
        setProfile(data);
        setProfileData({
          business_name: data.business_name || '',
          brand_description: data.brand_description || '',
          tone: data.tone || 'friendly',
          phone: data.phone || '',
          website: data.website || '',
          company_contact_person: data.company_contact_person || '',
          contact_person_role: data.contact_person_role || '',
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const updateData: UpdateProfileRequest = {};
      
      if (profileData.business_name !== profile?.business_name) updateData.business_name = profileData.business_name;
      if (profileData.brand_description !== profile?.brand_description) updateData.brand_description = profileData.brand_description;
      if (profileData.tone !== profile?.tone) updateData.tone = profileData.tone;
      if (profileData.phone !== profile?.phone) updateData.phone = profileData.phone;
      if (profileData.website !== profile?.website) updateData.website = profileData.website;
      if (profileData.company_contact_person !== profile?.company_contact_person) updateData.company_contact_person = profileData.company_contact_person;
      if (profileData.contact_person_role !== profile?.contact_person_role) updateData.contact_person_role = profileData.contact_person_role;

      if (Object.keys(updateData).length === 0) {
        showToast('No changes to save', 'info');
        return;
      }

      const result = await profileService.updateProfile(updateData);
      showToast(result.message, 'success');
      
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (passwordData.new_password.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }

    try {
      const result = await profileService.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      showToast(result.message, 'success');
      setPasswordModalOpen(false);
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to change password', 'error');
    }
  };

  const handleDeactivateAccount = async () => {
    try {
      const result = await profileService.deactivateAccount();
      showToast(result.message, 'success');
      localStorage.removeItem('auth_token');
      router.push('/login');
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to deactivate account', 'error');
    }
  };

  const handleDisconnectClick = () => {
    setDisconnectDialogOpen(true);
  };

  const handleDisconnectConfirm = async () => {
    try {
      await apiClient.post('/auth/meta/disconnect');
      showToast('Instagram disconnected successfully', 'success');
      
      // Refresh profile
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to disconnect Instagram', 'error');
    } finally {
      setDisconnectDialogOpen(false);
    }
  };

  const handleDisconnectCancel = () => {
    setDisconnectDialogOpen(false);
  };

  const handleDisableWebhooks = async () => {
    setTogglingMessages(true);
    try {
      await apiClient.post('/auth/meta/unsubscribe-webhooks');
      showToast('Real-time messages disabled', 'success');
      
      // Refresh profile
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to disable real-time messages', 'error');
    } finally {
      setTogglingMessages(false);
    }
  };

  const handleEnableWebhooks = async () => {
    setTogglingMessages(true);
    try {
      await apiClient.post('/auth/meta/subscribe-webhooks');
      showToast('Real-time messages enabled', 'success');
      
      // Refresh profile
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to enable real-time messages', 'error');
    } finally {
      setTogglingMessages(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const rawHash = window.location.hash;
    const hash = rawHash.startsWith('#') ? rawHash.substring(1) : rawHash;

    if (!hash) return;

    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const errorReason = params.get('error_reason');

    // Redirect to the new onboarding flow for Instagram
    // Note: This is for backward compatibility if someone uses old callback URL
    if (accessToken && !errorReason) {
      // Redirect to new Instagram onboarding page with the hash
      window.location.href = '/dashboard/message/instagram-onboarding' + window.location.hash;
    }
  }, []);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, backgroundColor: 'background.default', minHeight: '100vh' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
            Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your account and integrations
          </Typography>
        </Box>

        <Stack spacing={2}>
          {/* Instagram Integration */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <InstagramIcon sx={{ color: '#E1306C', fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Instagram Connection
              </Typography>
            </Box>
            
            {profile?.instagram_connected ? (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: 2,
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}>
                <Avatar 
                  src={profile.instagram_profile_picture_url || ''} 
                  sx={{ width: 56, height: 56 }}
                >
                  <InstagramIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.25 }}>
                    @{profile.instagram_username}
                  </Typography>
                  {profile.instagram_name && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {profile.instagram_name}
                    </Typography>
                  )}
                  <Chip 
                    label="Connected" 
                    color="success" 
                    size="small"
                    sx={{ height: 24, fontSize: '12px' }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, fontSize: '13px' }}>
                    Your Instagram account is successfully connected and ready to receive messages.
                  </Typography>
                  
                  {/* Instagram Stats */}
                  {(profile.instagram_followers != null || profile.instagram_following != null || profile.instagram_posts != null) && (
                    <Box sx={{ display: 'flex', gap: 3, mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                      {profile.instagram_followers != null && (
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {profile.instagram_followers.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
                            Followers
                          </Typography>
                        </Box>
                      )}
                      {profile.instagram_following != null && (
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {profile.instagram_following.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
                            Following
                          </Typography>
                        </Box>
                      )}
                      {profile.instagram_posts != null && (
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {profile.instagram_posts.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
                            Posts
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
                <Stack spacing={1} alignItems="flex-end">
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleDisconnectClick}
                    size="small"
                  >
                    Disconnect
                  </Button>
                  {profile.webhook_subscribed ? (
                    <Button
                      variant="text"
                      color="warning"
                      onClick={handleDisableWebhooks}
                      disabled={togglingMessages}
                      size="small"
                      startIcon={togglingMessages ? <CircularProgress size={16} /> : <NotificationsOffIcon />}
                      sx={{ fontSize: '13px' }}
                    >
                      {togglingMessages ? 'Disabling...' : 'Disable Real-time'}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleEnableWebhooks}
                      disabled={togglingMessages}
                      size="small"
                      startIcon={togglingMessages ? <CircularProgress size={16} /> : <NotificationsOffIcon />}
                      sx={{ fontSize: '13px' }}
                    >
                      {togglingMessages ? 'Enabling...' : 'Enable Real-time'}
                    </Button>
                  )}
                </Stack>
              </Box>
            ) : (
              <Box>
                <Alert severity="info" sx={{ mb: 2, fontSize: '13px' }}>
                  Connect your Instagram Business account to start receiving and managing messages from your customers.
                </Alert>
                <Box sx={{ maxWidth: 400 }}>
                  <IntegrationCard
                    name="Instagram"
                    status={instagramStatus}
                    onDisconnect={handleDisconnectClick}
                    image={
                      <InstagramIcon sx={{ fontSize: 32, color: 'text.primary' }} />
                    }
                  />
                </Box>
              </Box>
            )}
          </Paper>

          {/* Account Info */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Account Information
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                sx={{ 
                  width: 56, 
                  height: 56, 
                  bgcolor: 'primary.main',
                  fontSize: 20,
                  fontWeight: 600
                }}
              >
                {profile?.business_name?.charAt(0)?.toUpperCase() || profile?.email?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.25 }}>
                  {profile?.business_name || 'Your Business'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px' }}>
                  {profile?.email}
                </Typography>
              </Box>
              <Chip
                label={profile?.status || 'Active'}
                color={profile?.status === 'verified' ? 'success' : 'default'}
                size="small"
                sx={{ height: 24, fontSize: '12px' }}
              />
            </Box>
          </Paper>

          {/* Business Info */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Business Information
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Business Name"
                value={profileData.business_name}
                onChange={(e) => setProfileData({ ...profileData, business_name: e.target.value })}
                placeholder="My Store"
                size="small"
              />
              <TextField
                fullWidth
                label="Brand Description"
                value={profileData.brand_description}
                onChange={(e) => setProfileData({ ...profileData, brand_description: e.target.value })}
                placeholder="What does your business do?"
                multiline
                rows={3}
                helperText="This helps our AI assistant understand your business"
                size="small"
              />
              <FormControl fullWidth size="small">
                <InputLabel>Brand Tone</InputLabel>
                <Select
                  value={profileData.tone}
                  label="Brand Tone"
                  onChange={(e) => setProfileData({ ...profileData, tone: e.target.value })}
                >
                  <MenuItem value="friendly">Friendly</MenuItem>
                  <MenuItem value="professional">Professional</MenuItem>
                  <MenuItem value="casual">Casual</MenuItem>
                  <MenuItem value="luxury">Luxury</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="+91..."
                size="small"
              />
              <TextField
                fullWidth
                label="Website"
                value={profileData.website}
                onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                placeholder="https://..."
                size="small"
              />
            </Stack>
          </Paper>

          {/* Contact Person */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Contact Person
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Name"
                value={profileData.company_contact_person}
                onChange={(e) => setProfileData({ ...profileData, company_contact_person: e.target.value })}
                size="small"
              />
              <TextField
                fullWidth
                label="Role"
                value={profileData.contact_person_role}
                onChange={(e) => setProfileData({ ...profileData, contact_person_role: e.target.value })}
                placeholder="Owner, Manager, etc."
                size="small"
              />
            </Stack>
          </Paper>

          <Box>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
              onClick={handleUpdateProfile}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Security */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Security
            </Typography>
            <Button
              variant="outlined"
              startIcon={<LockIcon />}
              onClick={() => setPasswordModalOpen(true)}
              size="small"
            >
              Change Password
            </Button>
          </Paper>

          {/* Danger Zone */}
          <Paper sx={{ p: 3, border: '1px solid', borderColor: 'error.main' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: 'error.main' }}>
              Danger Zone
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '13px' }}>
              Deactivating your account will disconnect Instagram and prevent login.
            </Typography>
            <Button
              variant="outlined"
              color="error"
              startIcon={<WarningIcon />}
              onClick={() => setDeactivateModalOpen(true)}
              size="small"
            >
              Deactivate Account
            </Button>
          </Paper>
        </Stack>

        {/* Disconnect Confirmation Dialog */}
        <Dialog
        open={disconnectDialogOpen}
        onClose={handleDisconnectCancel}
        aria-labelledby="disconnect-dialog-title"
        aria-describedby="disconnect-dialog-description"
      >
        <DialogTitle id="disconnect-dialog-title">
          Disconnect Instagram
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="disconnect-dialog-description">
            Are you sure you want to disconnect your Instagram account? You will need to reconnect to access Instagram messages and features.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDisconnectCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDisconnectConfirm} color="error" variant="contained" autoFocus>
            Disconnect
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              type="password"
              label="Current Password"
              value={passwordData.current_password}
              onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
            />
            <TextField
              fullWidth
              type="password"
              label="New Password"
              value={passwordData.new_password}
              onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
              helperText="At least 8 characters"
            />
            <TextField
              fullWidth
              type="password"
              label="Confirm New Password"
              value={passwordData.confirm_password}
              onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordModalOpen(false)}>Cancel</Button>
          <Button onClick={handleChangePassword} variant="contained">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deactivate Account Dialog */}
      <Dialog
        open={deactivateModalOpen}
        onClose={() => setDeactivateModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main' }}>Deactivate Account</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Warning: This action cannot be undone
            </Typography>
            <Typography variant="body2">
              Deactivating your account will:
            </Typography>
            <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
              <li>Disconnect your Instagram account</li>
              <li>Prevent you from logging in</li>
              <li>Require contacting support to reactivate</li>
            </ul>
          </Alert>
          <DialogContentText>
            Are you sure you want to proceed with deactivating your account?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeactivateModalOpen(false)}>Cancel</Button>
          <Button onClick={handleDeactivateAccount} color="error" variant="contained">
            Deactivate Account
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  );
}

export default function Message() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="lg" sx={{ minHeight: '100vh', py: 8, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Profile & Integrations
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Loading...
            </Typography>
          </Box>
        </Container>
      }
    >
      <MessageContent />
    </Suspense>
  );
}