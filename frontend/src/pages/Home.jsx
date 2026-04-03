import React from 'react';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import AboutSection from '@/components/landing/AboutSection';
import FAQSection from '@/components/landing/FAQSection';
import SponsorsSection from '@/components/landing/SponsorsSection';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <div className="bg-[#0F0A1F] min-h-screen">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <FAQSection />
      <SponsorsSection />
      <Footer />
    </div>
  );
}