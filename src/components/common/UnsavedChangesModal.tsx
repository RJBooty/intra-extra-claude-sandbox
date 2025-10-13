import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface UnsavedChangesModalProps {
  onContinueEditing: () => void;
  onDiscardChanges: () => void;
  title?: string;
  message?: string;
}

/**
 * Modal component to warn users about unsaved changes
 *
 * @example
 * ```tsx
 * <UnsavedChangesModal
 *   onContinueEditing={() => setShowModal(false)}
 *   onDiscardChanges={handleDiscard}
 * />
 * ```
 */
export function UnsavedChangesModal({
  onContinueEditing,
  onDiscardChanges,
  title = 'Unsaved Changes',
  message = 'Are you sure you want to navigate from this page? You have unsaved changes.'
}: UnsavedChangesModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">{message}</p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Use the "Done Editing" button to save your changes before navigating away.
            </p>
          </div>
        </div>

        {/* Footer with action buttons */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
          {/* Primary action - Continue editing */}
          <button
            onClick={onContinueEditing}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            No, Continue Editing
          </button>

          {/* Destructive action - Discard */}
          <button
            onClick={onDiscardChanges}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            <X className="w-4 h-4" />
            Yes, Don't Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
