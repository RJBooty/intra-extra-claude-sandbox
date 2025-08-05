import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { DocumentTemplate } from '../../types';

interface DocumentManagerProps {
  projectId?: string;
}

const mockTemplates: DocumentTemplate[] = [
  {
    id: '1',
    name: 'Standard Event Proposal',
    description: 'Template for general events',
    category: 'proposal',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Conference Proposal',
    description: 'Template for conference events',
    category: 'proposal',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Exhibition Proposal',
    description: 'Template for exhibition events',
    category: 'proposal',
    created_at: new Date().toISOString(),
  },
];

export function DocumentManager({ projectId }: DocumentManagerProps) {
  const [activeTab, setActiveTab] = useState<'proposal' | 'contract' | 'custom'>('proposal');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, []);

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const isValidType = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidType) {
        toast.error(`${file.name} is not a supported file type`);
        return false;
      }
      
      if (!isValidSize) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} file(s) uploaded successfully`);
    }
  };

  const handleUseTemplate = (template: DocumentTemplate) => {
    toast.success(`Using template: ${template.name}`);
    // Here you would typically generate a document from the template
  };

  const renderTemplateTable = () => (
    <div className="px-4 py-3">
      <div className="flex overflow-hidden rounded-xl border border-[#d4dbe2] bg-gray-50">
        <table className="flex-1">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-[#101418] text-sm font-medium leading-normal">
                Template Name
              </th>
              <th className="px-4 py-3 text-left text-[#101418] text-sm font-medium leading-normal">
                Description
              </th>
              <th className="px-4 py-3 text-left text-[#5c728a] text-sm font-medium leading-normal">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {mockTemplates
              .filter(template => template.category === activeTab)
              .map((template) => (
                <tr key={template.id} className="border-t border-t-[#d4dbe2] hover:bg-gray-100 transition-colors">
                  <td className="h-[72px] px-4 py-2 text-[#101418] text-sm font-normal leading-normal">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      {template.name}
                    </div>
                  </td>
                  <td className="h-[72px] px-4 py-2 text-[#5c728a] text-sm font-normal leading-normal">
                    {template.description}
                  </td>
                  <td className="h-[72px] px-4 py-2">
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-bold leading-normal tracking-[0.015em] transition-colors"
                    >
                      Use Template
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-[#101418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        Document Management
      </h2>
      
      {/* Tab Navigation */}
      <div className="pb-3">
        <div className="flex border-b border-[#d4dbe2] px-4 gap-8">
          <button
            onClick={() => setActiveTab('proposal')}
            className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-colors ${
              activeTab === 'proposal'
                ? 'border-b-[#3B82F6] text-[#101418]'
                : 'border-b-transparent text-[#5c728a] hover:text-[#101418]'
            }`}
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">
              Proposal Templates
            </p>
          </button>
          <button
            onClick={() => setActiveTab('contract')}
            className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-colors ${
              activeTab === 'contract'
                ? 'border-b-[#3B82F6] text-[#101418]'
                : 'border-b-transparent text-[#5c728a] hover:text-[#101418]'
            }`}
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">
              Contract Templates
            </p>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-colors ${
              activeTab === 'custom'
                ? 'border-b-[#3B82F6] text-[#101418]'
                : 'border-b-transparent text-[#5c728a] hover:text-[#101418]'
            }`}
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">
              Custom Documents
            </p>
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {(activeTab === 'proposal' || activeTab === 'contract') && renderTemplateTable()}

      {activeTab === 'custom' && (
        <>
          {/* File Upload Area */}
          <div className="flex flex-col p-4">
            <div
              className={`flex flex-col items-center gap-6 rounded-xl border-2 border-dashed px-6 py-14 transition-all ${
                isDragging
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-[#d4dbe2] hover:border-blue-300 hover:bg-gray-100'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex max-w-[480px] flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-gray-400" />
                <p className="text-[#101418] text-lg font-bold leading-tight tracking-[-0.015em] max-w-[480px] text-center">
                  Drag and drop files here
                </p>
                <p className="text-[#101418] text-sm font-normal leading-normal max-w-[480px] text-center">
                  Or click to browse your files (PDF, DOC, DOCX - Max 10MB)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx"
                onChange={handleFileInput}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#eaedf1] hover:bg-gray-300 text-[#101418] text-sm font-bold leading-normal tracking-[0.015em] transition-colors"
              >
                <span className="truncate">Upload Files</span>
              </button>
            </div>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="px-4">
              <h3 className="text-lg font-semibold text-[#101418] mb-3">Uploaded Files</h3>
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-[#101418]">{file.name}</p>
                        <p className="text-xs text-[#5c728a]">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Action Buttons */}
      <div className="flex justify-stretch">
        <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 justify-start">
          <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold leading-normal tracking-[0.015em] transition-colors">
            <span className="truncate">Generate Proposal</span>
          </button>
          <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#eaedf1] hover:bg-gray-300 text-[#101418] text-sm font-bold leading-normal tracking-[0.015em] transition-colors">
            <span className="truncate">Create Contract</span>
          </button>
        </div>
      </div>
    </div>
  );
}