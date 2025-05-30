'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Camera, Upload, Loader2, Calendar, Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Database } from '@/types/database'
import { getCurrentWeek, formatDate, formatDateShort } from '@/lib/utils'
import Image from 'next/image'

interface Photo {
  id: string
  user_id: string
  date: string
  photo_url: string
  photo_type: 'front' | 'side' | 'back' | 'progress' | 'other'
  week_number: number
  notes?: string
  created_at: string
}

export default function PhotosPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [currentWeek, setCurrentWeek] = useState(1)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [photos, setPhotos] = useState<Photo[]>([])
  const [todayPhotos, setTodayPhotos] = useState<Photo[]>([])
  const [selectedPhotoType, setSelectedPhotoType] = useState<Photo['photo_type']>('front')
  const [viewMode, setViewMode] = useState<'upload' | 'timeline'>('upload')
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  useEffect(() => {
    loadPhotos()
  }, [selectedDate])

  const loadPhotos = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Get user profile for current week
      const { data: profile } = await supabase
        .from('profiles')
        .select('program_start_date')
        .eq('id', user.id)
        .single()

      if (profile) {
        const week = getCurrentWeek(profile.program_start_date)
        setCurrentWeek(week)
      }

      // Get all photos
      const { data: allPhotos, error } = await supabase
        .from('photos')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error

      if (allPhotos) {
        setPhotos(allPhotos)
        
        // Filter today's photos
        const today = selectedDate.toISOString().split('T')[0]
        const todayPhotos = allPhotos.filter(p => p.date === today)
        setTodayPhotos(todayPhotos)
      }
    } catch (error) {
      console.error('Error loading photos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check if user already has 5 photos today
    if (todayPhotos.length >= 5) {
      toast({
        title: 'Photo limit reached',
        description: 'You can upload a maximum of 5 photos per day.',
        variant: 'destructive',
      })
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file.',
        variant: 'destructive',
      })
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB.',
        variant: 'destructive',
      })
      return
    }

    setIsUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName)

      // Save photo record to database
      const { error: dbError } = await supabase
        .from('photos')
        .insert({
          user_id: user.id,
          date: selectedDate.toISOString().split('T')[0],
          photo_url: publicUrl,
          photo_type: selectedPhotoType,
          week_number: currentWeek,
        })

      if (dbError) throw dbError

      toast({
        title: 'Photo uploaded',
        description: 'Your progress photo has been saved.',
      })

      // Reload photos
      await loadPhotos()
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
      toast({
        title: 'Upload failed',
        description: 'Failed to upload photo. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const deletePhoto = async (photo: Photo) => {
    try {
      // Delete from storage
      const fileName = photo.photo_url.split('/').pop()
      if (fileName) {
        await supabase.storage
          .from('photos')
          .remove([`${photo.user_id}/${fileName}`])
      }

      // Delete from database
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photo.id)

      if (error) throw error

      toast({
        title: 'Photo deleted',
        description: 'Your photo has been removed.',
      })

      // Reload photos
      await loadPhotos()
      setSelectedPhoto(null)
    } catch (error) {
      console.error('Error deleting photo:', error)
      toast({
        title: 'Delete failed',
        description: 'Failed to delete photo. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const photoTypes: { value: Photo['photo_type']; label: string }[] = [
    { value: 'front', label: 'Front View' },
    { value: 'side', label: 'Side View' },
    { value: 'back', label: 'Back View' },
    { value: 'progress', label: 'Progress' },
    { value: 'other', label: 'Other' },
  ]

  const groupPhotosByWeek = () => {
    const grouped: Record<number, Photo[]> = {}
    photos.forEach(photo => {
      if (!grouped[photo.week_number]) {
        grouped[photo.week_number] = []
      }
      grouped[photo.week_number].push(photo)
    })
    return grouped
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
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Progress Photos</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Track your visual transformation • Week {currentWeek}
        </p>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 animate-fade-in-delay">
        <Button
          variant={viewMode === 'upload' ? 'brand' : 'outline'}
          onClick={() => setViewMode('upload')}
          className="flex-1 sm:flex-none"
        >
          <Camera className="h-4 w-4 mr-2" />
          Upload
        </Button>
        <Button
          variant={viewMode === 'timeline' ? 'brand' : 'outline'}
          onClick={() => setViewMode('timeline')}
          className="flex-1 sm:flex-none"
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Timeline
        </Button>
      </div>

      {viewMode === 'upload' ? (
        <>
          {/* Upload Section */}
          <Card className="animate-fade-in-delay-2">
            <CardHeader>
              <CardTitle>Upload Today&apos;s Photos</CardTitle>
              <CardDescription>
                {formatDateShort(selectedDate)} • {todayPhotos.length}/5 photos uploaded
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Photo Type Selection */}
              <div>
                <Label className="text-sm font-medium mb-2">Photo Type</Label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {photoTypes.map(type => (
                    <Button
                      key={type.value}
                      variant={selectedPhotoType === type.value ? 'brand' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPhotoType(type.value)}
                      className="w-full"
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Upload Button */}
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-brand-pink transition-colors">
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  {todayPhotos.length >= 5 
                    ? 'Daily photo limit reached'
                    : 'Click to upload a photo'
                  }
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading || todayPhotos.length >= 5}
                />
                <Button
                  variant="brand"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || todayPhotos.length >= 5}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Choose Photo
                    </>
                  )}
                </Button>
              </div>

              {/* Today's Photos */}
              {todayPhotos.length > 0 && (
                <div>
                  <h3 className="font-medium text-sm mb-3">Today&apos;s Photos</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {todayPhotos.map(photo => (
                      <div
                        key={photo.id}
                        className="relative group cursor-pointer"
                        onClick={() => setSelectedPhoto(photo)}
                      >
                        <div className="aspect-square relative overflow-hidden rounded-lg">
                          <Image
                            src={photo.photo_url}
                            alt={`${photo.photo_type} view`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <p className="text-white text-xs font-medium">
                            {photoTypes.find(t => t.value === photo.photo_type)?.label}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Timeline View */}
          <div className="space-y-6 animate-fade-in-delay-2">
            {Object.entries(groupPhotosByWeek())
              .sort(([a], [b]) => Number(b) - Number(a))
              .map(([week, weekPhotos]) => (
                <Card key={week}>
                  <CardHeader>
                    <CardTitle className="text-lg">Week {week}</CardTitle>
                    <CardDescription>{weekPhotos.length} photos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-2">
                      {weekPhotos.map(photo => (
                        <div
                          key={photo.id}
                          className="relative group cursor-pointer"
                          onClick={() => setSelectedPhoto(photo)}
                        >
                          <div className="aspect-square relative overflow-hidden rounded-lg">
                            <Image
                              src={photo.photo_url}
                              alt={`Week ${week} progress`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1 rounded-b-lg">
                            <p className="text-white text-xs truncate">
                              {formatDateShort(new Date(photo.date))}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            
            {photos.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">No photos yet. Start documenting your journey!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Photo Viewer Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
              onClick={() => setSelectedPhoto(null)}
            >
              <X className="h-6 w-6" />
            </Button>
            
            <div className="relative">
              <Image
                src={selectedPhoto.photo_url}
                alt="Progress photo"
                width={1200}
                height={1200}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
                <div className="flex items-center justify-between text-white">
                  <div>
                    <p className="font-medium">
                      {photoTypes.find(t => t.value === selectedPhoto.photo_type)?.label}
                    </p>
                    <p className="text-sm opacity-80">
                      {formatDate(selectedPhoto.date)} • Week {selectedPhoto.week_number}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deletePhoto(selectedPhoto)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}