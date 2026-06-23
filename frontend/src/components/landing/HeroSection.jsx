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
  CalendarDays,
  MapPin,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useIsMobile } from '@/hooks/use-mobile';


const branchNodes = [
  {
    title: 'Build Projects',
    description: 'Create innovative tech projects from scratch in just 24 hours with your team.',
    icon: Code2,
    position: 'top-[10%] xl:left-[2%]'
  },
  {
    title: 'Meet People',
    description: 'Connect with like-minded hackers, mentors, and industry professionals.',
    icon: Users,
    position: 'top-[10%] xl:right-[2%]'
  },
  {
    title: 'Learn Skills',
    description: 'Attend workshops and learn from experts in AI, web dev, and more.',
    icon: Lightbulb,
    position: 'top-[40%] xl:left-[-1%]'
  },
  {
    title: 'Win Prizes',
    description: 'Compete for amazing prizes and recognition for your innovative solutions.',
    icon: Trophy,
    position: 'top-[40%] xl:right-[-1%]'
  },
  {
    title: 'Free Food & Swag',
    description: 'Enjoy free meals, snacks, and take home exclusive hackathon merch.',
    icon: Coffee,
    position: 'top-[70%] xl:left-[4%]'
  },
  {
    title: 'Launch Ideas',
    description: 'Turn your wildest ideas into reality and kickstart your tech journey.',
    icon: Rocket,
    position: 'top-[70%] xl:right-[4%]'
  },
];


export default function HeroSection() {
  const containerRef = useRef(null);
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Triangle shrinks all the way down to near-zero so the jaguar logo can grow out from it
  // Triangle pauses at 0.85 — large enough to contain the center text, then shrinks to the jaguar nose
  const triangleScale = useTransform(scrollYProgress, [0, 0.15, 0.30, 0.48, 0.56, 0.66], [2.8, 0.58, 0.58, 0.58, 0.58, 0.04]);
  const triangleY = 60;
  const triangleOpacity = useTransform(scrollYProgress, [0, 0.08, 0.16, 0.62, 0.68], [0, 0, 0.95, 0.95, 0]);
  const introOpacity = useTransform(scrollYProgress, [0, 0.08, 0.18], [1, 1, 0]);
  const introScale = useTransform(scrollYProgress, [0, 0.1, 0.2], [1, 0.9, 0.72]);
  const branchOpacity = useTransform(scrollYProgress, [0.32, 0.44, 0.60, 0.68], [0, 1, 1, 0]);
  const branchLineProgress = useTransform(scrollYProgress, [0.44, 0.58, 0.68], [0, 1, 1]);
  const branchScale = useTransform(scrollYProgress, [0.32, 0.56, 0.68], [0.92, 1, 1]);
  const branchLineOpacity = useTransform(scrollYProgress, [0.44, 0.56, 0.60, 0.68], [0, 1, 1, 0]);
  // Logo grows out from the triangle nose after everything else fades
  const jhIconOpacity = useTransform(scrollYProgress, [0, 0.62, 0.66, 1], [0, 0, 1, 1]);
  const jhIconScale = useTransform(scrollYProgress, [0.64, 0.82], [0.9, 1.0]);
  const jhIconY = useTransform(scrollYProgress, [0.64, 0.82], [-15, -15]);
  const jhRevealRadius = useTransform(scrollYProgress, [0.64, 0.82], [0, 80]);
  const jhClipPath = useTransform(jhRevealRadius, (r) => `circle(${r}% at 50% 62%)`);
  // Text sits inside the triangle during the pause, then fades as triangle shrinks
  const centerOpacity = useTransform(scrollYProgress, [0.20, 0.30, 0.50, 0.60], [0, 1, 1, 0]);
  const centerScale = useTransform(scrollYProgress, [0.20, 0.33, 0.50, 0.60], [0.88, 1, 1, 0.82]);

  if (isMobile) {
    return (
      <section className="relative overflow-visible bg-[#F7F9FC] pt-24 pb-16 max-[380px]:pt-20 max-[380px]:pb-12">
        <div className="absolute inset-0 bg-gradient-to-b from-[#C5DFF7] via-[#EDF4FB] to-[#FDECD8]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(32,114,199,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(32,114,199,0.06)_1px,transparent_1px)] bg-[size:70px_70px] opacity-60" />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-center gap-6 px-6 text-center max-[380px]:gap-4 max-[380px]:px-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2072C7]/30 bg-[#2072C7]/8 px-4 py-2 text-sm text-[#2072C7] backdrop-blur-sm">
            <Sparkles size={16} className="text-[#F68A42]" />
            <span>Applications Now Open</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-[#1F2933] sm:text-5xl max-[380px]:text-2xl">
            <span className="block text-[#1F2933]">JACKSON</span>
            <span className="block text-[#1F2933]">HACKS</span>
          </h1>

          <p className="text-sm font-light text-[#52606D] sm:text-xl max-[380px]:text-xs">
            Build. Learn. Connect. Innovate.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-[#1F2933] sm:text-base max-[380px]:gap-2 max-[380px]:text-xs">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#2072C7]/20 bg-white/60 px-4 py-1.5">
              <CalendarDays size={14} className="text-[#F68A42]" />
              November 21st, 2026
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#2072C7]/20 bg-white/60 px-4 py-1.5">
              <MapPin size={14} className="text-[#F68A42]" />
              A. Y. Jackson SS
            </span>
          </div>

          <div className="flex w-full max-w-sm flex-col items-center justify-center gap-2 max-[380px]:gap-1.5">
            <Link className="w-full" to={createPageUrl('Register')}>
              <Button
                size="lg"
                className="w-full rounded-full bg-[#F68A42] px-7 py-4 text-sm text-white shadow-lg shadow-black/20 transition-all hover:bg-[#E06E0A] max-[380px]:px-6 max-[380px]:py-3.5 max-[380px]:text-xs"
              >
                <Zap className="mr-2" size={20} />
                Apply Now
              </Button>
            </Link>
            <a className="w-full" href="#location">
              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-full border-[#2072C7]/40 px-7 py-4 text-sm text-[#2072C7] hover:bg-[#2072C7]/10 max-[380px]:px-6 max-[380px]:py-3.5 max-[380px]:text-xs"
              >
                Learn More
              </Button>
            </a>
          </div>

          <div className="w-full max-w-xl rounded-3xl border border-[#D7E4F5] bg-white/80 p-4 text-left text-[#1F2933] backdrop-blur-sm sm:p-6 max-[380px]:p-3.5">
            <p className="text-xs uppercase tracking-[0.2em] text-[#697586] max-[380px]:text-[10px]">About the event</p>
            <h2 className="mt-2 text-xl font-black sm:text-3xl max-[380px]:mt-1 max-[380px]:text-lg">What is Jackson Hacks?</h2>
            <p className="mt-2 text-sm leading-5 text-[#52606D] sm:text-base sm:leading-7 max-[380px]:text-xs max-[380px]:leading-4 max-[430px]:text-xs max-[430px]:leading-4">
              Jackson Hacks is a 24-hour hackathon where students come together to build
              creative tech projects, learn from workshops, meet new people, and turn ideas
              into something real.
            </p>
          </div>

          <div className="w-full max-w-xl text-left text-[#1F2933]">
            <p className="text-xs uppercase tracking-[0.2em] text-[#697586] max-[380px]:text-[10px] max-[430px]:text-[10px]">What you can do</p>
            <div className="mt-3 grid grid-cols-1 gap-3 max-[380px]:gap-2 max-[430px]:gap-2">
              {branchNodes.map((node) => {
                const Icon = node.icon;

                return (
                  <div
                    key={node.title}
                    className="rounded-2xl border border-[#D7E4F5] bg-white/80 p-3 text-left backdrop-blur-sm max-[380px]:p-2.5 max-[430px]:p-2.5"
                  >
                    <div className="mb-2 inline-flex rounded-xl bg-[#2072C7]/10 p-2 text-[#2072C7] max-[380px]:mb-1.5 max-[380px]:p-1.5 max-[430px]:mb-1.5 max-[430px]:p-1.5">
                      <Icon size={16} className="max-[380px]:h-3.5 max-[380px]:w-3.5" />
                    </div>
                    <h3 className="text-sm font-semibold text-[#1F2933] max-[380px]:text-xs max-[430px]:text-xs">{node.title}</h3>
                    <p className="mt-1 text-xs leading-4 text-[#52606D] max-[380px]:mt-0.5 max-[380px]:text-[10px] max-[380px]:leading-3.5 max-[430px]:mt-0.5 max-[430px]:text-[10px] max-[430px]:leading-3.5">
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
    <section ref={containerRef} className="relative h-[1000vh] bg-[#F7F9FC]">
      <div className="sticky top-0 h-screen overflow-hidden bg-gradient-to-b from-[#C5DFF7] via-[#EDF4FB] to-[#FDECD8]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(32,114,199,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(32,114,199,0.06)_1px,transparent_1px)] bg-[size:90px_90px] opacity-60" />
          <motion.div
            animate={{ y: [0, -24, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-16 left-10 w-80 h-80 rounded-full bg-[#2072C7]/10 blur-[120px]"
          />
          <motion.div
            animate={{ y: [0, 24, 0], opacity: [0.2, 0.45, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-16 right-10 w-96 h-96 rounded-full bg-[#F68A42]/10 blur-[140px]"
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
                stroke="#2072C7"
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
                className="inline-flex items-center gap-2 rounded-full border border-[#2072C7]/30 bg-[#2072C7]/8 px-4 py-2 text-sm text-[#2072C7] backdrop-blur-sm"
              >
                <Sparkles size={16} className="text-[#F68A42]" />
                <span>Applications Now Open</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className="mt-8 text-6xl font-black tracking-tight text-[#1F2933] md:text-8xl lg:text-9xl"
              >
                <span className="block text-[#1F2933]">JACKSON</span>
                <span className="block text-[#1F2933]">HACKS</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="mt-4 text-xl font-light text-[#52606D] md:text-2xl"
              >
                Build. Learn. Connect. Innovate.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.45 }}
                className="mt-8 flex flex-wrap items-center justify-center gap-4 text-base text-[#1F2933]"
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-[#2072C7]/20 bg-white/60 px-4 py-1.5 backdrop-blur-sm">
                  <CalendarDays size={15} className="text-[#F68A42]" />
                  November 21st, 2026
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#2072C7]/20 bg-white/60 px-4 py-1.5 backdrop-blur-sm">
                  <MapPin size={15} className="text-[#F68A42]" />
                  A. Y. Jackson SS
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
                    className="rounded-full border-[#2072C7]/40 px-8 py-6 text-lg text-[#2072C7] hover:bg-[#2072C7]/10"
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
                  <div key={stat.label} className="text-center text-[#1F2933]">
                    <div className="text-3xl font-bold text-[#2072C7] md:text-4xl">{stat.value}</div>
                    <div className="mt-1 text-sm text-[#52606D]">{stat.label}</div>
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
              <motion.svg
                viewBox="0 0 360.65 373.43"
                xmlns="http://www.w3.org/2000/svg"
                className="h-auto w-[420px]"
                fill="none"
                style={{ clipPath: jhClipPath }}
              >
                <path
                  d="M160,123.62c51.36-21.32,124.28-21.78,161,0l35.75-37.51c39.13-23.24,50-16.36,50,32.71,16.05,20.64-5.31,49.58-18.13,66.11-8.33,10.73-23.91,18.34-34.38,17.25C234.38,204,256.61,293,256.61,293H228.1s14.41-88.9-102.54-89.59c-10,.64-20.49-4.6-29.47-15.07-13.58-15.83-32.25-40.18-20.78-64.49,3.85-55.24,9.17-47,40.67-38.55C141.51,92.17,160,123.62,160,123.62Z"
                  transform="translate(-61.74 -63.28)"
                  stroke="#2072C7"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                />
                <path
                  d="M106.66,201.71c-4.59-22.93-39.44,96.3.91,124.73,0,0,39.75-12.53,59.16,47.7,5.89,3.2,78.27,12.84,68.79-35.77-5.09-5-21.51-20.62-21.51-20.62l-12.13-24.94h9.8s-2.3-30.57-50.45-32.86c-19.72-5.54-28.43-31.65-28.43-31.65S107.57,222.34,106.66,201.71Z"
                  transform="translate(-61.74 -63.28)"
                  stroke="#2072C7"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                />
                <path
                  d="M377.47,201.71c4.58-22.93,39.43,96.3-.92,124.73,0,0-39.75-12.53-59.16,47.7-5.89,3.2-78.27,12.84-68.79-35.77,5.09-5,21.51-20.62,21.51-20.62l12.13-24.94h-9.79s2.29-30.57,50.44-32.86c19.72-5.54,28.44-31.65,28.44-31.65S376.55,222.34,377.47,201.71Z"
                  transform="translate(-61.74 -63.28)"
                  stroke="#2072C7"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                />
                <path
                  d="M186.8,377.06c0,28.74,9.18,20.55,24.9,30.25,7.79,4.8,5.23,19.41,31.76,19.41,29.58,0,25.63-13,31.49-16.81,11-7.11,28.48-7.49,28.28-32.82"
                  transform="translate(-61.74 -63.28)"
                  stroke="#2072C7"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                />
              </motion.svg>
            </motion.div>

            {branchNodes.map((node, index) => {
              const Icon = node.icon;
              return (
                <motion.div
                  key={node.title}
                  style={{ opacity: branchOpacity, scale: branchScale }}
                  className={`absolute hidden w-[260px] 2xl:w-[300px] rounded-2xl border border-[#D7E4F5] bg-white/75 p-4 text-left backdrop-blur-md xl:block ${node.position}`}
                >
                  <div className="mb-3 inline-flex rounded-xl bg-[#2072C7]/10 p-3 text-[#2072C7]">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1F2933]">{node.title}</h3>
                  <p
                    className="mt-2 text-sm leading-6 text-[#52606D]"
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
              className="absolute inset-0 z-10 flex items-center justify-center px-6 pt-[13%]"
            >
              <div className="relative w-full max-w-xs text-center md:max-w-sm">
                <div
                  className="float-left"
                  style={{ width: '42%', height: '340px', shapeOutside: 'polygon(0 0, 100% 100%, 0 100%)' }}
                  aria-hidden="true"
                />
                <div
                  className="float-right"
                  style={{ width: '42%', height: '340px', shapeOutside: 'polygon(100% 0, 0 100%, 100% 100%)' }}
                  aria-hidden="true"
                />
                <h2 className="text-xl font-semibold text-[#1F2933] sm:text-2xl md:text-3xl">
                  What is Jackson Hacks?
                </h2>
                <p className="mt-2 text-xs font-light leading-relaxed text-[#3F4D5A] sm:text-sm md:mt-3 md:text-base">
                  Jackson Hacks is an epic event where students come together to create amazing tech projects in just 24 hours. It&apos;s a race against the clock, filled with learning, collaboration, and innovation.
                </p>
              </div>
            </motion.div>

          </div>
        </div>

        <motion.a
          href="#location"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#1F2933]/60 transition-colors hover:text-[#1F2933]"
        >
          <ChevronDown size={32} />
        </motion.a>
      </div>
    </section>
  );
}