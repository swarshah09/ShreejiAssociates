import React from 'react';
import { Stage, Layer, Line, Image as KonvaImage, Circle, Group } from 'react-konva';
import type { PlotShape, PlotStatus } from '../types/plots';
import { ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react';

const STATUS_COLOR: Record<PlotStatus, string> = {
  AVAILABLE: '#22c55e',
  SOLD: '#ef4444',
  IN_PROGRESS: '#facc15',
  RESERVED: '#a855f7',
};

export interface PlotCanvasProps {
  plots: PlotShape[];
  width?: number;
  height?: number;
  backgroundImageUrl?: string; // URL of the layout image to display behind plots
  originalImageWidth?: number; // Original image width from detection (for coordinate scaling)
  originalImageHeight?: number; // Original image height from detection (for coordinate scaling)
  onSelectPlot?: (plot: PlotShape) => void;
  containerRef?: React.RefObject<HTMLDivElement>; // Optional container ref for responsive sizing
  // Drawing mode props
  drawingMode?: boolean; // Enable drawing mode
  currentDrawingPoints?: number[]; // Current polygon being drawn [x1, y1, x2, y2, ...]
  onCanvasClick?: (x: number, y: number) => void; // Callback when canvas is clicked in drawing mode
  onGetScaleFactors?: (scaleX: number, scaleY: number) => void; // Callback to get scale factors for coordinate conversion
  // Edit mode props
  editMode?: boolean; // Enable edit mode
  selectedPlotId?: string | null; // Currently selected plot for editing
  onPlotSelect?: (plotId: string | null) => void; // Callback when plot is selected
  onPlotUpdate?: (plotId: string, newPoints: number[]) => void; // Callback when plot shape is updated
}

export const PlotCanvas: React.FC<PlotCanvasProps> = ({
  plots,
  width,
  height,
  backgroundImageUrl,
  originalImageWidth,
  originalImageHeight,
  onSelectPlot,
  containerRef,
  drawingMode = false,
  currentDrawingPoints = [],
  onCanvasClick,
  onGetScaleFactors,
  editMode = false,
  selectedPlotId = null,
  onPlotSelect,
  onPlotUpdate,
}) => {
  const [hoveredPlotId, setHoveredPlotId] = React.useState<string | null>(null);
  const [internalSelectedPlotId, setInternalSelectedPlotId] = React.useState<string | null>(null);
  const [bgImage, setBgImage] = React.useState<HTMLImageElement | null>(null);
  
  // Use prop selectedPlotId in edit mode, otherwise use internal state
  const activeSelectedPlotId = editMode ? selectedPlotId : internalSelectedPlotId;
  const [containerSize, setContainerSize] = React.useState({ width: 0, height: 0 });
  const canvasContainerRef = React.useRef<HTMLDivElement>(null);
  
  // Zoom and pan state
  const [zoom, setZoom] = React.useState(1);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [lastPointerPosition, setLastPointerPosition] = React.useState({ x: 0, y: 0 });
  const [touchStartPos, setTouchStartPos] = React.useState<{ x: number; y: number } | null>(null);
  const stageRef = React.useRef<any>(null);

  // Use provided ref or create internal ref
  const actualContainerRef = containerRef || canvasContainerRef;

  // Load background image if provided
  React.useEffect(() => {
    if (backgroundImageUrl) {
      console.log('PlotCanvas: Loading background image from URL:', backgroundImageUrl.substring(0, 100));
      const img = new window.Image();
      // Don't set crossOrigin for data URLs or same-origin images
      // For Cloudinary URLs, we need crossOrigin to avoid CORS issues
      if (backgroundImageUrl.startsWith('http') && !backgroundImageUrl.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => {
        console.log('✅ PlotCanvas: Background image loaded successfully. Dimensions:', img.width, 'x', img.height);
        setBgImage(img);
      };
      img.onerror = (e) => {
        console.error('❌ PlotCanvas: Failed to load background image:', backgroundImageUrl.substring(0, 100), e);
        setBgImage(null);
      };
      img.src = backgroundImageUrl;
    } else {
      console.log('PlotCanvas: No background image URL provided');
      setBgImage(null);
    }
  }, [backgroundImageUrl]);

  // Calculate responsive size based on container and image dimensions
  React.useEffect(() => {
    const updateSize = () => {
      if (actualContainerRef.current) {
        const container = actualContainerRef.current;
        const containerWidth = container.clientWidth || container.offsetWidth || 1200;
        const containerHeight = container.clientHeight || container.offsetHeight || window.innerHeight * 0.7;

        // Use original image dimensions if provided, otherwise use loaded image
        const imgWidth = originalImageWidth || bgImage?.width || width || containerWidth;
        const imgHeight = originalImageHeight || bgImage?.height || height || containerHeight;

        if (imgWidth > 0 && imgHeight > 0) {
          // Calculate scale to fit image in container while maintaining aspect ratio
          const imageAspect = imgWidth / imgHeight;
          const containerAspect = containerWidth / containerHeight;

          let stageWidth: number;
          let stageHeight: number;

          if (imageAspect > containerAspect) {
            // Image is wider - fit to width
            stageWidth = containerWidth;
            stageHeight = containerWidth / imageAspect;
          } else {
            // Image is taller - fit to height
            stageHeight = containerHeight;
            stageWidth = containerHeight * imageAspect;
          }

          setContainerSize({ width: stageWidth, height: stageHeight });
        } else {
          // Fallback to container size
          setContainerSize({ width: containerWidth, height: containerHeight });
        }
      }
    };

    // Initial size calculation
    updateSize();
    
    // Update on resize
    window.addEventListener('resize', updateSize);
    
    // Also update when image loads
    if (bgImage) {
      updateSize();
    }
    
    return () => window.removeEventListener('resize', updateSize);
  }, [bgImage, width, height, originalImageWidth, originalImageHeight, actualContainerRef]);

  // Calculate scale factor for plot coordinates
  // Use original image dimensions if provided (from API), otherwise use loaded image dimensions
  const sourceWidth = originalImageWidth || bgImage?.width || width || 1;
  const sourceHeight = originalImageHeight || bgImage?.height || height || 1;
  
  const scaleX = containerSize.width > 0 && sourceWidth > 0 ? containerSize.width / sourceWidth : 1;
  const scaleY = containerSize.height > 0 && sourceHeight > 0 ? containerSize.height / sourceHeight : 1;

  // Notify parent of scale factors for coordinate conversion
  React.useEffect(() => {
    if (onGetScaleFactors) {
      onGetScaleFactors(scaleX, scaleY);
    }
  }, [scaleX, scaleY, onGetScaleFactors]);

  // Handle canvas click in drawing mode or edit mode
  const handleStageClick = (e: any) => {
    // Don't trigger click if we were dragging
    if (isDragging) {
      return;
    }

    const stage = e.target.getStage();
    const target = e.target;
    
    // In drawing mode, allow clicks on stage, background image, or empty space
    // Only prevent clicks on plot shapes (Line elements)
    if (drawingMode && onCanvasClick) {
      // Check if clicking on a plot shape (Line element) or vertex (Circle)
      if (target.getType && (target.getType() === 'Line' || target.getType() === 'Circle')) {
        return; // Don't handle clicks on plot shapes in drawing mode
      }
      
      const pointerPos = stage.getPointerPosition();
      if (pointerPos) {
        // Convert canvas coordinates back to original image coordinates
        // Account for zoom and pan
        const originalX = (pointerPos.x - position.x) / (scaleX * zoom);
        const originalY = (pointerPos.y - position.y) / (scaleY * zoom);
        onCanvasClick(originalX, originalY);
      }
    } else if (editMode && onPlotSelect) {
      // In edit mode, only deselect when clicking on stage or background
      if (target === stage || (target.getType && target.getType() === 'Image')) {
        onPlotSelect(null);
      }
    }
  };

  // Zoom functions
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 5)); // Max zoom 5x
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.5)); // Min zoom 0.5x
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Handle mouse wheel zoom
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;

    const scaleBy = 1.1;
    const oldScale = zoom;
    const mousePointTo = {
      x: (pointerPos.x - position.x) / oldScale,
      y: (pointerPos.y - position.y) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const clampedScale = Math.max(0.5, Math.min(5, newScale));
    
    setZoom(clampedScale);
    setPosition({
      x: pointerPos.x - mousePointTo.x * clampedScale,
      y: pointerPos.y - mousePointTo.y * clampedScale,
    });
  };

  // Handle pan (drag to move)
  const handleStageMouseDown = (e: any) => {
    const target = e.target;
    const targetType = target.getType ? target.getType() : '';
    
    // Only allow panning if not in drawing mode and not clicking/touching on a plot or circle
    if (!drawingMode && targetType !== 'Line' && targetType !== 'Circle') {
      setIsDragging(true);
      const stage = target.getStage();
      const pointerPos = stage.getPointerPosition();
      if (pointerPos) {
        setLastPointerPosition(pointerPos);
      }
    } else {
      // If touching a plot, don't start dragging
      setIsDragging(false);
    }
  };

  const handleStageMouseMove = (e: any) => {
    if (isDragging) {
      const stage = e.target.getStage();
      const pointerPos = stage.getPointerPosition();
      if (pointerPos) {
        const newPosition = {
          x: position.x + (pointerPos.x - lastPointerPosition.x),
          y: position.y + (pointerPos.y - lastPointerPosition.y),
        };
        setPosition(newPosition);
        setLastPointerPosition(pointerPos);
      }
    }
  };

  const handleStageMouseUp = () => {
    setIsDragging(false);
    setTouchStartPos(null);
  };
  
  // Handle touch start - track initial position to distinguish tap from drag
  const handleStageTouchStart = (e: any) => {
    const target = e.target;
    const targetType = target.getType ? target.getType() : '';
    
    // If touching a plot (Line) or circle, don't start dragging
    if (targetType === 'Line' || targetType === 'Circle') {
      setIsDragging(false);
      setTouchStartPos(null);
      return;
    }
    
    // Track touch position for tap detection
    const stage = target.getStage();
    const pointerPos = stage.getPointerPosition();
    if (pointerPos) {
      setTouchStartPos(pointerPos);
      setLastPointerPosition(pointerPos);
    }
  };
  
  // Handle touch move - only start dragging if moved significantly
  const handleStageTouchMove = (e: any) => {
    if (!touchStartPos) return;
    
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    if (pointerPos) {
      // Calculate distance moved
      const dx = Math.abs(pointerPos.x - touchStartPos.x);
      const dy = Math.abs(pointerPos.y - touchStartPos.y);
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Only start dragging if moved more than 5 pixels (prevents accidental drags on taps)
      if (distance > 5 && !isDragging) {
        setIsDragging(true);
      }
      
      if (isDragging) {
        const newPosition = {
          x: position.x + (pointerPos.x - lastPointerPosition.x),
          y: position.y + (pointerPos.y - lastPointerPosition.y),
        };
        setPosition(newPosition);
        setLastPointerPosition(pointerPos);
      }
    }
  };
  
  // Handle touch end
  const handleStageTouchEnd = () => {
    setIsDragging(false);
    setTouchStartPos(null);
  };

  // Handle vertex drag in edit mode
  const handleVertexDrag = (plotId: string, vertexIndex: number, newX: number, newY: number) => {
    if (!onPlotUpdate) return;
    
    const plot = plots.find(p => p.id === plotId);
    if (!plot) return;

    // Convert canvas coordinates back to original image coordinates
    // Account for zoom and pan
    const originalX = (newX - position.x) / (scaleX * zoom);
    const originalY = (newY - position.y) / (scaleY * zoom);

    // Update the specific vertex
    const newPoints = [...plot.points];
    newPoints[vertexIndex * 2] = originalX;
    newPoints[vertexIndex * 2 + 1] = originalY;

    onPlotUpdate(plotId, newPoints);
  };

  // Debug logging
  React.useEffect(() => {
    if (backgroundImageUrl) {
      console.log('PlotCanvas: Background image URL provided:', backgroundImageUrl.substring(0, 100));
    } else {
      console.log('PlotCanvas: No background image URL');
    }
    if (bgImage) {
      console.log('PlotCanvas: Background image loaded, dimensions:', bgImage.width, 'x', bgImage.height);
    }
  }, [backgroundImageUrl, bgImage]);

  return (
    <div ref={actualContainerRef} className="w-full h-full min-h-[600px] flex items-center justify-center bg-gray-50 relative">
      {containerSize.width > 0 && containerSize.height > 0 ? (
        <div className="relative z-10 w-full h-full">
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
          {!drawingMode && !editMode && (
            <div className="absolute top-4 left-4 z-20 bg-white/90 rounded-lg shadow-lg p-2 text-xs text-gray-600 border border-gray-200">
              <div className="flex items-center gap-2">
                <Move className="h-4 w-4" />
                <span>Drag to pan • Scroll to zoom</span>
              </div>
            </div>
          )}

          <Stage 
            ref={stageRef}
            width={containerSize.width} 
            height={containerSize.height}
            scaleX={zoom}
            scaleY={zoom}
            x={position.x}
            y={position.y}
            onClick={handleStageClick}
            onTap={handleStageClick}
            onWheel={handleWheel}
            onMouseDown={handleStageMouseDown}
            onMouseMove={handleStageMouseMove}
            onMouseUp={handleStageMouseUp}
            onTouchStart={handleStageTouchStart}
            onTouchMove={handleStageTouchMove}
            onTouchEnd={handleStageTouchEnd}
            style={{ cursor: isDragging ? 'grabbing' : drawingMode ? 'crosshair' : editMode ? 'pointer' : 'grab' }}
          >
            <Layer>
              {/* Background image layer - displays the original layout plan at full resolution */}
              {bgImage ? (
                <KonvaImage
                  image={bgImage}
                  x={0}
                  y={0}
                  width={containerSize.width}
                  height={containerSize.height}
                  opacity={1.0}
                  listening={drawingMode || editMode}
                />
              ) : backgroundImageUrl ? (
                // Fallback: Show loading or placeholder if image hasn't loaded yet
                <KonvaImage
                  image={null}
                  x={0}
                  y={0}
                  width={containerSize.width}
                  height={containerSize.height}
                  fill="#f3f4f6"
                />
              ) : (
                // No image at all - show gray background
                <KonvaImage
                  image={null}
                  x={0}
                  y={0}
                  width={containerSize.width}
                  height={containerSize.height}
                  fill="#e5e7eb"
                />
              )}
            
            {/* Plot polygons layer - overlays on top of background image */}
            {plots.map((plot) => {
              const isHovered = hoveredPlotId === plot.id;
              const isSelected = activeSelectedPlotId === plot.id;
              const isEditing = editMode && activeSelectedPlotId === plot.id;
              const baseColor = STATUS_COLOR[plot.status];

              // Scale plot coordinates to match scaled image
              // Points are [x1, y1, x2, y2, ...] so alternate between X and Y scaling
              const scaledPoints = plot.points.map((coord, idx) => 
                idx % 2 === 0 ? coord * scaleX : coord * scaleY
              );

              return (
                <Group key={plot.id}>
                  <Line
                    points={scaledPoints}
                    closed
                    fill={baseColor}
                    opacity={isSelected ? 0.6 : isHovered ? 0.5 : 0.3}
                    stroke={isEditing ? '#D4AF37' : isSelected ? '#D4AF37' : isHovered ? '#2563eb' : '#111827'}
                    strokeWidth={(isEditing ? 3 : isSelected ? 3 : isHovered ? 2.5 : 2) / zoom}
                    shadowBlur={isHovered || isSelected ? 12 : 0}
                    shadowColor={isHovered || isSelected ? '#D4AF37' : 'transparent'}
                    onMouseEnter={() => setHoveredPlotId(plot.id)}
                    onMouseLeave={() => setHoveredPlotId(null)}
                    onClick={(e) => {
                      e.cancelBubble = true;
                      if (editMode && onPlotSelect) {
                        onPlotSelect(plot.id);
                      } else {
                        setInternalSelectedPlotId(plot.id);
                        if (onSelectPlot) {
                          onSelectPlot(plot);
                        }
                      }
                    }}
                    onTap={(e) => {
                      e.cancelBubble = true;
                      // Handle tap for mobile devices
                      if (editMode && onPlotSelect) {
                        onPlotSelect(plot.id);
                      } else {
                        setInternalSelectedPlotId(plot.id);
                        if (onSelectPlot) {
                          onSelectPlot(plot);
                        }
                      }
                    }}
                  />
                  {/* Show draggable vertices in edit mode */}
                  {isEditing && scaledPoints.length >= 2 && (
                    <>
                      {scaledPoints.map((coord, idx) => {
                        if (idx % 2 === 0) {
                          const x = coord;
                          const y = scaledPoints[idx + 1];
                          const vertexIndex = idx / 2;
                          return (
                            <Circle
                              key={`vertex-${vertexIndex}`}
                              x={x}
                              y={y}
                              radius={6 / zoom}
                              fill="#D4AF37"
                              stroke="#fff"
                              strokeWidth={2 / zoom}
                              draggable
                              onDragMove={(e) => {
                                const stage = e.target.getStage();
                                if (stage) {
                                  const pointerPos = stage.getPointerPosition();
                                  if (pointerPos) {
                                    handleVertexDrag(plot.id, vertexIndex, pointerPos.x, pointerPos.y);
                                  }
                                }
                              }}
                              onMouseEnter={(e) => {
                                const stage = e.target.getStage();
                                if (stage) {
                                  stage.container().style.cursor = 'move';
                                }
                              }}
                              onMouseLeave={(e) => {
                                const stage = e.target.getStage();
                                if (stage) {
                                  stage.container().style.cursor = 'default';
                                }
                              }}
                            />
                          );
                        }
                        return null;
                      })}
                    </>
                  )}
                </Group>
              );
            })}

            {/* Drawing mode: Show current polygon being drawn */}
            {drawingMode && currentDrawingPoints.length > 0 && (
              <>
                {/* Draw lines connecting points */}
                {currentDrawingPoints.length >= 4 && (
                  <Line
                    points={currentDrawingPoints.map((coord, idx) => 
                      idx % 2 === 0 ? coord * scaleX : coord * scaleY
                    )}
                    closed={false}
                    stroke="#3b82f6"
                    strokeWidth={2 / zoom}
                    dash={[5, 5]}
                  />
                )}
                {/* Draw points */}
                {currentDrawingPoints.map((coord, idx) => {
                  if (idx % 2 === 0) {
                    const x = coord * scaleX;
                    const y = currentDrawingPoints[idx + 1] * scaleY;
                    return (
                      <Circle
                        key={`draw-point-${idx}`}
                        x={x}
                        y={y}
                        radius={5 / zoom}
                        fill="#3b82f6"
                        stroke="#fff"
                        strokeWidth={2 / zoom}
                      />
                    );
                  }
                  return null;
                })}
              </>
            )}
          </Layer>
        </Stage>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlotCanvas;


