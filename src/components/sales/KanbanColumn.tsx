import React from 'react';
import { Opportunity, OpportunityStage } from '../../types';
import { OpportunityCard } from './OpportunityCard';
import { moveOpportunityStage } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface KanbanColumnProps {
  stage: { id: OpportunityStage; title: string; color: string };
  opportunities: Opportunity[];
  onOpportunitySelect: (opportunity: Opportunity) => void;
  onOpportunityUpdate: (opportunity: Opportunity) => void;
}

export function KanbanColumn({ stage, opportunities, onOpportunitySelect, onOpportunityUpdate }: KanbanColumnProps) {
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const opportunityId = e.dataTransfer.getData('text/plain');
    const opportunity = opportunities.find(opp => opp.id === opportunityId);
    
    if (!opportunity || opportunity.stage === stage.id) return;

    try {
      const updatedOpportunity = await moveOpportunityStage(opportunityId, stage.id);
      onOpportunityUpdate({ ...opportunity, ...updatedOpportunity });
      toast.success(`Moved to ${stage.title}`);
    } catch (error) {
      console.error('Error moving opportunity:', error);
      toast.error('Failed to move opportunity');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const totalValue = opportunities.reduce((sum, opp) => sum + opp.deal_value, 0);

  return (
    <div
      className={`flex flex-col w-80 ${stage.color} rounded-lg p-3 h-full`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">{stage.title}</h3>
          <p className="text-sm text-gray-600">
            {opportunities.length} deals • €{totalValue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {opportunities.map(opportunity => (
          <OpportunityCard
            key={opportunity.id}
            opportunity={opportunity}
            onClick={() => onOpportunitySelect(opportunity)}
          />
        ))}
        
        {opportunities.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-8">
            No opportunities in this stage
          </div>
        )}
      </div>
    </div>
  );
}