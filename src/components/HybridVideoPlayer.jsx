import React, { useState, useEffect } from 'react'
import { AlertTriangle, Play, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import EnhancedVideoPlayer from '@/components/EnhancedVideoPlayer.jsx'
import { getVideoRenderInfo, isEmbedCode, isVideoURL } from '@/lib/videoUtils.js'

/**
 * HybridVideoPlayer Component
 * 
 * Supports both video URLs and iframe embed codes with automatic detection
 * Provides backward compatibility with existing ReactPlayer-based components
 * 
 * Props:
 * - video: Object with video_url and/or embed_code properties
 * - videoUrl: Direct video URL (for backward compatibility)
 * - embedCode: Direct embed code
 * - onError: Error callback function
 * - className: CSS classes
 * - showDebugInfo: Show debug information overlay
 */
function HybridVideoPlayer({ 
  video, 
  videoUrl, 
  embedCode,
  onError, 
  className = "w-full h-auto",
  showDebugInfo = false 
}) {
  const [renderError, setRenderError] = useState(null)
  const [renderInfo, setRenderInfo] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Get video content from props (priority: video object, then direct props)
  const finalVideoUrl = video?.video_url || videoUrl
  const finalEmbedCode = video?.embed_code || embedCode

  useEffect(() => {
    // Determine how to render this video
    const info = getVideoRenderInfo(finalVideoUrl, finalEmbedCode)
    setRenderInfo(info)
    setRenderError(null)
    setIsLoaded(false)

    if (showDebugInfo) {
      console.log('🎥 HybridVideoPlayer render info:', info)
    }

    // Call error callback if no valid content
    if (info.type === 'none' && onError) {
      onError('No valid video URL or embed code provided')
    }
  }, [finalVideoUrl, finalEmbedCode, showDebugInfo, onError])

  const handleIframeLoad = () => {
    setIsLoaded(true)
    setRenderError(null)
  }

  const handleIframeError = () => {
    const error = 'Failed to load embedded video'
    setRenderError(error)
    if (onError) onError(error)
  }

  const handleReactPlayerError = (error) => {
    const errorMsg = `Video playback error: ${error}`
    setRenderError(errorMsg)
    if (onError) onError(errorMsg)
  }

  // If no valid content, show error state
  if (!renderInfo || renderInfo.type === 'none') {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-900 text-white min-h-[200px] rounded-lg`}>
        <div className="text-center p-6">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Video Available</h3>
          <p className="text-sm text-gray-400">
            No valid video URL or embed code provided
          </p>
          {showDebugInfo && (
            <div className="mt-4 text-xs text-left bg-black bg-opacity-50 p-3 rounded">
              <div>video_url: {finalVideoUrl || 'null'}</div>
              <div>embed_code: {finalEmbedCode ? 'present' : 'null'}</div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`${className} relative`}>
      {/* Debug Info Overlay */}
      {showDebugInfo && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-90 text-white text-xs p-3 rounded-lg max-w-xs z-30">
          <div className="font-bold mb-2">🎥 Hybrid Player Debug:</div>
          <div>Type: {renderInfo.type}</div>
          <div>Platform: {renderInfo.platform}</div>
          <div>Loaded: {isLoaded ? 'Yes' : 'No'}</div>
          <div>Error: {renderError ? 'Yes' : 'No'}</div>
          {renderInfo.metadata && (
            <div className="mt-2 pt-2 border-t border-gray-600">
              <div className="text-yellow-300 font-bold">Source:</div>
              <div className="break-all">{renderInfo.src?.substring(0, 40)}...</div>
            </div>
          )}
        </div>
      )}

      {/* Error Overlay */}
      {renderError && (
        <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-20">
          <div className="text-center text-white p-6 max-w-md">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-400" />
            <h3 className="text-lg font-semibold mb-2">Video Error</h3>
            <p className="text-sm mb-4">{renderError}</p>
            {renderInfo.type === 'embed' && renderInfo.src && (
              <Button 
                onClick={() => window.open(renderInfo.src, '_blank')}
                variant="outline"
                size="sm"
                className="text-white border-white hover:bg-white hover:text-black mb-2"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Original
              </Button>
            )}
            <Button 
              onClick={() => {
                setRenderError(null)
                setIsLoaded(false)
              }}
              variant="outline"
              size="sm"
              className="text-white border-white hover:bg-white hover:text-black"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Loading Overlay for Embeds */}
      {renderInfo.type === 'embed' && !isLoaded && !renderError && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
            <p>Loading embedded video...</p>
            <p className="text-xs mt-2 opacity-75">{renderInfo.platform} • {renderInfo.src?.substring(0, 30)}...</p>
          </div>
        </div>
      )}

      {/* Render based on content type */}
      {renderInfo.type === 'embed' && (
        <div 
          className="w-full"
          style={{ minHeight: '200px' }}
          dangerouslySetInnerHTML={{ 
            __html: renderInfo.content 
          }}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      )}

      {renderInfo.type === 'url' && (
        <div className="w-full" style={{ minHeight: '200px' }}>
          <EnhancedVideoPlayer
            videoUrl={renderInfo.content}
            onError={handleReactPlayerError}
            className="w-full h-full"
          />
        </div>
      )}

      {/* Platform Badge */}
      {renderInfo.platform !== 'unknown' && (
        <div className="absolute top-2 right-2 z-20">
          <div className={`text-xs px-2 py-1 rounded-full text-white font-semibold ${getPlatformColor(renderInfo.platform)}`}>
            {renderInfo.platform.toUpperCase()}
            {renderInfo.type === 'embed' && ' EMBED'}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Get platform-specific background color
 */
function getPlatformColor(platform) {
  switch (platform) {
    case 'youtube':
      return 'bg-red-600'
    case 'vimeo':
      return 'bg-blue-600'
    case 'dailymotion':
      return 'bg-orange-600'
    case 'odysee':
      return 'bg-green-600'
    case 'twitch':
      return 'bg-purple-600'
    case 'direct':
      return 'bg-gray-600'
    default:
      return 'bg-black bg-opacity-50'
  }
}

export default HybridVideoPlayer