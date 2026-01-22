# Product Variants API Documentation

## Overview
Products now support multiple variants (size, color, etc.) with individual stock tracking. This allows sellers to create one product with multiple combinations of attributes.

## Key Concepts

### Product Structure
- **Base Product**: Contains name, description, base price, and images
- **Variants**: Each variant has specific attributes (size, color), stock, and optional price adjustment

### Backward Compatibility
- ✅ Old products (single variant) continue to work using `stock` field
- ✅ New products can have multiple variants
- ✅ Frontend can detect variant mode by checking if `variants` array has items

---

## API Endpoints

### 1. Create Product with Variants

**POST** `/api/v2/dashboard/products`

#### Request Body (Multiple Variants):
```json
{
  "name": "Cotton T-Shirt",
  "description": "Comfortable cotton t-shirt",
  "price": 1999.0,
  "category": "clothing",
  "images": ["https://example.com/shirt.jpg"],
  "variants": [
    {
      "attributes": {"size": "S", "color": "Blue"},
      "stock": 5
    },
    {
      "attributes": {"size": "M", "color": "Blue"},
      "stock": 10
    },
    {
      "attributes": {"size": "L", "color": "Blue"},
      "stock": 8
    },
    {
      "attributes": {"size": "S", "color": "Red"},
      "stock": 3
    },
    {
      "attributes": {"size": "M", "color": "Red"},
      "stock": 7
    }
  ]
}
```

#### Request Body (Single Variant - Old Method):
```json
{
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse",
  "price": 1299.0,
  "category": "electronics",
  "stock": 15,
  "images": ["https://example.com/mouse.jpg"]
}
```

#### Response:
```json
{
  "id": "676e3f4a8d9e1234567890ab",
  "customer_id": "seller_123",
  "name": "Cotton T-Shirt",
  "description": "Comfortable cotton t-shirt",
  "price": 1999.0,
  "category": "clothing",
  "images": ["https://example.com/shirt.jpg"],
  "variants": [
    {
      "variant_id": "1737551234.567890",
      "attributes": {"size": "S", "color": "Blue"},
      "stock": 5,
      "price_adjustment": 0.0,
      "sku": null,
      "images": null
    },
    {
      "variant_id": "1737551234.567891",
      "attributes": {"size": "M", "color": "Blue"},
      "stock": 10,
      "price_adjustment": 0.0,
      "sku": null,
      "images": null
    }
  ],
  "stock": 0,
  "attributes": {},
  "total_stock": 33,
  "is_active": true,
  "created_at": "2026-01-22T10:30:00Z",
  "updated_at": "2026-01-22T10:30:00Z"
}
```

---

### 2. Get All Products

**GET** `/api/v2/dashboard/products?skip=0&limit=20`

#### Response:
```json
[
  {
    "id": "676e3f4a8d9e1234567890ab",
    "name": "Cotton T-Shirt",
    "price": 1999.0,
    "variants": [
      {
        "variant_id": "1737551234.567890",
        "attributes": {"size": "S", "color": "Blue"},
        "stock": 5,
        "price_adjustment": 0.0
      }
    ],
    "total_stock": 33,
    "is_active": true
  },
  {
    "id": "676e3f4a8d9e1234567890ac",
    "name": "Wireless Mouse",
    "price": 1299.0,
    "variants": [],
    "stock": 15,
    "total_stock": 15,
    "is_active": true
  }
]
```

---

### 3. Update Product

**PUT** `/api/v2/dashboard/products/{product_id}`

#### Update Variants:
```json
{
  "variants": [
    {
      "attributes": {"size": "S", "color": "Blue"},
      "stock": 8
    },
    {
      "attributes": {"size": "M", "color": "Blue"},
      "stock": 15
    }
  ]
}
```

#### Update Single Stock (No Variants):
```json
{
  "stock": 25
}
```

---

## Frontend Implementation Guide

### Detecting Variant Mode
```javascript
function hasVariants(product) {
  return product.variants && product.variants.length > 0;
}
```

### Display Product Form

#### For Product Creation:
```jsx
<form>
  <input name="name" placeholder="Product Name" required />
  <input name="price" type="number" placeholder="Base Price" required />
  <select name="category">
    <option value="clothing">Clothing</option>
    <option value="electronics">Electronics</option>
  </select>
  
  {/* Toggle for variant mode */}
  <label>
    <input type="checkbox" onChange={(e) => setHasVariants(e.target.checked)} />
    Multiple Variants (Size/Color)
  </label>
  
  {hasVariants ? (
    <VariantBuilder />
  ) : (
    <input name="stock" type="number" placeholder="Stock" required />
  )}
</form>
```

#### Variant Builder Component:
```jsx
function VariantBuilder() {
  const [variants, setVariants] = useState([]);
  const [sizes, setSizes] = useState(['S', 'M', 'L', 'XL']);
  const [colors, setColors] = useState(['Blue', 'Red', 'Black']);
  
  // Generate combinations
  const generateVariants = () => {
    const combinations = [];
    sizes.forEach(size => {
      colors.forEach(color => {
        combinations.push({
          attributes: { size, color },
          stock: 0
        });
      });
    });
    setVariants(combinations);
  };
  
  return (
    <div>
      {/* Size selector */}
      <MultiSelect 
        label="Available Sizes"
        options={['XS', 'S', 'M', 'L', 'XL', 'XXL']}
        value={sizes}
        onChange={setSizes}
      />
      
      {/* Color selector with custom input */}
      <div>
        <label>Available Colors</label>
        <MultiSelect 
          options={['Blue', 'Red', 'Black', 'White', 'Green']}
          value={colors}
          onChange={setColors}
        />
        <input 
          placeholder="Add custom color" 
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              setColors([...colors, e.target.value]);
              e.target.value = '';
            }
          }}
        />
      </div>
      
      <button onClick={generateVariants}>Generate Variants</button>
      
      {/* Variant stock input */}
      {variants.map((variant, idx) => (
        <div key={idx}>
          <span>Size: {variant.attributes.size}, Color: {variant.attributes.color}</span>
          <input 
            type="number"
            placeholder="Stock"
            value={variant.stock}
            onChange={(e) => {
              const updated = [...variants];
              updated[idx].stock = parseInt(e.target.value) || 0;
              setVariants(updated);
            }}
          />
        </div>
      ))}
    </div>
  );
}
```

### Display Product in List
```jsx
function ProductCard({ product }) {
  const totalStock = product.total_stock || product.stock;
  const hasVariants = product.variants && product.variants.length > 0;
  
  return (
    <div className="product-card">
      <img src={product.images[0]} alt={product.name} />
      <h3>{product.name}</h3>
      <p>₹{product.price}</p>
      
      {hasVariants ? (
        <div>
          <p>Total Stock: {totalStock}</p>
          <p>{product.variants.length} variants available</p>
          <details>
            <summary>View Variants</summary>
            {product.variants.map(v => (
              <div key={v.variant_id}>
                {Object.entries(v.attributes).map(([key, val]) => (
                  <span key={key}>{key}: {val} </span>
                ))}
                - Stock: {v.stock}
              </div>
            ))}
          </details>
        </div>
      ) : (
        <p>Stock: {product.stock}</p>
      )}
    </div>
  );
}
```

---

## Variant Schema

### ProductVariantCreate
```typescript
interface ProductVariantCreate {
  attributes: Record<string, any>;  // e.g., {size: "M", color: "Blue"}
  stock: number;                     // Stock for this variant
  price_adjustment?: number;         // Price difference from base (default: 0)
  sku?: string;                      // Optional SKU
  images?: string[];                 // Optional variant-specific images
}
```

### ProductVariantResponse
```typescript
interface ProductVariantResponse {
  variant_id: string;                // Auto-generated unique ID
  attributes: Record<string, any>;
  stock: number;
  price_adjustment: number;
  sku: string | null;
  images: string[] | null;
}
```

---

## Common Use Cases

### 1. Clothing Store (Size + Color)
```json
{
  "name": "Denim Jacket",
  "price": 2499.0,
  "category": "clothing",
  "variants": [
    {"attributes": {"size": "S", "color": "Blue"}, "stock": 5},
    {"attributes": {"size": "M", "color": "Blue"}, "stock": 10},
    {"attributes": {"size": "L", "color": "Blue"}, "stock": 8},
    {"attributes": {"size": "S", "color": "Black"}, "stock": 3},
    {"attributes": {"size": "M", "color": "Black"}, "stock": 12}
  ]
}
```

### 2. Shoes (Size Only)
```json
{
  "name": "Running Shoes",
  "price": 3999.0,
  "category": "footwear",
  "variants": [
    {"attributes": {"size": "7"}, "stock": 5},
    {"attributes": {"size": "8"}, "stock": 10},
    {"attributes": {"size": "9"}, "stock": 8},
    {"attributes": {"size": "10"}, "stock": 6}
  ]
}
```

### 3. Electronics (No Variants)
```json
{
  "name": "Wireless Keyboard",
  "price": 1499.0,
  "category": "electronics",
  "stock": 25
}
```

### 4. Phone Cases (Model + Color)
```json
{
  "name": "Phone Case",
  "price": 499.0,
  "category": "accessories",
  "variants": [
    {"attributes": {"model": "iPhone 14", "color": "Clear"}, "stock": 15},
    {"attributes": {"model": "iPhone 14", "color": "Black"}, "stock": 20},
    {"attributes": {"model": "iPhone 15", "color": "Clear"}, "stock": 10},
    {"attributes": {"model": "iPhone 15", "color": "Black"}, "stock": 18}
  ]
}
```

---

## Instagram Chat Flow

When a customer views a product with variants:

1. **Single Variant Product**: Shows "Add to Cart" button directly
2. **Multiple Variants Product**: Shows variant selection buttons
   - Carousel with buttons for each attribute (size, color)
   - Customer selects size → then color → then adds to cart
   - Cart stores exact variant with attributes

### Example Flow:
```
Customer: *clicks product*
Bot: Shows product details

Customer: *clicks "Add to Cart"*
Bot: Shows size selection buttons [S] [M] [L] [XL]

Customer: *clicks M*
Bot: Shows color selection buttons [Blue] [Red] [Black]

Customer: *clicks Blue*
Bot: ✅ Added Cotton T-Shirt (Size M, Blue) to cart!
```

---

## Price Adjustments

You can set different prices for variants using `price_adjustment`:

```json
{
  "name": "T-Shirt",
  "price": 1999.0,
  "variants": [
    {"attributes": {"size": "S"}, "stock": 10, "price_adjustment": -200},
    {"attributes": {"size": "M"}, "stock": 15, "price_adjustment": 0},
    {"attributes": {"size": "L"}, "stock": 12, "price_adjustment": 0},
    {"attributes": {"size": "XL"}, "stock": 8, "price_adjustment": 200},
    {"attributes": {"size": "XXL"}, "stock": 5, "price_adjustment": 300}
  ]
}
```

Result:
- S size: ₹1,799 (1999 - 200)
- M size: ₹1,999 (base price)
- L size: ₹1,999 (base price)
- XL size: ₹2,199 (1999 + 200)
- XXL size: ₹2,299 (1999 + 300)

---

## Migration Guide

### Existing Products
All existing products automatically work - they use the `stock` field and have empty `variants` array.

### Converting to Variants
To convert an existing single-variant product to multiple variants:

**Before:**
```json
{
  "name": "T-Shirt",
  "stock": 50,
  "attributes": {"size": "M"}
}
```

**After:**
```json
{
  "name": "T-Shirt",
  "variants": [
    {"attributes": {"size": "S"}, "stock": 10},
    {"attributes": {"size": "M"}, "stock": 20},
    {"attributes": {"size": "L"}, "stock": 15},
    {"attributes": {"size": "XL"}, "stock": 5}
  ]
}
```

---

## Error Handling

### Empty Variants Array
If `variants: []` and `stock: 0`, product shows as out of stock.

### Duplicate Attributes
Backend doesn't automatically prevent duplicates. Frontend should validate:
```javascript
function hasDuplicateVariants(variants) {
  const seen = new Set();
  for (const v of variants) {
    const key = JSON.stringify(v.attributes);
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
}
```

### Custom Colors
When user adds custom color, store it in the `attributes` object:
```json
{
  "attributes": {"size": "M", "color": "Mint Green"}
}
```

---

## API Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Product ID |
| `name` | string | Product name |
| `price` | number | Base price |
| `variants` | array | Array of variants (empty for single-variant) |
| `stock` | number | Stock for single-variant products |
| `total_stock` | number | Total stock across all variants |
| `attributes` | object | Attributes for single-variant products |
| `is_active` | boolean | Product visibility |

---

## Best Practices

1. **Always show `total_stock`** instead of individual stock for variant products
2. **Generate variants automatically** from selected sizes and colors
3. **Allow custom color input** for flexibility
4. **Validate no duplicate variants** before submission
5. **Display variant count** (e.g., "5 variants available") in product cards
6. **Use expandable sections** to show all variants in detail view
7. **Sort variants logically** (XS → S → M → L → XL)

---

## Questions?

This API is backward compatible - all existing functionality continues to work. Products can be created with or without variants seamlessly.
