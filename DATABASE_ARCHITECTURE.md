# IntraExtra Platform - Database Architecture v1.0

## Overview

This document describes the complete database architecture for the IntraExtra platform. The architecture follows normalized database design principles with proper foreign key relationships, ensuring data integrity while supporting all platform modules.

---

## Core Principles

1. **Normalization**: Data is stored once, referenced everywhere
2. **User-Centric**: Crew assignments link to real `user_profiles`, not duplicated data
3. **ROI as Source of Truth**: Financial data flows from ROI to modules, actuals flow back
4. **Project-Centric**: All module data links to `projects` via foreign keys
5. **Inventory Master Data**: Equipment items are managed centrally in Inventory, allocated to projects
6. **Audit Trail**: All tables track `created_at`, `updated_at`, `created_by`, `updated_by`

---

## Module Architecture

### 1. CORE INFO (Projects Table)

**Table**: `projects`

**Purpose**: Central project record with all Core Info fields

**Key Fields**:
- Basic: `project_id`, `project_code`, `client_id`, `event_location`, `event_type`
- Dates: Event dates, onsite dates, show dates, load in/out
- Cashless: Voucher sales, topup windows
- Refund: Refund windows, fees
- Delivery: Addresses, contacts, deadlines
- Config: Feature toggles (vouchers, topups, refunds enabled)
- Status: `current_phase`, `phase_progress`, `status`

**Relationships**:
- → `clients` (belongs to)
- → `project_roi_calculations` (has one)
- → `project_equipment_planning` (has many)
- → `project_assignments` (has many crew)
- → `project_phases` (has 5 phases)
- → `project_documents` (has many)

---

### 2. INVENTORY MODULE

**New Main Page**: **"Inventory"** (similar to Projects, Clients, Pipeline)

#### Tables:

**`equipment_categories`**
- Master list of equipment types
- Examples: Network Equipment, Cashless Systems, Power, Access Control
- Pre-seeded with 7 default categories

**`equipment_items`**
- Master inventory of all physical equipment
- Each item has: SKU, serial numbers, quantity, location, condition
- Tracked fields: cost, purchase date, warranty, maintenance schedule
- `total_quantity` vs `available_quantity` (auto-calculated)

**`equipment_bundles`**
- Pre-configured sets of equipment (e.g., "Access Control Package")
- Links to multiple `equipment_bundle_items`

**`equipment_bundle_items`**
- Junction table linking bundles to specific equipment with quantities

#### How It Works:

1. **Inventory Page**: Manage master equipment list
   - Add new equipment items
   - Track serial numbers, maintenance, location
   - See availability across all projects

2. **Project Logistics Tab**: Allocate inventory to project
   - Select from master `equipment_items`
   - Creates records in `project_equipment_planning`
   - Auto-updates `available_quantity` in inventory

**Data Flow**:
```
Inventory (Master) → Project Equipment Planning → Site Allocation → JUE Export
```

---

### 3. LOGISTICS MODULE (Project Tab)

**Tables**:

**`project_equipment_planning`**
- Links projects to `equipment_items` from Inventory
- Categories: Network, Cashless, Power, Other
- Tracks: `quantity_planned`, `quantity_allocated`
- Flag: `pushed_from_roi` (when ROI is locked)

**`project_site_locations`**
- Specific locations at venue (e.g., "Main Entrance", "VIP Bar")
- Categories: Access Control, Accreditation, POS, TopUp, Production
- Each location has multiple equipment assignments

**`project_site_equipment`**
- Equipment allocated to specific site locations
- Links: `project_id` + `site_location_id` + `equipment_item_id`
- Tracks specific serial numbers assigned

**`project_jue_status`**
- JUE integration status per project
- Status: Awaiting Push → Awaiting Confirmation → Request Received

**`project_logistics_comments`**
- Team collaboration with @mentions
- Nested comments (replies)

**Logistics Tab Structure**:
1. Equipment Planning sub-tab → Uses `project_equipment_planning`
2. Site Allocation sub-tab → Uses `project_site_locations` + `project_site_equipment`
3. Shipping Documentation sub-tab → Document uploads

---

### 4. ROI MODULE (Financial Source of Truth)

**Tables**:

**`project_roi_calculations`**
- One per project (1:1 relationship)
- Tracks: Estimates vs Actuals (revenue, costs, margin)
- Status: Draft → In Review → Locked → Completed
- When `status = 'Locked'`: pushes estimates to other modules

**`project_roi_revenue`**
- Revenue streams (multiple per project)
- Categories: Ticket Sales, Cashless, Sponsorship, etc.
- Both `estimate` and `actual` columns

**`project_roi_costs`**
- Cost categories (multiple per project)
- `source_module`: Tracks where actuals come from (Crew/Logistics/Manual)
- When Crew costs are finalized → updates actuals here

**`project_roi_scenarios`**
- Best/Expected/Worst case scenarios
- Used for scenario planning

**Data Flow**:
```
ROI Locked → Estimates push to Crew/Logistics/Operations
Crew Actuals → Flow back to ROI Costs (source_module = 'Crew')
Logistics Actuals → Flow back to ROI Costs (source_module = 'Logistics')
```

**Automatic Calculation**:
- Triggers auto-calculate totals when revenue/costs change
- Margin = Revenue - Costs
- Margin % = (Margin / Costs) * 100

---

### 5. CREW MODULE (Links to Real Users)

**Important**: Crew are NOT separate entities. They are `user_profiles` (real platform users).

**Tables**:

**`project_assignments`**
- Links projects to users (`user_id` → `user_profiles`)
- Tracks: role, daily rate, estimated vs actual days
- Status: Pending → Confirmed → Active → Completed
- `pushed_from_roi`: True when ROI pushes crew estimates

**`project_crew_compliance`**
- Per-user, per-project compliance tracking
- DBS checks, insurance, passport, visa status
- Links to `user_profiles` for user's stored documents

**`project_crew_travel_flights`**
- Flight bookings for crew (Outbound/Inbound)
- Links to `user_profiles` (which crew member)

**`project_crew_travel_drives`**
- Vehicle/drive bookings

**`project_crew_accommodation`**
- Hotel bookings per crew member

**`project_crew_rota`**
- Daily schedule per crew member
- Date + user + shift times + status (Working/Off/Travel/Sick)

**Data Flow**:
```
User Profiles (Team Page) → Project Assignments (Crew Tab) → ROI Actuals
```

**Crew Tab Structure**:
1. Assignment sub-tab → `project_assignments`
2. Compliance sub-tab → `project_crew_compliance`
3. Travel sub-tab → Flights, Drives, Accommodation
4. Costs sub-tab → Pulls from `project_assignments` (rate × days)
5. Rota sub-tab → `project_crew_rota`

---

### 6. OPERATIONS MODULE

**Tables**:

**`project_phases`**
- 5 phases per project (Discover, Build, Prepare, Deliver, Roundup)
- Auto-created when project is created
- Tracks progress percentage per phase

**`project_tasks`**
- Tasks within each phase
- Assigned to users (`assigned_to` → `user_profiles`)
- Priority, status, dependencies
- Estimated vs actual hours

**`project_integrations`**
- External system connections (Teams, SharePoint, Jira, QuickBooks)
- Per-project integration status

**Operations Tab Structure**:
1. Overview sub-tab → Phase summary, team, integrations
2. Tasks sub-tab → All tasks across phases
3. Phase-specific sub-tabs → Discover, Build, Prepare, Deliver, Roundup

---

### 7. CLIENT RELATIONS MODULE

**Tables**:

**`project_internal_debrief`**
- One per project (1:1)
- Post-event internal review
- Ratings, lessons learned, recommendations

**`project_client_feedback`**
- Client satisfaction surveys
- Multiple ratings (overall, technical, support, communication)
- Testimonials

**`project_incidents`**
- Incident tracking during events
- Severity, impact, resolution

**Client Relations Tab Structure**:
1. Internal Debrief sub-tab
2. Client Feedback sub-tab
3. Incidents Review sub-tab
4. Summary & Actions sub-tab

---

### 8. DOCUMENTS MODULE

**Table**: `project_documents`

**Purpose**: Store all project-related documents

**Document Types**:
- Contract (signed agreements)
- SLA (Service Level Agreement)
- SOW (Scope of Work)
- Technical Rider
- Project Info Request
- Menus & Products
- Device Allocation
- Custom documents

**Fields**:
- `file_url`: Storage URL (Supabase Storage or external)
- `document_type`: Category
- `version`: Version tracking
- `status`: Draft → Review → Approved → Signed → Archived
- `signed_at`, `signed_by`: For contracts

---

### 9. NOTIFICATIONS MODULE

**Table**: `project_notifications`

**Purpose**: Project-specific alerts and notifications

**Fields**:
- `notification_type`: Info, Warning, Error, Success, Critical
- `priority`: Low, Medium, High, Critical
- `is_read`, `read_at`: Read status
- `expires_at`: Auto-expire old notifications
- Links to both `project_id` and `user_id`

---

## Key Relationships

### Foreign Key Map

```
projects
├── client_id → clients
├── created_by → auth.users
└── updated_by → auth.users

project_equipment_planning
├── project_id → projects
└── equipment_item_id → equipment_items (Inventory)

project_site_equipment
├── project_id → projects
├── site_location_id → project_site_locations
└── equipment_item_id → equipment_items (Inventory)

project_assignments (Crew)
├── project_id → projects
├── user_id → user_profiles (Real users from Team page)
└── created_by → auth.users

project_roi_calculations
└── project_id → projects (1:1 relationship)

project_tasks
├── project_id → projects
├── phase_id → project_phases
└── assigned_to → user_profiles (Real users)

project_documents
├── project_id → projects
└── created_by → auth.users

project_notifications
├── project_id → projects
└── user_id → user_profiles
```

---

## Data Flow Examples

### Example 1: Equipment Lifecycle

1. **Inventory Page**: Add "POS Terminal X" to master inventory
   - Creates record in `equipment_items`
   - `total_quantity = 10`, `available_quantity = 10`

2. **Project A Logistics Tab**: Allocate 3 POS Terminals
   - Creates record in `project_equipment_planning`
   - `quantity_planned = 3`, `quantity_allocated = 3`
   - **Trigger**: Updates `equipment_items.available_quantity = 7`

3. **Site Allocation**: Assign to "Main Bar"
   - Creates record in `project_site_equipment`
   - Links to site location + equipment item

4. **After Event**: Return equipment
   - Delete/archive `project_site_equipment` record
   - Update `project_equipment_planning` (allocated = 0)
   - **Trigger**: Updates `equipment_items.available_quantity = 10`

### Example 2: Crew Assignment Lifecycle

1. **Team Page**: User "John Doe" exists in `user_profiles`
   - Has: Skills, certifications, daily rate, availability

2. **ROI Module**: Estimate crew costs
   - Add estimate for "Technician × 5 days × £300"
   - ROI gets locked

3. **Crew Module**: Assign John to project
   - Creates `project_assignments` record
   - Links: `project_id` + `user_id` (John)
   - `estimated_days = 5`, `daily_rate = £300`
   - `pushed_from_roi = true`

4. **Rota**: Schedule John's days
   - Creates 5 records in `project_crew_rota`
   - Dates: 2025-06-10 to 2025-06-14

5. **After Event**: Record actual days
   - Update `project_assignments.actual_days = 6` (worked 1 extra day)
   - **Trigger**: Updates `project_roi_costs` actuals = £1,800

6. **ROI Module**: See actual vs estimate
   - Estimate: £1,500 (5 days)
   - Actual: £1,800 (6 days)
   - Variance: +£300

### Example 3: Financial Data Flow (ROI Lock)

1. **ROI Module - Before Lock**:
   - Status: Draft
   - Estimates entered for revenue and costs
   - Can edit freely

2. **ROI Lock Action**:
   - User clicks "Lock ROI"
   - `project_roi_calculations.status = 'Locked'`
   - `locked_at = NOW()`, `locked_by = user_id`

3. **Push to Modules**:
   - Crew estimates → `project_assignments` (creates with `pushed_from_roi = true`)
   - Equipment estimates → `project_equipment_planning`
   - Operations estimates → Budget constraints

4. **During Event**:
   - Crew works → Record actual hours
   - Equipment used → Track actual costs
   - **Cannot edit ROI estimates** (locked)

5. **After Event**:
   - Actuals flow back to `project_roi_costs.actual`
   - Margin calculations auto-update
   - ROI shows Estimate vs Actual comparison

---

## Indexes & Performance

### Critical Indexes Created:

**Projects**:
- `project_code` (unique, where not deleted)
- `client_id`, `status`, `current_phase`
- `event_start_date` (for timeline queries)

**Logistics**:
- `project_id` on all project-related tables
- `equipment_item_id` for inventory lookups

**Crew**:
- `user_id` on all crew tables (fast user lookups)
- `project_id, date` composite on rota (day views)

**ROI**:
- `project_id` on calculations (1:1 lookup)
- `roi_calculation_id` on revenue/costs (aggregation)

---

## Triggers & Auto-Calculations

### 1. Equipment Availability Trigger
```sql
-- When equipment is allocated to projects
-- Auto-updates available_quantity in equipment_items
```

### 2. ROI Totals Trigger
```sql
-- When revenue or cost rows change
-- Auto-recalculates totals and margins in project_roi_calculations
```

### 3. Auto-Create ROI Trigger
```sql
-- When new project is created
-- Auto-creates project_roi_calculations record
```

### 4. Auto-Create Phases Trigger
```sql
-- When new project is created
-- Auto-creates 5 phase records (Discover through Roundup)
```

---

## Security (Row Level Security)

All tables have RLS enabled with basic authenticated user policies.

**Current Policy**: Authenticated users can view/edit all data

**TODO**: Implement granular permissions based on:
- User role (Master/Senior/Mid/External/HR)
- Project assignment (only assigned users can edit)
- Module permissions (from permissions matrix)

---

## Migration Instructions

### To Apply This Schema:

1. **Via Supabase Dashboard** (Recommended):
   - Go to SQL Editor
   - Copy contents of `004_complete_platform_architecture.sql`
   - Click "Run"
   - Verify success messages

2. **Via Supabase CLI**:
   ```bash
   cd /path/to/project
   npx supabase db push
   ```

3. **Check What Was Created**:
   ```sql
   -- See all tables
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY table_name;

   -- Check equipment categories
   SELECT * FROM equipment_categories;

   -- Check if ROI was auto-created for projects
   SELECT p.project_code, r.status
   FROM projects p
   LEFT JOIN project_roi_calculations r ON p.id = r.project_id;
   ```

---

## Next Steps

### Immediate:
1. ✅ Run migration file in Supabase
2. Update `projectService.ts` to save all Core Info fields
3. Create `inventoryService.ts` for equipment management
4. Create `roiService.ts` for financial calculations
5. Build Inventory main page UI

### Phase 2:
1. Implement crew assignment UI linking to user_profiles
2. Build site allocation interface
3. Create ROI lock/unlock functionality
4. Implement data flow between modules

### Phase 3:
1. Granular RLS policies based on user roles
2. External integrations (JUE, Jira, QuickBooks)
3. Audit trail reporting
4. Advanced financial analytics

---

## Table Count Summary

- **Core**: 1 (projects - expanded)
- **Inventory**: 4 (categories, items, bundles, bundle_items)
- **Logistics**: 6 (equipment planning, site locations, site equipment, JUE status, comments)
- **ROI**: 4 (calculations, revenue, costs, scenarios)
- **Crew**: 6 (assignments, compliance, flights, drives, accommodation, rota)
- **Operations**: 3 (phases, tasks, integrations)
- **Client Relations**: 3 (debrief, feedback, incidents)
- **Documents**: 1
- **Notifications**: 1

**Total**: 29 new tables + existing tables = **35+ tables**

---

## Entity Relationship Diagram (Conceptual)

```
INVENTORY (Master Data)
    equipment_categories
    equipment_items ←─────┐
    equipment_bundles     │
                          │
PROJECTS                  │
    projects ──┬──────────┤
               │          │
    ┌──────────┴──────────┴───────────┬────────────┬────────────┐
    │                                  │            │            │
LOGISTICS                           CREW         OPERATIONS   DOCUMENTS
    project_equipment_planning ─────┘      project_assignments    project_documents
    project_site_locations                 project_crew_*
    project_site_equipment                      ↓
         ↓                                 user_profiles
    JUE Export                            (Real Users)
                                               ↓
ROI (Source of Truth)                     Team Page
    project_roi_calculations
    project_roi_revenue
    project_roi_costs ←────────────────── Actuals flow back
```

---

**Document Version**: 1.0
**Last Updated**: 2025-10-10
**Author**: Claude (AI Assistant)
**Status**: Complete - Ready for Implementation
