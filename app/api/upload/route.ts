import { NextRequest, NextResponse } from 'next/server'
import { getCloudinaryUploadSignature } from '@/lib/services/cloudinaryService'

export async function GET(request: NextRequest) {
  try {
    const params = getCloudinaryUploadSignature()
    return NextResponse.json(params)
  } catch (error) {
    console.error('Upload params error:', error)
    return NextResponse.json(
      { error: 'Failed to generate upload params' },
      { status: 500 }
    )
  }
}