// API service for backend communication

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage (if admin is logged in)
const getAuthToken = () => {
  const adminUser = localStorage.getItem('adminUser');
  if (adminUser) {
    try {
      const userData = JSON.parse(adminUser);
      // Return JWT token if available, otherwise fallback to legacy format
      return userData.token || 'admin-authenticated';
    } catch (error) {
      // Legacy format - return simple indicator
      return 'admin-authenticated';
    }
  }
  return null;
};

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Add authorization header for admin-only endpoints
    if (token && (options.method === 'POST' || options.method === 'PUT' || options.method === 'DELETE')) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...options
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Project API
export const projectAPI = {
  getAll: () => apiCall('/projects'),
  getById: (id) => apiCall(`/projects/${id}`),
  create: (projectData) => apiCall('/projects', {
    method: 'POST',
    body: JSON.stringify(projectData)
  }),
  update: (id, projectData) => apiCall(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(projectData)
  }),
  delete: (id) => apiCall(`/projects/${id}`, {
    method: 'DELETE'
  })
};

// Plot detection API (photo -> polygons)
export const plotDetectionAPI = {
  detectFromImage: async (projectId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = getAuthToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/plot-detection/${projectId}`, {
      method: 'POST',
      body: formData,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Plot detection request failed');
    }

    return data;
  }
};

// Plot shapes API (save/load detected polygons)
export const plotShapeAPI = {
  get: (projectId) => apiCall(`/plot-shapes/${projectId}`),
  save: (projectId, plotShapeData) => apiCall(`/plot-shapes/${projectId}`, {
    method: 'POST',
    body: JSON.stringify(plotShapeData)
  }),
  update: (projectId, plotShapeData) => apiCall(`/plot-shapes/${projectId}`, {
    method: 'PUT',
    body: JSON.stringify(plotShapeData)
  }),
  delete: (projectId) => apiCall(`/plot-shapes/${projectId}`, {
    method: 'DELETE'
  })
};

// Image upload API (upload to Cloudinary)
export const imageUploadAPI = {
  upload: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const token = getAuthToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/images/upload`, {
      method: 'POST',
      body: formData,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Image upload failed');
    }

    return data;
  }
};

// Enquiry API
export const enquiryAPI = {
  submit: (enquiryData) => apiCall('/enquiry', {
    method: 'POST',
    body: JSON.stringify(enquiryData)
  })
};

// Auth API
export const authAPI = {
  login: (credentials) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  verify: () => apiCall('/auth/verify')
};

export default { projectAPI, plotDetectionAPI, plotShapeAPI, imageUploadAPI, enquiryAPI, authAPI };

