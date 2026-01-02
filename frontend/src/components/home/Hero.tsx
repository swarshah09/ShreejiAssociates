import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import EnquiryModal from './EnquiryModal';

const Hero = () => {
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);

  const scrollToProjects = () => {
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://videos.pexels.com/video-files/4569928/4569928-uhd_2732_1440_25fps.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-premium-navy/90 via-premium-navy-dark/85 to-premium-navy/90"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(10,25,41,0.4)_100%)]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight tracking-tight"
        >
          <span className="text-white drop-shadow-2xl">Building Dreams,</span>
          <span className="block bg-gradient-to-r from-premium-gold via-premium-gold-light to-premium-gold-bright bg-clip-text text-transparent drop-shadow-lg">
            Creating Homes
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl lg:text-3xl mb-10 text-white/90 max-w-4xl mx-auto leading-relaxed font-light tracking-wide drop-shadow-lg"
        >
          Experience luxury living with Shree Ji Associates. We craft exceptional residential projects
          that blend modern amenities with traditional values.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex justify-center items-center gap-4 flex-wrap"
        >
          <button 
            onClick={scrollToProjects}
            className="group relative bg-gradient-to-r from-premium-gold via-premium-gold-light to-premium-gold-bright hover:from-premium-gold-light hover:via-premium-gold-bright hover:to-premium-gold px-10 py-5 rounded-full font-semibold text-lg text-premium-navy transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-premium-gold/50 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Explore Projects
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="inline-block"
              >
                →
              </motion.span>
            </span>
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          
          <button 
            onClick={() => setIsEnquiryModalOpen(true)}
            className="group relative bg-gradient-to-r from-premium-gold via-premium-gold-light to-premium-gold-bright hover:from-premium-gold-light hover:via-premium-gold-bright hover:to-premium-gold px-10 py-5 rounded-full font-semibold text-lg text-premium-navy transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-premium-gold/50 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Enquiry
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="inline-block"
              >
                →
              </motion.span>
            </span>
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </motion.div>

        {/* Enquiry Modal */}
        <EnquiryModal 
          isOpen={isEnquiryModalOpen} 
          onClose={() => setIsEnquiryModalOpen(false)} 
        />
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
      >
        <ArrowDown className="h-6 w-6" />
      </motion.div>
    </section>
  );
};

export default Hero;