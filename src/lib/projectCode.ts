import { supabase } from './supabase';

export const regionCodes: Record<string, string> = {
  // Europe
  'united kingdom': 'UK',
  'uk': 'UK',
  'england': 'UK',
  'scotland': 'UK',
  'wales': 'UK',
  'britain': 'UK',
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
  
  // Americas
  'united states': 'US',
  'usa': 'US',
  'america': 'US',
  'canada': 'CA',
  'mexico': 'MX',
  'méxico': 'MX',
  'brazil': 'BR',
  'brasil': 'BR',
  'argentina': 'AR',
  
  // Asia-Pacific
  'australia': 'AU',
  'new zealand': 'NZ',
  'japan': 'JP',
  'china': 'CN',
  'india': 'IN',
  'singapore': 'SG',
  
  // Middle East & Africa
  'dubai': 'AE',
  'uae': 'AE',
  'emirates': 'AE',
  'south africa': 'ZA',
};

export function getRegionCode(location: string): string {
  const locationLower = location.toLowerCase();
  
  // Check each region pattern
  for (const [pattern, code] of Object.entries(regionCodes)) {
    if (locationLower.includes(pattern)) {
      return code;
    }
  }
  
  // Default to INTL for international/unknown locations
  return 'INTL';
}

export async function generateProjectCode(location: string): Promise<string> {
  const region = getRegionCode(location);
  
  // Call the database function to generate the code
  const { data, error } = await supabase
    .rpc('generate_project_code', { region });
  
  if (error) {
    console.error('Error generating project code:', error);
    // Fallback to a timestamp-based code if database function fails
    return `${region}-${Date.now().toString().slice(-4)}`;
  }
  
  return data;
}

export async function validateProjectCode(code: string): Promise<boolean> {
  // Check if code matches the expected format
  const codePattern = /^[A-Z]{2,4}-\d{4}$/;
  if (!codePattern.test(code)) {
    return false;
  }
  
  // Check uniqueness in database
  const { data, error } = await supabase
    .from('projects')
    .select('id')
    .eq('project_code', code)
    .single();
  
  // Code is valid if it doesn't exist in database
  return !data && !error;
}