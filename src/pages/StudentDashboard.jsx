import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Wallet, 
  Users, 
  Link as LinkIcon,
  Copy,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpRight,
  RefreshCw,
  Home
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext.jsx'
import { useNavigate, Link } from 'react-router-dom'
import {
  getStudentData,
  getStudentEarnings,
  getStudentPurchases,
  getStudentWithdrawals,
  getStudentAffiliateData,
  getAvailableBalance,
  createStudent,
  getUserReferralCodes,
  generateUserReferralCodes
} from '@/lib/api.js'
import { testSupabaseConnection } from '@/lib/testSupabase.js'
import { WithdrawalsCard } from '@/lib/WithdrawalsCard.jsx'
import { supabase } from '@/firebase.js'

function StudentDashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  
  // State management
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [studentData, setStudentData] = useState(null)
  const [earnings, setEarnings] = useState(null)
  const [purchases, setPurchases] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [affiliateData, setAffiliateData] = useState(null)
  const [userReferralCodes, setUserReferralCodes] = useState([])
  const [availableBalance, setAvailableBalance] = useState(0)
  const [copied, setCopied] = useState(false)

  // Constants
  const COPIED_TIMEOUT = 2000;

  // Check if user has completed profile
  const checkUserProfileCompletion = useCallback(async () => {
    if (!user?.id) return
    
    try {
      // Check if user.id is provided
      if (!user || !user.id) {
        console.warn('Skipping profile check: User not fully loaded yet.')
        return
      }
      
      // Get student data to check if phone number exists
      const { data, error } = await supabase
        .from('students')
        .select('phone')
        .eq('firebase_uid', user.id)
        .single()
      
      if (error) {
        console.error('Error checking user profile:', error)
        return
      }
      
      // If phone number is missing, redirect to complete profile
      if (!data.phone || data.phone.trim() === '') {
        navigate('/complete-profile')
        return
      }
    } catch (err) {
      console.error('Profile completion check error:', err)
    }
  }, [user, navigate])

  // Load all dashboard data
  const loadDashboardData = useCallback(async () => {
    // Check if user.id is provided
    if (!user || !user.id) {
      console.warn('Skipping dashboard data load: User not fully loaded yet.')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      // First check if user has completed profile
      await checkUserProfileCompletion()
      
      // Test Supabase connection first
      const connectionTest = await testSupabaseConnection()
      if (!connectionTest.success) {
        throw new Error(`Database connection failed: ${connectionTest.error}`)
      }
      // First, try to get student data
      let studentResult = await getStudentData(user.id)
      
      // If student doesn't exist, create one
      if (studentResult.error === 'No student record found') {
        console.log('Student record not found, creating new one...')
        const createResult = await createStudent(
          user.id, 
          user.user_metadata?.name || 'Student', 
          user.email || '', 
          user.user_metadata?.phone || ''
        )
        
        if (createResult.error) {
          throw new Error(`Failed to create student record: ${createResult.error}`)
        }
        
        // Try to get student data again
        studentResult = await getStudentData(user.id)
        if (studentResult.error) {
          throw new Error(`Failed to fetch student data after creation: ${studentResult.error}`)
        }
      } else if (studentResult.error) {
        throw new Error(`Failed to fetch student data: ${studentResult.error}`)
      }

      // Now fetch all other data
      const [
        earningsResult,
        purchasesResult,
        withdrawalsResult,
        affiliateResult,
        balanceResult,
        referralCodesResult
      ] = await Promise.allSettled([
        getStudentEarnings(user.id),
        getStudentPurchases(user.id),
        getStudentWithdrawals(user.id),
        getStudentAffiliateData(user.id),
        getAvailableBalance(user.id),
        getUserReferralCodes(user.id)
      ])
      
      // Helper to process settled promises
      const processResult = (result, setter, defaultValue) => {
        if (result.status === 'fulfilled' && !result.value.error) {
          setter(result.value.data);
        } else {
          const errorMessage = result.reason?.message || result.value?.error || 'Failed to fetch data';
          console.error(`Dashboard data error: ${errorMessage}`);
          setter(defaultValue); // Set a default value on failure
        }
      };
      
      setStudentData(studentResult.data)
      processResult(earningsResult, setEarnings, { day1: 0, day10: 0, day30: 0, total: 0 });
      processResult(purchasesResult, setPurchases, []);
      processResult(withdrawalsResult, setWithdrawals, []);
      processResult(affiliateResult, setAffiliateData, { total_leads: 0, total_commission: 0 });
      processResult(balanceResult, setAvailableBalance, 0);
      processResult(referralCodesResult, setUserReferralCodes, []);
    } catch (err) {
      console.error('Dashboard load error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user, checkUserProfileCompletion])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/', { replace: true })
  }

  // New function to navigate to home
  const handleGoHome = () => {
    navigate('/', { replace: true })
  }

  const copyReferralLink = async (link) => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), COPIED_TIMEOUT)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const formatCurrency = (amount) => `₹${amount.toFixed(2)}`
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN')

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
      pending: { variant: 'secondary', icon: Clock, color: 'text-yellow-600' },
      failed: { variant: 'destructive', icon: XCircle, color: 'text-red-600' }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md border-2 border-red-300">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadDashboardData} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      <div className="bg-gradient-to-r from-blue-600 to-orange-500 text-white py-4 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            {/* Welcome Header */}
            <h1 className="text-2xl font-black">
              Welcome, {studentData?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Student'} 👋
            </h1>
            <p className="text-sm italic font-cursive text-gray-200" style={{ fontFamily: 'cursive' }}>
              Never Give Up 💪
            </p>
          </div>
          <Button 
            onClick={handleGoHome}
            variant="outline" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Home
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <Card className="mb-6 border-2 border-red-300">
            <CardContent className="pt-6">
              <p className="text-red-600 text-center font-semibold">{error}</p>
              <div className="text-center mt-4">
                <Button onClick={loadDashboardData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Earnings Overview Section */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-blue-600 mb-6 text-center">Earnings Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 border-blue-200">
              <CardContent className="pt-6 text-center">
                <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-black text-blue-600">{formatCurrency(earnings?.day1 || 0)}</p>
                <p className="text-gray-600">Today's Earnings</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-green-200">
              <CardContent className="pt-6 text-center">
                <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-black text-green-600">{formatCurrency(earnings?.day10 || 0)}</p>
                <p className="text-gray-600">Last 10 Days</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-yellow-200">
              <CardContent className="pt-6 text-center">
                <Calendar className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-black text-yellow-600">{formatCurrency(earnings?.day20 || 0)}</p>
                <p className="text-gray-600">Last 20 Days</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-purple-200">
              <CardContent className="pt-6 text-center">
                <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-black text-purple-600">{formatCurrency(earnings?.day30 || 0)}</p>
                <p className="text-gray-600">Last 30 Days</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Stats Overview */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-blue-600 mb-6 text-center">Performance Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 border-blue-200">
              <CardContent className="pt-6 text-center">
                <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-black text-blue-600">{formatCurrency(earnings?.total || 0)}</p>
                <p className="text-gray-600">Total Earnings</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-green-200">
              <CardContent className="pt-6 text-center">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-black text-green-600">{affiliateData?.total_leads || 0}</p>
                <p className="text-gray-600">Total Leads</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-orange-200">
              <CardContent className="pt-6 text-center">
                <Wallet className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-black text-orange-600">{formatCurrency(availableBalance)}</p>
                <p className="text-gray-600">Available Balance</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-purple-200">
              <CardContent className="pt-6 text-center">
                <ArrowUpRight className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-black text-purple-600">{purchases.length}</p>
                <p className="text-gray-600">Purchases</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Purchases History */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-blue-600 mb-6 text-center">Purchase History</h2>
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle>Your Course Purchases</CardTitle>
              <CardDescription>All your course purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {purchases.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No purchases yet</p>
                ) : (
                  purchases.map((purchase) => (
                    <div key={purchase.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-semibold">{purchase.package_name}</h3>
                        <p className="text-sm text-gray-600">{formatDate(purchase.purchase_date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(purchase.amount)}</p>
                        {getStatusBadge(purchase.status)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Withdrawals */}
        <section className="mb-12">
          <WithdrawalsCard
            userId={user.id}
            availableBalance={availableBalance}
            withdrawals={withdrawals}
            onSuccessfulWithdrawal={loadDashboardData}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getStatusBadge={getStatusBadge}
            studentData={studentData}
          />
        </section>

        {/* Affiliate / Leads Section */}
        <section>
          <h2 className="text-2xl md:text-3xl font-black text-blue-600 mb-6 text-center">Affiliate Program</h2>
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle>Your Referral Program</CardTitle>
              <CardDescription>Earn commissions by referring new students</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                  <LinkIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-black text-purple-600">{affiliateData?.total_leads || 0}</p>
                  <p className="text-gray-600">Total Leads</p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
                  <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-black text-green-600">{formatCurrency(affiliateData?.total_commission || 0)}</p>
                  <p className="text-gray-600">Total Referral Earnings</p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg">
                  <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-black text-orange-600">{affiliateData?.referral_code || 'N/A'}</p>
                  <p className="text-gray-600">Your Code</p>
                </div>
              </div>

              {/* Referral Links */}
              {userReferralCodes.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Your Referral Links</h3>
                  <div className="space-y-4">
                    {userReferralCodes.map((code) => (
                      <div key={code.referral_code} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold">{code.packages?.title || 'Course Package'}</p>
                          <p className="text-sm text-gray-600 break-all">{code.referral_link}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyReferralLink(code.referral_link)}
                          className="flex items-center gap-2"
                        >
                          {copied ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}

export default StudentDashboard