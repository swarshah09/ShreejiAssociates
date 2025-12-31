import type { PlotShape } from '../types/plots';

// For now this is a static JSON-style mapping from projectId -> plot geometry.
// Later this can be replaced with a backend API.

const demoProjectPlots: PlotShape[] = [
  {
    id: 'plot-1',
    plotNumber: 'A-101',
    status: 'AVAILABLE',
    points: [50, 50, 200, 50, 200, 150, 50, 150],
  },
  {
    id: 'plot-2',
    plotNumber: 'A-102',
    status: 'SOLD',
    points: [220, 50, 370, 50, 370, 150, 220, 150],
  },
  {
    id: 'plot-3',
    plotNumber: 'A-103',
    status: 'IN_PROGRESS',
    points: [50, 170, 200, 170, 200, 270, 120, 250, 50, 220],
  },
  {
    id: 'plot-4',
    plotNumber: 'A-104',
    status: 'RESERVED',
    points: [220, 180, 360, 170, 380, 260, 240, 280],
  },
];

export const getProjectPlotShapes = (projectId: string | undefined | null): PlotShape[] => {
  // In Option B we just use a static mapping; later, this becomes dynamic per project.
  if (!projectId) return demoProjectPlots;

  // Simple switch for future multiple projects
  switch (projectId) {
    case '1':
    default:
      return demoProjectPlots;
  }
};


