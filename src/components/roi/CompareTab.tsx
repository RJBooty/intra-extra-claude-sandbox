import React, { useState, useRef, useEffect } from 'react';
import { FileDown, BarChart3, TrendingUp, PieChart, Plus, Search, X, Info } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type ChartType = 'bar' | 'line' | 'doughnut';

interface ProjectData {
  id: string;
  name: string;
  logo?: string;
  totalRevenue: number;
  totalCosts: number;
  profit: number;
  margin: number;
  topRevenueDriver: string;
  topCostDriver: string;
}

export function CompareTab() {
  const [chartType, setChartType] = useState<ChartType>('doughnut');
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showAddProjectDropdown, setShowAddProjectDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const addProjectDropdownRef = useRef<HTMLDivElement>(null);

  // Sample project data - matching original HTML exactly
  const [projects] = useState<ProjectData[]>([
    {
      id: 'alpha',
      name: 'Project Alpha',
      logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHWjawwqy5kZLwKBf7jJ7QLCb7er4ruVJuKRKL6c3ipgV4XkUAmsaV9mjWF4Oz7pZ7tlfaYPzNWElllVkghim0G3IPzCVRLUMhLLXUex0mD6NinuMeZ_JNVbVx5wdKal1YSD_CbTHybUdzL4wxanatuon7bQuugJqZMlJvuUYhhPC1e6EImAc8e5sLsg-9LoqJPanHiYsRt-6CkUshBcDmqm00Z2F5LS2FDdPMc0qc7zi_qsc7CLb1GvLYJ9kbK3Zt1Lzd-DpAKeMi',
      totalRevenue: 128450,
      totalCosts: 75432.10,
      profit: 53017.90,
      margin: 41.27,
      topRevenueDriver: 'Ticketing',
      topCostDriver: 'Staffing'
    },
    {
      id: 'beta',
      name: 'Project Beta',
      logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBv4U1R8Rf0MITQJoZFk1JV09huYt1pAiq3Hw6-9gV0niyb0or3AbByUVcGk0BKWho6kjwq1d1yjfmUZMA5Cb6bnmLQunNIk7-_D5vD05yIfVMKMxcaQiwWmgCYPkCXcGimmA8Qq4tqqgUYTzA_cuNHHBT6ErcQ557hHLSvBsCWmuSfriRA38uGL_zx8S_hHBflzjSgv4lJPYdtXBTRVmO-xDcqnFnHsh8lw8raeQK79u5Xq5Y4-8aGJOadasSY4akZ1trQfZaRQFiI',
      totalRevenue: 105300,
      totalCosts: 68123.45,
      profit: 37176.55,
      margin: 35.31,
      topRevenueDriver: 'Cashless',
      topCostDriver: 'Logistics'
    },
    {
      id: 'gamma',
      name: 'Project Gamma',
      logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYPj1AoLbxvhYaaNoB3icrHJQ8ALuhTU7rFFiQg4UwG5NwWnLdXH5egeZBByJfyvVN_0E71UukkVB8WtW6kD4q6O17-QAfYVxyU0BJOTCl7gqshtc_DIt6YymBFBIX0V19dEydQSjmbNHSxuC4_8u4LpI1MeNCRBM4sugle9IhrI38Nq7R3zIGs2CT4ikCDgK4FyEm8aud32JTxEY9aIDdgnK98YaPTxWfBVX27OhuBBwR0twrIcRugkfKU_WCSjwJkCdqp7g5Ki5v',
      totalRevenue: 205000,
      totalCosts: 92500.00,
      profit: 112500.00,
      margin: 54.88,
      topRevenueDriver: 'Ticketing',
      topCostDriver: 'Hardware'
    },
    {
      id: 'delta',
      name: 'Project Delta',
      logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDV-tXylNrtPsScyFVyD9QyGoXXeNgHUkxyPBdvmx46MulAn3cyQpzLQBY1P531kgM90Nsc3PeM0nSqJkj7H0OAfk9aeDQYocIo0tYk19NPTZWu2cB2vtF7HN0EGtZTl3gIBNFY2F-AlvxtDd-YpuecK1vJ0v0svpGNQY4Snlf60tiOPwm13LPq681K96Q952AeGodeftVBcVwkHtrOCPRgnrL4DzvB60Xwi_NeclPwzCAI5boK-ImgqdBUOzDoG3y0vpc--qkY5sIC',
      totalRevenue: 153200,
      totalCosts: 110320.50,
      profit: 42879.50,
      margin: 27.99,
      topRevenueDriver: 'Partnerships',
      topCostDriver: 'Staffing'
    }
  ]);

  // Available projects for adding
  const availableProjects = [
    'Project Epsilon',
    'Project Zeta',
    'Project Eta',
    'Project Theta',
    'Project Iota'
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
      if (addProjectDropdownRef.current && !addProjectDropdownRef.current.contains(event.target as Node)) {
        setShowAddProjectDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Chart.js data and options matching the original HTML
  const chartData = {
    labels: ['Project Alpha', 'Project Beta', 'Project Gamma', 'Project Delta'],
    datasets: [
      {
        label: 'Total Revenue',
        data: [128450, 105300, 205000, 153200],
        backgroundColor: '#10b981', // darkPastelGreen
        borderColor: '#10b981',
        borderWidth: 2,
        borderRadius: 6,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Total Costs',
        data: [75432.10, 68123.45, 92500.00, 110320.50],
        backgroundColor: '#f87171', // darkPastelRed
        borderColor: '#f87171',
        borderWidth: 2,
        borderRadius: 6,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
        },
        ticks: {
          padding: 10,
          callback: function(value: any) {
            return '€' + value.toLocaleString('de-DE');
          },
          font: {
            family: 'Inter',
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: 'Inter',
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        align: 'start' as const,
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          borderRadius: 6,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            family: 'Inter',
            size: 14
          }
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('de-DE', {
                style: 'currency',
                currency: 'EUR'
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  const getChartIcon = (type: ChartType) => {
    switch (type) {
      case 'bar': return BarChart3;
      case 'line': return TrendingUp;
      case 'doughnut': return PieChart;
    }
  };

  const CircularChart = ({ project }: { project: ProjectData }) => {
    const revenuePercentage = (project.totalRevenue / (project.totalRevenue + project.totalCosts)) * 100;
    const costsPercentage = (project.totalCosts / (project.totalRevenue + project.totalCosts)) * 100;
    
    // Calculate angles for the segments
    const revenueAngle = (revenuePercentage / 100) * 360;
    const costsAngle = (costsPercentage / 100) * 360;

    return (
      <div className="flex flex-col items-center">
        <div className="h-40 w-40 relative">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="35"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            {/* Revenue segment (green) */}
            <circle
              cx="50"
              cy="50"
              r="35"
              fill="none"
              stroke="#6ee7b7"
              strokeWidth="8"
              strokeDasharray={`${(revenuePercentage / 100) * 220} 220`}
              strokeDashoffset="0"
              strokeLinecap="round"
            />
            {/* Costs segment (red) */}
            <circle
              cx="50"
              cy="50"
              r="35"
              fill="none"
              stroke="#fca5a5"
              strokeWidth="8"
              strokeDasharray={`${(costsPercentage / 100) * 220} 220`}
              strokeDashoffset={`-${(revenuePercentage / 100) * 220}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-purple-600">{Math.round(project.margin)}%</span>
            <span className="text-sm text-gray-500">Margin</span>
          </div>
        </div>
        <h4 className="mt-4 font-semibold text-gray-800">{project.name}</h4>
      </div>
    );
  };

  return (
    <div className="flex-1 p-4 sm:p-8 relative">
      <style dangerouslySetInnerHTML={{
        __html: `
          .tooltip-container:hover .tooltip {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
          }
          .comparison-table-column:nth-child(odd) {
            background-color: #ffffff;
          }
          .comparison-table .border-l {
            border-left-color: #e5e7eb;
          }
          tbody tr:last-child td {
            border-bottom: none;
          }
        `
      }} />
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Compare Projects</h2>
        </div>
        <div className="flex items-center space-x-4 w-full sm:w-auto relative dropdown" ref={exportDropdownRef}>
          <button 
            onClick={() => setShowExportDropdown(!showExportDropdown)}
            className="flex items-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 w-full sm:w-auto justify-center"
          >
            <span className="material-icons text-lg">file_upload</span>
            <span className="ml-2 text-sm font-medium">Export</span>
            <span className="material-icons text-lg ml-1">expand_more</span>
          </button>
          
          {/* Export Dropdown */}
          <div className={`dropdown-menu absolute right-0 mt-2 z-10 w-56 bg-white rounded-lg shadow-xl border border-gray-200 ${showExportDropdown ? 'block' : 'hidden'}`}>
              <div className="p-3">
                <p className="text-sm font-semibold text-gray-800 mb-2">Export formats</p>
                <div className="space-y-1">
                  <button className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md">
                    <span className="material-icons-outlined text-base mr-3">picture_as_pdf</span>
                    <span>PDF <span className="text-gray-400 text-xs">(Vector)</span></span>
                  </button>
                  <button className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md">
                    <span className="material-icons-outlined text-base mr-3">image</span>
                    <span>PNG <span className="text-gray-400 text-xs">(Raster)</span></span>
                  </button>
                  <button className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md">
                    <span className="material-icons-outlined text-base mr-3">description</span>
                    <span>CSV <span className="text-gray-400 text-xs">(Raw data)</span></span>
                  </button>
                </div>
              </div>
            </div>
        </div>
      </header>

      {/* ROI Comparison Chart Section */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 sm:mb-0">ROI Comparison</h3>
          <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setChartType('bar')}
              className={`flex items-center text-sm font-medium px-3 py-1 rounded-md ${
                chartType === 'bar' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="material-icons text-base mr-1">bar_chart</span>
              Bar
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`flex items-center text-sm font-medium px-3 py-1 rounded-md ${
                chartType === 'line' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="material-icons text-base mr-1">show_chart</span>
              Line
            </button>
            <button
              onClick={() => setChartType('doughnut')}
              className={`flex items-center text-sm font-medium px-3 py-1 rounded-md ${
                chartType === 'doughnut' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="material-icons text-base mr-1">donut_small</span>
              Circular
            </button>
          </div>
        </div>

        {/* Chart Display */}
        {chartType === 'doughnut' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              {projects.map(project => (
                <CircularChart key={project.id} project={project} />
              ))}
            </div>
            <div className="mt-6 flex justify-center space-x-6 text-sm">
              <div className="flex items-center">
                <span className="h-3 w-3 rounded-full bg-teal-400 mr-2"></span>
                <span className="text-gray-600">Total Revenue</span>
              </div>
              <div className="flex items-center">
                <span className="h-3 w-3 rounded-full bg-rose-400 mr-2"></span>
                <span className="text-gray-600">Total Costs</span>
              </div>
            </div>
          </>
        ) : (
          <div className="h-80">
            {chartType === 'bar' && (
              <Bar 
                data={chartData} 
                options={chartOptions}
              />
            )}
            {chartType === 'line' && (
              <Line 
                data={{
                  ...chartData,
                  datasets: chartData.datasets.map(dataset => ({
                    ...dataset,
                    backgroundColor: dataset.label === 'Total Revenue' 
                      ? 'rgba(110, 231, 183, 0.8)' 
                      : 'rgba(252, 165, 165, 0.8)',
                    borderColor: dataset.borderColor,
                    fill: true,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: dataset.borderColor,
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                  }))
                }} 
                options={{
                  ...chartOptions,
                  elements: {
                    point: {
                      radius: 4,
                      hoverRadius: 6,
                      backgroundColor: '#fff',
                      borderWidth: 2
                    }
                  }
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Comparison Details Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 px-6 pt-6">Comparison Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse comparison-table">
            <thead className="bg-gray-50">
              <tr className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-[16.66%] bg-white align-top">
                  <div className="flex items-center gap-x-2 pt-16">
                    <span>ROI Field</span>
                    <span className="material-icons text-base opacity-0 group-hover:opacity-100 transition-opacity">unfold_more</span>
                  </div>
                </th>
                {projects.map((project, index) => (
                  <th key={project.id} className={`py-3 px-4 text-center w-[16.66%] ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${index > 0 ? 'border-l' : ''}`}>
                    <div className="flex flex-col items-center justify-center gap-y-2 group tooltip-container relative">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 relative transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                        <img 
                          alt="Company Logo" 
                          className="h-8 w-8 rounded-full object-cover" 
                          src={project.logo}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="material-icons text-white">info_outline</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-x-1">
                        <span>{project.name}</span>
                        <button className="text-gray-400 hover:text-red-500">
                          <span className="material-icons text-base">cancel</span>
                        </button>
                      </div>
                      <div className="tooltip absolute z-10 w-64 bg-gray-900 text-white text-sm rounded-lg shadow-lg p-3 opacity-0 invisible transition-all duration-300 -mt-2 transform -translate-y-full top-0 left-1/2 -translate-x-1/2">
                        <h4 className="font-bold mb-2">{project.name}</h4>
                        <p className="text-xs text-gray-300">
                          {index === 0 && 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'}
                          {index === 1 && 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'}
                          {index === 2 && 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'}
                          {index === 3 && 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'}
                        </p>
                      </div>
                    </div>
                  </th>
                ))}
                <th className="py-3 px-4 text-center w-[16.66%] relative dropdown border-l bg-white align-top" ref={addProjectDropdownRef}>
                  <div className="pt-16">
                    <button 
                      onClick={() => setShowAddProjectDropdown(!showAddProjectDropdown)}
                      className="flex items-center justify-center w-full text-blue-600 hover:text-blue-800"
                    >
                      <span className="material-icons text-lg">add</span>
                      <span className="ml-1 font-semibold">Add Project</span>
                    </button>
                    
                    {/* Add Project Dropdown */}
                    <div className={`dropdown-menu absolute right-0 mt-2 z-10 w-64 bg-white rounded-lg shadow-xl border border-gray-200 ${showAddProjectDropdown ? 'block' : 'hidden'}`}>
                        <div className="p-3 border-b border-gray-200">
                          <div className="relative">
                            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                            <input 
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500" 
                              placeholder="Search for a project..." 
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto p-1">
                          {availableProjects
                            .filter(project => project.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map(project => (
                              <button 
                                key={project}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                              >
                                {project}
                              </button>
                            ))}
                        </div>
                      </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Table rows */}
              <tr className="group transition-colors odd:bg-white even:bg-gray-50">
                <td className="font-medium text-gray-800 px-4 py-4 relative hover:bg-gray-100">
                  Total Revenue
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-icons text-base">info_outline</span>
                  </button>
                </td>
                {projects.map((project, index) => (
                  <td key={`revenue-${project.id}`} className={`text-center px-4 py-4 text-green-600 font-medium hover:bg-green-50 ${index > 0 ? 'border-l' : ''}`}>
                    {formatCurrency(project.totalRevenue)}
                  </td>
                ))}
                <td className="px-4 py-4 border-l"></td>
              </tr>
              
              <tr className="group transition-colors odd:bg-white even:bg-gray-50">
                <td className="font-medium text-gray-800 px-4 py-4 relative hover:bg-gray-100">
                  Total Costs
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-icons text-base">info_outline</span>
                  </button>
                </td>
                {projects.map((project, index) => (
                  <td key={`costs-${project.id}`} className={`text-center px-4 py-4 text-red-600 font-medium hover:bg-red-50 ${index > 0 ? 'border-l' : ''}`}>
                    {formatCurrency(project.totalCosts)}
                  </td>
                ))}
                <td className="px-4 py-4 border-l"></td>
              </tr>

              <tr className="group transition-colors odd:bg-white even:bg-gray-50">
                <td className="font-medium text-gray-800 px-4 py-4 relative hover:bg-gray-100">
                  Profit
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-icons text-base">info_outline</span>
                  </button>
                </td>
                {projects.map((project, index) => (
                  <td key={`profit-${project.id}`} className={`text-center px-4 py-4 text-green-500 font-semibold hover:bg-green-50 ${index > 0 ? 'border-l' : ''}`}>
                    {formatCurrency(project.profit)}
                  </td>
                ))}
                <td className="px-4 py-4 border-l"></td>
              </tr>

              <tr className="group transition-colors odd:bg-white even:bg-gray-50">
                <td className="font-medium text-gray-800 px-4 py-4 relative hover:bg-gray-100">
                  Margin
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-icons text-base">info_outline</span>
                  </button>
                </td>
                {projects.map((project, index) => (
                  <td key={`margin-${project.id}`} className={`text-center px-4 py-4 text-green-500 font-semibold hover:bg-green-50 ${index > 0 ? 'border-l' : ''}`}>
                    {formatPercentage(project.margin)}
                  </td>
                ))}
                <td className="px-4 py-4 border-l"></td>
              </tr>

              <tr className="group transition-colors odd:bg-white even:bg-gray-50">
                <td className="font-medium text-gray-800 px-4 py-4 relative hover:bg-gray-100">
                  Top Revenue Driver
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-icons text-base">info_outline</span>
                  </button>
                </td>
                {projects.map((project, index) => (
                  <td key={`revenue-driver-${project.id}`} className={`text-center px-4 py-4 text-green-700 hover:bg-green-50 ${index > 0 ? 'border-l' : ''}`}>
                    {project.topRevenueDriver}
                  </td>
                ))}
                <td className="px-4 py-4 border-l"></td>
              </tr>

              <tr className="group transition-colors odd:bg-white even:bg-gray-50">
                <td className="font-medium text-gray-800 px-4 py-4 relative hover:bg-gray-100">
                  Top Cost Driver
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-icons text-base">info_outline</span>
                  </button>
                </td>
                {projects.map((project, index) => (
                  <td key={`cost-driver-${project.id}`} className={`text-center px-4 py-4 text-red-700 hover:bg-red-50 ${index > 0 ? 'border-l' : ''}`}>
                    {project.topCostDriver}
                  </td>
                ))}
                <td className="px-4 py-4 border-l"></td>
              </tr>

              {/* Add Metric Row */}
              <tr className="bg-white odd:bg-white even:bg-gray-50">
                <td className="px-4 py-4">
                  <button className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-semibold">
                    <span className="material-icons text-lg">add</span>
                    <span className="ml-1">Add Metric</span>
                  </button>
                </td>
                <td className="comparison-table-column"></td>
                <td className="border-l comparison-table-column"></td>
                <td className="border-l comparison-table-column"></td>
                <td className="border-l comparison-table-column"></td>
                <td className="border-l"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}