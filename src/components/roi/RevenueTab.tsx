import React, { useState, useEffect } from 'react';
import { ChevronDown, DollarSign, TrendingDown, Edit, Plus, Trash2, Receipt } from 'lucide-react';
import Papa from 'papaparse';

interface RevenueItem {
  category: string;
  subcategory: string;
  name: string;
  tktPrice?: string;
  qty?: string;
  feePercent?: string;
  valuePerTkt?: string;
  salesPerf?: string;
  totalTktUnits?: string;
  total: string;
  feePer?: string;
  perf?: string;
  avgSpend?: string;
  avgTktPrice?: string;
}

export function RevenueTab() {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    'TICKETING - MAINS': false,
    'TICKETING ADDONS': false,
    'WRISTBANDS & DEVICES': false,
    'PLANS & INSURANCE': false,
    'ACCESS & ACCRED': false,
    'CASHLESS': false,
    'INSIGHTS & DATA': false,
    'COMMERCIAL MODULES': false
  });
  
  const [revenueData, setRevenueData] = useState<RevenueItem[]>([]);

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
    const loadRevenueData = async () => {
      try {
        const response = await fetch('/revenue_1.csv');
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          complete: (results) => {
            const parsedData: RevenueItem[] = [];
            let currentCategory = '';
            
            results.data.forEach((row: any, index: number) => {
              // Skip empty rows or rows with all empty values
              if (!row || row.length === 0 || row.every((cell: any) => !cell || cell === '')) {
                return;
              }
              
              // Get the first cell and check what it contains
              const firstCell = row[0] ? row[0].toString() : '';
              const firstCellTrimmed = firstCell.trim();
              
              // Debug log to see what we're getting
              if (index < 20) {
                console.log(`Row ${index} - First cell: "${firstCell}" | Trimmed: "${firstCellTrimmed}" | Second cell: "${row[1]}"`);
              }
              
              // Check if this is a data row (starts with dash)
              if (firstCellTrimmed === '-' && row[1] && row[1].toString().trim() !== '') {
                const item: RevenueItem = {
                  category: currentCategory,
                  subcategory: '',
                  name: row[1].toString().trim(),
                  tktPrice: row[4] || '',
                  qty: row[5] || '',
                  feePercent: row[6] || '',
                  valuePerTkt: row[7] || '',
                  salesPerf: row[8] || '',
                  totalTktUnits: row[9] || '',
                  total: row[10] || '€0.00',
                  feePer: row[6] || '',
                  perf: row[8] || '',
                  avgSpend: row[4] || '',
                  avgTktPrice: row[4] || ''
                };
                console.log(`Adding item to ${currentCategory}: ${item.name}`);
                parsedData.push(item);
              }
              // Check if this is a category header row
              else if (firstCellTrimmed && firstCellTrimmed !== '-' && firstCellTrimmed !== '') {
                // This is a category row
                currentCategory = firstCellTrimmed;
                console.log(`Found category at row ${index}: ${currentCategory}`);
              }
            });
            
            console.log('Parsed revenue data:', parsedData);
            setRevenueData(parsedData);
          },
          header: false,
          skipEmptyLines: true
        });
      } catch (error) {
        console.error('Error loading revenue data:', error);
      }
    };

    loadRevenueData();
  }, []);

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
              <span>Edit Revenue</span>
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
        {/* Revenue Categories Overview */}
        <div className="bg-slate-50 p-6 rounded-lg mb-8 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Revenue Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.keys(collapsedSections).map((category, index) => {
              const categoryData = revenueData.filter(item => item.category === category);
              const categoryTotal = categoryData.reduce((sum, item) => {
                const total = parseFloat(item.total.replace(/[€,]/g, '')) || 0;
                return sum + total;
              }, 0);
              
              const colors = ['red', 'cyan', 'amber', 'lime', 'purple', 'pink', 'teal', 'gray'];
              const icons = ['credit_card', 'devices', 'watch', 'local_shipping', 'people', 'build', 'code', 'apps'];
              const color = colors[index % colors.length];
              const icon = icons[index % icons.length];
              
              return (
                <div key={category} className={`bg-white p-4 rounded-lg shadow-sm border-l-4 border-${color}-500`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">{category}</p>
                      <p className="text-lg font-bold text-gray-800 mt-1">€{categoryTotal.toLocaleString('en-EU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <span className={`material-icons text-lg text-${color}-500 bg-${color}-100 p-2 rounded-full`}>{icon}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Revenue Section */}
        <div className="bg-slate-50 p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <span className="material-icons mr-2 text-red-500">receipt_long</span>
                <span>REVENUE</span>
                <div className="relative group ml-2">
                  <span className="material-icons text-slate-500 cursor-help">info_outline</span>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-800 text-white text-sm rounded-md p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                    Red highlighted fields indicate revenue that are above the benchmark or require review.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-800"></div>
                  </div>
                </div>
              </h2>
              <div className="relative">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input 
                  className="pl-10 pr-4 py-1.5 border border-slate-300 rounded-md text-sm w-64 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                  placeholder="Search revenue..." 
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
                  Locking the estimate will save the current estimated revenue. These values will then be used for comparison against the actual revenue in the report.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-800"></div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-500 mb-1">ESTIMATED TOTAL</p>
                <p className="text-lg font-bold text-gray-800">€{revenueData.reduce((sum, item) => {
                  const total = parseFloat(item.total.replace(/[€,]/g, '')) || 0;
                  return sum + total;
                }, 0).toLocaleString('en-EU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>

          {/* Revenue Categories */}
          <div className="space-y-2">
            {Object.keys(collapsedSections).map((category) => {
              const categoryData = revenueData.filter(item => item.category === category);
              const categoryTotal = categoryData.reduce((sum, item) => {
                const total = parseFloat(item.total.replace(/[€,]/g, '')) || 0;
                return sum + total;
              }, 0);
              
              const icons = ['credit_card', 'devices', 'watch', 'local_shipping', 'people', 'build', 'code', 'apps'];
              const icon = icons[Object.keys(collapsedSections).indexOf(category) % icons.length];
              
              return (
                <div key={category} className="bg-white rounded-lg">
                  <button 
                    onClick={() => toggleCollapse(category)}
                    className="w-full p-4 cursor-pointer flex justify-between items-center font-semibold text-slate-800 text-base"
                  >
                    <div className="flex items-center">
                      <ChevronDown className={`transition-transform duration-200 mr-2 text-slate-500 w-5 h-5 ${collapsedSections[category] ? 'rotate-180' : ''}`} />
                      <span className="material-icons mr-2 text-slate-600">{icon}</span>
                      <span>{category}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-right text-sm font-bold w-24">€{categoryTotal.toLocaleString('en-EU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </button>
                  {!collapsedSections[category] && (
                    <div className="p-4 border-t border-slate-200 bg-slate-50">
                      <div className="grid grid-cols-8 gap-x-4 items-center mb-2 text-xs font-semibold text-slate-500 px-4">
                        <span className="col-span-2">Item</span>
                        <span className="text-right">Qty</span>
                        <span className="text-right">Fee/Price</span>
                        <span className="text-right">Fee %</span>
                        <span className="text-right">Perf %</span>
                        <span className="text-right">Total</span>
                        <span></span>
                      </div>
                      <div className="space-y-3">
                        {categoryData.map((item, index) => (
                          <div key={index} className="grid grid-cols-8 gap-x-4 items-center px-4 py-2 hover:bg-slate-100 rounded-md bg-white">
                            <span className="text-sm text-slate-600 col-span-2">{item.name}</span>
                            <input className="w-full text-right text-sm border-slate-300 rounded-md" type="text" defaultValue={item.qty || ''} />
                            <input className="w-full text-right text-sm border-slate-300 rounded-md" type="text" defaultValue={item.tktPrice || item.feePer || ''} />
                            <input className="w-full text-right text-sm border-slate-300 rounded-md" type="text" defaultValue={item.feePercent || ''} />
                            <input className="w-full text-right text-sm border-slate-300 rounded-md" type="text" defaultValue={item.salesPerf || item.perf || ''} />
                            <span className="text-sm text-slate-800 font-medium text-right">{item.total}</span>
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
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}