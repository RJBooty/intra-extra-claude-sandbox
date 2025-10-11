// src/components/inventory/InventoryPage.tsx
// Main Inventory Management Page - Master equipment repository

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Package,
  Grid,
  List,
  ChevronDown,
  Eye,
  Copy,
  MoreVertical,
  AlertCircle
} from 'lucide-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useInventoryService } from '../../services/inventoryService';
import { AddEquipmentModal } from './AddEquipmentModal';
import { EditEquipmentModal } from './EditEquipmentModal';
import toast from 'react-hot-toast';

// Equipment item type - MINIMAL (only confirmed database fields)
interface EquipmentItem {
  id: string;
  sku: string;
  name: string;
  category_id: string;
  category_name: string;
  created_at: string;
  updated_at: string;
}

interface InventoryPageProps {
  onNavigate?: (section: string) => void;
}

export function InventoryPage({ onNavigate }: InventoryPageProps) {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([
    { id: 'all', name: 'All Equipment' }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);

  // Get inventory service
  const { getAllEquipment, deleteEquipment, getCategories } = useInventoryService();

  // Load equipment and categories from database
  useEffect(() => {
    loadEquipment();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await getCategories();
      const allCategories = [
        { id: 'all', name: 'All Equipment' },
        ...categoriesData.map((cat: any) => ({ id: cat.id, name: cat.name }))
      ];
      setCategories(allCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
      // Keep default categories if loading fails
    }
  };

  const loadEquipment = async () => {
    setIsLoading(true);
    try {
      const data = await getAllEquipment();
      setEquipment(data);
    } catch (error) {
      console.error('Failed to load equipment:', error);
      toast.error('Failed to load equipment');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter equipment
  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddEquipment = () => {
    setShowAddModal(true);
  };

  const handleAddSuccess = () => {
    loadEquipment(); // Reload the equipment list
  };

  const handleEditEquipment = (id: string) => {
    setSelectedEquipmentId(id);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    loadEquipment(); // Reload the equipment list
  };

  const handleDeleteEquipment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this equipment item?')) return;

    try {
      await deleteEquipment(id);
      loadEquipment();
    } catch (error) {
      // Error already handled by useInventoryService
      console.error('Delete error:', error);
    }
  };

  const handleDuplicateEquipment = (id: string) => {
    // TODO: Implement duplicate functionality
    toast.info('Duplicate functionality coming soon');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Equipment Inventory</h1>
              <p className="text-gray-500 mt-1">Master repository for all equipment and assets</p>
            </div>
            <button
              onClick={handleAddEquipment}
              className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="mr-2 w-5 h-5" />
              Add Equipment
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto px-6 py-6 w-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredEquipment.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Equipment Found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first equipment item'}
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <button
                onClick={handleAddEquipment}
                className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 inline-flex items-center"
              >
                <Plus className="mr-2 w-5 h-5" />
                Add Equipment
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Total Items</p>
                <p className="text-2xl font-bold text-gray-800">{filteredEquipment.length}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Categories</p>
                <p className="text-2xl font-bold text-gray-800">{categories.length - 1}</p>
              </div>
            </div>

            {/* Equipment Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEquipment.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Equipment Image */}
                    <div className="h-48 bg-gray-100 flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-300" />
                    </div>

                    {/* Equipment Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-1">{item.sku}</p>
                          <h3 className="font-semibold text-gray-800 text-lg mb-1">{item.name}</h3>
                          <p className="text-sm text-gray-600">{item.category_name}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>Created</span>
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => handleEditEquipment(item.id)}
                          className="flex-1 py-2 px-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center text-sm"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDuplicateEquipment(item.id)}
                          className="py-2 px-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEquipment(item.id)}
                          className="py-2 px-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredEquipment.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.sku}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-800">{item.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditEquipment(item.id)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDuplicateEquipment(item.id)}
                              className="text-gray-600 hover:text-gray-800"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEquipment(item.id)}
                              className="text-red-600 hover:text-red-800"
                            >
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
          </>
        )}
      </div>

      {/* Add Equipment Modal */}
      <AddEquipmentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Edit Equipment Modal */}
      <EditEquipmentModal
        isOpen={showEditModal}
        equipmentId={selectedEquipmentId}
        onClose={() => {
          setShowEditModal(false);
          setSelectedEquipmentId(null);
        }}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
