'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle>Something went wrong!</CardTitle>
          <CardDescription>
            We encountered an error while loading the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={reset} variant="brand">
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}