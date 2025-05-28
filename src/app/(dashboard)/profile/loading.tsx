import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function ProfileLoading() {
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex items-center justify-center mb-6">
        <Loader2 className="h-8 w-8 animate-spin text-brand-pink" />
      </div>

      <div className="space-y-6">
        {/* Profile Info Card Skeleton */}
        <Card>
          <CardHeader>
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 bg-gray-200 rounded-full animate-pulse" />
              <div className="space-y-2">
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Card Skeleton */}
        <Card>
          <CardHeader>
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
            <div className="pt-4 h-10 w-full bg-gray-200 rounded animate-pulse" />
          </CardContent>
        </Card>

        {/* Account Actions Card Skeleton */}
        <Card>
          <CardHeader>
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-10 w-full bg-gray-100 rounded animate-pulse" />
            <div className="h-10 w-full bg-gray-100 rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}