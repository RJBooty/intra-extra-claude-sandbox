import React, { useState } from 'react';
import { ChevronDown, DollarSign, TrendingDown, Edit, Plus, Trash2, Receipt } from 'lucide-react';

export function CostsTab() {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    tickets_cashless: false,
    hardware: false,
    wristbands_cards: false,
    logistics: false,
    staffing: false,
    equipment: false,
    development: false,
    other_costs: false
  });

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

  return (
    <div className="max-w-full mx-auto bg-white">
      {/* KPI Header */}
      <div className="sticky top-0 bg-white z-10 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-slate-800">Event P&L</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
              <span>Edit Costs</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 uppercase">REVENUE</p>
                <p className="text-xl font-bold text-gray-800 mt-1">€29,644.79</p>
              </div>
              <span className="material-icons text-green-500 bg-green-100 p-2 rounded-full">account_balance_wallet</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 uppercase">COSTS</p>
                <p className="text-xl font-bold text-gray-800 mt-1">€3,636,439.79</p>
              </div>
              <span className="material-icons text-red-500 bg-red-100 p-2 rounded-full">receipt_long</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 uppercase">PROFIT</p>
                <p className="text-xl font-bold text-gray-800 mt-1">-€3,606,795.00</p>
              </div>
              <span className="material-icons text-blue-500 bg-blue-100 p-2 rounded-full">trending_up</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 uppercase">MARGIN</p>
                <p className="text-xl font-bold text-gray-800 mt-1">-12,166.40%</p>
              </div>
              <span className="material-icons text-indigo-500 bg-indigo-100 p-2 rounded-full">pie_chart</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Cost Categories Overview */}
        <div className="bg-slate-50 p-6 rounded-lg mb-8 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Cost Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-500 uppercase">TICKETS & CASHLESS</p>
                  <p className="text-lg font-bold text-gray-800 mt-1">€466.80</p>
                </div>
                <span className="material-icons text-lg text-red-500 bg-red-100 p-2 rounded-full">credit_card</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-cyan-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-500 uppercase">HARDWARE</p>
                  <p className="text-lg font-bold text-gray-800 mt-1">€31,500.00</p>
                </div>
                <span className="material-icons text-lg text-cyan-500 bg-cyan-100 p-2 rounded-full">devices</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-amber-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-500 uppercase">WBs / CARDS / PASSES</p>
                  <p className="text-lg font-bold text-gray-800 mt-1">€19,000.00</p>
                </div>
                <span className="material-icons text-lg text-amber-500 bg-amber-100 p-2 rounded-full">watch</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-lime-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-500 uppercase">LOGISTICS</p>
                  <p className="text-lg font-bold text-gray-800 mt-1">€18,000.00</p>
                </div>
                <span className="material-icons text-lg text-lime-500 bg-lime-100 p-2 rounded-full">local_shipping</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-500 uppercase">STAFFING</p>
                  <p className="text-lg font-bold text-gray-800 mt-1">€16,650.00</p>
                </div>
                <span className="material-icons text-lg text-purple-500 bg-purple-100 p-2 rounded-full">people</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-pink-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-500 uppercase">EQUIPMENT</p>
                  <p className="text-lg font-bold text-gray-800 mt-1">€5,580.00</p>
                </div>
                <span className="material-icons text-lg text-pink-500 bg-pink-100 p-2 rounded-full">build</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-teal-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-500 uppercase">SPECIAL DEVELOPMENT</p>
                  <p className="text-lg font-bold text-gray-800 mt-1">€3,520,728.98</p>
                </div>
                <span className="material-icons text-lg text-teal-500 bg-teal-100 p-2 rounded-full">code</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-gray-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-500 uppercase">OTHER COSTS</p>
                  <p className="text-lg font-bold text-gray-800 mt-1">€25,000.00</p>
                </div>
                <span className="material-icons text-lg text-gray-500 bg-gray-100 p-2 rounded-full">apps</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Costs Section */}
        <div className="bg-slate-50 p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <span className="material-icons mr-2 text-red-500">receipt_long</span>
                <span>COSTS</span>
                <div className="relative group ml-2">
                  <span className="material-icons text-slate-500 cursor-help">info_outline</span>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-800 text-white text-sm rounded-md p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                    Red highlighted fields indicate costs that are above the benchmark or require review.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-800"></div>
                  </div>
                </div>
              </h2>
              <div className="relative">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input 
                  className="pl-10 pr-4 py-1.5 border border-slate-300 rounded-md text-sm w-64 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                  placeholder="Search costs..." 
                  type="text"
                />
              </div>
              <div className="relative inline-block text-left">
                <button 
                  className="inline-flex w-full justify-center items-center gap-x-1.5 rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50" 
                  type="button"
                >
                  <span className="material-icons -ml-1">download</span>
                  Export
                  <svg className="-mr-1 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path clipRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" fillRule="evenodd"></path>
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white rounded-md border border-slate-300 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <span className="material-icons text-base">lock_open</span>
                  Lock Estimate
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-800 text-white text-sm rounded-md p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                  Locking the estimate will save the current estimated costs. These values will then be used for comparison against the actual costs in the report.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-800"></div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-500 mb-1">ESTIMATED TOTAL</p>
                <p className="text-lg font-bold text-gray-800">€3,636,439.79</p>
              </div>
            </div>
          </div>

          {/* Cost Categories */}
          <div className="space-y-2">
            {/* TICKETS & CASHLESS */}
            <div className="bg-white rounded-lg">
              <button 
                onClick={() => toggleCollapse('tickets_cashless')}
                className="w-full p-4 cursor-pointer flex justify-between items-center font-semibold text-slate-800 text-base"
              >
                <div className="flex items-center">
                  <ChevronDown className={`transition-transform duration-200 mr-2 text-slate-500 w-5 h-5 ${collapsedSections.tickets_cashless ? 'rotate-180' : ''}`} />
                  <span className="material-icons mr-2 text-slate-600">credit_card</span>
                  <span>TICKETS & CASHLESS</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-right text-sm font-bold w-24">€466.80</span>
                </div>
              </button>
              {!collapsedSections.tickets_cashless && (
                <div className="p-4 border-t border-slate-200 bg-slate-50">
                  <div className="grid grid-cols-8 gap-x-4 items-center mb-2 text-xs font-semibold text-slate-500 px-4">
                    <span className="col-span-2"></span>
                    <span className="text-right">Qty</span>
                    <span className="text-right">Fee Per</span>
                    <span className="text-right">Perf. %</span>
                    <span className="text-right">Total</span>
                    <span className="col-span-2"></span>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-8 gap-x-4 items-center px-4 py-2 hover:bg-slate-100 rounded-md bg-white">
                      <span className="text-sm text-slate-600 col-span-2">Ticketing Transaction Costs</span>
                      <input className="w-full text-right text-sm border-slate-300 rounded-md" type="text" defaultValue="1500" />
                      <input className="w-full text-right text-sm border-slate-300 rounded-md" type="text" defaultValue="€0.08" />
                      <input className="w-full text-right text-sm border-slate-300 rounded-md" type="text" defaultValue="0.00%" />
                      <span className="text-sm text-slate-800 font-medium text-right">€120.00</span>
                      <div className="col-span-2 flex items-center justify-end space-x-1">
                        <button className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-8 gap-x-4 items-center px-4 py-2 hover:bg-slate-100 rounded-md bg-white">
                      <span className="text-sm text-slate-600 col-span-2">Ticketing Addons Costs</span>
                      <input className="w-full text-right text-sm border-slate-300 rounded-md" type="text" defaultValue="1335" />
                      <input className="w-full text-right text-sm border-slate-300 rounded-md" type="text" defaultValue="€0.08" />
                      <input className="w-full text-right text-sm border-slate-300 rounded-md" type="text" defaultValue="0.00%" />
                      <span className="text-sm text-slate-800 font-medium text-right">€106.80</span>
                      <div className="col-span-2 flex items-center justify-end space-x-1">
                        <button className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-8 gap-x-4 items-center px-4 py-2 hover:bg-slate-100 rounded-md bg-white">
                      <span className="text-sm text-slate-600 col-span-2">Cashless Refund Fee</span>
                      <input className="w-full text-right text-sm border-slate-300 rounded-md" type="text" defaultValue="900" />
                      <input className="w-full text-right text-sm border-red-500 focus:ring-red-500 focus:border-red-500 text-red-600 bg-red-50 rounded-md" type="text" defaultValue="€0.50" />
                      <input className="w-full text-right text-sm border-slate-300 rounded-md" type="text" defaultValue="0.00%" />
                      <span className="text-sm text-slate-800 font-medium text-right">€0.00</span>
                      <div className="col-span-2 flex items-center justify-end space-x-1">
                        <button className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-8 gap-x-4 items-center px-4 py-2 hover:bg-slate-100 rounded-md bg-white">
                      <span className="text-sm text-slate-600 col-span-2">Advanced Credit Costs</span>
                      <input className="w-full text-right text-sm border-slate-300 rounded-md" type="text" defaultValue="3000" />
                      <input className="w-full text-right text-sm border-slate-300 rounded-md" type="text" defaultValue="€0.08" />
                      <input className="w-full text-right text-sm border-slate-300 rounded-md" type="text" defaultValue="0.00%" />
                      <span className="text-sm text-slate-800 font-medium text-right">€240.00</span>
                      <div className="col-span-2 flex items-center justify-end space-x-1">
                        <button className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* HARDWARE */}
            <div className="bg-white rounded-lg">
              <button 
                onClick={() => toggleCollapse('hardware')}
                className="w-full p-4 cursor-pointer flex justify-between items-center font-semibold text-slate-800 text-base"
              >
                <div className="flex items-center">
                  <ChevronDown className={`transition-transform duration-200 mr-2 text-slate-500 w-5 h-5 ${collapsedSections.hardware ? 'rotate-180' : ''}`} />
                  <span className="material-icons mr-2 text-slate-600">devices</span>
                  <span>HARDWARE</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-right text-sm font-bold w-24">€31,500.00</span>
                </div>
              </button>
              {!collapsedSections.hardware && (
                <div className="p-4 border-t border-slate-200 bg-slate-50">
                  <div className="grid grid-cols-6 gap-x-4 items-center mb-2 text-xs font-semibold text-slate-500 px-4">
                    <span className="col-span-2"></span>
                    <span className="text-right">Qty</span>
                    <span className="text-right">Fee Per</span>
                    <span className="text-right">Total</span>
                    <span></span>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-6 gap-x-4 items-center px-4 py-2 hover:bg-slate-100 rounded-md bg-white">
                      <span className="text-sm text-slate-600 col-span-2">Handhelds / Phones</span>
                      <span className="text-right text-sm text-slate-700">200</span>
                      <span className="text-right text-sm text-slate-700">€45.00</span>
                      <span className="text-right font-semibold text-sm text-red-600 bg-red-50 px-2 py-1 rounded">€9,000.00</span>
                      <div className="flex items-center justify-end space-x-1">
                        <button className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-6 gap-x-4 items-center px-4 py-2 hover:bg-slate-100 rounded-md bg-white">
                      <span className="text-sm text-slate-600 col-span-2">EPOS / SoftPOS</span>
                      <span className="text-right text-sm text-slate-700">150</span>
                      <span className="text-right text-sm text-slate-700">€50.00</span>
                      <span className="text-right font-semibold text-sm text-red-600 bg-red-50 px-2 py-1 rounded">€7,500.00</span>
                      <div className="flex items-center justify-end space-x-1">
                        <button className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-6 gap-x-4 items-center px-4 py-2 hover:bg-slate-100 rounded-md bg-white">
                      <span className="text-sm text-slate-600 col-span-2">Access Units</span>
                      <span className="text-right text-sm text-slate-700">10</span>
                      <span className="text-right text-sm text-slate-700">€250.00</span>
                      <span className="text-right font-semibold text-sm text-slate-800">€2,500.00</span>
                      <div className="flex items-center justify-end space-x-1">
                        <button className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-6 gap-x-4 items-center px-4 py-2 hover:bg-slate-100 rounded-md bg-white">
                      <span className="text-sm text-slate-600 col-span-2">Totems</span>
                      <span className="text-right text-sm text-slate-700">10</span>
                      <span className="text-right text-sm text-slate-700">€750.00</span>
                      <span className="text-right font-semibold text-sm text-red-600 bg-red-50 px-2 py-1 rounded">€7,500.00</span>
                      <div className="flex items-center justify-end space-x-1">
                        <button className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-6 gap-x-4 items-center px-4 py-2 hover:bg-slate-100 rounded-md bg-white">
                      <span className="text-sm text-slate-600 col-span-2">Mini-Totems</span>
                      <span className="text-right text-sm text-slate-700">10</span>
                      <span className="text-right text-sm text-slate-700">€500.00</span>
                      <span className="text-right font-semibold text-sm text-red-600 bg-red-50 px-2 py-1 rounded">€5,000.00</span>
                      <div className="flex items-center justify-end space-x-1">
                        <button className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Simplified placeholders for remaining categories */}
            {[
              { key: 'wristbands_cards', name: 'WBs / CARDS / PASSES', icon: 'watch', amount: '€19,000.00' },
              { key: 'logistics', name: 'LOGISTICS', icon: 'local_shipping', amount: '€18,000.00' },
              { key: 'staffing', name: 'STAFFING', icon: 'people', amount: '€16,650.00' },
              { key: 'equipment', name: 'EQUIPMENT', icon: 'build', amount: '€5,580.00' },
              { key: 'development', name: 'SPECIAL DEVELOPMENT', icon: 'code', amount: '€3,520,728.98' },
              { key: 'other_costs', name: 'OTHER COSTS', icon: 'apps', amount: '€25,000.00' }
            ].map((category) => (
              <div key={category.key} className="bg-white rounded-lg">
                <button 
                  onClick={() => toggleCollapse(category.key)}
                  className="w-full p-4 cursor-pointer flex justify-between items-center font-semibold text-slate-800 text-base"
                >
                  <div className="flex items-center">
                    <ChevronDown className={`transition-transform duration-200 mr-2 text-slate-500 w-5 h-5 ${collapsedSections[category.key] ? 'rotate-180' : ''}`} />
                    <span className="material-icons mr-2 text-slate-600">{category.icon}</span>
                    <span>{category.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-right text-sm font-bold w-24">{category.amount}</span>
                  </div>
                </button>
                {!collapsedSections[category.key] && (
                  <div className="p-4 border-t border-slate-200 bg-slate-50">
                    <div className="p-8 text-center text-gray-500">
                      <p>Detailed breakdown for {category.name} would be displayed here</p>
                      <p className="text-sm mt-2">Similar table structure with editable fields</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}