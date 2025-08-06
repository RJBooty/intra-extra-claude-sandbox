import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  AlertCircle, AlertTriangle, Award, BarChart3, Briefcase, Building, 
  Calendar, CalendarDays, Car, CheckCircle, CheckSquare, ChevronLeft, 
  ChevronRight, Clock, Construction, Copy, CreditCard, DollarSign, Download, Edit, Eye, 
  EyeOff, FileText, FolderOpen, Globe, Hammer, HardHat, Heart, Key, Lock, Luggage, 
  Mail, MessageCircle, MessageSquare, Mountain, Package, Paperclip, Phone, Plane, 
  Plus, Receipt, Save, Scale, Search, Send, Settings, Shield, ShieldCheck, 
  Star, Trash2, TrendingUp, Trophy, Truck, Upload, User, UserCog, 
  UserX, Users, Wrench, X, XCircle, Zap, Zap as Lightning
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface UserProfilePageProps {
  onBack: () => void;
}

export function UserProfilePage({ onBack }: UserProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'personal' | 'work' | 'compliance' | 'payments' | 'availability' | 'performance' | 'reports' | 'preferences'>('personal');
  const [isLoading, setIsLoading] = useState(false);
  const [showFinanceQueryModal, setShowFinanceQueryModal] = useState(false);
  const [financeQueryForm, setFinanceQueryForm] = useState({
    subject: '',
    invoice: '',
    description: '',
    attachment: null as File | null
  });
  const [financeQueryError, setFinanceQueryError] = useState(false);
  
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [createInvoiceForm, setCreateInvoiceForm] = useState({
    invoiceNumber: 'INV-2024-007',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    poNumber: '',
    currency: 'GBP',
    project: '',
    items: [
      {
        description: 'On-site Day Rate (Manager)',
        details: '',
        category: 'Fee',
        subCategory: '',
        quantity: 10,
        rate: '350.00',
        amount: 3500.00
      },
      {
        description: 'Flights to Geneva',
        details: '',
        category: 'Expense',
        subCategory: 'Travel',
        quantity: 1,
        rate: '225.00',
        amount: 225.00
      }
    ],
    vatEnabled: true,
    vatRate: 20
  });
  const [createInvoiceError, setCreateInvoiceError] = useState(false);

  // Compliance Tab State
  const [showDocumentDetail, setShowDocumentDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);

  // Compliance Tab Handlers
  const handleSelectDocument = (index: number) => {
    if (selectedDocuments.includes(index)) {
      setSelectedDocuments(selectedDocuments.filter(i => i !== index));
    } else {
      setSelectedDocuments([...selectedDocuments, index]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]); // All non-disabled documents
    }
    setSelectAll(!selectAll);
  };

  const handleDeleteDocument = (index: number) => {
    setDocumentToDelete(index);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    toast.success('Document deleted successfully');
    setShowDeleteModal(false);
    setDocumentToDelete(null);
  };

  const tabs = [
    { id: 'personal', label: 'Personal Details', icon: User },
    { id: 'work', label: 'Work Skills', icon: Briefcase },
    { id: 'compliance', label: 'Docs & Compliance', icon: Shield, badge: 2 },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'availability', label: 'Availability', icon: Calendar },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'preferences', label: 'Preferences', icon: Settings }
  ];

  // Personal Details Tab
  const renderPersonalTab = () => (
    <div className="space-y-6">
      {/* Basic Information and Contact Information - Top Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center border-b pb-3 mb-4">
            <User className="w-5 h-5 mr-2 text-gray-500" />
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600">First Name</label>
              <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 text-sm">Ava</div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Last Name</label>
              <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 text-sm">Harper</div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Preferred Name</label>
              <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 text-sm">Ava</div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Date of Birth</label>
              <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 text-sm">21/08/92 (32 years old)</div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Gender</label>
              <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 text-sm">Female</div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Nationality</label>
              <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 text-sm">Australian</div>
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="text-xs font-medium text-gray-600">Languages Spoken</label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">English (Native)</span>
                <span className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full">French (Conversational)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center border-b pb-3 mb-4">
            <Phone className="w-5 h-5 mr-2 text-gray-500" />
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600">Email</label>
              <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 text-sm">ava.harper@casid.com</div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Mobile Phone</label>
              <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 text-sm">+61 412 345 678</div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Work Number</label>
              <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 text-sm">+61 412 345 678</div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Working Location</label>
              <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 text-sm">Remote</div>
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="text-xs font-medium text-gray-600">Home Address</label>
              <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 text-sm flex justify-between items-center h-[42px]">
                <span>123 Example St, Sydney, NSW 2090, Australia</span>
                <button className="text-gray-500 hover:text-gray-700">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="text-xs font-medium text-gray-600">Profile Picture</label>
              <div className="mt-1 flex items-center gap-3 rounded-lg border border-dashed border-gray-300 px-6 py-2">
                <img 
                  alt="Profile Picture" 
                  className="h-8 w-8 rounded-full" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKpfgEPhzk2zztpi63us-yp1m0V4THV4CaYu1yrUGpCbQesgrAK0_3qjeNPZZ3b9p5tkx7BQ8lz5a9zkhDQgKUUg7VquHd0CKMYCSAgD6MXrJf7AlvrlfYsQgIYtjL_4MjGwCOmDL8gvwHBuAZQA1v8aVjiDQw-XD4Ss14pGT5B87m4M5M5-4Qi5TN8temze9tu4LTHnxZBnmIQxqasQph5WHRj-SOiTa750RWffHgcz-aA0lkxKRksF3oiVv2v__Kvvw9vQ2CR7A3" 
                />
                <div className="text-left">
                  <div className="flex text-xs leading-5 text-gray-600">
                    <label className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 hover:text-indigo-500">
                      <span>Upload a file</span>
                      <input className="sr-only" type="file" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Me and Job Information - Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center border-b pb-3 mb-4">
            <User className="w-5 h-5 mr-2 text-gray-500" />
            About Me
          </h3>
          <div>
            <label className="text-xs font-medium text-gray-600">Introduction</label>
            <div className="mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 leading-relaxed text-sm h-full">
              I'm a dedicated and passionate professional with over 8 years of experience in project management and international development. I thrive in collaborative environments and I'm always eager to take on new challenges. I'm excited to be part of this team and contribute to our shared goals. Outside of work, I'm an avid hiker and love exploring new cultures through travel and food.
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center border-b pb-3 mb-4">
            <Briefcase className="w-5 h-5 mr-2 text-gray-500" />
            Job Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600">Job Title</label>
              <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 text-sm">Project Manager</div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Department</label>
              <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 text-sm">International Development</div>
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="text-xs font-medium text-gray-600">Brief Description</label>
              <div className="mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 leading-relaxed text-sm">
                Manages and oversees international development projects, ensuring they are completed on time, within budget, and to the required quality standards.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documents - Third Row */}
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center border-b pb-3 mb-4">
          <FileText className="w-5 h-5 mr-2 text-gray-500" />
          Documents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 flex items-center mb-3 text-base">
              <FileText className="w-5 h-5 mr-2 text-gray-500" />
              Passport
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Passport Number</label>
                <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 text-sm">E12345678</div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Expiry Date</label>
                <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 text-sm">15/06/2030</div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Country of Issue</label>
                <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 text-sm">Australia</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 flex items-center mb-3 text-base">
              <Car className="w-5 h-5 mr-2 text-gray-500" />
              Driving License
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Number</label>
                <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 text-sm">987654321</div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Country of Issue</label>
                <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 text-sm">Australia</div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Expiry</label>
                <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 text-sm">21/08/2028</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency & Medical - Fourth Row */}
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center border-b pb-3 mb-4">
          <Heart className="w-5 h-5 mr-2 text-gray-500" />
          Emergency & Medical
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-800 flex items-center mb-3 text-base">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
              Emergency Information
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-red-700">Emergency Contact Name</label>
                <div className="mt-1 p-2 bg-red-100 rounded-md text-red-900 border border-red-200 text-sm">Noah Thompson</div>
              </div>
              <div>
                <label className="text-xs font-medium text-red-700">Relationship</label>
                <div className="mt-1 p-2 bg-red-100 rounded-md text-red-900 border border-red-200 text-sm">Partner</div>
              </div>
              <div>
                <label className="text-xs font-medium text-red-700">Emergency Contact Phone</label>
                <div className="mt-1 p-2 bg-red-100 rounded-md text-red-900 border border-red-200 text-sm">+61 487 654 321</div>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 flex items-center mb-3 text-base">
              <Heart className="w-5 h-5 mr-2 text-yellow-500" />
              Medical Conditions
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Allergies</label>
                <div className="mt-1 p-2 bg-yellow-100 rounded-md text-red-700 font-medium border border-yellow-200 text-sm">Peanuts (anaphylactic)</div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Dietary Requirements</label>
                <div className="mt-1 p-2 bg-yellow-100 rounded-md text-gray-800 border border-yellow-200 text-sm">Vegetarian</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Work Skills Tab
  const renderWorkTab = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Work Skills</h2>
      </div>

      {/* Primary Roles & Experience */}
      <div className="bg-white shadow-sm rounded-xl p-8 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center pb-4 border-b border-gray-200">
          <Briefcase className="text-gray-500 mr-3" />
          Primary Roles & Experience
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8">
          <div>
            <label className="block text-sm font-medium text-gray-600">Primary Role</label>
            <p className="mt-1 text-base text-gray-900 font-medium">Stage Manager</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Secondary Role</label>
            <p className="mt-1 text-base text-gray-900 font-medium">Lighting Technician</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Years of Experience</label>
            <p className="mt-1 text-base text-gray-900 font-medium">8+ Years</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Date Joined CASFID</label>
            <p className="mt-1 text-base text-gray-900 font-medium">15th March 2021</p>
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-600">Referral Source</label>
            <p className="mt-1 text-base text-gray-900 font-medium">Existing Crew Member: John Doe</p>
          </div>
        </div>
        <div className="mt-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <label className="block text-sm font-medium text-gray-600">Bio / Professional Summary</label>
          <p className="mt-1 text-sm text-gray-700 italic">"Highly organized and proactive Stage Manager with over 8 years of experience in managing large-scale theatre productions and corporate events. Proven ability to lead crews, manage schedules, and ensure seamless show execution. Also proficient in lighting setup and operation."</p>
        </div>
      </div>

      {/* Skills Matrix */}
      <div className="bg-white shadow-sm rounded-xl p-8 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center pb-4 border-b border-gray-200">
          <Construction className="text-gray-500 mr-3" />
          Skills Matrix
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-gray-50 p-6 rounded-lg border border-gray-200 flex flex-col items-center justify-center">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Skills Overview</h4>
            <div className="w-full max-w-xs h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 text-sm">Chart placeholder</p>
            </div>
            <div className="mt-6 w-full space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                  <span className="text-sm font-medium text-gray-700">Technical Skills</span>
                </div>
                <span className="text-sm font-semibold text-blue-600">3.5 / 5</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></span>
                  <span className="text-sm font-medium text-gray-700">Soft Skills</span>
                </div>
                <span className="text-sm font-semibold text-indigo-600">4.5 / 5</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-lg text-gray-800 mb-4 pb-3 border-b border-gray-200">Technical Skills</h4>
              <div className="space-y-0 overflow-hidden rounded-md border border-gray-200">
                {[
                  { skill: 'Cashless CS Experience', level: 4 },
                  { skill: 'Ticketing CS Experience', level: 3 },
                  { skill: 'Server Experience', level: 2 },
                  { skill: 'General Troubleshooting', level: 5 }
                ].map((item, index) => (
                  <div key={item.skill} className={`flex items-center justify-between py-4 px-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${index !== 3 ? 'border-b border-gray-200' : ''}`}>
                    <span className="font-medium text-gray-700">{item.skill}</span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`w-4 h-4 rounded-full ${
                            level <= item.level ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-lg text-gray-800 mb-4 pb-3 border-b border-gray-200">Soft Skills</h4>
              <div className="space-y-0 overflow-hidden rounded-md border border-gray-200">
                {[
                  { skill: 'Leadership', level: 5 },
                  { skill: 'Communication', level: 4 },
                  { skill: 'Problem Solving', level: 5 },
                  { skill: 'Teamwork', level: 4 }
                ].map((item, index) => (
                  <div key={item.skill} className={`flex items-center justify-between py-4 px-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${index !== 3 ? 'border-b border-gray-200' : ''}`}>
                    <span className="font-medium text-gray-700">{item.skill}</span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`w-4 h-4 rounded-full ${
                            level <= item.level ? 'bg-indigo-500' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 mt-2">
              <h4 className="font-semibold text-lg text-gray-700 mb-4">Skill Level per Category</h4>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-green-100 text-green-800">Senior Experience</span>
                <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800">Stage Management</span>
                <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800">Lighting</span>
                <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-purple-100 text-purple-800">CASFID Systems Expert</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Certifications & Licenses */}
      <div className="bg-white shadow-sm rounded-xl p-8 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center pb-4 border-b border-gray-200">
          <Award className="text-gray-500 mr-3" />
          Certifications & Licenses
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'First Aid', expiry: '12 Jun 2025', icon: Heart, color: 'green', status: 'valid' },
            { name: 'Electrical Safety', expiry: '01 Feb 2024', icon: Zap, color: 'red', status: 'expired' },
            { name: 'Working at Height', expiry: '20 Oct 2026', icon: Mountain, color: 'green', status: 'valid' },
            { name: 'Driving License', expiry: '30 Mar 2030', icon: Car, color: 'green', status: 'valid', extra: 'Class: B, C1' },
            { name: 'Heavy Goods License', expiry: null, icon: Truck, color: 'gray', status: 'not_held' },
            { name: 'Fork Lift License', expiry: '15 May 2025', icon: HardHat, color: 'green', status: 'valid' },
            { name: 'Telehandler License', expiry: null, icon: Construction, color: 'gray', status: 'not_held' },
            { name: 'Other: PASMA', expiry: '01 Dec 2024', icon: FileText, color: 'green', status: 'valid' }
          ].map((cert) => {
            const Icon = cert.icon;
            const isDisabled = cert.status === 'not_held';
            
            return (
              <div key={cert.name} className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                isDisabled 
                  ? 'bg-gray-50 border-gray-100' 
                  : 'bg-white border-gray-200 hover:shadow-md hover:border-blue-300'
              }`}>
                <div className="flex items-center">
                  <Icon className={`mr-3 text-2xl ${
                    cert.color === 'green' ? 'text-green-500' : 
                    cert.color === 'red' ? 'text-red-500' : 
                    'text-gray-400'
                  }`} size={24} />
                  <div>
                    <p className={`font-medium ${isDisabled ? 'text-gray-500' : 'text-gray-900'}`}>{cert.name}</p>
                    <p className={`text-sm ${
                      cert.status === 'expired' ? 'text-red-500' :
                      cert.status === 'not_held' ? 'text-gray-400' :
                      'text-gray-500'
                    }`}>
                      {cert.status === 'not_held' ? 'Not Held' : 
                       cert.extra ? `${cert.extra} | Expires: ${cert.expiry}` : 
                       cert.status === 'expired' ? `Expired: ${cert.expiry}` :
                       `Expires: ${cert.expiry}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className={`${isDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'}`} disabled={isDisabled}>
                    <Eye size={20} />
                  </button>
                  <button className={`${isDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'}`} disabled={isDisabled}>
                    <Download size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Docs & Compliance Tab
  const renderComplianceTab = () => {
    if (showDocumentDetail) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-lg space-y-8">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <button 
                  className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-4"
                  onClick={() => setShowDocumentDetail(false)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back to All Documents
                </button>
                <div className="flex items-center">
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-purple-500 text-white mr-4">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">Contractor_Agreement_v3.pdf</h4>
                    <p className="text-sm text-gray-500">Uploaded by You on 01 Apr 2024</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="text-gray-500 hover:text-blue-600 p-2 rounded-full bg-white border border-gray-300">
                  <Download className="w-4 h-4" />
                </button>
                <button className="text-gray-500 hover:text-gray-700 p-2 rounded-full bg-white border border-gray-300">
                  <Package className="w-4 h-4" />
                </button>
                <button className="text-gray-500 hover:text-red-600 p-2 rounded-full bg-white border border-gray-300">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center text-sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Update Document
                </button>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white p-6 rounded-lg border border-gray-200">
                <h5 className="text-lg font-medium text-gray-800 mb-4">Document Preview</h5>
                <div className="bg-gray-200 h-96 rounded-md flex items-center justify-center">
                  <p className="text-gray-500">Document preview not available.</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h5 className="text-lg font-medium text-gray-800 mb-4">Details</h5>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Status:</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">File Size:</span>
                      <span className="font-medium text-gray-800">2.1 MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Document Type:</span>
                      <span className="font-medium text-gray-800">Contract</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Signed Date:</span>
                      <span className="font-medium text-gray-800">02 Apr 2024</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Expiry Date:</span>
                      <span className="font-medium text-gray-800">31 Mar 2025</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h5 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-gray-500" />
                    Admin Notes
                  </h5>
                  <div className="space-y-4">
                    <textarea 
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
                      placeholder="Add a note for this document..." 
                      rows={3}
                    />
                    <button className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      <Save className="w-4 h-4 mr-2" />
                      Save Note
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded-lg shadow-lg space-y-8">
      {/* Mandatory Documents Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-800 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-gray-500" />
            Mandatory Documents
          </h3>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">Overall Completion</p>
              <p className="text-xs text-gray-500">3 of 4 documents completed</p>
            </div>
            <div className="w-48 bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <span className="text-sm font-semibold text-gray-800">75%</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <label className="text-sm font-medium text-green-700 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Contractor Agreement
            </label>
            <p className="text-base font-semibold text-gray-900 mt-1">Signed</p>
            <p className="text-xs text-gray-500 mt-1">Expiry: 31/03/2025</p>
            <div className="flex items-center space-x-2 mt-2">
              <button className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center">
                <Eye className="w-3 h-3 mr-1" /> View
              </button>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center">
                <Download className="w-3 h-3 mr-1" /> Download
              </button>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center">
                <Upload className="w-3 h-3 mr-1" /> Update Doc
              </button>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <label className="text-sm font-medium text-red-700 flex items-center">
              <XCircle className="w-4 h-4 mr-2" />
              NDA
            </label>
            <p className="text-base font-semibold text-gray-900 mt-1">Rejected</p>
            <p className="text-xs text-gray-500 mt-1">Expired on: 14/03/2024</p>
            <div className="flex items-center space-x-2 mt-2">
              <button className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center">
                <Eye className="w-3 h-3 mr-1" /> View
              </button>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center">
                <Download className="w-3 h-3 mr-1" /> Download
              </button>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center">
                <Upload className="w-3 h-3 mr-1" /> Update Doc
              </button>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <label className="text-sm font-medium text-blue-700 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Travel Insurance
            </label>
            <p className="text-base font-semibold text-gray-900 mt-1">Pending Review</p>
            <p className="text-xs text-gray-500 mt-1">Expiry: 31/12/2028</p>
            <div className="flex items-center space-x-2 mt-2">
              <button className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center">
                <Eye className="w-3 h-3 mr-1" /> View
              </button>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center">
                <Download className="w-3 h-3 mr-1" /> Download
              </button>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center">
                <Upload className="w-3 h-3 mr-1" /> Update Doc
              </button>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <label className="text-sm font-medium text-green-700 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Passport
            </label>
            <p className="text-base font-semibold text-gray-900 mt-1">Approved</p>
            <p className="text-xs text-gray-500 mt-1">Expiry: 01/01/2030</p>
            <div className="flex items-center space-x-2 mt-2">
              <button className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center">
                <Eye className="w-3 h-3 mr-1" /> View
              </button>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center">
                <Download className="w-3 h-3 mr-1" /> Download
              </button>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center">
                <Upload className="w-3 h-3 mr-1" /> Update Doc
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 -mx-6"></div>
      
      {/* All Documents Section */}
      <div className="space-y-4 pt-8">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-800 flex items-center">
            <FolderOpen className="w-5 h-5 mr-2 text-gray-500" />
            All Documents
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-gray-500" />
              <div className="text-sm text-gray-600 text-right whitespace-nowrap">
                <span>25MB / 100MB (25%)</span>
              </div>
            </div>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }}></div>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center text-sm whitespace-nowrap">
              <Upload className="w-4 h-4 mr-2" />
              Upload New
            </button>
          </div>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-64 text-sm" 
                placeholder="Search documents..." 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center text-sm px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50">
              <Settings className="w-4 h-4 mr-2" />
              Type
              <ChevronRight className="w-4 h-4 ml-2 -mr-1" />
            </button>
            <button className="flex items-center text-sm px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50">
              <BarChart3 className="w-4 h-4 mr-2" />
              Sort by: Name (A-Z)
              <ChevronRight className="w-4 h-4 ml-2 -mr-1" />
            </button>
            <label className="flex items-center text-sm text-gray-600">
              <input className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" type="checkbox" />
              <span className="ml-2">Show archived</span>
            </label>
          </div>
          <button className="flex items-center text-sm px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50">
            <Package className="w-4 h-4 mr-2" />
            Download All
          </button>
        </div>
        
        {/* Document List Header */}
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-2 flex items-center">
          <input 
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
          />
          <label className="ml-3 text-sm font-medium text-gray-700 flex-grow">Document Name & Info</label>
          <div className="flex items-center space-x-6 text-sm font-medium text-gray-500">
            <div className="w-32 text-center">Type</div>
            <div className="w-32 text-center">Upload Date</div>
            <div className="w-32 text-center">Expiration</div>
            <div className="w-28 text-center">Status</div>
            <div className="w-40 text-center">Actions</div>
          </div>
        </div>
        
        {/* Document List */}
        <div className="space-y-3 mt-4 overflow-y-auto pr-2" style={{ maxHeight: '40rem' }}>
          {[
            {
              name: 'Contractor_Agreement_v3.pdf',
              subtitle: 'Signed: 02 Apr 2024',
              type: 'Contract',
              uploadDate: '01 Apr 2024',
              expiration: '31 Mar 2025',
              status: 'Approved',
              statusColor: 'bg-green-100 text-green-800',
              icon: 'gavel',
              iconBg: 'bg-purple-500'
            },
            {
              name: 'NDA_Agreement_Signed.pdf',
              subtitle: 'Expired: 14 Mar 2024',
              type: 'Contract',
              uploadDate: '15 Mar 2021',
              expiration: '14 Mar 2024',
              status: 'Expired',
              statusColor: 'bg-red-100 text-red-800',
              icon: 'description',
              iconBg: 'bg-red-500'
            },
            {
              name: 'Travel_Insurance_Policy.pdf',
              subtitle: 'Submitted by: User',
              type: 'Travel',
              uploadDate: '15 Mar 2021',
              expiration: '31 Dec 2028',
              status: 'Pending Review',
              statusColor: 'bg-blue-100 text-blue-800',
              icon: 'flight',
              iconBg: 'bg-blue-500'
            }
          ].map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center flex-grow">
                <input 
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-4" 
                  type="checkbox"
                  checked={selectedDocuments.includes(index)}
                  onChange={() => handleSelectDocument(index)}
                />
                <div className={`w-10 h-10 flex items-center justify-center rounded-lg flex-shrink-0 mr-4 ${doc.iconBg}`}>
                  {doc.icon === 'gavel' && <Scale className="w-5 h-5 text-white" />}
                  {doc.icon === 'description' && <FileText className="w-5 h-5 text-white" />}
                  {doc.icon === 'flight' && <Plane className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{doc.name}</p>
                  <p className="text-sm text-gray-500">{doc.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-sm text-gray-600 w-32 text-center">{doc.type}</div>
                <div className="text-sm text-gray-600 w-32 text-center">{doc.uploadDate}</div>
                <div className={`text-sm w-32 text-center ${doc.status === 'Expired' ? 'text-red-600' : 'text-gray-600'}`}>
                  {doc.expiration}
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-28 justify-center whitespace-nowrap ${doc.statusColor}`}>
                  {doc.status}
                </span>
                <div className="flex items-center space-x-2 text-gray-500 w-40 justify-center">
                  <button 
                    className="hover:text-blue-600"
                    onClick={() => setShowDocumentDetail(true)}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    className="hover:text-blue-600"
                    onClick={() => toast.success('Document downloaded successfully')}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="hover:text-gray-700">
                    <Package className="w-4 h-4" />
                  </button>
                  <button 
                    className="hover:text-red-600"
                    onClick={() => handleDeleteDocument(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this document? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

  // Payments Tab
  const renderPaymentsTab = () => (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Payments</h1>
          <p className="mt-1 text-base text-gray-600">Manage your payment methods, rates, and view your transaction history.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowFinanceQueryModal(true)}
            className="flex items-center gap-2 rounded-md h-10 px-4 text-sm font-semibold text-indigo-600 border border-indigo-600 bg-white hover:bg-indigo-50 transition-colors flex-shrink-0"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Raise Finance Query</span>
          </button>
          <button 
            onClick={() => setShowCreateInvoiceModal(true)}
            className="flex items-center gap-2 rounded-md h-10 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Bank & Invoicing Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-5 border-b border-gray-200 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Bank & Invoicing Details</h2>
          </div>
          <button className="flex items-center gap-2 rounded-md h-9 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex-shrink-0">
            <span>Edit</span>
          </button>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">Bank Name</p>
              <p className="text-sm text-gray-900 font-medium">Global Finance Bank</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">Full Name on Account</p>
              <p className="text-sm text-gray-900 font-medium">John Doe</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">Account Number</p>
              <p className="text-sm text-gray-900 font-medium">•••••••••123</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">Sort Code</p>
              <p className="text-sm text-gray-900 font-medium">12-34-56</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">IBAN</p>
              <p className="text-sm text-gray-900 font-medium">GB29 NWBK 6016 1331 9268 19</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">BIC/SWIFT</p>
              <p className="text-sm text-gray-900 font-medium">NWBKGB2L</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md col-span-1 md:col-span-2">
              <p className="text-sm text-gray-600">Their Address</p>
              <p className="text-sm text-gray-900 font-medium">123 Example Street, London, E1 6AN, United Kingdom</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">Name/Company</p>
              <p className="text-sm text-gray-900 font-medium">Tech Solutions Inc.</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">VAT Number</p>
              <p className="text-sm text-gray-900 font-medium">GB123456789</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">UTR Number</p>
              <p className="text-sm text-gray-900 font-medium">9876543210</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">TIN Number</p>
              <p className="text-sm text-gray-900 font-medium">123-456-789</p>
            </div>
          </div>
          <div className="mt-5 p-3 rounded-md bg-yellow-50 border-l-4 border-yellow-400">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  Please ensure all payment details are accurate. Finance will not be liable for issues resulting from incorrect information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Three Column Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Rates */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Payment Rates</h2>
          </div>
          <div className="p-5">
            <p className="text-xs text-gray-600 mb-4">These are guide rates and are not fixed between projects. All invoices must be checked against the agreed project rates.</p>
            <div className="space-y-2 divide-y divide-gray-100">
              <div className="flex justify-between items-center py-2">
                <p className="text-sm text-gray-600">Day Rate</p>
                <p className="text-sm text-gray-900 font-medium">$500.00</p>
              </div>
              <div className="flex justify-between items-center py-2">
                <p className="text-sm text-gray-600">Travel Day</p>
                <p className="text-sm text-gray-900 font-medium">$250.00</p>
              </div>
              <div className="flex justify-between items-center py-2">
                <p className="text-sm text-gray-600">Manager Rate</p>
                <p className="text-sm text-gray-900 font-medium">$600.00</p>
              </div>
              <div className="flex justify-between items-center py-2">
                <p className="text-sm text-gray-600">Office Rate</p>
                <p className="text-sm text-gray-900 font-medium">$300.00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Earnings Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Earnings Breakdown</h2>
          </div>
          <div className="p-5">
            <div className="relative w-40 h-40 mx-auto">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle className="stroke-current text-gray-200" cx="18" cy="18" fill="none" r="15.9155" strokeWidth="3.8"></circle>
                <circle className="stroke-current text-blue-500" cx="18" cy="18" fill="none" r="15.9155" strokeDasharray="60, 100" strokeDashoffset="0" strokeWidth="3.8"></circle>
                <circle className="stroke-current text-green-500" cx="18" cy="18" fill="none" r="15.9155" strokeDasharray="25, 100" strokeDashoffset="-60" strokeWidth="3.8"></circle>
                <circle className="stroke-current text-red-500" cx="18" cy="18" fill="none" r="15.9155" strokeDasharray="15, 100" strokeDashoffset="-85" strokeWidth="3.8"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">$125k</span>
                <span className="text-xs text-gray-600">Total Earned</span>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
                  <span className="text-sm text-gray-600">Day Rate</span>
                </div>
                <p className="text-sm font-medium text-gray-900">$75,000</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                  <span className="text-sm text-gray-600">Manager Rate</span>
                </div>
                <p className="text-sm font-medium text-gray-900">$31,250</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-red-500"></div>
                  <span className="text-sm text-gray-600">Other</span>
                </div>
                <p className="text-sm font-medium text-gray-900">$18,750</p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Revenue Overview</h2>
          </div>
          <div className="p-5">
            <div className="flex justify-between items-center mb-4">
              <p className="text-2xl font-bold text-gray-900">$45,200.00</p>
              <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>12.5% vs last year</span>
              </div>
            </div>
            <div className="h-32">
              <div className="h-full flex items-end justify-between gap-1">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => {
                  const heights = [60, 80, 50, 70, 90, 65, 40, 55, 35, 45, 25, 50];
                  const isCurrentYear = index < 8;
                  return (
                    <div key={month} className="flex flex-col items-center gap-2 w-full">
                      <div 
                        className={`w-full rounded-t-md ${isCurrentYear ? 'bg-indigo-600' : 'bg-gray-300'}`} 
                        style={{ height: `${heights[index]}%` }}
                      ></div>
                      <p className="text-xs text-gray-600">{month}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-indigo-600"></div>
                  <span>Current Year</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-gray-300"></div>
                  <span>Previous Year</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Payment History</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input 
                className="w-full sm:w-48 pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500" 
                placeholder="Search by project..." 
                type="text"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <button className="flex items-center gap-2 rounded-md h-9 px-4 text-sm font-semibold text-gray-600 border border-gray-300 bg-white hover:bg-gray-50 transition-colors">
              <Settings className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <button 
              onClick={() => setShowFinanceQueryModal(true)}
              className="flex items-center gap-2 rounded-md h-9 px-4 text-sm font-semibold text-indigo-600 border border-indigo-600 bg-white hover:bg-indigo-50 transition-colors flex-shrink-0"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Raise Finance Query</span>
            </button>
            <button 
              onClick={() => setShowCreateInvoiceModal(true)}
              className="flex items-center gap-2 rounded-md h-9 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Invoice</span>
            </button>
          </div>
        </div>
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Invoice Details</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="hidden lg:table-cell px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date Submitted</th>
                  <th className="hidden lg:table-cell px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date Paid</th>
                  <th className="hidden sm:table-cell px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {[
                  { invoice: 'INV-00123', project: 'Project Alpha', amount: '$1,200.00', submitted: 'Aug 1, 2023', paid: 'Aug 15, 2023', status: 'Paid', statusColor: 'bg-blue-50 text-blue-700' },
                  { invoice: 'INV-00124', project: 'Project Beta', amount: '$800.00', submitted: 'Sep 5, 2023', paid: '-', status: 'Due', statusColor: 'bg-yellow-50 text-yellow-700' },
                  { invoice: 'INV-00125', project: 'Project Gamma', amount: '$500.00', submitted: 'Sep 15, 2023', paid: '-', status: 'Overdue', statusColor: 'bg-red-50 text-red-700' }
                ].map((payment, index) => (
                  <tr key={index} className="hover:bg-gray-50 border-b border-gray-200 last:border-b-0 transition-colors duration-150">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.invoice}</div>
                      <div className="text-sm text-gray-600">{payment.project}</div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.amount}</td>
                    <td className="hidden lg:table-cell px-5 py-4 whitespace-nowrap text-sm text-gray-600">{payment.submitted}</td>
                    <td className="hidden lg:table-cell px-5 py-4 whitespace-nowrap text-sm text-gray-600">{payment.paid}</td>
                    <td className="hidden sm:table-cell px-5 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${payment.statusColor}`}>
                        {payment.status === 'Paid' && <CheckCircle className="w-4 h-4 mr-1.5" />}
                        {payment.status === 'Due' && <Clock className="w-4 h-4 mr-1.5" />}
                        {payment.status === 'Overdue' && <AlertCircle className="w-4 h-4 mr-1.5" />}
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1.5 rounded-md h-8 px-3 text-xs font-semibold text-gray-600 border border-gray-300 bg-white hover:bg-gray-50 transition-colors">
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </button>
                        <button className="flex items-center gap-1.5 rounded-md h-8 px-3 text-xs font-semibold text-gray-600 border border-gray-300 bg-white hover:bg-gray-50 transition-colors">
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="p-5 border-t border-gray-200 text-center">
          <a className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors" href="#">
            View All History
          </a>
        </div>
      </div>
    </div>
  );

  // Availability Tab
  const renderAvailabilityTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
      <div className="lg:col-span-3">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Calendar View</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-lg font-medium text-gray-800">May 2024</span>
                  <button className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-800">View Year</button>
              </div>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="grid grid-cols-7 gap-px text-center text-xs font-semibold text-gray-500 border-b border-gray-200">
                <div className="py-2">Mon</div>
                <div className="py-2">Tue</div>
                <div className="py-2">Wed</div>
                <div className="py-2">Thu</div>
                <div className="py-2">Fri</div>
                <div className="py-2">Sat</div>
                <div className="py-2">Sun</div>
              </div>
              <div className="grid grid-cols-7 gap-1 p-1">
                {[
                  { day: 29, status: 'disabled' }, { day: 30, status: 'disabled' }, { day: 1, status: 'available' },
                  { day: 2, status: 'available' }, { day: 3, status: 'available' }, { day: 4, status: 'blackout' },
                  { day: 5, status: 'blackout' }, { day: 6, status: 'booked' }, { day: 7, status: 'booked' },
                  { day: 8, status: 'booked' }, { day: 9, status: 'booked' }, { day: 10, status: 'booked' },
                  { day: 11, status: 'booked' }, { day: 12, status: 'booked' }, { day: 13, status: 'booked' },
                  { day: 14, status: 'booked' }, { day: 15, status: 'today-booked' }, { day: 16, status: 'pencilled' },
                  { day: 17, status: 'pencilled' }, { day: 18, status: 'pencilled' }, { day: 19, status: 'pencilled' },
                  { day: 20, status: 'available' }, { day: 21, status: 'available' }, { day: 22, status: 'available' }
                ].map((date, index) => (
                  <div
                    key={index}
                    className={`aspect-square flex items-center justify-center text-sm cursor-pointer rounded ${
                      date.status === 'disabled' ? 'text-gray-300' :
                      date.status === 'available' ? 'text-gray-700 hover:bg-green-50' :
                      date.status === 'blackout' ? 'bg-red-100 text-red-700' :
                      date.status === 'booked' ? 'bg-blue-100 text-blue-700' :
                      date.status === 'today-booked' ? 'bg-blue-600 text-white' :
                      date.status === 'pencilled' ? 'bg-yellow-100 text-yellow-700' :
                      'text-gray-700'
                    }`}
                  >
                    {date.day}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Performance Tab
  const renderPerformanceTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Performance Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-medium text-gray-500 truncate">Overall Rating</h4>
                <Star className="w-4 h-4 text-gray-400" />
              </div>
              <div className="mt-1 flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">4.2</p>
                <div className="flex items-center text-yellow-400 ml-2">
                  {[...Array(4)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                  <Star className="w-4 h-4 text-gray-300" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-medium text-gray-500 truncate">Events Worked</h4>
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
              <p className="mt-1 text-2xl font-semibold text-gray-900">38</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-medium text-gray-500 truncate">Reliability Score</h4>
                <CheckSquare className="w-4 h-4 text-gray-400" />
              </div>
              <p className="mt-1 text-2xl font-semibold text-gray-900">97%</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-medium text-gray-500 truncate">Last Event Date</h4>
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
              <p className="mt-1 text-xl font-semibold text-gray-900">May 15, 2024</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-medium text-gray-500 truncate">Client Feedback Score</h4>
                <MessageSquare className="w-4 h-4 text-gray-400" />
              </div>
              <p className="mt-1 text-2xl font-semibold text-gray-900">4.5 <span className="text-base font-medium text-gray-500">/ 5</span></p>
            </div>
          </div>
        </div>

        {/* Event History */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Event History</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {[
              { name: 'Geneva Motor Show', dates: '06 May - 15 May 2024', status: 'Completed', statusColor: 'green' },
              { name: 'Mobile World Congress', dates: '26 Feb - 01 Mar 2024', status: 'Completed', statusColor: 'green' },
              { name: 'CES Las Vegas', dates: '09 Jan - 12 Jan 2024', status: 'Completed', statusColor: 'green' },
              { name: 'Web Summit Lisbon', dates: '13 Nov - 16 Nov 2023', status: 'Canceled (by crew)', statusColor: 'red' }
            ].map((event) => (
              <div key={event.name} className="p-4 bg-gray-50 border rounded-lg flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800">{event.name}</p>
                  <p className="text-sm text-gray-500">{event.dates}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 ${
                    event.statusColor === 'green' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {event.status}
                  </span>
                  <a href="#" className="text-sm font-medium text-blue-600 hover:underline block">View Details</a>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button className="text-sm font-medium text-blue-600 hover:text-blue-800">View Full Event History</button>
          </div>
        </div>

        {/* Training History */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Training History</h3>
          <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-3">Training Completed</h4>
            <ul className="space-y-2 list-disc list-inside text-gray-600">
              <li>Health & Safety Level 2 <span className="text-gray-400 text-xs">- Completed Mar 2023</span></li>
              <li>Advanced Rigging Certification <span className="text-gray-400 text-xs">- Completed Jan 2023</span></li>
              <li>Fire Marshal Training <span className="text-gray-400 text-xs">- Completed Jan 2023</span></li>
            </ul>
          </div>
        </div>

        {/* Other History */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Other History</h3>
          <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-3">Equipment Return History</h4>
            <div className="p-4 bg-gray-50 border rounded-lg flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">Comms Kit #12B</p>
                <p className="text-sm text-gray-500">Checked out for Geneva Motor Show</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Returned On Time</span>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-700 mb-3">Awards & Recognition</h4>
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 flex items-center">
              <Trophy className="w-5 h-5 text-yellow-500 mr-3" />
              <p className="text-sm text-yellow-800">Awarded "Team Player of the Event" at Mobile World Congress 2024.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Internal Use Only Sidebar */}
      <div className="space-y-8">
        <div className="bg-red-50 border-l-4 border-red-500 rounded p-4">
          <h3 className="text-lg font-semibold text-red-800 flex items-center mb-6">
            <Lock className="w-5 h-5 mr-2" />
            Internal Use Only
          </h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">Internal Rating</h4>
              <div className="bg-white border rounded-md p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Overall Assessment</span>
                  <div className="flex items-center text-yellow-400">
                    <Star className="w-6 h-6 fill-current" />
                    <Star className="w-6 h-6 fill-current" />
                    <Star className="w-6 h-6 text-gray-300" />
                    <Star className="w-6 h-6 text-gray-300" />
                    <Star className="w-6 h-6 text-gray-300" />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">Based on PM feedback and reliability.</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">Internal Notes</h4>
              <div className="bg-white border rounded-md p-3">
                <p className="text-sm text-gray-600">Marked as a "Do Not Use" by PM Jane Doe on 15 Nov 2023 due to last-minute cancellation for Web Summit. Clearance required from senior management before re-booking.</p>
                <p className="mt-2 text-xs text-gray-400 text-right">- Note added by Admin on 16 Nov 2023</p>
              </div>
              <div className="mt-4">
                <textarea className="w-full border border-gray-300 rounded-md p-2 text-sm" placeholder="Add a new internal note..." rows={3}></textarea>
                <button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg flex items-center text-sm">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Add Note
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">Performance Comments</h4>
              <div className="bg-white border rounded-md p-3">
                <p className="text-sm text-gray-600">While technically proficient, Ava showed some issues with punctuality at CES Las Vegas. Monitor closely on next project.</p>
                <p className="mt-2 text-xs text-gray-400 text-right">- Comment by John Smith (PM) on 20 Jan 2024</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
                <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
                Incident Reports
                <span className="ml-1 bg-red-100 text-red-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">1</span>
              </h4>
              <div className="bg-white border rounded-md p-3">
                <p className="font-semibold text-gray-800">Late Arrival (CES Las Vegas)</p>
                <p className="text-sm text-gray-600">Arrived 45 minutes late on Day 2, citing transport issues. Impacted initial setup schedule.</p>
                <p className="mt-2 text-xs text-gray-400 text-right">Report #INC-4563 - Filed 10 Jan 2024</p>
                <a href="#" className="text-sm font-medium text-blue-600 hover:underline mt-1 inline-block">View Full Report</a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">Rehire Status</h4>
              <div className="flex items-center space-x-4">
                <select className="flex-1 border border-gray-300 rounded-md p-2 text-sm">
                  <option className="text-amber-700" selected>Requires Approval</option>
                  <option className="text-green-700">Approved</option>
                  <option className="text-red-700">Do Not Rehire</option>
                  <option className="text-gray-700">Not Set</option>
                </select>
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-3 rounded-lg text-sm">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Reports Tab
  const renderReportsTab = () => (
    <div className="space-y-8">
      {/* Colleague Locations */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-6">
          <Globe className="w-5 h-5 mr-3 text-gray-500" />
          Colleague Locations
        </h2>
        <div className="aspect-[2/1] bg-gray-200 rounded-lg relative">
          <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop" 
            alt="World map showing colleague locations" 
            className="w-full h-full object-cover rounded-lg"
          />
          {/* Location markers */}
          <div className="absolute top-[25%] left-[20%] text-center">
            <img 
              src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop" 
              alt="Your location" 
              className="w-10 h-10 rounded-full border-2 border-blue-500"
            />
            <p className="text-xs font-semibold text-blue-800 bg-white/70 px-1.5 py-0.5 rounded-md mt-1">You</p>
          </div>
          <div className="absolute top-[35%] left-[15%] text-center">
            <img 
              src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop" 
              alt="Manager location" 
              className="w-10 h-10 rounded-full border-2 border-purple-500"
            />
            <p className="text-xs font-semibold text-purple-800 bg-white/70 px-1.5 py-0.5 rounded-md mt-1">Line Manager</p>
          </div>
          <div className="absolute top-[50%] left-[60%] text-center">
            <img 
              src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop" 
              alt="Reportee location" 
              className="w-10 h-10 rounded-full border-2 border-green-500"
            />
            <p className="text-xs font-semibold text-green-800 bg-white/70 px-1.5 py-0.5 rounded-md mt-1">Reportee</p>
          </div>
          <div className="absolute top-[65%] left-[75%] text-center">
            <img 
              src="https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop" 
              alt="Another reportee location" 
              className="w-10 h-10 rounded-full border-2 border-green-500"
            />
            <p className="text-xs font-semibold text-green-800 bg-white/70 px-1.5 py-0.5 rounded-md mt-1">Reportee</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Line Manager */}
        <div className="md:col-span-1 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-6">
            <Users className="w-5 h-5 mr-3 text-gray-500" />
            Line Manager
          </h2>
          <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg mb-4 cursor-pointer hover:bg-gray-50">
            <img 
              src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=48&h=48&fit=crop" 
              alt="John Doe" 
              className="w-12 h-12 rounded-full"
            />
            <div>
              <p className="font-semibold text-gray-900">John Doe</p>
              <p className="text-sm text-gray-500">Project Manager</p>
            </div>
          </div>
          <div className="text-sm text-gray-600 space-y-2">
            <p><span className="font-medium text-gray-800">Email:</span> john.doe@example.com</p>
            <p><span className="font-medium text-gray-800">Contact:</span> +1 111 222 3333</p>
            <p><span className="font-medium text-gray-800">Location:</span> London, UK, Europe</p>
          </div>
        </div>

        {/* Reportees */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Users className="w-5 h-5 mr-3 text-gray-500" />
              Reportees
            </h2>
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50">
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50">
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="flex space-x-4 overflow-x-auto">
            {[
              { 
                name: 'Jane Smith', 
                role: 'Software Engineer', 
                email: 'jane.smith@example.com', 
                phone: '+1 234 567 890', 
                location: 'San Francisco, USA, America',
                image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=48&h=48&fit=crop'
              },
              { 
                name: 'Mike Johnson', 
                role: 'UX Designer', 
                email: 'mike.johnson@example.com', 
                phone: '+1 987 654 321', 
                location: 'New York, USA, America',
                image: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=48&h=48&fit=crop'
              },
              { 
                name: 'Emily White', 
                role: 'QA Tester', 
                email: 'emily.white@example.com', 
                phone: '+1 555 123 456', 
                location: 'Austin, USA, America',
                image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=48&h=48&fit=crop'
              }
            ].map((person) => (
              <div key={person.name} className="flex-shrink-0 w-[300px] p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-4 mb-3">
                  <img 
                    src={person.image} 
                    alt={person.name} 
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{person.name}</p>
                    <p className="text-sm text-gray-500">{person.role}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium text-gray-800">Email:</span> {person.email}</p>
                  <p><span className="font-medium text-gray-800">Contact:</span> {person.phone}</p>
                  <p><span className="font-medium text-gray-800">Location:</span> {person.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Preferences Tab
  const renderPreferencesTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">Preferences</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="travel">Willingness to Travel</label>
            <select className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" id="travel">
              <option>Willing to travel nationally</option>
              <option>Willing to travel internationally</option>
              <option>Only local events</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="event-type">Preferred Event Type</label>
            <select className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" id="event-type">
              <option>No Preference</option>
              <option>Corporate Events</option>
              <option>Music Festivals</option>
              <option>Trade Shows & Exhibitions</option>
              <option>Sporting Events</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="role-type">Preferred Role Type</label>
            <select className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" id="role-type">
              <option>No Preference</option>
              <option>Technical (e.g. AV, Lighting)</option>
              <option>Logistics & Build</option>
              <option>Management</option>
            </select>
          </div>
          
          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Other Preferences</label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Willing to work unsociable hours</span>
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only" defaultChecked />
                  <div className="relative inline-flex items-center h-6 rounded-full w-11 bg-blue-600">
                    <span className="inline-block w-4 h-4 transform bg-white rounded-full transition translate-x-6"></span>
                  </div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Interested in Team Leader roles</span>
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only" defaultChecked />
                  <div className="relative inline-flex items-center h-6 rounded-full w-11 bg-blue-600">
                    <span className="inline-block w-4 h-4 transform bg-white rounded-full transition translate-x-6"></span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">Other Information</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Communication Preferences</label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input 
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded" 
                  id="email-comms" 
                  name="comms" 
                  type="checkbox" 
                  defaultChecked
                />
                <label className="ml-2 block text-sm text-gray-900" htmlFor="email-comms">
                  Email Job Alerts
                </label>
              </div>
              <div className="flex items-center">
                <input 
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded" 
                  id="sms-comms" 
                  name="comms" 
                  type="checkbox"
                />
                <label className="ml-2 block text-sm text-gray-900" htmlFor="sms-comms">
                  SMS Notifications for urgent updates
                </label>
              </div>
              <div className="flex items-center">
                <input 
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded" 
                  id="newsletter-comms" 
                  name="comms" 
                  type="checkbox" 
                  defaultChecked
                />
                <label className="ml-2 block text-sm text-gray-900" htmlFor="newsletter-comms">
                  Receive Company Newsletter
                </label>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notes">General Notes (Visible to Crew Member)</label>
            <textarea 
              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" 
              id="notes" 
              placeholder="e.g., specific dietary requirements, other skills not listed, etc." 
              rows={4}
              defaultValue="Allergic to nuts. Also have experience in basic carpentry."
            />
          </div>
          
          <div className="pt-2">
            <h4 className="text-base font-medium text-gray-800 mb-2">Account Management</h4>
            <div className="space-y-3">
              <button className="w-full text-left text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center">
                <Key className="w-4 h-4 mr-2" />
                Send Password Reset Link
              </button>
              <button className="w-full text-left text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center">
                <UserCog className="w-4 h-4 mr-2" />
                View Login History
              </button>
              <button className="w-full text-left text-sm font-medium text-red-600 hover:text-red-800 flex items-center">
                <UserX className="w-4 h-4 mr-2" />
                Deactivate Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal': return renderPersonalTab();
      case 'work': return renderWorkTab();
      case 'compliance': return renderComplianceTab();
      case 'payments': return renderPaymentsTab();
      case 'availability': return renderAvailabilityTab();
      case 'performance': return renderPerformanceTab();
      case 'reports': return renderReportsTab();
      case 'preferences': return renderPreferencesTab();
      default: return renderPersonalTab();
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinanceQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFinanceQueryError(false);

    if (!financeQueryForm.subject || !financeQueryForm.description) {
      setFinanceQueryError(true);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Finance query submitted successfully!');
      setShowFinanceQueryModal(false);
      setFinanceQueryForm({ subject: '', invoice: '', description: '', attachment: null });
    } catch (error) {
      setFinanceQueryError(true);
      toast.error('Failed to submit query');
    }
  };

  const handleFinanceQueryFormChange = (field: keyof typeof financeQueryForm, value: string | File | null) => {
    setFinanceQueryForm(prev => ({ ...prev, [field]: value }));
    if (financeQueryError) {
      setFinanceQueryError(false);
    }
  };

  const handleFinanceQueryCancel = () => {
    setShowFinanceQueryModal(false);
    setFinanceQueryForm({ subject: '', invoice: '', description: '', attachment: null });
    setFinanceQueryError(false);
  };

  // Set default due date (30 days from today)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.setDate(today.getDate() + 30));
    setCreateInvoiceForm(prev => ({
      ...prev,
      dueDate: thirtyDaysFromNow.toISOString().split('T')[0]
    }));
  }, []);

  const calculateItemAmount = (quantity: number, rate: string) => {
    const numRate = parseFloat(rate.replace(/[£$,]/g, '')) || 0;
    return quantity * numRate;
  };

  const calculateTotals = () => {
    const subtotal = createInvoiceForm.items.reduce((sum, item) => sum + item.amount, 0);
    const vat = createInvoiceForm.vatEnabled ? subtotal * (createInvoiceForm.vatRate / 100) : 0;
    const total = subtotal + vat;
    return { subtotal, vat, total };
  };

  const handleCreateInvoiceFormChange = (field: keyof typeof createInvoiceForm, value: any) => {
    setCreateInvoiceForm(prev => ({ ...prev, [field]: value }));
    if (createInvoiceError) {
      setCreateInvoiceError(false);
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setCreateInvoiceForm(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // Recalculate amount if quantity or rate changed
      if (field === 'quantity' || field === 'rate') {
        newItems[index].amount = calculateItemAmount(newItems[index].quantity, newItems[index].rate);
      }
      
      return { ...prev, items: newItems };
    });
  };

  const addInvoiceItem = () => {
    setCreateInvoiceForm(prev => ({
      ...prev,
      items: [...prev.items, {
        description: '',
        details: '',
        category: 'Fee',
        subCategory: '',
        quantity: 1,
        rate: '0.00',
        amount: 0
      }]
    }));
  };

  const removeInvoiceItem = (index: number) => {
    setCreateInvoiceForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const duplicateInvoiceItem = (index: number) => {
    setCreateInvoiceForm(prev => ({
      ...prev,
      items: [...prev.items, { ...prev.items[index] }]
    }));
  };

  const validateInvoice = (isDraft = false) => {
    if (isDraft) return true;

    if (!createInvoiceForm.invoiceNumber || !createInvoiceForm.dueDate || !createInvoiceForm.project) {
      return false;
    }

    return createInvoiceForm.items.every(item => 
      item.description.trim() && item.quantity > 0 && parseFloat(item.rate.replace(/[£$,]/g, '')) > 0
    );
  };

  const handleCreateInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateInvoiceError(false);

    if (!validateInvoice()) {
      setCreateInvoiceError(true);
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmSend = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Invoice sent successfully!');
      setShowConfirmDialog(false);
      setShowCreateInvoiceModal(false);
      // Reset form or update UI as needed
    } catch (error) {
      toast.error('Failed to send invoice');
      setCreateInvoiceError(true);
    }
  };

  const handleSaveDraft = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Invoice saved as draft');
      setShowCreateInvoiceModal(false);
    } catch (error) {
      toast.error('Failed to save draft');
    }
  };

  const handleCreateInvoiceCancel = () => {
    setShowCreateInvoiceModal(false);
    setCreateInvoiceError(false);
    setShowConfirmDialog(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={onBack} 
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back to Settings
              </button>
              <div className="flex items-center space-x-4">
                <img 
                  src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop"
                  alt="Profile"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Ava Harper</h1>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-yellow-400">
                      {[...Array(4)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                      <Star className="w-4 h-4 text-gray-300" />
                    </div>
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                    <span className="text-sm bg-amber-100 text-amber-800 px-2 py-1 rounded-full flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Issues
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
              <span className="text-gray-300">|</span>
              <button className="text-blue-600 hover:text-blue-800 text-sm">Message</button>
              <span className="text-gray-300">|</span>
              <button className="text-blue-600 hover:text-blue-800 text-sm">Assign to Project</button>
              <button 
                onClick={handleSave}
                disabled={isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center text-sm hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </button>
              <span className="text-sm text-gray-500 italic">Auto-save on</span>
            </div>
          </div>
          
          {/* Profile Completeness Bar */}
          <div className="pb-4">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <p className="text-xs text-right text-gray-500 mt-1">Profile Completeness: 75%</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                  {tab.badge && (
                    <span className="ml-2 bg-red-100 text-red-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>

      {/* Finance Query Modal */}
      {showFinanceQueryModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleFinanceQueryCancel}></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
              <div className="bg-white">
                <div className="border-b border-gray-200 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold leading-tight text-gray-900">Contact Finance Team</h2>
                      <p className="mt-1 text-sm text-gray-600">Raise a query about payments or specific invoices.</p>
                    </div>
                    <button
                      onClick={handleFinanceQueryCancel}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                
                <form onSubmit={handleFinanceQuerySubmit} className="p-6">
                  {financeQueryError && (
                    <div className="rounded-md border border-red-300 bg-red-50 p-4 mb-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <XCircle className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">Submission Failed</h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>There was an error submitting your query. Please check the fields and try again.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-900">Subject</label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        value={financeQueryForm.subject}
                        onChange={(e) => handleFinanceQueryFormChange('subject', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option disabled value="">Select a subject</option>
                        <option value="Payment Issue">Payment Issue</option>
                        <option value="Invoice Query">Invoice Query</option>
                        <option value="General Inquiry">General Inquiry</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="invoice" className="block text-sm font-medium text-gray-900">Invoice (if applicable)</label>
                      <select
                        id="invoice"
                        name="invoice"
                        value={financeQueryForm.invoice}
                        onChange={(e) => handleFinanceQueryFormChange('invoice', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="">Select an invoice</option>
                        <option value="INV-00123">INV-00123</option>
                        <option value="INV-00124">INV-00124</option>
                        <option value="INV-00125">INV-00125</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-900">Description</label>
                      <div className="mt-1">
                        <textarea
                          id="description"
                          name="description"
                          required
                          rows={4}
                          value={financeQueryForm.description}
                          onChange={(e) => handleFinanceQueryFormChange('description', e.target.value)}
                          placeholder="Please describe your issue in detail."
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="attachment" className="block text-sm font-medium text-gray-900">Attachment (optional)</label>
                      <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                        <div className="space-y-1 text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500"
                            >
                              <span>Upload a file</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                accept=".png,.jpg,.jpeg,.pdf"
                                className="sr-only"
                                onChange={(e) => handleFinanceQueryFormChange('attachment', e.target.files?.[0] || null)}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                          {financeQueryForm.attachment && (
                            <p className="text-sm text-gray-900 font-medium">{financeQueryForm.attachment.name}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6">
                    <button
                      type="button"
                      onClick={handleFinanceQueryCancel}
                      className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Submit Query
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreateInvoiceModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" 
          style={{ zIndex: 9999 }}
          onClick={handleCreateInvoiceCancel}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Plus className="text-blue-600 mr-2" />
                Create New Invoice
              </h2>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 rounded-lg bg-gray-100 p-0.5">
                  <button className="px-2 py-1 rounded-md text-sm font-medium text-gray-700 bg-white shadow-sm">
                    <Edit className="w-4 h-4 inline mr-1" />
                    Edit
                  </button>
                  <button className="px-2 py-1 rounded-md text-sm font-medium text-gray-500 hover:bg-gray-200">
                    <Eye className="w-4 h-4 inline mr-1" />
                    Preview
                  </button>
                </div>
                <div className="relative">
                  <button className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={handleCreateInvoiceCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateInvoiceSubmit} className="flex flex-col flex-grow min-h-0">
              <div className="flex-grow overflow-y-auto p-6 space-y-6">
                {createInvoiceError && (
                  <div className="rounded-md border border-red-300 bg-red-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <XCircle className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Validation Error</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>Please fill in all required fields and ensure line items are complete.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Invoice Header */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="font-semibold text-gray-800">Ava Harper Ltd</p>
                    <p className="text-sm text-gray-500">123 Tech Avenue, Silicon Roundabout, London, EC1Y 1AB, UK</p>
                    <p className="text-sm text-gray-500">VAT: GB 123 4567 89</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-3xl font-bold text-gray-400 uppercase">INVOICE</h2>
                    <div className="mt-1">
                      <input 
                        className="border border-gray-300 rounded-md px-3 py-1 text-right text-sm font-semibold"
                        type="text"
                        value={createInvoiceForm.invoiceNumber}
                        onChange={(e) => handleCreateInvoiceFormChange('invoiceNumber', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Bill To and Invoice Details */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Bill To:</p>
                    <p className="font-semibold text-gray-800">IntraCasfid Solutions</p>
                    <p className="text-sm text-gray-500">456 Corporate Blvd, Business District, London, EC2Y 8AE, UK</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Invoice Date:</label>
                      <input 
                        type="date"
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm w-48"
                        value={createInvoiceForm.invoiceDate}
                        onChange={(e) => handleCreateInvoiceFormChange('invoiceDate', e.target.value)}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Due Date:</label>
                      <input 
                        type="date"
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm w-48"
                        value={createInvoiceForm.dueDate}
                        onChange={(e) => handleCreateInvoiceFormChange('dueDate', e.target.value)}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">PO Number:</label>
                      <input 
                        type="text"
                        placeholder="Optional"
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm w-48"
                        value={createInvoiceForm.poNumber}
                        onChange={(e) => handleCreateInvoiceFormChange('poNumber', e.target.value)}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Currency:</label>
                      <select 
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm w-48"
                        value={createInvoiceForm.currency}
                        onChange={(e) => handleCreateInvoiceFormChange('currency', e.target.value)}
                      >
                        <option value="GBP">GBP (£)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Project Selection */}
                <div>
                  <select 
                    className="border border-gray-300 rounded-md px-3 py-2 w-full"
                    value={createInvoiceForm.project}
                    onChange={(e) => handleCreateInvoiceFormChange('project', e.target.value)}
                  >
                    <option value="">Select a project to invoice...</option>
                    <option value="geneva">Geneva Motor Show - Crew</option>
                    <option value="dubai">Expo 2024 Dubai - Site Manager</option>
                    <option value="ces">CES Las Vegas - Technician</option>
                  </select>
                </div>

                {/* Invoice Items Table */}
                <div className="overflow-x-auto rounded-lg">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 w-[30%]">Description</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 w-[20%]">Category</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 w-[15%]">Quantity</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 w-[15%]">Rate</th>
                        <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 w-[15%]">Amount</th>
                        <th className="pb-2 w-[10%]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {createInvoiceForm.items.map((item, index) => (
                        <tr key={index} className="border-b border-gray-200 group">
                          <td className="py-2 pr-2">
                            <input 
                              className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                              type="text"
                              placeholder="Enter item description"
                              value={item.description}
                              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            />
                            <input 
                              className="border border-gray-300 rounded px-2 py-1 w-full text-xs text-gray-400 mt-1"
                              type="text"
                              placeholder="Add details (e.g. dates worked)"
                              value={item.details}
                              onChange={(e) => handleItemChange(index, 'details', e.target.value)}
                            />
                          </td>
                          <td className="py-2 px-2">
                            <div className="space-y-1">
                              <select 
                                className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                                value={item.category}
                                onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                              >
                                <option value="Fee">Fee</option>
                                <option value="Expense">Expense</option>
                              </select>
                              {item.category === 'Expense' && (
                                <select 
                                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                                  value={item.subCategory}
                                  onChange={(e) => handleItemChange(index, 'subCategory', e.target.value)}
                                >
                                  <option value="">Select category...</option>
                                  <option value="Accommodation">Accommodation</option>
                                  <option value="Travel">Travel</option>
                                  <option value="Subsistence">Subsistence</option>
                                  <option value="Materials">Materials</option>
                                  <option value="Other">Other</option>
                                </select>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-2">
                            <input 
                              className="border border-gray-300 rounded px-2 py-1 w-20 text-center text-sm"
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input 
                              className="border border-gray-300 rounded px-2 py-1 w-24 text-sm"
                              type="text"
                              value={`£${item.rate}`}
                              onChange={(e) => handleItemChange(index, 'rate', e.target.value.replace('£', ''))}
                            />
                          </td>
                          <td className="py-2 pl-2 text-right font-medium text-gray-900 text-sm">
                            £{item.amount.toFixed(2)}
                          </td>
                          <td className="py-2 pl-2 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button 
                                type="button"
                                className="text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => duplicateInvoiceItem(index)}
                                title="Duplicate Row"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button 
                                type="button"
                                className="text-gray-400 hover:text-red-500"
                                onClick={() => removeInvoiceItem(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-300">
                        <td className="pt-4" colSpan={4}></td>
                        <td className="pt-4 text-right text-sm text-gray-500 font-medium">Subtotal</td>
                        <td className="pt-4 text-right font-bold text-gray-900">
                          £{calculateTotals().subtotal.toFixed(2)}
                        </td>
                      </tr>
                      {createInvoiceForm.vatEnabled && (
                        <tr>
                          <td colSpan={4}></td>
                          <td className="py-1 text-right text-sm text-gray-500 font-medium flex items-center justify-end">
                            <button 
                              type="button"
                              className="text-gray-400 hover:text-red-500 mr-2 p-0.5"
                              onClick={() => handleCreateInvoiceFormChange('vatEnabled', false)}
                              title="Remove VAT"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <span>VAT</span>
                            <input 
                              className="border border-gray-300 rounded text-sm w-14 text-center p-1 ml-1"
                              type="number"
                              value={createInvoiceForm.vatRate}
                              onChange={(e) => handleCreateInvoiceFormChange('vatRate', parseInt(e.target.value) || 20)}
                            />
                            <span>%</span>
                          </td>
                          <td className="py-1 text-right font-bold text-gray-900">
                            £{calculateTotals().vat.toFixed(2)}
                          </td>
                        </tr>
                      )}
                      {!createInvoiceForm.vatEnabled && (
                        <tr>
                          <td className="py-1 text-right" colSpan={5}>
                            <button 
                              type="button"
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center justify-end w-full"
                              onClick={() => handleCreateInvoiceFormChange('vatEnabled', true)}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add VAT
                            </button>
                          </td>
                          <td></td>
                        </tr>
                      )}
                      <tr className="border-t border-gray-200">
                        <td colSpan={4}></td>
                        <td className="pt-2 text-right text-lg font-bold text-gray-900">Total</td>
                        <td className="pt-2 text-right text-lg font-bold text-blue-600">
                          £{calculateTotals().total.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <button 
                  type="button"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
                  onClick={addInvoiceItem}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Line Item
                </button>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                <button 
                  type="button"
                  className="text-sm font-medium text-gray-600 hover:text-gray-800 flex items-center"
                >
                  <Paperclip className="w-4 h-4 mr-1" />
                  Attach Expense Receipts
                </button>
                <div className="flex items-center space-x-3">
                  <button 
                    type="button"
                    onClick={handleSaveDraft}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save as Draft
                  </button>
                  <button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Invoice
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ zIndex: 10000 }}>
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 transition-opacity bg-gray-600 bg-opacity-75"></div>
            
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md z-10">
              <div className="p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <Send className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="mt-5 text-lg font-medium leading-6 text-gray-900">
                  Send Invoice Confirmation
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    You are about to send invoice <strong>{createInvoiceForm.invoiceNumber}</strong> for{' '}
                    <strong>£{calculateTotals().total.toFixed(2)}</strong> to IntraCasfid Solutions.
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Please confirm you want to proceed. This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                <button
                  type="button"
                  onClick={handleConfirmSend}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Confirm & Send
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmDialog(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}