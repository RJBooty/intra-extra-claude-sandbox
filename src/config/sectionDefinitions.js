// src/config/sectionDefinitions.js
import { 
  FolderOpen, 
  Building2, 
  Settings, 
  Calendar, 
  CreditCard, 
  RefreshCw, 
  Truck, 
  BarChart3, 
  Link2, 
  DollarSign,
  Users,
  CheckSquare,
  AlertTriangle,
  TrendingUp,
  Package,
  MapPin
} from 'lucide-react';

/**
 * Default section definitions for ProjectCoreInfo page
 */
export const projectCoreInfoSections = [
  { 
    id: 'project-info', 
    title: 'Project Information', 
    icon: FolderOpen, 
    gridColumn: 1, 
    gridRow: 1, 
    gridColumnSpan: 8, 
    gridRowSpan: 5, 
    type: 'project-info',
    requiresPermission: false,
    fields: [
      { id: 'f1', type: 'text', label: 'Project ID', readonly: true },
      { id: 'f2', type: 'text', label: 'Event Name', readonly: false },
      { id: 'f3', type: 'dropdown', label: 'Project Type', options: ['Full Service', 'Equipment Only', 'Consulting'], readonly: false },
      { id: 'f4', type: 'dropdown', label: 'Status', options: ['Active', 'Planning', 'Complete', 'On Hold'], readonly: false }
    ]
  },
  { 
    id: 'client-info', 
    title: 'Client Information', 
    icon: Building2, 
    gridColumn: 10, 
    gridRow: 1, 
    gridColumnSpan: 8, 
    gridRowSpan: 5, 
    type: 'client-info',
    requiresPermission: false,
    fields: [
      { id: 'c1', type: 'text', label: 'Primary Contact', readonly: false },
      { id: 'c2', type: 'text', label: 'Email', readonly: false },
      { id: 'c3', type: 'text', label: 'Phone', readonly: false },
      { id: 'c4', type: 'address', label: 'Venue Location', readonly: false }
    ]
  },
  { 
    id: 'back-office', 
    title: 'Back-Office Connections', 
    icon: Link2, 
    gridColumn: 19, 
    gridRow: 1, 
    gridColumnSpan: 6, 
    gridRowSpan: 5, 
    type: 'back-office',
    requiresPermission: false,
    fields: [
      { id: 'b1', type: 'url', label: 'SharePoint Folder', readonly: false },
      { id: 'b2', type: 'url', label: 'Jira Project', readonly: false },
      { id: 'b3', type: 'url', label: 'JUE Dashboard', readonly: false }
    ]
  },
  { 
    id: 'config-settings', 
    title: 'Configuration Settings', 
    icon: Settings, 
    gridColumn: 26, 
    gridRow: 1, 
    gridColumnSpan: 6, 
    gridRowSpan: 5, 
    type: 'config-settings',
    requiresPermission: false,
    fields: [
      { id: 'cfg1', type: 'dropdown', label: 'RFID Type', options: ['NFC', 'UHF', 'LF'], readonly: false },
      { id: 'cfg2', type: 'dropdown', label: 'Currency', options: ['GBP', 'EUR', 'USD'], readonly: false },
      { id: 'cfg3', type: 'number', label: 'Top-up Limit', readonly: false }
    ]
  },
  { 
    id: 'cashless-info', 
    title: 'Cashless Information', 
    icon: CreditCard, 
    gridColumn: 1, 
    gridRow: 7, 
    gridColumnSpan: 8, 
    gridRowSpan: 5, 
    type: 'cashless-info',
    requiresPermission: false,
    fields: [
      { id: 'cash1', type: 'dropdown', label: 'Cashless Enabled', options: ['Yes', 'No'], readonly: false },
      { id: 'cash2', type: 'number', label: 'Top-up Points', readonly: false }
    ]
  },
  { 
    id: 'refund-info', 
    title: 'Refund Information', 
    icon: RefreshCw, 
    gridColumn: 10, 
    gridRow: 7, 
    gridColumnSpan: 8, 
    gridRowSpan: 5, 
    type: 'refund-info',
    requiresPermission: false,
    fields: [
      { id: 'ref1', type: 'number', label: 'Refund Window (days)', readonly: false },
      { id: 'ref2', type: 'dropdown', label: 'Refund Method', options: ['Original Payment', 'Bank Transfer', 'Cash'], readonly: false }
    ]
  },
  { 
    id: 'key-dates', 
    title: 'Key Dates', 
    icon: Calendar, 
    gridColumn: 19, 
    gridRow: 7, 
    gridColumnSpan: 6, 
    gridRowSpan: 5, 
    type: 'key-dates',
    requiresPermission: false,
    fields: [
      { id: 'd1', type: 'date', label: 'Event Start', readonly: false },
      { id: 'd2', type: 'date', label: 'Event End', readonly: false },
      { id: 'd3', type: 'date', label: 'Build Start', readonly: false },
      { id: 'd4', type: 'date', label: 'Delivery Deadline', readonly: false }
    ]
  },
  { 
    id: 'summary', 
    title: 'Summary Overview', 
    icon: BarChart3, 
    gridColumn: 26, 
    gridRow: 7, 
    gridColumnSpan: 6, 
    gridRowSpan: 5, 
    type: 'summary',
    requiresPermission: false,
    fields: [
      { id: 's1', type: 'number', label: 'Devices', readonly: false },
      { id: 's2', type: 'number', label: 'Readers', readonly: false },
      { id: 's3', type: 'number', label: 'Capacity', readonly: false },
      { id: 's4', type: 'number', label: 'Top-ups', readonly: false }
    ]
  },
  { 
    id: 'delivery-deadlines', 
    title: 'Delivery & Deadlines', 
    icon: Truck, 
    gridColumn: 1, 
    gridRow: 13, 
    gridColumnSpan: 8, 
    gridRowSpan: 5, 
    type: 'delivery-deadlines',
    requiresPermission: false,
    fields: [
      { id: 'del1', type: 'date', label: 'Equipment Delivery', readonly: false },
      { id: 'del2', type: 'date', label: 'Setup Complete', readonly: false },
      { id: 'del3', type: 'date', label: 'On-Site Arrival', readonly: false }
    ]
  },
  { 
    id: 'fees-overview', 
    title: 'Fees Overview', 
    icon: DollarSign, 
    gridColumn: 10, 
    gridRow: 13, 
    gridColumnSpan: 8, 
    gridRowSpan: 5, 
    type: 'fees-overview',
    requiresPermission: true,
    permissionType: 'financial',
    allowedRoles: ['Master', 'Senior', 'HR_Finance'],
    fields: [
      { id: 'fee1', type: 'number', label: 'Base Fee', readonly: false },
      { id: 'fee2', type: 'number', label: 'Device Fee', readonly: false },
      { id: 'fee3', type: 'number', label: 'Service Fee', readonly: false },
      { id: 'fee4', type: 'number', label: 'Total Value', readonly: true }
    ]
  }
];

/**
 * Default section definitions for Operations Pipeline page (example)
 */
export const operationsPipelineSections = [
  {
    id: 'phase-tracker',
    title: 'Phase Tracker',
    icon: CheckSquare,
    gridColumn: 1,
    gridRow: 1,
    gridColumnSpan: 12,
    gridRowSpan: 4,
    type: 'phase-tracker',
    requiresPermission: false
  },
  {
    id: 'critical-tasks',
    title: 'Critical Tasks',
    icon: AlertTriangle,
    gridColumn: 14,
    gridRow: 1,
    gridColumnSpan: 10,
    gridRowSpan: 6,
    type: 'critical-tasks',
    requiresPermission: false
  },
  {
    id: 'resource-allocation',
    title: 'Resource Allocation',
    icon: Users,
    gridColumn: 25,
    gridRow: 1,
    gridColumnSpan: 8,
    gridRowSpan: 6,
    type: 'resource-allocation',
    requiresPermission: false
  },
  {
    id: 'timeline',
    title: 'Project Timeline',
    icon: Calendar,
    gridColumn: 1,
    gridRow: 6,
    gridColumnSpan: 12,
    gridRowSpan: 5,
    type: 'timeline',
    requiresPermission: false
  }
];

/**
 * Default section definitions for Crew Management page (example)
 */
export const crewManagementSections = [
  {
    id: 'crew-roster',
    title: 'Crew Roster',
    icon: Users,
    gridColumn: 1,
    gridRow: 1,
    gridColumnSpan: 15,
    gridRowSpan: 8,
    type: 'crew-roster',
    requiresPermission: false
  },
  {
    id: 'crew-costs',
    title: 'Crew Costs',
    icon: DollarSign,
    gridColumn: 17,
    gridRow: 1,
    gridColumnSpan: 8,
    gridRowSpan: 4,
    type: 'crew-costs',
    requiresPermission: true,
    permissionType: 'financial',
    allowedRoles: ['Master', 'Senior', 'HR_Finance']
  },
  {
    id: 'availability',
    title: 'Availability Calendar',
    icon: Calendar,
    gridColumn: 17,
    gridRow: 6,
    gridColumnSpan: 8,
    gridRowSpan: 4,
    type: 'availability',
    requiresPermission: false
  }
];

/**
 * Default section definitions for ROI Analysis page (example)
 */
export const roiAnalysisSections = [
  {
    id: 'revenue-streams',
    title: 'Revenue Streams',
    icon: TrendingUp,
    gridColumn: 1,
    gridRow: 1,
    gridColumnSpan: 10,
    gridRowSpan: 6,
    type: 'revenue-streams',
    requiresPermission: true,
    permissionType: 'financial',
    allowedRoles: ['Master', 'Senior', 'HR_Finance']
  },
  {
    id: 'cost-breakdown',
    title: 'Cost Breakdown',
    icon: DollarSign,
    gridColumn: 12,
    gridRow: 1,
    gridColumnSpan: 10,
    gridRowSpan: 6,
    type: 'cost-breakdown',
    requiresPermission: true,
    permissionType: 'financial',
    allowedRoles: ['Master', 'Senior', 'HR_Finance']
  },
  {
    id: 'profitability',
    title: 'Profitability Analysis',
    icon: BarChart3,
    gridColumn: 23,
    gridRow: 1,
    gridColumnSpan: 10,
    gridRowSpan: 6,
    type: 'profitability',
    requiresPermission: true,
    permissionType: 'financial',
    allowedRoles: ['Master', 'Senior', 'HR_Finance']
  }
];

/**
 * Default section definitions for Logistics page (example)
 */
export const logisticsSections = [
  {
    id: 'equipment-requests',
    title: 'Equipment Requests',
    icon: Package,
    gridColumn: 1,
    gridRow: 1,
    gridColumnSpan: 12,
    gridRowSpan: 5,
    type: 'equipment-requests',
    requiresPermission: false
  },
  {
    id: 'site-map',
    title: 'Site Map',
    icon: MapPin,
    gridColumn: 14,
    gridRow: 1,
    gridColumnSpan: 12,
    gridRowSpan: 8,
    type: 'site-map',
    requiresPermission: false
  },
  {
    id: 'shipping-schedule',
    title: 'Shipping Schedule',
    icon: Truck,
    gridColumn: 1,
    gridRow: 7,
    gridColumnSpan: 12,
    gridRowSpan: 5,
    type: 'shipping-schedule',
    requiresPermission: false
  }
];

/**
 * Icon color mappings for all pages
 */
export const iconColorMaps = {
  projectCoreInfo: {
    'project-info': 'text-blue-600',
    'key-dates': 'text-orange-600',
    'client-info': 'text-green-600',
    'summary': 'text-violet-600',
    'config-settings': 'text-indigo-600',
    'fees-overview': 'text-emerald-600',
    'delivery-deadlines': 'text-amber-600',
    'back-office': 'text-pink-600',
    'cashless-info': 'text-cyan-600',
    'refund-info': 'text-teal-600'
  },
  operationsPipeline: {
    'phase-tracker': 'text-blue-600',
    'critical-tasks': 'text-red-600',
    'resource-allocation': 'text-green-600',
    'timeline': 'text-purple-600'
  },
  crewManagement: {
    'crew-roster': 'text-blue-600',
    'crew-costs': 'text-emerald-600',
    'availability': 'text-orange-600'
  },
  roiAnalysis: {
    'revenue-streams': 'text-green-600',
    'cost-breakdown': 'text-red-600',
    'profitability': 'text-blue-600'
  },
  logistics: {
    'equipment-requests': 'text-amber-600',
    'site-map': 'text-green-600',
    'shipping-schedule': 'text-blue-600'
  }
};

/**
 * Get sections for a specific page
 */
export const getSectionsForPage = (pageId) => {
  const sectionMap = {
    'project-core-info': projectCoreInfoSections,
    'operations-pipeline': operationsPipelineSections,
    'crew-management': crewManagementSections,
    'roi-analysis': roiAnalysisSections,
    'logistics': logisticsSections
  };
  
  return sectionMap[pageId] || [];
};

/**
 * Get icon color map for a specific page
 */
export const getIconColorMapForPage = (pageId) => {
  const pageMap = {
    'project-core-info': iconColorMaps.projectCoreInfo,
    'operations-pipeline': iconColorMaps.operationsPipeline,
    'crew-management': iconColorMaps.crewManagement,
    'roi-analysis': iconColorMaps.roiAnalysis,
    'logistics': iconColorMaps.logistics
  };
  
  return pageMap[pageId] || {};
};