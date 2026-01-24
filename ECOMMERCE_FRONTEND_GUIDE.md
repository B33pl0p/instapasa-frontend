# Business Config / Onboarding - Frontend Guide

## Overview
Simple business configuration for storing contact info and payment QR codes.

---

## API Endpoints

### Base URL
```
/api/v2/dashboard/business-config
```

---

## 1. Create Business Config

**POST** `/api/v2/dashboard/business-config`

### Request Body
```json
{
  "business_description": "We sell handmade jewelry and custom accessories",
  "support_email": "support@store.com",
  "support_phone": "+1234567890",
  "payment_qr_codes": [
    "https://s3.../business-configs/customer123/payment-qr-20260124_103045-gpay.png",
    "https://s3.../business-configs/customer123/payment-qr-20260124_103046-paytm.png"
  ]
}
```

### Response (201)
```json
{
  "id": "config_id_123",
  "customer_id": "customer_id_123",
  "business_description": "We sell handmade jewelry...",
  "support_email": "support@store.com",
  "support_phone": "+1234567890",
  "payment_qr_codes": ["url1", "url2"],
  "created_at": "2026-01-24T10:30:00Z",
  "updated_at": "2026-01-24T10:30:00Z"
}
```

### Notes
- All fields are **optional**
- If config already exists, returns existing config (400 error)

---

## 2. Get Business Config

**GET** `/api/v2/dashboard/business-config`

### Response (200)
```json
{
  "id": "config_id_123",
  "customer_id": "customer_id_123",
  "business_description": "We sell handmade jewelry...",
  "support_email": "support@store.com",
  "support_phone": "+1234567890",
  "payment_qr_codes": ["url1", "url2"],
  "created_at": "2026-01-24T10:30:00Z",
  "updated_at": "2026-01-24T10:30:00Z"
}
```

### Response (404)
```json
{
  "detail": "Business config not found"
}
```

---

## 3. Update Business Config

**PUT** `/api/v2/dashboard/business-config`

### Request Body
```json
{
  "business_description": "Updated description",
  "support_email": "new@email.com",
  "payment_qr_codes": ["new_url1", "new_url2", "new_url3"]
}
```

### Notes
- Send only fields you want to update
- To **add** QR codes: fetch existing, append new URLs, send full array
- To **remove** QR codes: send array without removed URLs

---

## 4. Delete Business Config

**DELETE** `/api/v2/dashboard/business-config`

### Response (204)
No content - successful deletion

---

## 5. Upload Payment QR Codes

**POST** `/api/v2/dashboard/business-config/upload-payment-qr`

### Request Body
```json
{
  "file_name": "gpay-qr.png",
  "content_type": "image/png"
}
```

### Response (200)
```json
{
  "upload_url": "https://s3.presigned.url.for.upload...",
  "file_url": "https://s3.../business-configs/customer123/payment-qr-20260124_103045-gpay.png",
  "expires_in": 3600
}
```

### Upload Flow
1. Call `/upload-payment-qr` → Get `upload_url` and `file_url`
2. Upload file to S3: `PUT upload_url` with file binary + headers:
   ```javascript
   await fetch(upload_url, {
     method: 'PUT',
     body: file,
     headers: {
       'Content-Type': file.type,
       'x-amz-acl': 'public-read'  // Required for Instagram to access images
     }
   });
   ```
3. Use `file_url` in `payment_qr_codes` array

---

## React Implementation Example

### Onboarding Form Component

```jsx
function BusinessOnboarding() {
  const [formData, setFormData] = useState({
    business_description: '',
    support_email: '',
    support_phone: '',
    payment_qr_codes: []
  });
  const [qrFiles, setQrFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Upload QR codes to S3
  const uploadQRCodes = async (files) => {
    const uploadedUrls = [];
    
    for (const file of files) {
      // Get presigned URL
      const { upload_url, file_url } = await fetch(
        '/api/v2/dashboard/business-config/upload-payment-qr',
        {
          method: 'POST',
          body: JSON.stringify({
            file_name: file.name,
            content_type: file.type
          })
        }
      ).then(r => r.json());
      
      // Upload to S3
      await fetch(upload_url, {
        method: 'PUT',
        body: file,
        headers: { 
          'Content-Type': file.type,
          'x-amz-acl': 'public-read'  // Make publicly accessible
        }
      });
      
      uploadedUrls.push(file_url);
    }
    
    return uploadedUrls;
  };

  // Submit form
  const handleSubmit = async () => {
    setUploading(true);
    
    // Upload QR codes first
    const qrUrls = await uploadQRCodes(qrFiles);
    
    // Create config with QR URLs
    await fetch('/api/v2/dashboard/business-config', {
      method: 'POST',
      body: JSON.stringify({
        ...formData,
        payment_qr_codes: qrUrls
      })
    });
    
    setUploading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea 
        placeholder="What does your business do?"
        value={formData.business_description}
        onChange={e => setFormData({...formData, business_description: e.target.value})}
      />
      
      <input 
        type="email"
        placeholder="Support Email"
        value={formData.support_email}
        onChange={e => setFormData({...formData, support_email: e.target.value})}
      />
      
      <input 
        type="tel"
        placeholder="Support Phone"
        value={formData.support_phone}
        onChange={e => setFormData({...formData, support_phone: e.target.value})}
      />
      
      <input 
        type="file"
        accept="image/*"
        multiple
        onChange={e => setQrFiles(Array.from(e.target.files))}
      />
      
      <button type="submit" disabled={uploading}>
        {uploading ? 'Uploading...' : 'Save Configuration'}
      </button>
    </form>
  );
}
```

---

### Edit Configuration Component

```jsx
function EditBusinessConfig() {
  const [config, setConfig] = useState(null);
  const [formData, setFormData] = useState({});

  // Fetch existing config
  useEffect(() => {
    fetch('/api/v2/dashboard/business-config')
      .then(r => r.json())
      .then(data => {
        setConfig(data);
        setFormData({
          business_description: data.business_description,
          support_email: data.support_email,
          support_phone: data.support_phone,
          payment_qr_codes: data.payment_qr_codes
        });
      })
      .catch(() => {
        // No config exists - show onboarding
      });
  }, []);

  // Add new QR code
  const addQRCode = async (file) => {
    const { upload_url, file_url } = await fetch(
      '/api/v2/dashboard/business-config/upload-payment-qr',
      {
        method: 'POST',
        body: JSON.stringify({
          file_name: file.name,
          content_type: file.type
        })
      }
    ).then(r => r.json());
    
    await fetch(upload_url, {
      method: 'PUT',
      body: file,
      headers: { 
        'Content-Type': file.type,
        'x-amz-acl': 'public-read'
      }
    });
    
    // Add to existing QR codes
    setFormData({
      ...formData,
      payment_qr_codes: [...formData.payment_qr_codes, file_url]
    });
  };

  // Remove QR code
  const removeQRCode = (urlToRemove) => {
    setFormData({
      ...formData,
      payment_qr_codes: formData.payment_qr_codes.filter(url => url !== urlToRemove)
    });
  };

  // Update config
  const handleUpdate = async () => {
    await fetch('/api/v2/dashboard/business-config', {
      method: 'PUT',
      body: JSON.stringify(formData)
    });
  };

  return (
    <form onSubmit={handleUpdate}>
      {/* Form fields same as onboarding */}
      
      {/* QR Codes display */}
      <div className="qr-codes">
        {formData.payment_qr_codes?.map(url => (
          <div key={url}>
            <img src={url} alt="Payment QR" />
            <button onClick={() => removeQRCode(url)}>Remove</button>
          </div>
        ))}
        <input 
          type="file"
          accept="image/*"
          onChange={e => addQRCode(e.target.files[0])}
        />
      </div>
      
      <button type="submit">Update Configuration</button>
    </form>
  );
}
```

---

## Important Notes

### QR Code Storage
- **Location**: `business-configs/{customer_id}/payment-qr-{timestamp}-{filename}`
- **Lifecycle**: Permanent (no auto-delete)
- **Format**: Images only (PNG, JPG recommended)

### Error Handling
- **409**: Config already exists (use PUT to update)
- **404**: Config not found (need to create first)
- **500**: Server error (S3 upload failed, etc.)

### Best Practices
1. **Show loading states** during QR upload (can take 2-5 seconds)
2. **Validate files** before upload (max size, image only)
3. **Handle upload failures** gracefully (retry option)
4. **Preview QR codes** before submission
5. **Check if config exists** on mount (GET endpoint)
6. If config exists → Show edit mode
7. If not → Show onboarding mode

---

## Fields Reference

| Field | Type | Required | Max Length | Notes |
|-------|------|----------|------------|-------|
| `business_description` | string | No | 1000 chars | What your business does |
| `support_email` | string | No | - | Contact email |
| `support_phone` | string | No | - | Contact phone |
| `payment_qr_codes` | array[string] | No | - | S3 URLs of QR images |

All fields are optional - save what you have!

---

## Troubleshooting

### Images not showing in Instagram/Messenger
**Problem**: Sent image appears blank or doesn't load

**Solution**: Make sure you include `'x-amz-acl': 'public-read'` header when uploading to S3:
```javascript
await fetch(upload_url, {
  method: 'PUT',
  body: file,
  headers: {
    'Content-Type': file.type,
    'x-amz-acl': 'public-read'  // ✅ Required!
  }
});
```

Without this header, Instagram can't access the image (403 Forbidden).

### Supported Image Formats
- ✅ PNG (image/png)
- ✅ JPEG (image/jpeg)
- ✅ GIF (image/gif)
- ❌ WebP (not supported by Instagram API)
- ❌ SVG (not supported by Instagram API)

### File Size Limits
- **Recommended**: < 8 MB
- **Maximum**: 25 MB (Instagram API limit)
