// components/GridLayoutEditor.jsx
import React, { useState } from 'react';
import { Lock, Unlock, AlertCircle } from 'lucide-react';
import { GridCard } from './GridCard';
import { GridOverlay } from './GridOverlay';
import { EditControls } from './EditControls';

export const GridLayoutEditor = ({
  title,
  subtitle,
  sections,
  renderSectionContent,
  iconColorMap,
  gridLayout,
  onSave,
  userInfo,
  onConfigureFields,
  editInfoButton
}) => {
  const {
    gridColumns,
    setGridColumns,
    gridRows,
    setGridRows,
    isEditMode,
    setIsEditMode,
    showGridGuides,
    setShowGridGuides,
    isDragging,
    isResizing,
    dragOverCell,
    draggedSection,
    hoveredSection,
    setHoveredSection,
    overflowingSections,
    sectionRefs,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    handleResizeStart,
    handleLockLayout,
    resetGrid,
    cellSize,
    gap,
    minColumns,
    maxColumns,
    minRows,
    maxRows
  } = gridLayout;

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmCallback, setConfirmCallback] = useState(null);

  // Handle lock button click
  const handleLockClick = () => {
    if (isEditMode) {
      // Show confirmation modal
      handleLockLayout(onSave, (callback) => {
        setConfirmCallback(() => callback);
        setShowConfirmModal(true);
      });
    } else {
      setIsEditMode(true);
    }
  };

  // Handle confirmation
  const handleConfirm = () => {
    if (confirmCallback) {
      confirmCallback();
    }
    setShowConfirmModal(false);
    setConfirmCallback(null);
  };

  // Handle cancel
  const handleCancel = () => {
    setShowConfirmModal(false);
    setConfirmCallback(null);
  };

  return (
    <div
      className={'p-6 min-h-screen transition-colors ' + (isEditMode ? 'bg-blue-50' : 'bg-gray-50')}
      style={{
        cursor: isResizing ? 'nwse-resize' : isDragging ? 'grabbing' : 'default',
        userSelect: isResizing || isDragging ? 'none' : 'auto',
        // CSS isolation to override global styles
        boxSizing: 'border-box',
        position: 'relative',
        margin: 0,
        padding: '24px' // explicit p-6
      }}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-3">
              {isEditMode && (
                <div className="p-3 bg-blue-100 border-2 border-blue-400 rounded-lg flex items-center gap-2">
                  <Unlock className="h-5 w-5 text-blue-700 flex-shrink-0" />
                  <p className="text-sm font-semibold text-blue-900">
                    Edit Mode - Drag cards, resize, configure fields
                  </p>
                </div>
              )}

              <button
                onClick={handleLockClick}
                className={
                  'px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-sm flex-shrink-0 ' +
                  (isEditMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white')
                }
              >
                {isEditMode ? (
                  <>
                    <Lock className="h-5 w-5" />
                    Lock Layout & Save
                  </>
                ) : (
                  <>
                    <Unlock className="h-5 w-5" />
                    Edit Layout
                  </>
                )}
              </button>
            </div>

            {/* Edit Info Button - renders below Edit Layout button when provided */}
            {editInfoButton && (
              <div className="flex items-center gap-3">
                {editInfoButton}
              </div>
            )}
          </div>
        </div>
        
        {isEditMode && (
          <EditControls
            gridColumns={gridColumns}
            setGridColumns={setGridColumns}
            gridRows={gridRows}
            setGridRows={setGridRows}
            showGridGuides={showGridGuides}
            setShowGridGuides={setShowGridGuides}
            resetGrid={resetGrid}
            minColumns={minColumns}
            maxColumns={maxColumns}
            minRows={minRows}
            maxRows={maxRows}
          />
        )}
      </div>

      {/* Grid Area */}
      <div className="relative overflow-auto">
        {isEditMode && showGridGuides && (
          <GridOverlay
            gridColumns={gridColumns}
            gridRows={gridRows}
            cellSize={cellSize}
            gap={gap}
            sections={sections}
            hoveredSection={hoveredSection}
            isDragging={isDragging}
            dragOverCell={dragOverCell}
          />
        )}
        
        <div
          className="grid gap-2 relative z-10"
          style={{
            gridTemplateColumns: `repeat(${gridColumns}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${gridRows}, ${cellSize}px)`,
            // CSS isolation to override global styles
            boxSizing: 'border-box',
            margin: 0,
            padding: 0,
            position: 'relative'
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragEnter={(e) => e.preventDefault()}
        >
          {/* Drop indicator */}
          {isEditMode && isDragging && dragOverCell && draggedSection && (
            <div 
              className="absolute bg-blue-400 border-2 border-blue-600 rounded pointer-events-none z-20" 
              style={{
                gridColumn: `${dragOverCell.column} / span 1`, 
                gridRow: `${dragOverCell.row} / span 1`, 
                opacity: 0.8
              }}
            />
          )}
          
          {/* Cards */}
          {sections.map((section) => (
            <GridCard
              key={section.id}
              section={section}
              isEditMode={isEditMode}
              isDragging={isDragging}
              isResizing={isResizing}
              draggedSection={draggedSection}
              resizingSection={gridLayout.resizingSection}
              hasOverflow={overflowingSections.has(section.id)}
              iconColorMap={iconColorMap}
              sectionRefs={sectionRefs}
              hoveredSection={hoveredSection}
              setHoveredSection={setHoveredSection}
              handleDragStart={handleDragStart}
              handleDragEnd={handleDragEnd}
              handleResizeStart={handleResizeStart}
              renderContent={renderSectionContent}
              onConfigureFields={onConfigureFields}
              gridColumns={gridColumns}
              gridRows={gridRows}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      {userInfo && (
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
          <p className="text-xs text-blue-800">
            <span className="font-semibold">View:</span> {userInfo.role} - {userInfo.permissions}
          </p>
          <div className="flex items-center gap-4">
            <p className="text-xs text-blue-800">
              <span className="font-semibold">Grid:</span> {gridColumns} columns × {gridRows} rows ({gridColumns * gridRows} cells)
            </p>
            <p className={'text-xs font-semibold flex items-center gap-1 ' + (isEditMode ? 'text-orange-700' : 'text-green-700')}>
              {isEditMode ? (
                <>
                  <Unlock className="h-3 w-3" />
                  Layout Unlocked
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3" />
                  Layout Locked
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 transform transition-all">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Save Layout Changes?
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  This will save the current card positions and sizes.
                </p>
                <p className="text-xs text-gray-500">
                  You can always edit the layout again later.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Save Layout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};