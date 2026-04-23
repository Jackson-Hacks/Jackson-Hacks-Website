import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PartyPopper, Sparkles, CheckCircle2, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabaseClient';
import ApplicationForm from '@/components/register/ApplicationForm';
import { useAuth } from '@/lib/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoadingAuth, signIn, signUp } = useAuth();
  const [isLoadingApp, setIsLoadingApp] = useState(true);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [existingApplication, setExistingApplication] = useState(null);
  const [isEditingApplication, setIsEditingApplication] = useState(false);
  
  // Auth state
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  useEffect(() => {
    const checkApplication = async () => {
      if (isAuthenticated && user?.email) {
        try {
          const { data, error } = await supabase
            .from('applications')
            .select('*')
            .eq('user_id', user.id)
            .limit(1);
            
          if (data && data.length > 0) {
            setExistingApplication(data[0]);
          }
        } catch (error) {
          console.error("Error checking application status:", error);
        }
      }
      setIsLoadingApp(false);
    };

    if (!isLoadingAuth) {
      checkApplication();
    }
  }, [isAuthenticated, user, isLoadingAuth]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthSubmitting(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
        // Display a more helpful message for signup
        setAuthError("Account created! Please check your email for a confirmation link.");
      }
    } catch (err) {
      console.error("Auth error:", err);
      setAuthError(err.message || "Authentication failed. Please try again.");
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  if (isLoadingAuth || isLoadingApp) {
    return (
      <div className="min-h-screen bg-[#272727] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2072C7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#272727] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2072C7]/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#F68A42]/12 rounded-full blur-[100px]" />
      </div>

      {/* Back button */}
      <div className="absolute top-6 left-6 z-20">
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10">
            <ArrowLeft size={18} className="mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Bypass to dashboard */}
      <div className="absolute top-6 right-6 z-20">
        <Button
          variant="outline"
          onClick={() => navigate(createPageUrl('Dashboard'))}
          className="text-black border-[#2072C7]/35 hover:bg-[#084F9A]/30 hover:text-white"
        >
          Go to Dashboard
        </Button>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-2xl">
          {/* Success State */}
          {(applicationSubmitted || (existingApplication && !isEditingApplication)) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="inline-flex p-6 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 mb-8">
                <PartyPopper className="w-16 h-16 text-green-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {applicationSubmitted ? 'Application Submitted!' : 'Already Applied!'}
              </h1>
              <p className="text-xl text-gray-400 mb-8 max-w-md mx-auto">
                {applicationSubmitted 
                  ? "Thank you for applying! We'll review your application and get back to you soon."
                  : "You've already submitted an application. We'll notify you once it's reviewed."}
              </p>
              
              {existingApplication && (
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 border border-white/10 mb-8">
                  <CheckCircle2 className="text-green-400" size={20} />
                  <span className="text-white">Status: </span>
                  <span className={`font-semibold capitalize ${
                    existingApplication.status === 'accepted' ? 'text-green-400' :
                    existingApplication.status === 'rejected' ? 'text-red-400' :
                    existingApplication.status === 'waitlisted' ? 'text-yellow-400' :
                    'text-[#2072C7]'
                  }`}>
                    {existingApplication.status}
                  </span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {existingApplication && (
                  <Button
                    size="lg"
                    onClick={() => {
                      setApplicationSubmitted(false);
                      setIsEditingApplication(true);
                    }}
                    className="bg-gradient-to-r from-[#2072C7] to-[#084F9A] hover:from-[#084F9A] hover:to-[#2072C7] text-white px-8 rounded-full"
                  >
                    Edit and Resubmit
                  </Button>
                )}
                <Link to={createPageUrl('Dashboard')}>
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-[#F68A42] to-[#E06E0A] hover:from-[#E06E0A] hover:to-[#F68A42] text-white px-8 rounded-full"
                  >
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}

          {/* Not Authenticated */}
          {!isAuthenticated && !applicationSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="inline-flex p-4 rounded-full bg-[#2072C7]/15 mb-6">
                <Sparkles className="w-8 h-8 text-[#F68A42]" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Apply to{' '}
                <span className="bg-gradient-to-r from-[#2072C7] to-[#F68A42] bg-clip-text text-transparent">
                  Jackson Hacks
                </span>
              </h1>
              <p className="text-xl text-gray-400 mb-10 max-w-md mx-auto">
                Create an account or sign in to start your application
              </p>

              <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/[0.05] max-w-md mx-auto text-left">
                <h2 className="text-xl font-semibold text-white mb-6 text-center">
                  {isLogin ? 'Sign In' : 'Create Account'}
                </h2>
                
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {authError && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
                      {authError.includes("Account created") ? 
                        <CheckCircle2 size={16} className="mt-0.5 text-green-400 shrink-0" /> : 
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      }
                      <span className={authError.includes("Account created") ? "text-green-400" : ""}>
                        {authError}
                      </span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#2072C7]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" size="sm" className="text-gray-300">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#2072C7]"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit"
                    disabled={isAuthSubmitting}
                    size="lg"
                    className="w-full bg-gradient-to-r from-[#F68A42] to-[#E06E0A] hover:from-[#E06E0A] hover:to-[#F68A42] text-white rounded-full mt-4"
                  >
                    {isAuthSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      isLogin ? 'Sign In' : 'Create Account'
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <button 
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setAuthError(null);
                    }}
                    className="text-[#2072C7] hover:text-[#F68A42] text-sm transition-colors"
                  >
                    {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Application Form */}
          {isAuthenticated && (isEditingApplication || (!applicationSubmitted && !existingApplication)) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {isEditingApplication ? 'Edit Your ' : 'Apply to '}
                  <span className="bg-gradient-to-r from-[#2072C7] to-[#F68A42] bg-clip-text text-transparent">
                    {isEditingApplication ? 'Application' : 'Jackson Hacks'}
                  </span>
                </h1>
                <p className="text-gray-400">
                  {isEditingApplication
                    ? 'Update your answers and resubmit your application'
                    : 'Fill out the form below to submit your application'}
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-[#084F9A]/15 border border-[#2072C7]/20">
                <ApplicationForm 
                  user={user} 
                  existingApplication={existingApplication}
                  onSuccess={(savedApplication) => {
                    setExistingApplication(savedApplication || existingApplication);
                    setApplicationSubmitted(true);
                    setIsEditingApplication(false);
                  }} 
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}