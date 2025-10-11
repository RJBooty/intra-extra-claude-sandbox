// src/components/logistics/AddFromInventoryModal.tsx
// Modal for selecting equipment from master inventory to add to logistics plan

import React, { useState, useEffect } from 'react';
import { X, Plus, Search, Package } from 'lucide-react';
import { useInventoryService } from '../../services/inventoryService';
import toast from 'react-hot-toast';

interface AddFromInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEquipment: (equipment: { name: string; quantity: number; comments: string; equipment_item_id: string }) => void;
  category: 'cashless' | 'network' | 'power' | 'other';
}

interface EquipmentItem {
  id: string;
  sku: string;
  name: string;
  category_id: string;
  category_name: string;
}

export function AddFromInventoryModal({ isOpen, onClose, onAddEquipment, category }: AddFromInventoryModalProps) {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<EquipmentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [comments, setComments] = useState('');

  const { getAllEquipment } = useInventoryService();

  // Load equipment from inventory
  useEffect(() => {
    if (isOpen) {
      loadEquipment();
    }
  }, [isOpen]);

  // Filter equipment based on search
  useEffect(() => {
    if (!searchQuery) {
      setFilteredEquipment(equipment);
    } else {
      const filtered = equipment.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEquipment(filtered);
    }
  }, [searchQuery, equipment]);

  const loadEquipment = async () => {
    setIsLoading(true);
    try {
      const data = await getAllEquipment();
      setEquipment(data);
      setFilteredEquipment(data);
    } catch (error) {
      console.error('Failed to load equipment:', error);
      toast.error('Failed to load equipment from inventory');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    const selectedEquipment = equipment.find(e => e.id === selectedEquipmentId);

    if (!selectedEquipment) {
      toast.error('Please select an equipment item');
      return;
    }

    if (quantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }

    onAddEquipment({
      name: selectedEquipment.name,
      quantity,
      comments: comments.trim(),
      equipment_item_id: selectedEquipment.id
    });

    // Reset form
    setSelectedEquipmentId(null);
    setQuantity(1);
    setComments('');
    setSearchQuery('');

    toast.success(`Added ${selectedEquipment.name} to logistics plan`);
    onClose();
  };

  const handleCancel = () => {
    setSelectedEquipmentId(null);
    setQuantity(1);
    setComments('');
    setSearchQuery('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Add from Inventory</h2>
            <p className="text-sm text-gray-500 mt-1">Select equipment from master inventory</p>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search equipment by name, SKU, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Equipment List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredEquipment.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchQuery ? 'No equipment found matching your search' : 'No equipment available in inventory'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Equipment <span className="text-red-500">*</span>
              </label>
              <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
                {filteredEquipment.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedEquipmentId(item.id)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors ${
                      selectedEquipmentId === item.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">SKU: {item.sku} • {item.category_name}</p>
                      </div>
                      {selectedEquipmentId === item.id && (
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Comments */}
          {selectedEquipmentId && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comments / Notes
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  placeholder="Add any specific requirements or notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 bg-gray-50">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!selectedEquipmentId}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add to Plan
          </button>
        </div>
      </div>
    </div>
  );
}
