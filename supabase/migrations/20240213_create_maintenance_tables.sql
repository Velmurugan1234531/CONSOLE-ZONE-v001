-- Maintenance & Control Module Schema

-- 1. Maintenance Status Enum
CREATE TYPE maintenance_status AS ENUM ('Operational', 'Due-Soon', 'Overdue', 'Critical', 'In-Repair');

-- 2. Consoles Table Updates (Add Tracking Fields)
ALTER TABLE public.consoles 
ADD COLUMN IF NOT EXISTS maintenance_status maintenance_status DEFAULT 'Operational',
ADD COLUMN IF NOT EXISTS usage_metrics JSONB DEFAULT '{"total_rentals": 0, "total_days_rented": 0, "last_service_date": null, "service_count": 0}'::jsonb;

-- 3. Maintenance Policies Table
CREATE TABLE IF NOT EXISTS public.maintenance_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    interval_days INTEGER, -- e.g., Service every 90 days
    interval_rentals INTEGER, -- e.g., Service every 10 rentals
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Work Orders Table (Internal Service Tickets)
CREATE TYPE work_order_status AS ENUM ('Open', 'In-Progress', 'Waiting-Parts', 'Completed', 'Cancelled');
CREATE TYPE work_order_priority AS ENUM ('Low', 'Medium', 'High', 'Critical');

CREATE TABLE IF NOT EXISTS public.work_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES public.consoles(id) ON DELETE CASCADE,
    technician_id UUID REFERENCES public.profiles(id), -- Assigned Admin
    status work_order_status DEFAULT 'Open',
    priority work_order_priority DEFAULT 'Medium',
    title TEXT NOT NULL,
    description TEXT,
    notes TEXT, -- Technician internal notes
    cost DECIMAL(10, 2) DEFAULT 0.00,
    parts_used JSONB DEFAULT '[]'::jsonb, -- Array of { name, cost, qty }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 5. QC Checklists (Templates)
CREATE TABLE IF NOT EXISTS public.qc_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- e.g., "PS5 Pre-Rental Check"
    items JSONB NOT NULL, -- Array of strings or objects defining checks
    category TEXT, -- e.g., "PS5", "VR", "General"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. QC Records (Performed Inspections)
CREATE TYPE qc_result AS ENUM ('Pass', 'Fail', 'Pass-With-Notes');

CREATE TABLE IF NOT EXISTS public.qc_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES public.consoles(id) ON DELETE CASCADE,
    checklist_id UUID REFERENCES public.qc_checklists(id),
    inspector_id UUID REFERENCES public.profiles(id),
    result qc_result NOT NULL,
    data JSONB NOT NULL, -- The actual filled-out form data
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies (Admin Only access for now)
ALTER TABLE public.maintenance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qc_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qc_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all maintenance data" ON public.maintenance_policies FOR SELECT USING (true);
CREATE POLICY "Admins can manage maintenance data" ON public.maintenance_policies FOR ALL USING (true);

CREATE POLICY "Admins can view work orders" ON public.work_orders FOR SELECT USING (true);
CREATE POLICY "Admins can manage work orders" ON public.work_orders FOR ALL USING (true);

CREATE POLICY "Admins can view qc checklists" ON public.qc_checklists FOR SELECT USING (true);
CREATE POLICY "Admins can manage qc checklists" ON public.qc_checklists FOR ALL USING (true);

CREATE POLICY "Admins can view qc records" ON public.qc_records FOR SELECT USING (true);
CREATE POLICY "Admins can manage qc records" ON public.qc_records FOR ALL USING (true);
