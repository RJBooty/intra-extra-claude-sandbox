import React, { useState } from 'react';
import { 
  Truck, 
  Package, 
  MapPin, 
  ArrowRight, 
  X, 
  Plus, 
  Clock, 
  Mail, 
  MessageSquare, 
  Phone, 
  AlertTriangle, 
  CheckCircle,
  Search,
  Download,
  Upload,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Trash2,
  Edit3,
  Bell,
  History,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';
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

interface HardwareItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
}

interface LocationData {
  name: string;
  hardware: HardwareItem[];
  expanded: boolean;
}

interface AllocationCategory {
  id: string;
  name: string;
  description: string;
  locations: LocationData[];
}

export function Logistics({ project }: LogisticsProps) {
  const [activeMainTab, setActiveMainTab] = useState<LogisticsMainTab>('equipment-planning');
  const [activeEquipmentCategory, setActiveEquipmentCategory] = useState<EquipmentCategory>('network');
  const [isEditing, setIsEditing] = useState(false);
  const [jueStatus, setJueStatus] = useState<JUEStatus>('awaiting-push');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [hasBeenPushedToROI, setHasBeenPushedToROI] = useState(false);
  const [showCriticalIssueModal, setShowCriticalIssueModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [siteSearchQuery, setSiteSearchQuery] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [currentNoteItem, setCurrentNoteItem] = useState<{ categoryId: string; locationIndex: number; itemId: string } | null>(null);
  const [noteText, setNoteText] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<Record<string, Set<string>>>({});
  
  // Site Allocation Data
  const [allocationCategories, setAllocationCategories] = useState<AllocationCategory[]>([
    {
      id: 'access-control',
      name: 'Access Control',
      description: 'Allocate hardware for access points.',
      locations: [
        { name: 'Main Entrance', hardware: [{ id: '1', name: 'Turnstile', quantity: 4 }], expanded: false },
        { name: 'VIP Entrance', hardware: [{ id: '2', name: 'Handheld Scanner', quantity: 2 }], expanded: false },
      ]
    },
    {
      id: 'accreditation',
      name: 'Accreditation',
      description: 'Allocate hardware for accreditation desks.',
      locations: [
        { 
          name: 'Artist Accreditation', 
          hardware: [
            { id: '3', name: 'Laptop', quantity: 2 },
            { id: '4', name: 'Printer', quantity: 1 }
          ], 
          expanded: false 
        },
      ]
    },
    {
      id: 'pos',
      name: 'Point of Sale (POS)',
      description: 'Allocate hardware to each bar and merch location.',
      locations: [
        { name: 'Backstage Bar', hardware: [{ id: '5', name: 'POS Terminal', quantity: 2 }], expanded: false },
        { 
          name: 'Cocktail Bar', 
          hardware: [
            { id: '6', name: 'POS Terminal', quantity: 4, notes: 'Requires extra long power cable.' },
            { id: '7', name: 'Receipt Printer', quantity: 2 }
          ], 
          expanded: false 
        },
        { 
          name: 'Main Bar', 
          hardware: [
            { id: '8', name: 'POS Terminal', quantity: 8 },
            { id: '9', name: 'Receipt Printer', quantity: 4 },
            { id: '10', name: 'Cash Drawer', quantity: 4 }
          ], 
          expanded: false 
        },
        { name: 'VIP Bar', hardware: [{ id: '11', name: 'POS Terminal', quantity: 3 }], expanded: false },
      ]
    },
    {
      id: 'topup',
      name: 'TopUp',
      description: 'Allocate hardware to each TopUp location.',
      locations: [
        { name: 'Entrance A', hardware: [{ id: '12', name: 'TopUp Kiosk', quantity: 2 }], expanded: false },
        { name: 'Entrance B', hardware: [{ id: '13', name: 'TopUp Kiosk', quantity: 2 }], expanded: false },
        { name: 'Info Point', hardware: [{ id: '14', name: 'Tablet', quantity: 3 }], expanded: false },
        { name: 'Merch Stand', hardware: [{ id: '15', name: 'Tablet', quantity: 4 }], expanded: false },
      ]
    },
    {
      id: 'production',
      name: 'Production/Operations',
      description: 'Allocate hardware for production and operations staff.',
      locations: [
        { name: 'Production Office', hardware: [{ id: '16', name: 'Router', quantity: 5 }], expanded: false },
      ]
    },
    {
      id: 'other',
      name: 'Other',
      description: 'Allocate miscellaneous hardware.',
      locations: [
        { name: 'Lost & Found', hardware: [{ id: '17', name: 'Barcode Scanner', quantity: 1 }], expanded: false },
      ]
    },
  ]);
  
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      user: {
        name: 'Jane Smith',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyvuy9WcF6ZMGAEpESalX6QKVY-58vbF-ZXBWdYZm_GZtZfA2pu1RkwI8nZ2EVuupHC_Ahnaqt5m6eKTl3EYjH-EMcovityb7vodFLB8WKANoWvW8OTV9xpZ928RjZK1PIJs744Yf0_aWosiez1O7Mfl1KyETytNOEHuH2ZWTDvFU6GRI0g7k__jxPLxXgijbBE3mYdgzjDKjNmIcVqdPpYQVZNkjPjCkweSXJnmkv-yyTe_ZKChEG84luVIm7d5k4RM_eZqmpSB00'
      },
      content: 'Hey @JohnDoe, can you please confirm the quantity for the Access Phones? The initial request seems a bit high.',
      timestamp: '2 days ago',
      mentions: ['@JohnDoe'],
      replies: [
        {
          id: '2',
          user: {
            name: 'John Doe',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPg3U-KjsevAY3T01XyPJGsMhdrJOqTLINWm6jFK78fNR2ZimW_DKgzj2QdkMK8VdbKg83NZ5jaAwkLN-ZvpGyg-DRNfwX90_ulByG4ZJ_VQILEIVNpt9NodiGn7RzDGNLIrCjWoT7JH97z4ZMDdv5YsZHVAjlaTh68SvgrIvGUZ7qA_lq6rgxQoc29Z3GyLAWN668_mo8r2lIvqjR6ewWL2J9d-Ta39RuR4SKh05z40A4dXqzUyqO5TFaWy4WT5TkxY4c9Nko-U-G'
          },
          content: 'Hi @JaneSmith, good catch. I\'ve updated the quantity to 10. That should be sufficient for the site\'s needs.',
          timestamp: '1 day ago',
          mentions: ['@JaneSmith']
        }
      ]
    }
  ]);

  // Enhanced equipment data with network equipment focus
  const [equipmentData, setEquipmentData] = useState<Record<EquipmentCategory, EquipmentItem[]>>({
    cashless: [
      { id: '1', name: 'Access Phones', quantity: 10, comments: 'Standard access phones for site use.' },
      { id: '2', name: 'Cashless Phones', quantity: 5, comments: 'Cashless payment terminals.' },
      { id: '3', name: 'POS Terminal', quantity: 15, comments: 'For vendor stalls, with integrated printers' },
      { id: '4', name: 'EPOS/SoftPOS Devices', quantity: 0, comments: '' },
      { id: '5', name: 'Totems', quantity: 0, comments: '' },
      { id: '6', name: 'Mini-Totems', quantity: 0, comments: '' },
    ],
    network: [
      { id: '7', name: 'PoE Switch 24-Port', quantity: 4, comments: 'For main network distribution' },
      { id: '8', name: 'UPS 1500VA', quantity: 2, comments: 'For critical network gear' },
      { id: '9', name: 'CAT6 Ethernet Cable (50m)', quantity: 10, comments: 'Assorted colors for cable management' },
      { id: '10', name: 'Access Point WiFi 6', quantity: 8, comments: 'For site-wide wireless coverage' },
      { id: '11', name: 'Server Rack 42U', quantity: 1, comments: 'Standard depth, with cooling fans' },
      { id: '12', name: '4G/LTE Modem', quantity: 2, comments: 'For backup internet connectivity' },
      { id: '13', name: 'IP Camera (Outdoor)', quantity: 12, comments: 'Weatherproof, night vision capable' },
      { id: '14', name: 'Power Distribution Unit (PDU)', quantity: 3, comments: 'Rack-mounted, metered' },
      { id: '15', name: 'Fiber Optic Cable (100m)', quantity: 2, comments: 'Single-mode, for backbone connection' },
    ],
    power: [
      { id: '20', name: '6 Gang Extension (3m)', quantity: 0, comments: '' },
      { id: '21', name: 'USB Hub (60 Port)', quantity: 0, comments: '' },
      { id: '22', name: 'IEC Cable (UK)', quantity: 0, comments: '' },
      { id: '23', name: '30m Extension Reel (UK)', quantity: 0, comments: '' },
      { id: '24', name: 'Single USB Charger (UK)', quantity: 0, comments: '' },
    ],
    other: [
      { id: '25', name: 'Laptop for Staff', quantity: 5, comments: 'For event management and monitoring' },
      { id: '26', name: 'Two-Way Radios', quantity: 20, comments: 'For security and staff communication' },
      { id: '27', name: 'Coffee Machine', quantity: 0, comments: '' },
      { id: '28', name: 'Racking (1600 x 500 x 500)', quantity: 0, comments: '' },
      { id: '29', name: 'Macbook Pro', quantity: 0, comments: '' },
    ],
  });

  const mainTabs = [
    { id: 'equipment-planning' as LogisticsMainTab, label: 'Equipment Planning', icon: Package },
    { id: 'site-allocation' as LogisticsMainTab, label: 'Site Allocation', icon: MapPin },
    { id: 'shipping-documentation' as LogisticsMainTab, label: 'Shipping & Documentation', icon: Truck },
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
      console.log('Saving equipment data:', equipmentData);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    setEquipmentData(prev => ({
      ...prev,
      [activeEquipmentCategory]: prev[activeEquipmentCategory].filter(item => item.id !== itemId)
    }));
  };

  const handleAddItem = () => {
    const newItem: EquipmentItem = {
      id: Date.now().toString(),
      name: '',
      quantity: 0,
      comments: ''
    };

    setEquipmentData(prev => ({
      ...prev,
      [activeEquipmentCategory]: [...prev[activeEquipmentCategory], newItem]
    }));
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
    setTimeout(() => {
      setJueStatus('request-received');
    }, 3000);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      user: {
        name: 'Current User',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMSCWafSRBxwpV8mdhXRap5IvyHnntx-8fwAftdNrWTiwS_jHUkfaskz72lvIDiNka9Kr2OTJinZVVpW7yoJ1b4RO5LTRXf8yVI_YHCrG62Z9T0paM7pa5araHHsXoV0sibUza7PV0ygx2FDW022E4K_uSY906lNBPJIaCCioZKqg24yKPiXsF-PscDVimHqRAclA2SLe5ZUzAICIXze7bYXHGevWtT3Q_Wng53jTm7bAueGW7lIg_MdNKJQrzuhvQUR9VsinpQk6o'
      },
      content: newComment,
      timestamp: 'Just now',
      mentions: [],
      replies: []
    };
    
    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  const getTotalEquipment = () => {
    return Object.values(equipmentData).reduce((total, category) => 
      total + category.reduce((sum, item) => sum + item.quantity, 0), 0
    );
  };

  const getCategoryTotals = () => {
    return {
      Network: equipmentData.network.reduce((sum, item) => sum + item.quantity, 0),
      Power: equipmentData.power.reduce((sum, item) => sum + item.quantity, 0),
      Cashless: equipmentData.cashless.reduce((sum, item) => sum + item.quantity, 0),
      Computing: 5, // Static for now
      Security: 12, // Static for now
      Comms: 20, // Static for now
    };
  };

  const getFilteredEquipment = () => {
    const items = equipmentData[activeEquipmentCategory];
    if (!searchQuery) return items;
    
    return items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.comments.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const renderEquipmentPlanning = () => (
    <div className="bg-gray-100 text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Hardware & Shipping</h1>
            <p className="text-gray-500">Define what's needed for the site.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Shipping Status</h3>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-green-500" />
              <span className="text-sm font-semibold text-gray-800">In Transit (Outbound)</span>
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '37.5%' }}></div>
              </div>
              <ol className="mt-2 grid grid-cols-7 text-xs text-center text-gray-500">
                <li className="col-span-1">To Prepare</li>
                <li className="col-span-2">Awaiting Collection</li>
                <li className="col-span-1">In Transit</li>
                <li className="col-span-1">On-site</li>
                <li className="col-span-1">In Transit</li>
                <li className="col-span-1">Received</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-8">
          {/* Equipment Planning Section */}
          <div className="col-span-9">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Hardware Request</h2>
                <div className="relative group flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Hardware Reservation:</span>
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-600">Potential</span>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-gray-800 text-white text-xs rounded py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <p>Reservation is pending confirmation from the warehouse.</p>
                    <p className="text-gray-400 text-xs mt-1">Updated by John Doe on 2023-10-27 10:15 AM</p>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
                  </div>
                </div>
              </div>

              {/* Category Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <nav className="-mb-px flex space-x-8">
                    {equipmentCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setActiveEquipmentCategory(category.id)}
                        className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                          activeEquipmentCategory === category.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </nav>
                  <div className="flex items-center gap-4 py-2">
                    <button
                      onClick={handlePushToJUE}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                      Push to JUE
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                        className="flex items-center gap-2 text-sm text-yellow-800 bg-yellow-100 px-3 py-1.5 rounded-full"
                      >
                        <span>Pending</span>
                        {showStatusDropdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {showStatusDropdown && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-1">
                            <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Request</button>
                            <button className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-yellow-800 hover:bg-yellow-50">
                              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                              Pending
                            </button>
                            <button className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-800 hover:bg-red-50">
                              <div className="w-2 h-2 rounded-full bg-red-500"></div>
                              Rejected
                            </button>
                            <button className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-green-800 hover:bg-green-50">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              Confirmed
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Search and Actions */}
              <div className="mt-8 flex justify-between items-center gap-4">
                <div className="relative w-full max-w-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    className="w-full pl-10 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    placeholder="Filter equipment..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-4">
                  <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 inline-flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download Template
                  </button>
                  <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 inline-flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload CSV
                  </button>
                </div>
              </div>

              {/* Equipment Table */}
              <div className="mt-4">
                <div className="bg-gray-100 px-6 py-1 sticky top-0 z-10">
                  <div className="grid grid-cols-12 gap-6 items-center">
                    <div className="col-span-4">
                      <button className="text-left text-sm font-medium text-gray-500 uppercase tracking-wider px-0 flex items-center gap-1 group py-1">
                        <span>Equipment</span>
                        <ArrowUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                      </button>
                    </div>
                    <div className="col-span-2">
                      <button className="text-left text-sm font-medium text-gray-500 uppercase tracking-wider px-0 flex items-center gap-1 group py-1">
                        <span>Quantity</span>
                        <MoreHorizontal className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                      </button>
                    </div>
                    <div className="col-span-5">
                      <button className="text-left text-sm font-medium text-gray-500 uppercase tracking-wider px-0 flex items-center gap-1 group py-1">
                        <span>Comments</span>
                        <MoreHorizontal className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                      </button>
                    </div>
                    <div className="col-span-1"></div>
                  </div>
                </div>
                
                <div className="space-y-2 max-h-[calc(20*3.5rem)] overflow-y-auto pr-2 -mr-2">
                  {getFilteredEquipment().map((item) => (
                    <div key={item.id} className="bg-white rounded-lg shadow-sm px-6 py-2">
                      <div className="grid grid-cols-12 gap-6 items-center">
                        <div className="col-span-4">
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        </div>
                        <div className="col-span-2">
                          <input
                            className="w-full text-center border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="col-span-5">
                          <input
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                            type="text"
                            value={item.comments}
                            onChange={(e) => handleItemChange(item.id, 'comments', e.target.value)}
                          />
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={handleAddItem}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                  <a
                    href="#page-top"
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    <span>Back to top</span>
                    <ArrowUp className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Equipment Summary Sidebar */}
          <div className="col-span-3">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Equipment Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Total Equipment</span>
                  <span className="text-sm font-bold text-gray-900">{getTotalEquipment()}</span>
                </div>
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Breakdown</h3>
                  {Object.entries(getCategoryTotals()).map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center text-sm mt-2">
                      <span className="text-gray-600">{category}</span>
                      <span className="text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments and Activity Log */}
        <div className="col-span-12 mt-8 grid grid-cols-12 gap-8">
          <div className="col-span-7">
            <div className="bg-white p-6 rounded-lg shadow-sm h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Comments</h2>
                <div className="relative w-full max-w-xs">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    className="w-full pl-10 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    placeholder="Search comments..."
                    type="text"
                  />
                </div>
              </div>
              
              <div className="space-y-6 flex-grow overflow-y-auto pr-4 -mr-4" style={{ maxHeight: '400px' }}>
                {comments.map((comment) => (
                  <div key={comment.id}>
                    <div className="flex items-start gap-4">
                      <img
                        alt={comment.user.name}
                        className="w-10 h-10 rounded-full"
                        src={comment.user.avatar}
                      />
                      <div className="flex-1">
                        <div className="bg-blue-50 p-4 rounded-lg rounded-tl-none border border-blue-200 relative">
                          <div className="absolute -left-2 top-3 w-4 h-4 bg-blue-50 transform rotate-45 border-l border-b border-blue-200"></div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-800">{comment.user.name}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-blue-500 text-xs font-medium">@You</span>
                              <p className="text-xs text-gray-500">{comment.timestamp}</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mt-2">{comment.content}</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2 pl-2">
                          <button className="font-medium hover:text-gray-700">Reply</button>
                          <span>·</span>
                          <button className="font-medium hover:text-gray-700">Edit</button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Replies */}
                    {comment.replies && comment.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-4 ml-14 mt-4">
                        <img
                          alt={reply.user.name}
                          className="w-10 h-10 rounded-full"
                          src={reply.user.avatar}
                        />
                        <div className="flex-1">
                          <div className="bg-gray-100 p-4 rounded-lg rounded-tl-none">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-gray-800">{reply.user.name}</p>
                              <p className="text-xs text-gray-500">{reply.timestamp}</p>
                            </div>
                            <p className="text-sm text-gray-700 mt-2">{reply.content}</p>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2 pl-2">
                            <button className="font-medium hover:text-gray-700">Reply</button>
                            <span>·</span>
                            <button className="font-medium hover:text-gray-700">Edit</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-start gap-4">
                  <img
                    alt="You"
                    className="w-10 h-10 rounded-full"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMSCWafSRBxwpV8mdhXRap5IvyHnntx-8fwAftdNrWTiwS_jHUkfaskz72lvIDiNka9Kr2OTJinZVVpW7yoJ1b4RO5LTRXf8yVI_YHCrG62Z9T0paM7pa5araHHsXoV0sibUza7PV0ygx2FDW022E4K_uSY906lNBPJIaCCioZKqg24yKPiXsF-PscDVimHqRAclA2SLe5ZUzAICIXze7bYXHGevWtT3Q_Wng53jTm7bAueGW7lIg_MdNKJQrzuhvQUR9VsinpQk6o"
                  />
                  <div className="flex-1">
                    <form onSubmit={(e) => { e.preventDefault(); handleAddComment(); }}>
                      <textarea
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                        placeholder="Add a comment... Tag with @ to mention someone."
                        rows={3}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Bell className="w-4 h-4" />
                          <span>You will be notified of replies.</span>
                        </div>
                        <button
                          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                          type="submit"
                        >
                          Comment
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="col-span-5">
            <div className="bg-white p-6 rounded-lg shadow-sm h-full flex flex-col">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Log</h2>
              <div className="space-y-6 flex-grow overflow-y-auto pr-4 -mr-4" style={{ maxHeight: '400px' }}>
                <div className="relative pl-8">
                  <div className="absolute left-3 top-1 w-px h-full bg-gray-200"></div>
                  <div className="flex items-start gap-4">
                    <div className="absolute left-0 top-1.5 flex items-center justify-center bg-gray-200 rounded-full h-6 w-6">
                      <History className="w-3 h-3 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Hardware Reservation status changed to <span className="font-bold">Potential</span>.
                      </p>
                      <p className="text-xs text-gray-500 mt-1">By John Doe on Oct 27, 2023, 10:15 AM</p>
                    </div>
                  </div>
                </div>
                
                <div className="relative pl-8">
                  <div className="absolute left-3 top-1 w-px h-full bg-gray-200"></div>
                  <div className="flex items-start gap-4">
                    <div className="absolute left-0 top-1.5 flex items-center justify-center bg-gray-200 rounded-full h-6 w-6">
                      <History className="w-3 h-3 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Request Status changed to <span className="font-bold">Awaiting hardware allocation</span>.
                      </p>
                      <p className="text-xs text-gray-500 mt-1">By Jane Smith on Oct 27, 2023, 9:30 AM</p>
                    </div>
                  </div>
                </div>
                
                <div className="relative pl-8">
                  <div className="flex items-start gap-4">
                    <div className="absolute left-0 top-1.5 flex items-center justify-center bg-gray-200 rounded-full h-6 w-6">
                      <Plus className="w-3 h-3 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Hardware Request created.</p>
                      <p className="text-xs text-gray-500 mt-1">By Jane Smith on Oct 26, 2023, 2:45 PM</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <a
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-2"
                  href="#"
                >
                  <span>View full log</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Handler functions for Site Allocation
  const handleItemDelete = (categoryId: string, locationIndex: number, itemId: string) => {
    setAllocationCategories(prev => 
      prev.map(category => 
        category.id === categoryId ? {
          ...category,
          locations: category.locations.map((location, index) => 
            index === locationIndex ? {
              ...location,
              hardware: location.hardware.filter(item => item.id !== itemId)
            } : location
          )
        } : category
      )
    );
  };

  const handleQuantityChange = (categoryId: string, locationIndex: number, itemId: string, newQuantity: number) => {
    setAllocationCategories(prev => 
      prev.map(category => 
        category.id === categoryId ? {
          ...category,
          locations: category.locations.map((location, index) => 
            index === locationIndex ? {
              ...location,
              hardware: location.hardware.map(item => 
                item.id === itemId ? { ...item, quantity: newQuantity } : item
              )
            } : location
          )
        } : category
      )
    );
  };

  const handleOpenNotes = (categoryId: string, locationIndex: number, itemId: string) => {
    const category = allocationCategories.find(cat => cat.id === categoryId);
    const item = category?.locations[locationIndex]?.hardware.find(hw => hw.id === itemId);
    
    setCurrentNoteItem({ categoryId, locationIndex, itemId });
    setNoteText(item?.notes || '');
    setShowNotesModal(true);
  };

  const handleSaveNotes = () => {
    if (!currentNoteItem) return;
    
    const { categoryId, locationIndex, itemId } = currentNoteItem;
    
    setAllocationCategories(prev => 
      prev.map(category => 
        category.id === categoryId ? {
          ...category,
          locations: category.locations.map((location, index) => 
            index === locationIndex ? {
              ...location,
              hardware: location.hardware.map(item => 
                item.id === itemId ? { ...item, notes: noteText } : item
              )
            } : location
          )
        } : category
      )
    );
    
    setShowNotesModal(false);
    setCurrentNoteItem(null);
    setNoteText('');
  };

  const handleLocationToggle = (categoryId: string, locationIndex: number) => {
    setAllocationCategories(prev => 
      prev.map(category => 
        category.id === categoryId ? {
          ...category,
          locations: category.locations.map((location, index) => 
            index === locationIndex ? { ...location, expanded: !location.expanded } : location
          )
        } : category
      )
    );
  };

  const handleLocationSelection = (categoryId: string, locationName: string, checked: boolean) => {
    setSelectedLocations(prev => {
      const categorySelections = prev[categoryId] || new Set();
      const newSelections = new Set(categorySelections);
      
      if (checked) {
        newSelections.add(locationName);
      } else {
        newSelections.delete(locationName);
      }
      
      return {
        ...prev,
        [categoryId]: newSelections
      };
    });
  };

  const handleClearSelected = (categoryId: string) => {
    const selectedLocationNames = selectedLocations[categoryId] || new Set();
    
    setAllocationCategories(prev => 
      prev.map(category => 
        category.id === categoryId ? {
          ...category,
          locations: category.locations.map(location => 
            selectedLocationNames.has(location.name) ? { ...location, hardware: [] } : location
          )
        } : category
      )
    );
    
    setSelectedLocations(prev => ({
      ...prev,
      [categoryId]: new Set()
    }));
  };

  const filteredCategories = allocationCategories.map(category => ({
    ...category,
    locations: category.locations.map(location => ({
      ...location,
      hardware: location.hardware.filter(item => 
        item.name.toLowerCase().includes(siteSearchQuery.toLowerCase())
      )
    }))
  }));

  const renderSiteAllocation = () => (
    <div className="py-8">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Logistics & Hardware</h2>
          <p className="text-gray-600 mt-1">Define what's needed for the site.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>All changes saved</span>
          </div>
          <button className="bg-white text-gray-700 font-medium py-2 px-4 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            Clear All Data
          </button>
          <button className="bg-white text-gray-700 font-medium py-2 px-4 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2">
            <Download className="h-5 w-5 text-gray-500" />
            Export Data
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="my-6">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            className="block w-full rounded-md border-gray-300 py-3 pl-10 pr-3 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Search by category, location, or hardware..."
            type="search"
            value={siteSearchQuery}
            onChange={(e) => setSiteSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Allocation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredCategories.map((category) => {
          const selectedLocationNames = selectedLocations[category.id] || new Set();
          
          return (
            <div key={category.id} className="bg-white rounded-lg shadow-sm overflow-hidden allocation-category flex flex-col">
              {/* Category Header */}
              <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10 flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                </div>
                <button className="bg-white text-red-500 hover:bg-red-50 text-xs py-1 px-2 font-medium rounded-md border border-gray-300 shadow-sm">
                  <Trash2 className="w-4 h-4 inline-block mr-1" />
                  Clear Section
                </button>
              </div>

              {/* Location Table */}
              <div className="flex-grow overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <tbody className="bg-white divide-y divide-gray-200">
                    {category.locations.map((location, locationIndex) => {
                      const isSelected = selectedLocationNames.has(location.name);
                      
                      return (
                        <tr key={locationIndex} className={`location-row group ${location.expanded ? 'expanded' : ''}`}>
                          <td className="px-6 py-4 align-top w-1/3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <input
                                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => handleLocationSelection(category.id, location.name, e.target.checked)}
                                />
                                <button
                                  className="p-1 rounded-full hover:bg-gray-100 mr-2"
                                  type="button"
                                  onClick={() => handleLocationToggle(category.id, locationIndex)}
                                >
                                  <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${location.expanded ? 'rotate-90' : ''}`} />
                                </button>
                                <span className="text-sm font-medium text-gray-900">{location.name}</span>
                              </div>
                              <button
                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                type="button"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                          {location.expanded && (
                            <td className="px-6 py-4 text-sm text-gray-500" colSpan={3}>
                              <div className="space-y-2 border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                                {location.hardware.map((item) => (
                                  <div key={item.id} className="bg-gray-100 rounded-md hardware-item" draggable>
                                    <div className="flex items-center gap-2 p-2">
                                      <input
                                        className="flex-grow border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 min-w-0"
                                        type="text"
                                        value={item.name}
                                        readOnly
                                      />
                                      <input
                                        className="w-16 border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-right"
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => handleQuantityChange(category.id, locationIndex, item.id, parseInt(e.target.value) || 1)}
                                      />
                                      <button
                                        className="p-1 rounded-full hover:bg-gray-200 relative"
                                        type="button"
                                        onClick={() => handleOpenNotes(category.id, locationIndex, item.id)}
                                      >
                                        <MessageSquare className={`h-5 w-5 ${item.notes ? 'text-blue-600' : 'text-gray-400'}`} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                {location.hardware.length === 0 && (
                                  <div className="text-center py-2 text-gray-400">Drag hardware here</div>
                                )}
                              </div>
                              <button className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium mt-2">
                                <Plus className="h-5 w-5 mr-1" />
                                Add hardware
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Category Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <button 
                  className={`bg-white text-red-500 hover:bg-red-50 font-medium py-2 px-4 rounded-md border border-gray-300 shadow-sm ${selectedLocationNames.size === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={selectedLocationNames.size === 0}
                  onClick={() => selectedLocationNames.size > 0 && handleClearSelected(category.id)}
                >
                  Clear Selected
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notes Modal */}
      {showNotesModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  Notes for {currentNoteItem ? 
                    allocationCategories
                      .find(cat => cat.id === currentNoteItem.categoryId)
                      ?.locations[currentNoteItem.locationIndex]
                      ?.hardware.find(hw => hw.id === currentNoteItem.itemId)?.name || 'Item'
                    : 'Item'
                  }
                </h3>
              </div>
              <div className="p-6">
                <textarea
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  placeholder="Add notes or specifications..."
                  rows={4}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                />
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                <button
                  className="bg-white text-gray-700 font-medium py-2 px-4 rounded-md border border-gray-300 hover:bg-gray-50"
                  onClick={() => setShowNotesModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={handleSaveNotes}
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderShippingDocumentation = () => (
    <div className="py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Shipping & Documentation</h1>
        <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-2 border border-gray-200">
          <div className="flex items-center gap-3 rounded-md p-2">
            <img alt="Project Lead Photo" className="h-10 w-10 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAf4HElzaw15rTRlccl6v4z2BfVCOIqarVasQdfuS_-jMR048MQdMyPaiBUdcYBTHzEA6LdOjHN7grLH5_ad4d3j55JMMwUsNTkEseSJ1NMpnibnwZIKCCBPJOORzzKIFlZON2AViDqiPrUZPZlm_-XQ4Hov445VhNA_Ziu2QJkATJ3eJi7xhlfMbCH9auu9tthbM2mh4z1A_liDTcS_03UYBNAlLik6P9jUV726MkdUVfSDjhWvlg6EWJve_oswnerwhMPO3BMiOg"/>
            <div>
              <p className="text-sm font-semibold text-gray-900">Maria Rodriguez</p>
              <p className="text-xs text-gray-600">Project Lead</p>
              <div className="flex items-center gap-2 mt-1">
                <a className="text-xs text-blue-600 hover:underline flex items-center gap-1" href="mailto:maria.rodriguez@logistics.pro">
                  <Mail className="w-3 h-3" /> Email
                </a>
                <a className="text-xs text-blue-600 hover:underline flex items-center gap-1" href="#">
                  <MessageSquare className="w-3 h-3" /> Teams
                </a>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-md bg-white shadow-sm border border-gray-200">
            <img alt="Logistics Lead Photo" className="h-10 w-10 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-Rm2hnjNCuCURxfw5y0hD14oX-tmXJ07WMyNW4UiRH-U5DyvdnRL744IjsPgkXqwZ21xgWAOxA3dyLzMT63B1CSDwbjrUHbG9EBDW3JXupbm9nagtJziC2eIn0rFv-ajWGg6N_kpqpXlhAM3uivzvHIwhtYOyeLXL6TDtetsDwkpTlARjkmrs63vmlkLrzYUsQmj9b_UmMkz3RYtQ4dxH50WaxQlEJIknoi_jYzp7VGr29saxfc3ycWnrkZRsnBoa2hxhhjASMBc"/>
            <div>
              <p className="text-sm font-semibold text-gray-900">Alex Hartman</p>
              <p className="text-xs text-gray-600">Logistics Lead</p>
              <div className="flex items-center gap-2 mt-1">
                <a className="text-xs text-blue-600 hover:underline flex items-center gap-1" href="mailto:alex.hartman@logistics.pro">
                  <Mail className="w-3 h-3" /> Email
                </a>
                <a className="text-xs text-blue-600 hover:underline flex items-center gap-1" href="#">
                  <MessageSquare className="w-3 h-3" /> Teams
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-y-8">
        {/* Shipping Timeline */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="relative pt-10 pb-4">
            <div className="absolute top-0 left-[70%] transform -translate-x-1/2 flex flex-col items-center">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <div className="w-0.5 h-4 bg-blue-600"></div>
            </div>
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200">
              <div className="h-full bg-blue-600" style={{width: '70%'}}></div>
            </div>
            <div className="flex justify-between">
              <div className="relative w-1/6 text-center group">
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 border-2 border-blue-600 rounded-full"></div>
                <p className="font-semibold text-sm text-gray-900 mt-6">Packing Deadline</p>
                <p className="text-xs text-gray-600">15/08/2024</p>
              </div>
              <div className="relative w-1/6 text-center group">
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 border-2 border-blue-600 rounded-full"></div>
                <p className="font-semibold text-sm text-gray-900 mt-6">Shipping Date</p>
                <p className="text-xs text-gray-600">16/08/2024</p>
              </div>
              <div className="relative w-1/6 text-center group">
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 border-2 border-blue-600 rounded-full"></div>
                <p className="font-semibold text-sm text-gray-900 mt-6">Expected Delivery</p>
                <p className="text-xs text-gray-600">20/08/2024</p>
              </div>
              <div className="relative w-1/6 text-center group">
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 border-2 border-blue-600 rounded-full"></div>
                <p className="font-semibold text-sm text-gray-900 mt-6">On-Site Date</p>
                <p className="text-xs text-gray-600">21/08/2024</p>
              </div>
              <div className="relative w-1/6 text-center group">
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-2 border-gray-300 rounded-full"></div>
                <p className="font-semibold text-sm text-gray-500 mt-6">Event Dates</p>
                <p className="text-xs text-gray-400">22 - 24/08/2024</p>
              </div>
              <div className="relative w-1/6 text-center group">
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-2 border-gray-300 rounded-full"></div>
                <p className="font-semibold text-sm text-gray-500 mt-6">Return Shipping Date</p>
                <p className="text-xs text-gray-400">25/08/2024</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Details */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="origin-location">Origin Location</label>
                  <select className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" id="origin-location">
                    <option>Select Origin Location</option>
                    <option selected>Warehouse A</option>
                    <option>Warehouse B</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="destination-address">Destination Address</label>
                  <input className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" id="destination-address" type="text" defaultValue="123 Main St, Anytown, USA"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="onsite-contact-name">On-site Contact Name</label>
                  <input className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" id="onsite-contact-name" type="text"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="onsite-contact-phone">On-site Contact Phone</label>
                  <input className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" id="onsite-contact-phone" type="tel"/>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="onsite-contact-email">On-site Contact Email</label>
                  <input className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" id="onsite-contact-email" type="email"/>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Courier Details</label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <input className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" placeholder="Company" type="text"/>
                    <input className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" placeholder="Tracking Number" type="text"/>
                  </div>
                </div>
                <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Carnet Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="carnet-number">Carnet Number</label>
                      <input className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" id="carnet-number" type="text"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="carnet-expiry">Expiry Date</label>
                      <input className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" id="carnet-expiry" type="date"/>
                    </div>
                    <div className="md:col-span-2 flex items-center justify-between pt-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Carnet Document</p>
                        <p className="text-xs text-gray-500 mt-1">15/07/2024, 3:00 PM</p>
                      </div>
                      <button className="bg-white text-gray-600 rounded-md px-3 py-2 text-xs font-semibold hover:bg-gray-100 border border-gray-300 shadow-sm">Upload</button>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="special-instructions">Special Instructions</label>
                  <textarea className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent h-24" id="special-instructions"></textarea>
                </div>
              </div>
            </div>

            {/* Cost Tracking */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Cost Tracking</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="actual-shipping-cost">Actual Shipping</label>
                    <div className="relative">
                      <input className="w-full bg-white border border-gray-300 rounded-md pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" id="actual-shipping-cost" type="text" defaultValue="1,200.00"/>
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="customs-duties">Customs/Duties</label>
                    <div className="relative">
                      <input className="w-full bg-white border border-gray-300 rounded-md pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" id="customs-duties" type="text" defaultValue="170.00"/>
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="insurance">Insurance</label>
                    <div className="relative">
                      <input className="w-full bg-white border border-gray-300 rounded-md pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" id="insurance" type="text" defaultValue="45.00"/>
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="local-transport">Local Transport</label>
                    <div className="relative">
                      <input className="w-full bg-white border border-gray-300 rounded-md pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" id="local-transport" type="text" defaultValue="85.00"/>
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="carnet-cost">Carnet</label>
                    <div className="relative">
                      <input className="w-full bg-white border border-gray-300 rounded-md pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" id="carnet-cost" type="text" defaultValue="150.00"/>
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="other-cost">Other</label>
                    <div className="relative">
                      <input className="w-full bg-white border border-gray-300 rounded-md pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" id="other-cost" type="text"/>
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button className="bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-semibold hover:bg-blue-700 w-full h-[38px] flex items-center justify-center">
                      <Plus className="mr-1.5 h-4 w-4" /> Add Cost
                    </button>
                  </div>
                </div>
                <hr className="my-4 border-gray-200"/>
                <div className="flex justify-between items-center text-sm">
                  <p className="font-semibold text-gray-600">Total Logistics Cost:</p>
                  <p className="font-bold text-lg text-gray-900">€1,650.00</p>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <p className="font-semibold text-gray-600">Variance from Budget:</p>
                  <p className="font-bold text-lg text-green-600">-€40.00</p>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="cost-comments">Comments / Notes</label>
                  <textarea className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent h-20" id="cost-comments" placeholder="Add any relevant details about the costs..."></textarea>
                </div>
                <div className="mt-4 flex justify-end">
                  <button className="bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-semibold hover:bg-blue-700 flex items-center gap-2">
                    Push Totals to ROI Page <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Critical Escalation */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Critical Escalation</h2>
              <div className="space-y-4">
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Emergency Contact</h3>
                      <div className="flex items-center gap-3">
                        <img alt="Logistics Lead Photo" className="h-10 w-10 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-Rm2hnjNCuCURxfw5y0hD14oX-tmXJ07WMyNW4UiRH-U5DyvdnRL744IjsPgkXqwZ21xgWAOxA3dyLzMT63B1CSDwbjrUHbG9EBDW3JXupbm9nagtJziC2eIn0rFv-ajWGg6N_kpqpXlhAM3uivzvHIwhtYOyeLXL6TDtetsDwkpTlARjkmrs63vmlkLrzYUsQmj9b_UmMkz3RYtQ4dxH50WaxQlEJIknoi_jYzp7VGr29saxfc3ycWnrkZRsnBoa2hxhhjASMBc"/>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Alex Hartman</p>
                          <p className="text-xs text-gray-600">Logistics Lead</p>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <button className="bg-white text-gray-600 rounded-md px-3 py-1 text-xs font-semibold hover:bg-gray-100 border border-gray-300 shadow-sm flex items-center gap-1">
                        Edit Guard <ChevronDown className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">This person is the designated contact for issue reporting and escalation for this project.</p>
                  <div className="mt-4 flex items-center space-x-3">
                    <a className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors" href="#">
                      <MessageSquare className="h-5 w-5" />
                    </a>
                    <a className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors" href="#">
                      <Phone className="h-5 w-5" />
                    </a>
                    <a className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors" href="#">
                      <Mail className="h-5 w-5" />
                    </a>
                  </div>
                </div>
                <button className="w-full rounded-md px-4 py-2 text-sm mt-4 bg-red-600 text-white hover:bg-red-700 font-bold border border-red-700">Submit Critical Issue</button>
              </div>
            </div>

            {/* Document Checklist */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Document Checklist</h2>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="font-medium text-gray-900 truncate">Commercial Invoice</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <AlertTriangle className="h-3 w-3" /> Required
                      </span>
                      <p className="text-xs text-gray-500">Today, 2:45 PM</p>
                    </div>
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                    <button className="bg-white text-gray-600 rounded-md px-3 py-2 text-xs font-semibold hover:bg-gray-100 border border-gray-300 shadow-sm">Generate</button>
                    <button className="bg-white text-gray-600 rounded-md px-3 py-2 text-xs font-semibold hover:bg-gray-100 border border-gray-300 shadow-sm">Upload</button>
                  </div>
                </li>
                <li className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="font-medium text-gray-900 truncate">Packing List</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3" /> Submitted
                      </span>
                      <p className="text-xs text-gray-500">Today, 11:10 AM</p>
                    </div>
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                    <button className="bg-white text-gray-600 rounded-md px-3 py-2 text-xs font-semibold hover:bg-gray-100 border border-gray-300 shadow-sm">Generate</button>
                    <button className="bg-white text-gray-600 rounded-md px-3 py-2 text-xs font-semibold hover:bg-gray-100 border border-gray-300 shadow-sm">Replace</button>
                  </div>
                </li>
                <li className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="font-medium text-gray-900 truncate">Insurance Certificate</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertTriangle className="h-3 w-3" /> Error
                      </span>
                      <p className="text-xs text-gray-500">Yesterday, 4:20 PM</p>
                    </div>
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                    <button className="bg-white text-gray-600 rounded-md px-3 py-2 text-xs font-semibold hover:bg-gray-100 border border-gray-300 shadow-sm">Generate</button>
                    <button className="bg-white text-gray-600 rounded-md px-3 py-2 text-xs font-semibold hover:bg-gray-100 border border-gray-300 shadow-sm">Upload</button>
                  </div>
                </li>
                <li className="flex items-center justify-between pt-3">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="font-medium text-gray-900 truncate">Equipment Certificates</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3" /> Submitted
                      </span>
                      <p className="text-xs text-gray-500">Yesterday, 9:30 AM</p>
                    </div>
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                    <button className="bg-white text-gray-600 rounded-md px-3 py-2 text-xs font-semibold hover:bg-gray-100 border border-gray-300 shadow-sm">Generate</button>
                    <button className="bg-white text-gray-600 rounded-md px-3 py-2 text-xs font-semibold hover:bg-gray-100 border border-gray-300 shadow-sm">Replace</button>
                  </div>
                </li>
              </ul>
            </div>
          </div>
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
      <div className="flex-1 overflow-y-auto" id="page-top">
        {/* Main Tabs */}
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <nav className="-mb-px flex space-x-8">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveMainTab(tab.id)}
                  className={`py-4 px-1 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeMainTab === tab.id
                      ? 'border-blue-500 text-blue-600'
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
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          <div className="max-w-7xl mx-auto px-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}