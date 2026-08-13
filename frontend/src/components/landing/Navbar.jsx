import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '@/utils';
import pantherLogo from '@/assets/visuals/drive-download-20260424T030625Z-3-001/JH_Icons_Orange.webp';

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Location', href: '#location' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Sponsors', href: '#sponsors' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const isMobile = useIsMobile();
  const menuRef = useRef(null);
  const toggleRef = useRef(null);
  const showNavSurface = isMobile || isScrolled || isMobileMenuOpen;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    menuRef.current?.querySelector('a, button')?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = [...menuRef.current.querySelectorAll('a, button')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const destination = isAuthenticated ? createPageUrl('Dashboard') : createPageUrl('Register');
  const actionLabel = isAuthenticated ? 'Dashboard' : 'Apply';

  return (
    <>
      <motion.nav aria-label="Primary navigation" initial={false} animate={{ y: 0 }} transition={isMobile ? undefined : { duration: 0.6 }} className={`fixed inset-x-0 top-0 z-[70] transition-all duration-300 ${showNavSurface ? 'border-b border-white/10 bg-[#1F1F1F]/90 backdrop-blur-xl' : 'bg-transparent'}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6"><div className="flex h-16 items-center justify-between sm:h-20">
          <Link to="/" aria-label="Jackson Hacks home" className="flex items-center gap-2 font-title text-lg font-bold sm:text-2xl"><img src={pantherLogo} alt="" className="h-8 w-8 object-contain" /><span className="text-[#F68A42]">JACKSON</span><span className="text-[#F3F1F1]">HACKS</span></Link>
          <div className="hidden items-center gap-8 md:flex">{navLinks.map((link) => <a key={link.href} href={link.href} className="text-sm font-medium text-[#B4BAC0] transition-colors hover:text-[#F3F1F1]">{link.label}</a>)}{!isLoadingAuth && <Button asChild size="sm" className="rounded-full bg-[#F68A42] px-6 text-white hover:bg-[#E06E0A]"><Link to={destination}><Zap /> {actionLabel}</Link></Button>}</div>
          <button ref={toggleRef} type="button" onClick={() => setIsMobileMenuOpen((open) => !open)} aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={isMobileMenuOpen} aria-controls="mobile-navigation" className="rounded-full border border-[#F3F1F1]/15 bg-[#084F9A]/55 p-2 text-[#F3F1F1] shadow-lg shadow-black/20 md:hidden">{isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
        </div></div>
      </motion.nav>
      <AnimatePresence>{isMobileMenuOpen && <motion.div id="mobile-navigation" ref={menuRef} role="dialog" aria-modal="true" aria-label="Navigation menu" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed inset-0 z-[60] bg-[#272727]/98 px-6 pt-24 backdrop-blur-xl md:hidden"><div className="flex flex-col gap-6">{navLinks.map((link) => <a key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-2xl font-medium text-white">{link.label}</a>)}{!isLoadingAuth && <Button asChild size="lg" className="mt-4 w-full rounded-full bg-[#F68A42] text-white hover:bg-[#E06E0A]"><Link to={destination} onClick={() => setIsMobileMenuOpen(false)}><Zap /> {actionLabel}</Link></Button>}</div></motion.div>}</AnimatePresence>
    </>
  );
}
