export interface CustomerRecord {
  sNo: number;
  name: string;      // e.g. "SRI RAM V K"
  mobileNo: string;  // e.g. "9344795832"
  dob: string;       // e.g. "26-10-2007"
  address?: string;  // Primary address
  addresses?: string[]; // Multiple addresses if customer has 2+ locations
  plan?: string;     // e.g. "Weekly" or "Monthly" or "Daily"
  startDate?: string; // e.g. "03-11-2026" or "2026-11-03"
  purchaseDate?: string;
  email?: string;
  locality?: string;
  paymentStatus?: string;
  paymentAmount?: string;
  orderStatus?: string;
  requestedMeals?: string[];
}

// Initial demo customers fallback
export const DEMO_CUSTOMERS_DATABASE: CustomerRecord[] = [
  {
    sNo: 1,
    name: 'YAMUNA J N',
    mobileNo: '9626531680',
    dob: '02/24/2003',
    address: 'Cognizant Technology Solutions, Special Economic Zone (SEZ), Saravanampatti via Keeranatham, Coimbatore, Tamil Nadu 641035, India',
    addresses: [
      'Cognizant Technology Solutions, Special Economic Zone (SEZ), Saravanampatti via Keeranatham, Coimbatore, Tamil Nadu 641035, India',
      'Omega- PG, No-49, Marutham Nagar, Saravanampatti, Coimbatore, Tamil Nadu 641035'
    ],
    plan: 'Monthly',
    startDate: '11/12/2026',
    purchaseDate: '10/29/2026 22:03:21'
  },
  {
    sNo: 2,
    name: 'SANJANA',
    mobileNo: '9444746064',
    dob: '4/23/1996',
    address: '2/712, teachers colony, NGGO COLONY Thudiyalur',
    addresses: [
      '2/712, teachers colony, NGGO COLONY Thudiyalur'
    ],
    plan: 'Daily',
    startDate: '11/6/2026',
    purchaseDate: '11/5/2026 13:27:58'
  }
];

let dynamicCustomers: CustomerRecord[] = [...DEMO_CUSTOMERS_DATABASE];

export const setDynamicCustomers = (customers: CustomerRecord[]) => {
  if (Array.isArray(customers) && customers.length > 0) {
    dynamicCustomers = customers;
  }
};

export const getCustomersDatabase = (): CustomerRecord[] => {
  return dynamicCustomers;
};

export const lookupCustomerByMobile = (mobile: string): CustomerRecord | undefined => {
  const normMobile = normalizeMobile(mobile);
  return dynamicCustomers.find(c => normalizeMobile(c.mobileNo) === normMobile);
};

/**
 * Parses diverse DOB formats into day, month, year numbers.
 * Handles:
 * - YYYY/MM/DD, YYYY-MM-DD
 * - M/D/YYYY, MM/DD/YYYY (e.g. 4/23/1996)
 * - D/M/YYYY, DD/MM/YYYY (e.g. 23/4/1996)
 */
export const parseDobComponents = (input: string): { day: number; month: number; year: number } | null => {
  if (!input) return null;
  const cleaned = input.trim();

  // Pattern: YYYY/MM/DD or YYYY-MM-DD
  const ymd = cleaned.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (ymd) {
    return {
      year: parseInt(ymd[1], 10),
      month: parseInt(ymd[2], 10),
      day: parseInt(ymd[3], 10)
    };
  }

  // Pattern: (\d{1,2})[/-](\d{1,2})[/-](\d{4})
  const dmy = cleaned.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) {
    const n1 = parseInt(dmy[1], 10);
    const n2 = parseInt(dmy[2], 10);
    const year = parseInt(dmy[3], 10);

    // If second number > 12, it must be M/D/YYYY (e.g. 4/23/1996)
    if (n2 > 12) {
      return { day: n2, month: n1, year };
    }
    // If first number > 12, it must be D/M/YYYY (e.g. 23/4/1996)
    if (n1 > 12) {
      return { day: n1, month: n2, year };
    }
    return { day: n1, month: n2, year };
  }

  return null;
};

export const areDobsEqual = (dobA?: string, dobB?: string): boolean => {
  if (!dobA || !dobB) return true; // If one is empty, don't lock out
  const a = parseDobComponents(dobA);
  const b = parseDobComponents(dobB);
  if (!a || !b) return true;

  if (a.year !== b.year) return false;
  if (a.day === b.day && a.month === b.month) return true;
  if (a.day === b.month && a.month === b.day) return true; // handle month/day swapped entry

  return false;
};

/**
 * Normalizes input date strings into DD-MM-YYYY format for matching.
 */
export const normalizeDob = (inputDob: string): string => {
  const p = parseDobComponents(inputDob);
  if (!p) return inputDob.trim();
  const padD = String(p.day).padStart(2, '0');
  const padM = String(p.month).padStart(2, '0');
  return `${padD}-${padM}-${p.year}`;
};

/**
 * Normalizes mobile number by stripping non-numeric characters.
 */
export const normalizeMobile = (mobile: string): string => {
  return mobile.replace(/\D/g, '').slice(-10);
};

/**
 * Validates login credentials against the live Google Sheet / CSV database.
 */
export const validateCustomerLogin = (
  nameInput: string,
  mobileInput: string,
  dobInput: string
): { isValid: boolean; customer?: CustomerRecord; message?: string } => {
  const normName = nameInput.trim().toUpperCase();
  const normMobile = normalizeMobile(mobileInput);

  if (!normName || !normMobile || normMobile.length < 10) {
    return { isValid: false, message: 'Please enter your Full Name and 10-digit Mobile Number.' };
  }

  // Search in dynamic Google Sheet / CSV database
  const activeDb = dynamicCustomers.length > 0 ? dynamicCustomers : DEMO_CUSTOMERS_DATABASE;
  const match = activeDb.find((cust) => {
    const custName = cust.name.trim().toUpperCase();
    const custMobile = normalizeMobile(cust.mobileNo);

    // Flexible name matching (exact or contains)
    const nameMatches = custName === normName || custName.includes(normName) || normName.includes(custName);
    const mobileMatches = custMobile === normMobile;
    
    // Flexible DOB matching that works with YYYY/MM/DD, M/D/YYYY, D/M/YYYY
    const dobMatches = areDobsEqual(cust.dob, dobInput);

    return nameMatches && mobileMatches && dobMatches;
  });

  if (match) {
    return {
      isValid: true,
      customer: match,
      message: `Welcome ${match.name}!`
    };
  }

  // As requested: Do NOT mention database, just say "Access Denied"
  return {
    isValid: false,
    message: 'Access Denied'
  };
};
