import React, { useState } from 'react';
import { Project } from '../../../types';
import { Save, X, Plus, RefreshCw, Download, Upload, ChevronRight, ChevronDown, Star, HelpCircle, PlusCircle, MinusCircle, FileText } from 'lucide-react';

interface InternalDebriefProps {
  project: Project;
}

interface CrewMember {
  id: string;
  name: string;
  role: string;
  overallRating: number;
  ratings: {
    roleClarity: number;
    taskCompletion: number;
    communication: number;
    problemSolving: number;
    professionalism: number;
  };
  comments: {
    roleClarity: string;
    taskCompletion: string;
    communication: string;
    problemSolving: string;
    professionalism: string;
    overall: string;
  };
}

interface KeyLearning {
  id: string;
  title: string;
  details: string;
  isOpen: boolean;
}

export function InternalDebrief({ project }: InternalDebriefProps) {
  const [overallRating, setOverallRating] = useState(4);
  const [whatWentWell, setWhatWentWell] = useState('');
  const [areasForImprovement, setAreasForImprovement] = useState('');
  const [executiveSummary, setExecutiveSummary] = useState('');
  
  const [technicalRatings, setTechnicalRatings] = useState({
    cashless: { rating: 5, comment: '' },
    accessControl: { rating: 4, comment: '' },
    network: { rating: 3, comment: '' },
    deployment: { rating: 4, comment: '' }
  });

  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([
    {
      id: '1',
      name: 'John Doe',
      role: 'Lead Technician',
      overallRating: 4,
      ratings: {
        roleClarity: 4,
        taskCompletion: 5,
        communication: 3,
        problemSolving: 4,
        professionalism: 5
      },
      comments: {
        roleClarity: '',
        taskCompletion: '',
        communication: '',
        problemSolving: '',
        professionalism: '',
        overall: ''
      }
    },
    {
      id: '2',
      name: 'Jane Smith',
      role: 'Operations Manager',
      overallRating: 5,
      ratings: {
        roleClarity: 5,
        taskCompletion: 5,
        communication: 5,
        problemSolving: 5,
        professionalism: 5
      },
      comments: {
        roleClarity: '',
        taskCompletion: '',
        communication: '',
        problemSolving: '',
        professionalism: '',
        overall: ''
      }
    },
    {
      id: '3',
      name: 'Mike Johnson',
      role: 'Security Supervisor',
      overallRating: 4,
      ratings: {
        roleClarity: 4,
        taskCompletion: 4,
        communication: 4,
        problemSolving: 4,
        professionalism: 4
      },
      comments: {
        roleClarity: '',
        taskCompletion: '',
        communication: '',
        problemSolving: '',
        professionalism: '',
        overall: ''
      }
    }
  ]);

  const [expandedCrew, setExpandedCrew] = useState<string[]>(['1']);
  
  const [keyLearnings, setKeyLearnings] = useState<KeyLearning[]>([
    { id: '1', title: 'Increased network redundancy is crucial for large-scale events.', details: '', isOpen: true },
    { id: '2', title: 'Pre-event access control dry-runs should be mandatory.', details: '', isOpen: false },
    { id: '3', title: '', details: '', isOpen: false }
  ]);

  const renderStars = (rating: number, onRate: (value: number) => void, size: 'sm' | 'md' = 'md') => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            onClick={() => onRate(value)}
            className="text-gray-300 hover:text-yellow-400 transition-colors"
          >
            <Star
              className={`${size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'} ${
                value <= rating ? 'fill-yellow-400 text-yellow-400' : ''
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const toggleCrewExpanded = (id: string) => {
    setExpandedCrew(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const toggleLearning = (id: string) => {
    setKeyLearnings(prev => 
      prev.map(learning => 
        learning.id === id 
          ? { ...learning, isOpen: !learning.isOpen }
          : learning
      )
    );
  };

  const addKeyLearning = () => {
    const newId = (keyLearnings.length + 1).toString();
    setKeyLearnings([...keyLearnings, { id: newId, title: '', details: '', isOpen: false }]);
  };

  const removeKeyLearning = (id: string) => {
    setKeyLearnings(keyLearnings.filter(learning => learning.id !== id));
  };

  const updateKeyLearning = (id: string, field: 'title' | 'details', value: string) => {
    setKeyLearnings(prev =>
      prev.map(learning =>
        learning.id === id ? { ...learning, [field]: value } : learning
      )
    );
  };

  return (
    <div className="p-6 space-y-8">
      <div className="bg-blue-50/50 p-6 rounded-lg border border-blue-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Internal Debrief</h3>
            <p className="text-sm text-gray-500">A comprehensive review of the project's execution. All fields are editable.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="bg-white text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-100 flex items-center text-sm border border-gray-300">
              Cancel
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 flex items-center text-sm">
              <Save className="w-4 h-4 mr-2" />
              Save Debrief
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Overall Success Rating */}
          <div className="grid grid-cols-4 items-center">
            <label className="block text-sm font-medium text-gray-700">Overall Success Rating</label>
            {renderStars(overallRating, setOverallRating)}
          </div>

          <hr className="border-blue-200" />

          {/* What Went Well */}
          <div className="grid grid-cols-4 items-start gap-4">
            <label className="block text-sm font-medium text-gray-700 mt-2">What Went Well</label>
            <textarea
              value={whatWentWell}
              onChange={(e) => setWhatWentWell(e.target.value)}
              className="col-span-3 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3"
              placeholder="Describe the successes and positive outcomes..."
              rows={3}
            />
          </div>

          {/* Areas for Improvement */}
          <div className="grid grid-cols-4 items-start gap-4">
            <label className="block text-sm font-medium text-gray-700 mt-2">Areas for Improvement</label>
            <textarea
              value={areasForImprovement}
              onChange={(e) => setAreasForImprovement(e.target.value)}
              className="col-span-3 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3"
              placeholder="Identify challenges and suggest improvements..."
              rows={3}
            />
          </div>

          <hr className="border-blue-200" />

          {/* Technical Performance */}
          <div>
            <div className="flex items-center mb-4">
              <h4 className="text-md font-semibold text-gray-800">Technical Performance</h4>
              <div className="relative ml-2 group">
                <HelpCircle className="w-4 h-4 text-gray-400 cursor-pointer" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
                  <div className="bg-gray-900 text-white text-sm rounded-md py-2 px-3 whitespace-nowrap">
                    Rate the technical aspects of the project
                  </div>
                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 absolute left-1/2 -translate-x-1/2 top-full"></div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(technicalRatings).map(([key, value]) => (
                <div key={key} className="grid grid-cols-4 gap-4 items-center">
                  <div className="flex items-center">
                    <label className="block text-sm font-medium text-gray-700 capitalize">
                      {key === 'cashless' ? 'Cashless System' : key === 'accessControl' ? 'Access Control' : key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                    <div className="relative ml-2 group">
                      <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                    </div>
                  </div>
                  {renderStars(value.rating, (rating) => 
                    setTechnicalRatings(prev => ({
                      ...prev,
                      [key]: { ...prev[key as keyof typeof technicalRatings], rating }
                    }))
                  )}
                  <textarea
                    value={value.comment}
                    onChange={(e) => 
                      setTechnicalRatings(prev => ({
                        ...prev,
                        [key]: { ...prev[key as keyof typeof technicalRatings], comment: e.target.value }
                      }))
                    }
                    className="col-span-2 block w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Comments..."
                    rows={1}
                  />
                </div>
              ))}
            </div>
          </div>

          <hr className="border-blue-200" />

          {/* Crew Performance */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <h4 className="text-md font-semibold text-gray-800">Crew Performance</h4>
                <button className="ml-3 text-blue-600 hover:bg-blue-100 p-1.5 rounded-full">
                  <PlusCircle className="w-5 h-5" />
                </button>
              </div>
              <button className="flex items-center text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50">
                <RefreshCw className="w-4 h-4 mr-1.5" />
                Force Populate
              </button>
            </div>

            <div className="space-y-2">
              {crewMembers.map((member) => (
                <details key={member.id} className="group bg-white rounded-lg border border-gray-200 overflow-hidden" open={expandedCrew.includes(member.id)}>
                  <summary 
                    className="flex items-center justify-between p-3 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleCrewExpanded(member.id);
                    }}
                  >
                    <span className="text-sm font-medium text-gray-800">{member.name} - {member.role}</span>
                    <div className="flex items-center">
                      <div className="mr-4">
                        {renderStars(member.overallRating, () => {}, 'sm')}
                      </div>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expandedCrew.includes(member.id) ? 'rotate-180' : ''}`} />
                    </div>
                  </summary>
                  
                  {expandedCrew.includes(member.id) && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-4">
                      {Object.entries(member.ratings).map(([category, rating]) => (
                        <div key={category} className="grid grid-cols-4 gap-4 items-center">
                          <label className="block text-sm font-medium text-gray-700">
                            {category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </label>
                          <div className="rating-sm">
                            {renderStars(rating, (newRating) => {
                              setCrewMembers(prev => 
                                prev.map(m => 
                                  m.id === member.id 
                                    ? { ...m, ratings: { ...m.ratings, [category]: newRating } }
                                    : m
                                )
                              );
                            }, 'sm')}
                          </div>
                          <textarea
                            value={member.comments[category as keyof typeof member.comments]}
                            onChange={(e) => {
                              setCrewMembers(prev =>
                                prev.map(m =>
                                  m.id === member.id
                                    ? { ...m, comments: { ...m.comments, [category]: e.target.value } }
                                    : m
                                )
                              );
                            }}
                            className="col-span-2 block w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Optional comments..."
                            rows={1}
                          />
                        </div>
                      ))}
                      
                      <hr className="border-gray-200" />
                      
                      <div className="grid grid-cols-4 gap-4 items-start">
                        <label className="block text-sm font-medium text-gray-700 mt-2">Overall Feedback</label>
                        <textarea
                          value={member.comments.overall}
                          onChange={(e) => {
                            setCrewMembers(prev =>
                              prev.map(m =>
                                m.id === member.id
                                  ? { ...m, comments: { ...m.comments, overall: e.target.value } }
                                  : m
                              )
                            );
                          }}
                          className="col-span-3 w-full p-2 rounded-md border border-gray-300 sm:text-sm bg-white"
                          placeholder="Overall feedback on leadership, technical skills..."
                          rows={2}
                        />
                      </div>
                    </div>
                  )}
                </details>
              ))}
            </div>
          </div>

          <hr className="border-blue-200" />

          {/* Key Learnings */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-semibold text-gray-800">Key Learnings</h4>
              <button 
                onClick={addKeyLearning}
                className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
              >
                <PlusCircle className="w-4 h-4 mr-1" />
                Add Learning
              </button>
            </div>

            <div className="space-y-3">
              {keyLearnings.map((learning) => (
                <details key={learning.id} className="group" open={learning.isOpen}>
                  <summary 
                    className="flex items-start cursor-pointer list-none"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleLearning(learning.id);
                    }}
                  >
                    <ChevronRight className={`w-5 h-5 text-gray-500 mt-1.5 transition-transform duration-300 ${learning.isOpen ? 'rotate-90' : ''}`} />
                    <input
                      className="ml-2 flex-1 bg-white border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 rounded-md shadow-sm"
                      type="text"
                      value={learning.title}
                      onChange={(e) => updateKeyLearning(learning.id, 'title', e.target.value)}
                      placeholder="Add a new key learning..."
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button 
                      className="ml-2 text-gray-400 hover:text-red-500 mt-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeKeyLearning(learning.id);
                      }}
                    >
                      <MinusCircle className="w-4 h-4" />
                    </button>
                  </summary>
                  
                  {learning.isOpen && (
                    <div className="pl-8 pt-2 pb-2">
                      <textarea
                        value={learning.details}
                        onChange={(e) => updateKeyLearning(learning.id, 'details', e.target.value)}
                        className="w-full bg-white border border-gray-300 p-3 rounded-md sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Add details, context, or action items..."
                        rows={3}
                      />
                    </div>
                  )}
                </details>
              ))}
            </div>
          </div>

          <hr className="border-blue-200" />

          {/* Debrief Meeting */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-semibold text-gray-800">Debrief Meeting</h4>
              <button className="text-white bg-green-600 hover:bg-green-700 flex items-center text-sm font-medium px-3 py-1.5 rounded-md">
                <Download className="w-4 h-4 mr-1" />
                Download Template for Debrief Meeting
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
                  Executive Summary
                </label>
                <textarea
                  id="summary"
                  name="summary"
                  value={executiveSummary}
                  onChange={(e) => setExecutiveSummary(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Provide a high-level overview of the debrief meeting..."
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Meeting Files</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-white cursor-pointer hover:bg-gray-50 transition">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <p className="pl-1">Upload a file or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, DOCX, PNG, JPG up to 10MB</p>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md border border-gray-200">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <span className="ml-2 text-sm font-medium text-gray-800">debrief_notes_final.pdf</span>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity Log</h3>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 space-y-4">
            <div className="flex items-start space-x-3">
              <img
                alt="User avatar"
                className="h-10 w-10 rounded-full"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              />
              <div className="flex-1">
                <p className="text-sm">
                  <a href="#" className="font-medium text-gray-900">Alexandre Dubois</a>
                  <span className="text-gray-500"> submitted the internal debrief.</span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Yesterday at 4:32 PM</p>
              </div>
            </div>
            
            <hr />
            
            <div className="flex items-start space-x-3">
              <img
                alt="User avatar"
                className="h-10 w-10 rounded-full"
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              />
              <div className="flex-1">
                <p className="text-sm">
                  <a href="#" className="font-medium text-gray-900">Chloé Lefevre</a>
                  <span className="text-gray-500"> edited the 'Key Learnings' section.</span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Yesterday at 2:15 PM</p>
              </div>
            </div>
            
            <hr />
            
            <div className="flex items-start space-x-3">
              <img
                alt="User avatar"
                className="h-10 w-10 rounded-full"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              />
              <div className="flex-1">
                <p className="text-sm">
                  <a href="#" className="font-medium text-gray-900">Alexandre Dubois</a>
                  <span className="text-gray-500"> updated the 'Crew Performance' ratings for John Doe.</span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">2 days ago at 11:03 AM</p>
              </div>
            </div>
            
            <hr />
            
            <div className="flex items-start space-x-3">
              <img
                alt="User avatar"
                className="h-10 w-10 rounded-full"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              />
              <div className="flex-1">
                <p className="text-sm">
                  <a href="#" className="font-medium text-gray-900">Laura Martin</a>
                  <span className="text-gray-500"> created the initial debrief draft.</span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">3 days ago at 9:45 AM</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 text-center border-t">
            <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800">
              View all activity
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}