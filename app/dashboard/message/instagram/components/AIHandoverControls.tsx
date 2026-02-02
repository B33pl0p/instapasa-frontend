'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
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
  const [pauseMenuAnchor, setPauseMenuAnchor] = useState<null | HTMLElement>(null);
  const [reasonDialogOpen, setReasonDialogOpen] = useState(false);
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePauseClick = (event: React.MouseEvent<HTMLElement>) => {
    setPauseMenuAnchor(event.currentTarget);
  };

  const handlePauseClose = () => {
    setPauseMenuAnchor(null);
  };

  const handlePauseAI = async (reason?: string) => {
    handlePauseClose();
    setLoading(true);
    try {
      await dispatch(pauseAI({ conversationId, reason })).unwrap();
    } catch (error) {
      console.error('Failed to pause AI:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeAI = async () => {
    setLoading(true);
    try {
      await dispatch(resumeAI(conversationId)).unwrap();
    } catch (error) {
      console.error('Failed to resume AI:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkResolved = async (resumeAI: boolean) => {
    setLoading(true);
    try {
      await dispatch(markResolved({ conversationId, resumeAI })).unwrap();
    } catch (error) {
      console.error('Failed to mark resolved:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomReasonSubmit = () => {
    setReasonDialogOpen(false);
    handlePauseAI(customReason);
    setCustomReason('');
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
            onClick={handlePauseClick}
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

      <Menu
        anchorEl={pauseMenuAnchor}
        open={Boolean(pauseMenuAnchor)}
        onClose={handlePauseClose}
      >
        <MenuItem onClick={() => handlePauseAI('manual')}>
          Manual Intervention
        </MenuItem>
        <MenuItem onClick={() => handlePauseAI('complaint')}>
          Customer Complaint
        </MenuItem>
        <MenuItem onClick={() => handlePauseAI('explicit_request')}>
          Customer Requested Human
        </MenuItem>
        <MenuItem
          onClick={() => {
            handlePauseClose();
            setReasonDialogOpen(true);
          }}
        >
          Custom Reason...
        </MenuItem>
      </Menu>

      <Dialog open={reasonDialogOpen} onClose={() => setReasonDialogOpen(false)}>
        <DialogTitle>Pause AI - Custom Reason</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason"
            fullWidth
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="Enter custom reason for pausing AI"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReasonDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCustomReasonSubmit} variant="contained">
            Pause AI
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AIHandoverControls;
