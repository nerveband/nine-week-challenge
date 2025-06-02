-- Add fasting mode field to daily_tracking table
ALTER TABLE daily_tracking ADD COLUMN is_fasting BOOLEAN DEFAULT FALSE;

-- Add comment to explain the field
COMMENT ON COLUMN daily_tracking.is_fasting IS 'Indicates if the user was fasting on this day';