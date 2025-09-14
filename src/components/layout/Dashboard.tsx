import React from 'react';
import { SimpleDashboard } from './SimpleDashboard';


interface DashboardProps {
  onNavigate: (section: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  console.log('Dashboard: Component rendered');
  
  // Dashboard should only show the SimpleDashboard
  // All navigation should be handled by the parent App component
  return <SimpleDashboard onNavigate={onNavigate} />;
}