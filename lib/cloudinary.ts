// PATTERN: Facade — hides the complexity of signed Cloudinary uploads behind
// a single uploadToCloudinary(file) function. The caller doesn't need to know
// about signature generation, API keys, or CDN endpoints.
// CLOUD PATTERN: CDN Offloading.
// Images are served from Cloudinary's global CDN, not from our server.
// Auto-format, auto-quality, and edge caching reduce bandwidth and latency.
// The server never stores or serves binary image data.

export async function getSignedUploadParams() {
  const response = await fetch('/api/upload', {
    method: 'GET',
  })

  if (!response.ok) {
    throw new Error('Failed to get signed upload params')
  }

  return response.json()
}

export async function uploadToCloudinary(file: File): Promise<string> {
  try {
    // Step 1: Get signed upload parameters from our backend
    const { signature, timestamp, cloudName, apiKey } = await getSignedUploadParams()

    // Step 2: Create form data for direct upload to Cloudinary
    const formData = new FormData()
    formData.append('file', file)
    formData.append('api_key', apiKey)
    formData.append('timestamp', timestamp)
    formData.append('signature', signature)
    formData.append('eager', 'w_400,h_300,c_pad|w_260,h_180,c_crop')
    formData.append('folder', 'figma-clone/canvas-images')

    // Step 3: POST directly to Cloudinary CDN
    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload image to Cloudinary')
    }

    const uploadedData = await uploadResponse.json()

    // Step 4: Return the secure CDN URL
    return uploadedData.secure_url
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw error
  }
}
