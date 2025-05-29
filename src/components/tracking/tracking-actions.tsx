import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Trash2, AlertTriangle, RotateCcw } from 'lucide-react'
import type { Database } from '@/types/database'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface TrackingActionsProps {
  trackingId: string | null
  selectedDate: Date
  onDeleted: () => void
  onProgramRestart: () => void
  showRestartOption?: boolean
}

export function TrackingActions({
  trackingId,
  selectedDate,
  onDeleted,
  onProgramRestart,
  showRestartOption = false
}: TrackingActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showRestartDialog, setShowRestartDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRestarting, setIsRestarting] = useState(false)
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()

  const handleDeleteTracking = async () => {
    if (!trackingId) return

    setIsDeleting(true)
    try {
      // Delete related meals and treats first
      await supabase
        .from('meals')
        .delete()
        .eq('daily_tracking_id', trackingId)

      await supabase
        .from('treats')
        .delete()
        .eq('daily_tracking_id', trackingId)

      // Delete the tracking record
      const { error } = await supabase
        .from('daily_tracking')
        .delete()
        .eq('id', trackingId)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Tracking day deleted successfully',
      })

      onDeleted()
    } catch (error) {
      console.error('Error deleting tracking:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete tracking day',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleRestartProgram = async () => {
    setIsRestarting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Update program start date to today
      const { error } = await supabase
        .from('profiles')
        .update({
          program_start_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: 'Program Restarted',
        description: 'Your program has been reset to Week 1',
      })

      onProgramRestart()
    } catch (error) {
      console.error('Error restarting program:', error)
      toast({
        title: 'Error',
        description: 'Failed to restart program',
        variant: 'destructive',
      })
    } finally {
      setIsRestarting(false)
      setShowRestartDialog(false)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {trackingId && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Day
          </Button>
        )}
        
        {showRestartOption && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRestartDialog(true)}
            className="text-orange-600 border-orange-200 hover:bg-orange-50"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restart Program
          </Button>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Tracking Day
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all tracking data for {formatDate(selectedDate)}? 
              This will permanently remove:
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Sleep, water, and steps data</li>
                <li>All meal and snack tracking</li>
                <li>Treat tracking</li>
                <li>Daily reflection and notes</li>
              </ul>
              <strong className="block mt-2 text-red-600">This action cannot be undone.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTracking}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Day'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restart program confirmation dialog */}
      <AlertDialog open={showRestartDialog} onOpenChange={setShowRestartDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-orange-500" />
              Restart Program
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restart the 9-week program? This will:
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Reset your program to Week 1</li>
                <li>Set today as your new start date</li>
                <li>Keep all your existing tracking data</li>
                <li>Reset measurement schedules</li>
              </ul>
              <strong className="block mt-2 text-orange-600">
                Your previous tracking data will remain accessible.
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestartProgram}
              disabled={isRestarting}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isRestarting ? 'Restarting...' : 'Restart Program'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}