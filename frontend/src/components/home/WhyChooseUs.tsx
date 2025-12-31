import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Heart, Zap, Users, CheckCircle } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Trusted Quality',
    description: 'Premium construction materials and proven building techniques ensure lasting quality.',
  },
  {
    icon: Clock,
    title: 'Timely Delivery',
    description: 'We pride ourselves on completing projects on schedule without compromising quality.',
  },
  {
    icon: Heart,
    title: 'Customer First',
    description: 'Your satisfaction is our priority. We listen, understand, and deliver beyond expectations.',
  },
  {
    icon: Zap,
    title: 'Modern Amenities',
    description: 'Contemporary facilities and smart home features for comfortable modern living.',
  },
  {
    icon: Users,
    title: 'Expert Team',
    description: 'Experienced architects, engineers, and designers working together for your dream home.',
  },
  {
    icon: CheckCircle,
    title: 'Transparent Process',
    description: 'Clear communication and transparent pricing throughout your home buying journey.',
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-premium-navy mb-4 tracking-tight">
            Why Choose <span className="bg-gradient-to-r from-premium-gold via-premium-gold-light to-premium-gold-bright bg-clip-text text-transparent">Shree Ji Associates?</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We combine traditional values with modern innovation to create exceptional living experiences.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-premium-cream to-white rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 group cursor-pointer border border-gray-100 hover:border-premium-gold/30"
              >
                <div className="bg-gradient-to-r from-premium-gold to-premium-gold-light w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-premium-gold/20">
                  <Icon className="h-8 w-8 text-premium-navy" />
                </div>
                <h3 className="text-xl font-bold text-premium-navy mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;