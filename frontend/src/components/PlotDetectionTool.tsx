import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Download, Upload, X, Check, Grid, MousePointerClick } from 'lucide-react';
import { PlotArea } from './InteractiveMap';

interface PlotDetectionToolProps {
  imageUrl: string;
  onPlotsDetected: (plots: PlotArea[], imageDimensions?: { width: number; height: number }) => void;
  existingPlots?: PlotArea[];
}

const PlotDetectionTool: React.FC<PlotDetectionToolProps> = ({
  imageUrl,
  onPlotsDetected,
  existingPlots = []
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [detectedPlots, setDetectedPlots] = useState<PlotArea[]>(existingPlots);
  const [mode, setMode] = useState<'manual' | 'grid'>('grid');
  const [currentPlot, setCurrentPlot] = useState<number[][]>([]);
  const [plotNumber, setPlotNumber] = useState('');
  const [gridSettings, setGridSettings] = useState({ rows: 10, cols: 10 });

  useEffect(() => {
    const img = imageRef.current;
    if (img) {
      if (img.complete) {
        handleImageLoad();
      } else {
        img.onload = handleImageLoad;
      }
    }
  }, [imageUrl]);

  const handleImageLoad = () => {
    const img = imageRef.current;
    if (img) {
      const width = img.naturalWidth || img.width || 800;
      const height = img.naturalHeight || img.height || 600;
      setImageDimensions({ width, height });
      setIsImageLoaded(true);
      drawCanvas();
    }
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !isImageLoaded || imageDimensions.width === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = imageDimensions.width;
    canvas.height = imageDimensions.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Draw detected plots
    detectedPlots.forEach((plot, index) => {
      ctx.strokeStyle = plot.status === 'Available' ? '#22c55e' : 
                       plot.status === 'Sold' ? '#ef4444' : 
                       plot.status === 'In Progress' ? '#fbbf24' : '#a855f7';
      ctx.fillStyle = plot.status === 'Available' ? 'rgba(34, 197, 94, 0.2)' : 
                     plot.status === 'Sold' ? 'rgba(239, 68, 68, 0.2)' : 
                     plot.status === 'In Progress' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(168, 85, 247, 0.2)';
      ctx.lineWidth = 2;

      if (plot.coordinates.length > 0) {
        ctx.beginPath();
        ctx.moveTo(plot.coordinates[0][0], plot.coordinates[0][1]);
        plot.coordinates.slice(1).forEach(coord => {
          ctx.lineTo(coord[0], coord[1]);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw plot number
        const centerX = plot.coordinates.reduce((sum, c) => sum + c[0], 0) / plot.coordinates.length;
        const centerY = plot.coordinates.reduce((sum, c) => sum + c[1], 0) / plot.coordinates.length;
        ctx.fillStyle = '#000';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(plot.plotNumber, centerX, centerY);
      }
    });

    // Draw current plot being created
    if (currentPlot.length > 0) {
      ctx.strokeStyle = '#D4AF37';
      ctx.fillStyle = 'rgba(212, 175, 55, 0.3)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(currentPlot[0][0], currentPlot[0][1]);
      currentPlot.slice(1).forEach(coord => {
        ctx.lineTo(coord[0], coord[1]);
      });
      if (currentPlot.length > 2) {
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.stroke();
      }
    }

    // Draw grid if in grid mode
    if (mode === 'grid' && isImageLoaded) {
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
      ctx.lineWidth = 1;
      const cellWidth = imageDimensions.width / gridSettings.cols;
      const cellHeight = imageDimensions.height / gridSettings.rows;
      
      for (let i = 0; i <= gridSettings.rows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * cellHeight);
        ctx.lineTo(imageDimensions.width, i * cellHeight);
        ctx.stroke();
      }
      
      for (let i = 0; i <= gridSettings.cols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellWidth, 0);
        ctx.lineTo(i * cellWidth, imageDimensions.height);
        ctx.stroke();
      }
    }
  }, [isImageLoaded, imageDimensions, detectedPlots, currentPlot, mode, gridSettings]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);


  // Grid-based plot generation
  const generateGridPlots = () => {
    if (imageDimensions.width === 0 || imageDimensions.height === 0) {
      alert('Please wait for the image to load completely.');
      return;
    }

    const plots: PlotArea[] = [];
    const cellWidth = imageDimensions.width / gridSettings.cols;
    const cellHeight = imageDimensions.height / gridSettings.rows;
    let plotNum = 1;

    for (let row = 0; row < gridSettings.rows; row++) {
      for (let col = 0; col < gridSettings.cols; col++) {
        const x = col * cellWidth;
        const y = row * cellHeight;
        
        plots.push({
          id: `plot-grid-${plotNum}`,
          plotNumber: plotNum.toString().padStart(2, '0'),
          coordinates: [
            [x, y],
            [x + cellWidth, y],
            [x + cellWidth, y + cellHeight],
            [x, y + cellHeight]
          ],
          status: 'Available'
        });
        plotNum++;
      }
    }

    setDetectedPlots(plots);
    onPlotsDetected(plots, imageDimensions);
    alert(`Successfully generated ${plots.length} plots! Configuration saved to database.`);
  };

  // Manual plot creation
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== 'manual') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setCurrentPlot(prev => [...prev, [x, y]]);
  };

  const finishManualPlot = () => {
    if (currentPlot.length >= 3 && plotNumber) {
      const newPlot: PlotArea = {
        id: `plot-${Date.now()}`,
        plotNumber: plotNumber,
        coordinates: currentPlot,
        status: 'Available'
      };
      
      const updatedPlots = [...detectedPlots, newPlot];
      setDetectedPlots(updatedPlots);
      setCurrentPlot([]);
      setPlotNumber('');
      onPlotsDetected(updatedPlots, imageDimensions);
    }
  };

  const handleExport = () => {
    if (detectedPlots.length === 0) {
      alert('No plots to export. Please generate plots first.');
      return;
    }

    // Format for TypeScript array
    const formattedPlots = detectedPlots.map(plot => {
      const coords = plot.coordinates.map(c => `[${c[0]}, ${c[1]}]`).join(', ');
      return `  { id: '${plot.id}', plotNumber: '${plot.plotNumber}', coordinates: [${coords}], status: '${plot.status}' }`;
    }).join(',\n');

    const codeSnippet = `export const projectPlotConfig: PlotArea[] = [\n${formattedPlots}\n];`;

    // Download JSON
    const dataStr = JSON.stringify(detectedPlots, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plot-configuration-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    // Copy TypeScript code to clipboard
    navigator.clipboard.writeText(codeSnippet).then(() => {
      alert(`✅ Exported ${detectedPlots.length} plots!\n\n📁 JSON file downloaded\n📋 TypeScript code copied to clipboard!\n\nPaste it into plotConfigurations.ts`);
    }).catch(() => {
      // Fallback: show in console
      console.log('TypeScript Code:\n', codeSnippet);
      alert(`✅ Exported ${detectedPlots.length} plots!\n\n📁 JSON file downloaded\n📋 Check browser console for TypeScript code`);
    });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const plots = JSON.parse(event.target?.result as string) as PlotArea[];
        setDetectedPlots(plots);
        onPlotsDetected(plots, imageDimensions);
      } catch (error) {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 border border-premium-gold/20">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-premium-navy mb-2">Plot Configuration Tool</h3>
        <p className="text-gray-600">Create plot boundaries for your site layout plan (Admin Only)</p>
      </div>

      {/* Mode Selection */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setMode('grid')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            mode === 'grid'
              ? 'bg-premium-gold text-premium-navy shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Grid className="h-5 w-5" />
          Grid Mode (Fast)
        </button>
        <button
          onClick={() => setMode('manual')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            mode === 'manual'
              ? 'bg-premium-gold text-premium-navy shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <MousePointerClick className="h-5 w-5" />
          Manual Mode (Precise)
        </button>
      </div>

      {/* Grid Settings */}
      {mode === 'grid' && (
        <div className="mb-4 p-4 bg-premium-cream rounded-xl border border-premium-gold/20">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rows</label>
              <input
                type="number"
                min="1"
                max="50"
                value={gridSettings.rows}
                onChange={(e) => setGridSettings({ ...gridSettings, rows: parseInt(e.target.value) || 10 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-premium-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Columns</label>
              <input
                type="number"
                min="1"
                max="50"
                value={gridSettings.cols}
                onChange={(e) => setGridSettings({ ...gridSettings, cols: parseInt(e.target.value) || 10 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-premium-gold"
              />
            </div>
          </div>
          <button
            onClick={generateGridPlots}
            className="w-full bg-gradient-to-r from-premium-gold to-premium-gold-light text-premium-navy px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Generate {gridSettings.rows * gridSettings.cols} Plots
          </button>
        </div>
      )}

      {/* Manual Plot Creation */}
      {mode === 'manual' && (
        <div className="mb-4 p-4 bg-premium-cream rounded-xl border border-premium-gold/20">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Plot Number</label>
              <input
                type="text"
                value={plotNumber}
                onChange={(e) => setPlotNumber(e.target.value)}
                placeholder="e.g., 01, A-101"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-premium-gold"
              />
            </div>
            <button
              onClick={finishManualPlot}
              disabled={currentPlot.length < 3 || !plotNumber}
              className="mt-6 px-6 py-2 bg-premium-gold text-premium-navy rounded-lg font-semibold hover:bg-premium-gold-light disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Check className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                setCurrentPlot([]);
                setPlotNumber('');
              }}
              className="mt-6 px-6 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Click on the map to mark plot corners. Need at least 3 points. Current: {currentPlot.length} points
          </p>
        </div>
      )}

      {/* Canvas */}
      <div className="relative border-2 border-premium-gold/30 rounded-xl overflow-hidden mb-4 bg-gray-100">
        {!isImageLoaded && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-premium-gold mx-auto mb-4"></div>
              <p className="text-gray-600">Loading site layout plan...</p>
            </div>
          </div>
        )}
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Site Layout Plan"
          className="hidden"
          onLoad={handleImageLoad}
          onError={() => {
            alert('Failed to load image. Please check the image URL.');
          }}
        />
        {isImageLoaded && (
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="w-full h-auto cursor-crosshair block"
            style={{ 
              maxHeight: '600px',
              cursor: mode === 'manual' ? 'crosshair' : 'default'
            }}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-6 py-3 bg-premium-gold text-premium-navy rounded-lg font-semibold hover:bg-premium-gold-light transition-all shadow-md"
        >
          <Download className="h-5 w-5" />
          Export Configuration
        </button>
        <label className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all cursor-pointer shadow-md">
          <Upload className="h-5 w-5" />
          Import Configuration
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
        <div className="flex-1 flex items-center justify-end text-sm text-gray-600">
          {detectedPlots.length} plots detected
        </div>
      </div>
    </div>
  );
};

export default PlotDetectionTool;

