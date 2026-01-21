'use client';

import React from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ProductFilters } from '@/app/dashboard/lib/types/product';

interface ProductFiltersProps {
  filters: ProductFilters;
  onFilterChange: (filters: ProductFilters) => void;
}

export const ProductFilterComponent: React.FC<ProductFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      search: e.target.value,
    });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      category: e.target.value,
    });
  };

  const handleActiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      is_active: e.target.checked ? true : undefined,
    });
  };

  const handleReset = () => {
    onFilterChange({});
  };

  return (
    <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            placeholder="Search products..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'gray' }} />,
            }}
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            placeholder="Filter by category..."
            value={filters.category || ''}
            onChange={handleCategoryChange}
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={filters.is_active === true}
                onChange={handleActiveChange}
              />
            }
            label="Active Only"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Button
            fullWidth
            onClick={handleReset}
            variant="outlined"
            size="small"
          >
            Reset Filters
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};
