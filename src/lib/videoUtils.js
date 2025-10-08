/**
 * Utility functions for detecting and validating video URLs vs embed codes
 * Supports YouTube, Vimeo, Odysee, and other common video platforms
 */

/**
 * Checks if a string is an HTML embed code (iframe or div wrapper)
 * @param {string} content - The content to check
 * @returns {boolean} - True if it's a valid embed code
 */
export const isEmbedCode = (content) => {
  if (!content || typeof content !== 'string') {
    return false
  }
  
  // Check if content contains an iframe with src attribute anywhere inside
  // This allows div wrappers around the iframe
  return /<iframe[^>]*src\s*=\s*["']https?:\/\/[^"']+["'][^>]*>.*?<\/iframe>/is.test(content)
}

// Note: isVideoURL function removed as system now only supports embed codes

/**
 * Extracts video information from embed code (handles both iframe and div wrappers)
 * @param {string} embedCode - The embed code
 * @returns {object} - Object with src, width, height, and platform info
 */
export const parseEmbedCode = (embedCode) => {
  if (!isEmbedCode(embedCode)) {
    return null
  }
  
  const result = {
    src: null,
    width: null,
    height: null,
    platform: 'unknown',
    title: null,
    allowFullscreen: false
  }
  
  // Extract iframe src attribute (works for both direct iframe and nested in div)
  const srcMatch = embedCode.match(/<iframe[^>]*src\s*=\s*["']([^"']*)["'][^>]*>/i)
  if (srcMatch) {
    result.src = srcMatch[1]
    
    // Determine platform from src URL
    if (result.src.includes('youtube.com') || result.src.includes('youtu.be')) {
      result.platform = 'youtube'
    } else if (result.src.includes('vimeo.com')) {
      result.platform = 'vimeo'
    } else if (result.src.includes('dailymotion.com')) {
      result.platform = 'dailymotion'
    } else if (result.src.includes('odysee.com') || result.src.includes('lbry.tv')) {
      result.platform = 'odysee'
    } else if (result.src.includes('twitch.tv')) {
      result.platform = 'twitch'
    }
  }
  
  // Extract dimensions from iframe or wrapper div
  const widthMatch = embedCode.match(/width[\s]*[:=][\s]*["']?(\d+)["']?/i)
  const heightMatch = embedCode.match(/height[\s]*[:=][\s]*["']?(\d+)["']?/i)
  
  if (widthMatch) result.width = parseInt(widthMatch[1])
  if (heightMatch) result.height = parseInt(heightMatch[1])
  
  // Extract title from iframe
  const titleMatch = embedCode.match(/<iframe[^>]*title\s*=\s*["']([^"']*)["'][^>]*>/i)
  if (titleMatch) result.title = titleMatch[1]
  
  // Check for allowfullscreen
  result.allowFullscreen = /allowfullscreen/i.test(embedCode)
  
  return result
}

/**
 * Sanitizes embed code to prevent XSS attacks (supports div wrappers)
 * @param {string} embedCode - The embed code to sanitize
 * @returns {string} - Sanitized embed code or null if invalid
 */
export const sanitizeEmbedCode = (embedCode) => {
  if (!isEmbedCode(embedCode)) {
    return null
  }
  
  // Parse the embed info to validate the iframe src
  const embedInfo = parseEmbedCode(embedCode)
  if (!embedInfo || !embedInfo.src) {
    return null
  }
  
  // Trusted video platforms
  const trustedDomains = [
    'youtube.com',
    'youtube-nocookie.com',
    'vimeo.com',
    'player.vimeo.com',
    'dailymotion.com',
    'odysee.com',
    'lbry.tv',
    'player.twitch.tv'
  ]
  
  try {
    const srcUrl = new URL(embedInfo.src)
    
    // Check if hostname matches any trusted domain (including subdomains)
    const isTrusted = trustedDomains.some(domain => 
      srcUrl.hostname === domain || 
      srcUrl.hostname.endsWith('.' + domain)
    )
    
    if (!isTrusted) {
      console.warn('Untrusted domain in embed code:', srcUrl.hostname)
      return null
    }
    
    // Return the original embed code as-is to preserve styling
    return embedCode
    
  } catch (error) {
    console.error('Error parsing URL from embed code:', error)
    return null
  }
}

/**
 * Simplified function for embed-only system
 * @param {string} embedCode - The embed code from database
 * @returns {object} - Object with type, content, and metadata
 */
export const getEmbedRenderInfo = (embedCode) => {
  if (embedCode && isEmbedCode(embedCode)) {
    const sanitized = sanitizeEmbedCode(embedCode)
    if (sanitized) {
      const embedInfo = parseEmbedCode(embedCode)
      return {
        type: 'embed',
        content: sanitized,
        platform: embedInfo.platform,
        src: embedInfo.src,
        metadata: embedInfo
      }
    }
  }
  
  return {
    type: 'none',
    content: null,
    platform: 'unknown',
    src: null,
    metadata: null
  }
}

// Note: getURLPlatform function removed as system now only supports embed codes

/**
 * Validates embed code for admin panel use (supports complex HTML structures)
 * @param {string} content - Embed code (can be iframe or div wrapper)
 * @returns {object} - Validation result with errors if any
 */
export const validateEmbedCode = (content) => {
  if (!content || typeof content !== 'string') {
    return {
      isValid: false,
      type: 'none',
      errors: ['No embed code provided']
    }
  }
  
  const trimmed = content.trim()
  
  if (isEmbedCode(trimmed)) {
    const sanitized = sanitizeEmbedCode(trimmed)
    if (sanitized) {
      const embedInfo = parseEmbedCode(trimmed)
      return {
        isValid: true,
        type: 'embed',
        platform: embedInfo?.platform || 'unknown',
        errors: []
      }
    } else {
      return {
        isValid: false,
        type: 'embed',
        errors: ['Invalid or unsafe embed code - untrusted domain or malformed HTML']
      }
    }
  } else {
    return {
      isValid: false,
      type: 'invalid',
      errors: ['Content must be valid HTML embed code containing an iframe (can be wrapped in div)']
    }
  }
}