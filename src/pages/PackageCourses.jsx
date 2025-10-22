import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { BookOpen, ArrowLeft, Play } from 'lucide-react'
import { getCoursesByPackageId } from '@/lib/api.js'
import { handlePackagePayment } from '@/lib/payment.js'
import { useAuth } from '@/context/AuthContext.jsx'
import { ensureStudentRecord } from '@/lib/api.js'

function PackageCourses() {
  const { id } = useParams()
  const { user, isLoadingAuth } = useAuth()
  const [courses, setCourses] = useState([])
  const [packageInfo, setPackageInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [referralCode, setReferralCode] = useState('')

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
    
    if (!user.id) {
      console.warn('Purchase attempt blocked: User ID not available');
      console.log('PackageCourses: User ID check failed. User:', user);
      alert('Please log in to purchase courses.')
      return
    }
    
    console.log('PackageCourses: User authenticated', user.id);
    
    // Small delay to ensure auth state is fully loaded
    await new Promise(resolve => setTimeout(resolve, 100));
    
    setProcessing(true)
    
    try {
      console.log('PackageCourses: Ensuring student record exists for user', user.id);
      
      // Ensure student record exists
      const studentResult = await ensureStudentRecord(user.id, user.user_metadata);
      console.log('PackageCourses: Ensure student record result', studentResult);
      
      if (studentResult.error) {
        console.error('Failed to ensure student record:', studentResult.error);
        alert('Failed to prepare user profile for purchase. Please try again.');
        setProcessing(false)
        return;
      }
      
      const studentData = studentResult.data;
      
      // Process payment with referral code if provided
      await handlePackagePayment(packageInfo, {
        uid: user.id,  // Use user.id (Supabase user ID) for the payment
        name: studentData.name,
        phone: studentData.phone
      }, referralCode)
    } catch (error) {
      console.error('Payment error:', error)
      alert('Failed to process payment. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  useEffect(() => {
    const fetchPackageAndCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use fallback data since Supabase has been removed
        const packageData = {
          id: id,
          title: 'Course Package',
          description: 'Explore the courses in this package',
          price: 0
        };

        setPackageInfo(packageData);

        // Use sample course data
        const coursesData = [
          {
            id: 'sample-1',
            title: 'Introduction to Digital Marketing',
            description: 'Learn the basics of digital marketing and online advertising'
          },
          {
            id: 'sample-2', 
            title: 'Advanced SEO Techniques',
            description: 'Master search engine optimization for better website rankings'
          },
          {
            id: 'sample-3',
            title: 'Social Media Strategy', 
            description: 'Create effective social media campaigns that drive engagement'
          }
        ];

        // Transform the data
        const transformedCourses = coursesData.map(course => ({
          id: course.id,
          title: course.title,
          description: course.description,
          duration: null,
          thumbnail_url: null
        }));

        setCourses(transformedCourses);

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

  if (loading) {
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
          <Button 
            variant="outline" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 mb-6"
            asChild
          >
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              {packageInfo?.title || 'Package Courses'}
            </h1>
            <p className="text-xl text-blue-100 mb-2">
              {packageInfo?.description || 'Explore the courses in this package'}
            </p>
            {packageInfo?.price && (
              <div className="text-2xl font-bold text-yellow-300">
                ₹{packageInfo.price}
              </div>
            )}
            
            {/* Referral code input */}
            <div className="max-w-md mx-auto mt-6">
              <div className="flex">
                <Input 
                  type="text" 
                  placeholder="Referral code (optional)" 
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="rounded-r-none text-gray-800"
                />
                <Button 
                  variant="outline" 
                  onClick={() => setReferralCode('')}
                  className="rounded-l-none border-l-0 bg-white text-gray-800 hover:bg-gray-100"
                >
                  Clear
                </Button>
              </div>
            </div>
            
            <div className="mt-6">
              <Button
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6"
                onClick={handleBuyNow}
                disabled={isLoadingAuth || !user || processing}
              >
                {processing ? 'Processing...' : 'Buy This Package Now'}
              </Button>
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

        {courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Courses Available</h3>
            <p className="text-gray-500">This package doesn't have any courses yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="bg-white shadow-xl border-2 border-blue-200 hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Badge className="bg-blue-100 text-blue-600 font-bold">COURSE</Badge>
                    <Play className="h-6 w-6 text-blue-600" />
                  </div>
                  
                  {course.thumbnail_url ? (
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
                  
                  <Button
                    className="w-full bg-blue-600 text-white hover:bg-blue-700 font-bold py-3"
                    disabled
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Buy Package to Access
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PackageCourses