import { CleanupAction, Statistics, User } from '@/lib/types';

// Mock current user
export const currentUser: User = {
  id: '1',
  email: 'benoit@zerodechets.fr',
  name: 'Benoît Martin',
  role: 'volunteer',
  joinedDate: new Date('2023-06-15'),
};

// Mock cleanup actions
export const mockCleanupActions: CleanupAction[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Benoît Martin',
    date: new Date('2026-01-20'),
    location: 'Plage du Moulin Blanc, Brest',
    latitude: 48.3905,
    longitude: -4.4516,
    wasteTypes: ['Plastique', 'Métal', 'Verre'],
    quantity: 12.5,
    photos: ['https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800'],
    notes: 'Grande quantité de déchets près des rochers',
    createdAt: new Date('2026-01-20'),
  },
  {
    id: '2',
    userId: '2',
    userName: 'Sophie Dupont',
    date: new Date('2026-01-18'),
    location: 'Anse du Passage, Camaret',
    latitude: 48.2794,
    longitude: -4.5945,
    wasteTypes: ['Plastique', 'Cordages'],
    quantity: 8.3,
    photos: ['https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800'],
    createdAt: new Date('2026-01-18'),
  },
  {
    id: '3',
    userId: '1',
    userName: 'Benoît Martin',
    date: new Date('2026-01-15'),
    location: 'Port de Camaret',
    latitude: 48.2767,
    longitude: -4.5936,
    wasteTypes: ['Plastique', 'Métal', 'Papier'],
    quantity: 15.7,
    photos: ['https://images.unsplash.com/photo-1582726411225-12e2e1e6f028?w=800'],
    notes: 'Collaboration avec 5 autres bénévoles',
    createdAt: new Date('2026-01-15'),
  },
  {
    id: '4',
    userId: '3',
    userName: 'Marc Leroux',
    date: new Date('2026-01-12'),
    location: 'Plage de Porspaul, Lampaul',
    latitude: 48.3344,
    longitude: -4.7625,
    wasteTypes: ['Plastique', 'Filets de pêche'],
    quantity: 21.2,
    photos: ['https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800'],
    createdAt: new Date('2026-01-12'),
  },
  {
    id: '5',
    userId: '2',
    userName: 'Sophie Dupont',
    date: new Date('2026-01-10'),
    location: 'Plage des Blancs Sablons, Le Conquet',
    latitude: 48.3606,
    longitude: -4.7678,
    wasteTypes: ['Plastique', 'Verre', 'Métal'],
    quantity: 9.8,
    photos: ['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'],
    createdAt: new Date('2026-01-10'),
  },
];

// Mock statistics
export const mockStatistics: Statistics = {
  totalKg: mockCleanupActions.reduce((sum, action) => sum + action.quantity, 0),
  totalCleanups: mockCleanupActions.length,
  totalVolunteers: 3,
  lastCleanupDate: new Date('2026-01-20'),
  wasteByType: {
    Plastique: 45.2,
    Métal: 8.6,
    Verre: 6.3,
    Cordages: 5.1,
    'Filets de pêche': 2.1,
    Papier: 0.2,
  },
  monthlyTrend: [
    { month: 'Août 2025', kg: 42.3, actions: 8 },
    { month: 'Sept. 2025', kg: 56.7, actions: 11 },
    { month: 'Oct. 2025', kg: 38.9, actions: 7 },
    { month: 'Nov. 2025', kg: 51.2, actions: 9 },
    { month: 'Déc. 2025', kg: 63.4, actions: 12 },
    { month: 'Janv. 2026', kg: 67.5, actions: 5 },
  ],
};

// Waste type options
export const wasteTypes = [
  'Plastique',
  'Métal',
  'Verre',
  'Papier',
  'Cordages',
  'Filets de pêche',
  'Bois',
  'Textile',
  'Autres',
];

// Local storage keys
export const STORAGE_KEYS = {
  USER: 'zdr_user',
  CLEANUPS: 'zdr_cleanups',
  IS_LOGGED_IN: 'zdr_logged_in',
};

// Helper functions
export const getStoredUser = (): User | null => {
  const stored = localStorage.getItem(STORAGE_KEYS.USER);
  if (stored) {
    const parsed = JSON.parse(stored);
    return {
      ...parsed,
      joinedDate: new Date(parsed.joinedDate),
    };
  }
  return null;
};

export const getStoredCleanups = (): CleanupAction[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.CLEANUPS);
  if (stored) {
    const parsed = JSON.parse(stored);
    return parsed.map((action: any) => ({
      ...action,
      date: new Date(action.date),
      createdAt: new Date(action.createdAt),
    }));
  }
  return mockCleanupActions;
};

export const saveCleanup = (cleanup: CleanupAction): void => {
  const cleanups = getStoredCleanups();
  cleanups.unshift(cleanup);
  localStorage.setItem(STORAGE_KEYS.CLEANUPS, JSON.stringify(cleanups));
};

export const isLoggedIn = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
};

export const login = (email: string, password: string): boolean => {
  // Mock authentication - accept any credentials
  localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  return true;
};

export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

export const register = (name: string, email: string, password: string): boolean => {
  const newUser: User = {
    id: Date.now().toString(),
    email,
    name,
    role: 'volunteer',
    joinedDate: new Date(),
  };
  localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
  return true;
};
