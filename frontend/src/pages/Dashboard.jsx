import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut, FileText, CheckCircle2, Clock, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, isLoadingAuth } = useAuth();
  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date('2026-11-21T08:00:00');

    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkApplication = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('applications')
            .select('*')
            .eq('user_id', user.id)
            .limit(1);
            
          if (data && data.length > 0) {
            setApplication(data[0]);
          }
        } catch (error) {
          console.error("Error checking application status:", error);
        }
      }
      setIsLoading(false);
    };

    if (!isLoadingAuth) {
      checkApplication();
    }
  }, [user, isLoadingAuth]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const welcomeName =
    application?.full_name?.trim() ||
    user?.user_metadata?.full_name?.trim() ||
    user?.email ||
    'Applicant';

  if (isLoadingAuth || isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#272727]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#272727] text-black font-description">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#084F9A] to-[#2072C7] border-b border-[#2072C7]/60">
        <div className="max-w-4xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-title text-white">Dashboard</h1>
            <p className="text-[#F3F1F1]/85 mt-1">Welcome, {welcomeName}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="text-black hover:text-white border-white/30 hover:bg-white/10"
            >
              Back to Home
            </Button>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Status Card */}
          <Card className="bg-gradient-to-br from-[#084F9A]/35 to-[#2072C7]/20 border-[#2072C7]/40 p-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-title flex items-center gap-2 text-white">
                <Zap className="w-6 h-6 text-yellow-400" />
                Application Status
              </h2>
              {application ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-lg font-semibold">Application Submitted</span>
                  </div>
                  <p className="text-slate-400 text-sm">
                    Submitted on: {new Date(application.created_at).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Clock className="w-5 h-5" />
                    <span className="text-lg font-semibold">No Application Yet</span>
                  </div>
                  <p className="text-slate-400 text-sm">
                    Complete the application form to register for the hackathon
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Application Form Card */}
          <Card className="bg-[#084F9A]/25 border-[#2072C7]/40 p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-title text-white">Complete Your Application</h3>
              </div>
              <p className="text-slate-300">
                {application 
                  ? "Review or update your application information"
                  : "Fill out the application form to complete your registration"
                }
              </p>
              <Button 
                onClick={() => navigate('/Register')}
                className="bg-gradient-to-r from-[#F68A42] to-[#E06E0A] hover:from-[#E06E0A] hover:to-[#F68A42] w-full mt-4 font-semibold"
              >
                {application ? 'View Application' : 'Start Application'}
              </Button>
            </div>
          </Card>

          {/* Info Card */}
          <Card className="bg-[#084F9A]/25 border-[#2072C7]/40 p-6 text-white">
            <h3 className="text-lg font-title mb-3">Next Steps</h3>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#F68A42] flex items-center justify-center text-white text-sm flex-shrink-0 mt-0.5">1</div>
                <span>Complete your application form with all required information</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#F68A42] flex items-center justify-center text-white text-sm flex-shrink-0 mt-0.5">2</div>
                <span>Our team will review your application</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#F68A42] flex items-center justify-center text-white text-sm flex-shrink-0 mt-0.5">3</div>
                <span>You'll receive acceptance confirmation via email</span>
              </li>
            </ul>

            <div className="mt-8 border-t border-white/15 pt-6">
              <p className="text-base text-white font-semibold">Time until Hackathon</p>
              <div className="mt-4 grid grid-cols-4 gap-3">
                <div className="rounded-xl border border-[#2072C7]/40 bg-[#084F9A]/30 px-3 py-3 text-center">
                  <div className="text-2xl font-bold text-white">{timeLeft.days}d</div>
                </div>
                <div className="rounded-xl border border-[#2072C7]/40 bg-[#084F9A]/30 px-3 py-3 text-center">
                  <div className="text-2xl font-bold text-white">{timeLeft.hours}h</div>
                </div>
                <div className="rounded-xl border border-[#2072C7]/40 bg-[#084F9A]/30 px-3 py-3 text-center">
                  <div className="text-2xl font-bold text-white">{timeLeft.minutes}m</div>
                </div>
                <div className="rounded-xl border border-[#2072C7]/40 bg-[#084F9A]/30 px-3 py-3 text-center">
                  <div className="text-2xl font-bold text-white">{timeLeft.seconds}s</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
