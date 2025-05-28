'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { profileSchema, type ProfileInput } from '@/lib/validations'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Loader2, User, Calendar, LogOut, AlertCircle } from 'lucide-react'
import type { Database } from '@/types/database'
import { calculateAge, formatDate, getCurrentWeek } from '@/lib/utils'

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [currentWeek, setCurrentWeek] = useState(1)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadProfile = async () => {
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
        const week = getCurrentWeek(profile.program_start_date)
        setCurrentWeek(week)
        
        reset({
          name: profile.name || '',
          birthdate: profile.birthdate || '',
          height_feet: profile.height_feet || undefined,
          height_inches: profile.height_inches || undefined,
          starting_weight: profile.starting_weight || undefined,
          goal_weight: profile.goal_weight || undefined,
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: ProfileInput) => {
    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          birthdate: data.birthdate,
          height_feet: data.height_feet,
          height_inches: data.height_inches,
          starting_weight: data.starting_weight,
          goal_weight: data.goal_weight,
          profile_complete: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
      })
      
      // Reload profile
      await loadProfile()
    } catch (error) {
      console.error('Error saving:', error)
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthdate">Birthdate</Label>
                <Input
                  id="birthdate"
                  type="date"
                  {...register('birthdate')}
                />
                {errors.birthdate && (
                  <p className="text-sm text-red-600">{errors.birthdate.message}</p>
                )}
                {profile?.birthdate && (
                  <p className="text-sm text-muted-foreground">
                    Age: {calculateAge(profile.birthdate)} years
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Height</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      min="3"
                      max="8"
                      placeholder="Feet"
                      {...register('height_feet', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="number"
                      min="0"
                      max="11"
                      placeholder="Inches"
                      {...register('height_inches', { valueAsNumber: true })}
                    />
                  </div>
                </div>
                {(errors.height_feet || errors.height_inches) && (
                  <p className="text-sm text-red-600">Please enter a valid height</p>
                )}
              </div>

              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="starting_weight">Starting Weight</Label>
                  <Input
                    id="starting_weight"
                    type="number"
                    step="0.1"
                    min="50"
                    max="500"
                    placeholder="lbs"
                    {...register('starting_weight', { valueAsNumber: true })}
                  />
                  {errors.starting_weight && (
                    <p className="text-sm text-red-600">{errors.starting_weight.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal_weight">Goal Weight</Label>
                  <Input
                    id="goal_weight"
                    type="number"
                    step="0.1"
                    min="50"
                    max="500"
                    placeholder="lbs"
                    {...register('goal_weight', { valueAsNumber: true })}
                  />
                  {errors.goal_weight && (
                    <p className="text-sm text-red-600">{errors.goal_weight.message}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Program Information</CardTitle>
            <CardDescription>Your Nine Week Challenge details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {profile ? formatDate(profile.program_start_date) : '-'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Current Week</Label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-brand-primary">Week {currentWeek}</span>
                  <span className="text-sm text-muted-foreground">of 9</span>
                </div>
              </div>
            </div>

            {!profile?.profile_complete && (
              <div className="bg-brand-warning/10 border border-brand-warning rounded-lg p-4 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-brand-warning mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Complete Your Profile</p>
                  <p className="text-muted-foreground">
                    Please fill in all your information to get the most out of your Nine Week Challenge experience.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
          
          <Button type="submit" variant="brand" size="lg" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}