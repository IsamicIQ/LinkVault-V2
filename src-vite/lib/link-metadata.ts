export interface LinkMetadata {
  title: string
  description: string | null
  thumbnailUrl: string | null
}

export async function fetchLinkMetadata(url: string): Promise<LinkMetadata> {
  try {
    // Try multiple CORS proxies as fallback with timeout
    const proxies = [
      `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
      `https://corsproxy.io/?${encodeURIComponent(url)}`,
    ]
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
    
    let html = ''
    let lastError = null
    
    for (const proxyUrl of proxies) {
      try {
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'text/html',
          },
          signal: controller.signal,
        })
        
        if (!response.ok) continue
        
        const data = await response.json()
        html = data.contents || data || ''
        
        if (html) {
          clearTimeout(timeoutId)
          break
        }
      } catch (err) {
        lastError = err
        if (err instanceof Error && err.name === 'AbortError') {
          break // Timeout occurred
        }
        continue
      }
    }
    
    clearTimeout(timeoutId)
    
    // If all proxies fail, return defaults
    if (!html) {
      console.warn('Could not fetch metadata, using defaults')
      return {
        title: 'Untitled',
        description: null,
        thumbnailUrl: null,
      }
    }
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled'
    
    // Extract description from meta tags
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
    const description = descMatch ? descMatch[1].trim() : null
    
    // Extract thumbnail from og:image or other meta tags
    const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)
    let thumbnailUrl = imageMatch ? imageMatch[1].trim() : null
    
    // Resolve relative URLs
    if (thumbnailUrl && !thumbnailUrl.startsWith('http')) {
      try {
        thumbnailUrl = new URL(thumbnailUrl, url).href
      } catch {
        thumbnailUrl = null
      }
    }
    
    return {
      title,
      description,
      thumbnailUrl,
    }
  } catch (error) {
    console.error('Error fetching metadata:', error)
    return {
      title: 'Untitled',
      description: null,
      thumbnailUrl: null,
    }
  }
}

