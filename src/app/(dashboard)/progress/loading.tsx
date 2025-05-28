import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function ProgressLoading() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-center mb-6">
        <Loader2 className="h-8 w-8 animate-spin text-brand-pink" />
      </div>

      {/* Tab Navigation Skeleton */}
      <div className="flex space-x-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Weight Progress Chart Skeleton */}
        <Card>
          <CardHeader>
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gray-100 rounded animate-pulse" />
          </CardContent>
        </Card>

        {/* Measurements Chart Skeleton */}
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gray-100 rounded animate-pulse" />
          </CardContent>
        </Card>

        {/* Habits Chart Skeleton */}
        <Card>
          <CardHeader>
            <div className="h-6 w-36 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gray-100 rounded animate-pulse" />
          </CardContent>
        </Card>

        {/* Summary Stats Skeleton */}
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}