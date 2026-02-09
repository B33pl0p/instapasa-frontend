'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Checkbox,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  AutoAwesome as AutoAwesomeIcon,
  AddCircleOutline as AddCircleIcon,
  RemoveCircleOutline as RemoveCircleIcon,
} from '@mui/icons-material';
import { ProductVariantCreate } from '@/app/dashboard/lib/types/product';

// Predefined options by category
const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];
const SHOE_SIZES_US = ['5', '6', '7', '8', '9', '10', '11', '12', '13'];
const SHOE_SIZES_EU = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47'];
const SHOE_SIZES = [...SHOE_SIZES_US, ...SHOE_SIZES_EU];
const COLOR_OPTIONS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Gray', 'Brown'];
const GENDER_OPTIONS = ['Male', 'Female', 'Unisex', 'Boys', 'Girls', 'Men', 'Women', 'Kids'];
const STORAGE_OPTIONS = ['64GB', '128GB', '256GB', '512GB', '1TB', '2TB'];
const MATERIAL_OPTIONS = ['Cotton', 'Polyester', 'Leather', 'Denim', 'Silk', 'Wool'];

interface VariantBuilderProps {
  value: ProductVariantCreate[];
  onChange: (variants: ProductVariantCreate[]) => void;
  category?: string;
}

export default function VariantBuilder({ value, onChange, category }: VariantBuilderProps) {
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedStorage, setSelectedStorage] = useState<string[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string[]>([]);
  const [customSize, setCustomSize] = useState('');
  const [customColor, setCustomColor] = useState('');
  const [customGender, setCustomGender] = useState('');
  const [customStorage, setCustomStorage] = useState('');
  const [customMaterial, setCustomMaterial] = useState('');
  
  // Determine size options based on category
  const sizeOptions = category === 'footwear' ? SHOE_SIZES : CLOTHING_SIZES;
  
  const [availableSizes, setAvailableSizes] = useState<string[]>(sizeOptions);
  const [availableColors, setAvailableColors] = useState<string[]>(COLOR_OPTIONS);
  const [availableGenders, setAvailableGenders] = useState<string[]>(GENDER_OPTIONS);
  const [availableStorage, setAvailableStorage] = useState<string[]>(STORAGE_OPTIONS);
  const [availableMaterial, setAvailableMaterial] = useState<string[]>(MATERIAL_OPTIONS);
  const [showPriceAdjustment, setShowPriceAdjustment] = useState(false);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [showColorSelector, setShowColorSelector] = useState(false);
  const [showGenderSelector, setShowGenderSelector] = useState(false);
  const [showStorageSelector, setShowStorageSelector] = useState(false);
  const [showMaterialSelector, setShowMaterialSelector] = useState(false);
  const [newAttributeKey, setNewAttributeKey] = useState('');
  const [newAttributeValue, setNewAttributeValue] = useState('');
  const [selectedVariantIndices, setSelectedVariantIndices] = useState<number[]>([]);

  // Category-specific attribute visibility
  const usesSizes = ['clothing', 'footwear'].includes(category || '');
  const usesColors = ['clothing', 'footwear', 'accessories', 'electronics', 'beauty'].includes(category || '');
  const usesGenders = ['clothing', 'footwear', 'beauty'].includes(category || '');
  const usesStorage = ['electronics'].includes(category || '');
  const usesMaterial = ['clothing', 'footwear', 'accessories'].includes(category || '');

  // Update size options when category changes
  useEffect(() => {
    const newSizeOptions = category === 'footwear' ? SHOE_SIZES : CLOTHING_SIZES;
    setAvailableSizes(newSizeOptions);
    setSelectedSizes([]); // Reset selections when category changes
  }, [category]);

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const toggleGender = (gender: string) => {
    setSelectedGenders(prev => 
      prev.includes(gender) ? prev.filter(g => g !== gender) : [...prev, gender]
    );
  };

  const toggleStorage = (storage: string) => {
    setSelectedStorage(prev => 
      prev.includes(storage) ? prev.filter(s => s !== storage) : [...prev, storage]
    );
  };

  const toggleMaterial = (material: string) => {
    setSelectedMaterial(prev => 
      prev.includes(material) ? prev.filter(m => m !== material) : [...prev, material]
    );
  };

  const addCustomSize = () => {
    if (customSize && !availableSizes.includes(customSize)) {
      const newSizes = [...availableSizes, customSize];
      setAvailableSizes(newSizes);
      setSelectedSizes([...selectedSizes, customSize]);
      setCustomSize('');
    }
  };

  const addCustomColor = () => {
    if (customColor && !availableColors.includes(customColor)) {
      const newColors = [...availableColors, customColor];
      setAvailableColors(newColors);
      setSelectedColors([...selectedColors, customColor]);
      setCustomColor('');
    }
  };

  const addCustomGender = () => {
    if (customGender && !availableGenders.includes(customGender)) {
      const newGenders = [...availableGenders, customGender];
      setAvailableGenders(newGenders);
      setSelectedGenders([...selectedGenders, customGender]);
      setCustomGender('');
    }
  };

  const addCustomStorage = () => {
    if (customStorage && !availableStorage.includes(customStorage)) {
      const newStorage = [...availableStorage, customStorage];
      setAvailableStorage(newStorage);
      setSelectedStorage([...selectedStorage, customStorage]);
      setCustomStorage('');
    }
  };

  const addCustomMaterial = () => {
    if (customMaterial && !availableMaterial.includes(customMaterial)) {
      const newMaterials = [...availableMaterial, customMaterial];
      setAvailableMaterial(newMaterials);
      setSelectedMaterial([...selectedMaterial, customMaterial]);
      setCustomMaterial('');
    }
  };

  const generateVariants = () => {
    const newVariants: ProductVariantCreate[] = [];

    // Generate all combinations of selected attributes
    const sizes = selectedSizes.length > 0 ? selectedSizes : [null];
    const colors = selectedColors.length > 0 ? selectedColors : [null];
    const genders = selectedGenders.length > 0 ? selectedGenders : [null];
    const storage = selectedStorage.length > 0 ? selectedStorage : [null];
    const materials = selectedMaterial.length > 0 ? selectedMaterial : [null];

    sizes.forEach(size => {
      colors.forEach(color => {
        genders.forEach(gender => {
          storage.forEach(stor => {
            materials.forEach(material => {
              const attributes: Record<string, any> = {};
              if (size) attributes.size = size;
              if (color) attributes.color = color;
              if (gender) attributes.gender = gender;
              if (stor) attributes.storage = stor;
              if (material) attributes.material = material;

              // Only add variant if at least one attribute is selected
              if (Object.keys(attributes).length > 0) {
                newVariants.push({
                  attributes,
                  stock: 0,
                  price_adjustment: 0,
                });
              }
            });
          });
        });
      });
    });

    onChange(newVariants);
  };

  const updateVariantStock = (index: number, stock: number) => {
    const updated = [...value];
    updated[index].stock = stock;
    onChange(updated);
  };

  const updateVariantPriceAdjustment = (index: number, adjustment: number) => {
    const updated = [...value];
    updated[index].price_adjustment = adjustment;
    onChange(updated);
  };

  const removeVariant = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  const addEmptyVariant = () => {
    onChange([
      ...value,
      {
        attributes: {},
        stock: 0,
        price_adjustment: 0,
      },
    ]);
  };

  const updateVariantAttribute = (index: number, key: string, val: string) => {
    const updated = [...value];
    updated[index].attributes[key] = val;
    onChange(updated);
  };

  const removeVariantAttribute = (index: number, key: string) => {
    const updated = [...value];
    delete updated[index].attributes[key];
    onChange(updated);
  };

  const addAttributeToVariant = (index: number) => {
    if (!newAttributeKey.trim() || !newAttributeValue.trim()) return;
    
    const updated = [...value];
    updated[index].attributes[newAttributeKey.trim()] = newAttributeValue.trim();
    onChange(updated);
    setNewAttributeKey('');
    setNewAttributeValue('');
  };

  const addAttributeToSelectedVariants = () => {
    if (!newAttributeKey.trim() || !newAttributeValue.trim()) return;
    if (selectedVariantIndices.length === 0) return;
    
    const updated = [...value];
    selectedVariantIndices.forEach(index => {
      updated[index].attributes[newAttributeKey.trim()] = newAttributeValue.trim();
    });
    onChange(updated);
    setNewAttributeKey('');
    setNewAttributeValue('');
    setSelectedVariantIndices([]);
  };

  const toggleVariantSelection = (index: number) => {
    setSelectedVariantIndices(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  // Check for duplicate variants
  const hasDuplicates = () => {
    const seen = new Set<string>();
    for (const variant of value) {
      const key = JSON.stringify(variant.attributes);
      if (seen.has(key)) return true;
      seen.add(key);
    }
    return false;
  };

  const totalStock = value.reduce((sum, v) => sum + v.stock, 0);

  const calculateVariantCount = () => {
    const sizes = selectedSizes.length || (selectedSizes.length > 0 ? 1 : 0);
    const colors = selectedColors.length || (selectedColors.length > 0 ? 1 : 0);
    const genders = selectedGenders.length || (selectedGenders.length > 0 ? 1 : 0);
    const storage = selectedStorage.length || (selectedStorage.length > 0 ? 1 : 0);
    const materials = selectedMaterial.length || (selectedMaterial.length > 0 ? 1 : 0);
    
    if (selectedSizes.length === 0 && selectedColors.length === 0 && selectedGenders.length === 0 &&
        selectedStorage.length === 0 && selectedMaterial.length === 0) {
      return 0;
    }
    
    return Math.max(1, selectedSizes.length || 1) * 
           Math.max(1, selectedColors.length || 1) * 
           Math.max(1, selectedGenders.length || 1) *
           Math.max(1, selectedStorage.length || 1) *
           Math.max(1, selectedMaterial.length || 1);
  };

  return (
    <Box>
      <Card sx={{ mb: 3, backgroundColor: 'background.paper' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Variant Generator
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select sizes, colors, and genders to automatically generate all combinations
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, flexWrap: 'wrap' }}>
            {usesSizes && (
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Sizes {selectedSizes.length > 0 && `(${selectedSizes.length} selected)`}
                </Typography>
                {!showSizeSelector && (
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    onClick={() => setShowSizeSelector(true)}
                    startIcon={<AddIcon />}
                  >
                    {selectedSizes.length > 0 ? 'Change Sizes' : 'Select Sizes'}
                  </Button>
                )}
                {showSizeSelector && (
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ maxHeight: 200, overflowY: 'auto', mb: 2 }}>
                        {availableSizes.map((size) => (
                          <Box key={size} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Checkbox
                              size="small"
                              checked={selectedSizes.includes(size)}
                              onChange={() => toggleSize(size)}
                            />
                            <Typography variant="body2">{size}</Typography>
                          </Box>
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <TextField
                          size="small"
                          placeholder="Add custom"
                          value={customSize}
                          onChange={(e) => setCustomSize(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addCustomSize();
                            }
                          }}
                          fullWidth
                        />
                        <Button size="small" onClick={addCustomSize} variant="outlined">
                          Add
                        </Button>
                      </Box>
                      <Button 
                        variant="contained" 
                        fullWidth 
                        onClick={() => setShowSizeSelector(false)}
                      >
                        OK
                      </Button>
                    </CardContent>
                  </Card>
                )}
                {selectedSizes.length > 0 && !showSizeSelector && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                    {selectedSizes.map((size) => (
                      <Chip key={size} label={size} size="small" />
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {usesColors && (
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Colors {selectedColors.length > 0 && `(${selectedColors.length} selected)`}
                </Typography>
                {!showColorSelector && (
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    onClick={() => setShowColorSelector(true)}
                    startIcon={<AddIcon />}
                  >
                    {selectedColors.length > 0 ? 'Change Colors' : 'Select Colors'}
                  </Button>
                )}
                {showColorSelector && (
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ maxHeight: 200, overflowY: 'auto', mb: 2 }}>
                        {availableColors.map((color) => (
                          <Box key={color} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Checkbox
                              size="small"
                              checked={selectedColors.includes(color)}
                              onChange={() => toggleColor(color)}
                            />
                            <Typography variant="body2">{color}</Typography>
                          </Box>
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <TextField
                          size="small"
                          placeholder="Add custom"
                          value={customColor}
                          onChange={(e) => setCustomColor(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addCustomColor();
                            }
                          }}
                          fullWidth
                        />
                        <Button size="small" onClick={addCustomColor} variant="outlined">
                          Add
                        </Button>
                      </Box>
                      <Button 
                        variant="contained" 
                        fullWidth 
                        onClick={() => setShowColorSelector(false)}
                      >
                        OK
                      </Button>
                    </CardContent>
                  </Card>
                )}
                {selectedColors.length > 0 && !showColorSelector && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                    {selectedColors.map((color) => (
                      <Chip key={color} label={color} size="small" />
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {usesGenders && (
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Gender {selectedGenders.length > 0 && `(${selectedGenders.length} selected)`}
                </Typography>
              {!showGenderSelector && (
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={() => setShowGenderSelector(true)}
                  startIcon={<AddIcon />}
                >
                  {selectedGenders.length > 0 ? 'Change Genders' : 'Select Genders'}
                </Button>
              )}
              {showGenderSelector && (
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ maxHeight: 200, overflowY: 'auto', mb: 2 }}>
                      {availableGenders.map((gender) => (
                        <Box key={gender} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <Checkbox
                            size="small"
                            checked={selectedGenders.includes(gender)}
                            onChange={() => toggleGender(gender)}
                          />
                          <Typography variant="body2">{gender}</Typography>
                        </Box>
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        size="small"
                        placeholder="Add custom"
                        value={customGender}
                        onChange={(e) => setCustomGender(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomGender();
                          }
                        }}
                        fullWidth
                      />
                      <Button size="small" onClick={addCustomGender} variant="outlined">
                        Add
                      </Button>
                    </Box>
                    <Button 
                      variant="contained" 
                      fullWidth 
                      onClick={() => setShowGenderSelector(false)}
                    >
                      OK
                    </Button>
                  </CardContent>
                </Card>
              )}
              {selectedGenders.length > 0 && !showGenderSelector && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {selectedGenders.map((gender) => (
                    <Chip key={gender} label={gender} size="small" />
                  ))}
                </Box>
              )}
              </Box>
            )}

            {usesStorage && (
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Storage {selectedStorage.length > 0 && `(${selectedStorage.length} selected)`}
                </Typography>
                {!showStorageSelector && (
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    onClick={() => setShowStorageSelector(true)}
                    startIcon={<AddIcon />}
                  >
                    {selectedStorage.length > 0 ? 'Change Storage' : 'Select Storage'}
                  </Button>
                )}
                {showStorageSelector && (
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ maxHeight: 200, overflowY: 'auto', mb: 2 }}>
                        {availableStorage.map((storage) => (
                          <Box key={storage} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Checkbox
                              size="small"
                              checked={selectedStorage.includes(storage)}
                              onChange={() => toggleStorage(storage)}
                            />
                            <Typography variant="body2">{storage}</Typography>
                          </Box>
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <TextField
                          size="small"
                          placeholder="Add custom storage"
                          value={customStorage}
                          onChange={(e) => setCustomStorage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addCustomStorage();
                            }
                          }}
                          fullWidth
                        />
                        <Button size="small" onClick={addCustomStorage} variant="outlined">
                          Add
                        </Button>
                      </Box>
                      <Button 
                        variant="contained" 
                        fullWidth 
                        onClick={() => setShowStorageSelector(false)}
                      >
                        OK
                      </Button>
                    </CardContent>
                  </Card>
                )}
                {selectedStorage.length > 0 && !showStorageSelector && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                    {selectedStorage.map((storage) => (
                      <Chip key={storage} label={storage} size="small" />
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {usesMaterial && (
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Material {selectedMaterial.length > 0 && `(${selectedMaterial.length} selected)`}
                </Typography>
                {!showMaterialSelector && (
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    onClick={() => setShowMaterialSelector(true)}
                    startIcon={<AddIcon />}
                  >
                    {selectedMaterial.length > 0 ? 'Change Material' : 'Select Material'}
                  </Button>
                )}
                {showMaterialSelector && (
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ maxHeight: 200, overflowY: 'auto', mb: 2 }}>
                        {availableMaterial.map((material) => (
                          <Box key={material} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Checkbox
                              size="small"
                              checked={selectedMaterial.includes(material)}
                              onChange={() => toggleMaterial(material)}
                            />
                            <Typography variant="body2">{material}</Typography>
                          </Box>
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <TextField
                          size="small"
                          placeholder="Add custom material"
                          value={customMaterial}
                          onChange={(e) => setCustomMaterial(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addCustomMaterial();
                            }
                          }}
                          fullWidth
                        />
                        <Button size="small" onClick={addCustomMaterial} variant="outlined">
                          Add
                        </Button>
                      </Box>
                      <Button 
                        variant="contained" 
                        fullWidth 
                        onClick={() => setShowMaterialSelector(false)}
                      >
                        OK
                      </Button>
                    </CardContent>
                  </Card>
                )}
                {selectedMaterial.length > 0 && !showMaterialSelector && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                    {selectedMaterial.map((material) => (
                      <Chip key={material} label={material} size="small" />
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Box>

          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={generateVariants}
              startIcon={<AutoAwesomeIcon />}
              disabled={
                (usesSizes || usesColors || usesGenders || usesStorage || usesMaterial) &&
                (!usesSizes || selectedSizes.length === 0) &&
                (!usesColors || selectedColors.length === 0) &&
                (!usesGenders || selectedGenders.length === 0) &&
                (!usesStorage || selectedStorage.length === 0) &&
                (!usesMaterial || selectedMaterial.length === 0)
              }
              fullWidth
            >
              Generate {calculateVariantCount()} Variants
            </Button>
            <Button
              variant="outlined"
              onClick={addEmptyVariant}
              startIcon={<AddIcon />}
              sx={{ minWidth: 200 }}
            >
              Add Manual Variant
            </Button>
          </Box>
        </CardContent>
      </Card>

      {hasDuplicates() && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Duplicate variants detected! Each variant must have unique attributes.
        </Alert>
      )}

      {value.length > 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6">
                  Variants ({value.length})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Stock: {totalStock}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  onClick={() => setShowPriceAdjustment(!showPriceAdjustment)}
                >
                  {showPriceAdjustment ? 'Hide' : 'Show'} Price Adjustment
                </Button>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={addEmptyVariant}
                  variant="outlined"
                >
                  Add Variant
                </Button>
              </Box>
            </Box>

            {/* Add Custom Attribute Section */}
            <Card variant="outlined" sx={{ mb: 2, backgroundColor: 'background.paper' }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Add Custom Attribute
                  {selectedVariantIndices.length > 0 && ` (${selectedVariantIndices.length} variant${selectedVariantIndices.length > 1 ? 's' : ''} selected)`}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Select variants below, then add a custom attribute to apply to all selected variants
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Attribute name (e.g. weight)"
                    value={newAttributeKey}
                    onChange={(e) => setNewAttributeKey(e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    size="small"
                    placeholder="Value (e.g. 500g)"
                    value={newAttributeValue}
                    onChange={(e) => setNewAttributeValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addAttributeToSelectedVariants();
                      }
                    }}
                    sx={{ flex: 1 }}
                  />
                  <Button 
                    onClick={addAttributeToSelectedVariants}
                    disabled={!newAttributeKey.trim() || !newAttributeValue.trim() || selectedVariantIndices.length === 0}
                    variant="contained"
                  >
                    Add to Selected
                  </Button>
                </Box>
              </CardContent>
            </Card>

            <TableContainer sx={{ maxHeight: 400, overflowY: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedVariantIndices.length === value.length && value.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedVariantIndices(value.map((_, i) => i));
                          } else {
                            setSelectedVariantIndices([]);
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>Attributes</TableCell>
                    <TableCell align="right">Stock</TableCell>
                    {showPriceAdjustment && (
                      <TableCell align="right">Price Adjustment (Rs)</TableCell>
                    )}
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {value.map((variant, index) => (
                    <TableRow key={index}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedVariantIndices.includes(index)}
                          onChange={() => toggleVariantSelection(index)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {Object.entries(variant.attributes).map(([key, val]) => (
                              <Chip
                                key={key}
                                label={`${key}: ${val}`}
                                size="small"
                                onDelete={() => removeVariantAttribute(index, key)}
                              />
                            ))}
                          </Box>
                          {Object.keys(variant.attributes).length === 0 && (
                            <Typography variant="caption" color="text.secondary">
                              No attributes yet
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                          <IconButton
                            size="small"
                            onClick={() => updateVariantStock(index, Math.max(0, variant.stock - 1))}
                            sx={{ p: 0.5 }}
                          >
                            <RemoveCircleIcon fontSize="small" />
                          </IconButton>
                          <TextField
                            type="number"
                            size="small"
                            value={variant.stock}
                            onChange={(e) => {
                              const value = e.target.value;
                              updateVariantStock(index, value === '' ? 0 : parseInt(value) || 0);
                            }}
                            onBlur={(e) => {
                              if (e.target.value === '') {
                                updateVariantStock(index, 0);
                              }
                            }}
                            inputProps={{ 
                              min: 0, 
                              style: { 
                                textAlign: 'center',
                                padding: '6px 8px'
                              } 
                            }}
                            sx={{ 
                              width: 80,
                              '& .MuiOutlinedInput-root': {
                                '& input': {
                                  color: 'text.primary',
                                }
                              }
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => updateVariantStock(index, variant.stock + 1)}
                            sx={{ p: 0.5 }}
                          >
                            <AddCircleIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                      {showPriceAdjustment && (
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                            <IconButton
                              size="small"
                              onClick={() => updateVariantPriceAdjustment(index, (variant.price_adjustment || 0) - 1)}
                              sx={{ p: 0.5 }}
                            >
                              <RemoveCircleIcon fontSize="small" />
                            </IconButton>
                            <TextField
                              type="number"
                              size="small"
                              value={variant.price_adjustment || 0}
                              onChange={(e) => {
                                const value = e.target.value;
                                updateVariantPriceAdjustment(
                                  index,
                                  value === '' ? 0 : parseFloat(value) || 0
                                );
                              }}
                              onBlur={(e) => {
                                if (e.target.value === '') {
                                  updateVariantPriceAdjustment(index, 0);
                                }
                              }}
                              inputProps={{ 
                                step: 0.01, 
                                style: { 
                                  textAlign: 'center',
                                  padding: '6px 8px'
                                } 
                              }}
                              sx={{ 
                                width: 100,
                                '& .MuiOutlinedInput-root': {
                                  '& input': {
                                    color: 'text.primary',
                                  }
                                }
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => updateVariantPriceAdjustment(index, (variant.price_adjustment || 0) + 1)}
                              sx={{ p: 0.5 }}
                            >
                              <AddCircleIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      )}
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeVariant(index)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {value.length === 0 && (
        <Alert severity="info">
          Use the generator above or add variants manually. Variants allow you to track stock for different
          sizes, colors, genders, or other attributes.
        </Alert>
      )}
    </Box>
  );
}
