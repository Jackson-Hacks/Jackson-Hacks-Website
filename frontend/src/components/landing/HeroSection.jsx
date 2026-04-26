import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
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
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const branchNodes = [
  {
    title: 'Build Projects',
    description: 'Create innovative tech projects from scratch in just 24 hours with your team.',
    icon: Code2,
    position: 'top-[10%] left-[-2%] md:left-[2%]'
  },
  {
    title: 'Meet People',
    description: 'Connect with like-minded hackers, mentors, and industry professionals.',
    icon: Users,
    position: 'top-[10%] right-[-2%] md:right-[2%]'
  },
  {
    title: 'Learn Skills',
    description: 'Attend workshops and learn from experts in AI, web dev, and more.',
    icon: Lightbulb,
    position: 'top-[40%] left-[-5%] md:left-[-1%]'
  },
  {
    title: 'Win Prizes',
    description: 'Compete for amazing prizes and recognition for your innovative solutions.',
    icon: Trophy,
    position: 'top-[40%] right-[-5%] md:right-[-1%]'
  },
  {
    title: 'Free Food & Swag',
    description: 'Enjoy free meals, snacks, and take home exclusive hackathon merch.',
    icon: Coffee,
    position: 'top-[70%] left-[2%] md:left-[6%]'
  },
  {
    title: 'Launch Ideas',
    description: 'Turn your wildest ideas into reality and kickstart your tech journey.',
    icon: Rocket,
    position: 'top-[70%] right-[2%] md:right-[6%]'
  },
];

const jhIconSvg = new URL(
  '../../assets/visuals/drive-download-20260424T030625Z-3-001/JH_Icons_SVG_thin.svg',
  import.meta.url
).href;

export default function HeroSection() {
  const containerRef = useRef(null);
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const triangleScale = useTransform(scrollYProgress, [0, 0.25, 0.55, 0.75, 0.9], [2.8, 0.9, 0.65, 0.65, 0.45]);
  const triangleY = 60;
  const triangleOpacity = useTransform(scrollYProgress, [0, 0.03, 0.14, 0.75, 0.9], [0, 0, 0.95, 0.95, 0]);
  const introOpacity = useTransform(scrollYProgress, [0, 0.2, 0.34], [1, 1, 0]);
  const introScale = useTransform(scrollYProgress, [0, 0.15, 0.3], [1, 0.9, 0.72]);
  const branchOpacity = useTransform(scrollYProgress, [0.55, 0.65, 1], [0, 1, 1]);
  const branchLineProgress = useTransform(scrollYProgress, [0.68, 0.82, 0.92], [0, 1, 1]);
  const branchScale = useTransform(scrollYProgress, [0.55, 0.82, 0.92], [0.92, 1, 1]);
  const branchLineOpacity = useTransform(scrollYProgress, [0.68, 0.8, 0.9, 1], [0, 1, 1, 0.2]);
  const jhIconOpacity = useTransform(scrollYProgress, [0, 0.8, 0.9, 1], [0, 0, 1, 1]);
  const jhIconScale = useTransform(scrollYProgress, [0.8, 0.9], [3.2, 0.3]);
  const jhIconY = useTransform(scrollYProgress, [0.8, 0.9], [-580, -20]);
  const centerOpacity = useTransform(scrollYProgress, [0.35, 0.45, 0.75, 0.9], [0, 1, 1, 0]);
  const centerScale = useTransform(scrollYProgress, [0.35, 0.5, 0.75, 0.9], [0.88, 1, 1, 0.82]);

  if (isMobile) {
    return (
      <section className="relative overflow-visible bg-[#272727] pt-24 pb-16">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2072C7] via-[#5A78AF] to-[#F68A42]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:70px_70px] opacity-30" />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-center gap-8 px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm">
            <Sparkles size={16} className="text-white" />
            <span>Applications Now Open</span>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
            <span className="block text-white">JACKSON</span>
            <span className="block text-white">HACKS</span>
          </h1>

          <p className="text-base font-light text-white/95 sm:text-xl">
            Build. Learn. Connect. Innovate.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-white sm:text-base">
            <span className="rounded-full border border-white/35 bg-white/10 px-4 py-1.5">
              November 21st, 2026
            </span>
            <span className="rounded-full border border-white/35 bg-white/10 px-4 py-1.5">
              A. Y. Jackson SS
            </span>
          </div>

          <div className="flex w-full max-w-sm flex-col items-center justify-center gap-3">
            <Link className="w-full" to={createPageUrl('Register')}>
              <Button
                size="lg"
                className="w-full rounded-full bg-[#F68A42] px-8 py-5 text-base text-white shadow-lg shadow-black/20 transition-all hover:bg-[#E06E0A]"
              >
                <Zap className="mr-2" size={20} />
                Apply Now
              </Button>
            </Link>
            <a className="w-full" href="#location">
              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-full border-white/40 px-8 py-5 text-base text-black hover:bg-white/10 hover:text-white"
              >
                Learn More
              </Button>
            </a>
          </div>

          <div className="grid w-full max-w-md grid-cols-3 gap-3">
            {[
              { value: '24', label: 'Hours' },
              { value: '200+', label: 'Hackers' },
              { value: '$5K+', label: 'In Prizes' },
            ].map((stat) => (
              <div key={stat.label} className="text-center text-white">
                <div className="text-xl font-bold text-white sm:text-3xl">{stat.value}</div>
                <div className="mt-1 text-xs text-white/95 sm:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="w-full max-w-xl rounded-3xl border border-white/20 bg-[#272727]/40 p-5 text-left text-white backdrop-blur-sm sm:p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-white/80">About the event</p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">What is Jackson Hacks?</h2>
            <p className="mt-3 text-sm leading-6 text-white/90 sm:text-base sm:leading-7">
              Jackson Hacks is a 24-hour hackathon where students come together to build
              creative tech projects, learn from workshops, meet new people, and turn ideas
              into something real.
            </p>
          </div>

          <div className="w-full max-w-xl text-left text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-white/80">What you can do</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {branchNodes.map((node) => {
                const Icon = node.icon;

                return (
                  <div
                    key={node.title}
                    className="rounded-2xl border border-white/15 bg-white/10 p-4 text-left backdrop-blur-sm"
                  >
                    <div className="mb-3 inline-flex rounded-xl bg-white/15 p-2 text-white">
                      <Icon size={18} />
                    </div>
                    <h3 className="text-base font-semibold text-white">{node.title}</h3>
                    <p className="mt-1 text-sm leading-5 text-white/90">
                      {node.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="relative h-[800vh] bg-[#272727]">
      <div className="sticky top-0 h-screen overflow-hidden bg-gradient-to-b from-[#2072C7] via-[#5A78AF] to-[#F68A42]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:90px_90px] opacity-30" />
          <motion.div
            animate={{ y: [0, -24, 0], opacity: [0.2, 0.45, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-16 left-10 w-80 h-80 rounded-full bg-white/10 blur-[120px]"
          />
          <motion.div
            animate={{ y: [0, 24, 0], opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-16 right-10 w-96 h-96 rounded-full bg-[#272727]/20 blur-[140px]"
          />
        </div>

        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="relative h-full w-full max-w-7xl">
            <motion.svg
              aria-hidden="true"
              viewBox="0 0 1200 900"
              className="pointer-events-none absolute inset-0 h-full w-full"
              style={{ scale: triangleScale, y: triangleY, opacity: triangleOpacity }}
            >
              <motion.polygon
                points="40,70 1160,70 600,860"
                fill="none"
                stroke="white"
                strokeWidth="6"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </motion.svg>

            <motion.div
              style={{ scale: introScale, opacity: introOpacity }}
              className="relative z-20 mx-auto flex h-full max-w-4xl flex-col items-center justify-center text-center"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm"
              >
                <Sparkles size={16} className="text-white" />
                <span>Applications Now Open</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className="mt-8 text-6xl font-black tracking-tight text-white md:text-8xl lg:text-9xl"
              >
                <span className="block text-white">JACKSON</span>
                <span className="block text-white">HACKS</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="mt-4 text-xl font-light text-white/95 md:text-2xl"
              >
                Build. Learn. Connect. Innovate.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.45 }}
                className="mt-8 flex flex-wrap items-center justify-center gap-4 text-lg text-white"
              >
                <span className="rounded-full border border-white/35 bg-white/10 px-4 py-1.5">
                  📅 November 21st, 2026
                </span>
                <span className="rounded-full border border-white/35 bg-white/10 px-4 py-1.5">
                  📍 A. Y. Jackson SS
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
              >
                <Link to={createPageUrl('Register')}>
                  <Button
                    size="lg"
                    className="rounded-full bg-[#F68A42] px-10 py-6 text-lg text-white shadow-lg shadow-black/20 transition-all hover:bg-[#E06E0A] hover:scale-105"
                  >
                    <Zap className="mr-2" size={20} />
                    Apply Now
                  </Button>
                </Link>
                <a href="#location">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full border-white/40 px-8 py-6 text-lg text-black hover:bg-white/10 hover:text-white"
                  >
                    Learn More
                  </Button>
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="mt-14 grid w-full max-w-2xl grid-cols-3 gap-8"
              >
                {[
                  { value: '24', label: 'Hours' },
                  { value: '200+', label: 'Hackers' },
                  { value: '$5K+', label: 'In Prizes' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center text-white">
                    <div className="text-3xl font-bold text-white md:text-4xl">{stat.value}</div>
                    <div className="mt-1 text-sm text-white">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.svg
              aria-hidden="true"
              viewBox="0 0 1200 900"
              className="pointer-events-none absolute inset-0 h-full w-full"
            >
            </motion.svg>

            <motion.div
              style={{ opacity: jhIconOpacity, scale: jhIconScale, y: jhIconY, transformOrigin: '50% calc(50% + 60px)' }}
              className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
            >
              <img
                src={jhIconSvg}
                alt="JH icon"
                className="h-auto w-[1500px] object-contain md:w-[2000px]"
              />
            </motion.div>

            {branchNodes.map((node, index) => {
              const Icon = node.icon;
              return (
                <motion.div
                  key={node.title}
                  style={{ opacity: branchOpacity, scale: branchScale }}
                  className={`absolute hidden w-[320px] rounded-2xl border border-white/30 bg-[#272727]/30 p-4 text-left backdrop-blur-md md:block ${node.position}`}
                >
                  <div className="mb-3 inline-flex rounded-xl bg-white/15 p-3 text-white">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{node.title}</h3>
                  <p
                    className="mt-2 text-sm leading-6 text-white/90"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {node.description}
                  </p>
                </motion.div>
              );
            })}

            <motion.div
              style={{ opacity: centerOpacity, scale: centerScale }}
                className="absolute inset-0 flex items-start justify-center px-6 pt-24 md:pt-20"
            >
              <div className="relative flex w-full max-w-4xl items-center justify-center">
                <div className="relative h-[470px] w-full max-w-[550px]">
                  <div className="relative z-10 flex h-full translate-y-6 flex-col items-center justify-center px-8 pb-8 pt-14 text-center md:translate-y-8 md:px-10 md:pb-10 md:pt-16">
                    <h2 className="whitespace-nowrap text-3xl font-black text-white md:text-4xl">
                    What is Jackson Hacks?
                    </h2>
                    <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-white/95 md:text-lg">
                      Jackson Hacks is an epic event where students<br />come together to create amazing tech<br />projects in just 24 hours. It&apos;s a<br />race against the clock, filled<br />with learning, <br />collaboration, and <br />innovation.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        <motion.a
          href="#location"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/90 transition-colors hover:text-white"
        >
          <ChevronDown size={32} />
        </motion.a>
      </div>
    </section>
  );
}