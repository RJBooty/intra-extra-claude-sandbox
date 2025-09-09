import React, { useState, useEffect } from 'react';
import { 
  History, 
  User, 
  Clock, 
  Download, 
  Filter,
  Search,
  Eye,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Calendar,
  FileText
} from 'lucide-react';
import { permissionService } from '../../lib/permissions';
import { PermissionType, UserTier } from '../../types/permissions';

interface AuditLogEntry {
  id: string;
  entity_type: 'page' | 'section' | 'field';
  entity_id: string;
  entity_name: string;
  user_tier: UserTier;
  action_type: 'grant' | 'revoke' | 'modify';
  old_permission: PermissionType | null;
  new_permission: PermissionType;
  changed_by: string;
  changed_by_name: string;
  change_reason: string;
  created_at: string;
  is_system_change: boolean;
}

interface AuditTrailProps {
  entityId?: string;
  entityType?: 'page' | 'section' | 'field';
  userTier?: UserTier;
  className?: string;
}

export function AuditTrail({ 
  entityId, 
  entityType, 
  userTier, 
  className = '' 
}: AuditTrailProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterTimeRange, setFilterTimeRange] = useState<string>('30days');
  const [showSystemChanges, setShowSystemChanges] = useState(false);

  useEffect(() => {
    loadAuditLogs();
  }, [entityId, entityType, userTier]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      // This would call your audit log API
      const logs = await permissionService.getAuditLogs({
        entityId,
        entityType,
        userTier,
        limit: 100
      });
      setAuditLogs(logs);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportAuditLogs = async () => {
    try {
      const filteredLogs = getFilteredLogs();
      const csv = convertToCSV(filteredLogs);
      downloadCSV(csv, `audit-logs-${Date.now()}.csv`);
    } catch (error) {
      console.error('Error exporting audit logs:', error);
    }
  };

  const getFilteredLogs = () => {
    return auditLogs.filter(log => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!log.entity_name.toLowerCase().includes(searchLower) &&
            !log.changed_by_name.toLowerCase().includes(searchLower) &&
            !log.change_reason.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Action filter
      if (filterAction !== 'all' && log.action_type !== filterAction) {
        return false;
      }

      // System changes filter
      if (!showSystemChanges && log.is_system_change) {
        return false;
      }

      // Time range filter
      const logDate = new Date(log.created_at);
      const now = new Date();
      const daysDiff = (now.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
      
      switch (filterTimeRange) {
        case '7days':
          return daysDiff <= 7;
        case '30days':
          return daysDiff <= 30;
        case '90days':
          return daysDiff <= 90;
        case 'all':
          return true;
        default:
          return true;
      }
    });
  };

  const convertToCSV = (logs: AuditLogEntry[]): string => {
    const headers = [
      'Date',
      'Entity Type',
      'Entity Name',
      'User Tier',
      'Action',
      'Old Permission',
      'New Permission',
      'Changed By',
      'Reason'
    ];

    const rows = logs.map(log => [
      new Date(log.created_at).toLocaleString(),
      log.entity_type,
      log.entity_name,
      log.user_tier,
      log.action_type,
      log.old_permission || 'None',
      log.new_permission,
      log.changed_by_name,
      log.change_reason
    ]);

    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'grant':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'revoke':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'modify':
        return <ArrowRight className="w-4 h-4 text-blue-600" />;
      default:
        return <Eye className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPermissionBadge = (permission: PermissionType | null) => {
    if (!permission) return <span className="text-gray-400">None</span>;

    const configs = {
      full: 'bg-green-100 text-green-800',
      read_only: 'bg-blue-100 text-blue-800',
      assigned_only: 'bg-purple-100 text-purple-800',
      own_only: 'bg-amber-100 text-amber-800',
      none: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${configs[permission]}`}>
        {permission.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredLogs = getFilteredLogs();

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Audit Trail</h3>
            {entityId && (
              <span className="text-sm text-gray-500">
                ({entityType} permissions)
              </span>
            )}
          </div>
          <button
            onClick={exportAuditLogs}
            className="flex items-center gap-2 px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Actions</option>
            <option value="grant">Grants</option>
            <option value="revoke">Revokes</option>
            <option value="modify">Modifications</option>
          </select>

          <select
            value={filterTimeRange}
            onChange={(e) => setFilterTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="all">All time</option>
          </select>

          <label className="flex items-center gap-2 px-3 py-2">
            <input
              type="checkbox"
              checked={showSystemChanges}
              onChange={(e) => setShowSystemChanges(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">System changes</span>
          </label>
        </div>
      </div>

      {/* Audit Log Entries */}
      <div className="divide-y divide-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-pulse" />
            <p className="text-gray-600">Loading audit logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No audit logs found</p>
          </div>
        ) : (
          filteredLogs.map(log => (
            <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getActionIcon(log.action_type)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {log.entity_name}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {log.entity_type}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                        {log.user_tier.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      {log.old_permission && (
                        <>
                          {getPermissionBadge(log.old_permission)}
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                        </>
                      )}
                      {getPermissionBadge(log.new_permission)}
                    </div>

                    <div className="text-sm text-gray-600 mb-1">
                      {log.change_reason}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{log.changed_by_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatRelativeTime(log.created_at)}</span>
                      </div>
                      {log.is_system_change && (
                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded">
                          System
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {filteredLogs.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            Showing {filteredLogs.length} of {auditLogs.length} audit log entries
          </p>
        </div>
      )}
    </div>
  );
}