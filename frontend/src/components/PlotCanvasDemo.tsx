import React, { useState } from 'react';
import PlotCanvas from './PlotCanvas';
import type { PlotShape, PlotStatus } from '../types/plots';

// Static demo layout for Option A (single project, hard-coded shapes)
const DEMO_PLOTS: PlotShape[] = [
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
    area: '1100 sq ft',
    dimensions: '28 x 40',
    direction: 'North',
    price: '₹42,00,000',
    negotiable: 'No',
  },
  {
    id: 'plot-3',
    plotNumber: 'A-103',
    status: 'IN_PROGRESS',
    points: [50, 170, 200, 170, 200, 270, 120, 250, 50, 220],
    area: '1300 sq ft',
    dimensions: 'Irregular',
    direction: 'West',
    price: '₹47,50,000',
    negotiable: 'Yes',
  },
  {
    id: 'plot-4',
    plotNumber: 'A-104',
    status: 'RESERVED',
    points: [220, 180, 360, 170, 380, 260, 240, 280],
    area: '1400 sq ft',
    dimensions: 'Corner',
    direction: 'South-East',
    price: '₹49,00,000',
    negotiable: 'On request',
  },
];

const PlotCanvasDemo: React.FC = () => {
  const [selectedPlot, setSelectedPlot] = useState<PlotShape | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Interactive Plot Layout (Konva Demo)
        </h1>
        <p className="text-gray-600">
          Hover or click on any plot to see details. Colors indicate status, similar to stadium or seat booking systems.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
          <PlotCanvas
            plots={DEMO_PLOTS}
            onSelectPlot={(plot) => setSelectedPlot(plot)}
          />

          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <LegendItem color="#22c55e" label="Available" />
            <LegendItem color="#ef4444" label="Sold" />
            <LegendItem color="#facc15" label="In Progress" />
            <LegendItem color="#a855f7" label="Reserved" />
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Plot Details</h2>
            {selectedPlot ? (
              <div className="space-y-2 text-sm">
                <DetailRow label="Plot Number" value={selectedPlot.plotNumber} />
                <DetailRow label="Status" value={selectedPlot.status.replace('_', ' ')} />
                <DetailRow label="Area" value={selectedPlot.area} />
                {selectedPlot.dimensions && (
                  <DetailRow label="Dimensions" value={selectedPlot.dimensions} />
                )}
                {selectedPlot.direction && (
                  <DetailRow label="Facing" value={selectedPlot.direction} />
                )}
                {selectedPlot.price && (
                  <DetailRow label="Price" value={selectedPlot.price} />
                )}
                {selectedPlot.negotiable && (
                  <DetailRow label="Negotiable" value={selectedPlot.negotiable} />
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                Hover or click a plot on the layout to see its details here.
              </p>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center space-x-2">
    <span className="w-4 h-4 rounded-sm border" style={{ backgroundColor: color }} />
    <span className="text-gray-700">{label}</span>
  </div>
);

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
    <p className="text-sm font-medium text-gray-900">{value}</p>
  </div>
);

export default PlotCanvasDemo;


