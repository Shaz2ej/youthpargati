import React, { useState } from 'react'
import ImprovedVideoPlayer from '@/components/ImprovedVideoPlayer.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Switch } from '@/components/ui/switch.jsx'
import { Label } from '@/components/ui/label.jsx'

/**
 * Demo page for the ImprovedVideoPlayer component
 * Shows how to properly use the component and test different scenarios
 */
export default function VideoPlayerDemo() {
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0)
  const [showDebugInfo, setShowDebugInfo] = useState(true) // Force debug on
  const [autoplay, setAutoplay] = useState(false)

  // Test videos for demonstration
  const testVideos = [
    {
      id: 1,
      title: "YouTube Video",
      description: "Tests ReactPlayer with YouTube URL",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      type: "YouTube"
    },
    {
      id: 2,
      title: "Direct MP4 File",
      description: "Tests native HTML5 video player with direct file",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      type: "MP4"
    },
    {
      id: 3,
      title: "YouTube Short URL",
      description: "Tests ReactPlayer with YouTube short URL format",
      videoUrl: "https://youtu.be/dQw4w9WgXcQ",
      type: "YouTube Short"
    },
    {
      id: 4,
      title: "Invalid URL",
      description: "Tests error handling with invalid video URL",
      videoUrl: "https://invalid-video-url-that-does-not-exist.mp4",
      type: "Error Test"
    },
    {
      id: 5,
      title: "Vimeo Video",
      description: "Tests ReactPlayer with Vimeo URL",
      videoUrl: "https://vimeo.com/90509568",
      type: "Vimeo"
    }
  ]

  const currentVideo = testVideos[selectedVideoIndex]

  const handleVideoError = (error) => {
    console.error('Video error in demo:', error)
    // In a real app, you might want to show a toast notification or log to analytics
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Improved Video Player Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A ReactPlayer component that fixes the onBuffer warning and provides smart buffering detection using onProgress
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video Player Section */}
          <div className="lg:col-span-3">
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <CardTitle className="text-2xl flex items-center justify-between">
                  <span>{currentVideo.title}</span>
                  <span className="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    {currentVideo.type}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Player Controls */}
                <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="debug-mode" 
                      checked={showDebugInfo}
                      onCheckedChange={setShowDebugInfo}
                    />
                    <Label htmlFor="debug-mode" className="text-sm font-medium">
                      Show Debug Info
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="autoplay" 
                      checked={autoplay}
                      onCheckedChange={setAutoplay}
                    />
                    <Label htmlFor="autoplay" className="text-sm font-medium">
                      Autoplay
                    </Label>
                  </div>
                </div>

                {/* Video Player */}
                <div className="w-full aspect-video bg-black rounded-lg overflow-hidden mb-6">
                  <ImprovedVideoPlayer
                    videoUrl={currentVideo.videoUrl}
                    onError={handleVideoError}
                    className="w-full h-full"
                    autoplay={autoplay}
                    controls={true}
                    showDebugInfo={showDebugInfo}
                  />
                </div>

                {/* Video Description */}
                <div className="space-y-3">
                  <p className="text-gray-700 text-lg">
                    {currentVideo.description}
                  </p>
                  
                  {/* Technical Details */}
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Technical Details:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium">Video URL:</span>
                        <div className="text-xs text-gray-600 break-all mt-1">
                          {currentVideo.videoUrl}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Expected Player:</span>
                        <div className="text-xs text-gray-600 mt-1">
                          {currentVideo.type === 'MP4' ? 'Native HTML5 Video' : 'ReactPlayer'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Video List */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <CardTitle className="text-lg">Test Videos</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {testVideos.map((video, index) => (
                    <Button
                      key={video.id}
                      onClick={() => setSelectedVideoIndex(index)}
                      variant={selectedVideoIndex === index ? "default" : "outline"}
                      className="w-full text-left justify-start h-auto p-3"
                      size="sm"
                    >
                      <div className="text-left">
                        <div className="font-semibold text-sm truncate">
                          {video.title}
                        </div>
                        <div className="text-xs opacity-75 truncate">
                          {video.type}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <CardTitle className="text-lg">✅ Fixed Issues</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="text-sm space-y-3">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✅</span>
                    <span>Removed unsupported onBuffer events</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✅</span>
                    <span>Smart buffering detection with onProgress</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✅</span>
                    <span>Loading spinner during buffering</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✅</span>
                    <span>Graceful error handling with retry</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✅</span>
                    <span>Auto-fallback between players</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✅</span>
                    <span>Modern React hooks</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Console Output */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <CardTitle className="text-lg">📊 Debug Info</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-xs space-y-2">
                  <p className="font-medium">Check browser console for:</p>
                  <ul className="space-y-1 text-gray-600">
                    <li>🎥 Video URL changes</li>
                    <li>✅ Player ready events</li>
                    <li>▶️ Playback events</li>
                    <li>⏳ Buffering detection</li>
                    <li>🚫 Error handling</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Code Example */}
        <Card className="shadow-xl border-0 mt-8">
          <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
            <CardTitle className="text-xl">💻 Usage Example</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <pre className="bg-gray-900 text-green-400 p-6 rounded-lg text-sm overflow-x-auto">
{`// Basic usage
<ImprovedVideoPlayer
  videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  onError={(error) => console.error('Video error:', error)}
  className="w-full h-full"
  autoplay={false}
  controls={true}
  showDebugInfo={false}
/>

// With video object
<ImprovedVideoPlayer
  video={{
    video_url: "https://example.com/video.mp4",
    thumbnail_url: "https://example.com/thumb.jpg"
  }}
  onError={handleVideoError}
  className="w-full aspect-video"
/>`}
            </pre>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Key Benefits:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• No more console warnings about unknown event handlers</li>
                <li>• Intelligent buffering detection using progress tracking</li>
                <li>• Seamless fallback between ReactPlayer and native video</li>
                <li>• Clean error handling with user-friendly retry options</li>
                <li>• Modern React patterns with hooks and proper state management</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}