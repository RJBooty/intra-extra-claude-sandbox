import { useEffect, useCallback, useState, useRef } from 'react';

interface UseUnsavedChangesWarningOptions {
  hasUnsavedChanges: boolean;
  onSave?: () => Promise<void> | void;
  message?: string;
}

/**
 * Hook to warn users about unsaved changes
 *
 * Handles both browser refresh/close warnings and internal navigation blocking.
 * When navigation is attempted while there are unsaved changes, shows a modal
 * that allows the user to save, discard, or cancel the navigation.
 *
 * @param hasUnsavedChanges - Boolean indicating if there are unsaved changes
 * @param onSave - Optional callback to save changes
 * @param message - Optional custom message to display
 *
 * @example
 * ```tsx
 * const { checkBeforeNavigate } = useUnsavedChangesWarning({
 *   hasUnsavedChanges: isDirty,
 *   onSave: handleSave
 * });
 *
 * // Before navigating:
 * const canNavigate = await checkBeforeNavigate();
 * if (canNavigate) {
 *   // Proceed with navigation
 * }
 * ```
 */
export function useUnsavedChangesWarning({
  hasUnsavedChanges,
  onSave,
  message = 'You have unsaved changes. Are you sure you want to leave?'
}: UseUnsavedChangesWarningOptions) {
  const [showWarning, setShowWarning] = useState(false);
  const pendingNavigationRef = useRef<((value: boolean) => void) | null>(null);

  // Warn on browser refresh/close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, message]);

  /**
   * Check if navigation should be allowed. If there are unsaved changes,
   * returns a promise that resolves when the user makes a decision.
   * Call this before any navigation attempt.
   */
  const checkBeforeNavigate = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!hasUnsavedChanges) {
        resolve(true);
        return;
      }

      // Store the resolution function that can resolve with true or false
      pendingNavigationRef.current = resolve;

      // Show the modal
      setShowWarning(true);
    });
  }, [hasUnsavedChanges]);

  // User chose to discard changes and navigate
  const confirmNavigation = useCallback(() => {
    setShowWarning(false);
    if (pendingNavigationRef.current) {
      pendingNavigationRef.current(true);
      pendingNavigationRef.current = null;
    }
  }, []);

  // User chose to cancel navigation and keep editing
  const cancelNavigation = useCallback(() => {
    setShowWarning(false);
    if (pendingNavigationRef.current) {
      pendingNavigationRef.current(false);
      pendingNavigationRef.current = null;
    }
  }, []);

  // User chose to save changes and navigate
  const saveAndNavigate = useCallback(async () => {
    if (!onSave) {
      // If no save function, just proceed with navigation
      setShowWarning(false);
      if (pendingNavigationRef.current) {
        pendingNavigationRef.current(true);
        pendingNavigationRef.current = null;
      }
      return;
    }

    try {
      console.log('Saving changes before navigation...');
      await onSave();
      console.log('✅ Changes saved successfully');
      setShowWarning(false);
      if (pendingNavigationRef.current) {
        pendingNavigationRef.current(true);
        pendingNavigationRef.current = null;
      }
    } catch (error) {
      console.error('❌ Error saving changes:', error);
      // Keep modal open and don't navigate if save failed
      // Re-throw so the modal can show the error
      throw error;
    }
  }, [onSave]);

  return {
    showWarning,
    checkBeforeNavigate,
    confirmNavigation,
    cancelNavigation,
    saveAndNavigate,
  };
}
