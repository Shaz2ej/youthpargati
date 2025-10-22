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


  // Load all dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!user?.id) {
      console.log('StudentDashboard: No user ID, returning');
      return;
    }
    
    console.log('StudentDashboard: Loading dashboard data for user', user.id);
    
    try {
      setLoading(true)
      setError('')
      
      // Create mock data since we're not using Supabase
      const mockStudentData = {
        id: user.id,
        name: user.user_metadata?.name || 'Student',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        referral_code: 'N/A',
        created_at: new Date().toISOString()
      };
      
      const mockEarnings = { day1: 0, day10: 0, day30: 0, total: 0 };
      const mockPurchases = [];
      const mockWithdrawals = [];
      const mockAffiliateData = { total_leads: 0, total_commission: 0 };
      const mockBalance = 0;
      const mockReferralCodes = [];
      
      // Set all the mock data
      setStudentData(mockStudentData);
      setEarnings(mockEarnings);
      setPurchases(mockPurchases);
      setWithdrawals(mockWithdrawals);
      setAffiliateData(mockAffiliateData);
      setAvailableBalance(mockBalance);
      setUserReferralCodes(mockReferralCodes);
    } catch (err) {
      console.error('Dashboard load error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Ensure student record exists when dashboard loads
  useEffect(() => {
    console.log('StudentDashboard: Checking if student record exists for user', user?.id);
    if (user?.id) {
      loadDashboardData();
    }
  }, [user, loadDashboardData]);

  const handleLogout = async () => {
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

        {/* Referral Program Section */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-blue-600 mb-6 text-center">Referral Program</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-600">Your Referral Code</CardTitle>
                <CardDescription>Share this code to earn commissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <Input 
                    value={studentData?.referral_code || 'N/A'} 
                    readOnly 
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyReferralLink(`${window.location.origin}?ref=${studentData?.referral_code}`)}
                  >
                    {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  Share your referral link with friends to earn commissions on their purchases.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-600">Referral Earnings</CardTitle>
                <CardDescription>Your affiliate performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Commission Earned:</span>
                    <span className="font-bold text-blue-600">{formatCurrency(affiliateData?.total_commission || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Referrals:</span>
                    <span className="font-bold text-green-600">{affiliateData?.total_leads || 0}</span>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      You earn a commission for every successful referral. Keep sharing!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Recent Activity Section */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-blue-600 mb-6 text-center">Recent Activity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Purchases */}
            <Card className="border-2 border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-600">Recent Purchases</CardTitle>
                <CardDescription>Your course purchases</CardDescription>
              </CardHeader>
              <CardContent>
                {purchases.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">No purchases yet</p>
                ) : (
                  <div className="space-y-3">
                    {purchases.slice(0, 3).map((purchase) => (
                      <div key={purchase.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">{purchase.package_title}</p>
                            <p className="text-sm text-gray-600">{formatDate(purchase.created_at)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-orange-600">{formatCurrency(purchase.amount)}</p>
                            {getStatusBadge(purchase.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Withdrawals */}
            <Card className="border-2 border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-600">Withdrawal History</CardTitle>
                <CardDescription>Your withdrawal requests</CardDescription>
              </CardHeader>
              <CardContent>
                {withdrawals.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">No withdrawals yet</p>
                ) : (
                  <div className="space-y-3">
                    {withdrawals.slice(0, 3).map((withdrawal) => (
                      <div key={withdrawal.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">{formatCurrency(withdrawal.amount)}</p>
                            <p className="text-sm text-gray-600">{formatDate(withdrawal.created_at)}</p>
                          </div>
                          {getStatusBadge(withdrawal.status)}
                        </div>
                        {withdrawal.admin_notes && (
                          <p className="text-xs text-gray-500 mt-1">Note: {withdrawal.admin_notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="text-center">
          <h2 className="text-2xl md:text-3xl font-black text-blue-600 mb-6">Quick Actions</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default StudentDashboard