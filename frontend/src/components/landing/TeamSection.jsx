import React, { useId, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import pawprintWhite from '@/assets/visuals/drive-download-20260424T030657Z-3-001/pawprintWhite.webp';
import philipYu from '@/assets/team/philip-yu.jpg';
import graceYao from '@/assets/team/grace-yao.webp';
import ellaLi from '@/assets/team/ella-li.webp';
import davidHuang from '@/assets/team/david-huang.webp';
import ayaanZahoor from '@/assets/team/ayaan-zahoor.webp';
import somyungHong from '@/assets/team/somyung-hong.webp';
import rickyTu from '@/assets/team/ricky-tu.webp';
import joannaZhang from '@/assets/team/joanna-zhang.webp';
import ryanZhang from '@/assets/team/ryan-zhang.webp';
import kentaOgawaHollander from '@/assets/team/kenta-ogawa-hollander.webp';
import ethanVuong from '@/assets/team/ethan-vuong.webp';
import simonLu from '@/assets/team/simon-lu.webp';
import avinChiu from '@/assets/team/avin-chiu.webp';
import oliviaYu from '@/assets/team/olivia-yu.webp';
import connerLee from '@/assets/team/conner-lee.webp';
import andrewLiu from '@/assets/team/andrew-liu.webp';
import justinChen from '@/assets/team/justin-chen.webp';
import timothyChiang from '@/assets/team/timothy-chiang.webp';
import richardLi from '@/assets/team/richard-li.webp';

const organizers = [
  { name: 'Philip Yu', title: 'President', fact: 'I like frogs!', photo: philipYu },
  {
    name: 'Grace Yao',
    title: 'VP Marketing',
    fact: 'I love all things STEM and my cat, Rocky! Excited to support Jackson Hacks this year and hopefully many more to come. 🐈‍⬛',
    photo: graceYao,
  },
  {
    name: 'Ella Li',
    title: 'VP Logistics',
    fact: 'Two roads diverged in a wood, and I took both in parallel because OCaml supports multicore, and that has made all the difference.',
    photo: ellaLi,
  },
  { name: 'David Huang', title: 'VP Web Development', fact: 'I like coding and robotics.', photo: davidHuang },
  {
    name: 'Ayaan Zahoor',
    title: 'VP Sponsorship',
    fact: 'My life is a paradox. I love sleeping because I have dreams. But my dreams require me not to sleep.',
    photo: ayaanZahoor,
  },
  { name: 'Somyung Hong', title: 'VP Creative', fact: 'I have a penguin lamp.', photo: somyungHong },
  { name: 'Ricky Tu', team: 'Logistics', fact: 'I like playing basketball.', photo: rickyTu },
  { name: 'Joanna Zhang', team: 'Marketing', fact: 'I love IKEA.', photo: joannaZhang },
  {
    name: 'Ryan Zhang',
    team: 'Web Development',
    fact: "I've attended six different schools so far, three of which were just in middle school!",
    photo: ryanZhang,
  },
  {
    name: 'Kenta Ogawa-Hollander',
    team: 'Sponsorships',
    fact: 'I hate homework and love money. Get it, sponsorships?',
    photo: kentaOgawaHollander,
  },
  {
    name: 'Ethan Vuong',
    team: 'Marketing',
    fact: "I've spent more than 500 hours of my life editing and double that on a game. 💔",
    photo: ethanVuong,
  },
  {
    name: 'Simon Lu',
    team: 'Sponsorships',
    fact: 'I had surgery on my appendix when I was 9. I was born in Chattanooga, Tennessee.',
    photo: simonLu,
  },
  { name: 'Avin Chiu', team: 'Logistics', fact: 'I love almond milk.', photo: avinChiu },
  { name: 'Olivia Yu', team: 'Creative', fact: 'I think strawberries are way too sour.', photo: oliviaYu },
  { name: 'Conner Lee', team: 'Sponsorships', fact: 'I like playing soccer. 🤞', photo: connerLee },
  { name: 'Andrew Liu', team: 'Logistics', fact: 'I like turtles.', photo: andrewLiu },
  { name: 'Justin Chen', team: 'Web Development', fact: 'I love ducks and working with hardware!', photo: justinChen },
  { name: 'Timothy Chiang', team: 'Marketing', fact: 'My mom grew a whole lettuce in the backyard.', photo: timothyChiang },
  { name: 'Richard Li', team: 'Creative', fact: 'Hi, I swim and occasionally play piano.', photo: richardLi },
];

function PawPortrait({ organizer }) {
  const id = useId().replace(/:/g, '');
  const pad = 'M77 100C77 83 96 79 110 57C122 36 147 28 162 40C184 53 190 72 178 88C172 96 172 104 178 112C190 128 184 147 162 160C147 172 122 164 110 143C96 121 77 117 77 100Z';
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full overflow-visible" aria-hidden="true" data-facing="left">
      <defs>
        <clipPath id={`paw-pad-${id}`}><path d={pad} /></clipPath>
        <linearGradient id={`paw-color-${id}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="currentColor" /><stop offset="1" stopColor="currentColor" stopOpacity="0.6" /></linearGradient>
      </defs>
      <g fill={`url(#paw-color-${id})`}>
        <ellipse cx="72" cy="42" rx="23" ry="17" transform="rotate(35 72 42)" />
        <ellipse cx="34" cy="78" rx="24" ry="18" transform="rotate(12 34 78)" />
        <ellipse cx="34" cy="122" rx="24" ry="18" transform="rotate(-12 34 122)" />
        <ellipse cx="72" cy="158" rx="23" ry="17" transform="rotate(-35 72 158)" />
        <path d={pad} />
      </g>
      <image href={organizer.photo} x="76" y="32" width="112" height="136" preserveAspectRatio="xMidYMid slice" clipPath={`url(#paw-pad-${id})`} />
      <path d={pad} fill="none" stroke="currentColor" strokeWidth="4" />
    </svg>
  );
}

function OrganizerPortrait({ organizer, duplicate, activeName, onSelect }) {
  const Wrapper = duplicate ? 'div' : 'article';
  const active = activeName === organizer.name;
  return (
    <Wrapper className="team-person relative shrink-0 text-center" aria-label={duplicate ? undefined : organizer.name}>
      <button
        type="button"
        tabIndex={duplicate ? -1 : 0}
        aria-label={`Meet ${organizer.name}, ${organizer.title || organizer.team}`}
        aria-controls="team-fun-fact"
        aria-pressed={active}
        onPointerEnter={() => onSelect(organizer)}
        onPointerLeave={event => {
          if (event.pointerType !== 'touch' && !event.currentTarget.matches(':focus-visible')) onSelect(null);
        }}
        onFocus={() => onSelect(organizer)}
        onBlur={() => onSelect(null)}
        onClick={() => onSelect(organizer)}
        className={`team-portrait relative mx-auto block rounded-2xl outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#212121] ${active ? 'is-selected' : ''}`}
      >
        <PawPortrait organizer={organizer} />
      </button>
      <h3 className="mt-4 px-2 font-title text-sm leading-5 text-[#F3F1F1] sm:text-base">{organizer.name}</h3>
      <p className="mt-1 px-2 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#A8B5C1] sm:text-[0.65rem]">{organizer.title || organizer.team}</p>
    </Wrapper>
  );
}

function TeamRow({ members, blue, paused, activeName, onSelect, onHover, onFocusChange }) {
  return (
    <div
      className={`team-lane ${blue ? 'team-lane-blue' : ''}`}
      role="region"
      aria-label={blue ? 'Team portraits, second row' : 'Team portraits, first row'}
      onPointerEnter={() => onHover(true)}
      onPointerLeave={() => onHover(false)}
      onFocusCapture={() => onFocusChange(true)}
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          event.currentTarget.scrollLeft = 0;
          onFocusChange(false);
        }
      }}
    >
      <div className="team-track" style={{ animationDuration: `${members.length * 6}s`, animationPlayState: paused ? 'paused' : 'running' }}>
        {[false, true].map(duplicate => (
          <div key={String(duplicate)} className={`team-track-group ${duplicate ? 'team-track-copy' : ''}`} aria-hidden={duplicate ? true : undefined}>
            {members.map(organizer => <OrganizerPortrait key={organizer.name} {...{ organizer, duplicate, activeName, onSelect }} />)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TeamSection() {
  const [active, setActive] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const reducedMotion = useReducedMotion();
  const paused = isPaused || isHovered || isFocused || reducedMotion;

  return (
    <section id="team" className="relative overflow-hidden bg-[#212121] py-14 sm:py-20" onKeyDown={event => { if (event.key === 'Escape') setActive(null); }}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_40%,rgba(32,114,199,0.12),transparent_55%),radial-gradient(ellipse_at_90%_70%,rgba(246,138,66,0.1),transparent_55%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F68A42]/35 to-transparent" />
      <img src={pawprintWhite} alt="" aria-hidden="true" className="pointer-events-none absolute -left-8 top-5 w-44 -rotate-90 opacity-[0.025] sm:w-64" />
      <img src={pawprintWhite} alt="" aria-hidden="true" className="pointer-events-none absolute -right-12 bottom-10 w-64 -rotate-90 opacity-[0.025]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-6 grid gap-6 px-6 sm:mb-10 sm:px-10 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-12">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center lg:text-left">
            <h2 className="font-title text-4xl leading-tight text-[#F3F1F1] sm:text-5xl lg:text-6xl">Meet the Team</h2>
            {!reducedMotion && <button type="button" onClick={() => setIsPaused(value => !value)} className="sr-only focus:not-sr-only focus:mt-3 focus:rounded-full focus:border focus:border-white/20 focus:px-3 focus:py-2 focus:text-xs focus:text-white focus:outline focus:outline-2 focus:outline-[#F68A42]">{isPaused ? 'Resume team animation' : 'Pause team animation'}</button>}
          </motion.div>

          <div id="team-fun-fact" role="region" aria-label="Selected organizer" aria-live="polite" aria-atomic="true" className={`relative flex min-h-[160px] items-center rounded-2xl border px-6 py-5 transition-colors sm:min-h-[180px] sm:px-7 ${active ? 'border-[#F68A42]/30 bg-[#292625]/90' : 'border-transparent'}`}>
            {active && <div className="w-full">
              <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1"><p className="font-title text-xl text-white sm:text-2xl">{active.name}</p><p className="text-xs font-semibold uppercase tracking-wider text-[#F68A42]">{active.title || active.team}</p></div>
              <p className="text-sm leading-6 text-[#D0D4D8] sm:text-base">{active.fact}</p>
            </div>}
          </div>
        </div>

        <div>
          {[organizers.slice(0, 10), organizers.slice(10)].map((members, index) => <TeamRow key={index} members={members} blue={index === 1} {...{ paused }} activeName={active?.name} onSelect={setActive} onHover={setIsHovered} onFocusChange={setIsFocused} />)}
        </div>
      </div>
    </section>
  );
}
