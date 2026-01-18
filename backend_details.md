
## Overview
Build a modern, responsive customer dashboard web application for an Instagram-based e-commerce chatbot platform. The dashboard allows customers to manage their Instagram messaging, products, and orders.

## Tech Stack Requirements
- **Framework**: React with TypeScript (or Next.js if preferred)
- **Styling**: Tailwind CSS or similar modern CSS framework
- **State Management**: React Context API or Zustand/Redux
- **HTTP Client**: Axios or Fetch API
- **Routing**: React Router (or Next.js routing)
- **UI Components**: Use a component library like shadcn/ui, Material-UI, or Chakra UI for consistent design

## Backend API Base URL
- API Version: `/api/v2`
- All authenticated requests require JWT token in `Authorization: Bearer <token>` header

## Authentication Flow

### 1. Signup Page (`/signup`)
**Endpoint**: `POST /api/v2/auth/signup`

**Request Body**:
```json
{
  "email": "customer@example.com",
  "password": "securepassword",
  "phone": "+1234567890",
  "business_name": "My Business",
  "brand_description": "We sell amazing products",
  "tone": "friendly and professional",
  "website": "https://example.com",
  "company_contact_person": "John Doe",
  "contact_person_role": "CEO",
  "instagram_username": "mybusiness" // REQUIRED
}
```

**Response**:
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

**UI Requirements**:
- Form with all fields (email, password, business_name, instagram_username are required)
- brand_description and tone are optional but recommended
- Show validation errors
- On success: Store token in localStorage/sessionStorage and redirect to dashboard

### 2. Login Page (`/login`)
**Endpoint**: `POST /api/v2/auth/login`

**Request Body**:
```json
{
  "email": "customer@example.com",
  "password": "securepassword"
}
```

**Response**: Same as signup (access_token, token_type)

**UI Requirements**:
- Simple email/password form
- "Don't have an account? Sign up" link
- Store token and redirect to dashboard on success

### 3. Token Management
- Store JWT token in localStorage or httpOnly cookie
- Include token in all authenticated requests: `Authorization: Bearer <token>`
- Handle 401 errors by redirecting to login
- Implement token refresh if backend supports it

## Dashboard Layout

### Main Dashboard (`/dashboard`)
**Layout Structure**:
- **Sidebar Navigation** (left side, collapsible on mobile):
  - Logo/Brand name
  - Navigation tabs:
    1. Meta Connection
    2. Messages
    3. Products
    4. Orders
  - User profile section at bottom (email, logout button)

- **Main Content Area** (right side):
  - Shows selected tab content
  - Breadcrumbs (optional)
  - Page title

- **Header** (top bar, optional):
  - Notifications icon
  - User avatar/menu

### Protected Routes
- All dashboard routes require authentication
- Redirect to `/login` if not authenticated
- Show loading spinner while checking auth status

## Tab 1: Meta Connection (`/dashboard/meta`)

### Purpose
Allow customers to connect/disconnect their Instagram account to the platform.

### UI Components

**Connection Status Card**:
- Show current connection status:
  - ✅ **Connected**: Display Instagram username, page ID, connection date
  - ❌ **Not Connected**: Show "Connect Instagram" button

**Connect Button**:
- When clicked, redirect to: `https://www.facebook.com/v24.0/dialog/oauth?client_id={META_APP_ID}&redirect_uri={IG_REDIRECT_URL}&scope=instagram_basic,instagram_manage_messages,pages_show_list,pages_read_engagement&response_type=code`
- Note: The actual redirect URL and OAuth flow will be handled by the backend. For now, show a button that says "Connect Instagram" and handle the redirect flow.

**Disconnect Button** (if connected):
- Show confirmation modal
- On confirm, call backend to disconnect (if endpoint exists)
- Update UI to show disconnected state

**Connection Info Display** (if connected):
- Instagram Username
- Page ID
- Last synced date
- Connection status badge

### API Endpoints
- **Check Connection Status**: Use customer data from JWT (no endpoint needed, check if `instagram_page_id` exists in customer profile)
- **Disconnect**: May need to be implemented in backend (for now, just show UI)

## Tab 2: Messages (`/dashboard/messages`)

### Purpose
View Instagram and Facebook conversations with customers.

### UI Layout
**Two-Column Layout** (desktop) or **Stacked Layout** (mobile):

**Left Column - Conversation List**:
- List of conversations (preview cards)
- Each card shows:
  - Participant name/ID
  - Last message preview (truncated)
  - Timestamp (relative: "2 hours ago")
  - Unread indicator (if applicable)
- Click on a conversation to load full messages in right column
- Refresh button at top to sync latest conversations

**Right Column - Full Messages**:
- Shows selected conversation's full message thread
- Messages displayed in chronological order (oldest to newest)
- Each message shows:
  - Sender name/ID
  - Message text
  - Timestamp
  - Visual distinction for business messages vs customer messages
- Scrollable message area
- Auto-scroll to bottom on new messages

### API Endpoints

**1. Get Conversations**:
- `GET /api/v2/dashboard/conversations?limit=50`
- Headers: `Authorization: Bearer <token>`
- Response:
```json
[
  {
    "conversation_id": "t_123456789",
    "updated_time": "2026-01-14T10:30:00Z",
    "participants": ["sender_id_1", "sender_id_2"],
    "last_message": "Hello, I'm interested in..."
  }
]
```
- **Note**: Returns empty array `[]` if Instagram not connected (no error)

**2. Get Full Messages**:
- `GET /api/v2/dashboard/messages/{conversation_id}?platform=instagram`
- Headers: `Authorization: Bearer <token>`
- Response:
```json
{
  "instagram_user_id": "123456",
  "instagram_username": "mybusiness",
  "page_id": "987654",
  "platform": "instagram",
  "conversation_id": "t_123456789",
  "messages": [
    {
      "message_id": "m_123",
      "created_time": "2026-01-14T10:00:00Z",
      "text": "Hello!",
      "from_user": "sender_id",
      "is_from_business": false
    }
  ]
}
```

**3. Get Messages Overview** (optional, for platform-specific views):
- `GET /api/v2/dashboard/messages-overview?platform=instagram`
- Headers: `Authorization: Bearer <token>`

### Error Handling
- If Instagram not connected, show message: "Please connect your Instagram account first" with link to Meta Connection tab
- Handle 400/401/403 errors gracefully
- Show loading states while fetching

## Tab 3: Products (`/dashboard/products`)

### Purpose
Manage product catalog for Instagram e-commerce.

### UI Components

**Products List View** (default):
- Grid or list layout showing all products
- Each product card shows:
  - Product image (first image from images array, or placeholder)
  - Product name
  - Price
  - Stock quantity
  - Category badge
  - Active/Inactive status badge
  - Actions: Edit, Delete buttons

- **Top Bar**:
  - "Add New Product" button
  - Search/filter bar (by name, category)
  - Filter by status (All, Active, Inactive)
  - Filter by category dropdown

**Add/Edit Product Modal/Page**:
- Form fields:
  - Product Name* (required)
  - Description (textarea, optional)
  - Price* (required, number input)
  - SKU (optional, text input)
  - Stock Quantity* (required, number input)
  - Category (optional, text input or dropdown)
  - Images (multiple image URLs, text inputs or file upload if backend supports)
  - Active Status (toggle/checkbox, default: true)
- Save button
- Cancel button
- Validation errors display

**Product Detail View** (optional):
- Full product information
- Edit and Delete actions

### API Endpoints

**1. Create Product**:
- `POST /api/v2/dashboard/products`
- Headers: `Authorization: Bearer <token>`
- Body:
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 29.99,
  "images": ["https://example.com/image1.jpg"],
  "sku": "SKU123",
  "stock": 100,
  "category": "Electronics",
  "is_active": true
}
```
- Response: `ProductResponse` (same structure with `id`, `customer_id`, `created_at`, `updated_at`)

**2. Get All Products**:
- `GET /api/v2/dashboard/products?is_active=true&category=Electronics`
- Headers: `Authorization: Bearer <token>`
- Response: Array of `ProductResponse`

**3. Get Single Product**:
- `GET /api/v2/dashboard/products/{product_id}`
- Headers: `Authorization: Bearer <token>`
- Response: `ProductResponse`

**4. Update Product**:
- `PUT /api/v2/dashboard/products/{product_id}`
- Headers: `Authorization: Bearer <token>`
- Body: Partial `ProductUpdate` (all fields optional)
- Response: `ProductResponse`

**5. Delete Product**:
- `DELETE /api/v2/dashboard/products/{product_id}`
- Headers: `Authorization: Bearer <token>`
- Response: `{"message": "Product deleted successfully"}`

### Error Handling
- Show validation errors for form fields
- Handle 404 (product not found)
- Handle 403 (unauthorized - shouldn't happen but handle gracefully)
- Confirm before delete action

## Tab 4: Orders (`/dashboard/orders`)

### Purpose
View and manage customer orders from Instagram e-commerce.

### UI Components

**Orders List View**:
- Table or card layout showing all orders
- Each order shows:
  - Order Number
  - Customer (Instagram user ID or name if available)
  - Order Date
  - Total Amount
  - Status Badge (color-coded):
    - Pending (yellow)
    - Confirmed (blue)
    - Processing (purple)
    - Shipped (orange)
    - Delivered (green)
    - Cancelled (red)
  - Actions: View Details, Update Status

- **Top Bar**:
  - Filter by status dropdown
  - Search by order number
  - Date range filter (optional)

**Order Detail View/Modal**:
- Order Information:
  - Order Number
  - Order Date
  - Customer Instagram User ID
  - Conversation ID (link to messages if possible)
  - Shipping Address
  - Phone Number
  - Status
  - Notes
- Order Items Table:
  - Product Name
  - Quantity
  - Price per unit
  - Total
  - Product Image (thumbnail)
- Order Summary:
  - Subtotal
  - Shipping (if applicable)
  - Total
- Status Update Section:
  - Status dropdown/buttons
  - Update button
- Mark as Delivered button (if status is "shipped")

### API Endpoints

**Note**: Order management endpoints may need to be implemented in the backend. For now, design the UI assuming these endpoints exist:

**1. Get All Orders**:
- `GET /api/v2/dashboard/orders?status=pending&limit=50`
- Headers: `Authorization: Bearer <token>`
- Expected Response:
```json
[
  {
    "id": "order_id",
    "order_number": "ORD-12345",
    "customer_id": "customer_id",
    "instagram_user_id": "buyer_ig_id",
    "conversation_id": "t_123",
    "items": [
      {
        "product_id": "prod_123",
        "product_name": "Product Name",
        "quantity": 2,
        "price": 29.99,
        "image_url": "https://..."
      }
    ],
    "total": 59.98,
    "shipping_address": "123 Main St",
    "phone": "+1234567890",
    "status": "pending",
    "notes": "Handle with care",
    "created_at": "2026-01-14T10:00:00Z",
    "updated_at": "2026-01-14T10:00:00Z"
  }
]
```

**2. Get Single Order**:
- `GET /api/v2/dashboard/orders/{order_id}`
- Headers: `Authorization: Bearer <token>`
- Response: Single order object

**3. Update Order Status**:
- `PUT /api/v2/dashboard/orders/{order_id}/status`
- Headers: `Authorization: Bearer <token>`
- Body:
```json
{
  "status": "shipped" // or "confirmed", "processing", "shipped", "delivered", "cancelled"
}
```
- Response: Updated order object

**4. Mark as Delivered**:
- `PUT /api/v2/dashboard/orders/{order_id}/deliver`
- Headers: `Authorization: Bearer <token>`
- Response: Updated order object

### Order Status Flow
- **pending** → **confirmed** → **processing** → **shipped** → **delivered**
- Can also be **cancelled** from any status (with confirmation)

### Error Handling
- Handle missing orders (404)
- Show validation errors for status updates
- Confirm before cancelling orders

## Additional Features

### 1. Loading States
- Show skeleton loaders or spinners while data is fetching
- Disable buttons during API calls

### 2. Error Messages
- Display user-friendly error messages
- Use toast notifications or inline error messages
- Handle network errors gracefully

### 3. Responsive Design
- Mobile-first approach
- Sidebar collapses to hamburger menu on mobile
- Tables become cards on mobile
- Touch-friendly buttons and inputs

### 4. Empty States
- Show helpful messages when no data exists:
  - "No products yet. Add your first product!"
  - "No orders yet. Orders will appear here."
  - "No conversations yet. Connect Instagram to start receiving messages."

### 5. Success Notifications
- Show success toasts/messages after:
  - Creating/updating/deleting products
  - Updating order status
  - Connecting Instagram

### 6. Logout
- Clear token from storage
- Redirect to login page
- Show confirmation if user has unsaved changes

## Design Guidelines

### Color Scheme
- Primary: Professional blue or brand color
- Success: Green
- Warning: Yellow/Orange
- Error: Red
- Neutral: Gray scale for text and backgrounds

### Typography
- Clear, readable font (Inter, Roboto, or system font stack)
- Heading hierarchy (h1, h2, h3)
- Consistent font sizes

### Spacing
- Consistent padding and margins
- Use spacing scale (4px, 8px, 16px, 24px, 32px, etc.)

### Icons
- Use icon library (Heroicons, Lucide, or similar)
- Consistent icon sizes and styles

## Implementation Notes

1. **API Client Setup**:
   - Create a centralized API client that:
     - Adds Authorization header automatically
     - Handles errors consistently
     - Has base URL configuration

2. **Authentication Context**:
   - Create AuthContext to:
     - Store current user/token
     - Provide login/logout functions
     - Check authentication status

3. **Route Protection**:
   - Create ProtectedRoute component that:
     - Checks if user is authenticated
     - Redirects to login if not
     - Shows loading state while checking

4. **Form Handling**:
   - Use form library (React Hook Form, Formik) for:
     - Validation
     - Error handling
     - Submission state

5. **Data Fetching**:
   - Use React Query or SWR for:
     - Caching
     - Automatic refetching
     - Loading/error states

## Testing Considerations
- Test authentication flow (login, signup, logout)
- Test protected routes
- Test API error handling
- Test responsive design on mobile/tablet/desktop
- Test form validation

## Future Enhancements (Not Required Now)
- Real-time message updates (WebSocket)
- Product image upload (if backend supports)
- Order analytics/charts
- Export orders to CSV
- Bulk product operations
- Customer profiles from Instagram

---

**Important**: This is a customer-facing dashboard. Focus on usability, clarity, and a professional appearance. The UI should be intuitive and require minimal learning curve for business owners managing their Instagram e-commerce.
