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
}

// Initial demo customers fallback
export const DEMO_CUSTOMERS_DATABASE: CustomerRecord[] = [
  {
    sNo: 1,
    name: 'SRI RAM V K',
    mobileNo: '9344795832',
    dob: '26-10-2007', // 2007/10/26 in YYYY/MM/DD format
    address: 'No. 14, 2nd Cross, Anna Nagar West, Chennai - 600040',
    addresses: [
      'No. 14, 2nd Cross, Anna Nagar West, Chennai - 600040',
      'Plot 88, 5th Main Road, Anna Nagar, Chennai - 600040'
    ],
    plan: 'Weekly',
    startDate: '03-11-2026',
    purchaseDate: '28-10-2026'
  },
  {
    sNo: 2,
    name: 'AARAV SHARMA',
    mobileNo: '9876543210',
    dob: '15-08-1995', // 1995/08/15 in YYYY/MM/DD format
    address: 'Flat 4B, Green Meadows, T. Nagar, Chennai - 600017',
    addresses: [
      'Flat 4B, Green Meadows, T. Nagar, Chennai - 600017'
    ],
    plan: 'Daily',
    startDate: '05-11-2026',
    purchaseDate: '01-11-2026'
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
 * Normalizes input date strings into DD-MM-YYYY format for matching.
 * Accepts: YYYY/MM/DD, YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, M/D/YYYY
 */
export const normalizeDob = (inputDob: string): string => {
  if (!inputDob) return '';
  const cleaned = inputDob.trim();

  // Pattern: YYYY/MM/DD or YYYY-MM-DD
  const ymdMatch = cleaned.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (ymdMatch) {
    const [, yyyy, mm, dd] = ymdMatch;
    const padDd = dd.padStart(2, '0');
    const padMm = mm.padStart(2, '0');
    return `${padDd}-${padMm}-${yyyy}`;
  }

  // Pattern: DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = cleaned.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    const [, dd, mm, yyyy] = dmyMatch;
    const padDd = dd.padStart(2, '0');
    const padMm = mm.padStart(2, '0');
    return `${padDd}-${padMm}-${yyyy}`;
  }

  return cleaned;
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
  const normDob = normalizeDob(dobInput);

  if (!normName || !normMobile || normMobile.length < 10) {
    return { isValid: false, message: 'Please enter your Full Name and 10-digit Mobile Number.' };
  }

  // Search in dynamic/CSV database
  const activeDb = dynamicCustomers.length > 0 ? dynamicCustomers : DEMO_CUSTOMERS_DATABASE;
  const match = activeDb.find((cust) => {
    const custName = cust.name.trim().toUpperCase();
    const custMobile = normalizeMobile(cust.mobileNo);
    const custDob = normalizeDob(cust.dob);

    const nameMatches = custName === normName || custName.includes(normName) || normName.includes(custName);
    const mobileMatches = custMobile === normMobile;
    
    // If the registered record in the sheet has a DOB, verify it matches.
    // If no DOB was recorded in the Google Sheet (or left blank by subscriber), allow match.
    const dobMatches = !custDob || (normDob && custDob === normDob);

    return nameMatches && mobileMatches && dobMatches;
  });

  if (match) {
    return {
      isValid: true,
      customer: match,
      message: `Welcome ${match.name}!`
    };
  }

  return {
    isValid: false,
    message: 'Access Denied: Credentials do not match any active subscriber in the database.'
  };
};
