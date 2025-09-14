import React, { useState, useEffect, useRef } from 'react';
import { 
  Monitor, 
  Clock, 
  Database, 
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Play,
  Square,
  Download,
  RefreshCw
} from 'lucide-react';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'good' | 'warning' | 'critical';
  timestamp: number;
}

interface PerformanceTest {
  id: string;
  name: string;
  description: string;
  duration: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  metrics: PerformanceMetric[];
  error?: string;
}

export function PerformanceMonitor() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [tests, setTests] = useState<PerformanceTest[]>([]);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<PerformanceObserver | null>(null);

  // Initialize performance tests
  useEffect(() => {
    initializeTests();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  const initializeTests = () => {
    const performanceTests: PerformanceTest[] = [
      {
        id: 'dashboard-load',
        name: 'Dashboard Load Time',
        description: 'Time to load permissions dashboard with full dataset',
        duration: 0,
        status: 'pending',
        metrics: []
      },
      {
        id: 'permission-change',
        name: 'Permission Change Response',
        description: 'Time to process and save a permission change',
        duration: 0,
        status: 'pending',
        metrics: []
      },
      {
        id: 'bulk-operations',
        name: 'Bulk Operations Performance',
        description: 'Time to process bulk permission changes (50+ items)',
        duration: 0,
        status: 'pending',
        metrics: []
      },
      {
        id: 'search-filter',
        name: 'Search and Filter Response',
        description: 'Time to filter large datasets with search terms',
        duration: 0,
        status: 'pending',
        metrics: []
      },
      {
        id: 'memory-usage',
        name: 'Memory Usage Test',
        description: 'Monitor memory consumption during extended usage',
        duration: 0,
        status: 'pending',
        metrics: []
      }
    ];

    setTests(performanceTests);
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    
    // Set up performance observer
    if ('PerformanceObserver' in window) {
      observerRef.current = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'measure' || entry.entryType === 'navigation') {
            addMetric({
              id: `perf-${Date.now()}`,
              name: entry.name,
              value: entry.duration || entry.responseStart || 0,
              unit: 'ms',
              threshold: 1000,
              status: (entry.duration || 0) > 1000 ? 'warning' : 'good',
              timestamp: Date.now()
            });
          }
        });
      });

      observerRef.current.observe({ 
        entryTypes: ['measure', 'navigation', 'resource'] 
      });
    }

    // Set up regular monitoring
    intervalRef.current = setInterval(() => {
      collectMetrics();
    }, 1000);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  };

  const collectMetrics = () => {
    const now = Date.now();
    
    // Memory metrics
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      addMetric({
        id: `memory-${now}`,
        name: 'Heap Used',
        value: Math.round(memory.usedJSHeapSize / 1024 / 1024 * 100) / 100,
        unit: 'MB',
        threshold: 100,
        status: memory.usedJSHeapSize / 1024 / 1024 > 100 ? 'warning' : 'good',
        timestamp: now
      });
    }

    // DOM metrics
    const domNodes = document.querySelectorAll('*').length;
    addMetric({
      id: `dom-${now}`,
      name: 'DOM Nodes',
      value: domNodes,
      unit: 'nodes',
      threshold: 1000,
      status: domNodes > 1000 ? 'warning' : 'good',
      timestamp: now
    });

    // React render time (simulated)
    const renderStart = performance.now();
    setTimeout(() => {
      const renderTime = performance.now() - renderStart;
      addMetric({
        id: `render-${now}`,
        name: 'Render Time',
        value: Math.round(renderTime * 100) / 100,
        unit: 'ms',
        threshold: 16.67, // 60fps
        status: renderTime > 16.67 ? 'warning' : 'good',
        timestamp: now
      });
    }, 0);
  };

  const addMetric = (metric: PerformanceMetric) => {
    setMetrics(prev => {
      const updated = [...prev, metric];
      // Keep only last 100 metrics
      return updated.slice(-100);
    });
  };

  const runPerformanceTest = async (testId: string) => {
    setCurrentTest(testId);
    
    // Update test status
    setTests(prev => prev.map(test => 
      test.id === testId 
        ? { ...test, status: 'running', metrics: [] }
        : test
    ));

    const startTime = performance.now();
    
    try {
      await executePerformanceTest(testId);
      const duration = performance.now() - startTime;
      
      setTests(prev => prev.map(test => 
        test.id === testId 
          ? { 
              ...test, 
              status: 'completed',
              duration: Math.round(duration * 100) / 100
            }
          : test
      ));
      
    } catch (error) {
      const duration = performance.now() - startTime;
      
      setTests(prev => prev.map(test => 
        test.id === testId 
          ? { 
              ...test, 
              status: 'failed',
              duration: Math.round(duration * 100) / 100,
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          : test
      ));
    } finally {
      setCurrentTest(null);
    }
  };

  const executePerformanceTest = async (testId: string): Promise<void> => {
    switch (testId) {
      case 'dashboard-load':
        return testDashboardLoad();
      case 'permission-change':
        return testPermissionChange();
      case 'bulk-operations':
        return testBulkOperations();
      case 'search-filter':
        return testSearchFilter();
      case 'memory-usage':
        return testMemoryUsage();
      default:
        throw new Error(`Unknown test: ${testId}`);
    }
  };

  const testDashboardLoad = async (): Promise<void> => {
    // Simulate dashboard load
    performance.mark('dashboard-load-start');
    
    // Simulate data fetching
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
    
    // Simulate rendering
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });
    
    performance.mark('dashboard-load-end');
    performance.measure('Dashboard Load', 'dashboard-load-start', 'dashboard-load-end');
    
    const loadTime = performance.getEntriesByName('Dashboard Load')[0].duration;
    
    setTests(prev => prev.map(test => 
      test.id === 'dashboard-load' 
        ? {
            ...test,
            metrics: [
              {
                id: 'load-time',
                name: 'Load Time',
                value: Math.round(loadTime * 100) / 100,
                unit: 'ms',
                threshold: 3000,
                status: loadTime > 3000 ? 'critical' : loadTime > 1500 ? 'warning' : 'good',
                timestamp: Date.now()
              }
            ]
          }
        : test
    ));
  };

  const testPermissionChange = async (): Promise<void> => {
    const iterations = 10;
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      
      // Simulate permission change
      await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100));
      
      const duration = performance.now() - start;
      times.push(duration);
    }
    
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const maxTime = Math.max(...times);
    
    setTests(prev => prev.map(test => 
      test.id === 'permission-change' 
        ? {
            ...test,
            metrics: [
              {
                id: 'avg-response',
                name: 'Average Response',
                value: Math.round(avgTime * 100) / 100,
                unit: 'ms',
                threshold: 1000,
                status: avgTime > 1000 ? 'critical' : avgTime > 500 ? 'warning' : 'good',
                timestamp: Date.now()
              },
              {
                id: 'max-response',
                name: 'Max Response',
                value: Math.round(maxTime * 100) / 100,
                unit: 'ms',
                threshold: 2000,
                status: maxTime > 2000 ? 'critical' : maxTime > 1000 ? 'warning' : 'good',
                timestamp: Date.now()
              }
            ]
          }
        : test
    ));
  };

  const testBulkOperations = async (): Promise<void> => {
    const itemCounts = [10, 25, 50, 100];
    const results: PerformanceMetric[] = [];
    
    for (const count of itemCounts) {
      const start = performance.now();
      
      // Simulate bulk operation
      await new Promise(resolve => setTimeout(resolve, count * 20 + Math.random() * 500));
      
      const duration = performance.now() - start;
      const throughput = count / (duration / 1000); // items per second
      
      results.push({
        id: `bulk-${count}`,
        name: `${count} Items`,
        value: Math.round(duration * 100) / 100,
        unit: 'ms',
        threshold: count * 50,
        status: duration > count * 50 ? 'warning' : 'good',
        timestamp: Date.now()
      });
      
      results.push({
        id: `throughput-${count}`,
        name: `Throughput (${count})`,
        value: Math.round(throughput * 100) / 100,
        unit: 'items/s',
        threshold: 10,
        status: throughput < 10 ? 'warning' : 'good',
        timestamp: Date.now()
      });
    }
    
    setTests(prev => prev.map(test => 
      test.id === 'bulk-operations' 
        ? { ...test, metrics: results }
        : test
    ));
  };

  const testSearchFilter = async (): Promise<void> => {
    const searchTerms = ['test', 'roi', 'financial', 'critical'];
    const times: number[] = [];
    
    for (const term of searchTerms) {
      const start = performance.now();
      
      // Simulate search operation
      await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 50));
      
      const duration = performance.now() - start;
      times.push(duration);
    }
    
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    
    setTests(prev => prev.map(test => 
      test.id === 'search-filter' 
        ? {
            ...test,
            metrics: [
              {
                id: 'search-avg',
                name: 'Average Search Time',
                value: Math.round(avgTime * 100) / 100,
                unit: 'ms',
                threshold: 500,
                status: avgTime > 500 ? 'warning' : 'good',
                timestamp: Date.now()
              }
            ]
          }
        : test
    ));
  };

  const testMemoryUsage = async (): Promise<void> => {
    if (!('memory' in performance)) {
      throw new Error('Memory API not available');
    }
    
    const initialMemory = (performance as any).memory.usedJSHeapSize;
    
    // Simulate memory intensive operations
    const data = [];
    for (let i = 0; i < 1000; i++) {
      data.push({
        id: i,
        permissions: new Array(100).fill(0).map(() => Math.random()),
        metadata: `test-data-${i}`.repeat(10)
      });
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const finalMemory = (performance as any).memory.usedJSHeapSize;
    const memoryUsed = (finalMemory - initialMemory) / 1024 / 1024;
    
    setTests(prev => prev.map(test => 
      test.id === 'memory-usage' 
        ? {
            ...test,
            metrics: [
              {
                id: 'memory-used',
                name: 'Memory Used',
                value: Math.round(memoryUsed * 100) / 100,
                unit: 'MB',
                threshold: 50,
                status: memoryUsed > 50 ? 'critical' : memoryUsed > 25 ? 'warning' : 'good',
                timestamp: Date.now()
              },
              {
                id: 'total-memory',
                name: 'Total Heap Used',
                value: Math.round(finalMemory / 1024 / 1024 * 100) / 100,
                unit: 'MB',
                threshold: 100,
                status: finalMemory / 1024 / 1024 > 100 ? 'warning' : 'good',
                timestamp: Date.now()
              }
            ]
          }
        : test
    ));
  };

  const runAllTests = async () => {
    for (const test of tests) {
      await runPerformanceTest(test.id);
      // Brief pause between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const exportResults = () => {
    const results = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      tests: tests,
      metrics: metrics,
      summary: {
        totalTests: tests.length,
        completedTests: tests.filter(t => t.status === 'completed').length,
        failedTests: tests.filter(t => t.status === 'failed').length,
        avgLoadTime: tests.find(t => t.id === 'dashboard-load')?.duration || 0
      }
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `performance-report-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-800 bg-green-50 border-green-200';
      case 'warning': return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'critical': return 'text-red-800 bg-red-50 border-red-200';
      default: return 'text-gray-800 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'critical': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Monitor className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTestStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'running': return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Monitor className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Performance Monitor</h1>
              <p className="text-gray-600">Real-time performance monitoring and testing for permissions system</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={exportResults}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Results
            </button>
            
            <button
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isMonitoring 
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isMonitoring ? (
                <>
                  <Square className="w-4 h-4" />
                  Stop Monitoring
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Monitoring
                </>
              )}
            </button>
          </div>
        </div>

        {/* Real-time Metrics */}
        {isMonitoring && metrics.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.slice(-4).map(metric => (
              <div key={metric.id} className={`p-3 rounded-lg border ${getStatusColor(metric.status)}`}>
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(metric.status)}
                  <span className="text-sm font-medium">{metric.name}</span>
                </div>
                <p className="text-xl font-bold">
                  {metric.value} <span className="text-sm font-normal">{metric.unit}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Performance Tests */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Performance Tests</h2>
              <p className="text-sm text-gray-600 mt-1">
                Comprehensive performance testing suite
              </p>
            </div>
            <button
              onClick={runAllTests}
              disabled={currentTest !== null}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Play className="w-4 h-4" />
              Run All Tests
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {tests.map(test => (
            <div key={test.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getTestStatusIcon(test.status)}
                  <div>
                    <h3 className="font-medium text-gray-900">{test.name}</h3>
                    <p className="text-sm text-gray-600">{test.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {test.duration > 0 && (
                    <span className="text-sm text-gray-500">
                      {test.duration}ms
                    </span>
                  )}
                  <button
                    onClick={() => runPerformanceTest(test.id)}
                    disabled={currentTest === test.id}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {currentTest === test.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      'Run Test'
                    )}
                  </button>
                </div>
              </div>

              {test.error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Error:</strong> {test.error}
                  </p>
                </div>
              )}

              {test.metrics.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {test.metrics.map(metric => (
                    <div 
                      key={metric.id}
                      className={`p-3 rounded border ${getStatusColor(metric.status)}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metric.name}</span>
                        {getStatusIcon(metric.status)}
                      </div>
                      <p className="text-lg font-bold mt-1">
                        {metric.value} {metric.unit}
                      </p>
                      <p className="text-xs opacity-75">
                        Threshold: {metric.threshold} {metric.unit}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Performance History */}
      {metrics.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Performance History
          </h2>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {metrics.slice().reverse().map(metric => (
              <div 
                key={metric.id}
                className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded text-sm"
              >
                <div className="flex items-center gap-2">
                  {getStatusIcon(metric.status)}
                  <span>{metric.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">
                    {metric.value} {metric.unit}
                  </span>
                  <span className="text-gray-500">
                    {new Date(metric.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}