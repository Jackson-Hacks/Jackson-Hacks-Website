import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import MarqueeBanner from '@/components/landing/MarqueeBanner';
import { Button } from '@/components/ui/button';
import {
  ChevronDown,
  Sparkles,
  Zap,
  Code2,
  Users,
  Trophy,
  Lightbulb,
  Coffee,
  Rocket,
  CalendarDays,
  MapPin,
  MoveRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import cuteLogo from '@/assets/visuals/cuteLogoClearBackground.png';
import squiggleGradient from '@/assets/visuals/drive-download-20260424T030637Z-3-001/squiggleGradient.png';
import squiggle2Gradient from '@/assets/visuals/drive-download-20260424T030637Z-3-001/squiggle2Gradient.png';
import squiggleBlue from '@/assets/visuals/drive-download-20260424T030637Z-3-001/squiggleBlue.png';
import squiggleOrange from '@/assets/visuals/drive-download-20260424T030637Z-3-001/squiggleOrange.png';
import cubesOrange from '@/assets/visuals/drive-download-20260424T030637Z-3-001/cubesOrange.png';
import cubesBlue from '@/assets/visuals/drive-download-20260424T030637Z-3-001/cubesBlue.png';
import cubesWhite from '@/assets/visuals/drive-download-20260424T030637Z-3-001/cubesWhite.png';
import blobBlue from '@/assets/visuals/drive-download-20260424T030637Z-3-001/blobBlue.png';
import pawprintGradient from '@/assets/visuals/drive-download-20260424T030657Z-3-001/pawprintGradient.png';
import pawprintWhite from '@/assets/visuals/drive-download-20260424T030657Z-3-001/pawprintWhite.png';

const branchNodes = [
  {
    title: 'Build Projects',
    description: 'Create innovative tech projects from scratch in just 24 hours with your team.',
    icon: Code2,
    accent: 'blue',
  },
  {
    title: 'Meet People',
    description: 'Connect with like-minded hackers, mentors, and industry professionals.',
    icon: Users,
    accent: 'orange',
  },
  {
    title: 'Learn Skills',
    description: 'Attend workshops and learn from experts in AI, web dev, and more.',
    icon: Lightbulb,
    accent: 'orange',
  },
  {
    title: 'Win Prizes',
    description: 'Compete for amazing prizes and recognition for your innovative solutions.',
    icon: Trophy,
    accent: 'blue',
  },
  {
    title: 'Free Food & Swag',
    description: 'Enjoy free meals, snacks, and take home exclusive hackathon merch.',
    icon: Coffee,
    accent: 'blue',
  },
  {
    title: 'Launch Ideas',
    description: 'Turn your wildest ideas into reality and kickstart your tech journey.',
    icon: Rocket,
    accent: 'orange',
  },
];

const accentStyles = {
  blue: 'bg-[#2072C7]/20 text-[#6EA8DF]',
  orange: 'bg-[#F68A42]/20 text-[#F68A42]',
};

function BranchCard({ node, large = false }) {
  const Icon = node.icon;
  return (
    <div className="rounded-2xl border border-white/10 bg-[#2C2C2C]/90 p-6 text-left transition-colors hover:border-white/25 sm:p-7">
      <div className={`mb-4 inline-flex rounded-xl p-3 ${accentStyles[node.accent]} ${large ? 'sm:p-4' : ''}`}>
        <Icon size={large ? 26 : 22} />
      </div>
      <h3 className={`font-title text-[#F3F1F1] ${large ? 'text-xl sm:text-2xl' : 'text-lg'}`}>{node.title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#B4BAC0] sm:text-base sm:leading-7">{node.description}</p>
    </div>
  );
}

/*
 * Scrolling down through this section slides the ENTIRE screen sideways.
 * Behind the panels, decoration layers translate at slower rates (parallax),
 * and each panel's content scales/tilts as it passes through center.
 */
const featurePanels = [
  {
    number: '01',
    title: 'Build & Connect',
    blurb: 'Team up, start from zero, and ship something real before the clock runs out.',
    nodes: [branchNodes[0], branchNodes[1]],
    decor: { src: squiggleBlue, className: 'right-[4%] top-[8%] w-60 rotate-12 opacity-30' },
  },
  {
    number: '02',
    title: 'Learn & Win',
    blurb: 'Workshops all day, mentors on call, and prize categories for every kind of builder.',
    nodes: [branchNodes[2], branchNodes[3]],
    decor: { src: squiggle2Gradient, className: 'left-[3%] bottom-[6%] w-60 -rotate-6 opacity-35' },
  },
  {
    number: '03',
    title: 'Fuel & Launch',
    blurb: 'Free food and swag to keep you going, and a launchpad for your wildest ideas.',
    nodes: [branchNodes[4], branchNodes[5]],
    decor: { src: cubesOrange, className: 'right-[4%] bottom-[10%] w-48 opacity-35' },
  },
];

// Content pops as its panel passes through the middle of the screen
function Panel({ index, progress, decor, children }) {
  const center = index / 4;
  const scale = useTransform(progress, [center - 0.25, center, center + 0.25], [0.88, 1, 0.88]);
  const opacity = useTransform(progress, [center - 0.25, center, center + 0.25], [0.3, 1, 0.3]);
  const rotate = useTransform(progress, [center - 0.25, center, center + 0.25], [1.5, 0, -1.5]);

  return (
    <div className="relative flex h-full w-screen shrink-0 items-center justify-center px-6 sm:px-10">
      {decor && (
        <img src={decor.src} alt="" aria-hidden="true" className={`pointer-events-none absolute ${decor.className}`} />
      )}
      <motion.div style={{ scale, opacity, rotate }} className="w-full max-w-6xl">
        {children}
      </motion.div>
    </div>
  );
}

// Background doodads spread across a wide strip that drifts slower than the panels
const parallaxDoodads = [
  { src: blobBlue, className: 'left-[4vw] top-[5%] w-[26rem] opacity-10' },
  { src: cubesWhite, className: 'left-[38vw] bottom-[8%] w-44 opacity-10' },
  { src: squiggleOrange, className: 'left-[62vw] top-[12%] w-64 rotate-12 opacity-15' },
  { src: squiggleGradient, className: 'left-[95vw] bottom-[14%] w-72 -rotate-6 opacity-15' },
  { src: cubesBlue, className: 'left-[128vw] top-[8%] w-48 opacity-15' },
  { src: squiggleBlue, className: 'left-[158vw] bottom-[8%] w-60 rotate-6 opacity-15' },
  { src: blobBlue, className: 'left-[190vw] top-[16%] w-80 opacity-10' },
  { src: squiggle2Gradient, className: 'left-[225vw] top-[6%] w-64 rotate-12 opacity-15' },
];

function AboutHorizontal() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const panelCount = 5; // intro + 3 feature panels + CTA
  const x = useTransform(scrollYProgress, [0, 1], ['0vw', `-${(panelCount - 1) * 100}vw`]);
  // Slower layers create depth while everything glides sideways
  const doodadX = useTransform(scrollYProgress, [0, 1], ['0vw', '-160vw']);
  const trailX = useTransform(scrollYProgress, [0, 1], ['0vw', '-280vw']);
  const glowBlueX = useTransform(scrollYProgress, [0, 1], ['0vw', '55vw']);
  const glowOrangeX = useTransform(scrollYProgress, [0, 1], ['0vw', '-55vw']);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative bg-[#212121]"
      style={{ height: `${panelCount * 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-[#F68A42]/40 to-transparent" />

        {/* Backdrop: grid texture + drifting glows */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(243,241,241,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(243,241,241,0.04)_1px,transparent_1px)] bg-[size:90px_90px]" />
        <motion.div
          style={{ x: glowBlueX }}
          className="pointer-events-none absolute left-[4%] top-[10%] h-96 w-96 rounded-full bg-[#2072C7]/15 blur-[130px]"
        />
        <motion.div
          style={{ x: glowOrangeX }}
          className="pointer-events-none absolute bottom-[8%] right-[-10%] h-96 w-96 rounded-full bg-[#F68A42]/10 blur-[140px]"
        />

        {/* Slow parallax layer of brand doodads */}
        <motion.div style={{ x: doodadX }} className="pointer-events-none absolute inset-y-0 left-0 w-[280vw]">
          {parallaxDoodads.map((d, i) => (
            <img key={i} src={d.src} alt="" aria-hidden="true" className={`absolute ${d.className}`} />
          ))}
        </motion.div>

        {/* Pawprint trail wandering across the whole run */}
        <motion.div style={{ x: trailX }} className="pointer-events-none absolute left-0 top-[72%] w-[420vw]">
          {Array.from({ length: 30 }).map((_, i) => (
            <img
              key={i}
              src={pawprintWhite}
              alt=""
              aria-hidden="true"
              className="absolute w-14 opacity-10"
              style={{
                left: `${4 + i * 14}vw`,
                top: i % 2 === 0 ? '0px' : '44px',
                transform: `rotate(${i % 2 === 0 ? 18 : -14}deg)`,
              }}
            />
          ))}
        </motion.div>

        {/* The panels themselves */}
        <motion.div style={{ x }} className="relative z-10 flex h-full">
          {/* Panel 1: intro */}
          <Panel index={0} progress={scrollYProgress}>
            <div className="relative text-center">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-title text-[24vw] leading-none text-white/[0.04]"
              >
                JH
              </span>
              <motion.span
                aria-hidden="true"
                animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-10 right-[16%] text-[#F68A42]"
              >
                <Sparkles size={30} />
              </motion.span>
              <motion.span
                aria-hidden="true"
                animate={{ y: [0, 10, 0], rotate: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute bottom-0 left-[12%] text-[#6EA8DF]"
              >
                <Sparkles size={24} />
              </motion.span>

              <span className="mb-4 block text-xs font-semibold uppercase tracking-widest text-[#F68A42] sm:text-sm">
                About the event
              </span>
              <h2 className="font-title text-4xl text-[#F3F1F1] sm:text-6xl md:text-7xl">
                What is Jackson Hacks?
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#B4BAC0] sm:text-xl sm:leading-8">
                Jackson Hacks is a 24-hour hackathon where students come together to build creative
                tech projects, learn from workshops, meet new people, and turn ideas into something real.
              </p>
              <div className="mt-10 flex items-center justify-center gap-3 text-sm uppercase tracking-widest text-[#8A9199]">
                Keep scrolling
                <motion.span
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-[#F68A42]"
                >
                  <MoveRight size={20} />
                </motion.span>
              </div>
            </div>
          </Panel>

          {/* Panels 2-4: features */}
          {featurePanels.map((panel, i) => (
            <Panel key={panel.number} index={i + 1} progress={scrollYProgress} decor={panel.decor}>
              <div className="relative grid items-center gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-28 left-0 select-none font-title text-[10rem] leading-none text-white/[0.05] lg:-top-36 lg:text-[14rem]"
                >
                  {panel.number}
                </span>
                <div className="relative">
                  <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-[#F68A42] sm:text-sm">
                    {panel.number} / 03
                  </span>
                  <h3 className="font-title text-4xl text-[#F3F1F1] sm:text-5xl">{panel.title}</h3>
                  <p className="mt-4 max-w-md text-base leading-7 text-[#B4BAC0] sm:text-lg">{panel.blurb}</p>
                </div>
                <div className="grid gap-5">
                  {panel.nodes.map((node) => (
                    <BranchCard key={node.title} node={node} large />
                  ))}
                </div>
              </div>
            </Panel>
          ))}

          {/* Panel 5: CTA */}
          <Panel index={4} progress={scrollYProgress}>
            <div className="relative flex flex-col items-center gap-6 text-center">
              <img
                src={pawprintGradient}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute -left-8 top-2 w-28 -rotate-12 opacity-30 sm:-left-24"
              />
              <img
                src={pawprintGradient}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute -right-8 bottom-8 w-24 rotate-12 opacity-25 sm:-right-20"
              />
              <motion.img
                src={cuteLogo}
                alt=""
                aria-hidden="true"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-96 sm:w-[38rem]"
              />
              <p className="font-title text-3xl text-[#F3F1F1] sm:text-4xl">Sounds fun?</p>
              <Link to={createPageUrl('Register')}>
                <Button
                  size="lg"
                  className="rounded-full bg-[#F68A42] px-10 py-6 text-lg font-semibold text-white shadow-lg shadow-black/20 transition-all hover:bg-[#E06E0A] hover:scale-105"
                >
                  <Zap className="mr-2" size={20} />
                  Apply Now
                </Button>
              </Link>
            </div>
          </Panel>
        </motion.div>
      </div>
    </section>
  );
}

// Phones get a plain vertical list — horizontal scroll-jacking feels broken on touch
function AboutVertical() {
  return (
    <section id="about" className="relative overflow-hidden bg-[#212121] py-12 sm:py-16">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F68A42]/40 to-transparent" />
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-10">
          <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-[#F68A42] sm:text-sm">
            About the event
          </span>
          <h2 className="font-title text-3xl text-[#F3F1F1] sm:text-4xl">What is Jackson Hacks?</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B4BAC0] sm:text-lg">
            Jackson Hacks is a 24-hour hackathon where students come together to build creative
            tech projects, learn from workshops, meet new people, and turn ideas into something real.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {branchNodes.map((node, index) => (
            <motion.div
              key={node.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              <BranchCard node={node} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HeroSection() {
  const isMobile = useIsMobile();
  const { scrollY } = useScroll();
  // Doodads drift at different rates as you scroll for a parallax feel
  const squiggleY = useTransform(scrollY, [0, 800], [0, 90]);
  const cubesOrangeY = useTransform(scrollY, [0, 800], [0, -80]);
  const cubesBlueX = useTransform(scrollY, [0, 800], [0, 40]);
  const logoY = useTransform(scrollY, [0, 700], [0, -40]);

  return (
    <>
      <section className="relative overflow-hidden bg-[#272727] pt-28 pb-16 sm:pt-32 sm:pb-20">
        {/* Background texture and gradient glows */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(243,241,241,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(243,241,241,0.04)_1px,transparent_1px)] bg-[size:90px_90px]" />
        <motion.div
          animate={{ y: [0, -24, 0], opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-10 left-[8%] h-80 w-80 rounded-full bg-[#2072C7]/20 blur-[120px]"
        />
        <motion.div
          animate={{ y: [0, 24, 0], opacity: [0.25, 0.5, 0.25] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-10 right-[8%] h-96 w-96 rounded-full bg-[#F68A42]/15 blur-[140px]"
        />

        {/* Brand doodads with scroll parallax — positioned fully inside so nothing gets clipped */}
        <motion.div
          style={{ y: squiggleY }}
          className="pointer-events-none absolute left-[2%] top-[18%] hidden xl:block"
        >
          <img src={squiggleGradient} alt="" aria-hidden="true" className="w-72 -rotate-12 opacity-50" />
        </motion.div>
        <motion.div
          style={{ y: cubesOrangeY }}
          className="pointer-events-none absolute right-[4%] top-[12%] hidden xl:block"
        >
          <motion.img
            src={cubesOrange}
            alt=""
            aria-hidden="true"
            animate={{ y: [0, -14, 0], rotate: [0, 4, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            className="w-52 opacity-50"
          />
        </motion.div>
        <motion.div
          style={{ y: squiggleY }}
          className="pointer-events-none absolute bottom-[16%] right-[3%] hidden xl:block"
        >
          <img src={squiggle2Gradient} alt="" aria-hidden="true" className="w-60 rotate-12 opacity-40" />
        </motion.div>
        <motion.div
          style={{ x: cubesBlueX }}
          className="pointer-events-none absolute bottom-[10%] left-[5%] hidden xl:block"
        >
          <motion.img
            src={cubesBlue}
            alt=""
            aria-hidden="true"
            animate={{ y: [0, 12, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="w-44 opacity-40"
          />
        </motion.div>

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#2072C7]/50 bg-[#2072C7]/15 px-4 py-2 text-sm text-[#9CC4EA]"
          >
            <Sparkles size={16} className="text-[#F68A42]" />
            <span>Applications Now Open</span>
          </motion.div>

          <h1 className="sr-only">Jackson Hacks</h1>
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
            style={{ y: logoY }}
            className="relative"
          >
            {/* Soft light halo so the hand-drawn strokes pop on the dark background */}
            <div className="absolute inset-x-[10%] inset-y-[18%] rounded-[50%] bg-[#F3F1F1]/25 blur-[90px]" />
            <img
              src={cuteLogo}
              alt="Jackson Hacks — hand-drawn wordmark with a sleeping jaguar cub"
              className="relative w-full max-w-xl drop-shadow-[0_0_24px_rgba(243,241,241,0.35)] sm:max-w-2xl"
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-lg font-medium text-[#B4BAC0] sm:text-2xl"
          >
            Build. Learn. Connect. Innovate.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-3 text-sm text-[#F3F1F1] sm:text-base"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5">
              <CalendarDays size={15} className="text-[#F68A42]" />
              November 21st, 2026
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5">
              <MapPin size={15} className="text-[#F68A42]" />
              A. Y. Jackson SS
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link to={createPageUrl('Register')}>
              <Button
                size="lg"
                className="rounded-full bg-[#F68A42] px-10 py-6 text-lg font-semibold text-white shadow-lg shadow-black/20 transition-all hover:bg-[#E06E0A] hover:scale-105"
              >
                <Zap className="mr-2" size={20} />
                Apply Now
              </Button>
            </Link>
            <a href="#about">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-white/25 bg-transparent px-8 py-6 text-lg text-[#F3F1F1] hover:bg-white/10 hover:text-[#F3F1F1]"
              >
                Learn More
              </Button>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65 }}
            className="mt-6 grid w-full max-w-2xl grid-cols-3 gap-8"
          >
            {[
              { value: '24', label: 'Hours' },
              { value: '200+', label: 'Hackers' },
              { value: '$5K+', label: 'In Prizes' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-title text-3xl font-bold text-[#6EA8DF] md:text-4xl">{stat.value}</div>
                <div className="mt-1 text-sm text-[#B4BAC0]">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <a
          href="#about"
          aria-label="Scroll to learn more"
          className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[#F3F1F1]/50 transition-colors hover:text-[#F3F1F1]"
        >
          <motion.span
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="block"
          >
            <ChevronDown size={32} />
          </motion.span>
        </a>
      </section>

      {/* Crossed scrolling ribbons, Hack the North style */}
      <MarqueeBanner />

      {/* What is Jackson Hacks: scrolling down slides the whole screen sideways */}
      {isMobile ? <AboutVertical /> : <AboutHorizontal />}
    </>
  );
}
