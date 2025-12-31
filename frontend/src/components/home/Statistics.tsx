import React from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, Home, Award } from 'lucide-react';

const statisticsData = [
  {
    icon: Users,
    number: '500+',
    label: 'Happy Clients',
    description: 'Satisfied families living their dreams',
  },
  {
    icon: Building2,
    number: '25+',
    label: 'Projects Completed',
    description: 'Successful residential developments',
  },
  {
    icon: Home,
    number: '1200+',
    label: 'Homes Built',
    description: 'Quality homes delivered on time',
  },
  {
    icon: Award,
    number: '15+',
    label: 'Years Experience',
    description: 'Trusted expertise in real estate',
  },
];

const Statistics = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-premium-navy via-premium-navy-light to-premium-navy-dark relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.1)_0%,_transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(20,184,166,0.1)_0%,_transparent_50%)]"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
            Our <span className="bg-gradient-to-r from-premium-gold via-premium-gold-light to-premium-gold-bright bg-clip-text text-transparent">Achievements</span>
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Numbers that reflect our commitment to excellence and customer satisfaction.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {statisticsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 text-center shadow-2xl hover:shadow-premium-gold/20 transition-all duration-500 group border border-white/20 hover:border-premium-gold/30"
              >
                <div className="bg-gradient-to-r from-premium-gold to-premium-gold-light w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-premium-gold/30">
                  <Icon className="h-10 w-10 text-premium-navy" />
                </div>
                <motion.h3
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                  viewport={{ once: true }}
                  className="text-5xl font-bold bg-gradient-to-r from-premium-navy to-premium-navy-light bg-clip-text text-transparent mb-2"
                >
                  {stat.number}
                </motion.h3>
                <h4 className="text-xl font-semibold text-premium-navy mb-2">{stat.label}</h4>
                <p className="text-gray-600">{stat.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Statistics;