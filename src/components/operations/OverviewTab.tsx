import React from 'react';
import { Calendar, Users, CheckCircle, AlertTriangle, Clock, FileText } from 'lucide-react';
import { Project } from '../../types';
import { ProjectPhase, TeamMember, IntegrationStatus, ProjectTimeline } from '../../types/operations';
import { format, differenceInDays } from 'date-fns';

interface OverviewTabProps {
  project?: Project;
  phases: ProjectPhase[];
  team: TeamMember[];
  integrationStatus: IntegrationStatus | null;
  timeline: ProjectTimeline | null;
  onPhaseUpdate: (phase: ProjectPhase) => void;
}

export function OverviewTab({ 
  project, 
  phases, 
  team, 
  integrationStatus, 
  timeline 
}: OverviewTabProps) {
  const getDaysUntilEvent = () => {
    if (!project?.event_start_date) return null;
    const eventDate = new Date(project.event_start_date);
    const now = new Date();
    return differenceInDays(eventDate, now);
  };

  const getPhaseStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'blocked': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getIntegrationStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return '✓';
      case 'error': return '✗';
      default: return '⏳';
    }
  };

  const getIntegrationStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const daysUntilEvent = getDaysUntilEvent();

  return (
    <div className="space-y-6">
      {/* Project Team */}
      <div>
        <h2 className="text-[#0e141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          Project Team
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
          {team.map((member) => (
            <div key={member.id} className="flex flex-1 gap-3 rounded-lg border border-[#d0dbe7] bg-slate-50 p-4 flex-col">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg w-10 shrink-0"
                style={{
                  backgroundImage: `url("${member.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'}")`
                }}
              />
              <div className="flex flex-col gap-1">
                <h2 className="text-[#0e141b] text-base font-bold leading-tight">{member.name}</h2>
                <p className="text-[#4e7297] text-sm font-normal leading-normal truncate">{member.role}</p>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  member.availability_status === 'available' ? 'bg-green-100 text-green-800' :
                  member.availability_status === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {member.availability_status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Date Tracking */}
      <div>
        <h2 className="text-[#0e141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          Critical Date Tracking
        </h2>
        <div className="p-4 grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1 border-t border-solid border-t-[#d0dbe7] py-4 pr-2">
            <p className="text-[#4e7297] text-sm font-normal leading-normal">Days until event</p>
            <p className={`text-sm font-normal leading-normal ${
              daysUntilEvent !== null && daysUntilEvent < 7 ? 'text-red-600 font-bold' : 'text-[#101418]'
            }`}>
              {daysUntilEvent !== null ? `${daysUntilEvent} days` : 'Not set'}
            </p>
          </div>
          <div className="flex flex-col gap-1 border-t border-solid border-t-[#d0dbe7] py-4 px-2">
            <p className="text-[#4e7297] text-sm font-normal leading-normal">Contract signed</p>
            <p className="text-[#0e141b] text-sm font-normal leading-normal">
              {timeline?.critical_dates?.contract_signed ? 
                format(new Date(timeline.critical_dates.contract_signed), 'dd/MM/yyyy') : 
                'Pending'
              }
            </p>
          </div>
          <div className="flex flex-col gap-1 border-t border-solid border-t-[#d0dbe7] py-4 pl-2">
            <p className="text-[#4e7297] text-sm font-normal leading-normal">Site visit</p>
            <p className="text-[#0e141b] text-sm font-normal leading-normal">
              {timeline?.critical_dates?.site_visit ? 
                format(new Date(timeline.critical_dates.site_visit), 'dd/MM/yyyy') : 
                'Not scheduled'
              }
            </p>
          </div>
          <div className="flex flex-col gap-1 border-t border-solid border-t-[#d0dbe7] py-4 pr-2">
            <p className="text-[#4e7297] text-sm font-normal leading-normal">Equipment ship</p>
            <p className="text-[#0e141b] text-sm font-normal leading-normal">
              {timeline?.critical_dates?.equipment_ship ? 
                format(new Date(timeline.critical_dates.equipment_ship), 'dd/MM/yyyy') : 
                'Not scheduled'
              }
            </p>
          </div>
          <div className="flex flex-col gap-1 border-t border-solid border-t-[#d0dbe7] py-4 px-2">
            <p className="text-[#4e7297] text-sm font-normal leading-normal">Load in | Load out</p>
            <p className="text-[#0e141b] text-sm font-normal leading-normal">
              {project?.load_in_date && project?.load_out_date ? 
                `${format(new Date(project.load_in_date), 'dd/MM/yyyy')} | ${format(new Date(project.load_out_date), 'dd/MM/yyyy')}` : 
                'Not scheduled'
              }
            </p>
          </div>
          <div className="flex flex-col gap-1 border-t border-solid border-t-[#d0dbe7] py-4 pl-2">
            <p className="text-[#4e7297] text-sm font-normal leading-normal">Event dates</p>
            <p className="text-[#0e141b] text-sm font-normal leading-normal">
              {project?.event_start_date && project?.event_end_date ? 
                `${format(new Date(project.event_start_date), 'dd/MM/yyyy')} - ${format(new Date(project.event_end_date), 'dd/MM/yyyy')}` : 
                'Not set'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Project Status */}
      <div>
        <h2 className="text-[#0e141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          Project Status
        </h2>
        {phases.map((phase) => (
          <div key={phase.id} className="flex flex-col gap-3 p-4">
            <div className="flex gap-6 justify-between">
              <p className="text-[#0e141b] text-base font-medium leading-normal capitalize">
                {phase.phase_name}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#4e7297]">
                  {phase.progress_percentage}%
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  phase.status === 'complete' ? 'bg-green-100 text-green-800' :
                  phase.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  phase.status === 'blocked' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {phase.status.replace('_', ' ')}
                </span>
              </div>
            </div>
            <div className="rounded bg-[#d0dbe7]">
              <div 
                className="h-2 rounded bg-[#197ce5] transition-all duration-500"
                style={{ width: `${phase.progress_percentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[#4e7297] text-sm font-normal leading-normal">
                Assigned: {phase.assignee?.name || 'Unassigned'}
              </p>
              <p className="text-[#4e7297] text-sm font-normal leading-normal">
                {(() => {
                  // Calculate tasks for this phase (mock calculation)
                  const totalTasks = 5; // This would come from actual task count
                  const completedTasks = Math.floor((phase.progress_percentage / 100) * totalTasks);
                  return `${completedTasks}/${totalTasks} tasks completed`;
                })()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Key Documents */}
      <div>
        <h2 className="text-[#0e141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          Key Documents
        </h2>
        <div className="space-y-3">
          {[
            { label: 'Staff Advance', type: 'staff_advance' },
            { label: 'Client Info Pack', type: 'client_info_pack' },
            { label: 'Device Allocation', type: 'device_allocation' },
            { label: 'Menus', type: 'menus' },
            { label: 'Ticketing Matrix', type: 'ticketing_matrix' },
            { label: 'Access Matrix', type: 'access_matrix' },
            { label: 'RAMS', type: 'rams' },
            { label: 'Site Map', type: 'site_map' }
          ].reduce((acc, doc, index) => {
            if (index % 4 === 0) {
              acc.push([doc]);
            } else {
              acc[acc.length - 1].push(doc);
            }
            return acc;
          }, [] as any[]).map((row, rowIndex) => (
            <div key={rowIndex} className="flex max-w-full flex-wrap items-end gap-4 px-4 py-3">
              {row.map((doc: any) => (
                <label key={doc.type} className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">
                    {doc.label}
                  </p>
                  <input
                    placeholder="Upload or link"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7297] p-[15px] text-base font-normal leading-normal"
                  />
                </label>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Integration Indicators */}
      <div>
        <h2 className="text-[#0e141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          Integration Indicators
        </h2>
        <div className="px-4 py-3">
          <div className="flex overflow-hidden rounded-xl border border-[#d0dbe7] bg-slate-50">
            <table className="flex-1">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left text-[#0e141b] w-[300px] text-sm font-medium leading-normal">
                    Integration
                  </th>
                  <th className="px-4 py-3 text-left text-[#0e141b] w-60 text-sm font-medium leading-normal">Status</th>
                  <th className="px-4 py-3 text-left text-[#0e141b] w-[300px] text-sm font-medium leading-normal">Comments</th>
                </tr>
              </thead>
              <tbody>
                {integrationStatus && Object.entries(integrationStatus).map(([key, integration]) => (
                  <tr key={key} className="border-t border-t-[#d0dbe7]">
                    <td className="h-[72px] px-4 py-2 w-[300px] text-[#0e141b] text-sm font-normal leading-normal capitalize">
                      {key === 'crew_db' ? 'Crew DB' : key.toUpperCase()}
                    </td>
                    <td className="h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                      <button
                        className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-medium leading-normal w-full"
                      >
                        <span className="truncate">
                          {integration.message} {getIntegrationStatusIcon(integration.status)}
                        </span>
                      </button>
                    </td>
                    <td className="h-[72px] px-4 py-2 w-[300px]">
                      <input
                        type="text"
                        placeholder="Add comments..."
                        className="w-full px-3 py-2 border border-[#d0dbe7] rounded-lg bg-white text-[#0e141b] placeholder:text-[#4e7297] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}