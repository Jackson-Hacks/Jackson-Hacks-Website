import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FileText, Handshake, Mail } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export default function SponsorsSection() {
  const isMobile = useIsMobile();

  return (
    <section id="sponsors" className="relative overflow-hidden bg-[#F7F9FC] py-12 sm:py-16 lg:py-24">
      <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(8,79,154,0.08),transparent_48%,rgba(246,138,66,0.07))]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <motion.div
          initial={false}
          whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
          viewport={isMobile ? undefined : { once: true }}
          transition={isMobile ? undefined : { duration: 0.8 }}
          className="mb-8 max-w-3xl sm:mb-10"
        >
          <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-[#F68A42] sm:text-sm">
            Our Partners
          </span>
          <h2 className="font-title text-3xl text-[#1F2933] sm:text-4xl md:text-6xl">
            Sponsors Make Jackson Hacks Possible
          </h2>
        </motion.div>

        <motion.div
          initial={false}
          whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
          viewport={isMobile ? undefined : { once: true }}
          transition={isMobile ? undefined : { duration: 0.8, delay: 0.2 }}
          className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]"
        >
          <div className="rounded-2xl border border-dashed border-[#F68A42]/45 bg-white p-5 shadow-lg shadow-[#F68A42]/10 sm:p-6">
            <Handshake size={32} className="mb-5 text-[#F68A42]" />
            <h3 className="font-title text-2xl text-[#1F2933]">Sponsors Coming Soon</h3>
            <p className="mt-2 text-sm leading-6 text-[#52606D] sm:text-base">
              Sponsor logos and confirmed partners will appear here as packages are finalized.
            </p>
          </div>
          <div className="rounded-2xl border border-[#D7E4F5] bg-white p-5 text-[#1F2933] shadow-xl shadow-[#084F9A]/10 sm:p-7 lg:p-8">
            <h3 className="font-title text-2xl sm:text-3xl md:text-4xl">Become a Sponsor</h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#52606D] sm:text-lg">
              Support the next generation of innovators. Connect with talented students, gain exposure in the tech community, and help shape the future of technology.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="w-full rounded-full bg-[#F68A42] px-6 py-6 text-[#272727] hover:bg-[#E06E0A] sm:w-auto"
              >
                <FileText className="mr-2" size={20} />
                Sponsorship Package
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-full border-[#2072C7]/25 bg-[#EEF4FB] px-6 py-6 text-[#084F9A] hover:bg-[#2072C7] hover:text-white sm:w-auto"
              >
                <Mail className="mr-2" size={20} />
                sponsor@hackathon.com
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

