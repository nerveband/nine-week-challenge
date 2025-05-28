import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function MeasurementsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Body Measurements</h1>
        <p className="text-muted-foreground">Track your physical progress</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>Body measurement tracking will be available here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You&apos;ll be able to track measurements for:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
            <li>Hip</li>
            <li>Waist</li>
            <li>Chest</li>
            <li>Chest 2 (under breast)</li>
            <li>Thigh</li>
            <li>Bicep</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}