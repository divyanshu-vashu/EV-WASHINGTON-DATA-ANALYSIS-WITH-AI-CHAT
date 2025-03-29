
import { useEVRatioData } from '@/hooks/useChartData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function RatioChart() {
  const { data, loading, error } = useEVRatioData();
  
  if (loading) {
    return (
      <div className="chart-container flex items-center justify-center min-h-[300px]">
        <div className="animate-pulse-soft">
          <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-[250px] w-full bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="chart-container flex flex-col items-center justify-center min-h-[300px]">
        <p className="text-red-500">Failed to load data</p>
      </div>
    );
  }
  
  // Transform data for chart
  const chartData = data.map(county => ({
    name: county.county,
    ratio: parseFloat(county.ratio.toFixed(1))
  }));
  
  return (
    <div className="chart-container">
      <h3 className="chart-title">Top 3 Counties by EV-to-Charging Station Ratio</h3>
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-4">
          Counties with the highest number of electric vehicles per charging station
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {data.map((county, index) => (
            <div key={county.county} className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                  {county.ratio.toFixed(1)} EVs per station
                </span>
              </div>
              <span className="stat-value">{county.county}</span>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>{county.totalEvs.toLocaleString()} EVs</span>
                <span>{county.chargingStations} stations</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                borderRadius: '8px', 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', 
                border: 'none' 
              }} 
              labelStyle={{ fontWeight: 600 }}
              formatter={(value) => [`${value} EVs per station`, 'Ratio']}
            />
            <Bar dataKey="ratio" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
