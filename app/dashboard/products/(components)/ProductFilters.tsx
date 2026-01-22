'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ProductFilters } from '@/app/dashboard/lib/types/product';
import { fetchCategories } from '@/app/dashboard/lib/services/productService';

interface ProductFiltersProps {
  filters: ProductFilters;
  onFilterChange: (filters: ProductFilters) => void;
}

export const ProductFilterComponent: React.FC<ProductFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await fetchCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    };
    void loadCategories();
  }, []);

  // Update local search input when filters change from outside
  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onFilterChange({
        ...filters,
        search: searchInput,
      });
    }
  };

  const handleCategoryChange = (e: any) => {
    const value = e.target.value;
    onFilterChange({
      ...filters,
      category: value === '' ? undefined : value,
    });
  };

  const handleActiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      is_active: e.target.checked ? true : undefined,
    });
  };

  const handleReset = () => {
    setSearchInput('');
    onFilterChange({});
  };

  const handleSearchNow = () => {
    onFilterChange({
      ...filters,
      search: searchInput,
    });
  };

  return (
    <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            placeholder="Search products (press Enter)..."
            value={searchInput}
            onChange={handleSearchInputChange}
            onKeyDown={handleSearchKeyDown}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'gray' }} />,
            }}
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={filters.category || ''}
              onChange={handleCategoryChange}
              label="Category"
              disabled={loadingCategories}
            >
              <MenuItem value="">
                <em>All Categories</em>
              </MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
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
        <Grid size={{ xs: 12, sm: 3, md: 2 }}>
          <Button
            fullWidth
            onClick={handleSearchNow}
            variant="contained"
            size="small"
          >
            Search
          </Button>
        </Grid>
        <Grid size={{ xs: 12, sm: 3, md: 2 }}>
          <Button
            fullWidth
            onClick={handleReset}
            variant="outlined"
            size="small"
          >
            Reset
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};
