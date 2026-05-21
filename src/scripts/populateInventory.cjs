require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.VITE_API_URL;
if (!API_URL) { console.error('❌ VITE_API_URL not set'); process.exit(1); }

// ── Each provider's inventory keyed by name
// Structure: { groupKey: { label, options: { optionKey: { label, markets: { marketKey: { price } } } } } }

const PROVIDER_INVENTORY = {

  // ══════════════════════════════════════════
  // TELEVISION
  // ══════════════════════════════════════════

  'Arise TV': {
    COMMERCIAL_SPOTS: { label: 'Commercial Spots', options: {
      OFFPEAK_10S:  { label: '10s Off-Peak',  markets: { NATIONAL: { price: 180000 } } },
      OFFPEAK_15S:  { label: '15s Off-Peak',  markets: { NATIONAL: { price: 250000 } } },
      OFFPEAK_30S:  { label: '30s Off-Peak',  markets: { NATIONAL: { price: 450000 } } },
      OFFPEAK_45S:  { label: '45s Off-Peak',  markets: { NATIONAL: { price: 650000 } } },
      OFFPEAK_60S:  { label: '60s Off-Peak',  markets: { NATIONAL: { price: 850000 } } },
      PRIME_10S:    { label: '10s Prime Time', markets: { NATIONAL: { price: 300000 } } },
      PRIME_15S:    { label: '15s Prime Time', markets: { NATIONAL: { price: 400000 } } },
      PRIME_30S:    { label: '30s Prime Time', markets: { NATIONAL: { price: 750000 } } },
      PRIME_45S:    { label: '45s Prime Time', markets: { NATIONAL: { price: 950000 } } },
      PRIME_60S:    { label: '60s Prime Time', markets: { NATIONAL: { price: 1200000 } } },
    }},
    SPONSORSHIP: { label: 'Sponsorship & Brand Integration', options: {
      PROGRAMME_SPONSORSHIP: { label: 'Programme Sponsorship', markets: { NATIONAL: { price: 12500000 } } },
      NEWS_SPONSORSHIP:      { label: 'News Sponsorship',      markets: { NATIONAL: { price: 16500000 } } },
      LOWER_THIRD:           { label: 'Lower Third / Scroll Ads (weekly)', markets: { NATIONAL: { price: 650000 } } },
      PRESENTER_MENTION:     { label: 'Presenter Mention',     markets: { NATIONAL: { price: 1250000 } } },
      BRAND_INTEGRATION:     { label: 'Brand Integration',     markets: { NATIONAL: { price: 6000000 } } },
      EVENT_COVERAGE:        { label: 'Event Coverage Partnership', markets: { NATIONAL: { price: 9000000 } } },
    }},
  },

  'Channels Television': {
    COMMERCIAL_SPOTS: { label: 'Commercial Spots', options: {
      MORNING_60S:   { label: '60s Morning Belt (6AM–3PM)',   markets: { NATIONAL: { price: 61436 } } },
      MORNING_30S:   { label: '30s Morning Belt (6AM–3PM)',   markets: { NATIONAL: { price: 38736 } } },
      MORNING_15S:   { label: '15s Morning Belt (6AM–3PM)',   markets: { NATIONAL: { price: 28009 } } },
      EVENING_60S:   { label: '60s Evening Belt (3PM–7PM)',   markets: { NATIONAL: { price: 65531 } } },
      EVENING_30S:   { label: '30s Evening Belt (3PM–7PM)',   markets: { NATIONAL: { price: 41399 } } },
      PRIME_60S:     { label: '60s Prime Belt (7PM–11PM)',    markets: { NATIONAL: { price: 88030 } } },
      PRIME_30S:     { label: '30s Prime Belt (7PM–11PM)',    markets: { NATIONAL: { price: 58420 } } },
      PRIME_15S:     { label: '15s Prime Belt (7PM–11PM)',    markets: { NATIONAL: { price: 38736 } } },
      LATE_60S:      { label: '60s Late Night (11PM–6AM)',    markets: { NATIONAL: { price: 58420 } } },
      LATE_30S:      { label: '30s Late Night (11PM–6AM)',    markets: { NATIONAL: { price: 36497 } } },
    }},
    SPECIAL_PROGRAMMES: { label: 'Special Programmes', options: {
      SUNRISE_60S:   { label: 'Sunrise / Business Morning 60s', markets: { NATIONAL: { price: 188972 } } },
      SUNRISE_30S:   { label: 'Sunrise / Business Morning 30s', markets: { NATIONAL: { price: 134980 } } },
      POLITICS_TODAY_30S: { label: 'Politics Today 30s',       markets: { NATIONAL: { price: 242965 } } },
      EIGHT_PM_NEWS_30S:  { label: '8PM News 30s',             markets: { NATIONAL: { price: 202470 } } },
      NEWS_AT_TEN_60S:    { label: 'News at Ten 60s',          markets: { NATIONAL: { price: 739458 } } },
      SPECIAL_EVENTS:     { label: 'Special Events News (10PM)', markets: { NATIONAL: { price: 2253000 } } },
      LIVE_COVERAGE:      { label: 'Live Coverage (min 1 hour)', markets: { NATIONAL: { price: 5000000 } } },
    }},
    SPONSORSHIP: { label: 'Programme Features & Sponsorships', options: {
      SEGMENT_15MINS:  { label: 'Segment Sponsorship 15 mins', markets: { NATIONAL: { price: 1175040 } } },
      SEGMENT_10MINS:  { label: 'Segment Sponsorship 10 mins', markets: { NATIONAL: { price: 720000 } } },
      SEGMENT_5MINS:   { label: 'Segment Sponsorship 5 mins',  markets: { NATIONAL: { price: 540000 } } },
      HEALTH_MATTER:   { label: 'Health Matter Appearance',     markets: { NATIONAL: { price: 850500 } } },
      BUSINESS_MORNING:{ label: 'Business Morning Appearance',  markets: { NATIONAL: { price: 901200 } } },
    }},
  },

  'TVC Communications': {
    COMMERCIAL_SPOTS: { label: 'Commercial Spots', options: {
      MORNING_60S: { label: '60s (5AM–4PM)', markets: { NATIONAL: { price: 100000 } } },
      MORNING_30S: { label: '30s (5AM–4PM)', markets: { NATIONAL: { price: 60000  } } },
      MORNING_15S: { label: '15s (5AM–4PM)', markets: { NATIONAL: { price: 35000  } } },
      EVENING_60S: { label: '60s (4PM–7PM)', markets: { NATIONAL: { price: 120000 } } },
      EVENING_30S: { label: '30s (4PM–7PM)', markets: { NATIONAL: { price: 70000  } } },
      PRIME_60S:   { label: '60s (7PM–12AM)',markets: { NATIONAL: { price: 150000 } } },
      PRIME_30S:   { label: '30s (7PM–12AM)',markets: { NATIONAL: { price: 80000  } } },
      PRIME_15S:   { label: '15s (7PM–12AM)',markets: { NATIONAL: { price: 50000  } } },
    }},
    SPECIAL: { label: 'Special Positions & Live Coverage', options: {
      CORPORATE_NEWS_MENTION: { label: 'Corporate News Mention (10PM)', markets: { NATIONAL: { price: 3100000 } } },
      GOVERNMENT_NEWS_MENTION:{ label: 'Government News Mention (10PM)',markets: { NATIONAL: { price: 3500000 } } },
      LIVE_WITHIN_LAGOS:      { label: 'Live Coverage Within Lagos/Abuja',markets: { NATIONAL: { price: 6000000 } } },
      LIVE_OUTSIDE_LAGOS:     { label: 'Live Coverage Outside Lagos',   markets: { NATIONAL: { price: 6500000 } } },
      LIVE_WITH_OB_VAN:       { label: 'Live Coverage with OB Van',      markets: { NATIONAL: { price: 7500000 } } },
      YOUR_VIEW_APPEARANCE:   { label: 'Your View / Journalists Hangout', markets: { NATIONAL: { price: 3750000 } } },
      BUSINESS_APPEARANCE:    { label: 'Wake Up Nigeria / Business Nigeria',markets: { NATIONAL: { price: 3000000 } } },
      POLITICS_APPEARANCE:    { label: 'Politics / Government Focus',    markets: { NATIONAL: { price: 4000000 } } },
      SEGMENT_SPONSORSHIP:    { label: 'Segment Sponsorship (10 mins)',  markets: { NATIONAL: { price: 3500000 } } },
    }},
    INDEPENDENT_PROGRAMMES: { label: 'Independent Programmes', options: {
      TVC_ENTERTAINMENT: { label: 'TVC Entertainment (Independent)', markets: { NATIONAL: { price: 10000000 } } },
      TVC_NEWS:          { label: 'TVC News (Independent)',          markets: { NATIONAL: { price: 14250000 } } },
    }},
  },

  'ONTV': {
    COMMERCIAL_SPOTS: { label: 'Commercial Spots', options: {
      SIXTY_SECONDS:    { label: '60 Seconds', markets: { NATIONAL: { price: 322500 } } },
      FORTY_FIVE_SECS:  { label: '45 Seconds', markets: { NATIONAL: { price: 270000 } } },
      THIRTY_SECONDS:   { label: '30 Seconds', markets: { NATIONAL: { price: 250000 } } },
      FIFTEEN_SECONDS:  { label: '15 Seconds', markets: { NATIONAL: { price: 200250 } } },
    }},
    AIRTIME_SPONSORSHIP: { label: 'Airtime Sponsorship', options: {
      SIXTY_MINS:   { label: '60 Minutes', markets: { NATIONAL: { price: 3000000 } } },
      THIRTY_MINS:  { label: '30 Minutes', markets: { NATIONAL: { price: 2000000 } } },
      FIFTEEN_MINS: { label: '15 Minutes', markets: { NATIONAL: { price: 1000000 } } },
    }},
    EVENT_COVERAGE: { label: 'Event Coverage', options: {
      LAGOS:         { label: 'Event Coverage Lagos',         markets: { LAGOS:    { price: 10000000 } } },
      OUTSIDE_LAGOS: { label: 'Event Coverage Outside Lagos', markets: { NATIONAL: { price: 15000000 } } },
    }},
  },

  'Soundcity TV': {
    COMMERCIAL_SPOTS: { label: 'Commercial Spots', options: {
      SIXTY_SECONDS:   { label: '60 Seconds', markets: { NATIONAL: { price: 322500 } } },
      FORTY_FIVE_SECS: { label: '45 Seconds', markets: { NATIONAL: { price: 270000 } } },
      THIRTY_SECONDS:  { label: '30 Seconds', markets: { NATIONAL: { price: 250000 } } },
      FIFTEEN_SECONDS: { label: '15 Seconds', markets: { NATIONAL: { price: 200250 } } },
    }},
    AIRTIME_SPONSORSHIP: { label: 'Airtime Sponsorship', options: {
      SIXTY_MINS:   { label: '60 Minutes', markets: { NATIONAL: { price: 3000000 } } },
      THIRTY_MINS:  { label: '30 Minutes', markets: { NATIONAL: { price: 2000000 } } },
      FIFTEEN_MINS: { label: '15 Minutes', markets: { NATIONAL: { price: 1000000 } } },
    }},
  },

  'Africa Magic Urban': {
    COMMERCIAL_SPOTS: { label: 'Commercial Spots', options: {
      OFFPEAK_30S: { label: '30s Off-Peak', markets: { NATIONAL: { price: 220000 } } },
      OFFPEAK_60S: { label: '60s Off-Peak', markets: { NATIONAL: { price: 420000 } } },
      PRIME_30S:   { label: '30s Prime Time',markets: { NATIONAL: { price: 420000 } } },
      PRIME_60S:   { label: '60s Prime Time',markets: { NATIONAL: { price: 750000 } } },
    }},
    SPONSORSHIP: { label: 'Sponsorship & Integration', options: {
      PROGRAMME_SPONSORSHIP: { label: 'Programme Sponsorship', markets: { NATIONAL: { price: 7500000  } } },
      PRESENTER_MENTION:     { label: 'Presenter Mention',     markets: { NATIONAL: { price: 650000   } } },
      BRAND_INTEGRATION:     { label: 'Brand Integration',     markets: { NATIONAL: { price: 3750000  } } },
      EVENT_COVERAGE:        { label: 'Event Coverage',        markets: { NATIONAL: { price: 5000000  } } },
    }},
  },

  'Africa Magic Family': {
    COMMERCIAL_SPOTS: { label: 'Commercial Spots', options: {
      OFFPEAK_30S: { label: '30s Off-Peak', markets: { NATIONAL: { price: 180000 } } },
      OFFPEAK_60S: { label: '60s Off-Peak', markets: { NATIONAL: { price: 340000 } } },
      PRIME_30S:   { label: '30s Prime Time',markets: { NATIONAL: { price: 320000 } } },
      PRIME_60S:   { label: '60s Prime Time',markets: { NATIONAL: { price: 580000 } } },
    }},
    SPONSORSHIP: { label: 'Sponsorship & Integration', options: {
      PROGRAMME_SPONSORSHIP: { label: 'Programme Sponsorship', markets: { NATIONAL: { price: 5000000 } } },
      PRESENTER_MENTION:     { label: 'Presenter Mention',     markets: { NATIONAL: { price: 475000  } } },
      BRAND_INTEGRATION:     { label: 'Brand Integration',     markets: { NATIONAL: { price: 2500000 } } },
    }},
  },

  'Spice TV': {
    COMMERCIAL_SPOTS: { label: 'Commercial Spots', options: {
      SIXTY_SECONDS:   { label: '60 Seconds', markets: { NATIONAL: { price: 129855 } } },
      FORTY_FIVE_SECS: { label: '45 Seconds', markets: { NATIONAL: { price: 108750 } } },
      THIRTY_SECONDS:  { label: '30 Seconds', markets: { NATIONAL: { price: 92350  } } },
      FIFTEEN_SECONDS: { label: '15 Seconds', markets: { NATIONAL: { price: 89650  } } },
    }},
  },

  'Trybe TV': {
    COMMERCIAL_SPOTS: { label: 'Commercial Spots', options: {
      SIXTY_SECONDS:   { label: '60 Seconds', markets: { NATIONAL: { price: 250950 } } },
      FORTY_FIVE_SECS: { label: '45 Seconds', markets: { NATIONAL: { price: 225450 } } },
      THIRTY_SECONDS:  { label: '30 Seconds', markets: { NATIONAL: { price: 198500 } } },
      FIFTEEN_SECONDS: { label: '15 Seconds', markets: { NATIONAL: { price: 145250 } } },
    }},
  },

  'Televista': {
    COMMERCIAL_SPOTS: { label: 'Commercial Spots', options: {
      SIXTY_SECONDS:   { label: '60 Seconds', markets: { NATIONAL: { price: 250950 } } },
      FORTY_FIVE_SECS: { label: '45 Seconds', markets: { NATIONAL: { price: 225450 } } },
      THIRTY_SECONDS:  { label: '30 Seconds', markets: { NATIONAL: { price: 198500 } } },
      FIFTEEN_SECONDS: { label: '15 Seconds', markets: { NATIONAL: { price: 145250 } } },
    }},
  },

  'Access24 TV': {
    COMMERCIAL_SPOTS: { label: 'Commercial Spots', options: {
      SIXTY_SECONDS:   { label: '60 Seconds', markets: { NATIONAL: { price: 129855 } } },
      FORTY_FIVE_SECS: { label: '45 Seconds', markets: { NATIONAL: { price: 108750 } } },
      THIRTY_SECONDS:  { label: '30 Seconds', markets: { NATIONAL: { price: 92350  } } },
      FIFTEEN_SECONDS: { label: '15 Seconds', markets: { NATIONAL: { price: 89650  } } },
    }},
  },

  // ══════════════════════════════════════════
  // RADIO
  // ══════════════════════════════════════════

  'Cool FM': {
    COMMERCIAL_SPOTS: { label: 'Commercial Spots', options: {
      PEAK_30S:    { label: '30s Peak',     markets: { LAGOS: { price: 21750 }, ABUJA: { price: 11750 }, PORT_HARCOURT: { price: 11750 }, KANO: { price: 7500 } } },
      OFFPEAK_30S: { label: '30s Off-Peak', markets: { LAGOS: { price: 12500 }, ABUJA: { price: 9688  }, PORT_HARCOURT: { price: 9688  }, KANO: { price: 6250 } } },
    }},
    PROGRAMME_SPONSORSHIPS: { label: 'Programme Sponsorships', options: {
      MORNING_SHOW:     { label: 'Morning Show',     markets: { LAGOS: { price: 21750 }, ABUJA: { price: 11750 }, PORT_HARCOURT: { price: 11750 }, KANO: { price: 7500 } } },
      DRIVE_TIME:       { label: 'Drive Time',       markets: { LAGOS: { price: 21750 }, ABUJA: { price: 11750 }, PORT_HARCOURT: { price: 11750 }, KANO: { price: 7500 } } },
      NIGHT_SHOW:       { label: 'Night Show',       markets: { LAGOS: { price: 12500 }, ABUJA: { price: 9688  }, PORT_HARCOURT: { price: 9688  }, KANO: { price: 6250 } } },
      NEWS_SPONSORSHIP: { label: 'News Sponsorship', markets: { NATIONAL: { price: 180000 } } },
      TRAFFIC_SPONSOR:  { label: 'Traffic Sponsorship', markets: { NATIONAL: { price: 45000 } } },
    }},
    PRESENTER_TALENT: { label: 'Presenter & Talent', options: {
      PRESENTER_MENTION:    { label: 'Presenter Mention',    markets: { LAGOS: { price: 26250 }, ABUJA: { price: 17063 }, PORT_HARCOURT: { price: 18000 }, KANO: { price: 10875 } } },
      LIVE_READ:            { label: 'Live Read Slot',       markets: { LAGOS: { price: 500000 }, ABUJA_PH_KANO: { price: 150000 } } },
      COUNTDOWN_SPONSOR:    { label: 'Countdown Sponsorship',markets: { LAGOS: { price: 456125 }, ABUJA: { price: 195250 }, PORT_HARCOURT: { price: 147840 }, KANO: { price: 68400 } } },
    }},
    PRODUCTION: { label: 'Audio Production', options: {
      JINGLE_PRODUCTION: { label: 'Jingle Production', markets: { LAGOS: { price: 150000 }, OTHER_CITIES: { price: 100000 } } },
      SCRIPTWRITING:     { label: 'Scriptwriting',     markets: { NATIONAL: { price: 20000  } } },
      VOICE_OVER:        { label: 'Voice Over',         markets: { LAGOS: { price: 50000 }, OTHER_CITIES: { price: 30000 } } },
      OUTDOOR_BROADCAST: { label: 'Outdoor Broadcast / Roadshow', markets: { LAGOS: { price: 3000000 } } },
    }},
  },

  'Wazobia FM': {
    COMMERCIAL_SPOTS: { label: 'Commercial Spots', options: {
      PEAK_30S:    { label: '30s Peak',     markets: { LAGOS: { price: 28125 }, ABUJA: { price: 14500 }, PORT_HARCOURT: { price: 15750 }, KANO: { price: 9750 }, ONITSHA: { price: 9750 } } },
      OFFPEAK_30S: { label: '30s Off-Peak', markets: { LAGOS: { price: 19625 }, ABUJA: { price: 10730 }, PORT_HARCOURT: { price: 11625 }, KANO: { price: 7670  }, ONITSHA: { price: 7670  } } },
      NIGHT_SHOW:  { label: 'Night Show',   markets: { LAGOS: { price: 11875 }, ABUJA: { price: 6380  }, PORT_HARCOURT: { price: 6975  }, KANO: { price: 4680  }, ONITSHA: { price: 6240  } } },
    }},
    PROGRAMME_SPONSORSHIPS: { label: 'Programme Sponsorships', options: {
      MORNING_SHOW:     { label: 'Morning Show',     markets: { LAGOS: { price: 28125 }, ABUJA: { price: 14500 }, PORT_HARCOURT: { price: 15750 }, KANO: { price: 9750 }, ONITSHA: { price: 9750 } } },
      DRIVE_TIME:       { label: 'Drive Time',       markets: { LAGOS: { price: 28125 }, ABUJA: { price: 14500 }, PORT_HARCOURT: { price: 15750 }, KANO: { price: 9750 }, ONITSHA: { price: 9750 } } },
      NEWS_SPONSORSHIP: { label: 'News Sponsorship', markets: { NATIONAL: { price: 180000 } } },
      TRAFFIC_SPONSOR:  { label: 'Traffic Sponsorship', markets: { NATIONAL: { price: 45000 } } },
    }},
    PRESENTER_TALENT: { label: 'Presenter & Talent', options: {
      PRESENTER_MENTION: { label: 'Presenter Mention',    markets: { LAGOS: { price: 36875 }, ABUJA: { price: 18125 }, PORT_HARCOURT: { price: 19063 }, KANO: { price: 12000 }, ONITSHA: { price: 10000 } } },
      COUNTDOWN_SPONSOR: { label: 'Countdown Sponsorship',markets: { LAGOS: { price: 590000 }, ABUJA: { price: 206876 }, PORT_HARCOURT: { price: 255250 }, KANO: { price: 90000 }, ONITSHA: { price: 90000 } } },
    }},
    PRODUCTION: { label: 'Audio Production', options: {
      JINGLE_PRODUCTION: { label: 'Jingle Production', markets: { LAGOS: { price: 150000 }, OTHER_CITIES: { price: 100000 } } },
      VOICE_OVER:        { label: 'Extra Voice',        markets: { LAGOS: { price: 50000  }, OTHER_CITIES: { price: 30000  } } },
      OUTDOOR_BROADCAST: { label: 'Outdoor Broadcast',  markets: { LAGOS: { price: 3000000 } } },
    }},
  },

  'Nigeria Info FM': {
    COMMERCIAL_SPOTS: { label: 'Commercial Spots', options: {
      PEAK_30S:    { label: '30s Peak',     markets: { NATIONAL: { price: 24530 } } },
      OFFPEAK_30S: { label: '30s Off-Peak', markets: { NATIONAL: { price: 17600 } } },
      NIGHT_SHOW:  { label: 'Night Show',   markets: { NATIONAL: { price: 9240  } } },
    }},
    PROGRAMME_SPONSORSHIPS: { label: 'Programme Sponsorships', options: {
      MORNING_SHOW:     { label: 'Morning Show',        markets: { NATIONAL: { price: 24530  } } },
      DRIVE_TIME:       { label: 'Drive Time',          markets: { NATIONAL: { price: 24530  } } },
      NEWS_SPONSORSHIP: { label: 'News Sponsorship',    markets: { NATIONAL: { price: 180000 } } },
      TRAFFIC_SPONSOR:  { label: 'Traffic Sponsorship', markets: { NATIONAL: { price: 45000  } } },
      LIVE_READ:        { label: 'Live Read Slot',       markets: { NATIONAL: { price: 500000 } } },
    }},
    PRESENTER_TALENT: { label: 'Presenter & Talent', options: {
      PRESENTER_MENTION: { label: 'Presenter Mention',    markets: { NATIONAL: { price: 18938  } } },
      COUNTDOWN_SPONSOR: { label: 'Countdown Sponsorship',markets: { NATIONAL: { price: 408976 } } },
    }},
    PRODUCTION: { label: 'Audio Production', options: {
      JINGLE_PRODUCTION: { label: 'Jingle Production', markets: { NATIONAL: { price: 150000 } } },
      SCRIPTWRITING:     { label: 'Scriptwriting',     markets: { NATIONAL: { price: 20000  } } },
      VOICE_OVER:        { label: 'Extra Voice',        markets: { NATIONAL: { price: 50000  } } },
    }},
  },

  'The Beat FM': {
    COMMERCIAL_SPOTS: { label: 'Commercial Spots', options: {
      SUPER_PREMIUM_60S: { label: '60s Super Premium', markets: { LAGOS: { price: 22056 }, ABUJA: { price: 8800 }, PORT_HARCOURT: { price: 8800 } } },
      SUPER_PREMIUM_30S: { label: '30s Super Premium', markets: { LAGOS: { price: 12252 }, ABUJA: { price: 8800 }, PORT_HARCOURT: { price: 8800 } } },
      PREMIUM_30S:       { label: '30s Premium',       markets: { LAGOS: { price: 9600  } } },
      REGULAR_30S:       { label: '30s Regular',       markets: { LAGOS: { price: 7644  } } },
    }},
    PROGRAMME_SPONSORSHIPS: { label: 'Programme Sponsorships', options: {
      PROGRAMME_SPONSORSHIP_60S: { label: 'Programme Sponsorship (60s Premium)', markets: { LAGOS: { price: 500000 }, ABUJA: { price: 117649 }, PORT_HARCOURT: { price: 138410 } } },
      NEWS_COVERAGE:  { label: 'News Coverage',  markets: { LAGOS: { price: 150000 } } },
      NEWS_MENTION:   { label: 'News Mention',   markets: { LAGOS: { price: 100000 }, ABUJA: { price: 40000 }, PORT_HARCOURT: { price: 40000 } } },
      TIME_CHECK:     { label: 'Time Check Sponsorship', markets: { LAGOS: { price: 20000 } } },
    }},
    PRODUCTION: { label: 'Audio Production', options: {
      JINGLE_PRODUCTION:  { label: 'Jingle Production',   markets: { LAGOS: { price: 150000 }, ABUJA_PH: { price: 50000 } } },
      VOICE_OVER:         { label: 'Additional Voice',     markets: { LAGOS: { price: 50000  } } },
      OAP_HYPE:           { label: 'On-Air Personality Hype', markets: { LAGOS: { price: 50000 } } },
      OUTDOOR_BROADCAST:  { label: 'Outdoor Broadcast',    markets: { LAGOS: { price: 500000 }, ABUJA_PH: { price: 200000 } } },
    }},
  },

  'Classic FM': {
    COMMERCIAL_SPOTS: { label: 'Commercial Spots', options: {
      SUPER_PREMIUM_30S: { label: '30s Super Premium', markets: { LAGOS: { price: 12300 }, ABUJA: { price: 7722 } } },
    }},
    PROGRAMME_SPONSORSHIPS: { label: 'Programme Sponsorships', options: {
      PROGRAMME_SPONSORSHIP: { label: 'Programme Sponsorship', markets: { LAGOS: { price: 500000 }, ABUJA: { price: 173710 } } },
      NEWS_MENTION:          { label: 'News Mention',          markets: { LAGOS: { price: 100000 }, ABUJA: { price: 40000  } } },
    }},
    PRODUCTION: { label: 'Audio Production', options: {
      JINGLE_PRODUCTION: { label: 'Jingle Production',  markets: { LAGOS: { price: 150000 }, ABUJA: { price: 60000 } } },
      OUTDOOR_BROADCAST: { label: 'Outdoor Broadcast',  markets: { LAGOS: { price: 500000 } } },
    }},
  },

  'Naija FM': {
    COMMERCIAL_SPOTS: { label: 'Commercial Spots', options: {
      SUPER_PREMIUM_30S: { label: '30s Super Premium', markets: { LAGOS: { price: 13603 } } },
      PREMIUM_30S:       { label: '30s Premium',       markets: { LAGOS: { price: 11797 } } },
      REGULAR_30S:       { label: '30s Regular',       markets: { LAGOS: { price: 9588  } } },
    }},
    PROGRAMME_SPONSORSHIPS: { label: 'Programme Sponsorships', options: {
      PROGRAMME_SPONSORSHIP: { label: 'Programme Sponsorship', markets: { LAGOS: { price: 400000 } } },
      NEWS_MENTION:          { label: 'News Mention',          markets: { LAGOS: { price: 100000 } } },
    }},
    PRODUCTION: { label: 'Audio Production', options: {
      JINGLE_PRODUCTION: { label: 'Jingle Production', markets: { LAGOS: { price: 150000 } } },
      OUTDOOR_BROADCAST: { label: 'Outdoor Broadcast', markets: { LAGOS: { price: 500000 } } },
    }},
  },

  'Lagos Talks 91.3 FM': {
    COMMERCIAL_SPOTS: { label: 'Commercial Spots', options: {
      SUPER_PREMIUM_30S: { label: '30s Super Premium', markets: { LAGOS: { price: 10962 } } },
      PREMIUM_30S:       { label: '30s Premium',       markets: { LAGOS: { price: 9570  } } },
      REGULAR_30S:       { label: '30s Regular',       markets: { LAGOS: { price: 7510  } } },
    }},
    PROGRAMME_SPONSORSHIPS: { label: 'Programme Sponsorships', options: {
      PROGRAMME_SPONSORSHIP: { label: 'Programme Sponsorship', markets: { LAGOS: { price: 500000 } } },
      NEWS_MENTION:          { label: 'News Mention',          markets: { LAGOS: { price: 100000 } } },
    }},
    PRODUCTION: { label: 'Audio Production', options: {
      JINGLE_PRODUCTION: { label: 'Jingle Production', markets: { LAGOS: { price: 150000 } } },
      OUTDOOR_BROADCAST: { label: 'Outdoor Broadcast', markets: { LAGOS: { price: 500000 } } },
    }},
  },

  'Soundcity Radio': {
    COMMERCIAL_SPOTS: { label: 'Commercial Spots', options: {
      THIRTY_SECONDS: { label: '30 Seconds', markets: { LAGOS: { price: 18200 } } },
    }},
    PRODUCTION: { label: 'Audio Production', options: {
      JINGLE_PRODUCTION: { label: 'Jingle Production',  markets: { LAGOS: { price: 70777 }, OTHER: { price: 28000 } } },
      VOICE_OVER:        { label: 'Additional Voice',    markets: { LAGOS: { price: 35070 } } },
      OUTDOOR_BROADCAST: { label: 'Outdoor Broadcast',  markets: { LAGOS: { price: 285100 }, OTHER: { price: 189000 } } },
      OAP_HYPE:          { label: 'On-Air Hype',        markets: { LAGOS: { price: 134040 } } },
      LIVE_APPEARANCE:   { label: 'Live Appearance',    markets: { LAGOS: { price: 230480 } } },
    }},
  },

  'Urban96 FM': {
    COMMERCIAL_SPOTS: { label: 'Commercial Spots', options: {
      THIRTY_SECONDS: { label: '30 Seconds', markets: { LAGOS: { price: 18200 } } },
    }},
  },

  // ══════════════════════════════════════════
  // PODCASTS
  // ══════════════════════════════════════════

  'I Said What I Said': {
    AUDIO_ADS: { label: 'Audio Ads', options: {
      PRE_ROLL:               { label: 'Pre-Roll (15–30s)',       markets: { PER_EPISODE: { price: 900000  } } },
      MID_ROLL:               { label: 'Mid-Roll (30–60s)',       markets: { PER_EPISODE: { price: 2125000 } } },
      POST_ROLL:              { label: 'Post-Roll',               markets: { PER_EPISODE: { price: 500000  } } },
      FULL_EPISODE_SPONSOR:   { label: 'Full Episode Sponsorship',markets: { PER_EPISODE: { price: 6000000 } } },
    }},
    VIDEO_PODCAST: { label: 'Video Podcast (YouTube)', options: {
      YOUTUBE_MID_ROLL:       { label: 'YouTube Mid-roll Mention',  markets: { PER_VIDEO: { price: 1075000 } } },
      SPONSORED_SEGMENT:      { label: 'Sponsored Video Segment',   markets: { PER_VIDEO: { price: 2750000 } } },
      PRODUCT_PLACEMENT:      { label: 'Product Placement',         markets: { PER_VIDEO: { price: 1650000 } } },
      BRANDED_BACKDROP:       { label: 'Branded Backdrop (monthly)',markets: { MONTHLY:   { price: 1125000 } } },
    }},
    TALENT: { label: 'Talent & Host Inventory', options: {
      HOST_MENTION:           { label: 'Host Mention',             markets: { PER_EPISODE: { price: 800000  } } },
      SOCIAL_CROSS_PROMO:     { label: 'Social Media Cross Promo', markets: { PER_POST:    { price: 1575000 } } },
    }},
  },

  'The Honest Bunch Podcast': {
    AUDIO_ADS: { label: 'Audio Ads', options: {
      PRE_ROLL:             { label: 'Pre-Roll (15–30s)',       markets: { PER_EPISODE: { price: 900000  } } },
      MID_ROLL:             { label: 'Mid-Roll (30–60s)',       markets: { PER_EPISODE: { price: 2125000 } } },
      FULL_EPISODE_SPONSOR: { label: 'Full Episode Sponsorship',markets: { PER_EPISODE: { price: 6000000 } } },
    }},
    VIDEO_PODCAST: { label: 'Video Podcast (YouTube)', options: {
      YOUTUBE_MID_ROLL:  { label: 'YouTube Mid-roll', markets: { PER_VIDEO: { price: 1075000 } } },
      SPONSORED_SEGMENT: { label: 'Sponsored Segment',markets: { PER_VIDEO: { price: 2750000 } } },
    }},
  },

  // Generic podcast template for all other podcasts
  'Tea With Tay':              { AUDIO_ADS: { label: 'Audio Ads', options: { PRE_ROLL: { label: 'Pre-Roll', markets: { PER_EPISODE: { price: 300000 } } }, MID_ROLL: { label: 'Mid-Roll', markets: { PER_EPISODE: { price: 900000 } } }, FULL_EPISODE: { label: 'Full Episode Sponsorship', markets: { PER_EPISODE: { price: 1900000 } } } } } },
  'Menisms':                   { AUDIO_ADS: { label: 'Audio Ads', options: { PRE_ROLL: { label: 'Pre-Roll', markets: { PER_EPISODE: { price: 250000 } } }, MID_ROLL: { label: 'Mid-Roll', markets: { PER_EPISODE: { price: 750000 } } }, FULL_EPISODE: { label: 'Full Episode Sponsorship', markets: { PER_EPISODE: { price: 1500000 } } } } } },
  'WithChude':                 { AUDIO_ADS: { label: 'Audio Ads', options: { PRE_ROLL: { label: 'Pre-Roll', markets: { PER_EPISODE: { price: 300000 } } }, MID_ROLL: { label: 'Mid-Roll', markets: { PER_EPISODE: { price: 900000 } } }, FULL_EPISODE: { label: 'Full Episode Sponsorship', markets: { PER_EPISODE: { price: 1900000 } } } } } },
  'Loose Talk Podcast':        { AUDIO_ADS: { label: 'Audio Ads', options: { PRE_ROLL: { label: 'Pre-Roll', markets: { PER_EPISODE: { price: 400000 } } }, MID_ROLL: { label: 'Mid-Roll', markets: { PER_EPISODE: { price: 1200000 } } }, FULL_EPISODE: { label: 'Full Episode Sponsorship', markets: { PER_EPISODE: { price: 3000000 } } } } } },
  'Bahd and Boujee Podcast':   { AUDIO_ADS: { label: 'Audio Ads', options: { PRE_ROLL: { label: 'Pre-Roll', markets: { PER_EPISODE: { price: 250000 } } }, MID_ROLL: { label: 'Mid-Roll', markets: { PER_EPISODE: { price: 750000 } } }, FULL_EPISODE: { label: 'Full Episode Sponsorship', markets: { PER_EPISODE: { price: 1500000 } } } } } },

  // ══════════════════════════════════════════
  // OOH
  // ══════════════════════════════════════════

  'XL Billboards': {
    STATIC_BILLBOARDS: { label: 'Static Billboards (monthly)', options: {
      SMALL_SECONDARY:  { label: 'Small Billboard — Secondary Roads',  markets: { LAGOS: { price: 550000  }, ABUJA: { price: 400000 }, PORT_HARCOURT: { price: 350000 } } },
      MEDIUM_SECONDARY: { label: 'Medium Billboard — Secondary Roads', markets: { LAGOS: { price: 1150000 }, ABUJA: { price: 800000 }, PORT_HARCOURT: { price: 700000 } } },
      LARGE_SECONDARY:  { label: 'Large Billboard — Secondary Roads',  markets: { LAGOS: { price: 2250000 }, ABUJA: { price: 1500000 } } },
      SMALL_PRIME:      { label: 'Small Billboard — Prime Highway',    markets: { LAGOS: { price: 1500000 }, ABUJA: { price: 1000000 } } },
      MEDIUM_PRIME:     { label: 'Medium Billboard — Prime Highway',   markets: { LAGOS: { price: 3500000 }, ABUJA: { price: 2500000 } } },
      LARGE_PRIME:      { label: 'Large Billboard — Prime Highway',    markets: { LAGOS: { price: 10000000 } } },
    }},
    ROOFTOP: { label: 'Rooftop Boards (monthly)', options: {
      ROOFTOP_STANDARD: { label: 'Standard Rooftop', markets: { LAGOS: { price: 2750000  } } },
      ROOFTOP_PREMIUM:  { label: 'Premium Rooftop',  markets: { LAGOS: { price: 12500000 } } },
    }},
  },

  'Alliance Media': {
    STATIC_BILLBOARDS: { label: 'Static Billboards (monthly)', options: {
      SMALL_SECONDARY:  { label: 'Small Billboard',  markets: { LAGOS: { price: 550000  }, ABUJA: { price: 400000 }, NATIONWIDE: { price: 350000 } } },
      MEDIUM_SECONDARY: { label: 'Medium Billboard', markets: { LAGOS: { price: 1150000 }, ABUJA: { price: 800000 }, NATIONWIDE: { price: 700000 } } },
      LARGE_PRIME:      { label: 'Large Billboard — Prime Highway', markets: { LAGOS: { price: 10000000 } } },
    }},
    AIRPORT: { label: 'Airport Advertising (monthly)', options: {
      ARRIVAL_HALL_LED:  { label: 'Arrival Hall LED',       markets: { MURTALA_MUHAMMED: { price: 7500000  }, ABUJA_NNAMDI: { price: 5000000  } } },
      DEPARTURE_HALL:    { label: 'Departure Hall Branding',markets: { MURTALA_MUHAMMED: { price: 12500000 }, ABUJA_NNAMDI: { price: 8000000  } } },
      AIRPORT_GANTRY:    { label: 'Airport Gantry',         markets: { NATIONAL: { price: 30000000 } } },
    }},
    DIGITAL_LED: { label: 'Digital LED Boards (monthly)', options: {
      TEN_SECS_STD:     { label: '10s Standard LED',  markets: { NATIONAL: { price: 1400000 } } },
      FIFTEEN_SECS_STD: { label: '15s Standard LED',  markets: { NATIONAL: { price: 2500000 } } },
      THIRTY_SECS_STD:  { label: '30s Standard LED',  markets: { NATIONAL: { price: 5000000 } } },
      TEN_SECS_PREM:    { label: '10s Premium LED',   markets: { NATIONAL: { price: 3500000 } } },
      FIFTEEN_SECS_PREM:{ label: '15s Premium LED',   markets: { NATIONAL: { price: 6000000 } } },
      THIRTY_SECS_PREM: { label: '30s Premium LED',   markets: { NATIONAL: { price: 11000000 } } },
    }},
  },

  'JCDecaux Nigeria': {
    AIRPORT: { label: 'Airport Advertising (monthly)', options: {
      ARRIVAL_HALL_LED: { label: 'Arrival Hall LED',       markets: { MURTALA_MUHAMMED: { price: 7500000  }, ABUJA_NNAMDI: { price: 5000000  } } },
      DEPARTURE_HALL:   { label: 'Departure Hall Branding',markets: { MURTALA_MUHAMMED: { price: 12500000 }, ABUJA_NNAMDI: { price: 8000000  } } },
      CONVEYOR_BELT:    { label: 'Conveyor Belt Branding', markets: { NATIONAL: { price: 5000000  } } },
      AIRPORT_GANTRY:   { label: 'Airport Gantry',         markets: { NATIONAL: { price: 30000000 } } },
    }},
    MALL_RETAIL: { label: 'Mall & Retail Screens (monthly)', options: {
      STANDARD_MALL: { label: 'Standard Mall Screen', markets: { NATIONAL: { price: 1500000 } } },
      PREMIUM_MALL:  { label: 'Premium Mall Screen',  markets: { NATIONAL: { price: 5500000 } } },
      ESCALATOR:     { label: 'Escalator Branding',   markets: { NATIONAL: { price: 4000000 } } },
      FOOD_COURT:    { label: 'Food Court Branding',  markets: { NATIONAL: { price: 3000000 } } },
    }},
  },

  'Outdoors.ng': {
    STATIC_BILLBOARDS: { label: 'Static Billboards (monthly)', options: {
      SMALL:  { label: 'Small Billboard',  markets: { LAGOS: { price: 550000 }, ABUJA: { price: 400000 }, PORT_HARCOURT: { price: 350000 }, KANO: { price: 300000 }, ENUGU: { price: 280000 }, ONITSHA: { price: 280000 }, KADUNA: { price: 290000 } } },
      MEDIUM: { label: 'Medium Billboard', markets: { LAGOS: { price: 1150000 }, ABUJA: { price: 800000 }, PORT_HARCOURT: { price: 700000 }, KANO: { price: 600000 } } },
      LARGE:  { label: 'Large Billboard',  markets: { LAGOS: { price: 2250000 }, ABUJA: { price: 1500000 }, PORT_HARCOURT: { price: 1200000 } } },
    }},
    DIGITAL_LED: { label: 'Digital LED (monthly)', options: {
      TEN_SECS:    { label: '10s Rotation', markets: { LAGOS: { price: 1400000 }, ABUJA: { price: 1000000 } } },
      FIFTEEN_SECS:{ label: '15s Rotation', markets: { LAGOS: { price: 2500000 }, ABUJA: { price: 1800000 } } },
      THIRTY_SECS: { label: '30s Rotation', markets: { LAGOS: { price: 5000000 }, ABUJA: { price: 3500000 } } },
    }},
  },

  'JMT Communications': {
    TRANSIT: { label: 'BRT & Transit Media', options: {
      FULL_BUS_WRAP:    { label: 'Full Bus Wrap',    markets: { LAGOS: { price: 4000000 } } },
      HALF_BUS_WRAP:    { label: 'Half Bus Wrap',    markets: { LAGOS: { price: 1900000 } } },
      INTERIOR_BUS:     { label: 'Interior Branding',markets: { LAGOS: { price: 625000  } } },
      BRT_SHELTER:      { label: 'BRT Shelter Branding (monthly)', markets: { LAGOS: { price: 1750000 } } },
    }},
  },

  // ══════════════════════════════════════════
  // PRINT MEDIA
  // ══════════════════════════════════════════

  'Punch Newspapers': {
    DISPLAY_ADS: { label: 'Display Advertisements', options: {
      FULL_PAGE_COLOUR: { label: 'Full Page Colour',       markets: { NATIONAL: { price: 3750000  } } },
      FULL_PAGE_BW:     { label: 'Full Page Black & White',markets: { NATIONAL: { price: 1650000  } } },
      HALF_PAGE_COLOUR: { label: 'Half Page Colour',       markets: { NATIONAL: { price: 2150000  } } },
      HALF_PAGE_BW:     { label: 'Half Page Black & White',markets: { NATIONAL: { price: 950000   } } },
      QUARTER_PAGE:     { label: 'Quarter Page Colour',    markets: { NATIONAL: { price: 750000   } } },
      FRONT_PAGE_SOLUS: { label: 'Front Page Solus',       markets: { NATIONAL: { price: 12500000 } } },
      BACK_PAGE:        { label: 'Back Page',              markets: { NATIONAL: { price: 6500000  } } },
      INSIDE_COVER:     { label: 'Inside Cover',           markets: { NATIONAL: { price: 5250000  } } },
    }},
    INSERTS: { label: 'Inserts & Special Positions', options: {
      NEWSPAPER_INSERT:  { label: 'Newspaper Insert',    markets: { NATIONAL: { price: 2750000  } } },
      WRAP_AROUND:       { label: 'Wrap Around Jacket',  markets: { NATIONAL: { price: 15000000 } } },
      BELLY_BAND:        { label: 'Belly Band',          markets: { NATIONAL: { price: 6000000  } } },
    }},
    DIGITAL: { label: 'Digital / Online Assets', options: {
      WEBSITE_BANNER:    { label: 'Website Banner (monthly)',  markets: { NATIONAL: { price: 2600000 } } },
      HOMEPAGE_TAKEOVER: { label: 'Homepage Takeover',         markets: { NATIONAL: { price: 5500000 } } },
      SPONSORED_ARTICLE: { label: 'Sponsored Article',         markets: { NATIONAL: { price: 2625000 } } },
    }},
  },

  'BusinessDay': {
    DISPLAY_ADS: { label: 'Display Advertisements', options: {
      FULL_PAGE_COLOUR:  { label: 'Full Page Colour',   markets: { NATIONAL: { price: 5000000 } } },
      FULL_PAGE_BW:      { label: 'Full Page B&W',      markets: { NATIONAL: { price: 2500000 } } },
      HALF_PAGE_COLOUR:  { label: 'Half Page Colour',   markets: { NATIONAL: { price: 2500000 } } },
      EXECUTIVE_FULL:    { label: 'Executive Full Page', markets: { NATIONAL: { price: 5000000 } } },
      FRONT_PAGE_SOLUS:  { label: 'Front Page Solus',   markets: { NATIONAL: { price: 12500000 } } },
    }},
    EDITORIAL: { label: 'Editorial Placements', options: {
      CEO_INTERVIEW:        { label: 'CEO Interview Placement',   markets: { NATIONAL: { price: 5750000  } } },
      INDUSTRY_REPORT:      { label: 'Industry Report Sponsorship',markets: { NATIONAL: { price: 9000000  } } },
      SPONSORED_ARTICLE:    { label: 'Sponsored Article',          markets: { NATIONAL: { price: 2625000  } } },
    }},
    DIGITAL: { label: 'Digital Assets', options: {
      WEBSITE_BANNER:    { label: 'Website Banner (monthly)', markets: { NATIONAL: { price: 2600000 } } },
      HOMEPAGE_TAKEOVER: { label: 'Homepage Takeover',        markets: { NATIONAL: { price: 5500000 } } },
      NEWSLETTER:        { label: 'Newsletter Sponsorship',   markets: { NATIONAL: { price: 1650000 } } },
    }},
  },

  // ══════════════════════════════════════════
  // INFLUENCERS
  // ══════════════════════════════════════════

  'Toke Makinwa': {
    SOCIAL_MEDIA: { label: 'Social Media', options: {
      INSTAGRAM_POST:  { label: 'Instagram Post',  markets: { PER_POST:  { price: 2750000  } } },
      INSTAGRAM_REEL:  { label: 'Instagram Reel',  markets: { PER_REEL:  { price: 2750000  } } },
      INSTAGRAM_STORY: { label: 'Instagram Story', markets: { PER_STORY: { price: 1075000  } } },
      TIKTOK_VIDEO:    { label: 'TikTok Video',    markets: { PER_VIDEO: { price: 2650000  } } },
      TWITTER_X:       { label: 'Twitter/X Campaign', markets: { PER_POST: { price: 1625000 } } },
    }},
    YOUTUBE: { label: 'YouTube & Video', options: {
      YOUTUBE_INTEGRATION: { label: 'YouTube Integration',    markets: { PER_VIDEO:   { price: 5500000  } } },
      YOUTUBE_MENTION:     { label: 'YouTube Mid-roll Mention',markets: { PER_VIDEO:  { price: 800000   } } },
    }},
    BRAND_DEALS: { label: 'Brand Deals', options: {
      CAMPAIGN_APPEARANCE: { label: 'Campaign Appearance',    markets: { PER_CAMPAIGN: { price: 5000000  } } },
      EVENT_HOSTING:       { label: 'Event Hosting',          markets: { PER_EVENT:    { price: 2000000  } } },
      AMBASSADOR_ANNUAL:   { label: 'Brand Ambassador (annual)', markets: { ANNUAL:    { price: 20000000 } } },
    }},
  },

  'Mr Macaroni': {
    SOCIAL_MEDIA: { label: 'Social Media', options: {
      INSTAGRAM_POST:  { label: 'Instagram Post',  markets: { PER_POST:  { price: 2750000 } } },
      INSTAGRAM_REEL:  { label: 'Instagram Reel',  markets: { PER_REEL:  { price: 2750000 } } },
      TIKTOK_VIDEO:    { label: 'TikTok Video',    markets: { PER_VIDEO: { price: 2650000 } } },
    }},
    VIDEO_CONTENT: { label: 'Video Content', options: {
      COMEDY_SKIT:         { label: 'Comedy Skit Integration', markets: { PER_SKIT:   { price: 10000000 } } },
      YOUTUBE_INTEGRATION: { label: 'YouTube Integration',     markets: { PER_VIDEO:  { price: 5500000  } } },
    }},
    BRAND_DEALS: { label: 'Brand Deals', options: {
      CAMPAIGN_APPEARANCE: { label: 'Campaign Appearance', markets: { PER_CAMPAIGN: { price: 5000000  } } },
      AMBASSADOR_ANNUAL:   { label: 'Brand Ambassador (annual)', markets: { ANNUAL:  { price: 20000000 } } },
    }},
  },

  'Broda Shaggi': {
    SOCIAL_MEDIA: { label: 'Social Media', options: {
      INSTAGRAM_POST:  { label: 'Instagram Post',  markets: { PER_POST:  { price: 2750000 } } },
      TIKTOK_VIDEO:    { label: 'TikTok Video',    markets: { PER_VIDEO: { price: 2650000 } } },
    }},
    VIDEO_CONTENT: { label: 'Video Content', options: {
      COMEDY_SKIT:         { label: 'Comedy Skit Integration', markets: { PER_SKIT:  { price: 10000000 } } },
      YOUTUBE_INTEGRATION: { label: 'YouTube Integration',     markets: { PER_VIDEO: { price: 5500000  } } },
    }},
    BRAND_DEALS: { label: 'Brand Deals', options: {
      CAMPAIGN_APPEARANCE: { label: 'Campaign Appearance', markets: { PER_CAMPAIGN: { price: 5000000 } } },
    }},
  },
};

// Shared simple inventory for providers not listed above
const DEFAULT_INVENTORY = {
  TELEVISION: {
    COMMERCIAL_SPOTS: { label: 'Commercial Spots', options: {
      PRIME_30S:   { label: '30s Prime Time',  markets: { NATIONAL: { price: 250000 } } },
      OFFPEAK_30S: { label: '30s Off-Peak',    markets: { NATIONAL: { price: 150000 } } },
    }},
    SPONSORSHIP: { label: 'Sponsorships', options: {
      PROGRAMME_SPONSORSHIP: { label: 'Programme Sponsorship', markets: { NATIONAL: { price: 3000000 } } },
    }},
  },
  RADIO_AUDIO: {
    COMMERCIAL_SPOTS: { label: 'Commercial Spots', options: {
      PEAK_30S:    { label: '30s Peak',     markets: { LOCAL: { price: 15000 } } },
      OFFPEAK_30S: { label: '30s Off-Peak', markets: { LOCAL: { price: 8000  } } },
    }},
    PROGRAMME_SPONSORSHIPS: { label: 'Programme Sponsorships', options: {
      MORNING_SHOW: { label: 'Morning Show', markets: { LOCAL: { price: 150000 } } },
    }},
  },
  PODCASTS: {
    AUDIO_ADS: { label: 'Audio Ads', options: {
      PRE_ROLL:  { label: 'Pre-Roll',             markets: { PER_EPISODE: { price: 87500  } } },
      MID_ROLL:  { label: 'Mid-Roll',             markets: { PER_EPISODE: { price: 175000 } } },
      FULL_EP:   { label: 'Episode Sponsorship',  markets: { PER_EPISODE: { price: 625000 } } },
    }},
  },
  OUT_OF_HOME: {
    STATIC_BILLBOARDS: { label: 'Static Billboards (monthly)', options: {
      SMALL:  { label: 'Small Billboard',  markets: { LOCAL: { price: 550000  } } },
      MEDIUM: { label: 'Medium Billboard', markets: { LOCAL: { price: 1150000 } } },
      LARGE:  { label: 'Large Billboard',  markets: { LOCAL: { price: 2250000 } } },
    }},
  },
  PRINT_MEDIA: {
    DISPLAY_ADS: { label: 'Display Ads', options: {
      FULL_PAGE:  { label: 'Full Page Colour',  markets: { NATIONAL: { price: 1500000 } } },
      HALF_PAGE:  { label: 'Half Page Colour',  markets: { NATIONAL: { price: 800000  } } },
    }},
  },
  INFLUENCERS: {
    SOCIAL_MEDIA: { label: 'Social Media', options: {
      INSTAGRAM_POST:  { label: 'Instagram Post',  markets: { PER_POST:  { price: 450000 } } },
      INSTAGRAM_STORY: { label: 'Instagram Story', markets: { PER_STORY: { price: 175000 } } },
      TIKTOK_VIDEO:    { label: 'TikTok Video',    markets: { PER_VIDEO: { price: 390000 } } },
    }},
  },
};


// ── DynamoDB direct via AWS CLI (bypasses API auth)
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function populateInventory() {
  console.log('\n🚀 Scanning BrandCastaMedia from DynamoDB directly...\n');

  let mediaList = [];
  try {
    const scanParams = JSON.stringify({
      TableName: 'BrandCastaMedia',
      ProjectionExpression: 'mediaId, #n, category',
      ExpressionAttributeNames: { '#n': 'name' }
    });
    const paramFile = '/tmp/scan_params.json';
    fs.writeFileSync(paramFile, scanParams);
    const raw = execSync(
      `aws dynamodb scan --cli-input-json file://${paramFile} --region us-east-1 --output json`,
      { encoding: 'utf8' }
    );
    fs.unlinkSync(paramFile);
    const data = JSON.parse(raw);
    mediaList = data.Items.map(item => ({
      mediaId:  item.mediaId.S,
      name:     item.name.S,
      category: item.category?.S || '',
    }));
  } catch (e) {
    console.error('❌ Failed to scan DynamoDB:', e.message);
    process.exit(1);
  }

  console.log(`Found ${mediaList.length} providers. Populating inventory...\n`);

  let success = 0, skipped = 0, failed = 0;

  for (const m of mediaList) {
    const { name, category, mediaId } = m;
    const inventory = PROVIDER_INVENTORY[name] || DEFAULT_INVENTORY[category] || {};

    if (!Object.keys(inventory).length) {
      console.log(`  ⏭  ${name} — no inventory template`);
      skipped++;
      continue;
    }

    try {
      const tmpFile = `/tmp/inv_attr.json`;
      fs.writeFileSync(tmpFile, JSON.stringify({ ':inv': { S: JSON.stringify(inventory) } }));
      const keyFile = `/tmp/inv_key.json`;
      fs.writeFileSync(keyFile, JSON.stringify({ mediaId: { S: mediaId } }));
      execSync(
        `aws dynamodb update-item --table-name BrandCastaMedia --key file://${keyFile} --update-expression "SET inventory = :inv" --expression-attribute-values file://${tmpFile} --region us-east-1`,
        { encoding: 'utf8' }
      );
      fs.unlinkSync(tmpFile);
      fs.unlinkSync(keyFile);
      console.log(`  ✅ ${name}`);
      success++;
    } catch (e) {
      console.error(`  ❌ ${name}: ${e.message?.slice(0, 100)}`);
      failed++;
    }
  }

  console.log(`\n──────────────────────────────`);
  console.log(`✅ Updated: ${success}`);
  if (skipped) console.log(`⏭  Skipped: ${skipped}`);
  if (failed)  console.log(`❌ Failed:  ${failed}`);
  console.log(`──────────────────────────────\n`);
}

populateInventory();
