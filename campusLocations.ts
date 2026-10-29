import { CampusLocation, CampusBuildingId } from '../types';

export const CAMPUS_LOCATIONS: Record<CampusBuildingId, CampusLocation> = {
  library: {
    id: 'library',
    name: 'W.E.B. Du Bois Central Library',
    shortName: 'Central Library',
    coords: { x: 48, y: 38 },
    description: 'Main campus library, study commons, 2nd floor silent reading room, and cafe.',
    safeDropoffSpot: '1st Floor Circulation & Security Desk'
  },
  student_union: {
    id: 'student_union',
    name: 'Campus Student Union & Food Court',
    shortName: 'Student Union',
    coords: { x: 55, y: 58 },
    description: 'Central hub for student dining, club spaces, bookstore, and ballroom.',
    safeDropoffSpot: 'Main Information & Service Desk (Room 102)'
  },
  science_quad: {
    id: 'science_quad',
    name: 'Science & Engineering Complex',
    shortName: 'Science Quad',
    coords: { x: 74, y: 32 },
    description: 'Computer labs, physics lecture halls, chemistry labs, and courtyard.',
    safeDropoffSpot: 'Dean of Engineering Main Office, Hall A'
  },
  rec_center: {
    id: 'rec_center',
    name: 'Campus Recreation & Athletic Center',
    shortName: 'Rec Center',
    coords: { x: 26, y: 72 },
    description: 'Weight rooms, basketball courts, Olympic swimming pool, locker rooms.',
    safeDropoffSpot: 'Front Equipment Check-in Counter'
  },
  oak_quad: {
    id: 'oak_quad',
    name: 'Oak Grove & Memorial Fountain',
    shortName: 'Oak Quad',
    coords: { x: 38, y: 48 },
    description: 'Central outdoor lawn, shaded picnic tables, solar study pods, fountain.',
    safeDropoffSpot: 'North Gate Campus Safety Kiosk'
  },
  dining_hall: {
    id: 'dining_hall',
    name: 'Westlake Dining Commons',
    shortName: 'Dining Commons',
    coords: { x: 76, y: 68 },
    description: 'All-day buffet, smoothie station, bakery, and patio dining.',
    safeDropoffSpot: 'Manager Station / Cashier Register 1'
  },
  dorm_north: {
    id: 'dorm_north',
    name: 'North Residential Village',
    shortName: 'North Dorms',
    coords: { x: 28, y: 22 },
    description: 'Undergraduate dormitory towers, residential courtyards, laundry suites.',
    safeDropoffSpot: 'Village Community Desk (24/7 Staffed)'
  },
  arts_center: {
    id: 'arts_center',
    name: 'Fine Arts Pavilion & Theater',
    shortName: 'Arts Pavilion',
    coords: { x: 80, y: 48 },
    description: 'Concert hall, studio art rooms, graphic design labs, sculpture court.',
    safeDropoffSpot: 'Box Office Lobby Counter'
  }
};

export const CATEGORY_INFO: Record<string, { label: string; icon: string; color: string }> = {
  electronics: { label: 'Electronics & Gadgets', icon: 'Laptop', color: 'indigo' },
  id_cards: { label: 'Student IDs & Cards', icon: 'CreditCard', color: 'blue' },
  keys_wallets: { label: 'Keys & Wallets', icon: 'Key', color: 'amber' },
  bags: { label: 'Bags & Backpacks', icon: 'Briefcase', color: 'purple' },
  clothing: { label: 'Clothing & Jackets', icon: 'Shirt', color: 'rose' },
  study_gear: { label: 'Books & Calculators', icon: 'BookOpen', color: 'emerald' },
  bottles: { label: 'Water Bottles & Mugs', icon: 'Coffee', color: 'cyan' },
  jewelry: { label: 'Jewelry & Watches', icon: 'Watch', color: 'yellow' },
  other: { label: 'Other Items', icon: 'HelpCircle', color: 'slate' }
};

export const SAFE_MEETING_SPOTS = [
  'Central Library 1st Floor Security Desk',
  'Student Union Information Desk',
  'Campus Police / Public Safety Lobby',
  'Rec Center Front Check-in Counter',
  'Westlake Dining Commons Manager Station'
];
