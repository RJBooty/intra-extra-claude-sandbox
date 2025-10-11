// src/components/inventory/EditEquipmentModal.tsx
// Modal for editing existing equipment items - MINIMAL VERSION

import React, { useState, useEffect } from 'react';
import { X, Save, Loader } from 'lucide-react';
import { useInventoryService } from '../../services/inventoryService';
import toast from 'react-hot-toast';

interface EditEquipmentModalProps {
  isOpen: boolean;
  equipmentId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  sku: string;
  name: string;
  category_id: string;
}

export function EditEquipmentModal({ isOpen, equipmentId, onClose, onSuccess }: EditEquipmentModalProps) {
  const [formData, setFormData] = useState<FormData>({
    sku: '',
    name: '',
    category_id: ''
  });

  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { getEquipmentById, updateEquipment, getCategories } = useInventoryService();

  // Load equipment data and categories when modal opens
  useEffect(() => {
    if (isOpen && equipmentId) {
      loadEquipment();
      loadCategories();
    }
  }, [isOpen, equipmentId]);

  const loadCategories = async () => {
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const loadEquipment = async () => {
    if (!equipmentId) return;

    setIsLoading(true);
    try {
      const equipment = await getEquipmentById(equipmentId);

      // Populate form with equipment data (MINIMAL - only confirmed fields)
      setFormData({
        sku: equipment.sku || '',
        name: equipment.name || '',
        category_id: equipment.category_id || ''
      });
    } catch (error) {
      console.error('Failed to load equipment:', error);
      toast.error('Failed to load equipment details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipmentId) return;

    setIsSaving(true);

    try {
      // Validate required fields
      if (!formData.sku.trim()) {
        toast.error('SKU is required');
        return;
      }
      if (!formData.name.trim()) {
        toast.error('Name is required');
        return;
      }
      if (!formData.category_id) {
        toast.error('Category is required');
        return;
      }

      // Prepare data for submission - MINIMAL FIELDS ONLY
      const submitData = {
        sku: formData.sku.trim(),
        name: formData.name.trim(),
        category_id: formData.category_id
      };

      await updateEquipment(equipmentId, submitData);

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating equipment:', error);
      // Error already handled by useInventoryService
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen || !equipmentId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Edit Equipment</h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., RFID-READER-001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., RFID UHF Reader"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => handleInputChange('category_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This is a minimal version. Only SKU, Name, and Category are supported by your current database schema.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 bg-gray-50">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
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
          </form>
        )}
      </div>
    </div>
  );
}
