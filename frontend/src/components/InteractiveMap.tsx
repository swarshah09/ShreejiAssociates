import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info } from 'lucide-react';

// PlotArea interface
export interface PlotArea {
  id: string;
  coordinates: number[][]; // Array of [x, y] coordinates defining the polygon
  plotNumber: string;
  status: 'Available' | 'Sold' | 'In Progress' | 'Reserved';
  area?: string;
  dimensions?: string;
  direction?: string;
  type?: string;
  price?: string;
  negotiable?: string;
}

interface PlotInfo {
  number?: string;
  area?: string;
  dimensions?: string;
  status?: string;
  direction?: string;
  type?: string;
  price?: string;
  negotiable?: string;
}

interface InteractiveMapProps {
  imageUrl: string;
  plotData: Record<string, PlotInfo>;
  plotAreas?: PlotArea[]; // Optional: predefined plot areas for this project
  onPlotClick?: (plotNumber: string) => void;
  showAdminControls?: boolean;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  imageUrl, 
  plotData, 
  plotAreas: providedPlotAreas,
  onPlotClick,
  showAdminControls = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredPlot, setHoveredPlot] = useState<PlotArea | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<PlotArea | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [plotAreas, setPlotAreas] = useState<PlotArea[]>([]);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState<number[][]>([]);
  const [newPlotNumber, setNewPlotNumber] = useState('');
  const [viewBox, setViewBox] = useState('0 0 800 600');

  // Initialize plot areas
  useEffect(() => {
    if (providedPlotAreas && providedPlotAreas.length > 0) {
      setPlotAreas(providedPlotAreas);
    } else {
      // Default sample plots if none provided
      setPlotAreas([]);
    }
  }, [providedPlotAreas]);

  // Handle image load
  useEffect(() => {
    const img = imageRef.current;
    if (img && img.complete) {
      handleImageLoad();
    }
  }, [imageUrl]);

  const handleImageLoad = () => {
    const img = imageRef.current;
    if (img) {
      // Use actual image dimensions for accurate coordinate mapping
      const width = img.naturalWidth || img.width || 800;
      const height = img.naturalHeight || img.height || 600;
      setImageDimensions({ width, height });
      setViewBox(`0 0 ${width} ${height}`);
      setIsImageLoaded(true);
    }
  };

  const getStatusColor = (status: string, isHovered: boolean = false, isSelected: boolean = false) => {
    // Lower opacity so the background map is clearly visible
    const baseOpacity = isSelected ? 0.6 : isHovered ? 0.5 : 0.35;
    const strokeWidth = isSelected ? 3.5 : isHovered ? 3 : 2.5;
    
    switch (status) {
      case 'Available':
        return {
          fill: `rgba(34, 197, 94, ${baseOpacity})`,
          stroke: '#16a34a',
          strokeWidth,
        };
      case 'Sold':
        return {
          fill: `rgba(239, 68, 68, ${baseOpacity})`,
          stroke: '#dc2626',
          strokeWidth,
        };
      case 'In Progress':
        return {
          fill: `rgba(251, 191, 36, ${baseOpacity})`,
          stroke: '#d97706',
          strokeWidth,
        };
      case 'Reserved':
        return {
          fill: `rgba(168, 85, 247, ${baseOpacity})`,
          stroke: '#9333ea',
          strokeWidth,
        };
      default:
        return {
          fill: `rgba(156, 163, 175, ${baseOpacity})`,
          stroke: '#6b7280',
          strokeWidth,
        };
    }
  };

  const isPointInPolygon = (point: number[], polygon: number[][]): boolean => {
    const [x, y] = point;
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    
    return inside;
  };

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || !isImageLoaded) return;

    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    
    // Convert mouse coordinates to SVG coordinates
    const point = svg.createSVGPoint();
    point.x = event.clientX - rect.left;
    point.y = event.clientY - rect.top;
    
    const ctm = svg.getScreenCTM();
    if (ctm) {
      const svgPoint = point.matrixTransform(ctm.inverse());
      const x = svgPoint.x;
      const y = svgPoint.y;

      setMousePosition({ x: event.clientX, y: event.clientY });

      // Check if mouse is over any plot
      const hoveredPlotArea = plotAreas.find(plot => 
        isPointInPolygon([x, y], plot.coordinates)
      );

      setHoveredPlot(hoveredPlotArea || null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredPlot(null);
  };

  const handlePlotClick = (plot: PlotArea) => {
    setSelectedPlot(plot);
    if (onPlotClick) {
      onPlotClick(plot.plotNumber);
    }
  };

  const handleSVGClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (isDrawingMode) {
      if (!svgRef.current) return;
      const svg = svgRef.current;
      const rect = svg.getBoundingClientRect();
      const point = svg.createSVGPoint();
      point.x = event.clientX - rect.left;
      point.y = event.clientY - rect.top;
      const ctm = svg.getScreenCTM();
      if (ctm) {
        const svgPoint = point.matrixTransform(ctm.inverse());
        setCurrentDrawing(prev => [...prev, [svgPoint.x, svgPoint.y]]);
      }
    } else if (hoveredPlot) {
      handlePlotClick(hoveredPlot);
    }
  };

  const finishDrawing = () => {
    if (currentDrawing.length >= 3 && newPlotNumber) {
      const newPlot: PlotArea = {
        id: Date.now().toString(),
        coordinates: [...currentDrawing],
        plotNumber: newPlotNumber,
        status: 'Available'
      };
      
      setPlotAreas(prev => [...prev, newPlot]);
      setCurrentDrawing([]);
      setNewPlotNumber('');
      setIsDrawingMode(false);
    }
  };

  const cancelDrawing = () => {
    setCurrentDrawing([]);
    setNewPlotNumber('');
    setIsDrawingMode(false);
  };

  const getPlotCenter = (coordinates: number[][]) => {
    const sumX = coordinates.reduce((sum, coord) => sum + coord[0], 0);
    const sumY = coordinates.reduce((sum, coord) => sum + coord[1], 0);
    return {
      x: sumX / coordinates.length,
      y: sumY / coordinates.length
    };
  };

  const getSelectedPlotInfo = () => {
    if (!selectedPlot) return null;
    const plotInfo = plotData[selectedPlot.plotNumber] || {};
    return {
      number: selectedPlot.plotNumber,
      area: plotInfo.area || selectedPlot.area || 'N/A',
      dimensions: plotInfo.dimensions || selectedPlot.dimensions || 'N/A',
      status: plotInfo.status || selectedPlot.status || 'Available',
      direction: plotInfo.direction || selectedPlot.direction || 'N/A',
      type: plotInfo.type || selectedPlot.type || 'N/A',
      price: plotInfo.price || selectedPlot.price || 'N/A',
      negotiable: plotInfo.negotiable || selectedPlot.negotiable || 'N/A',
    };
  };

  const selectedPlotInfo = getSelectedPlotInfo();

  return (
    <div className="relative">
      {/* Admin Controls */}
      {showAdminControls && (
        <div className="mb-4 p-4 bg-premium-cream rounded-xl border border-premium-gold/20">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsDrawingMode(!isDrawingMode)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isDrawingMode 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-premium-gold text-premium-navy hover:bg-premium-gold-light'
            }`}
          >
            {isDrawingMode ? 'Cancel Drawing' : 'Draw New Plot'}
          </button>
          
          {isDrawingMode && (
            <>
              <input
                type="text"
                value={newPlotNumber}
                onChange={(e) => setNewPlotNumber(e.target.value)}
                  placeholder="Enter plot number (e.g., 01, 02, A-101)"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-premium-gold focus:border-transparent"
              />
              <button
                onClick={finishDrawing}
                disabled={currentDrawing.length < 3 || !newPlotNumber}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Finish Plot
              </button>
              <button
                onClick={cancelDrawing}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </>
          )}
        </div>
        
        {isDrawingMode && (
          <p className="text-sm text-gray-600 mt-2">
            Click on the map to draw plot boundaries. Click at least 3 points to create a plot area.
          </p>
        )}
      </div>
      )}

      {/* Legend */}
      <div className="mb-4 flex flex-wrap items-center gap-4 text-sm bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded border border-green-600"></div>
          <span className="font-medium">Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded border border-red-600"></div>
          <span className="font-medium">Sold</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-500 rounded border border-yellow-600"></div>
          <span className="font-medium">In Progress</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-purple-500 rounded border border-purple-600"></div>
          <span className="font-medium">Reserved</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative border-2 border-premium-gold/30 rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
        {/* Hidden image for dimensions - used to get actual image size */}
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Project Map"
          className="hidden"
          onLoad={handleImageLoad}
          crossOrigin="anonymous"
        />
        
        {isImageLoaded && (
          <svg
            ref={svgRef}
            viewBox={viewBox}
            className="w-full h-auto cursor-pointer bg-gray-100"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleSVGClick}
            style={{ 
              cursor: isDrawingMode ? 'crosshair' : hoveredPlot ? 'pointer' : 'default',
              minHeight: '500px',
              display: 'block'
            }}
          >
            {/* Background Image - Site Layout Plan */}
            <image
              href={imageUrl}
              x="0"
              y="0"
              width={imageDimensions.width || 800}
              height={imageDimensions.height || 600}
              preserveAspectRatio="xMidYMid meet"
              style={{
                opacity: 1
              }}
            />

            {/* Plot Areas */}
            {plotAreas.map((plot) => {
              const isHovered = hoveredPlot?.id === plot.id;
              const isSelected = selectedPlot?.id === plot.id;
              const plotInfo = plotData[plot.plotNumber] || {};
              const status = plotInfo.status || plot.status;
              const colors = getStatusColor(status, isHovered, isSelected);
              const center = getPlotCenter(plot.coordinates);
              
              // Create polygon points string
              const points = plot.coordinates.map(coord => `${coord[0]},${coord[1]}`).join(' ');

              return (
                <g key={plot.id} style={{ cursor: 'pointer' }}>
                  {/* Plot Polygon Overlay - Clickable */}
                  <polygon
                    points={points}
                    fill={colors.fill}
                    stroke={colors.stroke}
                    strokeWidth={colors.strokeWidth}
                    className="transition-all duration-200"
                    style={{
                      filter: isHovered || isSelected 
                        ? 'drop-shadow(0 0 12px rgba(212, 175, 55, 0.8)) brightness(1.1)' 
                        : 'none',
                      pointerEvents: 'all'
                    }}
                    onMouseEnter={() => setHoveredPlot(plot)}
                    onMouseLeave={() => setHoveredPlot(null)}
                  />
                  {/* Plot Number Label - Always visible on top */}
                  <text
                    x={center.x}
                    y={center.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="font-bold pointer-events-none"
                    fill={isSelected || isHovered ? '#0A1929' : '#ffffff'}
                    style={{
                      fontSize: isSelected ? '16px' : isHovered ? '15px' : '13px',
                      fontWeight: 'bold',
                      filter: isSelected || isHovered 
                        ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' 
                        : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 2px rgba(212, 175, 55, 0.9))',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
                    }}
                  >
                    {plot.plotNumber}
                  </text>
                </g>
              );
            })}

            {/* Current Drawing */}
            {isDrawingMode && currentDrawing.length > 0 && (
              <polyline
                points={currentDrawing.map(coord => `${coord[0]},${coord[1]}`).join(' ')}
                fill="none"
                stroke="#D4AF37"
                strokeWidth="3"
                strokeDasharray="5,5"
                opacity="0.8"
              />
            )}
          </svg>
        )}

        {/* Hover Tooltip */}
        <AnimatePresence>
          {hoveredPlot && !selectedPlot && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed z-50 bg-white rounded-xl shadow-2xl border-2 border-premium-gold/30 p-4 pointer-events-none max-w-xs"
              style={{
                left: mousePosition.x + 15,
                top: mousePosition.y - 10,
                transform: 'translateY(-100%)'
              }}
            >
              <div className="space-y-2">
                <h3 className="font-bold text-premium-navy text-lg">{hoveredPlot.plotNumber}</h3>
                {(() => {
                  const plotInfo = plotData[hoveredPlot.plotNumber] || {};
                  const status = plotInfo.status || hoveredPlot.status;
                  
                  return (
                    <>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          status === 'Available' ? 'bg-green-100 text-green-800' :
                          status === 'Sold' ? 'bg-red-100 text-red-800' :
                          status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {status}
                        </span>
                      </div>
                      {plotInfo.area && (
                        <p className="text-sm"><span className="font-medium text-gray-600">Area:</span> <span className="text-premium-navy">{plotInfo.area}</span></p>
                      )}
                      {plotInfo.price && (
                        <p className="text-sm"><span className="font-medium text-gray-600">Price:</span> <span className="text-premium-gold font-semibold">{plotInfo.price}</span></p>
                      )}
                    </>
                  );
                })()}
                <p className="text-xs text-gray-500 pt-2 border-t border-gray-200">Click to view details</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected Plot Details Modal */}
      <AnimatePresence>
        {selectedPlot && selectedPlotInfo && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPlot(null)}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative border-2 border-premium-gold/30"
              >
                <button
                  onClick={() => setSelectedPlot(null)}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Info className="h-6 w-6 text-premium-gold" />
                      <h3 className="text-2xl font-bold text-premium-navy">Plot Details</h3>
                    </div>
                    <div className="h-1 w-20 bg-gradient-to-r from-premium-gold to-premium-gold-light rounded-full"></div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Plot Number</p>
                        <p className="text-lg font-bold text-premium-navy">{selectedPlotInfo.number}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          selectedPlotInfo.status === 'Available' ? 'bg-green-100 text-green-800' :
                          selectedPlotInfo.status === 'Sold' ? 'bg-red-100 text-red-800' :
                          selectedPlotInfo.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {selectedPlotInfo.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Area</p>
                        <p className="text-base font-semibold text-premium-navy">{selectedPlotInfo.area}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Dimensions</p>
                        <p className="text-base font-semibold text-premium-navy">{selectedPlotInfo.dimensions}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Direction</p>
                        <p className="text-base font-semibold text-premium-navy">{selectedPlotInfo.direction}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Type</p>
                        <p className="text-base font-semibold text-premium-navy">{selectedPlotInfo.type}</p>
                      </div>
          </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Price</p>
                      <p className="text-xl font-bold text-premium-gold">{selectedPlotInfo.price}</p>
        </div>
        
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Negotiable</p>
                      <p className="text-base font-semibold text-premium-navy">{selectedPlotInfo.negotiable}</p>
          </div>
        </div>
        
                  <button
                    onClick={() => setSelectedPlot(null)}
                    className="w-full bg-gradient-to-r from-premium-gold to-premium-gold-light text-premium-navy px-6 py-3 rounded-xl font-semibold hover:from-premium-gold-light hover:to-premium-gold-bright transition-all duration-300 shadow-lg"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Plot Statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {['Available', 'Sold', 'In Progress', 'Reserved'].map((status) => {
          const count = plotAreas.filter(plot => {
              const plotInfo = plotData[plot.plotNumber] || {};
            const plotStatus = plotInfo.status || plot.status;
            return plotStatus === status;
          }).length;

          const colors = {
            'Available': 'bg-green-50 border-green-200 text-green-700',
            'Sold': 'bg-red-50 border-red-200 text-red-700',
            'In Progress': 'bg-yellow-50 border-yellow-200 text-yellow-700',
            'Reserved': 'bg-purple-50 border-purple-200 text-purple-700',
          };

          return (
            <div key={status} className={`p-4 rounded-xl border-2 text-center ${colors[status as keyof typeof colors]}`}>
              <div className="text-3xl font-bold mb-1">{count}</div>
              <div className="text-sm font-medium">{status}</div>
          </div>
          );
        })}
      </div>
    </div>
  );
};

export default InteractiveMap;
