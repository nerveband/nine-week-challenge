import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { databaseService } from '@/services/DatabaseService';
import type { MealEntry, DailyTracking, Measurements, WeeklySummary } from '@/types';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, BarChart2, Table, RotateCw, Check, X, Download, Loader2 } from 'lucide-react';
import { downloadCSV } from '@/utils/exportUtils';

export function History() {
  const navigate = useNavigate();
  const [view, setView] = useState<'calendar' | 'table' | 'charts'>('calendar');
  const [dailyHistory, setDailyHistory] = useState<Record<string, DailyTracking>>({});
  const [measurements, setMeasurements] = useState<Record<string, Measurements>>({});
  const [weeklySummaries, setWeeklySummaries] = useState<Record<number, WeeklySummary>>({});
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const [dailyData, measurementsData, summariesData] = await Promise.all([
        databaseService.getDailyTrackingHistory(),
        databaseService.getAllMeasurements(),
        databaseService.getAllWeeklySummaries()
      ]);

      setDailyHistory(dailyData);
      setMeasurements(measurementsData);
      setWeeklySummaries(summariesData);
    } catch (error) {
      console.error('Error loading history:', error);
      setMessage({ type: 'error', text: 'Failed to load history data' });
    } finally {
      setLoading(false);
    }
  };

  const trackingDates = Object.keys(dailyHistory)
    .sort((a, b) => b.localeCompare(a));

  const weeks = Object.keys(weeklySummaries)
    .map(Number)
    .sort((a, b) => b - a);

  const handleDeleteDaily = async (date: string) => {
    if (window.confirm('Are you sure you want to delete this daily record?')) {
      try {
        await databaseService.deleteByDate(date);
        await loadHistory();
        setMessage({ type: 'success', text: 'Daily record deleted successfully' });
      } catch (error) {
        console.error('Error deleting daily record:', error);
        setMessage({ type: 'error', text: 'Failed to delete daily record' });
      }
    }
  };

  const handleDeleteWeekly = async (week: number) => {
    if (window.confirm('Are you sure you want to delete this weekly record?')) {
      try {
        await databaseService.deleteWeeklySummary(week);
        await loadHistory();
        setMessage({ type: 'success', text: 'Weekly record deleted successfully' });
      } catch (error) {
        console.error('Error deleting weekly record:', error);
        setMessage({ type: 'error', text: 'Failed to delete weekly record' });
      }
    }
  };

  const handleEditDaily = async (date: string) => {
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
  };

  const handleEditWeekly = async (week: number) => {
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
  };

  const handleExport = async (type: 'daily' | 'weekly' | 'measurements') => {
    try {
      setIsExporting(true);
      await downloadCSV(type);
      setMessage({ type: 'success', text: 'Data exported successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export data. Please try again.' });
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
            <p className="text-muted-foreground">Retrieving your history</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">History</h1>
          <div className="flex gap-4">
            <Button 
              onClick={() => handleExport('daily')}
              disabled={isExporting}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Export Daily Tracking
            </Button>
            <Button 
              onClick={() => handleExport('weekly')}
              disabled={isExporting}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Export Weekly Summaries
            </Button>
            <Button 
              onClick={() => handleExport('measurements')}
              disabled={isExporting}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Export Measurements
            </Button>
          </div>
        </div>

        {message && (
          <Alert variant={message.type === 'success' ? 'default' : 'destructive'} className="mb-6">
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">History</h1>
              <p className="text-muted-foreground mt-2">View and manage your tracking history</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={loadHistory}>
                <RotateCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          <Tabs defaultValue="calendar" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="calendar" onClick={() => setView('calendar')}>
                <CalendarDays className="h-4 w-4 mr-2" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="table" onClick={() => setView('table')}>
                <Table className="h-4 w-4 mr-2" />
                Table
              </TabsTrigger>
              <TabsTrigger value="charts" onClick={() => setView('charts')}>
                <BarChart2 className="h-4 w-4 mr-2" />
                Charts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Calendar View</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full rounded-xl border bg-muted/10 p-6">
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">Calendar view coming soon...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="table" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Table View</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full rounded-xl border bg-muted/10 p-6">
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">Table view coming soon...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="charts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Charts View</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full rounded-xl border bg-muted/10 p-6">
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">Charts view coming soon...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
} 