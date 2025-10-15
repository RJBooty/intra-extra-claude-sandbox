// hooks/useGridLayout.js
import { useState, useEffect, useRef } from 'react';

export const useGridLayout = (initialSections, options = {}) => {
  const {
    defaultColumns = 35,
    defaultRows = 25,
    minColumns = 3,
    maxColumns = 100,
    minRows = 3,
    maxRows = 100,
    cellSize = 30,
    gap = 8
  } = options;

  // State
  const [sections, setSections] = useState(initialSections);
  const [gridColumns, setGridColumns] = useState(defaultColumns);
  const [gridRows, setGridRows] = useState(defaultRows);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showGridGuides, setShowGridGuides] = useState(true);
  const [draggedSection, setDraggedSection] = useState(null);
  const [dragOverCell, setDragOverCell] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [resizingSection, setResizingSection] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState(null);
  const [hoveredSection, setHoveredSection] = useState(null);
  const [overflowingSections, setOverflowingSections] = useState(new Set());
  const sectionRefs = useRef({});

  // Drag handlers
  const handleDragStart = (section, e) => {
    if (!isEditMode) {
      e.preventDefault();
      return;
    }
    e.stopPropagation();
    setDraggedSection(section);
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    if (!isDragging || !draggedSection) return;
    e.preventDefault();
    e.stopPropagation();

    const gridContainer = e.currentTarget;
    const rect = gridContainer.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(gridContainer);

    // Get raw mouse position relative to grid container
    const rawMouseX = e.clientX - rect.left;
    const rawMouseY = e.clientY - rect.top;

    // CSS Grid gap-2 = 8px between cells
    const cssGap = 8;
    const cellWithGap = cellSize + cssGap; // Should be 30 + 8 = 38

    // Direct calculation (no offset, no loop - pure math)
    let column = Math.floor(rawMouseX / cellWithGap) + 1;
    let row = Math.floor(rawMouseY / cellWithGap) + 1;

    // Clamp to grid boundaries
    column = Math.max(1, Math.min(column, gridColumns));
    row = Math.max(1, Math.min(row, gridRows));

    // Calculate what the expected position SHOULD be based on visual column
    const expectedStartX = (column - 1) * cellWithGap;
    const expectedEndX = expectedStartX + cellSize;

    console.log('=== DRAG DEBUG (No Offset) ===');
    console.log('🔍 CSS Debug:', {
      boxSizing: computedStyle.boxSizing,
      paddingLeft: computedStyle.paddingLeft,
      paddingTop: computedStyle.paddingTop,
      marginLeft: computedStyle.marginLeft,
      marginTop: computedStyle.marginTop,
      position: computedStyle.position,
      transform: computedStyle.transform,
      display: computedStyle.display,
      gap: computedStyle.gap,
      gridTemplateColumns: computedStyle.gridTemplateColumns
    });
    console.log('Grid Container:', {
      'rect.left': rect.left,
      'rect.top': rect.top,
      'rect.width': rect.width,
      'rect.height': rect.height,
      'element': gridContainer.className
    });
    console.log('Mouse Position:', {
      'viewport X': e.clientX,
      'viewport Y': e.clientY,
      'relative rawMouseX': rawMouseX,
      'relative rawMouseY': rawMouseY
    });
    console.log('Grid Config:', {
      'cellSize': cellSize,
      'cssGap': cssGap,
      'cellWithGap': cellWithGap,
      'gridColumns': gridColumns,
      'gridRows': gridRows
    });
    console.log('Calculation:', {
      'formula': `floor(${rawMouseX} / ${cellWithGap}) + 1`,
      'math': `floor(${rawMouseX / cellWithGap}) + 1`,
      'result column': column,
      'result row': row
    });
    console.log('Expected Boundaries for calculated column:', {
      'column': column,
      'should start at': expectedStartX,
      'should end at': expectedEndX,
      'mouse is at': rawMouseX,
      'within bounds?': rawMouseX >= expectedStartX && rawMouseX < expectedEndX
    });
    console.log('=================================');

    setDragOverCell({ column, row });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedSection || !dragOverCell) {
      setIsDragging(false);
      setDraggedSection(null);
      setDragOverCell(null);
      return;
    }
    
    setSections(prevSections => 
      prevSections.map(section => 
        section.id === draggedSection.id
          ? { ...section, gridColumn: dragOverCell.column, gridRow: dragOverCell.row }
          : section
      )
    );
    
    setIsDragging(false);
    setDraggedSection(null);
    setDragOverCell(null);
  };

  const handleDragEnd = (e) => {
    e.stopPropagation();
    setIsDragging(false);
    setDraggedSection(null);
    setDragOverCell(null);
  };

  // Resize handlers
  const handleResizeStart = (section, e) => {
    if (!isEditMode) {
      e.preventDefault();
      return;
    }
    e.stopPropagation();
    e.preventDefault();
    setResizingSection(section);
    setIsResizing(true);
    setResizeStart({ x: e.clientX, y: e.clientY });
  };

  const handleResizeMove = (e) => {
    if (!isResizing || !resizingSection || !resizeStart) return;
    
    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    
    const colThreshold = cellSize + gap;
    const rowThreshold = cellSize + gap;
    
    const columnChange = Math.round(deltaX / colThreshold);
    const rowChange = Math.round(deltaY / rowThreshold);
    
    const newColumnSpan = Math.max(1, resizingSection.gridColumnSpan + columnChange);
    const newRowSpan = Math.max(1, resizingSection.gridRowSpan + rowChange);
    
    const maxColumnSpan = gridColumns - resizingSection.gridColumn + 1;
    const finalColumnSpan = Math.min(newColumnSpan, maxColumnSpan);
    
    if (finalColumnSpan !== resizingSection.gridColumnSpan || newRowSpan !== resizingSection.gridRowSpan) {
      setSections(prevSections =>
        prevSections.map(section =>
          section.id === resizingSection.id
            ? { ...section, gridColumnSpan: finalColumnSpan, gridRowSpan: newRowSpan }
            : section
        )
      );
      setResizeStart({ x: e.clientX, y: e.clientY });
      setResizingSection(prev => ({ ...prev, gridColumnSpan: finalColumnSpan, gridRowSpan: newRowSpan }));
    }
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    setResizingSection(null);
    setResizeStart(null);
  };

  const handleLockLayout = (onSave, onConfirmationNeeded) => {
    // If a custom confirmation handler is provided, use it
    if (onConfirmationNeeded) {
      onConfirmationNeeded(() => {
        setIsEditMode(false);
        if (onSave) {
          onSave(sections, { gridColumns, gridRows });
        }
      });
    } else {
      // Fallback to immediate save if no confirmation handler
      setIsEditMode(false);
      if (onSave) {
        onSave(sections, { gridColumns, gridRows });
      }
    }
  };

  const resetGrid = () => {
    setGridColumns(defaultColumns);
    setGridRows(defaultRows);
  };

  // Resize effect
  useEffect(() => {
    if (isResizing) {
      const handleMouseMove = (e) => handleResizeMove(e);
      const handleMouseUp = () => handleResizeEnd();
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, resizingSection, resizeStart, gridColumns, cellSize, gap]);

  // Overflow detection effect
  useEffect(() => {
    const checkOverflow = () => {
      const newOverflowing = new Set();
      
      sections.forEach(section => {
        const element = sectionRefs.current[section.id];
        if (element) {
          const contentDiv = element.querySelector('.section-content');
          if (contentDiv) {
            const isOverflowing = contentDiv.scrollHeight > contentDiv.clientHeight || 
                                 contentDiv.scrollWidth > contentDiv.clientWidth;
            if (isOverflowing) {
              newOverflowing.add(section.id);
            }
          }
        }
      });
      
      setOverflowingSections(newOverflowing);
    };
    
    checkOverflow();
    const timeoutId = setTimeout(checkOverflow, 100);
    
    return () => clearTimeout(timeoutId);
  }, [sections, isResizing]);

  return {
    // State
    sections,
    setSections,
    gridColumns,
    setGridColumns,
    gridRows,
    setGridRows,
    isEditMode,
    setIsEditMode,
    showGridGuides,
    setShowGridGuides,
    draggedSection,
    dragOverCell,
    isDragging,
    resizingSection,
    isResizing,
    hoveredSection,
    setHoveredSection,
    overflowingSections,
    sectionRefs,
    
    // Handlers
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    handleResizeStart,
    handleLockLayout,
    resetGrid,
    
    // Config
    cellSize,
    gap,
    minColumns,
    maxColumns,
    minRows,
    maxRows
  };
};