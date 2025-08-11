import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Edit, 
  Plus, 
  DragIndicator,
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
  DonutChart,
  LineChart,
  Truck,
  Tag
} from 'lucide-react';
import { Project } from '../../types';
import toast from 'react-hot-toast';

interface ROI3Props {
  project?: Project;
}

type ROITab = 'overview' | 'revenue' | 'costs' | 'compare' | 'scenarios';

export function ROI3({ project }: ROI3Props) {
  const [activeTab, setActiveTab] = useState<ROITab>('overview');
  const [showPreviousYears, setShowPreviousYears] = useState(true);
  const [showSearchContainer, setShowSearchContainer] = useState(false);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [currentTourStep, setCurrentTourStep] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const [draggedColumn, setDraggedColumn] = useState<number | null>(null);

  const tabs = [
    { id: 'overview' as ROITab, label: 'Overview', icon: Calculator },
    { id: 'revenue' as ROITab, label: 'Revenue', icon: TrendingUp },
    { id: 'costs' as ROITab, label: 'Costs', icon: TrendingDown },
    { id: 'compare' as ROITab, label: 'Compare', icon: Edit },
    { id: 'scenarios' as ROITab, label: 'Scenarios', icon: Plus },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setShowWhatsNew(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleTogglePreviousYears = () => {
    setShowPreviousYears(!showPreviousYears);
  };

  const handleEditPreviousYears = () => {
    setShowSearchContainer(!showSearchContainer);
  };

  const handleReorderColumns = () => {
    setIsReorderMode(!isReorderMode);
  };

  const startTour = () => {
    setCurrentTourStep(1);
    setShowTour(true);
  };

  const nextTourStep = () => {
    if (currentTourStep < 4) {
      setCurrentTourStep(currentTourStep + 1);
    } else {
      endTour();
    }
  };

  const prevTourStep = () => {
    if (currentTourStep > 1) {
      setCurrentTourStep(currentTourStep - 1);
    }
  };

  const endTour = () => {
    setShowTour(false);
    setCurrentTourStep(0);
  };

  const renderOverviewTab = () => (
    <div className="space-y-8">
      {/* What's New Notification */}
      {showWhatsNew && (
        <div className="fixed top-5 right-5 z-50 transition-all duration-300">
          <div className="max-w-sm w-full bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Campaign className="w-6 h-6 text-blue-500" />
              </div>
              <div className="ml-3 w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">What's New!</p>
                <p className="mt-1 text-sm text-gray-500">We've added Scenario Modeling and a Suggestions Box. Check them out!</p>
                <div className="mt-3 flex">
                  <button 
                    onClick={startTour}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    Learn more
                  </button>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button 
                  onClick={() => setShowWhatsNew(false)}
                  className="inline-flex text-gray-400 hover:text-gray-500"
                >
                  <Close className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tour Overlay */}
      {showTour && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={endTour} />
          <div className="fixed z-50">
            {currentTourStep === 1 && (
              <div className="absolute top-24 left-1/2 -translate-x-1/2 w-80 bg-white rounded-lg shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Welcome to your Dashboard!</h3>
                <p className="text-sm text-gray-600 mb-4">This quick tour will show you the key features. Let's get started!</p>
                <div className="flex justify-between items-center">
                  <button onClick={endTour} className="text-sm text-gray-500 hover:text-gray-700">Skip</button>
                  <button onClick={nextTourStep} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">Next</button>
                </div>
              </div>
            )}
            {currentTourStep === 2 && (
              <div className="absolute top-[250px] right-0 w-80 bg-white rounded-lg shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Key Financial Metrics</h3>
                <p className="text-sm text-gray-600 mb-4">Here you can see a high-level overview of your revenue, costs, profit, and margin. Both estimated and actual figures are displayed.</p>
                <div className="flex justify-between items-center">
                  <button onClick={prevTourStep} className="text-sm text-gray-500 hover:text-gray-700">Previous</button>
                  <button onClick={nextTourStep} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">Next</button>
                </div>
              </div>
            )}
            {currentTourStep === 3 && (
              <div className="absolute top-[520px] left-8 w-80 bg-white rounded-lg shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Financial Summary Table</h3>
                <p className="text-sm text-gray-600 mb-4">This table provides a detailed breakdown. You can toggle the visibility of previous years' data.</p>
                <div className="flex justify-between items-center">
                  <button onClick={prevTourStep} className="text-sm text-gray-500 hover:text-gray-700">Previous</button>
                  <button onClick={nextTourStep} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">Next</button>
                </div>
              </div>
            )}
            {currentTourStep === 4 && (
              <div className="absolute top-[500px] right-8 w-80 bg-white rounded-lg shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Customize Previous Years</h3>
                <p className="text-sm text-gray-600 mb-4">Click "Edit Previous Years" to search and add data from past projects to the comparison table.</p>
                <div className="flex justify-between items-center">
                  <button onClick={prevTourStep} className="text-sm text-gray-500 hover:text-gray-700">Previous</button>
                  <button onClick={endTour} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">Finish Tour</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">ROI Overview</h2>
        </div>
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="relative group">
            <div className="flex items-center bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg shadow-sm">
              <span className="text-sm font-medium">ROI Status: <span className="font-bold text-green-600">Actual</span></span>
              <Info className="w-4 h-4 text-gray-500 ml-1.5 cursor-help" />
            </div>
            <div className="absolute hidden group-hover:block w-64 p-2 mt-2 text-xs bg-gray-800 text-white rounded-lg shadow-lg z-10">
              <p className="font-bold mb-1">Status Types:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><b>Estimate:</b> Initial project phase, figures are projections.</li>
                <li><b>Actual:</b> Project is live or recently completed, figures reflect real data.</li>
                <li><b>Finalised:</b> Project is closed, figures are confirmed and locked.</li>
              </ul>
            </div>
          </div>
          <button className="flex items-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 w-full sm:w-auto justify-center">
            <Upload className="w-4 h-4" />
            <span className="ml-2 text-sm font-medium">Export</span>
          </button>
        </div>
      </header>

      {/* Key Metrics Cards - Enhanced Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Costs Card */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-l-4 border-l-orange-500">
            <div className="flex justify-between items-start">
              <p className="text-sm text-gray-500 mb-1">COSTS</p>
              <div className="bg-orange-100 p-2 rounded-full">
                <Receipt className="w-5 h-5 text-orange-500" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <p className="text-2xl font-bold text-gray-800">€90,656.80</p>
                <span className="text-sm font-medium text-gray-500">(Actual)</span>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-2 mt-2">
                <p className="text-lg font-semibold text-red-500">€3,636,432.78</p>
                <span className="text-sm font-normal text-red-400">(Est.)</span>
              </div>
              <div className="flex items-center text-green-600 text-sm font-medium mt-1">
                <TrendingDown className="w-4 h-4" />
                <span className="ml-1">-97.5%</span>
              </div>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-l-4 border-l-green-600">
            <div className="flex justify-between items-start">
              <p className="text-sm text-gray-500 mb-1">REVENUE</p>
              <div className="bg-green-100 p-2 rounded-full">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <p className="text-2xl font-bold text-gray-800">€25,369.79</p>
                <span className="text-sm font-medium text-gray-500">(Actual)</span>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-2 mt-2">
                <p className="text-lg font-semibold text-red-500">€29,644.79</p>
                <span className="text-sm font-normal text-red-400">(Est.)</span>
              </div>
              <div className="flex items-center text-red-500 text-sm font-medium mt-1">
                <TrendingDown className="w-4 h-4" />
                <span className="ml-1">-14.4%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Profit Card with Progress Wheel */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-l-4 border-l-green-600 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm text-gray-500">PROFIT</p>
              <div className="bg-green-100 p-2 rounded-full">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <p className="text-2xl font-bold text-gray-800">€-65,287.01</p>
                <span className="text-sm font-medium text-gray-500">(Actual)</span>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-2 mt-2">
                <p className="text-lg font-semibold text-red-500">€-3,606,787.99</p>
                <span className="text-sm font-normal text-red-400">(Est.)</span>
              </div>
              <div className="flex items-center text-green-600 text-sm font-medium mt-1">
                <TrendingUp className="w-4 h-4" />
                <span className="ml-1">+98.2%</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-end justify-between">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Key Profit Drivers</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Cost Reduction</span>
                    <span className="font-semibold text-green-600">+€3.54M</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Revenue Shortfall</span>
                    <span className="font-semibold text-red-600">-€4.27k</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 relative w-[70px] h-[70px]">
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(#16a34a 295deg, #e5e7eb 0)`
                  }}
                />
                <div className="absolute inset-[7.5px] bg-white rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-green-600">98%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Margin Card */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-l-4 border-l-purple-500 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <p className="text-sm text-gray-500 mb-1">MARGIN</p>
                <div className="bg-purple-100 p-2 rounded-full">
                  <PieChart className="w-5 h-5 text-purple-500" />
                </div>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <p className="text-2xl font-bold text-gray-800">-257.34%</p>
                <span className="text-sm font-medium text-gray-500">(Actual)</span>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-2 mt-2">
                <p className="text-lg font-semibold text-red-500">-12166.68%</p>
                <span className="text-sm font-normal text-red-400">(Est.)</span>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  <span className="ml-1">+97.8%</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Margin Breakdown</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Gross Margin</span>
                  <span className="font-semibold text-red-600">-150.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Operating Margin</span>
                  <span className="font-semibold text-red-600">-210.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Net Profit Margin</span>
                  <span className="font-semibold text-red-600">-257.3%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 border-l-4 border-l-green-600">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="flex items-start p-3 bg-slate-50 rounded-lg">
            <Receipt className="w-5 h-5 text-green-600 mt-1 mr-3" />
            <div>
              <p className="font-semibold text-gray-700 text-sm">Ticketing – Mains</p>
              <p className="text-xl font-bold text-gray-900 mt-1">€12,500.00</p>
            </div>
          </div>
          <div className="flex items-start p-3 bg-slate-50 rounded-lg">
            <ShoppingCart className="w-5 h-5 text-green-600 mt-1 mr-3" />
            <div>
              <p className="font-semibold text-gray-700 text-sm">Ticketing Addons</p>
              <p className="text-xl font-bold text-gray-900 mt-1">€3,200.50</p>
            </div>
          </div>
          <div className="flex items-start p-3 bg-slate-50 rounded-lg">
            <Shield className="w-5 h-5 text-green-600 mt-1 mr-3" />
            <div>
              <p className="font-semibold text-gray-700 text-sm">Plans & Insurance</p>
              <p className="text-xl font-bold text-gray-900 mt-1">€1,800.00</p>
            </div>
          </div>
          <div className="flex items-start p-3 bg-slate-50 rounded-lg">
            <CreditCard className="w-5 h-5 text-green-600 mt-1 mr-3" />
            <div>
              <p className="font-semibold text-gray-700 text-sm">Access & Accreditation</p>
              <p className="text-xl font-bold text-gray-900 mt-1">€2,150.29</p>
            </div>
          </div>
          <div className="flex items-start p-3 bg-slate-50 rounded-lg">
            <DollarSign className="w-5 h-5 text-green-600 mt-1 mr-3" />
            <div>
              <p className="font-semibold text-gray-700 text-sm">Cashless</p>
              <p className="text-xl font-bold text-gray-900 mt-1">€4,500.00</p>
            </div>
          </div>
          <div className="flex items-start p-3 bg-slate-50 rounded-lg">
            <Cable className="w-5 h-5 text-green-600 mt-1 mr-3" />
            <div>
              <p className="font-semibold text-gray-700 text-sm">Special Integrations</p>
              <p className="text-xl font-bold text-gray-900 mt-1">€750.00</p>
            </div>
          </div>
          <div className="flex items-start p-3 bg-slate-50 rounded-lg">
            <BarChart3 className="w-5 h-5 text-green-600 mt-1 mr-3" />
            <div>
              <p className="font-semibold text-gray-700 text-sm">Insights & Data</p>
              <p className="text-xl font-bold text-gray-900 mt-1">€250.00</p>
            </div>
          </div>
          <div className="flex items-start p-3 bg-slate-50 rounded-lg">
            <Store className="w-5 h-5 text-green-600 mt-1 mr-3" />
            <div>
              <p className="font-semibold text-gray-700 text-sm">Commercial Modules</p>
              <p className="text-xl font-bold text-gray-900 mt-1">€120.00</p>
            </div>
          </div>
          <div className="flex items-start p-3 bg-slate-50 rounded-lg">
            <Cpu className="w-5 h-5 text-green-600 mt-1 mr-3" />
            <div>
              <p className="font-semibold text-gray-700 text-sm">Wristbands & Devices</p>
              <p className="text-xl font-bold text-gray-900 mt-1">€99.00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Summary */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 border-l-4 border-l-orange-500">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Cost Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="flex items-start p-3 bg-slate-50 rounded-lg">
            <Receipt className="w-5 h-5 text-orange-500 mt-1 mr-3" />
            <div>
              <p className="font-semibold text-gray-700 text-sm">Ticketing & Cashless</p>
              <p className="text-xl font-bold text-gray-900 mt-1">€12,540.50</p>
            </div>
          </div>
          <div className="flex items-start p-3 bg-slate-50 rounded-lg">
            <Cpu className="w-5 h-5 text-blue-500 mt-1 mr-3" />
            <div>
              <p className="font-semibold text-gray-700 text-sm">Hardware</p>
              <p className="text-xl font-bold text-gray-900 mt-1">€8,200.00</p>
            </div>
          </div>
          <div className="flex items-start p-3 bg-slate-50 rounded-lg">
            <Tag className="w-5 h-5 text-indigo-500 mt-1 mr-3" />
            <div>
              <p className="font-semibold text-gray-700 text-sm">Wristbands etc.</p>
              <p className="text-xl font-bold text-gray-900 mt-1">€6,875.20</p>
            </div>
          </div>
          <div className="flex items-start p-3 bg-slate-50 rounded-lg">
            <Truck className="w-5 h-5 text-cyan-500 mt-1 mr-3" />
            <div>
              <p className="font-semibold text-gray-700 text-sm">Logistics</p>
              <p className="text-xl font-bold text-gray-900 mt-1">€5,150.00</p>
            </div>
          </div>
          <div className="flex items-start p-3 bg-slate-50 rounded-lg">
            <Users className="w-5 h-5 text-teal-500 mt-1 mr-3" />
            <div>
              <p className="font-semibold text-gray-700 text-sm">Staffing</p>
              <p className="text-xl font-bold text-gray-900 mt-1">€25,600.00</p>
            </div>
          </div>
          <div className="flex items-start p-3 bg-slate-50 rounded-lg">
            <Wrench className="w-5 h-5 text-amber-500 mt-1 mr-3" />
            <div>
              <p className="font-semibold text-gray-700 text-sm">Misc Equipment</p>
              <p className="text-xl font-bold text-gray-900 mt-1">€4,300.10</p>
            </div>
          </div>
          <div className="flex items-start p-3 bg-slate-50 rounded-lg">
            <Code className="w-5 h-5 text-rose-500 mt-1 mr-3" />
            <div>
              <p className="font-semibold text-gray-700 text-sm">Special Dev</p>
              <p className="text-xl font-bold text-gray-900 mt-1">€15,000.00</p>
            </div>
          </div>
          <div className="flex items-start p-3 bg-slate-50 rounded-lg">
            <Grid3x3 className="w-5 h-5 text-lime-500 mt-1 mr-3" />
            <div>
              <p className="font-semibold text-gray-700 text-sm">Other App Costs</p>
              <p className="text-xl font-bold text-gray-900 mt-1">€12,991.00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Margin Summary */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 border-l-4 border-l-purple-500">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Margin Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="flex items-start p-3 bg-slate-50 rounded-lg">
            <PieChart className="w-5 h-5 text-purple-500 mt-1 mr-3" />
            <div>
              <p className="font-semibold text-gray-700 text-sm">Gross Margin</p>
              <p className="text-xl font-bold text-gray-900 mt-1">-150.2%</p>
            </div>
          </div>
          <div className="flex items-start p-3 bg-slate-50 rounded-lg">
            <DonutChart className="w-5 h-5 text-purple-500 mt-1 mr-3" />
            <div>
              <p className="font-semibold text-gray-700 text-sm">Operating Margin</p>
              <p className="text-xl font-bold text-gray-900 mt-1">-210.5%</p>
            </div>
          </div>
          <div className="flex items-start p-3 bg-slate-50 rounded-lg">
            <LineChart className="w-5 h-5 text-purple-500 mt-1 mr-3" />
            <div>
              <p className="font-semibold text-gray-700 text-sm">Net Profit Margin</p>
              <p className="text-xl font-bold text-gray-900 mt-1">-257.3%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid - Key Insights and Top 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Key Insights */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Insights</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-1" />
              <div>
                <p className="font-medium text-gray-800">Costs Significantly Lower than Estimate</p>
                <p className="text-sm text-gray-600">Actual costs are 97.5% lower than the initial estimate, a major win for the project's budget management.</p>
              </div>
            </li>
            <li className="flex items-start">
              <Warning className="w-5 h-5 text-red-500 mr-3 mt-1" />
              <div>
                <p className="font-medium text-gray-800">Revenue Below Target</p>
                <p className="text-sm text-gray-600">Revenue came in 14.4% under the estimated figure. An analysis of revenue streams is recommended.</p>
              </div>
            </li>
            <li className="flex items-start">
              <Info className="w-5 h-5 text-blue-500 mr-3 mt-1" />
              <div>
                <p className="font-medium text-gray-800">Profit Margin Improvement</p>
                <p className="text-sm text-gray-600">Despite lower revenue, the drastic cost reduction led to a significant positive swing in profit margin compared to the estimate.</p>
              </div>
            </li>
            <li className="flex items-start">
              <Lightbulb className="w-5 h-5 text-orange-400 mr-3 mt-1" />
              <div>
                <p className="font-medium text-gray-800">High Staffing Costs</p>
                <p className="text-sm text-gray-600">Staffing represents the largest single cost category. Optimizing schedules or roles could yield further savings.</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Top 3 Costs & Revenues */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 3 Costs & Revenues</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-1/2 bg-green-100 p-4 rounded-xl border-l-4 border-green-300">
                <p className="text-xs text-green-800 font-semibold">#1 REVENUE</p>
                <p className="text-sm text-green-900 truncate font-medium">Advanced Credit Vouchers</p>
                <p className="text-lg font-bold text-green-700 mt-1">€7,650.00</p>
              </div>
              <div className="w-1/2 bg-red-100 p-4 rounded-xl border-l-4 border-red-300">
                <p className="text-xs text-red-800 font-semibold">#1 COST</p>
                <p className="text-sm text-red-900 truncate font-medium">Speciality Development</p>
                <p className="text-lg font-bold text-red-700 mt-1">€2.5M</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-1/2 bg-green-100 p-4 rounded-xl border-l-4 border-green-300">
                <p className="text-xs text-green-800 font-semibold">#2 REVENUE</p>
                <p className="text-sm text-green-900 truncate font-medium">Bill Tents / CASS</p>
                <p className="text-lg font-bold text-green-700 mt-1">€4,500.00</p>
              </div>
              <div className="w-1/2 bg-red-100 p-4 rounded-xl border-l-4 border-red-300">
                <p className="text-xs text-red-800 font-semibold">#2 COST</p>
                <p className="text-sm text-red-900 truncate font-medium">Communication Costs</p>
                <p className="text-lg font-bold text-red-700 mt-1">€1.0M</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-1/2 bg-green-100 p-4 rounded-xl border-l-4 border-green-300">
                <p className="text-xs text-green-800 font-semibold">#3 REVENUE</p>
                <p className="text-sm text-green-900 truncate font-medium">Travel Distance</p>
                <p className="text-lg font-bold text-green-700 mt-1">€3,000.00</p>
              </div>
              <div className="w-1/2 bg-red-100 p-4 rounded-xl border-l-4 border-red-300">
                <p className="text-xs text-red-800 font-semibold">#3 COST</p>
                <p className="text-sm text-red-900 truncate font-medium">Other</p>
                <p className="text-lg font-bold text-red-700 mt-1">€20,000.00</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary Table */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200" id="financial-summary-section">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-800">Financial Summary</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Show Previous Years</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showPreviousYears}
                  onChange={handleTogglePreviousYears}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600"></div>
                <div className="absolute left-1 top-1 bg-white border-gray-300 border rounded-full h-4 w-4 transition-transform peer-checked:translate-x-full peer-checked:border-white"></div>
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleEditPreviousYears}
                className="text-sm text-blue-600 font-semibold border border-blue-200 bg-blue-50/50 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center w-full sm:w-auto justify-center transition-colors"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit Previous Years
              </button>
              <button 
                onClick={handleReorderColumns}
                className="text-sm text-gray-600 font-semibold border border-gray-300 bg-gray-50/50 px-3 py-1.5 rounded-lg hover:bg-gray-100 flex items-center w-full sm:w-auto justify-center transition-colors"
              >
                {isReorderMode ? <Done className="w-4 h-4 mr-1" /> : <DragIndicator className="w-4 h-4 mr-1" />}
                {isReorderMode ? 'Done' : 'Reorder'}
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <thead className="bg-gray-50">
              <tr className="text-right text-xs text-gray-500 font-semibold uppercase tracking-wider whitespace-nowrap">
                <th className="text-left font-semibold pr-2 sm:pr-4 py-3 pl-4 w-[20%]">Category</th>
                <th className="font-semibold px-2 sm:px-4 py-3 w-[15%]">Estimate</th>
                <th className="font-semibold px-2 sm:px-4 py-3 w-[15%]">Actual</th>
                <th className="font-semibold px-2 sm:px-4 py-3 w-[15%] border-r border-gray-200">Difference</th>
                {showPreviousYears && (
                  <>
                    <th className={`font-semibold px-2 sm:px-4 py-3 w-[15%] ${isReorderMode ? 'cursor-grab active:cursor-grabbing' : ''} text-right`}>
                      Event 2023
                    </th>
                    <th className={`font-semibold px-2 sm:px-4 py-3 w-[15%] ${isReorderMode ? 'cursor-grab active:cursor-grabbing' : ''} text-right`}>
                      Event 2022
                    </th>
                    <th className={`font-semibold pl-2 sm:pl-4 py-3 w-[15%] ${isReorderMode ? 'cursor-grab active:cursor-grabbing' : ''} pr-4 text-right`}>
                      Event 2021
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="text-right hover:bg-gray-50 transition-colors">
                <td className="text-left font-medium text-gray-800 pr-2 sm:pr-4 py-4 whitespace-nowrap pl-4">Total Revenue</td>
                <td className="px-2 sm:px-4 py-4 text-gray-900">€29,644.79</td>
                <td className="px-2 sm:px-4 py-4 text-gray-900">€25,369.79</td>
                <td className="px-2 sm:px-4 py-4 text-red-500 font-semibold border-r border-gray-200">€-4,275.00</td>
                {showPreviousYears && (
                  <>
                    <td className="px-2 sm:px-4 py-4 text-gray-700">€22,150.45</td>
                    <td className="px-2 sm:px-4 py-4 text-gray-700">€19,876.12</td>
                    <td className="px-2 sm:px-4 py-4 text-gray-500 pr-4">N/A</td>
                  </>
                )}
              </tr>
              <tr className="text-right hover:bg-gray-50 transition-colors">
                <td className="text-left font-medium text-gray-800 pr-2 sm:pr-4 py-4 whitespace-nowrap pl-4">Total Costs</td>
                <td className="px-2 sm:px-4 py-4 text-gray-900">€3,636,432.78</td>
                <td className="px-2 sm:px-4 py-4 text-green-600 font-semibold">€90,656.80</td>
                <td className="px-2 sm:px-4 py-4 text-green-600 font-semibold border-r border-gray-200">€3,545,775.98</td>
                {showPreviousYears && (
                  <>
                    <td className="px-2 sm:px-4 py-4 text-gray-700">€75,432.10</td>
                    <td className="px-2 sm:px-4 py-4 text-gray-700">€68,123.45</td>
                    <td className="px-2 sm:px-4 py-4 text-gray-500 pr-4">N/A</td>
                  </>
                )}
              </tr>
              <tr className="text-right hover:bg-gray-50 transition-colors">
                <td className="text-left font-medium text-gray-800 pr-2 sm:pr-4 py-4 pl-4">Profit</td>
                <td className="px-2 sm:px-4 py-4 text-gray-900">€-3,606,787.99</td>
                <td className="px-2 sm:px-4 py-4 text-green-600 font-semibold">€-65,287.01</td>
                <td className="px-2 sm:px-4 py-4 text-green-600 font-semibold border-r border-gray-200">€3,541,500.98</td>
                {showPreviousYears && (
                  <>
                    <td className="px-2 sm:px-4 py-4 text-red-500 font-semibold">-€53,281.65</td>
                    <td className="px-2 sm:px-4 py-4 text-red-500 font-semibold">-€48,247.33</td>
                    <td className="px-2 sm:px-4 py-4 text-gray-500 pr-4">N/A</td>
                  </>
                )}
              </tr>
              <tr className="text-right hover:bg-gray-50 transition-colors">
                <td className="text-left font-medium text-gray-800 pr-2 sm:pr-4 py-4 pl-4">Margin</td>
                <td className="px-2 sm:px-4 py-4 text-gray-900">-12166.68%</td>
                <td className="px-2 sm:px-4 py-4 text-green-600 font-semibold">-257.34%</td>
                <td className="px-2 sm:px-4 py-4 text-green-600 font-semibold border-r border-gray-200">11909.34%</td>
                {showPreviousYears && (
                  <>
                    <td className="px-2 sm:px-4 py-4 text-red-500 font-semibold">-240.54%</td>
                    <td className="px-2 sm:px-4 py-4 text-red-500 font-semibold">-242.74%</td>
                    <td className="px-2 sm:px-4 py-4 text-gray-500 pr-4">N/A</td>
                  </>
                )}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Search Container */}
        {showSearchContainer && (
          <div className="mt-4 p-4 border-t-2 border-dashed border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Search for projects to add:</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Search projects..." 
                type="text"
              />
            </div>
            <div className="mt-4 max-h-48 overflow-y-auto space-y-2">
              <div className="p-3 bg-gray-100 rounded-lg cursor-grab active:cursor-grabbing flex justify-between items-center hover:bg-gray-200 transition-colors">
                <p className="text-sm font-medium text-gray-800">Project Alpha 2020</p>
                <DragIndicator className="w-4 h-4 text-gray-500" />
              </div>
              <div className="p-3 bg-gray-100 rounded-lg cursor-grab active:cursor-grabbing flex justify-between items-center hover:bg-gray-200 transition-colors">
                <p className="text-sm font-medium text-gray-800">Project Beta 2019</p>
                <DragIndicator className="w-4 h-4 text-gray-500" />
              </div>
              <div className="p-3 bg-gray-100 rounded-lg cursor-grab active:cursor-grabbing flex justify-between items-center hover:bg-gray-200 transition-colors">
                <p className="text-sm font-medium text-gray-800">Project Gamma 2018</p>
                <DragIndicator className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scenario Modeling */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Scenario Modeling</h3>
          <button className="text-sm text-blue-600 font-semibold border border-blue-200 bg-blue-50/50 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center transition-colors">
            Edit
          </button>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2 font-semibold text-sm text-gray-500 w-[16.66%]">Scenario</th>
              <th className="py-2 font-semibold text-sm text-gray-500 w-[16.66%]">Attendance</th>
              <th className="py-2 font-semibold text-sm text-gray-500 w-[16.66%]">Cashless</th>
              <th className="py-2 font-semibold text-sm text-gray-500 w-[16.66%]">Weather</th>
              <th className="py-2 font-semibold text-sm text-gray-500 w-[16.66%]">Projected Profit</th>
              <th className="py-2 font-semibold text-sm text-gray-500 w-[16.66%]">Projected Margin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="py-3 font-medium text-gray-800 pr-2">Best Case</td>
              <td className="py-3 px-2">
                <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full">+10%</span>
              </td>
              <td className="py-3 px-2">
                <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full">+5%</span>
              </td>
              <td className="py-3 px-2 text-gray-800">Good</td>
              <td className="py-3 px-2 text-green-600 font-semibold">€-58,758.31</td>
              <td className="py-3 pl-2 text-green-600 font-semibold">-210%</td>
            </tr>
            <tr>
              <td className="py-3 font-medium text-gray-800 pr-2">Expected Case</td>
              <td className="py-3 px-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">+5%</span>
              </td>
              <td className="py-3 px-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">+2%</span>
              </td>
              <td className="py-3 px-2 text-gray-800">Normal</td>
              <td className="py-3 px-2 text-gray-800">€-63,942.15</td>
              <td className="py-3 pl-2 text-gray-800">-240%</td>
            </tr>
            <tr>
              <td className="py-3 font-medium text-gray-800 pr-2">Worst Case</td>
              <td className="py-3 px-2">
                <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-1 rounded-full">-10%</span>
              </td>
              <td className="py-3 px-2">
                <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-1 rounded-full">-5%</span>
              </td>
              <td className="py-3 px-2 text-gray-800">Bad</td>
              <td className="py-3 px-2 text-red-500 font-semibold">€-71,811.85</td>
              <td className="py-3 pl-2 text-red-500 font-semibold">-315%</td>
            </tr>
            <tr>
              <td className="py-3 pr-2">
                <input 
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm" 
                  placeholder="Custom" 
                  type="text"
                />
              </td>
              <td className="py-3 px-2">
                <input 
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm" 
                  placeholder="+8%" 
                  type="text"
                />
              </td>
              <td className="py-3 px-2">
                <input 
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm" 
                  placeholder="-3%" 
                  type="text"
                />
              </td>
              <td className="py-3 px-2">
                <input 
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm" 
                  placeholder="Storm" 
                  type="text"
                />
              </td>
              <td className="py-3 px-2">
                <input 
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm" 
                  placeholder="€-60,500" 
                  type="text"
                />
              </td>
              <td className="py-3 pl-2">
                <input 
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm" 
                  placeholder="-220%" 
                  type="text"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <button className="mt-4 flex items-center text-sm text-blue-600 font-semibold hover:text-blue-800">
          <Plus className="w-4 h-4 mr-1" />
          Add New Scenario
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'revenue':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Revenue Analysis</h3>
              <p className="text-gray-500">Detailed revenue breakdown and analysis tools.</p>
            </div>
          </div>
        );
      case 'costs':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-center py-12">
              <TrendingDown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Cost Analysis</h3>
              <p className="text-gray-500">Detailed cost breakdown and optimization tools.</p>
            </div>
          </div>
        );
      case 'compare':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-center py-12">
              <Edit className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Compare Projects</h3>
              <p className="text-gray-500">Compare ROI across different projects and time periods.</p>
            </div>
          </div>
        );
      case 'scenarios':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-center py-12">
              <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Scenario Planning</h3>
              <p className="text-gray-500">Create and analyze different financial scenarios.</p>
            </div>
          </div>
        );
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <nav className="-mb-px flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        {renderTabContent()}
      </div>
    </div>
  );
}