import React, { useState, useRef, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarIcon, Loader2, Ruler, Info, X } from 'lucide-react';
import { databaseService } from '@/services/DatabaseService';
import type { WeeklySummary, Measurements } from '@/types';

interface Measurement {
  values: number[];
  average: number;
  useAverage: boolean;
}

interface MeasurementPoint {
  x: number;
  y: number;
  label: string;
}

export function WeeklyTracking() {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [activePoint, setActivePoint] = useState<keyof typeof measurementPoints | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const [summary, setSummary] = useState<WeeklySummary>(() => ({
    weekNumber: 1,
    userId: 'default',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    measurements: {
      id: crypto.randomUUID(),
      userId: 'default',
      date: new Date().toISOString().split('T')[0],
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
    },
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
    notes: ''
  }));

  const [measurements, setMeasurements] = useState<Record<string, Measurement>>({
    chest: { values: [], average: 0, useAverage: true },
    waist: { values: [], average: 0, useAverage: true },
    hips: { values: [], average: 0, useAverage: true },
    rightArm: { values: [], average: 0, useAverage: true },
    leftArm: { values: [], average: 0, useAverage: true },
    rightThigh: { values: [], average: 0, useAverage: true },
    leftThigh: { values: [], average: 0, useAverage: true },
    rightCalf: { values: [], average: 0, useAverage: true },
    leftCalf: { values: [], average: 0, useAverage: true },
  });

  const measurementPoints: Record<string, MeasurementPoint> = {
    chest: { x: 600, y: 300, label: "Chest" },
    waist: { x: 600, y: 400, label: "Waist" },
    hips: { x: 600, y: 500, label: "Hips" },
    rightArm: { x: 400, y: 350, label: "Right Arm" },
    leftArm: { x: 800, y: 350, label: "Left Arm" },
    rightThigh: { x: 500, y: 700, label: "Right Thigh" },
    leftThigh: { x: 700, y: 700, label: "Left Thigh" },
    rightCalf: { x: 500, y: 900, label: "Right Calf" },
    leftCalf: { x: 700, y: 900, label: "Left Calf" }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && 
          !tooltipRef.current.contains(event.target as Node) && 
          !(event.target as Element).closest('circle')) {
        setActivePoint(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get current week's summary if it exists
        const existingSummary = await databaseService.getWeeklySummary(currentWeek);
        
        if (existingSummary) {
          // If we have an existing summary, use its data
          setSummary(existingSummary);
          
          // Update measurements state from the existing summary
          const measurementData: Record<string, Measurement> = {
            chest: { values: [existingSummary.measurements.chest], average: existingSummary.measurements.chest, useAverage: true },
            waist: { values: [existingSummary.measurements.waist], average: existingSummary.measurements.waist, useAverage: true },
            hips: { values: [existingSummary.measurements.hips], average: existingSummary.measurements.hips, useAverage: true },
            rightArm: { values: [existingSummary.measurements.rightArm], average: existingSummary.measurements.rightArm, useAverage: true },
            leftArm: { values: [existingSummary.measurements.leftArm], average: existingSummary.measurements.leftArm, useAverage: true },
            rightThigh: { values: [existingSummary.measurements.rightThigh], average: existingSummary.measurements.rightThigh, useAverage: true },
            leftThigh: { values: [existingSummary.measurements.leftThigh], average: existingSummary.measurements.leftThigh, useAverage: true },
            rightCalf: { values: [existingSummary.measurements.rightCalf], average: existingSummary.measurements.rightCalf, useAverage: true },
            leftCalf: { values: [existingSummary.measurements.leftCalf], average: existingSummary.measurements.leftCalf, useAverage: true },
          };
          setMeasurements(measurementData);
        } else {
          // If no existing summary, initialize with default values
          const userProfile = await databaseService.getUserProfile();
          if (!userProfile) {
            throw new Error('No user profile found');
          }

          // Get the latest measurements for reference
          const latestMeasurements = await databaseService.getLatestMeasurements();

          // Calculate week dates
          const today = new Date();
          const startDate = new Date(today);
          startDate.setDate(today.getDate() - today.getDay()); // Start of current week (Sunday)
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6); // End of week (Saturday)

          // Initialize new summary with latest measurements if available
          setSummary(prev => ({
            ...prev,
            userId: userProfile.id,
            weekNumber: currentWeek,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            measurements: {
              id: crypto.randomUUID(),
              userId: userProfile.id,
              date: startDate.toISOString().split('T')[0],
              weight: latestMeasurements?.weight || 0,
              chest: latestMeasurements?.chest || 0,
              waist: latestMeasurements?.waist || 0,
              hips: latestMeasurements?.hips || 0,
              rightArm: latestMeasurements?.rightArm || 0,
              leftArm: latestMeasurements?.leftArm || 0,
              rightThigh: latestMeasurements?.rightThigh || 0,
              leftThigh: latestMeasurements?.leftThigh || 0,
              rightCalf: latestMeasurements?.rightCalf || 0,
              leftCalf: latestMeasurements?.leftCalf || 0,
              notes: ''
            }
          }));
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentWeek]);

  const handlePointClick = (point: string, event: React.MouseEvent) => {
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;
    
    const x = event.clientX - svgRect.left;
    const y = event.clientY - svgRect.top;
    
    setTooltipPosition({ x, y });
    setActivePoint(point as keyof typeof measurementPoints);
  };

  const handleMeasurementChange = (point: string, index: number, value: string) => {
    const newValues = [...(measurements[point].values || [])];
    newValues[index] = Number(value);
    
    const validNums = newValues.filter(n => !isNaN(n));
    const average = validNums.length ? validNums.reduce((a, b) => a + b, 0) / validNums.length : 0;
    
    setMeasurements(prev => ({
      ...prev,
      [point]: {
        ...prev[point],
        values: newValues,
        average: Number(average.toFixed(1))
      }
    }));

    // Update summary measurements
    setSummary(prev => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [point]: measurements[point].useAverage ? average : Number(value)
      }
    }));
  };

  const toggleAveraging = (point: string) => {
    setMeasurements(prev => ({
      ...prev,
      [point]: {
        ...prev[point],
        useAverage: !prev[point].useAverage
      }
    }));
  };

  const isPointComplete = (point: string) => {
    const measurement = measurements[point];
    if (measurement.useAverage) {
      return measurement.values.filter(v => !isNaN(v)).length === 3;
    }
    return !isNaN(measurement.values[0]) && measurement.values[0] > 0;
  };

  const getMeasurementDisplay = (point: string) => {
    const measurement = measurements[point];
    if (measurement.useAverage) {
      return measurement.average > 0 ? `${measurement.average}cm` : '';
    }
    return measurement.values[0] ? `${measurement.values[0]}cm` : '';
  };

  const handleSave = async () => {
    if (!summary) return;
    try {
      setIsSaving(true);
      setError(null);

      // Save measurements first
      const measurementsData: Measurements = {
        id: summary.measurements.id,
        userId: summary.userId,
        date: summary.startDate,
        weight: summary.measurements.weight,
        chest: summary.measurements.chest,
        waist: summary.measurements.waist,
        hips: summary.measurements.hips,
        rightArm: summary.measurements.rightArm,
        leftArm: summary.measurements.leftArm,
        rightThigh: summary.measurements.rightThigh,
        leftThigh: summary.measurements.leftThigh,
        rightCalf: summary.measurements.rightCalf,
        leftCalf: summary.measurements.leftCalf,
        notes: summary.measurements.notes || ''
      };

      // Create or update measurements
      const savedMeasurements = await databaseService.createMeasurements(measurementsData);
      
      if (!savedMeasurements) {
        throw new Error('Failed to save measurements');
      }

      // Create weekly summary with the saved measurements
      const weeklySummaryData: Omit<WeeklySummary, 'id'> = {
        weekNumber: summary.weekNumber,
        userId: summary.userId,
        startDate: summary.startDate,
        endDate: summary.endDate,
        measurements: savedMeasurements,
        habitCompliance: summary.habitCompliance,
        review: summary.review,
        nextWeekGoals: summary.nextWeekGoals,
        notes: summary.notes
      };

      // Save weekly summary
      const savedSummary = await databaseService.createWeeklySummary(weeklySummaryData);
      
      if (!savedSummary) {
        throw new Error('Failed to save weekly summary');
      }

      setMessage('Changes saved successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error saving data:', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
            <p className="text-muted-foreground">Retrieving your weekly data</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Main Content - Measurement Guide */}
          <div className="flex-1">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Weekly Measurements - Week {currentWeek}</CardTitle>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="relative w-full">
                  <svg ref={svgRef} viewBox="0 0 1200 1200" className="w-full">
                    {/* Body outline */}
                    <path
                      d="m1106.2 225h-93.75c-4.9883 0-9.75 1.9883-13.258 5.4922l-11.758 11.758c-26.344-4.7422-100.61-16.801-176.89-17.23-11.867-5.6836-41.379-18.77-60.598-18.77h-53.211l-40.539-13.52v-16.219l13.258-13.258c3.5234-3.5234 5.4922-8.2656 5.4922-13.254v-75c0-41.363-33.637-75-75-75s-75 33.637-75 75v75c0 4.9883 1.9688 9.7305 5.4922 13.258l13.258 13.254v16.219l-40.539 13.52h-53.211c-19.199 0-48.73 13.086-60.602 18.77-76.258 0.42969-150.52 12.488-176.89 17.23l-11.758-11.758c-3.5039-3.5039-8.2656-5.4922-13.254-5.4922h-93.75c-10.367 0-18.75 8.3828-18.75 18.75v56.25c0 4.9883 1.9688 9.75 5.4922 13.258l18.75 18.75c3.5273 3.5234 8.2891 5.4922 13.258 5.4922h356.93c2.5703 33.863 11.773 53.102 18.074 62.586v87.414c0 15.148-8.8516 37.258-17.418 58.668-9.8633 24.676-20.082 50.23-20.082 72.582v112.5c0 19.18 13.07 48.695 18.75 60.562v51.938c0 16.895-4.5742 39.789-9.0195 61.949-4.7812 23.945-9.7305 48.695-9.7305 69.301l0.074219 130.48c-0.67578 2.5117-6.1328 9.0742-9.7305 13.445-11.738 14.191-27.844 33.598-27.844 62.324 0 10.367 8.3828 18.75 18.75 18.75h112.5c10.367 0 18.75-8.3828 18.75-18.75v-56.25c0-35.945 4.4258-62.531 9.1133-90.676 4.7617-28.406 9.6367-57.77 9.6367-96.824l-0.09375-110.62 17.062-170.62h3.5625l16.969 168.75v112.5c0 39.055 4.8945 68.418 9.6367 96.824 4.6875 28.145 9.1133 54.73 9.1133 90.676v56.25c0 10.367 8.3828 18.75 18.75 18.75h112.5c0.14844 0 0.30078 0.019531 0.35547 0 10.367 0 18.75-8.3828 18.75-18.75 0-1.4805-0.16797-2.9258-0.48828-4.293-1.5-26.383-16.555-44.57-27.711-58.031-3.6016-4.3711-9.0547-10.934-9.6562-12.676v-131.25c0-20.605-4.9492-45.355-9.75-69.301-4.4258-22.16-9-45.055-9-61.949v-51.938c5.6797-11.887 18.75-41.383 18.75-60.562v-112.5c0-22.352-10.219-47.906-20.082-72.582-8.5664-21.41-17.418-43.52-17.418-58.668v-87.414c6.3008-9.4883 15.508-28.727 18.074-62.586h356.93c4.9883 0 9.7305-1.9688 13.258-5.4922l18.75-18.75c3.5234-3.5078 5.4922-8.2695 5.4922-13.258v-56.25c0-10.367-8.3828-18.75-18.75-18.75z"
                      fill="none"
                      stroke="#666"
                      strokeWidth="2"
                    />

                    {/* Measurement points */}
                    {Object.entries(measurementPoints).map(([key, point]) => (
                      <g key={key} onClick={(e) => handlePointClick(key, e)} className="cursor-pointer">
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r="15"
                          fill={activePoint === key ? "#2563eb" : 
                                isPointComplete(key) ? "#22c55e" : "#94a3b8"}
                          className="transition-colors duration-200"
                        />
                        <text
                          x={point.x + 20}
                          y={point.y + 5}
                          className="text-sm fill-gray-600"
                        >
                          {getMeasurementDisplay(key)}
                        </text>
                      </g>
                    ))}
                  </svg>

                  {/* Floating input panel */}
                  {activePoint && (
                    <div 
                      ref={tooltipRef}
                      className="absolute bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-72"
                      style={{
                        left: `${tooltipPosition.x}px`,
                        top: `${tooltipPosition.y}px`,
                        transform: 'translate(-50%, -120%)'
                      }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-medium">
                          {measurementPoints[activePoint]?.label}
                        </h3>
                        <button 
                          onClick={() => setActivePoint(null)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={measurements[activePoint].useAverage}
                            onChange={() => toggleAveraging(activePoint)}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">Use average of 3 measurements</span>
                        </label>

                        {measurements[activePoint].useAverage ? (
                          <div className="grid grid-cols-3 gap-2">
                            {[0, 1, 2].map((index) => (
                              <input
                                key={index}
                                type="number"
                                placeholder={`#${index + 1}`}
                                value={measurements[activePoint].values[index] || ''}
                                onChange={(e) => handleMeasurementChange(activePoint, index, e.target.value)}
                                className="w-full p-2 border rounded text-sm"
                              />
                            ))}
                          </div>
                        ) : (
                          <input
                            type="number"
                            placeholder="Enter measurement"
                            value={measurements[activePoint].values[0] || ''}
                            onChange={(e) => handleMeasurementChange(activePoint, 0, e.target.value)}
                            className="w-full p-2 border rounded"
                          />
                        )}

                        {measurements[activePoint].useAverage && measurements[activePoint].average > 0 && (
                          <div className="text-sm text-gray-500">
                            Average: {measurements[activePoint].average}cm
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Alert className="mt-6">
                  <Info className="w-4 h-4" />
                  <AlertDescription>
                    <ul className="space-y-2 mt-2">
                      <li>• Click on any point to enter measurements</li>
                      <li>• Choose between single or average of 3 measurements</li>
                      <li>• Measure in the morning before eating</li>
                      <li>• Keep the measuring tape snug but not tight</li>
                      <li>• Use a mirror to ensure proper alignment</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Weekly Review and Goals */}
          <div className="w-96 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>What went well?</Label>
                  <Textarea
                    value={summary.review.wentWell}
                    onChange={(e) => setSummary(prev => ({
                      ...prev,
                      review: { ...prev.review, wentWell: e.target.value }
                    }))}
                    placeholder="Enter your wins and achievements"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Areas for improvement</Label>
                  <Textarea
                    value={summary.review.improvements}
                    onChange={(e) => setSummary(prev => ({
                      ...prev,
                      review: { ...prev.review, improvements: e.target.value }
                    }))}
                    placeholder="What could be better?"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={summary.review.notes}
                    onChange={(e) => setSummary(prev => ({
                      ...prev,
                      review: { ...prev.review, notes: e.target.value }
                    }))}
                    placeholder="Additional observations"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Week Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Primary Goal</Label>
                  <Textarea
                    value={summary.nextWeekGoals.primary}
                    onChange={(e) => setSummary(prev => ({
                      ...prev,
                      nextWeekGoals: { ...prev.nextWeekGoals, primary: e.target.value }
                    }))}
                    placeholder="What's your main focus?"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Action Steps</Label>
                  <Textarea
                    value={summary.nextWeekGoals.actionSteps}
                    onChange={(e) => setSummary(prev => ({
                      ...prev,
                      nextWeekGoals: { ...prev.nextWeekGoals, actionSteps: e.target.value }
                    }))}
                    placeholder="How will you achieve it?"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Potential Challenges</Label>
                  <Textarea
                    value={summary.nextWeekGoals.challenges}
                    onChange={(e) => setSummary(prev => ({
                      ...prev,
                      nextWeekGoals: { ...prev.nextWeekGoals, challenges: e.target.value }
                    }))}
                    placeholder="What obstacles might you face?"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
} 