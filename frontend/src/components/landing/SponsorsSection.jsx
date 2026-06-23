import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FileText, Mail, Star } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const tiers = [
  { label: 'Gold', count: 2, size: 'h-16', opacity: 'opacity-30' },
  { label: 'Silver', count: 3, size: 'h-12', opacity: 'opacity-25' },
  { label: 'Bronze', count: 4, size: 'h-10', opacity: 'opacity-20' },
];

export default function SponsorsSection() {
  const isMobile = useIsMobile();

  return (
    <section id="sponsors" className="relative overflow-hidden bg-[#F7F9FC] py-12 sm:py-16 lg:py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F68A42]/30 to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(8,79,154,0.07),transparent_48%,rgba(246,138,66,0.06))]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div
          initial={false}
          whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
          viewport={isMobile ? undefined : { once: true }}
          transition={isMobile ? undefined : { duration: 0.8 }}
          className="mb-10 max-w-3xl sm:mb-12"
        >
          <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-[#F68A42] sm:text-sm">
            Our Partners
          </span>
          <h2 className="font-title text-3xl text-[#1F2933] sm:text-4xl md:text-6xl">
            Sponsors Make<br className="hidden sm:block" /> Jackson Hacks Possible
          </h2>
        </motion.div>

        {/* Sponsor tier placeholders */}
        <motion.div
          initial={false}
          whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
          viewport={isMobile ? undefined : { once: true }}
          transition={isMobile ? undefined : { duration: 0.7, delay: 0.1 }}
          className="mb-6 rounded-2xl border border-dashed border-[#D7E4F5] bg-white p-6 sm:p-8"
        >
          <div className="mb-4 flex items-center gap-2">
            <Star size={16} className="text-[#F68A42]" />
            <span className="text-xs font-semibold uppercase tracking-widest text-[#697586]">Sponsor Logos Coming Soon</span>
          </div>
          <div className="space-y-6">
            {tiers.map((tier) => (
              <div key={tier.label}>
                <p className="mb-3 text-xs font-medium uppercase tracking-widest text-[#697586]">{tier.label}</p>
                <div className="flex flex-wrap items-center gap-4">
                  {Array.from({ length: tier.count }).map((_, i) => (
                    <div
                      key={i}
                      className={`${tier.size} w-32 rounded-xl border-2 border-dashed border-[#D7E4F5] bg-[#F8FAFD] ${tier.opacity}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Become a sponsor CTA */}
        <motion.div
          initial={false}
          whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
          viewport={isMobile ? undefined : { once: true }}
          transition={isMobile ? undefined : { duration: 0.8, delay: 0.2 }}
          className="rounded-2xl border border-[#D7E4F5] bg-white p-6 shadow-xl shadow-[#084F9A]/8 sm:p-8"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-title text-2xl text-[#1F2933] sm:text-3xl">Become a Sponsor</h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#52606D] sm:text-base">
                Support the next generation of innovators. Connect with talented students, gain exposure in the tech community, and help shape the future of technology.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="rounded-full bg-[#F68A42] px-6 py-5 text-white hover:bg-[#E06E0A]"
              >
                <FileText className="mr-2" size={18} />
                Sponsorship Package
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-[#2072C7]/25 bg-[#EEF4FB] px-6 py-5 text-[#084F9A] hover:bg-[#2072C7] hover:text-white transition-colors"
              >
                <Mail className="mr-2" size={18} />
                Contact Us
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
