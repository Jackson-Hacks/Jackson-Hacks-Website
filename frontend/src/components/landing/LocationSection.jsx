import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock3, CalendarDays, Navigation } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export default function LocationSection() {
  const isMobile = useIsMobile();

  return (
    <section id="location" className="relative py-16 sm:py-20 lg:py-28 bg-[#272727]">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#2072C7]/10 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div
          initial={isMobile ? false : { opacity: 0, y: 24 }}
          whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
          viewport={isMobile ? undefined : { once: true }}
          transition={isMobile ? undefined : { duration: 0.7 }}
          className="mb-14 text-center"
        >
          <span className="mb-4 block text-sm font-semibold uppercase tracking-widest text-[#2072C7]">
            Location
          </span>
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl md:text-6xl">Location</h2>
          
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={isMobile ? false : { opacity: 0, y: 26 }}
            whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
            viewport={isMobile ? undefined : { once: true }}
            transition={isMobile ? undefined : { duration: 0.7, delay: 0.1 }}
            className="rounded-3xl border border-[#2072C7]/25 bg-[#084F9A]/15 p-6 sm:p-8"
          >
            <div className="mb-5 inline-flex rounded-xl bg-[#2072C7]/25 p-3 text-white">
              <MapPin size={24} />
            </div>

            <h3 className="text-xl font-semibold text-white sm:text-2xl">A. Y. Jackson SS</h3>
            <p className="mt-2 text-sm text-gray-300 sm:text-base">A. Y. Jackson SS</p>

            <div className="mt-8 space-y-4 text-gray-200">
              <div className="flex items-center gap-3">
                <CalendarDays size={18} className="text-[#F68A42]" />
                <span className="text-sm sm:text-base">November 21st, 2026 (Saturday)</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock3 size={18} className="text-[#F68A42]" />
                <span className="text-sm sm:text-base">8am - 10pm</span>
              </div>
              <div className="flex items-center gap-3">
                <Navigation size={18} className="text-[#F68A42]" />
                <span className="text-sm sm:text-base">Parking and transit info shared before check-in</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={isMobile ? false : { opacity: 0, y: 26 }}
            whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
            viewport={isMobile ? undefined : { once: true }}
            transition={isMobile ? undefined : { duration: 0.7, delay: 0.2 }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#2072C7]/20 via-[#5A78AF]/15 to-[#F68A42]/15 p-6 sm:p-8"
          >
            <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#F68A42]/20 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#2072C7]/20 blur-3xl" />

            <div className="relative z-10 flex h-full min-h-[220px] flex-col justify-between rounded-2xl border border-white/20 bg-[#272727]/45 p-5 sm:p-6 backdrop-blur-sm">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#2072C7] sm:text-sm">Campus Zone</p>
                <p className="mt-3 text-xl font-semibold text-white sm:text-2xl">Easy to Find. Easy to Build.</p>
                <p className="mt-3 max-w-md text-sm text-gray-300 sm:text-base">
                  Close to food spots, parking, and transit. We&apos;ll send exact entry details and check-in instructions before the event.
                </p>
              </div>
              <a
                href="https://maps.google.com/?q=A.+Y.+Jackson+SS"
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex w-fit items-center rounded-full border border-[#2072C7]/40 px-5 py-2.5 text-white transition-colors hover:border-[#F68A42] hover:text-[#F68A42]"
              >
                Open in Maps
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
