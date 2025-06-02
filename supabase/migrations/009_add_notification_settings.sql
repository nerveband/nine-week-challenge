-- Add notification settings to profiles table
ALTER TABLE profiles ADD COLUMN notification_morning BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN notification_afternoon BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN notification_evening BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN notification_morning_time TIME DEFAULT '08:00:00';
ALTER TABLE profiles ADD COLUMN notification_afternoon_time TIME DEFAULT '12:00:00';
ALTER TABLE profiles ADD COLUMN notification_evening_time TIME DEFAULT '18:00:00';

-- Add comments to explain the fields
COMMENT ON COLUMN profiles.notification_morning IS 'Enable morning notification reminder';
COMMENT ON COLUMN profiles.notification_afternoon IS 'Enable afternoon notification reminder';
COMMENT ON COLUMN profiles.notification_evening IS 'Enable evening notification reminder';
COMMENT ON COLUMN profiles.notification_morning_time IS 'Time for morning notification';
COMMENT ON COLUMN profiles.notification_afternoon_time IS 'Time for afternoon notification';
COMMENT ON COLUMN profiles.notification_evening_time IS 'Time for evening notification';