'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import ChatIcon from '@mui/icons-material/Chat';
import PercentIcon from '@mui/icons-material/Percent';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import apiClient from '@/app/dashboard/lib/apiClient';
import RouteGuard from '@/app/dashboard/message/(components)/RouteGuard';

interface AnalyticsData {
  total_revenue: number;
  total_orders_sold: number;
  average_order_value: number;
  best_selling_product: {
    product_id: string;
    product_name: string;
    units_sold: number;
    total_revenue: number;
  };
  total_units_sold: number;
  revenue_per_product: Array<{
    product_id: string;
    product_name: string;
    total_revenue: number;
    units_sold: number;
  }>;
  week_orders: number;
  month_orders: number;
  total_conversations: number;
  total_messages: number;
  chat_to_order_conversion_rate: number;
  abandoned_chats: number;
  active_chats: number;
  most_asked_questions: Array<{
    question: string;
    frequency: number;
  }>;
  low_stock_products: Array<{
    product_id: string;
    product_name: string;
    current_stock: number;
    threshold: number;
  }>;
}

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtext?: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}> = ({ title, value, icon, subtext, color = 'primary' }) => {
  const theme = useTheme();
  const colorMap = {
    primary: theme.palette.primary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main,
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography color="textSecondary" sx={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>
            {title}
          </Typography>
          <Box sx={{ color: colorMap[color], display: 'flex', alignItems: 'center' }}>
            {icon}
          </Box>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {value}
        </Typography>
        {subtext && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {subtext}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/dashboard/analytics');
      setAnalytics(response.data);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to load analytics';
      setError(errorMessage);
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <RouteGuard>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress />
        </Box>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            Analytics Dashboard
          </Typography>
          <Typography color="textSecondary" sx={{ fontSize: '0.875rem' }}>
            Real-time metrics for your store performance
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {analytics && (
          <>
            {/* Sales Metrics Section */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 3 }}>
              Sales Metrics
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 4 }}>
              <Box>
                <MetricCard
                  title="Total Revenue"
                  value={`Rs ${analytics.total_revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                  icon={<CurrencyRupeeIcon sx={{ fontSize: 28 }} />}
                  subtext={`${analytics.total_orders_sold} orders`}
                  color="success"
                />
              </Box>
              <Box>
                <MetricCard
                  title="Total Orders"
                  value={analytics.total_orders_sold}
                  icon={<ShoppingCartIcon sx={{ fontSize: 28 }} />}
                  subtext={`Avg: Rs ${analytics.average_order_value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                  color="primary"
                />
              </Box>
              <Box>
                <MetricCard
                  title="Units Sold"
                  value={analytics.total_units_sold}
                  icon={<TrendingUpIcon sx={{ fontSize: 28 }} />}
                  subtext={`Avg per order: ${(analytics.total_units_sold / analytics.total_orders_sold || 0).toFixed(1)}`}
                  color="info"
                />
              </Box>
            </Box>

            {/* Best Selling Product */}
            {analytics.best_selling_product && (
              <Box sx={{ mb: 4 }}>
                <Card
                  sx={{
                    height: '100%',
                  }}
                >
                  <CardContent>
                    <Typography color="textSecondary" sx={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', mb: 2 }}>
                      Best Selling Product
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {analytics.best_selling_product.product_name}
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <Box>
                        <Typography color="textSecondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                          Revenue
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Rs {analytics.best_selling_product.total_revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography color="textSecondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                          Units Sold
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {analytics.best_selling_product.units_sold}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            )}

            {/* Average Order Value */}
            <Box sx={{ mb: 4 }}>
              <MetricCard
                title="Average Order Value"
                value={`Rs ${analytics.average_order_value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                icon={<CurrencyRupeeIcon sx={{ fontSize: 28 }} />}
                color="warning"
              />
            </Box>

            {/* Period Metrics */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 3 }}>
              Period Metrics
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 4 }}>
              <Box>
                <MetricCard
                  title="Orders This Week"
                  value={analytics.week_orders}
                  icon={<TrendingUpIcon sx={{ fontSize: 28 }} />}
                  color="info"
                />
              </Box>
              <Box>
                <MetricCard
                  title="Orders This Month"
                  value={analytics.month_orders}
                  icon={<TrendingUpIcon sx={{ fontSize: 28 }} />}
                  color="success"
                />
              </Box>
            </Box>

            {/* Chat Metrics */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 3 }}>
              Chat & Engagement Metrics
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 4 }}>
              <Box>
                <MetricCard
                  title="Total Conversations"
                  value={analytics.total_conversations}
                  icon={<ChatIcon sx={{ fontSize: 28 }} />}
                  color="info"
                />
              </Box>
              <Box>
                <MetricCard
                  title="Total Messages"
                  value={analytics.total_messages}
                  icon={<ChatIcon sx={{ fontSize: 28 }} />}
                  color="primary"
                />
              </Box>
              <Box>
                <MetricCard
                  title="Conversion Rate"
                  value={`${analytics.chat_to_order_conversion_rate.toFixed(1)}%`}
                  icon={<PercentIcon sx={{ fontSize: 28 }} />}
                  color="success"
                />
              </Box>
              <Box>
                <MetricCard
                  title="Active Chats"
                  value={analytics.active_chats}
                  icon={<CheckCircleIcon sx={{ fontSize: 28 }} />}
                  color="success"
                />
              </Box>
              <Box sx={{ gridColumn: { xs: '1 / -1', sm: 'auto', md: 'auto' } }}>
                <MetricCard
                  title="Abandoned Chats"
                  value={analytics.abandoned_chats}
                  icon={<WarningIcon sx={{ fontSize: 28 }} />}
                  color="warning"
                />
              </Box>
            </Box>

            {/* Revenue per Product Table */}
            {analytics.revenue_per_product.length > 0 && (
              <>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 3 }}>
                  Revenue by Product
                </Typography>
                <TableContainer component={Paper} sx={{ mb: 4 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                        <TableCell sx={{ fontWeight: 600 }}>Product Name</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          Revenue
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          Units Sold
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analytics.revenue_per_product.map((product, index) => (
                        <TableRow key={index} hover>
                          <TableCell>{product.product_name}</TableCell>
                          <TableCell align="right">
                            Rs {product.total_revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </TableCell>
                          <TableCell align="right">{product.units_sold}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {/* Most Asked Questions */}
            {analytics.most_asked_questions.length > 0 && (
              <>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 3 }}>
                  Most Asked Questions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                  {analytics.most_asked_questions.map((faq, index) => (
                    <Card
                      key={index}
                      sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography sx={{ flex: 1 }}>{faq.question}</Typography>
                      <Chip label={`${faq.frequency} times`} color="primary" variant="outlined" />
                    </Card>
                  ))}
                </Box>
              </>
            )}

            {/* Low Stock Products Alert */}
            {analytics.low_stock_products.length > 0 && (
              <>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 3 }}>
                  Low Stock Alert
                </Typography>
                <Alert
                  severity="warning"
                  sx={{ mb: 4 }}
                  icon={<WarningIcon />}
                >
                  <Typography sx={{ fontWeight: 600, mb: 1 }}>
                    {analytics.low_stock_products.length} product(s) with low stock
                  </Typography>
                  {analytics.low_stock_products.map((product) => (
                    <Box key={product.product_id} sx={{ ml: 2 }}>
                      <Typography variant="body2">
                        {product.product_name}: {product.current_stock}/{product.threshold} in stock
                      </Typography>
                    </Box>
                  ))}
                </Alert>
              </>
            )}
          </>
        )}
      </Box>
    </RouteGuard>
  );
}