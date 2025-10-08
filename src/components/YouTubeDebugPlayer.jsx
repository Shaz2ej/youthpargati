import React, { useState, useEffect } from 'react'

// Dynamic import for ReactPlayer to ensure client-side only loading
const ReactPlayer = React.lazy(() => import('react-player'))

/**
 * Debug component specifically for YouTube video playback testing
 * This helps identify issues with ReactPlayer and YouTube URLs
 */
export default function YouTubeDebugPlayer({ videoUrl }) {
  const [isLoading, setIsLoading] = useState(true)
  const [playerError, setPlayerError] = useState(null)
  const [playerReady, setPlayerReady] = useState(false)
  const [debugInfo, setDebugInfo] = useState([])

  const addDebugLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setDebugInfo(prev => [...prev, { timestamp, message, type }])
    console.log(`[${timestamp}] ${message}`)
  }

  useEffect(() => {
    setIsLoading(true)
    setPlayerError(null)
    setPlayerReady(false)
    setDebugInfo([])
    addDebugLog(`🎥 Loading URL: ${videoUrl}`)
  }, [videoUrl])

  const handlePlayerReady = () => {
    addDebugLog('✅ ReactPlayer ready', 'success')
    setIsLoading(false) // Immediately hide loading overlay
    setPlayerReady(true)
    setPlayerError(null)
  }

  const handlePlayerError = (error) => {
    addDebugLog(`🚨 ReactPlayer error: ${error?.message || error}`, 'error')
    setIsLoading(false)
    setPlayerError(error?.message || 'Unknown error')
  }

  const handlePlayerStart = () => {
    addDebugLog('▶️ Video started playing', 'success')
    setIsLoading(false) // Ensure loading is false when playback starts
  }

  const handlePlayerBuffer = () => {
    addDebugLog('🔄 Video buffering...', 'warning')
  }

  const handlePlayerBufferEnd = () => {
    addDebugLog('✅ Buffer ended, ready to play', 'success')
    setIsLoading(false) // Ensure loading is false after buffering
  }

  const handlePlayerProgress = (progress) => {
    if (progress.playedSeconds > 0) {
      addDebugLog(`⏱️ Playing: ${progress.playedSeconds.toFixed(1)}s`, 'info')
    }
  }

  if (!videoUrl) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <h3 className="font-semibold text-gray-800 mb-2">YouTube Debug Player</h3>
        <p className="text-gray-600">No video URL provided</p>
      </div>
    )
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
      <div>
        <h3 className="font-semibold text-gray-800 mb-2">YouTube Debug Player</h3>
        <p className="text-xs text-gray-600 break-all">URL: {videoUrl}</p>
        <div className="flex items-center gap-4 mt-2 text-sm">
          <span className={`px-2 py-1 rounded text-xs ${
            isLoading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
          }`}>
            {isLoading ? 'Loading...' : 'Ready'}
          </span>
          {playerReady && (
            <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
              Player Ready
            </span>
          )}
          {playerError && (
            <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">
              Error: {playerError}
            </span>
          )}
        </div>
      </div>

      {/* Video Player */}
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
              <p>Loading video...</p>
            </div>
          </div>
        )}

        <React.Suspense fallback={
          <div className="flex items-center justify-center h-full bg-black text-white">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
              <p>Loading ReactPlayer...</p>
            </div>
          </div>
        }>
          <ReactPlayer
            url={videoUrl}
            width="100%"
            height="100%"
            controls={true}
            playing={false}
            onReady={handlePlayerReady}
            onError={handlePlayerError}
            onStart={handlePlayerStart}
            onBuffer={handlePlayerBuffer}
            onBufferEnd={handlePlayerBufferEnd}
            onProgress={handlePlayerProgress}
            progressInterval={5000} // Log progress every 5 seconds
            config={{
              youtube: {
                playerVars: {
                  showinfo: 1,
                  modestbranding: 1,
                  rel: 0,
                  autoplay: 0,
                  fs: 1, // Allow fullscreen
                  cc_load_policy: 0, // Hide captions by default
                  iv_load_policy: 3, // Hide annotations
                  origin: window.location.origin // Set origin for security
                }
              }
            }}
          />
        </React.Suspense>
      </div>

      {/* Debug Log */}
      <div className="bg-white border rounded p-3">
        <h4 className="font-medium text-sm mb-2">Debug Log:</h4>
        <div className="max-h-32 overflow-y-auto text-xs space-y-1">
          {debugInfo.length === 0 ? (
            <p className="text-gray-500">No debug info yet...</p>
          ) : (
            debugInfo.map((log, index) => (
              <div key={index} className={`flex gap-2 ${
                log.type === 'error' ? 'text-red-600' :
                log.type === 'warning' ? 'text-yellow-600' :
                log.type === 'success' ? 'text-green-600' : 'text-gray-600'
              }`}>
                <span className="font-mono">{log.timestamp}</span>
                <span>{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Test URLs */}
      <div className="bg-blue-50 border border-blue-200 rounded p-3">
        <h4 className="font-medium text-sm mb-2 text-blue-800">Quick Test URLs:</h4>
        <div className="space-y-1 text-xs">
          <button 
            onClick={() => window.location.href = `?video=https://www.youtube.com/watch?v=dQw4w9WgXcQ`}
            className="block text-blue-600 hover:underline"
          >
            Test: Standard YouTube URL
          </button>
          <button 
            onClick={() => window.location.href = `?video=https://youtu.be/dQw4w9WgXcQ`}
            className="block text-blue-600 hover:underline"
          >
            Test: YouTube Short URL
          </button>
        </div>
      </div>
    </div>
  )
}