import React, { useState } from 'react'
import ImprovedVideoPlayer from '@/components/ImprovedVideoPlayer.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'

/**
 * Example page demonstrating the ImprovedVideoPlayer component
 * Shows how to properly handle video loading, buffering, and errors
 */
export default function VideoPlayerExample() {
  const [selectedVideo, setSelectedVideo] = useState(0)

  // Sample videos for testing
  const sampleVideos = [
    {
      id: 1,
      title: "YouTube Video Example",
      description: "Standard YouTube video to test ReactPlayer functionality",
      video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnail_url: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg"
    },
    {
      id: 2,
      title: "Direct MP4 Video",
      description: "Direct video file to test native HTML5 video player",
      video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      thumbnail_url: null
    },
    {
      id: 3,
      title: "YouTube Short URL",
      description: "YouTube shortened URL format",
      video_url: "https://youtu.be/dQw4w9WgXcQ",
      thumbnail_url: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg"
    },
    {
      id: 4,
      title: "Invalid Video URL",
      description: "Test error handling with invalid URL",
      video_url: "https://invalid-url-that-does-not-exist.mp4",
      thumbnail_url: null
    }
  ]

  const currentVideo = sampleVideos[selectedVideo]

  const handleVideoError = (error) => {
    console.error('Video error in parent component:', error)
    // You can add additional error handling here
    // For example, logging to analytics, showing notifications, etc.
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Improved Video Player Demo
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-blue-600">
                  {currentVideo.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Video Player with proper configuration */}
                <div className="w-full aspect-video bg-black rounded-lg overflow-hidden mb-4">
                  <ImprovedVideoPlayer
                    video={currentVideo}
                    onError={handleVideoError}
                    className="w-full h-full"
                    autoplay={false}
                    controls={true}
                  />
                </div>
                
                <p className="text-gray-600">
                  {currentVideo.description}
                </p>
                
                {/* Debug Information */}
                <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
                  <strong>Debug Info:</strong><br/>
                  Video URL: {currentVideo.video_url}<br/>
                  Player Type: {
                    currentVideo.video_url.includes('youtube.com') || currentVideo.video_url.includes('youtu.be') 
                      ? 'ReactPlayer (YouTube)' 
                      : currentVideo.video_url.match(/\.(mp4|webm|ogg)$/i) 
                        ? 'Native HTML5 Video' 
                        : 'ReactPlayer (Unknown/Stream)'
                  }
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Video List */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-orange-600">
                  Sample Videos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sampleVideos.map((video, index) => (
                  <Button
                    key={video.id}
                    onClick={() => setSelectedVideo(index)}
                    variant={selectedVideo === index ? "default" : "outline"}
                    className="w-full text-left justify-start h-auto p-3"
                  >
                    <div>
                      <div className="font-semibold text-sm">
                        {video.title}
                      </div>
                      <div className="text-xs opacity-75 mt-1">
                        {video.description}
                      </div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Features List */}
            <Card className="shadow-lg mt-6">
              <CardHeader>
                <CardTitle className="text-lg text-green-600">
                  ✅ Fixed Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  <li>✅ No more "onBuffer" warnings</li>
                  <li>✅ Smart buffering detection</li>
                  <li>✅ Loading spinner during buffering</li>
                  <li>✅ Proper error handling</li>
                  <li>✅ Auto-fallback between players</li>
                  <li>✅ YouTube & direct video support</li>
                  <li>✅ Modern React with hooks</li>
                  <li>✅ Client-side only ReactPlayer</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Implementation Code Example */}
        <Card className="shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="text-lg text-purple-600">
              💻 Usage Example
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-800 text-green-400 p-4 rounded text-xs overflow-x-auto">
{`// Simple usage
<ImprovedVideoPlayer
  videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  onError={(error) => console.error('Video error:', error)}
  className="w-full h-full"
  autoplay={false}
  controls={true}
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}