import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Loader2,
  LockKeyhole,
  LogOut,
  Search,
  ShieldCheck,
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
  APPLICATION_STATUSES,
  getApplicationStatusDetails,
} from "@/lib/applicationStatus";
import { createCsv } from "@/lib/csv";
import { supabase } from "@/lib/supabaseClient";

const PAGE_SIZE = 10;
const decisionStatuses = APPLICATION_STATUSES.filter(
  (status) => status !== "withdrawn",
);
const detailFields = [
  ["Email", "email"],
  ["Phone", "phone"],
  ["Age", "age"],
  ["School", "school"],
  ["Grade", "grade"],
  ["Experience", "experience_level"],
  ["T-shirt", "tshirt_size"],
  ["Dietary information", "dietary_restrictions"],
  ["Why attend", "why_attend"],
  ["Project idea", "project_idea"],
  ["Heard from", "heard_from"],
  ["Emergency contact", "emergency_contact_name"],
  ["Emergency phone", "emergency_contact_phone"],
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
  const [adminError, setAdminError] = useState(null);
  const [applicationCycle, setApplicationCycle] = useState(null);
  const [windowError, setWindowError] = useState(null);
  const [isUpdatingWindow, setIsUpdatingWindow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(getCountdown);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [decisionStatus, setDecisionStatus] = useState("under_review");
  const [decisionNote, setDecisionNote] = useState("");
  const [isSavingDecision, setIsSavingDecision] = useState(false);
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
          const { data: applications, error: applicationsError } =
            await supabase
              .from("applications")
              .select("*")
              .eq("cycle_id", cycle.id)
              .order("submitted_at", { ascending: false });
          if (applicationsError) throw applicationsError;
          setAdminApplications(applications || []);
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
  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();
    return adminApplications.filter((item) => {
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      const matchesSearch =
        !query ||
        [item.full_name, item.email, item.school, item.grade].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(query),
        );
      return matchesStatus && matchesSearch;
    });
  }, [adminApplications, search, statusFilter]);
  const pageCount = Math.max(
    1,
    Math.ceil(filteredApplications.length / PAGE_SIZE),
  );
  const visibleApplications = filteredApplications.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  useEffect(() => setPage(1), [search, statusFilter]);

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

  const openApplication = async (item) => {
    setSelectedApplication(item);
    setDecisionStatus(
      item.status === "submitted" ? "under_review" : item.status,
    );
    setDecisionNote("");
    const { data, error } = await supabase
      .from("application_status_events")
      .select("*")
      .eq("application_id", item.id)
      .order("created_at", { ascending: false });
    if (error) {
      setAdminError("Status history could not be loaded.");
      setStatusHistory([]);
    } else {
      setStatusHistory(data || []);
    }
  };

  const saveDecision = async () => {
    if (!selectedApplication || applicationWindow.canEdit) return;
    const label = getApplicationStatusDetails(decisionStatus).label;
    if (
      !window.confirm(
        `Change ${selectedApplication.full_name}'s application to “${label}”?`,
      )
    )
      return;
    setIsSavingDecision(true);
    setAdminError(null);
    try {
      const { data, error } = await supabase.rpc("set_application_status", {
        p_application_id: selectedApplication.id,
        p_status: decisionStatus,
        p_note: decisionNote.trim() || null,
      });
      if (error) throw error;
      const saved = Array.isArray(data) ? data[0] : data;
      setSelectedApplication(saved);
      setAdminApplications((items) =>
        items.map((item) => (item.id === saved.id ? saved : item)),
      );
      if (application?.id === saved.id) setApplication(saved);
      await openApplication(saved);
    } catch (error) {
      console.error("Error saving decision:", error);
      setAdminError(
        "The decision could not be saved. Confirm submissions are closed and try again.",
      );
    } finally {
      setIsSavingDecision(false);
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
                  Search and review one application at a time. Exports exclude
                  essays, dietary details, phone numbers, and emergency
                  contacts.
                </p>
              </div>
              <Button
                onClick={downloadApplicantCsv}
                disabled={!filteredApplications.length || isExporting}
                className="bg-[#F68A42] text-white hover:bg-[#E06E0A]"
              >
                {isExporting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Download />
                )}{" "}
                Export filtered CSV
              </Button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_220px]">
              <Label className="relative">
                <span className="sr-only">Search applicants</span>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9199]" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, email, school, or grade"
                  className="border-white/10 bg-white/5 pl-10 text-white"
                />
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger
                  aria-label="Filter by status"
                  className="border-white/10 bg-white/5 text-white"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {APPLICATION_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {getApplicationStatusDetails(status).label}
                    </SelectItem>
                  ))}
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
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-white/5 text-[#B4BAC0]">
                  <tr>
                    <th className="p-3">Applicant</th>
                    <th className="p-3">School</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Submitted</th>
                    <th className="p-3">
                      <span className="sr-only">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleApplications.map((item) => (
                    <tr key={item.id} className="border-t border-white/10">
                      <td className="p-3">
                        <span className="block font-semibold">
                          {item.full_name}
                        </span>
                        <span className="text-xs text-[#8A9199]">
                          {item.email}
                        </span>
                      </td>
                      <td className="p-3">
                        {item.school}
                        <span className="block text-xs text-[#8A9199]">
                          Grade {item.grade}
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge className="bg-[#2072C7]/15 text-[#9CC4EA]">
                          {getApplicationStatusDetails(item.status).label}
                        </Badge>
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
                          className="border-white/15 bg-transparent text-white hover:bg-white/10"
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {!visibleApplications.length && (
                    <tr>
                      <td
                        colSpan={5}
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
                      {selectedApplication.full_name}
                    </h3>
                    <p className="mt-1 text-sm text-[#B4BAC0]">
                      Revision {selectedApplication.revision_number || 1} ·{" "}
                      {
                        getApplicationStatusDetails(selectedApplication.status)
                          .label
                      }
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
                  {detailFields.map(([label, key]) => (
                    <div
                      key={key}
                      className="rounded-lg border border-white/10 p-3"
                    >
                      <dt className="text-xs uppercase tracking-wide text-[#8A9199]">
                        {label}
                      </dt>
                      <dd className="mt-1 whitespace-pre-wrap break-words text-sm">
                        {selectedApplication[key] || "—"}
                      </dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-6 border-t border-white/10 pt-5">
                  <h4 className="font-semibold">Decision</h4>
                  {applicationWindow.canEdit ? (
                    <p className="mt-2 text-sm text-amber-300">
                      Close submissions before changing review decisions.
                    </p>
                  ) : (
                    <div className="mt-3 grid gap-3">
                      <Select
                        value={decisionStatus}
                        onValueChange={setDecisionStatus}
                      >
                        <SelectTrigger
                          aria-label="New decision status"
                          className="border-white/10 bg-white/5 text-white"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {decisionStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {getApplicationStatusDetails(status).label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Label
                        htmlFor="decision-note"
                        className="text-sm text-[#B4BAC0]"
                      >
                        Internal audit note (optional)
                      </Label>
                      <Textarea
                        id="decision-note"
                        value={decisionNote}
                        maxLength={1000}
                        onChange={(event) =>
                          setDecisionNote(event.target.value)
                        }
                        className="border-white/10 bg-white/5 text-white"
                      />
                      <Button
                        type="button"
                        onClick={saveDecision}
                        disabled={isSavingDecision}
                        className="bg-[#2072C7] text-white hover:bg-[#084F9A]"
                      >
                        {isSavingDecision && (
                          <Loader2 className="animate-spin" />
                        )}{" "}
                        Save decision
                      </Button>
                    </div>
                  )}
                </div>
                <div className="mt-6 border-t border-white/10 pt-5">
                  <h4 className="font-semibold">Decision history</h4>
                  {statusHistory.length ? (
                    <ol className="mt-3 space-y-3">
                      {statusHistory.map((event) => (
                        <li
                          key={event.id}
                          className="rounded-lg border border-white/10 p-3 text-sm"
                        >
                          <span className="font-semibold">
                            {
                              getApplicationStatusDetails(event.previous_status)
                                .label
                            }{" "}
                            →{" "}
                            {
                              getApplicationStatusDetails(event.new_status)
                                .label
                            }
                          </span>
                          <span className="ml-2 text-[#8A9199]">
                            {new Date(event.created_at).toLocaleString()}
                          </span>
                          {event.note && (
                            <p className="mt-1 text-[#B4BAC0]">{event.note}</p>
                          )}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="mt-2 text-sm text-[#8A9199]">
                      No decision changes recorded.
                    </p>
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
