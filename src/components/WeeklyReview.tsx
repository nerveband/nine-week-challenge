import { useState, useEffect } from 'react';
import { databaseService } from '@/services/DatabaseService';
import type { Measurements, WeeklySummary } from '@/types';
import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Scale as ScaleIcon,
  MoveHorizontal as MoveHorizontalIcon,
  Pencil as PencilIcon,
  Check as CheckIcon,
  Trash as TrashIcon,
  Info as InfoIcon,
  Loader2 as Loader2Icon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DEFAULT_MEASUREMENTS: Omit<Measurements, 'id' | 'userId' | 'date'> = {
  weight: 0,
  chest: 0,
  waist: 0,
  hips: 0,
  rightArm: 0,
  leftArm: 0,
  rightThigh: 0,
  leftThigh: 0,
  rightCalf: 0,
  leftCalf: 0,
  notes: '',
};

const MEASUREMENT_GUIDANCE = {
  general: [
    "Always use a cloth measuring tape, not a metal one, as it's much more accurate.",
    "Do your measurements in the nude or limited clothing first thing in the morning to avoid clothes interference and post-meal bloating.",
    "Breathe normally and don't 'suck in' to get a better number as it won't be reflective of your true statistics.",
    "Measure in front of a mirror to ensure your tape is straight, especially important for hip measurements.",
    "Pull the tape so that it is snug but not too tight.",
    "Be consistent with your measuring technique.",
    "Measure 3 times and take the average. Consistency of placement is key."
  ],
  specific: {
    weight: "Weigh yourself first thing in the morning, after using the bathroom and before eating/drinking.",
    chest: "Measure at the bra line, keeping the tape parallel to the ground.",
    chest2: "Measure at the fullest part of breasts/nipple line.",
    waist: "Measure at the belly button level, keeping the tape parallel to the ground.",
    hips: "Measure at the biggest point around your buttocks.",
    rightArm: "Measure at the biggest part of your bicep, arm relaxed at your side.",
    leftArm: "Measure at the biggest part of your bicep, arm relaxed at your side.",
    rightThigh: "Measure at the fullest part of your thigh.",
    leftThigh: "Measure at the fullest part of your thigh.",
    rightCalf: "Measure at the fullest part of your calf muscle.",
    leftCalf: "Measure at the fullest part of your calf muscle."
  }
};

export function WeeklyReview() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [measurements, setMeasurements] = useState<Measurements | null>(null);
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [previousMeasurements, setPreviousMeasurements] = useState<Measurements | null>(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [profile, allMeasurements] = await Promise.all([
          databaseService.getUserProfile(),
          databaseService.getAllMeasurements()
        ]);
        setUserProfile(profile);

        // Get current measurements
        const currentMeasurements = allMeasurements[today] || {
          id: crypto.randomUUID(),
          userId: profile?.id || '',
          date: today,
          ...DEFAULT_MEASUREMENTS,
        };
        setMeasurements(currentMeasurements);

        // Get previous measurements
        const dates = Object.keys(allMeasurements)
          .filter(date => date < today)
          .sort()
          .reverse();
        if (dates.length > 0) {
          setPreviousMeasurements(allMeasurements[dates[0]]);
        }

        // Get weekly summary
        const weekNumber = profile?.currentWeek || 1;
        const weeklySummary = await databaseService.getWeeklySummary(weekNumber);
        setSummary(weeklySummary || {
          weekNumber,
          userId: profile?.id || '',
          startDate: today,
          endDate: today,
          measurements: currentMeasurements,
          habitCompliance: {},
          review: {
            wentWell: '',
            improvements: '',
            notes: '',
          },
          nextWeekGoals: {
            primary: '',
            actionSteps: '',
            challenges: '',
          },
          notes: '',
        });
      } catch (err) {
        console.error('Error loading weekly review data:', err);
        setError('Failed to load weekly review data. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [today]);

  const handleMeasurementChange = (field: keyof Measurements, value: number) => {
    if (!measurements) return;
    setMeasurements(prev => prev ? ({
      ...prev,
      [field]: value,
    }) : null);
  };

  const calculateChange = (current: number, previous: number | undefined) => {
    if (previous === undefined) return null;
    const change = current - previous;
    return change > 0 ? `+${change}` : `${change}`;
  };

  const handleSave = async () => {
    if (!measurements || !summary) return;
    try {
      await Promise.all([
        databaseService.setMeasurements(measurements),
        databaseService.setWeeklySummary({
          ...summary,
          measurements,
        }),
      ]);
      setSaveMessage('Weekly review saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error('Error saving weekly review:', err);
      setError('Failed to save weekly review. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!measurements || !summary) return;
    if (window.confirm('Are you sure you want to delete this weekly review?')) {
      try {
        await Promise.all([
          databaseService.deleteMeasurements(measurements.id),
          databaseService.deleteWeeklySummary(summary.weekNumber),
        ]);
        window.location.reload();
      } catch (err) {
        console.error('Error deleting weekly review:', err);
        setError('Failed to delete weekly review. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2Icon className="w-8 h-8 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
            <p className="text-muted-foreground">Loading your weekly review</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2 text-destructive">Error</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!measurements || !summary) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex items-center justify-center h-48">
              <p className="text-muted-foreground">No weekly review data found</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Weekly Review - Week {summary.weekNumber}</h1>
            <p className="text-muted-foreground mt-2">
              {new Date(summary.startDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric'
              })} - {new Date(summary.endDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <p className="text-muted-foreground">Review and track your weekly progress</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="gap-2">
              <CheckIcon className="w-4 h-4" />
              Save Review
            </Button>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Are you sure?</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="gap-2"
              >
                <TrashIcon className="w-4 h-4" />
                Delete Review
              </Button>
            )}
          </div>
        </div>

        {saveMessage && (
          <Alert className="mb-6">
            <CheckIcon className="w-4 h-4" />
            <AlertDescription>{saveMessage}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="measurements" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="measurements">Measurements</TabsTrigger>
            <TabsTrigger value="review">Progress Review</TabsTrigger>
            <TabsTrigger value="goals">Next Week Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="measurements">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Measurements</CardTitle>
                <CardDescription>Track your body measurements for the week</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6">
                  <InfoIcon className="w-4 h-4" />
                  <AlertDescription>
                    <h3 className="font-semibold mb-2">Measurement Guidelines</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {MEASUREMENT_GUIDANCE.general.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(DEFAULT_MEASUREMENTS).map(([field, _]) => {
                    if (field === 'notes') return null;
                    const value = measurements[field as keyof Measurements] as number;
                    const prevValue = previousMeasurements?.[field as keyof Measurements] as number | undefined;
                    const change = calculateChange(value, prevValue);

                    return (
                      <div key={field} className="space-y-2">
                        <Label htmlFor={field} className="flex items-center gap-2">
                          {field.charAt(0).toUpperCase() + field.slice(1)}
                          <div className="relative group">
                            <InfoIcon className="w-4 h-4 text-muted-foreground cursor-help" />
                            <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              {MEASUREMENT_GUIDANCE.specific[field as keyof typeof MEASUREMENT_GUIDANCE.specific]}
                            </div>
                          </div>
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id={field}
                            type="number"
                            value={value || ''}
                            onChange={(e) => handleMeasurementChange(field as keyof Measurements, Number(e.target.value))}
                            step="0.1"
                            min="0"
                            className="flex-1"
                          />
                          {change && (
                            <span className={cn(
                              "inline-flex items-center px-2 py-1 rounded-md text-sm",
                              change.startsWith('+') ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                            )}>
                              {change}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6">
                  <Label htmlFor="measurement-notes">Notes</Label>
                  <Textarea
                    id="measurement-notes"
                    value={measurements.notes}
                    onChange={(e) => setMeasurements(prev => prev ? ({
                      ...prev,
                      notes: e.target.value,
                    }) : null)}
                    placeholder="Any additional notes about your measurements..."
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="review">
            <Card>
              <CardHeader>
                <CardTitle>Progress Review</CardTitle>
                <CardDescription>Reflect on your progress this week</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="went-well">What went well?</Label>
                  <Textarea
                    id="went-well"
                    value={summary.review.wentWell}
                    onChange={(e) => setSummary(prev => prev ? ({
                      ...prev,
                      review: {
                        ...prev.review,
                        wentWell: e.target.value,
                      },
                    }) : null)}
                    placeholder="List your wins and successes for the week..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="improvements">What could be improved?</Label>
                  <Textarea
                    id="improvements"
                    value={summary.review.improvements}
                    onChange={(e) => setSummary(prev => prev ? ({
                      ...prev,
                      review: {
                        ...prev.review,
                        improvements: e.target.value,
                      },
                    }) : null)}
                    placeholder="Areas where you struggled or could do better..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="review-notes">Additional Notes</Label>
                  <Textarea
                    id="review-notes"
                    value={summary.review.notes}
                    onChange={(e) => setSummary(prev => prev ? ({
                      ...prev,
                      review: {
                        ...prev.review,
                        notes: e.target.value,
                      },
                    }) : null)}
                    placeholder="Any other thoughts or reflections..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals">
            <Card>
              <CardHeader>
                <CardTitle>Next Week Goals</CardTitle>
                <CardDescription>Set your intentions for the upcoming week</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="primary-goal">Primary Goal</Label>
                  <Textarea
                    id="primary-goal"
                    value={summary.nextWeekGoals.primary}
                    onChange={(e) => setSummary(prev => prev ? ({
                      ...prev,
                      nextWeekGoals: {
                        ...prev.nextWeekGoals,
                        primary: e.target.value,
                      },
                    }) : null)}
                    placeholder="What's your main focus for next week?"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="action-steps">Action Steps</Label>
                  <Textarea
                    id="action-steps"
                    value={summary.nextWeekGoals.actionSteps}
                    onChange={(e) => setSummary(prev => prev ? ({
                      ...prev,
                      nextWeekGoals: {
                        ...prev.nextWeekGoals,
                        actionSteps: e.target.value,
                      },
                    }) : null)}
                    placeholder="What specific actions will you take to achieve your goal?"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="challenges">Anticipated Challenges</Label>
                  <Textarea
                    id="challenges"
                    value={summary.nextWeekGoals.challenges}
                    onChange={(e) => setSummary(prev => prev ? ({
                      ...prev,
                      nextWeekGoals: {
                        ...prev.nextWeekGoals,
                        challenges: e.target.value,
                      },
                    }) : null)}
                    placeholder="What obstacles might you face and how will you overcome them?"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
} 