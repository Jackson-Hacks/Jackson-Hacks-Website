import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LogOut, FileText, CheckCircle2, Clock, Zap, ShieldCheck, Download, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';

const adminColumns = [
  { key: 'created_at', label: 'Submitted' },
  { key: 'status', label: 'Status' },
  { key: 'full_name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'age', label: 'Age' },
  { key: 'school', label: 'School' },
  { key: 'grade', label: 'Grade' },
  { key: 'experience_level', label: 'Experience' },
  { key: 'dietary_restrictions', label: 'Dietary' },
  { key: 'tshirt_size', label: 'Shirt' },
  { key: 'why_attend', label: 'Why Attend' },
  { key: 'project_idea', label: 'Project Idea' },
  { key: 'heard_from', label: 'Heard From' },
  { key: 'emergency_contact_name', label: 'Emergency Name' },
  { key: 'emergency_contact_phone', label: 'Emergency Phone' },
];

const formatAdminValue = (application, key) => {
  const value = application[key];

  if (key === 'created_at' && value) {
    return new Date(value).toLocaleString();
  }

  if (value === null || value === undefined || value === '') {
    return '-';
  }

  return String(value);
};

const escapeCsvValue = (value) => {
  const stringValue = String(value ?? '');
  return `"${stringValue.replace(/"/g, '""')}"`;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, isLoadingAuth } = useAuth();
  const [application, setApplication] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminApplications, setAdminApplications] = useState([]);
  const [adminError, setAdminError] = useState(null);
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
          const { data } = await supabase
            .from('applications')
            .select('*')
            .eq('user_id', user.id)
            .limit(1);
            
          if (data && data.length > 0) {
            setApplication(data[0]);
          }

          const { data: adminRows, error: adminLookupError } = await supabase
            .from('admin_users')
            .select('user_id')
            .eq('user_id', user.id)
            .limit(1);

          if (adminLookupError) {
            console.error("Error checking admin access:", adminLookupError);
          }

          const hasAdminAccess = !!adminRows?.length;
          setIsAdmin(hasAdminAccess);

          if (hasAdminAccess) {
            const { data: applications, error: applicationsError } = await supabase
              .from('applications')
              .select('*')
              .order('created_at', { ascending: false });

            if (applicationsError) {
              throw applicationsError;
            }

            setAdminApplications(applications || []);
          }
        } catch (error) {
          console.error("Error checking application status:", error);
          setAdminError('Could not load admin applicant data.');
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

  const downloadApplicantCsv = () => {
    const header = adminColumns.map((column) => escapeCsvValue(column.label)).join(',');
    const rows = adminApplications.map((adminApplication) =>
      adminColumns
        .map((column) => escapeCsvValue(formatAdminValue(adminApplication, column.key)))
        .join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'jackson-hacks-applications.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const welcomeName =
    application?.full_name?.trim() ||
    user?.user_metadata?.full_name?.trim() ||
    user?.email ||
    'Applicant';

  if (isLoadingAuth || isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#EDF4FB]">
        <div className="w-8 h-8 border-4 border-[#D7E4F5] border-t-[#2072C7] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EDF4FB] to-[#F7F9FC] text-[#1F2933] font-description">
      {/* Header */}
      <div className="border-b border-[#B8D8F5] bg-[#C5DFF7]/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-title text-[#1F2933]">Dashboard</h1>
            <p className="text-[#52606D] mt-1">Welcome, {welcomeName}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="border-[#2072C7]/30 text-[#2072C7] hover:bg-[#2072C7]/10"
            >
              Back to Home
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2 border-[#2072C7]/30 text-[#52606D] hover:bg-[#2072C7]/10"
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
          <Card className="bg-white border-[#D7E4F5] p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-title flex items-center gap-2 text-[#1F2933]">
                  <Zap className="w-6 h-6 text-[#F68A42]" />
                  Application Status
                </h2>
                {isAdmin && (
                  <Badge className="border-[#F68A42]/40 bg-[#FFF4EC] text-[#F68A42] hover:bg-[#FFF4EC]">
                    <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                    Admin
                  </Badge>
                )}
              </div>
              {application ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-lg font-semibold">Application Submitted</span>
                  </div>
                  <p className="text-[#52606D] text-sm">
                    Submitted on: {new Date(application.created_at).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#F68A42]">
                    <Clock className="w-5 h-5" />
                    <span className="text-lg font-semibold">No Application Yet</span>
                  </div>
                  <p className="text-[#52606D] text-sm">
                    Complete the application form to register for the hackathon
                  </p>
                </div>
              )}
            </div>
          </Card>

          {isAdmin && (
            <Card className="bg-white border-[#D7E4F5] p-6 shadow-sm">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-title flex items-center gap-2 text-[#1F2933]">
                    <Users className="h-6 w-6 text-[#F68A42]" />
                    Applicant Admin
                  </h2>
                  <p className="mt-2 text-sm text-[#52606D]">
                    Viewing {adminApplications.length} submitted application{adminApplications.length === 1 ? '' : 's'}.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={downloadApplicantCsv}
                  disabled={!adminApplications.length}
                  className="bg-[#F68A42] text-white hover:bg-[#E06E0A]"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>

              {adminError ? (
                <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-600">
                  {adminError}
                </div>
              ) : adminApplications.length ? (
                <div className="rounded-xl border border-[#D7E4F5] bg-[#F8FAFD]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#D7E4F5] hover:bg-transparent">
                        {adminColumns.map((column) => (
                          <TableHead key={column.key} className="min-w-[140px] text-[#52606D]">
                            {column.label}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminApplications.map((adminApplication) => (
                        <TableRow key={adminApplication.id} className="border-[#D7E4F5] hover:bg-[#EEF4FB]">
                          {adminColumns.map((column) => (
                            <TableCell key={column.key} className="max-w-[260px] whitespace-normal text-[#1F2933]">
                              {column.key === 'status' ? (
                                <Badge className="border-[#2072C7]/30 bg-[#EEF4FB] capitalize text-[#2072C7] hover:bg-[#EEF4FB]">
                                  {formatAdminValue(adminApplication, column.key)}
                                </Badge>
                              ) : (
                                formatAdminValue(adminApplication, column.key)
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="rounded-lg border border-[#D7E4F5] bg-[#F8FAFD] p-4 text-sm text-[#52606D]">
                  No applications have been submitted yet.
                </div>
              )}
            </Card>
          )}

          {/* Application Form Card */}
          <Card className="bg-white border-[#D7E4F5] p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-[#2072C7]" />
                <h3 className="text-xl font-title text-[#1F2933]">Complete Your Application</h3>
              </div>
              <p className="text-[#52606D]">
                {application
                  ? "Review or update your application information"
                  : "Fill out the application form to complete your registration"
                }
              </p>
              <Button
                onClick={() => navigate('/Register')}
                className="bg-gradient-to-r from-[#F68A42] to-[#E06E0A] hover:from-[#E06E0A] hover:to-[#F68A42] text-white w-full mt-4 font-semibold"
              >
                {application ? 'View Application' : 'Start Application'}
              </Button>
            </div>
          </Card>

          {/* Info Card */}
          <Card className="bg-white border-[#D7E4F5] p-6 shadow-sm">
            <h3 className="text-lg font-title mb-3 text-[#1F2933]">Next Steps</h3>
            <ul className="space-y-2 text-[#52606D]">
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

            <div className="mt-8 border-t border-[#D7E4F5] pt-6">
              <p className="text-base text-[#1F2933] font-semibold">Time until Hackathon</p>
              <div className="mt-4 grid grid-cols-4 gap-3">
                <div className="rounded-xl border border-[#D7E4F5] bg-[#EEF4FB] px-3 py-3 text-center">
                  <div className="text-2xl font-bold text-[#2072C7]">{timeLeft.days}d</div>
                </div>
                <div className="rounded-xl border border-[#D7E4F5] bg-[#EEF4FB] px-3 py-3 text-center">
                  <div className="text-2xl font-bold text-[#2072C7]">{timeLeft.hours}h</div>
                </div>
                <div className="rounded-xl border border-[#D7E4F5] bg-[#EEF4FB] px-3 py-3 text-center">
                  <div className="text-2xl font-bold text-[#2072C7]">{timeLeft.minutes}m</div>
                </div>
                <div className="rounded-xl border border-[#D7E4F5] bg-[#EEF4FB] px-3 py-3 text-center">
                  <div className="text-2xl font-bold text-[#2072C7]">{timeLeft.seconds}s</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
