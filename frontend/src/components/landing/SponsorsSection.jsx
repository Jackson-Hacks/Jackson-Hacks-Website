import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import squiggle2Orange from '@/assets/visuals/drive-download-20260424T030637Z-3-001/squiggle2Orange.png';
import pcbwayLogo from '@/assets/visuals/sponsorLogos/PCBway logo.png';
import aopsLogo from '@/assets/visuals/sponsorLogos/AoPS_Main_Logo (1).png';
import codeCraftersLogo from '@/assets/visuals/sponsorLogos/CodeCraftersBlack.png';
import tplLogo from '@/assets/visuals/sponsorLogos/tpl-h-logo-full-colour-rgb.png';
import wolframAlphaLogo from '@/assets/visuals/sponsorLogos/WolframAlphaLogoCropped.png';

// No tier labels — higher tiers are simply bigger logos, ordered big → small.
const sponsorRows = [
  {
    chip: 'h-24 w-64 p-5 sm:h-28 sm:w-80 sm:p-6',
    sponsors: [{ name: 'PCBWay', logo: pcbwayLogo, href: 'https://www.pcbway.com/' }],
  },
  {
    chip: 'h-16 w-44 p-3 sm:h-20 sm:w-56 sm:p-4',
    sponsors: [
      { name: 'Art of Problem Solving', logo: aopsLogo, href: 'https://artofproblemsolving.com/' },
      { name: 'CodeCrafters', logo: codeCraftersLogo, href: 'https://codecrafters.io/' },
      { name: 'Toronto Public Library', logo: tplLogo, href: 'https://www.torontopubliclibrary.ca/' },
      { name: 'Wolfram Alpha', logo: wolframAlphaLogo, href: 'https://www.wolframalpha.com/' },
    ],
  },
];

export default function SponsorsSection() {
  return (
    <section id="sponsors" className="relative overflow-hidden bg-[#272727] py-12 sm:py-16 lg:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(243,241,241,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(243,241,241,0.04)_1px,transparent_1px)] bg-[size:90px_90px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F68A42]/40 to-transparent" />
      <img
        src={squiggle2Orange}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[8%] right-[2%] hidden w-56 rotate-6 opacity-25 lg:block"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7 }}
          className="mb-10 max-w-3xl sm:mb-14"
        >
          <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-[#F68A42] sm:text-sm">
            Our Partners
          </span>
          <h2 className="font-title text-3xl text-[#F3F1F1] sm:text-4xl md:text-6xl">
            Sponsors Make<br className="hidden sm:block" /> Jackson Hacks Possible
          </h2>
        </motion.div>

        {/* Logo wall */}
        <div className="flex flex-col items-center gap-6 sm:gap-8">
          {sponsorRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {row.sponsors.map((sponsor, i) => (
                <motion.a
                  key={sponsor.name}
                  href={sponsor.href}
                  target="_blank"
                  rel="noreferrer"
                  title={sponsor.name}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.55, delay: (rowIndex * 2 + i) * 0.08, ease: 'easeOut' }}
                  className={`${row.chip} flex items-center justify-center rounded-2xl bg-[#F3F1F1] transition-transform hover:-rotate-1 hover:scale-105`}
                >
                  <img src={sponsor.logo} alt={sponsor.name} className="max-h-full max-w-full object-contain" />
                </motion.a>
              ))}
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-12 flex flex-col items-center gap-3 text-center"
        >
          <p className="text-sm text-[#B4BAC0] sm:text-base">Want to support the next generation of hackers?</p>
          <a href="mailto:sponsor@hackathon.com">
            <Button
              size="lg"
              className="rounded-full bg-[#F68A42] px-8 py-5 text-white hover:bg-[#E06E0A]"
            >
              <Mail className="mr-2" size={18} />
              Contact Us
            </Button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
