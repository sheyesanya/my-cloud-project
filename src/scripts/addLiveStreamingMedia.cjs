require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.VITE_API_URL;
if (!API_URL) { console.error('❌ VITE_API_URL not set'); process.exit(1); }

const LIVE_STREAMING_ORGS = [
  {
    name: 'Carter Efe Live',
    description: 'Carter Efe — Nigeria\'s #1 streamer, 560k+ followers. TikTok Live, Instagram Live & Twitch.',
    inventory: {
      TIKTOK_LIVE: { label: 'TikTok Live', options: {
        SHOUTOUT_5MIN:   { label: '5 Min Brand Shoutout',         markets: { PER_STREAM: { price: 300000  } } },
        SEGMENT_15MIN:   { label: '15 Min Sponsored Segment',     markets: { PER_STREAM: { price: 900000  } } },
        SEGMENT_30MIN:   { label: '30 Min Sponsored Segment',     markets: { PER_STREAM: { price: 1800000 } } },
        FULL_LIVE:       { label: 'Full Live Sponsorship',        markets: { PER_STREAM: { price: 4000000 } } },
        PRODUCT_DEMO:    { label: 'Live Product Demo',            markets: { PER_STREAM: { price: 2500000 } } },
        GIFTING_PROMO:   { label: 'Gifting Campaign Promotion',   markets: { PER_STREAM: { price: 1200000 } } },
      }},
      INSTAGRAM_LIVE: { label: 'Instagram Live', options: {
        SHOUTOUT_5MIN:   { label: '5 Min Brand Shoutout',         markets: { PER_STREAM: { price: 250000  } } },
        SEGMENT_15MIN:   { label: '15 Min Sponsored Segment',     markets: { PER_STREAM: { price: 750000  } } },
        SEGMENT_30MIN:   { label: '30 Min Sponsored Segment',     markets: { PER_STREAM: { price: 1500000 } } },
        FULL_LIVE:       { label: 'Full Live Sponsorship',        markets: { PER_STREAM: { price: 3500000 } } },
        GUEST_FEATURE:   { label: 'Guest Feature / Collab Live',  markets: { PER_STREAM: { price: 2000000 } } },
        PRODUCT_DEMO:    { label: 'Live Product Demo',            markets: { PER_STREAM: { price: 2000000 } } },
      }},
      TWITCH_STREAMING: { label: 'Twitch Streaming', options: {
        OVERLAY_BANNER:  { label: 'Stream Overlay Banner',        markets: { PER_STREAM: { price: 500000  } } },
        SEGMENT_5MIN:    { label: '5 Min Sponsored Segment',      markets: { PER_STREAM: { price: 400000  } } },
        SEGMENT_15MIN:   { label: '15 Min Sponsored Segment',     markets: { PER_STREAM: { price: 1250000 } } },
        SEGMENT_30MIN:   { label: '30 Min Sponsored Segment',     markets: { PER_STREAM: { price: 2500000 } } },
        FULL_STREAM:     { label: 'Full Stream Sponsorship',      markets: { PER_STREAM: { price: 5000000 } } },
        PANEL_AD:        { label: 'Channel Panel Ad (monthly)',   markets: { MONTHLY:     { price: 350000  } } },
      }},
    },
  },
  {
    name: 'Shank Comics Live',
    description: 'Shank Comics — 258k+ Twitch followers. First Nigerian to hit 100k on Twitch. Kai Cenat Streamer University alumni.',
    inventory: {
      TIKTOK_LIVE: { label: 'TikTok Live', options: {
        SHOUTOUT_5MIN:   { label: '5 Min Brand Shoutout',         markets: { PER_STREAM: { price: 180000  } } },
        SEGMENT_15MIN:   { label: '15 Min Sponsored Segment',     markets: { PER_STREAM: { price: 550000  } } },
        SEGMENT_30MIN:   { label: '30 Min Sponsored Segment',     markets: { PER_STREAM: { price: 1100000 } } },
        FULL_LIVE:       { label: 'Full Live Sponsorship',        markets: { PER_STREAM: { price: 2500000 } } },
        PRODUCT_DEMO:    { label: 'Live Product Demo',            markets: { PER_STREAM: { price: 1500000 } } },
        GIFTING_PROMO:   { label: 'Gifting Campaign Promotion',   markets: { PER_STREAM: { price: 750000  } } },
      }},
      INSTAGRAM_LIVE: { label: 'Instagram Live', options: {
        SHOUTOUT_5MIN:   { label: '5 Min Brand Shoutout',         markets: { PER_STREAM: { price: 150000  } } },
        SEGMENT_15MIN:   { label: '15 Min Sponsored Segment',     markets: { PER_STREAM: { price: 450000  } } },
        SEGMENT_30MIN:   { label: '30 Min Sponsored Segment',     markets: { PER_STREAM: { price: 900000  } } },
        FULL_LIVE:       { label: 'Full Live Sponsorship',        markets: { PER_STREAM: { price: 2000000 } } },
        GUEST_FEATURE:   { label: 'Guest Feature / Collab Live',  markets: { PER_STREAM: { price: 1200000 } } },
        PRODUCT_DEMO:    { label: 'Live Product Demo',            markets: { PER_STREAM: { price: 1200000 } } },
      }},
      TWITCH_STREAMING: { label: 'Twitch Streaming', options: {
        OVERLAY_BANNER:  { label: 'Stream Overlay Banner',        markets: { PER_STREAM: { price: 300000  } } },
        SEGMENT_5MIN:    { label: '5 Min Sponsored Segment',      markets: { PER_STREAM: { price: 250000  } } },
        SEGMENT_15MIN:   { label: '15 Min Sponsored Segment',     markets: { PER_STREAM: { price: 750000  } } },
        SEGMENT_30MIN:   { label: '30 Min Sponsored Segment',     markets: { PER_STREAM: { price: 1500000 } } },
        FULL_STREAM:     { label: 'Full Stream Sponsorship',      markets: { PER_STREAM: { price: 3000000 } } },
        PANEL_AD:        { label: 'Channel Panel Ad (monthly)',   markets: { MONTHLY:     { price: 200000  } } },
      }},
    },
  },
  {
    name: 'Rynenzo (Enzo) Live',
    description: 'Enzo — 204k+ Twitch followers. Gaming pioneer, streamed with Rema. Technical gaming excellence.',
    inventory: {
      TIKTOK_LIVE: { label: 'TikTok Live', options: {
        SHOUTOUT_5MIN:   { label: '5 Min Brand Shoutout',         markets: { PER_STREAM: { price: 150000  } } },
        SEGMENT_15MIN:   { label: '15 Min Sponsored Segment',     markets: { PER_STREAM: { price: 450000  } } },
        SEGMENT_30MIN:   { label: '30 Min Sponsored Segment',     markets: { PER_STREAM: { price: 900000  } } },
        FULL_LIVE:       { label: 'Full Live Sponsorship',        markets: { PER_STREAM: { price: 2000000 } } },
        GAMING_PROMO:    { label: 'In-Game Brand Integration',    markets: { PER_STREAM: { price: 700000  } } },
      }},
      INSTAGRAM_LIVE: { label: 'Instagram Live', options: {
        SHOUTOUT_5MIN:   { label: '5 Min Brand Shoutout',         markets: { PER_STREAM: { price: 120000  } } },
        SEGMENT_15MIN:   { label: '15 Min Sponsored Segment',     markets: { PER_STREAM: { price: 380000  } } },
        SEGMENT_30MIN:   { label: '30 Min Sponsored Segment',     markets: { PER_STREAM: { price: 750000  } } },
        FULL_LIVE:       { label: 'Full Live Sponsorship',        markets: { PER_STREAM: { price: 1800000 } } },
        GUEST_FEATURE:   { label: 'Guest Feature / Collab Live',  markets: { PER_STREAM: { price: 1000000 } } },
      }},
      TWITCH_STREAMING: { label: 'Twitch Streaming', options: {
        OVERLAY_BANNER:  { label: 'Stream Overlay Banner',        markets: { PER_STREAM: { price: 250000  } } },
        SEGMENT_5MIN:    { label: '5 Min Sponsored Segment',      markets: { PER_STREAM: { price: 200000  } } },
        SEGMENT_15MIN:   { label: '15 Min Sponsored Segment',     markets: { PER_STREAM: { price: 600000  } } },
        SEGMENT_30MIN:   { label: '30 Min Sponsored Segment',     markets: { PER_STREAM: { price: 1200000 } } },
        FULL_STREAM:     { label: 'Full Stream Sponsorship',      markets: { PER_STREAM: { price: 2500000 } } },
        GAMING_OVERLAY:  { label: 'In-Game Brand Overlay',        markets: { PER_STREAM: { price: 800000  } } },
        PANEL_AD:        { label: 'Channel Panel Ad (monthly)',   markets: { MONTHLY:     { price: 180000  } } },
      }},
    },
  },
  {
    name: 'Peller Live',
    description: 'Peller — 183k+ followers. Nigeria\'s first official Kick brand ambassador. Lifestyle & entertainment.',
    inventory: {
      TIKTOK_LIVE: { label: 'TikTok Live', options: {
        SHOUTOUT_5MIN:   { label: '5 Min Brand Shoutout',         markets: { PER_STREAM: { price: 130000  } } },
        SEGMENT_15MIN:   { label: '15 Min Sponsored Segment',     markets: { PER_STREAM: { price: 400000  } } },
        SEGMENT_30MIN:   { label: '30 Min Sponsored Segment',     markets: { PER_STREAM: { price: 800000  } } },
        FULL_LIVE:       { label: 'Full Live Sponsorship',        markets: { PER_STREAM: { price: 1800000 } } },
        PRODUCT_DEMO:    { label: 'Live Product Demo',            markets: { PER_STREAM: { price: 1200000 } } },
        GIFTING_PROMO:   { label: 'Gifting Campaign Promotion',   markets: { PER_STREAM: { price: 600000  } } },
      }},
      INSTAGRAM_LIVE: { label: 'Instagram Live', options: {
        SHOUTOUT_5MIN:   { label: '5 Min Brand Shoutout',         markets: { PER_STREAM: { price: 110000  } } },
        SEGMENT_15MIN:   { label: '15 Min Sponsored Segment',     markets: { PER_STREAM: { price: 330000  } } },
        SEGMENT_30MIN:   { label: '30 Min Sponsored Segment',     markets: { PER_STREAM: { price: 650000  } } },
        FULL_LIVE:       { label: 'Full Live Sponsorship',        markets: { PER_STREAM: { price: 1500000 } } },
        GUEST_FEATURE:   { label: 'Guest Feature / Collab Live',  markets: { PER_STREAM: { price: 900000  } } },
        PRODUCT_DEMO:    { label: 'Live Product Demo',            markets: { PER_STREAM: { price: 900000  } } },
      }},
      TWITCH_STREAMING: { label: 'Twitch Streaming', options: {
        OVERLAY_BANNER:  { label: 'Stream Overlay Banner',        markets: { PER_STREAM: { price: 220000  } } },
        SEGMENT_5MIN:    { label: '5 Min Sponsored Segment',      markets: { PER_STREAM: { price: 200000  } } },
        SEGMENT_15MIN:   { label: '15 Min Sponsored Segment',     markets: { PER_STREAM: { price: 550000  } } },
        SEGMENT_30MIN:   { label: '30 Min Sponsored Segment',     markets: { PER_STREAM: { price: 1100000 } } },
        FULL_STREAM:     { label: 'Full Stream Sponsorship',      markets: { PER_STREAM: { price: 2200000 } } },
        PANEL_AD:        { label: 'Channel Panel Ad (monthly)',   markets: { MONTHLY:     { price: 160000  } } },
      }},
    },
  },
  {
    name: 'Ojo Live',
    description: 'Ojo — 66k+ Twitch followers. Strong concurrent viewership. Matchmaking & community content.',
    inventory: {
      TIKTOK_LIVE: { label: 'TikTok Live', options: {
        SHOUTOUT_5MIN:   { label: '5 Min Brand Shoutout',         markets: { PER_STREAM: { price: 70000   } } },
        SEGMENT_15MIN:   { label: '15 Min Sponsored Segment',     markets: { PER_STREAM: { price: 200000  } } },
        SEGMENT_30MIN:   { label: '30 Min Sponsored Segment',     markets: { PER_STREAM: { price: 400000  } } },
        FULL_LIVE:       { label: 'Full Live Sponsorship',        markets: { PER_STREAM: { price: 900000  } } },
        PRODUCT_DEMO:    { label: 'Live Product Demo',            markets: { PER_STREAM: { price: 600000  } } },
      }},
      INSTAGRAM_LIVE: { label: 'Instagram Live', options: {
        SHOUTOUT_5MIN:   { label: '5 Min Brand Shoutout',         markets: { PER_STREAM: { price: 60000   } } },
        SEGMENT_15MIN:   { label: '15 Min Sponsored Segment',     markets: { PER_STREAM: { price: 180000  } } },
        SEGMENT_30MIN:   { label: '30 Min Sponsored Segment',     markets: { PER_STREAM: { price: 350000  } } },
        FULL_LIVE:       { label: 'Full Live Sponsorship',        markets: { PER_STREAM: { price: 800000  } } },
        GUEST_FEATURE:   { label: 'Guest Feature / Collab Live',  markets: { PER_STREAM: { price: 500000  } } },
      }},
      TWITCH_STREAMING: { label: 'Twitch Streaming', options: {
        OVERLAY_BANNER:  { label: 'Stream Overlay Banner',        markets: { PER_STREAM: { price: 120000  } } },
        SEGMENT_5MIN:    { label: '5 Min Sponsored Segment',      markets: { PER_STREAM: { price: 100000  } } },
        SEGMENT_15MIN:   { label: '15 Min Sponsored Segment',     markets: { PER_STREAM: { price: 300000  } } },
        SEGMENT_30MIN:   { label: '30 Min Sponsored Segment',     markets: { PER_STREAM: { price: 600000  } } },
        FULL_STREAM:     { label: 'Full Stream Sponsorship',      markets: { PER_STREAM: { price: 1200000 } } },
        PANEL_AD:        { label: 'Channel Panel Ad (monthly)',   markets: { MONTHLY:     { price: 85000   } } },
      }},
    },
  },
  {
    name: 'Lord Lamba Live',
    description: 'Lord Lamba — 50k+ Twitch followers. Comedy & entertainment streaming. High engagement audience.',
    inventory: {
      TIKTOK_LIVE: { label: 'TikTok Live', options: {
        SHOUTOUT_5MIN:   { label: '5 Min Brand Shoutout',         markets: { PER_STREAM: { price: 60000   } } },
        SEGMENT_15MIN:   { label: '15 Min Sponsored Segment',     markets: { PER_STREAM: { price: 180000  } } },
        SEGMENT_30MIN:   { label: '30 Min Sponsored Segment',     markets: { PER_STREAM: { price: 350000  } } },
        FULL_LIVE:       { label: 'Full Live Sponsorship',        markets: { PER_STREAM: { price: 800000  } } },
        PRODUCT_DEMO:    { label: 'Live Product Demo',            markets: { PER_STREAM: { price: 500000  } } },
      }},
      INSTAGRAM_LIVE: { label: 'Instagram Live', options: {
        SHOUTOUT_5MIN:   { label: '5 Min Brand Shoutout',         markets: { PER_STREAM: { price: 50000   } } },
        SEGMENT_15MIN:   { label: '15 Min Sponsored Segment',     markets: { PER_STREAM: { price: 150000  } } },
        SEGMENT_30MIN:   { label: '30 Min Sponsored Segment',     markets: { PER_STREAM: { price: 300000  } } },
        FULL_LIVE:       { label: 'Full Live Sponsorship',        markets: { PER_STREAM: { price: 700000  } } },
        GUEST_FEATURE:   { label: 'Guest Feature / Collab Live',  markets: { PER_STREAM: { price: 400000  } } },
      }},
      TWITCH_STREAMING: { label: 'Twitch Streaming', options: {
        OVERLAY_BANNER:  { label: 'Stream Overlay Banner',        markets: { PER_STREAM: { price: 100000  } } },
        SEGMENT_5MIN:    { label: '5 Min Sponsored Segment',      markets: { PER_STREAM: { price: 100000  } } },
        SEGMENT_15MIN:   { label: '15 Min Sponsored Segment',     markets: { PER_STREAM: { price: 250000  } } },
        SEGMENT_30MIN:   { label: '30 Min Sponsored Segment',     markets: { PER_STREAM: { price: 500000  } } },
        FULL_STREAM:     { label: 'Full Stream Sponsorship',      markets: { PER_STREAM: { price: 1000000 } } },
        PANEL_AD:        { label: 'Channel Panel Ad (monthly)',   markets: { MONTHLY:     { price: 70000   } } },
      }},
    },
  },
  {
    name: 'Cruel Santino Live',
    description: 'Cruel Santino (Subaruworld) — Alternative music, art & lifestyle streaming. Niche premium audience.',
    inventory: {
      TIKTOK_LIVE: { label: 'TikTok Live', options: {
        SHOUTOUT_5MIN:   { label: '5 Min Brand Shoutout',         markets: { PER_STREAM: { price: 40000   } } },
        SEGMENT_15MIN:   { label: '15 Min Sponsored Segment',     markets: { PER_STREAM: { price: 120000  } } },
        SEGMENT_30MIN:   { label: '30 Min Sponsored Segment',     markets: { PER_STREAM: { price: 240000  } } },
        FULL_LIVE:       { label: 'Full Live Sponsorship',        markets: { PER_STREAM: { price: 550000  } } },
      }},
      INSTAGRAM_LIVE: { label: 'Instagram Live', options: {
        SHOUTOUT_5MIN:   { label: '5 Min Brand Shoutout',         markets: { PER_STREAM: { price: 35000   } } },
        SEGMENT_15MIN:   { label: '15 Min Sponsored Segment',     markets: { PER_STREAM: { price: 100000  } } },
        SEGMENT_30MIN:   { label: '30 Min Sponsored Segment',     markets: { PER_STREAM: { price: 200000  } } },
        FULL_LIVE:       { label: 'Full Live Sponsorship',        markets: { PER_STREAM: { price: 450000  } } },
        GUEST_FEATURE:   { label: 'Guest Feature / Collab Live',  markets: { PER_STREAM: { price: 280000  } } },
      }},
      TWITCH_STREAMING: { label: 'Twitch Streaming', options: {
        OVERLAY_BANNER:  { label: 'Stream Overlay Banner',        markets: { PER_STREAM: { price: 60000   } } },
        SEGMENT_5MIN:    { label: '5 Min Sponsored Segment',      markets: { PER_STREAM: { price: 50000   } } },
        SEGMENT_15MIN:   { label: '15 Min Sponsored Segment',     markets: { PER_STREAM: { price: 150000  } } },
        SEGMENT_30MIN:   { label: '30 Min Sponsored Segment',     markets: { PER_STREAM: { price: 300000  } } },
        FULL_STREAM:     { label: 'Full Stream Sponsorship',      markets: { PER_STREAM: { price: 600000  } } },
        PANEL_AD:        { label: 'Channel Panel Ad (monthly)',   markets: { MONTHLY:     { price: 45000   } } },
      }},
    },
  },
];

async function run() {
  console.log('\n📡 Adding Live Streaming Ads media inventory...\n');

  let existing = [];
  try {
    const res = await axios.get(`${API_URL}/media`);
    existing = Array.isArray(res.data) ? res.data : res.data?.media ?? [];
  } catch(e) { console.error('❌ Could not fetch media:', e.message); process.exit(1); }

  const existingNames = existing.map(m => m.name);

  for (const org of LIVE_STREAMING_ORGS) {
    if (existingNames.includes(org.name)) {
      const record = existing.find(m => m.name === org.name);
      console.log(`⚠️  "${org.name}" exists — updating inventory...`);
      try {
        await axios.patch(`${API_URL}/media/${record.mediaId}`, { inventory: org.inventory });
        console.log(`   ✅ Updated\n`);
      } catch(e) { console.error(`   ❌ ${e.message}\n`); }
      continue;
    }

    try {
      const res = await axios.post(`${API_URL}/media`, {
        name:         org.name,
        category:     'LIVE_STREAMING',
        contactEmail: 'brandcastang@gmail.com',
        monthlyReach: org.description.match(/\d[\d,k+]+/)?.[0] || '50k+',
        description:  org.description,
        status:       'APPROVED',
      });

      const mediaId = res.data?.mediaId || res.data?.media?.mediaId;
      console.log(`✅ Created "${org.name}"`);

      if (mediaId) {
        await axios.patch(`${API_URL}/media/${mediaId}`, { inventory: org.inventory });
        const groups  = Object.keys(org.inventory).length;
        const options = Object.values(org.inventory).reduce((s,g) => s + Object.keys(g.options).length, 0);
        console.log(`   ✅ Inventory: ${groups} groups, ${options} options\n`);
      }
    } catch(e) { console.error(`❌ "${org.name}": ${e.response?.data?.error || e.message}\n`); }
  }

  console.log('──────────────────────────────');
  console.log('Done. All Live Streaming Ads media created.\n');
}

run();
