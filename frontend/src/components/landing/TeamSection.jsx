import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Megaphone, Palette, Handshake, Users } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const teamMembers = [
  {
    name: 'Webdev',
    role: 'Website, registration, judging tools, and demos',
    icon: Code2,
  },
  {
    name: 'Creative',
    role: 'Brand, visuals, hacker experience, signage, and social assets',
    icon: Palette,
  },
  {
    name: 'Logistics',
    role: 'Venue, food, check-in, and event flow',
    icon: Users,
  },
  {
    name: 'Marketing',
    role: 'Social media, announcements, outreach, and community hype',
    icon: Megaphone,
  },
  {
    name: 'Sponsorship',
    role: 'Sponsor relations, packages, partners, and event support',
    icon: Handshake,
  },
];

export default function TeamSection() {
  const isMobile = useIsMobile();

  return (
    <section id="team" className="relative overflow-hidden bg-[#272727] py-12 sm:py-16 lg:py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2072C7]/35 to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(246,138,66,0.09),transparent_44%,rgba(8,79,154,0.14))]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <motion.div
          initial={false}
          whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
          viewport={isMobile ? undefined : { once: true }}
          transition={isMobile ? undefined : { duration: 0.8 }}
          className="mb-8 max-w-3xl sm:mb-10"
        >
          <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-[#F68A42] sm:text-sm">
            The People Behind
          </span>
          <h2 className="font-title text-3xl text-[#F3F1F1] sm:text-4xl md:text-6xl">Meet the Team</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#F3F1F1]/75 sm:text-lg">
            A student-led crew handling the pieces that turn a school day into a polished hackathon.
          </p>
        </motion.div>

        <motion.div
          initial={false}
          whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
          viewport={isMobile ? undefined : { once: true }}
          transition={isMobile ? undefined : { duration: 0.8, delay: 0.2 }}
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              whileHover={isMobile ? undefined : { y: -8 }}
              className="rounded-2xl border border-[#2072C7]/25 bg-[#084F9A]/35 p-5 shadow-sm transition-colors hover:border-[#F68A42]/45 sm:p-6"
            >
              <div className="mb-5 inline-flex rounded-lg bg-[#2072C7]/30 p-3 text-[#F3F1F1]">
                <member.icon size={24} />
              </div>
              <h3 className="mb-2 font-title text-xl text-[#F3F1F1]">{member.name}</h3>
              <p className="text-sm leading-6 text-[#F3F1F1]/70">{member.role}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={false}
          whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
          viewport={isMobile ? undefined : { once: true }}
          transition={isMobile ? undefined : { duration: 0.8, delay: 0.4 }}
          className="rounded-2xl border border-[#2072C7]/20 bg-[#272727] p-5 sm:p-6"
        >
          <p className="flex flex-col gap-3 text-sm leading-6 text-[#F3F1F1]/75 sm:flex-row sm:items-center sm:text-base">
            <Users size={20} className="shrink-0 text-[#F68A42]" />
            Team bios and photos are coming soon. For now, each lane shows what the organizing team is actively covering.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

