-- Migration to add user_id to sales table
ALTER TABLE sales ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Enable RLS for sales if not already enabled
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own sales
CREATE POLICY "Users can view own sales" ON sales
    FOR SELECT USING (auth.uid() = user_id);

-- Allow admins to view all sales
CREATE POLICY "Admins can view all sales" ON sales
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );
