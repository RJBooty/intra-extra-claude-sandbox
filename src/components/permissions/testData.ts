import { 
  PageDefinition, 
  SectionDefinition, 
  FieldDefinition, 
  PagePermission, 
  SectionPermission, 
  FieldPermission,
  UserTier,
  PermissionType,
  HierarchicalPermissions 
} from '../../types/permissions';

// Test Users
export const testUsers = [
  {
    id: 'test-master-1',
    name: 'Test Master User',
    email: 'master@test.com',
    role: 'master' as const,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'test-senior-1',
    name: 'Test Senior User',
    email: 'senior@test.com',
    role: 'senior' as const,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'test-mid-1',
    name: 'Test Mid User',
    email: 'mid@test.com',
    role: 'mid' as const,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'test-external-1',
    name: 'Test External User',
    email: 'external@test.com',
    role: 'external' as const,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'test-hr-1',
    name: 'Test HR Finance User',
    email: 'hr@test.com',
    role: 'hr_finance' as const,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

// Test Pages
export const testPages: PageDefinition[] = [
  {
    id: 'test-page-roi',
    page_name: 'roi',
    display_name: 'ROI Management',
    description: 'Financial ROI analysis and management',
    section: 'Financial',
    route_path: '/roi',
    is_critical: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'test-page-sales',
    page_name: 'sales',
    display_name: 'Sales Pipeline',
    description: 'Sales opportunities and pipeline management',
    section: 'Sales',
    route_path: '/sales',
    is_critical: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'test-page-crew',
    page_name: 'crew',
    display_name: 'Crew Management',
    description: 'Crew scheduling and management',
    section: 'Operations',
    route_path: '/crew',
    is_critical: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

// Test Sections
export const testSections: SectionDefinition[] = [
  {
    id: 'test-section-roi-analysis',
    page_id: 'test-page-roi',
    section_name: 'analysis',
    display_name: 'Financial Analysis',
    description: 'ROI calculations and financial metrics',
    is_financial: true,
    requires_approval: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'test-section-roi-estimates',
    page_id: 'test-page-roi',
    section_name: 'estimates',
    display_name: 'Cost Estimates',
    description: 'Project cost estimates and budgeting',
    is_financial: true,
    requires_approval: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'test-section-sales-opportunities',
    page_id: 'test-page-sales',
    section_name: 'opportunities',
    display_name: 'Sales Opportunities',
    description: 'Active sales opportunities and deals',
    is_financial: false,
    requires_approval: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'test-section-crew-scheduling',
    page_id: 'test-page-crew',
    section_name: 'scheduling',
    display_name: 'Crew Scheduling',
    description: 'Crew shift scheduling and assignments',
    is_financial: false,
    requires_approval: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

// Test Fields
export const testFields: FieldDefinition[] = [
  // ROI Analysis Fields
  {
    id: 'test-field-total-revenue',
    section_id: 'test-section-roi-analysis',
    field_name: 'total_revenue',
    display_name: 'Total Revenue',
    field_type: 'currency',
    is_sensitive: true,
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'test-field-profit-margin',
    section_id: 'test-section-roi-analysis',
    field_name: 'profit_margin',
    display_name: 'Profit Margin',
    field_type: 'percentage',
    is_sensitive: true,
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  // ROI Estimates Fields
  {
    id: 'test-field-equipment-cost',
    section_id: 'test-section-roi-estimates',
    field_name: 'equipment_cost',
    display_name: 'Equipment Cost',
    field_type: 'currency',
    is_sensitive: false,
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'test-field-labor-cost',
    section_id: 'test-section-roi-estimates',
    field_name: 'labor_cost',
    display_name: 'Labor Cost',
    field_type: 'currency',
    is_sensitive: false,
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  // Sales Fields
  {
    id: 'test-field-deal-value',
    section_id: 'test-section-sales-opportunities',
    field_name: 'deal_value',
    display_name: 'Deal Value',
    field_type: 'currency',
    is_sensitive: false,
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'test-field-client-contact',
    section_id: 'test-section-sales-opportunities',
    field_name: 'client_contact',
    display_name: 'Client Contact',
    field_type: 'text',
    is_sensitive: true,
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  // Crew Fields
  {
    id: 'test-field-crew-hours',
    section_id: 'test-section-crew-scheduling',
    field_name: 'crew_hours',
    display_name: 'Crew Hours',
    field_type: 'number',
    is_sensitive: false,
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'test-field-hourly-rate',
    section_id: 'test-section-crew-scheduling',
    field_name: 'hourly_rate',
    display_name: 'Hourly Rate',
    field_type: 'currency',
    is_sensitive: true,
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

// Default Permissions for Testing
export const createDefaultTestPermissions = (): {
  pagePermissions: Record<string, PagePermission[]>;
  sectionPermissions: Record<string, SectionPermission[]>;
  fieldPermissions: Record<string, FieldPermission[]>;
} => {
  const userTiers: UserTier[] = ['master', 'senior', 'hr_finance', 'mid', 'external'];
  
  const pagePermissions: Record<string, PagePermission[]> = {};
  const sectionPermissions: Record<string, SectionPermission[]> = {};
  const fieldPermissions: Record<string, FieldPermission[]> = {};

  // Default permission rules
  const getDefaultPermission = (entityType: 'page' | 'section' | 'field', entityId: string, userTier: UserTier): PermissionType => {
    // Critical pages
    if (entityType === 'page' && entityId === 'test-page-roi') {
      switch (userTier) {
        case 'master': return 'full';
        case 'senior': return 'full';
        case 'hr_finance': return 'read_only';
        case 'mid': return 'none'; // This will be changed in tests
        case 'external': return 'none';
      }
    }

    // Sales pages
    if (entityType === 'page' && entityId === 'test-page-sales') {
      switch (userTier) {
        case 'master': return 'full';
        case 'senior': return 'full';
        case 'hr_finance': return 'read_only';
        case 'mid': return 'assigned_only';
        case 'external': return 'none';
      }
    }

    // Crew pages
    if (entityType === 'page' && entityId === 'test-page-crew') {
      switch (userTier) {
        case 'master': return 'full';
        case 'senior': return 'full';
        case 'hr_finance': return 'read_only';
        case 'mid': return 'own_only';
        case 'external': return 'none';
      }
    }

    // Financial sections - more restrictive
    const section = testSections.find(s => s.id === entityId);
    if (entityType === 'section' && section?.is_financial) {
      switch (userTier) {
        case 'master': return 'full';
        case 'senior': return 'full';
        case 'hr_finance': return 'read_only';
        case 'mid': return 'none';
        case 'external': return 'none';
      }
    }

    // Sensitive fields - most restrictive
    const field = testFields.find(f => f.id === entityId);
    if (entityType === 'field' && field?.is_sensitive) {
      switch (userTier) {
        case 'master': return 'full';
        case 'senior': return 'full';
        case 'hr_finance': return 'read_only';
        case 'mid': return 'none';
        case 'external': return 'none';
      }
    }

    // Default permissions for other entities
    switch (userTier) {
      case 'master': return 'full';
      case 'senior': return 'full';
      case 'hr_finance': return 'read_only';
      case 'mid': return 'read_only';
      case 'external': return 'none';
    }
  };

  // Create page permissions
  testPages.forEach(page => {
    pagePermissions[page.id] = userTiers.map(tier => ({
      id: `perm-${page.id}-${tier}`,
      page_id: page.id,
      user_tier: tier,
      permission_type: getDefaultPermission('page', page.id, tier),
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }));
  });

  // Create section permissions
  testSections.forEach(section => {
    sectionPermissions[section.id] = userTiers.map(tier => ({
      id: `perm-${section.id}-${tier}`,
      section_id: section.id,
      user_tier: tier,
      permission_type: getDefaultPermission('section', section.id, tier),
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }));
  });

  // Create field permissions
  testFields.forEach(field => {
    fieldPermissions[field.id] = userTiers.map(tier => ({
      id: `perm-${field.id}-${tier}`,
      field_id: field.id,
      user_tier: tier,
      permission_type: getDefaultPermission('field', field.id, tier),
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }));
  });

  return { pagePermissions, sectionPermissions, fieldPermissions };
};

// Create hierarchical test data
export const createTestHierarchicalData = (): HierarchicalPermissions => {
  const { pagePermissions, sectionPermissions, fieldPermissions } = createDefaultTestPermissions();

  // Group sections by page
  const sections: Record<string, SectionDefinition[]> = {};
  testPages.forEach(page => {
    sections[page.id] = testSections.filter(section => section.page_id === page.id);
  });

  // Group fields by section
  const fields: Record<string, FieldDefinition[]> = {};
  testSections.forEach(section => {
    fields[section.id] = testFields.filter(field => field.section_id === section.id);
  });

  return {
    pages: testPages,
    sections,
    fields,
    pagePermissions,
    sectionPermissions,
    fieldPermissions,
    totalPages: testPages.length,
    totalSections: testSections.length,
    totalFields: testFields.length
  };
};

// Test Scenarios
export const testScenarios = {
  masterUserWorkflow: {
    description: 'Test Master user can manage all permissions',
    steps: [
      'Login as Master user',
      'Navigate to Settings -> Permission Management',
      'Change ROI permissions for Mid users from none to read_only',
      'Save changes',
      'Verify changes are reflected in UI',
      'Check audit log for changes'
    ]
  },

  permissionEnforcement: {
    description: 'Test permissions are enforced correctly',
    steps: [
      'Set ROI page permission to read_only for Mid user',
      'Login as Mid user',
      'Navigate to ROI page',
      'Verify fields are read-only',
      'Attempt to edit sensitive field',
      'Verify edit is blocked'
    ]
  },

  hierarchicalInheritance: {
    description: 'Test permission inheritance works correctly',
    steps: [
      'Set page permission to none for External user',
      'Verify all sections inherit none permission',
      'Verify all fields inherit none permission',
      'Override section permission to read_only',
      'Verify validation catches inheritance violation'
    ]
  },

  bulkOperations: {
    description: 'Test bulk permission operations',
    steps: [
      'Select multiple pages/sections/fields',
      'Apply bulk permission change',
      'Verify all selected items updated',
      'Copy permissions from one page to another',
      'Reset permissions to defaults',
      'Verify audit trail records all changes'
    ]
  },

  validationSystem: {
    description: 'Test validation catches permission violations',
    steps: [
      'Attempt to give External user access to critical page',
      'Verify validation error is shown',
      'Set child permission higher than parent',
      'Verify inheritance violation warning',
      'Use auto-fix to resolve violations'
    ]
  }
};

// Performance Test Data
export const createLargeTestDataset = () => {
  const pages: PageDefinition[] = [];
  const sections: SectionDefinition[] = [];
  const fields: FieldDefinition[] = [];

  // Create 100 test pages
  for (let i = 1; i <= 100; i++) {
    pages.push({
      id: `test-page-${i}`,
      page_name: `page_${i}`,
      display_name: `Test Page ${i}`,
      description: `Test page ${i} for performance testing`,
      section: `Section ${Math.ceil(i / 20)}`,
      route_path: `/test-page-${i}`,
      is_critical: i <= 10, // First 10 pages are critical
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    });

    // Create 5 sections per page
    for (let j = 1; j <= 5; j++) {
      const sectionId = `test-section-${i}-${j}`;
      sections.push({
        id: sectionId,
        page_id: `test-page-${i}`,
        section_name: `section_${j}`,
        display_name: `Section ${j}`,
        description: `Section ${j} of page ${i}`,
        is_financial: j === 1, // First section is financial
        requires_approval: j <= 2, // First 2 sections require approval
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      });

      // Create 10 fields per section
      for (let k = 1; k <= 10; k++) {
        fields.push({
          id: `test-field-${i}-${j}-${k}`,
          section_id: sectionId,
          field_name: `field_${k}`,
          display_name: `Field ${k}`,
          field_type: k <= 3 ? 'currency' : k <= 6 ? 'text' : 'number',
          is_sensitive: k <= 2, // First 2 fields are sensitive
          is_required: k <= 5, // First 5 fields are required
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        });
      }
    }
  }

  return { pages, sections, fields };
};

export default {
  testUsers,
  testPages,
  testSections,
  testFields,
  createDefaultTestPermissions,
  createTestHierarchicalData,
  testScenarios,
  createLargeTestDataset
};