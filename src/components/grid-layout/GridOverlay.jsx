// src/components/grid-layout/GridOverlay.jsx
import React from 'react';

export const GridOverlay = ({
  gridColumns,
  gridRows,
  cellSize,
  gap,
  sections,
  hoveredSection,
  isDragging,
  dragOverCell
}) => {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-0"
      style={{ marginTop: '-1.5rem', marginLeft: '52px' }}
    >
      {/* Column Numbers */}
      <div 
        className="grid gap-2 mb-2" 
        style={{ gridTemplateColumns: `repeat(${gridColumns}, ${cellSize}px)` }}
      >
        {[...Array(gridColumns)].map((_, i) => (
          <div 
            key={i} 
            className="text-center text-[8px] font-semibold text-gray-500 bg-gray-200 rounded py-0.5"
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Grid Cells */}
      <div 
        className="grid gap-2 h-full" 
        style={{ 
          gridTemplateColumns: `repeat(${gridColumns}, ${cellSize}px)`, 
          gridTemplateRows: `repeat(${gridRows}, ${cellSize}px)` 
        }}
      >
        {[...Array(gridColumns * gridRows)].map((_, index) => {
          const col = (index % gridColumns) + 1;
          const row = Math.floor(index / gridColumns) + 1;
          
          // Check if this cell is occupied by the hovered section
          const hoveredSec = sections.find(s => s.id === hoveredSection);
          const isOccupied = hoveredSec && 
            col >= hoveredSec.gridColumn && 
            col < hoveredSec.gridColumn + hoveredSec.gridColumnSpan &&
            row >= hoveredSec.gridRow && 
            row < hoveredSec.gridRow + hoveredSec.gridRowSpan;
          
          // Check if this is the cursor cell during dragging
          const isCursorCell = isDragging && dragOverCell && 
            col === dragOverCell.column && row === dragOverCell.row;
          
          return (
            <div 
              key={index}
              className={
                'border border-dashed transition-all ' + 
                (isCursorCell ? 'border-orange-500 bg-orange-100' : 
                 isOccupied ? 'border-blue-400 bg-blue-50' : 
                 'border-gray-400')
              }
              style={{ opacity: isCursorCell ? 0.9 : isOccupied ? 0.7 : 0.6 }}
            />
          );
        })}
      </div>
    </div>
  );
};