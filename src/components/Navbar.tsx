
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out glass-navbar",
        scrolled ? "py-3" : "py-5"
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-blue-600 flex items-center justify-center">
            <div className="h-3 w-3 rounded-full bg-white"></div>
          </div>
          <h1 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-500">
            EV Journey Insight
          </h1>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="/" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Dashboard</a>
          <a href="/analytics" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Analytics</a>
          <a href="/runner" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Runner</a>
          
        </nav>
        
        <div className="flex items-center space-x-4">
          
        </div>
      </div>
    </header>
  );
}
