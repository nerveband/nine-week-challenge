import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Progress</h1>
        <p className="text-muted-foreground">Visualize your transformation</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>Progress charts and analytics will be available here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You'll be able to see:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
            <li>Body measurement trends</li>
            <li>Daily habit consistency</li>
            <li>Sleep patterns</li>
            <li>Water intake average</li>
            <li>Step count trends</li>
            <li>Weekly summaries</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}