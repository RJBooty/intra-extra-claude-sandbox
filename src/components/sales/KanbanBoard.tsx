import React from 'react';
import { Opportunity, OpportunityStage } from '../../types';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  opportunities: Opportunity[];
  onOpportunitySelect: (opportunity: Opportunity) => void;
  onOpportunityUpdate: (opportunity: Opportunity) => void;
}

const stages: { id: OpportunityStage; title: string; color: string }[] = [
  { id: 'Contacted', title: 'Contacted', color: 'bg-gray-100' },
  { id: 'Qualified', title: 'Qualified', color: 'bg-blue-100' },
  { id: 'First Meet Scheduled', title: '1st Meet', color: 'bg-yellow-100' },
  { id: 'Proposal Sent', title: 'Proposal', color: 'bg-orange-100' },
  { id: 'Negotiations', title: 'Negotiations', color: 'bg-purple-100' },
  { id: 'Contract Signature', title: 'Contract', color: 'bg-green-100' },
  { id: 'Kickoff', title: 'Kickoff', color: 'bg-emerald-100' },
  { id: 'Operations', title: 'Operations', color: 'bg-teal-100' }
];

export function KanbanBoard({ opportunities, onOpportunitySelect, onOpportunityUpdate }: KanbanBoardProps) {
  const getOpportunitiesByStage = (stage: OpportunityStage) => {
    return opportunities.filter(opp => opp.stage === stage);
  };

  return (
    <div className="flex gap-2 p-4 h-full overflow-x-auto">
      {stages.map(stage => (
        <div key={stage.id} className="flex-1 min-w-0">
          <KanbanColumn
            stage={stage}
            opportunities={getOpportunitiesByStage(stage.id)}
            onOpportunitySelect={onOpportunitySelect}
            onOpportunityUpdate={onOpportunityUpdate}
          />
        </div>
      ))}
    </div>
  );
}