
import { CountyEVChart } from '@/components/charts/CountyEVChart';
import { RatioChart } from '@/components/charts/RatioChart';
import { PopularModelsChart } from '@/components/charts/PopularModelsChart';
import { BrandComparisonChart } from '@/components/charts/BrandComparisonChart';
import { MessageCircle, X } from 'lucide-react';
import { useState } from 'react';
import Aichat from '@/components/Aichat';
import { Button } from '@/components/ui/button';

export function Dashboard() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">EV Adoption & Infrastructure Dashboard</h1>
        <p className="text-gray-600 mb-8">Visualizing electric vehicle data and charging infrastructure across counties</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CountyEVChart />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <RatioChart />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <PopularModelsChart />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <BrandComparisonChart />
          </div>
        </div>
      </div>

      {/* Simple Chat Toggle Button */}
      <Button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-5 right-5 rounded-full w-12 h-12 p-0 shadow-lg z-50"
      >
        {isChatOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </Button>

      {/* Simple Chat Container */}
      {isChatOpen && (
        <div className="fixed bottom-20 right-5 w-96 h-[500px] bg-white border rounded-lg shadow-lg overflow-hidden z-40">
          <Aichat />
        </div>
      )}
    </main>
  );
}
