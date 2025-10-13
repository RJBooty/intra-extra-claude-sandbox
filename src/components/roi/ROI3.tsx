import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Edit, 
  Plus, 
  GripVertical,
  Search,
  X as Close,
  AlertCircle as Warning,
  Lightbulb,
  Check as Done,
  MoreVertical as Menu,
  Megaphone as Campaign,
  Info,
  Receipt,
  ShoppingCart,
  Shield,
  CreditCard,
  Cable,
  BarChart3,
  Store,
  Cpu,
  CheckCircle,
  DollarSign,
  Package,
  Users,
  Wrench,
  Code,
  Grid3x3,
  Upload,
  PieChart,
  CircleDot,
  Activity,
  Truck,
  Tag,
  ChevronDown,
  ChevronUp,
  Trash2,
  Lock,
  EyeOff
} from 'lucide-react';

import { Project } from '../../types';
import { CompareTab } from './CompareTab';
import CostBuilder from './CostBuilder';
import RevenueBuilder from './RevenueBuilder';
import { ScenariosTab } from './ScenariosTab';
import { OverviewTab } from './OverviewTab';
import { ProtectedPage } from '../permissions/ProtectedPage';
import { ProtectedField } from '../permissions/ProtectedField';
import toast from 'react-hot-toast';
import { useROIService, ROICalculation } from '../../lib/services/roiService';

interface ROI3Props {
  project?: Project;
}

type ROITab = 'overview' | 'revenue' | 'costs' | 'compare' | 'scenarios';

// Custom fallback component for ROI access restriction
const ROIAccessRestricted = () => (
  <div className="flex items-center justify-center min-h-96 p-8">
    <div className="flex flex-col items-center gap-6 text-center max-w-lg">
      <div className="p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-full">
        <div className="p-4 bg-white rounded-full shadow-lg">
          <Lock className="w-12 h-12 text-red-600" />
        </div>
      </div>
      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-gray-900">
          Financial Data Access Restricted
        </h2>
        <p className="text-gray-600 text-lg">
          ROI and financial information requires elevated permissions to access.
        </p>
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 text-left">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 mb-1">
                Access Requirements:
              </p>
              <ul className="text-amber-700 space-y-1">
                <li>• Master or Senior role required</li>
                <li>• HR Finance role for read-only access</li>
                <li>• Contact your administrator for access</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <EyeOff className="w-4 h-4" />
        <span>This restriction protects sensitive financial data</span>
      </div>
    </div>
  </div>
);

export function ROI3({ project }: ROI3Props) {
  const [activeTab, setActiveTab] = useState<ROITab>('overview');

  // ROI data state
  const [roiCalculation, setRoiCalculation] = useState<ROICalculation | null>(null);
  const [isLoadingROI, setIsLoadingROI] = useState(false);

  // Refs for builders to check unsaved changes before navigation
  const revenueBuilderRef = useRef<{ checkBeforeNavigate: () => Promise<boolean> }>(null);
  const costBuilderRef = useRef<{ checkBeforeNavigate: () => Promise<boolean> }>(null);

  // ROI service
  const { getOrCreateROI } = useROIService();

  // Load ROI data when project is available
  useEffect(() => {
    const loadROIData = async () => {
      if (!project?.id) return;

      setIsLoadingROI(true);
      try {
        const roiData = await getOrCreateROI(project.id);
        setRoiCalculation(roiData);
      } catch (error) {
        console.error('Failed to load ROI data:', error);
      } finally {
        setIsLoadingROI(false);
      }
    };

    loadROIData();
  }, [project?.id]);

  // Refresh ROI data (called after save operations)
  const refreshROIData = async () => {
    if (!project?.id) return;

    console.log('🔄 Refreshing ROI data...');
    try {
      const roiData = await getOrCreateROI(project.id);
      setRoiCalculation(roiData);
      console.log('✅ ROI data refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh ROI data:', error);
    }
  };

  // Handle tab change with unsaved changes check
  const handleTabChange = async (newTab: ROITab) => {
    // If already on the target tab, do nothing
    if (newTab === activeTab) return;

    // Check if we're navigating away from revenue or costs with unsaved changes
    let canNavigate = true;

    if (activeTab === 'revenue' && revenueBuilderRef.current) {
      canNavigate = await revenueBuilderRef.current.checkBeforeNavigate();
    } else if (activeTab === 'costs' && costBuilderRef.current) {
      canNavigate = await costBuilderRef.current.checkBeforeNavigate();
    }

    // Only change tab if navigation is allowed
    if (canNavigate) {
      setActiveTab(newTab);
    }
  };

  const tabs = [
    { id: 'overview' as ROITab, label: 'Overview', icon: Calculator },
    { id: 'revenue' as ROITab, label: 'Revenue', icon: TrendingUp },
    { id: 'costs' as ROITab, label: 'Costs', icon: TrendingDown },
    { id: 'compare' as ROITab, label: 'Compare', icon: Edit },
    { id: 'scenarios' as ROITab, label: 'Scenarios', icon: Plus },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab roiCalculation={roiCalculation} isLoadingROI={isLoadingROI} />;
      case 'revenue':
        return <RevenueBuilder ref={revenueBuilderRef} roiCalculationId={roiCalculation?.id} roiCalculation={roiCalculation} onDataSaved={refreshROIData} />;
      case 'costs':
        return <CostBuilder ref={costBuilderRef} roiCalculationId={roiCalculation?.id} roiCalculation={roiCalculation} onDataSaved={refreshROIData} />;
      case 'compare':
        return <CompareTab />;
      case 'scenarios':
        return <ScenariosTab roiCalculationId={roiCalculation?.id} />;
      default:
        return <OverviewTab roiCalculation={roiCalculation} isLoadingROI={isLoadingROI} />;
    }
  };

  return (
    <ProtectedPage
      pageName="projects-roi"
      fallback={<ROIAccessRestricted />}
      showLoadingOverlay={true}
      className="flex h-full flex-col bg-slate-50"
    >
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
        <nav className="-mb-px flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-4 px-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </div>
              </button>
            );
          })}
        </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          {renderTabContent()}
        </div>
      </div>
    </ProtectedPage>
  );
}
