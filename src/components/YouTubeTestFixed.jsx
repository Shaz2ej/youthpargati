import React, { useState } from 'react'
import EnhancedVideoPlayer from './EnhancedVideoPlayer.jsx'
import VideoPlayer from './VideoPlayer.jsx'

const testVideos = [
  {
    id: 'test-youtube-1',
    title: 'React Tutorial - YouTube Short Video',
    video_url: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM',
    description: 'Quick React tutorial for testing'
  },
  {
    id: 'test-youtube-2', 
    title: 'JavaScript Basics - YouTube',
    video_url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg',
    description: 'JavaScript fundamentals'
  },
  {
    id: 'test-vimeo',
    title: 'Sample Vimeo Video',
    video_url: 'https://vimeo.com/148751763',
    description: 'Vimeo video test'
  },
  {
    id: 'test-direct',
    title: 'Sample MP4 Video',
    video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    description: 'Direct MP4 file test'
  }
]

export default function YouTubeTestFixed() {
  const [selectedVideo, setSelectedVideo] = useState(testVideos[0])
  const [useEnhanced, setUseEnhanced] = useState(true)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔧 YouTube Video Player Fix Test</h1>
      
      {/* Player Type Toggle */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Player Type</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setUseEnhanced(true)}
            className={`px-4 py-2 rounded ${useEnhanced ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
          >
            EnhancedVideoPlayer
          </button>
          <button
            onClick={() => setUseEnhanced(false)}
            className={`px-4 py-2 rounded ${!useEnhanced ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
          >
            SimpleVideoPlayer
          </button>
        </div>
      </div>

      {/* Video Selection */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Test Videos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testVideos.map((video) => (
            <div 
              key={video.id}
              onClick={() => setSelectedVideo(video)}
              className={`p-3 rounded cursor-pointer transition-all ${
                selectedVideo.id === video.id 
                  ? 'bg-blue-100 border-2 border-blue-500' 
                  : 'bg-white border-2 border-gray-200 hover:border-gray-400'
              }`}
            >
              <h3 className="font-medium">{video.title}</h3>
              <p className="text-sm text-gray-600">{video.description}</p>
              <p className="text-xs text-gray-500 break-all">{video.video_url}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Debug Info */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">🐛 Debug Information</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Selected Video:</strong> {selectedVideo.title}</p>
          <p><strong>URL:</strong> <code className="bg-yellow-100 px-1 rounded">{selectedVideo.video_url}</code></p>
          <p><strong>Player Type:</strong> {useEnhanced ? 'EnhancedVideoPlayer' : 'SimpleVideoPlayer'}</p>
          <p><strong>Expected Behavior:</strong> ReactPlayer should load, show "Loading video..." briefly, then hide overlay when onReady fires</p>
        </div>
      </div>

      {/* Video Player */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">🎥 Video Player</h2>
        <div className="bg-black rounded-lg overflow-hidden">
          {useEnhanced ? (
            <EnhancedVideoPlayer 
              video={selectedVideo}
              className="w-full"
            />
          ) : (
            <VideoPlayer 
              videoUrl={selectedVideo.video_url}
              className="w-full"
            />
          )}
        </div>
      </div>

      {/* Console Instructions */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">📋 Testing Instructions</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Open browser DevTools (F12) and go to Console tab</li>
          <li>Select different videos from the list above</li>
          <li>Watch for console logs starting with 🎥, ✅, ⏳, ▶️</li>
          <li>Verify "Loading video..." overlay disappears when video is ready</li>
          <li>Test both Enhanced and Simple players</li>
          <li>For YouTube videos, check if player actually starts playback</li>
        </ol>
      </div>
    </div>
  )
}