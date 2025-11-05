import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { 
  Play, 
  Users, 
  BookOpen, 
  Trophy, 
  Zap, 
  Target, 
  Star,
  Youtube,
  GraduationCap,
  DollarSign,
  Mail,
  CheckCircle
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { handlePackagePayment } from '@/lib/payment.js'
import { useAuth } from '@/context/AuthContext.jsx'
import StartJourneyButton from '@/components/StartJourneyButton.jsx'
import { fetchPackages } from '@/lib/utils.js'

function Home() {
  const { user, isLoadingAuth } = useAuth()
  const navigate = useNavigate()
  const [packages, setPackages] = useState([])
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState({})
  const [referralCode, setReferralCode] = ''

  // Fallback data to ensure UI never breaks
  const fallbackPackages = [
    {
      id: 'seed',
      name: 'Seed Package',
      title: 'Pargati Seed',
      description: 'Get started with essential digital skills',
      price: 199,
      thumbnail_url: 'https://i.ibb.co/hxF0cSCz/seed-package.jpg' // Added the thumbnail URL
    },
    {
      id: 'basic',
      name: 'Basic Package',
      title: 'Pargati Basic',
      description: 'Essential skills for beginners',
      price: 376,
      thumbnail_url: null
    },
    {
      id: 'elite', 
      name: 'Elite Package',
      title: 'Pargati Elite',
      description: 'Advanced skills for serious learners',
      price: 532,
      thumbnail_url: null
    },
    {
      id: 'warriors',
      name: 'Warriors Package',
      title: 'Pargati Warriors', 
      description: 'Elite training for digital champions',
      price: 1032,
      thumbnail_url: null
    }
  ]

  const handleBuyNow = async (pkg) => {
    console.log('handleBuyNow: Called with package', pkg);
    console.log('handleBuyNow: Current user state', user);
    console.log('handleBuyNow: Current auth context', { user, isLoadingAuth });
    
    // More robust check - wait for auth state to be fully loaded
    if (isLoadingAuth) {
      console.warn('Purchase attempt blocked: Auth state still loading');
      alert('Please wait, still loading user session...');
      return;
    }
    
    // If user is not logged in, redirect to login page
    if (!user) {
      console.log('User not logged in, redirecting to login page');
      // Store the package they wanted to buy in session storage
      sessionStorage.setItem('checkoutPackage', JSON.stringify(pkg));
      // Redirect to login page
      navigate('/login');
      return;
    }
    
    // If user is logged in, proceed with purchase
    // Fix: Use user.uid instead of user.id for Firebase user objects
    if (!user.uid) {
      console.warn('Purchase attempt blocked: User ID not available');
      console.log('handleBuyNow: User ID check failed. User:', user);
      alert('Please log in to purchase courses.')
      return
    }
    
    console.log('handleBuyNow: User authenticated', user.uid);
    
    // Small delay to ensure auth state is fully loaded
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Set processing state for this package
    setProcessing(prev => ({ ...prev, [pkg.id]: true }))
    
    try {
      console.log('handleBuyNow: Navigating to checkout for user', user.uid);
      
      // Navigate to checkout page with package and referral code data
      // Store package and referral code in session storage for the checkout page
      sessionStorage.setItem('checkoutPackage', JSON.stringify(pkg))
      sessionStorage.setItem('referralCode', referralCode)
      
      // Navigate to checkout page
      navigate('/checkout')
    } catch (error) {
      console.error('Navigation error:', error)
      alert('Failed to proceed to checkout. Please try again.')
    } finally {
      // Reset processing state
      setProcessing(prev => ({ ...prev, [pkg.id]: false }))
    }
  }

  useEffect(() => {
    const loadPackages = async () => {
      try {
        const packagesData = await fetchPackages();
        console.log('Fetched packages data:', packagesData); // Debug log to see what fields are present
        setPackages(packagesData);
      } catch (err) {
        console.error('Error loading packages from Firestore:', err);
        setError('Failed to load packages. Showing fallback data.');
        // Use fallback packages if Firestore fails
        setPackages(fallbackPackages);
      }
    };

    loadPackages();
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Hero Banner Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-orange-500 text-white overflow-hidden"
        style={{
          background: 'linear-gradient(rgba(0, 123, 255, 0.8), rgba(255, 111, 0, 0.8))'
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black mb-6 animate-pulse">
            YouthPargati
          </h1>
          <h2 className="text-2xl md:text-4xl font-bold mb-8 text-yellow-300">
            Padho, Seekho, Aage Badho!
          </h2>
          <p className="text-xl md:text-2xl mb-12 font-semibold">
            Learn digital skills and build your empire with confidence.
          </p>
          
          {/* Show referral dashboard link for logged-in users */}
          {user && (
            <div className="mb-6">
              <Button 
                onClick={() => navigate('/referral-dashboard')}
                variant="outline"
                className="bg-white/20 hover:bg-white/30 text-white border-white"
              >
                My Referral Dashboard
              </Button>
            </div>
          )}
          
          {/* Motivational Overlay */}
          <StartJourneyButton />
        </div>
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-orange-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-20 w-12 h-12 bg-blue-400 rounded-full opacity-20 animate-spin"></div>
      </section>

      {/* About Us Section */}
      <section 
        className="py-20 px-4 bg-gradient-to-r from-orange-100 to-blue-100"
        style={{
          background: 'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 165, 0, 0.1))'
        }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-8 text-blue-600">
            About YouthPargati
          </h2>
          <div className="bg-white rounded-3xl shadow-2xl p-12 border-4 border-orange-400">
            <Trophy className="mx-auto h-20 w-20 text-orange-500 mb-8" />
            <p className="text-xl md:text-2xl leading-relaxed text-gray-700 font-medium">
              At YouthPargati, we believe that digital skill is the key to success in today's fast-paced, 
              tech-driven world. Our platform is designed to empower individuals like you with the skills 
              needed to thrive in the digital era.
            </p>
          </div>
        </div>
      </section>

      {/* What Makes Us Different Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-orange-600 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-16">
            REAL-WARRIORS, NOT JUST TEACHERS
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white">
              <CardHeader>
                <Youtube className="h-16 w-16 mx-auto text-red-400 mb-4" />
                <CardTitle className="text-2xl font-bold">YouTubers – now LIVE in your class</CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white">
              <CardHeader>
                <Zap className="h-16 w-16 mx-auto text-yellow-400 mb-4" />
                <CardTitle className="text-2xl font-bold">Learn Anytime, Anywhere</CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white">
              <CardHeader>
                <Target className="h-16 w-16 mx-auto text-green-400 mb-4" />
                <CardTitle className="text-2xl font-bold">GenZ-ready Course Plans</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-4 text-blue-600">
              Top Class Courses
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 font-semibold">
              Explore Our World's Best Courses
            </p>
            {error && (
              <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Using offline data. Backend issue: {error}
                </p>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Render all active packages dynamically */}
            {packages.length > 0 ? (
              packages.map((pkg) => (
                <Card
                  key={pkg.id}
                  className="bg-white shadow-2xl border rounded-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-100 text-blue-600 font-bold">PACKAGE</Badge>
                      <DollarSign className="h-8 w-8 text-blue-600" />
                    </div>
                    {pkg.name && (
                      <div className="text-sm font-semibold text-blue-600 mb-1">{pkg.name}</div>
                    )}
                    <CardTitle className="text-2xl font-black">{pkg.title}</CardTitle>
                    <CardDescription className="text-gray-600">
                      {pkg.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pkg.thumbnail ? (
                      <img src={pkg.thumbnail} alt={pkg.title} className="w-full h-48 object-cover rounded-xl mb-3" />
                    ) : pkg.thumbnail_url ? (
                      <img
                        src={pkg.thumbnail_url}
                        alt={pkg.title}
                        className="w-full h-40 object-cover rounded-xl mb-4"
                        onError={(e) => {
                          // Hide broken images
                          e.target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-orange-100 rounded-xl mb-4 flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-blue-400" />
                      </div>
                    )}
                    <div className="text-center mb-6">
                      <span className="text-3xl font-black">₹{pkg.price}</span>
                    </div>
                    <Button
                      className="w-full bg-blue-600 text-white hover:bg-blue-700 font-bold text-lg py-3"
                      onClick={() => handleBuyNow(pkg)}
                      disabled={isLoadingAuth || !user || processing[pkg.id]}
                    >
                      {processing[pkg.id] ? 'Processing...' : 'Buy Now'}
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              // Fallback to hardcoded packages if no active packages are found
              fallbackPackages.map((pkg) => (
                <Card
                  key={pkg.id}
                  className="bg-white shadow-2xl border rounded-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-100 text-blue-600 font-bold">PACKAGE</Badge>
                      <DollarSign className="h-8 w-8 text-blue-600" />
                    </div>
                    {pkg.name && (
                      <div className="text-sm font-semibold text-blue-600 mb-1">{pkg.name}</div>
                    )}
                    <CardTitle className="text-2xl font-black">{pkg.title}</CardTitle>
                    <CardDescription className="text-gray-600">
                      {pkg.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-orange-100 rounded-xl mb-4 flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-blue-400" />
                    </div>
                    <div className="text-center mb-6">
                      <span className="text-3xl font-black">₹{pkg.price}</span>
                    </div>
                    <Button
                      className="w-full bg-blue-600 text-white hover:bg-blue-700 font-bold text-lg py-3"
                      onClick={() => handleBuyNow(pkg)}
                      disabled={isLoadingAuth || !user || processing[pkg.id]}
                    >
                      {processing[pkg.id] ? 'Processing...' : 'Buy Now'}
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Our Plan Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-8">
            YouthPargati Grow Plan
          </h2>
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border-2 border-white/20">
            <GraduationCap className="mx-auto h-20 w-20 text-yellow-400 mb-8" />
            <p className="text-xl md:text-2xl leading-relaxed font-medium">
              Enroll with YouthPargati to start your journey. Begin with our Starter course 
              and grow step-by-step with us.
            </p>
          </div>
        </div>
      </section>

      {/* Our Top Features Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-4 text-orange-600">
              Achieve Your Goal With YouthPargati
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 font-semibold">
              With YouthPargati, Begin your journey to success.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white shadow-xl border-2 border-orange-200 hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <Youtube className="h-12 w-12 text-red-500 mb-4" />
                <CardTitle className="text-xl font-bold text-gray-800">🎥 YoutuberTutors</CardTitle>
                <CardDescription>Professional educators with YouTube channels</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-white shadow-xl border-2 border-blue-200 hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-blue-500 mb-4" />
                <CardTitle className="text-xl font-bold text-gray-800">📚 EffectiveCourses</CardTitle>
                <CardDescription>Designed for real-world impact</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-white shadow-xl border-2 border-green-200 hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <Users className="h-12 w-12 text-green-500 mb-4" />
                <CardTitle className="text-xl font-bold text-gray-800">👨‍🏫 20+ Trainers</CardTitle>
                <CardDescription>Expert instructors ready to guide you</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-white shadow-xl border-2 border-purple-200 hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <GraduationCap className="h-12 w-12 text-purple-500 mb-4" />
                <CardTitle className="text-xl font-bold text-gray-800">👥 30K+ Students</CardTitle>
                <CardDescription>Join our growing community</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-white shadow-xl border-2 border-red-200 hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <Play className="h-12 w-12 text-red-500 mb-4" />
                <CardTitle className="text-xl font-bold text-gray-800">🔴 100+ Live Trainings</CardTitle>
                <CardDescription>Interactive live sessions</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-white shadow-xl border-2 border-yellow-200 hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <DollarSign className="h-12 w-12 text-yellow-500 mb-4" />
                <CardTitle className="text-xl font-bold text-gray-800">💰 ₹5 Crore+ Earnings</CardTitle>
                <CardDescription>Community success stories</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact and Footer */}
      <section className="py-20 px-4 bg-gradient-to-r from-gray-800 to-blue-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-black mb-8">
                Contact Us
              </h2>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/20">
                <Mail className="h-12 w-12 text-blue-400 mb-4" />
                <p className="text-xl font-semibold mb-4">Get in touch with us:</p>
                <a href="mailto:youthpargatii@gmail.com" className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors">
                  youthpargatii@gmail.com
                </a>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-3xl md:text-4xl font-black mb-8 text-orange-400">
                Meet The Founder
              </h3>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-orange-400">
                <div className="w-32 h-32 rounded-full mx-auto mb-6 overflow-hidden">
                  <img 
                    src="https://i.ibb.co/5D9Tt7M/founder-photo.jpg" 
                    alt="Founder" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-lg leading-relaxed">
                  From humble beginnings to building a platform that empowers thousands, <strong>Shazen Shaikh</strong> founded <strong>YouthPargati</strong> with one powerful goal — to give every young mind in India the chance to learn, grow, and lead in the digital era.
                  His vision continues to inspire a generation of learners to dream big and achieve more.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer className="bg-black text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-3xl font-black mb-4 text-orange-400">YouthPargati</h3>
          <p className="text-lg text-gray-300 mb-6">Padho, Seekho, Aage Badho!</p>
          <div className="flex justify-center space-x-6">
            <CheckCircle className="h-8 w-8 text-green-400" />
            <Star className="h-8 w-8 text-yellow-400" />
            <Trophy className="h-8 w-8 text-orange-400" />
          </div>
          <p className="text-gray-400 mt-8">© 2024 YouthPargati. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home