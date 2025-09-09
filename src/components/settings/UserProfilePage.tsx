import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  AlertCircle, AlertTriangle, ArrowRight, Award, BarChart3, Briefcase, Building, 
  Calendar, CalendarDays, Car, CheckCircle, CheckSquare, ChevronLeft, 
  ChevronRight, Clock, Construction, Copy, CreditCard, DollarSign, Download, Edit, Eye, 
  EyeOff, FileText, FolderOpen, Globe, Hammer, HardHat, Heart, Key, Lock, Luggage, 
  Mail, MessageCircle, MessageSquare, Mountain, Package, Paperclip, Phone, Plane, 
  Plus, Receipt, Save, Scale, Search, Send, Settings, Shield, ShieldCheck, 
  Star, Trash2, TrendingUp, Trophy, Truck, Upload, User, UserCog, 
  UserX, Users, Wrench, X, XCircle, Zap, Zap as Lightning, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { TeamsIcon, SlackIcon, WhatsAppIcon, EmailIcon } from '../icons/BrandIcons';
import { userService, UserWithRole } from '../../lib/userService';

interface UserProfilePageProps {
  onBack: () => void;
}

export function UserProfilePage({ onBack }: UserProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'personal' | 'work' | 'compliance' | 'payments' | 'availability' | 'performance' | 'reports' | 'preferences'>('personal');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userProfile, setUserProfile] = useState<UserWithRole | null>(null);
  const [userError, setUserError] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showFinanceQueryModal, setShowFinanceQueryModal] = useState(false);
  const [financeQueryForm, setFinanceQueryForm] = useState({
    subject: '',
    invoice: '',
    description: '',
    attachment: null as File | null
  });
  const [financeQueryError, setFinanceQueryError] = useState(false);
  
  // Standard lists for dropdowns
  const NATIONALITIES = [
    'Afghan', 'Albanian', 'Algerian', 'American', 'Andorran', 'Angolan', 'Argentine', 'Armenian', 'Australian',
    'Austrian', 'Azerbaijani', 'Bahamian', 'Bahraini', 'Bangladeshi', 'Barbadian', 'Belarusian', 'Belgian',
    'Belizean', 'Beninese', 'Bhutanese', 'Bolivian', 'Bosnian', 'Brazilian', 'British', 'Bruneian', 'Bulgarian',
    'Burkinabe', 'Burmese', 'Burundian', 'Cambodian', 'Cameroonian', 'Canadian', 'Cape Verdean', 'Central African',
    'Chadian', 'Chilean', 'Chinese', 'Colombian', 'Comoran', 'Congolese', 'Costa Rican', 'Croatian', 'Cuban',
    'Cypriot', 'Czech', 'Danish', 'Djibouti', 'Dominican', 'Dutch', 'East Timorese', 'Ecuadorean', 'Egyptian',
    'Emirian', 'Equatorial Guinean', 'Eritrean', 'Estonian', 'Ethiopian', 'Fijian', 'Filipino', 'Finnish', 'French',
    'Gabonese', 'Gambian', 'Georgian', 'German', 'Ghanaian', 'Greek', 'Grenadian', 'Guatemalan', 'Guinea-Bissauan',
    'Guinean', 'Guyanese', 'Haitian', 'Herzegovinian', 'Honduran', 'Hungarian', 'Icelander', 'Indian', 'Indonesian',
    'Iranian', 'Iraqi', 'Irish', 'Israeli', 'Italian', 'Ivorian', 'Jamaican', 'Japanese', 'Jordanian',
    'Kazakhstani', 'Kenyan', 'Kittian and Nevisian', 'Kuwaiti', 'Kyrgyz', 'Laotian', 'Latvian', 'Lebanese',
    'Lesothan', 'Liberian', 'Libyan', 'Liechtensteiner', 'Lithuanian', 'Luxembourgish', 'Macedonian', 'Malagasy',
    'Malawian', 'Malaysian', 'Maldivan', 'Malian', 'Maltese', 'Marshallese', 'Mauritanian', 'Mauritian', 'Mexican',
    'Micronesian', 'Moldovan', 'Monacan', 'Mongolian', 'Moroccan', 'Mosotho', 'Motswana', 'Mozambican', 'Namibian',
    'Nauruan', 'Nepalese', 'New Zealander', 'Ni-Vanuatu', 'Nicaraguan', 'Nigerian', 'Nigerien', 'North Korean',
    'Norwegian', 'Omani', 'Pakistani', 'Palauan', 'Panamanian', 'Papua New Guinean', 'Paraguayan', 'Peruvian',
    'Polish', 'Portuguese', 'Qatari', 'Romanian', 'Russian', 'Rwandan', 'Saint Lucian', 'Salvadoran', 'Samoan',
    'San Marinese', 'Sao Tomean', 'Saudi', 'Scottish', 'Senegalese', 'Serbian', 'Seychellois', 'Sierra Leonean',
    'Singaporean', 'Slovakian', 'Slovenian', 'Solomon Islander', 'Somali', 'South African', 'South Korean',
    'Spanish', 'Sri Lankan', 'Sudanese', 'Surinamer', 'Swazi', 'Swedish', 'Swiss', 'Syrian', 'Taiwanese',
    'Tajik', 'Tanzanian', 'Thai', 'Togolese', 'Tongan', 'Trinidadian or Tobagonian', 'Tunisian', 'Turkish',
    'Tuvaluan', 'Ugandan', 'Ukrainian', 'Uruguayan', 'Uzbekistani', 'Venezuelan', 'Vietnamese', 'Welsh',
    'Yemenite', 'Zambian', 'Zimbabwean'
  ];

  const LANGUAGES = [
    'Afrikaans', 'Albanian', 'Amharic', 'Arabic', 'Armenian', 'Assamese', 'Aymara', 'Azerbaijani', 'Bambara',
    'Basque', 'Belarusian', 'Bengali', 'Bhojpuri', 'Bosnian', 'Bulgarian', 'Catalan', 'Cebuano', 'Chinese (Simplified)',
    'Chinese (Traditional)', 'Corsican', 'Croatian', 'Czech', 'Danish', 'Dhivehi', 'Dogri', 'Dutch', 'English',
    'Esperanto', 'Estonian', 'Ewe', 'Filipino', 'Finnish', 'French', 'Frisian', 'Galician', 'Georgian', 'German',
    'Greek', 'Guarani', 'Gujarati', 'Haitian Creole', 'Hausa', 'Hawaiian', 'Hebrew', 'Hindi', 'Hmong', 'Hungarian',
    'Icelandic', 'Igbo', 'Ilocano', 'Indonesian', 'Irish', 'Italian', 'Japanese', 'Javanese', 'Kannada', 'Kazakh',
    'Khmer', 'Kinyarwanda', 'Konkani', 'Korean', 'Krio', 'Kurdish', 'Kyrgyz', 'Lao', 'Latin', 'Latvian',
    'Lingala', 'Lithuanian', 'Luganda', 'Luxembourgish', 'Macedonian', 'Maithili', 'Malagasy', 'Malay', 'Malayalam',
    'Maltese', 'Maori', 'Marathi', 'Meiteilon', 'Mizo', 'Mongolian', 'Myanmar', 'Nepali', 'Norwegian', 'Nyanja',
    'Odia', 'Oromo', 'Pashto', 'Persian', 'Polish', 'Portuguese', 'Punjabi', 'Quechua', 'Romanian', 'Russian',
    'Samoan', 'Sanskrit', 'Scots Gaelic', 'Sepedi', 'Serbian', 'Sesotho', 'Shona', 'Sindhi', 'Sinhala', 'Slovak',
    'Slovenian', 'Somali', 'Spanish', 'Sundanese', 'Swahili', 'Swedish', 'Tagalog', 'Tajik', 'Tamil', 'Tatar',
    'Telugu', 'Thai', 'Tigrinya', 'Tsonga', 'Turkish', 'Turkmen', 'Twi', 'Ukrainian', 'Urdu', 'Uyghur', 'Uzbek',
    'Vietnamese', 'Welsh', 'Xhosa', 'Yiddish', 'Yoruba', 'Zulu'
  ];

  const LANGUAGE_LEVELS = ['Native', 'Fluent', 'Advanced', 'Intermediate', 'Conversational', 'Basic'];
  
  // Language selector state
  const [selectedLanguages, setSelectedLanguages] = useState([
    { language: 'English', level: 'Native' },
    { language: 'French', level: 'Conversational' }
  ]);
  const [languageSearch, setLanguageSearch] = useState('');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // My Team page states
  const [teamSearchTerm, setTeamSearchTerm] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [createInvoiceForm, setCreateInvoiceForm] = useState({
    invoiceNumber: 'INV-2024-007',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    poNumber: '',
    currency: 'GBP',
    project: '',
    items: [
      {
        description: 'On-site Day Rate (Manager)',
        details: '',
        category: 'Fee',
        subCategory: '',
        quantity: 10,
        rate: '350.00',
        amount: 3500.00
      },
      {
        description: 'Flights to Geneva',
        details: '',
        category: 'Expense',
        subCategory: 'Travel',
        quantity: 1,
        rate: '225.00',
        amount: 225.00
      }
    ],
    vatEnabled: true,
    vatRate: 20
  });
  const [createInvoiceError, setCreateInvoiceError] = useState(false);

  // Compliance Tab State
  const [showDocumentDetail, setShowDocumentDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);

  // Reports Tab State
  const reporteesRef = useRef<HTMLDivElement>(null);
  
  const scrollLeft = () => {
    if (reporteesRef.current) {
      reporteesRef.current.scrollBy({ left: -316, behavior: 'smooth' }); // card width + margin
    }
  };
  
  const scrollRight = () => {
    if (reporteesRef.current) {
      reporteesRef.current.scrollBy({ left: 316, behavior: 'smooth' }); // card width + margin
    }
  };

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        setUserError(null);
        const profile = await userService.getCurrentUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        setUserError(error instanceof Error ? error.message : 'Failed to load user profile');
        toast.error('Failed to load user profile. Using fallback data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Avatar Upload Handler
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPG, PNG, GIF)');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    try {
      setAvatarUploading(true);
      toast.loading('Uploading profile picture...');

      // Convert file to base64 data URL for persistent storage
      const imageUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      let cloudUploadFailed = false;
      
      // Update the user profile with the new avatar URL
      // Since we're using fallback profiles, we'll update the current user state
      if (userProfile) {
        const updatedProfile = {
          ...userProfile,
          avatar_url: imageUrl,
          updated_at: new Date().toISOString()
        };
        setUserProfile(updatedProfile);
        
        // Store the avatar URL in localStorage for persistence across sessions
        const storageKey = `avatar_${userProfile.email}`;
        localStorage.setItem(storageKey, imageUrl);
        
        // Try to upload to Supabase storage if possible
        try {
          const avatarUrl = await userService.updateAvatar(file);
          if (avatarUrl) {
            // Update with the actual Supabase URL
            const finalProfile = { ...updatedProfile, avatar_url: avatarUrl };
            setUserProfile(finalProfile);
            // Update localStorage with the real URL
            localStorage.setItem(storageKey, avatarUrl);
            console.log('Successfully uploaded to Supabase storage');
          }
        } catch (uploadError) {
          console.warn('Supabase upload failed, using local preview:', uploadError);
          cloudUploadFailed = true;
          // This is not a critical error - the local preview still works
          // We'll show a less alarming message to the user
          if (uploadError && typeof uploadError === 'object' && 'message' in uploadError) {
            console.warn('Cloud storage unavailable:', (uploadError as any).message);
          }
        }
      }

      toast.dismiss();
      const successMessage = cloudUploadFailed 
        ? 'Profile picture updated successfully! (Local storage only - cloud storage unavailable)'
        : 'Profile picture updated successfully!';
      toast.success(successMessage);
      
      // Clear userService cache to ensure fresh profile data on next load
      userService.clearCache();
      
      // Force other components to refresh by dispatching a custom event
      if (userProfile) {
        window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: userProfile }));
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.dismiss();
      toast.error('Failed to update profile picture');
    } finally {
      setAvatarUploading(false);
      // Reset the input so the same file can be uploaded again if needed
      event.target.value = '';
    }
  };

  // Language selector helper functions
  const addLanguage = (language: string, level: string = 'Basic') => {
    if (!selectedLanguages.some(lang => lang.language === language)) {
      setSelectedLanguages([...selectedLanguages, { language, level }]);
      setLanguageSearch('');
      setShowLanguageDropdown(false);
    }
  };

  const removeLanguage = (languageToRemove: string) => {
    setSelectedLanguages(selectedLanguages.filter(lang => lang.language !== languageToRemove));
  };

  const updateLanguageLevel = (language: string, level: string) => {
    setSelectedLanguages(selectedLanguages.map(lang => 
      lang.language === language ? { ...lang, level } : lang
    ));
  };

  const filteredLanguages = LANGUAGES.filter(lang => 
    lang.toLowerCase().includes(languageSearch.toLowerCase()) &&
    !selectedLanguages.some(selected => selected.language === lang)
  );

  // Compliance Tab Handlers
  const handleSelectDocument = (index: number) => {
    if (selectedDocuments.includes(index)) {
      setSelectedDocuments(selectedDocuments.filter(i => i !== index));
    } else {
      setSelectedDocuments([...selectedDocuments, index]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]); // All non-disabled documents
    }
    setSelectAll(!selectAll);
  };

  const handleDeleteDocument = (index: number) => {
    setDocumentToDelete(index);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    toast.success('Document deleted successfully');
    setShowDeleteModal(false);
    setDocumentToDelete(null);
  };

  const tabs = [
    { id: 'personal', label: 'Personal Details', icon: User },
    { id: 'work', label: 'Work Skills', icon: Briefcase },
    { id: 'compliance', label: 'Docs & Compliance', icon: Shield, badge: 2 },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'availability', label: 'Availability', icon: Calendar },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'reports', label: 'My Team', icon: Users },
    { id: 'preferences', label: 'Preferences', icon: Settings }
  ];

  // Personal Details Tab
  const renderPersonalTab = () => (
    <div className="space-y-6">
      {/* Basic Information and Contact Information - Top Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center border-b pb-3 mb-4">
            <User className="w-5 h-5 mr-2 text-gray-500" />
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600">First Name</label>
              <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 text-sm">
                {userProfile?.first_name || ""}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Last Name</label>
              <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 text-sm">
                {userProfile?.last_name || ""}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Preferred Name</label>
              <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 text-sm">
                {userProfile?.display_name || userProfile?.first_name || ""}
              </div>
            </div>
            <EditableField
              label="Date of Birth"
              value="21/08/92 (32 years old)"
              type="date"
            />
            <EditableField
              label="Gender"
              value="Female"
              isSelect={true}
              options={['Female', 'Male', 'Other', 'Prefer not to say']}
            />
            <EditableField
              label="Nationality"
              value="Australian"
              isSelect={true}
              options={NATIONALITIES}
            />
            <div className="col-span-1 md:col-span-2">
              <label className="text-xs font-medium text-gray-600">Languages Spoken</label>
              {!isEditMode ? (
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {selectedLanguages.map((lang, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                      {lang.language} ({lang.level})
                    </span>
                  ))}
                </div>
              ) : (
                <div className="mt-1.5 space-y-2">
                  {/* Selected Languages */}
                  <div className="flex flex-wrap gap-2">
                    {selectedLanguages.map((lang, index) => (
                      <div key={index} className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                        <span className="text-sm text-blue-900">{lang.language}</span>
                        <select 
                          value={lang.level} 
                          onChange={(e) => updateLanguageLevel(lang.language, e.target.value)}
                          className="text-xs border border-blue-300 rounded px-1 py-0.5 bg-white"
                        >
                          {LANGUAGE_LEVELS.map(level => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => removeLanguage(lang.language)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  {/* Add Language Input */}
                  <div className="relative">
                    <input
                      type="text"
                      value={languageSearch}
                      onChange={(e) => setLanguageSearch(e.target.value)}
                      onFocus={() => setShowLanguageDropdown(true)}
                      placeholder="Search and add languages..."
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {/* Language Dropdown */}
                    {showLanguageDropdown && languageSearch && filteredLanguages.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {filteredLanguages.slice(0, 10).map((language) => (
                          <button
                            key={language}
                            onClick={() => addLanguage(language)}
                            className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            {language}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center border-b pb-3 mb-4">
            <Phone className="w-5 h-5 mr-2 text-gray-500" />
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EditableField
              label="Email"
              value={userProfile?.email || ""}
              type="email"
            />
            <EditableField
              label="Mobile Phone"
              value="+61 412 345 678"
              type="tel"
            />
            <EditableField
              label="Work Number"
              value="+61 412 345 678"
              type="tel"
            />
            <EditableField
              label="Working Location"
              value="Remote"
              isSelect={true}
              options={['Remote', 'On-site', 'Hybrid', 'Flexible']}
            />
            <div className="col-span-1 md:col-span-2">
              <EditableField
                label="Home Address"
                value="123 Example St, Sydney, NSW 2090, Australia"
                isTextarea={true}
                placeholder="Enter your full home address"
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="text-xs font-medium text-gray-600">Profile Picture</label>
              <div className="mt-1 flex items-center gap-3 rounded-lg border border-dashed border-gray-300 px-6 py-2">
                <img 
                  alt="Profile Picture" 
                  className="h-8 w-8 rounded-full object-cover" 
                  src={userProfile?.avatar_url || "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop"}
                />
                <div className="text-left">
                  <div className="flex text-xs leading-5 text-gray-600">
                    <label className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 hover:text-indigo-500">
                      <span>{avatarUploading ? 'Uploading...' : 'Upload a file'}</span>
                      <input 
                        className="sr-only" 
                        type="file" 
                        accept="image/jpeg,image/jpg,image/png,image/gif"
                        onChange={handleAvatarUpload}
                        disabled={avatarUploading}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Me and Job Information - Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center border-b pb-3 mb-4">
            <User className="w-5 h-5 mr-2 text-gray-500" />
            About Me
          </h3>
          <EditableField
            label="Introduction"
            value="I'm a dedicated and passionate professional with over 8 years of experience in project management and international development. I thrive in collaborative environments and I'm always eager to take on new challenges. I'm excited to be part of this team and contribute to our shared goals. Outside of work, I'm an avid hiker and love exploring new cultures through travel and food."
            isTextarea={true}
            placeholder="Tell us about yourself, your background, interests, and what motivates you..."
          />
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center border-b pb-3 mb-4">
            <Briefcase className="w-5 h-5 mr-2 text-gray-500" />
            Job Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EditableField
              label="Job Title"
              value={userProfile?.job_title || "Project Manager"}
            />
            <EditableField
              label="Department"
              value={userProfile?.department || "International Development"}
            />
            <div className="col-span-1 md:col-span-2">
              <EditableField
                label="Brief Description"
                value="Manages and oversees international development projects, ensuring they are completed on time, within budget, and to the required quality standards."
                isTextarea={true}
                placeholder="Describe your role and responsibilities..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Documents - Third Row */}
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center border-b pb-3 mb-4">
          <FileText className="w-5 h-5 mr-2 text-gray-500" />
          Documents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 flex items-center mb-3 text-base">
              <FileText className="w-5 h-5 mr-2 text-gray-500" />
              Passport
            </h4>
            <div className="space-y-3">
              <EditableField
                label="Passport Number"
                value="E12345678"
                placeholder="Enter passport number"
              />
              <EditableField
                label="Expiry Date"
                value="15/06/2030"
                type="date"
                placeholder="Select expiry date"
              />
              <EditableField
                label="Country of Issue"
                value="Australia"
                isSelect={true}
                options={NATIONALITIES.map(nat => nat.replace(/an$|ian$|ish$|ese$|i$/, '').replace('American', 'USA').replace('British', 'UK'))}
                placeholder="Select country"
              />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 flex items-center mb-3 text-base">
              <Car className="w-5 h-5 mr-2 text-gray-500" />
              Driving License
            </h4>
            <div className="space-y-3">
              <EditableField
                label="License Number"
                value="987654321"
                placeholder="Enter license number"
              />
              <EditableField
                label="Country of Issue"
                value="Australia"
                isSelect={true}
                options={NATIONALITIES.map(nat => nat.replace(/an$|ian$|ish$|ese$|i$/, '').replace('American', 'USA').replace('British', 'UK'))}
                placeholder="Select country"
              />
              <EditableField
                label="Expiry Date"
                value="21/08/2028"
                type="date"
                placeholder="Select expiry date"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Emergency & Medical - Fourth Row */}
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center border-b pb-3 mb-4">
          <Heart className="w-5 h-5 mr-2 text-gray-500" />
          Emergency & Medical
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-800 flex items-center mb-3 text-base">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
              Emergency Information
            </h4>
            <div className="space-y-3">
              {!isEditMode ? (
                <>
                  <div>
                    <label className="text-xs font-medium text-red-700">Emergency Contact Name</label>
                    <div className="mt-1 p-2 bg-red-100 rounded-md text-red-900 border border-red-200 text-sm">Noah Thompson</div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-red-700">Relationship</label>
                    <div className="mt-1 p-2 bg-red-100 rounded-md text-red-900 border border-red-200 text-sm">Partner</div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-red-700">Emergency Contact Phone</label>
                    <div className="mt-1 p-2 bg-red-100 rounded-md text-red-900 border border-red-200 text-sm">+61 487 654 321</div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-medium text-red-700">Emergency Contact Name</label>
                    <input 
                      className="mt-1 block w-full border border-red-300 rounded-md px-3 py-2 text-sm bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      defaultValue="Noah Thompson"
                      placeholder="Enter emergency contact name"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-red-700">Relationship</label>
                    <select className="mt-1 block w-full border border-red-300 rounded-md px-3 py-2 text-sm bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent">
                      <option value="Partner">Partner</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Child">Child</option>
                      <option value="Friend">Friend</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-red-700">Emergency Contact Phone</label>
                    <input 
                      type="tel"
                      className="mt-1 block w-full border border-red-300 rounded-md px-3 py-2 text-sm bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      defaultValue="+61 487 654 321"
                      placeholder="Enter phone number"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 flex items-center mb-3 text-base">
              <Heart className="w-5 h-5 mr-2 text-yellow-500" />
              Medical Conditions
            </h4>
            <div className="space-y-3">
              {!isEditMode ? (
                <>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Allergies</label>
                    <div className="mt-1 p-2 bg-yellow-100 rounded-md text-red-700 font-medium border border-yellow-200 text-sm">Peanuts (anaphylactic)</div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Dietary Requirements</label>
                    <div className="mt-1 p-2 bg-yellow-100 rounded-md text-gray-800 border border-yellow-200 text-sm">Vegetarian</div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Allergies</label>
                    <textarea 
                      className="mt-1 block w-full border border-yellow-300 rounded-md px-3 py-2 text-sm bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      rows={2}
                      defaultValue="Peanuts (anaphylactic)"
                      placeholder="List any allergies and severity (e.g., mild, severe, anaphylactic)"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Dietary Requirements</label>
                    <select className="mt-1 block w-full border border-yellow-300 rounded-md px-3 py-2 text-sm bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
                      <option value="">No dietary requirements</option>
                      <option value="Vegetarian" selected>Vegetarian</option>
                      <option value="Vegan">Vegan</option>
                      <option value="Gluten-free">Gluten-free</option>
                      <option value="Halal">Halal</option>
                      <option value="Kosher">Kosher</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Work Skills Tab
  const renderWorkTab = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Work Skills</h2>
      </div>

      {/* Primary Roles & Experience */}
      <div className="bg-white shadow-sm rounded-xl p-8 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center pb-4 border-b border-gray-200">
          <Briefcase className="text-gray-500 mr-3" />
          Primary Roles & Experience
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8">
          <EditableField
            label="Primary Role"
            value="Stage Manager"
            isSelect={true}
            options={['Stage Manager', 'Event Coordinator', 'Technical Manager', 'Audio Technician', 'Lighting Technician', 'Other']}
          />
          <EditableField
            label="Secondary Role"
            value="Lighting Technician"
            isSelect={true}
            options={['Lighting Technician', 'Audio Technician', 'Stage Manager', 'Event Coordinator', 'Technical Manager', 'Other']}
          />
          <EditableField
            label="Years of Experience"
            value="8+ Years"
            isSelect={true}
            options={['0-1 Years', '1-2 Years', '2-5 Years', '5-8 Years', '8+ Years', '10+ Years']}
          />
          <div>
            <label className="block text-sm font-medium text-gray-600">Date Joined CASFID</label>
            <p className="mt-1 text-base text-gray-900 font-medium">15th March 2021</p>
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-600">Referral Source</label>
            <p className="mt-1 text-base text-gray-900 font-medium">Existing Crew Member: John Doe</p>
          </div>
        </div>
        <div className="mt-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <label className="block text-sm font-medium text-gray-600">Bio / Professional Summary</label>
          <p className="mt-1 text-sm text-gray-700 italic">"Highly organized and proactive Stage Manager with over 8 years of experience in managing large-scale theatre productions and corporate events. Proven ability to lead crews, manage schedules, and ensure seamless show execution. Also proficient in lighting setup and operation."</p>
        </div>
      </div>

      {/* Skills Matrix */}
      <div className="bg-white shadow-sm rounded-xl p-8 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center pb-4 border-b border-gray-200">
          <Construction className="text-gray-500 mr-3" />
          Skills Matrix
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-gray-50 p-6 rounded-lg border border-gray-200 flex flex-col items-center justify-center">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Skills Overview</h4>
            <div className="w-full max-w-xs h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 text-sm">Chart placeholder</p>
            </div>
            <div className="mt-6 w-full space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                  <span className="text-sm font-medium text-gray-700">Technical Skills</span>
                </div>
                <span className="text-sm font-semibold text-blue-600">3.5 / 5</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></span>
                  <span className="text-sm font-medium text-gray-700">Soft Skills</span>
                </div>
                <span className="text-sm font-semibold text-indigo-600">4.5 / 5</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-lg text-gray-800 mb-4 pb-3 border-b border-gray-200">Technical Skills</h4>
              <div className="space-y-0 overflow-hidden rounded-md border border-gray-200">
                {[
                  { skill: 'Cashless CS Experience', level: 4 },
                  { skill: 'Ticketing CS Experience', level: 3 },
                  { skill: 'Server Experience', level: 2 },
                  { skill: 'General Troubleshooting', level: 5 }
                ].map((item, index) => (
                  <div key={item.skill} className={`flex items-center justify-between py-4 px-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${index !== 3 ? 'border-b border-gray-200' : ''}`}>
                    <span className="font-medium text-gray-700">{item.skill}</span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`w-4 h-4 rounded-full ${
                            level <= item.level ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-lg text-gray-800 mb-4 pb-3 border-b border-gray-200">Soft Skills</h4>
              <div className="space-y-0 overflow-hidden rounded-md border border-gray-200">
                {[
                  { skill: 'Leadership', level: 5 },
                  { skill: 'Communication', level: 4 },
                  { skill: 'Problem Solving', level: 5 },
                  { skill: 'Teamwork', level: 4 }
                ].map((item, index) => (
                  <div key={item.skill} className={`flex items-center justify-between py-4 px-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${index !== 3 ? 'border-b border-gray-200' : ''}`}>
                    <span className="font-medium text-gray-700">{item.skill}</span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`w-4 h-4 rounded-full ${
                            level <= item.level ? 'bg-indigo-500' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 mt-2">
              <h4 className="font-semibold text-lg text-gray-700 mb-4">Skill Level per Category</h4>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-green-100 text-green-800">Senior Experience</span>
                <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800">Stage Management</span>
                <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800">Lighting</span>
                <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-purple-100 text-purple-800">CASFID Systems Expert</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Certifications & Licenses */}
      <div className="bg-white shadow-sm rounded-xl p-8 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center pb-4 border-b border-gray-200">
          <Award className="text-gray-500 mr-3" />
          Certifications & Licenses
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'First Aid', expiry: '12 Jun 2025', icon: Heart, color: 'green', status: 'valid' },
            { name: 'Electrical Safety', expiry: '01 Feb 2024', icon: Zap, color: 'red', status: 'expired' },
            { name: 'Working at Height', expiry: '20 Oct 2026', icon: Mountain, color: 'green', status: 'valid' },
            { name: 'Driving License', expiry: '30 Mar 2030', icon: Car, color: 'green', status: 'valid', extra: 'Class: B, C1' },
            { name: 'Heavy Goods License', expiry: null, icon: Truck, color: 'gray', status: 'not_held' },
            { name: 'Fork Lift License', expiry: '15 May 2025', icon: HardHat, color: 'green', status: 'valid' },
            { name: 'Telehandler License', expiry: null, icon: Construction, color: 'gray', status: 'not_held' },
            { name: 'Other: PASMA', expiry: '01 Dec 2024', icon: FileText, color: 'green', status: 'valid' }
          ].map((cert) => {
            const Icon = cert.icon;
            const isDisabled = cert.status === 'not_held';
            
            return (
              <div key={cert.name} className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                isDisabled 
                  ? 'bg-gray-50 border-gray-100' 
                  : 'bg-white border-gray-200 hover:shadow-md hover:border-blue-300'
              }`}>
                <div className="flex items-center">
                  <Icon className={`mr-3 text-2xl ${
                    cert.color === 'green' ? 'text-green-500' : 
                    cert.color === 'red' ? 'text-red-500' : 
                    'text-gray-400'
                  }`} size={24} />
                  <div>
                    <p className={`font-medium ${isDisabled ? 'text-gray-500' : 'text-gray-900'}`}>{cert.name}</p>
                    <p className={`text-sm ${
                      cert.status === 'expired' ? 'text-red-500' :
                      cert.status === 'not_held' ? 'text-gray-400' :
                      'text-gray-500'
                    }`}>
                      {cert.status === 'not_held' ? 'Not Held' : 
                       cert.extra ? `${cert.extra} | Expires: ${cert.expiry}` : 
                       cert.status === 'expired' ? `Expired: ${cert.expiry}` :
                       `Expires: ${cert.expiry}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className={`${isDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'}`} disabled={isDisabled}>
                    <Eye size={20} />
                  </button>
                  <button className={`${isDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'}`} disabled={isDisabled}>
                    <Download size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Docs & Compliance Tab
  const renderComplianceTab = () => {
    if (showDocumentDetail) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-lg space-y-8">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <button 
                  className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-4"
                  onClick={() => setShowDocumentDetail(false)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back to All Documents
                </button>
                <div className="flex items-center">
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-purple-500 text-white mr-4">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">Contractor_Agreement_v3.pdf</h4>
                    <p className="text-sm text-gray-500">Uploaded by You on 01 Apr 2024</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="text-gray-500 hover:text-blue-600 p-2 rounded-full bg-white border border-gray-300">
                  <Download className="w-4 h-4" />
                </button>
                <button className="text-gray-500 hover:text-gray-700 p-2 rounded-full bg-white border border-gray-300">
                  <Package className="w-4 h-4" />
                </button>
                <button className="text-gray-500 hover:text-red-600 p-2 rounded-full bg-white border border-gray-300">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center text-sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Update Document
                </button>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white p-6 rounded-lg border border-gray-200">
                <h5 className="text-lg font-medium text-gray-800 mb-4">Document Preview</h5>
                <div className="bg-gray-200 h-96 rounded-md flex items-center justify-center">
                  <p className="text-gray-500">Document preview not available.</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h5 className="text-lg font-medium text-gray-800 mb-4">Details</h5>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Status:</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">File Size:</span>
                      <span className="font-medium text-gray-800">2.1 MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Document Type:</span>
                      <span className="font-medium text-gray-800">Contract</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Signed Date:</span>
                      <span className="font-medium text-gray-800">02 Apr 2024</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Expiry Date:</span>
                      <span className="font-medium text-gray-800">31 Mar 2025</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h5 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-gray-500" />
                    Admin Notes
                  </h5>
                  <div className="space-y-4">
                    <textarea 
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
                      placeholder="Add a note for this document..." 
                      rows={3}
                    />
                    <button className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      <Save className="w-4 h-4 mr-2" />
                      Save Note
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded-lg shadow-lg space-y-8">
      {/* Mandatory Documents Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-800 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-gray-500" />
            Mandatory Documents
          </h3>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">Overall Completion</p>
              <p className="text-xs text-gray-500">3 of 4 documents completed</p>
            </div>
            <div className="w-48 bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <span className="text-sm font-semibold text-gray-800">75%</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <label className="text-sm font-medium text-green-700 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Contractor Agreement
            </label>
            <p className="text-base font-semibold text-gray-900 mt-1">Signed</p>
            <p className="text-xs text-gray-500 mt-1">Expiry: 31/03/2025</p>
            <div className="flex items-center space-x-2 mt-2">
              <button className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center">
                <Eye className="w-3 h-3 mr-1" /> View
              </button>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center">
                <Download className="w-3 h-3 mr-1" /> Download
              </button>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center">
                <Upload className="w-3 h-3 mr-1" /> Update Doc
              </button>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <label className="text-sm font-medium text-red-700 flex items-center">
              <XCircle className="w-4 h-4 mr-2" />
              NDA
            </label>
            <p className="text-base font-semibold text-gray-900 mt-1">Rejected</p>
            <p className="text-xs text-gray-500 mt-1">Expired on: 14/03/2024</p>
            <div className="flex items-center space-x-2 mt-2">
              <button className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center">
                <Eye className="w-3 h-3 mr-1" /> View
              </button>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center">
                <Download className="w-3 h-3 mr-1" /> Download
              </button>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center">
                <Upload className="w-3 h-3 mr-1" /> Update Doc
              </button>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <label className="text-sm font-medium text-blue-700 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Travel Insurance
            </label>
            <p className="text-base font-semibold text-gray-900 mt-1">Pending Review</p>
            <p className="text-xs text-gray-500 mt-1">Expiry: 31/12/2028</p>
            <div className="flex items-center space-x-2 mt-2">
              <button className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center">
                <Eye className="w-3 h-3 mr-1" /> View
              </button>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center">
                <Download className="w-3 h-3 mr-1" /> Download
              </button>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center">
                <Upload className="w-3 h-3 mr-1" /> Update Doc
              </button>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <label className="text-sm font-medium text-green-700 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Passport
            </label>
            <p className="text-base font-semibold text-gray-900 mt-1">Approved</p>
            <p className="text-xs text-gray-500 mt-1">Expiry: 01/01/2030</p>
            <div className="flex items-center space-x-2 mt-2">
              <button className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center">
                <Eye className="w-3 h-3 mr-1" /> View
              </button>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center">
                <Download className="w-3 h-3 mr-1" /> Download
              </button>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center">
                <Upload className="w-3 h-3 mr-1" /> Update Doc
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 -mx-6"></div>
      
      {/* All Documents Section */}
      <div className="space-y-4 pt-8">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-800 flex items-center">
            <FolderOpen className="w-5 h-5 mr-2 text-gray-500" />
            All Documents
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-gray-500" />
              <div className="text-sm text-gray-600 text-right whitespace-nowrap">
                <span>25MB / 100MB (25%)</span>
              </div>
            </div>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }}></div>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center text-sm whitespace-nowrap">
              <Upload className="w-4 h-4 mr-2" />
              Upload New
            </button>
          </div>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-64 text-sm" 
                placeholder="Search documents..." 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center text-sm px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50">
              <Settings className="w-4 h-4 mr-2" />
              Type
              <ChevronRight className="w-4 h-4 ml-2 -mr-1" />
            </button>
            <button className="flex items-center text-sm px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50">
              <BarChart3 className="w-4 h-4 mr-2" />
              Sort by: Name (A-Z)
              <ChevronRight className="w-4 h-4 ml-2 -mr-1" />
            </button>
            <label className="flex items-center text-sm text-gray-600">
              <input className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" type="checkbox" />
              <span className="ml-2">Show archived</span>
            </label>
          </div>
          <button className="flex items-center text-sm px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50">
            <Package className="w-4 h-4 mr-2" />
            Download All
          </button>
        </div>
        
        {/* Document List Header */}
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-2 flex items-center">
          <input 
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
          />
          <label className="ml-3 text-sm font-medium text-gray-700 flex-grow">Document Name & Info</label>
          <div className="flex items-center space-x-6 text-sm font-medium text-gray-500">
            <div className="w-32 text-center">Type</div>
            <div className="w-32 text-center">Upload Date</div>
            <div className="w-32 text-center">Expiration</div>
            <div className="w-28 text-center">Status</div>
            <div className="w-40 text-center">Actions</div>
          </div>
        </div>
        
        {/* Document List */}
        <div className="space-y-3 mt-4 overflow-y-scroll pr-2" style={{ maxHeight: '40rem' }}>
          {[
            {
              name: 'Contractor_Agreement_v3.pdf',
              subtitle: 'Signed: 02 Apr 2024',
              type: 'Contract',
              uploadDate: '01 Apr 2024',
              expiration: '31 Mar 2025',
              status: 'Approved',
              statusColor: 'bg-green-100 text-green-800',
              icon: 'gavel',
              iconBg: 'bg-purple-500'
            },
            {
              name: 'NDA_Agreement_Signed.pdf',
              subtitle: 'Expired: 14 Mar 2024',
              type: 'Contract',
              uploadDate: '15 Mar 2021',
              expiration: '14 Mar 2024',
              status: 'Expired',
              statusColor: 'bg-red-100 text-red-800',
              icon: 'description',
              iconBg: 'bg-red-500'
            },
            {
              name: 'Travel_Insurance_Policy.pdf',
              subtitle: 'Submitted by: User',
              type: 'Travel',
              uploadDate: '15 Mar 2021',
              expiration: '31 Dec 2028',
              status: 'Pending Review',
              statusColor: 'bg-blue-100 text-blue-800',
              icon: 'flight',
              iconBg: 'bg-blue-500'
            },
            {
              name: 'Health_Safety_Certificate.pdf',
              subtitle: 'Certified: 12 Jan 2024',
              type: 'Certificate',
              uploadDate: '12 Jan 2024',
              expiration: '12 Jan 2026',
              status: 'Approved',
              statusColor: 'bg-green-100 text-green-800',
              icon: 'shield',
              iconBg: 'bg-green-500'
            },
            {
              name: 'Passport_Scan_2024.pdf',
              subtitle: 'ID Verified: 05 Feb 2024',
              type: 'Identity',
              uploadDate: '05 Feb 2024',
              expiration: '01 Jan 2030',
              status: 'Approved',
              statusColor: 'bg-green-100 text-green-800',
              icon: 'passport',
              iconBg: 'bg-indigo-500'
            },
            {
              name: 'Bank_Details_Form.pdf',
              subtitle: 'Updated: 28 Mar 2024',
              type: 'Financial',
              uploadDate: '28 Mar 2024',
              expiration: 'N/A',
              status: 'Approved',
              statusColor: 'bg-green-100 text-green-800',
              icon: 'bank',
              iconBg: 'bg-emerald-500'
            },
            {
              name: 'Equipment_Training_Certificate.pdf',
              subtitle: 'Completed: 18 Feb 2024',
              type: 'Training',
              uploadDate: '20 Feb 2024',
              expiration: '18 Feb 2027',
              status: 'Approved',
              statusColor: 'bg-green-100 text-green-800',
              icon: 'certificate',
              iconBg: 'bg-orange-500'
            },
            {
              name: 'Emergency_Contact_Form.pdf',
              subtitle: 'Last updated: 10 Mar 2024',
              type: 'Personal',
              uploadDate: '10 Mar 2024',
              expiration: 'N/A',
              status: 'Approved',
              statusColor: 'bg-green-100 text-green-800',
              icon: 'contact',
              iconBg: 'bg-pink-500'
            },
            {
              name: 'Visa_Documentation.pdf',
              subtitle: 'Multi-entry visa',
              type: 'Travel',
              uploadDate: '22 Jan 2024',
              expiration: '15 Dec 2024',
              status: 'Expires Soon',
              statusColor: 'bg-yellow-100 text-yellow-800',
              icon: 'passport',
              iconBg: 'bg-yellow-500'
            },
            {
              name: 'Professional_References.pdf',
              subtitle: '3 references provided',
              type: 'Reference',
              uploadDate: '08 Apr 2024',
              expiration: 'N/A',
              status: 'Under Review',
              statusColor: 'bg-blue-100 text-blue-800',
              icon: 'reference',
              iconBg: 'bg-cyan-500'
            },
            {
              name: 'Tax_Form_W9.pdf',
              subtitle: 'Tax year: 2024',
              type: 'Tax',
              uploadDate: '15 Jan 2024',
              expiration: '31 Dec 2024',
              status: 'Approved',
              statusColor: 'bg-green-100 text-green-800',
              icon: 'tax',
              iconBg: 'bg-slate-500'
            },
            {
              name: 'Drug_Test_Results.pdf',
              subtitle: 'Test date: 25 Mar 2024',
              type: 'Medical',
              uploadDate: '26 Mar 2024',
              expiration: '25 Mar 2025',
              status: 'Approved',
              statusColor: 'bg-green-100 text-green-800',
              icon: 'medical',
              iconBg: 'bg-teal-500'
            },
            {
              name: 'Background_Check_Report.pdf',
              subtitle: 'Clearance level: Standard',
              type: 'Security',
              uploadDate: '02 Apr 2024',
              expiration: '02 Apr 2027',
              status: 'Approved',
              statusColor: 'bg-green-100 text-green-800',
              icon: 'security',
              iconBg: 'bg-gray-600'
            }
          ].map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center flex-grow">
                <input 
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-4" 
                  type="checkbox"
                  checked={selectedDocuments.includes(index)}
                  onChange={() => handleSelectDocument(index)}
                />
                <div className={`w-10 h-10 flex items-center justify-center rounded-lg flex-shrink-0 mr-4 ${doc.iconBg}`}>
                  {doc.icon === 'gavel' && <Scale className="w-5 h-5 text-white" />}
                  {doc.icon === 'description' && <FileText className="w-5 h-5 text-white" />}
                  {doc.icon === 'flight' && <Plane className="w-5 h-5 text-white" />}
                  {doc.icon === 'shield' && <Shield className="w-5 h-5 text-white" />}
                  {doc.icon === 'passport' && <CreditCard className="w-5 h-5 text-white" />}
                  {doc.icon === 'bank' && <Building className="w-5 h-5 text-white" />}
                  {doc.icon === 'certificate' && <Award className="w-5 h-5 text-white" />}
                  {doc.icon === 'contact' && <Phone className="w-5 h-5 text-white" />}
                  {doc.icon === 'reference' && <Users className="w-5 h-5 text-white" />}
                  {doc.icon === 'tax' && <FileText className="w-5 h-5 text-white" />}
                  {doc.icon === 'medical' && <Heart className="w-5 h-5 text-white" />}
                  {doc.icon === 'security' && <Lock className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{doc.name}</p>
                  <p className="text-sm text-gray-500">{doc.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-sm text-gray-600 w-32 text-center">{doc.type}</div>
                <div className="text-sm text-gray-600 w-32 text-center">{doc.uploadDate}</div>
                <div className={`text-sm w-32 text-center ${doc.status === 'Expired' ? 'text-red-600' : 'text-gray-600'}`}>
                  {doc.expiration}
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-28 justify-center whitespace-nowrap ${doc.statusColor}`}>
                  {doc.status}
                </span>
                <div className="flex items-center space-x-2 text-gray-500 w-40 justify-center">
                  <button 
                    className="hover:text-blue-600"
                    onClick={() => setShowDocumentDetail(true)}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    className="hover:text-blue-600"
                    onClick={() => toast.success('Document downloaded successfully')}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="hover:text-gray-700">
                    <Package className="w-4 h-4" />
                  </button>
                  <button 
                    className="hover:text-red-600"
                    onClick={() => handleDeleteDocument(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this document? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

  // Payments Tab
  const renderPaymentsTab = () => (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Payments</h1>
          <p className="mt-1 text-base text-gray-600">Manage your payment methods, rates, and view your transaction history.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowFinanceQueryModal(true)}
            className="flex items-center gap-2 rounded-md h-10 px-4 text-sm font-semibold text-indigo-600 border border-indigo-600 bg-white hover:bg-indigo-50 transition-colors flex-shrink-0"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Raise Finance Query</span>
          </button>
          <button 
            onClick={() => setShowCreateInvoiceModal(true)}
            className="flex items-center gap-2 rounded-md h-10 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Bank & Invoicing Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-5 border-b border-gray-200 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Bank & Invoicing Details</h2>
          </div>
          <button className="flex items-center gap-2 rounded-md h-9 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex-shrink-0">
            <span>Edit</span>
          </button>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">Bank Name</p>
              <p className="text-sm text-gray-900 font-medium">Global Finance Bank</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">Full Name on Account</p>
              <p className="text-sm text-gray-900 font-medium">John Doe</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">Account Number</p>
              <p className="text-sm text-gray-900 font-medium">•••••••••123</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">Sort Code</p>
              <p className="text-sm text-gray-900 font-medium">12-34-56</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">IBAN</p>
              <p className="text-sm text-gray-900 font-medium">GB29 NWBK 6016 1331 9268 19</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">BIC/SWIFT</p>
              <p className="text-sm text-gray-900 font-medium">NWBKGB2L</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md col-span-1 md:col-span-2">
              <p className="text-sm text-gray-600">Their Address</p>
              <p className="text-sm text-gray-900 font-medium">123 Example Street, London, E1 6AN, United Kingdom</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">Name/Company</p>
              <p className="text-sm text-gray-900 font-medium">Tech Solutions Inc.</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">VAT Number</p>
              <p className="text-sm text-gray-900 font-medium">GB123456789</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">UTR Number</p>
              <p className="text-sm text-gray-900 font-medium">9876543210</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">TIN Number</p>
              <p className="text-sm text-gray-900 font-medium">123-456-789</p>
            </div>
          </div>
          <div className="mt-5 p-3 rounded-md bg-yellow-50 border-l-4 border-yellow-400">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  Please ensure all payment details are accurate. Finance will not be liable for issues resulting from incorrect information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Three Column Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Rates */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Payment Rates</h2>
          </div>
          <div className="p-5">
            <p className="text-xs text-gray-600 mb-4">These are guide rates and are not fixed between projects. All invoices must be checked against the agreed project rates.</p>
            <div className="space-y-2 divide-y divide-gray-100">
              <div className="flex justify-between items-center py-2">
                <p className="text-sm text-gray-600">Day Rate</p>
                <p className="text-sm text-gray-900 font-medium">€500.00</p>
              </div>
              <div className="flex justify-between items-center py-2">
                <p className="text-sm text-gray-600">Travel Day</p>
                <p className="text-sm text-gray-900 font-medium">€250.00</p>
              </div>
              <div className="flex justify-between items-center py-2">
                <p className="text-sm text-gray-600">Manager Rate</p>
                <p className="text-sm text-gray-900 font-medium">€600.00</p>
              </div>
              <div className="flex justify-between items-center py-2">
                <p className="text-sm text-gray-600">Office Rate</p>
                <p className="text-sm text-gray-900 font-medium">€300.00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Earnings Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Earnings Breakdown</h2>
          </div>
          <div className="p-5">
            <div className="relative w-40 h-40 mx-auto">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle className="stroke-current text-gray-200" cx="18" cy="18" fill="none" r="15.9155" strokeWidth="3.8"></circle>
                <circle className="stroke-current text-blue-500" cx="18" cy="18" fill="none" r="15.9155" strokeDasharray="60, 100" strokeDashoffset="0" strokeWidth="3.8"></circle>
                <circle className="stroke-current text-green-500" cx="18" cy="18" fill="none" r="15.9155" strokeDasharray="25, 100" strokeDashoffset="-60" strokeWidth="3.8"></circle>
                <circle className="stroke-current text-red-500" cx="18" cy="18" fill="none" r="15.9155" strokeDasharray="15, 100" strokeDashoffset="-85" strokeWidth="3.8"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">€125k</span>
                <span className="text-xs text-gray-600">Total Earned</span>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
                  <span className="text-sm text-gray-600">Day Rate</span>
                </div>
                <p className="text-sm font-medium text-gray-900">€75,000</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                  <span className="text-sm text-gray-600">Manager Rate</span>
                </div>
                <p className="text-sm font-medium text-gray-900">€31,250</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-red-500"></div>
                  <span className="text-sm text-gray-600">Other</span>
                </div>
                <p className="text-sm font-medium text-gray-900">€18,750</p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Revenue Overview</h2>
          </div>
          <div className="p-5">
            <div className="flex justify-between items-center mb-4">
              <p className="text-2xl font-bold text-gray-900">€45,200.00</p>
              <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>12.5% vs last year</span>
              </div>
            </div>
            <div className="h-32">
              <div className="h-full flex items-end justify-between gap-1">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => {
                  const heights = [60, 80, 50, 70, 90, 65, 40, 55, 35, 45, 25, 50];
                  const isCurrentYear = index < 8;
                  return (
                    <div key={month} className="flex flex-col items-center gap-2 w-full">
                      <div 
                        className={`w-full rounded-t-md ${isCurrentYear ? 'bg-indigo-600' : 'bg-gray-300'}`} 
                        style={{ height: `${heights[index]}%` }}
                      ></div>
                      <p className="text-xs text-gray-600">{month}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-indigo-600"></div>
                  <span>Current Year</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-gray-300"></div>
                  <span>Previous Year</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Payment History</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input 
                className="w-full sm:w-48 pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500" 
                placeholder="Search by project..." 
                type="text"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <button className="flex items-center gap-2 rounded-md h-9 px-4 text-sm font-semibold text-gray-600 border border-gray-300 bg-white hover:bg-gray-50 transition-colors">
              <Settings className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <button 
              onClick={() => setShowFinanceQueryModal(true)}
              className="flex items-center gap-2 rounded-md h-9 px-4 text-sm font-semibold text-indigo-600 border border-indigo-600 bg-white hover:bg-indigo-50 transition-colors flex-shrink-0"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Raise Finance Query</span>
            </button>
            <button 
              onClick={() => setShowCreateInvoiceModal(true)}
              className="flex items-center gap-2 rounded-md h-9 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Invoice</span>
            </button>
          </div>
        </div>
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Invoice Details</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="hidden lg:table-cell px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date Submitted</th>
                  <th className="hidden lg:table-cell px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date Paid</th>
                  <th className="hidden sm:table-cell px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {[
                  { invoice: 'INV-00123', project: 'Project Alpha', amount: '€1,200.00', submitted: 'Aug 1, 2023', paid: 'Aug 15, 2023', status: 'Paid', statusColor: 'bg-blue-50 text-blue-700' },
                  { invoice: 'INV-00124', project: 'Project Beta', amount: '€800.00', submitted: 'Sep 5, 2023', paid: '-', status: 'Due', statusColor: 'bg-yellow-50 text-yellow-700' },
                  { invoice: 'INV-00125', project: 'Project Gamma', amount: '€500.00', submitted: 'Sep 15, 2023', paid: '-', status: 'Overdue', statusColor: 'bg-red-50 text-red-700' }
                ].map((payment, index) => (
                  <tr key={index} className="hover:bg-gray-50 border-b border-gray-200 last:border-b-0 transition-colors duration-150">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.invoice}</div>
                      <div className="text-sm text-gray-600">{payment.project}</div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.amount}</td>
                    <td className="hidden lg:table-cell px-5 py-4 whitespace-nowrap text-sm text-gray-600">{payment.submitted}</td>
                    <td className="hidden lg:table-cell px-5 py-4 whitespace-nowrap text-sm text-gray-600">{payment.paid}</td>
                    <td className="hidden sm:table-cell px-5 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${payment.statusColor}`}>
                        {payment.status === 'Paid' && <CheckCircle className="w-4 h-4 mr-1.5" />}
                        {payment.status === 'Due' && <Clock className="w-4 h-4 mr-1.5" />}
                        {payment.status === 'Overdue' && <AlertCircle className="w-4 h-4 mr-1.5" />}
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1.5 rounded-md h-8 px-3 text-xs font-semibold text-gray-600 border border-gray-300 bg-white hover:bg-gray-50 transition-colors">
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </button>
                        <button className="flex items-center gap-1.5 rounded-md h-8 px-3 text-xs font-semibold text-gray-600 border border-gray-300 bg-white hover:bg-gray-50 transition-colors">
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="p-5 border-t border-gray-200 text-center">
          <a className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors" href="#">
            View All History
          </a>
        </div>
      </div>
    </div>
  );

  // Availability Tab
  const renderAvailabilityTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
      <div className="lg:col-span-3">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-0 pb-0 border-b-0">Calendar View</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-lg font-medium text-gray-800">May 2024</span>
              <button className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-800">View Year</button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="grid grid-cols-7 gap-px text-center text-xs font-semibold text-gray-500 border-b border-gray-200">
            <div className="py-2">Mon</div>
            <div className="py-2">Tue</div>
            <div className="py-2">Wed</div>
            <div className="py-2">Thu</div>
            <div className="py-2">Fri</div>
            <div className="py-2">Sat</div>
            <div className="py-2">Sun</div>
          </div>
          <div className="grid grid-cols-7 gap-1 p-1">
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm text-gray-400 cursor-not-allowed">29</div>
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm text-gray-400 cursor-not-allowed">30</div>
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm bg-green-100 text-green-800 hover:bg-green-200">1</div>
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm bg-green-100 text-green-800 hover:bg-green-200">2</div>
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm bg-green-100 text-green-800 hover:bg-green-200">3</div>
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm bg-black text-white hover:bg-gray-800">4</div>
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm bg-black text-white hover:bg-gray-800">5</div>
            
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm bg-red-100 text-red-800 hover:bg-red-200">
              6<span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-blue-600" title="Geneva Motor Show"></span>
            </div>
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm bg-red-100 text-red-800 hover:bg-red-200">
              7<span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-blue-600" title="Geneva Motor Show"></span>
            </div>
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm bg-red-100 text-red-800 hover:bg-red-200">
              8<span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-blue-600" title="Geneva Motor Show"></span>
            </div>
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm bg-red-100 text-red-800 hover:bg-red-200">
              9<span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-blue-600" title="Geneva Motor Show"></span>
            </div>
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm bg-red-100 text-red-800 hover:bg-red-200">
              10<span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-blue-600" title="Geneva Motor Show"></span>
            </div>
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm bg-red-100 text-red-800 hover:bg-red-200">
              11<span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-blue-600" title="Geneva Motor Show"></span>
            </div>
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm bg-red-100 text-red-800 hover:bg-red-200">
              12<span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-blue-600" title="Geneva Motor Show"></span>
            </div>
            
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm bg-red-100 text-red-800 hover:bg-red-200">
              13<span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-blue-600" title="Geneva Motor Show"></span>
            </div>
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm bg-red-100 text-red-800 hover:bg-red-200">
              14<span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-blue-600" title="Geneva Motor Show"></span>
            </div>
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm font-bold text-blue-600 border border-blue-600 bg-red-100 text-red-800 hover:bg-red-200">
              15<span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-blue-600" title="Geneva Motor Show"></span>
            </div>
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm bg-amber-100 text-amber-800 hover:bg-amber-200">
              16<span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-purple-500" title="Project Hold: Paris Olympics"></span>
            </div>
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm bg-amber-100 text-amber-800 hover:bg-amber-200">
              17<span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-purple-500" title="Project Hold: Paris Olympics"></span>
            </div>
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm bg-amber-100 text-amber-800 hover:bg-amber-200">
              18<span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-purple-500" title="Project Hold: Paris Olympics"></span>
            </div>
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm bg-amber-100 text-amber-800 hover:bg-amber-200">
              19<span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-purple-500" title="Project Hold: Paris Olympics"></span>
            </div>
            
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm bg-green-100 text-green-800 hover:bg-green-200">20</div>
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm bg-green-100 text-green-800 hover:bg-green-200">21</div>
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm bg-green-100 text-green-800 hover:bg-green-200">22</div>
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm bg-green-100 text-green-800 hover:bg-green-200">23</div>
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm bg-green-100 text-green-800 hover:bg-green-200">24</div>
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm bg-green-100 text-green-800 hover:bg-green-200">25</div>
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm bg-green-100 text-green-800 hover:bg-green-200">26</div>
            
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm bg-red-100 text-red-800 hover:bg-red-200">
              27<span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-gray-500" title="Holiday"></span>
            </div>
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm bg-red-100 text-red-800 hover:bg-red-200">
              28<span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-gray-500" title="Holiday"></span>
            </div>
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm bg-red-100 text-red-800 hover:bg-red-200">
              29<span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-gray-500" title="Holiday"></span>
            </div>
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm bg-green-100 text-green-800 hover:bg-green-200">30</div>
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm bg-green-100 text-green-800 hover:bg-green-200">31</div>
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm text-gray-400 cursor-not-allowed">1</div>
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer text-sm text-gray-400 cursor-not-allowed">2</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center"><span className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></span>Available</div>
            <div className="flex items-center"><span className="h-2.5 w-2.5 rounded-full bg-red-500 mr-2"></span>Booked</div>
            <div className="flex items-center"><span className="h-2.5 w-2.5 rounded-full bg-amber-500 mr-2"></span>Pencilled In</div>
            <div className="flex items-center"><span className="h-2.5 w-2.5 rounded-full bg-gray-400 mr-2"></span>Personal Holiday</div>
            <div className="flex items-center"><span className="h-2.5 w-2.5 rounded-full bg-black mr-2"></span>Blackout Date</div>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg flex items-center text-sm mt-2 sm:mt-0 whitespace-nowrap">
            <Calendar className="mr-1 w-4 h-4" />
            Edit Availability
          </button>
        </div>
        
        <div className="mt-8">
          <h3 className="flex items-center text-xl font-bold text-amber-600 mb-4 pb-2 border-b border-amber-500">
            <AlertTriangle className="mr-3 w-5 h-5 text-amber-500" />
            Scheduling Clashes
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="w-12 h-12 flex flex-col items-center justify-center bg-amber-100 text-amber-700 rounded-md">
                <span className="text-xs font-medium">MAY</span>
                <span className="text-xl font-bold">15</span>
              </div>
              <div>
                <p className="font-bold text-amber-800">Clash Detected: Project Overlap</p>
                <p className="text-sm text-gray-600 mt-1">This individual has two confirmed projects overlapping on this date:</p>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
                  <li><span className="font-medium">Geneva Motor Show</span> (Ends 15 May)</li>
                  <li><span className="font-medium">New Project Alpha</span> (Starts 15 May)</li>
                </ul>
                <button className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800">Resolve Clash</button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="flex items-center text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
            <CheckSquare className="mr-3 w-5 h-5 text-gray-500" />
            Upcoming Projects
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 flex flex-col items-center justify-center bg-red-100 text-red-700 rounded-md">
                <span className="text-xs font-medium">MAY</span>
                <span className="text-xl font-bold">06</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">Geneva Motor Show</p>
                <p className="text-sm text-gray-500">06 May - 15 May 2024</p>
                <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Confirmed</span>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 flex flex-col items-center justify-center bg-amber-100 text-amber-700 rounded-md">
                <span className="text-xs font-medium">MAY</span>
                <span className="text-xl font-bold">16</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">Project Hold: Paris Olympics</p>
                <p className="text-sm text-gray-500">16 May - 19 May 2024</p>
                <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Pencilled In</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <button className="text-sm font-medium text-blue-600 hover:text-blue-800">View All Upcoming & Past Projects</button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="lg:col-span-2 space-y-8">
        <div>
          <h3 className="flex items-center text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
            <Plane className="mr-3 w-5 h-5 text-gray-500" />
            Travel Preferences
          </h3>
          <div className="space-y-3">
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <p className="block text-sm font-medium text-gray-500 mb-1">Home Airport</p>
              <p className="mt-1 text-lg text-gray-900 font-medium">LHR - London Heathrow</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <p className="block text-sm font-medium text-gray-500 mb-1">Preferred Plane Seat</p>
              <div className="mt-2 flex space-x-4">
                <label className="inline-flex items-center">
                  <input checked className="form-radio text-blue-600" name="plane-seat" type="radio" value="aisle" />
                  <span className="ml-2 text-base text-gray-900 font-medium">Aisle</span>
                </label>
                <label className="inline-flex items-center">
                  <input className="form-radio text-blue-600" name="plane-seat" type="radio" value="middle" />
                  <span className="ml-2 text-base text-gray-900 font-medium">Middle</span>
                </label>
                <label className="inline-flex items-center">
                  <input className="form-radio text-blue-600" name="plane-seat" type="radio" value="window" />
                  <span className="ml-2 text-base text-gray-900 font-medium">Window</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="flex items-center text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
            <CreditCard className="mr-3 w-5 h-5 text-gray-500" />
            Frequent Flyer Numbers
          </h3>
          <div className="space-y-3">
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <p className="block text-sm font-medium text-gray-500 mb-1">British Airways</p>
              <p className="mt-1 text-lg text-gray-900 font-medium">BA12345678</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <p className="block text-sm font-medium text-gray-500 mb-1">Virgin Atlantic</p>
              <p className="mt-1 text-lg text-gray-900 font-medium">VS87654321</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Performance Tab
  const renderPerformanceTab = () => (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-2 space-y-8">
        {/* Performance Summary */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">Performance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-medium text-gray-500 truncate">Events Worked</h4>
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
              <p className="mt-1 text-2xl font-semibold text-gray-900">26</p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-medium text-gray-500 truncate">Overall Rating</h4>
                <Star className="w-4 h-4 text-gray-400" />
              </div>
              <div className="mt-1 flex items-center">
                <p className="text-2xl font-semibold text-gray-900">4.2</p>
                <div className="relative ml-4 flex-1">
                  <div className="bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '84%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-medium text-gray-500 truncate">Reliability Score</h4>
                <CheckCircle2 className="w-4 h-4 text-gray-400" />
              </div>
              <div className="mt-1 flex items-center">
                <p className="text-2xl font-semibold text-gray-900">97%</p>
                <div className="relative ml-4 flex-1">
                  <div className="bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '97%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-medium text-gray-500 truncate">Client Feedback</h4>
                <MessageSquare className="w-4 h-4 text-gray-400" />
              </div>
              <div className="mt-1 flex items-center">
                <p className="text-2xl font-semibold text-gray-900">4.5 <span className="text-base font-medium text-gray-500">/ 5</span></p>
                <div className="relative ml-4 flex-1">
                  <div className="bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Event History */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">Event History</h3>
            <div className="space-y-4">
              {[
                { name: 'Geneva Motor Show', dates: '06 May - 15 May 2024', status: 'Completed', statusColor: 'green' },
                { name: 'Mobile World Congress', dates: '26 Feb - 01 Mar 2024', status: 'Completed', statusColor: 'green' },
                { name: 'CES Las Vegas', dates: '09 Jan - 12 Jan 2024', status: 'Completed', statusColor: 'green' },
                { name: 'Web Summit Lisbon', dates: '13 Nov - 16 Nov 2023', status: 'Canceled (by crew)', statusColor: 'red' }
              ].map((event) => (
                <div key={event.name} className="p-4 bg-gray-50 border rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">{event.name}</p>
                    <p className="text-sm text-gray-500">{event.dates}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 ${
                      event.statusColor === 'green' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {event.status}
                    </span>
                    <a href="#" className="text-sm font-medium text-blue-600 hover:underline block">View Details</a>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <button className="text-sm font-medium text-blue-600 hover:text-blue-800">View Full Event History</button>
            </div>
          </div>

          {/* Training History */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">Training History</h3>
            <div className="space-y-4">
              {[
                { name: 'Health & Safety Level 2', date: 'Completed Mar 2023', status: 'Completed' },
                { name: 'Advanced Rigging Certification', date: 'Completed Jan 2023', status: 'Completed' },
                { name: 'Fire Marshal Training', date: 'Completed Jan 2023', status: 'Completed' },
                { name: 'Working at Height', date: 'Completed Oct 2022', status: 'Completed' }
              ].map((training) => (
                <a key={training.name} href="#" className="p-4 bg-gray-50 border rounded-lg flex justify-between items-center hover:bg-gray-100 transition-colors duration-200">
                  <div>
                    <p className="font-semibold text-gray-800">{training.name}</p>
                    <p className="text-sm text-gray-500">{training.date}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {training.status}
                    </span>
                  </div>
                </a>
              ))}
            </div>
            <div className="mt-6 text-center">
              <button className="text-sm font-medium text-blue-600 hover:text-blue-800">View Full Training History</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Awards & Recognition */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">Awards & Recognition</h3>
            <div className="space-y-6">
              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 flex items-start rounded h-full">
                <Trophy className="text-yellow-500 mr-4 w-8 h-8" />
                <div>
                  <p className="font-semibold text-gray-800">"Team Player of the Event" Award</p>
                  <p className="text-sm text-gray-600">Awarded at Mobile World Congress 2024 for exceptional collaboration and support.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Client Feedback */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">Client Feedback</h3>
            <div className="space-y-6">
              <div className="p-4 bg-green-50 border-l-4 border-green-400 flex items-start rounded">
                <Star className="text-green-500 mr-4 w-8 h-8" />
                <div className="w-full">
                  <h4 className="font-semibold text-gray-800">5-Star Client Feedback</h4>
                  <div className="mt-2 text-sm text-gray-700 space-y-3">
                    <div className="border-b border-gray-200 pb-3">
                      <div className="flex items-center mb-1">
                        <span className="font-medium text-gray-900 mr-2">Geneva Motor Show</span>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                      </div>
                      <blockquote className="italic text-gray-600">
                        "{userProfile?.first_name || 'This team member'} was an absolute star. Proactive, professional, and a pleasure to work with. Our client was extremely impressed."
                      </blockquote>
                    </div>
                    <div>
                      <div className="flex items-center mb-1">
                        <span className="font-medium text-gray-900 mr-2">CES Las Vegas</span>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                      </div>
                      <blockquote className="italic text-gray-600">"Went above and beyond to ensure our stand was perfect. Fantastic attitude."</blockquote>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Internal Use Only Sidebar */}
      <div className="space-y-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-red-800 flex items-center mb-6 pb-3 border-b border-red-200">
            <Lock className="mr-2 w-5 h-5" />
            Internal Use Only
          </h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-base font-semibold text-gray-700 mb-2">Internal Rating</h4>
              <div className="bg-orange-50 border border-orange-200 rounded-md p-3 space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Overall Assessment</span>
                    <div className="flex items-center">
                      <Star className="w-6 h-6 text-orange-400 fill-current" />
                      <Star className="w-6 h-6 text-orange-400 fill-current" />
                      <Star className="w-6 h-6 text-gray-300" />
                      <Star className="w-6 h-6 text-gray-300" />
                      <Star className="w-6 h-6 text-gray-300" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Based on PM feedback and reliability.</p>
                </div>
                <div className="border-t border-orange-100 pt-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Rehire Status</h4>
                  <div className="flex items-center space-x-4">
                    <select className="block w-full shadow-sm text-sm py-1 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                      <option className="text-amber-700" selected>Requires Approval</option>
                      <option className="text-green-700">Approved</option>
                      <option className="text-red-700">Do Not Rehire</option>
                      <option className="text-gray-700">Not Set</option>
                    </select>
                    <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-3 rounded-lg text-xs">
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-base font-semibold text-gray-700 mb-2">Performance Comments</h4>
              <div className="bg-white border rounded-md p-3">
                <p className="text-sm text-gray-600">While technically proficient, Ava showed some issues with punctuality at CES Las Vegas. Monitor closely on next project.</p>
                <p className="mt-2 text-xs text-gray-400 text-right">- Comment by John Smith (PM) on 20 Jan 2024</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-base font-semibold text-gray-700 mb-2">Internal Notes</h4>
              <div className="bg-white border rounded-md p-3">
                <p className="text-sm text-gray-600">Marked as a "Do Not Use" by PM Jane Doe on 15 Nov 2023 due to last-minute cancellation for Web Summit. Clearance required from senior management before re-booking.</p>
                <p className="mt-2 text-xs text-gray-400 text-right">- Note added by Admin on 16 Nov 2023</p>
              </div>
              <div className="mt-4">
                <textarea className="block w-full shadow-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm p-2" placeholder="Add a new internal note..." rows={3}></textarea>
                <button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg flex items-center text-sm">
                  <CheckCircle2 className="mr-1 w-4 h-4" />
                  Confirm Note
                </button>
              </div>
            </div>
            
            <div className="border-t border-red-200 pt-6">
              <h4 className="text-base font-semibold text-gray-700 mb-2 flex items-center">
                <AlertTriangle className="text-amber-500 mr-2 w-5 h-5" />
                Incident Reports
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">1</span>
              </h4>
              <div className="bg-white border rounded-md p-3">
                <p className="font-semibold text-gray-800">Late Arrival (CES Las Vegas)</p>
                <p className="text-sm text-gray-600 mt-1">Arrived 45 minutes late on Day 2, citing transport issues. Impacted initial setup schedule.</p>
                <p className="mt-2 text-xs text-gray-400 text-right">Report #INC-4563 - Filed 10 Jan 2024</p>
                <a href="#" className="text-sm font-medium text-blue-600 hover:underline mt-1 inline-block">View Full Report</a>
              </div>
            </div>
            
            <div>
              <h4 className="text-base font-semibold text-gray-700 mb-2">Event Feedback & History</h4>
              <div className="bg-white border rounded-md">
                <ul className="divide-y divide-gray-200">
                  {[
                    { name: 'Geneva Motor Show', date: 'May 2024', hasIncident: false },
                    { name: 'Mobile World Congress', date: 'Feb 2024', hasIncident: false },
                    { name: 'CES Las Vegas', date: 'Jan 2024', hasIncident: true },
                    { name: 'Web Summit Lisbon', date: 'Nov 2023 - Canceled', hasIncident: false, canceled: true }
                  ].map((event) => (
                    <li key={event.name} className={`p-3 hover:bg-gray-50 ${event.hasIncident ? 'bg-red-100/50 hover:bg-red-100/70' : ''}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className={`font-medium text-gray-800 ${event.canceled ? 'text-gray-400 line-through' : ''}`}>{event.name}</p>
                          <p className="text-xs text-gray-500">{event.date}</p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                          View <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                      {event.hasIncident && (
                        <div className="mt-2 text-sm text-red-700">
                          <p className="bg-red-100 p-2 rounded-md"><span className="font-semibold">Incident:</span> Late arrival on Day 2. PM noted punctuality issues.</p>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // My Team Tab
  const renderReportsTab = () => {
    
    const manager = {
      id: 'john-doe',
      name: 'John Doe',
      role: 'Project Manager',
      department: 'Management',
      location: 'London, UK',
      email: 'john.doe@example.com',
      phone: '+44 20 7946 0958',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOpItAeULXM9MxMBFfqIGXt4qq0K0ekFu1xdAjIktMRbg8hPK74C8IlCPzeHKQOkoG4oXcG_LWCgFGqdKcxwNOK2KtXOmRWQ_rUsF7FU0cfUocEBLLuyma8727U1KN7ar0QV8Q1WznviVgmjSdQxfqw2LSh8BBkaiYl998n6INXQyc772YcRHKAAFyXhna1xt9sveK26q4BxZpPWddSbAisNscFv4GA80JINUtPGQXYtmGc7ecqrhDsgAhfIXiwCnGRgBFqnSXBzOH'
    };

    const reportees = [
      {
        id: 'emily-white',
        name: 'Emily White',
        role: 'QA Tester',
        department: 'Quality Assurance',
        location: 'Austin, USA',
        email: 'emily.white@example.com',
        phone: '+1 512-555-0182',
        manager: 'John Doe',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOhaEALIHjcIeBfQEKtEd2Q9p0MAoHoJascoe-n811W_Y6uCHblwx7bZkYdkPqmiZ-ZaOEPgZdpmZ_gygnGAj6vwZmvuiPqzi3p2g-ILD49MQZ9lxX6MEnbct_NNklG-T0Y2wZhtMVkJhe3OvJyy7a5wb3OJ_E4yiAnbPsXbbjDShrmqwNDVkg-MZV0vwNsFtDs_CL-b0ctpgWK_J_ywkUXAeO6SK6Q3Dun1zzkUzkfFxd3EfkpeHxiiiBU9V8kAava_NfZUkCtWcj'
      },
      {
        id: 'jane-smith',
        name: 'Jane Smith',
        role: 'Software Engineer',
        department: 'Engineering',
        location: 'San Francisco, USA',
        email: 'jane.smith@example.com',
        phone: '+1 415-555-0199',
        manager: 'John Doe',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjV9U1uaJGOKZElSVRrd1J7X9WmUVtqfhOsKDV_966MH4tWp1Yp7C4mg6TdQXRYJcDD-VopPU2SyHXfbVMfr0td3u12T0XVuOYgSK-81rZsp0XarNLr30waoT02j7Vlh11GmS9Y9dtZk00syP2foahXyz5eZxmXfAvEhnozPfBGEGR2JeVhtBjltiXyZ-zD7pnpv84XC0fHqRKIRdfsobwKalP6ZiUYnH3xIbTOQIoAoh9pJin1kSIPGozi6lCqoW78wtlE3PW5RiG'
      },
      {
        id: 'mike-johnson',
        name: 'Mike Johnson',
        role: 'UX Designer',
        department: 'Design',
        location: 'New York, USA',
        email: 'mike.johnson@example.com',
        phone: '+1 987-654-321',
        manager: 'John Doe',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBS4_rP-wIPLaIAb4fo53NNY9E5iAd13zWZVA6UoEeg7JJqMgn66gqGoJk79NPaKgOPzrXqYjqhnBvpVAKzCQJOCvztUZcQJIvUSqEGyhqPOh1U2ilESy3OR69Rwu0-w2AJfW8VvpE8310jNtu-ppbIIGe5fye9QS8YtWHV0KM3jeS2_sZCqo5s7wtCnc-p2koE1RU81W7gFsGfkBp6WtchhEAfKMTzWu-tFDpccUOXUkC6abr8j5VOxgOWxt5ql1T6z3XDaOW82HH0'
      }
    ];

    const departmentMembers = [
      {
        id: 'alex-ray',
        name: 'Alex Ray',
        role: 'Frontend Developer',
        department: 'Engineering',
        location: 'Remote',
        email: 'alex.ray@example.com',
        phone: '+1 555-0123',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxAJxswbAIcPq770FSfmsypTtpTSvGWPVGeX9fO7eiiaej5A2CmCPhRCK0dPC9D__mihnzk_QgSXYObpM_kuRVxA1TjUjDHv09Xm3-DT35-ncx7GC_gIaiLAgKHZrolxHW2BPTz9wlay318Z4sYyakasyhUcePfpat416kXuwwdMyL4b-V5rtw9JofT645vqz7k9wkCDs33JXYT97Y4gAvG-xJLOT_T7sUujOtFL8MJOlSNkWFVym3ri8pFcKRj7bqfcjt2Tbvi0Jt'
      },
      {
        id: 'ben-carter',
        name: 'Ben Carter',
        role: 'Backend Developer',
        department: 'Engineering',
        location: 'Remote',
        email: 'ben.carter@example.com',
        phone: '+1 555-0124',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOAtjqdCTOA7GVg9EnmxKFM9N9XXz_QN_dJrxXRcZ4HjtxhrgQtLsJ7UsUOYGa-5Zzja-P9w4YGF_vK5LwSOD4iO0WNigsjPXL9F8qA5BTcLaXRk3YUBlNUFJ3N0OFMmudeJ18i3DIstbYzNfAm_X95Px-Gnp-Sx475wGgAsfhZ9DCPLv3rf9JhO-ugN5DEY-7Mf_L73ePdm91gHzP6BUIlkfs2fKvmcnZN1K_z0ygsR0Qarrva7DpFRTSUxgXJWJU0KSxBV4hCZ0V'
      },
      {
        id: 'chloe-davis',
        name: 'Chloe Davis',
        role: 'DevOps Engineer',
        department: 'Engineering',
        location: 'London, UK',
        email: 'chloe.davis@example.com',
        phone: '+44 20 7946 0959',
        image: null
      },
      {
        id: 'diana-evans',
        name: 'Diana Evans',
        role: 'Systems Architect',
        department: 'Engineering',
        location: 'London, UK',
        email: 'diana.evans@example.com',
        phone: '+44 20 7946 0960',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClR9O0DYoDfw74hGkyRxp1kgVR-88hPso5H1AP4IrEBGfl6fZGaXRaKKosGpvwxXyWxK7dos5SimV3HFCgbT-mz6KpDmSyLcef6orSaudt5hkli-gUy5LM8k0yXssOOwC5n8gETWqr8xeErh9g7k1b_cWpxO54Z6YDXcF0jR7gg1P2qcZcfGjyUfOXAH2HFDvm1p7W28o7yeZrFoa45yg-f0KZG2Wxl1szlGr0QhyiS6zxnoFHrCTNjEDSOCOOJjdBv0M88rFvg2dt'
      }
    ];

    const filteredReportees = reportees.filter(person =>
      person.name.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
      person.location.toLowerCase().includes(teamSearchTerm.toLowerCase())
    );

    const openModal = (person: any) => {
      setSelectedPerson(person);
      setShowTeamModal(true);
    };

    const closeModal = () => {
      setShowTeamModal(false);
      setSelectedPerson(null);
    };

    const ContactIcons = ({ person }: { person: any }) => (
      <div className="flex space-x-2">
        <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:scale-110 hover:shadow-lg" title="Microsoft Teams">
          <TeamsIcon className="w-4 h-4" />
        </a>
        <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600 transition-all duration-300 hover:bg-purple-600 hover:text-white hover:scale-110 hover:shadow-lg" title="Slack">
          <SlackIcon className="w-4 h-4" />
        </a>
        <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 transition-all duration-300 hover:bg-red-600 hover:text-white hover:scale-110 hover:shadow-lg" title="Email">
          <EmailIcon className="w-4 h-4" />
        </a>
        <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 transition-all duration-300 hover:bg-green-600 hover:text-white hover:scale-110 hover:shadow-lg" title="WhatsApp">
          <WhatsAppIcon className="w-4 h-4" />
        </a>
      </div>
    );

    return (
      <div className="space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Team</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Manager Section */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-base font-semibold text-gray-700 mb-4 flex items-center border-b border-slate-200 pb-4">
              <ArrowRight className="mr-2 w-5 h-5 -rotate-45" /> Manager
            </h2>
            <div className="p-4 cursor-pointer" onClick={() => openModal(manager)}>
              <div className="flex items-center">
                <img 
                  alt={manager.name}
                  className="w-12 h-12 rounded-full mr-4" 
                  src={manager.image}
                />
                <div>
                  <p className="text-base font-bold text-gray-900">{manager.name}</p>
                  <p className="text-sm text-gray-600">Role: {manager.role}</p>
                  <p className="text-xs text-gray-500 mt-1">Location: {manager.location}</p>
                </div>
              </div>
              <div className="mt-4">
                <ContactIcons person={manager} />
              </div>
            </div>
          </div>
          
          {/* Reportees Section */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 border-b border-slate-200 pb-4">
              <h2 className="text-base font-semibold text-gray-700 flex items-center self-start md:self-center">
                <ArrowRight className="mr-2 w-5 h-5 rotate-45" /> Reportees
              </h2>
              <div className="relative w-full md:w-auto">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input 
                  className="w-full md:w-64 pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Filter by name or location"
                  type="text"
                  value={teamSearchTerm}
                  onChange={(e) => setTeamSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="h-72 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
              <div className="space-y-4">
                {filteredReportees.map((person) => (
                  <div 
                    key={person.id}
                    className="bg-gray-50 rounded-lg border border-slate-100 p-3 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => openModal(person)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img 
                          alt={person.name}
                          className="w-10 h-10 rounded-full mr-4" 
                          src={person.image}
                        />
                        <div>
                          <p className="text-sm font-bold text-gray-900">{person.name}</p>
                          <p className="text-xs text-gray-600">Role: {person.role}</p>
                          <p className="text-xs text-gray-600">Department: {person.department}</p>
                          <p className="text-xs text-gray-500">Location: {person.location}</p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <a href="#" className="p-2 rounded-full text-blue-600 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:scale-125 hover:shadow-lg" title="Microsoft Teams">
                          <TeamsIcon className="w-4 h-4" />
                        </a>
                        <a href="#" className="p-2 rounded-full text-purple-600 transition-all duration-300 hover:bg-purple-600 hover:text-white hover:scale-125 hover:shadow-lg" title="Slack">
                          <SlackIcon className="w-4 h-4" />
                        </a>
                        <a href="#" className="p-2 rounded-full text-red-600 transition-all duration-300 hover:bg-red-600 hover:text-white hover:scale-125 hover:shadow-lg" title="Email">
                          <EmailIcon className="w-4 h-4" />
                        </a>
                        <a href="#" className="p-2 rounded-full text-green-600 transition-all duration-300 hover:bg-green-600 hover:text-white hover:scale-125 hover:shadow-lg" title="WhatsApp">
                          <WhatsAppIcon className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* My Department Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-base font-semibold text-gray-700 mb-4 flex items-center border-b border-slate-200 pb-4">
            <Users className="mr-2 w-5 h-5" /> My Department
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {departmentMembers.map((person) => (
              <div 
                key={person.id}
                className="bg-gray-50 rounded-lg border border-slate-100 p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => openModal(person)}
              >
                <div className="flex items-center">
                  {person.image ? (
                    <img 
                      alt={person.name}
                      className="w-12 h-12 rounded-full mr-4" 
                      src={person.image}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full mr-4 bg-gray-200"></div>
                  )}
                  <div>
                    <p className="text-base font-bold text-gray-900">{person.name}</p>
                    <p className="text-sm text-gray-600">Role: {person.role}</p>
                    <p className="text-xs text-gray-600 mt-1">Department: {person.department}</p>
                    <p className="text-xs text-gray-500 mt-1">Location: {person.location}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <ContactIcons person={person} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal */}
        {showTeamModal && selectedPerson && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md relative">
              <button 
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                onClick={closeModal}
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex flex-col items-center">
                {selectedPerson.image ? (
                  <img 
                    alt={selectedPerson.name}
                    className="w-24 h-24 rounded-full mb-4" 
                    src={selectedPerson.image}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full mb-4 bg-gray-200"></div>
                )}
                <h3 className="text-2xl font-bold text-gray-900">{selectedPerson.name}</h3>
                <p className="text-gray-600">Role: {selectedPerson.role}</p>
                <p className="text-sm text-gray-500 mt-1">Department: {selectedPerson.department}</p>
                <p className="text-sm text-gray-500 mt-1">Location: {selectedPerson.location}</p>
                <div className="mt-6 w-full">
                  <h4 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-2">Key Information</h4>
                  <p className="text-gray-600"><span className="font-semibold">Email:</span> {selectedPerson.email}</p>
                  <p className="text-gray-600"><span className="font-semibold">Phone:</span> {selectedPerson.phone}</p>
                  {selectedPerson.manager && (
                    <p className="text-gray-600"><span className="font-semibold">Manager:</span> {selectedPerson.manager}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Preferences Tab
  const renderPreferencesTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Preferences</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="travel">Willingness to Travel</label>
            <select className="block w-full shadow-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-sm px-3 py-2" id="travel" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}>
              <option>Willing to travel nationally</option>
              <option>Willing to travel internationally</option>
              <option>Only local events</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="event-type">Preferred Event Type</label>
            <select className="block w-full shadow-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-sm px-3 py-2" id="event-type" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}>
              <option>No Preference</option>
              <option>Corporate Events</option>
              <option>Music Festivals</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="role-type">Preferred Role Type</label>
            <select className="block w-full shadow-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-sm px-3 py-2" id="role-type" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}>
              <option>No Preference</option>
              <option>Technical (e.g. AV, Lighting)</option>
              <option>Logistics & Build</option>
            </select>
          </div>
          
          <div className="pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Other Preferences</label>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Willing to work unsociable hours</span>
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only" defaultChecked />
                  <div className="relative inline-flex items-center h-6 rounded-full w-11 bg-blue-600 transition-colors duration-200 ease-in-out">
                    <span className="inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-200 ease-in-out translate-x-5"></span>
                  </div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Interested in Team Leader roles</span>
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only" defaultChecked />
                  <div className="relative inline-flex items-center h-6 rounded-full w-11 bg-blue-600 transition-colors duration-200 ease-in-out">
                    <span className="inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-200 ease-in-out translate-x-5"></span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Other Information</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Communication Preferences</label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                <input 
                  className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                  id="email-comms" 
                  name="comms" 
                  type="checkbox" 
                  defaultChecked
                />
                <label className="ml-2 block text-sm text-gray-900" htmlFor="email-comms">
                  Email Job Alerts
                </label>
              </div>
              <div className="flex items-center">
                <input 
                  className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                  id="sms-comms" 
                  name="comms" 
                  type="checkbox"
                />
                <label className="ml-2 block text-sm text-gray-900" htmlFor="sms-comms">
                  SMS Notifications for urgent updates
                </label>
              </div>
              <div className="flex items-center">
                <input 
                  className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                  id="newsletter-comms" 
                  name="comms" 
                  type="checkbox" 
                  defaultChecked
                />
                <label className="ml-2 block text-sm text-gray-900" htmlFor="newsletter-comms">
                  Receive Company Newsletter
                </label>
              </div>
            </div>
          </div>
          
          <EditableField
            label="General Notes (Visible to Crew Member)"
            value="Allergic to nuts. Also have experience in basic carpentry."
            isTextarea={true}
            placeholder="Enter any additional notes or requirements..."
          />
          
          <div className="pt-4 bg-gray-50 p-4 rounded-lg -m-4 mt-4">
            <h4 className="text-base font-semibold text-gray-800 mb-4">Account Management</h4>
            <div className="space-y-3">
              <button className="w-full text-left text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center">
                <Send className="mr-2 text-lg w-5 h-5" />
                Send Password Reset Link
              </button>
              <button className="w-full text-left text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center">
                <Search className="mr-2 text-lg w-5 h-5" />
                View Login History
              </button>
              <button className="w-full text-left text-sm font-medium text-red-600 hover:text-red-800 flex items-center">
                <UserX className="mr-2 text-lg w-5 h-5" />
                Deactivate Account
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Access Level</h3>
        <div className="space-y-6">
          <p className="text-sm text-gray-500">Defines what the user can see and do within the system.</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="access-level">Set Access Level</label>
            <select className="block w-full shadow-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-sm px-3 py-2" id="access-level" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}>
              <option>Parent / Top Level</option>
              <option>Senior Management</option>
              <option selected>Junior Management</option>
              <option>Basic</option>
              <option>HR / Finance</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="staff-type">Staff Type</label>
            <select className="block w-full shadow-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-sm px-3 py-2" id="staff-type" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}>
              <option>Internal</option>
              <option>External</option>
            </select>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions for Junior Management</h4>
            <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
              <li>View and edit own profile</li>
              <li>Access to assigned project dashboards</li>
              <li>Create and manage tasks for their team</li>
              <li>Approve timesheets for their team</li>
              <li>View reports for their team</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal': return renderPersonalTab();
      case 'work': return renderWorkTab();
      case 'compliance': return renderComplianceTab();
      case 'payments': return renderPaymentsTab();
      case 'availability': return renderAvailabilityTab();
      case 'performance': return renderPerformanceTab();
      case 'reports': return renderReportsTab();
      case 'preferences': return renderPreferencesTab();
      default: return renderPersonalTab();
    }
  };

  const handleEditMode = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    // TODO: Reset form fields to original values if needed
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully!');
      setIsEditMode(false); // Exit edit mode after successful save
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper component for editable fields
  const EditableField = ({ 
    label, 
    value, 
    type = 'text', 
    isTextarea = false, 
    isSelect = false, 
    options = [], 
    className = '',
    placeholder = ''
  }: {
    label: string;
    value: string;
    type?: string;
    isTextarea?: boolean;
    isSelect?: boolean;
    options?: string[];
    className?: string;
    placeholder?: string;
  }) => {
    if (!isEditMode) {
      return (
        <div>
          <label className="text-xs font-medium text-gray-600">{label}</label>
          <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 text-sm">
            {value}
          </div>
        </div>
      );
    }

    return (
      <div>
        <label className="text-xs font-medium text-gray-700">{label}</label>
        {isTextarea ? (
          <textarea
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            defaultValue={value}
            placeholder={placeholder}
            rows={3}
          />
        ) : isSelect ? (
          <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            {options.map((option) => (
              <option key={option} value={option} selected={option === value}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            defaultValue={value}
            placeholder={placeholder}
          />
        )}
      </div>
    );
  };

  const handleFinanceQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFinanceQueryError(false);

    if (!financeQueryForm.subject || !financeQueryForm.description) {
      setFinanceQueryError(true);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Finance query submitted successfully!');
      setShowFinanceQueryModal(false);
      setFinanceQueryForm({ subject: '', invoice: '', description: '', attachment: null });
    } catch (error) {
      setFinanceQueryError(true);
      toast.error('Failed to submit query');
    }
  };

  const handleFinanceQueryFormChange = (field: keyof typeof financeQueryForm, value: string | File | null) => {
    setFinanceQueryForm(prev => ({ ...prev, [field]: value }));
    if (financeQueryError) {
      setFinanceQueryError(false);
    }
  };

  const handleFinanceQueryCancel = () => {
    setShowFinanceQueryModal(false);
    setFinanceQueryForm({ subject: '', invoice: '', description: '', attachment: null });
    setFinanceQueryError(false);
  };

  // Set default due date (30 days from today)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.setDate(today.getDate() + 30));
    setCreateInvoiceForm(prev => ({
      ...prev,
      dueDate: thirtyDaysFromNow.toISOString().split('T')[0]
    }));
  }, []);

  const calculateItemAmount = (quantity: number, rate: string) => {
    const numRate = parseFloat(rate.replace(/[£$€,]/g, '')) || 0;
    return quantity * numRate;
  };

  const calculateTotals = () => {
    const subtotal = createInvoiceForm.items.reduce((sum, item) => sum + item.amount, 0);
    const vat = createInvoiceForm.vatEnabled ? subtotal * (createInvoiceForm.vatRate / 100) : 0;
    const total = subtotal + vat;
    return { subtotal, vat, total };
  };

  const handleCreateInvoiceFormChange = (field: keyof typeof createInvoiceForm, value: any) => {
    setCreateInvoiceForm(prev => ({ ...prev, [field]: value }));
    if (createInvoiceError) {
      setCreateInvoiceError(false);
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setCreateInvoiceForm(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // Recalculate amount if quantity or rate changed
      if (field === 'quantity' || field === 'rate') {
        newItems[index].amount = calculateItemAmount(newItems[index].quantity, newItems[index].rate);
      }
      
      return { ...prev, items: newItems };
    });
  };

  const addInvoiceItem = () => {
    setCreateInvoiceForm(prev => ({
      ...prev,
      items: [...prev.items, {
        description: '',
        details: '',
        category: 'Fee',
        subCategory: '',
        quantity: 1,
        rate: '0.00',
        amount: 0
      }]
    }));
  };

  const removeInvoiceItem = (index: number) => {
    setCreateInvoiceForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const duplicateInvoiceItem = (index: number) => {
    setCreateInvoiceForm(prev => ({
      ...prev,
      items: [...prev.items, { ...prev.items[index] }]
    }));
  };

  const validateInvoice = (isDraft = false) => {
    if (isDraft) return true;

    if (!createInvoiceForm.invoiceNumber || !createInvoiceForm.dueDate || !createInvoiceForm.project) {
      return false;
    }

    return createInvoiceForm.items.every(item => 
      item.description.trim() && item.quantity > 0 && parseFloat(item.rate.replace(/[£$€,]/g, '')) > 0
    );
  };

  const handleCreateInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateInvoiceError(false);

    if (!validateInvoice()) {
      setCreateInvoiceError(true);
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmSend = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Invoice sent successfully!');
      setShowConfirmDialog(false);
      setShowCreateInvoiceModal(false);
      // Reset form or update UI as needed
    } catch (error) {
      toast.error('Failed to send invoice');
      setCreateInvoiceError(true);
    }
  };

  const handleSaveDraft = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Invoice saved as draft');
      setShowCreateInvoiceModal(false);
    } catch (error) {
      toast.error('Failed to save draft');
    }
  };

  const handleCreateInvoiceCancel = () => {
    setShowCreateInvoiceModal(false);
    setCreateInvoiceError(false);
    setShowConfirmDialog(false);
  };

  // Show loading state while fetching user data
  if (isLoading && !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={onBack} 
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back to Settings
              </button>
              <div className="flex items-center space-x-4">
                <img 
                  src={userProfile?.avatar_url || "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop"}
                  alt="Profile"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {userProfile?.display_name || userProfile?.first_name && userProfile?.last_name 
                      ? `${userProfile.first_name} ${userProfile.last_name}` 
                      : userProfile?.email || 'User'}
                  </h1>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-yellow-400">
                      {[...Array(4)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                      <Star className="w-4 h-4 text-gray-300" />
                    </div>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      userProfile?.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {userProfile?.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {userProfile?.role && (
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {userProfile.role.role_type}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {!isEditMode ? (
                <>
                  <button 
                    onClick={handleEditMode}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit Profile
                  </button>
                  <span className="text-gray-300">|</span>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">Message</button>
                  <span className="text-gray-300">|</span>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">Assign to Project</button>
                  <span className="text-sm text-gray-500 italic">View Mode</span>
                </>
              ) : (
                <>
                  <button 
                    onClick={handleCancelEdit}
                    className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center px-3 py-2 border border-gray-300 rounded-lg"
                    disabled={isLoading}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center text-sm hover:bg-blue-700 disabled:bg-gray-400 font-medium"
                  >
                    {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                  </button>
                  <span className="text-sm text-orange-500 italic flex items-center">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit Mode Active
                  </span>
                </>
              )}
            </div>
          </div>
          
          {/* Profile Completeness Bar */}
          <div className="pb-4">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <p className="text-xs text-right text-gray-500 mt-1">Profile Completeness: 75%</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                  {tab.badge && (
                    <span className="ml-2 bg-red-100 text-red-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>

      {/* Finance Query Modal */}
      {showFinanceQueryModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleFinanceQueryCancel}></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
              <div className="bg-white">
                <div className="border-b border-gray-200 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold leading-tight text-gray-900">Contact Finance Team</h2>
                      <p className="mt-1 text-sm text-gray-600">Raise a query about payments or specific invoices.</p>
                    </div>
                    <button
                      onClick={handleFinanceQueryCancel}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                
                <form onSubmit={handleFinanceQuerySubmit} className="p-6">
                  {financeQueryError && (
                    <div className="rounded-md border border-red-300 bg-red-50 p-4 mb-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <XCircle className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">Submission Failed</h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>There was an error submitting your query. Please check the fields and try again.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-900">Subject</label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        value={financeQueryForm.subject}
                        onChange={(e) => handleFinanceQueryFormChange('subject', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option disabled value="">Select a subject</option>
                        <option value="Payment Issue">Payment Issue</option>
                        <option value="Invoice Query">Invoice Query</option>
                        <option value="General Inquiry">General Inquiry</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="invoice" className="block text-sm font-medium text-gray-900">Invoice (if applicable)</label>
                      <select
                        id="invoice"
                        name="invoice"
                        value={financeQueryForm.invoice}
                        onChange={(e) => handleFinanceQueryFormChange('invoice', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="">Select an invoice</option>
                        <option value="INV-00123">INV-00123</option>
                        <option value="INV-00124">INV-00124</option>
                        <option value="INV-00125">INV-00125</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-900">Description</label>
                      <div className="mt-1">
                        <textarea
                          id="description"
                          name="description"
                          required
                          rows={4}
                          value={financeQueryForm.description}
                          onChange={(e) => handleFinanceQueryFormChange('description', e.target.value)}
                          placeholder="Please describe your issue in detail."
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="attachment" className="block text-sm font-medium text-gray-900">Attachment (optional)</label>
                      <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                        <div className="space-y-1 text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500"
                            >
                              <span>Upload a file</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                accept=".png,.jpg,.jpeg,.pdf"
                                className="sr-only"
                                onChange={(e) => handleFinanceQueryFormChange('attachment', e.target.files?.[0] || null)}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                          {financeQueryForm.attachment && (
                            <p className="text-sm text-gray-900 font-medium">{financeQueryForm.attachment.name}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6">
                    <button
                      type="button"
                      onClick={handleFinanceQueryCancel}
                      className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Submit Query
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreateInvoiceModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" 
          style={{ zIndex: 9999 }}
          onClick={handleCreateInvoiceCancel}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Plus className="text-blue-600 mr-2" />
                Create New Invoice
              </h2>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 rounded-lg bg-gray-100 p-0.5">
                  <button className="px-2 py-1 rounded-md text-sm font-medium text-gray-700 bg-white shadow-sm">
                    <Edit className="w-4 h-4 inline mr-1" />
                    Edit
                  </button>
                  <button className="px-2 py-1 rounded-md text-sm font-medium text-gray-500 hover:bg-gray-200">
                    <Eye className="w-4 h-4 inline mr-1" />
                    Preview
                  </button>
                </div>
                <div className="relative">
                  <button className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={handleCreateInvoiceCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateInvoiceSubmit} className="flex flex-col flex-grow min-h-0">
              <div className="flex-grow overflow-y-auto p-6 space-y-6">
                {createInvoiceError && (
                  <div className="rounded-md border border-red-300 bg-red-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <XCircle className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Validation Error</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>Please fill in all required fields and ensure line items are complete.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Invoice Header */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {userProfile?.display_name || userProfile?.first_name && userProfile?.last_name 
                        ? `${userProfile.first_name} ${userProfile.last_name}` 
                        : userProfile?.email || 'User'} Ltd
                    </p>
                    <p className="text-sm text-gray-500">123 Tech Avenue, Silicon Roundabout, London, EC1Y 1AB, UK</p>
                    <p className="text-sm text-gray-500">VAT: GB 123 4567 89</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-3xl font-bold text-gray-400 uppercase">INVOICE</h2>
                    <div className="mt-1">
                      <input 
                        className="border border-gray-300 rounded-md px-3 py-1 text-right text-sm font-semibold"
                        type="text"
                        value={createInvoiceForm.invoiceNumber}
                        onChange={(e) => handleCreateInvoiceFormChange('invoiceNumber', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Bill To and Invoice Details */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Bill To:</p>
                    <p className="font-semibold text-gray-800">IntraCasfid Solutions</p>
                    <p className="text-sm text-gray-500">456 Corporate Blvd, Business District, London, EC2Y 8AE, UK</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Invoice Date:</label>
                      <input 
                        type="date"
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm w-48"
                        value={createInvoiceForm.invoiceDate}
                        onChange={(e) => handleCreateInvoiceFormChange('invoiceDate', e.target.value)}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Due Date:</label>
                      <input 
                        type="date"
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm w-48"
                        value={createInvoiceForm.dueDate}
                        onChange={(e) => handleCreateInvoiceFormChange('dueDate', e.target.value)}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">PO Number:</label>
                      <input 
                        type="text"
                        placeholder="Optional"
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm w-48"
                        value={createInvoiceForm.poNumber}
                        onChange={(e) => handleCreateInvoiceFormChange('poNumber', e.target.value)}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Currency:</label>
                      <select 
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm w-48"
                        value={createInvoiceForm.currency}
                        onChange={(e) => handleCreateInvoiceFormChange('currency', e.target.value)}
                      >
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Project Selection */}
                <div>
                  <select 
                    className="border border-gray-300 rounded-md px-3 py-2 w-full"
                    value={createInvoiceForm.project}
                    onChange={(e) => handleCreateInvoiceFormChange('project', e.target.value)}
                  >
                    <option value="">Select a project to invoice...</option>
                    <option value="geneva">Geneva Motor Show - Crew</option>
                    <option value="dubai">Expo 2024 Dubai - Site Manager</option>
                    <option value="ces">CES Las Vegas - Technician</option>
                  </select>
                </div>

                {/* Invoice Items Table */}
                <div className="overflow-x-auto rounded-lg">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 w-[30%]">Description</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 w-[20%]">Category</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 w-[15%]">Quantity</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 w-[15%]">Rate</th>
                        <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 w-[15%]">Amount</th>
                        <th className="pb-2 w-[10%]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {createInvoiceForm.items.map((item, index) => (
                        <tr key={index} className="border-b border-gray-200 group">
                          <td className="py-2 pr-2">
                            <input 
                              className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                              type="text"
                              placeholder="Enter item description"
                              value={item.description}
                              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            />
                            <input 
                              className="border border-gray-300 rounded px-2 py-1 w-full text-xs text-gray-400 mt-1"
                              type="text"
                              placeholder="Add details (e.g. dates worked)"
                              value={item.details}
                              onChange={(e) => handleItemChange(index, 'details', e.target.value)}
                            />
                          </td>
                          <td className="py-2 px-2">
                            <div className="space-y-1">
                              <select 
                                className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                                value={item.category}
                                onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                              >
                                <option value="Fee">Fee</option>
                                <option value="Expense">Expense</option>
                              </select>
                              {item.category === 'Expense' && (
                                <select 
                                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                                  value={item.subCategory}
                                  onChange={(e) => handleItemChange(index, 'subCategory', e.target.value)}
                                >
                                  <option value="">Select category...</option>
                                  <option value="Accommodation">Accommodation</option>
                                  <option value="Travel">Travel</option>
                                  <option value="Subsistence">Subsistence</option>
                                  <option value="Materials">Materials</option>
                                  <option value="Other">Other</option>
                                </select>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-2">
                            <input 
                              className="border border-gray-300 rounded px-2 py-1 w-20 text-center text-sm"
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input 
                              className="border border-gray-300 rounded px-2 py-1 w-24 text-sm"
                              type="text"
                              value={`£${item.rate}`}
                              onChange={(e) => handleItemChange(index, 'rate', e.target.value.replace('£', ''))}
                            />
                          </td>
                          <td className="py-2 pl-2 text-right font-medium text-gray-900 text-sm">
                            £{item.amount.toFixed(2)}
                          </td>
                          <td className="py-2 pl-2 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button 
                                type="button"
                                className="text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => duplicateInvoiceItem(index)}
                                title="Duplicate Row"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button 
                                type="button"
                                className="text-gray-400 hover:text-red-500"
                                onClick={() => removeInvoiceItem(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-300">
                        <td className="pt-4" colSpan={4}></td>
                        <td className="pt-4 text-right text-sm text-gray-500 font-medium">Subtotal</td>
                        <td className="pt-4 text-right font-bold text-gray-900">
                          £{calculateTotals().subtotal.toFixed(2)}
                        </td>
                      </tr>
                      {createInvoiceForm.vatEnabled && (
                        <tr>
                          <td colSpan={4}></td>
                          <td className="py-1 text-right text-sm text-gray-500 font-medium flex items-center justify-end">
                            <button 
                              type="button"
                              className="text-gray-400 hover:text-red-500 mr-2 p-0.5"
                              onClick={() => handleCreateInvoiceFormChange('vatEnabled', false)}
                              title="Remove VAT"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <span>VAT</span>
                            <input 
                              className="border border-gray-300 rounded text-sm w-14 text-center p-1 ml-1"
                              type="number"
                              value={createInvoiceForm.vatRate}
                              onChange={(e) => handleCreateInvoiceFormChange('vatRate', parseInt(e.target.value) || 20)}
                            />
                            <span>%</span>
                          </td>
                          <td className="py-1 text-right font-bold text-gray-900">
                            £{calculateTotals().vat.toFixed(2)}
                          </td>
                        </tr>
                      )}
                      {!createInvoiceForm.vatEnabled && (
                        <tr>
                          <td className="py-1 text-right" colSpan={5}>
                            <button 
                              type="button"
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center justify-end w-full"
                              onClick={() => handleCreateInvoiceFormChange('vatEnabled', true)}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add VAT
                            </button>
                          </td>
                          <td></td>
                        </tr>
                      )}
                      <tr className="border-t border-gray-200">
                        <td colSpan={4}></td>
                        <td className="pt-2 text-right text-lg font-bold text-gray-900">Total</td>
                        <td className="pt-2 text-right text-lg font-bold text-blue-600">
                          £{calculateTotals().total.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <button 
                  type="button"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
                  onClick={addInvoiceItem}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Line Item
                </button>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                <button 
                  type="button"
                  className="text-sm font-medium text-gray-600 hover:text-gray-800 flex items-center"
                >
                  <Paperclip className="w-4 h-4 mr-1" />
                  Attach Expense Receipts
                </button>
                <div className="flex items-center space-x-3">
                  <button 
                    type="button"
                    onClick={handleSaveDraft}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save as Draft
                  </button>
                  <button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Invoice
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ zIndex: 10000 }}>
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 transition-opacity bg-gray-600 bg-opacity-75"></div>
            
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md z-10">
              <div className="p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <Send className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="mt-5 text-lg font-medium leading-6 text-gray-900">
                  Send Invoice Confirmation
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    You are about to send invoice <strong>{createInvoiceForm.invoiceNumber}</strong> for{' '}
                    <strong>£{calculateTotals().total.toFixed(2)}</strong> to IntraCasfid Solutions.
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Please confirm you want to proceed. This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                <button
                  type="button"
                  onClick={handleConfirmSend}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Confirm & Send
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmDialog(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}