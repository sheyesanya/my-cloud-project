require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.VITE_API_URL;
if (!API_URL) { console.error('❌ VITE_API_URL not set in .env'); process.exit(1); }

// ── Two new BrandCasta-operated media organisations
const NEW_ORGS = [
  {
    name:         'BrandCasta Social Media',
    category:     'SOCIAL_MEDIA',
    contactEmail: 'brandcastang@gmail.com',
    monthlyReach: '50M+',
    description:  'Managed paid social advertising across Meta, TikTok, Google, X, LinkedIn and YouTube — executed by BrandCasta.',
    inventory: {
      META_ADS: { label: 'Meta Ads (Facebook & Instagram)', options: {
        AWARENESS_STARTER:  { label: 'Awareness — Starter',          markets: { PER_CAMPAIGN: { price: 200000  } } },
        AWARENESS_GROWTH:   { label: 'Awareness — Growth',           markets: { PER_CAMPAIGN: { price: 500000  } } },
        CONSIDERATION:      { label: 'Consideration Campaign',        markets: { PER_CAMPAIGN: { price: 750000  } } },
        CONVERSION:         { label: 'Conversion Campaign',           markets: { PER_CAMPAIGN: { price: 1000000 } } },
        RETARGETING:        { label: 'Retargeting Campaign',          markets: { PER_CAMPAIGN: { price: 600000  } } },
        LEAD_GENERATION:    { label: 'Lead Generation Campaign',      markets: { PER_CAMPAIGN: { price: 850000  } } },
      }},
      TIKTOK_ADS: { label: 'TikTok Ads', options: {
        IN_FEED_STARTER:    { label: 'In-Feed — Starter',            markets: { PER_CAMPAIGN: { price: 300000  } } },
        IN_FEED_GROWTH:     { label: 'In-Feed — Growth',             markets: { PER_CAMPAIGN: { price: 750000  } } },
        SPARK_ADS:          { label: 'Spark Ads',                    markets: { PER_CAMPAIGN: { price: 500000  } } },
        TOPVIEW:            { label: 'TopView Ad',                   markets: { PER_CAMPAIGN: { price: 2500000 } } },
        BRANDED_HASHTAG:    { label: 'Branded Hashtag Challenge',    markets: { PER_CAMPAIGN: { price: 5000000 } } },
      }},
      GOOGLE_ADS: { label: 'Google Ads (Search, Display & YouTube)', options: {
        SEARCH_STARTER:     { label: 'Search Ads — Starter',         markets: { PER_CAMPAIGN: { price: 400000  } } },
        SEARCH_GROWTH:      { label: 'Search Ads — Growth',          markets: { PER_CAMPAIGN: { price: 1000000 } } },
        DISPLAY_NETWORK:    { label: 'Display Network',              markets: { PER_CAMPAIGN: { price: 600000  } } },
        YOUTUBE_PREROLL:    { label: 'YouTube Pre-Roll',             markets: { PER_CAMPAIGN: { price: 800000  } } },
        PERFORMANCE_MAX:    { label: 'Performance Max',              markets: { PER_CAMPAIGN: { price: 1500000 } } },
      }},
      X_ADS: { label: 'X (Twitter) Ads', options: {
        PROMOTED_POST:      { label: 'Promoted Post',                markets: { PER_CAMPAIGN: { price: 200000  } } },
        FOLLOWER_CAMPAIGN:  { label: 'Follower Campaign',            markets: { PER_CAMPAIGN: { price: 400000  } } },
        TREND_TAKEOVER:     { label: 'Trend Takeover',              markets: { PER_CAMPAIGN: { price: 3500000 } } },
      }},
      LINKEDIN_ADS: { label: 'LinkedIn Ads', options: {
        SPONSORED_CONTENT:  { label: 'Sponsored Content',            markets: { PER_CAMPAIGN: { price: 600000  } } },
        MESSAGE_ADS:        { label: 'Message Ads',                  markets: { PER_CAMPAIGN: { price: 800000  } } },
        LEAD_GEN_FORMS:     { label: 'Lead Gen Forms',               markets: { PER_CAMPAIGN: { price: 1200000 } } },
      }},
      MANAGED_PACKAGES: { label: 'Managed Service Packages', options: {
        STARTER_PKG:        { label: 'Starter (1–2 platforms, monthly)',    markets: { PER_CAMPAIGN: { price: 1000000  } } },
        GROWTH_PKG:         { label: 'Growth (2–3 platforms, monthly)',     markets: { PER_CAMPAIGN: { price: 2000000  } } },
        ENTERPRISE_PKG:     { label: 'Enterprise (all platforms, monthly)', markets: { PER_CAMPAIGN: { price: 10000000 } } },
      }},
    },
  },

  {
    name:         'BrandCasta Music Promotion',
    category:     'MUSIC_PROMOTION',
    contactEmail: 'brandcastang@gmail.com',
    monthlyReach: '10M+',
    description:  'End-to-end music promotion: press releases, radio & TV rounds, digital amplification and full artist campaigns.',
    inventory: {
      PRESS_RELEASE: { label: 'Press Release & Editorial', options: {
        BASIC_PR:      { label: 'Basic Press Release (1 release, 20 outlets)',                markets: { PER_CAMPAIGN: { price: 300000  } } },
        STANDARD_PR:   { label: 'Standard PR (2 releases, 50 outlets + editorial feature)',   markets: { PER_CAMPAIGN: { price: 700000  } } },
        PREMIUM_PR:    { label: 'Premium PR (3 releases, 80+ outlets + interview placement)', markets: { PER_CAMPAIGN: { price: 1500000 } } },
      }},
      MEDIA_ROUNDS: { label: 'Radio & TV Media Rounds', options: {
        LAGOS_CIRCUIT:  { label: 'Lagos Circuit (5 stations + 2 TV appearances)',                       markets: { PER_CAMPAIGN: { price: 1000000 } } },
        NATIONAL_TOUR:  { label: 'National Tour (10 stations + 4 TV shows + 2 podcasts)',               markets: { PER_CAMPAIGN: { price: 2400000 } } },
        FULL_ROLLOUT:   { label: 'Full Rollout (20+ stations + 6 TV + 5 podcasts + editorial)',         markets: { PER_CAMPAIGN: { price: 5000000 } } },
      }},
      SONG_AMPLIFICATION: { label: 'Song Amplification (Digital)', options: {
        SPARK_PKG:      { label: 'Spark — TikTok + Instagram (2-week push)',                            markets: { PER_CAMPAIGN: { price: 600000  } } },
        AMPLIFY_PKG:    { label: 'Amplify — All platforms + playlist pitching (4 weeks)',               markets: { PER_CAMPAIGN: { price: 1500000 } } },
        CHART_PUSH:     { label: 'Chart Push — Full digital rollout + influencer seeding',              markets: { PER_CAMPAIGN: { price: 4000000 } } },
      }},
      FULL_CAMPAIGN: { label: 'Full Artist Campaign', options: {
        SINGLE_CAMPAIGN:{ label: 'Single Campaign — 4-week rollout, all channels',                      markets: { PER_CAMPAIGN: { price: 3000000  } } },
        EP_CAMPAIGN:    { label: 'EP Campaign — 8-week, press + media + digital',                       markets: { PER_CAMPAIGN: { price: 7000000  } } },
        ALBUM_CAMPAIGN: { label: 'Album Campaign — 12-week, full team + chart strategy',                markets: { PER_CAMPAIGN: { price: 15000000 } } },
      }},
    },
  },
];

async function run() {
  console.log('\n🚀 Creating BrandCasta media organisations...\n');

  // Fetch existing media to check if already created
  let existing = [];
  try {
    const res = await axios.get(`${API_URL}/media`);
    existing = Array.isArray(res.data) ? res.data : res.data?.media ?? [];
  } catch(e) {
    console.error('❌ Could not fetch existing media:', e.message);
    process.exit(1);
  }

  const existingNames = existing.map(m => m.name);

  for (const org of NEW_ORGS) {
    // Check if already exists
    if (existingNames.includes(org.name)) {
      const existing_record = existing.find(m => m.name === org.name);
      console.log(`⚠️  "${org.name}" already exists — updating inventory...`);
      try {
        await axios.patch(`${API_URL}/media/${existing_record.mediaId}`, { inventory: org.inventory });
        console.log(`   ✅ Inventory updated\n`);
      } catch(e) {
        console.error(`   ❌ Failed to update: ${e.response?.data?.error || e.message}\n`);
      }
      continue;
    }

    // Create new media record
    try {
      const createRes = await axios.post(`${API_URL}/media`, {
        name:         org.name,
        category:     org.category,
        contactEmail: org.contactEmail,
        monthlyReach: org.monthlyReach,
        description:  org.description,
        status:       'APPROVED',
      });

      const mediaId = createRes.data?.mediaId || createRes.data?.media?.mediaId;
      console.log(`✅ Created "${org.name}" (ID: ${mediaId})`);

      // Patch inventory
      if (mediaId) {
        await axios.patch(`${API_URL}/media/${mediaId}`, { inventory: org.inventory });
        console.log(`   ✅ Inventory populated — ${Object.keys(org.inventory).length} groups, ${Object.values(org.inventory).reduce((s,g) => s + Object.keys(g.options).length, 0)} options\n`);
      }
    } catch(e) {
      console.error(`❌ Failed to create "${org.name}": ${e.response?.data?.error || e.message}\n`);
    }
  }

  console.log('──────────────────────────────');
  console.log('Done. Check app.brandcasta.co/media to verify.\n');
}

run();
