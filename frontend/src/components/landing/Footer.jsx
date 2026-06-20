import React from 'react';
import { Github, Heart, Instagram, Linkedin, Mail, Twitter } from 'lucide-react';

const socialLinks = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:hello@hackathon.com', label: 'Email' },
];

const quickLinks = [
  { label: 'Location', href: '#location' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Sponsors', href: '#sponsors' },
  { label: 'Team', href: '#team' },
  { label: 'Code of Conduct', href: '#' },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-[#D7E4F5] bg-[#F7F9FC]">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:py-12 lg:py-14">
        <div className="grid gap-10 md:grid-cols-[1.25fr_0.75fr_1fr] lg:gap-14">
          <div>
            <h3 className="mb-4 font-title text-2xl text-[#1F2933]">
              <span className="bg-gradient-to-r from-[#F68A42] to-[#2072C7] bg-clip-text text-transparent">
                JACKSON HACKS
              </span>
            </h3>
            <p className="mb-6 max-w-md text-sm leading-6 text-[#52606D] sm:text-base">
              Join us for a day of building, learning, and connecting with fellow hackers from around the region.
            </p>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="rounded-full bg-white p-2.5 text-[#52606D] shadow-sm ring-1 ring-[#D7E4F5] transition-colors hover:bg-[#084F9A] hover:text-white"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-title text-[#1F2933]">Quick Links</h4>
            <ul className="grid grid-cols-2 gap-3 text-sm sm:block sm:space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-[#52606D] transition-colors hover:text-[#F68A42]">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-title text-[#1F2933]">Get in Touch</h4>
            <div className="space-y-4 text-sm text-[#52606D] sm:text-base">
              <p>
                <span className="text-[#697586]">General Inquiries:</span>
                <br />
                <a href="mailto:hello@hackathon.com" className="transition-colors hover:text-[#F68A42]">
                  hello@hackathon.com
                </a>
              </p>
              <p>
                <span className="text-[#697586]">Sponsorship:</span>
                <br />
                <a href="mailto:sponsor@hackathon.com" className="transition-colors hover:text-[#F68A42]">
                  sponsor@hackathon.com
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[#D7E4F5] pt-6 text-sm text-[#697586] sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright {new Date().getFullYear()} Jackson Hacks. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart size={14} className="text-[#F68A42]" /> by the organizing team
          </p>
        </div>
      </div>
    </footer>
  );
}
