import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { databaseService } from '@/services/DatabaseService';
import { BarChart2, LineChart, PieChart, Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { DailyTracking, Measurements, WeeklySummary } from '@/types';

interface AnalyticsData {
  dailyHistory: DailyTracking[];
  measurements: Measurements[];
  weeklySummaries: WeeklySummary[];
}

export function Analytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [dailyHistory, measurements, weeklySummaries] = await Promise.all([
          databaseService.getDailyTrackingHistory(),
          databaseService.getAllMeasurements(),
          databaseService.getAllWeeklySummaries()
        ]);
        setData({
          dailyHistory: Object.values(dailyHistory),
          measurements: Object.values(measurements),
          weeklySummaries: Object.values(weeklySummaries)
        });
      } catch (err) {
        console.error('Error loading analytics data:', err);
        setError('Failed to load analytics data. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
            <p className="text-muted-foreground">Analyzing your progress</p>
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
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const hasData = data && (
    data.dailyHistory.length > 0 ||
    data.measurements.length > 0 ||
    data.weeklySummaries.length > 0
  );

  if (!hasData) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground mt-2">Track your progress and insights over time</p>
          </div>
          <Card>
            <CardContent className="flex items-center justify-center h-48">
              <p className="text-muted-foreground">Start tracking to see your analytics here</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-2">Track your progress and insights over time</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <LineChart className="w-4 h-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="habits" className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4" />
              Habits
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>Your progress at a glance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Total Days Tracked</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold">{data?.dailyHistory.length || 0}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Weeks Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold">{data?.weeklySummaries.length || 0}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Measurements Recorded</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold">{data?.measurements.length || 0}</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Trends</CardTitle>
                <CardDescription>Track your progress over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Weight Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="h-48 flex items-center justify-center">
                      <p className="text-muted-foreground">Chart coming soon...</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Measurements Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="h-48 flex items-center justify-center">
                      <p className="text-muted-foreground">Chart coming soon...</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="habits">
            <Card>
              <CardHeader>
                <CardTitle>Habits</CardTitle>
                <CardDescription>Monitor your habit consistency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Daily Habits</CardTitle>
                    </CardHeader>
                    <CardContent className="h-48 flex items-center justify-center">
                      <p className="text-muted-foreground">Chart coming soon...</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Weekly Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="h-48 flex items-center justify-center">
                      <p className="text-muted-foreground">Chart coming soon...</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
} 