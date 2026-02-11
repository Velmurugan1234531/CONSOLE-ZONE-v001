-- Migration to add user_id to repair_tickets table
ALTER TABLE repair_tickets ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Enable RLS for repair_tickets if not already enabled
ALTER TABLE repair_tickets ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own repair tickets
CREATE POLICY "Users can view own repair tickets" ON repair_tickets
    FOR SELECT USING (auth.uid() = user_id);

-- Allow admins to view all repair tickets
CREATE POLICY "Admins can view all repair tickets" ON repair_tickets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );
