# Order Management API - Technical Documentation

## Order Flow

### Order Creation
Orders are created in two ways:
1. **Instagram Checkout** - Automatic via webhook when customer clicks checkout button
2. **Quick Order API** - Manual via `POST /quick-orders` endpoint

Both create orders with `status: "pending_details"` and clear the cart.

### Workflow
1. Customer completes Instagram checkout → Order created with `pending_details` status
2. Backend sends message: "A representative will contact you soon"
3. Seller views `pending_details` orders in dashboard
4. Seller contacts customer and fills in details via `PUT /quick-orders/{order_id}/details`
5. Once all fields filled (name, address, phone) → Status auto-changes to `confirmed`
6. Seller updates status through lifecycle: `processing` → `shipped` → `delivered`

### Order Data Structure

```typescript
Order {
  id: string
  order_number: string              // Format: "ORD-XXXXXXXX"
  customer_id: string               // Seller/business ID
  instagram_user_id: string         // Buyer Instagram ID
  conversation_id: string           // Instagram conversation ID
  items: OrderItem[]
  total: number
  customer_name?: string            // Optional - filled by seller
  shipping_address?: string         // Optional - filled by seller
  phone?: string                    // Optional - filled by seller
  payment_reference?: string        // Optional
  payment_method?: string           // Optional
  payment_confirmed_at?: datetime   // Optional
  status: OrderStatus               // See status enum below
  notes?: string
  created_at: datetime
  updated_at: datetime
}

OrderItem {
  product_id: string
  product_name: string
  quantity: number
  price: number
  image_url?: string
}
```

### Order Status Enum
`pending_details` | `confirmed` | `processing` | `shipped` | `delivered` | `cancelled`

---

## API Endpoints

**Auth Required:** Bearer token in Authorization header

---

## Quick Order Endpoints
Base URL: `/api/v2/quick-orders`

### 1. Create Quick Order
**POST** `/quick-orders`

**Query Params:**
- `sender_id` (required): Instagram user ID (buyer)
- `conversation_id` (required): Instagram conversation ID

**Response:** `Order` with status `pending_details`

**Notes:**
- Creates order from cart items
- Cart is cleared after order creation
- No customer details required initially

---

### 2. Update Order Details
**PUT** `/quick-orders/{order_id}/details`

**Query Params:**
- `customer_name` (optional): Customer full name
- `shipping_address` (optional): Delivery address
- `phone` (optional): Contact phone number

**Response:** `Order`

**Notes:**
- Update customer details after contacting them
- Status auto-changes to `confirmed` when ALL fields (name, address, phone) are filled
- Can be called multiple times to update partial info

---

### 3. Get Quick Order
**GET** `/quick-orders/{order_id}`

**Response:** `Order`

---

### 4. List Orders by Status
**GET** `/quick-orders?status=pending_details`

**Query Params:**
- `status` (optional, default: "pending_details"): Filter by order status

**Response:** `Order[]` sorted by newest first

---

## Order Management Endpoints
Base URL: `/api/v2/orders`

### 5. List All Orders
**GET** `/orders`

**Query Params:**
- `status` (optional): Filter by order status

**Response:** `Order[]`

---

### 6. Get Order by ID
**GET** `/orders/{order_id}`

**Response:** `Order`

---

### 7. Get Order by Number
**GET** `/orders/order-number/{order_number}`

**Response:** `Order`

---

### 8. Update Order Status
**PUT** `/orders/{order_id}/status`

**Request Body:**
```json
{
  "status": "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
}
```

**Response:** `Order`

**Notes:** 
- Validates status transitions
- Cannot change status of already delivered/cancelled orders

---

### 9. Cancel Order
**POST** `/orders/{order_id}/cancel`

**Request Body:** None

**Response:** `Order`

**Notes:**
- Automatically restores product stock
- Cannot cancel delivered orders
- Sets status to `cancelled`

---

### 10. Order Statistics
**GET** `/orders/statistics/all`

**Response:**
```typescript
{
  total_orders: number
  total_revenue: number
  pending: number          // Count by status
  confirmed: number
  processing: number
  shipped: number
  delivered: number
  cancelled: number
}
```

---

### 11. Low Stock Alerts
**GET** `/orders/alerts/low-stock?threshold=10`

**Query Params:**
- `threshold` (optional, default: 10): Stock level alert threshold

**Response:**
```typescript
{
  product_id: string
  product_name: string
  current_stock: number
  threshold: number
}[]
```

---

## Error Responses

All endpoints return standard HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `403` - Forbidden (not authorized to access this order)
- `404` - Order not found
- `500` - Internal server error

Error format:
```json
{
  "detail": "Error message"
}
```

---

## Authorization

Only sellers can access their own orders. The API validates:
- Seller owns the order (`order.customer_id == current_customer.id`)
- Valid JWT token in request headers

---

## Important Notes

1. **Quick Order Flow** - Use `/quick-orders` endpoints for creating and updating order details
2. **Auto Status Change** - Status changes from `pending_details` → `confirmed` when name, address, and phone are all filled
3. **Stock Management** - Stock automatically decreased on order creation and restored on cancellation
4. **Order Numbers** - System-generated, format: `ORD-XXXXXXXX` (8 hex characters)
5. **Two API Groups** - `/quick-orders` for creation/details, `/orders` for status updates and management
