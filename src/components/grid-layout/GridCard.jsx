// src/components/grid-layout/GridCard.jsx
import React from 'react';
import { GripVertical, Maximize2, Settings, AlertTriangle, AlertCircle } from 'lucide-react';

export const GridCard = ({
  section,
  isEditMode,
  isDragging,
  isResizing,
  draggedSection,
  resizingSection,
  hasOverflow,
  iconColorMap,
  sectionRefs,
  hoveredSection,
  setHoveredSection,
  handleDragStart,
  handleDragEnd,
  handleResizeStart,
  renderContent,
  onConfigureFields,
  gridColumns,
  gridRows
}) => {
  const IconComponent = section.icon;
  const isBeingDragged = draggedSection?.id === section.id;
  const isBeingResized = resizingSection?.id === section.id;
  
  const atRightEdge = section.gridColumn + section.gridColumnSpan > gridColumns;
  const atBottomEdge = section.gridRow + section.gridRowSpan > gridRows;

  return (
    <div 
      ref={el => sectionRefs.current[section.id] = el}
      className={
        'bg-white/90 p-4 rounded-lg shadow-sm border-2 transition-all relative overflow-hidden ' + 
        (isBeingDragged ? 'opacity-30 cursor-grabbing border-blue-400 shadow-lg' : 
         hasOverflow ? 'border-orange-400 ring-2 ring-orange-300' : 
         'border-gray-200 hover:shadow-md') + 
        (isBeingResized ? ' ring-4 ring-blue-400 ring-opacity-50 border-blue-400' : '')
      } 
      style={{
        gridColumn: `${section.gridColumn} / span ${section.gridColumnSpan}`, 
        gridRow: `${section.gridRow} / span ${section.gridRowSpan}`,
        minWidth: '160px',
        minHeight: '160px'
      }}
      onMouseEnter={() => setHoveredSection(section.id)}
      onMouseLeave={() => setHoveredSection(null)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isEditMode && (
            <div 
              className="drag-handle cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded transition-colors" 
              draggable 
              onDragStart={(e) => handleDragStart(section, e)} 
              onDragEnd={handleDragEnd} 
              title="Drag to reposition"
            >
              <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </div>
          )}
          <h3 className="text-base flex items-center gap-2 font-semibold text-gray-900">
            <IconComponent className={`h-4 w-4 ${iconColorMap?.[section.type] || 'text-gray-600'}`} />
            {section.title}
          </h3>
          {hasOverflow && (
            <div 
              className="bg-orange-100 text-orange-700 rounded p-1 flex items-center gap-1" 
              title="Content is clipped - resize card to see all"
            >
              <AlertTriangle className="h-3 w-3" />
            </div>
          )}
        </div>
        {isEditMode && onConfigureFields && (
          <button
            onClick={() => onConfigureFields(section)}
            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Configure fields"
          >
            <Settings className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="section-content overflow-auto" style={{ maxHeight: 'calc(100% - 3rem)' }}>
        {renderContent ? renderContent(section) : (
          <p className="text-sm text-gray-500">No content renderer provided</p>
        )}
      </div>

      {/* Overflow Warning */}
      {hasOverflow && (
        <div className="absolute bottom-2 left-2 right-2 bg-orange-50 border border-orange-300 rounded px-2 py-1 flex items-center gap-1 text-[10px] text-orange-700 pointer-events-none">
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
          <span className="font-medium">Content clipped - resize to view all</span>
        </div>
      )}

      {/* Resize Info Tooltip */}
      {isEditMode && isBeingResized && (
        <div className="absolute top-2 right-14 z-30">
          <div className="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-medium shadow-lg flex flex-col items-center gap-1">
            <div className="font-bold">{section.gridColumnSpan}×{section.gridRowSpan}</div>
            <div className="text-blue-100 text-[10px]">
              Pos: {section.gridColumn},{section.gridRow}
            </div>
            {(atRightEdge || atBottomEdge) && (
              <div className="text-yellow-300 text-[10px] flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                At boundary
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resize Handle */}
      {isEditMode && (
        <div 
          className="resize-handle absolute bottom-1 right-1 cursor-nwse-resize p-1 hover:bg-gray-100 rounded transition-colors z-30" 
          onMouseDown={(e) => handleResizeStart(section, e)} 
          title="Drag to resize"
        >
          <Maximize2 className="h-4 w-4 text-gray-300 hover:text-gray-500" />
        </div>
      )}
    </div>
  );
};