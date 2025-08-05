import React, { useState, useEffect } from 'react';
import { DollarSign, Save, CheckCircle, AlertTriangle, Calculator, Users, TrendingUp, Clock } from 'lucide-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface CrewMember {
  id: string;
  name: string;
  title: string;
  role: 'Lead' | 'Senior' | 'Junior';
  days: number;
  rate: number;
  subtotal: number;
  travel: number;
  accommodation: number;
  perDiem: number;
  total: number;
  avatar: string;
}

interface RateStructure {
  day: {
    Lead: number;
    Senior: number;
    Junior: number;
  };
  hourly: {
    Lead: number;
    Senior: number;
    Junior: number;
  };
}

interface ShiftDefinitions {
  halfDayMax: number;
  fullDayMax: number;
  oneHalfDayMax: number;
}

interface AdditionalExpenses {
  travel: number;
  accommodation: number;
  perDiem: number;
}

interface CrewCostsTabProps {
  project: any;
}

export function CrewCostsTab({ project }: CrewCostsTabProps) {
  const [activeRateTab, setActiveRateTab] = useState<'day' | 'hourly' | 'settings'>('day');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([
    {
      id: '1',
      name: 'John Smith',
      title: 'Lead Technician',
      role: 'Lead',
      days: 5,
      rate: 350,
      subtotal: 1750,
      travel: 150,
      accommodation: 250,
      perDiem: 125,
      total: 2275,
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      id: '2',
      name: 'Sarah Jones',
      title: 'Sound Engineer',
      role: 'Senior',
      days: 5,
      rate: 300,
      subtotal: 1500,
      travel: 100,
      accommodation: 250,
      perDiem: 125,
      total: 1975,
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      id: '3',
      name: 'Mike Ross',
      title: 'Rigger',
      role: 'Junior',
      days: 4,
      rate: 220,
      subtotal: 880,
      travel: 80,
      accommodation: 200,
      perDiem: 100,
      total: 1260,
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    }
  ]);

  const [rates, setRates] = useState<RateStructure>({
    day: { Lead: 350, Senior: 300, Junior: 220 },
    hourly: { Lead: 45, Senior: 38, Junior: 28 }
  });

  const [dayShifts, setDayShifts] = useState<ShiftDefinitions>({
    halfDayMax: 5,
    fullDayMax: 10,
    oneHalfDayMax: 15
  });

  const [hourlyShifts, setHourlyShifts] = useState<ShiftDefinitions>({
    halfDayMax: 5,
    fullDayMax: 10,
    oneHalfDayMax: 15
  });

  const [additionalExpenses, setAdditionalExpenses] = useState<AdditionalExpenses>({
    travel: 0,
    accommodation: 0,
    perDiem: 0
  });

  const [overtimeMultiplier, setOvertimeMultiplier] = useState<'1.5' | '2'>('1.5');
  const [holidayRatesEnabled, setHolidayRatesEnabled] = useState(false);
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayMultiplier, setHolidayMultiplier] = useState(2.0);

  const estimate = 15000;

  useEffect(() => {
    recalculateCosts();
  }, [rates]);

  const validateNumber = (value: string, field: string): boolean => {
    if (value === '' || isNaN(Number(value)) || Number(value) < 0) {
      setErrors(prev => ({ ...prev, [field]: 'Please enter a valid positive number.' }));
      return false;
    } else {
      setErrors(prev => ({ ...prev, [field]: '' }));
      return true;
    }
  };

  const recalculateCosts = () => {
    setCrewMembers(prev => prev.map(crew => {
      const rate = rates.day[crew.role];
      const subtotal = crew.days * rate;
      const total = subtotal + crew.travel + crew.accommodation + crew.perDiem;
      
      return {
        ...crew,
        rate,
        subtotal,
        total
      };
    }));
  };

  const handleRateChange = (rateType: 'day' | 'hourly', role: 'Lead' | 'Senior' | 'Junior', value: string) => {
    if (validateNumber(value, `rates.${rateType}.${role}`)) {
      setRates(prev => ({
        ...prev,
        [rateType]: {
          ...prev[rateType],
          [role]: Number(value)
        }
      }));
    }
  };

  const handleShiftChange = (shiftType: 'day' | 'hourly', field: keyof ShiftDefinitions, value: string) => {
    if (validateNumber(value, `${shiftType}Shifts.${field}`)) {
      if (shiftType === 'day') {
        setDayShifts(prev => ({ ...prev, [field]: Number(value) }));
      } else {
        setHourlyShifts(prev => ({ ...prev, [field]: Number(value) }));
      }
    }
  };

  const handleExpenseChange = (field: keyof AdditionalExpenses, value: string) => {
    if (validateNumber(value, `additionalExpenses.${field}`)) {
      setAdditionalExpenses(prev => ({ ...prev, [field]: Number(value) }));
    }
  };

  const saveChanges = async () => {
    const hasErrors = Object.values(errors).some(error => error !== '');
    if (hasErrors) return;

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      toast.success('Crew costs saved successfully!');
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-GB').format(num);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Lead': return 'bg-blue-100 text-blue-800';
      case 'Senior': return 'bg-green-100 text-green-800';
      case 'Junior': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculated totals
  const totalDailyRates = crewMembers.reduce((acc, crew) => acc + crew.subtotal, 0);
  const totalTravel = crewMembers.reduce((acc, crew) => acc + crew.travel, 0) + additionalExpenses.travel;
  const totalAccommodation = crewMembers.reduce((acc, crew) => acc + crew.accommodation, 0) + additionalExpenses.accommodation;
  const totalPerDiem = crewMembers.reduce((acc, crew) => acc + crew.perDiem, 0) + additionalExpenses.perDiem;
  const totalCrewCost = totalDailyRates + totalTravel + totalAccommodation + totalPerDiem;
  const costVsEstimate = totalCrewCost - estimate;

  return (
    <div className="space-y-8">
      {/* Cost Summary Dashboard */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Cost Summary Dashboard</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <p className="text-xs text-blue-700 font-medium">Total Crew Cost</p>
            </div>
            <p className="text-lg font-bold text-blue-900">£{formatNumber(totalCrewCost)}</p>
          </div>
          
          <div className={`p-4 rounded-lg border ${costVsEstimate >= 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className={`w-4 h-4 ${costVsEstimate >= 0 ? 'text-red-600' : 'text-green-600'}`} />
              <p className={`text-xs font-medium ${costVsEstimate >= 0 ? 'text-red-700' : 'text-green-700'}`}>Cost vs Estimate</p>
            </div>
            <p className={`text-lg font-bold ${costVsEstimate >= 0 ? 'text-red-900' : 'text-green-900'}`}>
              {costVsEstimate >= 0 ? '+' : ''}£{formatNumber(costVsEstimate)}
            </p>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-gray-600" />
              <p className="text-xs text-gray-600 font-medium">Daily Rates</p>
            </div>
            <p className="text-lg font-bold text-gray-800">£{formatNumber(totalDailyRates)}</p>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-gray-600" />
              <p className="text-xs text-gray-600 font-medium">Travel Expenses</p>
            </div>
            <p className="text-lg font-bold text-gray-800">£{formatNumber(totalTravel)}</p>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <p className="text-xs text-gray-600 font-medium">Accommodation</p>
            </div>
            <p className="text-lg font-bold text-gray-800">£{formatNumber(totalAccommodation)}</p>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-gray-600" />
              <p className="text-xs text-gray-600 font-medium">Per Diem</p>
            </div>
            <p className="text-lg font-bold text-gray-800">£{formatNumber(totalPerDiem)}</p>
          </div>
        </div>
      </div>

      {/* Individual Crew Costs */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Individual Crew Costs</h2>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Crew Member
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Days
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Subtotal
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Travel
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Accom.
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Per Diem
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {crewMembers.map((crew) => (
                  <tr key={crew.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <img
                          src={crew.avatar}
                          alt={crew.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{crew.name}</p>
                          <p className="text-sm text-gray-500">{crew.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(crew.role)}`}>
                        {crew.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                      {crew.days}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      £{crew.rate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      £{formatNumber(crew.subtotal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      £{formatNumber(crew.travel)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      £{formatNumber(crew.accommodation)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      £{formatNumber(crew.perDiem)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                      £{formatNumber(crew.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Rate Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Rate Management</h2>
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveRateTab('day')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeRateTab === 'day'
                  ? 'bg-white text-blue-600 font-medium shadow-sm'
                  : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              Day Rates
            </button>
            <button
              onClick={() => setActiveRateTab('hourly')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeRateTab === 'hourly'
                  ? 'bg-white text-blue-600 font-medium shadow-sm'
                  : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              Hourly Rates
            </button>
            <button
              onClick={() => setActiveRateTab('settings')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeRateTab === 'settings'
                  ? 'bg-white text-blue-600 font-medium shadow-sm'
                  : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              Settings
            </button>
          </div>
        </div>

        {/* Day Rates Tab */}
        {activeRateTab === 'day' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div>
              <h3 className="font-medium text-gray-800 text-base mb-2">Standard Rates by Role/Tier</h3>
              <p className="text-sm text-gray-500 mb-4">Currency: GBP (£)</p>
              <div className="space-y-4">
                {(['Lead', 'Senior', 'Junior'] as const).map((role) => (
                  <div key={role}>
                    <label className="block text-sm font-medium text-gray-700" htmlFor={`${role.toLowerCase()}-rate-day`}>
                      {role}
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm">£</span>
                      </div>
                      <input
                        type="text"
                        id={`${role.toLowerCase()}-rate-day`}
                        value={rates.day[role]}
                        onChange={(e) => handleRateChange('day', role, e.target.value)}
                        className={`block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                          errors[`rates.day.${role}`] ? 'border-red-500 ring-red-500' : ''
                        }`}
                      />
                    </div>
                    {errors[`rates.day.${role}`] && (
                      <p className="text-red-600 text-xs mt-1">{errors[`rates.day.${role}`]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-800 text-base mb-2">Shift Definitions</h3>
              
              <div className="rounded-md border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-700 text-sm">Half day shift</h4>
                  <div className="flex items-center space-x-2">
                    <label className="block text-xs font-medium text-gray-500" htmlFor="half-day-hours">Up to</label>
                    <div className="relative w-28">
                      <input
                        type="text"
                        id="half-day-hours"
                        value={dayShifts.halfDayMax}
                        onChange={(e) => handleShiftChange('day', 'halfDayMax', e.target.value)}
                        className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md py-1.5 ${
                          errors['dayRates.halfDayMax'] ? 'border-red-500 ring-red-500' : ''
                        }`}
                        placeholder="0.00"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">hours</span>
                      </div>
                    </div>
                  </div>
                </div>
                {errors['dayRates.halfDayMax'] && (
                  <p className="text-red-600 text-xs mt-1">{errors['dayRates.halfDayMax']}</p>
                )}
              </div>

              <div className="rounded-md border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-700 text-sm">Full day shift</h4>
                  <div className="flex items-center space-x-2">
                    <label className="block text-xs font-medium text-gray-500" htmlFor="full-day-hours">From 6 to</label>
                    <div className="relative w-28">
                      <input
                        type="text"
                        id="full-day-hours"
                        value={dayShifts.fullDayMax}
                        onChange={(e) => handleShiftChange('day', 'fullDayMax', e.target.value)}
                        className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md py-1.5 ${
                          errors['dayRates.fullDayMax'] ? 'border-red-500 ring-red-500' : ''
                        }`}
                        placeholder="0.00"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">hours</span>
                      </div>
                    </div>
                  </div>
                </div>
                {errors['dayRates.fullDayMax'] && (
                  <p className="text-red-600 text-xs mt-1">{errors['dayRates.fullDayMax']}</p>
                )}
              </div>

              <div className="rounded-md border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-700 text-sm">1.5 days shift</h4>
                  <div className="flex items-center space-x-2">
                    <label className="block text-xs font-medium text-gray-500" htmlFor="one-half-day-hours">From 11 to</label>
                    <div className="relative w-28">
                      <input
                        type="text"
                        id="one-half-day-hours"
                        value={dayShifts.oneHalfDayMax}
                        onChange={(e) => handleShiftChange('day', 'oneHalfDayMax', e.target.value)}
                        className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md py-1.5 ${
                          errors['dayRates.oneHalfDayMax'] ? 'border-red-500 ring-red-500' : ''
                        }`}
                        placeholder="0.00"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">hours</span>
                      </div>
                    </div>
                  </div>
                </div>
                {errors['dayRates.oneHalfDayMax'] && (
                  <p className="text-red-600 text-xs mt-1">{errors['dayRates.oneHalfDayMax']}</p>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-3">
                This is just a guide, shift lengths and pay rates will be communicated by the project manager.
              </p>
            </div>
          </div>
        )}

        {/* Hourly Rates Tab */}
        {activeRateTab === 'hourly' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div>
              <h3 className="font-medium text-gray-800 text-base mb-2">Standard Hourly Rates by Role/Tier</h3>
              <p className="text-sm text-gray-500 mb-4">Currency: GBP (£)</p>
              <div className="space-y-4">
                {(['Lead', 'Senior', 'Junior'] as const).map((role) => (
                  <div key={role}>
                    <label className="block text-sm font-medium text-gray-700" htmlFor={`${role.toLowerCase()}-rate-hourly`}>
                      {role}
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm">£</span>
                      </div>
                      <input
                        type="text"
                        id={`${role.toLowerCase()}-rate-hourly`}
                        value={rates.hourly[role]}
                        onChange={(e) => handleRateChange('hourly', role, e.target.value)}
                        className={`block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                          errors[`rates.hourly.${role}`] ? 'border-red-500 ring-red-500' : ''
                        }`}
                        placeholder={`e.g. ${role === 'Lead' ? '45' : role === 'Senior' ? '38' : '28'}`}
                      />
                    </div>
                    {errors[`rates.hourly.${role}`] && (
                      <p className="text-red-600 text-xs mt-1">{errors[`rates.hourly.${role}`]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-800 text-base mb-2">Shift Definitions</h3>
              
              <div className="rounded-md border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-700 text-sm">Half day shift</h4>
                  <div className="flex items-center space-x-2">
                    <label className="block text-xs font-medium text-gray-500" htmlFor="hourly-half-day-hours">Up to</label>
                    <div className="relative w-28">
                      <input
                        type="text"
                        id="hourly-half-day-hours"
                        value={hourlyShifts.halfDayMax}
                        onChange={(e) => handleShiftChange('hourly', 'halfDayMax', e.target.value)}
                        className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md py-1.5 ${
                          errors['hourlyRates.halfDayMax'] ? 'border-red-500 ring-red-500' : ''
                        }`}
                        placeholder="0.00"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">hours</span>
                      </div>
                    </div>
                  </div>
                </div>
                {errors['hourlyRates.halfDayMax'] && (
                  <p className="text-red-600 text-xs mt-1">{errors['hourlyRates.halfDayMax']}</p>
                )}
              </div>

              <div className="rounded-md border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-700 text-sm">Full day shift</h4>
                  <div className="flex items-center space-x-2">
                    <label className="block text-xs font-medium text-gray-500" htmlFor="hourly-full-day-hours">From 6 to</label>
                    <div className="relative w-28">
                      <input
                        type="text"
                        id="hourly-full-day-hours"
                        value={hourlyShifts.fullDayMax}
                        onChange={(e) => handleShiftChange('hourly', 'fullDayMax', e.target.value)}
                        className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md py-1.5 ${
                          errors['hourlyRates.fullDayMax'] ? 'border-red-500 ring-red-500' : ''
                        }`}
                        placeholder="0.00"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">hours</span>
                      </div>
                    </div>
                  </div>
                </div>
                {errors['hourlyRates.fullDayMax'] && (
                  <p className="text-red-600 text-xs mt-1">{errors['hourlyRates.fullDayMax']}</p>
                )}
              </div>

              <div className="rounded-md border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-700 text-sm">1.5 days shift</h4>
                  <div className="flex items-center space-x-2">
                    <label className="block text-xs font-medium text-gray-500" htmlFor="hourly-one-half-day-hours">From 11 to</label>
                    <div className="relative w-28">
                      <input
                        type="text"
                        id="hourly-one-half-day-hours"
                        value={hourlyShifts.oneHalfDayMax}
                        onChange={(e) => handleShiftChange('hourly', 'oneHalfDayMax', e.target.value)}
                        className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md py-1.5 ${
                          errors['hourlyRates.oneHalfDayMax'] ? 'border-red-500 ring-red-500' : ''
                        }`}
                        placeholder="0.00"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">hours</span>
                      </div>
                    </div>
                  </div>
                </div>
                {errors['hourlyRates.oneHalfDayMax'] && (
                  <p className="text-red-600 text-xs mt-1">{errors['hourlyRates.oneHalfDayMax']}</p>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-3">
                This is just a guide, shift lengths and pay rates will be communicated by the project manager.
              </p>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeRateTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-800 text-lg mb-5">Overtime Multipliers</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="ot-1.5x"
                    name="overtime"
                    type="radio"
                    value="1.5"
                    checked={overtimeMultiplier === '1.5'}
                    onChange={(e) => setOvertimeMultiplier(e.target.value as '1.5' | '2')}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="ot-1.5x" className="ml-3 block text-sm font-medium text-gray-700">
                    1.5x for hours over standard day
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="ot-2x"
                    name="overtime"
                    type="radio"
                    value="2"
                    checked={overtimeMultiplier === '2'}
                    onChange={(e) => setOvertimeMultiplier(e.target.value as '1.5' | '2')}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="ot-2x" className="ml-3 block text-sm font-medium text-gray-700">
                    2x for hours over standard day
                  </label>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 text-lg mb-5">Holiday Rates</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="holiday-rates"
                    name="holiday-rates"
                    type="checkbox"
                    checked={holidayRatesEnabled}
                    onChange={(e) => setHolidayRatesEnabled(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="holiday-rates" className="ml-3 block text-sm font-medium text-gray-700">
                    Enable Holiday Rates
                  </label>
                </div>

                {holidayRatesEnabled && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={holidayDate}
                        onChange={(e) => setHolidayDate(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rate Multiplier
                      </label>
                      <div className="relative">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                          x
                        </span>
                        <input
                          type="text"
                          value={holidayMultiplier}
                          onChange={(e) => {
                            if (validateNumber(e.target.value, 'holidayMultiplier')) {
                              setHolidayMultiplier(Number(e.target.value));
                            }
                          }}
                          className={`flex-1 block w-full px-3 py-2 rounded-r-md focus:ring-blue-500 focus:border-blue-500 text-sm border-gray-300 ${
                            errors.holidayMultiplier ? 'border-red-500 ring-red-500' : ''
                          }`}
                        />
                      </div>
                      {errors.holidayMultiplier && (
                        <p className="text-red-600 text-xs mt-1">{errors.holidayMultiplier}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Additional Expenses Management */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Additional Expenses Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Travel
            </label>
            <div className="relative">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                £
              </span>
              <input
                type="text"
                value={additionalExpenses.travel}
                onChange={(e) => handleExpenseChange('travel', e.target.value)}
                className={`flex-1 block w-full px-3 py-2 rounded-r-md focus:ring-blue-500 focus:border-blue-500 text-sm border-gray-300 ${
                  errors['additionalExpenses.travel'] ? 'border-red-500 ring-red-500' : ''
                }`}
                placeholder="0.00"
              />
            </div>
            {errors['additionalExpenses.travel'] && (
              <p className="text-red-600 text-xs mt-1">{errors['additionalExpenses.travel']}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Accommodation
            </label>
            <div className="relative">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                £
              </span>
              <input
                type="text"
                value={additionalExpenses.accommodation}
                onChange={(e) => handleExpenseChange('accommodation', e.target.value)}
                className={`flex-1 block w-full px-3 py-2 rounded-r-md focus:ring-blue-500 focus:border-blue-500 text-sm border-gray-300 ${
                  errors['additionalExpenses.accommodation'] ? 'border-red-500 ring-red-500' : ''
                }`}
                placeholder="0.00"
              />
            </div>
            {errors['additionalExpenses.accommodation'] && (
              <p className="text-red-600 text-xs mt-1">{errors['additionalExpenses.accommodation']}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Per Diem
            </label>
            <div className="relative">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                £
              </span>
              <input
                type="text"
                value={additionalExpenses.perDiem}
                onChange={(e) => handleExpenseChange('perDiem', e.target.value)}
                className={`flex-1 block w-full px-3 py-2 rounded-r-md focus:ring-blue-500 focus:border-blue-500 text-sm border-gray-300 ${
                  errors['additionalExpenses.perDiem'] ? 'border-red-500 ring-red-500' : ''
                }`}
                placeholder="0.00"
              />
            </div>
            {errors['additionalExpenses.perDiem'] && (
              <p className="text-red-600 text-xs mt-1">{errors['additionalExpenses.perDiem']}</p>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end items-center">
          {saved && (
            <div className="flex items-center text-green-600 mr-4 transition-all duration-300">
              <CheckCircle className="w-5 h-5 mr-1" />
              <span className="font-medium">Changes Saved!</span>
            </div>
          )}
          <button
            onClick={saveChanges}
            disabled={isSaving || Object.values(errors).some(error => error !== '')}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg text-base shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <LoadingSpinner size="sm" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}