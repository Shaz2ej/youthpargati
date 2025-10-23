import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from '@/pages/Home.jsx'
import StudentDashboard from '@/pages/StudentDashboard.jsx'
import PackageCourses from '@/pages/PackageCourses.jsx'
import CourseVideos from '@/pages/CourseVideos.jsx'
import PaymentSuccess from '@/pages/PaymentSuccess.jsx'
import Checkout from '@/pages/Checkout.jsx'
import { AuthProvider } from '@/context/AuthContext.jsx'
import Login from '@/pages/Login.jsx'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/packages/:id/courses" element={<PackageCourses />} />
          <Route path="/courses/:id/videos" element={<CourseVideos />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App