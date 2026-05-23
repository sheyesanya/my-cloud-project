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
      OFFPEAK_10S:  { label: '10s Off-Peak',  markets: { NATIONAL: { price: 180000  } } },
      OFFPEAK_15S:  { label: '15s Off-Peak',  markets: { NATIONAL: { price: 250000  } } },
      OFFPEAK_30S:  { label: '30s Off-Peak',  markets: { NATIONAL: { price: 450000  } } },
      OFFPEAK_45S:  { label: '45s Off-Peak',  markets: { NATIONAL: { price: 650000  } } },
      OFFPEAK_60S:  { label: '60s Off-Peak',  markets: { NATIONAL: { price: 850000  } } },
      PRIME_10S:    { label: '10s Prime Time', markets: { NATIONAL: { price: 300000  } } },
      PRIME_15S:    { label: '15s Prime Time', markets: { NATIONAL: { price: 400000  } } },
      PRIME_30S:    { label: '30s Prime Time', markets: { NATIONAL: { price: 750000  } } },
      PRIME_45S:    { label: '45s Prime Time', markets: { NATIONAL: { price: 950000  } } },
      PRIME_60S:    { label: '60s Prime Time', markets: { NATIONAL: { price: 1200000 } } },
    }},
    SPONSORSHIP: { label: 'Sponsorship & Brand Integration', options: {
      PROGRAMME_SPONSORSHIP: { label: 'Programme Sponsorship',         markets: { NATIONAL: { price: 12500000 } } },
      NEWS_SPONSORSHIP:      { label: 'News Sponsorship',              markets: { NATIONAL: { price: 16500000 } } },
      LOWER_THIRD:           { label: 'Lower Third / Scroll (weekly)', markets: { NATIONAL: { price: 650000   } } },
      PRESENTER_MENTION:     { label: 'Presenter Mention',             markets: { NATIONAL: { price: 1250000  } } },
      BRAND_INTEGRATION:     { label: 'Brand Integration (per ep)',    markets: { NATIONAL: { price: 5000000  } } },
    }},
    BRANDED_CONTENT: { label: 'Branded Content & Productions', options: {
      BRANDED_DOCUMENTARY:  { label: 'Branded Documentary (30 mins)', markets: { NATIONAL: { price: 25000000 } } },
      BRANDED_INTERVIEW:    { label: 'Branded Interview Segment',     markets: { NATIONAL: { price: 8000000  } } },
      PRODUCT_PLACEMENT:    { label: 'Product Placement (per ep)',    markets: { NATIONAL: { price: 3500000  } } },
      LIVE_EVENT_COVERAGE:  { label: 'Live Event Coverage',           markets: { NATIONAL: { price: 15000000 } } },
    }},
    DIGITAL_EXTENSION: { label: 'Digital & Social Extension', options: {
      WEBSITE_BANNER:      { label: 'Website Banner (monthly)',    markets: { NATIONAL: { price: 500000  } } },
      SOCIAL_AMPLIFICATION:{ label: 'Social Media Amplification', markets: { NATIONAL: { price: 750000  } } },
      PODCAST_PROMO:       { label: 'Podcast Cross-Promo',         markets: { NATIONAL: { price: 400000  } } },
    }},
  },



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
      OFFPEAK_15S:  { label: '15s Off-Peak',   markets: { LAGOS: { price: 7380  }, ABUJA: { price: 4633  } } },
      OFFPEAK_30S:  { label: '30s Off-Peak',   markets: { LAGOS: { price: 12300 }, ABUJA: { price: 7722  } } },
      OFFPEAK_60S:  { label: '60s Off-Peak',   markets: { LAGOS: { price: 22140 }, ABUJA: { price: 13900 } } },
      PRIME_15S:    { label: '15s Prime Time', markets: { LAGOS: { price: 18450 }, ABUJA: { price: 11583 } } },
      PRIME_30S:    { label: '30s Prime Time', markets: { LAGOS: { price: 24600 }, ABUJA: { price: 15444 } } },
      PRIME_60S:    { label: '60s Prime Time', markets: { LAGOS: { price: 36900 }, ABUJA: { price: 23166 } } },
    }},
    PROGRAMME_SPONSORSHIPS: { label: 'Programme Sponsorships', options: {
      PROGRAMME_SPONSORSHIP: { label: 'Programme Sponsorship', markets: { LAGOS: { price: 500000 }, ABUJA: { price: 173710 } } },
      NEWS_MENTION:          { label: 'News Mention',          markets: { LAGOS: { price: 100000 }, ABUJA: { price: 40000  } } },
      MORNING_DRIVE_SPONSOR: { label: 'Morning Drive Sponsorship', markets: { LAGOS: { price: 750000 }, ABUJA: { price: 350000 } } },
      TRAFFIC_UPDATE_SPONSOR:{ label: 'Traffic Update Sponsorship', markets: { LAGOS: { price: 200000 }, ABUJA: { price: 100000 } } },
    }},
    PRODUCTION: { label: 'Audio Production', options: {
      JINGLE_PRODUCTION: { label: 'Jingle Production',  markets: { LAGOS: { price: 150000 }, ABUJA: { price: 60000 } } },
      VOICE_OVER:        { label: 'Voice Over',          markets: { LAGOS: { price: 75000  }, ABUJA: { price: 35000 } } },
      OUTDOOR_BROADCAST: { label: 'Outdoor Broadcast',  markets: { LAGOS: { price: 500000 } } },
      OAP_HYPE:          { label: 'On-Air Hype',        markets: { LAGOS: { price: 180000 }, ABUJA: { price: 100000 } } },
    }},
    DIGITAL: { label: 'Digital & Streaming', options: {
      ONLINE_STREAM_AD: { label: 'Online Stream Ad (per week)', markets: { LAGOS: { price: 80000 }, ABUJA: { price: 50000 } } },
      SOCIAL_MENTION:   { label: 'Social Media Mention',        markets: { LAGOS: { price: 60000 }, ABUJA: { price: 40000 } } },
      WEBSITE_BANNER:   { label: 'Website Banner (monthly)',    markets: { LAGOS: { price: 150000 } } },
    }},
  },

  'Naija FM': {
    COMMERCIAL_SPOTS: { label: 'Commercial Spots', options: {
      OFFPEAK_15S:  { label: '15s Off-Peak',   markets: { LAGOS: { price: 5753  } } },
      OFFPEAK_30S:  { label: '30s Off-Peak',   markets: { LAGOS: { price: 9588  } } },
      OFFPEAK_60S:  { label: '60s Off-Peak',   markets: { LAGOS: { price: 17258 } } },
      PREMIUM_30S:  { label: '30s Premium',    markets: { LAGOS: { price: 11797 } } },
      SUPER_PREMIUM_30S: { label: '30s Super Premium', markets: { LAGOS: { price: 13603 } } },
      PRIME_60S:    { label: '60s Prime Time', markets: { LAGOS: { price: 24486 } } },
    }},
    PROGRAMME_SPONSORSHIPS: { label: 'Programme Sponsorships', options: {
      PROGRAMME_SPONSORSHIP: { label: 'Programme Sponsorship',    markets: { LAGOS: { price: 400000 } } },
      NEWS_MENTION:          { label: 'News Mention',             markets: { LAGOS: { price: 100000 } } },
      MORNING_DRIVE_SPONSOR: { label: 'Morning Drive Sponsorship',markets: { LAGOS: { price: 600000 } } },
      TRAFFIC_UPDATE:        { label: 'Traffic Update Sponsorship',markets: { LAGOS: { price: 180000 } } },
    }},
    PRODUCTION: { label: 'Audio Production', options: {
      JINGLE_PRODUCTION: { label: 'Jingle Production', markets: { LAGOS: { price: 150000 } } },
      VOICE_OVER:        { label: 'Voice Over',         markets: { LAGOS: { price: 65000  } } },
      OUTDOOR_BROADCAST: { label: 'Outdoor Broadcast', markets: { LAGOS: { price: 500000 } } },
      OAP_HYPE:          { label: 'On-Air Hype',       markets: { LAGOS: { price: 160000 } } },
    }},
    DIGITAL: { label: 'Digital & Streaming', options: {
      ONLINE_STREAM_AD: { label: 'Online Stream Ad (per week)', markets: { LAGOS: { price: 70000 } } },
      SOCIAL_MENTION:   { label: 'Social Media Mention',        markets: { LAGOS: { price: 50000 } } },
      WEBSITE_BANNER:   { label: 'Website Banner (monthly)',    markets: { LAGOS: { price: 120000 } } },
    }},
  },

  'Lagos Talks 91.3 FM': {
    COMMERCIAL_SPOTS: { label: 'Commercial Spots', options: {
      OFFPEAK_15S:  { label: '15s Off-Peak',   markets: { LAGOS: { price: 4506  } } },
      OFFPEAK_30S:  { label: '30s Off-Peak',   markets: { LAGOS: { price: 7510  } } },
      OFFPEAK_60S:  { label: '60s Off-Peak',   markets: { LAGOS: { price: 13518 } } },
      PREMIUM_30S:  { label: '30s Premium',    markets: { LAGOS: { price: 9570  } } },
      SUPER_PREMIUM_30S: { label: '30s Super Premium', markets: { LAGOS: { price: 10962 } } },
      PRIME_60S:    { label: '60s Prime Time', markets: { LAGOS: { price: 21924 } } },
    }},
    PROGRAMME_SPONSORSHIPS: { label: 'Programme Sponsorships', options: {
      PROGRAMME_SPONSORSHIP:  { label: 'Programme Sponsorship',     markets: { LAGOS: { price: 500000 } } },
      NEWS_MENTION:           { label: 'News Mention',              markets: { LAGOS: { price: 100000 } } },
      MORNING_DRIVE_SPONSOR:  { label: 'Morning Drive Sponsorship', markets: { LAGOS: { price: 650000 } } },
      TRAFFIC_UPDATE:         { label: 'Traffic Update Sponsorship',markets: { LAGOS: { price: 180000 } } },
    }},
    PRODUCTION: { label: 'Audio Production', options: {
      JINGLE_PRODUCTION: { label: 'Jingle Production', markets: { LAGOS: { price: 150000 } } },
      VOICE_OVER:        { label: 'Voice Over',         markets: { LAGOS: { price: 65000  } } },
      OUTDOOR_BROADCAST: { label: 'Outdoor Broadcast', markets: { LAGOS: { price: 500000 } } },
      OAP_HYPE:          { label: 'On-Air Hype',       markets: { LAGOS: { price: 145000 } } },
    }},
    DIGITAL: { label: 'Digital & Streaming', options: {
      ONLINE_STREAM_AD: { label: 'Online Stream Ad (per week)', markets: { LAGOS: { price: 65000 } } },
      SOCIAL_MENTION:   { label: 'Social Media Mention',        markets: { LAGOS: { price: 45000 } } },
      WEBSITE_BANNER:   { label: 'Website Banner (monthly)',    markets: { LAGOS: { price: 110000 } } },
    }},
  },

  'Soundcity Radio': {
    COMMERCIAL_SPOTS: { label: 'Commercial Spots', options: {
      OFFPEAK_15S:  { label: '15s Off-Peak',    markets: { LAGOS: { price: 9100  }, ABUJA: { price: 7000  } } },
      OFFPEAK_30S:  { label: '30s Off-Peak',    markets: { LAGOS: { price: 18200 }, ABUJA: { price: 14000 } } },
      OFFPEAK_60S:  { label: '60s Off-Peak',    markets: { LAGOS: { price: 32760 }, ABUJA: { price: 25200 } } },
      PRIME_15S:    { label: '15s Prime Time',  markets: { LAGOS: { price: 13650 }, ABUJA: { price: 10500 } } },
      PRIME_30S:    { label: '30s Prime Time',  markets: { LAGOS: { price: 27300 }, ABUJA: { price: 21000 } } },
      PRIME_60S:    { label: '60s Prime Time',  markets: { LAGOS: { price: 49140 }, ABUJA: { price: 37800 } } },
    }},
    SPONSORSHIPS: { label: 'Programme Sponsorships', options: {
      SHOW_SPONSOR:    { label: 'Show Sponsorship (monthly)',    markets: { LAGOS: { price: 450000  } } },
      NEWS_SPONSOR:    { label: 'News Bulletin Sponsorship',     markets: { LAGOS: { price: 280000  } } },
      TRAFFIC_SPONSOR: { label: 'Traffic Update Sponsorship',    markets: { LAGOS: { price: 180000  } } },
      MORNING_DRIVE:   { label: 'Morning Drive Sponsorship',     markets: { LAGOS: { price: 650000  } } },
    }},
    PRODUCTION: { label: 'Audio Production', options: {
      JINGLE_PRODUCTION: { label: 'Jingle Production',  markets: { LAGOS: { price: 70777 }, OTHER: { price: 28000 } } },
      VOICE_OVER:        { label: 'Additional Voice',    markets: { LAGOS: { price: 35070 } } },
      OUTDOOR_BROADCAST: { label: 'Outdoor Broadcast',  markets: { LAGOS: { price: 285100 }, OTHER: { price: 189000 } } },
      OAP_HYPE:          { label: 'On-Air Hype',        markets: { LAGOS: { price: 134040 } } },
      LIVE_APPEARANCE:   { label: 'Live Appearance',    markets: { LAGOS: { price: 230480 } } },
    }},
    DIGITAL: { label: 'Digital & Streaming', options: {
      ONLINE_STREAM_AD: { label: 'Online Stream Ad (per week)',  markets: { LAGOS: { price: 65000  } } },
      PODCAST_PROMO:    { label: 'Podcast Episode Promo',        markets: { LAGOS: { price: 45000  } } },
      SOCIAL_MENTION:   { label: 'Social Media Mention',         markets: { LAGOS: { price: 50000  } } },
      WEBSITE_BANNER:   { label: 'Website Banner (monthly)',     markets: { LAGOS: { price: 120000 } } },
    }},
  },

  'Urban96 FM': {
    COMMERCIAL_SPOTS: { label: 'Commercial Spots', options: {
      FIFTEEN_SECONDS: { label: '15 Seconds Off-Peak',  markets: { LAGOS: { price: 12000 } } },
      THIRTY_SECONDS:  { label: '30 Seconds Off-Peak',  markets: { LAGOS: { price: 18200 } } },
      SIXTY_SECONDS:   { label: '60 Seconds Off-Peak',  markets: { LAGOS: { price: 32000 } } },
      PRIME_30S:       { label: '30 Seconds Prime Time',markets: { LAGOS: { price: 27300 } } },
      PRIME_60S:       { label: '60 Seconds Prime Time',markets: { LAGOS: { price: 48000 } } },
    }},
    SPONSORSHIPS: { label: 'Programme Sponsorships', options: {
      SHOW_SPONSOR:    { label: 'Show Sponsorship (monthly)', markets: { LAGOS: { price: 350000 } } },
      TRAFFIC_SPONSOR: { label: 'Traffic Update Sponsorship', markets: { LAGOS: { price: 180000 } } },
      PROMO_MENTION:   { label: 'Promo Mention (per week)',   markets: { LAGOS: { price: 85000  } } },
    }},
    DIGITAL: { label: 'Digital & Streaming', options: {
      ONLINE_STREAM:   { label: 'Online Stream Ad (per week)',  markets: { LAGOS: { price: 65000  } } },
      SOCIAL_MENTION:  { label: 'Social Media Mention',         markets: { LAGOS: { price: 45000  } } },
    }},
  },

  // ══════════════════════════════════════════
  // PODCASTS
  // ══════════════════════════════════════════

  'I Said What I Said': {
    AUDIO_ADS: { label: 'Audio Ads', options: {
      PRE_ROLL_15S:           { label: 'Pre-Roll (15s)',          markets: { PER_EPISODE: { price: 500000  } } },
      PRE_ROLL_30S:           { label: 'Pre-Roll (30s)',          markets: { PER_EPISODE: { price: 900000  } } },
      MID_ROLL_60S:           { label: 'Mid-Roll (60s)',          markets: { PER_EPISODE: { price: 2125000 } } },
      POST_ROLL:              { label: 'Post-Roll',               markets: { PER_EPISODE: { price: 500000  } } },
      FULL_EPISODE_SPONSOR:   { label: 'Full Episode Sponsorship',markets: { PER_EPISODE: { price: 6000000 } } },
      SERIES_SPONSORSHIP:     { label: 'Series Sponsorship (10 eps)', markets: { PER_CAMPAIGN: { price: 15000000 } } },
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
    DIGITAL_SOCIAL: { label: 'Digital & Social', options: {
      INSTAGRAM_POST:   { label: 'Instagram Feed Post',   markets: { PER_POST:  { price: 1200000 } } },
      INSTAGRAM_REEL:   { label: 'Instagram Reel',        markets: { PER_REEL:  { price: 1500000 } } },
      INSTAGRAM_STORY:  { label: 'Instagram Story',       markets: { PER_STORY: { price: 500000  } } },
      TIKTOK_VIDEO:     { label: 'TikTok Video',          markets: { PER_VIDEO: { price: 1200000 } } },
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
  'Tea With Tay': {
    PODCAST_ADS: { label: 'Podcast Advertising', options: {
      PRE_ROLL_30S:    { label: 'Pre-Roll (30s)',              markets: { PER_EPISODE: { price: 190000  } } },
      MID_ROLL_60S:    { label: 'Mid-Roll (60s)',              markets: { PER_EPISODE: { price: 380000  } } },
      POST_ROLL_30S:   { label: 'Post-Roll (30s)',             markets: { PER_EPISODE: { price: 126666  } } },
      EPISODE_SPONSOR: { label: 'Full Episode Sponsorship',   markets: { PER_EPISODE: { price: 570000  } } },
      SERIES_SPONSOR:  { label: 'Series Sponsorship (10 eps)',markets: { PER_CAMPAIGN: { price: 1400000 } } },
    }},
    SOCIAL_INTEGRATION: { label: 'Social Media Integration', options: {
      IG_STORY: { label: 'Instagram Story Feature', markets: { PER_POST: { price: 100000 } } },
      IG_REEL:  { label: 'Instagram Reel Feature',  markets: { PER_POST: { price: 200000 } } },
      IG_POST:  { label: 'Instagram Feed Post',     markets: { PER_POST: { price: 160000 } } },
    }},
  },
  'Menisms': {
    PODCAST_ADS: { label: 'Podcast Advertising', options: {
      PRE_ROLL_30S:    { label: 'Pre-Roll (30s)',              markets: { PER_EPISODE: { price: 160000   } } },
      MID_ROLL_60S:    { label: 'Mid-Roll (60s)',              markets: { PER_EPISODE: { price: 320000   } } },
      POST_ROLL_30S:   { label: 'Post-Roll (30s)',             markets: { PER_EPISODE: { price: 106666   } } },
      EPISODE_SPONSOR: { label: 'Full Episode Sponsorship',   markets: { PER_EPISODE: { price: 480000 } } },
      SERIES_SPONSOR:  { label: 'Series Sponsorship (10 eps)',markets: { PER_CAMPAIGN: { price: 1200000 } } },
    }},
    SOCIAL_INTEGRATION: { label: 'Social Media Integration', options: {
      IG_STORY: { label: 'Instagram Story Feature', markets: { PER_POST: { price: 80000  } } },
      IG_REEL:  { label: 'Instagram Reel Feature',  markets: { PER_POST: { price: 160000  } } },
      IG_POST:  { label: 'Instagram Feed Post',     markets: { PER_POST: { price: 128000 } } },
    }},
  },
  'WithChude': {
    PODCAST_ADS: { label: 'Podcast Advertising', options: {
      PRE_ROLL_30S:    { label: 'Pre-Roll (30s)',              markets: { PER_EPISODE: { price: 290000   } } },
      MID_ROLL_60S:    { label: 'Mid-Roll (60s)',              markets: { PER_EPISODE: { price: 580000   } } },
      POST_ROLL_30S:   { label: 'Post-Roll (30s)',             markets: { PER_EPISODE: { price: 193333   } } },
      EPISODE_SPONSOR: { label: 'Full Episode Sponsorship',   markets: { PER_EPISODE: { price: 870000 } } },
      SERIES_SPONSOR:  { label: 'Series Sponsorship (10 eps)',markets: { PER_CAMPAIGN: { price: 2200000 } } },
    }},
    SOCIAL_INTEGRATION: { label: 'Social Media Integration', options: {
      IG_STORY: { label: 'Instagram Story Feature', markets: { PER_POST: { price: 150000  } } },
      IG_REEL:  { label: 'Instagram Reel Feature',  markets: { PER_POST: { price: 300000  } } },
      IG_POST:  { label: 'Instagram Feed Post',     markets: { PER_POST: { price: 240000 } } },
    }},
  },
  'Loose Talk Podcast': {
    PODCAST_ADS: { label: 'Podcast Advertising', options: {
      PRE_ROLL_30S:    { label: 'Pre-Roll (30s)',              markets: { PER_EPISODE: { price: 225000   } } },
      MID_ROLL_60S:    { label: 'Mid-Roll (60s)',              markets: { PER_EPISODE: { price: 450000   } } },
      POST_ROLL_30S:   { label: 'Post-Roll (30s)',             markets: { PER_EPISODE: { price: 150000   } } },
      EPISODE_SPONSOR: { label: 'Full Episode Sponsorship',   markets: { PER_EPISODE: { price: 675000 } } },
      SERIES_SPONSOR:  { label: 'Series Sponsorship (10 eps)',markets: { PER_CAMPAIGN: { price: 1800000 } } },
    }},
    SOCIAL_INTEGRATION: { label: 'Social Media Integration', options: {
      IG_STORY: { label: 'Instagram Story Feature', markets: { PER_POST: { price: 115000  } } },
      IG_REEL:  { label: 'Instagram Reel Feature',  markets: { PER_POST: { price: 230000  } } },
      IG_POST:  { label: 'Instagram Feed Post',     markets: { PER_POST: { price: 184000 } } },
    }},
  },
  'Bahd and Boujee Podcast': {
    PODCAST_ADS: { label: 'Podcast Advertising', options: {
      PRE_ROLL_30S:    { label: 'Pre-Roll (30s)',              markets: { PER_EPISODE: { price: 180000   } } },
      MID_ROLL_60S:    { label: 'Mid-Roll (60s)',              markets: { PER_EPISODE: { price: 360000   } } },
      POST_ROLL_30S:   { label: 'Post-Roll (30s)',             markets: { PER_EPISODE: { price: 120000   } } },
      EPISODE_SPONSOR: { label: 'Full Episode Sponsorship',   markets: { PER_EPISODE: { price: 540000 } } },
      SERIES_SPONSOR:  { label: 'Series Sponsorship (10 eps)',markets: { PER_CAMPAIGN: { price: 1400000 } } },
    }},
    SOCIAL_INTEGRATION: { label: 'Social Media Integration', options: {
      IG_STORY: { label: 'Instagram Story Feature', markets: { PER_POST: { price: 90000  } } },
      IG_REEL:  { label: 'Instagram Reel Feature',  markets: { PER_POST: { price: 180000  } } },
      IG_POST:  { label: 'Instagram Feed Post',     markets: { PER_POST: { price: 144000 } } },
    }},
  },
  'XL Billboards': {
    STATIC_BILLBOARDS: { label: 'Static Billboards (monthly)', options: {
      SMALL_SECONDARY:  { label: 'Small — Secondary Roads',   markets: { LAGOS: { price: 550000  }, ABUJA: { price: 400000 }, PORT_HARCOURT: { price: 350000 } } },
      MEDIUM_SECONDARY: { label: 'Medium — Secondary Roads',  markets: { LAGOS: { price: 1150000 }, ABUJA: { price: 800000 }, PORT_HARCOURT: { price: 700000 } } },
      LARGE_SECONDARY:  { label: 'Large — Secondary Roads',   markets: { LAGOS: { price: 2250000 }, ABUJA: { price: 1500000 } } },
      SMALL_PRIME:      { label: 'Small — Prime Highway',     markets: { LAGOS: { price: 1500000 }, ABUJA: { price: 1000000 } } },
      MEDIUM_PRIME:     { label: 'Medium — Prime Highway',    markets: { LAGOS: { price: 3500000 }, ABUJA: { price: 2500000 } } },
      LARGE_PRIME:      { label: 'Large — Prime Highway',     markets: { LAGOS: { price: 10000000 } } },
    }},
    ROOFTOP: { label: 'Rooftop Boards (monthly)', options: {
      ROOFTOP_STANDARD: { label: 'Standard Rooftop', markets: { LAGOS: { price: 2750000  } } },
      ROOFTOP_PREMIUM:  { label: 'Premium Rooftop',  markets: { LAGOS: { price: 12500000 } } },
    }},
    DIGITAL_LED: { label: 'Digital LED Boards (monthly)', options: {
      LED_10S:  { label: '10s Rotation — Prime',    markets: { LAGOS: { price: 2500000 }, ABUJA: { price: 1800000 } } },
      LED_15S:  { label: '15s Rotation — Prime',    markets: { LAGOS: { price: 3500000 }, ABUJA: { price: 2500000 } } },
      LED_30S:  { label: '30s Rotation — Prime',    markets: { LAGOS: { price: 7000000 }, ABUJA: { price: 5000000 } } },
    }},
    UNIPOLE: { label: 'Unipoles & Gantries (monthly)', options: {
      UNIPOLE_STANDARD: { label: 'Standard Unipole',     markets: { LAGOS: { price: 4500000 }, ABUJA: { price: 3200000 } } },
      UNIPOLE_MEGA:     { label: 'Mega Unipole',         markets: { LAGOS: { price: 9000000 } } },
      EXPRESSWAY_GANTRY:{ label: 'Expressway Gantry',    markets: { LAGOS: { price: 15000000 } } },
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
      DIGITAL_TOTEM:    { label: 'Digital Totem (per week)',markets: { MURTALA_MUHAMMED: { price: 2500000 }, ABUJA_NNAMDI: { price: 1800000 } } },
    }},
    MALL_RETAIL: { label: 'Mall & Retail Screens (monthly)', options: {
      STANDARD_MALL: { label: 'Standard Mall Screen', markets: { NATIONAL: { price: 1500000 } } },
      PREMIUM_MALL:  { label: 'Premium Mall Screen',  markets: { NATIONAL: { price: 5500000 } } },
      ESCALATOR:     { label: 'Escalator Branding',   markets: { NATIONAL: { price: 4000000 } } },
      FOOD_COURT:    { label: 'Food Court Branding',  markets: { NATIONAL: { price: 3000000 } } },
    }},
    STREET_FURNITURE: { label: 'Street Furniture (monthly)', options: {
      BUS_SHELTER:      { label: 'Bus Shelter Panel',     markets: { LAGOS: { price: 800000  }, ABUJA: { price: 600000 } } },
      KIOSK_PANEL:      { label: 'Kiosk Panel',           markets: { LAGOS: { price: 550000  }, ABUJA: { price: 400000 } } },
      PEDESTRIAN_BRIDGE:{ label: 'Pedestrian Bridge',     markets: { LAGOS: { price: 2500000 } } },
    }},
    DIGITAL_OOH: { label: 'Digital OOH (monthly)', options: {
      DIGITAL_STREET:  { label: 'Digital Street Screen (10s loop)',  markets: { LAGOS: { price: 1800000 }, ABUJA: { price: 1200000 } } },
      PROGRAMMATIC_OOH:{ label: 'Programmatic OOH Activation',       markets: { NATIONAL: { price: 3500000 } } },
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
    UNIPOLE_GANTRY: { label: 'Unipoles & Gantries (monthly)', options: {
      UNIPOLE_STANDARD:  { label: 'Standard Unipole',   markets: { LAGOS: { price: 4000000 }, ABUJA: { price: 2800000 } } },
      UNIPOLE_MEGA:      { label: 'Mega Unipole',       markets: { LAGOS: { price: 8500000 } } },
      BRIDGE_BANNER:     { label: 'Bridge Banner',      markets: { LAGOS: { price: 3500000 }, ABUJA: { price: 2500000 } } },
      EXPRESSWAY_GANTRY: { label: 'Expressway Gantry',  markets: { LAGOS: { price: 12000000 } } },
    }},
    TRANSIT_MEDIA: { label: 'Transit & Street Media (monthly)', options: {
      BUS_SHELTER:    { label: 'Bus Shelter Panel',  markets: { LAGOS: { price: 650000 }, ABUJA: { price: 500000 } } },
      TAXI_BRANDING:  { label: 'Taxi Branding',      markets: { LAGOS: { price: 280000 }, ABUJA: { price: 220000 } } },
      DANFO_BRANDING: { label: 'Danfo Bus Branding', markets: { LAGOS: { price: 250000 } } },
    }},
  },

  'JMT Communications': {
    TRANSIT: { label: 'BRT & Transit Media', options: {
      FULL_BUS_WRAP:    { label: 'Full Bus Wrap (monthly)',    markets: { LAGOS: { price: 4000000 } } },
      HALF_BUS_WRAP:    { label: 'Half Bus Wrap (monthly)',    markets: { LAGOS: { price: 1900000 } } },
      INTERIOR_BUS:     { label: 'Interior Branding (monthly)',markets: { LAGOS: { price: 625000  } } },
      BRT_SHELTER:      { label: 'BRT Shelter Branding (monthly)', markets: { LAGOS: { price: 1750000 } } },
      DANFO_BRANDING:   { label: 'Danfo Bus Branding (monthly)', markets: { LAGOS: { price: 280000 }, ABUJA: { price: 320000 } } },
    }},
    AIRPORT_MEDIA: { label: 'Airport Advertising', options: {
      ARRIVALS_BANNER:  { label: 'Arrivals Hall Banner (monthly)',   markets: { LAGOS: { price: 2800000 }, ABUJA: { price: 2200000 } } },
      DEPARTURES_BANNER:{ label: 'Departures Hall Banner (monthly)', markets: { LAGOS: { price: 3200000 }, ABUJA: { price: 2500000 } } },
      BAGGAGE_AREA:     { label: 'Baggage Claim Branding (monthly)', markets: { LAGOS: { price: 1900000 } } },
      LED_SCREEN:       { label: 'LED Screen (30s loop, per week)',  markets: { LAGOS: { price: 850000 },  ABUJA: { price: 700000 } } },
    }},
    MALL_MEDIA: { label: 'Mall & Retail Media', options: {
      MALL_BANNER:      { label: 'Mall Banner (monthly)',      markets: { LAGOS: { price: 1200000 }, ABUJA: { price: 950000 } } },
      ELEVATOR_SCREEN:  { label: 'Elevator Screen (monthly)', markets: { LAGOS: { price: 650000 },  ABUJA: { price: 550000 } } },
      FLOOR_STICKER:    { label: 'Floor Sticker (monthly)',   markets: { LAGOS: { price: 380000 } } },
      EXPERIENTIAL_ZONE:{ label: 'Experiential Zone (per day)',markets: { LAGOS: { price: 450000 }, ABUJA: { price: 380000 } } },
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
      INSTAGRAM_POST:   { label: 'Instagram Post',     markets: { PER_POST:  { price: 2750000  } } },
      INSTAGRAM_REEL:   { label: 'Instagram Reel',     markets: { PER_REEL:  { price: 2750000  } } },
      INSTAGRAM_STORY:  { label: 'Instagram Story',    markets: { PER_STORY: { price: 1075000  } } },
      INSTAGRAM_SERIES: { label: 'Instagram Series (5 posts)', markets: { PER_CAMPAIGN: { price: 11000000 } } },
      TIKTOK_VIDEO:     { label: 'TikTok Video',       markets: { PER_VIDEO: { price: 2650000  } } },
      TWITTER_X:        { label: 'Twitter/X Campaign', markets: { PER_POST:  { price: 1625000  } } },
    }},
    YOUTUBE: { label: 'YouTube & Video', options: {
      YOUTUBE_INTEGRATION:  { label: 'YouTube Integration',      markets: { PER_VIDEO: { price: 5500000  } } },
      YOUTUBE_MENTION:      { label: 'YouTube Mid-roll Mention', markets: { PER_VIDEO: { price: 800000   } } },
      VLOG_FEATURE:         { label: 'Vlog Feature',             markets: { PER_VIDEO: { price: 3500000  } } },
    }},
    BRAND_DEALS: { label: 'Brand Deals', options: {
      CAMPAIGN_APPEARANCE:  { label: 'Campaign Appearance',         markets: { PER_CAMPAIGN: { price: 5000000  } } },
      EVENT_HOSTING:        { label: 'Event Hosting',               markets: { PER_EVENT:    { price: 2000000  } } },
      AMBASSADOR_QUARTERLY: { label: 'Brand Ambassador (quarterly)',markets: { PER_CAMPAIGN: { price: 8000000  } } },
      AMBASSADOR_ANNUAL:    { label: 'Brand Ambassador (annual)',   markets: { ANNUAL:       { price: 20000000 } } },
    }},
    PODCAST: { label: 'Podcast (On Air With Toke)', options: {
      PRE_ROLL:       { label: 'Pre-Roll Mention',       markets: { PER_EPISODE: { price: 600000  } } },
      MID_ROLL:       { label: 'Mid-Roll Sponsorship',   markets: { PER_EPISODE: { price: 1200000 } } },
      EPISODE_SPONSOR:{ label: 'Episode Sponsorship',    markets: { PER_EPISODE: { price: 3000000 } } },
    }},
  },

  'Mr Macaroni': {
    SOCIAL_MEDIA: { label: 'Social Media', options: {
      INSTAGRAM_POST:   { label: 'Instagram Post',     markets: { PER_POST:  { price: 2750000  } } },
      INSTAGRAM_REEL:   { label: 'Instagram Reel',     markets: { PER_REEL:  { price: 2750000  } } },
      INSTAGRAM_STORY:  { label: 'Instagram Story',    markets: { PER_STORY: { price: 1000000  } } },
      INSTAGRAM_SERIES: { label: 'Instagram Series (5 posts)', markets: { PER_CAMPAIGN: { price: 10000000 } } },
      TIKTOK_VIDEO:     { label: 'TikTok Video',       markets: { PER_VIDEO: { price: 2650000  } } },
      TWITTER_X:        { label: 'Twitter/X Campaign', markets: { PER_POST:  { price: 1500000  } } },
    }},
    VIDEO_CONTENT: { label: 'Video Content', options: {
      COMEDY_SKIT:          { label: 'Comedy Skit Integration', markets: { PER_SKIT:  { price: 10000000 } } },
      YOUTUBE_INTEGRATION:  { label: 'YouTube Integration',     markets: { PER_VIDEO: { price: 5500000  } } },
      PRODUCT_REVIEW_VIDEO: { label: 'Product Review/Feature',  markets: { PER_VIDEO: { price: 3500000  } } },
    }},
    BRAND_DEALS: { label: 'Brand Deals', options: {
      CAMPAIGN_APPEARANCE:  { label: 'Campaign Appearance',         markets: { PER_CAMPAIGN: { price: 5000000  } } },
      EVENT_APPEARANCE:     { label: 'Event Appearance',            markets: { PER_EVENT:    { price: 2500000  } } },
      AMBASSADOR_QUARTERLY: { label: 'Brand Ambassador (quarterly)',markets: { PER_CAMPAIGN: { price: 8000000  } } },
      AMBASSADOR_ANNUAL:    { label: 'Brand Ambassador (annual)',   markets: { ANNUAL:       { price: 20000000 } } },
    }},
    EXPERIENTIAL: { label: 'Experiential & Live', options: {
      LIVE_EVENT_HOST:    { label: 'Live Event Hosting',      markets: { PER_EVENT:    { price: 3500000 } } },
      BRAND_ACTIVATION:   { label: 'Brand Activation Appearance', markets: { PER_EVENT: { price: 2000000 } } },
      AUTOGRAPH_SESSION:  { label: 'Meet & Greet / Fan Session',  markets: { PER_EVENT: { price: 1500000 } } },
    }},
  },

  'Broda Shaggi': {
    SOCIAL_MEDIA: { label: 'Social Media', options: {
      INSTAGRAM_POST:   { label: 'Instagram Post',     markets: { PER_POST:  { price: 2750000  } } },
      INSTAGRAM_REEL:   { label: 'Instagram Reel',     markets: { PER_REEL:  { price: 2750000  } } },
      INSTAGRAM_STORY:  { label: 'Instagram Story',    markets: { PER_STORY: { price: 950000   } } },
      INSTAGRAM_SERIES: { label: 'Instagram Series (5 posts)', markets: { PER_CAMPAIGN: { price: 10000000 } } },
      TIKTOK_VIDEO:     { label: 'TikTok Video',       markets: { PER_VIDEO: { price: 2650000  } } },
      TWITTER_X:        { label: 'Twitter/X Campaign', markets: { PER_POST:  { price: 1400000  } } },
    }},
    VIDEO_CONTENT: { label: 'Video Content', options: {
      COMEDY_SKIT:          { label: 'Comedy Skit Integration', markets: { PER_SKIT:  { price: 10000000 } } },
      YOUTUBE_INTEGRATION:  { label: 'YouTube Integration',     markets: { PER_VIDEO: { price: 5500000  } } },
      PRODUCT_REVIEW_VIDEO: { label: 'Product Review/Feature',  markets: { PER_VIDEO: { price: 3200000  } } },
    }},
    BRAND_DEALS: { label: 'Brand Deals', options: {
      CAMPAIGN_APPEARANCE:  { label: 'Campaign Appearance',         markets: { PER_CAMPAIGN: { price: 5000000  } } },
      EVENT_APPEARANCE:     { label: 'Event Appearance',            markets: { PER_EVENT:    { price: 2000000  } } },
      AMBASSADOR_QUARTERLY: { label: 'Brand Ambassador (quarterly)',markets: { PER_CAMPAIGN: { price: 7500000  } } },
      AMBASSADOR_ANNUAL:    { label: 'Brand Ambassador (annual)',   markets: { ANNUAL:       { price: 18000000 } } },
    }},
    EXPERIENTIAL: { label: 'Experiential & Live', options: {
      LIVE_EVENT_HOST:   { label: 'Live Event Hosting',         markets: { PER_EVENT: { price: 3000000 } } },
      BRAND_ACTIVATION:  { label: 'Brand Activation Appearance',markets: { PER_EVENT: { price: 1800000 } } },
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

async function populateInventory() {
  console.log(`\n🚀 Fetching all media from: ${API_URL}/media\n`);

  let mediaList = [];
  try {
    const res = await axios.get(`${API_URL}/media`);
    mediaList = Array.isArray(res.data) ? res.data : res.data?.media ?? res.data?.data ?? [];
  } catch (e) {
    console.error('❌ Failed to fetch media:', e.message);
    process.exit(1);
  }

  console.log(`Found ${mediaList.length} providers. Populating inventory...\n`);

  let success = 0, skipped = 0, failed = 0;

  for (const m of mediaList) {
    const name     = m.name;
    const category = m.category;
    const mediaId  = m.mediaId || m.id || m._id;

    // Use specific inventory if available, else use category default
    const inventory = PROVIDER_INVENTORY[name] || DEFAULT_INVENTORY[category] || {};

    if (!Object.keys(inventory).length) {
      console.log(`  ⏭  ${name} — no inventory template`);
      skipped++;
      continue;
    }

    try {
      await axios.patch(`${API_URL}/media/${mediaId}`, { inventory });
      console.log(`  ✅ ${name}`);
      success++;
    } catch (e) {
      console.error(`  ❌ ${name}: ${e.response?.data?.error || e.message}`);
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
