import React from 'react';
import { Github, Twitter, Instagram, Linkedin, Mail, Heart } from 'lucide-react';

const socialLinks = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:hello@hackathon.com', label: 'Email' },
];

const quickLinks = [
  { label: 'About', href: '#about' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Sponsors', href: '#sponsors' },
  { label: 'Code of Conduct', href: '#' },
];

export default function Footer() {
  return (
    <footer className="relative bg-[#080510] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                JACKSON HACKS
              </span>
            </h3>
            <p className="text-gray-400 leading-relaxed mb-6">
              Join us for an incredible weekend of building, learning, and connecting 
              with fellow hackers from around the region.
            </p>
            {/* Social links */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Get in Touch</h4>
            <div className="space-y-3 text-gray-400">
              <p>
                <span className="text-gray-500">General Inquiries:</span><br />
                <a href="mailto:hello@hackathon.com" className="hover:text-purple-400 transition-colors">
                  hello@hackathon.com
                </a>
              </p>
              <p>
                <span className="text-gray-500">Sponsorship:</span><br />
                <a href="mailto:sponsor@hackathon.com" className="hover:text-purple-400 transition-colors">
                  sponsor@hackathon.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Jackson Hacks. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            Made with <Heart size={14} className="text-red-500" /> by the organizing team
          </p>
        </div>
      </div>
    </footer>
  );
}