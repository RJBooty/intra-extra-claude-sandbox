import React, { useState } from 'react';
import { Search as MagnifyingGlass, ChevronDown as CaretDown } from 'lucide-react';
import { ProjectView } from './ProjectView';
import { Project } from '../../types';

interface Project {
  id: string;
  name: string;
  dateCreated: string;
  eventDate: string;
  client: string;
  projectOwner: string;
  country: string;
  commercialStage: string;
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Tech Conference 2024',
    dateCreated: '2023-11-15',
    eventDate: '2024-05-20',
    client: 'Innovate Solutions',
    projectOwner: 'Alex Bennett',
    country: 'USA',
    commercialStage: 'Project Execution'
  },
  {
    id: '2',
    name: 'Music Festival 2024',
    dateCreated: '2023-12-01',
    eventDate: '2024-07-10',
    client: 'Harmony Events',
    projectOwner: 'Sophia Carter',
    country: 'UK',
    commercialStage: 'Contract Negotiation'
  },
  {
    id: '3',
    name: 'Sports Tournament 2024',
    dateCreated: '2024-01-10',
    eventDate: '2024-09-05',
    client: 'Global Sports Inc.',
    projectOwner: 'Ethan Davis',
    country: 'Spain',
    commercialStage: 'Proposal Development'
  },
  {
    id: '4',
    name: 'Corporate Summit 2024',
    dateCreated: '2024-02-20',
    eventDate: '2024-11-15',
    client: 'Business Leaders Group',
    projectOwner: 'Olivia Evans',
    country: 'Germany',
    commercialStage: 'Initial Contact'
  },
  {
    id: '5',
    name: 'Art Exhibition 2024',
    dateCreated: '2024-03-05',
    eventDate: '2024-12-01',
    client: 'Creative Arts Society',
    projectOwner: 'Liam Foster',
    country: 'France',
    commercialStage: 'Project Execution'
  },
  {
    id: '6',
    name: 'Film Festival 2024',
    dateCreated: '2024-04-15',
    eventDate: '2025-01-10',
    client: 'Cinema World',
    projectOwner: 'Ava Green',
    country: 'Italy',
    commercialStage: 'Contract Negotiation'
  },
  {
    id: '7',
    name: 'Food & Wine Expo 2024',
    dateCreated: '2024-05-01',
    eventDate: '2025-02-20',
    client: 'Taste of the World',
    projectOwner: 'Noah Harris',
    country: 'Australia',
    commercialStage: 'Proposal Development'
  },
  {
    id: '8',
    name: 'Fashion Show 2024',
    dateCreated: '2024-06-10',
    eventDate: '2025-03-05',
    client: 'Style & Glamour',
    projectOwner: 'Isabella Jones',
    country: 'Japan',
    commercialStage: 'Initial Contact'
  },
  {
    id: '9',
    name: 'Gaming Convention 2024',
    dateCreated: '2024-07-20',
    eventDate: '2025-04-15',
    client: 'Game On Inc.',
    projectOwner: 'Jackson King',
    country: 'South Korea',
    commercialStage: 'Project Execution'
  },
  {
    id: '10',
    name: 'Travel & Adventure Fair 2024',
    dateCreated: '2024-08-05',
    eventDate: '2025-05-01',
    client: 'Wanderlust Explorers',
    projectOwner: 'Mia Lewis',
    country: 'Brazil',
    commercialStage: 'Contract Negotiation'
  }
];

interface ProjectsListProps {
  onNavigate: (section: string) => void;
}

export function ProjectsList({ onNavigate }: ProjectsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = mockProjects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.projectOwner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Project Execution':
        return 'bg-green-100 text-green-800';
      case 'Contract Negotiation':
        return 'bg-blue-100 text-blue-800';
      case 'Proposal Development':
        return 'bg-yellow-100 text-yellow-800';
      case 'Initial Contact':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleProjectSelect = (project: any) => {
    // Convert the mock project to our Project type
    const projectData: Project = {
      id: project.id,
      project_id: project.name,
      client_id: '1',
      client: {
        id: '1',
        name: project.client,
        email: 'client@example.com',
        company: project.client,
        classification: 'Canopy',
        created_at: '',
        updated_at: ''
      },
      event_location: project.country,
      event_start_date: project.eventDate,
      event_end_date: project.eventDate,
      expected_attendance: 1000,
      event_type: 'Conference',
      current_phase: 1,
      phase_progress: 25,
      status: 'Active',
      created_at: project.dateCreated,
      updated_at: project.dateCreated
    };
    
    setSelectedProject(projectData);
  };

  // Show project detail view
  if (selectedProject) {
    return (
      <ProjectView
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <div className="flex min-w-72 flex-col gap-3 flex-1">
          <p className="text-[#101418] tracking-light text-[32px] font-bold leading-tight">Projects</p>
          <p className="text-[#5c728a] text-sm font-normal leading-normal">Manage all your projects in one place</p>
        </div>
        <button
          onClick={() => onNavigate('new-project')}
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-[#b2cbe5] text-[#101418] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#a5c1db] transition-colors"
        >
          <span className="truncate">Create New Project</span>
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <label className="flex flex-col min-w-40 h-12 w-full">
          <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
            <div className="text-[#5c728a] flex border-none bg-[#eaedf1] items-center justify-center pl-4 rounded-l-xl border-r-0">
              <MagnifyingGlass className="w-6 h-6" />
            </div>
            <input
              placeholder="Search projects"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101418] focus:outline-0 focus:ring-0 border-none bg-[#eaedf1] focus:border-none h-full placeholder:text-[#5c728a] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </label>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-3 p-3 flex-wrap pr-4">
        <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#eaedf1] pl-4 pr-2 hover:bg-gray-300 transition-colors">
          <p className="text-[#101418] text-sm font-medium leading-normal">Name</p>
          <CaretDown className="w-5 h-5 text-[#101418]" />
        </button>
        <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#eaedf1] pl-4 pr-2 hover:bg-gray-300 transition-colors">
          <p className="text-[#101418] text-sm font-medium leading-normal">Date Created</p>
          <CaretDown className="w-5 h-5 text-[#101418]" />
        </button>
        <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#eaedf1] pl-4 pr-2 hover:bg-gray-300 transition-colors">
          <p className="text-[#101418] text-sm font-medium leading-normal">Date of Event</p>
          <CaretDown className="w-5 h-5 text-[#101418]" />
        </button>
        <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#eaedf1] pl-4 pr-2 hover:bg-gray-300 transition-colors">
          <p className="text-[#101418] text-sm font-medium leading-normal">Client</p>
          <CaretDown className="w-5 h-5 text-[#101418]" />
        </button>
        <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#eaedf1] pl-4 pr-2 hover:bg-gray-300 transition-colors">
          <p className="text-[#101418] text-sm font-medium leading-normal">Project Owner</p>
          <CaretDown className="w-5 h-5 text-[#101418]" />
        </button>
        <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#eaedf1] pl-4 pr-2 hover:bg-gray-300 transition-colors">
          <p className="text-[#101418] text-sm font-medium leading-normal">Country</p>
          <CaretDown className="w-5 h-5 text-[#101418]" />
        </button>
        <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#eaedf1] pl-4 pr-2 hover:bg-gray-300 transition-colors">
          <p className="text-[#101418] text-sm font-medium leading-normal">Commercial Stage</p>
          <CaretDown className="w-5 h-5 text-[#101418]" />
        </button>
      </div>

      {/* Projects Table */}
      <div className="px-4 py-3">
        <div className="flex overflow-hidden rounded-xl border border-[#d4dbe2] bg-gray-50">
          <table className="flex-1">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-[#101418] w-[400px] text-sm font-medium leading-normal">Name</th>
                <th className="px-4 py-3 text-left text-[#101418] w-[400px] text-sm font-medium leading-normal">Date Created</th>
                <th className="px-4 py-3 text-left text-[#101418] w-[400px] text-sm font-medium leading-normal">Date of Event</th>
                <th className="px-4 py-3 text-left text-[#101418] w-[400px] text-sm font-medium leading-normal">Client</th>
                <th className="px-4 py-3 text-left text-[#101418] w-[400px] text-sm font-medium leading-normal">Project Owner</th>
                <th className="px-4 py-3 text-left text-[#101418] w-[400px] text-sm font-medium leading-normal">Country</th>
                <th className="px-4 py-3 text-left text-[#101418] w-60 text-sm font-medium leading-normal">Commercial Stage</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr 
                  key={project.id} 
                  className="border-t border-t-[#d4dbe2] hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => handleProjectSelect(project)}
                >
                  <td className="h-[72px] px-4 py-2 w-[400px] text-[#101418] text-sm font-normal leading-normal">
                    {project.name}
                  </td>
                  <td className="h-[72px] px-4 py-2 w-[400px] text-[#5c728a] text-sm font-normal leading-normal">
                    {project.dateCreated}
                  </td>
                  <td className="h-[72px] px-4 py-2 w-[400px] text-[#5c728a] text-sm font-normal leading-normal">
                    {project.eventDate}
                  </td>
                  <td className="h-[72px] px-4 py-2 w-[400px] text-[#5c728a] text-sm font-normal leading-normal">
                    {project.client}
                  </td>
                  <td className="h-[72px] px-4 py-2 w-[400px] text-[#5c728a] text-sm font-normal leading-normal">
                    {project.projectOwner}
                  </td>
                  <td className="h-[72px] px-4 py-2 w-[400px] text-[#5c728a] text-sm font-normal leading-normal">
                    {project.country}
                  </td>
                  <td className="h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                    <button className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 text-sm font-medium leading-normal w-full transition-colors ${getStageColor(project.commercialStage)}`}>
                      <span className="truncate">{project.commercialStage}</span>
                    </button>
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