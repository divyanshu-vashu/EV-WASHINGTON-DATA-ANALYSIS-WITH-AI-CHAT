
import { usePopularModelsData } from '@/hooks/useChartData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function PopularModelsChart() {
  const { data, loading, error } = usePopularModelsData();
  
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
  const chartData = data.map(model => ({
    name: `${model.make} ${model.model}`,
    count: model.count
  }));
  
  return (
    <div className="chart-container">
      <h3 className="chart-title">Top 5 Most Popular EV Models</h3>
      <p className="text-sm text-gray-500 mb-4">
        In counties with over 100 charging stations
      </p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#eaeaea" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                borderRadius: '8px', 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', 
                border: 'none' 
              }} 
              labelStyle={{ fontWeight: 600 }}
              formatter={(value) => [`${value.toLocaleString()}`, 'Vehicles']}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
        {data.map((model, index) => (
          <div key={`${model.make}-${model.model}`} className="p-3 rounded-lg bg-blue-50 border border-blue-100">
            <div className="text-xs text-blue-700 font-medium mb-1">{model.make}</div>
            <div className="text-sm font-medium">{model.model}</div>
            <div className="text-xl font-semibold mt-1">{model.count.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
