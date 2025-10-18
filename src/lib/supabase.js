import { createClient } from '@supabase/supabase-js'

// Supabase configuration (direct URL & key)
const SUPABASE_URL = 'https://pnupcskyrxivtjhwmvax.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBudXBjc2t5cnhpdnRqaHdtdmF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNzAxNDIsImV4cCI6MjA3MTk0NjE0Mn0.Q0Qp4CFCXWTSdFqbqR1nouEEF2_jydgPfhXRoygKFx0'
const USE_MOCK_DATA = false

// Create Supabase client with proper headers and auth settings
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Mock client for development when Supabase is not available
class MockSupabaseClient {
  constructor() {
    this.auth = {
      getUser: () => Promise.resolve({ data: { user: { id: 'mock-user-id' } } })
    }
  }

  from(table) {
    return {
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: this.getMockData(table), error: null })
        }),
        order: () => Promise.resolve({ data: this.getMockData(table), error: null })
      }),
      insert: (data) => Promise.resolve({ data: [data], error: null }),
      update: (updates) => ({
        eq: () => Promise.resolve({ data: [updates], error: null })
      })
    }
  }

  getMockData(table) {
    const mockData = {
      students: [
        {
          id: 'mock-user-id',
          firebase_uid: 'mock-firebase-uid',
          name: 'John Doe',
          email: 'youthpargatii@gmail.com',
          phone: '+1234567890',
          created_at: '2024-01-01T00:00:00Z',
          referral_code: 'JOHN123'
        }
      ],
      purchases: [
        {
          id: 1,
          student_id: 'mock-user-id',
          package_name: 'Pargati Starter',
          amount: 376,
          purchase_date: '2024-01-15T10:30:00Z',
          status: 'completed',
          commission: 37.6
        },
        {
          id: 2,
          student_id: 'mock-user-id',
          package_name: 'Pargati Elite',
          amount: 532,
          purchase_date: '2024-01-20T14:45:00Z',
          status: 'completed',
          commission: 53.2
        }
      ],
      withdrawals: [
        {
          id: 1,
          student_id: 'mock-user-id',
          amount: 50,
          created_at: '2024-01-25T09:00:00Z',
          status: 'completed',
          processed_date: '2024-01-26T10:00:00Z'
        },
        {
          id: 2,
          student_id: 'mock-user-id',
          amount: 30,
          created_at: '2024-02-01T11:30:00Z',
          status: 'pending'
        }
      ],
      affiliates: [
        {
          id: 1,
          student_id: 'mock-user-id',
          referral_code: 'JOHN123',
          total_leads: 5,
          total_commission: 90.8,
          created_at: '2024-01-01T00:00:00Z'
        }
      ]
    }
    return mockData[table] || []
  }
}

// Export the appropriate client based on configuration
// For API functions, we want to use the authenticated client
export const supabaseClient = USE_MOCK_DATA ? new MockSupabaseClient() : supabase

// Also export the default supabase client for direct usage
export default supabase

// Export the supabase instance directly for consistency
export { supabase }

// Optional debug logs
console.log('Supabase URL:', SUPABASE_URL)
console.log('Using Mock Data:', USE_MOCK_DATA)