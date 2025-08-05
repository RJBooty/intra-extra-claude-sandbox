import React, { useState, useEffect } from 'react';
import { KanbanBoard } from './KanbanBoard';
import { OpportunityList } from './OpportunityList';
import { OpportunityForm } from './OpportunityForm';
import { OpportunityDetails } from './OpportunityDetails';
import { PipelineMetrics } from './PipelineMetrics';
import { Opportunity, OpportunityStage } from '../../types';
import { getOpportunities, getPipelineMetrics } from '../../lib/supabase';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { Plus, BarChart3 } from 'lucide-react';

type ViewMode = 'kanban' | 'list';

export function SalesPipeline() {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<OpportunityStage | 'all'>('all');

  useEffect(() => {
    loadOpportunities();
  }, [stageFilter]);

  const loadOpportunities = async () => {
    try {
      setIsLoading(true);
      console.log('💼 SalesPipeline: Loading opportunities from database...');
      console.log('🔍 Stage filter:', stageFilter);
      const filters = stageFilter !== 'all' ? { stage: stageFilter } : undefined;
      console.log('🎯 Filters applied:', filters);
      const data = await getOpportunities(filters);
      console.log('✅ SalesPipeline: Successfully loaded', data?.length || 0, 'opportunities');
      setOpportunities(data || []);
    } catch (error) {
      console.error('❌ SalesPipeline: Error loading opportunities:', error);
      if (error instanceof Error) {
        console.error('📝 Error details:', error.message);
      }
      toast.error('Failed to load opportunities');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpportunityCreated = (opportunity: Opportunity) => {
    setOpportunities(prev => [opportunity, ...prev]);
    setShowForm(false);
    toast.success('Opportunity created successfully!');
  };

  const handleOpportunityUpdated = (updatedOpportunity: Opportunity) => {
    setOpportunities(prev => 
      prev.map(opp => opp.id === updatedOpportunity.id ? updatedOpportunity : opp)
    );
    if (selectedOpportunity?.id === updatedOpportunity.id) {
      setSelectedOpportunity(updatedOpportunity);
    }
  };

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = searchQuery === '' || 
      opp.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.event_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const stages: OpportunityStage[] = [
    'Contacted',
    'Qualified', 
    'First Meet Scheduled',
    'Proposal Sent',
    'Negotiations',
    'Contract Signature',
    'Kickoff',
    'Operations'
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-wrap justify-between gap-3 p-4 border-b border-[#eaedf1]">
          <div className="flex min-w-72 flex-col gap-3">
            <h1 className="text-[#101418] tracking-light text-[32px] font-bold leading-tight">
              Pipeline
            </h1>
            <p className="text-[#5c728a] text-sm font-normal leading-normal">
              Manage your sales opportunities from initial contact to project kickoff.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowMetrics(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              Metrics
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Opportunity
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between p-4 border-b border-[#eaedf1]">
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex border border-[#d4dbe2] rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Kanban View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                List View
              </button>
            </div>

            {/* Stage Filter */}
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value as OpportunityStage | 'all')}
              className="px-3 py-2 border border-[#d4dbe2] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Stages</option>
              {stages.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search opportunities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 border border-[#d4dbe2] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'kanban' ? (
            <KanbanBoard
              opportunities={filteredOpportunities}
              onOpportunitySelect={setSelectedOpportunity}
              onOpportunityUpdate={handleOpportunityUpdated}
            />
          ) : (
            <OpportunityList
              opportunities={filteredOpportunities}
              onOpportunitySelect={setSelectedOpportunity}
              onOpportunityUpdate={handleOpportunityUpdated}
            />
          )}
        </div>
      </div>

      {/* Sidebar */}
      {selectedOpportunity && (
        <div className="w-96 border-l border-[#eaedf1] bg-white">
          <OpportunityDetails
            opportunity={selectedOpportunity}
            onClose={() => setSelectedOpportunity(null)}
            onUpdate={handleOpportunityUpdated}
          />
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <OpportunityForm
          onClose={() => setShowForm(false)}
          onSubmit={handleOpportunityCreated}
        />
      )}

      {showMetrics && (
        <PipelineMetrics
          onClose={() => setShowMetrics(false)}
        />
      )}
    </div>
  );
}