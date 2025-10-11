import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { useROIService } from '../../lib/services/roiService';
import toast from 'react-hot-toast';

interface ScenariosTabProps {
  roiCalculationId?: string;
}

interface Scenario {
  id?: string;
  roi_calculation_id: string;
  name: string;
  attendance_modifier: number;
  cashless_modifier: number;
  weather_condition: string;
  projected_profit: number;
  projected_margin: number;
  notes?: string;
}

export function ScenariosTab({ roiCalculationId }: ScenariosTabProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { getScenarios, upsertScenario } = useROIService();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const formatted = value.toFixed(1);
    return value > 0 ? `+${formatted}%` : `${formatted}%`;
  };

  useEffect(() => {
    const loadScenarios = async () => {
      if (!roiCalculationId) {
        console.log('No ROI calculation ID provided');
        return;
      }

      setIsLoading(true);
      try {
        const data = await getScenarios(roiCalculationId);
        setScenarios(data);
      } catch (error) {
        console.error('Error loading scenarios:', error);
        toast.error('Failed to load scenarios');
      } finally {
        setIsLoading(false);
      }
    };

    loadScenarios();
  }, [roiCalculationId]);

  const handleSaveScenario = async (scenario: Scenario) => {
    try {
      await upsertScenario(scenario);

      // Reload scenarios
      if (roiCalculationId) {
        const data = await getScenarios(roiCalculationId);
        setScenarios(data);
      }

      setEditingScenario(null);
      setIsEditing(false);
      toast.success('Scenario saved successfully');
    } catch (error) {
      console.error('Error saving scenario:', error);
      toast.error('Failed to save scenario');
    }
  };

  const handleAddNew = () => {
    if (!roiCalculationId) return;

    const newScenario: Scenario = {
      roi_calculation_id: roiCalculationId,
      name: 'Custom Scenario',
      attendance_modifier: 0,
      cashless_modifier: 0,
      weather_condition: 'Normal',
      projected_profit: 0,
      projected_margin: 0,
      notes: ''
    };

    setEditingScenario(newScenario);
    setIsEditing(true);
  };

  const getBadgeColor = (modifier: number) => {
    if (modifier > 0) return 'bg-green-100 text-green-800';
    if (modifier < 0) return 'bg-red-100 text-red-800';
    return 'bg-blue-100 text-blue-800';
  };

  // Show loading state
  if (!roiCalculationId) {
    return (
      <div className="flex items-center justify-center min-h-96 p-8">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Please select a project to view scenarios</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96 p-8">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Loading scenarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Scenario Modeling</h3>
          <p className="text-sm text-gray-500 mt-1">Create and analyze different financial scenarios</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Scenario
        </button>
      </div>

      {scenarios.length === 0 ? (
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No scenarios yet</p>
          <p className="text-gray-400 text-sm mt-2">Click "Add Scenario" to create your first financial scenario</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-3 font-semibold text-sm text-gray-500">Scenario Name</th>
                <th className="py-3 font-semibold text-sm text-gray-500 text-center">Attendance</th>
                <th className="py-3 font-semibold text-sm text-gray-500 text-center">Cashless</th>
                <th className="py-3 font-semibold text-sm text-gray-500">Weather</th>
                <th className="py-3 font-semibold text-sm text-gray-500 text-right">Projected Profit</th>
                <th className="py-3 font-semibold text-sm text-gray-500 text-right">Projected Margin</th>
                <th className="py-3 font-semibold text-sm text-gray-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {scenarios.map((scenario) => (
                <tr key={scenario.id} className="hover:bg-gray-50">
                  <td className="py-4 font-medium text-gray-800">{scenario.name}</td>
                  <td className="py-4 text-center">
                    <span className={`${getBadgeColor(scenario.attendance_modifier)} text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1`}>
                      {scenario.attendance_modifier > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : scenario.attendance_modifier < 0 ? (
                        <TrendingDown className="w-3 h-3" />
                      ) : null}
                      {formatPercentage(scenario.attendance_modifier)}
                    </span>
                  </td>
                  <td className="py-4 text-center">
                    <span className={`${getBadgeColor(scenario.cashless_modifier)} text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1`}>
                      {scenario.cashless_modifier > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : scenario.cashless_modifier < 0 ? (
                        <TrendingDown className="w-3 h-3" />
                      ) : null}
                      {formatPercentage(scenario.cashless_modifier)}
                    </span>
                  </td>
                  <td className="py-4 text-gray-800">{scenario.weather_condition}</td>
                  <td className={`py-4 text-right font-semibold ${scenario.projected_profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {formatCurrency(scenario.projected_profit)}
                  </td>
                  <td className={`py-4 text-right font-semibold ${scenario.projected_margin >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {scenario.projected_margin.toFixed(1)}%
                  </td>
                  <td className="py-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingScenario(scenario);
                          setIsEditing(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit/Add Modal */}
      {isEditing && editingScenario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingScenario.id ? 'Edit Scenario' : 'Add New Scenario'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scenario Name
                </label>
                <input
                  type="text"
                  value={editingScenario.name}
                  onChange={(e) => setEditingScenario({ ...editingScenario, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Best Case, Worst Case"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attendance Modifier (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingScenario.attendance_modifier}
                    onChange={(e) => setEditingScenario({ ...editingScenario, attendance_modifier: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cashless Modifier (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingScenario.cashless_modifier}
                    onChange={(e) => setEditingScenario({ ...editingScenario, cashless_modifier: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weather Condition
                </label>
                <input
                  type="text"
                  value={editingScenario.weather_condition}
                  onChange={(e) => setEditingScenario({ ...editingScenario, weather_condition: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Good, Normal, Bad, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Projected Profit (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingScenario.projected_profit}
                    onChange={(e) => setEditingScenario({ ...editingScenario, projected_profit: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Projected Margin (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingScenario.projected_margin}
                    onChange={(e) => setEditingScenario({ ...editingScenario, projected_margin: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="15"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={editingScenario.notes || ''}
                  onChange={(e) => setEditingScenario({ ...editingScenario, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any notes about this scenario..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setEditingScenario(null);
                  setIsEditing(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveScenario(editingScenario)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Scenario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
