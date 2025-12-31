import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

const contactInfo = [
  {
    icon: Phone,
    title: 'Phone',
    details: ['+91 9414103413', '+91 9414101508'],
  },
  {
    icon: Mail,
    title: 'Email',
    details: ['info@shreejiassociates.com', 'sales@shreejiassociates.com'],
  },
  {
    icon: MapPin,
    title: 'Address',
    details: ['123 Business Center, Banswara', 'Rajasthan, India - 327001'],
  },
  {
    icon: Clock,
    title: 'Business Hours',
    details: ['Mon - Sat: 9:00 AM - 7:00 PM', 'Sunday: 10:00 AM - 5:00 PM'],
  },
];

const Contact = () => {
  return (
    <footer className="bg-gradient-to-br from-premium-navy via-premium-navy-dark to-premium-navy text-white py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.1)_0%,_transparent_50%)]"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
            Get In <span className="bg-gradient-to-r from-premium-gold via-premium-gold-light to-premium-gold-bright bg-clip-text text-transparent">Touch</span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Ready to start your journey with us? Contact our team for personalized assistance.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {contactInfo.map((info, index) => {
            const Icon = info.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="bg-gradient-to-r from-premium-gold to-premium-gold-light w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-premium-gold/30">
                  <Icon className="h-10 w-10 text-premium-navy" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{info.title}</h3>
                <div className="space-y-2">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-300">
                      {detail}
                    </p>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="border-t border-white/10 mt-16 pt-8 text-center">
          <p className="text-white/60">
            © 2024 Shree Ji Associates. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Contact;