import React, { useState, useEffect } from 'react';
import { X, TrendingUp, DollarSign, Target, Users } from 'lucide-react';
import { PipelineMetrics as PipelineMetricsType } from '../../types';
import { getPipelineMetrics } from '../../lib/supabase';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface PipelineMetricsProps {
  onClose: () => void;
}

export function PipelineMetrics({ onClose }: PipelineMetricsProps) {
  const [metrics, setMetrics] = useState<PipelineMetricsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const data = await getPipelineMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Pipeline Metrics</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Total Opportunities</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{metrics.total_opportunities}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Total Value</span>
              </div>
              <p className="text-2xl font-bold text-green-900">${metrics.total_value.toLocaleString()}</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Conversion Rate</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{(metrics.conversion_rate * 100).toFixed(1)}%</p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Avg Deal Size</span>
              </div>
              <p className="text-2xl font-bold text-orange-900">${metrics.average_deal_size.toLocaleString()}</p>
            </div>
          </div>

          {/* Stage Distribution */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stage Distribution</h3>
            <div className="space-y-3">
              {Object.entries(metrics.stage_distribution).map(([stage, count]) => {
                const percentage = metrics.total_opportunities > 0 
                  ? (count / metrics.total_opportunities) * 100 
                  : 0;
                
                return (
                  <div key={stage} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-gray-700">{stage}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-16 text-sm text-gray-600 text-right">
                      {count} ({percentage.toFixed(1)}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Temperature Distribution */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Temperature Distribution</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(metrics.temperature_distribution).map(([temperature, count]) => {
                const percentage = metrics.total_opportunities > 0 
                  ? (count / metrics.total_opportunities) * 100 
                  : 0;
                
                const colorClass = {
                  'Hot': 'bg-red-100 border-red-200 text-red-900',
                  'Warm': 'bg-orange-100 border-orange-200 text-orange-900',
                  'Cold': 'bg-blue-100 border-blue-200 text-blue-900'
                }[temperature] || 'bg-gray-100 border-gray-200 text-gray-900';

                return (
                  <div key={temperature} className={`p-4 rounded-lg border ${colorClass}`}>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-sm font-medium">{temperature}</p>
                      <p className="text-xs opacity-75">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}