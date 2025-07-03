export interface Timezone {
  value: string
  label: string
  city: string
  country: string
}

export const timezones: Timezone[] = [
  // Australia
  {
    value: 'Australia/Sydney',
    label: 'Sydney (AEDT/AEST)',
    city: 'Sydney',
    country: 'Australia',
  },
  {
    value: 'Australia/Melbourne',
    label: 'Melbourne (AEDT/AEST)',
    city: 'Melbourne',
    country: 'Australia',
  },
  {
    value: 'Australia/Brisbane',
    label: 'Brisbane (AEST)',
    city: 'Brisbane',
    country: 'Australia',
  },
  {
    value: 'Australia/Perth',
    label: 'Perth (AWST)',
    city: 'Perth',
    country: 'Australia',
  },
  {
    value: 'Australia/Adelaide',
    label: 'Adelaide (ACDT/ACST)',
    city: 'Adelaide',
    country: 'Australia',
  },
  {
    value: 'Australia/Darwin',
    label: 'Darwin (ACST)',
    city: 'Darwin',
    country: 'Australia',
  },
  {
    value: 'Australia/Hobart',
    label: 'Hobart (AEDT/AEST)',
    city: 'Hobart',
    country: 'Australia',
  },
  {
    value: 'Australia/Canberra',
    label: 'Canberra (AEDT/AEST)',
    city: 'Canberra',
    country: 'Australia',
  },
  {
    value: 'Australia/ACT',
    label: 'ACT (AEDT/AEST)',
    city: 'Australian Capital Territory',
    country: 'Australia',
  },
  {
    value: 'Australia/NSW',
    label: 'NSW (AEDT/AEST)',
    city: 'New South Wales',
    country: 'Australia',
  },
  {
    value: 'Australia/Northern',
    label: 'NT (ACST)',
    city: 'Northern Territory',
    country: 'Australia',
  },
  {
    value: 'Australia/Queensland',
    label: 'QLD (AEST)',
    city: 'Queensland',
    country: 'Australia',
  },
  {
    value: 'Australia/South',
    label: 'SA (ACDT/ACST)',
    city: 'South Australia',
    country: 'Australia',
  },
  {
    value: 'Australia/Tasmania',
    label: 'TAS (AEDT/AEST)',
    city: 'Tasmania',
    country: 'Australia',
  },
  {
    value: 'Australia/Victoria',
    label: 'VIC (AEDT/AEST)',
    city: 'Victoria',
    country: 'Australia',
  },
  {
    value: 'Australia/West',
    label: 'WA (AWST)',
    city: 'Western Australia',
    country: 'Australia',
  },
  {
    value: 'Australia/Lord_Howe',
    label: 'Lord Howe (LHST/LHDT)',
    city: 'Lord Howe',
    country: 'Australia',
  },
  {
    value: 'Australia/Norfolk',
    label: 'Norfolk (NFT)',
    city: 'Norfolk',
    country: 'Australia',
  },
  {
    value: 'Australia/Christmas',
    label: 'Christmas (CXT)',
    city: 'Christmas',
    country: 'Australia',
  },
  {
    value: 'Australia/Cocos',
    label: 'Cocos (CCT)',
    city: 'Cocos',
    country: 'Australia',
  },
  {
    value: 'Australia/Macquarie',
    label: 'Macquarie (MIST)',
    city: 'Macquarie',
    country: 'Australia',
  },

  // Ukraine
  {
    value: 'Europe/Kiev',
    label: 'Kyiv (EET/EEST)',
    city: 'Kyiv',
    country: 'Ukraine',
  },

  // Major US Cities
  {
    value: 'America/New_York',
    label: 'New York (EST/EDT)',
    city: 'New York',
    country: 'United States',
  },
  {
    value: 'America/Chicago',
    label: 'Chicago (CST/CDT)',
    city: 'Chicago',
    country: 'United States',
  },
  {
    value: 'America/Denver',
    label: 'Denver (MST/MDT)',
    city: 'Denver',
    country: 'United States',
  },
  {
    value: 'America/Los_Angeles',
    label: 'Los Angeles (PST/PDT)',
    city: 'Los Angeles',
    country: 'United States',
  },
  {
    value: 'America/Anchorage',
    label: 'Anchorage (AKST/AKDT)',
    city: 'Anchorage',
    country: 'United States',
  },
  {
    value: 'Pacific/Honolulu',
    label: 'Honolulu (HST)',
    city: 'Honolulu',
    country: 'United States',
  },

  // Major European Cities
  {
    value: 'Europe/London',
    label: 'London (GMT/BST)',
    city: 'London',
    country: 'United Kingdom',
  },
  {
    value: 'Europe/Paris',
    label: 'Paris (CET/CEST)',
    city: 'Paris',
    country: 'France',
  },
  {
    value: 'Europe/Berlin',
    label: 'Berlin (CET/CEST)',
    city: 'Berlin',
    country: 'Germany',
  },
  {
    value: 'Europe/Rome',
    label: 'Rome (CET/CEST)',
    city: 'Rome',
    country: 'Italy',
  },
  {
    value: 'Europe/Madrid',
    label: 'Madrid (CET/CEST)',
    city: 'Madrid',
    country: 'Spain',
  },
  {
    value: 'Europe/Amsterdam',
    label: 'Amsterdam (CET/CEST)',
    city: 'Amsterdam',
    country: 'Netherlands',
  },
  {
    value: 'Europe/Brussels',
    label: 'Brussels (CET/CEST)',
    city: 'Brussels',
    country: 'Belgium',
  },
  {
    value: 'Europe/Vienna',
    label: 'Vienna (CET/CEST)',
    city: 'Vienna',
    country: 'Austria',
  },
  {
    value: 'Europe/Zurich',
    label: 'Zurich (CET/CEST)',
    city: 'Zurich',
    country: 'Switzerland',
  },
  {
    value: 'Europe/Stockholm',
    label: 'Stockholm (CET/CEST)',
    city: 'Stockholm',
    country: 'Sweden',
  },
  {
    value: 'Europe/Oslo',
    label: 'Oslo (CET/CEST)',
    city: 'Oslo',
    country: 'Norway',
  },
  {
    value: 'Europe/Copenhagen',
    label: 'Copenhagen (CET/CEST)',
    city: 'Copenhagen',
    country: 'Denmark',
  },
  {
    value: 'Europe/Helsinki',
    label: 'Helsinki (EET/EEST)',
    city: 'Helsinki',
    country: 'Finland',
  },
  {
    value: 'Europe/Warsaw',
    label: 'Warsaw (CET/CEST)',
    city: 'Warsaw',
    country: 'Poland',
  },
  {
    value: 'Europe/Prague',
    label: 'Prague (CET/CEST)',
    city: 'Prague',
    country: 'Czech Republic',
  },
  {
    value: 'Europe/Budapest',
    label: 'Budapest (CET/CEST)',
    city: 'Budapest',
    country: 'Hungary',
  },
  {
    value: 'Europe/Bucharest',
    label: 'Bucharest (EET/EEST)',
    city: 'Bucharest',
    country: 'Romania',
  },
  {
    value: 'Europe/Sofia',
    label: 'Sofia (EET/EEST)',
    city: 'Sofia',
    country: 'Bulgaria',
  },
  {
    value: 'Europe/Athens',
    label: 'Athens (EET/EEST)',
    city: 'Athens',
    country: 'Greece',
  },
  {
    value: 'Europe/Istanbul',
    label: 'Istanbul (TRT)',
    city: 'Istanbul',
    country: 'Turkey',
  },

  // Major Asian Cities
  {
    value: 'Asia/Tokyo',
    label: 'Tokyo (JST)',
    city: 'Tokyo',
    country: 'Japan',
  },
  {
    value: 'Asia/Seoul',
    label: 'Seoul (KST)',
    city: 'Seoul',
    country: 'South Korea',
  },
  {
    value: 'Asia/Shanghai',
    label: 'Shanghai (CST)',
    city: 'Shanghai',
    country: 'China',
  },
  {
    value: 'Asia/Hong_Kong',
    label: 'Hong Kong (HKT)',
    city: 'Hong Kong',
    country: 'China',
  },
  {
    value: 'Asia/Singapore',
    label: 'Singapore (SGT)',
    city: 'Singapore',
    country: 'Singapore',
  },
  {
    value: 'Asia/Bangkok',
    label: 'Bangkok (ICT)',
    city: 'Bangkok',
    country: 'Thailand',
  },
  {
    value: 'Asia/Manila',
    label: 'Manila (PHT)',
    city: 'Manila',
    country: 'Philippines',
  },
  {
    value: 'Asia/Jakarta',
    label: 'Jakarta (WIB)',
    city: 'Jakarta',
    country: 'Indonesia',
  },
  {
    value: 'Asia/Kuala_Lumpur',
    label: 'Kuala Lumpur (MYT)',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
  },
  {
    value: 'Asia/Ho_Chi_Minh',
    label: 'Ho Chi Minh City (ICT)',
    city: 'Ho Chi Minh City',
    country: 'Vietnam',
  },
  {
    value: 'Asia/Dhaka',
    label: 'Dhaka (BDT)',
    city: 'Dhaka',
    country: 'Bangladesh',
  },
  {
    value: 'Asia/Kolkata',
    label: 'Kolkata (IST)',
    city: 'Kolkata',
    country: 'India',
  },
  {
    value: 'Asia/Mumbai',
    label: 'Mumbai (IST)',
    city: 'Mumbai',
    country: 'India',
  },
  {
    value: 'Asia/Delhi',
    label: 'Delhi (IST)',
    city: 'Delhi',
    country: 'India',
  },
  {
    value: 'Asia/Karachi',
    label: 'Karachi (PKT)',
    city: 'Karachi',
    country: 'Pakistan',
  },
  {
    value: 'Asia/Dubai',
    label: 'Dubai (GST)',
    city: 'Dubai',
    country: 'United Arab Emirates',
  },
  {
    value: 'Asia/Riyadh',
    label: 'Riyadh (AST)',
    city: 'Riyadh',
    country: 'Saudi Arabia',
  },
  {
    value: 'Asia/Jerusalem',
    label: 'Jerusalem (IST/IDT)',
    city: 'Jerusalem',
    country: 'Israel',
  },
  {
    value: 'Asia/Tehran',
    label: 'Tehran (IRST)',
    city: 'Tehran',
    country: 'Iran',
  },

  // Major Canadian Cities
  {
    value: 'America/Toronto',
    label: 'Toronto (EST/EDT)',
    city: 'Toronto',
    country: 'Canada',
  },
  {
    value: 'America/Vancouver',
    label: 'Vancouver (PST/PDT)',
    city: 'Vancouver',
    country: 'Canada',
  },
  {
    value: 'America/Montreal',
    label: 'Montreal (EST/EDT)',
    city: 'Montreal',
    country: 'Canada',
  },
  {
    value: 'America/Calgary',
    label: 'Calgary (MST/MDT)',
    city: 'Calgary',
    country: 'Canada',
  },
  {
    value: 'America/Edmonton',
    label: 'Edmonton (MST/MDT)',
    city: 'Edmonton',
    country: 'Canada',
  },
  {
    value: 'America/Winnipeg',
    label: 'Winnipeg (CST/CDT)',
    city: 'Winnipeg',
    country: 'Canada',
  },
  {
    value: 'America/Halifax',
    label: 'Halifax (AST/ADT)',
    city: 'Halifax',
    country: 'Canada',
  },

  // Major South American Cities
  {
    value: 'America/Sao_Paulo',
    label: 'São Paulo (BRT/BRST)',
    city: 'São Paulo',
    country: 'Brazil',
  },
  {
    value: 'America/Argentina/Buenos_Aires',
    label: 'Buenos Aires (ART)',
    city: 'Buenos Aires',
    country: 'Argentina',
  },
  {
    value: 'America/Santiago',
    label: 'Santiago (CLT/CLST)',
    city: 'Santiago',
    country: 'Chile',
  },
  { value: 'America/Lima', label: 'Lima (PET)', city: 'Lima', country: 'Peru' },
  {
    value: 'America/Bogota',
    label: 'Bogota (COT)',
    city: 'Bogota',
    country: 'Colombia',
  },
  {
    value: 'America/Caracas',
    label: 'Caracas (VET)',
    city: 'Caracas',
    country: 'Venezuela',
  },
  {
    value: 'America/Mexico_City',
    label: 'Mexico City (CST/CDT)',
    city: 'Mexico City',
    country: 'Mexico',
  },

  // Major African Cities
  {
    value: 'Africa/Cairo',
    label: 'Cairo (EET)',
    city: 'Cairo',
    country: 'Egypt',
  },
  {
    value: 'Africa/Johannesburg',
    label: 'Johannesburg (SAST)',
    city: 'Johannesburg',
    country: 'South Africa',
  },
  {
    value: 'Africa/Lagos',
    label: 'Lagos (WAT)',
    city: 'Lagos',
    country: 'Nigeria',
  },
  {
    value: 'Africa/Nairobi',
    label: 'Nairobi (EAT)',
    city: 'Nairobi',
    country: 'Kenya',
  },
  {
    value: 'Africa/Casablanca',
    label: 'Casablanca (WET)',
    city: 'Casablanca',
    country: 'Morocco',
  },
  {
    value: 'Africa/Algiers',
    label: 'Algiers (CET)',
    city: 'Algiers',
    country: 'Algeria',
  },
  {
    value: 'Africa/Tunis',
    label: 'Tunis (CET)',
    city: 'Tunis',
    country: 'Tunisia',
  },
  {
    value: 'Africa/Addis_Ababa',
    label: 'Addis Ababa (EAT)',
    city: 'Addis Ababa',
    country: 'Ethiopia',
  },
  {
    value: 'Africa/Dar_es_Salaam',
    label: 'Dar es Salaam (EAT)',
    city: 'Dar es Salaam',
    country: 'Tanzania',
  },
  {
    value: 'Africa/Kampala',
    label: 'Kampala (EAT)',
    city: 'Kampala',
    country: 'Uganda',
  },
  {
    value: 'Africa/Khartoum',
    label: 'Khartoum (CAT)',
    city: 'Khartoum',
    country: 'Sudan',
  },
  {
    value: 'Africa/Accra',
    label: 'Accra (GMT)',
    city: 'Accra',
    country: 'Ghana',
  },
  {
    value: 'Africa/Dakar',
    label: 'Dakar (GMT)',
    city: 'Dakar',
    country: 'Senegal',
  },
  {
    value: 'Africa/Abidjan',
    label: 'Abidjan (GMT)',
    city: 'Abidjan',
    country: 'Ivory Coast',
  },
  {
    value: 'Africa/Luanda',
    label: 'Luanda (WAT)',
    city: 'Luanda',
    country: 'Angola',
  },
  {
    value: 'Africa/Kinshasa',
    label: 'Kinshasa (WAT)',
    city: 'Kinshasa',
    country: 'Democratic Republic of the Congo',
  },
  {
    value: 'Africa/Harare',
    label: 'Harare (CAT)',
    city: 'Harare',
    country: 'Zimbabwe',
  },
  {
    value: 'Africa/Lusaka',
    label: 'Lusaka (CAT)',
    city: 'Lusaka',
    country: 'Zambia',
  },
  {
    value: 'Africa/Gaborone',
    label: 'Gaborone (CAT)',
    city: 'Gaborone',
    country: 'Botswana',
  },
  {
    value: 'Africa/Windhoek',
    label: 'Windhoek (WAT)',
    city: 'Windhoek',
    country: 'Namibia',
  },
  {
    value: 'Africa/Maputo',
    label: 'Maputo (CAT)',
    city: 'Maputo',
    country: 'Mozambique',
  },
  {
    value: 'Africa/Maseru',
    label: 'Maseru (SAST)',
    city: 'Maseru',
    country: 'Lesotho',
  },
  {
    value: 'Africa/Mbabane',
    label: 'Mbabane (SAST)',
    city: 'Mbabane',
    country: 'Eswatini',
  },
  {
    value: 'Africa/Mauritius',
    label: 'Mauritius (MUT)',
    city: 'Mauritius',
    country: 'Mauritius',
  },
  {
    value: 'Africa/Porto-Novo',
    label: 'Porto-Novo (WAT)',
    city: 'Porto-Novo',
    country: 'Benin',
  },
  {
    value: 'Africa/Ouagadougou',
    label: 'Ouagadougou (GMT)',
    city: 'Ouagadougou',
    country: 'Burkina Faso',
  },
  {
    value: 'Africa/Bamako',
    label: 'Bamako (GMT)',
    city: 'Bamako',
    country: 'Mali',
  },
  {
    value: 'Africa/Conakry',
    label: 'Conakry (GMT)',
    city: 'Conakry',
    country: 'Guinea',
  },
  {
    value: 'Africa/Freetown',
    label: 'Freetown (GMT)',
    city: 'Freetown',
    country: 'Sierra Leone',
  },
  {
    value: 'Africa/Monrovia',
    label: 'Monrovia (GMT)',
    city: 'Monrovia',
    country: 'Liberia',
  },
  {
    value: 'Africa/Banjul',
    label: 'Banjul (GMT)',
    city: 'Banjul',
    country: 'Gambia',
  },
  {
    value: 'Africa/Bissau',
    label: 'Bissau (GMT)',
    city: 'Bissau',
    country: 'Guinea-Bissau',
  },
  {
    value: 'Africa/Praia',
    label: 'Praia (CVT)',
    city: 'Praia',
    country: 'Cape Verde',
  },
  {
    value: 'Africa/Nouakchott',
    label: 'Nouakchott (GMT)',
    city: 'Nouakchott',
    country: 'Mauritania',
  },
  {
    value: 'Africa/Niamey',
    label: 'Niamey (WAT)',
    city: 'Niamey',
    country: 'Niger',
  },
  {
    value: 'Africa/Ndjamena',
    label: 'Ndjamena (WAT)',
    city: 'Ndjamena',
    country: 'Chad',
  },
  {
    value: 'Africa/Bangui',
    label: 'Bangui (WAT)',
    city: 'Bangui',
    country: 'Central African Republic',
  },
  {
    value: 'Africa/Brazzaville',
    label: 'Brazzaville (WAT)',
    city: 'Brazzaville',
    country: 'Republic of the Congo',
  },
  {
    value: 'Africa/Libreville',
    label: 'Libreville (WAT)',
    city: 'Libreville',
    country: 'Gabon',
  },
  {
    value: 'Africa/Malabo',
    label: 'Malabo (WAT)',
    city: 'Malabo',
    country: 'Equatorial Guinea',
  },
  {
    value: 'Africa/Sao_Tome',
    label: 'São Tomé (GMT)',
    city: 'São Tomé',
    country: 'São Tomé and Príncipe',
  },
  {
    value: 'Africa/Djibouti',
    label: 'Djibouti (EAT)',
    city: 'Djibouti',
    country: 'Djibouti',
  },
  {
    value: 'Africa/Asmara',
    label: 'Asmara (EAT)',
    city: 'Asmara',
    country: 'Eritrea',
  },
  {
    value: 'Africa/Mogadishu',
    label: 'Mogadishu (EAT)',
    city: 'Mogadishu',
    country: 'Somalia',
  },
  {
    value: 'Africa/Kigali',
    label: 'Kigali (CAT)',
    city: 'Kigali',
    country: 'Rwanda',
  },
  {
    value: 'Africa/Bujumbura',
    label: 'Bujumbura (CAT)',
    city: 'Bujumbura',
    country: 'Burundi',
  },
  {
    value: 'Africa/Lilongwe',
    label: 'Lilongwe (CAT)',
    city: 'Lilongwe',
    country: 'Malawi',
  },
  {
    value: 'Africa/Antananarivo',
    label: 'Antananarivo (EAT)',
    city: 'Antananarivo',
    country: 'Madagascar',
  },
  {
    value: 'Africa/Comoro',
    label: 'Comoro (EAT)',
    city: 'Comoro',
    country: 'Comoros',
  },
  {
    value: 'Africa/Moroni',
    label: 'Moroni (EAT)',
    city: 'Moroni',
    country: 'Comoros',
  },
  {
    value: 'Africa/Seychelles',
    label: 'Seychelles (SCT)',
    city: 'Seychelles',
    country: 'Seychelles',
  },
  {
    value: 'Africa/Reunion',
    label: 'Réunion (RET)',
    city: 'Réunion',
    country: 'Réunion',
  },
  {
    value: 'Africa/Mayotte',
    label: 'Mayotte (EAT)',
    city: 'Mayotte',
    country: 'Mayotte',
  },
  {
    value: 'Africa/Saint_Helena',
    label: 'Saint Helena (GMT)',
    city: 'Saint Helena',
    country: 'Saint Helena',
  },
  {
    value: 'Africa/Ascension',
    label: 'Ascension (GMT)',
    city: 'Ascension',
    country: 'Ascension Island',
  },
  {
    value: 'Africa/Tristan_da_Cunha',
    label: 'Tristan da Cunha (GMT)',
    city: 'Tristan da Cunha',
    country: 'Tristan da Cunha',
  },

  // Pacific Islands (deduplicated)
  {
    value: 'Pacific/Auckland',
    label: 'Auckland (NZST/NZDT)',
    city: 'Auckland',
    country: 'New Zealand',
  },
  {
    value: 'Pacific/Wellington',
    label: 'Wellington (NZST/NZDT)',
    city: 'Wellington',
    country: 'New Zealand',
  },
  {
    value: 'Pacific/Chatham',
    label: 'Chatham (CHAST/CHADT)',
    city: 'Chatham',
    country: 'New Zealand',
  },
  { value: 'Pacific/Fiji', label: 'Fiji (FJT)', city: 'Fiji', country: 'Fiji' },
  {
    value: 'Pacific/Guam',
    label: 'Guam (ChST)',
    city: 'Guam',
    country: 'Guam',
  },
  {
    value: 'Pacific/Saipan',
    label: 'Saipan (ChST)',
    city: 'Saipan',
    country: 'Northern Mariana Islands',
  },
  {
    value: 'Pacific/Palau',
    label: 'Palau (PWT)',
    city: 'Palau',
    country: 'Palau',
  },
  {
    value: 'Pacific/Chuuk',
    label: 'Chuuk (CHUT)',
    city: 'Chuuk',
    country: 'Micronesia',
  },
  {
    value: 'Pacific/Pohnpei',
    label: 'Pohnpei (PONT)',
    city: 'Pohnpei',
    country: 'Micronesia',
  },
  {
    value: 'Pacific/Kosrae',
    label: 'Kosrae (KOST)',
    city: 'Kosrae',
    country: 'Micronesia',
  },
  {
    value: 'Pacific/Majuro',
    label: 'Majuro (MHT)',
    city: 'Majuro',
    country: 'Marshall Islands',
  },
  {
    value: 'Pacific/Kwajalein',
    label: 'Kwajalein (MHT)',
    city: 'Kwajalein',
    country: 'Marshall Islands',
  },
  {
    value: 'Pacific/Tarawa',
    label: 'Tarawa (GILT)',
    city: 'Tarawa',
    country: 'Kiribati',
  },
  {
    value: 'Pacific/Enderbury',
    label: 'Enderbury (PHOT)',
    city: 'Enderbury',
    country: 'Kiribati',
  },
  {
    value: 'Pacific/Kiritimati',
    label: 'Kiritimati (LINT)',
    city: 'Kiritimati',
    country: 'Kiribati',
  },
  {
    value: 'Pacific/Kanton',
    label: 'Kanton (PHOT)',
    city: 'Kanton',
    country: 'Kiribati',
  },
  {
    value: 'Pacific/Nauru',
    label: 'Nauru (NRT)',
    city: 'Nauru',
    country: 'Nauru',
  },
  {
    value: 'Pacific/Funafuti',
    label: 'Funafuti (TVT)',
    city: 'Funafuti',
    country: 'Tuvalu',
  },
  {
    value: 'Pacific/Wallis',
    label: 'Wallis (WFT)',
    city: 'Wallis',
    country: 'Wallis and Futuna',
  },
  {
    value: 'Pacific/Futuna',
    label: 'Futuna (WFT)',
    city: 'Futuna',
    country: 'Wallis and Futuna',
  },
  {
    value: 'Pacific/Tahiti',
    label: 'Tahiti (TAHT)',
    city: 'Tahiti',
    country: 'French Polynesia',
  },
  {
    value: 'Pacific/Marquesas',
    label: 'Marquesas (MART)',
    city: 'Marquesas',
    country: 'French Polynesia',
  },
  {
    value: 'Pacific/Gambier',
    label: 'Gambier (GAMT)',
    city: 'Gambier',
    country: 'French Polynesia',
  },
  {
    value: 'Pacific/Rarotonga',
    label: 'Rarotonga (CKT)',
    city: 'Rarotonga',
    country: 'Cook Islands',
  },
  { value: 'Pacific/Niue', label: 'Niue (NUT)', city: 'Niue', country: 'Niue' },
  {
    value: 'Pacific/Pitcairn',
    label: 'Pitcairn (PST)',
    city: 'Pitcairn',
    country: 'Pitcairn Islands',
  },
  {
    value: 'Pacific/Easter',
    label: 'Easter Island (EAST)',
    city: 'Easter Island',
    country: 'Chile',
  },
  {
    value: 'Pacific/Galapagos',
    label: 'Galapagos (GALT)',
    city: 'Galapagos',
    country: 'Ecuador',
  },
  {
    value: 'Pacific/Apia',
    label: 'Apia (WST)',
    city: 'Apia',
    country: 'Samoa',
  },
  {
    value: 'Pacific/Pago_Pago',
    label: 'Pago Pago (SST)',
    city: 'Pago Pago',
    country: 'American Samoa',
  },
  {
    value: 'Pacific/Tongatapu',
    label: 'Tongatapu (TOT)',
    city: 'Tongatapu',
    country: 'Tonga',
  },
  {
    value: 'Pacific/Midway',
    label: 'Midway (SST)',
    city: 'Midway',
    country: 'United States',
  },
  {
    value: 'Pacific/Wake',
    label: 'Wake (WAKT)',
    city: 'Wake',
    country: 'United States',
  },
  {
    value: 'Pacific/Johnston',
    label: 'Johnston (HST)',
    city: 'Johnston',
    country: 'United States',
  },
  {
    value: 'Pacific/Palmer',
    label: 'Palmer (CLST)',
    city: 'Palmer',
    country: 'Antarctica',
  },
  {
    value: 'Pacific/McMurdo',
    label: 'McMurdo (NZST/NZDT)',
    city: 'McMurdo',
    country: 'Antarctica',
  },
  {
    value: 'Pacific/DumontDUrville',
    label: "Dumont d'Urville (DDUT)",
    city: "Dumont d'Urville",
    country: 'Antarctica',
  },
  {
    value: 'Pacific/Syowa',
    label: 'Syowa (SYOT)',
    city: 'Syowa',
    country: 'Antarctica',
  },
  {
    value: 'Pacific/Vostok',
    label: 'Vostok (VOST)',
    city: 'Vostok',
    country: 'Antarctica',
  },
  {
    value: 'Pacific/Bougainville',
    label: 'Bougainville (BST)',
    city: 'Bougainville',
    country: 'Papua New Guinea',
  },
  {
    value: 'Pacific/Port_Moresby',
    label: 'Port Moresby (PGT)',
    city: 'Port Moresby',
    country: 'Papua New Guinea',
  },
  {
    value: 'Pacific/Guadalcanal',
    label: 'Guadalcanal (SBT)',
    city: 'Guadalcanal',
    country: 'Solomon Islands',
  },
  {
    value: 'Pacific/Efate',
    label: 'Efate (VUT)',
    city: 'Efate',
    country: 'Vanuatu',
  },
  {
    value: 'Pacific/Noumea',
    label: 'Noumea (NCT)',
    city: 'Noumea',
    country: 'New Caledonia',
  },
]

// Function to get user's timezone automatically
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'UTC'
  }
}

// Function to find timezone by value
export function findTimezone(value: string): Timezone | undefined {
  return timezones.find(tz => tz.value === value)
}

// Function to get timezone offset string
export function getTimezoneOffset(timezone: string): string {
  try {
    const date = new Date()
    const utc = date.getTime() + date.getTimezoneOffset() * 60000
    const targetTime = new Date(utc + 0 * 60000)
    const offset = targetTime.toLocaleString('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    })
    return offset.split(' ').pop() || ''
  } catch {
    return ''
  }
}
