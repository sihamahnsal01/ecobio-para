// Approximate visitor country as an ISO 3166-1 alpha-2 code ("MA", "FR"…),
// with NO network call: signed-in profile -> browser time zone -> browser locale.
// (For exact geo-location the backend can resolve it from the request IP.)

const TZ_TO_COUNTRY = {
  // Africa
  'Africa/Casablanca': 'MA', 'Africa/El_Aaiun': 'MA', 'Africa/Algiers': 'DZ', 'Africa/Tunis': 'TN',
  'Africa/Tripoli': 'LY', 'Africa/Cairo': 'EG', 'Africa/Lagos': 'NG', 'Africa/Johannesburg': 'ZA',
  'Africa/Nairobi': 'KE', 'Africa/Dakar': 'SN', 'Africa/Abidjan': 'CI', 'Africa/Accra': 'GH',
  'Africa/Addis_Ababa': 'ET', 'Africa/Khartoum': 'SD', 'Africa/Nouakchott': 'MR', 'Africa/Bamako': 'ML',
  // Europe
  'Europe/Paris': 'FR', 'Europe/Madrid': 'ES', 'Europe/Rome': 'IT', 'Europe/Berlin': 'DE',
  'Europe/London': 'GB', 'Europe/Brussels': 'BE', 'Europe/Amsterdam': 'NL', 'Europe/Lisbon': 'PT',
  'Europe/Zurich': 'CH', 'Europe/Vienna': 'AT', 'Europe/Stockholm': 'SE', 'Europe/Oslo': 'NO',
  'Europe/Copenhagen': 'DK', 'Europe/Helsinki': 'FI', 'Europe/Dublin': 'IE', 'Europe/Athens': 'GR',
  'Europe/Warsaw': 'PL', 'Europe/Prague': 'CZ', 'Europe/Budapest': 'HU', 'Europe/Bucharest': 'RO',
  'Europe/Istanbul': 'TR', 'Europe/Moscow': 'RU', 'Europe/Kiev': 'UA', 'Europe/Kyiv': 'UA',
  'Europe/Luxembourg': 'LU',
  // Middle East & Asia
  'Asia/Dubai': 'AE', 'Asia/Riyadh': 'SA', 'Asia/Qatar': 'QA', 'Asia/Kuwait': 'KW', 'Asia/Beirut': 'LB',
  'Asia/Amman': 'JO', 'Asia/Baghdad': 'IQ', 'Asia/Tehran': 'IR', 'Asia/Jerusalem': 'IL',
  'Asia/Gaza': 'PS', 'Asia/Hebron': 'PS', 'Asia/Karachi': 'PK', 'Asia/Kolkata': 'IN',
  'Asia/Calcutta': 'IN', 'Asia/Dhaka': 'BD', 'Asia/Jakarta': 'ID', 'Asia/Kuala_Lumpur': 'MY',
  'Asia/Singapore': 'SG', 'Asia/Bangkok': 'TH', 'Asia/Manila': 'PH', 'Asia/Shanghai': 'CN',
  'Asia/Hong_Kong': 'HK', 'Asia/Tokyo': 'JP', 'Asia/Seoul': 'KR',
  // Americas
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US', 'America/Los_Angeles': 'US',
  'America/Toronto': 'CA', 'America/Vancouver': 'CA', 'America/Montreal': 'CA',
  'America/Mexico_City': 'MX', 'America/Sao_Paulo': 'BR', 'America/Argentina/Buenos_Aires': 'AR',
  'America/Bogota': 'CO', 'America/Santiago': 'CL', 'America/Lima': 'PE',
  // Oceania
  'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Pacific/Auckland': 'NZ',
}

const isIso2 = (value) => typeof value === 'string' && /^[A-Za-z]{2}$/.test(value.trim())

export function detectCountry(user) {
  // 1) a 2-letter country saved on the account (full names like "Italy" are ignored)
  if (isIso2(user?.country)) return user.country.trim().toUpperCase()

  // 2) time zone ("Africa/Casablanca" -> MA)
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (TZ_TO_COUNTRY[tz]) return TZ_TO_COUNTRY[tz]
  } catch { /* ignore */ }

  // 3) browser language region ("fr-FR" -> FR); a bare "en" gives nothing
  try {
    const languages = navigator.languages?.length ? navigator.languages : [navigator.language]
    for (const lang of languages) {
      const region = new Intl.Locale(lang).region
      if (region) return region
    }
  } catch { /* ignore */ }

  return ''
}

export function countryName(code, locale = 'en') {
  if (!code) return ''
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(code) || code
  } catch {
    return code
  }
}
