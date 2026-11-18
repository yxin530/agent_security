export function isValidICDate(yearStr: string, monthStr: string, dayStr: string): boolean {
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  // Optional finer day validation
  if ([4, 6, 9, 11].includes(month) && day > 30) return false;
  if (month === 2 && day > 29) return false;

  return true;
}

export function detectMalaysianIC(text: string): boolean {
  // 1. Dashed format: YYMMDD-PB-###G
  const dashedRegex = /\b(\d{2})(\d{2})(\d{2})-(\d{2})-(\d{4})\b/g;
  let match: RegExpExecArray | null;
  while ((match = dashedRegex.exec(text)) !== null) {
    if (isValidICDate(match[1], match[2], match[3])) {
      return true;
    }
  }

  // 2. Undashed 12-digit format: requires nearby keyword within ~50 characters
  const undashedRegex = /\b(\d{2})(\d{2})(\d{2})(\d{6})\b/g;
  const keywordRegex = /\b(ic|nric|mykad|kad\s+pengenalan)\b/i;

  while ((match = undashedRegex.exec(text)) !== null) {
    if (isValidICDate(match[1], match[2], match[3])) {
      // Check window of 50 chars before and after match
      const start = Math.max(0, match.index - 50);
      const end = Math.min(text.length, match.index + match[0].length + 50);
      const windowText = text.slice(start, end);
      if (keywordRegex.test(windowText)) {
        return true;
      }
    }
  }

  return false;
}

export function detectMalaysianPhone(text: string): boolean {
  // Regex covers:
  // Optional +60 or 60 or 0
  // Mobile (1x) with 7-8 digits: e.g. 012-345 6789, +60 12-345 6789, 011-1234 5678
  // Landline (3-9) with 7-8 digits: e.g. 03-1234 5678, +60 3-1234 5678, 04-123 4567
  const phoneRegex = /(?:\+?60\s*|(?:\b0))(?:1[0-9][\s-]?\d{3,4}[\s-]?\d{4}|[3-9][\s-]?\d{3,4}[\s-]?\d{4})\b/g;
  return phoneRegex.test(text);
}
