import React, { useState, useEffect, Suspense } from 'react'
import { Play, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import ImprovedVideoPlayer from '@/components/ImprovedVideoPlayer.jsx'

// NOTE: This component now uses ImprovedVideoPlayer internally
// to fix the onBuffer warning and provide better buffering detection

// Dynamic import for ReactPlayer with client-side only loading (equivalent to Next.js dynamic with ssr: false)
const ReactPlayer = React.lazy(() => import('react-player'))

function EnhancedVideoPlayer({ 
  video, 
  videoUrl, // Support both video object and direct videoUrl prop
  onError, 
  className = "w-full h-auto" 
}) {
  // Simply use the ImprovedVideoPlayer with backward compatibility
  return (
    <ImprovedVideoPlayer
      video={video}
      videoUrl={videoUrl}
      onError={onError}
      className={className}
      autoplay={false}
      controls={true}
      showDebugInfo={false}
    />
  )
}

export default EnhancedVideoPlayer