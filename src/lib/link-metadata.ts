export interface LinkMetadata {
  title: string
  description: string | null
  thumbnailUrl: string | null
}

export async function fetchLinkMetadata(url: string): Promise<LinkMetadata> {
  try {
    // Use API route to avoid CORS issues with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
    
    const response = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`, {
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    
    const data = await response.json()
    return data
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Metadata fetch timeout, using defaults')
    } else {
      console.error('Error fetching metadata:', error)
    }
    return {
      title: 'Untitled',
      description: null,
      thumbnailUrl: null,
    }
  }
}

