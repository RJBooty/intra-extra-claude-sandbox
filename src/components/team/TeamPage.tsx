import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface TeamPageProps {
  onNavigate: (section: string) => void;
}

type EmploymentType = 'Internal' | 'External';
type StaffStatus = 'Working' | 'Annual Leave' | 'Sick';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  employment: EmploymentType;
  location: string;
  status: StaffStatus;
  avatar: string;
}

interface ColumnConfig {
  id: keyof StaffMember;
  label: string;
  visible: boolean;
}

export function TeamPage({ onNavigate }: TeamPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Set<string>>(new Set());
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [columns, setColumns] = useState<ColumnConfig[]>([
    { id: 'name', label: 'Staff Name', visible: true },
    { id: 'role', label: 'Role', visible: true },
    { id: 'department', label: 'Department', visible: true },
    { id: 'email', label: 'Email', visible: true },
    { id: 'employment', label: 'Employment', visible: true },
    { id: 'location', label: 'Location', visible: true },
    { id: 'status', label: 'Status', visible: true },
  ]);

  // Staff data matching the HTML
  const [staffMembers] = useState<StaffMember[]>([
    {
      id: 'alex-bennett',
      name: 'Alex Bennett',
      role: 'Lead Designer',
      department: 'Design',
      email: 'alex.b@email.com',
      employment: 'Internal',
      location: 'New York',
      status: 'Working',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACZgOh9jro_7uJzbYKoxZDB4ro_T7pisjEtQ30cQ33bnOfx4XpkYSMLaLaayii-7kALx-kha_1rpVBT3SdC10wHtG3SrsxiP5gI1raOrUaRZufnyNm0aG6g1WRdpREGlDHSRgte0ElycM9xEjK_hSs0Xg6T4HOVQxwHvBIS26hc0D7VLEHNXwiFyJ-DUYQR31Di-NT3B1nKIrmFtp5uTEL_ZA2PZG7vB_F6IFezUxsuGDg6IvY64rCR24G_9fJLGRFuvIK0yQIDzo'
    },
    {
      id: 'sophia-carter',
      name: 'Sophia Carter',
      role: 'Project Manager',
      department: 'Management',
      email: 'sophia.c@email.com',
      employment: 'Internal',
      location: 'London',
      status: 'Working',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4gr2KPV9qHOOl38BaGo6mLlG6zGHwmrCm-9k7oG6KOwyIce8Mw-aVJv0RfW1L0U7vzUV6fp9PIbEzHir6QX6tLv-nOO71SPVZNhoQOjgf8ptNSYRTPpVKoHipKyF8wkSCCfebFt_GLpWXDe9gxYw1OOy47j48h_a80SnDTq8_j9N5y7ukxhBNMb3EoMjPKcZYMJljKnzz_u54RS9x6GdilEPQjyeXtvPUJldxtjZmYGcDWkvLvKoCt6BKcHkMEfRXUj4OVQEroWQ'
    },
    {
      id: 'ethan-davis',
      name: 'Ethan Davis',
      role: 'Marketing Head',
      department: 'Marketing',
      email: 'ethan.d@email.com',
      employment: 'External',
      location: 'New York',
      status: 'Working',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwZEAp0C-asL3U70GMkcMujLdF7rHuLo6b2qhpDd166nCsFf_Y0ysnU-Zd3rC5cccV-ImGUAMCfy4yhX_kXiC2_XOx6sF_jDD6d_GjjzZIp3dh0i5Y7qfdJ9ODUho4APMaf7XP0bzT7HIFFPyR6mBWBoLTC7aWO6N4vsFvuVsSTXsvsg2ZR7zCVLkTMJ6QGBTqU5Vm6oM0YDtzq2CSrt9yRtU_FerOo5CJ2Q8eOWVYaIf0h3W0WgV2_Cca3jKW1v2Z6RbvrxA3YJE'
    },
    {
      id: 'olivia-evans',
      name: 'Olivia Evans',
      role: 'UX Researcher',
      department: 'Design',
      email: 'olivia.e@email.com',
      employment: 'Internal',
      location: 'New York',
      status: 'Annual Leave',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC45XoDLNZeO8EV7sEmz6qa5w37Oq2nctoyVDh55wUi8GyM16nhuaGBRX4oNgNrkwfOsQlMJrcn5hsqNq4U5rHTHqnuw7BVn_JveK_BMWreUqatCYDYkqaSJPskDvFkLe1kYdI3GoXS1VA42UlcOm4pBveG_uuwk1yZ-X26_UNRYyjtR4ki6YNj3MZVfXJpsu4AZVKXta7_KxmBRzU6VPR7bT3VBlAuCcsLBx6819g3gahlU8fhEJn5IHuXWHkf44ZlSmnnpud1HNA'
    },
    {
      id: 'liam-foster',
      name: 'Liam Foster',
      role: 'Art Director',
      department: 'Creative',
      email: 'liam.f@email.com',
      employment: 'External',
      location: 'London',
      status: 'Annual Leave',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPxfTMhjKeif13hxFm_KILAzPjK69hqPQmVSKlqrtwQHPl42VDJuo5XC4mUV4TiKHYL6CR1Kx72Rt-70FsZuJngCLEeYhbQwzfEhyPUrnwwKMoTHKE1Iv20Phjeu_89XQIFB8SM8nDXUwydTg8EmjKpYA7YjAykTPT0_k3leElK_LXPjKSg7H-yrWjp50HpPcQnv7R7bM9V8Y1_FE5xbCjESXESPm6ta9FZD8WwYHQ_iyt0hj19A8MBxUkhU6T4QqdfhT1AbY4kNY'
    },
    {
      id: 'ava-green',
      name: 'Ava Green',
      role: 'Video Editor',
      department: 'Creative',
      email: 'ava.g@email.com',
      employment: 'Internal',
      location: 'New York',
      status: 'Working',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAClY_Z0FxbzcDfvBzmR27Y2I0SoJZPppF2IR9actJMB6cWemdQ5qz07EBkUDirR6g0e5Lj1bpJHTVK4r-IyXqu7welAh8v6iM8MQMIxovvCEvSPA267P4qN4KHM_LZ98y7VRmZsm69WBJrgN3VOpPCatdoPRP4XhfWKMBvAT0QWvXyMtfu2480lYOKBilAX3WiyNDiGpvNadAb61pjDiaq9Le3eaeJ0BX8KrDSsAMbjDbXLhBdR1FAJ3YzOMOyGIhjXVAvK_nBjO0'
    },
    {
      id: 'noah-harris',
      name: 'Noah Harris',
      role: 'Copywriter',
      department: 'Marketing',
      email: 'noah.h@email.com',
      employment: 'External',
      location: 'London',
      status: 'Sick',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVyj5h2Xcp8iCXgZui2BFN86Zis9MoyxU7MSXjdoRQS4rv_18knhDpHTPDc4TApLdHKM7tnmvUcDsuuex0EXtO80_h2VXvOo3h7hb1nFrbTIOa46J2JnmF11DoUuOTX5vvuSl9ESyf0m38z_q1SQLcAth6nkubVwaz5jE4au6KlY3edzSWJziIQscA9q3VFRoHgq-S5gLXA-yqWGdzGcPGpqUaGaoUBolbQxiNjWM1UgRCsaEYAcS9C0Bp-27WGfMpES2RfuAEBiA'
    },
    {
      id: 'isabella-jones',
      name: 'Isabella Jones',
      role: 'Illustrator',
      department: 'Creative',
      email: 'isabella.j@email.com',
      employment: 'Internal',
      location: 'New York',
      status: 'Working',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlb2w5LoaPRbVXUMKUttVuCoBg6Gt5CUmELnLJbQUuHL46z1ta95Ir3oB_bw8woJQoEoY_vCGBh63A50unNFdRp3nxaweq8rcFnJ0Kgiqbe_XNiTx2MDaQnxOsYW_xAF7VgCOta_os7TVvzhZpPC4hRVGxbksJIRpY3c-HSPHpE_K5R5WYhXQVDsd4un4ibDH7DxiHxP6oqwAe51g5WlxgG6cAdmCqUVzSbQtp6udLj4-OsKDHBgwkdAFuEfwyy7_bmuHjZwbIz5Y'
    },
    {
      id: 'jackson-king',
      name: 'Jackson King',
      role: 'Lead Developer',
      department: 'Development',
      email: 'jackson.k@email.com',
      employment: 'Internal',
      location: 'London',
      status: 'Working',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9eSEYNtCWY7qfa66rBD3w1GqcLV1HeZrrvc3mLFOgGFKpE6R9qzf9QYY3AegKP7pHUp2LvDPYLrvrXMiwJxZ9IHcJmf0OPdZNHzN-dWl39WVmOdXE1rsapSbLAhtHWPK9wmSL_qGt4KdLhiaSaZKZ7l0jVDxk2tqSemuGr4qMoVUQXg_qgHXoiddaVcRoqyiUKhB8g5tg9QwNT8Kl5rVjzCOoICJVhhx20-TrIPPgOPhqHiTXzOdPobtRI3ddikINYGoPiHK5FrQ'
    }
  ]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowColumnsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleColumn = (columnId: keyof StaffMember) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStaff(new Set(staffMembers.map(member => member.id)));
    } else {
      setSelectedStaff(new Set());
    }
  };

  const handleSelectStaff = (staffId: string, checked: boolean) => {
    const newSelected = new Set(selectedStaff);
    if (checked) {
      newSelected.add(staffId);
    } else {
      newSelected.delete(staffId);
    }
    setSelectedStaff(newSelected);
  };

  const getStatusClass = (status: StaffStatus) => {
    switch (status) {
      case 'Working':
        return 'status-badge status-working';
      case 'Annual Leave':
        return 'status-badge status-annual-leave';
      case 'Sick':
        return 'status-badge status-sick';
      default:
        return 'status-badge';
    }
  };

  const filteredStaff = staffMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // State for new staff form
  const [newStaffData, setNewStaffData] = useState({
    firstName: '',
    middleName: '',
    role: '',
    department: '',
    workEmail: '',
    personalEmail: '',
    workPhone: '',
    personalPhone: '',
    staffType: '',
    cityOfResidence: ''
  });

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleSaveStaff = () => {
    // Here you would typically save the staff data
    console.log('Saving staff:', newStaffData);
    setShowSuccessMessage(true);
    
    // Hide success message after 3 seconds and close modal
    setTimeout(() => {
      setShowSuccessMessage(false);
      setShowAddStaffModal(false);
      // Reset form
      setNewStaffData({
        firstName: '',
        middleName: '',
        role: '',
        department: '',
        workEmail: '',
        personalEmail: '',
        workPhone: '',
        personalPhone: '',
        staffType: '',
        cityOfResidence: ''
      });
    }, 3000);
  };

  return (
    <>
      {/* Custom CSS matching the original */}
      <style dangerouslySetInnerHTML={{
        __html: `
          :root {
            --bg-color: #f8faff;
            --sidebar-bg: #FFFFFF;
            --sidebar-text: #5c728a;
            --sidebar-active-bg: #eaedf1;
            --sidebar-active-text: #101418;
            --header-bg: #FFFFFF;
            --header-border: #d4dbe2;
            --text-primary: #101418;
            --text-secondary: #5c728a;
            --input-bg: #eaedf1;
            --input-placeholder: #5c728a;
            --btn-primary-bg: #b2cbe5;
            --btn-primary-hover-bg: #a5c1db;
            --btn-primary-text: #101418;
            --table-header-bg: #f9fafb;
            --table-border: #d4dbe2;
            --table-row-hover-bg: #f3f4f6;
            --status-working-bg: #dcfce7;
            --status-working-text: #22c55e;
            --status-annual-leave-bg: #ffedd5;
            --status-annual-leave-text: #f97316;
            --status-sick-bg: #fee2e2;
            --status-sick-text: #ef4444;
            --filter-active-bg: #eaedf1;
            --filter-active-text: #101418;
            --filter-text: #5c728a;
          }
          .status-badge {
            display: inline-flex;
            align-items: center;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-weight: 500;
            font-size: 0.75rem;
          }
          .status-working {
            background-color: var(--status-working-bg);
            color: var(--status-working-text);
          }
          .status-annual-leave {
            background-color: var(--status-annual-leave-bg);
            color: var(--status-annual-leave-text);
          }
          .status-sick {
            background-color: var(--status-sick-bg);
            color: var(--status-sick-text);
          }
        `
      }} />

      <main className="main-content p-8" style={{ backgroundColor: 'var(--bg-color)' }}>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Staffing</h2>
            <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Manage all your staff in one place</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-white hover:bg-gray-100 font-medium flex items-center px-4 py-2 rounded-xl border" style={{ color: 'var(--text-secondary)', borderColor: 'var(--table-border)' }}>
              <span className="material-icons mr-2">edit</span>
              Bulk Update
            </button>
            <button 
              className="font-bold flex items-center px-4 py-2 rounded-xl" 
              style={{ backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}
              onClick={() => setShowAddStaffModal(true)}
            >
              <span className="material-icons mr-2">add</span>
              Add New Staff
            </button>
          </div>
        </div>

        {/* Search and Columns */}
        <div className="flex justify-between items-center mb-6 gap-4">
          <div className="relative flex-grow">
            <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--input-placeholder)' }}>search</span>
            <input 
              className="pl-12 pr-4 py-3 rounded-xl w-full border-0 focus:ring-2"
              style={{ 
                backgroundColor: 'var(--input-bg)', 
                color: 'var(--text-primary)',
                focusRingColor: 'var(--btn-primary-bg)'
              }}
              placeholder="Search staff" 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="relative" ref={dropdownRef}>
            <button 
              className="bg-white hover:bg-gray-100 font-medium flex items-center px-4 py-3 rounded-xl border"
              style={{ color: 'var(--text-secondary)', borderColor: 'var(--table-border)' }}
              onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}
            >
              <span className="material-icons mr-2">view_column</span>
              Columns
            </button>
            
            {/* Columns Dropdown */}
            {showColumnsDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-10">
                <div className="p-4 border-b border-gray-200">
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Edit Columns</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Select the columns to display.</p>
                </div>
                <div className="p-4 space-y-3">
                  {columns.map(column => (
                    <label key={column.id} className="flex items-center space-x-3">
                      <input
                        checked={column.visible}
                        className="form-checkbox h-4 w-4 rounded focus:ring-offset-0 focus:ring-2"
                        style={{ 
                          color: 'var(--btn-primary-bg)',
                          focusRingColor: 'var(--btn-primary-bg)'
                        }}
                        type="checkbox"
                        onChange={() => toggleColumn(column.id)}
                      />
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{column.label}</span>
                    </label>
                  ))}
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <label className="flex items-center space-x-3">
                    <input
                      className="form-checkbox h-4 w-4 rounded focus:ring-offset-0 focus:ring-2"
                      style={{ 
                        color: 'var(--btn-primary-bg)',
                        focusRingColor: 'var(--btn-primary-bg)'
                      }}
                      type="checkbox"
                      checked={saveAsDefault}
                      onChange={(e) => setSaveAsDefault(e.target.checked)}
                    />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Save as default view</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: 'var(--table-border)' }}>
          <table className="w-full">
            <thead style={{ backgroundColor: 'var(--table-header-bg)' }}>
              <tr>
                <th className="p-4">
                  <input 
                    className="form-checkbox h-4 w-4 rounded focus:ring-offset-0 focus:ring-2"
                    style={{ 
                      color: 'var(--btn-primary-bg)',
                      focusRingColor: 'var(--btn-primary-bg)'
                    }}
                    type="checkbox"
                    checked={selectedStaff.size === filteredStaff.length && filteredStaff.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                
                {columns.filter(col => col.visible).map(column => (
                  <th key={column.id} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    <div className="flex items-center relative group">
                      <a className="flex items-center hover:text-[var(--text-primary)]" href="#">
                        <span>{column.label}</span>
                        <span className="material-icons text-sm ml-1 text-gray-400 group-hover:text-gray-600">unfold_more</span>
                      </a>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ divideColor: 'var(--table-border)' }}>
              {filteredStaff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <input 
                      className="form-checkbox h-4 w-4 rounded focus:ring-offset-0 focus:ring-2"
                      style={{ 
                        color: 'var(--btn-primary-bg)',
                        focusRingColor: 'var(--btn-primary-bg)'
                      }}
                      type="checkbox"
                      checked={selectedStaff.has(member.id)}
                      onChange={(e) => handleSelectStaff(member.id, e.target.checked)}
                    />
                  </td>
                  
                  {columns.filter(col => col.visible).map(column => (
                    <td key={column.id} className="px-6 py-4 whitespace-nowrap text-sm">
                      {column.id === 'name' && (
                        <div className="flex items-center">
                          <img 
                            alt={member.name} 
                            className="h-10 w-10 rounded-full mr-4" 
                            src={member.avatar}
                          />
                          <a className="hover:underline font-medium" style={{ color: 'var(--text-primary)' }} href="#">
                            {member.name}
                          </a>
                        </div>
                      )}
                      {column.id === 'role' && (
                        <a className="hover:underline" style={{ color: 'var(--text-secondary)' }} href="#">
                          {member.role}
                        </a>
                      )}
                      {column.id === 'department' && (
                        <a className="hover:underline" style={{ color: 'var(--text-secondary)' }} href="#">
                          {member.department}
                        </a>
                      )}
                      {column.id === 'email' && (
                        <a className="hover:underline" style={{ color: 'var(--text-secondary)' }} href="#">
                          {member.email}
                        </a>
                      )}
                      {column.id === 'employment' && (
                        <span style={{ color: 'var(--text-secondary)' }}>{member.employment}</span>
                      )}
                      {column.id === 'location' && (
                        <span style={{ color: 'var(--text-secondary)' }}>{member.location}</span>
                      )}
                      {column.id === 'status' && (
                        <a href="#">
                          <span className={getStatusClass(member.status)}>{member.status}</span>
                        </a>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Add New Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Add New Staff</h2>
              <button
                onClick={() => {
                  setShowAddStaffModal(false);
                  setShowSuccessMessage(false);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {!showSuccessMessage ? (
                <>
                  {/* Name Fields */}
                  <div className="flex max-w-full flex-wrap items-end gap-4 mb-1">
                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-[#0f131a] text-base font-medium leading-normal pb-2">First Name</p>
                      <input
                        placeholder="Enter first name"
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0f131a] focus:outline-0 focus:ring-2 focus:ring-blue-500 border border-[#d2d9e5] bg-gray-50 focus:border-blue-500 h-14 placeholder:text-[#556c91] p-4 text-base font-normal leading-normal"
                        value={newStaffData.firstName}
                        onChange={(e) => setNewStaffData({...newStaffData, firstName: e.target.value})}
                      />
                    </label>
                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-[#0f131a] text-base font-medium leading-normal pb-2">Middle Name</p>
                      <input
                        placeholder="Enter middle name"
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0f131a] focus:outline-0 focus:ring-2 focus:ring-blue-500 border border-[#d2d9e5] bg-gray-50 focus:border-blue-500 h-14 placeholder:text-[#556c91] p-4 text-base font-normal leading-normal"
                        value={newStaffData.middleName}
                        onChange={(e) => setNewStaffData({...newStaffData, middleName: e.target.value})}
                      />
                    </label>
                  </div>
                  <p className="text-[#556c91] text-sm font-normal leading-normal pb-3 pt-1">Please enter a valid staff name.</p>

                  {/* Role and Department */}
                  <div className="flex max-w-full flex-wrap items-end gap-4 mb-1">
                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-[#0f131a] text-base font-medium leading-normal pb-2">Role</p>
                      <input
                        placeholder="Enter role"
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0f131a] focus:outline-0 focus:ring-2 focus:ring-blue-500 border border-[#d2d9e5] bg-gray-50 focus:border-blue-500 h-14 placeholder:text-[#556c91] p-4 text-base font-normal leading-normal"
                        value={newStaffData.role}
                        onChange={(e) => setNewStaffData({...newStaffData, role: e.target.value})}
                      />
                    </label>
                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-[#0f131a] text-base font-medium leading-normal pb-2">Department</p>
                      <input
                        placeholder="Enter department"
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0f131a] focus:outline-0 focus:ring-2 focus:ring-blue-500 border border-[#d2d9e5] bg-gray-50 focus:border-blue-500 h-14 placeholder:text-[#556c91] p-4 text-base font-normal leading-normal"
                        value={newStaffData.department}
                        onChange={(e) => setNewStaffData({...newStaffData, department: e.target.value})}
                      />
                    </label>
                  </div>
                  <p className="text-[#556c91] text-sm font-normal leading-normal pb-3 pt-1">Please enter a valid role and department.</p>

                  {/* Email Fields */}
                  <div className="flex max-w-full flex-wrap items-end gap-4 mb-1">
                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-[#0f131a] text-base font-medium leading-normal pb-2">Work Email</p>
                      <input
                        placeholder="Enter work email"
                        type="email"
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0f131a] focus:outline-0 focus:ring-2 focus:ring-blue-500 border border-[#d2d9e5] bg-gray-50 focus:border-blue-500 h-14 placeholder:text-[#556c91] p-4 text-base font-normal leading-normal"
                        value={newStaffData.workEmail}
                        onChange={(e) => setNewStaffData({...newStaffData, workEmail: e.target.value})}
                      />
                    </label>
                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-[#0f131a] text-base font-medium leading-normal pb-2">Personal Email</p>
                      <input
                        placeholder="Enter personal email"
                        type="email"
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0f131a] focus:outline-0 focus:ring-2 focus:ring-blue-500 border border-[#d2d9e5] bg-gray-50 focus:border-blue-500 h-14 placeholder:text-[#556c91] p-4 text-base font-normal leading-normal"
                        value={newStaffData.personalEmail}
                        onChange={(e) => setNewStaffData({...newStaffData, personalEmail: e.target.value})}
                      />
                    </label>
                  </div>
                  <p className="text-[#556c91] text-sm font-normal leading-normal pb-3 pt-1">Please enter valid work and personal email addresses.</p>

                  {/* Phone Fields */}
                  <div className="flex max-w-full flex-wrap items-end gap-4 mb-1">
                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-[#0f131a] text-base font-medium leading-normal pb-2">Work Phone</p>
                      <input
                        placeholder="Enter work phone"
                        type="tel"
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0f131a] focus:outline-0 focus:ring-2 focus:ring-blue-500 border border-[#d2d9e5] bg-gray-50 focus:border-blue-500 h-14 placeholder:text-[#556c91] p-4 text-base font-normal leading-normal"
                        value={newStaffData.workPhone}
                        onChange={(e) => setNewStaffData({...newStaffData, workPhone: e.target.value})}
                      />
                    </label>
                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-[#0f131a] text-base font-medium leading-normal pb-2">Personal Phone</p>
                      <input
                        placeholder="Enter personal phone"
                        type="tel"
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0f131a] focus:outline-0 focus:ring-2 focus:ring-blue-500 border border-[#d2d9e5] bg-gray-50 focus:border-blue-500 h-14 placeholder:text-[#556c91] p-4 text-base font-normal leading-normal"
                        value={newStaffData.personalPhone}
                        onChange={(e) => setNewStaffData({...newStaffData, personalPhone: e.target.value})}
                      />
                    </label>
                  </div>
                  <p className="text-[#556c91] text-sm font-normal leading-normal pb-3 pt-1">Please enter valid work and personal phone numbers.</p>

                  {/* Staff Type */}
                  <div className="flex max-w-full flex-wrap items-end gap-4 mb-1">
                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-[#0f131a] text-base font-medium leading-normal pb-2">Internal or External Staff</p>
                      <select
                        className="form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0f131a] focus:outline-0 focus:ring-2 focus:ring-blue-500 border border-[#d2d9e5] bg-gray-50 focus:border-blue-500 h-14 placeholder:text-[#556c91] p-4 text-base font-normal leading-normal cursor-pointer"
                        value={newStaffData.staffType}
                        onChange={(e) => setNewStaffData({...newStaffData, staffType: e.target.value})}
                      >
                        <option value="">Select staff type</option>
                        <option value="Internal">Internal</option>
                        <option value="External">External</option>
                      </select>
                    </label>
                  </div>
                  <p className="text-[#556c91] text-sm font-normal leading-normal pb-3 pt-1">Please select the staff type.</p>

                  {/* City of Residence */}
                  <div className="flex max-w-full flex-wrap items-end gap-4 mb-1">
                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-[#0f131a] text-base font-medium leading-normal pb-2">City of Residence</p>
                      <input
                        placeholder="Enter city of residence"
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0f131a] focus:outline-0 focus:ring-2 focus:ring-blue-500 border border-[#d2d9e5] bg-gray-50 focus:border-blue-500 h-14 placeholder:text-[#556c91] p-4 text-base font-normal leading-normal"
                        value={newStaffData.cityOfResidence}
                        onChange={(e) => setNewStaffData({...newStaffData, cityOfResidence: e.target.value})}
                      />
                    </label>
                  </div>
                  <p className="text-[#556c91] text-sm font-normal leading-normal pb-3 pt-1">Please enter a valid city of residence.</p>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => setShowAddStaffModal(false)}
                      className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e9ecf2] text-[#0f131a] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-300 transition-colors"
                    >
                      <span className="truncate">Cancel</span>
                    </button>
                    <button
                      onClick={handleSaveStaff}
                      className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#2d6cd2] text-gray-50 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-blue-600 transition-colors"
                    >
                      <span className="truncate">Save</span>
                    </button>
                  </div>
                </>
              ) : (
                /* Success Message */
                <div
                  className="bg-cover bg-center flex flex-col items-stretch justify-end rounded-xl pt-32"
                  style={{
                    backgroundImage: 'linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuC1s7keJ35Bo_Slmi24BV1OcpLqZJnLNfrZrlko21alv0OVadntscnFdvoJUF4bVBEMHF5ZHngi6oC4sDDwmRFz9MhXdiYLZuThBlqQVjPgLTG9q_AX1oZnxQeYVmSE46iciLQuZgOI6fR9Y2XPprTPBG00teqynsPYZB6qgNGb4soFiZA-ZrRgFOGEZei_7X396kJuWLFtgAagxzGYsGFaU77VkL_j_FMOm_4TJ0qhfi-Y8tUBsBAri5SSCK2R504KvNa6ODmJApg")'
                  }}
                >
                  <div className="flex w-full items-end justify-between gap-4 p-4">
                    <div className="flex max-w-[440px] flex-1 flex-col gap-1">
                      <p className="text-white tracking-light text-2xl font-bold leading-tight max-w-[440px]">Staff Information Saved</p>
                      <p className="text-white text-base font-medium leading-normal">The new staff information has been successfully saved.</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowSuccessMessage(false);
                        setShowAddStaffModal(false);
                      }}
                      className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#2d6cd2] text-gray-50 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-blue-600 transition-colors"
                    >
                      <span className="truncate">Close</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}