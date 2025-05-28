import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function MeasurementsLoading() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center justify-center mb-6">
        <Loader2 className="h-8 w-8 animate-spin text-brand-pink" />
      </div>

      <div className="space-y-6">
        {/* Form Card Skeleton */}
        <Card>
          <CardHeader>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-10 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
            <div className="mt-6 h-10 w-full bg-gray-200 rounded animate-pulse" />
          </CardContent>
        </Card>

        {/* History Card Skeleton */}
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-3" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="space-y-1">
                        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}