import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FULLNESS_SCALE } from '@/types'

export function FullnessScaleReference() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Hunger/Fullness Scale Reference</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {FULLNESS_SCALE.map((level) => (
            <div key={level.value} className="flex items-start space-x-3">
              <span className="font-semibold text-brand-pink w-8">{level.value}</span>
              <span className="text-sm text-muted-foreground">{level.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}