export const INVENTORY_CONFIG = {

  RADIO_AUDIO: {
    label: 'Radio & Audio',
    inventoryGroups: {
      COMMERCIAL_SPOTS: {
        label: 'Commercial Spots',
        options: {
          THIRTY_SECONDS_PEAK: {
            label: '30 Seconds Peak',
            markets: {
              COOL_FM_LAGOS:    { price: 21750 },
              COOL_FM_ABUJA:    { price: 11750 },
              COOL_FM_PH:       { price: 11750 },
              COOL_FM_KANO:     { price: 7500  },
              WAZOBIA_FM_LAGOS: { price: 28125 },
              WAZOBIA_FM_ABUJA: { price: 14500 },
              WAZOBIA_FM_PH:    { price: 15750 },
              WAZOBIA_FM_KANO:  { price: 9750  },
              WAZOBIA_FM_ONITSHA:{ price: 9750 },
              NIGERIA_INFO:     { price: 24530 },
              BEAT_FM_LAGOS_60S:{ price: 22056 },
              BEAT_FM_LAGOS_30S:{ price: 12252 },
              BEAT_FM_ABUJA:    { price: 8800  },
              BEAT_FM_PH:       { price: 8800  },
              CLASSIC_FM_LAGOS: { price: 12300 },
              CLASSIC_FM_ABUJA: { price: 7722  },
              NAIJA_FM_LAGOS:   { price: 13603 },
              LAGOS_TALKS_SUPER_PREMIUM: { price: 10962 },
              URBAN96_LAGOS:    { price: 18200 },
              SOUNDCITY_RADIO_LAGOS: { price: 18200 },
              SPICE_FM_LAGOS:   { price: 14700 },
              GROUP8_OTHER:     { price: 14700 },
            },
          },
          THIRTY_SECONDS_OFFPEAK: {
            label: '30 Seconds Off-Peak',
            markets: {
              COOL_FM_LAGOS:    { price: 12500 },
              COOL_FM_ABUJA:    { price: 9688  },
              COOL_FM_PH:       { price: 9688  },
              COOL_FM_KANO:     { price: 6250  },
              WAZOBIA_FM_LAGOS: { price: 19625 },
              WAZOBIA_FM_ABUJA: { price: 10730 },
              WAZOBIA_FM_PH:    { price: 11625 },
              WAZOBIA_FM_KANO:  { price: 7670  },
              WAZOBIA_FM_ONITSHA:{ price: 7670 },
              NIGERIA_INFO:     { price: 17600 },
              BEAT_FM_LAGOS_REGULAR:{ price: 7644 },
            },
          },
        },
      },
      PROGRAMME_SPONSORSHIPS: {
        label: 'Programme Sponsorships',
        options: {
          MORNING_SHOW: {
            label: 'Morning Show Sponsorship',
            markets: {
              COOL_FM_LAGOS:    { price: 21750  },
              COOL_FM_ABUJA:    { price: 11750  },
              COOL_FM_PH:       { price: 11750  },
              COOL_FM_KANO:     { price: 7500   },
              WAZOBIA_FM_LAGOS: { price: 28125  },
              WAZOBIA_FM_ABUJA: { price: 14500  },
              BEAT_FM_LAGOS:    { price: 500000 },
              BEAT_FM_ABUJA:    { price: 117649 },
              BEAT_FM_PH:       { price: 138410 },
              CLASSIC_FM_LAGOS: { price: 500000 },
              NAIJA_FM_LAGOS:   { price: 400000 },
              LAGOS_TALKS:      { price: 500000 },
              GROUP8_60MINS:    { price: 3000000},
              GROUP8_30MINS:    { price: 2000000},
            },
          },
          NEWS_SPONSORSHIP: {
            label: 'News Sponsorship',
            markets: { NATIONAL: { price: 180000 } },
          },
          TRAFFIC_SPONSORSHIP: {
            label: 'Traffic Sponsorship',
            markets: { NATIONAL: { price: 45000 } },
          },
        },
      },
      PRESENTER_MENTIONS: {
        label: 'Presenter Mentions & Live Reads',
        options: {
          PRESENTER_MENTION: {
            label: 'Presenter Mention',
            markets: {
              COOL_FM_LAGOS:    { price: 26250 },
              COOL_FM_ABUJA:    { price: 17063 },
              COOL_FM_PH:       { price: 18000 },
              COOL_FM_KANO:     { price: 10875 },
              WAZOBIA_FM_LAGOS: { price: 36875 },
              WAZOBIA_FM_ABUJA: { price: 18125 },
              WAZOBIA_FM_PH:    { price: 19063 },
              WAZOBIA_FM_KANO:  { price: 12000 },
              NIGERIA_INFO:     { price: 18938 },
              BEAT_FM_LAGOS:    { price: 50000 },
              BEAT_FM_ABUJA:    { price: 40000 },
            },
          },
          LIVE_READ: {
            label: 'Live Read Slot',
            markets: {
              COOL_FM_LAGOS:         { price: 500000 },
              COOL_FM_ABUJA_PH_KANO: { price: 150000 },
              NIGERIA_INFO:          { price: 500000 },
            },
          },
          COUNTDOWN_SPONSORSHIP: {
            label: 'Countdown Sponsorship',
            markets: {
              COOL_FM_LAGOS:    { price: 456125 },
              COOL_FM_ABUJA:    { price: 195250 },
              COOL_FM_PH:       { price: 147840 },
              COOL_FM_KANO:     { price: 68400  },
              WAZOBIA_FM_LAGOS: { price: 590000 },
              WAZOBIA_FM_ABUJA: { price: 206876 },
              WAZOBIA_FM_PH:    { price: 255250 },
              NIGERIA_INFO:     { price: 408976 },
            },
          },
        },
      },
      AUDIO_PRODUCTION: {
        label: 'Audio Production',
        options: {
          JINGLE_PRODUCTION: {
            label: 'Jingle Production',
            markets: {
              LAGOS:        { price: 150000 },
              OTHER_CITIES: { price: 100000 },
              GROUP8_LAGOS: { price: 70777  },
              GROUP8_OTHER: { price: 28000  },
            },
          },
          SCRIPTWRITING: {
            label: 'Scriptwriting',
            markets: { NATIONAL: { price: 20000 } },
          },
          VOICE_OVER: {
            label: 'Voice Over / Extra Voice',
            markets: {
              LAGOS:        { price: 50000 },
              OTHER_CITIES: { price: 30000 },
              GROUP8:       { price: 35070 },
            },
          },
          OUTDOOR_BROADCAST: {
            label: 'Outdoor Broadcast / Roadshow',
            markets: {
              COOL_FM_LAGOS:    { price: 3000000 },
              BEAT_FM_LAGOS:    { price: 500000  },
              BEAT_FM_ABUJA_PH: { price: 200000  },
              CLASSIC_FM_LAGOS: { price: 500000  },
              NAIJA_FM_LAGOS:   { price: 500000  },
              GROUP8_LAGOS:     { price: 285100  },
              GROUP8_OTHER:     { price: 189000  },
            },
          },
        },
      },
    },
  },

  TELEVISION: {
    label: 'Television & Streaming TV',
    inventoryGroups: {
      COMMERCIAL_AIRTIME: {
        label: 'Commercial Airtime',
        options: {
          PRIME_TIME_30S: {
            label: 'Prime Time 30 Seconds',
            markets: {
              ARISE_TV:            { price: 750000  },
              AFRICA_MAGIC_URBAN:  { price: 420000  },
              AFRICA_MAGIC_FAMILY: { price: 320000  },
              CHANNELS_TV_PRIME:   { price: 58420   },
              TVC_PRIME:           { price: 80000   },
              ONTV_SOUNDCITY:      { price: 250000  },
              SPICE_TV:            { price: 92350   },
              TRYBE_TELEVISTA:     { price: 198500  },
            },
          },
          PRIME_TIME_60S: {
            label: 'Prime Time 60 Seconds',
            markets: {
              ARISE_TV:            { price: 1200000 },
              AFRICA_MAGIC_URBAN:  { price: 750000  },
              AFRICA_MAGIC_FAMILY: { price: 580000  },
              CHANNELS_TV_PRIME:   { price: 88030   },
              TVC_PRIME:           { price: 150000  },
              ONTV_SOUNDCITY:      { price: 322500  },
              SPICE_TV:            { price: 129855  },
              TRYBE_TELEVISTA:     { price: 250950  },
            },
          },
          OFFPEAK_30S: {
            label: 'Off-Peak 30 Seconds',
            markets: {
              ARISE_TV:            { price: 450000 },
              AFRICA_MAGIC_URBAN:  { price: 220000 },
              AFRICA_MAGIC_FAMILY: { price: 180000 },
              CHANNELS_TV_MORNING: { price: 38736  },
              CHANNELS_TV_EVENING: { price: 41399  },
              CHANNELS_TV_LATE:    { price: 36497  },
              TVC_5AM_4PM:         { price: 60000  },
              TVC_4PM_7PM:         { price: 70000  },
            },
          },
          FIFTEEN_SECONDS: {
            label: '15 Seconds',
            markets: {
              ARISE_TV:            { price: 400000 },
              AFRICA_MAGIC_URBAN:  { price: 150000 },
              AFRICA_MAGIC_FAMILY: { price: 120000 },
              CHANNELS_TV_PRIME:   { price: 38736  },
              CHANNELS_TV_MORNING: { price: 28009  },
              TVC_5AM_4PM:         { price: 35000  },
              TVC_PRIME:           { price: 50000  },
            },
          },
        },
      },
      SPECIAL_PROGRAMMES: {
        label: 'Special Programmes & News',
        options: {
          SUNRISE_BUSINESS_MORNING: {
            label: 'Sunrise / Business Morning (60s)',
            markets: { CHANNELS_TV: { price: 188972 } },
          },
          POLITICS_TODAY_30S: {
            label: 'Politics Today (30s)',
            markets: { CHANNELS_TV: { price: 242965 } },
          },
          EIGHT_PM_NEWS_30S: {
            label: '8PM News (30s)',
            markets: { CHANNELS_TV: { price: 202470 } },
          },
          NEWS_AT_TEN_60S: {
            label: 'News at Ten (60s)',
            markets: { CHANNELS_TV: { price: 739458 } },
          },
          CORPORATE_NEWS_MENTION: {
            label: 'Corporate News Mention (10PM)',
            markets: { TVC: { price: 3100000 } },
          },
          GOVERNMENT_NEWS_MENTION: {
            label: 'Government News Mention (10PM)',
            markets: { TVC: { price: 3500000 } },
          },
        },
      },
      SPONSORED_CONTENT: {
        label: 'Sponsored Content & Brand Integration',
        options: {
          PROGRAMME_SPONSORSHIP: {
            label: 'Programme Sponsorship',
            markets: {
              ARISE_TV:            { price: 12500000 },
              AFRICA_MAGIC_URBAN:  { price: 7500000  },
              AFRICA_MAGIC_FAMILY: { price: 5000000  },
              CHANNELS_TV_15MINS:  { price: 1175040  },
              TVC_ENTERTAINMENT:   { price: 10000000 },
              TVC_NEWS:            { price: 14250000 },
              GROUP8_60MINS:       { price: 3000000  },
              GROUP8_30MINS:       { price: 2000000  },
            },
          },
          BRAND_INTEGRATION: {
            label: 'Brand Integration',
            markets: {
              ARISE_TV:            { price: 6000000 },
              AFRICA_MAGIC_URBAN:  { price: 3750000 },
              AFRICA_MAGIC_FAMILY: { price: 2500000 },
            },
          },
          PRESENTER_MENTION: {
            label: 'Presenter Mention',
            markets: {
              ARISE_TV:            { price: 1250000 },
              AFRICA_MAGIC_URBAN:  { price: 650000  },
              AFRICA_MAGIC_FAMILY: { price: 475000  },
            },
          },
          LIVE_COVERAGE: {
            label: 'Live Coverage (min 1 hour)',
            markets: {
              CHANNELS_TV:          { price: 5000000  },
              TVC_WITHIN_LAGOS:     { price: 6000000  },
              TVC_OUTSIDE_LAGOS:    { price: 6500000  },
              TVC_WITH_OB_VAN:      { price: 7500000  },
              GROUP8_LAGOS:         { price: 10000000 },
              GROUP8_OUTSIDE_LAGOS: { price: 15000000 },
            },
          },
          GUEST_APPEARANCE: {
            label: 'Guest Appearance (Live Programme)',
            markets: {
              TVC_YOUR_VIEW:      { price: 3750000 },
              TVC_WAKE_UP:        { price: 3000000 },
              TVC_POLITICS_FOCUS: { price: 4000000 },
            },
          },
        },
      },
    },
  },

  PODCASTS: {
    label: 'Podcasts',
    inventoryGroups: {
      AUDIO_ADS: {
        label: 'Audio Ads',
        options: {
          PRE_ROLL: {
            label: 'Pre-Roll Ads (15–30 secs)',
            markets: {
              TOP_TIER_ISWIS_HONEST_BUNCH: { price: 900000  },
              MID_TIER:                    { price: 250000  },
              EMERGING:                    { price: 87500   },
            },
          },
          MID_ROLL: {
            label: 'Mid-Roll Ads (30–60 secs)',
            markets: {
              TOP_TIER_ISWIS_HONEST_BUNCH: { price: 2125000 },
              MID_TIER:                    { price: 900000  },
              EMERGING:                    { price: 175000  },
            },
          },
          POST_ROLL: {
            label: 'Post-Roll Ads',
            markets: {
              TOP_TIER: { price: 500000 },
              MID_TIER: { price: 200000 },
            },
          },
          FULL_EPISODE_SPONSORSHIP: {
            label: 'Full Episode Sponsorship',
            markets: {
              TOP_TIER: { price: 6000000 },
              MID_TIER: { price: 1900000 },
              EMERGING: { price: 625000  },
            },
          },
        },
      },
      VIDEO_PODCAST: {
        label: 'Video Podcast Integrations',
        options: {
          YOUTUBE_MID_ROLL: {
            label: 'YouTube Mid-roll Mention',
            markets: {
              TOP_TIER: { price: 1075000 },
              MID_TIER: { price: 300000  },
            },
          },
          SPONSORED_VIDEO_SEGMENT: {
            label: 'Sponsored Video Segment',
            markets: {
              TOP_TIER: { price: 2750000 },
              MID_TIER: { price: 800000  },
            },
          },
          PRODUCT_PLACEMENT: {
            label: 'Product Placement',
            markets: {
              TOP_TIER: { price: 1650000 },
              MID_TIER: { price: 500000  },
            },
          },
        },
      },
      TALENT_INVENTORY: {
        label: 'Talent & Host Inventory',
        options: {
          HOST_MENTION: {
            label: 'Host Mention',
            markets: {
              TOP_TIER: { price: 800000 },
              MID_TIER: { price: 300000 },
            },
          },
          GUEST_INTEGRATION: {
            label: 'Guest Integration',
            markets: {
              TOP_TIER: { price: 2750000 },
              MID_TIER: { price: 800000  },
            },
          },
          SOCIAL_CROSS_PROMO: {
            label: 'Social Media Cross Promotion',
            markets: {
              TOP_TIER: { price: 1575000 },
              MID_TIER: { price: 400000  },
            },
          },
        },
      },
    },
  },

  OUT_OF_HOME: {
    label: 'Out-of-Home Advertising',
    inventoryGroups: {
      STATIC_BILLBOARDS: {
        label: 'Static Billboards',
        options: {
          SMALL_BOARD: {
            label: 'Small Billboard (monthly)',
            markets: {
              SECONDARY_ROADS: { price: 550000  },
              PRIME_HIGHWAY:   { price: 1500000 },
            },
          },
          MEDIUM_BOARD: {
            label: 'Medium Billboard (monthly)',
            markets: {
              SECONDARY_ROADS: { price: 1150000 },
              PRIME_HIGHWAY:   { price: 3500000 },
            },
          },
          LARGE_BOARD: {
            label: 'Large Billboard (monthly)',
            markets: {
              SECONDARY_ROADS: { price: 2250000  },
              PRIME_HIGHWAY:   { price: 10000000 },
            },
          },
        },
      },
      DIGITAL_LED: {
        label: 'Digital LED Boards',
        options: {
          TEN_SECONDS: {
            label: '10 Seconds Rotation (monthly)',
            markets: {
              STANDARD_LED: { price: 1400000 },
              PREMIUM_LED:  { price: 3500000 },
            },
          },
          FIFTEEN_SECONDS: {
            label: '15 Seconds Rotation (monthly)',
            markets: {
              STANDARD_LED: { price: 2500000 },
              PREMIUM_LED:  { price: 6000000 },
            },
          },
          THIRTY_SECONDS: {
            label: '30 Seconds Rotation (monthly)',
            markets: {
              STANDARD_LED: { price: 5000000  },
              PREMIUM_LED:  { price: 11000000 },
            },
          },
        },
      },
      ROOFTOP_GANTRY: {
        label: 'Rooftop & Gantry Boards',
        options: {
          ROOFTOP_STANDARD: {
            label: 'Rooftop Billboard (monthly)',
            markets: {
              STANDARD: { price: 2750000  },
              PREMIUM:  { price: 12500000 },
            },
          },
          GANTRY_SINGLE: {
            label: 'Single-Face Gantry (monthly)',
            markets: { HIGHWAY: { price: 5500000 } },
          },
          GANTRY_DOUBLE: {
            label: 'Double-Face Gantry (monthly)',
            markets: { HIGHWAY: { price: 10500000 } },
          },
          MEGA_GANTRY: {
            label: 'Mega Gantry (monthly)',
            markets: { HIGHWAY: { price: 27500000 } },
          },
        },
      },
      TRANSIT_MEDIA: {
        label: 'Transit Media (BRT / Bus)',
        options: {
          FULL_BUS_WRAP: {
            label: 'Full Bus Wrap',
            markets: { LAGOS: { price: 4000000 } },
          },
          HALF_BUS_WRAP: {
            label: 'Half Bus Wrap',
            markets: { LAGOS: { price: 1900000 } },
          },
          BRT_SHELTER: {
            label: 'BRT Shelter Branding (monthly)',
            markets: { LAGOS: { price: 1750000 } },
          },
        },
      },
      AIRPORT_INVENTORY: {
        label: 'Airport Advertising',
        options: {
          ARRIVAL_HALL_LED: {
            label: 'Arrival Hall LED (monthly)',
            markets: {
              MURTALA_MUHAMMED: { price: 7500000  },
              ABUJA_NNAMDI:     { price: 5000000  },
            },
          },
          DEPARTURE_HALL: {
            label: 'Departure Hall Branding (monthly)',
            markets: {
              MURTALA_MUHAMMED: { price: 12500000 },
              ABUJA_NNAMDI:     { price: 8000000  },
            },
          },
          AIRPORT_GANTRY: {
            label: 'Airport Gantry (monthly)',
            markets: { NATIONAL: { price: 30000000 } },
          },
        },
      },
      MALL_RETAIL: {
        label: 'Mall & Retail Screens',
        options: {
          STANDARD_MALL_SCREEN: {
            label: 'Standard Mall Screen (monthly)',
            markets: { STANDARD: { price: 1500000 } },
          },
          PREMIUM_MALL_SCREEN: {
            label: 'Premium Mall Screen (monthly)',
            markets: { PREMIUM: { price: 5500000 } },
          },
          ESCALATOR_BRANDING: {
            label: 'Escalator Branding',
            markets: { STANDARD: { price: 4000000 } },
          },
          FOOD_COURT: {
            label: 'Food Court Branding',
            markets: { STANDARD: { price: 3000000 } },
          },
        },
      },
    },
  },

  PRINT_MEDIA: {
    label: 'Print Media',
    inventoryGroups: {
      NEWSPAPER_ADS: {
        label: 'Newspaper Display Ads',
        options: {
          FULL_PAGE_COLOUR: {
            label: 'Full Page Colour',
            markets: {
              PUNCH_GUARDIAN_VANGUARD: { price: 3750000  },
              THISDAY_THE_NATION:      { price: 3000000  },
              DAILY_TRUST:             { price: 2000000  },
              BUSINESSDAY:             { price: 5000000  },
              SUN_LEADERSHIP_TRIBUNE:  { price: 1500000  },
            },
          },
          FULL_PAGE_BW: {
            label: 'Full Page Black & White',
            markets: {
              PUNCH_GUARDIAN_VANGUARD: { price: 1650000 },
              THISDAY_THE_NATION:      { price: 1200000 },
              DAILY_TRUST:             { price: 800000  },
              SUN_LEADERSHIP_TRIBUNE:  { price: 600000  },
            },
          },
          HALF_PAGE_COLOUR: {
            label: 'Half Page Colour',
            markets: {
              PUNCH_GUARDIAN_VANGUARD: { price: 2150000 },
              THISDAY_THE_NATION:      { price: 1500000 },
              DAILY_TRUST:             { price: 1000000 },
              BUSINESSDAY:             { price: 2500000 },
            },
          },
          HALF_PAGE_BW: {
            label: 'Half Page Black & White',
            markets: {
              PUNCH_GUARDIAN_VANGUARD: { price: 950000 },
              THISDAY_THE_NATION:      { price: 700000 },
              DAILY_TRUST:             { price: 500000 },
            },
          },
          FRONT_PAGE_SOLUS: {
            label: 'Front Page Solus',
            markets: { NATIONAL_DAILIES: { price: 12500000 } },
          },
          BACK_PAGE: {
            label: 'Back Page Ad',
            markets: { NATIONAL_DAILIES: { price: 6500000 } },
          },
        },
      },
      SPECIAL_POSITIONS: {
        label: 'Inserts & Special Positions',
        options: {
          NEWSPAPER_INSERT: {
            label: 'Newspaper Insert',
            markets: { NATIONAL: { price: 2750000 } },
          },
          WRAP_AROUND_JACKET: {
            label: 'Wrap Around Jacket',
            markets: { NATIONAL: { price: 15000000 } },
          },
          BELLY_BAND: {
            label: 'Belly Band Advertising',
            markets: { NATIONAL: { price: 6000000 } },
          },
        },
      },
      CLASSIFIEDS: {
        label: 'Classified Ads',
        options: {
          RECRUITMENT_AD: {
            label: 'Recruitment Advert',
            markets: { NATIONAL: { price: 1575000 } },
          },
          TENDER_NOTICE: {
            label: 'Tender Notice',
            markets: { NATIONAL: { price: 2650000 } },
          },
          PUBLIC_NOTICE: {
            label: 'Public Notice',
            markets: { NATIONAL: { price: 1050000 } },
          },
        },
      },
      BUSINESS_PUBLICATIONS: {
        label: 'Business & Financial Publications',
        options: {
          EXECUTIVE_FULL_PAGE: {
            label: 'Executive Full Page (BusinessDay)',
            markets: { BUSINESSDAY: { price: 5000000 } },
          },
          CEO_INTERVIEW: {
            label: 'CEO Interview Placement',
            markets: { BUSINESSDAY: { price: 5750000 } },
          },
          INDUSTRY_REPORT: {
            label: 'Industry Report Sponsorship',
            markets: { BUSINESSDAY: { price: 9000000 } },
          },
        },
      },
      DIGITAL_PRINT: {
        label: 'Digital / Online Print Assets',
        options: {
          WEBSITE_BANNER: {
            label: 'Website Banner Ad (monthly)',
            markets: {
              PREMIUM_PAPERS: { price: 2600000 },
              STANDARD:       { price: 600000  },
            },
          },
          HOMEPAGE_TAKEOVER: {
            label: 'Homepage Takeover',
            markets: { PREMIUM_PAPERS: { price: 5500000 } },
          },
          SPONSORED_ARTICLE: {
            label: 'Sponsored Article',
            markets: {
              PREMIUM_PAPERS: { price: 2625000 },
              STANDARD:       { price: 750000  },
            },
          },
        },
      },
    },
  },

  INFLUENCERS: {
    label: 'Influencer & Content Marketing',
    inventoryGroups: {
      SOCIAL_MEDIA: {
        label: 'Social Media Campaigns',
        options: {
          INSTAGRAM_POST: {
            label: 'Instagram Post',
            markets: {
              MEGA_5M_PLUS:       { price: 14000000 },
              MACRO_500K_5M:      { price: 2750000  },
              MID_TIER_100K_500K: { price: 450000   },
              MICRO_10K_100K:     { price: 135000   },
            },
          },
          INSTAGRAM_REEL: {
            label: 'Instagram Reel',
            markets: {
              MEGA_5M_PLUS:       { price: 14000000 },
              MACRO_500K_5M:      { price: 2750000  },
              MID_TIER_100K_500K: { price: 390000   },
              MICRO_10K_100K:     { price: 107500   },
            },
          },
          INSTAGRAM_STORY: {
            label: 'Instagram Story',
            markets: {
              MEGA_5M_PLUS:       { price: 5500000 },
              MACRO_500K_5M:      { price: 1075000 },
              MID_TIER_100K_500K: { price: 175000  },
              MICRO_10K_100K:     { price: 55000   },
            },
          },
          TIKTOK_VIDEO: {
            label: 'TikTok Video',
            markets: {
              MEGA_5M_PLUS:       { price: 11000000 },
              MACRO_500K_5M:      { price: 2650000  },
              MID_TIER_100K_500K: { price: 390000   },
              MICRO_10K_100K:     { price: 107500   },
            },
          },
          TWITTER_X_CAMPAIGN: {
            label: 'Twitter / X Campaign',
            markets: {
              MEGA_5M_PLUS:       { price: 6750000 },
              MACRO_500K_5M:      { price: 1625000 },
              MID_TIER_100K_500K: { price: 287500  },
              MICRO_10K_100K:     { price: 80000   },
            },
          },
        },
      },
      VIDEO_CONTENT: {
        label: 'YouTube & Video Content',
        options: {
          YOUTUBE_INTEGRATION: {
            label: 'YouTube Integration / Dedicated Video',
            markets: {
              MEGA_5M_PLUS:       { price: 17500000 },
              MACRO_500K_5M:      { price: 5500000  },
              MID_TIER_100K_500K: { price: 875000   },
            },
          },
          COMEDY_SKIT: {
            label: 'Comedy Skit Integration',
            markets: {
              PREMIUM_CREATORS:  { price: 10000000 },
              MID_TIER_CREATORS: { price: 3000000  },
            },
          },
          PRODUCT_PLACEMENT: {
            label: 'Product Placement',
            markets: {
              MEGA_5M_PLUS:  { price: 3625000 },
              MACRO_500K_5M: { price: 1250000 },
            },
          },
          LIVESTREAM_SPONSORSHIP: {
            label: 'YouTube Livestream Sponsorship',
            markets: {
              MEGA_5M_PLUS:  { price: 10500000 },
              MACRO_500K_5M: { price: 3000000  },
            },
          },
        },
      },
      BRAND_AMBASSADORSHIP: {
        label: 'Brand Ambassadorship & Endorsements',
        options: {
          AMBASSADOR_DEAL_ANNUAL: {
            label: 'Celebrity Ambassador Deal (annual)',
            markets: {
              MEGA_CELEBRITY:  { price: 100000000 },
              MACRO_CELEBRITY: { price: 20000000  },
            },
          },
          CAMPAIGN_APPEARANCE: {
            label: 'Campaign Appearance',
            markets: {
              MEGA_CELEBRITY:  { price: 25500000 },
              MACRO_CELEBRITY: { price: 5000000  },
            },
          },
          EVENT_HOSTING: {
            label: 'Event Hosting',
            markets: {
              MEGA_CELEBRITY:  { price: 10250000 },
              MACRO_CELEBRITY: { price: 2000000  },
            },
          },
        },
      },
      ACTIVATIONS: {
        label: 'Activations & Campaign Packages',
        options: {
          CAMPUS_TOURS: {
            label: 'Campus Tours',
            markets: { NATIONAL: { price: 10500000 } },
          },
          CONCERT_SPONSORSHIP: {
            label: 'Concert Sponsorship',
            markets: {
              PREMIUM:  { price: 52500000 },
              STANDARD: { price: 15000000 },
            },
          },
          FESTIVAL_CAMPAIGN: {
            label: 'Festival Campaign',
            markets: { NATIONAL: { price: 26500000 } },
          },
          MALL_ACTIVATION: {
            label: 'Mall Activation',
            markets: {
              PREMIUM:  { price: 7750000 },
              STANDARD: { price: 2000000 },
            },
          },
        },
      },
    },
  },
};