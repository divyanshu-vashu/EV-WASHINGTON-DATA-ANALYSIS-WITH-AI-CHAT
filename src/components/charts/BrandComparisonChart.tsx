
import { useBrandComparisonData } from '@/hooks/useChartData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function BrandComparisonChart() {
  const { data, loading, error } = useBrandComparisonData();
  
  if (loading) {
    return (
      <Card className="w-full h-[350px] shadow-md">
        <CardHeader className="pb-2">
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (error || !data) {
    return (
      <Card className="w-full h-[350px] shadow-md">
        <CardHeader className="pb-2">
          <CardTitle>Brand Comparison</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center text-red-500">
          {error || 'Unable to load data'}
        </CardContent>
      </Card>
    );
  }

  // Sort data by count in descending order
  const sortedData = [...data].sort((a, b) => b.count - a.count);
  
  // Calculate total count
  const totalCount = sortedData.reduce((sum, item) => sum + item.count, 0);
  
  // Calculate percentages for labels
  const dataWithPercentage = sortedData.map(item => ({
    ...item,
    percentage: ((item.count / totalCount) * 100).toFixed(1)
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-lg rounded-md">
          <p className="font-semibold">{payload[0].payload.make}</p>
          <p>{payload[0].value.toLocaleString()} vehicles</p>
          <p>{payload[0].payload.percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full h-[350px] shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle>EV Brand Comparison</CardTitle>
        <CardDescription>
          Brand distribution in counties with best charging infrastructure
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dataWithPercentage}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis dataKey="make" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" name="Number of Vehicles">
              {dataWithPercentage.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
