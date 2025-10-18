import React from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import { useAuth } from '@/context/AuthContext.jsx'

const StartJourneyButton = () => {
  const { user, loading } = useAuth()
  
  console.log('StartJourneyButton: Auth state', { user, loading });

  if (loading) {
    return (
      <Button 
        size="lg" 
        className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xl px-12 py-6 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
        disabled
      >
        Loading...
      </Button>
    )
  }

  if (user) {
    // User is logged in - show "Your Dashboard" button
    console.log('StartJourneyButton: User logged in, showing dashboard button');
    return (
      <Button 
        size="lg" 
        className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xl px-12 py-6 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
        asChild
      >
        <Link to="/dashboard">
          <Play className="mr-2 h-6 w-6" />
          Your Dashboard
        </Link>
      </Button>
    )
  }
  
  console.log('StartJourneyButton: User not logged in, showing start journey button');

  // User is not logged in - show "Start Your Journey" button
  return (
    <Button 
      size="lg" 
      className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xl px-12 py-6 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
      asChild
    >
      <Link to="/register">
        <Play className="mr-2 h-6 w-6" />
        Start Your Journey
      </Link>
    </Button>
  )
}

export default StartJourneyButton