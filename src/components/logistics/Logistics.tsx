import React, { useState } from 'react';
import { Truck, Package, MapPin, ArrowRight, X, Plus, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface LogisticsProps {
  project?: any;
}

type LogisticsMainTab = 'equipment-planning' | 'site-allocation' | 'shipping-documentation';
type EquipmentCategory = 'cashless' | 'network' | 'power' | 'other';

interface EquipmentItem {
  id: string;
  name: string;
  quantity: number;
  comments: string;
}

interface Comment {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  mentions: string[];
  replies?: Comment[];
}

type JUEStatus = 'awaiting-push' | 'awaiting-confirmation' | 'request-received';

export function Logistics({ project }: LogisticsProps) {
  const [activeMainTab, setActiveMainTab] = useState<LogisticsMainTab>('equipment-planning');
  const [activeEquipmentCategory, setActiveEquipmentCategory] = useState<EquipmentCategory>('network');
  const [isEditing, setIsEditing] = useState(false);
  const [jueStatus, setJueStatus] = useState<JUEStatus>('awaiting-push');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [hasBeenPushedToROI, setHasBeenPushedToROI] = useState(false);
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      user: {
        name: 'Maria Rodriguez',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
      },
      content: 'Updated shipping costs based on latest quotes from courier.',
      timestamp: '2 hours ago',
      mentions: [],
      replies: []
    }
  ]);
  const [newComment, setNewComment] = useState('');

  // Equipment data organized by category
  const [equipmentData, setEquipmentData] = useState<Record<EquipmentCategory, EquipmentItem[]>>({
    cashless: [
      { id: '1', name: 'Access Phones', quantity: 10, comments: 'Standard access phones for site use.' },
      { id: '2', name: 'Cashless Phones', quantity: 5, comments: 'Cashless payment terminals.' },
      { id: '3', name: 'Other / Extra Phones', quantity: 0, comments: '' },
      { id: '4', name: 'EPOS/SoftPOS Devices', quantity: 0, comments: '' },
      { id: '5', name: 'Totems', quantity: 0, comments: '' },
      { id: '6', name: 'Mini-Totems', quantity: 0, comments: '' },
    ],
    network: [
      { id: '7', name: 'Mikrotik Negro 3011 Router', quantity: 0, comments: '' },
      { id: '8', name: 'Mikrotik Negro 4011 Router', quantity: 0, comments: '' },
      { id: '9', name: 'Mikrotik Blanco CCR 1009 Router', quantity: 0, comments: '' },
      { id: '10', name: 'Cloud Key Controller', quantity: 0, comments: '' },
      { id: '11', name: 'Cloud Key Controller Gen 2', quantity: 0, comments: '' },
      { id: '12', name: 'Small Sectorial (120º)', quantity: 0, comments: '' },
      { id: '13', name: 'Large Sectorial (90º)', quantity: 0, comments: '' },
      { id: '14', name: 'Omnidirectional', quantity: 0, comments: '' },
      { id: '15', name: 'Prism 5GHz + PoE 24V-1A', quantity: 0, comments: '' },
      { id: '16', name: 'Satellite Dishes', quantity: 0, comments: '' },
      { id: '17', name: 'Nanobeam Gen2 + PoE', quantity: 0, comments: '' },
      { id: '18', name: 'Nanobeam M5', quantity: 0, comments: '' },
      { id: '19', name: 'Litebeam + PoE', quantity: 0, comments: '' },
    ],
    power: [
      { id: '20', name: '6 Gang Extension (3m)', quantity: 0, comments: '' },
      { id: '21', name: 'USB Hub (60 Port)', quantity: 0, comments: '' },
      { id: '22', name: 'IEC Cable (UK)', quantity: 0, comments: '' },
      { id: '23', name: '30m Extension Reel (UK)', quantity: 0, comments: '' },
      { id: '24', name: 'Single USB Charger (UK)', quantity: 0, comments: '' },
    ],
    other: [
      { id: '25', name: 'Scooter', quantity: 0, comments: '' },
      { id: '26', name: 'First Aid Kit', quantity: 0, comments: '' },
      { id: '27', name: 'Coffee Machine', quantity: 0, comments: '' },
      { id: '28', name: 'Racking (1600 x 500 x 500)', quantity: 0, comments: '' },
      { id: '29', name: 'Macbook Pro', quantity: 0, comments: '' },
    ],
  });

  const mainTabs = [
    { id: 'equipment-planning' as LogisticsMainTab, label: 'Equipment Planning', icon: Package },
    { id: 'site-allocation' as LogisticsMainTab, label: 'Site Allocation', icon: MapPin },
    { id: 'shipping-documentation' as LogisticsMainTab, label: 'Shipping', icon: Truck },
  ];

  const equipmentCategories = [
    { id: 'cashless' as EquipmentCategory, label: 'Cashless' },
    { id: 'network' as EquipmentCategory, label: 'Network' },
    { id: 'power' as EquipmentCategory, label: 'Power' },
    { id: 'other' as EquipmentCategory, label: 'Other' },
  ];

  const handleEditToggle = () => {
    if (isEditing) {
      setShowSaveConfirm(true);
    } else {
      setIsEditing(true);
    }
  };

  const handleSaveConfirm = (confirmed: boolean) => {
    setShowSaveConfirm(false);
    if (confirmed) {
      setIsEditing(false);
      // Here you would save the data
      console.log('Saving equipment data:', equipmentData);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    setShowDeleteConfirm(itemId);
  };

  const confirmDelete = (confirmed: boolean) => {
    if (confirmed && showDeleteConfirm) {
      setEquipmentData(prev => ({
        ...prev,
        [activeEquipmentCategory]: prev[activeEquipmentCategory].filter(item => item.id !== showDeleteConfirm)
      }));
    }
    setShowDeleteConfirm(null);
  };

  const handleAddItem = (afterId: string) => {
    const newItem: EquipmentItem = {
      id: Date.now().toString(),
      name: '',
      quantity: 0,
      comments: ''
    };

    setEquipmentData(prev => {
      const items = [...prev[activeEquipmentCategory]];
      const index = items.findIndex(item => item.id === afterId);
      items.splice(index + 1, 0, newItem);
      return {
        ...prev,
        [activeEquipmentCategory]: items
      };
    });
  };

  const handleItemChange = (itemId: string, field: keyof EquipmentItem, value: string | number) => {
    setEquipmentData(prev => ({
      ...prev,
      [activeEquipmentCategory]: prev[activeEquipmentCategory].map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));
  };

  const handlePushToJUE = () => {
    setJueStatus('awaiting-confirmation');
    // Simulate JUE response after 3 seconds
    setTimeout(() => {
      setJueStatus('request-received');
    }, 3000);
  };

  const handlePushToROI = () => {
    // Simulate pushing totals to ROI
    console.log('Pushing logistics costs to ROI...');
    setHasBeenPushedToROI(true);
    // toast.success('Logistics costs pushed to ROI successfully!');
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      user: {
        name: 'Current User',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
      },
      content: newComment,
      timestamp: 'Just now',
      mentions: [],
      replies: []
    };
    
    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  const getJUEStatusText = () => {
    switch (jueStatus) {
      case 'awaiting-push': return 'Awaiting Push to JUE';
      case 'awaiting-confirmation': return 'Awaiting Confirmation';
      case 'request-received': return 'Request Received';
    }
  };

  const getJUEStatusColor = () => {
    switch (jueStatus) {
      case 'awaiting-push': return 'text-gray-600 bg-gray-100';
      case 'awaiting-confirmation': return 'text-yellow-600 bg-yellow-100';
      case 'request-received': return 'text-green-600 bg-green-100';
    }
  };

  const renderEquipmentPlanning = () => (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Hardware Request Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Hardware Request</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Hardware Request Status:</span>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">Potential</span>
          </div>
        </div>

        {/* Equipment Category Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <nav className="-mb-px flex space-x-8">
              {equipmentCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveEquipmentCategory(category.id)}
                  className={`py-4 px-1 border-b-2 text-sm font-medium transition-colors ${
                    activeEquipmentCategory === category.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </nav>

            {/* Status and Action Buttons */}
            <div className="flex items-center gap-4 py-2">
              <div className={`flex items-center gap-2 text-sm px-3 py-1 rounded-full whitespace-nowrap ${getJUEStatusColor()}`}>
                <span>Request Status</span>
                <Clock className="h-4 w-4" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleEditToggle}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
                >
                  {isEditing ? 'Confirm Changes?' : 'Edit Data'}
                </button>
                <button
                  onClick={handlePushToJUE}
                  disabled={jueStatus !== 'awaiting-push'}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-lg"
                >
                  <ArrowRight className="w-4 h-4" />
                  Push to JUE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                Equipment
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                Quantity
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                Comments
              </th>
              {isEditing && (
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {equipmentData[activeEquipmentCategory].map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {isEditing ? (
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50"
                    />
                  ) : (
                    item.name
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {isEditing ? (
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-24 text-center border-gray-300 rounded-md shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50"
                    />
                  ) : (
                    item.quantity
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {isEditing ? (
                    <input
                      type="text"
                      value={item.comments}
                      onChange={(e) => handleItemChange(item.id, 'comments', e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50"
                    />
                  ) : (
                    item.comments
                  )}
                </td>
                {isEditing && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 justify-center">
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAddItem(item.id)}
                        className="p-1 text-green-600 hover:text-green-800 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSiteAllocation = () => (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Site Allocation</h2>
        <p className="text-gray-600">Site allocation planning tools coming soon.</p>
      </div>
    </div>
  );

  const renderShippingDocumentation = () => (
    <div className="space-y-8" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Timeline */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="relative pt-2 pb-4">
          <div className="absolute left-0 top-1 h-0.5 w-full bg-gray-300"></div>
          <div className="flex justify-between">
            <div className="relative w-1/6 text-center">
              <div className="absolute left-1/2 -translate-x-1/2 top-[-0.25rem] w-4 h-4 bg-blue-600 rounded-full border-4 border-white"></div>
              <p className="font-semibold text-sm text-gray-900 mt-4">Packing Deadline</p>
              <p className="text-xs text-gray-600">15/08/2024</p>
            </div>
            <div className="relative w-1/6 text-center">
              <div className="absolute left-1/2 -translate-x-1/2 top-[-0.25rem] w-4 h-4 bg-blue-600 rounded-full border-4 border-white"></div>
              <p className="font-semibold text-sm text-gray-900 mt-4">Shipping Date</p>
              <p className="text-xs text-gray-600">16/08/2024</p>
            </div>
            <div className="relative w-1/6 text-center">
              <div className="absolute left-1/2 -translate-x-1/2 top-[-0.25rem] w-4 h-4 bg-blue-600 rounded-full border-4 border-white"></div>
              <p className="font-semibold text-sm text-gray-900 mt-4">Expected Delivery</p>
              <p className="text-xs text-gray-600">20/08/2024</p>
            </div>
            <div className="relative w-1/6 text-center">
              <div className="absolute left-1/2 -translate-x-1/2 top-[-0.25rem] w-4 h-4 bg-blue-600 rounded-full border-4 border-white"></div>
              <p className="font-semibold text-sm text-gray-900 mt-4">On-Site Date</p>
              <p className="text-xs text-gray-600">21/08/2024</p>
            </div>
            <div className="relative w-1/6 text-center">
              <div className="absolute left-1/2 -translate-x-1/2 top-[-0.25rem] w-4 h-4 bg-blue-600 rounded-full border-4 border-white"></div>
              <p className="font-semibold text-sm text-gray-900 mt-4">Event Dates</p>
              <p className="text-xs text-gray-600">22 - 24/08/2024</p>
            </div>
            <div className="relative w-1/6 text-center">
              <div className="absolute left-1/2 -translate-x-1/2 top-[-0.25rem] w-4 h-4 bg-blue-600 rounded-full border-4 border-white"></div>
              <p className="font-semibold text-sm text-gray-900 mt-4">Return Shipping Date</p>
              <p className="text-xs text-gray-600">25/08/2024</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Shipping Details & Cost Tracking */}
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="origin-location">
                  Origin Location
                </label>
                <select className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" id="origin-location">
                  <option>Select Origin Location</option>
                  <option>Warehouse A</option>
                  <option>Warehouse B</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="destination-address">
                  Destination Address
                </label>
                <input 
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  id="destination-address" 
                  type="text" 
                  defaultValue="123 Main St, Anytown, USA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="onsite-contact-name">
                  On-site Contact Name
                </label>
                <input 
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  id="onsite-contact-name" 
                  type="text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="onsite-contact-phone">
                  On-site Contact Phone
                </label>
                <input 
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  id="onsite-contact-phone" 
                  type="tel"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="onsite-contact-email">
                  On-site Contact Email
                </label>
                <input 
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  id="onsite-contact-email" 
                  type="email"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Courier Details
                </label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <input 
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Company" 
                    type="text"
                  />
                  <input 
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Tracking Number" 
                    type="text"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="special-instructions">
                  Special Instructions
                </label>
                <textarea 
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24" 
                  id="special-instructions"
                />
              </div>
            </div>
          </div>

          {/* Cost Tracking */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Cost Tracking</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="est-shipping-cost">
                    Estimated Shipping
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 pl-7 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      id="est-shipping-cost" 
                      type="text" 
                      defaultValue="1,250.00"
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="actual-shipping-cost">
                    Actual Shipping
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 pl-7 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      id="actual-shipping-cost" 
                      type="text" 
                      defaultValue="1,200.00"
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="customs-duties">
                    Customs/Duties
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 pl-7 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      id="customs-duties" 
                      type="text" 
                      defaultValue="170.00"
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="insurance">
                    Insurance
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 pl-7 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      id="insurance" 
                      type="text" 
                      defaultValue="45.00"
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="local-transport">
                    Local Transport
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 pl-7 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      id="local-transport" 
                      type="text" 
                      defaultValue="85.00"
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="carnet-cost">
                    Carnet
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 pl-7 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      id="carnet-cost" 
                      type="text" 
                      defaultValue="150.00"
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                  </div>
                </div>
                <div className="col-span-2 lg:col-span-4">
                  <button className="w-full bg-gray-200 text-gray-700 rounded-full px-4 py-2 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm mt-4 flex items-center justify-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Cost
                  </button>
                </div>
              </div>
              <hr className="my-4" />
              <div className="flex justify-between items-center">
                <p className="font-semibold">Total Logistics Cost:</p>
                <p className="font-bold text-lg">€1,650.00</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="font-semibold">Variance from Budget:</p>
                <p className="font-bold text-lg text-green-600">-€40.00</p>
              </div>
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={handlePushToROI}
                  className="bg-blue-600 text-white rounded-full px-4 py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm flex items-center gap-2"
                >
                  {hasBeenPushedToROI ? 'Update Totals in ROI' : 'Push Totals to ROI'}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="m5 12 5 5L20 7"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Critical Escalation, Carnet, Document Checklist */}
        <div className="space-y-8">
          {/* Critical Escalation */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Critical Escalation</h2>
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Emergency Contact</h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Select a colleague to be the designated contact for any critical issues that may arise during shipping or on-site.
                </p>
                <select className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>Select Colleague</option>
                  <option>Sarah Jenkins</option>
                  <option>Michael Chen</option>
                  <option>Emily Rodriguez</option>
                </select>
              </div>
            </div>
          </div>

          {/* Carnet Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Carnet Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="carnet-number">
                  Carnet Number
                </label>
                <input 
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  id="carnet-number" 
                  type="text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="carnet-expiry">
                  Expiry Date
                </label>
                <input 
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  id="carnet-expiry" 
                  type="date"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Carnet Document</p>
                  <p className="text-xs text-gray-400 mt-1">15/07/2024, 3:00 PM</p>
                </div>
                <button className="bg-gray-200 text-gray-700 rounded-full px-4 py-2 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-xs px-3 py-1">
                  Upload
                </button>
              </div>
            </div>
          </div>

          {/* Document Checklist */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Document Checklist</h2>
            <ul className="space-y-4">
              <li className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Commercial Invoice</p>
                  <p className="text-xs text-gray-600">Required</p>
                  <p className="text-xs text-gray-400 mt-1">Today, 2:45 PM</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button className="bg-gray-200 text-gray-700 rounded-full px-3 py-1 hover:bg-gray-300 text-xs">
                    Generate
                  </button>
                  <button className="bg-gray-200 text-gray-700 rounded-full px-3 py-1 hover:bg-gray-300 text-xs">
                    Upload
                  </button>
                </div>
              </li>
              <li className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Packing List</p>
                  <p className="text-xs text-gray-600">Required</p>
                  <p className="text-xs text-gray-400 mt-1">Today, 11:10 AM</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button className="bg-gray-200 text-gray-700 rounded-full px-3 py-1 hover:bg-gray-300 text-xs">
                    Generate
                  </button>
                  <button className="bg-green-100 text-green-700 rounded-full px-3 py-1 hover:bg-green-200 text-xs">
                    Replace
                  </button>
                </div>
              </li>
              <li className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Insurance Certificate</p>
                  <p className="text-xs text-gray-600">Required</p>
                  <p className="text-xs text-gray-400 mt-1">Yesterday, 4:20 PM</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button className="bg-gray-200 text-gray-700 rounded-full px-3 py-1 hover:bg-gray-300 text-xs">
                    Generate
                  </button>
                  <button className="bg-gray-200 text-gray-700 rounded-full px-3 py-1 hover:bg-gray-300 text-xs">
                    Upload
                  </button>
                </div>
              </li>
              <li className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Equipment Certificates</p>
                  <p className="text-xs text-gray-600">Required</p>
                  <p className="text-xs text-gray-400 mt-1">Yesterday, 9:30 AM</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button className="bg-gray-200 text-gray-700 rounded-full px-3 py-1 hover:bg-gray-300 text-xs">
                    Generate
                  </button>
                  <button className="bg-green-100 text-green-700 rounded-full px-3 py-1 hover:bg-green-200 text-xs">
                    Replace
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Comments & Collaboration</h2>
        
        {/* Add Comment */}
        <div className="mb-6">
          <div className="flex gap-3">
            <div
              className="w-8 h-8 bg-center bg-no-repeat bg-cover rounded-full flex-shrink-0"
              style={{ backgroundImage: `url("https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop")` }}
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment... Use @ to mention colleagues"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-gray-500">
                  Use @ to mention colleagues
                </div>
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm"
                >
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
              <div
                className="w-8 h-8 bg-center bg-no-repeat bg-cover rounded-full flex-shrink-0"
                style={{ backgroundImage: `url("${comment.user.avatar}")` }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-gray-900">{comment.user.name}</span>
                  <span className="text-xs text-gray-500">{comment.timestamp}</span>
                </div>
                <p className="text-sm text-gray-700">{comment.content}</p>
                
                {/* Reply functionality */}
                <div className="mt-2 flex items-center gap-4">
                  <button className="text-xs text-blue-600 hover:text-blue-800">Reply</button>
                  <button className="text-xs text-gray-500 hover:text-gray-700">Like</button>
                </div>
                
                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-3 ml-4 space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-2">
                        <div
                          className="w-6 h-6 bg-center bg-no-repeat bg-cover rounded-full flex-shrink-0"
                          style={{ backgroundImage: `url("${reply.user.avatar}")` }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-xs text-gray-900">{reply.user.name}</span>
                            <span className="text-xs text-gray-500">{reply.timestamp}</span>
                          </div>
                          <p className="text-xs text-gray-700">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {comments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No comments yet. Start the conversation!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeMainTab) {
      case 'equipment-planning':
        return renderEquipmentPlanning();
      case 'site-allocation':
        return renderSiteAllocation();
      case 'shipping-documentation':
        return renderShippingDocumentation();
      default:
        return renderEquipmentPlanning();
    }
  };

  return (
    <div className="flex h-full bg-gray-50" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Logistics & Hardware</h1>
          <p className="text-gray-600 mb-6">Define what's needed for the site.</p>

          {/* Main Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {mainTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveMainTab(tab.id)}
                    className={`py-4 px-1 border-b-2 text-sm font-medium transition-colors ${
                      activeMainTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-8">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this equipment item?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => confirmDelete(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                No
              </button>
              <button
                onClick={() => confirmDelete(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showSaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Changes</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to save these changes?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => handleSaveConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                No
              </button>
              <button
                onClick={() => handleSaveConfirm(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Yes, Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}