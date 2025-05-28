import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function TrackingLoading() {
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex items-center justify-center mb-6">
        <Loader2 className="h-8 w-8 animate-spin text-brand-pink" />
      </div>

      <Card>
        <CardHeader>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Water Tracking Skeleton */}
          <div className="space-y-3">
            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 bg-gray-100 rounded animate-pulse" />
          </div>

          {/* Exercise Skeleton */}
          <div className="space-y-3">
            <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 bg-gray-100 rounded animate-pulse" />
          </div>

          {/* Sleep Skeleton */}
          <div className="space-y-3">
            <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 bg-gray-100 rounded animate-pulse" />
          </div>

          {/* Meal Tracking Skeleton */}
          <div className="space-y-3">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg space-y-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Save Button Skeleton */}
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
        </CardContent>
      </Card>
    </div>
  )
}