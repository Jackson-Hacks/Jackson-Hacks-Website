import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const faqs = [
  {
    question: 'What is a hackathon?',
    answer: "A hackathon is an event where students come together to create tech-based projects over a set period. You'll work in teams to build something useful, attend workshops, connect with mentors, and compete for prizes.",
  },
  {
    question: 'Do I need coding experience?',
    answer: 'Not at all. Hackathons are for everyone, regardless of skill level. Workshops and mentors will help beginners, and teams need design, ideation, presentation, and product thinking too.',
  },
  {
    question: 'Is it free to attend?',
    answer: 'Yes. The hackathon is completely free to attend. Sponsors help provide food, drinks, snacks, and swag throughout the event.',
  },
  {
    question: 'What should I bring?',
    answer: 'Bring your laptop, charger, any hardware you want to use, toiletries if needed, and your creativity. We will share a final packing list before the event.',
  },
  {
    question: 'Can I participate solo or do I need a team?',
    answer: "You can participate either way. If you do not have a team, we will have team formation activities at the start of the event so you can meet other hackers.",
  },
  {
    question: 'What can I build?',
    answer: 'Anything you can dream of: a web app, mobile app, game, hardware project, AI tool, or something completely unique, as long as it involves technology.',
  },
  {
    question: 'Will there be food?',
    answer: 'Absolutely. We provide meals and snacks throughout the event. We also accommodate dietary restrictions when they are included in your application.',
  },
  {
    question: 'How are projects judged?',
    answer: 'Projects are judged based on innovation, technical complexity, design, usefulness, and presentation. Multiple prize categories mean there are many ways to win.',
  },
];

function FAQItem({ faq, index, isOpen, onToggle }) {
  return (
    <div
      className={`group cursor-pointer rounded-2xl border bg-white transition-all duration-200 ${
        isOpen
          ? 'border-[#F68A42]/40 shadow-md shadow-[#F68A42]/8'
          : 'border-[#D7E4F5] hover:border-[#2072C7]/30 hover:shadow-sm'
      }`}
      onClick={onToggle}
    >
      <div className="flex items-start gap-4 p-5 sm:p-6">
        <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
          isOpen ? 'bg-[#F68A42] text-white' : 'bg-[#EEF4FB] text-[#2072C7]'
        }`}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-[#1F2933] sm:text-base">{faq.question}</h3>
            <ChevronDown
              size={18}
              className={`shrink-0 text-[#697586] transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#F68A42]' : 'group-hover:text-[#2072C7]'}`}
            />
          </div>
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <p className="mt-3 text-sm leading-6 text-[#52606D] sm:text-base">{faq.answer}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const isMobile = useIsMobile();
  const [openIndex, setOpenIndex] = useState(null);

  const left = faqs.filter((_, i) => i % 2 === 0);
  const right = faqs.filter((_, i) => i % 2 === 1);

  return (
    <section id="faq" className="relative overflow-hidden bg-[#F7F9FC] py-12 sm:py-16 lg:py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2072C7]/25 to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(8,79,154,0.06),transparent_48%,rgba(246,138,66,0.05))]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div
          initial={false}
          whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
          viewport={isMobile ? undefined : { once: true }}
          transition={isMobile ? undefined : { duration: 0.7 }}
          className="mb-10 grid gap-4 sm:mb-12 md:grid-cols-2 md:items-end"
        >
          <div>
            <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-[#2072C7] sm:text-sm">
              Got Questions?
            </span>
            <h2 className="font-title text-3xl text-[#1F2933] sm:text-4xl md:text-5xl lg:text-6xl">
              Frequently Asked<br className="hidden sm:block" /> Questions
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#52606D] sm:text-base md:justify-self-end md:text-right">
            The practical stuff: teams, skill levels,<br className="hidden md:block" /> food, judging, and what to bring.
          </p>
        </motion.div>

        <motion.div
          initial={false}
          whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
          viewport={isMobile ? undefined : { once: true }}
          transition={isMobile ? undefined : { duration: 0.7, delay: 0.15 }}
          className="grid gap-3 md:grid-cols-2 md:items-start md:gap-4"
        >
          <div className="flex flex-col gap-3 md:gap-4">
            {left.map((faq) => {
              const globalIndex = faqs.indexOf(faq);
              return (
                <FAQItem
                  key={faq.question}
                  faq={faq}
                  index={globalIndex}
                  isOpen={openIndex === globalIndex}
                  onToggle={() => setOpenIndex(openIndex === globalIndex ? null : globalIndex)}
                />
              );
            })}
          </div>
          <div className="flex flex-col gap-3 md:gap-4">
            {right.map((faq) => {
              const globalIndex = faqs.indexOf(faq);
              return (
                <FAQItem
                  key={faq.question}
                  faq={faq}
                  index={globalIndex}
                  isOpen={openIndex === globalIndex}
                  onToggle={() => setOpenIndex(openIndex === globalIndex ? null : globalIndex)}
                />
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={false}
          whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
          viewport={isMobile ? undefined : { once: true }}
          transition={isMobile ? undefined : { duration: 0.6, delay: 0.3 }}
          className="mt-10 text-center sm:mt-12"
        >
          <p className="text-sm text-[#52606D] sm:text-base">
            Still have questions?{' '}
            <a href="mailto:hello@hackathon.com" className="font-semibold text-[#F68A42] underline underline-offset-4 hover:text-[#2072C7] transition-colors">
              Reach out to us
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
