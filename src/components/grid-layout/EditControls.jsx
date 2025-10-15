// src/components/grid-layout/EditControls.jsx
import React from 'react';
import { Grid3x3, RefreshCw } from 'lucide-react';

export const EditControls = ({
  gridColumns,
  setGridColumns,
  gridRows,
  setGridRows,
  showGridGuides,
  setShowGridGuides,
  resetGrid,
  minColumns,
  maxColumns,
  minRows,
  maxRows
}) => {
  return (
    <div className="flex items-center gap-3 justify-end">
      {/* Grid Size Controls */}
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
        {/* Columns */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-medium text-gray-600 uppercase">Columns</span>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setGridColumns(Math.max(minColumns, gridColumns - 1))}
              className="px-2 py-0.5 bg-white hover:bg-red-50 border border-gray-300 hover:border-red-300 rounded text-xs font-bold text-gray-700 hover:text-red-600 transition-colors"
              disabled={gridColumns <= minColumns}
            >
              −
            </button>
            <span className="text-sm font-bold text-gray-900 min-w-[2rem] text-center">
              {gridColumns}
            </span>
            <button 
              onClick={() => setGridColumns(Math.min(maxColumns, gridColumns + 1))}
              className="px-2 py-0.5 bg-white hover:bg-green-50 border border-gray-300 hover:border-green-300 rounded text-xs font-bold text-gray-700 hover:text-green-600 transition-colors"
              disabled={gridColumns >= maxColumns}
            >
              +
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-10 bg-gray-300"></div>

        {/* Rows */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-medium text-gray-600 uppercase">Rows</span>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setGridRows(Math.max(minRows, gridRows - 1))}
              className="px-2 py-0.5 bg-white hover:bg-red-50 border border-gray-300 hover:border-red-300 rounded text-xs font-bold text-gray-700 hover:text-red-600 transition-colors"
              disabled={gridRows <= minRows}
            >
              −
            </button>
            <span className="text-sm font-bold text-gray-900 min-w-[2rem] text-center">
              {gridRows}
            </span>
            <button 
              onClick={() => setGridRows(Math.min(maxRows, gridRows + 1))}
              className="px-2 py-0.5 bg-white hover:bg-green-50 border border-gray-300 hover:border-green-300 rounded text-xs font-bold text-gray-700 hover:text-green-600 transition-colors"
              disabled={gridRows >= maxRows}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Grid Guides Toggle */}
      <button 
        onClick={() => setShowGridGuides(!showGridGuides)}
        className={
          'px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ' + 
          (showGridGuides ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
        }
      >
        <Grid3x3 className="h-4 w-4" />
        {showGridGuides ? 'Hide Grid' : 'Show Grid'}
      </button>

      {/* Reset Grid Button */}
      <button 
        onClick={resetGrid}
        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-2"
        title="Reset to default grid size"
      >
        <RefreshCw className="h-4 w-4" />
        Reset Grid
      </button>
    </div>
  );
};