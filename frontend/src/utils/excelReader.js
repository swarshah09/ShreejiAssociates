import * as XLSX from 'xlsx';

// Function to convert Google Sheets URL to export format
const convertGoogleSheetsUrl = (url, format = 'csv') => {
  // Check if it's a published Google Sheets URL (pubhtml or pub format)
  const publishedPattern = /docs\.google\.com\/spreadsheets\/d\/e\/([a-zA-Z0-9_-]+)\/pub/;
  const publishedMatch = url.match(publishedPattern);
  
  if (publishedMatch) {
    const publishedId = publishedMatch[1];
    // Convert published link to CSV export format
    if (format === 'csv') {
      return `https://docs.google.com/spreadsheets/d/e/${publishedId}/pub?output=csv`;
    } else {
      return `https://docs.google.com/spreadsheets/d/e/${publishedId}/pub?output=xlsx`;
    }
  }
  
  // Check if it's a regular Google Sheets URL (edit or sharing link)
  const googleSheetsPattern = /docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(googleSheetsPattern);
  
  if (match) {
    const sheetId = match[1];
    // Convert to export format
    // CSV is more reliable for public access
    if (format === 'csv') {
      return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
    } else {
      return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx&gid=0`;
    }
  }
  
  // Check if it's already an export URL
  if (url.includes('/export?format=') || url.includes('/pub?output=')) {
    return url;
  }
  
  // Return original URL if not a Google Sheets URL
  return url;
};

// Function to read Excel file from URL (Google Drive, Dropbox, etc.)
export const readExcelFromUrl = async (url) => {
  try {
    // Check if it's a Google Sheets URL (regular or published format)
    const isGoogleSheets = /docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/.test(url) || 
                           /docs\.google\.com\/spreadsheets\/d\/e\/([a-zA-Z0-9_-]+)\/pub/.test(url);
    
    let exportUrl;
    let useCsv = false;
    
    if (isGoogleSheets) {
      // Try CSV first (more reliable for public Google Sheets)
      exportUrl = convertGoogleSheetsUrl(url, 'csv');
      useCsv = true;
      console.log('Detected Google Sheets URL, using CSV format:', exportUrl);
    } else {
      exportUrl = url;
      console.log('Fetching Excel data from:', exportUrl);
    }
    
    const response = await fetch(exportUrl, {
      method: 'GET',
      headers: {
        'Accept': useCsv ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
    
    if (!response.ok) {
      // If CSV fails, try XLSX format for Google Sheets
      if (isGoogleSheets && useCsv) {
        console.log('CSV format failed, trying XLSX format...');
        const xlsxUrl = convertGoogleSheetsUrl(url, 'xlsx');
        const xlsxResponse = await fetch(xlsxUrl);
        
        if (xlsxResponse.ok) {
          const arrayBuffer = await xlsxResponse.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          console.log(`Successfully loaded ${jsonData.length} rows from Excel file (XLSX format)`);
          return jsonData;
        }
      }
      
      throw new Error(
        `Failed to fetch Excel file: ${response.status} ${response.statusText}. ` +
        `Make sure the Google Sheet is shared publicly: ` +
        `1. Open the Google Sheet, 2. Click "Share" button, 3. Set to "Anyone with the link" → "Viewer", 4. Click "Done"`
      );
    }
    
    if (useCsv) {
      // Read CSV data
      const text = await response.text();
      const workbook = XLSX.read(text, { type: 'string' });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      console.log(`Successfully loaded ${jsonData.length} rows from Google Sheets (CSV format)`);
      return jsonData;
    } else {
      // Read Excel data
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      console.log(`Successfully loaded ${jsonData.length} rows from Excel file`);
      return jsonData;
    }
  } catch (error) {
    console.error('Error reading Excel file:', error);
    if (error.message.includes('Failed to fetch')) {
      throw error;
    }
    throw new Error(
      `Error reading Excel file: ${error.message}. ` +
      `If using Google Sheets, make sure it's shared publicly (Anyone with the link can view).`
    );
  }
};

// Function to read Excel file from local file input
export const readExcelFromFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

// Function to validate Excel data structure
export const validateExcelStructure = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Excel file is empty or invalid');
  }
  
  const firstRow = data[0];
  const columns = Object.keys(firstRow);
  
  // Check for plot number column with explicit and flexible matching
  const plotNumberColumns = [
    'Plot_Number', 'Plot Number', 'PlotNumber', 'Plot_ID', 'Plot ID', 'PlotID',
    'Plot', 'Number', 'ID', 'plot_number', 'plot number', 'plotnumber',
    'plot_id', 'plot id', 'plotid', 'plot', 'number', 'id'
  ];
  
  const hasPlotNumber = columns.some(col => {
    const normalizedCol = col.toLowerCase().trim();
    return plotNumberColumns.some(plotCol => 
      normalizedCol === plotCol.toLowerCase() ||
      normalizedCol.includes('plot') ||
      normalizedCol.includes('number') ||
      normalizedCol.includes('id')
    );
  });
  
  // Check for area column with explicit and flexible matching
  const areaColumns = [
    'Area', 'Size', 'area', 'size', 'Area_sqft', 'Area sqft', 'Square_Feet',
    'Square Feet', 'Sq_Ft', 'Sq Ft', 'sqft', 'sq_ft'
  ];
  
  const hasArea = columns.some(col => {
    const normalizedCol = col.toLowerCase().trim();
    return areaColumns.some(areaCol => 
      normalizedCol === areaCol.toLowerCase() ||
      normalizedCol.includes('area') ||
      normalizedCol.includes('size') ||
      normalizedCol.includes('sqft') ||
      normalizedCol.includes('sq')
    );
  });
  
  // Check for status column with explicit and flexible matching
  const statusColumns = [
    'Status', 'Availability', 'Available', 'status', 'availability', 'available',
    'Plot_Status', 'Plot Status', 'PlotStatus', 'State', 'Condition'
  ];
  
  const hasStatus = columns.some(col => {
    const normalizedCol = col.toLowerCase().trim();
    return statusColumns.some(statusCol => 
      normalizedCol === statusCol.toLowerCase() ||
      normalizedCol.includes('status') ||
      normalizedCol.includes('availability') ||
      normalizedCol.includes('available') ||
      normalizedCol.includes('state')
    );
  });
  
  // Debug logging to help identify column names
  console.log('Available columns:', columns);
  console.log('Plot number found:', hasPlotNumber);
  console.log('Area found:', hasArea);
  console.log('Status found:', hasStatus);
  
  if (!hasPlotNumber) {
    throw new Error(`Excel file must contain a column for plot identification. Available columns: ${columns.join(', ')}. Expected columns like: Plot_Number, Plot Number, Plot ID, Number, ID`);
  }
  
  if (!hasArea) {
    throw new Error(`Excel file must contain a column for area information. Available columns: ${columns.join(', ')}. Expected columns like: Area, Size, Area sqft, Square Feet`);
  }
  
  if (!hasStatus) {
    throw new Error(`Excel file must contain a column for status information. Available columns: ${columns.join(', ')}. Expected columns like: Status, Availability, Available`);
  }
  
  return true;
};

// Function to process plot data and create a lookup object
export const processPlotData = (excelData) => {
  const plotLookup = {};
  
  excelData.forEach(row => {
    // Enhanced plot number detection with more variations
    const plotNumberKeys = Object.keys(row).filter(key => {
      const normalizedKey = key.toLowerCase().trim();
      return normalizedKey.includes('plot') || 
             normalizedKey.includes('number') || 
             normalizedKey.includes('id') ||
             ['plot_number', 'plot number', 'plotnumber', 'plot_id', 'plot id', 'plotid', 'plot', 'number', 'id'].includes(normalizedKey);
    });
    
    const plotNumber = plotNumberKeys.length > 0 ? row[plotNumberKeys[0]] : null;
    
    if (plotNumber) {
      // Enhanced area detection
      const areaKeys = Object.keys(row).filter(key => {
        const normalizedKey = key.toLowerCase().trim();
        return normalizedKey.includes('area') || 
               normalizedKey.includes('size') || 
               normalizedKey.includes('sqft') ||
               ['area', 'size', 'area_sqft', 'area sqft', 'square_feet', 'square feet', 'sq_ft', 'sq ft', 'sqft'].includes(normalizedKey);
      });
      
      // Enhanced status detection
      const statusKeys = Object.keys(row).filter(key => {
        const normalizedKey = key.toLowerCase().trim();
        return normalizedKey.includes('status') || 
               normalizedKey.includes('availability') || 
               normalizedKey.includes('available') ||
               ['status', 'availability', 'available', 'plot_status', 'plot status', 'plotstatus', 'state', 'condition'].includes(normalizedKey);
      });
      
      // Enhanced dimensions detection
      const dimensionKeys = Object.keys(row).filter(key => {
        const normalizedKey = key.toLowerCase().trim();
        return normalizedKey.includes('dimension') || 
               normalizedKey.includes('size') ||
               ['dimensions', 'dimension', 'size', 'length_width', 'length width', 'l_w', 'lxw'].includes(normalizedKey);
      });
      
      // Enhanced direction detection
      const directionKeys = Object.keys(row).filter(key => {
        const normalizedKey = key.toLowerCase().trim();
        return normalizedKey.includes('direction') || 
               normalizedKey.includes('facing') ||
               ['direction', 'facing', 'orientation', 'face'].includes(normalizedKey);
      });
      
      // Enhanced type detection
      const typeKeys = Object.keys(row).filter(key => {
        const normalizedKey = key.toLowerCase().trim();
        return normalizedKey.includes('type') || 
               normalizedKey.includes('category') ||
               ['type', 'category', 'plot_type', 'plot type', 'plottype', 'unit_type', 'unit type'].includes(normalizedKey);
      });
      
      // Enhanced price detection
      const priceKeys = Object.keys(row).filter(key => {
        const normalizedKey = key.toLowerCase().trim();
        return normalizedKey.includes('price') || 
               normalizedKey.includes('cost') || 
               normalizedKey.includes('amount') ||
               ['price', 'cost', 'amount', 'rate', 'value'].includes(normalizedKey);
      });
      
      // Enhanced negotiable detection
      const negotiableKeys = Object.keys(row).filter(key => {
        const normalizedKey = key.toLowerCase().trim();
        return normalizedKey.includes('negotiable') || 
               normalizedKey.includes('negotiate') ||
               ['negotiable', 'negotiate', 'fixed', 'flexible'].includes(normalizedKey);
      });
      
      // Normalize plot number (trim whitespace, convert to string)
      const normalizedPlotNumber = String(plotNumber).trim();
      
      plotLookup[normalizedPlotNumber] = {
        number: normalizedPlotNumber,
        area: areaKeys.length > 0 ? (row[areaKeys[0]] || '').toString().trim() : '',
        dimensions: dimensionKeys.length > 0 ? (row[dimensionKeys[0]] || '').toString().trim() : '',
        status: statusKeys.length > 0 ? (row[statusKeys[0]] || 'Available').toString().trim() : 'Available',
        direction: directionKeys.length > 0 ? (row[directionKeys[0]] || '').toString().trim() : '',
        type: typeKeys.length > 0 ? (row[typeKeys[0]] || '').toString().trim() : '',
        price: priceKeys.length > 0 ? (row[priceKeys[0]] || '').toString().trim() : '',
        negotiable: negotiableKeys.length > 0 ? (row[negotiableKeys[0]] || 'Negotiable').toString().trim() : 'Negotiable',
      };
      
      // Also add a case-insensitive key for easier lookup
      if (normalizedPlotNumber !== normalizedPlotNumber.toUpperCase()) {
        plotLookup[normalizedPlotNumber.toUpperCase()] = plotLookup[normalizedPlotNumber];
      }
      if (normalizedPlotNumber !== normalizedPlotNumber.toLowerCase()) {
        plotLookup[normalizedPlotNumber.toLowerCase()] = plotLookup[normalizedPlotNumber];
      }
    }
  });
  
  return plotLookup;
};