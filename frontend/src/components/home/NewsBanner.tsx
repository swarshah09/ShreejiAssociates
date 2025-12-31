import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Home, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NewsItem {
  id: number;
  type: 'upcoming' | 'completed';
  name: string;
  location: string;
  units: number;
  background: string;
  date: string;
  description: string;
}

const newsData: NewsItem[] = [
  {
    id: 1,
    type: 'upcoming',
    name: 'Skyline Residences',
    location: 'Banjara Hills, Hyderabad',
    units: 120,
    background: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    date: 'Q2 2024',
    description: 'Luxury apartments with modern amenities'
  },
  {
    id: 2,
    type: 'completed',
    name: 'Green Valley Villas',
    location: 'Gachibowli, Hyderabad',
    units: 85,
    background: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    date: 'Completed Dec 2023',
    description: 'Premium villas with garden spaces'
  },
  {
    id: 3,
    type: 'upcoming',
    name: 'Metro Heights',
    location: 'Kondapur, Hyderabad',
    units: 200,
    background: 'https://images.pexels.com/photos/1370704/pexels-photo-1370704.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    date: 'Q3 2024',
    description: 'High-rise apartments near metro station'
  },
  {
    id: 4,
    type: 'completed',
    name: 'Royal Gardens',
    location: 'Jubilee Hills, Hyderabad',
    units: 60,
    background: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    date: 'Completed Oct 2023',
    description: 'Exclusive residential complex'
  },
  {
    id: 5,
    type: 'upcoming',
    name: 'Tech Park Residency',
    location: 'HITEC City, Hyderabad',
    units: 150,
    background: 'https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    date: 'Q4 2024',
    description: 'Modern living for IT professionals'
  }
];

const NewsBanner: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % newsData.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % newsData.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + newsData.length) % newsData.length);
  };

  const currentItem = newsData[currentIndex];

  return (
    <div className="relative h-[500px] overflow-hidden bg-gradient-to-br from-premium-navy via-premium-navy-dark to-premium-navy">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${currentItem.background})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-60" />
          </div>
          
          <div className="relative z-10 h-full flex items-center">
            <div className="container mx-auto px-6">
              <div className="max-w-4xl">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3 mb-4"
                >
                  <span className={`px-5 py-2.5 rounded-full text-sm font-semibold backdrop-blur-sm border ${
                    currentItem.type === 'upcoming' 
                      ? 'bg-premium-gold/90 text-premium-navy border-premium-gold' 
                      : 'bg-premium-teal/90 text-white border-premium-teal'
                  }`}>
                    {currentItem.type === 'upcoming' ? 'Upcoming Project' : 'Recently Completed'}
                  </span>
                  <div className="flex items-center text-white/80 text-sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    {currentItem.date}
                  </div>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight drop-shadow-2xl"
                >
                  {currentItem.name}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-white/90 mb-6"
                >
                  {currentItem.description}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap gap-6 text-white"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-premium-gold" />
                    <span className="text-lg font-medium">{currentItem.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-premium-teal" />
                    <span className="text-lg font-medium">{currentItem.units} Units</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute inset-y-0 left-4 flex items-center">
        <button
          onClick={prevSlide}
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
          className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-premium-gold/80 hover:text-premium-navy border border-white/20 hover:border-premium-gold transition-all duration-300 shadow-lg"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="absolute inset-y-0 right-4 flex items-center">
        <button
          onClick={nextSlide}
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
          className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-premium-gold/80 hover:text-premium-navy border border-white/20 hover:border-premium-gold transition-all duration-300 shadow-lg"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
        {newsData.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-premium-gold scale-125 shadow-lg shadow-premium-gold/50' 
                : 'bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
        <motion.div
          className="h-full bg-gradient-to-r from-premium-gold via-premium-gold-light to-premium-gold-bright"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 4, ease: 'linear' }}
          key={currentIndex}
        />
      </div>

      {/* Auto-play indicator */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-200"
        >
          {isAutoPlaying ? (
            <Clock className="w-4 h-4" />
          ) : (
            <Clock className="w-4 h-4 opacity-50" />
          )}
        </button>
      </div>
    </div>
  );
};

export default NewsBanner;