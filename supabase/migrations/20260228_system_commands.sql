CREATE TABLE IF NOT EXISTS system_commands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    command TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE system_commands ENABLE ROW LEVEL SECURITY;

-- Allow access only to the specific Admin UID used across the app
CREATE POLICY "Admins have full access to system_commands" 
ON system_commands FOR ALL 
USING (
  auth.uid() = '52f1626b-c411-48af-aa9d-ee9a6beaabc6'
);
