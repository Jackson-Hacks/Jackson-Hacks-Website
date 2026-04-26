import React from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

const faqs = [
  {
    question: "What is a hackathon?",
    answer: "A hackathon is an event where students come together to create tech-based projects over a set period (usually 24 hours). You'll work in teams to build something amazing, attend workshops, connect with mentors, and compete for prizes!"
  },
  {
    question: "Do I need coding experience?",
    answer: "Not at all! Hackathons are for everyone, regardless of skill level. We have workshops for beginners, experienced mentors to help you, and you can contribute to your team in many ways - design, ideation, presentation, and more."
  },
  {
    question: "Is it free to attend?",
    answer: "Yes! The hackathon is completely free to attend. Thanks to our amazing sponsors, we provide free food, drinks, snacks, and swag throughout the event."
  },
  {
    question: "What should I bring?",
    answer: "Bring your laptop, charger, any hardware you want to use, toiletries, a change of clothes (if staying overnight), sleeping bag or blanket, and most importantly - your creativity and enthusiasm!"
  },
  {
    question: "Can I participate solo or do I need a team?",
    answer: "You can participate either way! If you don't have a team, don't worry - we'll have team formation activities at the start of the event where you can meet other hackers and form a team."
  },
  {
    question: "What can I build?",
    answer: "Anything you can dream of! Whether it's a web app, mobile app, game, hardware project, AI tool, or something completely unique - as long as it involves technology, you're good to go."
  },
  {
    question: "Will there be food?",
    answer: "Absolutely! We provide all meals throughout the event including breakfast, lunch, dinner, and midnight snacks. We also accommodate dietary restrictions - just let us know in your application."
  },
  {
    question: "How are projects judged?",
    answer: "Projects are judged based on innovation, technical complexity, design, usefulness, and presentation. We have multiple prize categories so there are many ways to win!"
  }
];

export default function FAQSection() {
  const isMobile = useIsMobile();

  return (
    <section id="faq" className="relative py-32 bg-[#272727]">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#084F9A]/14 via-transparent to-transparent" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={isMobile ? false : { opacity: 0, y: 30 }}
          whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
          viewport={isMobile ? undefined : { once: true }}
          transition={isMobile ? undefined : { duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-[#2072C7] text-sm font-semibold tracking-widest uppercase mb-4 block">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-6">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-[#2072C7] to-[#F68A42] bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-xl text-gray-400">
            Everything you need to know about the hackathon
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={isMobile ? false : { opacity: 0, y: 30 }}
          whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
          viewport={isMobile ? undefined : { once: true }}
          transition={isMobile ? undefined : { duration: 0.8, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-[#084F9A]/12 border border-[#2072C7]/20 rounded-xl px-6 data-[state=open]:bg-[#084F9A]/20 transition-colors"
              >
                <AccordionTrigger className="text-left text-white hover:text-[#F68A42] text-lg font-medium py-5 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-400 pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={isMobile ? false : { opacity: 0, y: 20 }}
          whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
          viewport={isMobile ? undefined : { once: true }}
          transition={isMobile ? undefined : { duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-400">
            Still have questions?{' '}
            <a href="mailto:hello@hackathon.com" className="text-[#2072C7] hover:text-[#F68A42] underline underline-offset-4">
              Reach out to us
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}