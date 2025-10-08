import React, { useState, useEffect } from 'react'

// Dynamic import for ReactPlayer with client-side only loading (equivalent to Next.js dynamic with ssr: false)
const ReactPlayer = React.lazy(() => import('react-player'))

/**
 * Simple VideoPlayer component that supports both YouTube/Vimeo URLs and direct video files
 * @param {string} videoUrl - The video URL (YouTube, Vimeo, or direct file)
 * @param {string} className - Additional CSS classes
 */
export default function VideoPlayer({ videoUrl, className = "video-wrapper" }) {
  const [isLoading, setIsLoading] = useState(true)
  const [playerError, setPlayerError] = useState(null)
  const [playerReady, setPlayerReady] = useState(false)
  
  // Reset states when URL changes
  useEffect(() => {
    if (videoUrl) {
      setIsLoading(true)
      setPlayerError(null)
      setPlayerReady(false)
      console.log('🎥 VideoPlayer URL changed:', videoUrl)
    }
  }, [videoUrl])
  
  // Check if the URL is a direct video file
  const isDirectFile = videoUrl?.endsWith('.mp4') || videoUrl?.endsWith('.webm') || videoUrl?.endsWith('.ogg')

  // Enhanced logging for debugging
  const handlePlayerReady = () => {
    console.log('✅ Simple Player ready for URL:', videoUrl)
    setIsLoading(false)
    setPlayerError(null)
    setPlayerReady(true)
  }

  const handlePlayerError = (error) => {
    console.error('🚨 Simple Player error:', error)
    console.error('Error details:', {
      url: videoUrl,
      errorType: typeof error,
      errorMessage: error?.message || error
    })
    setIsLoading(false)
    setPlayerError('Failed to load video')
  }

  if (!videoUrl) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-900 text-white min-h-[200px] rounded-lg`}>
        <p className="text-lg">No video available</p>
      </div>
    )
  }

  console.log('🎥 Simple VideoPlayer rendering with URL:', videoUrl, 'isDirectFile:', isDirectFile)

  return (
    <div className={className}>
      {isDirectFile ? (
        <video 
          controls 
          width="100%" 
          height="auto"
          className="w-full h-auto rounded-lg"
          preload="metadata"
          crossOrigin="anonymous"
          onLoadStart={() => {
            console.log('📁 Direct video load start:', videoUrl)
            setIsLoading(false)
            setPlayerReady(true)
          }}
          onCanPlay={() => {
            console.log('✅ Direct video can play:', videoUrl)
            setIsLoading(false)
            setPlayerReady(true)
          }}
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/webm" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10 min-h-[200px]">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
                <p>Loading video...</p>
                <p className="text-xs mt-2 opacity-75">URL: {videoUrl?.substring(0, 50)}...</p>
              </div>
            </div>
          )}
          
          {playerError && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-75 z-10 min-h-[200px]">
              <div className="text-white text-center">
                <p>Error: {playerError}</p>
              </div>
            </div>
          )}
          
          <React.Suspense fallback={
            <div className="flex items-center justify-center min-h-[200px] bg-black text-white">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
                <p>Loading player...</p>
              </div>
            </div>
          }>
            <ReactPlayer 
              url={videoUrl} 
              controls 
              width="100%" 
              height="auto"
              onReady={handlePlayerReady}
              onError={handlePlayerError}
              onStart={() => {
                console.log('▶️ Simple Player started:', videoUrl)
                setIsLoading(false)
                setPlayerReady(true)
              }}
              onBuffer={() => {
                console.log('⏳ Simple Player buffering:', videoUrl)
                // Keep loading state as false during buffer - player is functional
              }}
              onBufferEnd={() => {
                console.log('✅ Simple Player buffer end:', videoUrl)
                setIsLoading(false)
                setPlayerReady(true)
              }}
              config={{
                youtube: {
                  playerVars: {
                    modestbranding: 1,
                    rel: 0,
                    autoplay: 0,
                    controls: 1,
                    showinfo: 1,
                    enablejsapi: 1, // Enable JS API for better control
                    origin: window.location.origin // Set origin for security
                  }
                },
                vimeo: {
                  playerOptions: {
                    responsive: true,
                    controls: true
                  }
                }
              }}
            />
          </React.Suspense>
        </div>
      )}
    </div>
  )
}