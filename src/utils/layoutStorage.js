// src/utils/layoutStorage.js

/**
 * Layout Storage Utility
 * Handles saving and loading layout configurations
 * Can work with localStorage (dev) or API (production)
 */

const STORAGE_PREFIX = 'intraextra_layout_';

/**
 * Save layout to localStorage (for development/testing)
 */
export const saveLayoutToLocal = (pageId, sections, gridConfig) => {
  try {
    const layoutData = {
      pageId,
      sections,
      gridColumns: gridConfig.gridColumns,
      gridRows: gridConfig.gridRows,
      savedAt: new Date().toISOString()
    };
    
    localStorage.setItem(
      `${STORAGE_PREFIX}${pageId}`,
      JSON.stringify(layoutData)
    );
    
    console.log(`Layout saved locally for ${pageId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to save layout locally:', error);
    return { success: false, error };
  }
};

/**
 * Load layout from localStorage
 */
export const loadLayoutFromLocal = (pageId) => {
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${pageId}`);
    
    if (!stored) {
      return null;
    }
    
    const layoutData = JSON.parse(stored);
    console.log(`Layout loaded locally for ${pageId}`);
    return layoutData;
  } catch (error) {
    console.error('Failed to load layout locally:', error);
    return null;
  }
};

/**
 * Clear saved layout from localStorage
 */
export const clearLayoutFromLocal = (pageId) => {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${pageId}`);
    console.log(`Layout cleared locally for ${pageId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to clear layout locally:', error);
    return { success: false, error };
  }
};

/**
 * Save layout to API (for production use)
 */
export const saveLayoutToAPI = async (pageId, sections, gridConfig, userId) => {
  try {
    const response = await fetch(`/api/layouts/${pageId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add your auth headers here
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        pageId,
        userId,
        sections,
        gridColumns: gridConfig.gridColumns,
        gridRows: gridConfig.gridRows,
        savedAt: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Layout saved to API for ${pageId}`);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to save layout to API:', error);
    return { success: false, error };
  }
};

/**
 * Load layout from API
 */
export const loadLayoutFromAPI = async (pageId, userId) => {
  try {
    const response = await fetch(`/api/layouts/${pageId}?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add your auth headers here
        // 'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        // No saved layout found, return null to use defaults
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Layout loaded from API for ${pageId}`);
    return data;
  } catch (error) {
    console.error('Failed to load layout from API:', error);
    return null;
  }
};

/**
 * Reset layout to default (delete saved layout)
 */
export const resetLayoutToDefault = async (pageId, userId, useAPI = false) => {
  if (useAPI) {
    try {
      const response = await fetch(`/api/layouts/${pageId}?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log(`Layout reset to default for ${pageId}`);
      return { success: true };
    } catch (error) {
      console.error('Failed to reset layout via API:', error);
      return { success: false, error };
    }
  } else {
    return clearLayoutFromLocal(pageId);
  }
};

/**
 * Smart save: Use API if available, fallback to localStorage
 */
export const saveLayout = async (pageId, sections, gridConfig, options = {}) => {
  const { userId, useAPI = false } = options;
  
  if (useAPI && userId) {
    const result = await saveLayoutToAPI(pageId, sections, gridConfig, userId);
    if (result.success) {
      return result;
    }
    // Fallback to localStorage if API fails
    console.warn('API save failed, falling back to localStorage');
  }
  
  return saveLayoutToLocal(pageId, sections, gridConfig);
};

/**
 * Smart load: Try API first, fallback to localStorage
 */
export const loadLayout = async (pageId, options = {}) => {
  const { userId, useAPI = false } = options;
  
  if (useAPI && userId) {
    const data = await loadLayoutFromAPI(pageId, userId);
    if (data) {
      return data;
    }
    // Fallback to localStorage if API returns nothing
    console.warn('No API data found, checking localStorage');
  }
  
  return loadLayoutFromLocal(pageId);
};

/**
 * Export layout to JSON file (for backup/migration)
 */
export const exportLayoutToFile = (pageId, sections, gridConfig) => {
  const layoutData = {
    pageId,
    sections,
    gridColumns: gridConfig.gridColumns,
    gridRows: gridConfig.gridRows,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };
  
  const blob = new Blob([JSON.stringify(layoutData, null, 2)], {
    type: 'application/json'
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${pageId}-layout-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  console.log(`Layout exported to file for ${pageId}`);
};

/**
 * Import layout from JSON file
 */
export const importLayoutFromFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const layoutData = JSON.parse(e.target.result);
        
        // Validate the structure
        if (!layoutData.pageId || !layoutData.sections) {
          throw new Error('Invalid layout file structure');
        }
        
        console.log(`Layout imported from file for ${layoutData.pageId}`);
        resolve(layoutData);
      } catch (error) {
        console.error('Failed to parse layout file:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};