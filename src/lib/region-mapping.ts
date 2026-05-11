const cityToZone: Record<string, string> = {
  // North
  'delhi': 'North', 'new delhi': 'North', 'faridabad': 'North', 'gurugram': 'North',
  'gurgaon': 'North', 'panipat': 'North', 'ambala': 'North', 'chandigarh': 'North',
  'ludhiana': 'North', 'amritsar': 'North', 'jalandhar': 'North', 'patiala': 'North',
  'jaipur': 'North', 'jodhpur': 'North', 'udaipur': 'North', 'kota': 'North',
  'ajmer': 'North', 'bikaner': 'North', 'lucknow': 'North', 'kanpur': 'North',
  'agra': 'North', 'varanasi': 'North', 'meerut': 'North', 'noida': 'North',
  'ghaziabad': 'North', 'allahabad': 'North', 'prayagraj': 'North', 'bareilly': 'North',
  'dehradun': 'North', 'haridwar': 'North', 'roorkee': 'North', 'shimla': 'North',
  'manali': 'North', 'dharamshala': 'North', 'srinagar': 'North', 'jammu': 'North',
  'leh': 'North', 'hisar': 'North', 'karnal': 'North', 'sonipat': 'North',
  'bathinda': 'North', 'mohali': 'North',

  // South
  'chennai': 'South', 'coimbatore': 'South', 'madurai': 'South', 'tiruchirappalli': 'South',
  'trichy': 'South', 'salem': 'South', 'tirunelveli': 'South', 'bengaluru': 'South',
  'bangalore': 'South', 'mysuru': 'South', 'mysore': 'South', 'hubli': 'South',
  'mangaluru': 'South', 'mangalore': 'South', 'thiruvananthapuram': 'South', 'trivandrum': 'South',
  'kochi': 'South', 'kozhikode': 'South', 'calicut': 'South', 'hyderabad': 'South',
  'warangal': 'South', 'nizamabad': 'South', 'visakhapatnam': 'South', 'vijayawada': 'South',
  'guntur': 'South', 'nellore': 'South', 'kurnool': 'South', 'puducherry': 'South',
  'pondicherry': 'South', 'kavaratti': 'South', 'port blair': 'South',

  // East
  'kolkata': 'East', 'howrah': 'East', 'durgapur': 'East', 'asansol': 'East',
  'siliguri': 'East', 'bhubaneswar': 'East', 'cuttack': 'East', 'rourkela': 'East',
  'patna': 'East', 'gaya': 'East', 'bhagalpur': 'East', 'muzaffarpur': 'East',
  'ranchi': 'East', 'jamshedpur': 'East', 'dhanbad': 'East', 'guwahati': 'East',
  'dispur': 'East', 'dibrugarh': 'East', 'silchar': 'East', 'itanagar': 'East',
  'tawang': 'East', 'ziro': 'East', 'agartala': 'East', 'imphal': 'East',
  'shillong': 'East', 'aizawl': 'East', 'kohima': 'East', 'dimapur': 'East',
  'gangtok': 'East',

  // West
  'mumbai': 'West', 'pune': 'West', 'nagpur': 'West', 'thane': 'West',
  'nashik': 'West', 'aurangabad': 'West', 'solapur': 'West', 'kolhapur': 'West',
  'ahmedabad': 'West', 'surat': 'West', 'vadodara': 'West', 'rajkot': 'West',
  'panaji': 'West', 'vasco da gama': 'West', 'margao': 'West', 'daman': 'West',
  'silvassa': 'West', 'navi mumbai': 'West', 'kalyan': 'West', 'vapi': 'West',

  // Central
  'bhopal': 'Central', 'indore': 'Central', 'jabalpur': 'Central', 'gwalior': 'Central',
  'ujjain': 'Central', 'raipur': 'Central', 'bhilai': 'Central', 'korba': 'Central',
  'bilaspur': 'Central',
};

const stateToZone: Record<string, string> = {
  // North
  'delhi': 'North', 'haryana': 'North', 'punjab': 'North', 'rajasthan': 'North',
  'uttar pradesh': 'North', 'uttarakhand': 'North', 'himachal pradesh': 'North',
  'jammu and kashmir': 'North', 'ladakh': 'North', 'chandigarh': 'North',

  // South
  'tamil nadu': 'South', 'karnataka': 'South', 'kerala': 'South',
  'andhra pradesh': 'South', 'telangana': 'South', 'puducherry': 'South',
  'lakshadweep': 'South', 'andaman and nicobar islands': 'South',

  // East
  'west bengal': 'East', 'odisha': 'East', 'bihar': 'East', 'jharkhand': 'East',
  'assam': 'East', 'sikkim': 'East', 'tripura': 'East', 'manipur': 'East',
  'meghalaya': 'East', 'nagaland': 'East', 'mizoram': 'East', 'arunachal pradesh': 'East',

  // West
  'maharashtra': 'West', 'gujarat': 'West', 'goa': 'West',
  'dadra and nagar haveli and daman and diu': 'West',

  // Central
  'madhya pradesh': 'Central', 'chhattisgarh': 'Central',
};

export function lookupZone(city: string, state: string): string | null {
  if (city) {
    const zone = cityToZone[city.toLowerCase().trim()];
    if (zone) return zone;
  }
  if (state) {
    const zone = stateToZone[state.toLowerCase().trim()];
    if (zone) return zone;
  }
  return null;
}
