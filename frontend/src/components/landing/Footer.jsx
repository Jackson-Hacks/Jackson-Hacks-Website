import { Github, Heart, Instagram, Linkedin, Mail, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EVENT } from '@/config/event';

const socialLinks = [
  { icon: Instagram, label: 'Instagram' },
  { icon: Twitter, label: 'Twitter' },
  { icon: Github, label: 'GitHub' },
  { icon: Linkedin, label: 'LinkedIn' },
  { icon: Mail, label: 'Email', href: EVENT.contactMailto },
];

const quickLinks = [
  { label: 'Location', href: '#location' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Sponsors', href: '#sponsors' },
  { label: 'Team', href: '#team' },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#1E1E1E]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(243,241,241,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(243,241,241,0.04)_1px,transparent_1px)] bg-[size:90px_90px]" />
      <div className="relative mx-auto max-w-7xl px-6 py-10 sm:py-12 lg:py-14">
        <div className="grid gap-10 md:grid-cols-[1.25fr_0.75fr_1fr] lg:gap-14">
          <div>
            <h2 className="mb-4 font-title text-2xl">
              <span className="text-[#F68A42]">JACKSON</span>{' '}
              <span className="text-[#F3F1F1]">HACKS</span>
            </h2>
            <p className="mb-6 max-w-md text-sm leading-6 text-[#B4BAC0] sm:text-base">
              Join us for a day of building, learning, and connecting with fellow hackers from around the region.
            </p>
            <div className="flex flex-wrap gap-3" aria-label="Social links awaiting approval">
              {socialLinks.map((social) => {
                const SocialElement = social.href ? 'a' : 'span';
                return (
                  <SocialElement
                    key={social.label}
                    {...(social.href ? { href: social.href } : {})}
                    aria-label={social.href ? `Email ${EVENT.contactEmail}` : `${social.label} link coming soon`}
                    title={social.href ? EVENT.contactEmail : `${social.label} link coming soon`}
                    className={`rounded-full bg-white/5 p-2.5 text-[#B4BAC0] ring-1 ring-white/10 ${social.href ? 'transition-colors hover:bg-[#F68A42] hover:text-[#272727]' : ''}`}
                  >
                    <social.icon size={18} aria-hidden="true" />
                  </SocialElement>
                );
              })}
            </div>
          </div>

          <nav aria-label="Footer navigation">
            <h3 className="mb-4 font-title text-[#F3F1F1]">Quick Links</h3>
            <ul className="grid grid-cols-2 gap-3 text-sm sm:block sm:space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-[#B4BAC0] transition-colors hover:text-[#F68A42]">
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link to="/Register" className="text-[#B4BAC0] transition-colors hover:text-[#F68A42]">
                  Apply
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h3 className="mb-4 font-title text-[#F3F1F1]">Get in Touch</h3>
            <a
              href={EVENT.contactMailto}
              className="text-sm text-[#B4BAC0] transition-colors hover:text-[#F68A42] sm:text-base"
            >
              {EVENT.contactEmail}
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-[#8A9199] sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright {new Date().getFullYear()} Jackson Hacks. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart size={14} className="text-[#F68A42]" /> by the organizing team
          </p>
        </div>
      </div>
    </footer>
  );
}
