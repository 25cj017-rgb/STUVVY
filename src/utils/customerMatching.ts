/**
 * Normalizes customer name for comparison by removing punctuation and collapsing spaces.
 */
export function cleanCustomerName(name?: string): string {
  return (name || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generates unique customer key from name and 10-digit mobile number.
 */
export function makeCustomerKey(name?: string, mobile?: string): string {
  const cleanName = (name || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const cleanMobile = (mobile || '').replace(/\D/g, '').slice(-10);
  return `${cleanName}_${cleanMobile}`;
}

/**
 * Robust phonetic and token-based customer name comparison.
 * Matches:
 * - "Chhaya" vs "Chhaya Mary"
 * - "Chhaya" vs "Chaaya"
 * - "Gayathri R" vs "Gayathri"
 * While keeping distinct names like "Sanjana" and "Chandran" strictly separate.
 */
export function areCustomerNamesMatching(nameA?: string, nameB?: string): boolean {
  if (!nameA || !nameB) return false;
  const cleanA = cleanCustomerName(nameA);
  const cleanB = cleanCustomerName(nameB);

  if (!cleanA || !cleanB) return false;
  if (cleanA === cleanB) return true;

  const compactA = cleanA.replace(/\s+/g, '');
  const compactB = cleanB.replace(/\s+/g, '');
  if (compactA === compactB) return true;

  if (compactA.startsWith(compactB) || compactB.startsWith(compactA)) return true;

  const tokensA = cleanA.split(' ').filter(Boolean);
  const tokensB = cleanB.split(' ').filter(Boolean);

  const sharedTokens = tokensA.filter((t) => tokensB.includes(t) && t.length > 1);
  if (sharedTokens.length > 0) return true;

  const phon = (s: string) =>
    s
      .replace(/CH+/g, 'C')
      .replace(/KH+/g, 'K')
      .replace(/SH+/g, 'S')
      .replace(/TH+/g, 'T')
      .replace(/DH+/g, 'D')
      .replace(/BH+/g, 'B')
      .replace(/PH+/g, 'F')
      .replace(/EE+/g, 'I')
      .replace(/OO+/g, 'U')
      .replace(/AA+/g, 'A')
      .replace(/H/g, '')
      .replace(/Y/g, 'I')
      .replace(/V/g, 'W');

  const phonA = phon(compactA);
  const phonB = phon(compactB);
  if (phonA === phonB || phonA.startsWith(phonB) || phonB.startsWith(phonA)) {
    return true;
  }

  return false;
}
