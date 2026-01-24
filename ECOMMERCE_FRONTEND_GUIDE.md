# Sending Attachments via Chat

## Quick Flow

**1. Get Upload URL** → **2. Upload File** → **3. Send Message**

---

## Single Attachment

```javascript
// 1. Get presigned URL
const { presigned_url, image_url } = await fetch(
  '/api/v2/dashboard/upload-attachment?filename=image.png&content_type=image/png',
  { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
).then(r => r.json());

// 2. Upload file to S3
await fetch(presigned_url, {
  method: 'PUT',
  body: imageFile,
  headers: { 'Content-Type': 'image/png' }
});

// 3. Send message with attachment
await fetch('/api/v2/customer/dashboard/reply', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({
    conversation_id: "...",
    message: "Here's the image",
    recipient_user_id: "1606353541281402",
    platform: "instagram",
    attachment_url: image_url,      // ← Use this
    attachment_type: "image"        // "image", "video", "audio", "file"
  })
});
```

---

## Multiple Attachments

⚠️ **Meta Limitation:** One attachment per message. Send multiple messages.

```javascript
const files = [file1, file2, file3];

for (const file of files) {
  // 1. Upload
  const { presigned_url, image_url } = await uploadToS3(file);
  
  // 2. Send separate message for each
  await sendMessage({
    message: "",  // Empty text, just attachment
    attachment_url: image_url,
    attachment_type: "image"
  });
}
```

---

## Attachment Types

- `"image"` - PNG, JPG, GIF
- `"video"` - MP4, MOV
- `"audio"` - MP3, WAV
- `"file"` - PDF, documents

---

## Storage

**Inbox attachments auto-delete after 10 days** (S3 lifecycle policy).

For permanent storage (QR codes, logos), use:
```javascript
POST /api/v2/business-config/upload-url
```
