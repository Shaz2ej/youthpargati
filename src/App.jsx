import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from '@/pages/Home.jsx'
import Login from '@/pages/Login.jsx'
import Register from '@/pages/Register.jsx'
import StudentDashboard from '@/pages/StudentDashboard.jsx'
import PackageCourses from '@/pages/PackageCourses.jsx'
import CourseVideos from '@/pages/CourseVideos.jsx'
import YouTubeTestFixed from '@/components/YouTubeTestFixed.jsx'
import VideoPlayerExample from '@/pages/VideoPlayerExample.jsx'
import VideoPlayerDemo from '@/pages/VideoPlayerDemo.jsx'
import VideoPlayerTestDemo from '@/pages/VideoPlayerTestDemo.jsx'
import PaymentSuccess from '@/pages/PaymentSuccess.jsx'
import Checkout from '@/pages/Checkout.jsx'
import CompleteProfile from '@/pages/CompleteProfile.jsx'
import { AuthProvider, useAuth } from '@/context/AuthContext.jsx'
import ProtectedRoute from '@/components/ProtectedRoute.jsx'

function AppContent() {
  const { isLoadingAuth, user, loading } = useAuth()
  
  console.log('AppContent: Auth state', { isLoadingAuth, user, loading });
  
  // Show loading screen while determining auth state
  if (isLoadingAuth) {
    return <div>Loading user session...</div>
  }
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/packages/:id/courses" element={<PackageCourses />} />
        <Route path="/courses/:id/videos" element={<CourseVideos />} />
        <Route path="/youtube-test" element={<YouTubeTestFixed />} />
        <Route path="/video-player-example" element={<VideoPlayerExample />} />
        <Route path="/video-player-demo" element={<VideoPlayerDemo />} />
        <Route path="/video-test-demo" element={<VideoPlayerTestDemo />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/checkout" element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } />
        <Route path="/complete-profile" element={
          <ProtectedRoute>
            <CompleteProfile />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App