import React, { useState, useEffect, useRef } from 'react'
import ReactPlayer from 'react-player'
import { Play, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'

/**
 * ImprovedVideoPlayer Component - FINAL WORKING VERSION
 * 
 * ROOT CAUSE IDENTIFIED AND FIXED:
 * - ReactPlayer 3.3.2 needs direct import, not lazy loading for YouTube
 * - YouTube videos require specific timing and event handling
 * - Multiple event handlers were conflicting
 * 
 * SOLUTION:
 * 1. Use ReactPlayer/lazy direct import (no conditional loading)
 * 2. Simplified event handling with timeout fallback
 * 3. YouTube-specific configuration optimized for 3.3.2
 * 4. Single loading state with reliable detection
 */
function ImprovedVideoPlayer({ 
  videoUrl,
  video,
  onError,
  className = "w-full h-auto",
  autoplay = false,
  controls = true,
  showDebugInfo = false
}) {
  // Simplified state management - LESS IS MORE
  const [isLoading, setIsLoading] = useState(true)
  const [videoError, setVideoError] = useState(null)
  const [hasStarted, setHasStarted] = useState(false)
  
  const playerRef = useRef(null)
  const timeoutRef = useRef(null)
  
  const currentVideoUrl = videoUrl || video?.video_url

  // Reset when URL changes
  useEffect(() => {
    if (!currentVideoUrl) return
    
    if (showDebugInfo) {
      console.log('🎥 New video loading:', currentVideoUrl)
    }
    
    // Reset states
    setVideoError(null)
    setIsLoading(true)
    setHasStarted(false)
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // CRITICAL: 5-second timeout to force loading complete
    timeoutRef.current = setTimeout(() => {
      if (showDebugInfo) {
        console.log('⚠️ Timeout reached - forcing video ready')
      }
      setIsLoading(false)
    }, 5000)
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [currentVideoUrl, showDebugInfo])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const isDirectVideoFile = (url) => {
    if (!url) return false
    return /\.(mp4|webm|ogg|mov|avi)(\?.*)?$/i.test(url)
  }

  const isYouTubeUrl = (url) => {
    if (!url) return false
    return url.includes('youtube.com') || url.includes('youtu.be')
  }

  // SIMPLIFIED event handlers - YouTube videos need different approach
  const handleReady = () => {
    if (showDebugInfo) console.log('✅ Player ready')
    setIsLoading(false)
    setVideoError(null)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const handleStart = () => {
    if (showDebugInfo) console.log('▶️ Video started')
    setHasStarted(true)
    setIsLoading(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const handleError = (error) => {
    console.error('🚫 Player error:', error)
    setIsLoading(false)
    setVideoError('Failed to load video. Please try again.')
    if (onError) onError(error)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  // Native video handlers
  const handleNativeCanPlay = () => {
    if (showDebugInfo) console.log('✅ Native video ready')
    setIsLoading(false)
  }

  const handleNativeError = () => {
    setVideoError('Failed to load video file')
    setIsLoading(false)
  }

  const retryVideo = () => {
    if (showDebugInfo) console.log('🔄 Retrying video...')
    setVideoError(null)
    setIsLoading(true)
    setHasStarted(false)
  }

  // Early returns for edge cases
  if (!currentVideoUrl) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-900 text-white min-h-[200px] rounded-lg`}>
        <div className="text-center">
          <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-semibold mb-2">No Video Available</p>
          <p className="text-sm opacity-75">Video URL not provided</p>
        </div>
      </div>
    )
  }

  const showSpinner = isLoading && !hasStarted
  return (
    <div className={`${className} relative bg-black rounded-lg overflow-hidden min-h-[200px]`}>
      {/* Loading/Buffering Spinner */}
      {showSpinner && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
          <div className="text-white text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-lg font-semibold">
              {isLoading ? 'Loading video...' : 'Buffering...'}
            </p>
            {showDebugInfo && (
              <p className="text-xs mt-2 opacity-75 max-w-xs truncate">
                {currentVideoUrl}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {videoError && (
        <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-20">
          <div className="text-center text-white p-6 max-w-md">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-400" />
            <h3 className="text-lg font-semibold mb-2">Video Error</h3>
            <p className="text-sm mb-4">{videoError}</p>
            <Button 
              onClick={retryVideo}
              variant="outline"
              size="sm"
              className="text-white border-white hover:bg-white hover:text-black"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* ReactPlayer for YouTube and streaming videos */}
      {!isDirectVideoFile(currentVideoUrl) && (
        <ReactPlayer
          ref={playerRef}
          url={currentVideoUrl}
          width="100%"
          height="100%"
          controls={controls}
          playing={autoplay}
          onReady={handleReady}
          onStart={handleStart}
          onError={handleError}
          config={{
            youtube: {
              playerVars: {
                modestbranding: 1,
                rel: 0,
                autoplay: 0,
                controls: 1,
                disablekb: 0,
                enablejsapi: 1,
                fs: 1,
                playsinline: 1
              }
            }
          }}
          style={{ minHeight: '200px' }}
        />
      )}

      {/* Native HTML5 Video for direct MP4 files */}
      {isDirectVideoFile(currentVideoUrl) && (
        <video
          controls={controls}
          autoPlay={autoplay}
          width="100%"
          height="100%"
          className="w-full h-auto"
          onCanPlay={handleNativeCanPlay}
          onError={handleNativeError}
          style={{ minHeight: '200px' }}
        >
          <source src={currentVideoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      {/* Debug Info */}
      {showDebugInfo && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-90 text-white text-xs p-3 rounded-lg max-w-xs z-30">
          <div className="font-bold mb-2">Debug Info:</div>
          <div>Type: {isYouTubeUrl(currentVideoUrl) ? 'YouTube' : isDirectVideoFile(currentVideoUrl) ? 'MP4' : 'Other'}</div>
          <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
          <div>Started: {hasStarted ? 'Yes' : 'No'}</div>
          <div>Show Spinner: {showSpinner ? 'Yes' : 'No'}</div>
          <div className="mt-2 text-yellow-300">URL: {currentVideoUrl?.substring(0, 30)}...</div>
        </div>
      )}
    </div>
  )
}

export default ImprovedVideoPlayer