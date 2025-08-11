import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, FileText, Download, Edit, X, Save, ArrowLeft, Search, CheckCircle, XCircle, ArrowDown, FileIcon } from 'lucide-react';
import { Project, Client } from '../../types';
import { PhaseTracker } from './PhaseTracker';
import { ProjectMetadata } from './ProjectMetadata';
import { DocumentManager } from './DocumentManager';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const projectSchema = z.object({
  project_id: z.string().min(1, 'Project ID is required'),
  client_id: z.string().min(1, 'Client selection is required'),
  event_location: z.string().min(1, 'Event location (City, Country) is required'),
  event_start_date: z.string().min(1, 'Start date is required'),
  event_end_date: z.string().min(1, 'End date is required'),
  expected_attendance: z.number().min(1, 'Expected attendance must be greater than 0'),
  event_type: z.enum(['Conference', 'Festival', 'Exhibition', 'Sports', 'Corporate', 'Other']),
  // Additional metadata fields
  onsite_start_date: z.string().optional(),
  onsite_end_date: z.string().optional(),
  show_start_date: z.string().optional(),
  show_end_date: z.string().optional(),
  voucher_sale_start: z.string().optional(),
  voucher_sale_end: z.string().optional(),
  topup_start: z.string().optional(),
  topup_end: z.string().optional(),
  refund_window_start: z.string().optional(),
  refund_window_end: z.string().optional(),
  delivery_address: z.string().optional(),
  delivery_contact_name: z.string().optional(),
  delivery_contact_phone: z.string().optional(),
  delivery_contact_email: z.string().optional(),
  wristband_order_deadline: z.string().optional(),
  load_in_date: z.string().optional(),
  load_out_date: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface CoreInfoPageProps {
  project: Project;
}

const mockClients: Client[] = [
  { id: '1', name: 'John Smith', company: 'Tech Corp', email: 'john@techcorp.com', phone: '+1-555-0123', classification: 'Canopy', created_at: '', updated_at: '' },
  { id: '2', name: 'Sarah Johnson', company: 'Event Solutions', email: 'sarah@eventsolutions.com', phone: '+1-555-0124', classification: 'Direct', created_at: '', updated_at: '' },
  { id: '3', name: 'Mike Davis', company: 'Festival Group', email: 'mike@festivalgroup.com', phone: '+1-555-0125', classification: 'Partner', created_at: '', updated_at: '' }
];

// Classification definitions for tooltips
const eventClassificationDefinitions = {
  'Canopy': 'Premium tier clients with comprehensive service packages and priority support',
  'Direct': 'Direct clients working exclusively with CASFID without intermediaries',
  'Partner': 'Strategic partner organizations with collaborative service agreements',
  'Vendor': 'Vendor relationships for specialized services and equipment provision'
};

export function CoreInfoPage({ project }: CoreInfoPageProps) {
  const [activeDocumentTab, setActiveDocumentTab] = useState<'proposal' | 'contract' | 'custom'>('proposal');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [onlineVouchers, setOnlineVouchers] = useState(true);
  const [onlineTopups, setOnlineTopups] = useState(false);
  const [refundWindow, setRefundWindow] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      project_id: project.project_id,
      client_id: project.client_id,
      event_location: project.event_location,
      event_start_date: project.event_start_date,
      event_end_date: project.event_end_date,
      expected_attendance: project.expected_attendance,
      event_type: project.event_type,
      // Additional metadata fields
      onsite_start_date: project.onsite_start_date || '',
      onsite_end_date: project.onsite_end_date || '',
      show_start_date: project.show_start_date || '',
      show_end_date: project.show_end_date || '',
      voucher_sale_start: project.voucher_sale_start || '',
      voucher_sale_end: project.voucher_sale_end || '',
      topup_start: project.topup_start || '',
      topup_end: project.topup_end || '',
      refund_window_start: project.refund_window_start || '',
      refund_window_end: project.refund_window_end || '',
      delivery_address: project.delivery_address || '',
      delivery_contact_name: project.delivery_contact_name || '',
      delivery_contact_phone: project.delivery_contact_phone || '',
      delivery_contact_email: project.delivery_contact_email || '',
      wristband_order_deadline: project.wristband_order_deadline || '',
      load_in_date: project.load_in_date || '',
      load_out_date: project.load_out_date || '',
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    console.log('Updating project:', data);
    toast.success('Project updated successfully!');
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      toast.success(`${newFiles.length} file(s) uploaded successfully`);
    }
  };

  const documentTemplates = [
    { id: '1', name: 'Standard Event Proposal', description: 'Template for general events' },
    { id: '2', name: 'Conference Proposal', description: 'Template for conference events' },
    { id: '3', name: 'Exhibition Proposal', description: 'Template for exhibition events' },
  ];

  // Toggle Switch Component
  const ToggleSwitch = ({ checked, onChange, id }: { checked: boolean; onChange: (checked: boolean) => void; id: string }) => (
    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <label
        htmlFor={id}
        className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ${
          checked ? 'bg-indigo-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`block w-6 h-6 rounded-full bg-white border-4 transition-transform duration-200 ease-in-out transform ${
            checked ? 'translate-x-4 border-indigo-600' : 'translate-x-0 border-gray-300'
          }`}
        />
      </label>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 flex items-center justify-between p-4 px-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-800">IntraExtra</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              className="bg-gray-100 border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" 
              placeholder="Search projects, clients" 
              type="text"
            />
          </div>
          <img 
            alt="User avatar" 
            className="w-10 h-10 rounded-full" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_807mcmTdZKRpNArIWY2xjIRGMOOEh-wh6F3vAmai5V7GO-raHbpveGJK4nQqGPMUEWmbBItvu-igxSrV-wyYnmfOkTMJrftMhqagieGFiy3T2YEdjcqDU8vDywpn88zeF9tim0miU3kHfYlxJ44K7Amr6kg5Iy87xQdpUlfk5lUUWPI_1S8zMjSzWISk6RjXpWd9ABCJC1wRKcTA-mwAsJvp6kHL1Wu1KKieXZJPUlLQCJm1o59IP2U_lTSq_iSiWEMK8AoKKPk"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <a className="flex items-center text-gray-500 hover:text-gray-700" href="#">
              <ArrowLeft className="mr-1 w-4 h-4" /> 
              Back to Projects
            </a>
            <h2 className="text-3xl font-bold text-gray-800 mt-2">Tech Conference 2024</h2>
            <p className="text-gray-500">USA • Innovate Solutions</p>
          </div>
          <button className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700">
            Create New Project
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
            {/* Project Information */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Project Information</h3>
              <button 
                onClick={() => setShowEditForm(true)}
                className="bg-blue-100 text-blue-700 font-semibold py-2 px-4 rounded-lg flex items-center hover:bg-blue-200"
              >
                <Edit className="mr-2 w-4 h-4" /> 
                Edit Info
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <p className="text-sm text-gray-500 font-bold">Project ID</p>
                <p className="font-semibold text-gray-800">{project.project_id || 'Tech Conference 2024'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-bold">Client</p>
                <p className="font-semibold text-gray-800">
                  {project.client?.name || 'Innovate Solutions'} - {project.client?.company || 'Innovate Solutions'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-bold">Event Classification</p>
                <p className="font-semibold text-gray-800">{project.client?.classification || 'Canopy'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-bold">Event Location (City, Country)</p>
                <p className="font-semibold text-gray-800">{project.event_location || 'USA'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-bold">Event Type</p>
                <p className="font-semibold text-gray-800">{project.classification || 'Conference'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-bold">Expected Attendance</p>
                <p className="font-semibold text-gray-800">{project.expected_attendance?.toLocaleString() || '1,000'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-bold">Event Dates</p>
                <p className="font-semibold text-gray-800">20/05/2024 to 20/05/2024</p>
              </div>
            </div>

            {/* Project Phase */}
            <div className="mt-10">
              <div className="flex items-center mb-4 space-x-4">
                <h3 className="text-lg font-bold text-gray-800">Project Phase:</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-blue-600 rounded-full"></div>
                  <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                  <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                  <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="font-semibold text-gray-800">Phase 1: Initial Contact</p>
                  <p className="text-gray-500">25%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">First client interaction and requirements gathering</p>
              </div>
            </div>

            {/* Fees Overview */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Fees Overview</h3>
                <button className="bg-blue-100 text-blue-700 font-semibold py-2 px-4 rounded-lg flex items-center hover:bg-blue-200">
                  <Edit className="mr-2 w-4 h-4" /> 
                  Edit Fees
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">Fee Category</th>
                      <th className="px-6 py-3">Fee Type</th>
                      <th className="px-6 py-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white border-b">
                      <td className="px-6 py-4 font-semibold text-gray-700 align-top" rowSpan={2}>
                        Ticketing Fees
                      </td>
                      <td className="px-6 py-4">Service Fee (per ticket)</td>
                      <td className="px-6 py-4 font-semibold text-gray-800">$2.50</td>
                    </tr>
                    <tr className="bg-white border-b">
                      <td className="px-6 py-4">Processing Fee (per order)</td>
                      <td className="px-6 py-4 font-semibold text-gray-800">3.0%</td>
                    </tr>
                    <tr className="bg-white border-b">
                      <td className="px-6 py-4 font-semibold text-gray-700 align-top" rowSpan={4}>
                        Cashless Fees
                      </td>
                      <td className="px-6 py-4">Activation Fee (per wristband)</td>
                      <td className="px-6 py-4 font-semibold text-gray-800">$1.00</td>
                    </tr>
                    <tr className="bg-white border-b">
                      <td className="px-6 py-4">Top-Up Fee (online)</td>
                      <td className="px-6 py-4 font-semibold text-gray-800">2.5%</td>
                    </tr>
                    <tr className="bg-white border-b">
                      <td className="px-6 py-4">Top-Up Fee (on-site)</td>
                      <td className="px-6 py-4 font-semibold text-gray-800">5.0%</td>
                    </tr>
                    <tr className="bg-white border-b">
                      <td className="px-6 py-4">Refund Processing Fee</td>
                      <td className="px-6 py-4 font-semibold text-gray-800">$5.00</td>
                    </tr>
                    <tr className="bg-white border-b">
                      <td className="px-6 py-4 font-semibold text-gray-700 align-top" rowSpan={2}>
                        Additional Fees
                      </td>
                      <td className="px-6 py-4">Mailing Fee</td>
                      <td className="px-6 py-4 font-semibold text-gray-800">Not set</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="px-6 py-4">On-site Support</td>
                      <td className="px-6 py-4 font-semibold text-gray-800">$1,500 / day</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Summary Overview */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Summary Overview</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <p className="text-gray-500 font-bold">Contract Status</p>
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    In-Review
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-500 font-bold">ROI Status</p>
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    To Do
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-500 font-bold">Margin Threshold</p>
                  <div className="flex items-center">
                    <span className="text-red-500 font-semibold">-5.4%</span>
                    <ArrowDown className="text-red-500 ml-1 w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Additional Info</h3>
              <div className="grid grid-cols-1 gap-4 text-sm">
                {/* On-site Dates */}
                <div>
                  <p className="text-gray-600 font-bold text-base">On-site Dates</p>
                  <div className="mt-2 grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-gray-500 text-sm mb-1">Start Date & Time</label>
                      <input 
                        className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 px-3 text-gray-800" 
                        type="datetime-local"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 text-sm mb-1">End Date & Time</label>
                      <input 
                        className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 px-3 text-gray-800" 
                        type="datetime-local"
                      />
                    </div>
                  </div>
                </div>

                {/* Show Dates */}
                <div>
                  <p className="text-gray-600 font-bold text-base">Show Dates</p>
                  <div className="mt-2 grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-gray-500 text-sm mb-1">Start Date & Time</label>
                      <input 
                        className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 px-3 text-gray-800" 
                        type="datetime-local"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 text-sm mb-1">End Date & Time</label>
                      <input 
                        className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 px-3 text-gray-800" 
                        type="datetime-local"
                      />
                    </div>
                  </div>
                </div>

                {/* Online Vouchers */}
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600 font-bold text-base mb-1">Online Vouchers</p>
                    <ToggleSwitch
                      checked={onlineVouchers}
                      onChange={setOnlineVouchers}
                      id="toggle-vouchers"
                    />
                  </div>
                  {onlineVouchers && (
                    <div className="mt-2 grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-gray-500 text-sm mb-1">Start Date & Time</label>
                        <input 
                          className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 px-3 text-gray-800" 
                          type="datetime-local"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 text-sm mb-1">End Date & Time</label>
                        <input 
                          className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 px-3 text-gray-800" 
                          type="datetime-local"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Online TopUps */}
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600 font-bold text-base mb-1">Online TopUps</p>
                    <ToggleSwitch
                      checked={onlineTopups}
                      onChange={setOnlineTopups}
                      id="toggle-topups"
                    />
                  </div>
                  {onlineTopups && (
                    <div className="mt-2 grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-gray-500 text-sm mb-1">Start Date & Time</label>
                        <input 
                          className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 px-3 text-gray-800" 
                          type="datetime-local"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 text-sm mb-1">End Date & Time</label>
                        <input 
                          className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 px-3 text-gray-800" 
                          type="datetime-local"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Refund Window */}
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600 font-bold text-base mb-1">Refund Window</p>
                    <ToggleSwitch
                      checked={refundWindow}
                      onChange={setRefundWindow}
                      id="toggle-refund"
                    />
                  </div>
                  {refundWindow && (
                    <div className="mt-2 grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-gray-500 text-sm mb-1">Start Date & Time</label>
                        <input 
                          className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 px-3 text-gray-800" 
                          type="datetime-local"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 text-sm mb-1">End Date & Time</label>
                        <input 
                          className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 px-3 text-gray-800" 
                          type="datetime-local"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Other Fields */}
                <div>
                  <label className="text-gray-600 font-bold text-base">Wristband Order Deadline</label>
                  <input 
                    className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 px-3 text-gray-800 mt-1" 
                    type="date"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-600 font-bold text-base">Load in Date</label>
                    <input 
                      className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 px-3 text-gray-800 mt-1" 
                      type="date"
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 font-bold text-base">Load out Date</label>
                    <input 
                      className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 px-3 text-gray-800 mt-1" 
                      type="date"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-gray-600 font-bold text-base">Delivery On-site</p>
                  <div className="bg-gray-50 p-3 rounded-lg mt-1">
                    <p className="font-semibold text-gray-800">123 Event St, Las Vegas</p>
                    <p className="text-gray-600">Contact: Alex Turner</p>
                    <p className="text-gray-600">+1-555-123-4567</p>
                    <p className="text-gray-600">alex.turner@example.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents Hub */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Documents Hub</h3>
              <div className="space-y-3">
                <a className="flex items-center text-blue-600 hover:text-blue-800 font-medium group" href="#">
                  <FileText className="mr-2 w-5 h-5" />
                  <span className="group-hover:underline">Contract</span>
                </a>
                <a className="flex items-center text-blue-600 hover:text-blue-800 font-medium group" href="#">
                  <FileText className="mr-2 w-5 h-5" />
                  <span className="group-hover:underline">Service Level Agreement</span>
                </a>
                <a className="flex items-center text-blue-600 hover:text-blue-800 font-medium group" href="#">
                  <FileText className="mr-2 w-5 h-5" />
                  <span className="group-hover:underline">Scope of Work</span>
                </a>
              </div>
            </div>

            {/* Project x Client Docs */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Project x Client Docs</h3>
              <div className="space-y-3">
                <a className="flex items-center text-blue-600 hover:text-blue-800 font-medium group" href="#">
                  <FileText className="mr-2 w-5 h-5" />
                  <span className="group-hover:underline">Project Info Request</span>
                </a>
                <a className="flex items-center text-blue-600 hover:text-blue-800 font-medium group" href="#">
                  <FileText className="mr-2 w-5 h-5" />
                  <span className="group-hover:underline">Menus & Products</span>
                </a>
                <a className="flex items-center text-blue-600 hover:text-blue-800 font-medium group" href="#">
                  <FileText className="mr-2 w-5 h-5" />
                  <span className="group-hover:underline">Device Allocation</span>
                </a>
                <a className="flex items-center text-blue-600 hover:text-blue-800 font-medium group" href="#">
                  <FileText className="mr-2 w-5 h-5" />
                  <span className="group-hover:underline">CASFID Technical Rider</span>
                </a>
              </div>
            </div>

            {/* Back-Office Connections */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Back-Office Connections</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">EnterTicket</span>
                  <CheckCircle className="text-green-500 w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">IDASEvent</span>
                  <CheckCircle className="text-green-500 w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">CAE</span>
                  <XCircle className="text-gray-400 w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Charity</span>
                  <CheckCircle className="text-green-500 w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Promotor Panel</span>
                  <XCircle className="text-gray-400 w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Form Modal */}
      {showEditForm && (
        <ProjectEditForm
          project={project}
          onClose={() => setShowEditForm(false)}
          onSave={(updatedProject) => {
            setShowEditForm(false);
            toast.success('Project updated successfully!');
          }}
        />
      )}
    </div>
  );
}

// Project Edit Form Component
interface ProjectEditFormProps {
  project: Project;
  onClose: () => void;
  onSave: (project: Project) => void;
}

function ProjectEditForm({ project, onClose, onSave }: ProjectEditFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      project_id: project.project_id,
      client_id: project.client_id,
      event_location: project.event_location,
      event_start_date: project.event_start_date,
      event_end_date: project.event_end_date,
      expected_attendance: project.expected_attendance,
      event_type: project.classification,
      onsite_start_date: project.onsite_start_date || '',
      onsite_end_date: project.onsite_end_date || '',
      show_start_date: project.show_start_date || '',
      show_end_date: project.show_end_date || '',
      voucher_sale_start: project.voucher_sale_start || '',
      voucher_sale_end: project.voucher_sale_end || '',
      topup_start: project.topup_start || '',
      topup_end: project.topup_end || '',
      refund_window_start: project.refund_window_start || '',
      refund_window_end: project.refund_window_end || '',
      delivery_address: project.delivery_address || '',
      delivery_contact_name: project.delivery_contact_name || '',
      delivery_contact_phone: project.delivery_contact_phone || '',
      delivery_contact_email: project.delivery_contact_email || '',
      wristband_order_deadline: project.wristband_order_deadline || '',
      load_in_date: project.load_in_date || '',
      load_out_date: project.load_out_date || '',
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    console.log('Updating project:', data);
    toast.success('Project updated successfully!');
    setShowEditForm(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Project Information</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Project ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project ID
            </label>
            <input
              {...register('project_id')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled
            />
          </div>

          {/* Client */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client
            </label>
            <select
              {...register('client_id')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Client</option>
              {mockClients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.company}
                </option>
              ))}
            </select>
            {errors.client_id && (
              <p className="text-red-600 text-sm mt-1">{errors.client_id.message}</p>
            )}
          </div>

          {/* Event Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Location (City, Country)
            </label>
            <input
              {...register('event_location')}
              placeholder="Enter Location (City, Country)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.event_location && (
              <p className="text-red-600 text-sm mt-1">{errors.event_location.message}</p>
            )}
          </div>

          {/* Expected Attendance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Attendance
            </label>
            <input
              {...register('expected_attendance', { valueAsNumber: true })}
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.expected_attendance && (
              <p className="text-red-600 text-sm mt-1">{errors.expected_attendance.message}</p>
            )}
          </div>

          {/* Classification */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type
            </label>
            <select
              {...register('event_type')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Conference">Conference</option>
              <option value="Festival">Festival</option>
              <option value="Exhibition">Exhibition</option>
              <option value="Sports">Sports</option>
              <option value="Corporate">Corporate</option>
              <option value="Other">Other</option>
            </select>
            {errors.event_type && (
              <p className="text-red-600 text-sm mt-1">{errors.event_type.message}</p>
            )}
          </div>

          {/* Event Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Start Date
              </label>
              <input
                {...register('event_start_date')}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.event_start_date && (
                <p className="text-red-600 text-sm mt-1">{errors.event_start_date.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event End Date
              </label>
              <input
                {...register('event_end_date')}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.event_end_date && (
                <p className="text-red-600 text-sm mt-1">{errors.event_end_date.message}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Update Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}