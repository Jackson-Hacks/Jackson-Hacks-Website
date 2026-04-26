import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button.jsx';
import { Menu, X, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import pantherLogo from '@/assets/visuals/drive-download-20260424T030625Z-3-001/JH_Icons_Orange.png';

const navLinks = [
  { label: 'Location', href: '#location' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Sponsors', href: '#sponsors' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const isMobile = useIsMobile();
  const showNavSurface = isMobile || isScrolled || isMobileMenuOpen;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={false}
        animate={{ y: 0 }}
        transition={isMobile ? undefined : { duration: 0.6 }}
        className={`fixed left-0 right-0 top-0 z-[70] transition-all duration-300 ${
          showNavSurface
            ? 'border-b border-[#2072C7]/20 bg-[#272727]/90 backdrop-blur-xl'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between sm:h-20">
            {/* Logo */}
            <a href="#" className="flex items-center gap-2 text-lg font-bold text-[#F3F1F1] sm:text-2xl">
              <img
                src={pantherLogo}
                alt="Jackson Hacks logo"
                className="h-8 w-8 object-contain"
              />
              <span className={showNavSurface ? "bg-gradient-to-r from-[#F68A42] to-[#2072C7] bg-clip-text text-transparent" : "text-[#F68A42]"}>
                JACKSON
              </span>
              <span className="text-[#F3F1F1]">HACKS</span>
            </a>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
                >
                  {link.label}
                </a>
              ))}
              {!isLoadingAuth && (
                isAuthenticated ? (
                  <Link to={createPageUrl('Dashboard')}>
                    <Button 
                      size="sm"
                      className="bg-gradient-to-r from-[#F68A42] to-[#E06E0A] hover:from-[#E06E0A] hover:to-[#F68A42] text-white px-6 rounded-full"
                    >
                      <Zap size={16} className="mr-1" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link to={createPageUrl('Register')}>
                    <Button 
                      size="sm"
                      className="bg-gradient-to-r from-[#F68A42] to-[#E06E0A] hover:from-[#E06E0A] hover:to-[#F68A42] text-white px-6 rounded-full"
                    >
                      <Zap size={16} className="mr-1" />
                      Apply
                    </Button>
                  </Link>
                )
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="rounded-full border border-[#F3F1F1]/15 bg-[#084F9A]/55 p-2 text-[#F3F1F1] shadow-lg shadow-black/20 md:hidden"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[60] bg-[#272727]/98 px-6 pt-24 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl text-white font-medium py-2"
                >
                  {link.label}
                </a>
              ))}
              {!isLoadingAuth && (
                isAuthenticated ? (
                  <Link 
                    to={createPageUrl('Dashboard')}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-[#F68A42] to-[#E06E0A] text-white w-full mt-4 rounded-full"
                    >
                      <Zap size={18} className="mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link 
                    to={createPageUrl('Register')}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-[#F68A42] to-[#E06E0A] text-white w-full mt-4 rounded-full"
                    >
                      <Zap size={18} className="mr-2" />
                      Apply Now
                    </Button>
                  </Link>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
