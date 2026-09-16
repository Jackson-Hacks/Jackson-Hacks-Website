import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { CURRENT_EVENT_KEY } from '@/lib/applicationWindow';
import { loadApplicationAnalytics } from '@/lib/applicationAnalytics';
import { EVENT } from '@/config/event';

function NumericTable({ title, rows, note = '' }) {
  return (
    <Card className="min-w-0 border-white/10 bg-[#2C2C2C] p-5 text-[#F3F1F1]">
      <h2 className="mb-3 font-title text-xl">{title}</h2>
      {note && <p className="mb-4 text-xs text-[#B4BAC0]">{note}</p>}
      {rows.length ? (
        <div className="max-h-96 overflow-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">{title}: application counts and percentages</caption>
            <thead className="sticky top-0 bg-[#2C2C2C] text-[#B4BAC0]">
              <tr><th scope="col" className="pb-3 pr-3">Category</th><th scope="col" className="pb-3 text-right">Count</th><th scope="col" className="pb-3 pl-3 text-right">%</th></tr>
            </thead>
            <tbody>{rows.map(({ label, count, percent }) => (
              <tr key={label} className="border-t border-white/10">
                <th scope="row" className="break-words py-3 pr-3 font-normal [overflow-wrap:anywhere]">{label}</th>
                <td className="py-3 text-right tabular-nums">{count.toLocaleString()}</td>
                <td className="py-3 pl-3 text-right tabular-nums">{percent.toFixed(1)}%</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : <p className="text-sm text-[#B4BAC0]">No applications yet.</p>}
    </Card>
  );
}

export default function ApplicationAnalytics() {
  const { user, isLoadingAuth } = useAuth();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (isLoadingAuth) return undefined;
    let active = true;
    setResult(null);
    setError('');
    setLoading(true);
    loadApplicationAnalytics(supabase, user?.id, CURRENT_EVENT_KEY)
      .then((data) => { if (active) setResult(data); })
      .catch(() => { if (active) setError('Analytics could not be loaded. Please try again.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user?.id, isLoadingAuth, attempt]);

  // Never render a previous admin's snapshot after logout/account changes.
  const analytics = user?.id && result?.allowed ? result.analytics : null;
  return (
    <div className="min-h-screen bg-[#272727] font-description text-[#F3F1F1]">
      <header className="border-b border-white/10 bg-[#1F1F1F]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-6">
          <div><h1 className="font-title text-3xl">Application Analytics</h1><p className="mt-2 text-sm text-[#B4BAC0]">Admin-only numeric overview</p></div>
          <Button asChild variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10"><Link to="/Dashboard"><ArrowLeft /> Dashboard</Link></Button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        {loading || isLoadingAuth ? <p role="status">Loading analytics…</p> : error ? (
          <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200"><p role="alert">{error}</p><Button onClick={() => setAttempt((value) => value + 1)} className="mt-4">Retry</Button></Card>
        ) : !analytics ? (
          <Card className="border-white/10 bg-[#2C2C2C] p-6 text-[#F3F1F1]"><ShieldCheck className="mb-3 text-[#F68A42]" /><h2 className="font-title text-2xl">Admin access required</h2><p className="mt-3 text-[#B4BAC0]">Sign in with an administrator account to view application analytics.</p><Button asChild className="mt-5 bg-[#2072C7] text-white"><Link to="/Register">Sign in</Link></Button></Card>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div><h2 className="text-xl">{result.cycle.name || EVENT.name}</h2><p className="mt-2 text-xs text-[#B4BAC0]">Updated {result.updatedAt.toLocaleString('en-CA', { timeZone: EVENT.timeZone })} Eastern Time. Submitted applications only; drafts and accounts are not included.</p></div>
              <Button onClick={() => setAttempt((value) => value + 1)} variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10"><RefreshCw /> Refresh numbers</Button>
            </div>
            {!analytics.total && <p role="status" className="rounded-xl border border-white/10 p-4 text-[#B4BAC0]">No applications have been submitted for this event yet.</p>}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                ['Total applications', analytics.total], ['Reviewed applicants', analytics.reviewed],
                ['Not yet reviewed', analytics.unreviewed], ['Review coverage', `${analytics.reviewCoverage.toFixed(1)}%`],
                ['Reviews completed', analytics.reviewCount], ['Active reviewers', analytics.reviewerCount],
                ['Submitted in last 24 hours', analytics.last24Hours], ['Submitted in last 7 days', analytics.last7Days],
                ['Average applicant score / 25', analytics.averageScore ?? '—'], ['Average age', analytics.averageAge ?? '—'],
              ].map(([label, value]) => <Card key={label} className="border-white/10 bg-[#2C2C2C] p-4 text-[#F3F1F1]"><h2 className="text-sm text-[#B4BAC0]">{label}</h2><p className="mt-3 text-3xl font-semibold tabular-nums text-[#9CC4EA]">{value.toLocaleString()}</p></Card>)}
            </div>
            <p className="text-xs text-[#B4BAC0]">Reviewed means at least one saved rating. Overall score averages each applicant’s mean rating equally; category averages use all saved reviews. Demographics are descriptive only, not admissions criteria.</p>
            <Card className="border-white/10 bg-[#2C2C2C] p-5 text-[#F3F1F1]">
              <h2 className="mb-4 font-title text-xl">Average rubric ratings</h2>
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{analytics.rubric.map(({ label, average }) => <div key={label}><dt className="text-sm text-[#B4BAC0]">{label}</dt><dd className="mt-2 text-xl tabular-nums">{average === null ? '—' : `${average.toFixed(2)} / 5`}</dd></div>)}</dl>
            </Card>
            <div className="grid items-start gap-6 md:grid-cols-2">
              <NumericTable title="Daily submissions (last 14 days)" rows={analytics.daily} note="Calendar dates use Eastern Time. All table percentages use total submitted applications." />
              {analytics.breakdowns.map((section) => <NumericTable key={section.title} {...section} />)}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
