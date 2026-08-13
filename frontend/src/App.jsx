import { lazy, Suspense } from 'react';
import { MotionConfig } from 'framer-motion';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/lib/AuthContext';
import PageNotFound from '@/lib/PageNotFound';
import NavigationTracker from '@/lib/NavigationTracker';
import { queryClientInstance } from '@/lib/query-client';

const Home = lazy(() => import('@/pages/Home'));
const Register = lazy(() => import('@/pages/Register'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));

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
                <Route path="/Register" element={<Register />} />
                {/* Dashboard intentionally remains public for the current testing workflow. */}
                <Route path="/Dashboard" element={<Dashboard />} />
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
