import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  AlertCircle, AlertTriangle, Award, BarChart3, Briefcase, Building, 
  Calendar, CalendarDays, Car, CheckCircle, CheckSquare, ChevronLeft, 
  ChevronRight, Clock, CreditCard, DollarSign, Download, Edit, Eye, 
  EyeOff, FileText, FolderOpen, Globe, Heart, Key, Lock, Luggage, 
  Mail, MessageCircle, MessageSquare, Mountain, Package, Phone, Plane, 
  Plus, Receipt, Save, Scale, Send, Settings, Shield, ShieldCheck, 
  Star, Trash2, TrendingUp, Trophy, Truck, Upload, User, UserCog, 
  UserX, Users, Wrench, X, XCircle, Zap
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

  const tabs = [
    { id: 'personal', label: 'Personal Details', icon: User },
    { id: 'work', label: 'Work & Skills', icon: Briefcase },
    { id: 'compliance', label: 'Compliance', icon: Shield, badge: 2 },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'availability', label: 'Availability', icon: Calendar },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'preferences', label: 'Preferences', icon: Settings }
  ];

  // Personal Details Tab
  const renderPersonalTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">Personal Information</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input type="text" defaultValue="Ava" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input type="text" defaultValue="Harper" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" defaultValue="ava.harper@casfid.com" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" defaultValue="+44 7700 900123" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input type="date" defaultValue="1992-08-15" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea defaultValue="123 Main Street, London, SW1A 1AA, United Kingdom" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" rows={3} />
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Emergency Contact */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">Emergency Contact</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
              <input type="text" defaultValue="Sarah Harper" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option>Sister</option>
                <option>Parent</option>
                <option>Spouse</option>
                <option>Friend</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" defaultValue="+44 7700 900456" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">Medical Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
              <input type="text" defaultValue="Nuts, Shellfish" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medical Conditions</label>
              <textarea defaultValue="None declared" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" rows={2} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medications</label>
              <textarea defaultValue="EpiPen (for nut allergy)" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" rows={2} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Work & Skills Tab
  const renderWorkTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        {/* Experience */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Experience</h3>
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-900">Senior Event Technician</h4>
              <p className="text-sm text-gray-600">CASFID International • 2022 - Present</p>
              <p className="text-sm text-gray-700 mt-2">Lead technical setup for major events including CES, Mobile World Congress, and Geneva Motor Show. Responsible for equipment deployment and team coordination.</p>
            </div>
            <div className="border-l-4 border-gray-300 pl-4">
              <h4 className="font-semibold text-gray-900">Event Technician</h4>
              <p className="text-sm text-gray-600">EventTech Solutions • 2020 - 2022</p>
              <p className="text-sm text-gray-700 mt-2">Provided technical support for corporate events and trade shows across Europe.</p>
            </div>
          </div>
        </div>

        {/* Skills Matrix */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Skills Matrix</h3>
          <div className="space-y-4">
            {[
              { skill: 'Audio/Visual Setup', level: 4 },
              { skill: 'Network Configuration', level: 5 },
              { skill: 'Equipment Troubleshooting', level: 4 },
              { skill: 'Team Leadership', level: 3 },
              { skill: 'Project Management', level: 3 },
              { skill: 'Client Communication', level: 4 }
            ].map((item) => (
              <div key={item.skill} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{item.skill}</span>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`w-3 h-3 rounded-full ${
                        level <= item.level ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-500">{item.level}/5</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="space-y-8">
        {/* Certifications */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Certifications</h3>
          <div className="space-y-4">
            {[
              { name: 'Health & Safety Level 2', status: 'Valid', expiry: '2025-03-15', color: 'green' },
              { name: 'Advanced Rigging', status: 'Valid', expiry: '2024-12-20', color: 'green' },
              { name: 'Fire Marshal Training', status: 'Expired', expiry: '2023-11-10', color: 'red' }
            ].map((cert) => (
              <div key={cert.name} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-900">{cert.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    cert.color === 'green' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {cert.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Expires: {cert.expiry}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Languages</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">English</span>
              <span className="text-sm text-gray-500">Native</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Spanish</span>
              <span className="text-sm text-gray-500">Conversational</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">French</span>
              <span className="text-sm text-gray-500">Basic</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Compliance Tab
  const renderComplianceTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-8">
        {/* Document Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Document Status</h3>
          <div className="space-y-4">
            {[
              { name: 'Passport', status: 'Valid', expiry: '2028-06-15', color: 'green' },
              { name: 'Work Visa (EU)', status: 'Valid', expiry: '2025-12-31', color: 'green' },
              { name: 'DBS Check', status: 'Expired', expiry: '2023-09-20', color: 'red' },
              { name: 'Insurance Certificate', status: 'Valid', expiry: '2024-11-30', color: 'green' }
            ].map((doc) => (
              <div key={doc.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{doc.name}</h4>
                  <p className="text-sm text-gray-500">Expires: {doc.expiry}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    doc.color === 'green' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {doc.status}
                  </span>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* File Management */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">File Management</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Drag and drop files here or click to browse</p>
            <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
              Upload Documents
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Travel Documents */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Travel Documents</h3>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-green-900">UK Passport</h4>
                  <p className="text-sm text-green-700">Valid until June 2028</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-red-900">US Work Visa</h4>
                  <p className="text-sm text-red-700">Expired - Renewal required</p>
                </div>
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Issues */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-red-600 mb-6 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Compliance Issues (2)
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-900">DBS Check Expired</h4>
              <p className="text-sm text-red-700">Required for UK events. Please renew immediately.</p>
              <button className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm">
                Renew Now
              </button>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="font-medium text-amber-900">Insurance Expiring Soon</h4>
              <p className="text-sm text-amber-700">Expires in 3 months. Consider renewal.</p>
              <button className="mt-2 bg-amber-600 text-white px-3 py-1 rounded text-sm">
                Schedule Renewal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Payments Tab
  const renderPaymentsTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-8">
        {/* Rate Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Rate Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day Rate</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
                  <input type="text" defaultValue="350" className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
                  <input type="text" defaultValue="45" className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 text-sm" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option>GBP (£)</option>
                <option>EUR (€)</option>
                <option>USD ($)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Banking Details */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Banking Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <input type="text" defaultValue="Barclays Bank" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Code</label>
                <input type="text" defaultValue="20-00-00" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input type="text" defaultValue="12345678" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
              <input type="text" defaultValue="Ava Harper" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Payment History */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Recent Payments</h3>
          <div className="space-y-3">
            {[
              { event: 'Geneva Motor Show', amount: '£1,750', date: '2024-05-20', status: 'Paid' },
              { event: 'Mobile World Congress', amount: '£1,400', date: '2024-03-10', status: 'Paid' },
              { event: 'CES Las Vegas', amount: '£2,100', date: '2024-01-25', status: 'Pending' }
            ].map((payment) => (
              <div key={payment.event} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{payment.event}</p>
                  <p className="text-sm text-gray-500">{payment.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{payment.amount}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    payment.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tax Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Tax Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Status</label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option>PAYE Employee</option>
                <option>Self-Employed</option>
                <option>Contractor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">National Insurance Number</label>
              <input type="text" defaultValue="AB123456C" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">UTR Number</label>
              <input type="text" defaultValue="1234567890" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
          </div>
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
    </div>
  );
}