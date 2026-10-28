import React from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { EVENT } from '@/config/event';
import squiggle2Orange from '@/assets/visuals/drive-download-20260424T030637Z-3-001/squiggle2Orange.webp';
import pcbwayLogo from '@/assets/visuals/sponsorLogos/PCBway logo.png';
import aopsLogo from '@/assets/visuals/sponsorLogos/AoPS_Main_Logo (1).png';
import codeCraftersLogo from '@/assets/visuals/sponsorLogos/CodeCraftersBlack.png';
import tplLogo from '@/assets/visuals/sponsorLogos/tpl-h-logo-full-colour-rgb.png';
import wolframAlphaLogo from '@/assets/visuals/sponsorLogos/WolframAlphaLogoCropped.png';
import yorkLogo from '@/assets/visuals/sponsorLogos/york-university.jpg';
import youthCultureLogo from '@/assets/visuals/sponsorLogos/youth-culture.png';
import waterlooLogo from '@/assets/visuals/sponsorLogos/waterloo.png';
import mcmasterLogo from '@/assets/visuals/sponsorLogos/mcmaster-engineering.svg';
import xyzLogo from '@/assets/visuals/sponsorLogos/xyz.svg';
import nordvpnLogo from '@/assets/visuals/sponsorLogos/nordvpn.svg';
import nordpassLogo from '@/assets/visuals/sponsorLogos/nordpass.svg';
import incogniLogo from '@/assets/visuals/sponsorLogos/incogni.svg';
import sailyLogo from '@/assets/visuals/sponsorLogos/saily.svg';

// Logo size and border colour distinguish tiers without hover labels.
// York's possible Gold upgrade is not confirmed. Wolfram keeps its existing
// partner classification, but shares the smaller-logo flow instead of a lone row.
/** @type {{ tier: string, chip: string, sponsors: { name: string, logo: string, href: string, caption?: string, wordmark?: boolean, cropPadding?: boolean }[] }[]} */
const sponsorRows = [
  {
    tier: 'Silver',
    chip: 'h-32 w-72 border-[3px] border-[#B8C2CF] border-t-[#E4E9EF] border-b-[#929EAC] p-4 shadow-[0_0_0_1px_#697582,0_4px_20px_#B8C2CF20] sm:h-36 sm:w-96 sm:p-5',
    sponsors: [{
      name: 'York University — School of the Arts, Media, Performance & Design',
      logo: yorkLogo,
      href: 'https://ampd.yorku.ca/',
      caption: 'School of the Arts, Media, Performance & Design',
    }],
  },
  {
    tier: 'Bronze',
    chip: 'h-20 w-56 border-[3px] border-[#B77946] border-t-[#DCAD82] border-b-[#8D5832] p-4 shadow-[0_0_0_1px_#71472C,0_4px_18px_#B7794620] sm:h-24 sm:w-64 sm:p-5',
    sponsors: [
      { name: 'PCBWay', logo: pcbwayLogo, href: 'https://www.pcbway.com/' },
      { name: 'Youth Culture Inc.', logo: youthCultureLogo, href: 'https://youthculture.com/' },
    ],
  },
  {
    tier: 'In-kind',
    chip: 'h-16 w-[calc((100vw-4rem)/2)] max-w-44 border-2 border-black p-3 sm:h-20 sm:w-56 sm:max-w-none sm:p-4',
    sponsors: [
      { name: 'Art of Problem Solving', logo: aopsLogo, href: 'https://artofproblemsolving.com/' },
      { name: 'CodeCrafters', logo: codeCraftersLogo, href: 'https://codecrafters.io/' },
      { name: 'Toronto Public Library', logo: tplLogo, href: 'https://www.torontopubliclibrary.ca/' },
      { name: 'NordVPN', logo: nordvpnLogo, href: 'https://nordvpn.com/' },
      { name: 'NordPass', logo: nordpassLogo, href: 'https://nordpass.com/' },
      { name: 'Incogni', logo: incogniLogo, href: 'https://incogni.com/', wordmark: true },
      { name: 'Saily', logo: sailyLogo, href: 'https://saily.com/' },
      { name: '.xyz', logo: xyzLogo, href: 'https://gen.xyz/' },
      { name: 'University of Waterloo', logo: waterlooLogo, href: 'https://uwaterloo.ca/', cropPadding: true },
      { name: 'McMaster Engineering', logo: mcmasterLogo, href: 'https://www.eng.mcmaster.ca/' },
    ],
  },
  {
    tier: 'Partner',
    chip: 'h-16 w-[calc((100vw-4rem)/2)] max-w-44 border-2 border-black p-3 sm:h-20 sm:w-56 sm:max-w-none sm:p-4',
    sponsors: [{ name: 'Wolfram Alpha', logo: wolframAlphaLogo, href: 'https://www.wolframalpha.com/' }],
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
          {[[sponsorRows[0]], [sponsorRows[1]], sponsorRows.slice(2)].map((rows, rowIndex) => (
            <div key={rows[0].tier} data-sponsor-layout={rowIndex === 2 ? 'small' : undefined} className={`flex flex-wrap items-center justify-center gap-4 sm:gap-6 ${rowIndex === 2 ? 'w-full max-w-[968px]' : 'max-w-full'}`}>
              {rows.map(row => (
                <div key={row.tier} role="group" aria-label={`${row.tier} sponsors`} data-sponsor-tier={row.tier} className="contents">
                  {row.sponsors.map((sponsor, i) => (
                    <motion.a
                      key={sponsor.name}
                      href={sponsor.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={sponsor.name}
                      initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{ duration: 0.55, delay: (rowIndex * 2 + i) * 0.08, ease: 'easeOut' }}
                      className={`${row.chip} flex items-center justify-center rounded-2xl bg-white transition-transform hover:-rotate-1 hover:scale-105`}
                    >
                      {sponsor.cropPadding ? <svg role="img" aria-label={sponsor.name} viewBox="42 34 315 90" width="315" height="90" className="max-h-full max-w-full">
                        {/* Frame the visible artwork, leaving clear space without changing the original image. */}
                        <image href={sponsor.logo} x="0" y="0" width="400" height="160" />
                      </svg> : sponsor.wordmark ? <span className="inline-flex items-center gap-2 text-2xl font-semibold tracking-tight text-black"><img src={sponsor.logo} alt="" loading="lazy" decoding="async" className="h-5 w-9 object-contain" />{sponsor.name}</span> : <span className="flex h-full w-full flex-col items-center justify-center gap-2">
                        <img src={sponsor.logo} alt={sponsor.name} loading="lazy" decoding="async" className={`${sponsor.caption ? 'max-h-14 sm:max-h-16' : 'max-h-full'} max-w-full object-contain`} />
                        {sponsor.caption && <span className="text-center text-xs leading-tight text-[#272727] sm:text-sm">{sponsor.caption}</span>}
                      </span>}
                    </motion.a>
                  ))}
                </div>
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
          <a
            href={EVENT.contactMailto}
            aria-label={`Email ${EVENT.contactEmail} about sponsorship`}
            className="inline-flex items-center rounded-full bg-[#F68A42] px-8 py-3 text-base font-medium text-white"
          >
            <Mail className="mr-2" size={18} />
            Contact Us
          </a>
        </motion.div>
      </div>
    </section>
  );
}
