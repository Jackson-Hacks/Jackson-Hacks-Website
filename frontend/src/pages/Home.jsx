import React from 'react';
import Navbar from '@/components/landing/Navbar';
import CursorGlow from '@/components/landing/CursorGlow';
import HeroSection from '@/components/landing/HeroSection';
import LocationSection from '@/components/landing/LocationSection';
import FAQSection from '@/components/landing/FAQSection';
import MarqueeBanner from '@/components/landing/MarqueeBanner';
import SponsorsSection from '@/components/landing/SponsorsSection';
import TeamSection from '@/components/landing/TeamSection';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <div className="bg-[#272727] min-h-screen">
      <CursorGlow />
      <Navbar />
      <HeroSection />
      <LocationSection />
      <FAQSection />
      <MarqueeBanner single />
      <SponsorsSection />
      <TeamSection />
      <Footer />
    </div>
  );
}