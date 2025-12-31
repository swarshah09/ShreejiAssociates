import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, RefreshCw, AlertCircle, CheckCircle, FileSpreadsheet } from 'lucide-react';
import { readExcelFromFile, validateExcelStructure } from '../../utils/excelReader';

const ExcelUploader = ({ onDataUpdate, currentUrl, onUrlUpdate }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(currentUrl || '');
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      setStatus({ type: 'error', message: 'Please upload an Excel file (.xlsx or .xls)' });
      return;
    }

    setUploading(true);
    setStatus({ type: '', message: '' });

    try {
      const data = await readExcelFromFile(file);
      validateExcelStructure(data);
      
      onDataUpdate(data);
      setStatus({ type: 'success', message: `Successfully uploaded ${data.length} plot records` });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onUrlUpdate(urlInput.trim());
      setStatus({ type: 'success', message: 'Excel URL updated successfully' });
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        'Plot_Number': 'A-101',
        'Area': '1200 sq ft',
        'Dimensions': '30x40 ft',
        'Status': 'Available',
        'Direction': 'East Facing',
        'Type': '3BHK',
        'Price': '₹45L - ₹50L',
        'Negotiable': 'Negotiable'
      },
      {
        'Plot_Number': 'A-102',
        'Area': '1400 sq ft',
        'Dimensions': '35x40 ft',
        'Status': 'Sold',
        'Direction': 'North Facing',
        'Type': '4BHK',
        'Price': '₹55L - ₹60L',
        'Negotiable': 'Non-Negotiable'
      }
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(template[0]).join(",") + "\n"
      + template.map(row => Object.values(row).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "plot_data_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Excel Data Management</h3>
        <button
          onClick={downloadTemplate}
          className="flex items-center space-x-2 bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Download Template</span>
        </button>
      </div>

      {/* URL Input Section */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Excel File URL (Google Drive, Dropbox, etc.)
        </label>
        <div className="flex space-x-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://drive.google.com/file/d/your-file-id/view"
          />
          <button
            onClick={handleUrlSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Update URL
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          For Google Drive: Share the file publicly and use the direct download link
        </p>
      </div>

      {/* File Upload Section */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        <div className="space-y-4">
          {uploading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="mx-auto w-12 h-12 text-blue-600"
            >
              <RefreshCw className="w-full h-full" />
            </motion.div>
          ) : (
            <FileSpreadsheet className="mx-auto w-12 h-12 text-gray-400" />
          )}
          
          <div>
            <p className="text-lg font-semibold text-gray-700">
              {uploading ? 'Processing Excel file...' : 'Upload Excel File'}
            </p>
            <p className="text-gray-500">
              Drag and drop your Excel file here, or click to browse
            </p>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {status.message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-4 rounded-lg flex items-center space-x-2 ${
            status.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{status.message}</span>
        </motion.div>
      )}

      {/* Instructions */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Excel File Format:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Plot_Number:</strong> Unique identifier (e.g., A-101, B-205)</li>
          <li>• <strong>Area:</strong> Plot area (e.g., 1200 sq ft)</li>
          <li>• <strong>Dimensions:</strong> Plot dimensions (e.g., 30x40 ft)</li>
          <li>• <strong>Status:</strong> Available, Sold, or On-hold</li>
          <li>• <strong>Direction:</strong> Facing direction (e.g., East Facing)</li>
          <li>• <strong>Type:</strong> Property type (e.g., 3BHK, 4BHK)</li>
          <li>• <strong>Price:</strong> Price range (e.g., ₹45L - ₹50L)</li>
          <li>• <strong>Negotiable:</strong> Negotiable or Non-Negotiable</li>
        </ul>
      </div>
    </div>
  );
};

export default ExcelUploader;