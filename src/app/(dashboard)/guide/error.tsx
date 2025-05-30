'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      <h2 className="text-xl font-semibold mb-2">Something went wrong!</h2>
      <p className="text-muted-foreground mb-4">We couldn&apos;t load the guide page.</p>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  )
}