'use client';

import React from 'react';
import { AttributeDefinition, CategoryConfig } from '@/app/dashboard/lib/types/product';
import { TextField, Checkbox, FormControlLabel, Chip } from '@mui/material';

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
          <div key={attr.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {attr.label}
              {attr.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleChange(attr.name, e.target.value)}
              placeholder={attr.placeholder}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                hasError
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {hasError && <p className="mt-1 text-xs text-red-500">{errorMessage}</p>}
            {attr.help_text && !hasError && (
              <p className="mt-1 text-xs text-gray-500">{attr.help_text}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={attr.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {attr.label}
              {attr.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => handleChange(attr.name, parseFloat(e.target.value) || '')}
              placeholder={attr.placeholder}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                hasError
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {hasError && <p className="mt-1 text-xs text-red-500">{errorMessage}</p>}
            {attr.help_text && !hasError && (
              <p className="mt-1 text-xs text-gray-500">{attr.help_text}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={attr.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {attr.label}
              {attr.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleChange(attr.name, e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                hasError
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            >
              <option value="">-- Select {attr.label} --</option>
              {attr.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {hasError && <p className="mt-1 text-xs text-red-500">{errorMessage}</p>}
            {attr.help_text && !hasError && (
              <p className="mt-1 text-xs text-gray-500">{attr.help_text}</p>
            )}
          </div>
        );

      case 'multi_select':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div key={attr.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {attr.label}
              {attr.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
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
            </div>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value && !selectedValues.includes(e.target.value)) {
                  handleChange(attr.name, [...selectedValues, e.target.value]);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Add {attr.label} --</option>
              {attr.options
                ?.filter((option) => !selectedValues.includes(option))
                .map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
            </select>
            {hasError && <p className="mt-1 text-xs text-red-500">{errorMessage}</p>}
            {attr.help_text && !hasError && (
              <p className="mt-1 text-xs text-gray-500">{attr.help_text}</p>
            )}
          </div>
        );

      case 'color':
        return (
          <div key={attr.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {attr.label}
              {attr.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={value || '#000000'}
                onChange={(e) => handleChange(attr.name, e.target.value)}
                className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={value || ''}
                onChange={(e) => handleChange(attr.name, e.target.value)}
                placeholder="#000000"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {hasError && <p className="mt-1 text-xs text-red-500">{errorMessage}</p>}
            {attr.help_text && !hasError && (
              <p className="mt-1 text-xs text-gray-500">{attr.help_text}</p>
            )}
          </div>
        );

      case 'boolean':
        return (
          <div key={attr.name} className="mb-4">
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!value}
                  onChange={(e) => handleChange(attr.name, e.target.checked)}
                  color="primary"
                />
              }
              label={
                <span className="text-sm text-gray-700">
                  {attr.label}
                  {attr.required && <span className="text-red-500 ml-1">*</span>}
                </span>
              }
            />
            {hasError && <p className="mt-1 ml-8 text-xs text-red-500">{errorMessage}</p>}
            {attr.help_text && !hasError && (
              <p className="mt-1 ml-8 text-xs text-gray-500">{attr.help_text}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-1">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {categoryConfig.display_name} Attributes
      </h3>
      {categoryConfig.attributes.map((attr) => renderField(attr))}
    </div>
  );
};
