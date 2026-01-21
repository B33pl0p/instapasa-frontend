# Frontend Implementation Guide: E-commerce Product Management

## Overview

This guide provides detailed instructions for implementing the e-commerce product management, shopping cart, and order placement features on the frontend.

---

## 📦 API Endpoints Summary

### Authentication
All endpoints (except webhook) require authentication via JWT token in header:
```
Authorization: Bearer <jwt_token>
```

### Base URL
```
https://api.lakhey.tech/api/v2/dashboard
```

---

## 1️⃣ Product Management

### 1.1 Create Product

**Endpoint:** `POST /products`

**Request:**
```json
{
  "name": "Premium Headphones",
  "description": "High-quality wireless headphones with noise cancellation",
  "price": 99.99,
  "stock": 50,
  "category": "Electronics",
  "sku": "HP-2024-001",
  "images": [],
  "is_active": true
}
```

**Response (201 Created):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "customer_id": "507f1f77bcf86cd799439012",
  "name": "Premium Headphones",
  "description": "High-quality wireless headphones with noise cancellation",
  "price": 99.99,
  "stock": 50,
  "category": "Electronics",
  "sku": "HP-2024-001",
  "images": [],
  "is_active": true,
  "created_at": "2024-01-20T10:00:00Z",
  "updated_at": "2024-01-20T10:00:00Z"
}
```

**Frontend Implementation (React Example):**
```javascript
async function createProduct(productData) {
  const response = await fetch('https://api.lakhey.tech/api/v2/dashboard/products', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });
  
  if (!response.ok) throw new Error('Failed to create product');
  return response.json();
}
```

---

### 1.2 List All Products

**Endpoint:** `GET /products`

**Query Parameters:**
- `is_active` (boolean, optional): Filter by active status
- `category` (string, optional): Filter by category

**Example:** `GET /products?is_active=true&category=Electronics`

**Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Premium Headphones",
    ...
  },
  {
    "id": "507f1f77bcf86cd799439013",
    "name": "Wireless Mouse",
    ...
  }
]
```

---

### 1.3 Get Active Products

**Endpoint:** `GET /products/active`

Returns only products where `is_active=true`

---

### 1.4 Get Low Stock Products

**Endpoint:** `GET /products/low-stock`

**Query Parameters:**
- `threshold` (integer, default=10): Stock level below which to alert

**Example:** `GET /products/low-stock?threshold=5`

**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Premium Headphones",
    "stock": 3,
    ...
  }
]
```

---

### 1.5 Get Single Product

**Endpoint:** `GET /products/{product_id}`

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Premium Headphones",
  ...
}
```

**Error (404 Not Found):**
```json
{
  "detail": "Product not found"
}
```

---

### 1.6 Update Product

**Endpoint:** `PUT /products/{product_id}`

**Request (Partial Update):**
```json
{
  "price": 89.99,
  "stock": 45,
  "description": "Updated description"
}
```

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Premium Headphones",
  "price": 89.99,
  "stock": 45,
  ...
}
```

**Frontend Implementation:**
```javascript
async function updateProduct(productId, updates) {
  const response = await fetch(`https://api.lakhey.tech/api/v2/dashboard/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) throw new Error('Failed to update product');
  return response.json();
}
```

---

### 1.7 Delete Product

**Endpoint:** `DELETE /products/{product_id}`

**Response (200 OK):**
```json
{
  "message": "Product deleted successfully"
}
```

---

## 📸 Product Images

### 1.8 Get Presigned URL for Image Upload (NEW - Recommended)

**Endpoint:** `POST /products/{product_id}/get-upload-url`

**Response (200 OK):**
```json
{
  "presigned_url": "https://bucket.s3.region.amazonaws.com/product_images/...?X-Amz-Algorithm=...",
  "image_url": "https://bucket.s3.region.amazonaws.com/product_images/customer_id/product_id/filename.jpg",
  "s3_key": "product_images/customer_id/product_id/filename.jpg"
}
```

**Frontend Flow:**
1. Request presigned URL from backend
2. Upload file directly to S3 using presigned URL
3. Confirm upload with backend to add image to product

**Frontend Implementation (React Example):**
```javascript
// Step 1: Get presigned URL
async function getUploadUrl(productId) {
  const response = await fetch(
    `https://api.lakhey.tech/api/v2/dashboard/products/${productId}/get-upload-url`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    }
  );
  
  if (!response.ok) throw new Error('Failed to get upload URL');
  return response.json();
}

// Step 2: Upload directly to S3
async function uploadToS3(presignedUrl, file) {
  const response = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type || 'image/jpeg',
    },
  });
  
  if (!response.ok) throw new Error('S3 upload failed');
  return true;
}

// Step 3: Confirm upload with backend
async function confirmUpload(productId, imageUrl) {
  const response = await fetch(
    `https://api.lakhey.tech/api/v2/dashboard/products/${productId}/confirm-upload?image_url=${encodeURIComponent(imageUrl)}`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    }
  );
  
  if (!response.ok) throw new Error('Failed to confirm upload');
  return response.json();
}

// Usage with file input:
async function handleImageSelect(event, productId) {
  const file = event.target.files[0];
  if (file) {
    try {
      // Get presigned URL
      const { presigned_url, image_url } = await getUploadUrl(productId);
      
      // Upload to S3
      await uploadToS3(presigned_url, file);
      
      // Confirm with backend
      await confirmUpload(productId, image_url);
      
      console.log('Image uploaded successfully:', image_url);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  }
}
```

**Supported Image Types:**
- `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
- Max size: 5MB

---

### 1.9 Upload Product Image (Alternative - Direct Backend Upload)

**Endpoint:** `POST /products/{product_id}/upload-image`

**Note:** Use presigned URL flow (1.8) for better performance and less backend load.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with file field

**Response (200 OK):**
```json
{
  "image_url": "https://bucket.s3.region.amazonaws.com/product_images/customer_id/product_id/filename.jpg",
  "product_id": "507f1f77bcf86cd799439011",
  "filename": "headphones.jpg"
}
```

**Frontend Implementation (React Example):**
```javascript
async function uploadProductImage(productId, file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(
    `https://api.lakhey.tech/api/v2/dashboard/products/${productId}/upload-image`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    }
  );
  
  if (!response.ok) throw new Error('Failed to upload image');
  return response.json();
}
```

---

### 1.10 Remove Product Image

**Endpoint:** `DELETE /products/{product_id}/images/{image_index}`

**Parameters:**
- `product_id` (string): Product ID
- `image_index` (integer): Index of image in the product's images array

**Example:** `DELETE /products/507f1f77bcf86cd799439011/images/0`

**Response (200 OK):**
```json
{
  "message": "Image removed successfully"
}
```

---

## 🛒 Shopping Cart

### 2.1 Initialize Cart

**Endpoint:** `POST /carts/init`

**Query Parameters:**
- `conversation_id` (string): Instagram conversation ID
- `sender_id` (string): Instagram user ID (buyer)

**Example:** `POST /carts/init?conversation_id=conv_123&sender_id=user_456`

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "conversation_id": "conv_123",
  "sender_id": "user_456",
  "customer_id": "seller_123",
  "items": [],
  "total": 0,
  "item_count": 0,
  "updated_at": "2024-01-20T10:00:00Z"
}
```

---

### 2.2 Get Current Cart

**Endpoint:** `GET /carts`

**Query Parameters:**
- `conversation_id` (string): Instagram conversation ID
- `sender_id` (string): Instagram user ID (buyer)

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "conversation_id": "conv_123",
  "sender_id": "user_456",
  "customer_id": "seller_123",
  "items": [
    {
      "product_id": "prod_1",
      "product_name": "Premium Headphones",
      "quantity": 2,
      "price": 99.99,
      "image_url": "/uploads/product_images/customer_id/image.jpg"
    }
  ],
  "total": 199.98,
  "item_count": 2,
  "updated_at": "2024-01-20T10:00:00Z"
}
```

---

### 2.3 Add Item to Cart

**Endpoint:** `POST /carts/add-item`

**Query Parameters:**
- `conversation_id` (string): Instagram conversation ID
- `sender_id` (string): Instagram user ID (buyer)

**Request:**
```json
{
  "product_id": "507f1f77bcf86cd799439011",
  "quantity": 2
}
```

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "conversation_id": "conv_123",
  "sender_id": "user_456",
  "customer_id": "seller_123",
  "items": [
    {
      "product_id": "507f1f77bcf86cd799439011",
      "product_name": "Premium Headphones",
      "quantity": 2,
      "price": 99.99,
      "image_url": "/uploads/product_images/customer_id/image.jpg"
    }
  ],
  "total": 199.98,
  "item_count": 2,
  "updated_at": "2024-01-20T10:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid quantity, insufficient stock, product not active
- `404 Not Found`: Product not found

**Frontend Implementation:**
```javascript
async function addToCart(conversationId, senderId, productId, quantity) {
  const response = await fetch(
    `https://api.lakhey.tech/api/v2/dashboard/carts/add-item?conversation_id=${conversationId}&sender_id=${senderId}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity,
      }),
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to add to cart');
  }
  return response.json();
}
```

---

### 2.4 Remove Item from Cart

**Endpoint:** `DELETE /carts/remove-item`

**Query Parameters:**
- `conversation_id` (string): Instagram conversation ID
- `sender_id` (string): Instagram user ID (buyer)
- `product_id` (string): Product to remove

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "items": [],
  "total": 0,
  "item_count": 0,
  "updated_at": "2024-01-20T10:00:00Z"
}
```

---

### 2.5 Update Cart Item Quantity

**Endpoint:** `PUT /carts/update-item`

**Query Parameters:**
- `conversation_id` (string): Instagram conversation ID
- `sender_id` (string): Instagram user ID (buyer)
- `product_id` (string): Product to update

**Request:**
```json
{
  "quantity": 5
}
```

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "items": [
    {
      "product_id": "507f1f77bcf86cd799439011",
      "product_name": "Premium Headphones",
      "quantity": 5,
      "price": 99.99,
      "image_url": "/uploads/product_images/customer_id/image.jpg"
    }
  ],
  "total": 499.95,
  "item_count": 5,
  "updated_at": "2024-01-20T10:00:00Z"
}
```

---

### 2.6 Clear Cart

**Endpoint:** `DELETE /carts/clear`

**Query Parameters:**
- `conversation_id` (string): Instagram conversation ID
- `sender_id` (string): Instagram user ID (buyer)

**Response (200 OK):**
```json
{
  "message": "Cart cleared successfully"
}
```

---

## 📋 Order Management

### 3.1 Place Order

**Endpoint:** `POST /orders/place-order`

**Query Parameters:**
- `conversation_id` (string): Instagram conversation ID
- `sender_id` (string): Instagram user ID (buyer)

**Request:**
```json
{
  "shipping_address": "123 Main St, Kathmandu, Nepal",
  "phone": "+977-1234567890",
  "notes": "Please deliver on afternoon, handle with care"
}
```

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "order_number": "ORD-ABC12345",
  "customer_id": "seller_123",
  "instagram_user_id": "user_456",
  "conversation_id": "conv_123",
  "items": [
    {
      "product_id": "prod_1",
      "product_name": "Premium Headphones",
      "quantity": 2,
      "price": 99.99,
      "image_url": "/uploads/product_images/customer_id/image.jpg"
    }
  ],
  "total": 199.98,
  "shipping_address": "123 Main St, Kathmandu, Nepal",
  "phone": "+977-1234567890",
  "status": "pending",
  "notes": "Please deliver on afternoon",
  "created_at": "2024-01-20T10:00:00Z",
  "updated_at": "2024-01-20T10:00:00Z"
}
```

**Important Notes:**
- Cart must not be empty
- Stock is automatically decreased on order placement
- Order status starts as "pending"
- If order fails, stock is not modified

**Frontend Implementation:**
```javascript
async function placeOrder(conversationId, senderId, orderData) {
  const response = await fetch(
    `https://api.lakhey.tech/api/v2/dashboard/orders/place-order?conversation_id=${conversationId}&sender_id=${senderId}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to place order');
  }
  
  const order = await response.json();
  // Clear cart after successful order
  await clearCart(conversationId, senderId);
  return order;
}
```

---

### 3.2 Get Order Details

**Endpoint:** `GET /orders/{order_id}`

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "order_number": "ORD-ABC12345",
  "customer_id": "seller_123",
  "instagram_user_id": "user_456",
  "conversation_id": "conv_123",
  "items": [...],
  "total": 199.98,
  "status": "pending",
  "created_at": "2024-01-20T10:00:00Z",
  "updated_at": "2024-01-20T10:00:00Z"
}
```

---

### 3.3 Get Order by Order Number

**Endpoint:** `GET /orders/order-number/{order_number}`

**Example:** `GET /orders/order-number/ORD-ABC12345`

---

### 3.4 List All Orders (for Seller)

**Endpoint:** `GET /orders`

**Query Parameters:**
- `status` (string, optional): Filter by status (pending, confirmed, processing, shipped, delivered, cancelled)

**Example:** `GET /orders?status=pending`

**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "order_number": "ORD-ABC12345",
    "status": "pending",
    ...
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "order_number": "ORD-XYZ67890",
    "status": "shipped",
    ...
  }
]
```

---

### 3.5 Get Buyer Order History

**Endpoint:** `GET /orders/buyer/{instagram_user_id}`

**Query Parameters:**
- `customer_id` (string, optional): Filter by specific seller

**Example:** `GET /orders/buyer/user_456?customer_id=seller_123`

---

### 3.6 Update Order Status

**Endpoint:** `PUT /orders/{order_id}/status`

**Request:**
```json
{
  "status": "confirmed"
}
```

**Valid Status Values:**
- `pending`
- `confirmed`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "order_number": "ORD-ABC12345",
  "status": "confirmed",
  "updated_at": "2024-01-20T10:05:00Z",
  ...
}
```

---

### 3.7 Cancel Order

**Endpoint:** `POST /orders/{order_id}/cancel`

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "order_number": "ORD-ABC12345",
  "status": "cancelled",
  "updated_at": "2024-01-20T10:10:00Z",
  ...
}
```

**Important:**
- Cannot cancel delivered orders
- Stock is automatically restored when order is cancelled
- Can only be cancelled by seller

**Error Cases:**
- `400 Bad Request`: Order already cancelled or already delivered
- `403 Forbidden`: Not authorized to cancel this order
- `404 Not Found`: Order not found

---

### 3.8 Get Order Statistics

**Endpoint:** `GET /orders/statistics/all`

**Response (200 OK):**
```json
{
  "total_orders": 25,
  "total_revenue": 5000.00,
  "pending": 5,
  "confirmed": 8,
  "processing": 3,
  "shipped": 6,
  "delivered": 3,
  "cancelled": 0
}
```

---

### 3.9 Get Low Stock Alerts

**Endpoint:** `GET /orders/alerts/low-stock`

**Query Parameters:**
- `threshold` (integer, default=10): Stock level below which to alert

**Response (200 OK):**
```json
[
  {
    "product_id": "prod_1",
    "product_name": "Premium Headphones",
    "current_stock": 5,
    "threshold": 10
  },
  {
    "product_id": "prod_2",
    "product_name": "Wireless Mouse",
    "current_stock": 2,
    "threshold": 10
  }
]
```

---

## 🔄 Complete User Flow Example

### Frontend Flow: Add to Cart → Place Order

```javascript
// Step 1: Get or Initialize Cart
const cart = await initCart(conversationId, senderId);

// Step 2: Get Products
const products = await getProducts();

// Step 3: Add Product to Cart
const updatedCart = await addToCart(
  conversationId, 
  senderId, 
  products[0].id, 
  2
);
console.log(`Total: $${updatedCart.total}, Items: ${updatedCart.item_count}`);

// Step 4: Update Item Quantity
const updatedCart2 = await updateCartItem(
  conversationId,
  senderId,
  products[0].id,
  3
);

// Step 5: Place Order
const order = await placeOrder(conversationId, senderId, {
  shipping_address: "123 Main St, City",
  phone: "+1234567890",
  notes: "Rush delivery if possible"
});

console.log(`Order placed: ${order.order_number}`);
console.log(`Status: ${order.status}`);

// Step 6: Track Order
const orderDetails = await getOrderDetail(order.id);
console.log(`Order Status: ${orderDetails.status}`);
```

---

## ⚠️ Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "detail": "Insufficient stock. Available: 5, Requested: 10"
}
```

**401 Unauthorized:**
```json
{
  "detail": "Not authenticated"
}
```

**403 Forbidden:**
```json
{
  "detail": "Not authorized to access this product"
}
```

**404 Not Found:**
```json
{
  "detail": "Product not found"
}
```

**500 Internal Server Error:**
```json
{
  "detail": "Error placing order"
}
```

---

## 📊 Stock Management

### Automatic Stock Decrease

When an order is placed:
1. System checks if stock is available for all items
2. If insufficient, returns `400 Bad Request` with detail
3. If sufficient, stock is decreased by order quantity
4. Order is created with status "pending"

### Automatic Stock Restore

When an order is cancelled:
1. Stock is increased by order item quantities
2. Order status changes to "cancelled"

---

## 🎨 Frontend Component Examples

### Product List Component (React)
```javascript
function ProductListComponent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="product-grid">
      {products.map(product => (
        <ProductCard 
          key={product.id} 
          product={product}
          onAddToCart={() => addToCart(product.id, 1)}
        />
      ))}
    </div>
  );
}
```

### Cart Summary Component (React)
```javascript
function CartSummaryComponent({ conversationId, senderId }) {
  const [cart, setCart] = useState(null);

  useEffect(() => {
    getCart(conversationId, senderId)
      .then(setCart)
      .catch(() => console.log("Cart not found, initializing..."));
  }, []);

  const handleCheckout = () => {
    placeOrder(conversationId, senderId, {
      shipping_address: formData.address,
      phone: formData.phone,
      notes: formData.notes,
    })
    .then(order => showSuccessMessage(`Order ${order.order_number} placed!`))
    .catch(error => showErrorMessage(error.message));
  };

  return (
    <div className="cart-summary">
      <h3>Cart Total: ${cart?.total || 0}</h3>
      <p>Items: {cart?.item_count || 0}</p>
      <button onClick={handleCheckout}>Checkout</button>
    </div>
  );
}
```

---

## 📝 Notes for Frontend Developer

1. **Image URLs**: All image URLs are relative paths. In production, prepend the base URL or CDN.
2. **Stock Validation**: Frontend should display "Out of Stock" based on product.stock = 0
3. **Cart Persistence**: Cart is associated with conversation_id and sender_id, not the user session
4. **Order Number**: Use order_number for display, order.id for API calls
5. **Status Colors**: pending=gray, confirmed=blue, processing=orange, shipped=yellow, delivered=green, cancelled=red
6. **Error Messages**: Always display error.detail to the user
7. **Loading States**: Implement loading indicators for all API calls
8. **Optimistic Updates**: Consider optimistic UI updates for better UX

---

## ✅ Testing Checklist

- [ ] Create product with images
- [ ] Update product stock and price
- [ ] Delete product
- [ ] Upload multiple images to product
- [ ] Remove image from product
- [ ] Initialize cart
- [ ] Add item to cart
- [ ] Update quantity in cart
- [ ] Remove item from cart
- [ ] Place order (stock decreases)
- [ ] Get order details
- [ ] Update order status
- [ ] Cancel order (stock increases)
- [ ] View order statistics
- [ ] Check low stock alerts

---

This implementation provides a complete, production-ready e-commerce backend. Let me know if you need clarifications on any endpoint!
