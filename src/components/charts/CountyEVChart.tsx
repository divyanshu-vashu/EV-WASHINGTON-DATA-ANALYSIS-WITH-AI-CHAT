
import { useCountyEVData } from '@/hooks/useChartData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function CountyEVChart() {
  const { data, loading, error } = useCountyEVData();
  
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
        <p className="text-red-500">Failed to load data CountyEVChart</p>
      </div>
    );
  }
  
  // Transform data for chart
  const chartData = [
    {
      name: data.county,
      "Electric Vehicles": data.totalEvs,
      "Charging Stations": data.chargingStations
    }
  ];
  
  return (
    <div className="chart-container">
      <h3 className="chart-title">County with Most EVs and Charging Stations</h3>
      <div className="stat-value mb-2">{data.county}</div>
      <div className="flex flex-col sm:flex-row gap-6 mb-6">
        <div className="stat-card flex-1">
          <span className="stat-value">{data.totalEvs.toLocaleString()}</span>
          <span className="stat-label">Electric Vehicles</span>
        </div>
        <div className="stat-card flex-1">
          <span className="stat-value">{data.chargingStations.toLocaleString()}</span>
          <span className="stat-label">Charging Stations</span>
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
            />
            <Legend />
            <Bar dataKey="Electric Vehicles" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Charging Stations" fill="#93c5fd" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
