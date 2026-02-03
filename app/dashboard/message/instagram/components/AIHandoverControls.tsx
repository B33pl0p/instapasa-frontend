'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  SmartToy as AIIcon,
  Pause as PauseIcon,
  PlayArrow as ResumeIcon,
  CheckCircle as ResolvedIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useAppDispatch } from '@/app/dashboard/lib/hooks';
import { pauseAI, resumeAI, markResolved } from '@/app/dashboard/lib/slices/instagramMessagesSlice';
import { useToast } from '@/app/dashboard/lib/components/ToastContainer';

interface AIHandoverControlsProps {
  conversationId: string;
  aiPaused: boolean;
  needsHumanAttention: boolean;
  handoverReason?: string | null;
}

const AIHandoverControls: React.FC<AIHandoverControlsProps> = ({
  conversationId,
  aiPaused,
  needsHumanAttention,
  handoverReason,
}) => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handlePauseAI = async () => {
    setLoading(true);
    try {
      await dispatch(pauseAI(conversationId)).unwrap();
      showToast('AI paused successfully', 'success');
    } catch (error: any) {
      const errorMessage = typeof error === 'string' 
        ? error 
        : error?.message || error?.msg || 'Failed to pause AI';
      showToast(errorMessage, 'error');
      console.error('Failed to pause AI:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeAI = async () => {
    setLoading(true);
    try {
      await dispatch(resumeAI(conversationId)).unwrap();
      showToast('AI resumed successfully', 'success');
    } catch (error: any) {
      const errorMessage = typeof error === 'string' 
        ? error 
        : error?.message || error?.msg || 'Failed to resume AI';
      showToast(errorMessage, 'error');
      console.error('Failed to resume AI:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkResolved = async (resumeAI: boolean) => {
    setLoading(true);
    try {
      await dispatch(markResolved({ conversationId, resumeAI })).unwrap();
      showToast('Conversation marked as resolved', 'success');
    } catch (error: any) {
      const errorMessage = typeof error === 'string' 
        ? error 
        : error?.message || error?.msg || 'Failed to mark as resolved';
      showToast(errorMessage, 'error');
      console.error('Failed to mark resolved:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = () => {
    if (needsHumanAttention) {
      return (
        <Chip
          icon={<WarningIcon />}
          label={`Needs Attention${handoverReason ? `: ${formatReason(handoverReason)}` : ''}`}
          color="error"
          size="small"
          sx={{ mr: 1 }}
        />
      );
    }
    if (aiPaused) {
      return (
        <Chip
          icon={<PauseIcon />}
          label="AI Paused"
          color="warning"
          size="small"
          sx={{ mr: 1 }}
        />
      );
    }
    return (
      <Chip
        icon={<AIIcon />}
        label="AI Active"
        color="success"
        size="small"
        sx={{ mr: 1 }}
      />
    );
  };

  const formatReason = (reason: string): string => {
    if (reason === 'manual') return 'Manual Intervention';
    if (reason.startsWith('low_confidence')) {
      const confidence = reason.split('_')[2];
      return `Low Confidence (${confidence})`;
    }
    if (reason === 'explicit_request') return 'Customer Request';
    if (reason === 'complaint') return 'Complaint';
    return reason;
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {getStatusChip()}

      {aiPaused ? (
        <Tooltip title="Resume AI responses">
          <IconButton
            onClick={handleResumeAI}
            disabled={loading}
            color="success"
            size="small"
          >
            <ResumeIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Pause AI responses">
          <IconButton
            onClick={handlePauseAI}
            disabled={loading}
            color="warning"
            size="small"
          >
            <PauseIcon />
          </IconButton>
        </Tooltip>
      )}

      {needsHumanAttention && (
        <>
          <Tooltip title="Mark as resolved and resume AI">
            <Button
              onClick={() => handleMarkResolved(true)}
              disabled={loading}
              startIcon={<ResolvedIcon />}
              size="small"
              color="success"
              variant="outlined"
              sx={{ ml: 1 }}
            >
              Resolve & Resume
            </Button>
          </Tooltip>
          <Tooltip title="Mark as resolved but keep AI paused">
            <Button
              onClick={() => handleMarkResolved(false)}
              disabled={loading}
              size="small"
              color="primary"
              variant="text"
              sx={{ ml: 1 }}
            >
              Resolve Only
            </Button>
          </Tooltip>
        </>
      )}
    </Box>
  );
};

export default AIHandoverControls;
