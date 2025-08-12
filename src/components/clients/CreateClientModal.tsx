import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (clientData: any) => void;
}

export function CreateClientModal({ isOpen, onClose, onSubmit }: CreateClientModalProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    primaryContact: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    country: '',
    logo: null as File | null
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, logo: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setShowSuccess(true);
    
    // Reset form and close modal after success message
    setTimeout(() => {
      setFormData({
        clientName: '',
        primaryContact: '',
        primaryContactEmail: '',
        primaryContactPhone: '',
        country: '',
        logo: null
      });
      setShowSuccess(false);
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative flex size-full min-h-screen flex-col bg-[#f8fafb] group/design-root overflow-x-hidden max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-200 rounded-full"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>

        <div className="layout-container flex h-full grow flex-col">
          <div className="px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 max-w-[960px] flex-1">
              <div className="flex flex-wrap justify-between gap-3 p-4">
                <p className="text-[#0e131b] tracking-light text-[32px] font-bold leading-tight min-w-72">
                  Create New Client
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Client Name */}
                <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0e131b] text-base font-medium leading-normal pb-2">
                      Client Name
                    </p>
                    <input
                      name="clientName"
                      placeholder="Enter client name"
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e131b] focus:outline-0 focus:ring-0 border-none bg-[#e8ecf3] focus:border-none h-14 placeholder:text-[#506b95] p-4 text-base font-normal leading-normal"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                </div>

                {/* Primary Contact */}
                <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0e131b] text-base font-medium leading-normal pb-2">
                      Primary Contact
                    </p>
                    <input
                      name="primaryContact"
                      placeholder="Enter primary contact"
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e131b] focus:outline-0 focus:ring-0 border-none bg-[#e8ecf3] focus:border-none h-14 placeholder:text-[#506b95] p-4 text-base font-normal leading-normal"
                      value={formData.primaryContact}
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                </div>

                {/* Primary Contact Email */}
                <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0e131b] text-base font-medium leading-normal pb-2">
                      Primary Contact Email
                    </p>
                    <input
                      name="primaryContactEmail"
                      type="email"
                      placeholder="Enter primary contact email"
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e131b] focus:outline-0 focus:ring-0 border-none bg-[#e8ecf3] focus:border-none h-14 placeholder:text-[#506b95] p-4 text-base font-normal leading-normal"
                      value={formData.primaryContactEmail}
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                </div>

                {/* Primary Contact Phone */}
                <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0e131b] text-base font-medium leading-normal pb-2">
                      Primary Contact Phone Number
                    </p>
                    <input
                      name="primaryContactPhone"
                      type="tel"
                      placeholder="Enter primary contact phone number"
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e131b] focus:outline-0 focus:ring-0 border-none bg-[#e8ecf3] focus:border-none h-14 placeholder:text-[#506b95] p-4 text-base font-normal leading-normal"
                      value={formData.primaryContactPhone}
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                </div>

                {/* Country */}
                <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0e131b] text-base font-medium leading-normal pb-2">
                      Country
                    </p>
                    <select
                      name="country"
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e131b] focus:outline-0 focus:ring-0 border-none bg-[#e8ecf3] focus:border-none h-14 placeholder:text-[#506b95] p-4 text-base font-normal leading-normal"
                      style={{
                        backgroundImage: "url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2724px%27 height=%2724px%27 fill=%27rgb(80,107,149)%27 viewBox=%270 0 256 256%27%3e%3cpath d=%27M181.66,170.34a8,8,0,0,1,0,11.32l-48,48a8,8,0,0,1-11.32,0l-48-48a8,8,0,0,1,11.32-11.32L128,212.69l42.34-42.35A8,8,0,0,1,181.66,170.34Zm-96-84.68L128,43.31l42.34,42.35a8,8,0,0,0,11.32-11.32l-48-48a8,8,0,0,0-11.32,0l-48,48A8,8,0,0,0,85.66,85.66Z%27%3e%3c/path%3e%3c/svg%3e')",
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1rem center',
                        backgroundSize: '1rem'
                      }}
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select country</option>
                      <option value="USA">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Spain">Spain</option>
                      <option value="Italy">Italy</option>
                      <option value="Australia">Australia</option>
                      <option value="Japan">Japan</option>
                      <option value="South Korea">South Korea</option>
                    </select>
                  </label>
                </div>

                {/* Client Logo Upload */}
                <div className="flex flex-col p-4">
                  <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-[#d1d9e6] px-6 py-14">
                    <div className="flex max-w-[480px] flex-col items-center gap-2">
                      <p className="text-[#0e131b] text-lg font-bold leading-tight tracking-[-0.015em] max-w-[480px] text-center">
                        Client Logo
                      </p>
                      <p className="text-[#0e131b] text-sm font-normal leading-normal max-w-[480px] text-center">
                        Upload client logo
                      </p>
                    </div>
                    <label className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e8ecf3] text-[#0e131b] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#d1d9e6] transition-colors">
                      <span className="truncate">
                        {formData.logo ? formData.logo.name : 'Upload'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex px-4 py-3 justify-end">
                  <button
                    type="submit"
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-[#3678e2] text-[#f8fafb] text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#2565d0] transition-colors"
                  >
                    <span className="truncate">Create Client</span>
                  </button>
                </div>

                {/* Success Message */}
                {showSuccess && (
                  <p className="text-[#506b95] text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
                    Client successfully created
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}