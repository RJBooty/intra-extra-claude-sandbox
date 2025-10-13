import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Plus, ChevronDown, ChevronRight, Download, Settings, X, Edit2, Trash2, Lock, Unlock, Upload } from 'lucide-react';
import { useROIService } from '../../lib/services/roiService';
import toast from 'react-hot-toast';
import { useUnsavedChangesWarning } from '../../hooks/useUnsavedChangesWarning';
import { UnsavedChangesModal } from '../common/UnsavedChangesModal';

const ROIRevenueBuilder = forwardRef(({ roiCalculationId, roiCalculation, onDataSaved }, ref) => {
  const [isLocked, setIsLocked] = useState(true);
  const [isEstimateLocked, setIsEstimateLocked] = useState(false);
  const [currency, setCurrency] = useState('EUR');
  const [showSettings, setShowSettings] = useState(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showNewSectionModal, setShowNewSectionModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const initialCategoriesRef = useRef(null);

  const defaultCategories = [
    {
      id: 'ticketing',
      name: 'TICKETING',
      icon: 'ticket',
      color: { border: 'border-l-red-500', icon: 'bg-red-100', text: 'text-red-600' },
      expanded: true,
      columns: [
        { id: 'fee', label: 'Fee/Price', type: 'standard' },
        { id: 'qty', label: 'Qty', type: 'standard' },
        { id: 'perfPct', label: 'Perf %', type: 'standard' }
      ],
      formula: '=A * B * (C/100)',
      items: [
        { id: 1, name: 'Standard Ticketing Fees (Net)', fee: 5.5, qty: 1, perfPct: 100 },
        { id: 2, name: 'Ticketing Insurance - 10%', fee: 100, qty: 2, perfPct: 100 },
        { id: 3, name: 'Secondary Ticketing Fees', fee: 0, qty: 3, perfPct: 0 },
        { id: 4, name: 'Klarna Fixed Fees', fee: 0.25, qty: 4, perfPct: 100 },
        { id: 5, name: 'Klarna Processing Fees', fee: 3.2, qty: 5, perfPct: 100 }
      ]
    },
    {
      id: 'access',
      name: 'ACCESS',
      icon: 'shield',
      color: { border: 'border-l-blue-500', icon: 'bg-blue-100', text: 'text-blue-600' },
      expanded: true,
      columns: [
        { id: 'fee', label: 'Fee/Price', type: 'standard' },
        { id: 'qty', label: 'Qty', type: 'standard' },
        { id: 'perfPct', label: 'Perf %', type: 'standard' }
      ],
      formula: '=A * B * (C/100)',
      items: [
        { id: 6, name: 'Access Control Fees', fee: 0, qty: 0, perfPct: 0 },
        { id: 7, name: 'Staff Accreditation Fees', fee: 0, qty: 0, perfPct: 0 }
      ]
    },
    {
      id: 'cashless',
      name: 'CASHLESS',
      icon: 'creditcard',
      color: { border: 'border-l-green-500', icon: 'bg-green-100', text: 'text-green-600' },
      expanded: true,
      columns: [
        { id: 'fee', label: 'Fee/Price', type: 'standard' },
        { id: 'qty', label: 'Qty', type: 'standard' },
        { id: 'perfPct', label: 'Perf %', type: 'standard' }
      ],
      formula: '=A * B * (C/100)',
      items: [
        { id: 8, name: 'Cashless Commission', fee: 1.2, qty: 1, perfPct: 100 },
        { id: 9, name: 'TopUp Transaction Fee - 1.1%', fee: 1.1, qty: 2, perfPct: 100 },
        { id: 10, name: 'Klarna Fixed Fees', fee: 0.25, qty: 3, perfPct: 100 },
        { id: 11, name: 'Klarna Processing Fees', fee: 3.2, qty: 4, perfPct: 100 },
        { id: 12, name: 'Online Refund Fees', fee: 0.9, qty: 5, perfPct: 100 }
      ]
    },
    {
      id: 'insights-data',
      name: 'INSIGHTS & DATA',
      icon: 'chart',
      color: { border: 'border-l-purple-500', icon: 'bg-purple-100', text: 'text-purple-600' },
      expanded: true,
      columns: [
        { id: 'fee', label: 'Fee/Price', type: 'standard' },
        { id: 'qty', label: 'Qty', type: 'standard' },
        { id: 'perfPct', label: 'Perf %', type: 'standard' }
      ],
      formula: '=A * B * (C/100)',
      items: [
        { id: 13, name: 'Insights Fees', fee: 0, qty: 1, perfPct: 0 },
        { id: 14, name: 'Survey Fees', fee: 0, qty: 2, perfPct: 0 }
      ]
    },
    {
      id: 'commercial-modules',
      name: 'COMMERCIAL MODULES',
      icon: 'shopping',
      color: { border: 'border-l-orange-500', icon: 'bg-orange-100', text: 'text-orange-600' },
      expanded: true,
      columns: [
        { id: 'fee', label: 'Fee/Price', type: 'standard' },
        { id: 'qty', label: 'Qty', type: 'standard' },
        { id: 'perfPct', label: 'Perf %', type: 'standard' }
      ],
      formula: '=A * B * (C/100)',
      items: [
        { id: 15, name: 'Accommodation fee', fee: 1, qty: 1, perfPct: 100 },
        { id: 16, name: 'Marketplace', fee: 0, qty: 2, perfPct: 0 },
        { id: 17, name: 'Other', fee: 0, qty: 3, perfPct: 0 }
      ]
    },
    {
      id: 'wristbands-devices',
      name: 'WRISTBANDS & DEVICES',
      icon: 'star',
      color: { border: 'border-l-cyan-500', icon: 'bg-cyan-100', text: 'text-cyan-600' },
      expanded: true,
      columns: [
        { id: 'fee', label: 'Fee/Price', type: 'standard' },
        { id: 'qty', label: 'Qty', type: 'standard' },
        { id: 'perfPct', label: 'Perf %', type: 'standard' }
      ],
      formula: '=A * B * (C/100)',
      items: [
        { id: 18, name: 'Generic Wristband Charge', fee: 1, qty: 1, perfPct: 1 },
        { id: 19, name: 'Customised Wristband Charge', fee: 0.39, qty: 2, perfPct: 100 },
        { id: 20, name: 'Cards Charge', fee: 0.6, qty: 3, perfPct: 100 },
        { id: 21, name: 'Scanners Charge', fee: 0, qty: 0, perfPct: 0 }
      ]
    },
    {
      id: 'special-integrations',
      name: 'SPECIAL INTEGRATIONS / CHARGES',
      icon: 'lightning',
      color: { border: 'border-l-pink-500', icon: 'bg-pink-100', text: 'text-pink-600' },
      expanded: true,
      columns: [
        { id: 'fee', label: 'Fee/Price', type: 'standard' },
        { id: 'qty', label: 'Qty', type: 'standard' },
        { id: 'perfPct', label: 'Perf %', type: 'standard' }
      ],
      formula: '=A * B * (C/100)',
      items: [
        { id: 22, name: 'Fees (Standard / Premium / Pro)', fee: 1, qty: 0, perfPct: 0 },
        { id: 23, name: 'Special Fees', fee: 0.39, qty: 0, perfPct: 0 }
      ]
    }
  ];

  const [categories, setCategories] = useState(defaultCategories);

  const { saveRevenueConfig } = useROIService();

  // Save configuration to database
  const saveConfiguration = useCallback(async () => {
    if (!roiCalculationId) {
      toast.error('No ROI calculation ID available');
      return;
    }

    setIsSaving(true);
    try {
      const config = {
        categories: categories,
        currency: currency,
        lastModified: new Date().toISOString()
      };
      console.log('=== Saving Revenue Config ===');
      console.log('roiCalculationId:', roiCalculationId);
      console.log('config:', config);
      console.log('categories count:', categories.length);

      await saveRevenueConfig(roiCalculationId, config);

      console.log('✅ Revenue config saved successfully');
      toast.success('Revenue data saved successfully!');

      // Update initial state after successful save
      initialCategoriesRef.current = JSON.stringify(categories);
      setHasUnsavedChanges(false);

      // Refresh parent ROI data
      if (onDataSaved) {
        await onDataSaved();
      }
    } catch (error) {
      console.error('❌ Error saving revenue configuration:', error);
      toast.error(`Failed to save revenue data: ${error.message}`);
      throw error; // Re-throw so the modal knows save failed
    } finally {
      setIsSaving(false);
    }
  }, [roiCalculationId, categories, currency, saveRevenueConfig]);

  // Unsaved changes warning
  const { showWarning, checkBeforeNavigate, confirmNavigation, cancelNavigation, saveAndNavigate } =
    useUnsavedChangesWarning({
      hasUnsavedChanges: hasUnsavedChanges && !isLocked,
      onSave: saveConfiguration
    });

  // Expose checkBeforeNavigate to parent component for navigation blocking
  useImperativeHandle(ref, () => ({
    checkBeforeNavigate
  }), [checkBeforeNavigate]);

  const showLockedMessage = () => {
    if (isEstimateLocked) {
      setToastMessage('This estimate is locked. Click "Unlock Estimate" to make changes.');
    } else {
      setToastMessage('Page is locked. Click "Edit Info" to make changes.');
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleLockEstimate = () => {
    if (!confirm('Are you sure you want to lock this estimate?')) return;
    setIsEstimateLocked(true);
    setIsLocked(true);
  };

  const handleUnlockEstimateStart = () => {
    setShowUnlockModal(true);
  };

  const handleUnlockConfirm = () => {
    setIsEstimateLocked(false);
    setIsLocked(false);
    setShowUnlockModal(false);
  };

  const handleCancelUnlock = () => {
    setShowUnlockModal(false);
  };

  const downloadTemplate = () => {
    let csv = 'Category,Item Name,Fee/Price,Qty,Perf %\n';
    csv += 'TICKETING,Standard Ticketing Fees,5.5,1,100\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'revenue-import-template.csv';
    a.click();
  };

  const standardFields = [
    { id: 'qty', label: 'Quantity', type: 'number' },
    { id: 'fee', label: 'Fee (€/£/$)', type: 'number' },
    { id: 'feePct', label: 'Fee %', type: 'number' },
    { id: 'perfPct', label: 'Performance %', type: 'number' },
    { id: 'pax', label: 'PAX', type: 'number' },
    { id: 'avgTopup', label: 'Average TopUp', type: 'number' },
    { id: 'avgTicket', label: 'Average Ticket', type: 'number' },
    { id: 'qtyTickets', label: 'Qty Tickets', type: 'number' },
    { id: 'qtyTopups', label: 'Qty TopUps', type: 'number' },
    { id: 'contingency', label: 'Contingency %', type: 'number' }
  ];

  const availableIcons = [
    { id: 'ticket', name: 'Ticket', path: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' },
    { id: 'cube', name: 'Cube', path: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { id: 'cash', name: 'Cash', path: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'chart', name: 'Chart', path: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'users', name: 'Users', path: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'creditcard', name: 'Credit Card', path: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { id: 'gift', name: 'Gift', path: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7' },
    { id: 'star', name: 'Star', path: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
    { id: 'shopping', name: 'Shopping Bag', path: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { id: 'shield', name: 'Shield', path: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { id: 'lightning', name: 'Lightning', path: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'home', name: 'Home', path: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' }
  ];

  // Load configuration from database on mount
  useEffect(() => {
    const loadConfig = async () => {
      if (!roiCalculation) {
        setIsLoadingData(false);
        return;
      }

      setIsLoadingData(true);
      try {
        if (roiCalculation.revenue_config && roiCalculation.revenue_config.categories) {
          setCategories(roiCalculation.revenue_config.categories);
          // Store initial state for comparison
          initialCategoriesRef.current = JSON.stringify(roiCalculation.revenue_config.categories);
        } else {
          // Store initial default categories
          initialCategoriesRef.current = JSON.stringify(defaultCategories);
        }
        // Check if estimate is locked
        if (roiCalculation.status === 'Locked') {
          setIsEstimateLocked(true);
          setIsLocked(true);
        }
        // Reset unsaved changes flag on load
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Error loading revenue configuration:', error);
        toast.error('Failed to load revenue data');
      } finally {
        setIsLoadingData(false);
      }
    };

    loadConfig();
  }, [roiCalculation]);

  // Track changes to categories
  useEffect(() => {
    if (initialCategoriesRef.current && !isLoadingData) {
      const currentState = JSON.stringify(categories);
      const hasChanged = currentState !== initialCategoriesRef.current;
      setHasUnsavedChanges(hasChanged);
    }
  }, [categories, isLoadingData]);

  const validateFormula = (formula, numColumns) => {
    try {
      let f = formula.startsWith('=') ? formula.substring(1) : formula;
      const validCols = Array.from({ length: numColumns }, (_, i) => String.fromCharCode(65 + i));
      validCols.forEach(col => {
        f = f.replace(new RegExp(`\\b${col}\\b`, 'g'), '1');
      });
      eval(f);
      return { valid: true, error: null };
    } catch (e) {
      return { valid: false, error: e.message };
    }
  };

  const previewCalculation = (formula, columns) => {
    try {
      let f = formula.startsWith('=') ? formula.substring(1) : formula;
      const testValues = [100, 50, 10, 80, 5];
      columns.forEach((col, idx) => {
        const colLetter = String.fromCharCode(65 + idx);
        f = f.replace(new RegExp(`\\b${colLetter}\\b`, 'g'), testValues[idx] || 1);
      });
      const result = eval(f);
      return { success: true, result };
    } catch (e) {
      return { success: false, result: 0 };
    }
  };

  const calculateTotal = (item, category) => {
    try {
      let formula = category.formula;
      if (formula.startsWith('=')) {
        formula = formula.substring(1);
      }
      category.columns.forEach((col, index) => {
        const colLetter = String.fromCharCode(65 + index);
        const value = item[col.id] || 0;
        const regex = new RegExp(`\\b${colLetter}\\b`, 'g');
        formula = formula.replace(regex, value);
      });
      return eval(formula) || 0;
    } catch (e) {
      return 0;
    }
  };

  const calculateCategoryTotal = (category) => {
    return category.items.reduce((sum, item) => sum + calculateTotal(item, category), 0);
  };

  const calculateGrandTotal = () => {
    return categories.reduce((sum, cat) => sum + calculateCategoryTotal(cat), 0);
  };

  const toggleCategory = (categoryId) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId ? { ...cat, expanded: !cat.expanded } : cat
    ));
  };

  const updateItem = (categoryId, itemId, field, value) => {
    if (isLocked || isEstimateLocked) return;
    setCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.map(item => 
            item.id === itemId ? { ...item, [field]: field === 'name' ? value : (parseFloat(value) || 0) } : item
          )
        };
      }
      return cat;
    }));
  };

  const addItem = (categoryId) => {
    if (isLocked || isEstimateLocked) return;
    setCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        const newId = Math.max(...cat.items.map(i => i.id), 0) + 1;
        const newItem = { id: newId, name: 'New Item' };
        cat.columns.forEach(col => {
          newItem[col.id] = 0;
        });
        return {
          ...cat,
          items: [...cat.items, newItem]
        };
      }
      return cat;
    }));
  };

  const duplicateItem = (categoryId, itemId) => {
    if (isLocked || isEstimateLocked) return;
    setCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        const itemToDuplicate = cat.items.find(i => i.id === itemId);
        const newId = Math.max(...cat.items.map(i => i.id)) + 1;
        return {
          ...cat,
          items: [...cat.items, { 
            ...itemToDuplicate, 
            id: newId,
            name: itemToDuplicate.name + ' (Copy)'
          }]
        };
      }
      return cat;
    }));
  };

  const deleteItem = (categoryId, itemId) => {
    if (isLocked || isEstimateLocked) return;
    if (!confirm('Delete this item?')) return;
    setCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.filter(item => item.id !== itemId)
        };
      }
      return cat;
    }));
  };

  const updateCategoryName = (categoryId, newName) => {
    if (isLocked || isEstimateLocked) return;
    setCategories(categories.map(cat => 
      cat.id === categoryId ? { ...cat, name: newName } : cat
    ));
  };

  const updateCategorySettings = (categoryId, name, icon, columns, formula) => {
    setCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        const updatedItems = cat.items.map(item => {
          const newItem = { ...item };
          columns.forEach(col => {
            if (newItem[col.id] === undefined) {
              newItem[col.id] = 0;
            }
          });
          return newItem;
        });
        return {
          ...cat,
          name,
          icon,
          columns,
          formula,
          items: updatedItems
        };
      }
      return cat;
    }));
    setShowSettings(null);
  };

  const deleteCategory = (categoryId) => {
    if (isLocked || isEstimateLocked) return;
    if (!confirm('Delete this entire section and all its items?')) return;
    setCategories(categories.filter(cat => cat.id !== categoryId));
  };

  const handleExport = () => {
    let csv = 'Category,Item Name,Fee/Price,Qty,Perf %\n';
    categories.forEach(cat => {
      cat.items.forEach(item => {
        const fee = item.fee || 0;
        const qty = item.qty || 0;
        const perfPct = item.perfPct || 0;
        csv += `${cat.name},"${item.name}",${fee},${qty},${perfPct}\n`;
      });
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'revenue-export.csv';
    a.click();
  };

  const grandTotal = calculateGrandTotal();

  const SettingsModal = ({ category }) => {
    const [sectionName, setSectionName] = useState(category.name);
    const [selectedIcon, setSelectedIcon] = useState(category.icon || 'cube');
    const [columns, setColumns] = useState(category.columns);
    const [formula, setFormula] = useState(category.formula);
    const [formulaError, setFormulaError] = useState(null);
    const [showAddCustomField, setShowAddCustomField] = useState(false);
    const [customFieldName, setCustomFieldName] = useState('');

    const validation = validateFormula(formula, columns.length);
    const preview = previewCalculation(formula, columns);

    const addColumn = () => {
      setColumns([...columns, { id: `col${Date.now()}`, label: 'New Column', type: 'standard' }]);
    };

    const removeColumn = (index) => {
      if (columns.length <= 1) {
        alert('Must have at least one column');
        return;
      }
      setColumns(columns.filter((_, i) => i !== index));
    };

    const updateColumnFromDropdown = (index, fieldId) => {
      const field = standardFields.find(f => f.id === fieldId);
      if (field) {
        const newColumns = [...columns];
        newColumns[index] = { id: field.id, label: field.label, type: 'standard' };
        setColumns(newColumns);
      }
    };

    const updateColumnLabel = (index, newLabel) => {
      const newColumns = [...columns];
      newColumns[index] = { ...newColumns[index], label: newLabel };
      setColumns(newColumns);
    };

    const addCustomField = () => {
      if (!customFieldName.trim()) return;
      const customId = `custom_${Date.now()}`;
      setColumns([...columns, { id: customId, label: customFieldName, type: 'custom' }]);
      setCustomFieldName('');
      setShowAddCustomField(false);
    };

    const handleFormulaChange = (value) => {
      setFormula(value);
      const validation = validateFormula(value, columns.length);
      setFormulaError(validation.valid ? null : validation.error);
    };

    const handleApply = () => {
      if (!validation.valid) {
        alert('Please fix the formula errors before applying');
        return;
      }
      if (!sectionName.trim()) {
        alert('Section name cannot be empty');
        return;
      }
      updateCategorySettings(category.id, sectionName.toUpperCase(), selectedIcon, columns, formula);
    };

    const getColumnLetter = (index) => String.fromCharCode(65 + index);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h3 className="text-lg font-bold text-gray-900">Section Settings - {category.name}</h3>
            <button onClick={() => setShowSettings(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section Name</label>
              <input
                type="text"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                placeholder="e.g., TICKETING"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Section Icon</label>
              <div className="grid grid-cols-6 gap-3">
                {availableIcons.map(icon => (
                  <button
                    key={icon.id}
                    onClick={() => setSelectedIcon(icon.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      selectedIcon === icon.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon.path} />
                    </svg>
                    <span className="text-xs text-gray-600">{icon.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">Columns & Headers</label>
                <button
                  onClick={addColumn}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Plus className="w-3 h-3" />
                  Add Column
                </button>
              </div>
              
              <div className="space-y-3">
                {columns.map((col, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <span className="px-2 py-1 text-xs font-mono font-bold bg-gray-200 text-gray-700 rounded min-w-[32px] text-center">
                      {getColumnLetter(index)}
                    </span>
                    
                    <select
                      value={col.id}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setShowAddCustomField(true);
                        } else {
                          updateColumnFromDropdown(index, e.target.value);
                        }
                      }}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 flex-1"
                    >
                      <option value={col.id}>{col.label}</option>
                      <optgroup label="Standard Fields">
                        {standardFields.map(field => (
                          <option key={field.id} value={field.id}>{field.label}</option>
                        ))}
                      </optgroup>
                      <option value="custom">+ Add Custom Field</option>
                    </select>
                    
                    <input
                      type="text"
                      value={col.label}
                      onChange={(e) => updateColumnLabel(index, e.target.value)}
                      placeholder="Column Header"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400"
                    />
                    
                    <button
                      onClick={() => removeColumn(index)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      disabled={columns.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {showAddCustomField && (
                <div className="mt-3 p-3 border border-gray-300 rounded-lg bg-gray-50">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom Field Name</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customFieldName}
                      onChange={(e) => setCustomFieldName(e.target.value)}
                      placeholder="e.g., Processing Fee"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400"
                      onKeyPress={(e) => e.key === 'Enter' && addCustomField()}
                    />
                    <button
                      onClick={addCustomField}
                      className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-900"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowAddCustomField(false);
                        setCustomFieldName('');
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Calculation Formula</label>
              
              <div className="mb-3 p-4 bg-gray-100 border border-gray-300 rounded-lg">
                <div className="text-sm font-medium text-gray-900 mb-2">How to write formulas:</div>
                <ul className="text-xs text-gray-700 space-y-1 ml-4">
                  <li>Start with = sign</li>
                  <li>Use column letters: A, B, C, D...</li>
                  <li>Operators: + - * / ( )</li>
                  <li>For percentages, divide by 100</li>
                </ul>
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <div className="text-xs font-medium text-gray-900 mb-1">Your columns:</div>
                  <div className="flex flex-wrap gap-2">
                    {columns.map((col, idx) => (
                      <span key={idx} className="text-xs bg-white text-gray-700 px-2 py-1 rounded border border-gray-300">
                        <strong>{getColumnLetter(idx)}</strong> = {col.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <textarea
                value={formula}
                onChange={(e) => handleFormulaChange(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg font-mono text-sm focus:ring-2 ${
                  formulaError 
                    ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                    : 'border-gray-300 focus:ring-gray-400'
                }`}
                rows={3}
                placeholder="=A * B * (1 + C/100)"
              />
              
              {formulaError && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-900">Formula Error</p>
                  <p className="text-xs text-red-700 mt-1">{formulaError}</p>
                </div>
              )}

              {!formulaError && validation.valid && preview.success && (
                <div className="mt-3 p-3 bg-gray-50 border border-gray-300 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Valid Formula ✓</p>
                      <p className="text-xs text-gray-600 mt-1">Preview with test values (100, 50, 10, 80, 5...)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Result:</p>
                      <p className="text-lg font-bold text-gray-900">
                        €{preview.result.toLocaleString('en-IE', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
            <button
              onClick={() => setShowSettings(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-900"
              disabled={!validation.valid}
            >
              Apply Settings
            </button>
          </div>
        </div>
      </div>
    );
  };

  const NewSectionModal = () => {
    const [sectionName, setSectionName] = useState('');
    const [columns, setColumns] = useState([
      { id: 'fee', label: 'Fee/Price', type: 'standard' },
      { id: 'qty', label: 'Qty', type: 'standard' },
      { id: 'perfPct', label: 'Perf %', type: 'standard' }
    ]);
    const [formula, setFormula] = useState('=A * B * (C/100)');

    const handleCreate = () => {
      if (!sectionName.trim()) {
        alert('Please enter a section name');
        return;
      }
      
      const availableColors = [
        { border: 'border-l-red-500', icon: 'bg-red-100', text: 'text-red-600' },
        { border: 'border-l-blue-500', icon: 'bg-blue-100', text: 'text-blue-600' },
        { border: 'border-l-green-500', icon: 'bg-green-100', text: 'text-green-600' },
        { border: 'border-l-purple-500', icon: 'bg-purple-100', text: 'text-purple-600' },
        { border: 'border-l-orange-500', icon: 'bg-orange-100', text: 'text-orange-600' },
        { border: 'border-l-cyan-500', icon: 'bg-cyan-100', text: 'text-cyan-600' },
        { border: 'border-l-pink-500', icon: 'bg-pink-100', text: 'text-pink-600' },
        { border: 'border-l-yellow-500', icon: 'bg-yellow-100', text: 'text-yellow-600' },
        { border: 'border-l-indigo-500', icon: 'bg-indigo-100', text: 'text-indigo-600' }
      ];
      
      const newSection = {
        id: sectionName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        name: sectionName.toUpperCase(),
        icon: 'cube',
        color: availableColors[categories.length % availableColors.length],
        expanded: true,
        columns: columns,
        formula: formula,
        items: []
      };
      setCategories([...categories, newSection]);
      setShowNewSectionModal(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Create New Revenue Section</h3>
            <button onClick={() => setShowNewSectionModal(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Section Name</label>
            <input
              type="text"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              placeholder="e.g., Hardware Sales"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={() => setShowNewSectionModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
            >
              Create Section
            </button>
          </div>
        </div>
      </div>
    );
  };

  const UnlockEstimateModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Unlock Revenue Estimate</h3>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-900">Warning</p>
                <p className="text-sm text-yellow-800 mt-1">
                  You are about to unlock this ROI estimate.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-900">Important Notice</p>
                <p className="text-sm text-red-800 mt-1">
                  This will move the project back to <strong>Pre-Contract Approval</strong>.
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={handleCancelUnlock}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUnlockConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              Unlock Estimate
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 pb-6">
      <div className="max-w-[1600px] mx-auto">
        {isEstimateLocked && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Lock className="w-5 h-5 text-red-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-red-900">Estimate Locked</p>
                  <p className="text-xs text-red-700 mt-1">
                    This revenue estimate is locked. Click "Unlock Estimate" to make changes.
                  </p>
                </div>
              </div>
              <button
                onClick={handleUnlockEstimateStart}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-white border-2 border-red-500 rounded-lg hover:bg-red-50"
              >
                <Unlock className="w-4 h-4" />
                Unlock Estimate
              </button>
            </div>
          </div>
        )}

        <div className="sticky top-0 z-30 bg-gray-50 pb-2">
          {(!isEstimateLocked && isLocked) || (!isEstimateLocked && !isLocked) ? (
            <div className={`flex items-center p-4 rounded-lg mb-2 ${
              !isEstimateLocked && isLocked
                ? 'bg-blue-50 border-l-4 border-blue-500'
                : 'bg-green-50 border-l-4 border-green-500'
            }`}>
              {!isEstimateLocked && isLocked && (
                <>
                  <Lock className="w-5 h-5 text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">View-Only Mode</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Click the "Edit Info" button to make changes.
                    </p>
                  </div>
                </>
              )}
              {!isEstimateLocked && !isLocked && (
                <>
                  <Unlock className="w-5 h-5 text-green-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Edit Mode Active</p>
                    <p className="text-xs text-green-700 mt-1">
                      You can now make changes. Click "Done Editing" when finished.
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : null}

          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">REVENUE</h1>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Estimated Total</div>
                <div className="text-2xl font-bold text-gray-900">
                  €{grandTotal.toLocaleString('en-IE', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Revenue Categories</h2>
          <div className="flex gap-6">
            <div className="flex-1 grid grid-cols-4 gap-3">
              {categories.map((category) => {
                const total = calculateCategoryTotal(category);
                const iconPath = availableIcons.find(i => i.id === category.icon)?.path || availableIcons.find(i => i.id === 'cube').path;
                
                return (
                  <div key={category.id} className={`bg-white rounded-lg border-l-4 ${category.color.border} p-3 shadow-sm hover:shadow-md transition-shadow`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-500 uppercase mb-1 truncate">
                          {category.name}
                        </div>
                        <div className="text-lg font-bold text-gray-900 truncate">
                          €{total.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div className={`p-2 rounded-full ${category.color.icon} flex-shrink-0`}>
                        <svg className={`w-4 h-4 ${category.color.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex flex-col gap-3 w-48">
              {!isEstimateLocked && (
                <button
                  onClick={async () => {
                    if (!isLocked) {
                      await saveConfiguration();
                    }
                    setIsLocked(!isLocked);
                  }}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg ${
                    isLocked
                      ? 'text-white bg-blue-600 hover:bg-blue-700'
                      : 'text-white bg-green-600 hover:bg-green-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSaving ? (
                    <>
                      <Upload className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : isLocked ? (
                    <>
                      <Lock className="w-4 h-4" />
                      Edit Info
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4" />
                      Done Editing
                    </>
                  )}
                </button>
              )}
              
              {!isEstimateLocked && isLocked && (
                <button
                  onClick={handleLockEstimate}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  <Lock className="w-4 h-4" />
                  Lock Estimate
                </button>
              )}
              
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Upload className="w-4 h-4" />
                Import CSV
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                Export File
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {!isLocked && !isEstimateLocked && (
            <div className="flex justify-end">
              <button
                onClick={() => setShowNewSectionModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" />
                New Section
              </button>
            </div>
          )}
          
          {categories.map(category => (
            <div key={category.id} className="bg-white rounded-lg border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <button onClick={() => toggleCategory(category.id)} className="text-gray-400 hover:text-gray-600">
                      {category.expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                    <svg className={`w-5 h-5 ${category.color.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={availableIcons.find(i => i.id === category.icon)?.path || availableIcons.find(i => i.id === 'cube').path} />
                    </svg>
                    <span className="text-lg font-bold text-gray-900">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-gray-900">
                      €{calculateCategoryTotal(category).toLocaleString('en-IE', { minimumFractionDigits: 2 })}
                    </span>
                    <button
                      onClick={() => (isLocked || isEstimateLocked) ? showLockedMessage() : setShowSettings(category)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    {!isLocked && !isEstimateLocked && (
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                        title="Delete Section"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {category.expanded && (
                <div>
                  <div className="px-6 py-3 bg-gray-50 grid gap-4 items-center text-sm font-medium text-gray-600"
                       style={{ gridTemplateColumns: 'minmax(200px, 1fr) repeat(3, minmax(100px, 1fr)) minmax(120px, 1fr) 80px' }}>
                    <div>Item</div>
                    {category.columns.map(col => (
                      <div key={col.id} className="text-center">{col.label}</div>
                    ))}
                    <div className="text-center">Total</div>
                    <div></div>
                  </div>

                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      className={`px-6 py-3 border-t border-gray-100 grid gap-4 items-center ${
                        !(isLocked || isEstimateLocked) ? 'hover:bg-gray-50' : ''
                      }`}
                      style={{ gridTemplateColumns: 'minmax(200px, 1fr) repeat(3, minmax(100px, 1fr)) minmax(120px, 1fr) 80px' }}
                    >
                      <div className="text-sm text-gray-900">{item.name}</div>
                      {category.columns.map(col => (
                        <div key={col.id} className="text-center">
                          <input
                            type="number"
                            step="0.01"
                            value={item[col.id] || 0}
                            onChange={(e) => updateItem(category.id, item.id, col.id, e.target.value)}
                            className={`w-full px-2 py-1 text-sm text-center border-0 focus:outline-none focus:ring-0 ${
                              (isLocked || isEstimateLocked)
                                ? 'cursor-not-allowed text-gray-900 bg-white' 
                                : 'text-gray-900 bg-gray-50 hover:bg-gray-100'
                            }`}
                            disabled={isLocked || isEstimateLocked}
                          />
                        </div>
                      ))}
                      <div className="text-center text-sm font-semibold text-gray-900">
                        €{calculateTotal(item, category).toLocaleString('en-IE', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => (isLocked || isEstimateLocked) ? showLockedMessage() : duplicateItem(category.id, item.id)} 
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                          title="Duplicate"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => (isLocked || isEstimateLocked) ? showLockedMessage() : deleteItem(category.id, item.id)} 
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => (isLocked || isEstimateLocked) ? showLockedMessage() : addItem(category.id)} 
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                          title="Add Item"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {!isLocked && !isEstimateLocked && (
            <div className="flex justify-end">
              <button
                onClick={() => setShowNewSectionModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" />
                New Section
              </button>
            </div>
          )}
        </div>
      </div>

      {showNewSectionModal && <NewSectionModal />}
      {showUnlockModal && <UnlockEstimateModal />}
      {showSettings && <SettingsModal category={showSettings} />}

      {/* Unsaved changes warning modal */}
      {showWarning && (
        <UnsavedChangesModal
          onContinueEditing={cancelNavigation}
          onDiscardChanges={confirmNavigation}
        />
      )}

      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 transition-all duration-300 ease-out">
          <div className="bg-gray-900 text-white px-5 py-3 rounded-lg shadow-2xl flex items-center gap-3 max-w-md border border-gray-700">
            <div className="flex items-center justify-center w-8 h-8 bg-gray-800 rounded-full flex-shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <p className="text-sm">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
});

ROIRevenueBuilder.displayName = 'ROIRevenueBuilder';

export default ROIRevenueBuilder;
