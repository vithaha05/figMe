import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Missing Cloudinary configuration' },
        { status: 500 }
      )
    }

    // Generate timestamp (in seconds)
    const timestamp = Math.floor(Date.now() / 1000)

    // ✅ Correct string (DO NOT include secret here)
    const stringToSign = `timestamp=${timestamp}`

    // ✅ Use HMAC-SHA256 (secure)
    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(stringToSign)
      .digest('hex')

    return NextResponse.json({
      signature,
      timestamp,
      cloudName,
      apiKey,
    })
  } catch (error) {
    console.error('Upload params error:', error)
    return NextResponse.json(
      { error: 'Failed to generate upload params' },
      { status: 500 }
    )
  }
}