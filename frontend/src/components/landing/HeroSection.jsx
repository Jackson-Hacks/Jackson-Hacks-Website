import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronDown, Sparkles, Zap, Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#2072C7] via-[#5A78AF] to-[#F68A42]">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(32,114,199,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(32,114,199,0.05)_1px,transparent_1px)] bg-[size:100px_100px]" />
        
        {/* Floating orbs */}
        <motion.div
          animate={{ 
            y: [0, -30, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2072C7]/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ 
            y: [0, 30, 0],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#F68A42]/20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 right-1/3 w-64 h-64 bg-[#084F9A]/20 rounded-full blur-[80px]"
        />

        {/* Floating icons */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-32 left-[15%] text-[#2072C7]/35"
        >
          <Code2 size={48} />
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-48 right-[20%] text-[#F68A42]/35"
        >
          <Zap size={40} />
        </motion.div>
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute bottom-32 left-[25%] text-[#2072C7]/35"
        >
          <Sparkles size={36} />
        </motion.div>
      </div>

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto mt-10 md:mt-16">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2072C7]/15 border border-[#2072C7]/30 text-[#F3F1F1] text-sm mb-8"
        >
          <Sparkles size={16} className="text-[#F68A42]" />
          <span>Applications Now Open</span>
        </motion.div>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-6 tracking-tight"
        >
          <span className="block text-white">JACKSON</span>
          <span className="block text-white">HACKS</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-300 mb-4 font-light"
        >
          Build. Learn. Connect. Innovate.
        </motion.p>

        {/* Date & Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-4 text-lg text-gray-400 mb-10"
        >
          <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
            📅 Coming Soon 2025
          </span>
          <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
            📍 Location TBA
          </span>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to={createPageUrl('Register')}>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-[#F68A42] to-[#E06E0A] hover:from-[#E06E0A] hover:to-[#F68A42] text-white px-10 py-6 text-lg rounded-full shadow-lg shadow-[#E06E0A]/25 transition-all hover:shadow-[#E06E0A]/40 hover:scale-105"
            >
              <Zap className="mr-2" size={20} />
              Apply Now
            </Button>
          </Link>
          <a href="#about">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/20 text-black hover:text-white hover:bg-white/10 px-8 py-6 text-lg rounded-full"
            >
              Learn More
            </Button>
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
        >
          {[
            { value: '24', label: 'Hours' },
            { value: '200+', label: 'Hackers' },
            { value: '$5K+', label: 'In Prizes' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">
                {stat.value}
              </div>
              <div className="text-white text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.a
        href="#about"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-500 hover:text-white transition-colors"
      >
        <ChevronDown size={32} />
      </motion.a>
    </section>
  );
}