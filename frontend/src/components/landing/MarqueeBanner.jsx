import React from 'react';
import pawprintBlack from '@/assets/visuals/drive-download-20260424T030657Z-3-001/pawprintBlack.png';
import pawprintWhite from '@/assets/visuals/drive-download-20260424T030657Z-3-001/pawprintWhite.png';

const items = [
  'Jackson Hacks',
  'November 21, 2026',
  '24 Hours',
  'A. Y. Jackson SS',
  '200+ Hackers',
  '$5K+ In Prizes',
  'Free Food & Swag',
];

const variants = {
  orange: { bar: 'bg-[#F68A42] text-[#272727]', paw: pawprintBlack },
  blue: { bar: 'bg-[#2072C7] text-white', paw: pawprintWhite },
};

function Strip({ variant, reverse = false }) {
  const v = variants[variant];
  // Two identical halves inside a w-max flex track; translating -50% loops seamlessly
  const half = (key) => (
    <div key={key} className="flex shrink-0 items-center gap-6 pr-6">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          <span className="whitespace-nowrap font-title text-base font-bold uppercase tracking-wider sm:text-lg">
            {item}
          </span>
          <img src={v.paw} alt="" className="h-5 w-5 shrink-0 object-contain opacity-80" />
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className={`${v.bar} overflow-hidden py-2.5 shadow-lg shadow-black/30`}>
      <div className={`flex w-max ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}>
        {half('a')}
        {half('b')}
      </div>
    </div>
  );
}

export default function MarqueeBanner({ single = false }) {
  const gridTexture = (
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(243,241,241,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(243,241,241,0.04)_1px,transparent_1px)] bg-[size:90px_90px]" />
  );

  if (single) {
    return (
      <div aria-hidden="true" className="relative overflow-hidden bg-[#272727] py-4">
        {gridTexture}
        <div className="relative -mx-4 rotate-[0.8deg]">
          <Strip variant="blue" reverse />
        </div>
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="relative overflow-hidden bg-[#272727] py-6">
      {gridTexture}
      <div className="relative -mx-6 -rotate-[1.4deg]">
        <Strip variant="orange" />
      </div>
      <div className="relative -mx-6 -mt-7 rotate-[1.4deg]">
        <Strip variant="blue" reverse />
      </div>
    </div>
  );
}
