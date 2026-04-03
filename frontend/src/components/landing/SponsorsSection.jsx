import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Mail, FileText } from 'lucide-react';

export default function SponsorsSection() {
  return (
    <section id="sponsors" className="relative py-32 bg-[#0F0A1F]">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-900/5 to-transparent" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-purple-400 text-sm font-semibold tracking-widest uppercase mb-4 block">
            Our Partners
          </span>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Backed by{' '}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Amazing
            </span>{' '}
            Sponsors
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            We're grateful for the support of our sponsors who make this event possible
          </p>
        </motion.div>

        {/* Placeholder for sponsors */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-20"
        >
          <div className="text-center py-16 rounded-2xl bg-white/[0.02] border border-dashed border-white/10">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-2xl font-semibold text-white mb-2">Sponsors Coming Soon</h3>
            <p className="text-gray-400">Interested in sponsoring? Get in touch!</p>
          </div>
        </motion.div>

        {/* Sponsor CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-3xl blur-xl" />
          <div className="relative p-10 md:p-14 rounded-3xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 text-center">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Become a Sponsor
            </h3>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Support the next generation of innovators. Connect with talented students, 
              gain exposure in the tech community, and help shape the future of technology.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white px-8 py-6 rounded-full"
              >
                <FileText className="mr-2" size={20} />
                View Sponsorship Package
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-6 rounded-full"
              >
                <Mail className="mr-2" size={20} />
                sponsor@hackathon.com
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}