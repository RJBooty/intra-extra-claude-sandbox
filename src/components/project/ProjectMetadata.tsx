import React from 'react';
import { format } from 'date-fns';
import { ExternalLink } from 'lucide-react';
import { Project } from '../../types';

interface ProjectMetadataProps {
  project?: Partial<Project>;
}

export function ProjectMetadata({ project }: ProjectMetadataProps) {
  const formatDateRange = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return 'Not set';
    try {
      const start = format(new Date(startDate), 'dd/MM/yyyy');
      const end = format(new Date(endDate), 'dd/MM/yyyy');
      return `${start} to ${end}`;
    } catch {
      return 'Invalid date';
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return 'Not set';
    try {
      return format(new Date(date), 'dd/MM/yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const backOfficeLinks = [
    { name: 'Enter Ticket Page', url: '#ticket-page' },
    { name: 'Idasevent', url: '#idasevent' },
    { name: 'CAE', url: '#cae' },
    { name: 'Promotor Panel', url: '#promotor' },
  ];

  const additionalLinks = [
    { name: 'Client Info Request', url: '#client-info' },
    { name: 'Menus', url: '#menus' },
    { name: 'CASFID Technical Rider', url: '#technical-rider' },
  ];

  const handleLinkClick = (url: string, name: string) => {
    console.log(`Navigating to ${name}: ${url}`);
    // Here you would implement actual navigation logic
  };

  return (
    <div className="layout-content-container flex flex-col w-[360px] space-y-6">
      <h3 className="text-[#101418] text-lg font-semibold leading-tight px-4 pb-3 pt-5">
        Additional Info
      </h3>
      
      <div className="p-4 grid grid-cols-[30%_1fr] gap-x-6">
        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#d4dbe2] py-5">
          <p className="text-[#5c728a] text-sm font-normal leading-normal">On-site Dates</p>
          <p className="text-[#101418] text-sm font-normal leading-normal">
            {formatDateRange(project?.onsite_start_date, project?.onsite_end_date)}
          </p>
        </div>
        
        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#d4dbe2] py-5">
          <p className="text-[#5c728a] text-sm font-normal leading-normal">Show Dates</p>
          <p className="text-[#101418] text-sm font-normal leading-normal">
            {formatDateRange(project?.show_start_date, project?.show_end_date)}
          </p>
        </div>
        
        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#d4dbe2] py-5">
          <p className="text-[#5c728a] text-sm font-normal leading-normal">Online Vouchers</p>
          <p className="text-[#101418] text-sm font-normal leading-normal">
            On Sale: {formatDate(project?.voucher_sale_start)}, Off Sale: {formatDate(project?.voucher_sale_end)}
          </p>
        </div>
        
        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#d4dbe2] py-5">
          <p className="text-[#5c728a] text-sm font-normal leading-normal">Online TopUps</p>
          <p className="text-[#101418] text-sm font-normal leading-normal">
            On: {formatDate(project?.topup_start)}, Off: {formatDate(project?.topup_end)}
          </p>
        </div>
        
        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#d4dbe2] py-5">
          <p className="text-[#5c728a] text-sm font-normal leading-normal">Refund Window</p>
          <p className="text-[#101418] text-sm font-normal leading-normal">
            Open: {formatDate(project?.refund_window_start)}, Close: {formatDate(project?.refund_window_end)}
          </p>
        </div>
        
        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#d4dbe2] py-5">
          <p className="text-[#5c728a] text-sm font-normal leading-normal">Delivery Address On-Site</p>
          <p className="text-[#101418] text-sm font-normal leading-normal">
            {project?.delivery_address || '123 Event St, Las Vegas'}<br />
            Contact: {project?.delivery_contact_name || 'Alex Turner'}<br />
            {project?.delivery_contact_phone || '+1-555-123-4567'}<br />
            {project?.delivery_contact_email || 'alex.turner@example.com'}
          </p>
        </div>
        
        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#d4dbe2] py-5">
          <p className="text-[#5c728a] text-sm font-normal leading-normal">Wristband Order Deadline</p>
          <p className="text-[#101418] text-sm font-normal leading-normal">
            {formatDate(project?.wristband_order_deadline)}
          </p>
        </div>
        
        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#d4dbe2] py-5">
          <p className="text-[#5c728a] text-sm font-normal leading-normal">Load In Date</p>
          <p className="text-[#101418] text-sm font-normal leading-normal">
            {formatDate(project?.load_in_date)}
          </p>
        </div>
        
        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#d4dbe2] py-5">
          <p className="text-[#5c728a] text-sm font-normal leading-normal">Load Out Date</p>
          <p className="text-[#101418] text-sm font-normal leading-normal">
            {formatDate(project?.load_out_date)}
          </p>
        </div>
      </div>

      {/* Back-Office Connections */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-[#101418] text-lg font-semibold leading-tight px-4 pb-3">
          Back-Office Connections
        </h3>
      </div>
      
      <div className="space-y-1">
        {backOfficeLinks.map((link, index) => (
          <div key={index} className="flex items-center gap-4 bg-gray-50 hover:bg-gray-100 px-4 min-h-14 justify-between transition-colors cursor-pointer">
            <p className="text-[#101418] text-base font-normal leading-normal flex-1 truncate">
              {link.name}
            </p>
            <button 
              onClick={() => handleLinkClick(link.url, link.name)}
              className="shrink-0 text-blue-600 hover:text-blue-800 text-base font-medium leading-normal transition-colors flex items-center gap-1"
            >
              Go <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Additional Links */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-[#101418] text-lg font-semibold leading-tight px-4 pb-3">
          Additional Links
        </h3>
      </div>
      
      <div className="space-y-1">
        {additionalLinks.map((link, index) => (
          <div key={index} className="flex items-center gap-4 bg-gray-50 hover:bg-gray-100 px-4 min-h-14 justify-between transition-colors cursor-pointer">
            <p className="text-[#101418] text-base font-normal leading-normal flex-1 truncate">
              {link.name}
            </p>
            <button 
              onClick={() => handleLinkClick(link.url, link.name)}
              className="shrink-0 text-blue-600 hover:text-blue-800 text-base font-medium leading-normal transition-colors flex items-center gap-1"
            >
              Go <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}