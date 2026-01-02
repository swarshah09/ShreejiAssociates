import Project from '../models/Project.js';
import mongoose from 'mongoose';

// Helper to validate ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Get all projects
export const getAllProjects = async (req, res) => {
  const startTime = Date.now();
  try {
    // Optimize query: only fetch fields needed for list view (exclude large fields like plots)
    // Use lean() for faster queries (returns plain JS objects instead of Mongoose documents)
    const queryStart = Date.now();
    const allProjects = await Project.find()
      .select('-plots') // Exclude plots data for list view (saves bandwidth)
      .lean()
      .exec();
    const queryTime = Date.now() - queryStart;
    
    // Sort by startDate (newest first), projects without startDate go to the end
    const sortedProjects = allProjects.sort((a, b) => {
      // If both have startDate, compare them
      if (a.startDate && b.startDate) {
        return new Date(b.startDate) - new Date(a.startDate); // Newest first
      }
      // If only a has startDate, it comes first
      if (a.startDate && !b.startDate) {
        return -1;
      }
      // If only b has startDate, it comes first
      if (!a.startDate && b.startDate) {
        return 1;
      }
      // If neither has startDate, sort by createdAt (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    const totalTime = Date.now() - startTime;
    
    // Log performance metrics (only in development or with explicit logging)
    if (process.env.NODE_ENV === 'development' || process.env.LOG_PERFORMANCE === 'true') {
      console.log(`📊 getAllProjects: Query: ${queryTime}ms, Total: ${totalTime}ms, Projects: ${sortedProjects.length}`);
    }
    
    res.json({
      success: true,
      data: sortedProjects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message
    });
  }
};

// Get single project
export const getProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format'
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project',
      error: error.message
    });
  }
};

// Create new project
export const createProject = async (req, res) => {
  try {
    const projectData = { ...req.body };
    
    // Ensure required fields have defaults if empty
    if (!projectData.image) {
      projectData.image = projectData.map || 'https://via.placeholder.com/800x600';
    }
    if (!projectData.map) {
      projectData.map = projectData.image || 'https://via.placeholder.com/800x600';
    }
    
    // Ensure facilities and advantages are arrays
    // Handle both comma-separated strings and newline-separated strings
    if (projectData.facilities) {
      if (typeof projectData.facilities === 'string') {
        // Split by comma first, then by newline, then flatten and filter
        const items = projectData.facilities
          .split(/[,\n]/)
          .map(f => f.trim())
          .filter(f => f.length > 0);
        projectData.facilities = items;
      } else if (!Array.isArray(projectData.facilities)) {
        projectData.facilities = [];
      } else {
        // If it's already an array, ensure each item is trimmed
        projectData.facilities = projectData.facilities.map(f => typeof f === 'string' ? f.trim() : f).filter(f => f);
      }
    } else {
      projectData.facilities = [];
    }
    
    if (projectData.advantages) {
      if (typeof projectData.advantages === 'string') {
        // Split by comma first, then by newline, then flatten and filter
        const items = projectData.advantages
          .split(/[,\n]/)
          .map(a => a.trim())
          .filter(a => a.length > 0);
        projectData.advantages = items;
      } else if (!Array.isArray(projectData.advantages)) {
        projectData.advantages = [];
      } else {
        // If it's already an array, ensure each item is trimmed
        projectData.advantages = projectData.advantages.map(a => typeof a === 'string' ? a.trim() : a).filter(a => a);
      }
    } else {
      projectData.advantages = [];
    }
    
    // Ensure googleMap is a string (default to empty if not provided)
    if (!projectData.googleMap) {
      projectData.googleMap = '';
    }
    
    // Handle date fields - convert empty strings to null
    if (projectData.startDate === '' || projectData.startDate === null) {
      projectData.startDate = null;
    } else if (projectData.startDate) {
      projectData.startDate = new Date(projectData.startDate);
    }
    
    if (projectData.completionDate === '' || projectData.completionDate === null) {
      projectData.completionDate = null;
    } else if (projectData.completionDate) {
      projectData.completionDate = new Date(projectData.completionDate);
    }
    
    // Remove _id if present (MongoDB will generate it)
    delete projectData._id;
    
    const project = new Project(projectData);
    await project.save();

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating project',
      error: error.message
    });
  }
};

// Update project
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format'
      });
    }
    
    // Extract update data, ensuring arrays are properly formatted
    const updateData = { ...req.body };
    
    // Ensure facilities and advantages are arrays
    // Handle both comma-separated strings and newline-separated strings
    if (updateData.facilities) {
      if (typeof updateData.facilities === 'string') {
        // Split by comma first, then by newline, then flatten and filter
        const items = updateData.facilities
          .split(/[,\n]/)
          .map(f => f.trim())
          .filter(f => f.length > 0);
        updateData.facilities = items;
      } else if (!Array.isArray(updateData.facilities)) {
        updateData.facilities = [];
      } else {
        // If it's already an array, ensure each item is trimmed
        updateData.facilities = updateData.facilities.map(f => typeof f === 'string' ? f.trim() : String(f)).filter(f => f);
      }
    }
    
    if (updateData.advantages) {
      if (typeof updateData.advantages === 'string') {
        // Split by comma first, then by newline, then flatten and filter
        const items = updateData.advantages
          .split(/[,\n]/)
          .map(a => a.trim())
          .filter(a => a.length > 0);
        updateData.advantages = items;
      } else if (!Array.isArray(updateData.advantages)) {
        updateData.advantages = [];
      } else {
        // If it's already an array, ensure each item is trimmed
        updateData.advantages = updateData.advantages.map(a => typeof a === 'string' ? a.trim() : String(a)).filter(a => a);
      }
    }
    
    // Handle date fields - convert empty strings to null
    if (updateData.startDate === '' || updateData.startDate === null) {
      updateData.startDate = null;
    } else if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    
    if (updateData.completionDate === '' || updateData.completionDate === null) {
      updateData.completionDate = null;
    } else if (updateData.completionDate) {
      updateData.completionDate = new Date(updateData.completionDate);
    }
    
    // Remove _id if present (MongoDB doesn't allow updating _id)
    delete updateData._id;
    
    const project = await Project.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating project',
      error: error.message
    });
  }
};

// Delete project
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format'
      });
    }
    
    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting project',
      error: error.message
    });
  }
};

