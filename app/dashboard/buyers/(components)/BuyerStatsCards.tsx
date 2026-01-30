'use client';

import { Box, Card, CardContent, Typography, CircularProgress, Stack } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import WarningIcon from '@mui/icons-material/Warning';
import type { BuyerStats, BuyerStatusFilter } from '@/app/dashboard/lib/types/buyer';

interface BuyerStatsCardsProps {
  stats: BuyerStats | null;
  loading: boolean;
  onFilterClick: (filter: BuyerStatusFilter) => void;
}

export default function BuyerStatsCards({ stats, loading, onFilterClick }: BuyerStatsCardsProps) {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      label: 'Total Buyers',
      value: stats.total_buyers,
      icon: <PeopleIcon sx={{ fontSize: 32 }} />,
      color: 'primary.main',
      bgColor: 'primary.lighter',
      filter: 'all' as BuyerStatusFilter,
    },
    {
      label: 'Frequent Buyers',
      value: stats.frequent_buyers,
      icon: <StarIcon sx={{ fontSize: 32 }} />,
      color: 'warning.main',
      bgColor: 'warning.lighter',
      subtitle: '5+ orders',
      filter: 'frequent' as BuyerStatusFilter,
    },
    {
      label: 'New Buyers',
      value: stats.new_buyers,
      icon: <NewReleasesIcon sx={{ fontSize: 32 }} />,
      color: 'success.main',
      bgColor: 'success.lighter',
      subtitle: 'First-time customers',
      filter: 'new' as BuyerStatusFilter,
    },
    {
      label: 'At Risk',
      value: stats.at_risk_buyers,
      icon: <WarningIcon sx={{ fontSize: 32 }} />,
      color: 'error.main',
      bgColor: 'error.lighter',
      subtitle: 'No order 30+ days',
      filter: 'at_risk' as BuyerStatusFilter,
    },
  ];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
      {cards.map((card) => (
        <Card
          key={card.label}
          sx={{
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              height: '100%',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              },
            }}
            onClick={() => onFilterClick(card.filter)}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack spacing={2}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: card.bgColor,
                      color: card.color,
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
                    {card.value.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {card.label}
                  </Typography>
                  {card.subtitle && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {card.subtitle}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>
      ))}
    </Box>
  );
}
