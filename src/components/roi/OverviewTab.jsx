import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Upload,
  Edit,
  Plus,
  GripVertical,
  Search,
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
  PieChart,
  CircleDot,
  Activity,
  Truck,
  Tag,
  AlertCircle as Warning,
  Lightbulb,
  Check as Done,
} from 'lucide-react';
import { ProtectedField } from '../permissions/ProtectedField';

// CSS styles for row actions
const styles = `
  .row-actions {
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
  }
  tr:hover .row-actions {
    opacity: 1;
  }
`;

export function OverviewTab({ roiCalculation, isLoadingROI }) {
  const [showPreviousYears, setShowPreviousYears] = useState(true);
  const [showSearchContainer, setShowSearchContainer] = useState(false);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [currentTourStep, setCurrentTourStep] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const [draggedColumn, setDraggedColumn] = useState(null);
  const [collapsedSections, setCollapsedSections] = useState({});

  const toggleCollapse = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // ============================================================================
  // CALCULATION HELPER FUNCTIONS
  // ============================================================================

  // Calculate total for a single item using its category's formula
  const calculateItemTotal = (item, category) => {
    try {
      let formula = category.formula;
      if (formula.startsWith('=')) {
        formula = formula.substring(1);
      }

      // Replace column letters with actual values from the item
      category.columns.forEach((col, index) => {
        const colLetter = String.fromCharCode(65 + index); // A, B, C, etc.
        const value = item[col.id] || 0;
        const regex = new RegExp(`\\b${colLetter}\\b`, 'g');
        formula = formula.replace(regex, value);
      });

      return eval(formula) || 0;
    } catch (e) {
      return 0;
    }
  };

  // Calculate total for an entire category (sum of all items)
  const calculateCategoryTotal = (category) => {
    if (!category.items || category.items.length === 0) {
      return 0;
    }
    return category.items.reduce((sum, item) => {
      return sum + calculateItemTotal(item, category);
    }, 0);
  };

  // Calculate grand total across all categories
  const calculateGrandTotal = (categories) => {
    if (!categories || categories.length === 0) {
      return 0;
    }
    return categories.reduce((sum, category) => {
      return sum + calculateCategoryTotal(category);
    }, 0);
  };

  // Get top 3 line items from all categories sorted by value
  const getTop3Items = (categories) => {
    if (!categories || categories.length === 0) {
      return [];
    }

    // Flatten all items from all categories with their calculated totals
    const allItems = [];
    categories.forEach((category) => {
      if (category.items && category.items.length > 0) {
        category.items.forEach((item) => {
          const total = calculateItemTotal(item, category);
          allItems.push({
            name: item.name,
            total: total,
            categoryName: category.name,
            categoryIcon: category.icon,
            categoryColor: category.color
          });
        });
      }
    });

    // Sort by total (descending) and take top 3
    return allItems
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
  };

  // ============================================================================
  // EXTRACT DATA FROM ROI CALCULATION
  // ============================================================================

  const revenueCategories = roiCalculation?.revenue_config?.categories || [];
  const costCategories = roiCalculation?.cost_config?.categories || [];

  const totalRevenue = calculateGrandTotal(revenueCategories);
  const totalCosts = calculateGrandTotal(costCategories);
  const profit = totalRevenue - totalCosts;
  const margin = totalRevenue !== 0 ? (profit / totalRevenue) * 100 : 0;

  const top3Revenue = getTop3Items(revenueCategories);
  const top3Costs = getTop3Items(costCategories);

  // ============================================================================
  // ICON MAPPING - Maps icon IDs to SVG paths
  // ============================================================================

  const iconMap = {
    'ticket': 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
    'cube': 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    'cash': 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
    'chartbar': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    'users': 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    'shield': 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    'truck': 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0',
    'tag': 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
    'creditcard': 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    'lightning': 'M13 10V3L4 14h7v7l9-11h-7z',
    'devicemobile': 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
    'wrench': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    'code': 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    'star': 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    'circle': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
    'triangle': 'M12 2L2 20h20L12 2z'
  };

  // Get icon SVG path, with fallback to star for unknown icons
  const getIconPath = (iconId) => {
    return iconMap[iconId] || iconMap['star'];
  };

  // Inject CSS styles for row actions
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
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

  return (
    <div className="space-y-8">

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
                <p className="text-2xl font-bold text-gray-800">
                  €{totalRevenue.toLocaleString('en-EU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <span className="text-sm font-medium text-gray-500">(Calculated from Revenue Builder)</span>
              </div>
            </div>
          </div>

          {/* Costs Card */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-l-4 border-l-orange-500">
            <div className="flex justify-between items-start">
              <p className="text-sm text-gray-500 mb-1">COSTS</p>
              <div className="bg-orange-100 p-2 rounded-full">
                <Receipt className="w-5 h-5 text-orange-500" />
              </div>
            </div>
            <div className="flex-1">
              <ProtectedField
                fieldId="total_costs_actual"
                label="Total Costs (Actual)"
                hideWhenNoAccess={false}
                placeholderText="Sensitive cost data"
              >
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <p className="text-2xl font-bold text-gray-800">
                    €{totalCosts.toLocaleString('en-EU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <span className="text-sm font-medium text-gray-500">(Calculated from Cost Builder)</span>
                </div>
              </ProtectedField>
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
              <ProtectedField
                fieldId="profit_actual"
                label="Profit (Actual)"
                showPlaceholder={true}
                placeholderText="Profit data restricted to authorized users"
              >
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    €{profit.toLocaleString('en-EU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <span className="text-sm font-medium text-gray-500">(Calculated)</span>
                </div>
              </ProtectedField>
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
                <p className={`text-2xl font-bold ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {margin.toFixed(2)}%
                </p>
                <span className="text-sm font-medium text-gray-500">(Calculated)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue & Cost Summary - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Summary - Dynamic from revenue_config */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 border-l-4 border-l-green-600">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Summary</h3>
          <div className="grid grid-cols-2 gap-3 max-h-[280px] overflow-y-auto">
            {revenueCategories.length === 0 ? (
              <div className="col-span-2 text-center py-8">
                <p className="text-gray-500">No revenue categories configured yet. Add categories in the Revenue tab.</p>
              </div>
            ) : (
              revenueCategories.map((category) => {
                const categoryTotal = calculateCategoryTotal(category);
                const iconPath = getIconPath(category.icon);

                return (
                  <div key={category.id} className="flex items-start p-3 bg-slate-50 rounded-lg">
                    <svg
                      className={`w-5 h-5 ${category.color?.text || 'text-green-600'} mt-1 mr-3 flex-shrink-0`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                    </svg>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-700 text-sm truncate" title={category.name}>
                        {category.name}
                      </p>
                      <p className="text-xl font-bold text-gray-900 mt-1">
                        €{categoryTotal.toLocaleString('en-EU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Cost Summary - Dynamic from cost_config */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 border-l-4 border-l-orange-500">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Cost Summary</h3>
          <div className="grid grid-cols-2 gap-3 max-h-[280px] overflow-y-auto">
            {costCategories.length === 0 ? (
              <div className="col-span-2 text-center py-8">
                <p className="text-gray-500">No cost categories configured yet. Add categories in the Costs tab.</p>
              </div>
            ) : (
              costCategories.map((category) => {
                const categoryTotal = calculateCategoryTotal(category);
                const iconPath = getIconPath(category.icon);

                return (
                  <div key={category.id} className="flex items-start p-3 bg-slate-50 rounded-lg">
                    <svg
                      className={`w-5 h-5 ${category.color?.text || 'text-orange-500'} mt-1 mr-3 flex-shrink-0`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                    </svg>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-700 text-sm truncate" title={category.name}>
                        {category.name}
                      </p>
                      <p className="text-xl font-bold text-gray-900 mt-1">
                        €{categoryTotal.toLocaleString('en-EU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid - Key Insights and Top 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Key Insights - Placeholder for future development */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Insights</h3>
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="p-4 bg-amber-50 rounded-full mb-4">
              <Lightbulb className="w-10 h-10 text-amber-500" />
            </div>
            <p className="text-lg font-semibold text-gray-700 mb-2 text-center">
              Automated Insights Coming Soon
            </p>
            <p className="text-sm text-gray-500 text-center max-w-md">
              This module is awaiting development. Future versions will provide AI-powered insights based on your revenue and cost data.
            </p>
          </div>
        </div>

        {/* Top 3 Costs & Revenues - Dynamic from builders */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 3 Costs & Revenues</h3>
          <div className="space-y-4">
            {[0, 1, 2].map((index) => {
              const revenueItem = top3Revenue[index];
              const costItem = top3Costs[index];

              return (
                <div key={index} className="flex items-center gap-4">
                  {/* Revenue Item */}
                  <div className="w-1/2 bg-green-100 p-4 rounded-xl border-l-4 border-green-300">
                    <p className="text-xs text-green-800 font-semibold">#{index + 1} REVENUE</p>
                    {revenueItem ? (
                      <>
                        <p className="text-sm text-green-900 truncate font-medium" title={revenueItem.name}>
                          {revenueItem.name}
                        </p>
                        <p className="text-lg font-bold text-green-700 mt-1">
                          €{revenueItem.total.toLocaleString('en-EU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-green-900 italic">No data</p>
                        <p className="text-lg font-bold text-green-700 mt-1">€0.00</p>
                      </>
                    )}
                  </div>

                  {/* Cost Item */}
                  <div className="w-1/2 bg-red-100 p-4 rounded-xl border-l-4 border-red-300">
                    <p className="text-xs text-red-800 font-semibold">#{index + 1} COST</p>
                    {costItem ? (
                      <>
                        <p className="text-sm text-red-900 truncate font-medium" title={costItem.name}>
                          {costItem.name}
                        </p>
                        <p className="text-lg font-bold text-red-700 mt-1">
                          €{costItem.total.toLocaleString('en-EU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-red-900 italic">No data</p>
                        <p className="text-lg font-bold text-red-700 mt-1">€0.00</p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
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
                {isReorderMode ? <Done className="w-4 h-4 mr-1" /> : <GripVertical className="w-4 h-4 mr-1" />}
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
                <td className="px-2 sm:px-4 py-4 text-gray-500 italic text-sm">Estimate data</td>
                <td className="px-2 sm:px-4 py-4 text-gray-900 font-semibold">
                  €{totalRevenue.toLocaleString('en-EU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-2 sm:px-4 py-4 text-gray-500 italic text-sm border-r border-gray-200">-</td>
                {showPreviousYears && (
                  <>
                    <td className="px-2 sm:px-4 py-4 text-gray-500 italic text-sm">Historical</td>
                    <td className="px-2 sm:px-4 py-4 text-gray-500 italic text-sm">Historical</td>
                    <td className="px-2 sm:px-4 py-4 text-gray-500 italic text-sm pr-4">Historical</td>
                  </>
                )}
              </tr>
              <tr className="text-right hover:bg-gray-50 transition-colors">
                <td className="text-left font-medium text-gray-800 pr-2 sm:pr-4 py-4 whitespace-nowrap pl-4">Total Costs</td>
                <td className="px-2 sm:px-4 py-4 text-gray-500 italic text-sm">Estimate data</td>
                <td className="px-2 sm:px-4 py-4 text-gray-900 font-semibold">
                  €{totalCosts.toLocaleString('en-EU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-2 sm:px-4 py-4 text-gray-500 italic text-sm border-r border-gray-200">-</td>
                {showPreviousYears && (
                  <>
                    <td className="px-2 sm:px-4 py-4 text-gray-500 italic text-sm">Historical</td>
                    <td className="px-2 sm:px-4 py-4 text-gray-500 italic text-sm">Historical</td>
                    <td className="px-2 sm:px-4 py-4 text-gray-500 italic text-sm pr-4">Historical</td>
                  </>
                )}
              </tr>
              <tr className="text-right hover:bg-gray-50 transition-colors">
                <td className="text-left font-medium text-gray-800 pr-2 sm:pr-4 py-4 pl-4">Profit</td>
                <td className="px-2 sm:px-4 py-4 text-gray-500 italic text-sm">Estimate data</td>
                <td className={`px-2 sm:px-4 py-4 font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  €{profit.toLocaleString('en-EU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-2 sm:px-4 py-4 text-gray-500 italic text-sm border-r border-gray-200">-</td>
                {showPreviousYears && (
                  <>
                    <td className="px-2 sm:px-4 py-4 text-gray-500 italic text-sm">Historical</td>
                    <td className="px-2 sm:px-4 py-4 text-gray-500 italic text-sm">Historical</td>
                    <td className="px-2 sm:px-4 py-4 text-gray-500 italic text-sm pr-4">Historical</td>
                  </>
                )}
              </tr>
              <tr className="text-right hover:bg-gray-50 transition-colors">
                <td className="text-left font-medium text-gray-800 pr-2 sm:pr-4 py-4 pl-4">Margin</td>
                <td className="px-2 sm:px-4 py-4 text-gray-500 italic text-sm">Estimate data</td>
                <td className={`px-2 sm:px-4 py-4 font-semibold ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {margin.toFixed(2)}%
                </td>
                <td className="px-2 sm:px-4 py-4 text-gray-500 italic text-sm border-r border-gray-200">-</td>
                {showPreviousYears && (
                  <>
                    <td className="px-2 sm:px-4 py-4 text-gray-500 italic text-sm">Historical</td>
                    <td className="px-2 sm:px-4 py-4 text-gray-500 italic text-sm">Historical</td>
                    <td className="px-2 sm:px-4 py-4 text-gray-500 italic text-sm pr-4">Historical</td>
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
                <GripVertical className="w-4 h-4 text-gray-500" />
              </div>
              <div className="p-3 bg-gray-100 rounded-lg cursor-grab active:cursor-grabbing flex justify-between items-center hover:bg-gray-200 transition-colors">
                <p className="text-sm font-medium text-gray-800">Project Beta 2019</p>
                <GripVertical className="w-4 h-4 text-gray-500" />
              </div>
              <div className="p-3 bg-gray-100 rounded-lg cursor-grab active:cursor-grabbing flex justify-between items-center hover:bg-gray-200 transition-colors">
                <p className="text-sm font-medium text-gray-800">Project Gamma 2018</p>
                <GripVertical className="w-4 h-4 text-gray-500" />
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
}
