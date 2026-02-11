-- Add hardware metadata columns to consoles table
ALTER TABLE consoles 
ADD COLUMN IF NOT EXISTS connectors TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS asset_records TEXT[] DEFAULT '{}';

-- Add comment for clarity
COMMENT ON COLUMN consoles.connectors IS 'Physical connectors/ports available on the device';
COMMENT ON COLUMN consoles.asset_records IS 'Internal asset tracking identifiers or audit records';
