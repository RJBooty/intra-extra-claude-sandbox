import React, { useState, useEffect, useRef } from 'react';
import { GripVertical, Maximize2, FolderOpen, Building2, Settings, Calendar, CreditCard, RefreshCw, Truck, BarChart3, Link2, DollarSign, Trash2, X, Plus, ChevronDown, MapPin, Upload, Table, Hash, Type, CheckSquare, Clock, Grid3x3, AlertTriangle, Lock, Unlock, AlertCircle } from 'lucide-react';
import { saveProjectCardLayouts, loadProjectCardLayouts, saveProjectFieldValues, loadProjectFieldValues } from '../../lib/supabase';
import {
  ShortTextField,
  LongTextField,
  NumberField,
  DropdownField,
  MultipleChoiceField,
  DateField,
  TimeField,
  DateTimeField,
  AddressField,
  URLField,
  FileUploadField,
  TableField
} from '../field-components/FieldComponents';

// Field Editor Component
const FieldEditor = ({ section, onSave, onClose }) => {
  const [fields, setFields] = useState(section.fields || []);
  const [showAddField, setShowAddField] = useState(false);
  const [activeTab, setActiveTab] = useState('configuration'); // 'configuration' or 'layout'

  // Layout state
  const [layoutColumns, setLayoutColumns] = useState(section.layoutColumns || 1);
  const [layoutRows, setLayoutRows] = useState(section.layoutRows || Math.ceil((section.fields || []).length / (section.layoutColumns || 1)));
  const [fieldLayout, setFieldLayout] = useState(section.fieldLayout || {});
  const [draggedField, setDraggedField] = useState(null);

  const fieldTypes = [
    { value: 'text', label: 'Short Text', icon: Type },
    { value: 'textarea', label: 'Long Text', icon: Type },
    { value: 'number', label: 'Number', icon: Hash },
    { value: 'dropdown', label: 'Dropdown', icon: ChevronDown },
    { value: 'multiselect', label: 'Multiple Choice', icon: CheckSquare },
    { value: 'date', label: 'Date Only', icon: Calendar },
    { value: 'time', label: 'Time Only', icon: Clock },
    { value: 'datetime', label: 'Date & Time', icon: Calendar },
    { value: 'address', label: 'Address', icon: MapPin },
    { value: 'url', label: 'URL', icon: Link2 },
    { value: 'file', label: 'File Upload', icon: Upload },
    { value: 'table', label: 'Table', icon: Table }
  ];

  const addField = (type) => {
    const newField = {
      id: `field-${Date.now()}`,
      type,
      label: `New ${fieldTypes.find(f => f.value === type)?.label || 'Field'}`,
      required: false,
      options: type === 'dropdown' || type === 'multiselect' ? ['Option 1', 'Option 2'] : null
    };
    setFields([...fields, newField]);
    setShowAddField(false);
  };

  const updateField = (fieldId, updates) => {
    setFields(fields.map(f => f.id === fieldId ? { ...f, ...updates } : f));
  };

  const removeField = (fieldId) => {
    setFields(fields.filter(f => f.id !== fieldId));
  };

  const moveField = (fieldId, direction) => {
    const index = fields.findIndex(f => f.id === fieldId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;

    const newFields = [...fields];
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    setFields(newFields);
  };

  // Layout handlers
  const handleDragFieldStart = (field) => {
    setDraggedField(field);
  };

  const handleDropInCell = (column, row) => {
    if (!draggedField) return;

    const cellKey = `${row}-${column}`;

    // Check if this position would overlap with existing fields
    if (isOverlapping(row, column, 1)) {
      alert('Cannot place field here - it would overlap with another field');
      setDraggedField(null);
      return;
    }

    setFieldLayout(prev => ({
      ...prev,
      [cellKey]: { fieldId: draggedField.id, columnSpan: 1 }
    }));
    setDraggedField(null);
  };

  const handleRemoveFromCell = (cellKey) => {
    setFieldLayout(prev => {
      const newLayout = { ...prev };
      delete newLayout[cellKey];
      return newLayout;
    });
  };

  const handleChangeColumnSpan = (cellKey, delta) => {
    const cell = fieldLayout[cellKey];
    if (!cell) return;

    const [row, column] = cellKey.split('-').map(Number);
    const newSpan = Math.max(1, Math.min(layoutColumns, cell.columnSpan + delta));

    // Check if increasing span would overlap
    if (newSpan > cell.columnSpan && isOverlapping(row, column, newSpan, cellKey)) {
      alert('Cannot increase span - would overlap with another field');
      return;
    }

    // Check if field would exceed grid width
    if (column + newSpan - 1 > layoutColumns) {
      alert(`Cannot span ${newSpan} columns from column ${column} - exceeds grid width`);
      return;
    }

    setFieldLayout(prev => ({
      ...prev,
      [cellKey]: { ...cell, columnSpan: newSpan }
    }));
  };

  // Check if a field placement would overlap with existing fields
  const isOverlapping = (row, startCol, span, excludeCellKey = null) => {
    const endCol = startCol + span - 1;

    for (let col = startCol; col <= endCol; col++) {
      const checkKey = `${row}-${col}`;
      if (checkKey === excludeCellKey) continue;

      // Check if this cell is occupied
      if (fieldLayout[checkKey]) return true;

      // Check if any field spans into this cell
      for (const [key, cell] of Object.entries(fieldLayout)) {
        if (key === excludeCellKey) continue;
        const [cellRow, cellCol] = key.split('-').map(Number);
        if (cellRow === row) {
          const cellEndCol = cellCol + cell.columnSpan - 1;
          if (col >= cellCol && col <= cellEndCol) return true;
        }
      }
    }
    return false;
  };

  // Clean up orphaned fields when grid dimensions change
  const cleanupOrphanedFields = (newColumns, newRows) => {
    const cleanedLayout = {};
    let orphanedCount = 0;

    for (const [key, cell] of Object.entries(fieldLayout)) {
      const [row, column] = key.split('-').map(Number);
      const fieldEndColumn = column + cell.columnSpan - 1;

      // Check if field is still within grid bounds
      if (row <= newRows && column <= newColumns && fieldEndColumn <= newColumns) {
        cleanedLayout[key] = cell;
      } else {
        orphanedCount++;
      }
    }

    if (orphanedCount > 0) {
      setFieldLayout(cleanedLayout);
      console.log(`Removed ${orphanedCount} orphaned field(s) from layout`);
    }
  };

  const handleColumnsChange = (delta) => {
    const newColumns = Math.max(1, Math.min(6, layoutColumns + delta));
    setLayoutColumns(newColumns);
    cleanupOrphanedFields(newColumns, layoutRows);
  };

  const handleRowsChange = (delta) => {
    const newRows = Math.max(1, Math.min(12, layoutRows + delta));
    setLayoutRows(newRows);
    cleanupOrphanedFields(layoutColumns, newRows);
  };

  const handleSave = () => {
    const updatedSection = {
      ...section,
      fields,
      layoutColumns,
      layoutRows,
      fieldLayout
    };
    onSave(updatedSection);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Card Settings: {section.title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setActiveTab('configuration')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'configuration'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Settings className="h-4 w-4 inline mr-2" />
              Field Configuration
            </button>
            <button
              onClick={() => setActiveTab('layout')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'layout'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Grid3x3 className="h-4 w-4 inline mr-2" />
              Field Layout
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'configuration' ? (
            <div className="space-y-3">
          {fields.map((field, index) => {
            const FieldTypeIcon = fieldTypes.find(t => t.value === field.type)?.icon || Type;
            return (
              <div key={field.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col gap-1 pt-2">
                    <button
                      onClick={() => moveField(field.id, 'up')}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveField(field.id, 'down')}
                      disabled={index === fields.length - 1}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs"
                    >
                      ▼
                    </button>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <FieldTypeIcon className="h-4 w-4 text-gray-500" />
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Field Label"
                      />
                      <select
                        value={field.type}
                        onChange={(e) => updateField(field.id, { type: e.target.value })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        {fieldTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    {(field.type === 'dropdown' || field.type === 'multiselect') && (
                      <div className="pl-6">
                        <label className="text-xs text-gray-600 font-medium">Options (comma separated):</label>
                        <input
                          type="text"
                          value={(field.options || []).join(', ')}
                          onChange={(e) => updateField(field.id, {
                            options: e.target.value.split(',').map(o => o.trim()).filter(Boolean)
                          })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-1"
                          placeholder="Option 1, Option 2, Option 3"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-4 pl-6">
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={field.required || false}
                          onChange={(e) => updateField(field.id, { required: e.target.checked })}
                          className="rounded"
                        />
                        Required
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={field.readonly || false}
                          onChange={(e) => updateField(field.id, { readonly: e.target.checked })}
                          className="rounded"
                        />
                        Read-only
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={() => removeField(field.id)}
                    className="text-red-400 hover:text-red-600 p-1"
                    title="Remove field"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {!showAddField ? (
            <button
              onClick={() => setShowAddField(true)}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Field
            </button>
          ) : (
            <div className="border-2 border-blue-400 rounded-lg p-4 bg-blue-50">
              <p className="text-sm font-semibold text-gray-900 mb-3">Select field type:</p>
              <div className="grid grid-cols-3 gap-2">
                {fieldTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => addField(type.value)}
                      className="p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
                    >
                      <Icon className="h-5 w-5 text-gray-600 mb-1" />
                      <p className="text-xs font-medium text-gray-900">{type.label}</p>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setShowAddField(false)}
                className="mt-3 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          )}
            </div>
          ) : (
            // Layout Tab
            <div className="space-y-4">
              {/* Grid Size Controls */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Grid Layout</h3>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">Columns:</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleColumnsChange(-1)}
                        className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                      >
                        −
                      </button>
                      <span className="text-sm font-bold text-gray-900 min-w-[2rem] text-center">{layoutColumns}</span>
                      <button
                        onClick={() => handleColumnsChange(1)}
                        className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">Rows:</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRowsChange(-1)}
                        className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                      >
                        −
                      </button>
                      <span className="text-sm font-bold text-gray-900 min-w-[2rem] text-center">{layoutRows}</span>
                      <button
                        onClick={() => handleRowsChange(1)}
                        className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Available Fields */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Available Fields</h3>
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg min-h-[60px]">
                  {fields.filter(field => {
                    // Show fields that are not placed in the layout
                    const placedFieldIds = Object.values(fieldLayout).map(cell => cell.fieldId);
                    return !placedFieldIds.includes(field.id);
                  }).map(field => {
                    const FieldIcon = fieldTypes.find(t => t.value === field.type)?.icon || Type;
                    return (
                      <div
                        key={field.id}
                        draggable
                        onDragStart={() => handleDragFieldStart(field)}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg cursor-move hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      >
                        <FieldIcon className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">{field.label}</span>
                      </div>
                    );
                  })}
                  {(() => {
                    const placedFieldIds = Object.values(fieldLayout).map(cell => cell.fieldId);
                    return fields.filter(f => !placedFieldIds.includes(f.id)).length === 0;
                  })() && (
                    <p className="text-sm text-gray-500">All fields have been placed in the layout</p>
                  )}
                </div>
              </div>

              {/* Layout Grid */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Field Layout Grid</h3>
                <p className="text-xs text-gray-600 mb-2">Drag fields into cells. Use +/- to adjust column span.</p>
                <div
                  className="grid gap-2 p-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg"
                  style={{
                    gridTemplateColumns: `repeat(${layoutColumns}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${layoutRows}, minmax(80px, auto))`
                  }}
                >
                  {Array.from({ length: layoutColumns * layoutRows }).map((_, index) => {
                    const column = (index % layoutColumns) + 1;
                    const row = Math.floor(index / layoutColumns) + 1;
                    const cellKey = `${row}-${column}`;

                    // Check if this cell contains a field
                    const cellData = fieldLayout[cellKey];

                    // Check if this cell is covered by a spanning field
                    let spanningField = null;
                    let spanningCellKey = null;
                    for (const [key, cell] of Object.entries(fieldLayout)) {
                      const [fieldRow, fieldCol] = key.split('-').map(Number);
                      if (fieldRow === row && column >= fieldCol && column < fieldCol + cell.columnSpan) {
                        spanningField = cell;
                        spanningCellKey = key;
                        break;
                      }
                    }

                    // If cell is covered by a spanning field but is not the origin, skip rendering
                    if (spanningField && cellKey !== spanningCellKey) {
                      return null;
                    }

                    const field = cellData ? fields.find(f => f.id === cellData.fieldId) : null;
                    const FieldIcon = field ? fieldTypes.find(t => t.value === field.type)?.icon || Type : null;
                    const columnSpan = cellData ? cellData.columnSpan : 1;

                    return (
                      <div
                        key={cellKey}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDropInCell(column, row)}
                        className={`border-2 border-dashed rounded-lg p-2 flex flex-col justify-center min-h-[80px] transition-colors ${
                          field
                            ? 'bg-blue-50 border-blue-300'
                            : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                        style={{
                          gridColumn: `span ${columnSpan}`
                        }}
                      >
                        {field ? (
                          <div className="w-full">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {FieldIcon && <FieldIcon className="h-4 w-4 text-blue-600 flex-shrink-0" />}
                                <span className="text-xs font-semibold text-gray-900 truncate">{field.label}</span>
                              </div>
                              <button
                                onClick={() => handleRemoveFromCell(cellKey)}
                                className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                                title="Remove from cell"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                            <p className="text-[10px] text-gray-600 mb-2">
                              {fieldTypes.find(t => t.value === field.type)?.label || field.type}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-medium text-gray-700">Span:</span>
                              <div className="flex items-center gap-1 bg-white rounded border border-gray-300">
                                <button
                                  onClick={() => handleChangeColumnSpan(cellKey, -1)}
                                  disabled={columnSpan <= 1}
                                  className="px-1.5 py-0.5 text-xs font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Decrease span"
                                >
                                  −
                                </button>
                                <span className="text-xs font-bold text-gray-900 min-w-[1.5rem] text-center">
                                  {columnSpan}
                                </span>
                                <button
                                  onClick={() => handleChangeColumnSpan(cellKey, 1)}
                                  disabled={columnSpan >= layoutColumns}
                                  className="px-1.5 py-0.5 text-xs font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Increase span"
                                >
                                  +
                                </button>
                              </div>
                              {columnSpan > 1 && (
                                <span className="text-[10px] text-blue-600 font-medium">
                                  ({columnSpan} cols)
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 text-center">Drop field here</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

// Field Renderer Component - Uses enhanced field components
const FieldRenderer = ({ field, value, onChange, isEditMode }) => {
  // Fields are disabled if not in edit info mode OR if field is readonly
  const isDisabled = !isEditMode || field.readonly;

  switch (field.type) {
    case 'text':
      return (
        <ShortTextField
          value={value}
          onChange={onChange}
          disabled={isDisabled}
          maxLength={field.maxLength || 255}
        />
      );
    case 'textarea':
      return (
        <LongTextField
          value={value}
          onChange={onChange}
          disabled={isDisabled}
          maxLength={field.maxLength || 2000}
        />
      );
    case 'number':
      return (
        <NumberField
          value={value}
          onChange={onChange}
          disabled={isDisabled}
          min={field.min}
          max={field.max}
          step={field.step}
        />
      );
    case 'dropdown':
      return (
        <DropdownField
          value={value}
          onChange={onChange}
          disabled={isDisabled}
          options={field.options || []}
        />
      );
    case 'multiselect':
      return (
        <MultipleChoiceField
          value={value}
          onChange={onChange}
          disabled={isDisabled}
          options={field.options || []}
        />
      );
    case 'date':
      return (
        <DateField
          value={value}
          onChange={onChange}
          disabled={isDisabled}
        />
      );
    case 'time':
      return (
        <TimeField
          value={value}
          onChange={onChange}
          disabled={isDisabled}
        />
      );
    case 'datetime':
      return (
        <DateTimeField
          value={value}
          onChange={onChange}
          disabled={isDisabled}
        />
      );
    case 'address':
      return (
        <AddressField
          value={value}
          onChange={onChange}
          disabled={isDisabled}
        />
      );
    case 'url':
      return (
        <URLField
          value={value}
          onChange={onChange}
          disabled={isDisabled}
        />
      );
    case 'file':
      return (
        <FileUploadField
          value={value}
          onChange={onChange}
          disabled={isDisabled}
          accept={field.accept}
        />
      );
    case 'table':
      return (
        <TableField
          value={value}
          onChange={onChange}
          disabled={isDisabled}
        />
      );
    default:
      return <span className="text-sm text-gray-500">{value || '-'}</span>;
  }
};

// Icon mapping helper
const iconNameToComponent = {
  'FolderOpen': FolderOpen,
  'Building2': Building2,
  'Settings': Settings,
  'Calendar': Calendar,
  'CreditCard': CreditCard,
  'RefreshCw': RefreshCw,
  'Truck': Truck,
  'BarChart3': BarChart3,
  'Link2': Link2,
  'DollarSign': DollarSign
};

const ProjectCoreInfo = ({ project }) => {
  const [userRole] = useState('Senior');

  // Use the passed project prop or fallback to demo data
  const projectData = project || {
    project_code: 'PR-CAS-001',
    project_id: 'PR-CAS-001',
    event_name: 'Glastonbury Festival 2025',
    status: 'Active',
    project_type: 'Full Service',
    client_tier: 'Tier 1',
    progress: 45
  };

  const canViewFinancials = ['Master', 'Senior', 'HR_Finance'].includes(userRole);

  const [draggedSection, setDraggedSection] = useState(null);
  const [dragOverCell, setDragOverCell] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const [resizingSection, setResizingSection] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState(null);

  const [showGridGuides, setShowGridGuides] = useState(true);
  const [hoveredSection, setHoveredSection] = useState(null);

  const [gridColumns, setGridColumns] = useState(35);
  const [gridRows, setGridRows] = useState(25);

  const [overflowingSections, setOverflowingSections] = useState(new Set());
  const sectionRefs = useRef({});

  const [isEditLayoutMode, setIsEditLayoutMode] = useState(false);
  const [isEditInfoMode, setIsEditInfoMode] = useState(false);
  const [editingFieldsSection, setEditingFieldsSection] = useState(null);
  const [fieldValues, setFieldValues] = useState({});
  const [savedFieldValues, setSavedFieldValues] = useState({}); // Store saved values
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [editingCardTitle, setEditingCardTitle] = useState(null);
  const [editingCardIcon, setEditingCardIcon] = useState(null);

  const [sections, setSections] = useState([
    {
      id: 'project-info',
      title: 'Project Information',
      icon: FolderOpen,
      gridColumn: 1,
      gridRow: 1,
      gridColumnSpan: 8,
      gridRowSpan: 5,
      type: 'project-info',
      fields: [
        { id: 'f1', type: 'text', label: 'Project ID', readonly: false },
        { id: 'f2', type: 'text', label: 'Event Name', readonly: false },
        { id: 'f3', type: 'dropdown', label: 'Project Type', options: ['Full Service', 'Equipment Only', 'Consulting'], readonly: false },
        { id: 'f4', type: 'dropdown', label: 'Status', options: ['Active', 'Planning', 'Complete'], readonly: false }
      ]
    },
    {
      id: 'client-info',
      title: 'Client Information',
      icon: Building2,
      gridColumn: 10,
      gridRow: 1,
      gridColumnSpan: 8,
      gridRowSpan: 5,
      type: 'client-info',
      fields: [
        { id: 'c1', type: 'text', label: 'Primary Contact', readonly: false },
        { id: 'c2', type: 'text', label: 'Email', readonly: false },
        { id: 'c3', type: 'text', label: 'Phone', readonly: false },
        { id: 'c4', type: 'address', label: 'Venue Location', readonly: false }
      ]
    },
    {
      id: 'back-office',
      title: 'Back-Office Connections',
      icon: Link2,
      gridColumn: 19,
      gridRow: 1,
      gridColumnSpan: 6,
      gridRowSpan: 5,
      type: 'back-office',
      fields: [
        { id: 'b1', type: 'url', label: 'SharePoint Folder', readonly: false },
        { id: 'b2', type: 'url', label: 'Jira Project', readonly: false },
        { id: 'b3', type: 'url', label: 'JUE Dashboard', readonly: false }
      ]
    },
    {
      id: 'config-settings',
      title: 'Configuration Settings',
      icon: Settings,
      gridColumn: 26,
      gridRow: 1,
      gridColumnSpan: 6,
      gridRowSpan: 5,
      type: 'config-settings',
      fields: [
        { id: 'cfg1', type: 'dropdown', label: 'RFID Type', options: ['NFC', 'UHF', 'LF'], readonly: false },
        { id: 'cfg2', type: 'dropdown', label: 'Currency', options: ['GBP', 'EUR', 'USD'], readonly: false },
        { id: 'cfg3', type: 'number', label: 'Top-up Limit', readonly: false }
      ]
    },
    {
      id: 'cashless-info',
      title: 'Cashless Information',
      icon: CreditCard,
      gridColumn: 1,
      gridRow: 7,
      gridColumnSpan: 8,
      gridRowSpan: 5,
      type: 'cashless-info',
      fields: [
        { id: 'cash1', type: 'dropdown', label: 'Cashless Enabled', options: ['Yes', 'No'], readonly: false },
        { id: 'cash2', type: 'number', label: 'Top-up Points', readonly: false }
      ]
    },
    {
      id: 'refund-info',
      title: 'Refund Information',
      icon: RefreshCw,
      gridColumn: 10,
      gridRow: 7,
      gridColumnSpan: 8,
      gridRowSpan: 5,
      type: 'refund-info',
      fields: [
        { id: 'ref1', type: 'number', label: 'Refund Window (days)', readonly: false },
        { id: 'ref2', type: 'dropdown', label: 'Refund Method', options: ['Original Payment', 'Bank Transfer', 'Cash'], readonly: false }
      ]
    },
    {
      id: 'key-dates',
      title: 'Key Dates',
      icon: Calendar,
      gridColumn: 19,
      gridRow: 7,
      gridColumnSpan: 6,
      gridRowSpan: 5,
      type: 'key-dates',
      fields: [
        { id: 'd1', type: 'date', label: 'Event Start', readonly: false },
        { id: 'd2', type: 'date', label: 'Event End', readonly: false },
        { id: 'd3', type: 'date', label: 'Build Start', readonly: false },
        { id: 'd4', type: 'date', label: 'Delivery Deadline', readonly: false }
      ]
    },
    {
      id: 'summary',
      title: 'Summary Overview',
      icon: BarChart3,
      gridColumn: 26,
      gridRow: 7,
      gridColumnSpan: 6,
      gridRowSpan: 5,
      type: 'summary',
      fields: [
        { id: 's1', type: 'number', label: 'Devices', readonly: false },
        { id: 's2', type: 'number', label: 'Readers', readonly: false },
        { id: 's3', type: 'number', label: 'Capacity', readonly: false },
        { id: 's4', type: 'number', label: 'Top-ups', readonly: false }
      ]
    },
    {
      id: 'delivery-deadlines',
      title: 'Delivery & Deadlines',
      icon: Truck,
      gridColumn: 1,
      gridRow: 13,
      gridColumnSpan: 8,
      gridRowSpan: 5,
      type: 'delivery-deadlines',
      fields: [
        { id: 'del1', type: 'date', label: 'Equipment Delivery', readonly: false },
        { id: 'del2', type: 'date', label: 'Setup Complete', readonly: false },
        { id: 'del3', type: 'date', label: 'On-Site Arrival', readonly: false }
      ]
    },
    {
      id: 'fees-overview',
      title: 'Fees Overview',
      icon: DollarSign,
      gridColumn: 10,
      gridRow: 13,
      gridColumnSpan: 8,
      gridRowSpan: 5,
      type: 'fees-overview',
      requiresPermission: true,
      fields: [
        { id: 'fee1', type: 'number', label: 'Base Fee', readonly: false },
        { id: 'fee2', type: 'number', label: 'Device Fee', readonly: false },
        { id: 'fee3', type: 'number', label: 'Service Fee', readonly: false },
        { id: 'fee4', type: 'number', label: 'Total Value', readonly: true }
      ]
    }
  ]);

  // Edit Info Mode handlers
  const handleEditInfo = () => {
    setIsEditInfoMode(true);
  };

  const handleSaveInfo = async () => {
    try {
      // Save field values to database
      await saveProjectFieldValues(projectData.project_code, fieldValues);
      setSavedFieldValues(fieldValues); // Update saved values
      console.log('Field values saved successfully');
      setIsEditInfoMode(false);
    } catch (error) {
      console.error('Failed to save field values:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  const handleCancelEditInfo = () => {
    // Revert to saved values
    setFieldValues(savedFieldValues);
    setIsEditInfoMode(false);
  };

  // Edit Layout Mode handlers
  const handleUnlockLayout = () => {
    setIsEditLayoutMode(true);
  };

  const handleLockLayout = async () => {
    const confirmed = window.confirm(
      "Lock Layout?\n\nThis will save the current card positions and sizes.\nThis action cannot be undone.\n\nDo you want to proceed?"
    );

    if (confirmed) {
      try {
        // Save card layouts (structure)
        await saveProjectCardLayouts(projectData.project_code, sections);
        console.log('Layout saved successfully');
        setIsEditLayoutMode(false);
      } catch (error) {
        console.error('Failed to save layout:', error);
        alert('Failed to save layout. Please try again.');
      }
    }
  };

  const handleAddNewCard = () => {
    if (!newCardTitle.trim()) {
      alert('Please enter a card title');
      return;
    }

    const newCard = {
      id: `card-${Date.now()}`,
      title: newCardTitle,
      icon: FolderOpen,
      gridColumn: 1,
      gridRow: 1,
      gridColumnSpan: 6,
      gridRowSpan: 4,
      type: 'custom',
      fields: [
        { id: `field-${Date.now()}`, type: 'text', label: 'New Field', readonly: false }
      ]
    };

    setSections([...sections, newCard]);
    setNewCardTitle('');
    setShowAddCardModal(false);
  };

  const handleDeleteCard = (cardId) => {
    const confirmed = window.confirm(
      "Delete this card?\n\nThis action cannot be undone.\n\nAre you sure?"
    );

    if (confirmed) {
      setSections(sections.filter(s => s.id !== cardId));
    }
  };

  const handleRenameCard = (cardId, newTitle) => {
    if (!newTitle.trim()) {
      alert('Card title cannot be empty');
      return;
    }
    setSections(sections.map(s =>
      s.id === cardId ? { ...s, title: newTitle } : s
    ));
    setEditingCardTitle(null);
  };

  const handleChangeIcon = (cardId, newIcon) => {
    setSections(sections.map(s =>
      s.id === cardId ? { ...s, icon: newIcon } : s
    ));
    setEditingCardIcon(null);
  };

  const availableIcons = [
    { name: 'Folder', component: FolderOpen },
    { name: 'Building', component: Building2 },
    { name: 'Settings', component: Settings },
    { name: 'Calendar', component: Calendar },
    { name: 'Credit Card', component: CreditCard },
    { name: 'Refresh', component: RefreshCw },
    { name: 'Truck', component: Truck },
    { name: 'Chart', component: BarChart3 },
    { name: 'Link', component: Link2 },
    { name: 'Dollar', component: DollarSign }
  ];

  const updateFieldValue = (sectionId, fieldId, value) => {
    setFieldValues(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [fieldId]: value
      }
    }));
  };

  const saveFields = (updatedSection) => {
    setSections(sections.map(s =>
      s.id === editingFieldsSection.id ? updatedSection : s
    ));
    setEditingFieldsSection(null);
  };

  const handleDragStart = (section, e) => {
    if (!isEditLayoutMode) {
      e.preventDefault();
      return;
    }
    e.stopPropagation();
    setDraggedSection(section);
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    if (!isDragging || !draggedSection) return;
    e.preventDefault();
    e.stopPropagation();

    // Find ALL visual grid cells
    const gridContainer = e.currentTarget;
    const visualCells = gridContainer.parentElement
      .querySelector('.absolute.pointer-events-none') // The grid overlay
      ?.querySelectorAll('.border-dashed');

    if (!visualCells || visualCells.length === 0) {
      console.error('No visual grid cells found');
      return;
    }

    // Find which cell the mouse is actually over
    let foundColumn = 1;
    let foundRow = 1;
    let smallestDistance = Infinity;

    visualCells.forEach((cell, index) => {
      const rect = cell.getBoundingClientRect();
      const cellCenterX = rect.left + rect.width / 2;
      const cellCenterY = rect.top + rect.height / 2;

      // Distance from mouse to cell center
      const distance = Math.sqrt(
        Math.pow(e.clientX - cellCenterX, 2) +
        Math.pow(e.clientY - cellCenterY, 2)
      );

      // Is mouse inside this cell?
      const isInside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (isInside || distance < smallestDistance) {
        smallestDistance = distance;
        // Calculate grid position from index
        foundColumn = (index % gridColumns) + 1;
        foundRow = Math.floor(index / gridColumns) + 1;

        if (isInside) {
          console.log('✅ Mouse INSIDE cell:', {
            column: foundColumn,
            row: foundRow,
            cellRect: rect,
            mouseX: e.clientX,
            mouseY: e.clientY
          });
        }
      }
    });

    console.log('📍 Selected cell:', {
      column: foundColumn,
      row: foundRow,
      method: 'DOM-based positioning'
    });

    setDragOverCell({ column: foundColumn, row: foundRow });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedSection || !dragOverCell) {
      setIsDragging(false);
      setDraggedSection(null);
      setDragOverCell(null);
      return;
    }

    const newGridColumn = dragOverCell.column;
    const newGridRow = dragOverCell.row;

    setSections(prevSections =>
      prevSections.map(section =>
        section.id === draggedSection.id
          ? { ...section, gridColumn: newGridColumn, gridRow: newGridRow }
          : section
      )
    );

    setIsDragging(false);
    setDraggedSection(null);
    setDragOverCell(null);
  };

  const handleDragEnd = (e) => {
    e.stopPropagation();
    setIsDragging(false);
    setDraggedSection(null);
    setDragOverCell(null);
  };

  const handleResizeStart = (section, e) => {
    if (!isEditLayoutMode) {
      e.preventDefault();
      return;
    }
    e.stopPropagation();
    e.preventDefault();
    setResizingSection(section);
    setIsResizing(true);
    setResizeStart({ x: e.clientX, y: e.clientY });
  };

  const handleResizeMove = (e) => {
    if (!isResizing || !resizingSection || !resizeStart) return;

    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;

    const colThreshold = 38;
    const rowThreshold = 38;

    const columnChange = Math.round(deltaX / colThreshold);
    const rowChange = Math.round(deltaY / rowThreshold);

    const newColumnSpan = Math.max(1, resizingSection.gridColumnSpan + columnChange);
    const newRowSpan = Math.max(1, resizingSection.gridRowSpan + rowChange);

    const maxColumnSpan = gridColumns - resizingSection.gridColumn + 1;
    const finalColumnSpan = Math.min(newColumnSpan, maxColumnSpan);

    if (finalColumnSpan !== resizingSection.gridColumnSpan || newRowSpan !== resizingSection.gridRowSpan) {
      setSections(prevSections =>
        prevSections.map(section =>
          section.id === resizingSection.id
            ? { ...section, gridColumnSpan: finalColumnSpan, gridRowSpan: newRowSpan }
            : section
        )
      );
      setResizeStart({ x: e.clientX, y: e.clientY });
      setResizingSection(prev => ({ ...prev, gridColumnSpan: finalColumnSpan, gridRowSpan: newRowSpan }));
    }
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    setResizingSection(null);
    setResizeStart(null);
  };

  useEffect(() => {
    if (isResizing) {
      const handleMouseMove = (e) => handleResizeMove(e);
      const handleMouseUp = () => handleResizeEnd();

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, resizingSection, resizeStart]);

  useEffect(() => {
    const checkOverflow = () => {
      const newOverflowing = new Set();

      sections.forEach(section => {
        const element = sectionRefs.current[section.id];
        if (element) {
          const contentDiv = element.querySelector('.section-content');
          if (contentDiv) {
            const isOverflowing = contentDiv.scrollHeight > contentDiv.clientHeight ||
                                 contentDiv.scrollWidth > contentDiv.clientWidth;
            if (isOverflowing) {
              newOverflowing.add(section.id);
            }
          }
        }
      });

      setOverflowingSections(newOverflowing);
    };

    checkOverflow();
    const timeoutId = setTimeout(checkOverflow, 100);

    return () => clearTimeout(timeoutId);
  }, [sections, isResizing]);

  const iconColorMap = {
    'project-info': 'text-blue-600',
    'key-dates': 'text-orange-600',
    'client-info': 'text-green-600',
    'summary': 'text-violet-600',
    'config-settings': 'text-indigo-600',
    'fees-overview': 'text-emerald-600',
    'delivery-deadlines': 'text-amber-600',
    'back-office': 'text-pink-600',
    'cashless-info': 'text-cyan-600',
    'refund-info': 'text-teal-600',
    'custom': 'text-purple-600'
  };

  // Load card layouts and field values on component mount
  useEffect(() => {
    const loadProjectData = async () => {
      if (!projectData.project_code) return;

      try {
        // Load card layouts
        const savedLayouts = await loadProjectCardLayouts(projectData.project_code);
        if (savedLayouts && savedLayouts.length > 0) {
          // Map icon names back to components
          const layoutsWithIcons = savedLayouts.map(layout => ({
            ...layout,
            icon: iconNameToComponent[layout.icon] || FolderOpen
          }));
          setSections(layoutsWithIcons);
        }

        // Load field values
        const loadedFieldValues = await loadProjectFieldValues(projectData.project_code);
        if (loadedFieldValues) {
          setFieldValues(loadedFieldValues);
          setSavedFieldValues(loadedFieldValues); // Store as saved baseline
        }
      } catch (error) {
        console.error('Failed to load project data:', error);
        // Continue with default layout if load fails
      }
    };

    loadProjectData();
  }, [projectData.project_code]);

  return (
    <div className={'p-6 min-h-screen transition-colors ' + (isEditLayoutMode ? 'bg-blue-50' : 'bg-gray-50')} style={{ cursor: isResizing ? 'nwse-resize' : isDragging ? 'grabbing' : 'default', userSelect: isResizing || isDragging ? 'none' : 'auto' }}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{projectData.event_name || projectData.eventName || 'Project'}</h1>
            <p className="text-sm text-gray-600 mt-1">Project Core Information • {projectData.project_code}</p>
          </div>
          <div className="flex items-center gap-3">
            {isEditLayoutMode && (
              <div className="p-3 bg-blue-100 border-2 border-blue-400 rounded-lg flex items-center gap-2">
                <Unlock className="h-5 w-5 text-blue-700 flex-shrink-0" />
                <p className="text-sm font-semibold text-blue-900">Edit Layout Mode - Drag cards, resize, configure fields</p>
              </div>
            )}
            {isEditInfoMode && (
              <div className="p-3 bg-purple-100 border-2 border-purple-400 rounded-lg flex items-center gap-2">
                <Unlock className="h-5 w-5 text-purple-700 flex-shrink-0" />
                <p className="text-sm font-semibold text-purple-900">Edit Info Mode - Modify field values</p>
              </div>
            )}

            {/* Edit buttons stacked vertically */}
            <div className="flex flex-col gap-2">
              {/* Edit Info Button */}
              {isEditInfoMode ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelEditInfo}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-sm bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveInfo}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-sm bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Lock className="h-4 w-4" />
                    Save Changes
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleEditInfo}
                  disabled={isEditLayoutMode}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-sm bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isEditLayoutMode ? "Exit layout mode first" : ""}
                >
                  <Unlock className="h-4 w-4" />
                  Edit Info
                </button>
              )}

              {/* Edit Layout Button */}
              <button
                onClick={isEditLayoutMode ? handleLockLayout : handleUnlockLayout}
                disabled={isEditInfoMode}
                className={'px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ' + (isEditLayoutMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white')}
                title={isEditInfoMode ? "Save or cancel info changes first" : ""}
              >
                {isEditLayoutMode ? (
                  <>
                    <Lock className="h-4 w-4" />
                    Lock Layout & Save
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4" />
                    Edit Layout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        {isEditLayoutMode && (
          <div className="flex items-center gap-3 justify-end">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-medium text-gray-600 uppercase">Columns</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setGridColumns(Math.max(3, gridColumns - 1))}
                    className="px-2 py-0.5 bg-white hover:bg-red-50 border border-gray-300 hover:border-red-300 rounded text-xs font-bold text-gray-700 hover:text-red-600 transition-colors"
                    disabled={gridColumns <= 3}
                  >
                    −
                  </button>
                  <span className="text-sm font-bold text-gray-900 min-w-[2rem] text-center">{gridColumns}</span>
                  <button
                    onClick={() => setGridColumns(Math.min(100, gridColumns + 1))}
                    className="px-2 py-0.5 bg-white hover:bg-green-50 border border-gray-300 hover:border-green-300 rounded text-xs font-bold text-gray-700 hover:text-green-600 transition-colors"
                    disabled={gridColumns >= 100}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="w-px h-10 bg-gray-300"></div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-medium text-gray-600 uppercase">Rows</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setGridRows(Math.max(3, gridRows - 1))}
                    className="px-2 py-0.5 bg-white hover:bg-red-50 border border-gray-300 hover:border-red-300 rounded text-xs font-bold text-gray-700 hover:text-red-600 transition-colors"
                    disabled={gridRows <= 3}
                  >
                    −
                  </button>
                  <span className="text-sm font-bold text-gray-900 min-w-[2rem] text-center">{gridRows}</span>
                  <button
                    onClick={() => setGridRows(Math.min(100, gridRows + 1))}
                    className="px-2 py-0.5 bg-white hover:bg-green-50 border border-gray-300 hover:border-green-300 rounded text-xs font-bold text-gray-700 hover:text-green-600 transition-colors"
                    disabled={gridRows >= 100}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowGridGuides(!showGridGuides)}
              className={'px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ' + (showGridGuides ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
            >
              <Grid3x3 className="h-4 w-4" />
              {showGridGuides ? 'Hide Grid' : 'Show Grid'}
            </button>
            <button
              onClick={() => {
                setGridColumns(35);
                setGridRows(25);
              }}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-2"
              title="Reset to 35x25 grid"
            >
              <RefreshCw className="h-4 w-4" />
              Reset Grid
            </button>
            <button
              onClick={() => setShowAddCardModal(true)}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-2"
              title="Add a new card to the grid"
            >
              <Plus className="h-4 w-4" />
              Add New Card
            </button>
          </div>
        )}
      </div>

      <div className="relative overflow-auto">
        {isEditLayoutMode && showGridGuides && (
          <>
            {/* Column number labels - positioned ABOVE the grid */}
            <div className="pointer-events-none mb-2" style={{ position: 'relative', zIndex: 0 }}>
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${gridColumns}, 30px)`, boxSizing: 'border-box', margin: 0, padding: 0 }}>
                {[...Array(gridColumns)].map((_, i) => (
                  <div key={i} className="text-center text-[8px] font-semibold text-gray-500 bg-gray-200 rounded" style={{ width: '30px', height: '16px', lineHeight: '16px', padding: 0, boxSizing: 'border-box' }}>
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Visual grid overlay - aligned with actual grid */}
            <div className="absolute pointer-events-none z-0" style={{ left: 0, top: '24px', right: 0, bottom: 0 }}>
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${gridColumns}, 30px)`, gridTemplateRows: `repeat(${gridRows}, 30px)` }}>
              {[...Array(gridColumns * gridRows)].map((_, index) => {
                const col = (index % gridColumns) + 1;
                const row = Math.floor(index / gridColumns) + 1;

                const hoveredSec = sections.find(s => s.id === hoveredSection);
                const isOccupied = hoveredSec &&
                  col >= hoveredSec.gridColumn &&
                  col < hoveredSec.gridColumn + hoveredSec.gridColumnSpan &&
                  row >= hoveredSec.gridRow &&
                  row < hoveredSec.gridRow + hoveredSec.gridRowSpan;

                const isCursorCell = isDragging && dragOverCell && col === dragOverCell.column && row === dragOverCell.row;

                return (
                  <div
                    key={index}
                    className={'border border-dashed transition-all ' + (isCursorCell ? 'border-orange-500 bg-orange-100' : isOccupied ? 'border-blue-400 bg-blue-50' : 'border-gray-400')}
                    style={{ opacity: isCursorCell ? 0.9 : isOccupied ? 0.7 : 0.6 }}
                  >
                  </div>
                );
              })}
            </div>
          </div>
          </>
        )}

        <div className="grid gap-2 relative z-10" style={{gridTemplateColumns: `repeat(${gridColumns}, 30px)`, gridTemplateRows: `repeat(${gridRows}, 30px)`, position: 'relative', boxSizing: 'border-box', margin: 0, padding: 0}} onDragOver={handleDragOver} onDrop={handleDrop} onDragEnter={(e) => e.preventDefault()}>
          {isEditLayoutMode && isDragging && dragOverCell && draggedSection && (
            <div
              className="absolute bg-blue-400 border-2 border-blue-600 rounded pointer-events-none z-20"
              style={{
                gridColumn: dragOverCell.column + ' / span 1',
                gridRow: dragOverCell.row + ' / span 1',
                opacity: 0.8
              }}
            />
          )}
          {sections.map((section) => {
            if (section.requiresPermission && !canViewFinancials) return null;
            const IconComponent = section.icon;
            const isBeingDragged = draggedSection?.id === section.id;
            const isBeingResized = resizingSection?.id === section.id;
            const hasOverflow = overflowingSections.has(section.id);

            const atRightEdge = section.gridColumn + section.gridColumnSpan > gridColumns;
            const atBottomEdge = section.gridRow + section.gridRowSpan > gridRows;

            return (
              <div
                key={section.id}
                ref={el => sectionRefs.current[section.id] = el}
                className={'bg-white/90 p-4 rounded-lg shadow-sm border-2 transition-all relative overflow-hidden ' + (isBeingDragged ? 'opacity-30 cursor-grabbing border-blue-400 shadow-lg' : hasOverflow ? 'border-orange-400 ring-2 ring-orange-300' : 'border-gray-200 hover:shadow-md') + (isBeingResized ? ' ring-4 ring-blue-400 ring-opacity-50 border-blue-400' : '')}
                style={{
                  gridColumn: section.gridColumn + ' / span ' + section.gridColumnSpan,
                  gridRow: section.gridRow + ' / span ' + section.gridRowSpan,
                  minWidth: '160px',
                  minHeight: '160px'
                }}
                onMouseEnter={() => setHoveredSection(section.id)}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1">
                    {isEditLayoutMode && (
                      <div className="drag-handle cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded transition-colors" draggable onDragStart={(e) => handleDragStart(section, e)} onDragEnd={handleDragEnd} title="Drag to reposition">
                        <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      </div>
                    )}
                    {editingCardTitle === section.id ? (
                      <input
                        type="text"
                        defaultValue={section.title}
                        autoFocus
                        onBlur={(e) => handleRenameCard(section.id, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleRenameCard(section.id, e.target.value);
                          }
                        }}
                        className="flex-1 px-2 py-1 border border-blue-400 rounded text-sm font-semibold"
                      />
                    ) : (
                      <h3
                        className="text-base flex items-center gap-2 font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                        onClick={() => isEditLayoutMode && setEditingCardTitle(section.id)}
                        title={isEditLayoutMode ? "Click to rename" : ""}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            isEditLayoutMode && setEditingCardIcon(section.id);
                          }}
                          className={isEditLayoutMode ? "hover:bg-gray-100 p-1 rounded transition-colors" : ""}
                          title={isEditLayoutMode ? "Click to change icon" : ""}
                        >
                          <IconComponent className={'h-4 w-4 ' + iconColorMap[section.type]} />
                        </button>
                        {section.title}
                      </h3>
                    )}
                    {hasOverflow && (
                      <div className="bg-orange-100 text-orange-700 rounded p-1 flex items-center gap-1" title="Content is clipped - resize card to see all">
                        <AlertTriangle className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                  {isEditLayoutMode && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingFieldsSection(section)}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Configure fields"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCard(section.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete card"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="section-content overflow-auto" style={{ maxHeight: 'calc(100% - 3rem)' }}>
                  {section.fieldLayout && Object.keys(section.fieldLayout).length > 0 ? (
                    // Grid layout mode
                    <div
                      className="grid gap-2"
                      style={{
                        gridTemplateColumns: `repeat(${section.layoutColumns || 1}, minmax(0, 1fr))`,
                        gridTemplateRows: `repeat(${section.layoutRows || 1}, auto)`
                      }}
                    >
                      {Array.from({ length: (section.layoutColumns || 1) * (section.layoutRows || 1) }).map((_, index) => {
                        const column = (index % (section.layoutColumns || 1)) + 1;
                        const row = Math.floor(index / (section.layoutColumns || 1)) + 1;
                        const cellKey = `${row}-${column}`;

                        // Check if this cell contains a field
                        const cellData = section.fieldLayout[cellKey];

                        // Check if this cell is covered by a spanning field
                        let spanningCellKey = null;
                        for (const [key, cell] of Object.entries(section.fieldLayout)) {
                          const [fieldRow, fieldCol] = key.split('-').map(Number);
                          if (fieldRow === row && column >= fieldCol && column < fieldCol + cell.columnSpan) {
                            spanningCellKey = key;
                            break;
                          }
                        }

                        // If cell is covered by a spanning field but is not the origin, skip rendering
                        if (spanningCellKey && cellKey !== spanningCellKey) {
                          return null;
                        }

                        const field = cellData ? section.fields?.find(f => f.id === cellData.fieldId) : null;
                        const columnSpan = cellData ? cellData.columnSpan : 1;

                        if (!field) {
                          // Empty cell
                          return <div key={cellKey} className="min-h-[60px]" />;
                        }

                        return (
                          <div
                            key={cellKey}
                            className="flex flex-col"
                            style={{
                              gridColumn: `span ${columnSpan}`
                            }}
                          >
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <FieldRenderer
                              field={field}
                              value={fieldValues[section.id]?.[field.id]}
                              onChange={(value) => updateFieldValue(section.id, field.id, value)}
                              isEditMode={isEditInfoMode}
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    // Stacked layout mode (default)
                    <div className="space-y-3">
                      {(section.fields || []).map(field => (
                        <div key={field.id}>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          <FieldRenderer
                            field={field}
                            value={fieldValues[section.id]?.[field.id]}
                            onChange={(value) => updateFieldValue(section.id, field.id, value)}
                            isEditMode={isEditInfoMode}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {hasOverflow && (
                  <div className="absolute bottom-2 left-2 right-2 bg-orange-50 border border-orange-300 rounded px-2 py-1 flex items-center gap-1 text-[10px] text-orange-700 pointer-events-none">
                    <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                    <span className="font-medium">Content clipped - resize to view all</span>
                  </div>
                )}
                {isEditLayoutMode && isBeingResized && (
                  <div className="absolute top-2 right-14 z-30">
                    <div className="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-medium shadow-lg flex flex-col items-center gap-1">
                      <div className="font-bold">{section.gridColumnSpan}×{section.gridRowSpan}</div>
                      <div className="text-blue-100 text-[10px]">
                        Pos: {section.gridColumn},{section.gridRow}
                      </div>
                      {(atRightEdge || atBottomEdge) && (
                        <div className="text-yellow-300 text-[10px] flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          At boundary
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {isEditLayoutMode && (
                  <div className="resize-handle absolute bottom-1 right-1 cursor-nwse-resize p-1 hover:bg-gray-100 rounded transition-colors z-30" onMouseDown={(e) => handleResizeStart(section, e)} title="Drag to resize">
                    <Maximize2 className="h-4 w-4 text-gray-300 hover:text-gray-500" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
        <p className="text-xs text-blue-800"><span className="font-semibold">View:</span> {userRole} - {canViewFinancials ? ' Financial data visible' : ' Financial data hidden'}</p>
        <div className="flex items-center gap-4">
          <p className="text-xs text-blue-800"><span className="font-semibold">Grid:</span> {gridColumns} columns × {gridRows} rows ({gridColumns * gridRows} cells)</p>
          <p className={'text-xs font-semibold flex items-center gap-1 ' + (isEditLayoutMode ? 'text-orange-700' : 'text-green-700')}>
            {isEditLayoutMode ? (
              <>
                <Unlock className="h-3 w-3" />
                Layout Unlocked
              </>
            ) : (
              <>
                <Lock className="h-3 w-3" />
                Layout Locked
              </>
            )}
          </p>
        </div>
      </div>

      {editingFieldsSection && (
        <FieldEditor
          section={editingFieldsSection}
          onSave={saveFields}
          onClose={() => setEditingFieldsSection(null)}
        />
      )}

      {showAddCardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Add New Card</h2>
              <button onClick={() => setShowAddCardModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Title
                </label>
                <input
                  type="text"
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  placeholder="Enter card title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddNewCard();
                    }
                  }}
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> The new card will be added to position (1,1) with default size.
                  You can drag and resize it after creation, and configure its fields using the settings icon.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddCardModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNewCard}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Card
              </button>
            </div>
          </div>
        </div>
      )}

      {editingCardIcon && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Choose Icon</h2>
              <button onClick={() => setEditingCardIcon(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {availableIcons.map((iconOption) => {
                const Icon = iconOption.component;
                return (
                  <button
                    key={iconOption.name}
                    onClick={() => handleChangeIcon(editingCardIcon, Icon)}
                    className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    title={iconOption.name}
                  >
                    <Icon className="h-6 w-6 text-gray-700" />
                    <span className="text-xs text-gray-600 mt-1">{iconOption.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingCardIcon(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCoreInfo;
