-- Add new fields for Core Info page sections
-- Key Dates section
ALTER TABLE projects 
ADD COLUMN on_site_start_date TIMESTAMPTZ,
ADD COLUMN on_site_end_date TIMESTAMPTZ,
ADD COLUMN show_start_date TIMESTAMPTZ,
ADD COLUMN show_end_date TIMESTAMPTZ,
ADD COLUMN load_in_date TIMESTAMPTZ,
ADD COLUMN load_out_date TIMESTAMPTZ,

-- Cashless Info section  
ADD COLUMN online_vouchers_start_date TIMESTAMPTZ,
ADD COLUMN online_vouchers_end_date TIMESTAMPTZ,
ADD COLUMN topups_start_date TIMESTAMPTZ,
ADD COLUMN topups_end_date TIMESTAMPTZ,

-- Refund Info section
ADD COLUMN refund_window_start_date TIMESTAMPTZ,
ADD COLUMN refund_window_end_date TIMESTAMPTZ,
ADD COLUMN refund_document_url TEXT,
ADD COLUMN refund_fee DECIMAL(10,2),

-- Delivery & Deadlines section
ADD COLUMN delivery_contact_name TEXT,
ADD COLUMN delivery_contact_phone TEXT,
ADD COLUMN delivery_contact_email TEXT,
ADD COLUMN delivery_address_line1 TEXT,
ADD COLUMN delivery_address_line2 TEXT,
ADD COLUMN delivery_city TEXT,
ADD COLUMN delivery_state TEXT,
ADD COLUMN delivery_postal_code TEXT,
ADD COLUMN delivery_country TEXT,

-- Summary Overview section
ADD COLUMN contract_status TEXT DEFAULT 'Pending',
ADD COLUMN roi_status TEXT DEFAULT 'Draft',
ADD COLUMN margin_threshold DECIMAL(5,2) DEFAULT 15.00;

-- Add indexes for performance on date fields
CREATE INDEX idx_projects_on_site_dates ON projects(on_site_start_date, on_site_end_date);
CREATE INDEX idx_projects_show_dates ON projects(show_start_date, show_end_date);
CREATE INDEX idx_projects_refund_dates ON projects(refund_window_start_date, refund_window_end_date);

-- Add constraints
ALTER TABLE projects 
ADD CONSTRAINT check_on_site_dates CHECK (on_site_end_date >= on_site_start_date OR on_site_end_date IS NULL OR on_site_start_date IS NULL),
ADD CONSTRAINT check_show_dates CHECK (show_end_date >= show_start_date OR show_end_date IS NULL OR show_start_date IS NULL),
ADD CONSTRAINT check_refund_dates CHECK (refund_window_end_date >= refund_window_start_date OR refund_window_end_date IS NULL OR refund_window_start_date IS NULL),
ADD CONSTRAINT check_margin_threshold CHECK (margin_threshold >= 0 AND margin_threshold <= 100);