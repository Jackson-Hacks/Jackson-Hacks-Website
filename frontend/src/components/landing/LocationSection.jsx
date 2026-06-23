import React from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Clock3, MapPin, Navigation } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export default function LocationSection() {
  const isMobile = useIsMobile();

  return (
    <section id="location" className="relative overflow-hidden bg-[#F7F9FC] py-12 sm:py-16 lg:py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2072C7]/35 to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(32,114,199,0.10),transparent_42%,rgba(246,138,66,0.08))]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div
          initial={false}
          whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
          viewport={isMobile ? undefined : { once: true }}
          transition={isMobile ? undefined : { duration: 0.7 }}
          className="mb-10 max-w-3xl sm:mb-12"
        >
          <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-[#F68A42] sm:text-sm">
            Event Details
          </span>
          <h2 className="font-title text-3xl text-[#1F2933] sm:text-4xl md:text-6xl">Location</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#3F4D5A] sm:text-lg">
            Join us at A. Y. Jackson Secondary School for a full day of building, workshops, food, and demos.
          </p>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <motion.div
            initial={false}
            whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
            viewport={isMobile ? undefined : { once: true }}
            transition={isMobile ? undefined : { duration: 0.7, delay: 0.1 }}
            className="rounded-2xl border border-[#D7E4F5] bg-white p-5 shadow-xl shadow-[#084F9A]/10 sm:p-7 lg:p-8"
          >
            <div className="mb-5 inline-flex rounded-lg bg-[#2072C7]/10 p-3 text-[#2072C7]">
              <MapPin size={24} />
            </div>

            <h3 className="font-title text-2xl text-[#1F2933] sm:text-3xl">A. Y. Jackson SS</h3>
            <p className="mt-2 text-sm text-[#52606D] sm:text-base">50 Francine Dr, North York, ON</p>

            <div className="mt-7 grid gap-3 text-[#1F2933] sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-xl border border-[#E4EAF2] bg-[#F8FAFD] p-4">
                <CalendarDays size={19} className="mb-3 text-[#F68A42]" />
                <span className="block text-xs uppercase tracking-widest text-[#697586]">Date</span>
                <span className="mt-1 block text-sm font-medium sm:text-base">Nov. 21, 2026</span>
              </div>
              <div className="rounded-xl border border-[#E4EAF2] bg-[#F8FAFD] p-4">
                <Clock3 size={19} className="mb-3 text-[#F68A42]" />
                <span className="block text-xs uppercase tracking-widest text-[#697586]">Time</span>
                <span className="mt-1 block text-sm font-medium sm:text-base">8 AM - 10 PM</span>
              </div>
              <div className="rounded-xl border border-[#E4EAF2] bg-[#F8FAFD] p-4">
                <Navigation size={19} className="mb-3 text-[#F68A42]" />
                <span className="block text-xs uppercase tracking-widest text-[#697586]">Arrival</span>
                <span className="mt-1 block text-sm font-medium sm:text-base">Details before check-in</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={false}
            whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
            viewport={isMobile ? undefined : { once: true }}
            transition={isMobile ? undefined : { duration: 0.7, delay: 0.2 }}
            className="relative overflow-hidden rounded-2xl border border-[#D7E4F5] bg-white p-5 text-[#1F2933] shadow-xl shadow-[#084F9A]/10 sm:p-7 lg:p-8"
          >
            <div className="overflow-hidden rounded-xl border border-[#E4EAF2] bg-[#EEF4FB]">
              <iframe
                title="Map to A. Y. Jackson Secondary School"
                src="https://www.google.com/maps?q=A.%20Y.%20Jackson%20Secondary%20School%2050%20Francine%20Dr%20North%20York%20ON&output=embed"
                className="h-[260px] w-full border-0 sm:h-[320px] lg:h-[360px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

            <a
              href="https://maps.google.com/?q=A.+Y.+Jackson+SS"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-[#F68A42] px-5 py-2.5 text-sm font-semibold text-[#272727] transition-colors hover:bg-[#E06E0A]"
            >
              <Navigation size={17} />
              Open in Maps
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

