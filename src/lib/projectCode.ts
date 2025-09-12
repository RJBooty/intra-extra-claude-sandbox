import { supabase } from './supabase';

// Location parsing result interface
export interface ParsedLocation {
  city: string;
  countryCode: string;
  normalized: string;
}

// ISO 3166-1 alpha-2 country codes mapping
export const countryCodes: Record<string, string> = {
  // Europe - ISO 3166-1 alpha-2 codes
  'united kingdom': 'GB',
  'uk': 'GB',
  'england': 'GB',
  'scotland': 'GB',
  'wales': 'GB',
  'northern ireland': 'GB',
  'britain': 'GB',
  'spain': 'ES',
  'españa': 'ES',
  'france': 'FR',
  'germany': 'DE',
  'deutschland': 'DE',
  'italy': 'IT',
  'italia': 'IT',
  'netherlands': 'NL',
  'holland': 'NL',
  'belgium': 'BE',
  'portugal': 'PT',
  'ireland': 'IE',
  'sweden': 'SE',
  'norway': 'NO',
  'denmark': 'DK',
  'finland': 'FI',
  'switzerland': 'CH',
  'austria': 'AT',
  'poland': 'PL',
  'czech republic': 'CZ',
  'czech': 'CZ',
  'hungary': 'HU',
  
  // Americas
  'united states': 'US',
  'usa': 'US',
  'america': 'US',
  'u.s.': 'US',
  'canada': 'CA',
  'mexico': 'MX',
  'méxico': 'MX',
  'brazil': 'BR',
  'brasil': 'BR',
  'argentina': 'AR',
  'colombia': 'CO',
  'chile': 'CL',
  'peru': 'PE',
  'perú': 'PE',
  
  // Asia-Pacific
  'australia': 'AU',
  'new zealand': 'NZ',
  'japan': 'JP',
  'china': 'CN',
  'india': 'IN',
  'singapore': 'SG',
  'south korea': 'KR',
  'korea': 'KR',
  'thailand': 'TH',
  'malaysia': 'MY',
  'indonesia': 'ID',
  'philippines': 'PH',
  
  // Middle East & Africa
  'dubai': 'AE',
  'uae': 'AE',
  'emirates': 'AE',
  'saudi arabia': 'SA',
  'qatar': 'QA',
  'kuwait': 'KW',
  'israel': 'IL',
  'turkey': 'TR',
  'south africa': 'ZA',
  'egypt': 'EG',
  'morocco': 'MA',
};

// Normalize location string for consistent comparison
export function normalizeLocation(location: string): string {
  if (!location) return '';
  return location.trim().replace(/\s+/g, ' ').toLowerCase();
}

// Parse location into city and country code with normalization
export function parseLocation(location: string): ParsedLocation {
  const normalized = normalizeLocation(location);
  
  if (!normalized) {
    return { city: '', countryCode: 'XX', normalized };
  }
  
  const parts = normalized.split(',').map(part => part.trim());
  let countryPart: string;
  let cityPart: string;
  
  if (parts.length >= 2) {
    cityPart = parts[0];
    countryPart = parts[1];
  } else {
    // No comma, treat entire string as country
    cityPart = '';
    countryPart = normalized;
  }
  
  // Check if country part is already a 2-letter ISO code
  let countryCode: string;
  if (countryPart.match(/^[a-z]{2}$/)) {
    const upperCode = countryPart.toUpperCase();
    // Handle UK → GB conversion for ISO 3166-1 compliance
    countryCode = upperCode === 'UK' ? 'GB' : upperCode;
  } else {
    // Extract country code from full name
    countryCode = 'XX';
    for (const [pattern, code] of Object.entries(countryCodes)) {
      if (countryPart.includes(pattern)) {
        countryCode = code;
        break;
      }
    }
  }
  
  return {
    city: cityPart,
    countryCode,
    normalized
  };
}

export function getCountryCode(location: string): string {
  return parseLocation(location).countryCode;
}

// Backward compatibility
export function getRegionCode(location: string): string {
  return getCountryCode(location);
}

// Check if two locations have the same country
export function isSameCountry(location1: string, location2: string): boolean {
  const parsed1 = parseLocation(location1);
  const parsed2 = parseLocation(location2);
  return parsed1.countryCode === parsed2.countryCode;
}

// Generate a preview of what the project code would be (without reserving it)
export async function previewProjectCode(location: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .rpc('preview_project_code', { p_location: location });
    
    if (error) {
      console.error('Error previewing project code:', error);
      
      // Fallback: generate locally with country code
      const countryCode = getCountryCode(location);
      return `${countryCode}-0001`;
    }
    
    return data;
  } catch (error) {
    console.error('Error previewing project code:', error);
    const countryCode = getCountryCode(location);
    return `${countryCode}-0001`;
  }
}

// Reserve and return an actual project code (called only on project creation)
export async function reserveProjectCode(location: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .rpc('reserve_project_code', { p_location: location });
    
    if (error) {
      console.error('Error reserving project code:', error);
      throw new Error(`Failed to reserve project code: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error reserving project code:', error);
    
    // Fallback: generate locally with country code and timestamp
    const countryCode = getCountryCode(location);
    const timestamp = Date.now().toString().slice(-4);
    return `${countryCode}-${timestamp}`;
  }
}

// Backward compatibility - now reserves actual code
export async function generateProjectCode(location: string): Promise<string> {
  return reserveProjectCode(location);
}

export async function validateProjectCode(code: string): Promise<boolean> {
  // Check if code matches the expected format: {CountryCode}-{FourDigitNumber}
  const codePattern = /^[A-Z]{2}-\d{4}$/;
  if (!codePattern.test(code)) {
    return false;
  }
  
  // Check uniqueness in database
  const { data, error } = await supabase
    .from('projects')
    .select('id')
    .eq('project_code', code)
    .single();
  
  // Code is valid if it doesn't exist in database (error means no match found)
  return !data && error;
}