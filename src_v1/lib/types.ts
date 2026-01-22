export interface User {
  id: string;
  email: string;
  name: string;
  role: 'volunteer' | 'admin';
  joinedDate: Date;
}

export interface CleanupAction {
  id: string;
  userId: string;
  userName: string;
  date: Date;
  location: string;
  latitude: number;
  longitude: number;
  wasteTypes: string[];
  quantity: number; // in kg
  photos: string[];
  notes?: string;
  createdAt: Date;
}

export interface Statistics {
  totalKg: number;
  totalCleanups: number;
  totalVolunteers: number;
  lastCleanupDate: Date | null;
  wasteByType: Record<string, number>;
  monthlyTrend: { month: string; kg: number; actions: number }[];
}
