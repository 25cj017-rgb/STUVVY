export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export type CategoryId = 'south' | 'north' | 'healthy';

export type MealTime = 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'beverages' | 'specials';


export type BeneficiaryStatus = 'Standard' | 'Subsidized' | 'Needy';

export interface NutritionalInfo {
  calories: number;
  protein: string;
  carbs: string;
  fats: string;
  fiber?: string;
  isGlutenFree?: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  categoryId: CategoryId;
  categoryName: string;
  mealTimes: MealTime[]; // Breakfast, Lunch, Dinner
  days: DayOfWeek[];
  description: string;
  portionSize: string;
  rating: number;
  reviewCount: number;
  prepTime: string;
  standardPrice: number;
  subsidizedPrice: number;
  isSubsidizedEligible: boolean;
  image: string;
  nutritionalInfo: NutritionalInfo;
  tags: string[];
  isPopular?: boolean;
  isVeg: boolean;
  dateStr?: string;
  weekNumber?: number;
}

export interface UserProfile {
  id: string;
  fullName: string;
  mobileNumber: string;
  dob: string;
  isVerified: boolean;
  beneficiaryStatus: BeneficiaryStatus;
  dietaryPreferences: string[];
  allergyInfo: string[];
  address: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  selectedDays: DayOfWeek[];
  pricingOption: 'standard' | 'subsidized';
}
