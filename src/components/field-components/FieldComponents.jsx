import React, { useState, useRef } from 'react';
import { Link2, Calendar, Clock, Upload, Plus, Trash2, ChevronDown, ExternalLink, MapPin } from 'lucide-react';

// Short Text - Single-line with character limit
export const ShortTextField = ({ value = '', onChange, disabled, maxLength = 255 }) => {
  const currentLength = value?.length || 0;

  return (
    <div className="space-y-1">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        disabled={disabled}
        maxLength={maxLength}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
        placeholder="Enter text..."
      />
      <div className="flex justify-end">
        <span className={`text-xs ${currentLength > maxLength * 0.9 ? 'text-orange-600 font-semibold' : 'text-gray-500'}`}>
          {currentLength}/{maxLength} characters
        </span>
      </div>
    </div>
  );
};

// Long Text - Multi-line textarea with counter
export const LongTextField = ({ value = '', onChange, disabled, maxLength = 2000 }) => {
  const currentLength = value?.length || 0;
  const wordCount = value ? value.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="space-y-1">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        disabled={disabled}
        rows={6}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 resize-y"
        placeholder="Enter detailed text..."
      />
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">{wordCount} words</span>
        <span className={`text-xs ${currentLength > maxLength * 0.9 ? 'text-orange-600 font-semibold' : 'text-gray-500'}`}>
          {currentLength}/{maxLength} characters
        </span>
      </div>
    </div>
  );
};

// Number - Input with spinner controls
export const NumberField = ({ value = '', onChange, disabled, min, max, step = 1 }) => {
  const handleIncrement = () => {
    const numValue = parseFloat(value) || 0;
    const newValue = numValue + step;
    if (max === undefined || newValue <= max) {
      onChange(newValue.toString());
    }
  };

  const handleDecrement = () => {
    const numValue = parseFloat(value) || 0;
    const newValue = numValue - step;
    if (min === undefined || newValue >= min) {
      onChange(newValue.toString());
    }
  };

  return (
    <div className="relative">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
        placeholder="0"
      />
      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col">
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || (max !== undefined && parseFloat(value) >= max)}
          className="px-1.5 py-0.5 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent rounded"
        >
          ▲
        </button>
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || (min !== undefined && parseFloat(value) <= min)}
          className="px-1.5 py-0.5 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent rounded"
        >
          ▼
        </button>
      </div>
    </div>
  );
};

// Dropdown - Select with search for long lists
export const DropdownField = ({ value = '', onChange, disabled, options = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const showSearch = options.length >= 10;

  const filteredOptions = showSearch
    ? options.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-left bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 flex items-center justify-between"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value || 'Select...'}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
            {showSearch && (
              <div className="p-2 border-b border-gray-200">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            <div className="overflow-y-auto max-h-48">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">No options found</div>
              ) : (
                filteredOptions.map((option, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onChange(option);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 ${
                      value === option ? 'bg-blue-100 font-medium text-blue-900' : 'text-gray-900'
                    }`}
                  >
                    {option}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Multiple Choice - Checkboxes
export const MultipleChoiceField = ({ value = [], onChange, disabled, options = [] }) => {
  const selectedValues = Array.isArray(value) ? value : [];

  const handleToggle = (option) => {
    const newValue = selectedValues.includes(option)
      ? selectedValues.filter(v => v !== option)
      : [...selectedValues, option];
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      {options.map((option, idx) => (
        <label
          key={idx}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
        >
          <input
            type="checkbox"
            checked={selectedValues.includes(option)}
            onChange={() => handleToggle(option)}
            disabled={disabled}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <span className="text-sm text-gray-900 group-hover:text-gray-700">{option}</span>
        </label>
      ))}
    </div>
  );
};

// Date Only - Calendar input
export const DateField = ({ value = '', onChange, disabled }) => {
  return (
    <div className="relative">
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
      />
      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
    </div>
  );
};

// Time Only - Time picker
export const TimeField = ({ value = '', onChange, disabled }) => {
  return (
    <div className="relative">
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
      />
      <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
    </div>
  );
};

// Date & Time - Combined input
export const DateTimeField = ({ value = '', onChange, disabled }) => {
  return (
    <div className="relative">
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
        <Calendar className="h-4 w-4 text-gray-400" />
        <Clock className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  );
};

// Address - Multi-field input
export const AddressField = ({ value = {}, onChange, disabled }) => {
  const addressValue = typeof value === 'string' ? { full: value } : value;

  const updateField = (field, val) => {
    const newValue = { ...addressValue, [field]: val };
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          value={addressValue.street || ''}
          onChange={(e) => updateField('street', e.target.value)}
          disabled={disabled}
          placeholder="Street Address"
          className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
        />
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={addressValue.city || ''}
          onChange={(e) => updateField('city', e.target.value)}
          disabled={disabled}
          placeholder="City"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
        />
        <input
          type="text"
          value={addressValue.state || ''}
          onChange={(e) => updateField('state', e.target.value)}
          disabled={disabled}
          placeholder="State/Province"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={addressValue.postal || ''}
          onChange={(e) => updateField('postal', e.target.value)}
          disabled={disabled}
          placeholder="Postal Code"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
        />
        <input
          type="text"
          value={addressValue.country || ''}
          onChange={(e) => updateField('country', e.target.value)}
          disabled={disabled}
          placeholder="Country"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
        />
      </div>
    </div>
  );
};

// URL - Link input with validation
export const URLField = ({ value = '', onChange, disabled }) => {
  const [isValid, setIsValid] = useState(true);

  const validateURL = (url) => {
    if (!url) return true;
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleChange = (val) => {
    onChange(val);
    setIsValid(validateURL(val));
  };

  const handleVisit = () => {
    const url = value.startsWith('http') ? value : `https://${value}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-1">
      <div className="relative flex gap-1">
        <div className="relative flex-1">
          <input
            type="url"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            placeholder="https://example.com"
            className={`w-full px-3 py-2 pl-9 pr-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 ${
              isValid ? 'border-gray-300 focus:border-blue-500' : 'border-red-300 focus:border-red-500'
            }`}
          />
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        {value && isValid && (
          <button
            type="button"
            onClick={handleVisit}
            disabled={disabled}
            className="px-3 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 flex items-center gap-1"
            title="Visit URL"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        )}
      </div>
      {!isValid && value && (
        <span className="text-xs text-red-600">Invalid URL format</span>
      )}
    </div>
  );
};

// File Upload - Drag and drop zone
export const FileUploadField = ({ value = '', onChange, disabled, accept = '*' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      onChange(file.name);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      onChange(file.name);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
        isDragging
          ? 'border-blue-400 bg-blue-50'
          : value
          ? 'border-green-300 bg-green-50'
          : 'border-gray-300 bg-gray-50 hover:border-gray-400'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={() => !disabled && fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        disabled={disabled}
        accept={accept}
        className="hidden"
      />
      <Upload className={`h-8 w-8 mx-auto mb-2 ${value ? 'text-green-600' : 'text-gray-400'}`} />
      {value ? (
        <div>
          <p className="text-sm font-medium text-green-900">{value}</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            disabled={disabled}
            className="text-xs text-red-600 hover:text-red-700 mt-1"
          >
            Remove
          </button>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-600 font-medium">Drop file here or click to browse</p>
          <p className="text-xs text-gray-500 mt-1">PDF, DOC, images (max 10MB)</p>
        </div>
      )}
    </div>
  );
};

// Table - Spreadsheet-like grid
export const TableField = ({ value = [], onChange, disabled }) => {
  const tableData = Array.isArray(value) ? value : [{ col1: '', col2: '', col3: '' }];

  const addRow = () => {
    const newRow = Object.keys(tableData[0] || { col1: '', col2: '', col3: '' }).reduce(
      (acc, key) => ({ ...acc, [key]: '' }),
      {}
    );
    onChange([...tableData, newRow]);
  };

  const removeRow = (rowIndex) => {
    onChange(tableData.filter((_, idx) => idx !== rowIndex));
  };

  const updateCell = (rowIndex, colKey, val) => {
    const newData = [...tableData];
    newData[rowIndex][colKey] = val;
    onChange(newData);
  };

  const addColumn = () => {
    const newColKey = `col${Object.keys(tableData[0] || {}).length + 1}`;
    onChange(tableData.map(row => ({ ...row, [newColKey]: '' })));
  };

  if (tableData.length === 0) {
    return (
      <button
        type="button"
        onClick={addRow}
        disabled={disabled}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
      >
        <Plus className="h-4 w-4 inline mr-1" />
        Add First Row
      </button>
    );
  }

  const columns = Object.keys(tableData[0]);

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto border border-gray-300 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col}
                  className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  Column {idx + 1}
                </th>
              ))}
              <th className="px-2 py-2 w-10"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tableData.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={col} className="px-2 py-1">
                    <input
                      type="text"
                      value={row[col] || ''}
                      onChange={(e) => updateCell(rowIdx, col, e.target.value)}
                      disabled={disabled}
                      className="w-full px-2 py-1 border-0 text-sm focus:ring-1 focus:ring-blue-500 rounded"
                    />
                  </td>
                ))}
                <td className="px-2 py-1">
                  <button
                    type="button"
                    onClick={() => removeRow(rowIdx)}
                    disabled={disabled}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={addRow}
          disabled={disabled}
          className="px-3 py-1 text-sm bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 transition-colors disabled:opacity-50 flex items-center gap-1"
        >
          <Plus className="h-3 w-3" />
          Add Row
        </button>
        <button
          type="button"
          onClick={addColumn}
          disabled={disabled}
          className="px-3 py-1 text-sm bg-green-50 text-green-600 border border-green-200 rounded hover:bg-green-100 transition-colors disabled:opacity-50 flex items-center gap-1"
        >
          <Plus className="h-3 w-3" />
          Add Column
        </button>
      </div>
    </div>
  );
};
