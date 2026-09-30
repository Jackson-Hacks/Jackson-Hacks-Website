import React, { useEffect, useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import CursorGlow from '@/components/landing/CursorGlow';
import HeroSection from '@/components/landing/HeroSection';
import LocationSection from '@/components/landing/LocationSection';
import FAQSection from '@/components/landing/FAQSection';
import MarqueeBanner from '@/components/landing/MarqueeBanner';
import SponsorsSection from '@/components/landing/SponsorsSection';
import TeamSection from '@/components/landing/TeamSection';
import Footer from '@/components/landing/Footer';
import { CURRENT_EVENT_KEY, getApplicationWindowState } from '@/lib/applicationWindow';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
  const [applicationCycle, setApplicationCycle] = useState(null);

  useEffect(() => {
    let active = true;
    const refreshApplicationCycle = async () => {
      const { data, error } = await supabase
        .from('application_cycles')
        .select('opens_at,edits_close_at,launched_at,closed_at')
        .eq('event_key', CURRENT_EVENT_KEY)
        .single();
      if (active) setApplicationCycle(error ? null : data);
    };

    refreshApplicationCycle();
    const timer = setInterval(refreshApplicationCycle, 30000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const applicationCtaLabel = getApplicationWindowState(applicationCycle).isOpen
    ? 'Apply Now'
    : 'Applications Open Soon';

  return (
    <div className="bg-[#272727] min-h-screen">
      <CursorGlow />
      <Navbar applicationCtaLabel={applicationCtaLabel} />
      <HeroSection applicationCtaLabel={applicationCtaLabel} />
      <LocationSection />
      <FAQSection />
      <MarqueeBanner single />
      <SponsorsSection />
      <TeamSection />
      <Footer />
    </div>
  );
}
