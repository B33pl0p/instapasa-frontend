

# Customer Dashboard API Documentation

## Base URL
```
http://localhost:8000/api/v2
```

## Authentication

All authenticated endpoints require a JWT token in the request header:
```
Authorization: Bearer <access_token>
```

The token is obtained from signup/login endpoints and includes the customer's information.

---

## Authentication Endpoints

### 1. Customer Signup
**POST** `/auth/signup`

**Request Body:**
```json
{
  "email": "customer@example.com",
  "password": "securepassword",
  "business_name": "My Business",
  "instagram_username": "mybusiness",  // REQUIRED
  "phone": "+1234567890",              // Optional
  "brand_description": "We sell amazing products",  // Optional
  "tone": "friendly and professional",  // Optional
  "website": "https://example.com",     // Optional
  "company_contact_person": "John Doe", // Optional
  "contact_person_role": "CEO"          // Optional
}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

**Errors:**
- `400`: Email or Instagram username already registered

---

### 2. Customer Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "customer@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

**Errors:**
- `401`: Invalid email or password

---

## Customer Dashboard Endpoints

All dashboard endpoints require authentication token in the header.

### 3. Get Conversations
**GET** `/dashboard/conversations?limit=50`

Returns list of conversation summaries for the logged-in customer.

**Query Parameters:**
- `limit` (optional, default: 50): Maximum number of conversations to return

**Response:**
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

**Notes:**
- Returns empty array `[]` if Instagram is not connected (no error)
- Automatically syncs conversations from Meta Graph API before returning

---

### 4. Get Messages Overview
**GET** `/dashboard/messages-overview?platform=instagram`

Returns message overview grouped by platform.

**Query Parameters:**
- `platform` (required): `"instagram"` or `"facebook"`

**Response:**
```json
{
  "instagram_user_id": "123456",
  "instagram_username": "mybusiness",
  "page_id": "987654",
  "platform": "instagram",
  "conversations": [...]
}
```

**Errors:**
- `400`: Instagram not connected yet

---

### 5. Get Full Conversation Messages
**GET** `/dashboard/messages/{conversation_id}?platform=instagram`

Returns all messages in a specific conversation.

**Path Parameters:**
- `conversation_id` (required): The conversation ID

**Query Parameters:**
- `platform` (required): `"instagram"` or `"facebook"`

**Response:**
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
      "to_users": ["recipient_id"],
      "is_from_business": false
    }
  ]
}
```

**Errors:**
- `400`: Instagram not connected yet
- `404`: Conversation not found

---

## Product Management Endpoints

All product endpoints require authentication and only return products owned by the logged-in customer.

### 6. Create Product
**POST** `/dashboard/products`

**Request Body:**
```json
{
  "name": "Product Name",              // REQUIRED
  "description": "Product description", // Optional
  "price": 29.99,                      // REQUIRED
  "images": ["https://example.com/image.jpg"],  // Optional, array of URLs
  "sku": "SKU123",                     // Optional
  "stock": 100,                        // Optional, default: 0
  "category": "Electronics",           // Optional
  "is_active": true                    // Optional, default: true
}
```

**Response:**
```json
{
  "id": "product_id_123",
  "customer_id": "customer_id_456",
  "name": "Product Name",
  "description": "Product description",
  "price": 29.99,
  "images": ["https://example.com/image.jpg"],
  "sku": "SKU123",
  "stock": 100,
  "category": "Electronics",
  "is_active": true,
  "created_at": "2026-01-14T10:00:00Z",
  "updated_at": "2026-01-14T10:00:00Z"
}
```

---

### 7. Get All Products
**GET** `/dashboard/products?is_active=true&category=Electronics`

Returns all products for the logged-in customer.

**Query Parameters:**
- `is_active` (optional): Filter by active status (`true`/`false`)
- `category` (optional): Filter by category name

**Response:**
```json
[
  {
    "id": "product_id_123",
    "customer_id": "customer_id_456",
    "name": "Product Name",
    "description": "Product description",
    "price": 29.99,
    "images": ["https://example.com/image.jpg"],
    "sku": "SKU123",
    "stock": 100,
    "category": "Electronics",
    "is_active": true,
    "created_at": "2026-01-14T10:00:00Z",
    "updated_at": "2026-01-14T10:00:00Z"
  }
]
```

---

### 8. Get Single Product
**GET** `/dashboard/products/{product_id}`

**Path Parameters:**
- `product_id` (required): The product ID

**Response:** Same as Create Product response

**Errors:**
- `404`: Product not found
- `403`: Not authorized (product belongs to another customer)

---

### 9. Update Product
**PUT** `/dashboard/products/{product_id}`

**Path Parameters:**
- `product_id` (required): The product ID

**Request Body:** (all fields optional - only include fields to update)
```json
{
  "name": "Updated Product Name",
  "price": 39.99,
  "stock": 50,
  "is_active": false
}
```

**Response:** Updated product object (same structure as Create Product)

**Errors:**
- `404`: Product not found
- `403`: Not authorized

---

### 10. Delete Product
**DELETE** `/dashboard/products/{product_id}`

**Path Parameters:**
- `product_id` (required): The product ID

**Response:**
```json
{
  "message": "Product deleted successfully"
}
```

**Errors:**
- `404`: Product not found
- `403`: Not authorized

---

## Meta Authentication Endpoint

### 11. Complete Instagram Connection
**POST** `/auth/meta/complete`

Completes Instagram OAuth connection after user authorizes on Facebook. This is typically called after redirecting the user to Facebook OAuth.

**Request Body:**
```json
{
  "short_lived_token": "EAAMWg..."  // REQUIRED - from Facebook OAuth callback
}
```

**Response:**
```json
{
  "status": 200,
  "message": "Instagram professional account connected successfully via Meta",
  "instagram_username": "mybusiness",
  "instagram_id": "123456789"
}
```

**Errors:**
- `400`: Token exchange failed (token may have expired - user needs to reconnect)
- `400`: Could not find a Facebook Page connected to Instagram professional account

**Notes:**
- This endpoint exchanges the short-lived token for a long-lived token
- Automatically finds and connects the Instagram Business/Creator account linked to the user's Facebook Page
- Updates the customer record with Instagram connection details

---

## Admin API Endpoints

All admin endpoints require an admin JWT token in the request header:
```
Authorization: Bearer <admin_access_token>
```

Admin tokens are obtained from admin login or admin creation endpoints and have `type: "admin"` in the token payload.

---

### 12. Admin Login
**POST** `/auth/admin/login`

Login for admin users. Admin accounts must be created manually (not via public signup).

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "adminpassword"
}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

**Errors:**
- `401`: Invalid email or password

---

### 13. Create Admin User
**POST** `/auth/admin/create`

Create a new admin user. Accepts plain password and hashes it automatically.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "adminpassword",
  "name": "Admin Name",
  "admin_secret": "optional_secret_key"  // Optional - required if ADMIN_CREATE_SECRET is set in env
}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

**Errors:**
- `400`: Admin with this email already exists
- `403`: Invalid admin creation secret (if `ADMIN_CREATE_SECRET` is configured)

**Notes:**
- This endpoint is intended for initial setup via Swagger/API, not public signup
- If `ADMIN_CREATE_SECRET` is set in environment variables, the `admin_secret` field is required and must match

---

## Admin Customer Management Endpoints

All customer management endpoints are admin-only and require admin authentication.

### 14. Create Customer
**POST** `/admin/customer/store-customer`

Create a new customer account (admin only).

**Request Body:**
```json
{
  "email": "customer@example.com",
  "password": "customerpassword",
  "phone": "+1234567890",
  "business_name": "My Business",
  "instagram_username": "mybusiness",  // REQUIRED
  "brand_description": "We sell amazing products",  // Optional
  "tone": "friendly and professional",  // Optional
  "website": "https://example.com",     // Optional
  "company_contact_person": "John Doe", // Optional
  "contact_person_role": "CEO"          // Optional
}
```

**Response:**
```json
{
  "message": "Customer stored successfully",
  "data": {
    "id": "customer_id_123",
    "email": "customer@example.com",
    "business_name": "My Business",
    "instagram_username": "mybusiness",
    ...
  }
}
```

**Errors:**
- `400`: Email or Instagram username already exists

---

### 15. List All Customers
**GET** `/admin/customer/get-customer`

Returns a list of all customers in the system.

**Response:**
```json
[
  {
    "_id": "customer_id_123",
    "email": "customer@example.com",
    "business_name": "My Business",
    "instagram_username": "mybusiness",
    "brand_description": "We sell amazing products",
    "tone": "friendly and professional",
    "phone": "+1234567890",
    "website": "https://example.com",
    "instagram_user_id": "123456789",
    "instagram_page_id": "987654321",
    "created_at": "2026-01-14T10:00:00Z",
    "updated_at": "2026-01-14T10:00:00Z"
  }
]
```

---

### 16. Update Customer
**PUT** `/admin/customer/update-customer/{instagram_username}`

Update customer information by Instagram username.

**Path Parameters:**
- `instagram_username` (required): The customer's Instagram username

**Request Body:** (all fields optional - only include fields to update)
```json
{
  "email": "newemail@example.com",
  "business_name": "Updated Business Name",
  "brand_description": "Updated description",
  "tone": "professional",
  "phone": "+1234567890",
  "website": "https://newsite.com",
  "instagram_username": "newusername",
  "company_contact_person": "Jane Doe",
  "contact_person_role": "CTO"
}
```

**Response:**
Updated customer object

**Errors:**
- `404`: Customer not found

---

### 17. Delete Customer
**DELETE** `/admin/customer/delete-customer/{instagram_username}`

Delete a customer account by Instagram username.

**Path Parameters:**
- `instagram_username` (required): The customer's Instagram username

**Response:**
```json
{
  "message": "Customer deleted successfully"
}
```

**Errors:**
- `404`: Customer not found

---

### 18. Update Customer Knowledge Base
**POST** `/admin/customer/update-knowledge-base`

Upload and process a knowledge base file for a specific customer. Supports PDF, Markdown, and plain text files.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `customer_info` (required, JSON string): Customer identification
  ```json
  {
    "instagram_username": "mybusiness",  // Optional
    "instagram_user_id": "123456789"      // Optional (at least one required)
  }
  ```
- `file` (required, file): Knowledge base file (PDF, Markdown, or plain text)
- `chunk_size` (optional, query param, default: 500): Words per chunk (100-1000)
- `overlap` (optional, query param, default: 50): Number of overlapping words (0-200)
- `replace_existing` (optional, query param, default: true): Replace existing file chunks if file was uploaded before

**Example Request:**
```
POST /admin/customer/update-knowledge-base?chunk_size=500&overlap=50&replace_existing=true
Content-Type: multipart/form-data

customer_info: {"instagram_username": "mybusiness"}
file: [binary file data]
```

**Response:**
```json
{
  "message": "File processed and added to knowledge base successfully",
  "filename": "knowledge_base.pdf",
  "total_chunks": 25,
  "total_characters": 12500
}
```

**Errors:**
- `400`: Invalid customer_info JSON
- `400`: Customer not found
- `400`: Invalid file format

**Notes:**
- Markdown files use semantic chunking that respects headings
- If `replace_existing=true`, old chunks from the same filename are deleted first
- Uses `instagram_user_id` for ChromaDB collection name (more stable than username)
- Supports PDF, Markdown (.md), and plain text (.txt) files

---

## Error Responses

All endpoints may return these error codes:

- **400 Bad Request**: Invalid input or business logic error
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Authenticated but not authorized for this resource
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

Error response format:
```json
{
  "detail": "Error message describing what went wrong"
}
```

---

## Important Notes

1. **Authentication**: Store the `access_token` from login/signup responses and include it in all subsequent requests via the `Authorization: Bearer <token>` header.

2. **Instagram Connection**: The customer must connect their Instagram account via Meta OAuth before they can access messages or conversations. The `/dashboard/conversations` endpoint returns an empty array if not connected.

3. **Customer Context**: All dashboard endpoints automatically use the logged-in customer's data from the JWT token. You don't need to pass `instagram_user_id` or `customer_id` in requests.

4. **Product Ownership**: Products are automatically scoped to the logged-in customer. You can only view/edit/delete products you created.

5. **Orders**: Order management endpoints are not yet implemented in the backend. This will be added in future updates.

6. **Admin Authentication**: Admin endpoints require a separate admin JWT token. Admin tokens have `type: "admin"` while customer tokens have `type: "customer"`. The backend validates the token type for route access.

7. **Admin Customer Management**: Admins can manage all customers (create, read, update, delete) and upload knowledge base files on behalf of customers. Customers cannot access admin endpoints.
