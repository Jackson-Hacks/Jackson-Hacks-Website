import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import catOrange from '@/assets/visuals/drive-download-20260424T030625Z-3-001/JH_Icons_Orange.png';
import catBlue from '@/assets/visuals/drive-download-20260424T030625Z-3-001/JH_Icons_Blue.png';
import squiggle2Blue from '@/assets/visuals/drive-download-20260424T030637Z-3-001/squiggle2Blue.png';
import blobOrange from '@/assets/visuals/drive-download-20260424T030637Z-3-001/blobOrange.png';

/*
 * Placeholder organizers: a circular frame with the cat mascot inside.
 * When real bios arrive, swap `photo: null` for an image URL and the
 * circle becomes their picture.
 */
const organizers = [
  { name: '???', role: 'Organizer', photo: null },
  { name: '???', role: 'Organizer', photo: null },
  { name: '???', role: 'Organizer', photo: null },
  { name: '???', role: 'Organizer', photo: null },
  { name: '???', role: 'Organizer', photo: null },
];

const catFrames = [
  { cat: catOrange, ring: 'border-[#F68A42]/40', bg: 'bg-[#F68A42]/10' },
  { cat: catBlue, ring: 'border-[#2072C7]/40', bg: 'bg-[#2072C7]/10' },
];

export default function TeamSection() {
  const isMobile = useIsMobile();

  return (
    <section id="team" className="relative overflow-hidden bg-[#212121] py-12 sm:py-16 lg:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(243,241,241,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(243,241,241,0.04)_1px,transparent_1px)] bg-[size:90px_90px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2072C7]/40 to-transparent" />
      <img
        src={squiggle2Blue}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-[2%] top-[14%] hidden w-56 -rotate-6 opacity-25 lg:block"
      />
      <img
        src={blobOrange}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[4%] right-[2%] hidden w-72 opacity-10 lg:block"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7 }}
          className="mb-10 max-w-3xl sm:mb-12"
        >
          <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-[#F68A42] sm:text-sm">
            The People Behind
          </span>
          <h2 className="font-title text-3xl text-[#F3F1F1] sm:text-4xl md:text-6xl">Meet the Team</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B4BAC0] sm:text-lg">
            A student-led crew handling the pieces that turn a school day into a polished hackathon.
          </p>
        </motion.div>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {organizers.map((organizer, index) => {
            const frame = catFrames[index % 2];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: index * 0.06 }}
                whileHover={isMobile ? undefined : { y: -6 }}
                className="group rounded-2xl border border-white/10 bg-[#2C2C2C] transition-colors hover:border-white/20"
              >
                <div className="flex flex-col items-center gap-4 p-6 text-center sm:p-8">
                  <div
                    className={`flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 ${frame.ring} ${frame.bg} sm:h-28 sm:w-28`}
                  >
                    {organizer.photo ? (
                      <img
                        src={organizer.photo}
                        alt={organizer.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={frame.cat}
                        alt=""
                        aria-hidden="true"
                        className="w-14 object-contain transition-transform group-hover:scale-110 sm:w-16"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="font-title text-lg text-[#F3F1F1]">{organizer.name}</h3>
                    <p className="mt-1 text-xs uppercase tracking-widest text-[#8A9199]">{organizer.role}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-2xl border border-white/10 bg-[#2C2C2C] p-5 sm:p-6"
        >
          <p className="flex flex-col gap-3 text-sm leading-6 text-[#B4BAC0] sm:flex-row sm:items-center sm:text-base">
            <Users size={20} className="shrink-0 text-[#F68A42]" />
            The organizing team is hard at work behind the scenes. Faces and names coming soon!
          </p>
        </motion.div>
      </div>
    </section>
  );
}
