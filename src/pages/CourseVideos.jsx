import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { ArrowLeft, Play, Clock, BookOpen } from 'lucide-react'
import EmbedVideoPlayer from '@/components/EmbedVideoPlayer.jsx'

function CourseVideos() {
  const { id } = useParams()
  const [videos, setVideos] = useState([])
  const [courseInfo, setCourseInfo] = useState(null)
  const [currentVideo, setCurrentVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [videoError, setVideoError] = useState(null)

  useEffect(() => {
    const fetchCourseAndVideos = async () => {
      try {
        setLoading(true)
        setError(null)

        // Use fallback data since Supabase has been removed
        const courseData = {
          id: id,
          title: 'Course Videos',
          description: 'Learn with our comprehensive video lessons'
        };

        setCourseInfo(courseData);

        // Fallback sample videos
        const videosData = [
          {
            id: 'sample-video-1',
            title: 'YouTube Embed Example',
            description: 'Sample YouTube video using iframe embed code.',
            video_embed: '<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>'
          },
          {
            id: 'sample-video-2',
            title: 'Vimeo Embed Example',
            description: 'Sample Vimeo video using iframe embed code.',
            video_embed: '<iframe src="https://player.vimeo.com/video/90509568" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>'
          },
          {
            id: 'sample-video-3',
            title: 'Odysee Embed Example',
            description: 'Sample Odysee video using iframe embed code.',
            video_embed: '<iframe id="lbry-iframe" src="https://odysee.com/$/embed/@samtime:1/programming-on-windows-is-torture:5" allowfullscreen width="560" height="315"></iframe>'
          }
        ];

        setVideos(videosData);
        
        // Set the first video as current if available
        if (videosData && videosData.length > 0) {
          setCurrentVideo(videosData[0]);
        }

      } catch (err) {
        console.error('Error:', err);
        setError(`Error loading videos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourseAndVideos();
    }
  }, [id]);

  const handleVideoSelect = (video) => {
    setCurrentVideo(video)
    setVideoError(null) // Reset video error when switching videos
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-600">Loading course videos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md border-2 border-red-300">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Course</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button asChild className="w-full">
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-orange-500 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Button 
            variant="outline" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 mb-4"
            asChild
          >
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-black mb-2">
              {courseInfo?.title || 'Course Videos'}
            </h1>
            <p className="text-lg text-blue-100">
              {courseInfo?.description || 'Learn with our comprehensive video lessons'}
            </p>
            {courseInfo?.duration && (
              <div className="flex items-center justify-center mt-2 text-yellow-300">
                <Clock className="h-4 w-4 mr-1" />
                Total Duration: {courseInfo.duration}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Player Section */}
          <div className="lg:col-span-2">
            {currentVideo ? (
              <Card className="bg-white shadow-xl border-2 border-blue-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-blue-100 text-blue-600 font-bold">NOW PLAYING</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Debug info commented out for production */}
                  {/*
                  <div className="bg-gray-100 p-3 rounded text-xs text-gray-600 mb-4">
                    <strong>Debug Info:</strong><br/>
                    Video Embed: {currentVideo.video_embed ? 'PRESENT (iframe)' : 'NULL'}<br/>
                    Video ID: {currentVideo.id}<br/>
                    Content Type: {currentVideo.video_embed ? 'Embed Code (iframe)' : 'No Content'}<br/>
                    Platform: {currentVideo.video_embed ? 
                      (currentVideo.video_embed.includes('youtube.com') ? 'YouTube' :
                       currentVideo.video_embed.includes('vimeo.com') ? 'Vimeo' :
                       currentVideo.video_embed.includes('odysee.com') ? 'Odysee' :
                       currentVideo.video_embed.includes('dailymotion.com') ? 'Dailymotion' : 'Other')
                      : 'Unknown'}
                  </div>
                  */}
                  
                  {/* Video Player */}
                  <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative">
                    <EmbedVideoPlayer 
                      embedCode={currentVideo.video_embed}
                      className="w-full h-full"
                    />
                  </div>

                  {/* Video Details */}
                  <div>
                    <h2 className="text-2xl font-black text-blue-600 mb-2">
                      {currentVideo.title}
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      {currentVideo.description || 'No description available for this video.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white shadow-xl border-2 border-gray-200">
                <CardContent className="py-12">
                  <div className="text-center">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Videos Available</h3>
                    <p className="text-gray-500">This course doesn't have any videos yet.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Video List Section */}
          <div className="lg:col-span-1">
            <Card className="bg-white shadow-xl border-2 border-orange-200">
              <CardHeader>
                <CardTitle className="text-xl font-black text-orange-600">
                  Course Videos ({videos.length})
                </CardTitle>
                <CardDescription>
                  Click on any video to play
                </CardDescription>
              </CardHeader>
              <CardContent>
                {videos.length === 0 ? (
                  <div className="text-center py-8">
                    <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No videos in this course</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {videos.map((video, index) => (
                      <div
                        key={video.id}
                        onClick={() => handleVideoSelect(video)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          currentVideo?.id === video.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {video.thumbnail_url ? (
                            <img
                              src={video.thumbnail_url}
                              alt={video.title}
                              className="w-16 h-12 object-cover rounded flex-shrink-0"
                              onError={(e) => {
                                e.target.style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="w-16 h-12 bg-gradient-to-br from-blue-100 to-orange-100 rounded flex items-center justify-center flex-shrink-0">
                              <Play className="h-4 w-4 text-blue-400" />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-xs font-bold text-gray-500">
                                {String(index + 1).padStart(2, '0')}
                              </span>
                              {currentVideo?.id === video.id && (
                                <Play className="h-3 w-3 text-blue-500" />
                              )}
                            </div>
                            <h4 className="font-semibold text-sm text-gray-800 truncate">
                              {video.title}
                            </h4>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseVideos