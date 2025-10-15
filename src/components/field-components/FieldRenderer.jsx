// src/components/field-components/FieldRenderer.jsx
import React from 'react';

export const FieldRenderer = ({ field, value, onChange }) => {
  switch (field.type) {
    case 'text':
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={field.readonly}
          className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
        />
      );
    
    case 'textarea':
      return (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={field.readonly}
          rows={2}
          className="w-full px-2 py-1 border border-gray-200 rounded text-sm resize-none"
        />
      );
    
    case 'number':
      return (
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={field.readonly}
          className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
        />
      );
    
    case 'dropdown':
      return (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={field.readonly}
          className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
        >
          <option value="">Select...</option>
          {(field.options || []).map((opt, idx) => (
            <option key={idx} value={opt}>{opt}</option>
          ))}
        </select>
      );
    
    case 'multiselect':
      const selectedValues = Array.isArray(value) ? value : [];
      return (
        <div className="space-y-1">
          {(field.options || []).map((opt, idx) => (
            <label key={idx} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedValues.includes(opt)}
                onChange={(e) => {
                  const newValue = e.target.checked
                    ? [...selectedValues, opt]
                    : selectedValues.filter(v => v !== opt);
                  onChange(newValue);
                }}
                disabled={field.readonly}
                className="rounded"
              />
              {opt}
            </label>
          ))}
        </div>
      );
    
    case 'date':
      return (
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={field.readonly}
          className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
        />
      );
    
    case 'time':
      return (
        <input
          type="time"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={field.readonly}
          className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
        />
      );
    
    case 'datetime':
      return (
        <input
          type="datetime-local"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={field.readonly}
          className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
        />
      );
    
    case 'address':
      return (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={field.readonly}
          rows={2}
          className="w-full px-2 py-1 border border-gray-200 rounded text-sm resize-none"
        />
      );
    
    case 'url':
      return (
        <input
          type="url"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={field.readonly}
          className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
        />
      );
    
    case 'file':
      return (
        <input
          type="file"
          onChange={(e) => onChange(e.target.files[0]?.name)}
          disabled={field.readonly}
          className="w-full text-sm"
        />
      );
    
    default:
      return <span className="text-sm text-gray-500">{value || '-'}</span>;
  }
};