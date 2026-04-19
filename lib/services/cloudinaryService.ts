import crypto from 'crypto'

export interface SignedUploadParams {
  signature: string
  timestamp: number
  cloudName: string
  apiKey: string
}

// PATTERN: Facade — encapsulates signature generation for Cloudinary signed uploads.
// Routes call this service instead of embedding crypto and env logic directly.
export function getCloudinaryUploadSignature(): SignedUploadParams {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Missing Cloudinary configuration')
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const stringToSign = `timestamp=${timestamp}`
  const signature = crypto.createHmac('sha256', apiSecret).update(stringToSign).digest('hex')

  return {
    signature,
    timestamp,
    cloudName,
    apiKey,
  }
}
