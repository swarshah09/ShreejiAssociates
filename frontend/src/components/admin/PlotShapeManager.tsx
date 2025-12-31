import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Check, AlertCircle, Loader, Pencil, Square, Trash2, Edit2, Save } from 'lucide-react';
import { plotDetectionAPI, plotShapeAPI, projectAPI, imageUploadAPI } from '../../services/api';
import PlotCanvas from '../PlotCanvas';
import type { PlotShape } from '../../types/plots';

interface PlotShapeManagerProps {
  projectId: string;
  projectName: string;
  projectMapUrl?: string; // Map image URL from project
  onClose: () => void;
}

const PlotShapeManager: React.FC<PlotShapeManagerProps> = ({
  projectId,
  projectName,
  projectMapUrl,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedPlots, setDetectedPlots] = useState<PlotShape[]>([]);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [layoutImageUrl, setLayoutImageUrl] = useState<string | null>(null);
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null); // Store the uploaded file
  
  // Drawing mode state
  const [drawingMode, setDrawingMode] = useState(false);
  const [currentDrawingPoints, setCurrentDrawingPoints] = useState<number[]>([]);
  const [scaleFactors, setScaleFactors] = useState<{ scaleX: number; scaleY: number }>({ scaleX: 1, scaleY: 1 });
  const [showPlotNumberDialog, setShowPlotNumberDialog] = useState(false);
  const [newPlotNumber, setNewPlotNumber] = useState('');
  
  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [selectedPlotForEdit, setSelectedPlotForEdit] = useState<string | null>(null);
  const [showEditPlotNumberDialog, setShowEditPlotNumberDialog] = useState(false);
  const [editPlotNumber, setEditPlotNumber] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialPlots, setInitialPlots] = useState<PlotShape[]>([]);
  const [loadingExisting, setLoadingExisting] = useState(true);

  // Load existing plot shapes when component opens
  React.useEffect(() => {
    const loadExistingPlots = async () => {
      if (!projectId) {
        setLoadingExisting(false);
        return;
      }

      try {
        setLoadingExisting(true);
        const response = await plotShapeAPI.get(projectId);
        
        if (response.success && response.data?.plots && response.data.plots.length > 0) {
          // Convert database format to PlotShape format
          const shapes: PlotShape[] = response.data.plots.map((plot: any) => ({
            id: plot.id,
            plotNumber: plot.plotNumber,
            status: plot.status,
            points: plot.points,
          }));
          
          setDetectedPlots(shapes);
          setInitialPlots(shapes);
          
          // Set image dimensions
          if (response.data.imageWidth && response.data.imageHeight) {
            setImageDimensions({
              width: response.data.imageWidth,
              height: response.data.imageHeight,
            });
          }
          
          // Use project map URL if available
          if (projectMapUrl) {
            setLayoutImageUrl(projectMapUrl);
          }
          
          setHasUnsavedChanges(false);
        } else {
          // No existing plots, check if we have a map URL to display
          if (projectMapUrl) {
            setLayoutImageUrl(projectMapUrl);
            // Try to get image dimensions from the image
            const img = new window.Image();
            img.onload = () => {
              setImageDimensions({
                width: img.naturalWidth,
                height: img.naturalHeight,
              });
            };
            img.src = projectMapUrl;
          }
        }
      } catch (error) {
        console.error('Error loading existing plot shapes:', error);
        // If error, still try to load map image if available
        if (projectMapUrl) {
          setLayoutImageUrl(projectMapUrl);
        }
      } finally {
        setLoadingExisting(false);
      }
    };

    loadExistingPlots();
  }, [projectId, projectMapUrl]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, etc.)');
      return;
    }

    setError(null);
    setUploading(true);
    setDetecting(true);

    try {
      // Store the uploaded file for later use
      setUploadedImageFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setLayoutImageUrl(previewUrl);

      // Call detection API
      const response = await plotDetectionAPI.detectFromImage(projectId, file);

      if (response.success && response.plots) {
        setDetectedPlots(response.plots);
        setInitialPlots(response.plots); // Store initial state for comparison
        setImageDimensions({
          width: response.width,
          height: response.height,
        });
        setHasUnsavedChanges(false);
      } else {
        throw new Error(response.message || 'Detection failed');
      }
    } catch (err: any) {
      console.error('Plot detection error:', err);
      setError(err.message || 'Failed to detect plots. Please try again.');
      setLayoutImageUrl(null);
    } finally {
      setUploading(false);
      setDetecting(false);
    }
  };

  const handleSave = async () => {
    if (!detectedPlots.length || !imageDimensions) {
      setError('No plots detected. Please upload a layout image first.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Upload image to Cloudinary if we have a new uploaded file
      let imageUrl = layoutImageUrl; // Use existing URL by default
      
      if (uploadedImageFile) {
        try {
          console.log('Uploading image to Cloudinary...');
          const uploadResponse = await imageUploadAPI.upload(uploadedImageFile);
          if (uploadResponse.success && uploadResponse.data?.url) {
            imageUrl = uploadResponse.data.url;
            console.log('Image uploaded to Cloudinary:', imageUrl);
          } else {
            throw new Error('Image upload failed: No URL returned');
          }
        } catch (uploadError: any) {
          console.error('Error uploading image to Cloudinary:', uploadError);
          // If Cloudinary upload fails, fall back to data URL
          const reader = new FileReader();
          imageUrl = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(uploadedImageFile);
          });
          console.warn('Fell back to data URL due to Cloudinary error');
        }
      } else if (layoutImageUrl && layoutImageUrl.startsWith('blob:')) {
        // If it's a blob URL, try to upload it to Cloudinary
        try {
          const response = await fetch(layoutImageUrl);
          const blob = await response.blob();
          const file = new File([blob], 'map.png', { type: blob.type });
          const uploadResponse = await imageUploadAPI.upload(file);
          if (uploadResponse.success && uploadResponse.data?.url) {
            imageUrl = uploadResponse.data.url;
            console.log('Blob image uploaded to Cloudinary:', imageUrl);
          }
        } catch (uploadError) {
          console.warn('Failed to upload blob URL to Cloudinary, using existing URL');
        }
      }

      // Save plot shapes
      const plotResponse = await plotShapeAPI.save(projectId, {
        imageWidth: imageDimensions.width,
        imageHeight: imageDimensions.height,
        plots: detectedPlots,
      });

      if (!plotResponse.success) {
        throw new Error(plotResponse.message || 'Save failed');
      }

      // Update project's map field with the image URL (Cloudinary URL or existing URL)
      if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('data:'))) {
        try {
          await projectAPI.update(projectId, {
            map: imageUrl,
          });
          console.log('Project map image updated successfully');
        } catch (updateError) {
          console.warn('Failed to update project map image:', updateError);
          // Don't fail the entire save if map update fails
        }
      }

      setInitialPlots([...detectedPlots]); // Update initial state
      setHasUnsavedChanges(false);
      alert(`✅ Successfully saved ${detectedPlots.length} plot shapes!\n\nAll edits (shape changes, plot numbers, deletions) have been saved to the database.\n\nThe uploaded layout image has been saved and will be displayed on the public website.`);
      onClose();
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save plot shapes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to close without saving?')) {
        return;
      }
    }
    if (layoutImageUrl) {
      URL.revokeObjectURL(layoutImageUrl);
    }
    onClose();
  };

  // Handle canvas click in drawing mode
  const handleCanvasClick = (x: number, y: number) => {
    if (!drawingMode) return;
    
    // Add point to current drawing
    setCurrentDrawingPoints(prev => [...prev, x, y]);
  };

  // Finish drawing a polygon
  const handleFinishDrawing = () => {
    if (currentDrawingPoints.length >= 6) { // At least 3 points (x1, y1, x2, y2, x3, y3)
      setShowPlotNumberDialog(true);
    } else {
      setError('Please add at least 3 points to create a polygon.');
    }
  };

  // Cancel current drawing
  const handleCancelDrawing = () => {
    setCurrentDrawingPoints([]);
    setDrawingMode(false);
    setError(null);
  };

  // Save manually drawn plot
  const handleSaveManualPlot = () => {
    if (!newPlotNumber.trim()) {
      setError('Please enter a plot number.');
      return;
    }

    // Check if plot number already exists
    const existingPlot = detectedPlots.find(p => p.plotNumber === newPlotNumber.trim());
    if (existingPlot) {
      setError(`Plot number ${newPlotNumber.trim()} already exists. Please use a different number.`);
      return;
    }

    // Create new plot shape
    const newPlot: PlotShape = {
      id: `plot-manual-${Date.now()}`,
      plotNumber: newPlotNumber.trim(),
      status: 'AVAILABLE',
      points: currentDrawingPoints, // Already in original image coordinates
    };

    // Add to detected plots
    setDetectedPlots(prev => {
      const updated = [...prev, newPlot];
      setHasUnsavedChanges(true);
      return updated;
    });
    
    // Reset drawing state
    setCurrentDrawingPoints([]);
    setNewPlotNumber('');
    setShowPlotNumberDialog(false);
    setDrawingMode(false);
  };

  // Handle scale factors callback from PlotCanvas
  const handleGetScaleFactors = (scaleX: number, scaleY: number) => {
    setScaleFactors({ scaleX, scaleY });
  };

  // Handle plot selection in edit mode
  const handlePlotSelect = (plotId: string | null) => {
    setSelectedPlotForEdit(plotId);
  };

  // Handle plot shape update (when vertex is dragged)
  const handlePlotUpdate = (plotId: string, newPoints: number[]) => {
    setDetectedPlots(prev => {
      const updated = prev.map(plot => 
        plot.id === plotId ? { ...plot, points: newPoints } : plot
      );
      setHasUnsavedChanges(true);
      return updated;
    });
  };

  // Handle delete plot
  const handleDeletePlot = (plotId: string) => {
    if (window.confirm('Are you sure you want to delete this plot?')) {
      setDetectedPlots(prev => {
        const updated = prev.filter(plot => plot.id !== plotId);
        setHasUnsavedChanges(true);
        return updated;
      });
      if (selectedPlotForEdit === plotId) {
        setSelectedPlotForEdit(null);
        setEditMode(false);
      }
    }
  };

  // Handle edit plot number
  const handleEditPlotNumber = (plotId: string) => {
    const plot = detectedPlots.find(p => p.id === plotId);
    if (plot) {
      setEditPlotNumber(plot.plotNumber);
      setSelectedPlotForEdit(plotId);
      setShowEditPlotNumberDialog(true);
    }
  };

  // Save edited plot number
  const handleSaveEditPlotNumber = () => {
    if (!editPlotNumber.trim() || !selectedPlotForEdit) {
      setError('Please enter a plot number.');
      return;
    }

    // Check if plot number already exists (excluding current plot)
    const existingPlot = detectedPlots.find(
      p => p.plotNumber === editPlotNumber.trim() && p.id !== selectedPlotForEdit
    );
    if (existingPlot) {
      setError(`Plot number ${editPlotNumber.trim()} already exists. Please use a different number.`);
      return;
    }

    // Update plot number
    setDetectedPlots(prev => {
      const updated = prev.map(plot => 
        plot.id === selectedPlotForEdit 
          ? { ...plot, plotNumber: editPlotNumber.trim() }
          : plot
      );
      setHasUnsavedChanges(true);
      return updated;
    });

    // Reset edit state
    setEditPlotNumber('');
    setShowEditPlotNumberDialog(false);
    setSelectedPlotForEdit(null);
    setEditMode(false);
  };

  // Toggle edit mode
  const handleToggleEditMode = () => {
    if (editMode) {
      setEditMode(false);
      setSelectedPlotForEdit(null);
      setError(null);
    } else {
      setEditMode(true);
      setDrawingMode(false);
      setCurrentDrawingPoints([]);
      setError(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Manage Plot Shapes</h3>
              <p className="text-gray-600 text-sm mt-1">{projectName}</p>
              <p className="text-gray-500 text-xs mt-1">
                Upload a layout image to auto-detect plot boundaries using AI
              </p>
              {hasUnsavedChanges && (
                <div className="mt-2 px-3 py-1 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded text-xs inline-block">
                  ⚠️ You have unsaved changes
                </div>
              )}
            </div>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          )}

          {/* Loading Existing Plots */}
          {loadingExisting && (
            <div className="mb-6 flex items-center justify-center py-8">
              <Loader className="h-6 w-6 animate-spin text-blue-600 mr-3" />
              <span className="text-gray-600">Loading existing plot shapes...</span>
            </div>
          )}

          {/* Upload Section - Only show if no plots loaded and not loading */}
          {!loadingExisting && !detectedPlots.length && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Layout Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-gray-500 text-sm">
                  PNG, JPG up to 10MB
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || detecting}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading || detecting ? (
                    <>
                      <Loader className="h-4 w-4 inline animate-spin mr-2" />
                      {detecting ? 'Detecting plots...' : 'Uploading...'}
                    </>
                  ) : (
                    'Select Image'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Preview and Canvas - Show if we have plots OR if we have a map image */}
          {(detectedPlots.length > 0 || layoutImageUrl) && imageDimensions && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {detectedPlots.length > 0 ? `Loaded ${detectedPlots.length} plots` : 'Map Image Loaded'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Image size: {imageDimensions.width} × {imageDimensions.height}px
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {/* Drawing Mode Toggle */}
                    {!drawingMode && !editMode ? (
                      <>
                        <button
                          onClick={() => {
                            setDrawingMode(true);
                            setCurrentDrawingPoints([]);
                            setError(null);
                            setEditMode(false);
                          }}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Pencil className="h-4 w-4" />
                          <span>Draw Plot</span>
                        </button>
                        <button
                          onClick={handleToggleEditMode}
                          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span>Edit Plots</span>
                        </button>
                      </>
                    ) : drawingMode ? (
                      <div className="flex items-center space-x-2">
                        <div className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                          Drawing Mode: Click on map to add points ({currentDrawingPoints.length / 2} points)
                        </div>
                        {currentDrawingPoints.length >= 6 && (
                          <button
                            onClick={handleFinishDrawing}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            <Square className="h-4 w-4" />
                            <span>Finish Polygon</span>
                          </button>
                        )}
                        <button
                          onClick={handleCancelDrawing}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    ) : editMode ? (
                      <div className="flex items-center space-x-2">
                        <div className="px-3 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium">
                          Edit Mode: Click a plot to select it, then drag vertices to reshape
                        </div>
                        {selectedPlotForEdit && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditPlotNumber(selectedPlotForEdit)}
                              className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                              <Edit2 className="h-3 w-3" />
                              <span>Edit Number</span>
                            </button>
                            <button
                              onClick={() => handleDeletePlot(selectedPlotForEdit)}
                              className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                        <button
                          onClick={handleToggleEditMode}
                          className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                        >
                          Exit Edit
                        </button>
                      </div>
                    ) : null}
                    <button
                      onClick={() => {
                        setDetectedPlots([]);
                        setImageDimensions(null);
                        setDrawingMode(false);
                        setCurrentDrawingPoints([]);
                        setEditMode(false);
                        setSelectedPlotForEdit(null);
                        if (layoutImageUrl) {
                          URL.revokeObjectURL(layoutImageUrl);
                          setLayoutImageUrl(null);
                        }
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Upload Different Image
                    </button>
                  </div>
                </div>

                {/* Plot Canvas Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-3 bg-white rounded-lg border border-gray-200 p-4">
                    <PlotCanvas
                      plots={detectedPlots}
                      backgroundImageUrl={layoutImageUrl || undefined}
                      originalImageWidth={imageDimensions.width}
                      originalImageHeight={imageDimensions.height}
                      drawingMode={drawingMode}
                      currentDrawingPoints={currentDrawingPoints}
                      onCanvasClick={handleCanvasClick}
                      onGetScaleFactors={handleGetScaleFactors}
                      editMode={editMode}
                      selectedPlotId={selectedPlotForEdit}
                      onPlotSelect={handlePlotSelect}
                      onPlotUpdate={handlePlotUpdate}
                    />
                  </div>
                  
                  {/* Plots List Panel */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4 max-h-[600px] overflow-y-auto">
                    <h5 className="font-semibold text-gray-900 mb-3">Plots List</h5>
                    <div className="space-y-2">
                      {detectedPlots.map((plot) => (
                        <div
                          key={plot.id}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedPlotForEdit === plot.id
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">
                              Plot {plot.plotNumber}
                            </span>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => {
                                  if (editMode) {
                                    setSelectedPlotForEdit(plot.id);
                                  } else {
                                    handleEditPlotNumber(plot.id);
                                  }
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                title="Edit plot number"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDeletePlot(plot.id)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                title="Delete plot"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {plot.points.length / 2} vertices • {plot.status}
                          </div>
                          {editMode && (
                            <button
                              onClick={() => setSelectedPlotForEdit(plot.id)}
                              className={`mt-2 w-full text-xs py-1 px-2 rounded transition-colors ${
                                selectedPlotForEdit === plot.id
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {selectedPlotForEdit === plot.id ? 'Selected' : 'Select to Edit Shape'}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-4">
                <button
                  onClick={handleSave}
                  disabled={saving || !hasUnsavedChanges}
                  className={`flex items-center space-x-2 text-white px-6 py-3 rounded-lg transition-all duration-300 ${
                    hasUnsavedChanges
                      ? 'bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {saving ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      <span>Save Plot Shapes {hasUnsavedChanges && `(${detectedPlots.length} plots)`}</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Edit Plot Number Dialog */}
          {showEditPlotNumberDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => {
                setShowEditPlotNumberDialog(false);
                setEditPlotNumber('');
              }}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Edit Plot Number
                </h3>
                <p className="text-gray-600 mb-4">
                  Enter the new plot number for this plot.
                </p>
                <input
                  type="text"
                  value={editPlotNumber}
                  onChange={(e) => setEditPlotNumber(e.target.value)}
                  placeholder="e.g., 001, 002, A-1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveEditPlotNumber();
                    } else if (e.key === 'Escape') {
                      setShowEditPlotNumberDialog(false);
                      setEditPlotNumber('');
                    }
                  }}
                />
                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveEditPlotNumber}
                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setShowEditPlotNumberDialog(false);
                      setEditPlotNumber('');
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Plot Number Dialog */}
          {showPlotNumberDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => {
                setShowPlotNumberDialog(false);
                setNewPlotNumber('');
              }}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Enter Plot Number
                </h3>
                <p className="text-gray-600 mb-4">
                  Please enter the plot number for the manually drawn polygon.
                </p>
                <input
                  type="text"
                  value={newPlotNumber}
                  onChange={(e) => setNewPlotNumber(e.target.value)}
                  placeholder="e.g., 001, 002, A-1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveManualPlot();
                    } else if (e.key === 'Escape') {
                      setShowPlotNumberDialog(false);
                      setNewPlotNumber('');
                    }
                  }}
                />
                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveManualPlot}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Plot
                  </button>
                  <button
                    onClick={() => {
                      setShowPlotNumberDialog(false);
                      setNewPlotNumber('');
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PlotShapeManager;

