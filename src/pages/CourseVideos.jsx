import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { ArrowLeft, Play, Clock, BookOpen, Lock } from 'lucide-react'
import { useAuth } from '@/context/AuthContext.jsx'
import { fetchCoursesByPackageId, checkUserPurchase, fetchPackageById, fetchUserPurchases } from '@/lib/utils.js'
// Add Firestore imports
import { db } from '@/lib/firebase.js'
import { collection, getDocs } from 'firebase/firestore'

function CourseVideos() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isLoadingAuth } = useAuth()
  const [videos, setVideos] = useState([])
  const [courseInfo, setCourseInfo] = useState(null)
  const [currentVideo, setCurrentVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [videoError, setVideoError] = useState(null)
  const [hasAccess, setHasAccess] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)

  // Check if user has access to this course
  useEffect(() => {
    const checkCourseAccess = async () => {
      console.log('Checking course access for course:', id, 'user:', user?.uid);
      if (!user || !user.uid || !id) {
        console.log('Skipping access check - missing user or course ID', { user: !!user, userId: user?.uid, courseId: id });
        setCheckingAccess(false);
        return;
      }

      try {
        // First, fetch user's purchases to get actual package IDs
        console.log('Fetching user purchases for access check');
        const userPurchases = await fetchUserPurchases(user.uid);
        console.log('User purchases:', userPurchases);
        
        // Extract package IDs from purchases
        const purchasedPackageIds = userPurchases
          .map(purchase => purchase.package_id)
          .filter(Boolean); // Remove any falsy values
        
        console.log('Purchased package IDs:', purchasedPackageIds);
        
        if (purchasedPackageIds.length === 0) {
          console.log('User has no purchased packages');
          setHasAccess(false);
          setCheckingAccess(false);
          return;
        }

        let hasAccessToCourse = false;
        let foundPackage = null;

        // Check each purchased package to see if this course belongs to it
        for (const packageId of purchasedPackageIds) {
          try {
            console.log('Checking purchased package:', packageId, 'for course:', id);
            
            // Fetch the actual package details
            const packageDetails = await fetchPackageById(packageId);
            if (!packageDetails) {
              console.warn('Package details not found for package ID:', packageId);
              continue;
            }
            
            console.log('Package details:', packageDetails);
            
            // Check if this course is in this package
            const courseIdsInPackage = packageDetails.courses || [];
            console.log('Course IDs in package:', courseIdsInPackage);
            
            if (courseIdsInPackage.includes(id)) {
              console.log('Found course', id, 'in purchased package', packageId);
              foundPackage = packageDetails;
              hasAccessToCourse = true;
              console.log('User has access to course', id, 'through purchased package', packageId);
              break;
            }
          } catch (err) {
            console.warn(`Error checking purchased package ${packageId}:`, err);
          }
        }

        setHasAccess(hasAccessToCourse);
        console.log('Final access status for course', id, ':', hasAccessToCourse);
        
        // If no access, we'll show the access denied screen (no automatic redirect)
        if (!hasAccessToCourse && foundPackage) {
          // Store in localStorage for potential use
          console.log("Storing noAccess data for course:", id, "package:", foundPackage.id);
          localStorage.setItem(`noAccess_${id}`, JSON.stringify({
            courseId: id,
            packageId: foundPackage.id,
            timestamp: Date.now()
          }));
        }
      } catch (err) {
        console.error('Error checking course access:', err);
      } finally {
        setCheckingAccess(false);
      }
    };

    // Only check access if user is authenticated
    if (!isLoadingAuth) {
      console.log('Initiating course access check');
      checkCourseAccess();
    }
  }, [user, id, isLoadingAuth]);

  useEffect(() => {
    const fetchCourseAndVideos = async () => {
      try {
        console.log('Fetching course and videos for course:', id, 'access status:', hasAccess);
        setLoading(true)
        setError(null)

        // Use fallback data since Supabase has been removed
        const courseData = {
          id: id,
          title: 'Course Videos',
          description: 'Learn with our comprehensive video lessons'
        };

        setCourseInfo(courseData);

        // Fetch videos from chapters subcollection instead of course_videos collection
        console.log(`Fetching Chapters for course: ${id}`);
        // WARNING: Database may use lowercase 'chapters' - verify with actual database structure
        const chaptersRef = collection(db, "courses", id, "Chapters");
        
        // Add the required logging for the fetching path
        console.log("Fetching path:", `courses/${id}/Chapters`);
        
        const chaptersSnapshot = await getDocs(chaptersRef);
        
        if (chaptersSnapshot.empty) {
          console.log(`No Chapters found for course: ${id}`);
          setVideos([]);
        } else {
          const chaptersData = chaptersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Updated to match exact requirement: Log with courseId and chaptersData
          console.log("Fetched Chapters for", id, chaptersData);
          setVideos(chaptersData);
          
          // Set the first video as current if available
          if (chaptersData && chaptersData.length > 0) {
            setCurrentVideo(chaptersData[0]);
          }
        }

      } catch (err) {
        console.error('Error:', err);
        // Add the required error logging with courseId
        console.error("Error fetching videos for course:", id, err);
        setError(`Error loading videos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch course data if user has access or if we're not checking access
    if (!checkingAccess && (hasAccess || !user)) {
      console.log('Initiating course and videos fetch', { checkingAccess, hasAccess, user: !!user });
      if (id) {
        fetchCourseAndVideos();
      }
    }
  }, [id, checkingAccess, hasAccess, user]);

  const handleVideoSelect = (video) => {
    setCurrentVideo(video)
    setVideoError(null) // Reset video error when switching videos
  }

  // Show access denied screen if user doesn't have access
  if (!checkingAccess && !hasAccess && user) {
    // Retrieve and validate packageId from localStorage
    const noAccessData = localStorage.getItem(`noAccess_${id}`);
    let packageId = '';
    
    if (noAccessData) {
      try {
        const parsedData = JSON.parse(noAccessData);
        console.log("Retrieved noAccess data:", parsedData);
        packageId = parsedData.packageId || '';
        if (!packageId) {
          console.warn("packageId not found in noAccess data for course:", id);
        }
      } catch (parseError) {
        console.error("Error parsing noAccess data for course:", id, parseError);
      }
    } else {
      console.warn("No noAccess data found for course:", id);
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md border-2 border-red-300">
          <CardHeader>
            <div className="mx-auto bg-red-100 rounded-full p-3 mb-4">
              <Lock className="h-12 w-12 text-red-600" />
            </div>
            <CardTitle className="text-red-600 text-center">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4 text-center">
              You need to purchase a package to access this course content.
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  console.log("Navigating to package:", packageId);
                  navigate(`/packages/${packageId}/courses`);
                }}
                disabled={!packageId}
              >
                Go to Package
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (checkingAccess || isLoadingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-600">Checking access...</p>
        </div>
      </div>
    )
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
                  {/* Video Player */}
                  <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative">
                    <div 
                      dangerouslySetInnerHTML={{ __html: currentVideo.video_embed }}
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
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No lessons found for this course yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {videos.map((video) => (
                      <div
                        key={video.id}
                        className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                          currentVideo?.id === video.id
                            ? 'bg-orange-100 border-2 border-orange-300'
                            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                        }`}
                        onClick={() => handleVideoSelect(video)}
                      >
                        <div className="flex items-start space-x-3">
                          {video.thumbnail ? (
                            <img 
                              src={video.thumbnail} 
                              alt={video.title} 
                              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                            />
                          ) : video.thumbnail_url ? (
                            <img
                              src={video.thumbnail_url}
                              alt={video.title}
                              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                              onError={(e) => {
                                e.target.style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Play className="h-6 w-6 text-blue-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 line-clamp-2">
                              {video.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                              {video.description}
                            </p>
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