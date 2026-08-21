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
import {
  CURRENT_EVENT_KEY,
  getApplicationWindowMessage,
  getApplicationWindowState,
} from '@/lib/applicationWindow';
import { getApplicationStatusDetails } from '@/lib/applicationStatus';

export default function Register() {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    isLoadingAuth,
    signIn,
    signUp,
    signInWithGoogle,
    requestPasswordReset,
    updatePassword,
  } = useAuth();
  const [isLoadingApp, setIsLoadingApp] = useState(true);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [existingApplication, setExistingApplication] = useState(null);
  const [applicationDraft, setApplicationDraft] = useState(null);
  const [isEditingApplication, setIsEditingApplication] = useState(false);
  const [isViewingApplication, setIsViewingApplication] = useState(false);
  const [applicationCycle, setApplicationCycle] = useState(null);
  const [applicationLoadError, setApplicationLoadError] = useState(null);
  const [applicationWindowClock, setApplicationWindowClock] = useState(() => new Date());
  const [applicationLoadAttempt, setApplicationLoadAttempt] = useState(0);
  
  // Auth state
  const [isLogin, setIsLogin] = useState(true);
  const [authMode, setAuthMode] = useState(() =>
    new URLSearchParams(window.location.search).has('recovery') ? 'recovery' : 'password',
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  useEffect(() => {
    const checkApplication = async () => {
      try {
        setIsLoadingApp(true);
        setApplicationLoadError(null);
        const { data: cycle, error: cycleError } = await supabase
          .from('application_cycles')
          .select('*')
          .eq('event_key', CURRENT_EVENT_KEY)
          .single();

        if (cycleError) throw cycleError;
        setApplicationCycle(cycle);

        if (isAuthenticated && user?.id) {
          const [applicationResult, draftResult] = await Promise.all([
            supabase
              .from('applications')
              .select('*')
              .eq('cycle_id', cycle.id)
              .eq('user_id', user.id)
              .maybeSingle(),
            supabase
              .from('application_drafts')
              .select('*')
              .eq('cycle_id', cycle.id)
              .eq('user_id', user.id)
              .maybeSingle(),
          ]);

          if (applicationResult.error) throw applicationResult.error;
          if (draftResult.error) throw draftResult.error;
          setExistingApplication(applicationResult.data || null);
          setApplicationDraft(applicationResult.data ? null : draftResult.data || null);
        } else {
          setExistingApplication(null);
          setApplicationDraft(null);
        }
      } catch (error) {
        console.error("Error checking application status:", error);
        setApplicationLoadError('Application availability could not be loaded. Please refresh and try again.');
      }
      setIsLoadingApp(false);
    };

    if (!isLoadingAuth) {
      checkApplication();
    }
  }, [isAuthenticated, user?.id, isLoadingAuth, applicationLoadAttempt]);

  useEffect(() => {
    const refreshApplicationWindow = async () => {
      const { data, error } = await supabase
        .from('application_cycles')
        .select('*')
        .eq('event_key', CURRENT_EVENT_KEY)
        .single();

      if (!error && data) {
        setApplicationCycle(data);
      }
      setApplicationWindowClock(new Date());
    };

    const timer = setInterval(refreshApplicationWindow, 30000);
    return () => clearInterval(timer);
  }, []);

  const applicationWindow = getApplicationWindowState(applicationCycle, applicationWindowClock);
  const applicationWindowMessage = getApplicationWindowMessage(applicationWindow);

  const handleSaveDraft = async (draftData, currentStep) => {
    const { data, error } = await supabase.rpc('save_application_draft', {
      p_draft: draftData,
      p_current_step: currentStep,
      p_event_key: CURRENT_EVENT_KEY,
    });
    if (error) throw error;
    const savedDraft = Array.isArray(data) ? data[0] : data;
    setApplicationDraft(savedDraft);
    navigate('/Dashboard');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthSubmitting(true);

    try {
      if (authMode === 'forgot') {
        await requestPasswordReset(email.trim());
        setAuthError('Password reset email sent. Check your inbox for the secure link.');
      } else if (authMode === 'recovery') {
        if (password.length < 8) throw new Error('Use at least 8 characters for your new password.');
        await updatePassword(password);
        setAuthError('Password updated. You are now signed in.');
        setAuthMode('password');
      } else if (isLogin) {
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

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsGoogleSubmitting(true);

    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Google auth error:", err);
      setAuthError(err.message || "Google sign in failed. Please try again.");
      setIsGoogleSubmitting(false);
    }
  };

  if (isLoadingAuth || isLoadingApp) {
    return (
      <div className="min-h-screen bg-[#272727] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/15 border-t-[#2072C7] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#272727] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2072C7]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#F68A42]/8 rounded-full blur-[100px]" />
      </div>

      {/* Back button */}
      <div className="absolute top-6 left-6 z-20">
        <Button asChild variant="ghost" className="text-[#B4BAC0] hover:text-[#F3F1F1] hover:bg-white/10">
          <Link to={createPageUrl('Home')}>
            <ArrowLeft size={18} className="mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-2xl">
          {/* Success State */}
          {authMode !== 'recovery' && (applicationSubmitted || (existingApplication && !isEditingApplication && !isViewingApplication)) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="inline-flex p-6 rounded-full bg-green-500/15 mb-8">
                <PartyPopper className="w-16 h-16 text-green-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#F3F1F1] mb-4">
                {applicationSubmitted ? 'Application Submitted!' : 'Already Applied!'}
              </h1>
              <p className="text-xl text-[#B4BAC0] mb-8 max-w-md mx-auto">
                {applicationSubmitted
                  ? "Thank you for applying! We'll review your application and get back to you soon."
                  : "You've already submitted an application. We'll notify you once it's reviewed."}
              </p>

              <div className={`mx-auto mb-6 max-w-lg rounded-xl border px-5 py-4 text-sm ${
                applicationWindow.canEdit
                  ? 'border-[#2072C7]/30 bg-[#084F9A]/20 text-[#9CC4EA]'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-200'
              }`}>
                {applicationWindowMessage}
              </div>

              {existingApplication && (
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-[#2C2C2C] border border-white/10 mb-8">
                  <CheckCircle2 className="text-green-400" size={20} />
                  <span className="text-[#F3F1F1]">Status: </span>
                  <span className={`font-semibold ${getApplicationStatusDetails(existingApplication.status).tone}`}>
                    {getApplicationStatusDetails(existingApplication.status).label}
                  </span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {existingApplication && (
                  <Button
                    size="lg"
                    onClick={() => {
                      setApplicationSubmitted(false);
                      if (applicationWindow.canEdit) {
                        setIsEditingApplication(true);
                      } else {
                        setIsViewingApplication(true);
                      }
                    }}
                    className="bg-[#2072C7] hover:bg-[#084F9A] text-white px-8 rounded-full"
                  >
                    {applicationWindow.canEdit ? 'Edit Submission' : 'View Submission'}
                  </Button>
                )}
                <Button asChild
                    size="lg"
                    className="bg-[#F68A42] hover:bg-[#E06E0A] text-white px-8 rounded-full"
                  >
                  <Link to={createPageUrl('Dashboard')}>
                    Back to Dashboard
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}

          {authMode !== 'recovery' && isAuthenticated && applicationLoadError && !existingApplication && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-200">
              <AlertCircle className="mx-auto mb-3" size={28} />
              <p>{applicationLoadError}</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsLoadingApp(true);
                  setApplicationLoadAttempt((attempt) => attempt + 1);
                }}
                className="mt-4 border-red-300/30 bg-transparent text-red-100 hover:bg-red-500/10"
              >
                Retry
              </Button>
            </div>
          )}

          {authMode !== 'recovery' && isAuthenticated && !applicationLoadError && !existingApplication && !applicationWindow.canEdit && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-amber-500/30 bg-[#2C2C2C] p-8 text-center"
            >
              <AlertCircle className="mx-auto mb-4 text-amber-300" size={42} />
              <h1 className="mb-3 text-3xl font-bold text-[#F3F1F1]">Applications are closed</h1>
              <p className="text-[#B4BAC0]">{applicationWindowMessage}</p>
            </motion.div>
          )}

          {/* Not Authenticated */}
          {(!isAuthenticated || authMode === 'recovery') && !applicationSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="inline-flex p-4 rounded-full bg-[#F68A42]/15 mb-6">
                <Sparkles className="w-8 h-8 text-[#F68A42]" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#F3F1F1] mb-4">
                Apply to{' '}
                <span className="text-[#F68A42]">
                  Jackson Hacks
                </span>
              </h1>
              <p className="text-xl text-[#B4BAC0] mb-10 max-w-md mx-auto">
                Create an account or sign in to start your application
              </p>

              <div className="p-8 rounded-2xl bg-[#2C2C2C] border border-white/10 max-w-md mx-auto text-left">
                <h2 className="text-xl font-semibold text-[#F3F1F1] mb-6 text-center">
                  {authMode === 'forgot' ? 'Reset Password' : authMode === 'recovery' ? 'Choose New Password' : isLogin ? 'Sign In' : 'Create Account'}
                </h2>

                {authMode === 'password' && <Button
                  type="button"
                  variant="outline"
                  disabled={isAuthSubmitting || isGoogleSubmitting}
                  onClick={handleGoogleSignIn}
                  className="w-full rounded-full border-white/15 bg-white/5 text-[#F3F1F1] hover:bg-white/10 hover:text-[#F3F1F1]"
                >
                  {isGoogleSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/20 text-xs font-bold">
                        G
                      </span>
                      Continue with Google
                    </>
                  )}
                </Button>}

                {authMode === 'password' && <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-xs uppercase text-[#8A9199]">or</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>}

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {authError && (
                    <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${
                      /Account created|sent|updated/.test(authError)
                        ? 'bg-green-500/10 border border-green-500/30 text-green-300'
                        : 'bg-red-500/10 border border-red-500/30 text-red-300'
                    }`}>
                      {/Account created|sent|updated/.test(authError) ?
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> :
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      }
                      <span>{authError}</span>
                    </div>
                  )}

                  {authMode !== 'recovery' && <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#B4BAC0]">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9199]" size={18} />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 bg-white/5 border-white/10 text-[#F3F1F1] placeholder:text-[#8A9199] focus:border-[#2072C7]"
                      />
                    </div>
                  </div>}

                  {authMode !== 'forgot' && <div className="space-y-2">
                    <Label htmlFor="password" className="text-[#B4BAC0]">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9199]" size={18} />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10 bg-white/5 border-white/10 text-[#F3F1F1] placeholder:text-[#8A9199] focus:border-[#2072C7]"
                      />
                    </div>
                  </div>}

                  <Button
                    type="submit"
                    disabled={isAuthSubmitting}
                    size="lg"
                    className="w-full bg-[#F68A42] hover:bg-[#E06E0A] text-white rounded-full mt-4"
                  >
                    {isAuthSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      authMode === 'forgot' ? 'Send Reset Link' : authMode === 'recovery' ? 'Update Password' : isLogin ? 'Sign In' : 'Create Account'
                    )}
                  </Button>
                </form>

                {authMode === 'password' && <div className="mt-6 space-y-3 text-center">
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot');
                        setAuthError(null);
                      }}
                      className="block w-full text-sm text-[#B4BAC0] transition-colors hover:text-[#F68A42]"
                    >
                      Forgot your password?
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setAuthError(null);
                    }}
                    className="text-[#6EA8DF] hover:text-[#F68A42] text-sm transition-colors"
                  >
                    {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                  </button>
                </div>}
                {authMode === 'forgot' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('password');
                      setAuthError(null);
                    }}
                    className="mt-6 w-full text-center text-sm text-[#6EA8DF] hover:text-[#F68A42]"
                  >
                    Back to sign in
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Application Form */}
          {authMode !== 'recovery' && isAuthenticated && !applicationLoadError && (
            isEditingApplication ||
            isViewingApplication ||
            (!applicationSubmitted && !existingApplication && applicationWindow.canEdit)
          ) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-bold text-[#F3F1F1] mb-4">
                  {isViewingApplication ? 'View Your ' : isEditingApplication ? 'Edit Your ' : applicationDraft ? 'Continue Your ' : 'Apply to '}
                  <span className="text-[#F68A42]">
                    {isViewingApplication || isEditingApplication || applicationDraft ? 'Application' : 'Jackson Hacks'}
                  </span>
                </h1>
                <p className="text-[#B4BAC0]">
                  {isViewingApplication
                    ? 'Applications are closed. This is your final submitted version.'
                    : isEditingApplication
                      ? applicationWindowMessage
                      : applicationDraft
                        ? `Draft restored from step ${applicationDraft.current_step}. You can save and return again at any time before applications close.`
                        : 'Fill out the form below to submit your application'}
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-[#2C2C2C] border border-white/10">
                <ApplicationForm
                  user={user}
                  existingApplication={existingApplication}
                  initialDraft={applicationDraft}
                  readOnly={isViewingApplication || !applicationWindow.canEdit}
                  onSaveDraft={handleSaveDraft}
                  onDone={() => {
                    setIsViewingApplication(false);
                    setIsEditingApplication(false);
                  }}
                  onWindowClosed={() => {
                    setApplicationCycle(current => current ? {
                      ...current,
                      closed_at: new Date().toISOString(),
                    } : current);
                  }}
                  onSuccess={(savedApplication) => {
                    setExistingApplication(savedApplication || existingApplication);
                    setApplicationDraft(null);
                    setApplicationSubmitted(true);
                    setIsEditingApplication(false);
                    setIsViewingApplication(false);
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
