import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Project {
  _id: string;
  name: string;
  location: string;
  image: string;
  status: 'upcoming' | 'present' | 'past';
  type: string;
  units: number;
}

interface ProjectCardProps {
  project: Project;
  index: number;
  getTagIcon: (status: string) => React.ComponentType<{ className?: string }>;
  getTagColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
}

// Memoized ProjectCard component for better performance
const ProjectCard: React.FC<ProjectCardProps> = React.memo(({ 
  project, 
  index, 
  getTagIcon, 
  getTagColor, 
  getStatusLabel 
}) => {
  const TagIcon = getTagIcon(project.status);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 group border border-gray-100 hover:border-premium-gold/30"
    >
      <div className="relative overflow-hidden">
        <img
          src={project.image}
          alt={project.name}
          loading="lazy"
          width={800}
          height={600}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getTagColor(project.status)}`}>
            <TagIcon className="h-4 w-4" />
            <span>{getStatusLabel(project.status)}</span>
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{project.name}</h3>
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{project.location}</span>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
          <span>{project.type}</span>
          <span>{project.units} Units</span>
        </div>
        <Link
          to={`/project/${project._id}`}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-premium-gold to-premium-gold-light text-premium-navy px-5 py-2.5 rounded-xl hover:from-premium-gold-light hover:to-premium-gold-bright transition-all duration-300 group-hover:shadow-lg shadow-md font-semibold"
        >
          <Eye className="h-4 w-4" />
          <span>View Details</span>
        </Link>
      </div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function - only re-render if project data changes
  return prevProps.project._id === nextProps.project._id &&
         prevProps.project.name === nextProps.project.name &&
         prevProps.project.image === nextProps.project.image &&
         prevProps.project.status === nextProps.project.status;
});

ProjectCard.displayName = 'ProjectCard';

export default ProjectCard;

