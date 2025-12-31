import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Save, X, Map, Eye, Layers, Loader, Upload, Image as ImageIcon } from 'lucide-react';
import ExcelUploader from './ExcelUploader.jsx';
import PlotShapeManager from './PlotShapeManager';
import { projectAPI, imageUploadAPI } from '../../services/api';

// Helper function to extract Google Maps embed URL from iframe HTML or return the URL as-is
const extractGoogleMapUrl = (input: string): string => {
  if (!input || !input.trim()) return '';
  
  const trimmed = input.trim();
  
  // If it's already a URL (starts with http), return as-is
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  
  // Try to extract src from iframe HTML
  const iframeMatch = trimmed.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    return iframeMatch[1];
  }
  
  // Try alternative iframe format
  const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  if (srcMatch && srcMatch[1]) {
    return srcMatch[1];
  }
  
  // If no match, return original (might be a valid URL without protocol)
  return trimmed;
};

interface Project {
  _id?: string;
  id?: string | number; // Support both MongoDB _id and legacy id
  name: string;
  location: string;
  status: string;
  type: string;
  units: number;
  image: string;
  heroImage?: string; // Landscape photo for project details page
  map?: string;
  facilities?: string[] | string;
  advantages?: string[] | string;
  googleMap?: string;
  plotDetails?: string;
  excelUrl?: string;
  startDate?: string | Date | null; // Project start date
  completionDate?: string | Date | null; // Project completion date (null if ongoing)
  sampleHouse?: {
    threeBHK?: {
      image?: string;
      floorPlan?: string;
    };
    fourBHK?: {
      image?: string;
      floorPlan?: string;
    };
  };
}

interface NewProject {
  name: string;
  location: string;
  status: string;
  type: string;
  units: string;
  image: string;
  heroImage: string;
  facilities: string;
  advantages: string;
  googleMap?: string;
  plotDetails: string;
  excelUrl: string;
}

const ProjectManagement = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showExcelUploader, setShowExcelUploader] = useState(false);
  const [showPlotShapeManager, setShowPlotShapeManager] = useState(false);
  const [selectedProjectForPlotShapes, setSelectedProjectForPlotShapes] = useState<Project | null>(null);

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await projectAPI.getAll();
        if (response.success && response.data) {
          setProjects(response.data);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        // Keep empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Helper to get project ID (MongoDB _id or legacy id)
  const getProjectId = (project: Project): string => {
    return project._id || project.id?.toString() || '';
  };
  const [newProject, setNewProject] = useState<NewProject>({
    name: '',
    location: '',
    status: 'upcoming',
    type: '',
    units: '',
    image: '',
    heroImage: '',
    facilities: '',
    advantages: '',
    googleMap: '',
    plotDetails: '',
    excelUrl: '',
    startDate: '',
    completionDate: '',
  });

  // Image upload states
  const [uploadingHomepageImage, setUploadingHomepageImage] = useState(false);
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
  const [uploadingEditHomepageImage, setUploadingEditHomepageImage] = useState(false);
  const [uploadingEditHeroImage, setUploadingEditHeroImage] = useState(false);
  
  // Sample house image upload states
  const [uploading3BHKHouse, setUploading3BHKHouse] = useState(false);
  const [uploading3BHKFloorPlan, setUploading3BHKFloorPlan] = useState(false);
  const [uploading4BHKHouse, setUploading4BHKHouse] = useState(false);
  const [uploading4BHKFloorPlan, setUploading4BHKFloorPlan] = useState(false);
  const [uploadingEdit3BHKHouse, setUploadingEdit3BHKHouse] = useState(false);
  const [uploadingEdit3BHKFloorPlan, setUploadingEdit3BHKFloorPlan] = useState(false);
  const [uploadingEdit4BHKHouse, setUploadingEdit4BHKHouse] = useState(false);
  const [uploadingEdit4BHKFloorPlan, setUploadingEdit4BHKFloorPlan] = useState(false);
  
  // Sample house state for new project
  const [newSampleHouse, setNewSampleHouse] = useState({
    threeBHK: { image: '', floorPlan: '' },
    fourBHK: { image: '', floorPlan: '' },
  });

  // Handle homepage image upload for new projects
  const handleHomepageImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    try {
      setUploadingHomepageImage(true);
      const response = await imageUploadAPI.upload(file);
      if (response.success && response.data?.url) {
        setNewProject({ ...newProject, image: response.data.url });
        alert('Homepage image uploaded successfully!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error: any) {
      console.error('Error uploading homepage image:', error);
      alert('Failed to upload homepage image: ' + (error.message || 'Unknown error'));
    } finally {
      setUploadingHomepageImage(false);
      // Reset input
      e.target.value = '';
    }
  };

  // Handle hero/landscape image upload for new projects
  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    try {
      setUploadingHeroImage(true);
      const response = await imageUploadAPI.upload(file);
      if (response.success && response.data?.url) {
        setNewProject({ ...newProject, heroImage: response.data.url });
        alert('Landscape image uploaded successfully!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error: any) {
      console.error('Error uploading hero image:', error);
      alert('Failed to upload landscape image: ' + (error.message || 'Unknown error'));
    } finally {
      setUploadingHeroImage(false);
      // Reset input
      e.target.value = '';
    }
  };

  // Handle edit homepage image upload
  const handleEditHomepageImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProject) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    try {
      setUploadingEditHomepageImage(true);
      const response = await imageUploadAPI.upload(file);
      if (response.success && response.data?.url) {
        setEditingProject({ ...editingProject, image: response.data.url });
        alert('Homepage image uploaded successfully!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error: any) {
      console.error('Error uploading homepage image:', error);
      alert('Failed to upload homepage image: ' + (error.message || 'Unknown error'));
    } finally {
      setUploadingEditHomepageImage(false);
      // Reset input
      e.target.value = '';
    }
  };

  // Handle edit hero/landscape image upload
  const handleEditHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProject) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    try {
      setUploadingEditHeroImage(true);
      const response = await imageUploadAPI.upload(file);
      if (response.success && response.data?.url) {
        setEditingProject({ ...editingProject, heroImage: response.data.url });
        alert('Landscape image uploaded successfully!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error: any) {
      console.error('Error uploading hero image:', error);
      alert('Failed to upload landscape image: ' + (error.message || 'Unknown error'));
    } finally {
      setUploadingEditHeroImage(false);
      // Reset input
      e.target.value = '';
    }
  };

  // Delete homepage image from new project
  const handleDeleteHomepageImage = () => {
    if (window.confirm('Are you sure you want to remove the homepage image?')) {
      setNewProject({ ...newProject, image: '' });
    }
  };

  // Delete hero image from new project
  const handleDeleteHeroImage = () => {
    if (window.confirm('Are you sure you want to remove the landscape image?')) {
      setNewProject({ ...newProject, heroImage: '' });
    }
  };

  // Delete homepage image from editing project
  const handleDeleteEditHomepageImage = () => {
    if (!editingProject) return;
    if (window.confirm('Are you sure you want to remove the homepage image?')) {
      setEditingProject({ ...editingProject, image: '' });
    }
  };

  // Delete hero image from editing project
  const handleDeleteEditHeroImage = () => {
    if (!editingProject) return;
    if (window.confirm('Are you sure you want to remove the landscape image?')) {
      setEditingProject({ ...editingProject, heroImage: '' });
    }
  };

  // Sample house image upload handlers for new project
  const handleUpload3BHKHouse = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }
    try {
      setUploading3BHKHouse(true);
      const response = await imageUploadAPI.upload(file);
      if (response.success && response.data?.url) {
        setNewSampleHouse(prev => ({ ...prev, threeBHK: { ...prev.threeBHK, image: response.data.url } }));
        alert('3BHK house image uploaded successfully!');
      }
    } catch (error: any) {
      alert('Failed to upload: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading3BHKHouse(false);
      e.target.value = '';
    }
  };

  const handleUpload3BHKFloorPlan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }
    try {
      setUploading3BHKFloorPlan(true);
      const response = await imageUploadAPI.upload(file);
      if (response.success && response.data?.url) {
        setNewSampleHouse(prev => ({ ...prev, threeBHK: { ...prev.threeBHK, floorPlan: response.data.url } }));
        alert('3BHK floor plan uploaded successfully!');
      }
    } catch (error: any) {
      alert('Failed to upload: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading3BHKFloorPlan(false);
      e.target.value = '';
    }
  };

  const handleUpload4BHKHouse = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }
    try {
      setUploading4BHKHouse(true);
      const response = await imageUploadAPI.upload(file);
      if (response.success && response.data?.url) {
        setNewSampleHouse(prev => ({ ...prev, fourBHK: { ...prev.fourBHK, image: response.data.url } }));
        alert('4BHK house image uploaded successfully!');
      }
    } catch (error: any) {
      alert('Failed to upload: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading4BHKHouse(false);
      e.target.value = '';
    }
  };

  const handleUpload4BHKFloorPlan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }
    try {
      setUploading4BHKFloorPlan(true);
      const response = await imageUploadAPI.upload(file);
      if (response.success && response.data?.url) {
        setNewSampleHouse(prev => ({ ...prev, fourBHK: { ...prev.fourBHK, floorPlan: response.data.url } }));
        alert('4BHK floor plan uploaded successfully!');
      }
    } catch (error: any) {
      alert('Failed to upload: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading4BHKFloorPlan(false);
      e.target.value = '';
    }
  };

  // Sample house image upload handlers for edit project
  const handleEditUpload3BHKHouse = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProject || !file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }
    try {
      setUploadingEdit3BHKHouse(true);
      const response = await imageUploadAPI.upload(file);
      if (response.success && response.data?.url) {
        setEditingProject(prev => ({
          ...prev!,
          sampleHouse: {
            ...prev!.sampleHouse,
            threeBHK: { ...prev!.sampleHouse?.threeBHK, image: response.data.url },
          },
        }));
        alert('3BHK house image uploaded successfully!');
      }
    } catch (error: any) {
      alert('Failed to upload: ' + (error.message || 'Unknown error'));
    } finally {
      setUploadingEdit3BHKHouse(false);
      e.target.value = '';
    }
  };

  const handleEditUpload3BHKFloorPlan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProject || !file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }
    try {
      setUploadingEdit3BHKFloorPlan(true);
      const response = await imageUploadAPI.upload(file);
      if (response.success && response.data?.url) {
        setEditingProject(prev => ({
          ...prev!,
          sampleHouse: {
            ...prev!.sampleHouse,
            threeBHK: { ...prev!.sampleHouse?.threeBHK, floorPlan: response.data.url },
          },
        }));
        alert('3BHK floor plan uploaded successfully!');
      }
    } catch (error: any) {
      alert('Failed to upload: ' + (error.message || 'Unknown error'));
    } finally {
      setUploadingEdit3BHKFloorPlan(false);
      e.target.value = '';
    }
  };

  const handleEditUpload4BHKHouse = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProject || !file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }
    try {
      setUploadingEdit4BHKHouse(true);
      const response = await imageUploadAPI.upload(file);
      if (response.success && response.data?.url) {
        setEditingProject(prev => ({
          ...prev!,
          sampleHouse: {
            ...prev!.sampleHouse,
            fourBHK: { ...prev!.sampleHouse?.fourBHK, image: response.data.url },
          },
        }));
        alert('4BHK house image uploaded successfully!');
      }
    } catch (error: any) {
      alert('Failed to upload: ' + (error.message || 'Unknown error'));
    } finally {
      setUploadingEdit4BHKHouse(false);
      e.target.value = '';
    }
  };

  const handleEditUpload4BHKFloorPlan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProject || !file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }
    try {
      setUploadingEdit4BHKFloorPlan(true);
      const response = await imageUploadAPI.upload(file);
      if (response.success && response.data?.url) {
        setEditingProject(prev => ({
          ...prev!,
          sampleHouse: {
            ...prev!.sampleHouse,
            fourBHK: { ...prev!.sampleHouse?.fourBHK, floorPlan: response.data.url },
          },
        }));
        alert('4BHK floor plan uploaded successfully!');
      }
    } catch (error: any) {
      alert('Failed to upload: ' + (error.message || 'Unknown error'));
    } finally {
      setUploadingEdit4BHKFloorPlan(false);
      e.target.value = '';
    }
  };

  // Delete handlers for sample house images
  const handleDelete3BHKHouse = () => {
    if (window.confirm('Are you sure you want to remove the 3BHK house image?')) {
      setNewSampleHouse(prev => ({ ...prev, threeBHK: { ...prev.threeBHK, image: '' } }));
    }
  };

  const handleDelete3BHKFloorPlan = () => {
    if (window.confirm('Are you sure you want to remove the 3BHK floor plan?')) {
      setNewSampleHouse(prev => ({ ...prev, threeBHK: { ...prev.threeBHK, floorPlan: '' } }));
    }
  };

  const handleDelete4BHKHouse = () => {
    if (window.confirm('Are you sure you want to remove the 4BHK house image?')) {
      setNewSampleHouse(prev => ({ ...prev, fourBHK: { ...prev.fourBHK, image: '' } }));
    }
  };

  const handleDelete4BHKFloorPlan = () => {
    if (window.confirm('Are you sure you want to remove the 4BHK floor plan?')) {
      setNewSampleHouse(prev => ({ ...prev, fourBHK: { ...prev.fourBHK, floorPlan: '' } }));
    }
  };

  const handleDeleteEdit3BHKHouse = () => {
    if (!editingProject) return;
    if (window.confirm('Are you sure you want to remove the 3BHK house image?')) {
      setEditingProject(prev => ({
        ...prev!,
        sampleHouse: {
          ...prev!.sampleHouse,
          threeBHK: { ...prev!.sampleHouse?.threeBHK, image: '' },
        },
      }));
    }
  };

  const handleDeleteEdit3BHKFloorPlan = () => {
    if (!editingProject) return;
    if (window.confirm('Are you sure you want to remove the 3BHK floor plan?')) {
      setEditingProject(prev => ({
        ...prev!,
        sampleHouse: {
          ...prev!.sampleHouse,
          threeBHK: { ...prev!.sampleHouse?.threeBHK, floorPlan: '' },
        },
      }));
    }
  };

  const handleDeleteEdit4BHKHouse = () => {
    if (!editingProject) return;
    if (window.confirm('Are you sure you want to remove the 4BHK house image?')) {
      setEditingProject(prev => ({
        ...prev!,
        sampleHouse: {
          ...prev!.sampleHouse,
          fourBHK: { ...prev!.sampleHouse?.fourBHK, image: '' },
        },
      }));
    }
  };

  const handleDeleteEdit4BHKFloorPlan = () => {
    if (!editingProject) return;
    if (window.confirm('Are you sure you want to remove the 4BHK floor plan?')) {
      setEditingProject(prev => ({
        ...prev!,
        sampleHouse: {
          ...prev!.sampleHouse,
          fourBHK: { ...prev!.sampleHouse?.fourBHK, floorPlan: '' },
        },
      }));
    }
  };

  const handleAddProject = async () => {
    if (!newProject.name || !newProject.location || !newProject.type) {
      alert('Please fill in all required fields (Name, Location, Type)');
      return;
    }

    // Ensure image and map have values (use placeholder if empty)
    const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23f3f4f6" width="800" height="600"/%3E%3Ctext fill="%239ca3af" font-family="Arial, sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EProject Image%3C/text%3E%3C/svg%3E';
    const placeholderMap = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23f3f4f6" width="800" height="600"/%3E%3Ctext fill="%239ca3af" font-family="Arial, sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ELayout Plan%3C/text%3E%3C/svg%3E';
    const imageUrl = newProject.image || placeholderImage;
    // For map, we'll use imageUrl as fallback since map field doesn't exist in NewProject interface
    const mapUrl = placeholderMap;

    try {
      // Extract Google Map URL from iframe HTML if needed
      const googleMapUrl = extractGoogleMapUrl(newProject.googleMap || '');
      
      // Split facilities and advantages by comma or newline
      const facilitiesArray = newProject.facilities 
        ? newProject.facilities.split(/[,\n]/).map(f => f.trim()).filter(f => f.length > 0)
        : [];
      const advantagesArray = newProject.advantages
        ? newProject.advantages.split(/[,\n]/).map(a => a.trim()).filter(a => a.length > 0)
        : [];
      
      const projectData = {
        ...newProject,
        image: imageUrl,
        heroImage: newProject.heroImage || '', // Landscape photo
        map: mapUrl,
        units: parseInt(newProject.units) || 0,
        facilities: facilitiesArray,
        advantages: advantagesArray,
        googleMap: googleMapUrl, // Use extracted URL
        excelUrl: newProject.excelUrl || '',
        startDate: newProject.startDate || null,
        completionDate: newProject.completionDate || null,
        sampleHouse: {
          threeBHK: {
            image: newSampleHouse.threeBHK.image || '',
            floorPlan: newSampleHouse.threeBHK.floorPlan || '',
          },
          fourBHK: {
            image: newSampleHouse.fourBHK.image || '',
            floorPlan: newSampleHouse.fourBHK.floorPlan || '',
          },
        },
      };
      
      // Remove fields that shouldn't be sent to API
      delete projectData.plotDetails;

      const response = await projectAPI.create(projectData);
      if (response.success) {
        setProjects([...projects, response.data]);
        setNewProject({
          name: '',
          location: '',
          status: 'upcoming',
          type: '',
          units: '',
          image: '',
          heroImage: '',
          facilities: '',
          advantages: '',
          googleMap: '',
          plotDetails: '',
          excelUrl: '',
          startDate: '',
          completionDate: '',
        });
        setNewSampleHouse({
          threeBHK: { image: '', floorPlan: '' },
          fourBHK: { image: '', floorPlan: '' },
        });
        setNewSampleHouse({
          threeBHK: { image: '', floorPlan: '' },
          fourBHK: { image: '', floorPlan: '' },
        });
    setShowAddForm(false);
        alert('Project created successfully!');
      }
    } catch (error: any) {
      console.error('Error creating project:', error);
      alert('Failed to create project: ' + (error.message || 'Unknown error'));
    }
  };

  const handleEditProject = (project: Project) => {
    // Convert facilities and advantages arrays to comma-separated strings for editing
    // Format dates for date input fields (YYYY-MM-DD format)
    const formatDateForInput = (date: string | Date | null | undefined): string => {
      if (!date) return '';
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    };

    const projectForEdit = {
      ...project,
      facilities: Array.isArray(project.facilities) 
        ? project.facilities.join(', ') 
        : (project.facilities || ''),
      advantages: Array.isArray(project.advantages)
        ? project.advantages.join(', ')
        : (project.advantages || ''),
      startDate: formatDateForInput(project.startDate),
      completionDate: formatDateForInput(project.completionDate),
    };
    setEditingProject(projectForEdit);
  };

  const handleUpdateProject = async () => {
    if (!editingProject) return;

    const projectId = getProjectId(editingProject);
    if (!projectId) {
      alert('Invalid project ID');
      return;
    }

    try {
      // Extract Google Map URL from iframe HTML if needed
      const googleMapUrl = extractGoogleMapUrl(editingProject.googleMap || '');
      
      // Convert facilities and advantages from string to array if needed
      // Handle both comma-separated and newline-separated strings
      let facilitiesArray: string[] = [];
      if (Array.isArray(editingProject.facilities)) {
        facilitiesArray = editingProject.facilities.map(f => typeof f === 'string' ? f.trim() : String(f)).filter(f => f.length > 0);
      } else if (typeof editingProject.facilities === 'string') {
        facilitiesArray = editingProject.facilities.split(/[,\n]/).map(f => f.trim()).filter(f => f.length > 0);
      }
      
      let advantagesArray: string[] = [];
      if (Array.isArray(editingProject.advantages)) {
        advantagesArray = editingProject.advantages.map(a => typeof a === 'string' ? a.trim() : String(a)).filter(a => a.length > 0);
      } else if (typeof editingProject.advantages === 'string') {
        advantagesArray = editingProject.advantages.split(/[,\n]/).map(a => a.trim()).filter(a => a.length > 0);
      }
      
      const updateData = {
        ...editingProject,
        facilities: facilitiesArray,
        advantages: advantagesArray,
        googleMap: googleMapUrl, // Use extracted URL
        startDate: editingProject.startDate || null,
        completionDate: editingProject.completionDate || null,
      };

      // Remove _id and id from update data (MongoDB doesn't allow updating _id)
      const { _id, id, ...dataToUpdate } = updateData;

      const response = await projectAPI.update(projectId, dataToUpdate);
      if (response.success) {
        setProjects(projects.map(p => getProjectId(p) === projectId ? response.data : p));
        setEditingProject(null);
        alert('Project updated successfully!');
      }
    } catch (error: any) {
      console.error('Error updating project:', error);
      alert('Failed to update project: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDeleteProject = async (project: Project) => {
    const projectId = getProjectId(project);
    if (!projectId) {
      alert('Invalid project ID');
      return;
    }

    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const response = await projectAPI.delete(projectId);
      if (response.success) {
          setProjects(projects.filter(p => getProjectId(p) !== projectId));
          alert('Project deleted successfully!');
      }
    } catch (error: any) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'present': return 'bg-green-100 text-green-800';
      case 'past': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Project Management</h2>
        <div className="flex space-x-2">
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-emerald-700 transition-all duration-300"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Project</span>
        </button>
        <button
          onClick={() => setShowExcelUploader(true)}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-300"
        >
          <Plus className="h-5 w-5" />
          <span>Manage Excel Data</span>
        </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading projects...</span>
        </div>
      )}

      {/* Projects Grid */}
      {!loading && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {projects.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              <p>No projects found. Create your first project!</p>
            </div>
          ) : (
            projects.map((project) => (
          <motion.div
            key={getProjectId(project)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <img
              src={project.image}
              alt={project.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900">{project.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{project.location}</p>
              <p className="text-gray-600 text-sm mb-4">{project.type} • {project.units} units</p>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSelectedProjectForPlotShapes(project);
                    setShowPlotShapeManager(true);
                  }}
                  className="flex items-center space-x-1 bg-premium-gold text-premium-navy px-3 py-2 rounded-lg hover:bg-premium-gold-light transition-colors font-semibold"
                >
                  <Layers className="h-4 w-4" />
                  <span>Manage Plot Shapes</span>
                </button>
                <Link
                  to={`/project/${getProjectId(project)}`}
                  className="flex items-center space-x-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Public Page</span>
                </Link>
                <button
                  onClick={() => handleEditProject(project)}
                  className="flex items-center space-x-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteProject(project)}
                  className="flex items-center space-x-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </motion.div>
            ))
          )}
      </div>
      )}

      {/* Add New Project Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Add New Project</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter project name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={newProject.location}
                    onChange={(e) => setNewProject({...newProject, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={newProject.status}
                    onChange={(e) => setNewProject({...newProject, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="present">Ongoing</option>
                    <option value="past">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type *
                  </label>
                  <input
                    type="text"
                    value={newProject.type}
                    onChange={(e) => setNewProject({...newProject, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 3BHK & 4BHK"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Units
                  </label>
                  <input
                    type="number"
                    value={newProject.units}
                    onChange={(e) => setNewProject({...newProject, units: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter number of units"
                  />
                </div>

                {/* Homepage Display Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Homepage Display Image *
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleHomepageImageUpload}
                        disabled={uploadingHomepageImage}
                        className="hidden"
                        id="homepage-image-upload"
                      />
                      <label
                        htmlFor="homepage-image-upload"
                        className={`flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                          uploadingHomepageImage ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploadingHomepageImage ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin text-blue-600" />
                            <span className="text-sm text-gray-600">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-700">Upload Image</span>
                          </>
                        )}
                      </label>
                    </div>
                    {newProject.image && (
                      <div className="mt-2 relative">
                        <img
                          src={newProject.image}
                          alt="Homepage preview"
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="absolute top-2 right-2 flex space-x-2">
                          <button
                            onClick={handleDeleteHomepageImage}
                            className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                            title="Delete image"
                            type="button"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Current image</p>
                      </div>
                    )}
                  <input
                    type="url"
                    value={newProject.image}
                    onChange={(e) => setNewProject({...newProject, image: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Or enter image URL directly"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">This image will be displayed on the homepage project grid</p>
                </div>

                {/* Landscape/Hero Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Landscape Photo (Project Details Page)
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleHeroImageUpload}
                        disabled={uploadingHeroImage}
                        className="hidden"
                        id="hero-image-upload"
                      />
                      <label
                        htmlFor="hero-image-upload"
                        className={`flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                          uploadingHeroImage ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploadingHeroImage ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin text-blue-600" />
                            <span className="text-sm text-gray-600">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-700">Upload Landscape Photo</span>
                          </>
                        )}
                      </label>
                    </div>
                    {newProject.heroImage && (
                      <div className="mt-2 relative">
                        <img
                          src={newProject.heroImage}
                          alt="Hero preview"
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="absolute top-2 right-2 flex space-x-2">
                          <button
                            onClick={handleDeleteHeroImage}
                            className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                            title="Delete image"
                            type="button"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Current landscape image</p>
                      </div>
                    )}
                    <input
                      type="url"
                      value={newProject.heroImage}
                      onChange={(e) => setNewProject({...newProject, heroImage: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Or enter image URL directly"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">This landscape photo will be displayed at the top of the project details page</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Excel Data URL
                  </label>
                  <input
                    type="url"
                    value={newProject.excelUrl}
                    onChange={(e) => setNewProject({...newProject, excelUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter Excel file URL for plot data"
                  />
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facilities (comma separated)
                  </label>
                  <textarea
                    value={newProject.facilities}
                    onChange={(e) => setNewProject({...newProject, facilities: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Swimming Pool, Gym, Security, Parking, Clubhouse, etc."
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate multiple facilities with commas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Advantages (comma separated)
                  </label>
                  <textarea
                    value={newProject.advantages}
                    onChange={(e) => setNewProject({...newProject, advantages: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Prime location, Excellent connectivity, Near schools, etc."
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate multiple advantages with commas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Map Embed URL
                  </label>
                  <input
                    type="url"
                    value={newProject.googleMap || ''}
                    onChange={(e) => setNewProject({...newProject, googleMap: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://www.google.com/maps/embed?pb=..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Get embed URL from Google Maps: Share → Embed a map → Copy HTML → Extract src URL
                  </p>
                </div>

                {/* Project Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Start Date
                    </label>
                    <input
                      type="date"
                      value={newProject.startDate}
                      onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">When did this project start?</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Completion Date
                    </label>
                    <input
                      type="date"
                      value={newProject.completionDate}
                      onChange={(e) => setNewProject({...newProject, completionDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty if project is ongoing</p>
                  </div>
                </div>
              </div>

              {/* Sample House Section */}
              <div className="space-y-6 mb-6 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900">Sample House Images</h3>
                
                {/* 3BHK Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="md:col-span-2">
                    <h4 className="font-medium text-gray-800 mb-3">3BHK</h4>
                  </div>
                  
                  {/* 3BHK House Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      3BHK Sample House Photo
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload3BHKHouse}
                        disabled={uploading3BHKHouse}
                        className="hidden"
                        id="3bhk-house-upload"
                      />
                      <label
                        htmlFor="3bhk-house-upload"
                        className={`flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                          uploading3BHKHouse ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploading3BHKHouse ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin text-blue-600" />
                            <span className="text-sm text-gray-600">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-700">Upload Photo</span>
                          </>
                        )}
                      </label>
                      {newSampleHouse.threeBHK.image && (
                        <div className="mt-2 relative">
                          <img
                            src={newSampleHouse.threeBHK.image}
                            alt="3BHK house"
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            onClick={handleDelete3BHKHouse}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                            title="Delete image"
                            type="button"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3BHK Floor Plan */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      3BHK Floor Plan (Zoomable)
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload3BHKFloorPlan}
                        disabled={uploading3BHKFloorPlan}
                        className="hidden"
                        id="3bhk-floorplan-upload"
                      />
                      <label
                        htmlFor="3bhk-floorplan-upload"
                        className={`flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                          uploading3BHKFloorPlan ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploading3BHKFloorPlan ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin text-blue-600" />
                            <span className="text-sm text-gray-600">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-700">Upload Floor Plan</span>
                          </>
                        )}
                      </label>
                      {newSampleHouse.threeBHK.floorPlan && (
                        <div className="mt-2 relative">
                          <img
                            src={newSampleHouse.threeBHK.floorPlan}
                            alt="3BHK floor plan"
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            onClick={handleDelete3BHKFloorPlan}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                            title="Delete image"
                            type="button"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4BHK Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="md:col-span-2">
                    <h4 className="font-medium text-gray-800 mb-3">4BHK</h4>
                  </div>
                  
                  {/* 4BHK House Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      4BHK Sample House Photo
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload4BHKHouse}
                        disabled={uploading4BHKHouse}
                        className="hidden"
                        id="4bhk-house-upload"
                      />
                      <label
                        htmlFor="4bhk-house-upload"
                        className={`flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                          uploading4BHKHouse ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploading4BHKHouse ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin text-blue-600" />
                            <span className="text-sm text-gray-600">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-700">Upload Photo</span>
                          </>
                        )}
                      </label>
                      {newSampleHouse.fourBHK.image && (
                        <div className="mt-2 relative">
                          <img
                            src={newSampleHouse.fourBHK.image}
                            alt="4BHK house"
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            onClick={handleDelete4BHKHouse}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                            title="Delete image"
                            type="button"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 4BHK Floor Plan */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      4BHK Floor Plan (Zoomable)
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload4BHKFloorPlan}
                        disabled={uploading4BHKFloorPlan}
                        className="hidden"
                        id="4bhk-floorplan-upload"
                      />
                      <label
                        htmlFor="4bhk-floorplan-upload"
                        className={`flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                          uploading4BHKFloorPlan ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploading4BHKFloorPlan ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin text-blue-600" />
                            <span className="text-sm text-gray-600">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-700">Upload Floor Plan</span>
                          </>
                        )}
                      </label>
                      {newSampleHouse.fourBHK.floorPlan && (
                        <div className="mt-2 relative">
                          <img
                            src={newSampleHouse.fourBHK.floorPlan}
                            alt="4BHK floor plan"
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            onClick={handleDelete4BHKFloorPlan}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                            title="Delete image"
                            type="button"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddProject}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-emerald-700 transition-all duration-300"
                >
                  <Save className="h-5 w-5" />
                  <span>Save Project</span>
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Edit Project Form */}
      {editingProject && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Edit Project</h3>
                <button
                  onClick={() => setEditingProject(null)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={editingProject.name}
                    onChange={(e) => setEditingProject({...editingProject, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editingProject.location}
                    onChange={(e) => setEditingProject({...editingProject, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={editingProject.status}
                    onChange={(e) => setEditingProject({...editingProject, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="present">Ongoing</option>
                    <option value="past">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type
                  </label>
                  <input
                    type="text"
                    value={editingProject.type}
                    onChange={(e) => setEditingProject({...editingProject, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Units
                  </label>
                  <input
                    type="number"
                    value={editingProject.units}
                    onChange={(e) => setEditingProject({...editingProject, units: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Homepage Display Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Homepage Display Image *
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditHomepageImageUpload}
                        disabled={uploadingEditHomepageImage}
                        className="hidden"
                        id="edit-homepage-image-upload"
                      />
                      <label
                        htmlFor="edit-homepage-image-upload"
                        className={`flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                          uploadingEditHomepageImage ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploadingEditHomepageImage ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin text-blue-600" />
                            <span className="text-sm text-gray-600">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-700">Upload Image</span>
                          </>
                        )}
                      </label>
                    </div>
                    {editingProject.image && (
                      <div className="mt-2 relative">
                        <img
                          src={editingProject.image}
                          alt="Homepage preview"
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="absolute top-2 right-2 flex space-x-2">
                          <button
                            onClick={handleDeleteEditHomepageImage}
                            className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                            title="Delete image"
                            type="button"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Current image</p>
                      </div>
                    )}
                  <input
                    type="url"
                      value={editingProject.image || ''}
                    onChange={(e) => setEditingProject({...editingProject, image: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Or enter image URL directly"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">This image will be displayed on the homepage project grid</p>
                </div>

                {/* Landscape/Hero Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Landscape Photo (Project Details Page)
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditHeroImageUpload}
                        disabled={uploadingEditHeroImage}
                        className="hidden"
                        id="edit-hero-image-upload"
                      />
                      <label
                        htmlFor="edit-hero-image-upload"
                        className={`flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                          uploadingEditHeroImage ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploadingEditHeroImage ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin text-blue-600" />
                            <span className="text-sm text-gray-600">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-700">Upload Landscape Photo</span>
                          </>
                        )}
                      </label>
                    </div>
                    {editingProject.heroImage && (
                      <div className="mt-2 relative">
                        <img
                          src={editingProject.heroImage}
                          alt="Hero preview"
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="absolute top-2 right-2 flex space-x-2">
                          <button
                            onClick={handleDeleteEditHeroImage}
                            className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                            title="Delete image"
                            type="button"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Current landscape image</p>
                      </div>
                    )}
                    <input
                      type="url"
                      value={editingProject.heroImage || ''}
                      onChange={(e) => setEditingProject({...editingProject, heroImage: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Or enter image URL directly"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">This landscape photo will be displayed at the top of the project details page</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Map Layout URL (Site Plan)
                  </label>
                  <input
                    type="url"
                    value={editingProject.map || ''}
                    onChange={(e) => setEditingProject({...editingProject, map: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter site layout plan URL for plot configuration"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Excel Data URL
                  </label>
                  <input
                    type="url"
                    value={editingProject.excelUrl || ''}
                    onChange={(e) => setEditingProject({...editingProject, excelUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter Excel file URL for plot data"
                  />
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facilities (comma separated)
                  </label>
                  <textarea
                    value={typeof editingProject.facilities === 'string' ? editingProject.facilities : (Array.isArray(editingProject.facilities) ? editingProject.facilities.join(', ') : '')}
                    onChange={(e) => setEditingProject({...editingProject, facilities: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Swimming Pool, Gym, Security, Parking, Clubhouse, etc."
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate multiple facilities with commas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Advantages (comma separated)
                  </label>
                  <textarea
                    value={typeof editingProject.advantages === 'string' ? editingProject.advantages : (Array.isArray(editingProject.advantages) ? editingProject.advantages.join(', ') : '')}
                    onChange={(e) => setEditingProject({...editingProject, advantages: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Prime location, Excellent connectivity, Near schools, etc."
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate multiple advantages with commas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Map Embed URL
                  </label>
                  <input
                    type="url"
                    value={editingProject.googleMap || ''}
                    onChange={(e) => setEditingProject({...editingProject, googleMap: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://www.google.com/maps/embed?pb=..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Get embed URL from Google Maps: Share → Embed a map → Copy HTML → Extract src URL
                  </p>
                </div>

                {/* Project Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Start Date
                    </label>
                    <input
                      type="date"
                      value={editingProject.startDate || ''}
                      onChange={(e) => setEditingProject({...editingProject, startDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">When did this project start?</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Completion Date
                    </label>
                    <input
                      type="date"
                      value={editingProject.completionDate || ''}
                      onChange={(e) => setEditingProject({...editingProject, completionDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty if project is ongoing</p>
                  </div>
                </div>
              </div>

              {/* Sample House Section */}
              <div className="space-y-6 mb-6 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900">Sample House Images</h3>
                
                {/* 3BHK Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="md:col-span-2">
                    <h4 className="font-medium text-gray-800 mb-3">3BHK</h4>
                  </div>
                  
                  {/* 3BHK House Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      3BHK Sample House Photo
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditUpload3BHKHouse}
                        disabled={uploadingEdit3BHKHouse}
                        className="hidden"
                        id="edit-3bhk-house-upload"
                      />
                      <label
                        htmlFor="edit-3bhk-house-upload"
                        className={`flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                          uploadingEdit3BHKHouse ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploadingEdit3BHKHouse ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin text-blue-600" />
                            <span className="text-sm text-gray-600">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-700">Upload Photo</span>
                          </>
                        )}
                      </label>
                      {editingProject.sampleHouse?.threeBHK?.image && (
                        <div className="mt-2 relative">
                          <img
                            src={editingProject.sampleHouse.threeBHK.image}
                            alt="3BHK house"
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            onClick={handleDeleteEdit3BHKHouse}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                            title="Delete image"
                            type="button"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3BHK Floor Plan */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      3BHK Floor Plan (Zoomable)
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditUpload3BHKFloorPlan}
                        disabled={uploadingEdit3BHKFloorPlan}
                        className="hidden"
                        id="edit-3bhk-floorplan-upload"
                      />
                      <label
                        htmlFor="edit-3bhk-floorplan-upload"
                        className={`flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                          uploadingEdit3BHKFloorPlan ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploadingEdit3BHKFloorPlan ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin text-blue-600" />
                            <span className="text-sm text-gray-600">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-700">Upload Floor Plan</span>
                          </>
                        )}
                      </label>
                      {editingProject.sampleHouse?.threeBHK?.floorPlan && (
                        <div className="mt-2 relative">
                          <img
                            src={editingProject.sampleHouse.threeBHK.floorPlan}
                            alt="3BHK floor plan"
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            onClick={handleDeleteEdit3BHKFloorPlan}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                            title="Delete image"
                            type="button"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4BHK Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="md:col-span-2">
                    <h4 className="font-medium text-gray-800 mb-3">4BHK</h4>
                  </div>
                  
                  {/* 4BHK House Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      4BHK Sample House Photo
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditUpload4BHKHouse}
                        disabled={uploadingEdit4BHKHouse}
                        className="hidden"
                        id="edit-4bhk-house-upload"
                      />
                      <label
                        htmlFor="edit-4bhk-house-upload"
                        className={`flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                          uploadingEdit4BHKHouse ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploadingEdit4BHKHouse ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin text-blue-600" />
                            <span className="text-sm text-gray-600">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-700">Upload Photo</span>
                          </>
                        )}
                      </label>
                      {editingProject.sampleHouse?.fourBHK?.image && (
                        <div className="mt-2 relative">
                          <img
                            src={editingProject.sampleHouse.fourBHK.image}
                            alt="4BHK house"
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            onClick={handleDeleteEdit4BHKHouse}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                            title="Delete image"
                            type="button"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 4BHK Floor Plan */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      4BHK Floor Plan (Zoomable)
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditUpload4BHKFloorPlan}
                        disabled={uploadingEdit4BHKFloorPlan}
                        className="hidden"
                        id="edit-4bhk-floorplan-upload"
                      />
                      <label
                        htmlFor="edit-4bhk-floorplan-upload"
                        className={`flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                          uploadingEdit4BHKFloorPlan ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploadingEdit4BHKFloorPlan ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin text-blue-600" />
                            <span className="text-sm text-gray-600">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-700">Upload Floor Plan</span>
                          </>
                        )}
                      </label>
                      {editingProject.sampleHouse?.fourBHK?.floorPlan && (
                        <div className="mt-2 relative">
                          <img
                            src={editingProject.sampleHouse.fourBHK.floorPlan}
                            alt="4BHK floor plan"
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            onClick={handleDeleteEdit4BHKFloorPlan}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                            title="Delete image"
                            type="button"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleUpdateProject}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-emerald-700 transition-all duration-300"
                >
                  <Save className="h-5 w-5" />
                  <span>Update Project</span>
                </button>
                <button
                  onClick={() => setEditingProject(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Excel Uploader Modal */}
      {showExcelUploader && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Excel Data Management</h3>
                <button
                  onClick={() => setShowExcelUploader(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <ExcelUploader
                onDataUpdate={(data) => {
                  console.log('Excel data updated:', data);
                  // Here you can process the data as needed
                }}
                onUrlUpdate={(url) => {
                  console.log('Excel URL updated:', url);
                  // Here you can save the URL to your project data
                }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Plot Shape Manager Modal */}
      {showPlotShapeManager && selectedProjectForPlotShapes && (
        <PlotShapeManager
          projectId={getProjectId(selectedProjectForPlotShapes)}
          projectName={selectedProjectForPlotShapes.name}
          projectMapUrl={(selectedProjectForPlotShapes as any).map || (selectedProjectForPlotShapes as any).image}
          onClose={() => {
            setShowPlotShapeManager(false);
            setSelectedProjectForPlotShapes(null);
          }}
        />
      )}
    </div>
  );
};

export default ProjectManagement;