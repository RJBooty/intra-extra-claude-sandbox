# CLAUDE.md - IntraExtra Platform Development Guide

## Project Overview
IntraExtra is a comprehensive project management and CRM platform for CASFID International, an event technology company specializing in RFID access control, cashless payments, and ticketing systems for large-scale events.

## Repository Structure
intraextra/ ├── src/ │ ├── components/ │ │ ├── auth/ # Authentication components │ │ ├── client/ # Client management │ │ ├── crew/ # Crew management │ │ ├── guards/ # Critical escalation │ │ ├── logistics/ # Logistics planning │ │ ├── operations/ # Operations pipeline │ │ ├── project/ # Project management │ │ ├── roi/ # ROI analysis │ │ ├── sales/ # Sales pipeline │ │ └── team/ # Team/contractor profiles │ ├── lib/ # Utilities and helpers │ ├── hooks/ # Custom React hooks │ └── types/ # TypeScript definitions ├── public/ └── supabase/ # Database schemas
## Key Technical Details

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **State Management**: React Context + Custom Hooks
- **Routing**: React Router v6
- **UI Components**: Custom components built with Stitch
- **Charts**: Recharts for data visualization

### Database Architecture
- PostgreSQL with foreign key relationships
- ROI module serves as financial "source of truth"
- When ROI is locked, estimates flow to other modules
- Actuals from other modules flow back to ROI

### Access Control System
5-tier permission system (Master/Senior/Mid/External/HR_Finance):
- Permissions matrix with 312 permission points
- Check `intraextra_permissions_matrix_complete.csv` for details
- All actions must validate against user permissions

## Development Guidelines

### Component Structure
```typescript
// Standard component template
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface ComponentProps {
  projectId: string;
}

export function ComponentName({ projectId }: ComponentProps) {
  const { hasAccess } = usePermissions('module', 'action');
  
  if (!hasAccess) return null;
  
  // Component logic
}
Data Flow Patterns
ROI as Source of Truth
// When ROI is locked
onROILock(projectId) {
  // Push estimates to other modules
  pushToCrewManagement(roiData.crewEstimates);
  pushToLogistics(roiData.equipmentEstimates);
  
  // Enable actual data collection
  enableActualDataEntry(projectId);
}

// When actuals are entered
onCrewActualUpdate(crewData) {
  // Update ROI actuals
  updateROIActuals({
    category: 'crew',
    actual: crewData.totalCost
  });
}
Module Integration Points
1. Project Creation Flow
Sales Pipeline → Contract Signed → Create Project → Initialize ROI
2. Financial Data Flow
ROI Estimates (locked) → Crew/Logistics/Operations → ROI Actuals
3. Resource Allocation
ROI Requirements → Operations Tasks → Crew Assignment → Logistics Planning
Common Tasks
Adding a New Field
	1	Update database schema in /supabase/migrations/
	2	Add to TypeScript types in /src/types/
	3	Update relevant component UI
	4	Add to permissions matrix if needed
	5	Update Platform Configuration settings
Creating a New Module Tab
// In ProjectView.tsx
const tabs = [
  { id: 'core', label: 'Core Info', component: CoreInfo },
  { id: 'roi', label: 'ROI', component: ROI3 },
  // Add new tab here
  { id: 'newModule', label: 'New Module', component: NewModule }
];
Implementing Permissions
// Check permission before action
const canEdit = await checkPermission(userId, 'module', 'action', 'Edit');

// In UI, conditionally render
{canEdit && <EditButton onClick={handleEdit} />}
Key Business Rules
ROI Locking
	•	Only Master/Senior can lock ROI
	•	Once locked, estimates cannot be edited
	•	Actuals can only be entered after locking
	•	All financial data must trace back to ROI
Project Phases
	1	Discover: Requirements gathering
	2	Build: Technical planning
	3	Prepare: Equipment & crew prep
	4	Deliver: Live event execution
	5	Roundup: Post-event closure
Client Tiers
	•	Seed: First-time/small events
	•	Sapling: Growing operations
	•	Canopy: Established medium-sized
	•	Jungle: Large-scale complex
	•	Rainforest: Enterprise-level
External Integrations
Microsoft Graph API
	•	Teams channel creation
	•	SharePoint document storage
	•	Outlook calendar sync
Jira/JUE
	•	Equipment work orders
	•	Incident tickets
	•	Resource allocation
QuickBooks
	•	Invoice generation from ROI actuals
	•	Financial reporting
Testing Approach
Permission Testing
// Test each user tier
testUserAccess('Master', 'roi', 'edit'); // Should pass
testUserAccess('External', 'roi', 'view'); // Should fail
Data Flow Testing
	1	Create project with estimates
	2	Lock ROI
	3	Enter actuals in other modules
	4	Verify ROI updates correctly
Common Issues & Solutions
Issue: Data not syncing between modules
Solution: Check ROI lock status and foreign key relationships
Issue: Permission denied errors
Solution: Verify user role and check permissions matrix
Issue: Financial calculations incorrect
Solution: Ensure all costs route through ROI actual fields
Development Workflow
	1	Before starting: Review permissions matrix for module
	2	During development: Test with different user roles
	3	Before commit: Ensure data flows to/from ROI correctly
	4	After deployment: Verify Platform Configuration updates
Support & Documentation
	•	Project overview: See this file's Project Overview section
	•	Permissions: intraextra_permissions_matrix_complete.csv
	•	UI designs: Original Stitch components in respective folders
	•	Business logic: ROI module is source of truth for all financial data
Contact
	•	Platform Owner: James Tyson (tyson@casfid.com)
	•	Master Access Required for: User approval, system config, data deletion


