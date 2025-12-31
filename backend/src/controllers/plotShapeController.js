import PlotShape from '../models/PlotShape.js';
import Project from '../models/Project.js';
import mongoose from 'mongoose';

// Helper to validate and convert projectId to ObjectId
const toObjectId = (id) => {
  if (!id) return null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  return null;
};

// Get plot shapes for a project
export const getPlotShapes = async (req, res) => {
  try {
    const { projectId } = req.params;
    const objectId = toObjectId(projectId);

    if (!objectId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format. Expected MongoDB ObjectId.'
      });
    }

    const plotShape = await PlotShape.findOne({ projectId: objectId });

    if (!plotShape) {
      return res.json({
        success: true,
        data: {
          projectId: projectId,
          imageWidth: 0,
          imageHeight: 0,
          plots: []
        }
      });
    }

    res.json({
      success: true,
      data: plotShape
    });
  } catch (error) {
    console.error('Error fetching plot shapes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching plot shapes',
      error: error.message
    });
  }
};

// Save plot shapes for a project (from AI detection or manual edit)
export const savePlotShapes = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { imageWidth, imageHeight, plots } = req.body;

    const objectId = toObjectId(projectId);

    if (!objectId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format. Expected MongoDB ObjectId.'
      });
    }

    // Verify project exists
    const project = await Project.findById(objectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Validate required fields
    if (!imageWidth || !imageHeight || !Array.isArray(plots)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: imageWidth, imageHeight, plots'
      });
    }

    // Upsert plot shapes
    const plotShape = await PlotShape.findOneAndUpdate(
      { projectId: objectId },
      {
        projectId: objectId,
        imageWidth,
        imageHeight,
        plots,
        lastUpdated: new Date(),
        updatedBy: req.user?.email || 'admin'
      },
      {
        new: true,
        upsert: true
      }
    );

    res.json({
      success: true,
      message: 'Plot shapes saved successfully',
      data: plotShape
    });
  } catch (error) {
    console.error('Error saving plot shapes:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving plot shapes',
      error: error.message
    });
  }
};

// Delete plot shapes for a project
export const deletePlotShapes = async (req, res) => {
  try {
    const { projectId } = req.params;
    const objectId = toObjectId(projectId);

    if (!objectId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format. Expected MongoDB ObjectId.'
      });
    }

    const plotShape = await PlotShape.findOneAndDelete({ projectId: objectId });

    if (!plotShape) {
      return res.status(404).json({
        success: false,
        message: 'Plot shapes not found'
      });
    }

    res.json({
      success: true,
      message: 'Plot shapes deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting plot shapes:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting plot shapes',
      error: error.message
    });
  }
};

