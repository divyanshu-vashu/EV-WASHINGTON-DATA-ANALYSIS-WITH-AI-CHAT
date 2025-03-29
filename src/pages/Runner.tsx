import { Navbar } from '@/components/Navbar';
import { useState } from 'react';
import { FixedSizeList } from 'react-window';

export function Runner() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [visibleRows, setVisibleRows] = useState(50); // Track visible rows

  const executeQuery = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:3069/api/runner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Query failed');
      
      setResults(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute query');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Virtualized row renderer
  // Modify the Row component to properly handle table structure
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={{...style, display: 'flex', width: '100%'}}>
      {Object.values(results[index]).map((value, j) => (
        <div 
          key={j} 
          className="px-4 py-2 text-sm font-mono border-b flex-1"
          style={{
            minWidth: '100px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            borderRight: j < Object.values(results[index]).length - 1 ? '1px solid #e5e7eb' : 'none'
          }}
        >
          {String(value)}
        </div>
      ))}
    </div>
  );

  const loadMoreRows = () => {
    setVisibleRows(prev => Math.min(prev + 50, results.length));
  };

  const handleScroll = ({ scrollOffset, scrollUpdateWasRequested }: { scrollOffset: number, scrollUpdateWasRequested: boolean }) => {
    const triggerThreshold = 200; // pixels from bottom
    const totalHeight = visibleRows * 35; // itemSize is 35
    const listHeight = Math.min(totalHeight, 500); // current list height
    
    // Load more when 200px from bottom
    if (totalHeight - (scrollOffset + listHeight) < triggerThreshold) {
      loadMoreRows();
    }
  };

  return (

    <div className="min-h-screen pt-16 px-4 max-w-6xl mx-auto">
        <Navbar/>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">SQL Runner</h1>
        
        <div className="space-y-4">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-32 p-4 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500"
            placeholder="Enter SQL query..."
          />
          
          <div className="flex gap-4 items-center">
            <button
              onClick={executeQuery}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Executing...' : 'Run Query'}
            </button>
            
            <select 
              value={visibleRows}
              onChange={(e) => setVisibleRows(Number(e.target.value))}
              className="px-3 py-2 border rounded-lg bg-white"
            >
              <option value={50}>50 Rows</option>
              <option value={100}>100 Rows</option>
              <option value={500}>500 Rows</option>
            </select>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg">
              Error: {error}
            </div>
          )}

          {results.length > 0 && (
            <div className="overflow-x-auto rounded-lg border">
              {/* Header row outside of FixedSizeList */}
              <div className="bg-gray-50 border-b">
                <div className="flex">
                  {Object.keys(results[0]).map((header) => (
                    <div 
                      key={header} 
                      className="px-4 py-3 text-left text-sm font-medium text-gray-700 flex-1"
                      style={{
                        minWidth: '100px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        borderRight: header !== Object.keys(results[0]).slice(-1)[0] ? '1px solid #e5e7eb' : 'none'
                      }}
                    >
                      {header}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* FixedSizeList for data rows */}
              <div className="bg-white">
                <FixedSizeList
                  height={Math.min(visibleRows * 35, 500)}
                  itemCount={Math.min(visibleRows, results.length)}
                  itemSize={35}
                  width="100%"
                  onScroll={handleScroll}
                >
                  {Row}
                </FixedSizeList>
              </div>
              
              {/* Show More button */}
              {visibleRows < results.length && (
                <div className="p-4 border-t">
                  <button
                    onClick={loadMoreRows}
                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-lg"
                  >
                    Show More ({results.length - visibleRows} remaining rows)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}