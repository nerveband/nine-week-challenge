import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { databaseService } from '@/services/DatabaseService';
import { exportAllData, importAllData, downloadFile } from '@/utils/exportData';
import type { UserProfile as UserProfileType } from '@/types';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, User } from 'lucide-react';

export function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileType>({
    id: '',
    name: '',
    birthdate: '',
    age: 0,
    height: '',
    location: '',
    whyStatement: '',
    avatarUrl: '',
    startDate: new Date().toISOString(),
    currentPhase: 1,
    currentWeek: 1
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userProfile = await databaseService.getUserProfile();
      if (userProfile) {
        setProfile(userProfile);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await databaseService.setUserProfile(profile);
      setSuccessMessage('Profile updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile');
    }
  };

  const handleExportData = async () => {
    try {
      setError(null);
      const jsonData = await exportAllData();
      const timestamp = new Date().toISOString().split('T')[0];
      downloadFile(jsonData, `fat-loss-data-${timestamp}.json`);
      setSuccessMessage('Data exported successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error exporting data:', err);
      setError('Failed to export data');
    }
  };

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(null);
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const jsonString = event.target?.result as string;
          await importAllData(jsonString);
          await loadProfile(); // Reload profile after import
          setSuccessMessage('Data imported successfully');
          setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
          console.error('Error importing data:', err);
          setError('Failed to import data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    } catch (err) {
      console.error('Error reading file:', err);
      setError('Failed to read import file');
    } finally {
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            <h2 className="text-2xl font-semibold mt-4">Loading Profile</h2>
            <p className="text-muted-foreground">Please wait...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-8">Profile Settings</h1>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="mb-6">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    {profile.avatarUrl ? (
                      <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                    ) : (
                      <AvatarFallback>
                        <User className="w-10 h-10" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details and preferences</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthdate">Birthdate</Label>
                    <Input
                      id="birthdate"
                      type="date"
                      value={profile.birthdate}
                      onChange={(e) => setProfile(prev => ({ ...prev, birthdate: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      value={profile.height}
                      onChange={(e) => setProfile(prev => ({ ...prev, height: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whyStatement">Why Statement</Label>
                  <Input
                    id="whyStatement"
                    value={profile.whyStatement}
                    onChange={(e) => setProfile(prev => ({ ...prev, whyStatement: e.target.value }))}
                    placeholder="Why are you on this journey?"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatarUrl">Profile Picture URL</Label>
                  <Input
                    id="avatarUrl"
                    value={profile.avatarUrl}
                    onChange={(e) => setProfile(prev => ({ ...prev, avatarUrl: e.target.value }))}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                <Button type="submit" className="w-full">Save Changes</Button>
              </CardContent>
            </Card>
          </form>

          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Export or import your tracking data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Export Data</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Download all your tracking data as a JSON file. You can use this file to backup your data or transfer it to another device.
                </p>
                <Button onClick={handleExportData} className="w-full">
                  Export All Data
                </Button>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Import Data</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Import previously exported data. Note: This will replace all existing data.
                </p>
                <div className="flex flex-col gap-4">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-muted-foreground">
                    Supported format: JSON (exported from this app)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
} 