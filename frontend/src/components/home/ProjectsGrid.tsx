import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Eye, Calendar, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
// @ts-expect-error - api is a JS file without type definitions
import { projectAPI } from '../../services/api';
import { ProjectsGridSkeleton } from './ProjectCardSkeleton';

interface Project {
  _id: string;
  name: string;
  location: string;
  image: string;
  status: 'upcoming' | 'present' | 'past';
  type: string;
  units: number;
  startDate?: string | Date | null;
  completionDate?: string | Date | null;
}

const ProjectsGrid = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await projectAPI.getAll();
        if (response.success && response.data) {
          // Placeholder image data URI
          const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23f3f4f6" width="800" height="600"/%3E%3Ctext fill="%239ca3af" font-family="Arial, sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EProject Image%3C/text%3E%3C/svg%3E';
          
          // Map database projects to component format
          const mappedProjects: Project[] = response.data.map((project: any) => {
            // Replace old placeholder URLs with new data URI
            let imageUrl = project.image || '';
            if (!imageUrl || 
                imageUrl.includes('via.placeholder.com') || 
                imageUrl.includes('800x600?text=Project+Image') ||
                imageUrl.includes('800x600?text=Project Image')) {
              imageUrl = placeholderImage;
            }
            
            return {
              _id: project._id || project.id,
              name: project.name || 'Unnamed Project',
              location: project.location || 'Location TBD',
              image: imageUrl,
              status: project.status || 'upcoming',
              type: project.type || 'N/A',
              units: project.units || 0,
              startDate: project.startDate || null,
              completionDate: project.completionDate || null,
            };
          });
          
          // Sort by start date (newest first)
          // Projects without startDate go to the end
          mappedProjects.sort((a, b) => {
            // If both have startDate, compare them
            if (a.startDate && b.startDate) {
              const dateA = new Date(a.startDate).getTime();
              const dateB = new Date(b.startDate).getTime();
              return dateB - dateA; // Newest first (descending order)
            }
            // If only a has startDate, it comes first
            if (a.startDate && !b.startDate) {
              return -1;
            }
            // If only b has startDate, it comes first
            if (!a.startDate && b.startDate) {
              return 1;
            }
            // If neither has startDate, maintain original order (already sorted by backend)
            return 0;
          });
          
          setProjects(mappedProjects);
        } else {
          setError('Failed to load projects');
        }
      } catch (err: any) {
        console.error('Error fetching projects:', err);
        setError(err.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filters = [
    { key: 'all', label: 'All Projects' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'present', label: 'Ongoing' },
    { key: 'past', label: 'Completed' },
  ];

  // Memoize filtered projects to avoid unnecessary recalculations
  const filteredProjects = useMemo(() => {
    return activeFilter === 'all' 
      ? projects 
      : projects.filter(project => project.status === activeFilter);
  }, [projects, activeFilter]);

  const getTagColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'present': return 'bg-green-100 text-green-800';
      case 'past': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTagIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return Calendar;
      case 'present': return Building;
      case 'past': return Building;
      default: return Building;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Upcoming';
      case 'present': return 'Ongoing';
      case 'past': return 'Completed';
      default: return status;
    }
  };

  return (
    <section id="projects" className="py-24 bg-gradient-to-b from-premium-cream to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-premium-navy mb-4 tracking-tight">
            Our <span className="bg-gradient-to-r from-premium-gold via-premium-gold-light to-premium-gold-bright bg-clip-text text-transparent">Projects</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our portfolio of exceptional residential projects designed to create communities that last.
          </p>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeFilter === filter.key
                  ? 'bg-gradient-to-r from-premium-gold to-premium-gold-light text-premium-navy shadow-lg shadow-premium-gold/30'
                  : 'bg-white text-premium-navy hover:bg-premium-cream border border-gray-200 hover:border-premium-gold/30'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </motion.div>

        {/* Loading State - Use Skeleton for Better Perceived Performance */}
        {loading && <ProjectsGridSkeleton />}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-20">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-premium-gold text-premium-navy rounded-lg hover:bg-premium-gold-light transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && !error && (
          <>
            {filteredProjects.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-600 text-lg">
                  {activeFilter === 'all' 
                    ? 'No projects available yet. Check back soon!'
                    : `No ${filters.find(f => f.key === activeFilter)?.label.toLowerCase()} projects at the moment.`
                  }
                </p>
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredProjects.map((project, index) => {
                  const TagIcon = getTagIcon(project.status);
                  return (
                    <motion.div
                      key={project._id}
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
                })}
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default ProjectsGrid;