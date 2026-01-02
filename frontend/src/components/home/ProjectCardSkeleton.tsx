import React from 'react';
import { motion } from 'framer-motion';

const ProjectCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
      {/* Image skeleton */}
      <div className="relative w-full h-64 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
      
      {/* Content skeleton */}
      <div className="p-6">
        {/* Title skeleton */}
        <div className="h-6 bg-gray-200 rounded-lg mb-3 w-3/4 animate-pulse" />
        
        {/* Location skeleton */}
        <div className="h-4 bg-gray-200 rounded mb-3 w-1/2 animate-pulse" />
        
        {/* Details skeleton */}
        <div className="flex justify-between items-center mb-4">
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
        </div>
        
        {/* Button skeleton */}
        <div className="h-10 bg-gray-200 rounded-xl w-full animate-pulse" />
      </div>
    </div>
  );
};

// Grid of skeleton cards
export const ProjectsGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <ProjectCardSkeleton />
        </motion.div>
      ))}
    </div>
  );
};

export default ProjectCardSkeleton;

