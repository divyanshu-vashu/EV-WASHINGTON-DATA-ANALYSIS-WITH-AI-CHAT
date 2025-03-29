
import { useState, useEffect } from 'react';
import { 
  CountyEVData, 
  EVRatioData, 
  PopularModelData, 
  BrandComparisonData,
  ApiResponse 
} from '@/types';

// Update the API_BASE_URL to include the full URL with protocol
const API_BASE_URL = 'http://localhost:3069/api/dashboard';

// Update the fetchFromApi function with proper error handling and CORS settings
async function fetchFromApi<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
       
      },
      mode: 'cors',
      credentials: 'omit' // Changed from 'include' to 'omit'
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      data: null as unknown as T
    };
  }
}

// Custom hooks for each chart type
export function useCountyEVData() {
  const [data, setData] = useState<CountyEVData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetchFromApi<CountyEVData>('/county-ev');
        
        if (response.success && response.data) {
          setData(response.data);
          console.log('County EV data:', response.data);
        } else {
          setError(response.message || 'Failed to fetch county EV data');
        }
      } catch (err) {
        setError('Network error: Unable to connect to the server');
        console.error('County EV data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

export function useEVRatioData() {
  const [data, setData] = useState<EVRatioData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetchFromApi<EVRatioData[]>('/ev-ratio');
        
        if (response.success && response.data) {
          setData(response.data);
        } else {
          setError(response.message || 'Failed to fetch EV ratio data');
        }
      } catch (err) {
        setError('Failed to fetch EV ratio data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

export function usePopularModelsData() {
  const [data, setData] = useState<PopularModelData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetchFromApi<PopularModelData[]>('/popular-models');
        
        if (response.success && response.data) {
          setData(response.data);
        } else {
          setError(response.message || 'Failed to fetch popular models data');
        }
      } catch (err) {
        setError('Failed to fetch popular models data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

export function useBrandComparisonData() {
  const [data, setData] = useState<BrandComparisonData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetchFromApi<BrandComparisonData[]>('/brand-comparison');
        
        if (response.success && response.data) {
          setData(response.data);
        } else {
          setError(response.message || 'Failed to fetch brand comparison data');
        }
      } catch (err) {
        setError('Failed to fetch brand comparison data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}
