import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AuthProvider, useAuthContext } from '@/components/providers/AuthProvider';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Profile } from '@/pages/Profile';
import { DailyTracking } from '@/components/DailyTracking';
import { WeeklyReview } from '@/components/WeeklyReview';
import { Analytics } from '@/pages/Analytics';
import { History } from '@/pages/History';
import { Layout } from '@/components/Layout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthContext();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthContext();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/daily" />;
}

export function App() {
  return (
    <Router future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}>
      <ThemeProvider defaultTheme="system" storageKey="app-theme">
        <TooltipProvider>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
              <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Navigate to="daily" replace />} />
                <Route path="daily" element={<DailyTracking />} />
                <Route path="weekly" element={<WeeklyReview />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="history" element={<History />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Routes>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </Router>
  );
}