import mongoose from 'mongoose';

const plotShapeSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  // Image dimensions for coordinate scaling
  imageWidth: {
    type: Number,
    required: true
  },
  imageHeight: {
    type: Number,
    required: true
  },
  // Array of plot shapes detected from the layout image
  plots: [{
    id: {
      type: String,
      required: true
    },
    plotNumber: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'SOLD', 'IN_PROGRESS', 'RESERVED'],
      default: 'AVAILABLE'
    },
    // Polygon coordinates as flat array: [x1, y1, x2, y2, ...]
    points: {
      type: [Number],
      required: true
    }
  }],
  // When was this configuration created/updated
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: String,
    default: 'admin'
  }
}, {
  timestamps: true
});

// One PlotShape document per project (upsert on save)
plotShapeSchema.index({ projectId: 1 }, { unique: true });

export default mongoose.model('PlotShape', plotShapeSchema);

