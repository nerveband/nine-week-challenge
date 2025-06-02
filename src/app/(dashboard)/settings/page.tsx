'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Settings, RefreshCw, Calendar, Ruler, SkipForward, AlertTriangle, Loader2, Bell } from 'lucide-react'
import type { Database } from '@/types/database'
import { formatDate } from '@/lib/utils'

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [settings, setSettings] = useState({
    measurementUnit: 'inches',
    allowWeekSkipping: false,
    theme: 'light'
  })
  const [notifications, setNotifications] = useState({
    morning: false,
    afternoon: false,
    evening: false,
    morningTime: '08:00',
    afternoonTime: '12:00',
    eveningTime: '18:00'
  })
  const [newStartDate, setNewStartDate] = useState('')

  useEffect(() => {
    loadUserSettings()
  }, [])

  const loadUserSettings = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setProfile(profile)
        setNewStartDate(profile.program_start_date)
        
        // Load user settings from profile or localStorage
        const savedSettings = {
          measurementUnit: profile.measurement_unit || localStorage.getItem('measurementUnit') || 'inches',
          allowWeekSkipping: profile.allow_week_skipping || false,
          theme: localStorage.getItem('theme') || 'light'
        }
        setSettings(savedSettings)
        
        // Load notification settings
        const savedNotifications = {
          morning: profile.notification_morning || false,
          afternoon: profile.notification_afternoon || false,
          evening: profile.notification_evening || false,
          morningTime: profile.notification_morning_time || '08:00',
          afternoonTime: profile.notification_afternoon_time || '12:00',
          eveningTime: profile.notification_evening_time || '18:00'
        }
        setNotifications(savedNotifications)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Save to database
      const { error } = await supabase
        .from('profiles')
        .update({
          measurement_unit: settings.measurementUnit,
          allow_week_skipping: settings.allowWeekSkipping,
          notification_morning: notifications.morning,
          notification_afternoon: notifications.afternoon,
          notification_evening: notifications.evening,
          notification_morning_time: notifications.morningTime,
          notification_afternoon_time: notifications.afternoonTime,
          notification_evening_time: notifications.eveningTime,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      // Save theme to localStorage
      localStorage.setItem('measurementUnit', settings.measurementUnit)
      localStorage.setItem('theme', settings.theme)

      toast({
        title: 'Settings saved',
        description: 'Your preferences have been updated.',
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleProgramReset = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Update program start date
      const { error } = await supabase
        .from('profiles')
        .update({
          program_start_date: newStartDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: 'Program reset',
        description: 'Your program start date has been updated.',
      })

      // Refresh the page to update all data
      window.location.reload()
    } catch (error) {
      console.error('Error resetting program:', error)
      toast({
        title: 'Error',
        description: 'Failed to reset program',
        variant: 'destructive',
      })
    }
  }

  const handleClearAllData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Delete all user data except profile
      await Promise.all([
        supabase.from('daily_tracking').delete().eq('user_id', user.id),
        supabase.from('measurements').delete().eq('user_id', user.id),
        supabase.from('photos').delete().eq('user_id', user.id)
      ])

      toast({
        title: 'Data cleared',
        description: 'All your tracking data has been deleted.',
      })

      // Refresh the page
      window.location.reload()
    } catch (error) {
      console.error('Error clearing data:', error)
      toast({
        title: 'Error',
        description: 'Failed to clear data',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-pink" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage your app preferences and program settings
        </p>
      </div>

      {/* Preferences */}
      <Card className="animate-fade-in-delay">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-brand-pink" />
            Preferences
          </CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Measurement Unit */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="measurement-unit" className="text-base">
                <Ruler className="inline h-4 w-4 mr-2 text-brand-blue" />
                Measurement Unit
              </Label>
              <p className="text-sm text-muted-foreground">
                Choose between inches or centimeters
              </p>
            </div>
            <Select
              value={settings.measurementUnit}
              onValueChange={(value) => setSettings(prev => ({ ...prev, measurementUnit: value }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inches">Inches</SelectItem>
                <SelectItem value="cm">Centimeters</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Week Skipping */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="week-skipping" className="text-base">
                <SkipForward className="inline h-4 w-4 mr-2 text-brand-yellow" />
                Allow Week Skipping
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable navigation to any week (not recommended)
              </p>
            </div>
            <Switch
              id="week-skipping"
              checked={settings.allowWeekSkipping}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowWeekSkipping: checked }))}
            />
          </div>

          {/* Save Button */}
          <Button 
            onClick={saveSettings} 
            variant="brand" 
            className="w-full sm:w-auto"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="animate-fade-in-delay-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-brand-blue" />
            Notifications
          </CardTitle>
          <CardDescription>Set reminders for daily tracking (off by default)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Morning Notification */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="morning-notification" className="text-base">
                Morning Reminder
              </Label>
              <p className="text-sm text-muted-foreground">
                Get reminded to start your day with tracking
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={notifications.morningTime}
                onChange={(e) => setNotifications(prev => ({ ...prev, morningTime: e.target.value }))}
                disabled={!notifications.morning}
                className="h-9 w-20 rounded-md border border-input bg-background px-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Switch
                id="morning-notification"
                checked={notifications.morning}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, morning: checked }))}
              />
            </div>
          </div>

          {/* Afternoon Notification */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="afternoon-notification" className="text-base">
                Afternoon Check-in
              </Label>
              <p className="text-sm text-muted-foreground">
                Reminder to log your lunch and progress
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={notifications.afternoonTime}
                onChange={(e) => setNotifications(prev => ({ ...prev, afternoonTime: e.target.value }))}
                disabled={!notifications.afternoon}
                className="h-9 w-20 rounded-md border border-input bg-background px-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Switch
                id="afternoon-notification"
                checked={notifications.afternoon}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, afternoon: checked }))}
              />
            </div>
          </div>

          {/* Evening Notification */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="evening-notification" className="text-base">
                Evening Reflection
              </Label>
              <p className="text-sm text-muted-foreground">
                Complete your daily tracking and reflect
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={notifications.eveningTime}
                onChange={(e) => setNotifications(prev => ({ ...prev, eveningTime: e.target.value }))}
                disabled={!notifications.evening}
                className="h-9 w-20 rounded-md border border-input bg-background px-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Switch
                id="evening-notification"
                checked={notifications.evening}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, evening: checked }))}
              />
            </div>
          </div>

          {(notifications.morning || notifications.afternoon || notifications.evening) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Notifications will help you stay consistent with your daily tracking. You can always turn them off later.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Program Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-brand-blue" />
            Program Management
          </CardTitle>
          <CardDescription>Manage your Nine Week Challenge timeline</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Program Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Current Program Start Date</p>
              <p className="text-lg font-semibold text-brand-pink">
                {profile ? formatDate(profile.program_start_date) : '-'}
              </p>
            </div>
          </div>

          {/* Reschedule Program */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-start-date" className="text-base">
                Reschedule Program Start
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Change when your 9-week program begins
              </p>
            </div>
            <div className="flex gap-2">
              <input
                id="new-start-date"
                type="date"
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" disabled={newStartDate === profile?.program_start_date}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset Program Start Date?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will change your program timeline. Your existing tracking data will remain, but week numbers will be recalculated based on the new start date.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleProgramReset}>
                      Reset Start Date
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto">
                Clear All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your tracking data, measurements, and photos. Your profile and account will remain intact.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleClearAllData}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Yes, delete all data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}