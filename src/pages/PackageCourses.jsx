import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { BookOpen, ArrowLeft, Play, Video } from 'lucide-react'
import { handlePackagePayment } from '@/lib/payment.js'
import { useAuth } from '@/context/AuthContext.jsx'
import { fetchPackageById, fetchPackageCoursesWithVideos, checkUserPurchase } from '@/lib/utils.js'

function PackageCourses() {
  const { id } = useParams()
  console.log('PackageCourses component loaded with package ID:', id);
  const navigate = useNavigate()
  const { user, isLoadingAuth } = useAuth()
  const [coursesWithVideos, setCoursesWithVideos] = useState([])
  const [packageInfo, setPackageInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [hasPurchased, setHasPurchased] = useState(false)
  const [checkingPurchase, setCheckingPurchase] = useState(true)

  const handleBuyNow = async () => {
    console.log('PackageCourses: handleBuyNow called');
    console.log('PackageCourses: Current user state', user);
    console.log('PackageCourses: Current auth context', { user, isLoadingAuth, loading });
    
    // More robust check - wait for auth state to be fully loaded
    if (isLoadingAuth || loading) {
      console.warn('Purchase attempt blocked: Auth state still loading');
      alert('Please wait, still loading user session...');
      return;
    }
    
    // Robust check at the very beginning of the handler
    if (!user) {
      console.warn('Purchase attempt blocked: No user object');
      console.log('PackageCourses: User check failed. User:', user);
      alert('Please log in to purchase courses.')
      return
    }
    
    // Fix: Use user.uid instead of user.id for Firebase user objects
    if (!user.uid) {
      console.warn('Purchase attempt blocked: User ID not available');
      console.log('PackageCourses: User ID check failed. User:', user);
      alert('Please log in to purchase courses.')
      return
    }
    
    console.log('PackageCourses: User authenticated', user.uid);
    
    // Small delay to ensure auth state is fully loaded
    await new Promise(resolve => setTimeout(resolve, 100));
    
    setProcessing(true)
    
    try {
      console.log('PackageCourses: Processing payment for user', user.uid);
      
      // Create mock student data since we're not using Supabase
      const studentData = {
        name: user.user_metadata?.name || 'Student',
        phone: user.user_metadata?.phone || ''
      };
      
      // Store package info in session storage before payment
      sessionStorage.setItem('checkoutPackage', JSON.stringify(packageInfo));
      
      // Process payment without referral code
      await handlePackagePayment(packageInfo, {
        uid: user.uid,  // Fix: Use user.uid instead of user.id
        name: studentData.name,
        phone: studentData.phone
      })
    } catch (error) {
      console.error('Payment error:', error)
      alert('Failed to process payment. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  // Check if user has purchased this package
  useEffect(() => {
    const checkPurchaseStatus = async () => {
      console.log('Checking purchase status for package:', id, 'user:', user?.uid);
      if (user && user.uid && id) {
        try {
          const purchased = await checkUserPurchase(id, user.uid);
          console.log('Purchase check result for package', id, ':', purchased);
          setHasPurchased(purchased);
          
          // Store purchase status in localStorage for persistence
          localStorage.setItem(`purchase_${id}_${user.uid}`, purchased.toString());
        } catch (err) {
          console.error('Error checking purchase status for package', id, ':', err);
        } finally {
          setCheckingPurchase(false);
        }
      } else {
        console.log('Skipping purchase check - missing user or package ID', { user: !!user, userId: user?.uid, packageId: id });
        setCheckingPurchase(false);
      }
    };

    checkPurchaseStatus();
    
    // Listen for localStorage changes to update UI after payment
    const handleStorageChange = (e) => {
      console.log('Storage change event for key:', e.key, 'package:', id);
      if (e.key === 'lastPurchase' && id) {
        // Add safeguard check before calling checkUserPurchase
        if (!user || !user.uid) {
          console.warn("User not loaded yet, waiting...");
          return;
        }
        console.log('Re-checking purchase status after storage change for package:', id, 'user:', user.uid);
        // Re-check purchase status when localStorage is updated
        checkUserPurchase(id, user.uid).then(purchased => {
          console.log('Updated purchase status for package', id, ':', purchased);
          setHasPurchased(purchased);
          // Update localStorage with new status
          localStorage.setItem(`purchase_${id}_${user.uid}`, purchased.toString());
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user, id]);

  useEffect(() => {
    const fetchPackageAndCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch package from Firestore instead of using fallback data
        const packageData = await fetchPackageById(id);
        console.log('Fetched package data:', packageData); // Debug log to see what fields are present
        if (!packageData) {
          throw new Error('Package not found');
        }
        setPackageInfo(packageData);

        // Fetch courses with videos for this package from Firestore
        const coursesData = await fetchPackageCoursesWithVideos(packageData);
        console.log('Fetched courses with videos data:', coursesData); // Debug log
        setCoursesWithVideos(coursesData);

      } catch (err) {
        console.error('Error:', err);
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPackageAndCourses();
    }
  }, [id]);

  if (loading || checkingPurchase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-600">Loading courses...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md border-2 border-red-300">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Courses</CardTitle>
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
      <div className="bg-gradient-to-r from-blue-600 to-orange-500 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              asChild
            >
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            
            {/* Show referral dashboard link for logged-in users */}
            {user && (
              <Button 
                onClick={() => navigate('/referral-dashboard')}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                My Referrals
              </Button>
            )}
          </div>
          
          <div className="text-center">
            {packageInfo?.name && (
              <div className="text-lg font-semibold text-blue-200 mb-2">{packageInfo.name}</div>
            )}
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              {packageInfo?.title || 'Package Courses'}
            </h1>
            <p className="text-xl text-blue-100 mb-2">
              {packageInfo?.description || 'Explore the courses in this package'}
            </p>
            
            <div className="mt-6">
              {hasPurchased ? (
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6"
                  onClick={() => {
                    // Navigate to the first course in the package if available
                    if (coursesWithVideos.length > 0) {
                      navigate(`/courses/${coursesWithVideos[0].id}/videos`);
                    } else {
                      // Fallback to dashboard if no courses found
                      navigate('/dashboard');
                    }
                  }}
                >
                  View Course
                </Button>
              ) : (
                <Button
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6"
                  onClick={handleBuyNow}
                  disabled={isLoadingAuth || !user || processing}
                >
                  {processing ? 'Processing...' : 'Buy This Package Now'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-blue-600 mb-4">
            Available Courses
          </h2>
          <p className="text-lg text-gray-600">
            Choose a course to start learning
          </p>
        </div>

        {coursesWithVideos.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Courses Available</h3>
            <p className="text-gray-500">This package doesn't have any courses yet.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {coursesWithVideos.map((course) => (
              <div key={course.id} className="space-y-6">
                {/* Course Card */}
                <Card className="bg-white shadow-xl border-2 border-blue-200 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-blue-100 text-blue-600 font-bold">COURSE</Badge>
                      <Play className="h-6 w-6 text-blue-600" />
                    </div>
                    
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover rounded-xl mb-3" />
                    ) : course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-40 object-cover rounded-lg mb-4"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-orange-100 rounded-lg mb-4 flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-blue-400" />
                      </div>
                    )}
                    
                    <CardTitle className="text-xl font-black text-gray-800">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 line-clamp-3">
                      {course.description || 'Learn new skills with this comprehensive course.'}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    {course.duration && (
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Play className="h-4 w-4 mr-1" />
                        Duration: {course.duration}
                      </div>
                    )}
                    
                    {hasPurchased ? (
                      <Button
                        className="w-full bg-green-600 text-white hover:bg-green-700 font-bold py-3"
                        onClick={() => navigate(`/courses/${course.id}/videos`)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Learning
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-blue-600 text-white hover:bg-blue-700 font-bold py-3"
                        disabled
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Buy Package to Access
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Videos Section for this Course */}
                {course.videos && course.videos.length > 0 && (
                  <div className="ml-4 pl-4 border-l-2 border-blue-200">
                    <h3 className="text-2xl font-bold text-blue-600 mb-4 flex items-center">
                      <Video className="h-6 w-6 mr-2" />
                      Videos in this Course ({course.videos.length})
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {course.videos.map((video) => (
                        <Card key={video.id} className="bg-white border border-gray-200">
                          <CardContent className="p-4">
                            <h4 className="font-semibold text-gray-800 mb-2">{video.title}</h4>
                            <p className="text-sm text-gray-600 mb-3">{video.description || 'No description available'}</p>
                            {hasPurchased ? (
                              <Button
                                size="sm"
                                className="w-full bg-blue-100 text-blue-700 hover:bg-blue-200"
                                onClick={() => navigate(`/courses/${course.id}/videos`)}
                              >
                                Watch Video
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                className="w-full bg-gray-100 text-gray-500"
                                disabled
                              >
                                Locked
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PackageCourses