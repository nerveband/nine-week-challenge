import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { databaseService } from '@/services/DatabaseService';
import { exportToCSV } from '@/utils/exportData';
import { downloadCSV } from '@/utils/exportUtils';
import type { MealEntry, DailyTracking, Measurements, WeeklySummary } from '@/types';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  LayoutGrid,
  BarChart2,
  Table as TableIcon,
  RotateCcw,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Moon,
  Droplet,
  Footprints,
  Cookie
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export function History() {
  const navigate = useNavigate();
  const [view, setView] = useState<'calendar' | 'table' | 'charts'>('table');
  const [dailyHistory, setDailyHistory] = useState<Record<string, DailyTracking>>({});
  const [measurements, setMeasurements] = useState<Record<string, Measurements>>({});
  const [weeklySummaries, setWeeklySummaries] = useState<Record<number, WeeklySummary>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDaily, setExpandedDaily] = useState<string | null>(null);
  const [expandedWeekly, setExpandedWeekly] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dailyData, measurementsData, summariesData] = await Promise.all([
        databaseService.getDailyTrackingHistory(),
        databaseService.getAllMeasurements(),
        databaseService.getAllWeeklySummaries()
      ]);

      setDailyHistory(dailyData);
      setMeasurements(measurementsData);
      setWeeklySummaries(summariesData);
    } catch (err) {
      console.error('Error loading history:', err);
      setError('Failed to load history data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const trackingDates = Object.keys(dailyHistory)
    .sort((a, b) => b.localeCompare(a));

  const weeks = Object.keys(weeklySummaries)
    .map(Number)
    .sort((a, b) => b - a);

  const selectedDailyRecord = trackingDates.length > 0 ? dailyHistory[trackingDates[0]] : null;
  const selectedSummary = weeks.length > 0 ? weeklySummaries[weeks[0]] : null;

  const handleDeleteDaily = async (date: string) => {
    if (window.confirm('Are you sure you want to delete this daily record?')) {
      try {
        setLoading(true);
        await databaseService.deleteByDate(date);
        await loadHistory();
      } catch (err) {
        console.error('Error deleting daily record:', err);
        setError('Failed to delete record. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteWeekly = async (week: number) => {
    if (window.confirm('Are you sure you want to delete this weekly record?')) {
      try {
        setLoading(true);
        // Delete the weekly summary
        await databaseService.deleteWeeklySummary(week);
        await loadHistory();
      } catch (err) {
        console.error('Error deleting weekly record:', err);
        setError('Failed to delete record. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditDaily = async (date: string) => {
    try {
      const userProfile = await databaseService.getUserProfile();
      if (userProfile) {
        const today = new Date().toISOString().split('T')[0];
        if (date !== today) {
          // Temporarily set today's record to the selected date's record
          const record = dailyHistory[date];
          await databaseService.setDailyTracking({ ...record, date: today });
        }
        navigate('/daily');
      }
    } catch (err) {
      console.error('Error editing daily record:', err);
      setError('Failed to edit record. Please try again.');
    }
  };

  const handleEditWeekly = async (week: number) => {
    try {
      const userProfile = await databaseService.getUserProfile();
      if (userProfile) {
        const currentWeek = userProfile.currentWeek;
        if (week !== currentWeek) {
          // Update user's current week temporarily
          await databaseService.setUserProfile({
            ...userProfile,
            currentWeek: week
          });
        }
        navigate('/weekly');
      }
    } catch (err) {
      console.error('Error editing weekly record:', err);
      setError('Failed to edit record. Please try again.');
    }
  };

  const renderMealEntry = (meal: MealEntry, name: string) => (
    <div className="meal-entry">
      <h4>{name}</h4>
      <p>Time: {meal.time}</p>
      <p>Hunger Level: {meal.hungerLevel}</p>
      <p>Fullness Level: {meal.fullnessLevel}</p>
      <p>Mindfulness Score: {meal.mindfulnessScore}</p>
      <p>Notes: {meal.notes}</p>
    </div>
  );

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Add empty days for padding
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    // Add actual days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(year, month, i);
      const dateString = currentDate.toISOString().split('T')[0];
      const isToday = dateString === new Date().toISOString().split('T')[0];
      days.push({
        date: currentDate,
        tracking: dailyHistory[dateString],
        isToday
      });
    }
    
    return days;
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const prepareChartData = () => {
    const dailyData = Object.entries(dailyHistory)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, tracking]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sleep: tracking.dailies.sleepHours,
        water: tracking.dailies.waterOz,
        steps: tracking.dailies.steps,
        treats: tracking.treats.count
      }));

    const weeklyData = Object.entries(weeklySummaries)
      .sort(([weekA], [weekB]) => Number(weekA) - Number(weekB))
      .map(([week, summary]) => ({
        week: `Week ${week}`,
        weight: summary.measurements.weight,
        chest: summary.measurements.chest,
        waist: summary.measurements.waist,
        hips: summary.measurements.hips
      }));

    return { dailyData, weeklyData };
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
            <p className="text-muted-foreground">Retrieving your history</p>
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
            <button
              onClick={() => loadHistory()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">History</h1>
            <p className="text-muted-foreground mt-2">View and analyze your progress</p>
          </div>
          <Button 
            variant="outline"
            onClick={loadHistory}
            className="w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="table" className="w-full">
          <TabsList className="w-full grid grid-cols-2 sm:grid-cols-3 mb-4">
            <TabsTrigger value="table" className="flex items-center gap-2">
              <TableIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
              <span className="sm:hidden">List</span>
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4" />
              <span className="hidden sm:inline">Charts</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="hidden sm:flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="space-y-6">
            {/* Daily Records */}
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Daily Records</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Track your daily progress</p>
                </div>
                <Button variant="outline" onClick={() => downloadCSV('daily')}>
                  Export Data
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(dailyHistory)
                    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
                    .map(([date, tracking]) => (
                      <Card key={date} id={`daily-${date}`}>
                        <CardHeader className="pb-3">
                          <div className="flex flex-col sm:flex-row justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-semibold">
                                {new Date(date).toLocaleDateString('en-US', { 
                                  weekday: 'long',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </h3>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditDaily(date)}
                                className="h-8"
                              >
                                <Pencil className="h-3 w-3 mr-2" />
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteDaily(date)}
                                className="h-8"
                              >
                                <Trash2 className="h-3 w-3 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-primary/5 p-3 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Moon className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">Sleep</span>
                              </div>
                              <p className="text-2xl font-bold mt-1">{tracking.dailies.sleepHours}h</p>
                            </div>
                            <div className="bg-primary/5 p-3 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Droplet className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">Water</span>
                              </div>
                              <p className="text-2xl font-bold mt-1">{tracking.dailies.waterOz}oz</p>
                            </div>
                            <div className="bg-primary/5 p-3 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Footprints className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">Steps</span>
                              </div>
                              <p className="text-2xl font-bold mt-1">{tracking.dailies.steps.toLocaleString()}</p>
                            </div>
                            <div className="bg-primary/5 p-3 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Cookie className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">Treats</span>
                              </div>
                              <p className="text-2xl font-bold mt-1">{tracking.treats.count}</p>
                            </div>
                          </div>

                          <div className="mt-6">
                            <h4 className="font-medium mb-3">Habits</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {Object.entries(tracking.habits).map(([habit, completed]) => (
                                <div
                                  key={habit}
                                  className={cn(
                                    "flex items-center gap-2 p-2 rounded-lg text-sm",
                                    completed ? "bg-green-500/10" : "bg-red-500/10"
                                  )}
                                >
                                  {completed ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <X className="w-4 h-4 text-red-500" />
                                  )}
                                  <span>{habit.replace(/([A-Z])/g, ' $1').trim()}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {tracking.dailyWin && (
                            <div className="mt-6">
                              <h4 className="font-medium mb-2">Daily Win</h4>
                              <div className="bg-green-500/10 p-3 rounded-lg">
                                <p className="text-sm">{tracking.dailyWin}</p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Summaries */}
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Weekly Summaries</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Track your weekly progress</p>
                </div>
                <Button variant="outline" onClick={() => downloadCSV('weekly')}>
                  Export Data
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(weeklySummaries)
                    .sort(([weekA], [weekB]) => Number(weekB) - Number(weekA))
                    .map(([week, summary]) => (
                      <Card key={week}>
                        <CardHeader className="pb-3">
                          <div className="flex flex-col sm:flex-row justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-semibold">Week {week}</h3>
                              <p className="text-sm text-muted-foreground">
                                {new Date(summary.startDate).toLocaleDateString()} - {new Date(summary.endDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditWeekly(Number(week))}
                                className="h-8"
                              >
                                <Pencil className="h-3 w-3 mr-2" />
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteWeekly(Number(week))}
                                className="h-8"
                              >
                                <Trash2 className="h-3 w-3 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {Object.entries(summary.measurements).map(([field, value]) => {
                              if (field === 'id' || field === 'userId' || field === 'date') return null;
                              return (
                                <div key={field} className="bg-primary/5 p-3 rounded-lg">
                                  <span className="text-sm font-medium">
                                    {field.charAt(0).toUpperCase() + field.slice(1)}
                                  </span>
                                  <p className="text-2xl font-bold mt-1">
                                    {typeof value === 'number' ? value.toString() : 'N/A'}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Keep existing calendar and charts content, but calendar will be hidden on mobile */}
          <TabsContent value="calendar" className="hidden sm:block">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <CardTitle>Calendar View</CardTitle>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handlePreviousMonth}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <h3 className="text-base sm:text-lg font-semibold min-w-[140px] text-center">
                      {currentMonth.toLocaleDateString('en-US', { 
                        month: 'long',
                        year: 'numeric'
                      })}
                    </h3>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleNextMonth}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden text-sm sm:text-base">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center font-medium bg-background">
                      <span className="hidden sm:inline">{day}</span>
                      <span className="sm:hidden">{day.charAt(0)}</span>
                    </div>
                  ))}
                  {getDaysInMonth(currentMonth).map((day, index) => {
                    if (!day) {
                      return <div key={`empty-${index}`} className="bg-background p-2 min-h-[80px] sm:min-h-[120px]" />;
                    }
                    const tracking = day.tracking;
                    return (
                      <div
                        key={day.date.toISOString()}
                        className={cn(
                          "bg-background p-2 min-h-[80px] sm:min-h-[120px] hover:bg-muted/50 transition-colors relative",
                          tracking ? "cursor-pointer" : "",
                          day.isToday && "ring-2 ring-primary ring-inset"
                        )}
                        onClick={() => {
                          if (tracking) {
                            setView('table');
                            setExpandedDaily(day.date.toISOString().split('T')[0]);
                            setTimeout(() => {
                              const element = document.getElementById(`daily-${day.date.toISOString().split('T')[0]}`);
                              if (element) {
                                element.scrollIntoView({ behavior: 'smooth' });
                              }
                            }, 100);
                          }
                        }}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className={cn(
                            "inline-flex w-6 h-6 items-center justify-center rounded-full text-sm",
                            tracking ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                            day.isToday && "ring-2 ring-primary ring-offset-2"
                          )}>
                            {day.date.getDate()}
                          </span>
                          {tracking && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditDaily(day.date.toISOString().split('T')[0]);
                                }}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteDaily(day.date.toISOString().split('T')[0]);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                        {tracking && (
                          <div className="mt-1 space-y-0.5 text-xs">
                            <div className="flex items-center gap-1">
                              <Moon className="w-3 h-3" />
                              <span>{tracking.dailies.sleepHours}h</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Droplet className="w-3 h-3" />
                              <span>{tracking.dailies.waterOz}oz</span>
                            </div>
                            <div className="hidden sm:flex items-center gap-1">
                              <Footprints className="w-3 h-3" />
                              <span>{tracking.dailies.steps}</span>
                            </div>
                            <div className="hidden sm:flex items-center gap-1">
                              <Cookie className="w-3 h-3" />
                              <span>{tracking.treats.count}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Metrics</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={prepareChartData().dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="sleep"
                        stroke="#8884d8"
                        name="Sleep (hours)"
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="water"
                        stroke="#82ca9d"
                        name="Water (oz)"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="steps"
                        stroke="#ffc658"
                        name="Steps"
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="treats"
                        stroke="#ff7300"
                        name="Treats"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Weekly Measurements</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareChartData().weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="weight" fill="#8884d8" name="Weight" />
                      <Bar dataKey="chest" fill="#82ca9d" name="Chest" />
                      <Bar dataKey="waist" fill="#ffc658" name="Waist" />
                      <Bar dataKey="hips" fill="#ff7300" name="Hips" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Habit Compliance</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={Object.entries(weeklySummaries)
                      .sort(([weekA], [weekB]) => Number(weekA) - Number(weekB))
                      .map(([week, summary]) => ({
                        week: `Week ${week}`,
                        ...summary.habitCompliance
                      }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {Object.keys(Object.values(weeklySummaries)[0]?.habitCompliance || {}).map((habit, index) => (
                        <Bar
                          key={habit}
                          dataKey={habit}
                          fill={`hsl(${index * 45}, 70%, 50%)`}
                          name={habit.replace(/([A-Z])/g, ' $1').trim()}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
} 