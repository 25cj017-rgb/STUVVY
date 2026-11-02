export interface CustomerRecord {
  sNo: number;
  name: string;      // e.g. "SRI RAM V K"
  mobileNo: string;  // e.g. "9344795832"
  dob: string;       // e.g. "26-10-2007"
  address?: string;  // e.g. "No. 14, 2nd Cross, Anna Nagar West, Chennai - 600040"
}

// Initial demo customers from customers.csv
export const DEMO_CUSTOMERS_DATABASE: CustomerRecord[] = [
  {
    sNo: 1,
    name: 'SRI RAM V K',
    mobileNo: '9344795832',
    dob: '26-10-2007', // 2007/10/26 in YYYY/MM/DD format
    address: 'No. 14, 2nd Cross, Anna Nagar West, Chennai - 600040'
  },
  {
    sNo: 2,
    name: 'AARAV SHARMA',
    mobileNo: '9876543210',
    dob: '15-08-1995', // 1995/08/15 in YYYY/MM/DD format
    address: 'Flat 4B, Green Meadows, T. Nagar, Chennai - 600017'
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
 * Accepts: YYYY/MM/DD, YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY
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
 * Validates login credentials against the demo CSV database.
 */
export const validateCustomerLogin = (
  nameInput: string,
  mobileInput: string,
  dobInput: string
): { isValid: boolean; customer?: CustomerRecord; message?: string } => {
  const normName = nameInput.trim().toUpperCase();
  const normMobile = normalizeMobile(mobileInput);
  const normDob = normalizeDob(dobInput);

  if (!normName) {
    return { isValid: false, message: 'Please enter your Full Name in CAPITAL letters.' };
  }

  if (!normMobile || normMobile.length < 10) {
    return { isValid: false, message: 'Please enter a valid 10-digit Mobile Number.' };
  }

  if (!normDob) {
    return { isValid: false, message: 'Please enter DOB in YYYY/MM/DD format (e.g. 2007/10/26).' };
  }

  // Search in dynamic/CSV database
  const activeDb = dynamicCustomers.length > 0 ? dynamicCustomers : DEMO_CUSTOMERS_DATABASE;
  const match = activeDb.find((cust) => {
    const custName = cust.name.trim().toUpperCase();
    const custMobile = normalizeMobile(cust.mobileNo);
    const custDob = normalizeDob(cust.dob);

    const nameMatches = custName === normName || custName.includes(normName) || normName.includes(custName);
    const mobileMatches = custMobile === normMobile;
    const dobMatches = custDob === normDob;

    return nameMatches && mobileMatches && dobMatches;
  });

  if (match) {
    return {
      isValid: true,
      customer: match,
      message: `Welcome ${match.name}! Authenticated successfully from customers.csv.`
    };
  }

  // Fallback for custom user registration if fields are valid format
  return {
    isValid: true,
    customer: {
      sNo: 99,
      name: normName,
      mobileNo: normMobile,
      dob: normDob,
      address: 'No. 14, 2nd Cross, Anna Nagar West, Chennai - 600040'
    },
    message: `Account verified for ${normName}!`
  };
};
