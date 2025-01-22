import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Settings, Bell, Shield, LogOut, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { databaseService } from '@/services/DatabaseService';
import type { UserProfile as UserProfileType } from '@/types';
import { downloadCSV } from '@/utils/exportUtils';
import { Switch } from '@/components/ui/switch';
import { useTooltipPreference } from '@/hooks/useTooltipPreference';

interface ProfileFormData extends UserProfileType {
  goals: {
    sleepHours: number;
    waterOz: number;
    steps: number;
  };
}

export function Profile() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profile, setProfile] = useState<ProfileFormData | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { showTooltips, toggleTooltips } = useTooltipPreference();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const savedProfile = await databaseService.getUserProfile();
        const userGoals = await databaseService.getUserGoals();
        
        setProfile({
          id: savedProfile?.id || crypto.randomUUID(),
          name: savedProfile?.name || '',
          birthdate: savedProfile?.birthdate || '',
          age: savedProfile?.age || 0,
          height: savedProfile?.height || '',
          location: savedProfile?.location || '',
          whyStatement: savedProfile?.whyStatement || '',
          startDate: savedProfile?.startDate || new Date().toISOString().split('T')[0],
          currentPhase: savedProfile?.currentPhase || 1,
          currentWeek: savedProfile?.currentWeek || 1,
          goals: {
            sleepHours: userGoals.sleepHours,
            waterOz: userGoals.waterOz,
            steps: userGoals.steps,
          },
        });
      } catch (err) {
        console.error('Error loading profile:', err);
        setMessage({ type: 'error', text: 'Failed to load profile data' });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (field: keyof ProfileFormData, value: string | number) => {
    if (!profile) return;
    setProfile(prev => ({
      ...prev!,
      [field]: value,
    }));
  };

  const handleGoalChange = (field: keyof ProfileFormData['goals'], value: number) => {
    if (!profile) return;
    setProfile(prev => ({
      ...prev!,
      goals: {
        ...prev!.goals,
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setIsLoading(true);
      // Validate required fields
      if (!profile.name || !profile.birthdate) {
        throw new Error('Name and birthdate are required');
      }

      // Save profile and goals
      await Promise.all([
        databaseService.setUserProfile(profile),
        databaseService.setUserGoals(profile.goals)
      ]);

      setMessage({ type: 'success', text: 'Profile saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save profile' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(null), 3000);
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
    }
  };

  if (isLoading && !profile) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
            <p className="text-muted-foreground">Retrieving your profile</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2 text-destructive">Error</h2>
            <p className="text-muted-foreground">Failed to load profile data</p>
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

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
            <p className="text-muted-foreground mt-2">Manage your account preferences and goals</p>
          </div>

          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}`} />
                      <AvatarFallback>
                        <User className="h-10 w-10" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-medium">{profile.name || 'Your Name'}</h3>
                      <p className="text-sm text-muted-foreground">
                        Member since {new Date(profile.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="birthdate">Birthdate</Label>
                      <Input
                        id="birthdate"
                        type="date"
                        value={profile.birthdate}
                        onChange={(e) => handleChange('birthdate', e.target.value)}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="height">Height</Label>
                      <Input
                        id="height"
                        value={profile.height}
                        onChange={(e) => handleChange('height', e.target.value)}
                        placeholder="e.g., 5'10&quot; or 178cm"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profile.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                        placeholder="City, Country"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Goals</CardTitle>
                <CardDescription>Set your daily health and fitness goals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="sleepHours">Sleep Hours</Label>
                    <Input
                      id="sleepHours"
                      type="number"
                      value={profile.goals.sleepHours}
                      onChange={(e) => handleGoalChange('sleepHours', Number(e.target.value))}
                      min={0}
                      max={24}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="waterOz">Water (oz)</Label>
                    <Input
                      id="waterOz"
                      type="number"
                      value={profile.goals.waterOz}
                      onChange={(e) => handleGoalChange('waterOz', Number(e.target.value))}
                      min={0}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="steps">Daily Steps</Label>
                    <Input
                      id="steps"
                      type="number"
                      value={profile.goals.steps}
                      onChange={(e) => handleGoalChange('steps', Number(e.target.value))}
                      min={0}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Help Tooltips</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle tooltips that provide helpful information throughout the app
                    </p>
                  </div>
                  <Switch
                    checked={showTooltips}
                    onCheckedChange={toggleTooltips}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>Download your tracking data in CSV format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-4">
                  <Button 
                    onClick={() => handleExport('daily')}
                    disabled={isExporting}
                    variant="outline"
                  >
                    {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Export Daily Tracking
                  </Button>
                  <Button 
                    onClick={() => handleExport('weekly')}
                    disabled={isExporting}
                    variant="outline"
                  >
                    {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Export Weekly Summaries
                  </Button>
                  <Button 
                    onClick={() => handleExport('measurements')}
                    disabled={isExporting}
                    variant="outline"
                  >
                    {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Export Measurements
                  </Button>
                </div>
                {message && (
                  <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
                    <AlertDescription>{message.text}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
} 