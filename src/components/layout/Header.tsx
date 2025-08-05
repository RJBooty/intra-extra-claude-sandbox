import React from 'react';
import { Search, CircleDot } from 'lucide-react';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onNavigateToDashboard?: () => void;
}

export function Header({ onSearch, onNavigateToDashboard }: HeaderProps) {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#eaedf1] px-10 py-3 bg-white">
      <div className="flex items-center gap-8">
        <button 
          onClick={onNavigateToDashboard}
          className="flex items-center gap-4 text-[#101418] hover:text-blue-600 transition-colors"
        >
          <div className="size-4">
            <CircleDot className="w-4 h-4" />
          </div>
          <h2 className="text-[#101418] text-lg font-bold leading-tight tracking-[-0.015em]">
            IntraExtra
          </h2>
        </button>
      </div>
      <div className="flex flex-1 justify-end gap-8">
        <label className="flex flex-col min-w-40 !h-10 max-w-64">
          <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
            <div className="text-[#5c728a] flex border-none bg-[#eaedf1] items-center justify-center pl-4 rounded-l-xl border-r-0">
              <Search className="w-6 h-6" />
            </div>
            <input
              placeholder="Search projects, clients..."
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101418] focus:outline-0 focus:ring-0 border-none bg-[#eaedf1] focus:border-none h-full placeholder:text-[#5c728a] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
        </label>
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 cursor-pointer hover:ring-2 hover:ring-blue-200 transition-all"
          style={{
            backgroundImage: `url("https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop")`
          }}
        />
      </div>
    </header>
  );
}