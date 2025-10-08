// Test Video URLs Script - Run this in browser console or as a separate API call
// This script adds sample video URLs to your course_videos table for testing

const testVideoUrls = [
  {
    title: 'Big Buck Bunny - Sample Video',
    description: 'A sample video to test video playback functionality',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: '9:56'
  },
  {
    title: 'Elephants Dream - Another Test',
    description: 'Another sample video for testing purposes',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: '10:53'
  },
  {
    title: 'YouTube Video Example',
    description: 'Example of embedding a YouTube video',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '3:32'
  },
  {
    title: 'Sintel - Open Source Film',
    description: 'Beautiful open source animated film',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    duration: '14:48'
  }
]

// Function to add test videos to a course
export async function addTestVideosToDatabase(supabase, courseId) {
  try {
    const videosToInsert = testVideoUrls.map((video, index) => ({
      course_id: courseId,
      title: video.title,
      description: video.description,
      video_url: video.video_url,
      duration: video.duration,
      order_index: index + 1,
      is_active: true
    }))

    const { data, error } = await supabase
      .from('course_videos')
      .insert(videosToInsert)
      .select()

    if (error) {
      console.error('Error inserting test videos:', error)
      return { success: false, error }
    }

    console.log('Successfully added test videos:', data)
    return { success: true, data }

  } catch (err) {
    console.error('Network error:', err)
    return { success: false, error: err }
  }
}

// Function to get the first course ID for testing
export async function getFirstCourseId(supabase) {
  const { data, error } = await supabase
    .from('courses')
    .select('id')
    .limit(1)
    .single()

  if (error) {
    console.error('Error getting course ID:', error)
    return null
  }

  return data?.id
}

// Main function to set up test data
export async function setupTestVideoData(supabase) {
  console.log('Setting up test video data...')
  
  const courseId = await getFirstCourseId(supabase)
  if (!courseId) {
    console.error('No courses found. Please run the fix-courses-table.sql script first.')
    return
  }

  const result = await addTestVideosToDatabase(supabase, courseId)
  
  if (result.success) {
    console.log('✅ Test video data setup complete!')
    console.log('You can now test video playback in your course videos page.')
  } else {
    console.error('❌ Failed to setup test video data:', result.error)
  }

  return result
}