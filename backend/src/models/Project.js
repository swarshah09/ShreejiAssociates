import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'present', 'past'],
    default: 'upcoming'
  },
  startDate: {
    type: Date,
    default: null // Date when project started
  },
  completionDate: {
    type: Date,
    default: null // Date when project completed (null if ongoing)
  },
  type: {
    type: String,
    required: true
  },
  units: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    required: true // Homepage display image URL
  },
  heroImage: {
    type: String,
    default: '' // Landscape photo for project details page
  },
  map: {
    type: String,
    required: true // Site layout plan image URL
  },
  excelUrl: {
    type: String,
    default: ''
  },
  facilities: [{
    type: String
  }],
  advantages: [{
    type: String
  }],
  sampleHouse: {
    threeBHK: {
      image: String, // Sample house photo for 3BHK
      floorPlan: String // Floor plan for 3BHK (zoomable)
    },
    fourBHK: {
      image: String, // Sample house photo for 4BHK
      floorPlan: String // Floor plan for 4BHK (zoomable)
    }
  },
  googleMap: {
    type: String,
    default: ''
  },
  plots: {
    type: Map,
    of: {
      number: String,
      area: String,
      dimensions: String,
      status: String,
      direction: String,
      type: String,
      price: String,
      negotiable: String
    },
    default: {}
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
projectSchema.index({ startDate: -1 }); // Index for sorting by start date (descending)
projectSchema.index({ status: 1 }); // Index for filtering by status
projectSchema.index({ createdAt: -1 }); // Index for sorting by creation date

export default mongoose.model('Project', projectSchema);

