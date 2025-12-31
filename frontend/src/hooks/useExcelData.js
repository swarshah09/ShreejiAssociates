import { useState, useEffect, useCallback } from 'react';
import { readExcelFromUrl, processPlotData, validateExcelStructure } from '../utils/excelReader';

export const useExcelData = (excelUrl, refreshInterval = 30000) => {
  const [plotData, setPlotData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    if (!excelUrl) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const rawData = await readExcelFromUrl(excelUrl);
      validateExcelStructure(rawData);
      const processedData = processPlotData(rawData);
      
      setPlotData(processedData);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Error fetching Excel data:', err);
    } finally {
      setLoading(false);
    }
  }, [excelUrl]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up auto-refresh
  useEffect(() => {
    if (!excelUrl || !refreshInterval) return;

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    plotData,
    loading,
    error,
    lastUpdated,
    refresh
  };
};