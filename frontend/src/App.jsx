import { Fragment, lazy, Suspense } from 'react';
import { MotionConfig } from 'framer-motion';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import PageNotFound from '@/lib/PageNotFound';
import NavigationTracker from '@/lib/NavigationTracker';
import { queryClientInstance } from '@/lib/query-client';

const Home = lazy(() => import('@/pages/Home'));
const Register = lazy(() => import('@/pages/Register'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const ApplicationAnalytics = lazy(() => import('@/pages/ApplicationAnalytics'));
const LegalDocument = lazy(() => import('@/pages/LegalDocument'));

function AccountScopedPage({ children }) {
  const { user } = useAuth();
  // Clear private page state synchronously on logout/account switches, but not
  // during token refreshes (which must preserve an applicant's unsaved form).
  return <Fragment key={user?.id || 'signed-out'}>{children}</Fragment>;
}

function RouteLoadingState() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#272727]" role="status" aria-live="polite">
      <span className="sr-only">Loading page</span>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/15 border-t-[#2072C7]" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <MotionConfig reducedMotion="user">
          <BrowserRouter>
            <NavigationTracker />
            <Suspense fallback={<RouteLoadingState />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/Home" element={<Home />} />
                <Route path="/Register" element={<AccountScopedPage><Register /></AccountScopedPage>} />
                <Route path="/:documentSlug" element={<LegalDocument />} />
                {/* Dashboard intentionally remains public for the current testing workflow. */}
                <Route path="/Dashboard" element={<AccountScopedPage><Dashboard /></AccountScopedPage>} />
                <Route path="/ApplicationAnalytics" element={<AccountScopedPage><ApplicationAnalytics /></AccountScopedPage>} />
                <Route path="*" element={<PageNotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </MotionConfig>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}
