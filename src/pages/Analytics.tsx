import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart2, LineChart, PieChart } from 'lucide-react';

export function Analytics() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
              <p className="text-muted-foreground mt-2">Track your progress over time</p>
            </div>
            <div className="flex gap-4">
              <Select defaultValue="week">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Sleep</CardTitle>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7.5 hrs</div>
                <p className="text-xs text-muted-foreground">+4% from last period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Habit Completion</CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">86%</div>
                <p className="text-xs text-muted-foreground">+2.5% from last period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Treat Distribution</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15 treats</div>
                <p className="text-xs text-muted-foreground">-3 from last period</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="sleep" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="sleep">Sleep Patterns</TabsTrigger>
                  <TabsTrigger value="habits">Habit Tracking</TabsTrigger>
                  <TabsTrigger value="treats">Treat Analysis</TabsTrigger>
                </TabsList>
                <TabsContent value="sleep" className="space-y-4">
                  <div className="h-[300px] w-full rounded-xl border bg-muted/10 p-6">
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">Sleep chart will be displayed here</p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="habits" className="space-y-4">
                  <div className="h-[300px] w-full rounded-xl border bg-muted/10 p-6">
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">Habits chart will be displayed here</p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="treats" className="space-y-4">
                  <div className="h-[300px] w-full rounded-xl border bg-muted/10 p-6">
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">Treats chart will be displayed here</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-medium">Sleep Quality Improving</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your average sleep duration has increased by 30 minutes compared to last month.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="font-medium">Consistent Exercise Habit</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You've maintained a 90% exercise completion rate over the past month.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="font-medium">Reduced Sugar Intake</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Sweet treat consumption has decreased by 20% this month.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
} 