/**
 * Client-side image compression utilities
 * Reduces file size while maintaining reasonable quality for progress photos
 */

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'webp'
}

export const DEFAULT_COMPRESSION_OPTIONS: CompressionOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.8, // 80% quality
  format: 'jpeg'
}

/**
 * Compresses an image file using HTML5 Canvas
 * @param file - The original image file
 * @param options - Compression options
 * @returns Promise<Blob> - The compressed image as a Blob
 */
export async function compressImage(
  file: File, 
  options: CompressionOptions = DEFAULT_COMPRESSION_OPTIONS
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }

    img.onload = () => {
      try {
        const { maxWidth = 1200, maxHeight = 1200, quality = 0.8, format = 'jpeg' } = options

        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img
        
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height
          
          if (width > height) {
            width = Math.min(width, maxWidth)
            height = width / aspectRatio
          } else {
            height = Math.min(height, maxHeight)
            width = height * aspectRatio
          }
        }

        // Set canvas dimensions
        canvas.width = width
        canvas.height = height

        // Draw and compress the image
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          `image/${format}`,
          quality
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    // Load the image
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Gets the compression ratio achieved
 * @param originalSize - Original file size in bytes
 * @param compressedSize - Compressed file size in bytes
 * @returns Object with compression info
 */
export function getCompressionInfo(originalSize: number, compressedSize: number) {
  const ratio = ((originalSize - compressedSize) / originalSize) * 100
  const reduction = originalSize - compressedSize
  
  return {
    originalSize,
    compressedSize,
    reduction,
    ratio: Math.round(ratio * 10) / 10, // Round to 1 decimal place
    originalSizeMB: Math.round((originalSize / (1024 * 1024)) * 100) / 100,
    compressedSizeMB: Math.round((compressedSize / (1024 * 1024)) * 100) / 100
  }
}

/**
 * Formats file size in human readable format
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Checks if a file should be compressed based on size and type
 * @param file - The file to check
 * @param threshold - Size threshold in bytes (default: 500KB)
 * @returns boolean
 */
export function shouldCompressImage(file: File, threshold: number = 500 * 1024): boolean {
  // Only compress images
  if (!file.type.startsWith('image/')) return false
  
  // Don't compress if already small
  if (file.size <= threshold) return false
  
  // Don't compress GIFs (would lose animation)
  if (file.type === 'image/gif') return false
  
  return true
}