import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
  }

  try {
    // Add timeout to prevent hanging on slow sites
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    const html = await response.text()
    
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
    
    return NextResponse.json({
      title,
      description,
      thumbnailUrl,
    })
  } catch (error) {
    console.error('Error fetching metadata:', error)
    return NextResponse.json({
      title: 'Untitled',
      description: null,
      thumbnailUrl: null,
    })
  }
}

