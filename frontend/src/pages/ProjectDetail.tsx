import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw, MapPin, CheckCircle, Star, X, RefreshCw, AlertCircle, Search } from 'lucide-react';
// @ts-expect-error - useExcelData is a JS file without type definitions
import { useExcelData } from '../hooks/useExcelData';
import PlotCanvas from '../components/PlotCanvas';
import type { PlotShape } from '../types/plots';
// @ts-expect-error - api is a JS file without type definitions
import { projectAPI, plotShapeAPI } from '../services/api';
import siteLayoutPlan from '../assets/ShreejiParisar.png';

// Type definitions
interface Project {
  _id?: string;
  name: string;
  location: string;
  image: string;
  heroImage?: string; // Landscape photo for project details page
  map?: string;
  sampleHouse?: {
    threeBHK?: {
      image?: string; // Sample house photo for 3BHK
      floorPlan?: string; // Floor plan for 3BHK (zoomable)
    };
    fourBHK?: {
      image?: string; // Sample house photo for 4BHK
      floorPlan?: string; // Floor plan for 4BHK (zoomable)
    };
  };
  plots?: Record<string, PlotDetail>;
  excelUrl?: string;
  facilities?: string[] | string;
  advantages?: string[] | string;
  googleMap?: string;
}

interface PlotDetail {
  number: string;
  area: string;
  dimensions?: string;
  status: string;
  direction?: string;
  type?: string;
  price?: string;
  negotiable?: string;
}

interface PlotDataFromAPI {
  id: string;
  plotNumber: string;
  status: string;
  points: number[];
}

// Default project data fallback (if API fails)
const defaultProject = {
  name: 'Shree Residency',
  location: 'Rajkot, Gujarat',
  image: 'https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg?auto=compress&cs=tinysrgb&w=1200',
  sampleHouse: {
    threeBHK: {
      image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
      floorPlan: 'https://images.pexels.com/photos/8293642/pexels-photo-8293642.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    fourBHK: {
      image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
      floorPlan: 'https://images.pexels.com/photos/8293642/pexels-photo-8293642.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
  },
  map: siteLayoutPlan,
  plots: {},
  excelUrl: '',
  facilities: [],
  advantages: [],
  googleMap: '',
};

// Function to convert Google Maps sharing link to embed URL
const convertGoogleMapsToEmbed = (url: string): string => {
  if (!url || !url.trim()) return '';
  
  const trimmedUrl = url.trim();
  
  // If it's already an embed URL, return as is
  if (trimmedUrl.includes('/embed') || trimmedUrl.includes('embed?pb=') || trimmedUrl.includes('embed/v1/')) {
    return trimmedUrl;
  }
  
  // Handle different Google Maps URL formats
  try {
    // Format 1: Extract coordinates from @lat,lng format (most common sharing format)
    // Example: https://www.google.com/maps/@22.123456,70.123456,15z
    const coordMatch = trimmedUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)(?:,(\d+\.?\d*)?z)?/);
    if (coordMatch) {
      const lat = coordMatch[1];
      const lng = coordMatch[2];
      const zoom = coordMatch[3] || '15';
      // Create embed URL with coordinates - this format works without API key
      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${zoom}!3d${lat}!4d${lng}!5e0!3m2!1sen!2sin!4v${Date.now()}!5m2!1sen!2sin`;
    }
    
    // Format 2: Extract place name from /place/ format
    // Example: https://www.google.com/maps/place/Rajkot
    const placeMatch = trimmedUrl.match(/place\/([^/?&]+)/);
    if (placeMatch) {
      const place = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      // Use search-based embed with output=embed to hide navigation
      return `https://www.google.com/maps?q=${encodeURIComponent(place)}&output=embed&hl=en`;
    }
    
    // Format 3: Extract search query from ?q= parameter
    // Example: https://www.google.com/maps?q=Rajkot
    const searchMatch = trimmedUrl.match(/[?&]q=([^&]+)/);
    if (searchMatch) {
      const query = decodeURIComponent(searchMatch[1]);
      return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed&hl=en`;
    }
    
    // Format 4: Handle goo.gl/maps short URLs
    // We can't convert these directly, but we can try to use them
    if (trimmedUrl.includes('goo.gl/maps') || trimmedUrl.includes('maps.app.goo.gl')) {
      // For short URLs, we'll need to follow redirects, but that's not possible client-side
      // Return original - browser might handle it
      return trimmedUrl;
    }
    
    // Format 5: If it contains coordinates in query params
    const queryCoordMatch = trimmedUrl.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (queryCoordMatch) {
      const lat = queryCoordMatch[1];
      const lng = queryCoordMatch[2];
      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z15!3d${lat}!4d${lng}!5e0!3m2!1sen!2sin!4v${Date.now()}!5m2!1sen!2sin`;
    }
  } catch (error) {
    console.error('Error converting Google Maps URL:', error);
  }
  
  // If we can't convert it, try adding &output=embed to make it work
  // This works for many Google Maps URLs and hides navigation
  if (trimmedUrl.includes('google.com/maps') && !trimmedUrl.includes('output=embed')) {
    const separator = trimmedUrl.includes('?') ? '&' : '?';
    return `${trimmedUrl}${separator}output=embed&hl=en`;
  }
  
  // Last resort: return the original URL
  // If it's not a Google Maps URL, return as is
  return trimmedUrl;
};

// Zoomable Image Component for Floor Plans
const ZoomableImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPointerPosition, setLastPointerPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const ZOOM_FACTOR = 1.2;
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 5;

  const handleZoom = (newZoom: number) => {
    setZoom(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom)));
  };

  const handleZoomIn = () => handleZoom(zoom * ZOOM_FACTOR);
  const handleZoomOut = () => handleZoom(zoom / ZOOM_FACTOR);
  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    handleZoom(zoom + delta);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastPointerPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastPointerPosition.x;
    const deltaY = e.clientY - lastPointerPosition.y;
    setPosition(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
    setLastPointerPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div 
      ref={containerRef}
      className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-20 bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2 border border-gray-200">
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="h-5 w-5 text-gray-700" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="h-5 w-5 text-gray-700" />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Reset Zoom"
        >
          <RotateCcw className="h-5 w-5 text-gray-700" />
        </button>
        <div className="text-xs text-center text-gray-600 px-2 py-1 border-t border-gray-200">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Pan hint */}
      <div className="absolute top-4 left-4 z-20 bg-white/90 rounded-lg shadow-lg p-2 text-xs text-gray-600 border border-gray-200">
        <div className="flex items-center gap-2">
          <ZoomIn className="h-4 w-4" />
          <span>Scroll to zoom • Drag to pan</span>
        </div>
      </div>

      {/* Image */}
      <div
        className="w-full h-full"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain"
          draggable={false}
        />
      </div>
    </div>
  );
};

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlot, setSelectedPlot] = useState('');
  const [plotDetails, setPlotDetails] = useState<PlotDetail | null>(null);
  const [showSampleHouse, setShowSampleHouse] = useState(false);
  const [currentSection, setCurrentSection] = useState<'threeBHK' | 'fourBHK'>('threeBHK');
  const [currentView, setCurrentView] = useState<'house' | 'floorPlan'>('house');
  const [plotShapes, setPlotShapes] = useState<PlotShape[]>([]);
  const [loadingPlots, setLoadingPlots] = useState(true);
  const [plotImageDimensions, setPlotImageDimensions] = useState<{ width: number; height: number } | null>(null);
  // This is a PUBLIC page - no admin controls

  // Helper to check if ID is valid MongoDB ObjectId
  const isValidObjectId = (id: string | undefined): boolean => {
    if (!id) return false;
    return /^[0-9a-fA-F]{24}$/.test(id);
  };
  
  // Helper to sanitize image URLs - replace old placeholder URLs
  const sanitizeImageUrl = (url: string | undefined): string => {
    const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23f3f4f6" width="800" height="600"/%3E%3Ctext fill="%239ca3af" font-family="Arial, sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EProject Image%3C/text%3E%3C/svg%3E';
    
    if (!url) return placeholderImage;
    if (url.includes('via.placeholder.com') || 
        url.includes('800x600?text=Project+Image') ||
        url.includes('800x600?text=Project Image') ||
        url.startsWith('800x600')) {
      return placeholderImage;
    }
    return url;
  };

  // Fetch project data from API
  useEffect(() => {
    const fetchProject = async () => {
      if (!id || !isValidObjectId(id)) {
        setProject(defaultProject);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await projectAPI.getById(id);
        if (response.success) {
          console.log('Project loaded:', response.data.name);
          console.log('Project map URL:', response.data.map ? 'Present' : 'Missing');
          
          // Normalize facilities and advantages to arrays
          const normalizedProject = {
            ...response.data,
            image: sanitizeImageUrl(response.data.image),
            heroImage: sanitizeImageUrl(response.data.heroImage),
            map: sanitizeImageUrl(response.data.map),
            facilities: Array.isArray(response.data.facilities) 
              ? response.data.facilities 
              : (typeof response.data.facilities === 'string' && response.data.facilities.trim()
                  ? response.data.facilities.split(',').map((f: string) => f.trim()).filter((f: string) => f.length > 0)
                  : []),
            advantages: Array.isArray(response.data.advantages)
              ? response.data.advantages
              : (typeof response.data.advantages === 'string' && response.data.advantages.trim()
                  ? response.data.advantages.split(',').map((a: string) => a.trim()).filter((a: string) => a.length > 0)
                  : []),
            googleMap: response.data.googleMap || '',
          };
          
          setProject(normalizedProject);
        } else {
          setProject(defaultProject);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        setProject(defaultProject);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // Load plot shapes from API (detected from layout images)
  useEffect(() => {
    const fetchPlotShapes = async () => {
      if (!id || !isValidObjectId(id)) {
        setPlotShapes([]);
        setLoadingPlots(false);
        return;
      }
      
      try {
        setLoadingPlots(true);
        const response = await plotShapeAPI.get(id);
        if (response.success && response.data?.plots) {
          // Convert database format to PlotShape format
          const shapes: PlotShape[] = response.data.plots.map((plot: PlotDataFromAPI) => ({
            id: plot.id,
            plotNumber: plot.plotNumber,
            status: plot.status as PlotShape['status'],
            points: plot.points,
          }));
          setPlotShapes(shapes);
          
          // Store original image dimensions for coordinate scaling
          if (response.data.imageWidth && response.data.imageHeight) {
            setPlotImageDimensions({
              width: response.data.imageWidth,
              height: response.data.imageHeight,
            });
          }
        } else {
          setPlotShapes([]);
          setPlotImageDimensions(null);
        }
      } catch (error) {
        console.error('Error fetching plot shapes:', error);
        setPlotShapes([]);
        setPlotImageDimensions(null);
      } finally {
        setLoadingPlots(false);
      }
    };

    fetchPlotShapes();
  }, [id]);
  
  // Excel data integration
  const { plotData: excelPlotData, loading: excelLoading, error: excelError, lastUpdated, refresh } = useExcelData(
    project?.excelUrl,
    30000 // Refresh every 30 seconds
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-premium-gold mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Project not found</p>
      </div>
    );
  }

  const handlePlotSearch = () => {
    if (!selectedPlot || !selectedPlot.trim()) {
      alert('Please enter a plot number.');
      return;
    }

    const searchTerm = selectedPlot.trim();
    
    // Normalize search term (remove spaces, make case-insensitive)
    const normalizedSearch = searchTerm.replace(/\s+/g, '').toUpperCase();
    
    // Search in Excel data (case-insensitive, handle variations)
    let plotInfo = null;
    
    // Try exact match first (with variations)
    const searchVariations = [
      searchTerm,
      searchTerm.toUpperCase(),
      searchTerm.toLowerCase(),
      normalizedSearch,
      searchTerm.trim(),
    ];
    
    for (const variation of searchVariations) {
      if (excelPlotData[variation]) {
        plotInfo = excelPlotData[variation];
        break;
      }
    }
    
    // If not found, try case-insensitive search in all keys
    if (!plotInfo) {
      const excelKeys = Object.keys(excelPlotData);
      const foundKey = excelKeys.find(key => {
        const normalizedKey = key.toString().trim().replace(/\s+/g, '').toUpperCase();
        return normalizedKey === normalizedSearch || 
               key.toString().toUpperCase() === searchTerm.toUpperCase() ||
               normalizedKey === searchTerm.toUpperCase() ||
               key.toString().trim().toUpperCase() === searchTerm.toUpperCase();
      });
      if (foundKey) {
        plotInfo = excelPlotData[foundKey];
      }
    }
    
    // Fallback to static project data
    if (!plotInfo) {
      plotInfo = (project.plots as Record<string, PlotDetail>)?.[searchTerm] || 
                 (project.plots as Record<string, PlotDetail>)?.[normalizedSearch] || null;
    }
    
    if (plotInfo) {
      setPlotDetails(plotInfo);
      // Also try to find and highlight the plot on the map
      const matchingPlot = plotShapes.find(p => {
        const plotNum = p.plotNumber.toString().trim().replace(/\s+/g, '').toUpperCase();
        return plotNum === normalizedSearch || plotNum === searchTerm.toUpperCase();
      });
      if (matchingPlot) {
        setSelectedPlot(matchingPlot.plotNumber);
      }
    } else {
      setPlotDetails(null);
      // Show available plot numbers for debugging (first 10)
      const availablePlots = Object.keys(excelPlotData).slice(0, 10);
      console.log('Available plot numbers in Excel:', availablePlots);
      console.log('Search term was:', searchTerm, 'Normalized:', normalizedSearch);
      console.log('Excel data keys sample:', Object.keys(excelPlotData).slice(0, 5));
      alert(`Plot "${searchTerm}" not found. Available plots: ${availablePlots.join(', ')}${Object.keys(excelPlotData).length > 10 ? '...' : ''}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <section className="relative h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden">
        <img
          src={project.heroImage || project.image}
          fetchPriority="high"
          alt={project.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4 sm:px-6">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-3 lg:mb-4"
            >
              {project.name}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center space-x-2"
            >
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              <span className="text-sm sm:text-base md:text-lg lg:text-xl">{project.location}</span>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 space-y-8 sm:space-y-12 lg:space-y-16">
        {/* Sample House Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8"
        >
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Sample House</h2>
          <button
            onClick={() => setShowSampleHouse(true)}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:from-blue-700 hover:to-emerald-700 transition-all duration-300 text-sm sm:text-base"
          >
            <ZoomIn className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">View Sample House & Floor Plans</span>
            <span className="sm:hidden">View Plans</span>
          </button>
        </motion.section>

        {/* Project Map & Plot Details */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 lg:p-8 border border-premium-gold/20"
        >
          {/* Header Section */}
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-premium-navy mb-2 tracking-tight">Project Map & Plot Information</h2>
                <p className="text-sm sm:text-base text-gray-600">Click on any plot to view detailed information</p>
                <div className="h-1 w-16 sm:w-24 bg-gradient-to-r from-premium-gold to-premium-gold-light rounded-full mt-2"></div>
          </div>
          
              {/* Live Data Indicator */}
              {project.excelUrl && (
                <div className="bg-gradient-to-br from-premium-cream to-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-premium-gold/20 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-semibold text-premium-navy">Live Data</span>
                    <button
                      onClick={refresh}
                      disabled={excelLoading}
                      className="p-1 sm:p-1.5 hover:bg-premium-gold/10 rounded-lg transition-colors"
                      aria-label="Refresh data"
                    >
                      <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 text-premium-gold ${excelLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  {excelError ? (
                    <div className="flex items-center space-x-1 text-xs text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      <span>Using cached data</span>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-600">
                      {lastUpdated ? `Updated: ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Plot Status Legend */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-xs sm:text-sm font-semibold text-gray-700">Plot Status:</span>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-green-500 border border-gray-300"></div>
                  <span className="text-xs sm:text-sm text-gray-700">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-red-500 border border-gray-300"></div>
                  <span className="text-xs sm:text-sm text-gray-700">Sold</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-purple-500 border border-gray-300"></div>
                  <span className="text-xs sm:text-sm text-gray-700">Reserved</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-yellow-500 border border-gray-300"></div>
                  <span className="text-xs sm:text-sm text-gray-700">In Progress</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Map Section - Full Width */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-3 sm:p-4 lg:p-6">
              {loadingPlots ? (
                <div className="flex items-center justify-center h-64 sm:h-80 lg:h-96">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-premium-gold mx-auto mb-4"></div>
                    <p className="text-sm sm:text-base text-gray-600">Loading plot shapes...</p>
                  </div>
                </div>
              ) : plotShapes.length > 0 ? (
                <div className="w-full overflow-auto min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] max-h-[calc(100vh-200px)] sm:max-h-[calc(100vh-250px)] lg:max-h-[calc(100vh-300px)]">
                  <PlotCanvas
                    plots={plotShapes.map(plot => {
                      // Merge Excel data status with plot shape for color coding
                      // Try multiple variations of plot number for matching
                      const plotNumberVariations = [
                        plot.plotNumber,
                        plot.plotNumber.toUpperCase(),
                        plot.plotNumber.toLowerCase(),
                        plot.plotNumber.trim(),
                        plot.plotNumber.replace(/\s+/g, ''),
                        plot.plotNumber.replace(/\s+/g, '').toUpperCase(),
                      ];
                      
                      let excelData = null;
                      for (const variation of plotNumberVariations) {
                        if (excelPlotData[variation]) {
                          excelData = excelPlotData[variation];
                          break;
                        }
                      }
                      
                      // Also try case-insensitive search in all keys
                      if (!excelData) {
                        const excelKeys = Object.keys(excelPlotData);
                        const foundKey = excelKeys.find(key => {
                          const normalizedKey = key.toString().trim().replace(/\s+/g, '').toUpperCase();
                          const normalizedPlotNumber = plot.plotNumber.toString().trim().replace(/\s+/g, '').toUpperCase();
                          return normalizedKey === normalizedPlotNumber;
                        });
                        if (foundKey) {
                          excelData = excelPlotData[foundKey];
                        }
                      }
                      
                      if (excelData && excelData.status) {
                        // Map Excel status to PlotStatus enum (case-insensitive, handle variations)
                        const excelStatus = excelData.status.toString().trim();
                        const statusUpper = excelStatus.toUpperCase();
                        const normalizedStatus = statusUpper.replace(/\s+/g, '_').replace(/-/g, '_');
                        let mappedStatus: PlotShape['status'] = 'AVAILABLE';
                        
                        // Map status values (handle all variations)
                        if (statusUpper === 'SOLD' || normalizedStatus === 'SOLD') {
                          mappedStatus = 'SOLD';
                        } else if (statusUpper === 'IN PROGRESS' || statusUpper === 'IN-PROGRESS' || 
                                   normalizedStatus === 'IN_PROGRESS' || normalizedStatus === 'INPROGRESS') {
                          mappedStatus = 'IN_PROGRESS';
                        } else if (statusUpper === 'RESERVED' || normalizedStatus === 'RESERVED') {
                          mappedStatus = 'RESERVED';
                        } else if (statusUpper === 'AVAILABLE' || normalizedStatus === 'AVAILABLE' || 
                                   normalizedStatus === 'AVAIL') {
                          mappedStatus = 'AVAILABLE';
                        }
                        
                        console.log(`Plot ${plot.plotNumber}: Excel status "${excelStatus}" -> Mapped to "${mappedStatus}"`);
                        
                        return {
                          ...plot,
                          status: mappedStatus,
                        };
                      } else {
                        console.log(`Plot ${plot.plotNumber}: No Excel data found. Available Excel keys:`, Object.keys(excelPlotData).slice(0, 5));
                      }
                      return plot;
                    })}
                    backgroundImageUrl={project?.map || project?.image}
                    originalImageWidth={plotImageDimensions?.width}
                    originalImageHeight={plotImageDimensions?.height}
                    onSelectPlot={(plot) => {
                      setSelectedPlot(plot.plotNumber);
                      const plotInfo = excelPlotData[plot.plotNumber] || (project?.plots as Record<string, PlotDetail>)?.[plot.plotNumber];
                      if (plotInfo) {
                        setPlotDetails(plotInfo);
                      }
                    }}
                />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 sm:h-80 lg:h-96 text-gray-500 px-4">
                  <p className="text-sm sm:text-base text-center">No plot shapes configured. Admin can upload a layout image to detect plots.</p>
                </div>
              )}
            </div>

            {/* Search and Details Section - Below Map */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mt-6 sm:mt-8">
              {/* Search Plot - Left Side */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-white via-premium-cream/50 to-white rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-10 border-2 border-premium-gold/30 shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-premium-gold to-premium-gold-light rounded-xl sm:rounded-2xl shadow-lg flex-shrink-0">
                    <Search className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-premium-navy" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-xl sm:text-2xl lg:text-3xl font-bold text-premium-navy mb-1">
                  Search Plot Number
                </label>
                    <p className="text-sm sm:text-base text-gray-500">Find your desired plot quickly</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-5 sm:left-6 lg:left-8 top-1/2 transform -translate-y-1/2 h-6 w-6 sm:h-7 sm:w-7 text-gray-400 pointer-events-none z-10" />
                  <input
                    type="text"
                    value={selectedPlot}
                    onChange={(e) => setSelectedPlot(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handlePlotSearch();
                        }
                      }}
                      placeholder="Enter plot number (e.g., 01, 02, A-101)..."
                      className="w-full pl-16 sm:pl-20 lg:pl-24 pr-6 sm:pr-8 py-5 sm:py-6 lg:py-7 border-[3px] border-gray-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-premium-gold focus:border-premium-gold transition-all duration-200 bg-white text-gray-900 placeholder:text-gray-400 font-bold shadow-inner hover:border-premium-gold/50 text-lg sm:text-xl lg:text-2xl min-h-[64px] sm:min-h-[72px] lg:min-h-[80px]"
                      style={{ color: '#1e293b', letterSpacing: '0.5px' }}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePlotSearch}
                    className="bg-gradient-to-r from-premium-gold via-premium-gold-light to-premium-gold text-premium-navy px-8 sm:px-10 lg:px-12 py-5 sm:py-6 lg:py-7 rounded-xl sm:rounded-2xl hover:from-premium-gold-light hover:via-premium-gold hover:to-premium-gold-bright transition-all duration-300 font-bold shadow-lg sm:shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 group min-h-[64px] sm:min-h-[72px] lg:min-h-[80px] text-lg sm:text-xl lg:text-2xl whitespace-nowrap"
                  >
                    <Search className="h-6 w-6 sm:h-7 sm:w-7 group-hover:rotate-90 transition-transform duration-300" />
                    <span>Search</span>
                  </motion.button>
                </div>
                {selectedPlot && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 sm:mt-5 text-sm sm:text-base text-gray-500 flex items-center gap-2"
                  >
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Press Enter to search</span>
                  </motion.div>
                )}
              </motion.div>

              {/* Plot Details Card - Right Side */}
              {plotDetails ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-white to-premium-cream rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 space-y-3 sm:space-y-4 border-2 border-premium-gold/30 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div>
                    <h3 className="font-bold text-premium-navy text-lg mb-1">Plot Details</h3>
                    <div className="h-1 w-16 bg-gradient-to-r from-premium-gold to-premium-gold-light rounded-full"></div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-0.5">Plot Number</p>
                      <p className="text-base font-bold text-premium-navy">{plotDetails.number}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-0.5">Area</p>
                      <p className="text-base font-semibold text-premium-navy">{plotDetails.area}</p>
                    </div>
                    {plotDetails.dimensions && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-0.5">Dimensions</p>
                        <p className="text-base font-semibold text-premium-navy">{plotDetails.dimensions}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        plotDetails.status === 'Available' ? 'bg-green-100 text-green-800' :
                        plotDetails.status === 'Sold' ? 'bg-red-100 text-red-800' :
                        plotDetails.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {plotDetails.status}
                      </span>
                    </div>
                    {plotDetails.direction && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-0.5">Direction</p>
                        <p className="text-base font-semibold text-premium-navy">{plotDetails.direction}</p>
                      </div>
                    )}
                    {plotDetails.type && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-0.5">Type</p>
                        <p className="text-base font-semibold text-premium-navy">{plotDetails.type}</p>
                      </div>
                    )}
                    {plotDetails.price && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-0.5">Price</p>
                        <p className="text-lg font-bold text-premium-gold">{plotDetails.price}</p>
                      </div>
                    )}
                    {plotDetails.negotiable && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-0.5">Negotiable</p>
                        <p className="text-base font-semibold text-premium-navy">{plotDetails.negotiable}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-premium-cream to-white rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-10 border-2 border-premium-gold/30 shadow-lg flex items-center justify-center min-h-[200px]"
                >
                  <p className="text-sm sm:text-base text-gray-600 text-center">
                    Click on any plot in the map or search by plot number to view details
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Facilities */}
        {project.facilities && Array.isArray(project.facilities) && project.facilities.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8"
          >
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Facilities</h2>
            <div className="bg-green-50 rounded-lg p-4 sm:p-6 border border-green-100">
              <ul className="space-y-2 sm:space-y-3">
                {project.facilities.map((facility: string, index: number) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-800 flex-1">{facility.trim()}</span>
                  </li>
                ))}
              </ul>
            </div>
        </motion.section>
        )}

        {/* Advantages */}
        {project.advantages && Array.isArray(project.advantages) && project.advantages.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8"
          >
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Advantages</h2>
            <div className="space-y-2 sm:space-y-3">
              {project.advantages.map((advantage: string, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-gray-700 flex-1">{advantage.trim()}</span>
                </div>
              ))}
            </div>
        </motion.section>
        )}

        {/* Google Map */}
        {project.googleMap && project.googleMap.trim() && (() => {
          const embedUrl = convertGoogleMapsToEmbed(project.googleMap);
          
          return (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8"
            >
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Location</h2>
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shadow-inner relative">
                <iframe
                  src={embedUrl}
                  width="100%"
                  height="100%"
                  style={{ 
                    border: 0,
                    display: 'block'
                  }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Project Location"
                  className="w-full h-full"
                ></iframe>
              </div>
              {embedUrl !== project.googleMap && !embedUrl.includes('/embed') && !embedUrl.includes('output=embed') && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800 text-center">
                    <strong>Note:</strong> Using sharing link. For best results, use the embed URL from Google Maps (Share → Embed a map).
                  </p>
                </div>
              )}
            </motion.section>
          );
        })()}
      </div>

      {/* Sample House Modal */}
      {showSampleHouse && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Sample House & Floor Plans</h3>
                <button
                  onClick={() => setShowSampleHouse(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Section Tabs (3BHK / 4BHK) */}
                <div className="flex space-x-4 mb-4 border-b border-gray-200">
                  <button
                    onClick={() => {
                      setCurrentSection('threeBHK');
                      setCurrentView('house');
                    }}
                    className={`px-6 py-3 rounded-t-lg transition-colors font-semibold ${
                      currentSection === 'threeBHK' 
                        ? 'bg-blue-600 text-white border-b-2 border-blue-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    3BHK
                  </button>
                  <button
                    onClick={() => {
                      setCurrentSection('fourBHK');
                      setCurrentView('house');
                    }}
                    className={`px-6 py-3 rounded-t-lg transition-colors font-semibold ${
                      currentSection === 'fourBHK' 
                        ? 'bg-blue-600 text-white border-b-2 border-blue-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    4BHK
                  </button>
                </div>

                {/* View Tabs (House / Floor Plan) */}
                <div className="flex space-x-4 mb-4">
                  <button
                    onClick={() => setCurrentView('house')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentView === 'house' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Sample House
                  </button>
                  <button
                    onClick={() => setCurrentView('floorPlan')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentView === 'floorPlan' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Floor Plan
                  </button>
                </div>

                {/* Image Display with Zoom */}
                <div className="relative">
                  {(() => {
                    const section = project.sampleHouse?.[currentSection];
                    const imageUrl = currentView === 'house' ? section?.image : section?.floorPlan;
                    
                    if (!imageUrl) {
                      return (
                        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                          <p className="text-gray-500">No {currentView === 'house' ? 'sample house' : 'floor plan'} image available for {currentSection === 'threeBHK' ? '3BHK' : '4BHK'}</p>
                        </div>
                      );
                    }

                    if (currentView === 'floorPlan') {
                      // Zoomable floor plan using the same zoom functionality
                      return <ZoomableImage src={imageUrl} alt={`${currentSection === 'threeBHK' ? '3BHK' : '4BHK'} Floor Plan`} />;
                    } else {
                      // Regular image for sample house
                      return (
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={`${currentSection === 'threeBHK' ? '3BHK' : '4BHK'} Sample House`}
                            className="w-full h-full object-contain rounded-lg"
                          />
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;