import React, { useState, useEffect } from 'react';
import { ChevronDown, DollarSign, TrendingDown, Edit, Plus, Trash2, Receipt, Loader2 } from 'lucide-react';
import { useROIService, CostItem as DBCostItem } from '../../lib/services/roiService';
import toast from 'react-hot-toast';

interface CostsTabProps {
  roiCalculationId?: string;
}

export function CostsTab({ roiCalculationId }: CostsTabProps) {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [costsData, setCostsData] = useState<DBCostItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalEstimate, setTotalEstimate] = useState(0);
  const [totalActual, setTotalActual] = useState(0);

  const { getCosts, addCostItem, updateCostItem, deleteCostItem } = useROIService();

  const toggleCollapse = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  useEffect(() => {
    const loadCostsData = async () => {
      if (!roiCalculationId) {
        console.log('No ROI calculation ID provided');
        return;
      }

      setIsLoading(true);
      try {
        const items = await getCosts(roiCalculationId);
        setCostsData(items);

        // Calculate totals
        const estTotal = items.reduce((sum, item) => sum + (item.estimate || 0), 0);
        const actTotal = items.reduce((sum, item) => sum + (item.actual || 0), 0);
        setTotalEstimate(estTotal);
        setTotalActual(actTotal);

        // Initialize collapsed sections based on categories in data
        const categories = new Set(items.map(item => item.category));
        const initialCollapsedState: Record<string, boolean> = {};
        categories.forEach(cat => {
          initialCollapsedState[cat] = false;
        });
        setCollapsedSections(initialCollapsedState);
      } catch (error) {
        console.error('Error loading costs data:', error);
        toast.error('Failed to load costs data');
      } finally {
        setIsLoading(false);
      }
    };

    loadCostsData();
  }, [roiCalculationId]);

  // Show loading state
  if (!roiCalculationId) {
    return (
      <div className="flex items-center justify-center min-h-96 p-8">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Please select a project to view costs data</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96 p-8">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Loading costs data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto bg-white">
      {/* KPI Header */}
      <div className="sticky top-0 bg-white z-10 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-slate-800">Costs Management</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
              <span>Add Cost Item</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 uppercase">TOTAL COSTS (ESTIMATE)</p>
                <p className="text-xl font-bold text-gray-800 mt-1">{formatCurrency(totalEstimate)}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-orange-500 bg-orange-100 p-2 rounded-full" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 uppercase">TOTAL COSTS (ACTUAL)</p>
                <p className="text-xl font-bold text-gray-800 mt-1">{formatCurrency(totalActual)}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500 bg-red-100 p-2 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Cost Categories Overview */}
        {Object.keys(collapsedSections).length > 0 && (
          <div className="bg-slate-50 p-6 rounded-lg mb-8 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Cost Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.keys(collapsedSections).map((category, index) => {
                const categoryData = costsData.filter(item => item.category === category);
                const categoryTotal = categoryData.reduce((sum, item) => sum + (item.estimate || 0), 0);

                return (
                  <div key={category} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-orange-500">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">{category}</p>
                        <p className="text-lg font-bold text-gray-800 mt-1">{formatCurrency(categoryTotal)}</p>
                      </div>
                      <TrendingDown className="w-6 h-6 text-orange-500 bg-orange-100 p-1 rounded-full" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Detailed Costs Section */}
        <div className="bg-slate-50 p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <Receipt className="mr-2 text-orange-500 w-6 h-6" />
                <span>COST ITEMS</span>
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-xs font-medium text-gray-500 mb-1">TOTAL (ESTIMATE)</p>
                <p className="text-lg font-bold text-gray-800">{formatCurrency(totalEstimate)}</p>
              </div>
            </div>
          </div>

          {/* Cost Categories */}
          {costsData.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <TrendingDown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No cost items yet</p>
              <p className="text-gray-400 text-sm mt-2">Click "Add Cost Item" to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {Object.keys(collapsedSections).map((category) => {
                const categoryData = costsData.filter(item => item.category === category);
                const categoryTotal = categoryData.reduce((sum, item) => sum + (item.estimate || 0), 0);

                return (
                  <div key={category} className="bg-white rounded-lg">
                    <button
                      onClick={() => toggleCollapse(category)}
                      className="w-full p-4 cursor-pointer flex justify-between items-center font-semibold text-slate-800 text-base"
                    >
                      <div className="flex items-center">
                        <ChevronDown className={`transition-transform duration-200 mr-2 text-slate-500 w-5 h-5 ${collapsedSections[category] ? 'rotate-180' : ''}`} />
                        <TrendingDown className="mr-2 text-slate-600 w-5 h-5" />
                        <span>{category}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-right text-sm font-bold w-32">{formatCurrency(categoryTotal)}</span>
                      </div>
                    </button>
                    {!collapsedSections[category] && (
                      <div className="p-4 border-t border-slate-200 bg-slate-50">
                        <div className="grid grid-cols-12 gap-x-4 items-center mb-2 text-xs font-semibold text-slate-500 px-4">
                          <span className="col-span-4">Description</span>
                          <span className="col-span-2 text-center">Sub-Category</span>
                          <span className="col-span-2 text-right">Estimate</span>
                          <span className="col-span-2 text-right">Actual</span>
                          <span className="col-span-2 text-center">Actions</span>
                        </div>
                        <div className="space-y-3">
                          {categoryData.map((item) => (
                            <div key={item.id} className="grid grid-cols-12 gap-x-4 items-center px-4 py-3 hover:bg-slate-100 rounded-md bg-white">
                              <span className="text-sm text-slate-700 col-span-4 font-medium">{item.description}</span>
                              <span className="text-sm text-slate-500 col-span-2 text-center">{item.sub_category || '-'}</span>
                              <span className="text-sm text-slate-800 font-medium col-span-2 text-right">{formatCurrency(item.estimate)}</span>
                              <span className="text-sm text-red-600 font-medium col-span-2 text-right">{formatCurrency(item.actual)}</span>
                              <div className="col-span-2 flex items-center justify-center space-x-2">
                                <button className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}