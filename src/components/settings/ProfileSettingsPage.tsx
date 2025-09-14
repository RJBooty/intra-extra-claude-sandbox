import React, { useState } from 'react';
import { ArrowLeft, Upload, Save } from 'lucide-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface ProfileSettingsPageProps {
  onBack: () => void;
}

export function ProfileSettingsPage({ onBack }: ProfileSettingsPageProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="w-full p-6">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Settings
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          </div>

          {/* Placeholder Content */}
          <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
            <div className="text-center py-12">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Settings</h3>
              <p className="text-gray-500">Profile settings configuration is under development.</p>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-end border-t border-gray-200 pt-6">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
              >
                {isLoading ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}