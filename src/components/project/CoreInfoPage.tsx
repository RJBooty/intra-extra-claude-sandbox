import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  Upload,
  Info,
  CheckCircle,
  ArrowDown,
  FileText,
  Assignment,
  Work,
  Description,
  RestaurantMenu,
  Devices,
  Gavel,
  ExternalLink
} from 'lucide-react';
import { Project } from '../../types';

interface CoreInfoPageProps {
  project: Project;
}

export function CoreInfoPage({ project }: CoreInfoPageProps) {
  const [onlineVouchers, setOnlineVouchers] = useState(true);
  const [onlineTopups, setOnlineTopups] = useState(true);
  const [refundWindow, setRefundWindow] = useState(true);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <a className="flex items-center text-gray-500 hover:text-gray-700" href="#">
              <ArrowLeft className="mr-1 w-4 h-4" /> Back to Projects
            </a>
            <h2 className="text-3xl font-bold text-gray-800 mt-2">
              {project.project_id} - <span className="text-2xl text-gray-600">{project.project_code}</span>
            </h2>
            <p className="text-gray-500">{project.event_location} • {project.client?.company}</p>
          </div>
          <button className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700">
            Create New Project
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Project Information */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">Project Information</h3>
                <button className="bg-blue-50 text-blue-600 font-semibold py-2 px-4 rounded-lg flex items-center hover:bg-blue-100">
                  <Edit className="mr-2 w-4 h-4" /> Edit Info
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <p className="text-sm text-gray-500">Project ID</p>
                  <p className="font-semibold text-gray-800">{project.project_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Project Code</p>
                  <p className="font-semibold text-gray-800">{project.project_code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Client</p>
                  <p className="font-semibold text-gray-800">{project.client?.name} - {project.client?.company}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Event Classification</p>
                  <p className="font-semibold text-gray-800">({project.client?.classification || 'Canopy'})</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Event Location (City, Country)</p>
                  <p className="font-semibold text-gray-800">{project.event_location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Event Type</p>
                  <p className="font-semibold text-gray-800">{project.event_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expected Attendance</p>
                  <p className="font-semibold text-gray-800">{project.expected_attendance?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Event Dates</p>
                  <p className="font-semibold text-gray-800">
                    {project.event_start_date ? new Date(project.event_start_date).toLocaleDateString() : ''} to {project.event_end_date ? new Date(project.event_end_date).toLocaleDateString() : ''}
                  </p>
                </div>
              </div>

              {/* Project Phase */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center mb-2 space-x-4">
                  <h3 className="text-base font-bold text-gray-800">Project Phase:</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                    <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                    <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                    <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-semibold text-gray-800 text-sm">Phase 1: Initial Contact</p>
                    <p className="text-gray-500 text-sm">25%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{width: '25%'}}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">First client interaction and requirements gathering</p>
                </div>
              </div>
            </div>

            {/* Key Info */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
              <h3 className="text-lg font-bold text-gray-800">Key Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 font-bold text-base">On-site Dates</p>
                  <div className="mt-2 space-y-4">
                    <div>
                      <label className="block text-gray-500 text-xs mb-1" htmlFor="onsite-start">Start Date & Time</label>
                      <div className="relative">
                        <input 
                          className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-gray-800" 
                          id="onsite-start" 
                          placeholder="mm/dd/yyyy, --:-- --" 
                          type="text"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-500 text-xs mb-1" htmlFor="onsite-end">End Date & Time</label>
                      <div className="relative">
                        <input 
                          className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-gray-800" 
                          id="onsite-end" 
                          placeholder="mm/dd/yyyy, --:-- --" 
                          type="text"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-gray-600 font-bold text-base">Show Dates</p>
                  <div className="mt-2 space-y-4">
                    <div>
                      <label className="block text-gray-500 text-xs mb-1" htmlFor="show-start">Start Date & Time</label>
                      <div className="relative">
                        <input 
                          className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-gray-800" 
                          id="show-start" 
                          placeholder="mm/dd/yyyy, --:-- --" 
                          type="text"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-500 text-xs mb-1" htmlFor="show-end">End Date & Time</label>
                      <div className="relative">
                        <input 
                          className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-gray-800" 
                          id="show-end" 
                          placeholder="mm/dd/yyyy, --:-- --" 
                          type="text"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-gray-600 font-bold text-base">Load In Date</p>
                  <div className="mt-2 space-y-4">
                    <div>
                      <label className="block text-gray-500 text-xs mb-1" htmlFor="load-in-date">Start Date & Time</label>
                      <div className="relative">
                        <input 
                          className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-gray-800" 
                          id="load-in-date" 
                          placeholder="mm/dd/yyyy, --:-- --" 
                          type="text"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-500 text-xs mb-1" htmlFor="load-out-date">End Date & Time</label>
                      <div className="relative">
                        <input 
                          className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-gray-800" 
                          id="load-out-date" 
                          placeholder="mm/dd/yyyy, --:-- --" 
                          type="text"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cashless Info */}
              <div className="border-t border-gray-200 mt-6 pt-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Cashless Info</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <p className="text-gray-600 font-bold text-base mb-1">Online Vouchers</p>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input 
                          checked={onlineVouchers}
                          onChange={() => setOnlineVouchers(!onlineVouchers)}
                          className="absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-200"
                          id="toggle-vouchers" 
                          type="checkbox"
                          style={{
                            right: onlineVouchers ? '0' : '16px',
                            borderColor: onlineVouchers ? '#4f46e5' : '#d1d5db'
                          }}
                        />
                        <label 
                          className="block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200"
                          htmlFor="toggle-vouchers"
                          style={{
                            backgroundColor: onlineVouchers ? '#4f46e5' : '#d1d5db'
                          }}
                        ></label>
                      </div>
                    </div>
                    {onlineVouchers && (
                      <div className="mt-2 space-y-4">
                        <div>
                          <label className="block text-gray-500 text-xs mb-1" htmlFor="vouchers-start">Start Date & Time</label>
                          <div className="relative">
                            <input 
                              className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-gray-800" 
                              id="vouchers-start" 
                              placeholder="mm/dd/yyyy, --:-- --" 
                              type="text"
                            />
                            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-gray-500 text-xs mb-1" htmlFor="vouchers-end">End Date & Time</label>
                          <div className="relative">
                            <input 
                              className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-gray-800" 
                              id="vouchers-end" 
                              placeholder="mm/dd/yyyy, --:-- --" 
                              type="text"
                            />
                            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <p className="text-gray-600 font-bold text-base mb-1">Online TopUps</p>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input 
                          checked={onlineTopups}
                          onChange={() => setOnlineTopups(!onlineTopups)}
                          className="absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-200"
                          id="toggle-topups" 
                          type="checkbox"
                          style={{
                            right: onlineTopups ? '0' : '16px',
                            borderColor: onlineTopups ? '#4f46e5' : '#d1d5db'
                          }}
                        />
                        <label 
                          className="block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200"
                          htmlFor="toggle-topups"
                          style={{
                            backgroundColor: onlineTopups ? '#4f46e5' : '#d1d5db'
                          }}
                        ></label>
                      </div>
                    </div>
                    {onlineTopups && (
                      <div className="mt-2 space-y-4">
                        <div>
                          <label className="block text-gray-500 text-xs mb-1" htmlFor="topups-start">Start Date & Time</label>
                          <div className="relative">
                            <input 
                              className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-gray-800" 
                              id="topups-start" 
                              placeholder="mm/dd/yyyy, --:-- --" 
                              type="text"
                            />
                            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-gray-500 text-xs mb-1" htmlFor="topups-end">End Date & Time</label>
                          <div className="relative">
                            <input 
                              className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-gray-800" 
                              id="topups-end" 
                              placeholder="mm/dd/yyyy, --:-- --" 
                              type="text"
                            />
                            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col justify-between bg-slate-50 p-4 rounded-lg border border-gray-200">
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-600 font-bold text-base mb-1">Refund Window</p>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                          <input 
                            checked={refundWindow}
                            onChange={() => setRefundWindow(!refundWindow)}
                            className="absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-200"
                            id="toggle-refund" 
                            type="checkbox"
                            style={{
                              right: refundWindow ? '0' : '16px',
                              borderColor: refundWindow ? '#4f46e5' : '#d1d5db'
                            }}
                          />
                          <label 
                            className="block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200"
                            htmlFor="toggle-refund"
                            style={{
                              backgroundColor: refundWindow ? '#4f46e5' : '#d1d5db'
                            }}
                          ></label>
                        </div>
                      </div>
                      {refundWindow && (
                        <div className="mt-2 space-y-4">
                          <div>
                            <label className="block text-gray-500 text-xs mb-1" htmlFor="refund-start">Start Date & Time</label>
                            <div className="relative">
                              <input 
                                className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-gray-800" 
                                id="refund-start" 
                                placeholder="mm/dd/yyyy, --:-- --" 
                                type="text"
                              />
                              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-gray-500 text-xs mb-1" htmlFor="refund-end">End Date & Time</label>
                            <div className="relative">
                              <input 
                                className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-gray-800" 
                                id="refund-end" 
                                placeholder="mm/dd/yyyy, --:-- --" 
                                type="text"
                              />
                              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between space-y-6 bg-slate-50 p-4 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-gray-600 font-bold text-base mb-2">Refund Terms</p>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-100" htmlFor="dropzone-file">
                          <div className="flex flex-col items-center justify-center pt-3 pb-3">
                            <Upload className="text-gray-500 w-5 h-5" />
                            <p className="mb-1 text-xs text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-gray-500">DOC or PDF</p>
                          </div>
                          <input className="hidden" id="dropzone-file" type="file"/>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-600 font-bold text-base mb-2" htmlFor="refund-fee">Refund Fee</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                        <input className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-7 pr-3 text-gray-800" id="refund-fee" placeholder="0.00" type="text"/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery & Deadlines */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Delivery & Deadlines</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <label className="text-gray-600 font-bold text-base" htmlFor="wristband-deadline">Wristband Order Deadline</label>
                      <div className="relative mt-2">
                        <input 
                          className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-gray-800" 
                          id="wristband-deadline" 
                          placeholder="mm/dd/yyyy" 
                          type="text"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-600 font-bold text-base" htmlFor="hardware-deadline">Hardware On-site Deadline</label>
                      <div className="relative mt-2">
                        <input 
                          className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-gray-800" 
                          id="hardware-deadline" 
                          placeholder="mm/dd/yyyy" 
                          type="text"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 font-bold text-base">Delivery On-site</p>
                    <div className="bg-gray-50 p-4 rounded-lg mt-2 border border-gray-200 h-full text-sm">
                      <p className="font-semibold text-gray-800">123 Event St, Las Vegas</p>
                      <p className="text-gray-600">Contact: Alex Turner</p>
                      <p className="text-gray-600">+1-555-123-4567</p>
                      <p className="text-gray-600">alex.turner@example.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            {/* Summary Overview */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-base font-bold text-gray-800 mb-4">Summary Overview</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <p className="text-gray-500 font-medium mr-2">Contract Status</p>
                    <Info className="text-gray-400 cursor-pointer w-4 h-4" />
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">In-Review</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <p className="text-gray-500 font-medium mr-2">ROI Status</p>
                    <Info className="text-gray-400 cursor-pointer w-4 h-4" />
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Estimate</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-500 font-medium">Margin Threshold</p>
                  <div className="flex items-center">
                    <span className="text-red-500 font-semibold">-5.4%</span>
                    <ArrowDown className="text-red-500 ml-1 w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Documents Hub */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-base font-bold text-gray-800 mb-4">Documents Hub</h3>
              <div className="space-y-1">
                <a className="flex items-center text-blue-600 hover:text-blue-800 font-medium group p-2 rounded-md hover:bg-gray-50" href="#">
                  <FileText className="mr-3 w-4 h-4" />
                  <span className="group-hover:underline text-sm">Contract</span>
                </a>
                <a className="flex items-center text-blue-600 hover:text-blue-800 font-medium group p-2 rounded-md hover:bg-gray-50" href="#">
                  <FileText className="mr-3 w-4 h-4" />
                  <span className="group-hover:underline text-sm">Service Level Agreement</span>
                </a>
                <a className="flex items-center text-blue-600 hover:text-blue-800 font-medium group p-2 rounded-md hover:bg-gray-50" href="#">
                  <FileText className="mr-3 w-4 h-4" />
                  <span className="group-hover:underline text-sm">Scope of Work</span>
                </a>
              </div>
            </div>

            {/* Project x Client Docs */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-base font-bold text-gray-800 mb-4">Project x Client Docs</h3>
              <div className="space-y-1">
                <a className="flex items-center text-blue-600 hover:text-blue-800 font-medium group p-2 rounded-md hover:bg-gray-50" href="#">
                  <FileText className="mr-3 w-4 h-4" />
                  <span className="group-hover:underline text-sm">Project Info Request</span>
                </a>
                <a className="flex items-center text-blue-600 hover:text-blue-800 font-medium group p-2 rounded-md hover:bg-gray-50" href="#">
                  <FileText className="mr-3 w-4 h-4" />
                  <span className="group-hover:underline text-sm">Menus & Products</span>
                </a>
                <a className="flex items-center text-blue-600 hover:text-blue-800 font-medium group p-2 rounded-md hover:bg-gray-50" href="#">
                  <FileText className="mr-3 w-4 h-4" />
                  <span className="group-hover:underline text-sm">Device Allocation</span>
                </a>
                <a className="flex items-center text-blue-600 hover:text-blue-800 font-medium group p-2 rounded-md hover:bg-gray-50" href="#">
                  <FileText className="mr-3 w-4 h-4" />
                  <span className="group-hover:underline text-sm">Technical Rider</span>
                </a>
              </div>
            </div>

            {/* Back-Office Connections */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-base font-bold text-gray-800 mb-4">Back-Office Connections</h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                  <span className="font-medium text-gray-700">EnterTicket</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="text-green-500 w-4 h-4" />
                    <a className="text-gray-400 hover:text-blue-600" href="#">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                  <span className="font-medium text-gray-700">IDASEvent</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="text-green-500 w-4 h-4" />
                    <a className="text-gray-400 hover:text-blue-600" href="#">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                  <span className="font-medium text-gray-700">CAE</span>
                  <div className="flex items-center space-x-2">
                    <a className="text-gray-400 hover:text-blue-600" href="#">
                      <Edit className="w-4 h-4" />
                    </a>
                    <a className="text-gray-400 hover:text-blue-600 cursor-not-allowed opacity-50" href="#">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                  <span className="font-medium text-gray-700">Charity</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="text-green-500 w-4 h-4" />
                    <a className="text-gray-400 hover:text-blue-600" href="#">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                  <span className="font-medium text-gray-700">Promotor Panel</span>
                  <div className="flex items-center space-x-2">
                    <a className="text-gray-400 hover:text-blue-600" href="#">
                      <Edit className="w-4 h-4" />
                    </a>
                    <a className="text-gray-400 hover:text-blue-600 cursor-not-allowed opacity-50" href="#">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Fees Overview */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Fees Overview</h3>
                <button className="bg-blue-50 text-blue-600 font-semibold py-2 px-4 rounded-lg flex items-center hover:bg-blue-100">
                  <Edit className="mr-2 w-4 h-4" /> Edit Fees
                </button>
              </div>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                    <tr>
                      <th className="px-4 py-3" scope="col">Fee Category</th>
                      <th className="px-4 py-3" scope="col">Fee Type</th>
                      <th className="px-4 py-3 text-right" scope="col">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white border-b">
                      <td className="px-4 py-3 font-semibold text-gray-700 align-top" rowSpan={2}>Ticketing Fees</td>
                      <td className="px-4 py-3">Service Fee (per ticket)</td>
                      <td className="px-4 py-3 font-semibold text-gray-800 text-right">€2.50</td>
                    </tr>
                    <tr className="bg-white border-b">
                      <td className="px-4 py-3">Processing Fee (per order)</td>
                      <td className="px-4 py-3 font-semibold text-gray-800 text-right">3.0%</td>
                    </tr>
                    <tr className="bg-white border-b">
                      <td className="px-4 py-3 font-semibold text-gray-700 align-top" rowSpan={4}>Cashless Fees</td>
                      <td className="px-4 py-3">Activation Fee (per wristband)</td>
                      <td className="px-4 py-3 font-semibold text-gray-800 text-right">€1.00</td>
                    </tr>
                    <tr className="bg-white border-b">
                      <td className="px-4 py-3">Top-Up Fee (online)</td>
                      <td className="px-4 py-3 font-semibold text-gray-800 text-right">2.5%</td>
                    </tr>
                    <tr className="bg-white border-b">
                      <td className="px-4 py-3">Top-Up Fee (on-site)</td>
                      <td className="px-4 py-3 font-semibold text-gray-800 text-right">5.0%</td>
                    </tr>
                    <tr className="bg-white border-b">
                      <td className="px-4 py-3">Refund Processing Fee</td>
                      <td className="px-4 py-3 font-semibold text-gray-800 text-right">€5.00</td>
                    </tr>
                    <tr className="bg-white border-b">
                      <td className="px-4 py-3 font-semibold text-gray-700 align-top" rowSpan={2}>Additional Fees</td>
                      <td className="px-4 py-3">Mailing Fee</td>
                      <td className="px-4 py-3 font-semibold text-gray-500 text-right">Not set</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="px-4 py-3">On-site Support</td>
                      <td className="px-4 py-3 font-semibold text-gray-800 text-right">€1,500 / day</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}