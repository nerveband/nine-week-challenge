import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getStreakDays } from '@/lib/utils'
import { DashboardClient } from '@/components/dashboard/dashboard-client'

export default async function DashboardPage() {
  const supabase = createServerClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  // Get today's tracking data
  const today = new Date().toISOString().split('T')[0]
  const { data: todayTracking } = await supabase
    .from('daily_tracking')
    .select('*, meals(*)')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  // Get all tracking data for streak calculation and calendar
  const { data: allTracking } = await supabase
    .from('daily_tracking')
    .select('date')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  const currentStreak = getStreakDays(allTracking || [])

  return (
    <DashboardClient
      profile={profile}
      todayTracking={todayTracking}
      allTracking={allTracking || []}
      currentStreak={currentStreak}
    />
  )
}