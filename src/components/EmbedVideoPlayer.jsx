import React from 'react'

/**
 * Simple EmbedVideoPlayer Component
 * 
 * Renders HTML embed codes directly using dangerouslySetInnerHTML
 * No validation, no ReactPlayer - just pure embed code rendering
 * 
 * Props:
 * - embedCode: HTML embed code string to render
 * - className: CSS classes
 */
export default function EmbedVideoPlayer({ embedCode, className = "w-full h-auto" }) {
  if (!embedCode) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-900 text-white min-h-[200px] rounded-lg`}>
        <div className="text-center p-6">
          <h3 className="text-lg font-semibold mb-2">No Video Available</h3>
          <p className="text-sm text-gray-400">No embed code provided for this video</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div
        className="embed-container w-full"
        style={{ minHeight: '200px' }}
        dangerouslySetInnerHTML={{ __html: embedCode }}
      />
    </div>
  )
}