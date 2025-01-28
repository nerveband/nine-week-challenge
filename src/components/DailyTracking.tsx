import { useState, useEffect } from 'react';
import { databaseService } from '@/services/DatabaseService';
import type { DailyTracking as DailyTrackingType, MealEntry } from '@/types';
import { 
  Clock as ClockIcon, 
  Droplets as DropletsIcon,
  Footprints as FootprintsIcon,
  Scale as ScaleIcon, 
  Heart as HeartIcon, 
  Sparkles as SparklesIcon, 
  Calendar as CalendarIcon,
  UtensilsCrossed as UtensilsIcon,
  Brain as BrainIcon,
  Gauge as GaugeIcon,
  Timer as TimerIcon,
  Cookie as CookieIcon,
  Pencil as PencilIcon,
  Plus as PlusIcon,
  Trash as TrashIcon,
  Check as CheckIcon,
  X as XMarkIcon,
  Loader2 as Loader2Icon,
  HelpCircle as HelpCircleIcon,
  Info as InfoIcon
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Toggle } from '@/components/ui/toggle';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { DAILY_TRACKING_TOOLTIPS, SECTION_TOOLTIPS } from '@/constants/tooltips';
import { format } from 'date-fns';
import { useTooltipPreference } from '@/hooks/useTooltipPreference';

const DEFAULT_MEAL_ENTRY: MealEntry = {
  time: '',
  hungerLevel: 5,
  fullnessLevel: 5,
  mindfulnessScore: 3,
  hungerDuration: 0,
  slowEatingScore: 3,
  notes: '',
};

const TREAT_CATEGORIES = [
  { id: 'sweets', label: 'Sweets/Candy/Cake', emoji: '🍰' },
  { id: 'breads', label: 'Extra Breads', emoji: '🥖' },
  { id: 'alcohol', label: 'Alcohol', emoji: '🍷' },
  { id: 'fried', label: 'Fried Foods', emoji: '🍟' },
  { id: 'drinks', label: 'Sugary Drinks', emoji: '🥤' },
  { id: 'snacks', label: 'Snack Foods', emoji: '🍿' },
] as const;

interface LevelOption {
  value: number;
  label: string;
  description: string;
}

const FULLNESS_LEVELS: LevelOption[] = [
  { value: 1, label: 'Still Hungry', description: 'Not satisfied, could eat more' },
  { value: 2, label: 'Satisfied', description: 'Comfortably full' },
  { value: 3, label: 'Too Full', description: 'Ate more than needed' },
];

const HUNGER_DURATIONS: LevelOption[] = [
  { value: 15, label: '< 15 minutes', description: 'Ate right after feeling hungry' },
  { value: 30, label: '15-30 minutes', description: 'Waited a short while' },
  { value: 60, label: '> 30 minutes', description: 'Waited longer' },
];

const MINDFULNESS_LEVELS = [
  { value: 1, label: '1 - Completely Distracted' },
  { value: 2, label: '2 - Mostly Distracted' },
  { value: 3, label: '3 - Somewhat Present' },
  { value: 4, label: '4 - Mostly Present' },
  { value: 5, label: '5 - Fully Present' },
];

const SLOW_EATING_LEVELS = [
  { value: 1, label: '1 - Very Fast/Rushed' },
  { value: 2, label: '2 - Somewhat Fast' },
  { value: 3, label: '3 - Moderate Pace' },
  { value: 4, label: '4 - Mindfully Slow' },
  { value: 5, label: '5 - Very Slow & Mindful' },
];

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'] as const;
type MealType = typeof MEAL_TYPES[number];

export function DailyTracking() {
  const today = new Date().toISOString().split('T')[0];
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [tracking, setTracking] = useState<DailyTrackingType>(() => {
    return {
      id: crypto.randomUUID(),
      userId: 'default',
      date: today,
      dailies: {
        sleepHours: 0,
        waterOz: 0,
        steps: 0
      },
      meals: {
        breakfast: { ...DEFAULT_MEAL_ENTRY },
        lunch: { ...DEFAULT_MEAL_ENTRY },
        dinner: { ...DEFAULT_MEAL_ENTRY },
        snacks: []
      },
      habits: {
        mealsWithinSchedule: false,
        noSnacking: false,
        mindfulEating: false,
        hungerAwareness: false,
        slowEating: false,
        treatAwareness: false
      },
      treats: {
        count: 0,
        categories: [],
        notes: ''
      },
      dailyWin: '',
      notes: ''
    };
  });

  const { showTooltips } = useTooltipPreference();

  useEffect(() => {
    const loadTracking = async () => {
      try {
        setIsLoading(true);
        const savedTracking = await databaseService.getDailyTracking(today);
        if (savedTracking) {
          setTracking(savedTracking);
        }
      } catch (err) {
        console.error('Error loading daily tracking:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTracking();
  }, [today]);

  const handleDailiesChange = (field: keyof DailyTrackingType['dailies'], value: number) => {
    setTracking((prev) => ({
      ...prev,
      dailies: {
        ...prev.dailies,
        [field]: value,
      },
    }));
  };

  const handleMealChange = (mealType: MealType, field: keyof MealEntry, value: string | number) => {
    setTracking((prev) => ({
      ...prev,
      meals: {
        ...prev.meals,
        [mealType]: {
          ...prev.meals[mealType],
          [field]: value,
        },
      },
    }));
  };

  const handleAddSnack = () => {
    setTracking((prev) => ({
      ...prev,
      meals: {
        ...prev.meals,
        snacks: [...prev.meals.snacks, { ...DEFAULT_MEAL_ENTRY }],
      },
    }));
  };

  const handleRemoveSnack = (index: number) => {
    setTracking((prev) => ({
      ...prev,
      meals: {
        ...prev.meals,
        snacks: prev.meals.snacks.filter((_, i) => i !== index),
      },
    }));
  };

  const handleSnackChange = (index: number, field: keyof MealEntry, value: string | number) => {
    setTracking((prev) => ({
      ...prev,
      meals: {
        ...prev.meals,
        snacks: prev.meals.snacks.map((snack, i) =>
          i === index ? { ...snack, [field]: value } : snack
        ),
      },
    }));
  };

  const handleHabitChange = (habit: keyof DailyTrackingType['habits']) => {
    setTracking((prev) => ({
      ...prev,
      habits: {
        ...prev.habits,
        [habit]: !prev.habits[habit],
      },
    }));
  };

  const handleTreatChange = (field: 'count' | 'notes', value: number | string) => {
    setTracking((prev) => ({
      ...prev,
      treats: {
        ...prev.treats,
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await databaseService.setDailyTracking(tracking);
      setSaveMessage('Changes saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error('Error saving daily tracking:', err);
      setSaveMessage('Failed to save changes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this daily tracking record?')) {
      try {
        setIsLoading(true);
        await databaseService.deleteDailyTracking(tracking.id);
        setTracking({
          id: crypto.randomUUID(),
          userId: 'default',
          date: today,
          dailies: {
            sleepHours: 0,
            waterOz: 0,
            steps: 0
          },
          meals: {
            breakfast: { ...DEFAULT_MEAL_ENTRY },
            lunch: { ...DEFAULT_MEAL_ENTRY },
            dinner: { ...DEFAULT_MEAL_ENTRY },
            snacks: []
          },
          habits: {
            mealsWithinSchedule: false,
            noSnacking: false,
            mindfulEating: false,
            hungerAwareness: false,
            slowEating: false,
            treatAwareness: false
          },
          treats: {
            count: 0,
            categories: [],
            notes: ''
          },
          dailyWin: '',
          notes: ''
        });
        setSaveMessage('Daily tracking record deleted.');
      } catch (err) {
        console.error('Error deleting daily tracking:', err);
        setSaveMessage('Failed to delete record. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getLevelLabel = (value: number, levels: LevelOption[]) => {
    return levels.find(level => level.value === value)?.label || '';
  };

  const renderTooltip = (content: string) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4 p-0 hover:bg-accent hover:text-accent-foreground"
        >
          <HelpCircleIcon className="h-4 w-4" />
          <span className="sr-only">Help</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent 
        side="right" 
        align="center"
        className="max-w-[280px]"
      >
        <p className="text-sm">{content}</p>
      </TooltipContent>
    </Tooltip>
  );

  const renderSectionTooltip = (section: keyof typeof SECTION_TOOLTIPS) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 p-0 ml-2 hover:bg-accent hover:text-accent-foreground"
        >
          <HelpCircleIcon className="h-5 w-5" />
          <span className="sr-only">Help for {section}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent 
        side="right" 
        align="start"
        className="max-w-[320px]"
      >
        <p className="text-sm whitespace-pre-line">{SECTION_TOOLTIPS[section]}</p>
      </TooltipContent>
    </Tooltip>
  );

  const habitIcons = {
    mealsWithinSchedule: <CalendarIcon className="h-4 w-4" />,
    noSnacking: <UtensilsIcon className="h-4 w-4" />,
    mindfulEating: <BrainIcon className="h-4 w-4" />,
    hungerAwareness: <GaugeIcon className="h-4 w-4" />,
    slowEating: <TimerIcon className="h-4 w-4" />,
    treatAwareness: <CookieIcon className="h-4 w-4" />,
  };

  const habitColors = {
    mealsWithinSchedule: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    noSnacking: "bg-green-100 text-green-700 hover:bg-green-200",
    mindfulEating: "bg-purple-100 text-purple-700 hover:bg-purple-200",
    hungerAwareness: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
    slowEating: "bg-pink-100 text-pink-700 hover:bg-pink-200",
    treatAwareness: "bg-orange-100 text-orange-700 hover:bg-orange-200",
  };

  const renderMealSection = (mealType: MealType) => {
    const meal = tracking.meals[mealType];
    const wasEaten = meal.time !== '';

    return (
      <Card key={mealType} className={cn(!wasEaten && "opacity-75")}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="capitalize flex items-center gap-2">
              {mealType}
              {wasEaten && (
                <Badge variant="default" className="ml-2">
                  {meal.time}
                </Badge>
              )}
            </CardTitle>
            <Toggle
              pressed={wasEaten}
              onPressedChange={(pressed) => {
                handleMealChange(mealType, 'time', pressed ? '12:00' : '');
                if (!pressed) {
                  handleMealChange(mealType, 'hungerDuration', 30);
                  handleMealChange(mealType, 'fullnessLevel', 2);
                }
              }}
              className={cn(
                "relative",
                wasEaten && "bg-green-100 text-green-700 hover:bg-green-200"
              )}
            >
              {wasEaten ? 'Eaten' : 'Not Eaten'}
            </Toggle>
          </div>
        </CardHeader>
        {wasEaten && (
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={meal.time}
                  onChange={(e) => handleMealChange(mealType, 'time', e.target.value)}
                  className="w-[140px]"
                />
              </div>

              <div className="space-y-3">
                <Label>How long were you hungry before eating?</Label>
                <div className="flex flex-col gap-2">
                  {HUNGER_DURATIONS.map((duration) => (
                    <Button
                      key={duration.value}
                      variant="outline"
                      className={cn(
                        "flex items-center justify-between w-full px-4 py-3 h-auto text-left",
                        meal.hungerDuration === duration.value && 
                        "border-primary bg-primary/5 text-primary hover:bg-primary/10"
                      )}
                      onClick={() => handleMealChange(mealType, 'hungerDuration', duration.value)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{duration.label}</span>
                        <span className="text-sm text-muted-foreground">{duration.description}</span>
                      </div>
                      {meal.hungerDuration === duration.value && (
                        <CheckIcon className="h-4 w-4 text-primary" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>How full did you feel after eating?</Label>
                <div className="flex flex-col gap-2">
                  {FULLNESS_LEVELS.map((level) => (
                    <Button
                      key={level.value}
                      variant="outline"
                      className={cn(
                        "flex items-center justify-between w-full px-4 py-3 h-auto text-left",
                        meal.fullnessLevel === level.value && 
                        "border-primary bg-primary/5 text-primary hover:bg-primary/10"
                      )}
                      onClick={() => handleMealChange(mealType, 'fullnessLevel', level.value)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{level.label}</span>
                        <span className="text-sm text-muted-foreground">{level.description}</span>
                      </div>
                      {meal.fullnessLevel === level.value && (
                        <CheckIcon className="h-4 w-4 text-primary" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={meal.notes}
                  onChange={(e) => handleMealChange(mealType, 'notes', e.target.value)}
                  placeholder="Add any notes about this meal..."
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Daily Tracking</h1>
          <p className="text-muted-foreground mt-2">
            {new Date(today).toLocaleDateString(undefined, { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 bg-muted px-4 py-2 rounded-md">
              <Loader2Icon className="animate-spin h-4 w-4" />
              <span className="text-sm">Saving...</span>
            </div>
          )}
          {saveMessage && (
            <Alert variant={saveMessage.includes('success') ? 'default' : 'destructive'} className="py-2 px-4">
              <AlertDescription className="text-sm">{saveMessage}</AlertDescription>
            </Alert>
          )}
          <div className="flex gap-2 sm:gap-4">
            <Button 
              onClick={handleSave} 
              disabled={isLoading}
              className="flex-1 sm:flex-none sm:w-[100px]"
            >
              Save
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isLoading}
              className="flex-1 sm:flex-none"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Left Column */}
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                Daily Stats {renderSectionTooltip('dailyStats')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <ClockIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <Label>Sleep Hours</Label>
                  <Input
                    type="number"
                    value={tracking.dailies.sleepHours}
                    onChange={(e) => handleDailiesChange('sleepHours', Number(e.target.value))}
                    min={0}
                    max={24}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center">
                  <DropletsIcon className="h-6 w-6 text-cyan-600" />
                </div>
                <div className="flex-1">
                  <Label>Water (oz)</Label>
                  <Input
                    type="number"
                    value={tracking.dailies.waterOz}
                    onChange={(e) => handleDailiesChange('waterOz', Number(e.target.value))}
                    min={0}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <FootprintsIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <Label>Steps</Label>
                  <Input
                    type="number"
                    value={tracking.dailies.steps}
                    onChange={(e) => handleDailiesChange('steps', Number(e.target.value))}
                    min={0}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                Habits {renderSectionTooltip('habits')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(tracking.habits).map(([habit, isChecked]) => (
                  <Button
                    key={habit}
                    variant="ghost"
                    className={cn(
                      "flex items-start gap-3 h-auto py-3 px-4 transition-colors break-words",
                      isChecked ? habitColors[habit as keyof typeof habitColors] : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                    onClick={() => handleHabitChange(habit as keyof typeof tracking.habits)}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {habitIcons[habit as keyof typeof habitIcons]}
                    </div>
                    <span className="text-sm font-medium leading-tight">
                      {habit.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className="ml-auto flex-shrink-0">
                      <div className={cn(
                        "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                        isChecked ? "border-current bg-white" : "border-gray-400"
                      )}>
                        {isChecked && <CheckIcon className="h-3 w-3" />}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                Daily Summary {renderSectionTooltip('summary')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Daily Win</Label>
                <Textarea
                  value={tracking.dailyWin}
                  onChange={(e) => setTracking((prev) => ({ ...prev, dailyWin: e.target.value }))}
                  placeholder="What was your biggest success today?"
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={tracking.notes}
                  onChange={(e) => setTracking((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any other thoughts or observations about your day?"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                Meals {renderSectionTooltip('meals')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {MEAL_TYPES.map(renderMealSection)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                Treats {renderSectionTooltip('treats')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Count</Label>
                <Input
                  type="number"
                  value={tracking.treats.count}
                  onChange={(e) => handleTreatChange('count', Number(e.target.value))}
                  min={0}
                />
              </div>
              <div>
                <Label>Categories</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {TREAT_CATEGORIES.map((category) => (
                    <Toggle
                      key={category.id}
                      pressed={tracking.treats.categories.includes(category.label)}
                      onPressedChange={(pressed) => {
                        setTracking((prev) => ({
                          ...prev,
                          treats: {
                            ...prev.treats,
                            categories: pressed
                              ? [...prev.treats.categories, category.label]
                              : prev.treats.categories.filter((c) => c !== category.label),
                          },
                        }));
                      }}
                      className={cn(
                        "flex items-center gap-2 justify-start h-auto py-3 px-4 hover:bg-accent",
                        "border-2 rounded-lg",
                        tracking.treats.categories.includes(category.label)
                          ? "border-primary bg-primary/5 text-primary hover:bg-primary/10"
                          : "border-muted"
                      )}
                    >
                      <span className="text-xl" role="img" aria-label={category.label}>
                        {category.emoji}
                      </span>
                      <span className="text-sm font-medium">{category.label}</span>
                    </Toggle>
                  ))}
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={tracking.treats.notes}
                  onChange={(e) => handleTreatChange('notes', e.target.value)}
                  placeholder="Add any notes about your treats..."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 