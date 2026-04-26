import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';

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

export default function FAQSection() {
  const isMobile = useIsMobile();

  return (
    <section id="faq" className="relative overflow-hidden bg-[#272727] py-12 sm:py-16 lg:py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F68A42]/45 to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(8,79,154,0.16),transparent_48%,rgba(246,138,66,0.08))]" />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <motion.div
          initial={false}
          whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
          viewport={isMobile ? undefined : { once: true }}
          transition={isMobile ? undefined : { duration: 0.8 }}
          className="mb-8 grid gap-5 sm:mb-10 md:grid-cols-[0.85fr_1.15fr] md:items-end"
        >
          <div>
            <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-[#2072C7] sm:text-sm">
              Got Questions?
            </span>
            <h2 className="font-title text-3xl text-[#F3F1F1] sm:text-4xl md:text-6xl">
              Frequently Asked Questions
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-[#F3F1F1]/75 sm:text-lg md:justify-self-end">
            The practical stuff: teams, skill levels, food, judging, and what to bring.
          </p>
        </motion.div>

        <motion.div
          initial={false}
          whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
          viewport={isMobile ? undefined : { once: true }}
          transition={isMobile ? undefined : { duration: 0.8, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq.question}
                value={`item-${index}`}
                className="rounded-xl border border-[#2072C7]/25 bg-[#084F9A]/35 px-4 shadow-sm transition-colors data-[state=open]:border-[#F68A42]/45 sm:px-6"
              >
                <AccordionTrigger className="py-4 text-left text-base font-semibold text-[#F3F1F1] hover:text-[#F68A42] hover:no-underline sm:py-5 sm:text-lg">
                  <span className="flex min-w-0 items-center gap-3 pr-3">
                    <HelpCircle size={18} className="shrink-0 text-[#F68A42]" />
                    <span>{faq.question}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-6 text-[#F3F1F1]/75 sm:text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          initial={false}
          whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
          viewport={isMobile ? undefined : { once: true }}
          transition={isMobile ? undefined : { duration: 0.6, delay: 0.4 }}
          className="mt-8 text-center sm:mt-10"
        >
          <p className="text-sm text-[#F3F1F1]/70 sm:text-base">
            Still have questions?{' '}
            <a href="mailto:hello@hackathon.com" className="font-semibold text-[#F68A42] underline underline-offset-4 hover:text-[#2072C7]">
              Reach out to us
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

