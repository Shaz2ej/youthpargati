import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from '@/pages/Home.jsx'
import StudentDashboard from '@/pages/StudentDashboard.jsx'
import PackageCourses from '@/pages/PackageCourses.jsx'
import CourseVideos from '@/pages/CourseVideos.jsx'
import YouTubeTestFixed from '@/components/YouTubeTestFixed.jsx'
import VideoPlayerExample from '@/pages/VideoPlayerExample.jsx'
import VideoPlayerDemo from '@/pages/VideoPlayerDemo.jsx'
import VideoPlayerTestDemo from '@/pages/VideoPlayerTestDemo.jsx'
import PaymentSuccess from '@/pages/PaymentSuccess.jsx'
import Checkout from '@/pages/Checkout.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/packages/:id/courses" element={<PackageCourses />} />
        <Route path="/courses/:id/videos" element={<CourseVideos />} />
        <Route path="/youtube-test" element={<YouTubeTestFixed />} />
        <Route path="/video-player-example" element={<VideoPlayerExample />} />
        <Route path="/video-player-demo" element={<VideoPlayerDemo />} />
        <Route path="/video-test-demo" element={<VideoPlayerTestDemo />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App