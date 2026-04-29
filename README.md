# InstaPasa Frontend

InstaPasa is a Next.js frontend for an Instagram commerce platform. It includes a public landing page and a protected seller dashboard where Instagram marketers and businesses can manage conversations, products, orders, buyers, and account settings.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Material UI 7
- Redux Toolkit
- Axios

## Project Structure

```text
app/
  (site)/
    page.tsx
    login/
    signup/
    services/
    privacy-policy/
    components/
    lib/
  dashboard/
    layout.tsx
    message/
    products/
    orders/
    buyers/
    settings/
    lib/
  api/
    upload-image/
public/
```

## Public Site

The public website lives in `app/(site)`.

Main routes:

- `/` - landing page
- `/login` - seller login
- `/signup` - seller signup
- `/services` - service information
- `/privacy-policy` - privacy policy page

The landing page is composed from components such as:

- `Hero`
- `Clients`
- `FeatureSection`
- `Pricing`

## Dashboard

The protected dashboard lives in `app/dashboard`.

Main routes:

- `/dashboard/message` - seller profile and Instagram integration controls
- `/dashboard/message/instagram` - Instagram conversation inbox
- `/dashboard/message/messenger` - Messenger conversation area
- `/dashboard/message/analytics` - analytics page
- `/dashboard/products` - product management
- `/dashboard/products/create` - create product
- `/dashboard/products/[id]` - edit product
- `/dashboard/orders` - order management
- `/dashboard/buyers` - buyer management
- `/dashboard/settings` - business and account settings

The dashboard uses a shared layout with:

- Protected route guard
- Sidebar navigation
- Light and dark theme support
- Logout flow
- Customer data loaded from the JWT token
- Background Instagram message sync after login

## Core Features

### Authentication

Authentication is handled client-side through `app/(site)/lib/auth.ts`.

The app stores the access token in `localStorage` using the key:

```text
auth_token
```

Login and signup call the backend API through the shared Axios client.

### API Client

The shared API client is defined in:

```text
app/dashboard/lib/apiClient.ts
```

By default, API requests use:

```text
https://api.lakhey.tech/api/v2
```

Set `NEXT_PUBLIC_API_URL` to point the frontend to a different backend.

Example:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

The API client automatically attaches the bearer token for authenticated requests.

### Instagram Messaging

Instagram message state is managed with Redux in:

```text
app/dashboard/lib/slices/instagramMessagesSlice.ts
```

Supported behavior includes:

- Fetching conversations
- Fetching messages per conversation
- Initial conversation sync
- Refreshing cached messages
- Sending QR codes
- Pausing AI replies
- Resuming AI replies
- Marking conversations as resolved

### Products

Product state and API calls live in:

```text
app/dashboard/lib/slices/productSlice.ts
app/dashboard/lib/services/productService.ts
```

Supported behavior includes:

- List products
- Filter products
- Create products
- Update products
- Delete products
- Bulk delete products
- Fetch active products
- Fetch low-stock products
- Upload product images
- Manage variant images
- Fetch category configuration

### Orders

Order state and API calls live in:

```text
app/dashboard/lib/slices/orderSlice.ts
app/dashboard/lib/services/orderService.ts
```

Supported behavior includes:

- List quick orders
- View order details
- Update order details
- Update order status
- Cancel orders
- Filter orders by buyer and status

### Buyers

Buyer state and API calls live in:

```text
app/dashboard/lib/slices/buyerSlice.ts
app/dashboard/lib/services/buyerService.ts
```

Supported behavior includes:

- Buyer statistics
- Buyer list
- Buyer profile
- Buyer tags
- Buyer notes

### Image Uploads

Product images are uploaded through a presigned URL flow.

The frontend asks the backend for a presigned URL, then uses the local Next.js API route to upload the file:

```text
app/api/upload-image/route.ts
```

This avoids browser CORS issues when uploading directly to S3.

## State Management

The Redux store is configured in:

```text
app/dashboard/lib/store.ts
```

Registered slices:

- `instagramMessages`
- `messengerMessages`
- `customer`
- `products`
- `orders`
- `businessConfig`
- `buyers`

## Environment Variables

Create a `.env.local` file for local development when needed.

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

If this value is not set, the app uses:

```text
https://api.lakhey.tech
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The app will run at:

```text
http://localhost:3000
```

## Build

```bash
npm run build
```

## Start Production Server

```bash
npm run start
```

## Lint

```bash
npm run lint
```

At the time this README was written, linting reports existing errors and warnings. The main categories are:

- Synchronous `setState` calls inside effects flagged by React lint rules
- Explicit `any` types
- Unescaped apostrophes and quotes in JSX
- Unused imports and variables
- Raw `<img>` usage where `next/image` is recommended

## Docker

The project includes a Dockerfile that builds a standalone Next.js app.

```bash
docker build -t instapasa-frontend .
docker run -p 3000:3000 instapasa-frontend
```

## Important Files

- `app/layout.tsx` - root app layout and global providers
- `app/globals.css` - global Tailwind import and shared styling
- `app/(site)/page.tsx` - landing page entry
- `app/(site)/lib/auth.ts` - client authentication hook
- `app/dashboard/layout.tsx` - dashboard shell and sidebar
- `app/dashboard/lib/apiClient.ts` - shared Axios API client
- `app/dashboard/lib/store.ts` - Redux store
- `app/dashboard/message/(components)/sidebarItems.tsx` - dashboard navigation config
- `next.config.ts` - Next.js config, standalone output, image domains, API env fallback
- `Dockerfile` - production container build

## Notes

This repository appears to be the frontend for InstaPasa, an Instagram-first commerce dashboard. The public site is used for marketing and onboarding, while the dashboard is used by sellers to manage Instagram conversations, products, orders, buyers, and business settings.
