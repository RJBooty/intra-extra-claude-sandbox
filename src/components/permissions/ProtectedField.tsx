import React, { ReactNode, cloneElement, isValidElement, Children } from 'react';
import { useFieldAccess } from '../../hooks/usePermissions';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface ProtectedFieldProps {
  fieldId: string;
  children: ReactNode;
  label?: string;
  hideWhenNoAccess?: boolean;
  showPlaceholder?: boolean;
  placeholderText?: string;
  renderReadOnly?: (value?: any) => ReactNode;
  className?: string;
  loadingComponent?: ReactNode;
}

export function ProtectedField({
  fieldId,
  children,
  label,
  hideWhenNoAccess = false,
  showPlaceholder = true,
  placeholderText,
  renderReadOnly,
  className = '',
  loadingComponent
}: ProtectedFieldProps) {
  const {
    permission,
    loading,
    error,
    canRead,
    canUpdate,
    isReadOnly,
    isNone,
    refresh
  } = useFieldAccess(fieldId);

  // Handle loading state
  if (loading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <LoadingSpinner size="sm" />
        {label && <span className="text-gray-500 text-sm">{label}</span>}
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className={`text-red-600 text-sm ${className}`}>
        <div className="flex items-center gap-1">
          <Lock className="w-4 h-4" />
          <span>Permission check failed</span>
        </div>
      </div>
    );
  }

  // No access - hide completely if requested
  if (!canRead && hideWhenNoAccess) {
    return null;
  }

  // No access - show restricted message
  if (!canRead) {
    if (!showPlaceholder) {
      return null;
    }

    return (
      <div className={`p-3 bg-gray-50 border border-gray-200 rounded-md ${className}`}>
        <div className="flex items-center gap-2 text-gray-500">
          <EyeOff className="w-4 h-4" />
          <div>
            {label && <p className="font-medium text-sm">{label}</p>}
            <p className="text-xs">
              {placeholderText || 'Field access restricted'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Has read access but it's read-only
  if (isReadOnly && !canUpdate) {
    // Use custom read-only renderer if provided
    if (renderReadOnly) {
      return (
        <div className={className}>
          {renderReadOnly()}
        </div>
      );
    }

    // Try to extract value from form inputs and render as read-only
    const readOnlyContent = makeReadOnly(children, label);
    
    return (
      <div className={className}>
        {readOnlyContent}
      </div>
    );
  }

  // Full access - render children as-is
  return (
    <div className={className}>
      {children}
    </div>
  );
}

// Helper function to convert form inputs to read-only display
function makeReadOnly(children: ReactNode, label?: string): ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement(child)) {
      return child;
    }

    const { type, props } = child;

    // Handle input elements
    if (type === 'input') {
      const inputType = props.type || 'text';
      const value = props.value || props.defaultValue || '';

      switch (inputType) {
        case 'text':
        case 'email':
        case 'url':
        case 'tel':
          return (
            <div className="space-y-1">
              {label && (
                <label className="block text-sm font-medium text-gray-700">
                  {label}
                </label>
              )}
              <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-md">
                <Eye className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{value || 'Not specified'}</span>
              </div>
            </div>
          );

        case 'number':
          return (
            <div className="space-y-1">
              {label && (
                <label className="block text-sm font-medium text-gray-700">
                  {label}
                </label>
              )}
              <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-md">
                <Eye className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 font-mono">
                  {value || '0'}
                </span>
              </div>
            </div>
          );

        case 'checkbox':
          return (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border border-gray-300 rounded bg-gray-50 flex items-center justify-center">
                {props.checked && (
                  <div className="w-2 h-2 bg-blue-600 rounded-sm" />
                )}
              </div>
              {label && (
                <span className="text-sm text-gray-700">{label}</span>
              )}
              <Eye className="w-3 h-3 text-gray-400" />
            </div>
          );

        case 'radio':
          return (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border border-gray-300 rounded-full bg-gray-50 flex items-center justify-center">
                {props.checked && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </div>
              {label && (
                <span className="text-sm text-gray-700">{label}</span>
              )}
              <Eye className="w-3 h-3 text-gray-400" />
            </div>
          );

        default:
          return (
            <div className="space-y-1">
              {label && (
                <label className="block text-sm font-medium text-gray-700">
                  {label}
                </label>
              )}
              <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-md">
                <Eye className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{value || 'Not specified'}</span>
              </div>
            </div>
          );
      }
    }

    // Handle textarea
    if (type === 'textarea') {
      const value = props.value || props.defaultValue || '';
      return (
        <div className="space-y-1">
          {label && (
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
          )}
          <div className="p-2 bg-gray-50 border border-gray-200 rounded-md min-h-20">
            <div className="flex items-start gap-2">
              <Eye className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-900 whitespace-pre-wrap">
                {value || 'Not specified'}
              </span>
            </div>
          </div>
        </div>
      );
    }

    // Handle select
    if (type === 'select') {
      const value = props.value || props.defaultValue || '';
      const selectedOption = Array.from(props.children || []).find((option: any) => 
        option?.props?.value === value
      );
      const displayValue = selectedOption?.props?.children || value || 'Not selected';

      return (
        <div className="space-y-1">
          {label && (
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
          )}
          <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-md">
            <Eye className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900">{displayValue}</span>
          </div>
        </div>
      );
    }

    // Handle divs or other containers that might contain form elements
    if (props.children) {
      return cloneElement(child, {
        ...props,
        children: makeReadOnly(props.children, label)
      });
    }

    return child;
  });
}

// Convenience components for common field types

interface CurrencyFieldProps extends Omit<ProtectedFieldProps, 'children'> {
  value?: number;
  currency?: string;
}

export function ProtectedCurrencyField({ 
  value, 
  currency = 'USD', 
  label,
  ...props 
}: CurrencyFieldProps) {
  const renderReadOnly = () => (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-md">
        <Eye className="w-4 h-4 text-gray-400" />
        <span className="text-gray-900 font-mono">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
          }).format(value || 0)}
        </span>
      </div>
    </div>
  );

  return (
    <ProtectedField
      {...props}
      label={label}
      renderReadOnly={renderReadOnly}
    >
      <input
        type="number"
        value={value}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </ProtectedField>
  );
}

interface TextFieldProps extends Omit<ProtectedFieldProps, 'children'> {
  value?: string;
  type?: 'text' | 'email' | 'url' | 'tel';
  placeholder?: string;
}

export function ProtectedTextField({
  value,
  type = 'text',
  placeholder,
  label,
  ...props
}: TextFieldProps) {
  return (
    <ProtectedField {...props} label={label}>
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>
    </ProtectedField>
  );
}

interface SelectFieldProps extends Omit<ProtectedFieldProps, 'children'> {
  value?: string;
  options: Array<{ value: string; label: string }>;
}

export function ProtectedSelectField({
  value,
  options,
  label,
  ...props
}: SelectFieldProps) {
  return (
    <ProtectedField {...props} label={label}>
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <select
          value={value}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </ProtectedField>
  );
}