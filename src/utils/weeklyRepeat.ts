// Utility functions for handling weekly repeat functionality

export interface WeeklyRepeatOptions {
  startDate: Date;
  weeks: number;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  time: string; // HH:mm format
}

export const createWeeklyClasses = (
  baseClass: {
    name: string;
    brief_description: string;
    full_description: string;
    instructor: string;
    price: number;
  },
  options: WeeklyRepeatOptions
): Array<{
  name: string;
  brief_description: string;
  full_description: string;
  instructor: string;
  start_time: string;
  price: number;
  weekly_repeat: number;
}> => {
  const classes = [];
  const { startDate, weeks, dayOfWeek, time } = options;

  // Find the first occurrence of the specified day of week
  const firstClassDate = new Date(startDate);
  const currentDayOfWeek = firstClassDate.getDay();
  const daysToAdd = (dayOfWeek - currentDayOfWeek + 7) % 7;
  firstClassDate.setDate(firstClassDate.getDate() + daysToAdd);

  // Set the time
  const [hours, minutes] = time.split(':').map(Number);
  firstClassDate.setHours(hours, minutes, 0, 0);

  // Create classes for each week
  for (let week = 0; week < weeks; week++) {
    const classDate = new Date(firstClassDate);
    classDate.setDate(firstClassDate.getDate() + (week * 7));

    classes.push({
      ...baseClass,
      start_time: classDate.toISOString(),
      weekly_repeat: 0, // Individual classes don't repeat
    });
  }

  return classes;
};

export const getDayOfWeekName = (dayOfWeek: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek];
};

export const getDayOfWeekNumber = (dayName: string): number => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days.indexOf(dayName.toLowerCase());
};

export const formatTimeForInput = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const parseTimeFromInput = (timeString: string): { hours: number; minutes: number } => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return { hours, minutes };
};

// Helper function to get the next occurrence of a specific day of week
export const getNextDayOfWeek = (targetDay: number, fromDate: Date = new Date()): Date => {
  const result = new Date(fromDate);
  const currentDay = result.getDay();
  const daysToAdd = (targetDay - currentDay + 7) % 7;
  result.setDate(result.getDate() + daysToAdd);
  return result;
};

// Helper function to validate weekly repeat settings
export const validateWeeklyRepeat = (weeks: number): string | null => {
  if (weeks < 0) return 'Weekly repeat cannot be negative';
  if (weeks > 26) return 'Weekly repeat cannot exceed 26 weeks';
  return null;
};
