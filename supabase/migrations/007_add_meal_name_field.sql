-- Add meal_name field to meals table to allow users to customize meal names
ALTER TABLE meals ADD COLUMN meal_name VARCHAR(100);

-- Update the meal_name with default values based on meal_type
UPDATE meals 
SET meal_name = CASE 
  WHEN meal_type = 'meal1' THEN 'Breakfast'
  WHEN meal_type = 'meal2' THEN 'Lunch'
  WHEN meal_type = 'meal3' THEN 'Dinner'
  WHEN meal_type = 'snack' THEN 'Snack'
  ELSE 'Meal'
END
WHERE meal_name IS NULL;