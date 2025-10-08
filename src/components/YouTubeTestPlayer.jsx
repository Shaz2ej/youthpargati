import React from 'react'
import ReactPlayer from 'react-player'

/**
 * Test component specifically for YouTube video playback verification
 * This component ensures YouTube videos work correctly with ReactPlayer
 */
export default function YouTubeTestPlayer() {
  const testUrls = [
    {
      title: "YouTube Standard URL",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      description: "Standard YouTube watch URL format"
    },
    {
      title: "YouTube Short URL", 
      url: "https://youtu.be/dQw4w9WgXcQ",
      description: "YouTube shortened URL format"
    },
    {
      title: "Direct MP4 File",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      description: "Direct video file for comparison"
    }
  ]

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        YouTube Video Player Test
      </h2>
      
      {testUrls.map((test, index) => (
        <div key={index} className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">{test.title}</h3>
          <p className="text-sm text-gray-600 mb-4">{test.description}</p>
          <p className="text-xs text-gray-500 mb-4 break-all">URL: {test.url}</p>
          
          <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
            {test.url.includes('youtube.com') || test.url.includes('youtu.be') ? (
              <ReactPlayer
                url={test.url}
                width="100%"
                height="100%"
                controls={true}
                config={{
                  youtube: {
                    playerVars: {
                      modestbranding: 1,
                      rel: 0,
                      showinfo: 1
                    }
                  }
                }}
              />
            ) : (
              <video controls className="w-full h-full">
                <source src={test.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
          
          <div className="mt-2 text-xs text-green-600">
            ✅ {test.url.includes('youtube.com') || test.url.includes('youtu.be') ? 
                'Using ReactPlayer for YouTube' : 
                'Using native HTML5 video'}
          </div>
        </div>
      ))}
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Test Results Expected:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>✅ YouTube videos should play using ReactPlayer</li>
          <li>✅ Direct MP4 files should play using native video element</li>
          <li>✅ No console errors should appear</li>
          <li>✅ Video controls should be responsive</li>
        </ul>
      </div>
    </div>
  )
}