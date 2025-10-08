import React, { useState } from 'react'
import ImprovedVideoPlayer from '@/components/ImprovedVideoPlayer.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Switch } from '@/components/ui/switch.jsx'
import { Label } from '@/components/ui/label.jsx'

/**
 * VideoPlayerTestDemo - Test page for the ImprovedVideoPlayer component
 * 
 * This demo page tests:
 * 1. YouTube videos (should use ReactPlayer)
 * 2. Direct MP4 files (should use native HTML5 video)
 * 3. Debug mode to show component states
 * 4. Error handling with invalid URLs
 */
export default function VideoPlayerTestDemo() {
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0)
  const [showDebugInfo, setShowDebugInfo] = useState(true)
  const [autoplay, setAutoplay] = useState(false)

  // Test videos covering different scenarios
  const testVideos = [
    {
      id: 1,
      title: "YouTube Video Test",
      description: "Tests ReactPlayer with YouTube URL - should load without stuck spinner",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      type: "YouTube",
      expectedPlayer: "ReactPlayer"
    },
    {
      id: 2,
      title: "Direct MP4 File Test",
      description: "Tests native HTML5 video with direct MP4 file",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      type: "MP4",
      expectedPlayer: "Native HTML5"
    },
    {
      id: 3,
      title: "YouTube Short URL Test",
      description: "Tests ReactPlayer with YouTube short URL format",
      videoUrl: "https://youtu.be/dQw4w9WgXcQ",
      type: "YouTube Short",
      expectedPlayer: "ReactPlayer"
    },
    {
      id: 4,
      title: "Error Handling Test", 
      description: "Tests error handling with invalid video URL",
      videoUrl: "https://invalid-video-url-for-testing.mp4",
      type: "Invalid URL",
      expectedPlayer: "Should Error"
    }
  ]

  const currentVideo = testVideos[selectedVideoIndex]

  const handleVideoError = (error) => {
    console.error('Video error in demo:', error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎥 ImprovedVideoPlayer Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Testing the fixed ReactPlayer component that resolves "Loading video..." issues
          </p>
          <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg inline-block">
            <p className="text-green-800 font-semibold">
              ✅ Fixed: No more stuck loading spinners • ✅ No console warnings • ✅ YouTube videos play correctly
            </p>
          </div>
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
                <div className="space-y-4">
                  <p className="text-gray-700 text-lg">
                    {currentVideo.description}
                  </p>
                  
                  {/* Technical Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Video Details:</h4>
                      <div className="text-sm space-y-1">
                        <div><span className="font-medium">URL:</span> <span className="text-xs text-gray-600 break-all">{currentVideo.videoUrl}</span></div>
                        <div><span className="font-medium">Type:</span> {currentVideo.type}</div>
                        <div><span className="font-medium">Expected Player:</span> {currentVideo.expectedPlayer}</div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">What to Watch For:</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Loading spinner should disappear when ready</li>
                        <li>• YouTube videos should start playing</li>
                        <li>• No console warnings about onBuffer</li>
                        <li>• Debug panel shows state transitions</li>
                      </ul>
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

            {/* Fixes Applied */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <CardTitle className="text-lg">✅ Fixes Applied</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="text-sm space-y-3">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✅</span>
                    <span>Single source of truth for loading state</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✅</span>
                    <span>Removed unsupported onBuffer events</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✅</span>
                    <span>Fixed YouTube player configuration</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✅</span>
                    <span>Proper client-side rendering</span>
                  </li>
                </ul>
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
            <div className="bg-gray-900 text-green-400 p-6 rounded-lg text-sm overflow-x-auto">
              <pre>{`// Basic usage
import ImprovedVideoPlayer from '@/components/ImprovedVideoPlayer.jsx'

// YouTube video
<ImprovedVideoPlayer
  videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  onError={(error) => console.error('Video error:', error)}
  className="w-full h-full"
  autoplay={false}
  controls={true}
  showDebugInfo={false}
/>

// Direct MP4 file
<ImprovedVideoPlayer
  videoUrl="https://example.com/video.mp4"
  className="w-full aspect-video"
/>`}</pre>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Key Features:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Works immediately in any React project</li>
                <li>• No more "Loading video..." stuck states</li>
                <li>• Supports both YouTube URLs and direct MP4 files</li>
                <li>• No console warnings about unsupported events</li>
                <li>• Optional debug mode for development</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}