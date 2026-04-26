import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const teamMembers = [
  {
    name: 'Team Member 1',
    role: 'Organizer',
    image: '👤',
  },
  {
    name: 'Team Member 2',
    role: 'Organizer',
    image: '👤',
  },
  {
    name: 'Team Member 3',
    role: 'Organizer',
    image: '👤',
  },
  {
    name: 'Team Member 4',
    role: 'Organizer',
    image: '👤',
  },
];

export default function TeamSection() {
  const isMobile = useIsMobile();

  return (
    <section id="team" className="relative py-32 bg-[#272727]">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F68A42]/5 to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={isMobile ? false : { opacity: 0, y: 30 }}
          whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
          viewport={isMobile ? undefined : { once: true }}
          transition={isMobile ? undefined : { duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-[#F68A42] text-sm font-semibold tracking-widest uppercase mb-4 block">
            The People Behind
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-6">
            Meet the{' '}
            <span className="bg-gradient-to-r from-[#2072C7] to-[#084F9A] bg-clip-text text-transparent">
              Team
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            The passionate organizers making Jackson Hacks happen
          </p>
        </motion.div>

        {/* Team grid */}
        <motion.div
          initial={isMobile ? false : { opacity: 0, y: 30 }}
          whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
          viewport={isMobile ? undefined : { once: true }}
          transition={isMobile ? undefined : { duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              whileHover={isMobile ? undefined : { y: -8 }}
              className="rounded-2xl border border-white/10 bg-[#084F9A]/10 p-6 text-center hover:bg-[#084F9A]/20 transition-colors"
            >
              <div className="text-5xl mb-4">{member.image}</div>
              <h3 className="text-xl font-semibold text-white mb-1">{member.name}</h3>
              <p className="text-gray-400">{member.role}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Placeholder message */}
        <motion.div
          initial={isMobile ? false : { opacity: 0, y: 30 }}
          whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
          viewport={isMobile ? undefined : { once: true }}
          transition={isMobile ? undefined : { duration: 0.8, delay: 0.4 }}
          className="text-center"
        >
          <div className="inline-block px-8 py-4 rounded-2xl bg-[#2072C7]/10 border border-[#2072C7]/25">
            <p className="text-gray-300 flex items-center gap-2">
              <Users size={20} />
              Team bios and photos coming soon
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
