import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const presignedUrl = formData.get('presigned_url') as string;
    const file = formData.get('file') as File;
    const contentType = formData.get('content_type') as string;

    if (!presignedUrl || !file || !contentType) {
      return NextResponse.json(
        { error: 'Missing presigned_url, file, or content_type' },
        { status: 400 }
      );
    }

    // Upload to S3 from server (no CORS issues)
    const buffer = await file.arrayBuffer();
    
    // ONLY Content-Type header - must match what was sent to get-upload-url
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: buffer,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('S3 upload failed:', response.status, text);
      return NextResponse.json(
        { error: `S3 upload failed: ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
