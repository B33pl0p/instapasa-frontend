'use client';

import React from 'react';
import { AttributeDefinition, CategoryConfig } from '@/app/dashboard/lib/types/product';
import {
  TextField,
  Checkbox,
  FormControlLabel,
  Chip,
  Box,
  Stack,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from '@mui/material';

interface DynamicAttributeFieldsProps {
  categoryConfig: CategoryConfig | null;
  attributes: Record<string, any>;
  onChange: (attributes: Record<string, any>) => void;
  errors?: Record<string, string>;
}

export const DynamicAttributeFields: React.FC<DynamicAttributeFieldsProps> = ({
  categoryConfig,
  attributes,
  onChange,
  errors = {},
}) => {
  if (!categoryConfig || !categoryConfig.attributes || categoryConfig.attributes.length === 0) {
    return null;
  }

  const handleChange = (key: string, value: any) => {
    onChange({ ...attributes, [key]: value });
  };

  const renderField = (attr: AttributeDefinition) => {
    const value = attributes[attr.name] || '';
    const hasError = !!errors[attr.name];
    const errorMessage = errors[attr.name];

    switch (attr.type) {
      case 'text':
        return (
          <TextField
            key={attr.name}
            fullWidth
            label={attr.label}
            value={value}
            onChange={(e) => handleChange(attr.name, e.target.value)}
            placeholder={attr.placeholder}
            required={attr.required}
            error={hasError}
            helperText={hasError ? errorMessage : attr.help_text}
            variant="outlined"
            size="small"
          />
        );

      case 'number':
        return (
          <TextField
            key={attr.name}
            fullWidth
            label={attr.label}
            type="number"
            value={value}
            onChange={(e) => handleChange(attr.name, parseFloat(e.target.value) || '')}
            placeholder={attr.placeholder}
            required={attr.required}
            error={hasError}
            helperText={hasError ? errorMessage : attr.help_text}
            variant="outlined"
            size="small"
          />
        );

      case 'select':
        return (
          <FormControl key={attr.name} fullWidth size="small" error={hasError}>
            <InputLabel>{attr.label}</InputLabel>
            <Select
              value={value}
              label={attr.label}
              onChange={(e) => handleChange(attr.name, e.target.value)}
            >
              <MenuItem value="">
                <em>-- Select {attr.label} --</em>
              </MenuItem>
              {attr.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {hasError && <FormHelperText>{errorMessage}</FormHelperText>}
            {!hasError && attr.help_text && <FormHelperText>{attr.help_text}</FormHelperText>}
          </FormControl>
        );

      case 'multi_select': {
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <FormControl key={attr.name} fullWidth size="small" error={hasError}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                {attr.label}
                {attr.required && <span style={{ color: '#d32f2f' }}>*</span>}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                {selectedValues.map((val: string) => (
                  <Chip
                    key={val}
                    label={val}
                    onDelete={() => {
                      const newValues = selectedValues.filter((v: string) => v !== val);
                      handleChange(attr.name, newValues);
                    }}
                    size="small"
                    color="primary"
                  />
                ))}
              </Stack>
              <Select
                value=""
                onChange={(e) => {
                  if (e.target.value && !selectedValues.includes(e.target.value)) {
                    handleChange(attr.name, [...selectedValues, e.target.value]);
                  }
                }}
              >
                <MenuItem value="">
                  <em>-- Add {attr.label} --</em>
                </MenuItem>
                {attr.options
                  ?.filter((option) => !selectedValues.includes(option))
                  .map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
              </Select>
              {hasError && <FormHelperText error>{errorMessage}</FormHelperText>}
              {!hasError && attr.help_text && <FormHelperText>{attr.help_text}</FormHelperText>}
            </Box>
          </FormControl>
        );
      }

      case 'color':
        return (
          <Box key={attr.name}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              {attr.label}
              {attr.required && <span style={{ color: '#d32f2f' }}>*</span>}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <input
                type="color"
                value={value || '#000000'}
                onChange={(e) => handleChange(attr.name, e.target.value)}
                style={{
                  width: 60,
                  height: 40,
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              />
              <TextField
                value={value || ''}
                onChange={(e) => handleChange(attr.name, e.target.value)}
                placeholder="#000000"
                size="small"
                error={hasError}
                helperText={hasError ? errorMessage : attr.help_text}
                sx={{ flex: 1 }}
              />
            </Stack>
          </Box>
        );

      case 'boolean':
        return (
          <FormControlLabel
            key={attr.name}
            control={
              <Checkbox
                checked={!!value}
                onChange={(e) => handleChange(attr.name, e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                {attr.label}
                {attr.required && <span style={{ color: '#d32f2f' }}>*</span>}
              </Typography>
            }
          />
        );

      default:
        return null;
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {categoryConfig.display_name} Attributes
      </Typography>
      <Stack spacing={2}>
        {categoryConfig.attributes.map((attr) => renderField(attr))}
      </Stack>
    </Stack>
  );
};
