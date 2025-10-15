// src/components/field-components/FieldEditor.jsx
import React, { useState } from 'react';
import { Trash2, X, Plus, ChevronDown, MapPin, Upload, Table, Hash, Type, CheckSquare, Clock, Calendar, Link2 } from 'lucide-react';

export const FieldEditor = ({ section, onSave, onClose }) => {
  const [fields, setFields] = useState(section.fields || []);
  const [showAddField, setShowAddField] = useState(false);

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Edit Fields: {section.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
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

        <div className="p-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(fields)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Fields
          </button>
        </div>
      </div>
    </div>
  );
};