import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, TrendingDown, Download, Edit, Plus, SeparatorVertical as DragIndicator, Search, EyeClosed as Close, FileWarning as Warning, Lightbulb, Bone as Done, Menu, Lamp as Campaign } from 'lucide-react';
import { Project } from '../../types';
import { LoadingSpinner } from '../ui/LoadingSpinner';
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
  const [suggestionForm, setSuggestionForm] = useState({
    category: 'Feature Request',
    tags: ['Dashboard', 'Mobile App'],
    content: ''
  });

  const tabs = [
    { id: 'overview' as ROITab, label: 'Overview', icon: Calculator },
    { id: 'revenue' as ROITab, label: 'Revenue', icon: TrendingUp },
    { id: 'costs' as ROITab, label: 'Costs', icon: TrendingDown },
    { id: 'compare' as ROITab, label: 'Compare', icon: Edit },
    { id: 'scenarios' as ROITab, label: 'Scenarios', icon: Plus },
  ];

  useEffect(() => {
    // Show what's new notification after component mounts
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

  const handleRemoveTag = (tagToRemove: string) => {
    setSuggestionForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddTag = (newTag: string) => {
    if (newTag.trim() && !suggestionForm.tags.includes(newTag.trim())) {
      setSuggestionForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
    }
  };

  const handleSubmitSuggestion = () => {
    if (suggestionForm.content.trim()) {
      toast.success('Suggestion submitted successfully!');
      setSuggestionForm(prev => ({ ...prev, content: '' }));
    } else {
      toast.error('Please enter your suggestion');
    }
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
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Financial Overview</h2>
        </div>
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <button className="flex items-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-100 w-full sm:w-auto justify-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </header>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-1">REVENUE</p>
          <p className="text-xs text-gray-400">ESTIMATE</p>
          <p className="text-2xl font-bold text-gray-800 mb-4">€29,644.79</p>
          <p className="text-xs text-gray-400">ACTUAL</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-red-500">€25,369.79</p>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-1">COSTS</p>
          <p className="text-xs text-gray-400">ESTIMATE</p>
          <p className="text-xl font-bold text-gray-800 mb-4 whitespace-nowrap">€3,636,432.78</p>
          <p className="text-xs text-gray-400">ACTUAL</p>
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold text-green-500 whitespace-nowrap">€90,656.80</p>
            <TrendingDown className="w-5 h-5 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-1">PROFIT</p>
          <p className="text-xs text-gray-400">ESTIMATE</p>
          <p className="text-xl font-bold text-gray-800 mb-4 whitespace-nowrap">€-3,606,787.99</p>
          <p className="text-xs text-gray-400">ACTUAL</p>
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold text-green-500 whitespace-nowrap">€-65,287.01</p>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-1">MARGIN</p>
          <p className="text-xs text-gray-400">ESTIMATE</p>
          <p className="text-xl font-bold text-gray-800 mb-4 whitespace-nowrap">-12166.68%</p>
          <p className="text-xs text-gray-400">ACTUAL</p>
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold text-green-500 whitespace-nowrap">-257.34%</p>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-base font-semibold text-gray-800 mb-3">Key Insights</h3>
        <div className="space-y-3">
          <div className="flex items-start">
            <TrendingUp className="w-5 h-5 text-green-500 mt-1 mr-2" />
            <div>
              <p className="font-medium text-gray-800 text-sm">Primary Revenue Driver</p>
              <p className="text-xs text-gray-600">'Advanced Credit Vouchers' are the leading source of revenue. Focusing on this area could yield further growth.</p>
            </div>
          </div>
          <div className="flex items-start">
            <Warning className="w-5 h-5 text-red-500 mt-1 mr-2" />
            <div>
              <p className="font-medium text-gray-800 text-sm">Cost Optimization Area</p>
              <p className="text-xs text-gray-600">'Specialty Development' is the highest cost item. A detailed analysis could uncover significant savings opportunities.</p>
            </div>
          </div>
          <div className="flex items-start">
            <Lightbulb className="w-5 h-5 text-blue-500 mt-1 mr-2" />
            <div>
              <p className="font-medium text-gray-800 text-sm">Positive Cost Variance</p>
              <p className="text-xs text-gray-600">Actual costs are substantially lower than estimated, indicating successful cost management or conservative forecasting.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary Table */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow" id="financial-summary-section">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
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
                className="text-sm text-blue-600 font-semibold border border-blue-200 px-3 py-1 rounded-md hover:bg-blue-50 flex items-center w-full sm:w-auto justify-center"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit Previous Years
              </button>
              <div className="relative group">
                <button 
                  onClick={handleReorderColumns}
                  className="text-sm text-blue-600 font-semibold border border-blue-200 px-3 py-1 rounded-md hover:bg-blue-50 flex items-center w-full sm:w-auto justify-center"
                >
                  {isReorderMode ? <Done className="w-4 h-4 mr-1" /> : <DragIndicator className="w-4 h-4 mr-1" />}
                  {isReorderMode ? 'Done Reordering' : 'Reorder Columns'}
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                  Drag to reorder columns
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-xs text-gray-500 font-medium whitespace-nowrap">
                <th className="text-left font-medium pr-2 sm:pr-4 py-2 w-auto sm:w-[20%]"></th>
                <th className="font-medium px-2 sm:px-4 py-2 w-auto sm:w-[15%]">Estimate</th>
                <th className="font-medium px-2 sm:px-4 py-2 w-auto sm:w-[15%]">Actual</th>
                <th className="font-medium px-2 sm:px-4 py-2 w-auto sm:w-[15%] border-r-0 md:border-r-2 border-gray-300">Difference</th>
                {showPreviousYears && (
                  <>
                    <th className="font-medium px-2 sm:px-4 py-2 w-auto sm:w-[15%] bg-purple-100 text-purple-800 rounded-t-lg cursor-grab active:cursor-grabbing">
                      <div className="flex items-center justify-end">
                        <DragIndicator className="w-4 h-4 text-purple-400 mr-1" />
                        <span>Event 2023</span>
                      </div>
                    </th>
                    <th className="font-medium px-2 sm:px-4 py-2 w-auto sm:w-[15%] bg-indigo-100 text-indigo-800 rounded-t-lg cursor-grab active:cursor-grabbing">
                      <div className="flex items-center justify-end">
                        <DragIndicator className="w-4 h-4 text-indigo-400 mr-1" />
                        <span>Event 2022</span>
                      </div>
                    </th>
                    <th className="font-medium pl-2 sm:pl-4 py-2 w-auto sm:w-[15%] bg-teal-100 text-teal-800 rounded-t-lg cursor-grab active:cursor-grabbing">
                      <div className="flex items-center justify-end">
                        <DragIndicator className="w-4 h-4 text-teal-400 mr-1" />
                        <span>Event 2021</span>
                      </div>
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="text-right">
                <td className="text-left font-medium text-gray-700 pr-2 sm:pr-4 py-3 whitespace-nowrap">Total Revenue</td>
                <td className="px-2 sm:px-4 py-3 text-gray-900">€29,644.79</td>
                <td className="px-2 sm:px-4 py-3 text-red-500">€25,369.79</td>
                <td className="px-2 sm:px-4 py-3 text-red-500 border-r-0 md:border-r-2 border-gray-300">€-4,275.00</td>
                {showPreviousYears && (
                  <>
                    <td className="px-2 sm:px-4 py-3 text-gray-700 bg-purple-50">€22,150.45</td>
                    <td className="px-2 sm:px-4 py-3 text-gray-700 bg-indigo-50">€19,876.12</td>
                    <td className="px-2 sm:px-4 py-3 text-gray-500 bg-teal-50">N/A</td>
                  </>
                )}
              </tr>
              <tr className="text-right">
                <td className="text-left font-medium text-gray-700 pr-2 sm:pr-4 py-3 whitespace-nowrap">Total Costs</td>
                <td className="px-2 sm:px-4 py-3 text-gray-900">€3,636,432.78</td>
                <td className="px-2 sm:px-4 py-3 text-green-500">€90,656.80</td>
                <td className="px-2 sm:px-4 py-3 text-green-500 border-r-0 md:border-r-2 border-gray-300">€3,545,775.98</td>
                {showPreviousYears && (
                  <>
                    <td className="px-2 sm:px-4 py-3 text-gray-700 bg-purple-50">€75,432.10</td>
                    <td className="px-2 sm:px-4 py-3 text-gray-700 bg-indigo-50">€68,123.45</td>
                    <td className="px-2 sm:px-4 py-3 text-gray-500 bg-teal-50">N/A</td>
                  </>
                )}
              </tr>
              <tr className="text-right border-t-4 border-gray-300">
                <td className="text-left font-medium text-gray-700 pr-2 sm:pr-4 py-3 pt-6">Profit</td>
                <td className="px-2 sm:px-4 py-3 pt-6 text-gray-900">€-3,606,787.99</td>
                <td className="px-2 sm:px-4 py-3 pt-6 text-green-500">€-65,287.01</td>
                <td className="px-2 sm:px-4 py-3 pt-6 text-green-500 border-r-0 md:border-r-2 border-gray-300">€3,541,500.98</td>
                {showPreviousYears && (
                  <>
                    <td className="px-2 sm:px-4 py-3 pt-6 text-red-500 bg-purple-50">-€53,281.65</td>
                    <td className="px-2 sm:px-4 py-3 pt-6 text-red-500 bg-indigo-50">-€48,247.33</td>
                    <td className="px-2 sm:px-4 py-3 pt-6 text-gray-500 bg-teal-50">N/A</td>
                  </>
                )}
              </tr>
              <tr className="text-right">
                <td className="text-left font-medium text-gray-700 pr-2 sm:pr-4 py-3">Margin</td>
                <td className="px-2 sm:px-4 py-3 text-gray-900">-12166.68%</td>
                <td className="px-2 sm:px-4 py-3 text-green-500">-257.34%</td>
                <td className="px-2 sm:px-4 py-3 text-green-500 border-r-0 md:border-r-2 border-gray-300">11909.34%</td>
                {showPreviousYears && (
                  <>
                    <td className="px-2 sm:px-4 py-3 text-red-500 bg-purple-50">-240.54%</td>
                    <td className="px-2 sm:px-4 py-3 text-red-500 bg-indigo-50">-242.74%</td>
                    <td className="px-2 sm:px-4 py-3 text-gray-500 bg-teal-50">N/A</td>
                  </>
                )}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Search Container */}
        {showSearchContainer && (
          <div className="mt-4 p-4 border-t-2 border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Search for projects to add:</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Search projects..." 
                type="text"
              />
            </div>
            <div className="mt-4 max-h-48 overflow-y-auto">
              <div className="p-3 mb-2 bg-gray-100 rounded-lg cursor-grab active:cursor-grabbing flex justify-between items-center">
                <p className="text-sm font-medium text-gray-800">Project Alpha 2020</p>
                <DragIndicator className="w-4 h-4 text-gray-500" />
              </div>
              <div className="p-3 mb-2 bg-gray-100 rounded-lg cursor-grab active:cursor-grabbing flex justify-between items-center">
                <p className="text-sm font-medium text-gray-800">Project Beta 2019</p>
                <DragIndicator className="w-4 h-4 text-gray-500" />
              </div>
              <div className="p-3 bg-gray-100 rounded-lg cursor-grab active:cursor-grabbing flex justify-between items-center">
                <p className="text-sm font-medium text-gray-800">Project Gamma 2018</p>
                <DragIndicator className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top 3 Costs & Revenues */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 3 Costs & Revenues</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-100 p-4 rounded-lg">
                <p className="text-xs text-green-800 font-semibold">#1 Revenue</p>
                <p className="text-sm text-green-800 truncate">Advanced Credit Vouchers</p>
                <p className="text-lg font-bold text-green-600 mt-1">€7,650.00</p>
              </div>
              <div className="bg-red-100 p-4 rounded-lg">
                <p className="text-xs text-red-800 font-semibold">#1 Cost</p>
                <p className="text-sm text-red-800 truncate">Speciality Development</p>
                <p className="text-sm font-bold text-red-600 mt-1 whitespace-nowrap">€2,500,000.00</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-100 p-4 rounded-lg">
                <p className="text-xs text-green-800 font-semibold">#2 Revenue</p>
                <p className="text-sm text-green-800 truncate">Bill Tents / CASS</p>
                <p className="text-lg font-bold text-green-600 mt-1">€4,500.00</p>
              </div>
              <div className="bg-red-100 p-4 rounded-lg">
                <p className="text-xs text-red-800 font-semibold">#2 Cost</p>
                <p className="text-sm text-red-800 truncate">Communication Costs</p>
                <p className="text-sm font-bold text-red-600 mt-1 whitespace-nowrap">€1,000,000.00</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-100 p-4 rounded-lg">
                <p className="text-xs text-green-800 font-semibold">#3 Revenue</p>
                <p className="text-sm text-green-800 truncate">Travel Distance</p>
                <p className="text-lg font-bold text-green-600 mt-1">€3,000.00</p>
              </div>
              <div className="bg-red-100 p-4 rounded-lg">
                <p className="text-xs text-red-800 font-semibold">#3 Cost</p>
                <p className="text-sm text-red-800 truncate">Other</p>
                <p className="text-lg font-bold text-red-600 mt-1">€20,000.00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scenario Modeling */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Scenario Modeling</h3>
            <button className="text-sm text-blue-600 font-semibold border border-blue-200 px-3 py-1 rounded-md hover:bg-blue-50">
              Edit
            </button>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2 font-normal text-sm text-gray-500 w-1/4">Scenario</th>
                <th className="py-2 font-normal text-sm text-gray-500 w-1/4">Attendance</th>
                <th className="py-2 font-normal text-sm text-gray-500 w-1/4">Cashless</th>
                <th className="py-2 font-normal text-sm text-gray-500 w-1/4">Weather</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-4 font-medium text-gray-800">Best Case</td>
                <td className="py-4">
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">+10%</span>
                </td>
                <td className="py-4">
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">+5%</span>
                </td>
                <td className="py-4 text-gray-800">Good</td>
              </tr>
              <tr className="border-b">
                <td className="py-4 font-medium text-gray-800">Expected Case</td>
                <td className="py-4">
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">+5%</span>
                </td>
                <td className="py-4">
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">+2%</span>
                </td>
                <td className="py-4 text-gray-800">Normal</td>
              </tr>
              <tr className="border-b">
                <td className="py-4 font-medium text-gray-800">Worst Case</td>
                <td className="py-4">
                  <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">-10%</span>
                </td>
                <td className="py-4">
                  <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">-5%</span>
                </td>
                <td className="py-4 text-gray-800">Bad</td>
              </tr>
              <tr className="border-b">
                <td className="py-3">
                  <input 
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm" 
                    placeholder="Custom" 
                    type="text"
                  />
                </td>
                <td className="py-3 pl-2">
                  <input 
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm" 
                    placeholder="e.g., +8%" 
                    type="text"
                  />
                </td>
                <td className="py-3 pl-2">
                  <input 
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm" 
                    placeholder="e.g., -3%" 
                    type="text"
                  />
                </td>
                <td className="py-3 pl-2">
                  <input 
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm" 
                    placeholder="e.g., Stormy" 
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

      {/* Similar Events and Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Similar Events */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Similar Events</h3>
            <div className="relative group">
              <button className="flex items-center text-sm text-blue-600 font-semibold border border-blue-200 px-3 py-1 rounded-md hover:bg-blue-50">
                <DragIndicator className="w-4 h-4 mr-1 text-blue-600" />
                Edit
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                Drag to reorder
              </div>
            </div>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2 font-normal text-sm text-gray-500">Event Name</th>
                <th className="py-2 font-normal text-sm text-gray-500">Net Margin</th>
                <th className="py-2 font-normal text-sm text-gray-500">Attendance</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b group cursor-move">
                <td className="py-3 font-medium text-gray-800">Festival A</td>
                <td className="py-3 text-gray-800">€120,500.00</td>
                <td className="py-3 text-gray-800">15,000</td>
              </tr>
              <tr className="border-b group cursor-move">
                <td className="py-3 font-medium text-gray-800">Concert B</td>
                <td className="py-3 text-gray-800">€98,000.00</td>
                <td className="py-3 text-gray-800">12,500</td>
              </tr>
              <tr className="group cursor-move">
                <td className="py-3 font-medium text-gray-800">Gala C</td>
                <td className="py-3 text-gray-800">€210,000.00</td>
                <td className="py-3 text-gray-800">800</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Suggestions Box */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Suggestions Box</h3>
          <p className="text-sm text-gray-600 mb-4">Have an idea or suggestion? We'd love to hear from you.</p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="suggestion-category">
              Category
            </label>
            <select 
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-blue-500 focus:border-blue-500" 
              id="suggestion-category"
              value={suggestionForm.category}
              onChange={(e) => setSuggestionForm(prev => ({ ...prev, category: e.target.value }))}
            >
              <option>Feature Request</option>
              <option>UI Improvement</option>
              <option>Bug Report</option>
              <option>Other</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="suggestion-tags">
              Tags (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {suggestionForm.tags.map((tag, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
                  {tag}
                  <button 
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1.5 text-blue-500 hover:text-blue-700"
                  >
                    <Close className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input 
              className="w-full border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500 mt-2" 
              placeholder="Add tags like 'reporting', 'UX', 'performance'..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddTag(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>

          <textarea 
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-blue-500 focus:border-blue-500" 
            placeholder="Share your suggestions with us..." 
            rows={3}
            value={suggestionForm.content}
            onChange={(e) => setSuggestionForm(prev => ({ ...prev, content: e.target.value }))}
          />
          <button 
            onClick={handleSubmitSuggestion}
            className="mt-4 w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700"
          >
            Submit Suggestion
          </button>
        </div>
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
    <div className="flex h-full flex-col">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
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
      <div className="flex-1 overflow-y-auto p-6">
        {renderTabContent()}
      </div>
    </div>
  );
}