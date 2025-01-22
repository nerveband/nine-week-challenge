import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { databaseService } from '@/services/DatabaseService';
import type { UserProfile as UserProfileType } from '@/types';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export function UserProfile() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStorageAvailable, setIsStorageAvailable] = useState(true);
  const [profile, setProfile] = useState<UserProfileType>({
    id: crypto.randomUUID(),
    name: '',
    birthdate: '',
    age: 0,
    height: '',
    location: '',
    whyStatement: '',
    startDate: new Date().toISOString().split('T')[0],
    currentPhase: 1,
    currentWeek: 1
  });

  useEffect(() => {
    const checkStorage = async () => {
      try {
        await databaseService.testStorage();
        setIsStorageAvailable(true);
        setError('');
      } catch (err) {
        console.error('Storage not available:', err);
        setIsStorageAvailable(false);
        setError(
          'Your browser is in private/incognito mode or storage is not available. ' +
          'Please use regular browsing mode to save your progress.'
        );
      }
    };

    checkStorage();
  }, []);

  const calculateAge = (birthdate: string) => {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isStorageAvailable) {
      setError('Cannot save profile in private/incognito mode. Please use regular browsing mode.');
      return;
    }

    const requiredFields = {
      name: 'Name',
      birthdate: 'Birthdate',
      height: 'Height',
      location: 'Location',
      whyStatement: 'Why Statement'
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key]) => !profile[key as keyof typeof profile])
      .map(([_, label]) => label);

    if (missingFields.length > 0) {
      setError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await databaseService.setUserProfile(profile);
      navigate('/daily');
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(
        'Failed to save profile. If you are in private/incognito mode, ' +
        'please switch to regular browsing mode.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to Your 9-Week Challenge</h1>
          <p className="text-muted-foreground text-lg">
            Let's start by getting to know you better. This information helps us personalize your journey.
          </p>
        </div>

        {!isStorageAvailable && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription className="text-base font-medium">
              ⚠️ Private/Incognito Mode Detected
              <p className="mt-2 font-normal">
                Your browser is in private/incognito mode. Data cannot be saved in this mode.
                Please switch to regular browsing mode to continue.
              </p>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthdate">Birthdate</Label>
                <Input
                  type="date"
                  id="birthdate"
                  value={profile.birthdate}
                  onChange={(e) => {
                    const birthdate = e.target.value;
                    const age = calculateAge(birthdate);
                    setProfile(prev => ({ ...prev, birthdate, age }));
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Input
                  type="text"
                  id="height"
                  value={profile.height}
                  onChange={(e) => setProfile(prev => ({ ...prev, height: e.target.value }))}
                  placeholder="e.g., 5'10&quot; or 178cm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  type="text"
                  id="location"
                  value={profile.location}
                  onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="City, Country"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="why-statement">Why are you starting this journey?</Label>
                <Textarea
                  id="why-statement"
                  value={profile.whyStatement}
                  onChange={(e) => setProfile(prev => ({ ...prev, whyStatement: e.target.value }))}
                  placeholder="What motivated you to start? What are your goals?"
                  rows={4}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !isStorageAvailable}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : !isStorageAvailable ? (
                  'Cannot Save in Private/Incognito Mode'
                ) : (
                  'Start My Journey'
                )}
              </Button>

              {!isStorageAvailable && (
                <p className="text-sm text-muted-foreground text-center">
                  To save your progress, please:
                  <br />1. Close all incognito/private windows
                  <br />2. Open the app in a regular browser window
                  <br />3. Try again
                </p>
              )}
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
} 