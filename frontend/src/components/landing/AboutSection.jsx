import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Users, Trophy, Lightbulb, Coffee, Rocket } from 'lucide-react';

const features = [
  {
    icon: Code2,
    title: 'Build Projects',
    description: 'Create innovative tech projects from scratch in just 24 hours with your team.',
    color: 'from-purple-500 to-violet-500'
  },
  {
    icon: Users,
    title: 'Meet People',
    description: 'Connect with like-minded hackers, mentors, and industry professionals.',
    color: 'from-cyan-500 to-blue-500'
  },
  {
    icon: Lightbulb,
    title: 'Learn Skills',
    description: 'Attend workshops and learn from experts in AI, web dev, and more.',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: Trophy,
    title: 'Win Prizes',
    description: 'Compete for amazing prizes and recognition for your innovative solutions.',
    color: 'from-pink-500 to-rose-500'
  },
  {
    icon: Coffee,
    title: 'Free Food & Swag',
    description: 'Enjoy free meals, snacks, and take home exclusive hackathon merch.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Rocket,
    title: 'Launch Ideas',
    description: 'Turn your wildest ideas into reality and kickstart your tech journey.',
    color: 'from-indigo-500 to-purple-500'
  }
];

export default function AboutSection() {
  return (
    <section id="about" className="relative py-32 bg-[#0F0A1F]">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="text-purple-400 text-sm font-semibold tracking-widest uppercase mb-4 block">
            About the Event
          </span>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            What is a{' '}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Hackathon
            </span>
            ?
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            A hackathon is an epic event where students come together to create 
            amazing tech projects in just 24 hours. It's a race against the clock, 
            filled with learning, collaboration, and innovation.
          </p>
        </motion.div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl -z-10"
                style={{ 
                  backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                }}
              />
              <div className="relative p-8 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] transition-all duration-500 hover:bg-white/[0.05] h-full">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-5`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20">
            <div className="text-left">
              <p className="text-white font-semibold text-lg">Ready to join the adventure?</p>
              <p className="text-gray-400">No experience required. All skill levels welcome!</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}