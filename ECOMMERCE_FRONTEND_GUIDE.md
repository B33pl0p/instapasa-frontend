# Dynamic Product Attributes System

## Overview
The ecommerce system now supports dynamic, category-based product attributes. Different product categories can have different required and optional fields (e.g., clothing has size/color, electronics has warranty/specs).

## Architecture

### 1. Category Model (`app/models/category_model.py`)
Defines category configurations with attribute definitions:
- **AttributeType**: Text, Number, Select (dropdown), Multi-Select, Color, Boolean
- **AttributeDefinition**: Individual attribute configuration (name, label, type, required, options)
- **CategoryConfig**: Full category with all its attributes
- **CATEGORY_CONFIGS**: Predefined categories (clothing, footwear, electronics, food, beauty, home, books, general)

### 2. Product Model (`app/models/product_model.py`)
```python
class Product(Document):
    ...
    category: Optional[str] = None
    attributes: Dict[str, Any] = {}  # Dynamic category-specific attributes
    ...
```

### 3. API Schemas (`app/api/v2/schemas/ecommerce_schema.py`)
```python
class ProductCreate(BaseModel):
    ...
    category: Optional[str] = None
    attributes: Dict[str, Any] = {}
    ...
```

## Available Categories

### Clothing (👕)
- **size**: XS, S, M, L, XL, XXL, XXXL (required)
- **color**: Black, White, Red, Blue, etc. (required)
- **material**: Cotton, Polyester, Wool, Silk, Linen, etc.
- **gender**: Men, Women, Unisex, Kids

### Footwear (👟)
- **size**: 5-13 (required)
- **color**: Black, White, Brown, etc. (required)
- **material**: Leather, Synthetic, Canvas, Suede
- **type**: Sneakers, Formal, Sandals, Boots, Slippers

### Electronics (📱)
- **brand**: Text (required)
- **model**: Text (required)
- **warranty**: No Warranty, 6 Months, 1 Year, 2 Years, 3 Years
- **color**: Black, White, Silver, Gold, Blue, Red
- **condition**: Brand New, Like New, Refurbished, Used (required)

### Food & Beverages (🍔)
- **weight**: Text (e.g., 500g, 1L)
- **ingredients**: Main ingredients
- **allergens**: Nuts, Dairy, Eggs, Soy, Gluten, Shellfish
- **dietary**: Vegetarian, Vegan, Gluten-Free, Organic, Halal, Kosher
- **expiry**: Best before date

### Beauty & Personal Care (💄)
- **brand**: Text (required)
- **skin_type**: All Skin Types, Dry, Oily, Combination, Sensitive
- **size**: Size/Volume (e.g., 50ml, 100g)
- **ingredients**: Key ingredients
- **features**: Paraben-Free, Cruelty-Free, Organic, etc.

### Home & Living (🏠)
- **material**: Text
- **dimensions**: Length x Width x Height
- **color**: Black, White, Brown, Beige, Gray
- **room**: Living Room, Bedroom, Kitchen, Bathroom, Office

### Books & Stationery (📚)
- **author**: Text
- **publisher**: Text
- **language**: English, Nepali, Hindi, Other
- **pages**: Number
- **format**: Hardcover, Paperback, E-book

### General (📦)
Fallback category with basic attributes:
- **brand**: Text
- **color**: Text
- **size**: Text

## API Endpoints

### Get All Categories
```
GET /api/v2/products/categories
```
Returns all available categories with their attribute definitions.

**Response:**
```json
[
  {
    "category": "clothing",
    "display_name": "Clothing & Apparel",
    "icon": "👕",
    "attributes": [
      {
        "name": "size",
        "label": "Size",
        "type": "select",
        "required": true,
        "options": ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
        "help_text": "Select garment size"
      },
      ...
    ]
  },
  ...
]
```

### Get Specific Category
```
GET /api/v2/products/categories/{category}
```
Returns configuration for a specific category (e.g., `clothing`, `electronics`).

### Create Product with Attributes
```
POST /api/v2/products
```

**Request Body:**
```json
{
  "name": "Premium Cotton T-Shirt",
  "description": "Comfortable cotton t-shirt",
  "price": 29.99,
  "stock": 100,
  "category": "clothing",
  "attributes": {
    "size": "L",
    "color": "Blue",
    "material": "Cotton",
    "gender": "Unisex"
  },
  "images": ["https://..."]
}
```

**Another Example (Electronics):**
```json
{
  "name": "Wireless Headphones",
  "price": 99.99,
  "stock": 50,
  "category": "electronics",
  "attributes": {
    "brand": "Sony",
    "model": "WH-1000XM5",
    "warranty": "1 Year",
    "color": "Black",
    "condition": "Brand New"
  }
}
```

### Update Product Attributes
```
PUT /api/v2/products/{product_id}
```

**Request Body:**
```json
{
  "attributes": {
    "size": "XL",
    "color": "Red"
  }
}
```

### Get Product
```
GET /api/v2/products/{product_id}
```

**Response:**
```json
{
  "id": "...",
  "name": "Premium Cotton T-Shirt",
  "category": "clothing",
  "attributes": {
    "size": "L",
    "color": "Blue",
    "material": "Cotton",
    "gender": "Unisex"
  },
  ...
}
```

## Frontend Implementation Guide

### 1. Fetch Categories on Page Load
```javascript
const categories = await fetch('/api/v2/products/categories');
// Display in dropdown
```

### 2. Dynamic Form Based on Category
```javascript
function CategoryBasedForm({ selectedCategory }) {
  const [categoryConfig, setCategoryConfig] = useState(null);
  
  useEffect(() => {
    if (selectedCategory) {
      fetch(`/api/v2/products/categories/${selectedCategory}`)
        .then(res => res.json())
        .then(setCategoryConfig);
    }
  }, [selectedCategory]);
  
  return (
    <div>
      {categoryConfig?.attributes.map(attr => (
        <FormField key={attr.name} attribute={attr} />
      ))}
    </div>
  );
}
```

### 3. Render Form Fields
```javascript
function FormField({ attribute }) {
  switch (attribute.type) {
    case 'text':
      return <input type="text" required={attribute.required} />;
    case 'number':
      return <input type="number" required={attribute.required} />;
    case 'select':
      return (
        <select required={attribute.required}>
          {attribute.options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    case 'multi_select':
      return attribute.options.map(opt => (
        <label key={opt}>
          <input type="checkbox" value={opt} />
          {opt}
        </label>
      ));
    case 'color':
      return <input type="color" />;
    case 'boolean':
      return <input type="checkbox" />;
  }
}
```

### 4. Submit Product with Attributes
```javascript
const productData = {
  name: formData.name,
  price: formData.price,
  category: formData.category,
  attributes: {
    size: formData.size,
    color: formData.color,
    material: formData.material,
    // ... other dynamic attributes
  }
};

await fetch('/api/v2/products', {
  method: 'POST',
  body: JSON.stringify(productData)
});
```

## Instagram Chatbot Integration

When displaying products in Instagram:
```python
from app.models.product_model import Product
from app.models.category_model import get_category_config

product = await Product.get(product_id)
category_config = get_category_config(product.category)

# Format attributes for display
attributes_text = []
for attr_def in category_config.attributes:
    attr_name = attr_def.name
    if attr_name in product.attributes:
        value = product.attributes[attr_name]
        attributes_text.append(f"{attr_def.label}: {value}")

message = f"{product.name}\n"
message += f"Price: ${product.price}\n"
message += "\n".join(attributes_text)
```

Example output:
```
Premium Cotton T-Shirt
Price: $29.99
Size: L
Color: Blue
Material: Cotton
Gender: Unisex
```

## Adding New Categories

To add a new category, edit `app/models/category_model.py`:

```python
CATEGORY_CONFIGS["toys"] = CategoryConfig(
    category="toys",
    display_name="Toys & Games",
    icon="🧸",
    attributes=[
        AttributeDefinition(
            name="age_range",
            label="Age Range",
            type=AttributeType.SELECT,
            required=True,
            options=["0-2 years", "3-5 years", "6-8 years", "9+ years"],
        ),
        AttributeDefinition(
            name="material",
            label="Material",
            type=AttributeType.SELECT,
            options=["Plastic", "Wood", "Fabric", "Metal"],
        ),
        # ... more attributes
    ]
)
```

## Benefits

1. **Flexibility**: Different product types can have relevant attributes
2. **Validation**: Frontend can validate based on attribute definitions
3. **User Experience**: Show only relevant fields based on category
4. **Scalability**: Easy to add new categories without code changes
5. **Type Safety**: Attribute types ensure consistent data entry
6. **Instagram Integration**: Better product descriptions in chat

## Migration Notes

Existing products without `attributes` field will default to an empty dictionary `{}`. No migration needed - the field is optional and backwards compatible.
