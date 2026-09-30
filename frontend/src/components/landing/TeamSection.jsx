import React from 'react';
import { motion } from 'framer-motion';
import catOrange from '@/assets/visuals/drive-download-20260424T030625Z-3-001/JH_Icons_Orange.png';
import squiggle2Blue from '@/assets/visuals/drive-download-20260424T030637Z-3-001/squiggle2Blue.webp';
import blobOrange from '@/assets/visuals/drive-download-20260424T030637Z-3-001/blobOrange.webp';
import philipYu from '@/assets/team/philip-yu.jpg';
import graceYao from '@/assets/team/grace-yao.webp';
import ellaLi from '@/assets/team/ella-li.webp';
import davidHuang from '@/assets/team/david-huang.webp';
import ayaanZahoor from '@/assets/team/ayaan-zahoor.webp';
import somyungHong from '@/assets/team/somyung-hong.webp';
import alexNing from '@/assets/team/alex-ning.webp';
import rickyTu from '@/assets/team/ricky-tu.webp';
import justenVisva from '@/assets/team/justen-visva.webp';
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
  { name: 'Alex Ning', team: 'Marketing', fact: 'I type pretty fast and I love astronomy.', photo: alexNing },
  { name: 'Ricky Tu', team: 'Logistics', fact: 'I like playing basketball.', photo: rickyTu },
  { name: 'Justen Visva', team: 'Sponsorships', fact: 'My favourite colour is blue.', photo: justenVisva },
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

export default function TeamSection() {
  return (
    <section id="team" className="relative overflow-hidden bg-[#212121] py-12 sm:py-16 lg:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(243,241,241,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(243,241,241,0.04)_1px,transparent_1px)] bg-[size:90px_90px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2072C7]/40 to-transparent" />
      <img
        src={squiggle2Blue}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-[2%] top-[14%] hidden w-56 -rotate-6 opacity-25 lg:block"
      />
      <img
        src={blobOrange}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[4%] right-[2%] hidden w-72 opacity-10 lg:block"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7 }}
          className="mb-10 max-w-3xl sm:mb-12"
        >
          <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-[#F68A42] sm:text-sm">
            The People Behind
          </span>
          <h2 className="font-title text-3xl text-[#F3F1F1] sm:text-4xl md:text-6xl">Meet the Team</h2>
        </motion.div>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
          {organizers.map((organizer, index) => (
            <motion.article
              key={organizer.name}
              aria-labelledby={`team-name-${index}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: (index % 6) * 0.04 }}
              whileHover={{ y: -4 }}
              className="min-w-0"
            >
              <div
                tabIndex={0}
                aria-label={`Fun fact about ${organizer.name}`}
                aria-describedby={`team-fact-${index}`}
                className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-white/10 bg-[#2C2C2C] outline-none transition-colors hover:border-white/25 focus-visible:ring-2 focus-visible:ring-[#F68A42]"
              >
                {organizer.photo ? (
                  <img
                    src={organizer.photo}
                    alt={`Photo of ${organizer.name}`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 group-focus:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#272727]">
                    <img
                      src={catOrange}
                      alt=""
                      aria-hidden="true"
                      className="w-24 object-contain opacity-80 transition-transform duration-500 group-hover:scale-105 group-focus:scale-105 sm:w-28"
                    />
                  </div>
                )}
                <div className="absolute inset-0 overflow-y-auto bg-gradient-to-t from-black/95 via-black/80 to-black/25 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus:opacity-100 sm:p-4">
                  <div className="flex min-h-full items-end">
                    <p id={`team-fact-${index}`} className="text-[0.65rem] leading-4 text-white/90 sm:text-xs sm:leading-5">{organizer.fact}</p>
                  </div>
                </div>
              </div>
              <div className="px-1 pb-1 pt-3 text-center">
                <h3 id={`team-name-${index}`} className="font-title text-base leading-tight text-white sm:text-lg">{organizer.name}</h3>
                {(organizer.title || organizer.team) && (
                  <p className="mt-1 text-[0.6rem] font-semibold uppercase tracking-wider text-[#F68A42] sm:text-[0.7rem]">
                    {organizer.title || organizer.team}
                  </p>
                )}
              </div>
            </motion.article>
          ))}
        </div>

      </div>
    </section>
  );
}
