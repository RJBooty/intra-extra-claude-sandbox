import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Plus, Check } from 'lucide-react';
import { Client } from '../../types';

interface SearchableClientFieldProps {
  clients: Client[];
  selectedClientId: string;
  onClientSelect: (clientId: string) => void;
  onAddNewClient: () => void;
  placeholder?: string;
  isLoading?: boolean;
  error?: string;
}

export function SearchableClientField({
  clients,
  selectedClientId,
  onClientSelect,
  onAddNewClient,
  placeholder = "Search for a client...",
  isLoading = false,
  error
}: SearchableClientFieldProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find selected client for display
  const selectedClient = clients.find(client => client.id === selectedClientId);

  // Filter clients based on search term
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle clicking outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredClients.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredClients[highlightedIndex]) {
          handleClientSelect(filteredClients[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle client selection
  const handleClientSelect = (client: Client) => {
    onClientSelect(client.id);
    setSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  // Handle input focus
  const handleInputFocus = () => {
    setIsOpen(true);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
    
    // Clear selection if user is typing
    if (selectedClientId && e.target.value !== '') {
      onClientSelect('');
    }
  };

  // Display value in input
  const displayValue = selectedClient ? `${selectedClient.name} - ${selectedClient.company}` : searchTerm;

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? "Loading clients..." : placeholder}
            disabled={isLoading}
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101418] focus:outline-0 focus:ring-0 border border-[#d4dbe2] bg-gray-50 focus:border-blue-500 h-14 placeholder:text-[#5c728a] p-[15px] text-base font-normal leading-normal pr-10"
          />
          
          {/* Dropdown Icon */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Add New Client Button */}
        <button
          type="button"
          onClick={onAddNewClient}
          className="flex items-center justify-center w-14 h-14 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-colors"
          title="Add New Client"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-600 text-sm mt-1">{error}</p>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              Loading clients...
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? `No clients found matching "${searchTerm}"` : 'No clients available'}
            </div>
          ) : (
            filteredClients.map((client, index) => (
              <button
                key={client.id}
                type="button"
                onClick={() => handleClientSelect(client)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                  index === highlightedIndex ? 'bg-blue-50' : ''
                } ${
                  client.id === selectedClientId ? 'bg-blue-50' : ''
                } first:rounded-t-xl last:rounded-b-xl`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{client.name}</div>
                    <div className="text-sm text-gray-500">{client.company}</div>
                  </div>
                  {client.id === selectedClientId && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}