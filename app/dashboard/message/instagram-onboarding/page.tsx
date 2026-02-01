'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  CardActions,
  Alert,
  Avatar,
  Stack,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InstagramIcon from '@mui/icons-material/Instagram';
import apiClient from '../../lib/apiClient';

interface Page {
  page_id: string;
  page_name: string;
  instagram_business_id: string;
  instagram_username: string | null;
}

interface PagesResponse {
  pages: Page[];
  user_token: string;
}

const steps = ['Connect Instagram', 'Select Page', 'Connect Account', 'Setup Complete'];

export default function InstagramOnboardingPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Step 1: OAuth callback data
  const [accessToken, setAccessToken] = useState<string | null>(null);
  
  // Step 2: Available pages
  const [pages, setPages] = useState<Page[]>([]);
  const [userToken, setUserToken] = useState<string | null>(null);
  
  // Step 3: Selected page
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [connectionData, setConnectionData] = useState<any>(null);

  // Step 1: Extract access token from URL hash
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const rawHash = window.location.hash;
    const hash = rawHash.startsWith('#') ? rawHash.substring(1) : rawHash;

    if (!hash) {
      setError('No authentication data found. Please try connecting again.');
      return;
    }

    const params = new URLSearchParams(hash);
    const token = params.get('access_token');
    const errorReason = params.get('error_reason');

    if (errorReason) {
      setError('Authentication was cancelled or failed.');
      return;
    }

    if (!token) {
      setError('No access token received.');
      return;
    }

    setAccessToken(token);
    setActiveStep(1);

    // Clear hash from URL
    window.history.replaceState(null, '', window.location.pathname);
  }, []);

  // Step 2: Fetch pages when we have access token
  useEffect(() => {
    if (!accessToken || activeStep !== 1) return;

    const fetchPages = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<PagesResponse>(
          `/auth/meta/pages?access_token=${accessToken}`,
          { skipAuth: true } as any
        );
        
        if (response.data.pages.length === 0) {
          setError('No Instagram Business accounts found. Please make sure you have a Facebook Page linked to an Instagram Business account.');
          return;
        }

        setPages(response.data.pages);
        setUserToken(response.data.user_token);
        setActiveStep(2);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to fetch Instagram accounts. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, [accessToken, activeStep]);

  // Step 3: Connect selected page
  const handleConnectPage = async (page: Page) => {
    if (!userToken) {
      setError('Missing user token. Please try again.');
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedPage(page);

    try {
      const response = await apiClient.post('/auth/meta/connect-page', {
        user_token: userToken,
        page_id: page.page_id,
        instagram_business_id: page.instagram_business_id,
      });

      setConnectionData(response.data);
      setActiveStep(3);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to connect Instagram account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Subscribe to webhooks
  const handleSubscribeWebhooks = async () => {
    if (!connectionData?.page_id || !connectionData?.page_access_token) {
      setError('Missing connection data. Please try again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiClient.post('/auth/meta/subscribe-webhooks', {
        page_id: connectionData.page_id,
        page_access_token: connectionData.page_access_token,
      });

      setActiveStep(4);
      
      // Redirect to integrations page after a short delay
      setTimeout(() => {
        router.push('/dashboard/message');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to subscribe to webhooks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipWebhooks = () => {
    router.push('/dashboard/message');
  };

  return (
    <Container maxWidth="md" sx={{ py: 6, minHeight: '100vh' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Connect Instagram Business Account
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Follow the steps to connect your Instagram account
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
          <Button
            size="small"
            onClick={() => router.push('/dashboard/message')}
            sx={{ ml: 2 }}
          >
            Back to Integrations
          </Button>
        </Alert>
      )}

      {loading && (
        <Box display="flex" flexDirection="column" alignItems="center" py={4}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            {activeStep === 1 && 'Loading your Instagram accounts...'}
            {activeStep === 2 && 'Connecting account...'}
            {activeStep === 3 && 'Setting up webhooks...'}
          </Typography>
        </Box>
      )}

      {/* Step 1: Processing OAuth */}
      {activeStep === 1 && !loading && !error && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Processing authentication...
          </Typography>
        </Paper>
      )}

      {/* Step 2: Select Page */}
      {activeStep === 2 && !loading && pages.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Select Instagram Account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Choose the Instagram Business account you want to connect
          </Typography>
          <Stack spacing={2}>
            {pages.map((page) => (
              <Card key={page.page_id} variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <InstagramIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {page.instagram_username || 'Unknown Username'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Facebook Page: {page.page_name}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    variant="contained"
                    onClick={() => handleConnectPage(page)}
                    disabled={loading}
                  >
                    Connect This Account
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Stack>
        </Paper>
      )}

      {/* Step 3: Webhook Subscription */}
      {activeStep === 3 && !loading && connectionData && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Instagram Account Connected!
            </Typography>
            <Chip
              avatar={
                <Avatar src={connectionData.profile_picture_url}>
                  <InstagramIcon />
                </Avatar>
              }
              label={`@${connectionData.instagram_username}`}
              color="success"
              sx={{ mb: 2 }}
            />
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Enable Real-time Messages (Recommended)
            </Typography>
            <Typography variant="body2">
              Subscribe to webhooks to receive customer messages instantly. This enables:
            </Typography>
            <ul style={{ marginTop: 8, marginBottom: 0 }}>
              <li>Real-time message notifications</li>
              <li>Instant automated responses</li>
              <li>Live order processing</li>
            </ul>
          </Alert>

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              onClick={handleSkipWebhooks}
              disabled={loading}
            >
              Skip for Now
            </Button>
            <Button
              variant="contained"
              onClick={handleSubscribeWebhooks}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Subscribing...' : 'Enable Webhooks'}
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Step 4: Complete */}
      {activeStep === 4 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Setup Complete!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Your Instagram account is now connected and ready to receive messages.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Redirecting to integrations page...
          </Typography>
        </Paper>
      )}
    </Container>
  );
}
