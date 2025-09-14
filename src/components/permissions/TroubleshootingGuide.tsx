import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info, 
  Search,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Database,
  Network,
  Monitor,
  Users,
  Shield,
  Settings
} from 'lucide-react';

interface TroubleshootingItem {
  id: string;
  category: 'permissions' | 'performance' | 'validation' | 'inheritance' | 'network' | 'ui';
  severity: 'high' | 'medium' | 'low';
  title: string;
  symptoms: string[];
  causes: string[];
  solutions: string[];
  code?: string;
  relatedDocs?: string[];
}

const troubleshootingData: TroubleshootingItem[] = [
  {
    id: 'permissions-not-saving',
    category: 'permissions',
    severity: 'high',
    title: 'Permission Changes Not Saving',
    symptoms: [
      'Changes appear in UI but don\'t persist after page refresh',
      'Save button shows loading but never completes',
      'Success message appears but changes are reverted',
      'Network tab shows failed requests'
    ],
    causes: [
      'Network connectivity issues',
      'Server-side validation failures',
      'Database connection problems',
      'Authentication token expired',
      'Permission service API errors'
    ],
    solutions: [
      'Check browser Network tab for failed HTTP requests',
      'Verify user authentication status and refresh token if needed',
      'Check server logs for validation errors or database issues',
      'Test with smaller permission changes to isolate the problem',
      'Clear browser cache and retry the operation',
      'Use browser developer tools to inspect API responses'
    ],
    code: `
// Debug permission save issues
const debugPermissionSave = async () => {
  try {
    const response = await permissionService.updatePagePermission(
      'page_id', 'user_tier', 'permission_type'
    );
    console.log('Save response:', response);
  } catch (error) {
    console.error('Save failed:', error);
    // Check error.response for server errors
    // Check error.request for network errors
  }
};`,
    relatedDocs: ['API Documentation', 'Permission Service Guide']
  },
  {
    id: 'inheritance-not-working',
    category: 'inheritance',
    severity: 'medium',
    title: 'Permission Inheritance Not Working',
    symptoms: [
      'Child permissions don\'t update when parent changes',
      'Override indicators not showing correctly',
      'Reset to Inherit button doesn\'t work',
      'Validation allows invalid inheritance combinations'
    ],
    causes: [
      'Explicit permission overrides preventing inheritance',
      'Inheritance calculation logic errors',
      'UI state not updating after permission changes',
      'Validation rules incorrectly implemented'
    ],
    solutions: [
      'Check for explicit permission overrides using inheritance indicators',
      'Use "Reset to Inherit" to clear explicit overrides',
      'Verify inheritance validation rules in code',
      'Test inheritance with simple parent-child relationships',
      'Check browser console for inheritance calculation errors',
      'Reload the permissions data to refresh inheritance state'
    ],
    code: `
// Check inheritance status
const checkInheritance = (entityId, userTier) => {
  const explicit = getExplicitPermission(entityId, userTier);
  const inherited = getInheritedPermission(entityId, userTier);
  
  console.log('Explicit:', explicit);
  console.log('Inherited:', inherited);
  console.log('Is Override:', explicit && explicit !== inherited);
};`,
    relatedDocs: ['Inheritance Logic', 'Permission Hierarchy']
  },
  {
    id: 'access-denied-errors',
    category: 'permissions',
    severity: 'high',
    title: 'Unexpected Access Denied Errors',
    symptoms: [
      'Users with appropriate permissions getting access denied',
      'Master users unable to access permission dashboard',
      'Components showing "Access Restricted" message incorrectly',
      'API calls returning 403 Forbidden errors'
    ],
    causes: [
      'User role not properly set or cached',
      'Permission checks using outdated data',
      'Authentication token issues',
      'Permission service returning incorrect results',
      'Client-side permission checks out of sync'
    ],
    solutions: [
      'Verify user role in authentication context',
      'Clear authentication cache and re-login',
      'Check permission service API responses',
      'Refresh user permissions data',
      'Verify API authentication headers',
      'Test with different user accounts'
    ],
    code: `
// Debug user permissions
const debugUserPermissions = () => {
  const { user, userRole } = useAuth();
  console.log('Current user:', user);
  console.log('User role:', userRole);
  
  // Check specific permission
  const hasPermission = checkPermission('page_id', 'action');
  console.log('Has permission:', hasPermission);
};`,
    relatedDocs: ['Authentication Guide', 'User Roles']
  },
  {
    id: 'slow-performance',
    category: 'performance',
    severity: 'medium',
    title: 'Slow Dashboard Performance',
    symptoms: [
      'Dashboard takes more than 5 seconds to load',
      'UI becomes unresponsive during operations',
      'Memory usage continuously increases',
      'Browser tab crashes or becomes slow'
    ],
    causes: [
      'Large datasets (100+ pages, 1000+ fields)',
      'Inefficient data fetching or processing',
      'Memory leaks in React components',
      'Excessive re-renders',
      'Unoptimized database queries'
    ],
    solutions: [
      'Implement pagination for large datasets',
      'Use React.memo and useMemo for expensive calculations',
      'Virtualize long lists using react-window',
      'Optimize database queries with proper indexing',
      'Monitor memory usage in browser dev tools',
      'Use React DevTools Profiler to identify performance bottlenecks'
    ],
    code: `
// Performance monitoring
const PerformanceMonitor = () => {
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        console.log('Performance entry:', entry);
      });
    });
    
    observer.observe({ entryTypes: ['measure', 'navigation'] });
    
    return () => observer.disconnect();
  }, []);
};`,
    relatedDocs: ['Performance Optimization', 'React Best Practices']
  },
  {
    id: 'validation-false-positives',
    category: 'validation',
    severity: 'low',
    title: 'Validation Showing False Positives',
    symptoms: [
      'Valid permission configurations trigger warnings',
      'Auto-fix creates more problems than it solves',
      'Cannot save legitimate permission changes',
      'Validation rules seem inconsistent'
    ],
    causes: [
      'Validation rules too restrictive or incorrect',
      'Edge cases not handled in validation logic',
      'Business rules changing but validation not updated',
      'Complex inheritance scenarios not considered'
    ],
    solutions: [
      'Review validation rule logic for edge cases',
      'Test validation with known good configurations',
      'Update business rules in validation system',
      'Add override options for special cases',
      'Improve validation error messages for clarity',
      'Document exceptions to standard validation rules'
    ],
    code: `
// Test validation rules
const testValidation = () => {
  const testCases = [
    { parent: 'full', child: 'read_only', expected: true },
    { parent: 'none', child: 'full', expected: false },
    { parent: 'read_only', child: 'none', expected: true }
  ];
  
  testCases.forEach(test => {
    const result = validateInheritance(test.child, test.parent);
    console.log(\`Test \${JSON.stringify(test)}: \${result === test.expected ? 'PASS' : 'FAIL'}\`);
  });
};`,
    relatedDocs: ['Validation Rules', 'Business Logic']
  },
  {
    id: 'bulk-operations-failing',
    category: 'permissions',
    severity: 'medium',
    title: 'Bulk Operations Failing or Incomplete',
    symptoms: [
      'Bulk operations timeout before completion',
      'Only some items updated in bulk operation',
      'Bulk operations appear to succeed but changes not saved',
      'UI freezes during large bulk operations'
    ],
    causes: [
      'Too many items selected for bulk operation',
      'Network timeout during bulk API calls',
      'Database transaction limits exceeded',
      'Client-side processing timeout',
      'Insufficient memory for large operations'
    ],
    solutions: [
      'Reduce number of items in bulk operations (< 50 recommended)',
      'Implement batch processing with progress indicators',
      'Use background jobs for large bulk operations',
      'Add retry logic for failed bulk operations',
      'Show detailed progress and error reporting',
      'Optimize bulk API endpoints for better performance'
    ],
    code: `
// Batch bulk operations
const processBulkOperation = async (items, batchSize = 25) => {
  const batches = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  
  for (const batch of batches) {
    try {
      await processBatch(batch);
      updateProgress(batch.length);
    } catch (error) {
      console.error('Batch failed:', error);
      // Handle partial failure
    }
  }
};`,
    relatedDocs: ['Bulk Operations', 'API Rate Limits']
  },
  {
    id: 'ui-state-inconsistencies',
    category: 'ui',
    severity: 'low',
    title: 'UI State Inconsistencies',
    symptoms: [
      'Permission dropdowns show wrong values',
      'Checkboxes don\'t reflect actual selection state',
      'Pending changes counter incorrect',
      'Visual indicators don\'t match actual data'
    ],
    causes: [
      'React state not properly synchronized',
      'Component re-render issues',
      'State mutations instead of immutable updates',
      'Event handlers not properly bound',
      'Race conditions in state updates'
    ],
    solutions: [
      'Use React DevTools to inspect component state',
      'Check for state mutations in reducers',
      'Verify useEffect dependencies are correct',
      'Add key props to list items',
      'Use useState functional updates for complex state',
      'Consider using a state management library like Redux'
    ],
    code: `
// Proper state updates
const [permissions, setPermissions] = useState({});

// Wrong - mutates state
const updatePermissionWrong = (id, value) => {
  permissions[id] = value;
  setPermissions(permissions);
};

// Correct - immutable update
const updatePermissionCorrect = (id, value) => {
  setPermissions(prev => ({
    ...prev,
    [id]: value
  }));
};`,
    relatedDocs: ['React State Management', 'Component Best Practices']
  }
];

export function TroubleshootingGuide() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const categories = [
    { id: 'all', label: 'All Issues', icon: Search },
    { id: 'permissions', label: 'Permissions', icon: Shield },
    { id: 'performance', label: 'Performance', icon: Monitor },
    { id: 'validation', label: 'Validation', icon: CheckCircle },
    { id: 'inheritance', label: 'Inheritance', icon: Users },
    { id: 'network', label: 'Network', icon: Network },
    { id: 'ui', label: 'UI Issues', icon: Settings }
  ];

  const filteredItems = troubleshootingData.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.symptoms.some(symptom => symptom.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.causes.some(cause => cause.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-800 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'low': return 'text-blue-800 bg-blue-50 border-blue-200';
      default: return 'text-gray-800 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'medium': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'low': return <Info className="w-5 h-5 text-blue-600" />;
      default: return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(c => c.id === category);
    if (categoryData) {
      const Icon = categoryData.icon;
      return <Icon className="w-4 h-4" />;
    }
    return <Settings className="w-4 h-4" />;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-100 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Troubleshooting Guide</h1>
            <p className="text-gray-600">Common issues and solutions for the permissions system</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search issues, symptoms, or solutions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-800">High Severity</span>
          </div>
          <p className="text-2xl font-bold text-red-900 mt-1">
            {troubleshootingData.filter(item => item.severity === 'high').length}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">Medium Severity</span>
          </div>
          <p className="text-2xl font-bold text-amber-900 mt-1">
            {troubleshootingData.filter(item => item.severity === 'medium').length}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Low Severity</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {troubleshootingData.filter(item => item.severity === 'low').length}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-800">Total Issues</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{troubleshootingData.length}</p>
        </div>
      </div>

      {/* Troubleshooting Items */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Issues Found</h3>
            <p className="text-gray-600">
              {searchTerm ? `No issues match "${searchTerm}"` : 'No issues in this category'}
            </p>
          </div>
        ) : (
          filteredItems.map(item => {
            const isExpanded = expandedItems.has(item.id);
            
            return (
              <div key={item.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpanded(item.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {getSeverityIcon(item.severity)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">{item.title}</h3>
                          <div className="flex items-center gap-1">
                            {getCategoryIcon(item.category)}
                            <span className="text-xs text-gray-500 capitalize">{item.category}</span>
                          </div>
                        </div>
                        <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(item.severity)}`}>
                          {item.severity.toUpperCase()} SEVERITY
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {item.symptoms.length} symptoms • {item.solutions.length} solutions
                      </span>
                      {isExpanded ? 
                        <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      }
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="p-6 space-y-6">
                      {/* Symptoms */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          Symptoms
                        </h4>
                        <ul className="space-y-2">
                          {item.symptoms.map((symptom, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                              <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0" />
                              {symptom}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Causes */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          Common Causes
                        </h4>
                        <ul className="space-y-2">
                          {item.causes.map((cause, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                              <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                              {cause}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Solutions */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Solutions
                        </h4>
                        <ol className="space-y-2">
                          {item.solutions.map((solution, index) => (
                            <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                              <span className="flex-shrink-0 w-5 h-5 bg-green-600 text-white rounded-full text-xs flex items-center justify-center font-medium">
                                {index + 1}
                              </span>
                              {solution}
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Code Example */}
                      {item.code && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <Database className="w-4 h-4 text-blue-600" />
                            Code Example
                          </h4>
                          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                            <pre className="text-sm text-gray-100">
                              <code>{item.code.trim()}</code>
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Related Documentation */}
                      {item.relatedDocs && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 text-purple-600" />
                            Related Documentation
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {item.relatedDocs.map((doc, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                              >
                                {doc}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}