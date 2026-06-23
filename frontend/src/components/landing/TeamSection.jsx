import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Megaphone, Palette, Handshake, Users } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const teamMembers = [
  {
    name: 'Webdev',
    role: 'Website, registration, judging tools, and demos',
    icon: Code2,
    accent: '#2072C7',
    bg: 'bg-[#EEF4FB]',
  },
  {
    name: 'Creative',
    role: 'Brand, visuals, hacker experience, signage, and social assets',
    icon: Palette,
    accent: '#F68A42',
    bg: 'bg-[#FFF4EC]',
  },
  {
    name: 'Logistics',
    role: 'Venue, food, check-in, and event flow',
    icon: Users,
    accent: '#0EA5E9',
    bg: 'bg-[#EFF9FF]',
  },
  {
    name: 'Marketing',
    role: 'Social media, announcements, outreach, and community hype',
    icon: Megaphone,
    accent: '#8B5CF6',
    bg: 'bg-[#F5F3FF]',
  },
  {
    name: 'Sponsorship',
    role: 'Sponsor relations, packages, partners, and event support',
    icon: Handshake,
    accent: '#10B981',
    bg: 'bg-[#ECFDF5]',
  },
];

export default function TeamSection() {
  const isMobile = useIsMobile();

  return (
    <section id="team" className="relative overflow-hidden bg-white py-12 sm:py-16 lg:py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2072C7]/25 to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(246,138,66,0.05),transparent_44%,rgba(8,79,154,0.06))]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div
          initial={false}
          whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
          viewport={isMobile ? undefined : { once: true }}
          transition={isMobile ? undefined : { duration: 0.8 }}
          className="mb-10 max-w-3xl sm:mb-12"
        >
          <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-[#F68A42] sm:text-sm">
            The People Behind
          </span>
          <h2 className="font-title text-3xl text-[#1F2933] sm:text-4xl md:text-6xl">Meet the Team</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#3F4D5A] sm:text-lg">
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
          {teamMembers.map((member, index) => {
            const Icon = member.icon;
            return (
              <motion.div
                key={index}
                whileHover={isMobile ? undefined : { y: -6 }}
                transition={{ duration: 0.2 }}
                className="group relative overflow-hidden rounded-2xl border border-[#D7E4F5] bg-white shadow-sm transition-all duration-200 hover:border-transparent hover:shadow-lg hover:shadow-[#084F9A]/12"
              >
                <div className="h-1 w-full" style={{ backgroundColor: member.accent }} />
                <div className="p-5 sm:p-6">
                  <div className={`mb-4 inline-flex rounded-xl p-3 ${member.bg}`} style={{ color: member.accent }}>
                    <Icon size={22} />
                  </div>
                  <h3 className="mb-2 font-title text-xl text-[#1F2933]">{member.name}</h3>
                  <p className="text-sm leading-5 text-[#52606D]">{member.role}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={false}
          whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
          viewport={isMobile ? undefined : { once: true }}
          transition={isMobile ? undefined : { duration: 0.8, delay: 0.4 }}
          className="rounded-2xl border border-[#D7E4F5] bg-[#F8FAFD] p-5 sm:p-6"
        >
          <p className="flex flex-col gap-3 text-sm leading-6 text-[#52606D] sm:flex-row sm:items-center sm:text-base">
            <Users size={20} className="shrink-0 text-[#F68A42]" />
            Team bios and photos are coming soon. For now, each lane shows what the organizing team is actively covering.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
