import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  LockKeyhole,
  LogOut,
  Search,
  ShieldCheck,
  Shuffle,
  Star,
  Unlock,
  Users,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EVENT } from "@/config/event";
import { useAuth } from "@/lib/AuthContext";
import {
  CURRENT_EVENT_KEY,
  formatApplicationDate,
  getApplicationWindowMessage,
  getApplicationWindowState,
} from "@/lib/applicationWindow";
import {
  getApplicationStatusDetails,
} from "@/lib/applicationStatus";
import {
  formatFirstGeneration,
  formatGenderIdentity,
  formatRaceEthnicity,
} from "@/lib/applicationDemographics";
import {
  EMPTY_REVIEW_SCORES,
  getAnonymousApplicantLabel,
  getReviewTotal,
  REVIEW_CATEGORIES,
  scoresFromReview,
  summarizeReviews,
  validateReviewScores,
} from "@/lib/applicationReview";
import { createCsv } from "@/lib/csv";
import { supabase } from "@/lib/supabaseClient";

const PAGE_SIZE = 10;
const reviewDetailFields = [
  { label: "School", value: (application) => application.school },
  { label: "Grade", value: (application) => application.grade },
  { label: "Coding experience", value: (application) => application.experience_level },
  { label: "Application response", value: (application) => application.why_attend },
];
const identityDetailFields = [
  { label: "Email", value: (application) => application.email },
  { label: "Phone", value: (application) => application.phone },
  { label: "Age", value: (application) => application.age },
  { label: "Gender", value: (application) => formatGenderIdentity(application.gender_identity, application.gender_self_description) },
  { label: "Pronouns", value: (application) => application.pronouns },
  { label: "Race / ethnicity", value: (application) => formatRaceEthnicity(application.race_ethnicity) },
  { label: "First-generation student", value: (application) => formatFirstGeneration(application.first_generation) },
  { label: "T-shirt", value: (application) => application.tshirt_size },
  { label: "Dietary information", value: (application) => application.dietary_restrictions },
  { label: "Heard from", value: (application) => application.heard_from },
  { label: "Emergency contact", value: (application) => application.emergency_contact_name },
  { label: "Emergency phone", value: (application) => application.emergency_contact_phone },
];

const csvColumns = [
  {
    label: "Submitted",
    value: (application) =>
      new Date(
        application.submitted_at || application.created_at,
      ).toISOString(),
  },
  {
    label: "Status",
    value: (application) =>
      getApplicationStatusDetails(application.status).label,
  },
  { label: "Name", value: (application) => application.full_name },
  { label: "Email", value: (application) => application.email },
  { label: "School", value: (application) => application.school },
  { label: "Grade", value: (application) => application.grade },
  { label: "Experience", value: (application) => application.experience_level },
];

function getCountdown() {
  const difference = new Date(EVENT.startsAt).getTime() - Date.now();
  if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(difference / 86400000),
    hours: Math.floor((difference / 3600000) % 24),
    minutes: Math.floor((difference / 60000) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, isLoadingAuth } = useAuth();
  const [application, setApplication] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminApplications, setAdminApplications] = useState([]);
  const [adminReviews, setAdminReviews] = useState([]);
  const [adminError, setAdminError] = useState(null);
  const [applicationCycle, setApplicationCycle] = useState(null);
  const [windowError, setWindowError] = useState(null);
  const [isUpdatingWindow, setIsUpdatingWindow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(getCountdown);
  const [search, setSearch] = useState("");
  const [reviewFilter, setReviewFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [blindReview, setBlindReview] = useState(true);
  const [randomReviewMode, setRandomReviewMode] = useState(false);
  const [reviewScores, setReviewScores] = useState({ ...EMPTY_REVIEW_SCORES });
  const [reviewErrors, setReviewErrors] = useState({});
  const [reviewNotes, setReviewNotes] = useState("");
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getCountdown()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setWindowError(null);
        setAdminError(null);
        const { data: cycle, error: cycleError } = await supabase
          .from("application_cycles")
          .select("*")
          .eq("event_key", CURRENT_EVENT_KEY)
          .single();
        if (cycleError) throw cycleError;
        setApplicationCycle(cycle);

        if (!user?.id) return;
        const { data: ownApplication, error: applicationError } = await supabase
          .from("applications")
          .select("*")
          .eq("cycle_id", cycle.id)
          .eq("user_id", user.id)
          .maybeSingle();
        if (applicationError) throw applicationError;
        setApplication(ownApplication || null);

        const { data: adminRows, error: adminLookupError } = await supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", user.id)
          .limit(1);
        if (adminLookupError) throw adminLookupError;
        const hasAdminAccess = Boolean(adminRows?.length);
        setIsAdmin(hasAdminAccess);
        if (hasAdminAccess) {
          const [applicationsResult, reviewsResult] = await Promise.all([
            supabase
              .from("applications")
              .select("*")
              .eq("cycle_id", cycle.id)
              .order("submitted_at", { ascending: false }),
            supabase.from("application_reviews").select("*"),
          ]);
          if (applicationsResult.error) throw applicationsResult.error;
          if (reviewsResult.error) throw reviewsResult.error;
          const applications = applicationsResult.data || [];
          const applicationIds = new Set(applications.map((item) => item.id));
          setAdminApplications(applications);
          setAdminReviews(
            (reviewsResult.data || []).filter((review) => applicationIds.has(review.application_id)),
          );
        }
      } catch (error) {
        console.error("Error loading dashboard:", error);
        setWindowError(
          "Could not load the application system. Refresh the page to try again.",
        );
      } finally {
        setIsLoading(false);
      }
    };
    if (!isLoadingAuth) loadDashboard();
  }, [user, isLoadingAuth]);

  useEffect(() => {
    const refresh = async () => {
      const { data } = await supabase
        .from("application_cycles")
        .select("*")
        .eq("event_key", CURRENT_EVENT_KEY)
        .single();
      if (data) setApplicationCycle(data);
    };
    const timer = setInterval(refresh, 30000);
    return () => clearInterval(timer);
  }, []);

  const applicationWindow = getApplicationWindowState(applicationCycle);
  const statusDetails = getApplicationStatusDetails(application?.status);
  const reviewsByApplication = useMemo(() => {
    const grouped = new Map();
    adminReviews.forEach((review) => {
      const reviews = grouped.get(review.application_id) || [];
      reviews.push(review);
      grouped.set(review.application_id, reviews);
    });
    return grouped;
  }, [adminReviews]);
  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();
    return adminApplications.filter((item) => {
      const myReview = (reviewsByApplication.get(item.id) || []).find(
        (review) => review.reviewer_id === user?.id,
      );
      const matchesReview =
        reviewFilter === "all"
        || (reviewFilter === "rated" && myReview)
        || (reviewFilter === "unrated" && !myReview);
      const searchableValues = blindReview
        ? [item.school, item.grade, item.experience_level]
        : [item.full_name, item.email, item.school, item.grade, item.experience_level];
      const matchesSearch =
        !query ||
        searchableValues.some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(query),
        );
      return matchesReview && matchesSearch;
    });
  }, [adminApplications, blindReview, reviewFilter, reviewsByApplication, search, user?.id]);
  const pageCount = Math.max(
    1,
    Math.ceil(filteredApplications.length / PAGE_SIZE),
  );
  const visibleApplications = filteredApplications.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  useEffect(() => setPage(1), [search, reviewFilter, blindReview]);

  const handleLogout = async () => {
    await logout(false);
    navigate("/");
  };

  const handleWindowToggle = async () => {
    if (!isAdmin || !applicationCycle) return;
    setIsUpdatingWindow(true);
    setWindowError(null);
    try {
      const { data, error } = await supabase.rpc(
        "set_application_window_closed",
        {
          p_closed: applicationWindow.canEdit,
          p_event_key: CURRENT_EVENT_KEY,
        },
      );
      if (error) throw error;
      setApplicationCycle(Array.isArray(data) ? data[0] : data);
    } catch (error) {
      console.error("Error updating application window:", error);
      setWindowError("The application window could not be updated.");
    } finally {
      setIsUpdatingWindow(false);
    }
  };

  const openApplication = (item) => {
    setSelectedApplication(item);
    const existingReview = (reviewsByApplication.get(item.id) || []).find(
      (review) => review.reviewer_id === user?.id,
    );
    setReviewScores(scoresFromReview(existingReview));
    setReviewNotes(existingReview?.internal_notes || "");
    setReviewErrors({});
  };

  const openRandomUnreviewed = async () => {
    if (!applicationCycle || applicationWindow.canEdit) return false;
    setIsLoadingRandom(true);
    setAdminError(null);
    try {
      const { data, error } = await supabase.rpc(
        "get_random_unreviewed_application",
        { p_cycle_id: applicationCycle.id },
      );
      if (error) throw error;
      const randomApplication = Array.isArray(data) ? data[0] : data;
      if (!randomApplication) {
        setAdminError("You have rated every available application.");
        setRandomReviewMode(false);
        return false;
      }
      openApplication(randomApplication);
      return true;
    } catch (error) {
      console.error("Error loading a random application:", error);
      setAdminError("A random unrated application could not be loaded.");
      setRandomReviewMode(false);
      return false;
    } finally {
      setIsLoadingRandom(false);
    }
  };

  const toggleRandomReviewMode = async () => {
    if (randomReviewMode) {
      setRandomReviewMode(false);
      return;
    }
    setRandomReviewMode(true);
    await openRandomUnreviewed();
  };

  const updateReviewScore = (key, value) => {
    setReviewScores((scores) => ({ ...scores, [key]: value }));
    setReviewErrors((errors) => ({ ...errors, [key]: null }));
  };

  const saveReview = async () => {
    if (!selectedApplication || applicationWindow.canEdit) return;
    const errors = validateReviewScores(reviewScores);
    setReviewErrors(errors);
    if (Object.keys(errors).length) return;
    setIsSavingReview(true);
    setAdminError(null);
    try {
      const { data, error } = await supabase.rpc("save_application_review", {
        p_application_id: selectedApplication.id,
        p_scores: Object.fromEntries(
          Object.entries(reviewScores).map(([key, value]) => [key, Number(value)]),
        ),
        p_internal_notes: reviewNotes.trim() || null,
      });
      if (error) throw error;
      const savedReview = Array.isArray(data) ? data[0] : data;
      setAdminReviews((reviews) =>
        reviews.some((review) => review.id === savedReview.id)
          ? reviews.map((review) => (review.id === savedReview.id ? savedReview : review))
          : [...reviews, savedReview],
      );
      if (randomReviewMode) {
        await openRandomUnreviewed();
      }
    } catch (error) {
      console.error("Error saving application review:", error);
      setAdminError(
        error?.message?.includes("cannot_review_own_application")
          ? "You cannot rate your own application."
          : "The review could not be saved. Confirm submissions are closed and try again.",
      );
    } finally {
      setIsSavingReview(false);
    }
  };

  const downloadApplicantCsv = async () => {
    setIsExporting(true);
    setAdminError(null);
    try {
      const rows = filteredApplications;
      const { error } = await supabase.rpc("log_application_export", {
        p_row_count: rows.length,
        p_event_key: CURRENT_EVENT_KEY,
      });
      if (error) throw error;
      const blob = new Blob([createCsv(csvColumns, rows)], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `jackson-hacks-applications-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting applications:", error);
      setAdminError(
        "The export was not created because its audit record could not be saved.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const welcomeName =
    application?.full_name?.trim() ||
    user?.user_metadata?.full_name?.trim() ||
    user?.email ||
    "Applicant";
  if (isLoadingAuth || isLoading)
    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-[#272727]"
        role="status"
      >
        <span className="sr-only">Loading dashboard</span>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/15 border-t-[#2072C7]" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#272727] font-description text-[#F3F1F1]">
      <header className="border-b border-white/10 bg-[#1F1F1F]">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h1 className="font-title text-3xl">Dashboard</h1>
            <p className="mt-1 break-all text-[#B4BAC0]">
              Welcome, {welcomeName}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="border-white/20 bg-transparent text-[#9CC4EA] hover:bg-white/10 hover:text-white"
            >
              Home
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-white/20 bg-transparent text-[#B4BAC0] hover:bg-white/10 hover:text-white"
            >
              <LogOut /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
        <Card className="border-white/10 bg-[#2C2C2C] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-title text-2xl text-[#F3F1F1]">
              <Zap className="text-[#F68A42]" /> Application Status
            </h2>
            {isAdmin && (
              <Badge className="border-[#F68A42]/40 bg-[#F68A42]/15 text-[#F68A42]">
                <ShieldCheck className="mr-1" /> Admin
              </Badge>
            )}
          </div>
          {application ? (
            <div className="mt-4 space-y-2">
              <div
                className={`flex items-center gap-2 text-lg font-semibold ${statusDetails.tone}`}
              >
                <CheckCircle2 /> {statusDetails.label}
              </div>
              <p className="text-sm text-[#B4BAC0]">{statusDetails.nextStep}</p>
              <p className="text-xs text-[#8A9199]">
                Submitted{" "}
                {new Date(
                  application.submitted_at || application.created_at,
                ).toLocaleString()}{" "}
                · Revision {application.revision_number || 1}
              </p>
            </div>
          ) : (
            <div className="mt-4">
              <div className="flex items-center gap-2 font-semibold text-[#F68A42]">
                <Clock /> No application yet
              </div>
              <p className="mt-2 text-sm text-[#B4BAC0]">
                Complete the application form to register.
              </p>
            </div>
          )}
        </Card>

        <Card className="border-white/10 bg-[#2C2C2C] p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 font-title text-2xl text-[#F3F1F1]">
                <CalendarClock className="text-[#2072C7]" /> Application Window
              </h2>
              <div
                className={`mt-3 flex items-center gap-2 font-semibold ${applicationWindow.canEdit ? "text-green-400" : "text-amber-300"}`}
              >
                {applicationWindow.canEdit ? <Unlock /> : <LockKeyhole />}
                {applicationWindow.canEdit
                  ? "Open for submissions and edits"
                  : "Closed and read-only"}
              </div>
              <p className="mt-2 text-sm text-[#B4BAC0]">
                {getApplicationWindowMessage(applicationWindow)}
              </p>
              {applicationCycle?.edits_close_at && (
                <p className="mt-2 text-xs text-[#8A9199]">
                  Scheduled cutoff:{" "}
                  {formatApplicationDate(applicationCycle.edits_close_at)}
                </p>
              )}
            </div>
            {isAdmin && applicationCycle && (
              <Button
                type="button"
                variant="outline"
                onClick={handleWindowToggle}
                disabled={isUpdatingWindow}
                className={
                  applicationWindow.canEdit
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                    : "border-green-500/30 bg-green-500/10 text-green-300"
                }
              >
                {isUpdatingWindow ? (
                  <Loader2 className="animate-spin" />
                ) : applicationWindow.canEdit ? (
                  <LockKeyhole />
                ) : (
                  <Unlock />
                )}
                {applicationWindow.canEdit
                  ? "Close Submissions"
                  : "Reopen Submissions"}
              </Button>
            )}
          </div>
          {windowError && (
            <p
              className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
              role="alert"
            >
              {windowError}
            </p>
          )}
        </Card>

        {isAdmin && (
          <Card className="border-white/10 bg-[#2C2C2C] p-4 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="flex items-center gap-2 font-title text-2xl text-[#F3F1F1]">
                  <Users className="text-[#F68A42]" /> Applicant Admin
                </h2>
                <p className="mt-2 text-sm text-[#B4BAC0]">
                  Score applications across five categories for a total of 50.
                  Blind review hides identity and demographic information.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  aria-pressed={blindReview}
                  onClick={() => setBlindReview((value) => !value)}
                  className="border-white/15 bg-transparent text-white hover:bg-white/10"
                >
                  {blindReview ? <EyeOff /> : <Eye />}
                  {blindReview ? "Blind review on" : "Identities visible"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  aria-pressed={randomReviewMode}
                  onClick={toggleRandomReviewMode}
                  disabled={applicationWindow.canEdit || isLoadingRandom}
                  className="border-[#2072C7]/40 bg-[#2072C7]/10 text-[#9CC4EA] hover:bg-[#2072C7]/20"
                >
                  {isLoadingRandom ? <Loader2 className="animate-spin" /> : <Shuffle />}
                  {randomReviewMode ? "Stop random mode" : "Start random review"}
                </Button>
                <Button
                  onClick={downloadApplicantCsv}
                  disabled={!filteredApplications.length || isExporting}
                  className="bg-[#F68A42] text-white hover:bg-[#E06E0A]"
                >
                  {isExporting ? <Loader2 className="animate-spin" /> : <Download />}{" "}
                  Export filtered CSV
                </Button>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_220px]">
              <Label className="relative">
                <span className="sr-only">Search applicants</span>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9199]" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={blindReview ? "Search school, grade, or experience" : "Search name, email, school, or grade"}
                  className="border-white/10 bg-white/5 pl-10 text-white"
                />
              </Label>
              <Select value={reviewFilter} onValueChange={setReviewFilter}>
                <SelectTrigger
                  aria-label="Filter by my review status"
                  className="border-white/10 bg-white/5 text-white"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All applications</SelectItem>
                  <SelectItem value="unrated">Unrated by me</SelectItem>
                  <SelectItem value="rated">Rated by me</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {adminError && (
              <p
                className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
                role="alert"
              >
                {adminError}
              </p>
            )}
            <div className="mt-5 overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="bg-white/5 text-[#B4BAC0]">
                  <tr>
                    <th className="p-3">Applicant</th>
                    <th className="p-3">School</th>
                    <th className="p-3">My score</th>
                    <th className="p-3">Average</th>
                    <th className="p-3">Submitted</th>
                    <th className="p-3">
                      <span className="sr-only">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleApplications.map((item) => {
                    const reviews = reviewsByApplication.get(item.id) || [];
                    const myReview = reviews.find((review) => review.reviewer_id === user?.id);
                    const summary = summarizeReviews(reviews);
                    return (
                    <tr key={item.id} className="border-t border-white/10">
                      <td className="p-3">
                        <span className="block font-semibold">
                          {blindReview ? getAnonymousApplicantLabel(item) : item.full_name}
                        </span>
                        {!blindReview && (
                          <span className="text-xs text-[#8A9199]">{item.email}</span>
                        )}
                      </td>
                      <td className="p-3">
                        {item.school}
                        <span className="block text-xs text-[#8A9199]">
                          Grade {item.grade}
                        </span>
                      </td>
                      <td className="p-3">
                        {myReview ? `${myReview.total_score} / 50` : "Unrated"}
                      </td>
                      <td className="p-3">
                        {summary.average === null
                          ? "—"
                          : `${summary.average} / 50 (${summary.count})`}
                      </td>
                      <td className="p-3 text-[#B4BAC0]">
                        {new Date(
                          item.submitted_at || item.created_at,
                        ).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => openApplication(item)}
                          disabled={item.user_id === user?.id}
                          className="border-white/15 bg-transparent text-white hover:bg-white/10"
                        >
                          {item.user_id === user?.id ? "Your application" : myReview ? "Edit score" : "Review"}
                        </Button>
                      </td>
                    </tr>
                    );
                  })}
                  {!visibleApplications.length && (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-6 text-center text-[#B4BAC0]"
                      >
                        No matching applications.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-[#B4BAC0]">
              <span>
                {filteredApplications.length} result
                {filteredApplications.length === 1 ? "" : "s"}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((value) => value - 1)}
                  className="border-white/15 bg-transparent text-white"
                >
                  Previous
                </Button>
                <span>
                  {page} / {pageCount}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  disabled={page >= pageCount}
                  onClick={() => setPage((value) => value + 1)}
                  className="border-white/15 bg-transparent text-white"
                >
                  Next
                </Button>
              </div>
            </div>

            {selectedApplication && (
              <section
                className="mt-6 rounded-xl border border-[#2072C7]/30 bg-[#262626] p-4 sm:p-6"
                aria-labelledby="application-review-title"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3
                      id="application-review-title"
                      className="font-title text-2xl"
                    >
                      {blindReview
                        ? getAnonymousApplicantLabel(selectedApplication)
                        : selectedApplication.full_name}
                    </h3>
                    <p className="mt-1 text-sm text-[#B4BAC0]">
                      Revision {selectedApplication.revision_number || 1} · {" "}
                      {summarizeReviews(reviewsByApplication.get(selectedApplication.id) || []).count} review(s)
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setSelectedApplication(null)}
                    className="text-[#B4BAC0] hover:text-white"
                  >
                    Close
                  </Button>
                </div>
                <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                  {reviewDetailFields.map(({ label, value }) => (
                    <div
                      key={label}
                      className={`rounded-lg border border-white/10 p-3 ${label === "Application response" ? "sm:col-span-2" : ""}`}
                    >
                      <dt className="text-xs uppercase tracking-wide text-[#8A9199]">
                        {label}
                      </dt>
                      <dd className="mt-1 whitespace-pre-wrap break-words text-sm">
                        {value(selectedApplication) || "—"}
                      </dd>
                    </div>
                  ))}
                  {!blindReview && identityDetailFields.map(({ label, value }) => (
                    <div key={label} className="rounded-lg border border-white/10 p-3">
                      <dt className="text-xs uppercase tracking-wide text-[#8A9199]">{label}</dt>
                      <dd className="mt-1 whitespace-pre-wrap break-words text-sm">
                        {value(selectedApplication) || "—"}
                      </dd>
                    </div>
                  ))}
                </dl>
                {blindReview && (
                  <p className="mt-3 flex items-center gap-2 text-xs text-[#8A9199]">
                    <EyeOff size={14} /> Name, contact details, age, and demographic survey answers are hidden.
                  </p>
                )}
                <div className="mt-6 border-t border-white/10 pt-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="flex items-center gap-2 font-semibold"><Star className="text-[#F68A42]" /> Review rubric</h4>
                      <p className="mt-1 text-sm text-[#8A9199]">Five categories worth 10 points each.</p>
                    </div>
                    <div className="rounded-lg bg-[#2072C7]/15 px-4 py-2 text-lg font-semibold text-[#9CC4EA]">
                      {getReviewTotal(reviewScores) ?? "—"} / 50
                    </div>
                  </div>
                  {applicationWindow.canEdit ? (
                    <p className="mt-2 text-sm text-amber-300">
                      Close submissions before reviewers can score applications.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {REVIEW_CATEGORIES.map((category) => (
                          <div key={category.key} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <Label htmlFor={`score-${category.key}`} className="font-semibold text-white">
                                  {category.label}
                                </Label>
                                <p className="mt-1 text-xs text-[#8A9199]">{category.description}</p>
                              </div>
                              <Input
                                id={`score-${category.key}`}
                                type="number"
                                min="0"
                                max="10"
                                step="1"
                                value={reviewScores[category.key]}
                                onChange={(event) => updateReviewScore(category.key, event.target.value)}
                                aria-invalid={Boolean(reviewErrors[category.key])}
                                aria-describedby={reviewErrors[category.key] ? `score-${category.key}-error` : undefined}
                                className="w-20 border-white/10 bg-white/5 text-center text-white"
                              />
                            </div>
                            {reviewErrors[category.key] && (
                              <p id={`score-${category.key}-error`} className="mt-2 text-xs text-red-400">
                                {reviewErrors[category.key]}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      <Label htmlFor="review-notes" className="text-sm text-[#B4BAC0]">
                        Internal reviewer notes (optional)
                      </Label>
                      <Textarea
                        id="review-notes"
                        value={reviewNotes}
                        maxLength={2000}
                        onChange={(event) => setReviewNotes(event.target.value)}
                        className="border-white/10 bg-white/5 text-white"
                      />
                      <Button
                        type="button"
                        onClick={saveReview}
                        disabled={isSavingReview}
                        className="bg-[#2072C7] text-white hover:bg-[#084F9A]"
                      >
                        {isSavingReview && <Loader2 className="animate-spin" />} {" "}
                        {randomReviewMode ? "Save & review another" : "Save review"}
                      </Button>
                    </div>
                  )}
                </div>
              </section>
            )}
          </Card>
        )}

        <Card className="border-white/10 bg-[#2C2C2C] p-6">
          <div className="flex items-center gap-3">
            <FileText className="text-[#2072C7]" />
            <h2 className="font-title text-xl">Your Application</h2>
          </div>
          <p className="mt-3 text-[#B4BAC0]">
            {application
              ? applicationWindow.canEdit
                ? "Review or update your application before submissions close."
                : "View your final locked application."
              : applicationWindow.canEdit
                ? "Fill out the application form to complete your registration."
                : "Applications are closed."}
          </p>
          <Button
            onClick={() => navigate("/Register")}
            disabled={!application && !applicationWindow.canEdit}
            className="mt-4 w-full bg-[#F68A42] text-white hover:bg-[#E06E0A]"
          >
            {application
              ? applicationWindow.canEdit
                ? "Edit Application"
                : "View Application"
              : applicationWindow.canEdit
                ? "Start Application"
                : "Applications Closed"}
          </Button>
        </Card>

        <Card className="border-white/10 bg-[#2C2C2C] p-6">
          <h2 className="font-title text-lg">Time until {EVENT.name}</h2>
          <p className="mt-1 text-sm text-[#B4BAC0]">
            {EVENT.dateLabel} · {EVENT.timeLabel} · {EVENT.timeZoneLabel}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(timeLeft).map(([unit, value]) => (
              <div
                key={unit}
                className="rounded-xl border border-white/10 bg-[#2072C7]/15 p-3 text-center"
              >
                <span className="block text-2xl font-bold text-[#6EA8DF]">
                  {value}
                </span>
                <span className="text-xs capitalize text-[#B4BAC0]">
                  {unit}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
