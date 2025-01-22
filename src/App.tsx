import { BrowserRouter } from 'react-router-dom';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { UserProfile } from '@/components/UserProfile';
import { DailyTracking } from '@/components/DailyTracking';
import { WeeklyTracking } from '@/pages/WeeklyTracking';
import { History } from '@/components/History';
import { Profile } from '@/components/Profile';
import { Analytics } from '@/components/Analytics';
import { databaseService } from '@/services/DatabaseService';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorPage } from '@/components/ErrorPage';
import type { UserProfile as UserProfileType } from '@/types';
import { TooltipProvider } from "@/components/ui/tooltip";

export function App() {
  const [userProfile, setUserProfile] = useState<UserProfileType | null | undefined>(undefined);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize database and migrate data if needed
        const initResult = await databaseService.initializeDatabase();
        if (!initResult.success) {
          setError('Failed to initialize database. Some features may not work correctly.');
        }

        // Get user profile
        const profile = await databaseService.getUserProfile();
        setUserProfile(profile || null);
      } catch (err) {
        console.error('Error initializing app:', err);
        setError('Failed to load user data. Please try refreshing the page.');
      } finally {
        setIsInitializing(false);
      }
    };

    initApp();
  }, []);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Setting up your personal space</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorPage 
        title="Initialization Error"
        message={error}
      />
    );
  }

  return (
    <TooltipProvider delayDuration={200} disableHoverableContent>
      <ErrorBoundary>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <Routes>
            <Route
              path="/"
              element={
                userProfile ? (
                  <Navigate to="/daily" replace />
                ) : (
                  <UserProfile />
                )
              }
            />
            <Route
              path="/daily"
              element={
                userProfile ? (
                  <DailyTracking />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/weekly"
              element={
                userProfile ? (
                  <WeeklyTracking />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/history"
              element={
                userProfile ? (
                  <History />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/analytics"
              element={
                userProfile ? (
                  <Analytics />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/profile"
              element={
                userProfile ? (
                  <Profile />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  );
} 