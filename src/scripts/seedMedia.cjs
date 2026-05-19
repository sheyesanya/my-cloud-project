// Run from the frontend folder:
// node src/scripts/seedMedia.js

require('dotenv').config();
const axios = require('axios');

// ── Pull API URL from .env or fall back to asking you to set it
const API_URL = process.env.VITE_API_URL;

if (!API_URL) {
  console.error('❌ VITE_API_URL is not set in your .env file');
  process.exit(1);
}

// ── Inline seed data (avoids ES module import issues)
const MEDIA_SEED = [
  // TELEVISION
  { name:'Arise TV',                  category:'TELEVISION',   contactEmail:'bookings@arisetv.com' },
  { name:'Channels Television',       category:'TELEVISION',   contactEmail:'bookings@channelstv.com' },
  { name:'TVC Communications',        category:'TELEVISION',   contactEmail:'bookings@tvc.tv' },
  { name:'Wazobia Max',               category:'TELEVISION',   contactEmail:'bookings@wazobiamax.tv' },
  { name:'Nigerian Television Authority', category:'TELEVISION', contactEmail:'bookings@nta.ng' },
  { name:'SuperSport',                category:'TELEVISION',   contactEmail:'bookings@supersport.tv' },
  { name:'ONTV',                      category:'TELEVISION',   contactEmail:'bookings@ontv.ng' },
  { name:'HIP TV',                    category:'TELEVISION',   contactEmail:'bookings@hiptv.com' },
  { name:'Soundcity TV',              category:'TELEVISION',   contactEmail:'bookings@soundcity.tv' },
  { name:'Silverbird TV',             category:'TELEVISION',   contactEmail:'bookings@silverbirdtv.com' },
  { name:'Lagos Television',          category:'TELEVISION',   contactEmail:'bookings@lagostv.ng' },
  { name:'Trace Naija',               category:'TELEVISION',   contactEmail:'bookings@trace.tv' },
  { name:'EbonyLife TV',              category:'TELEVISION',   contactEmail:'bookings@ebonylife.tv' },
  { name:'News Central',              category:'TELEVISION',   contactEmail:'bookings@newscentral.tv' },
  { name:'Arewa 24',                  category:'TELEVISION',   contactEmail:'bookings@arewa24.com' },

  // RADIO
  { name:'Cool FM',                   category:'RADIO_AUDIO',  contactEmail:'bookings@coolfm.ng' },
  { name:'The Beat FM',               category:'RADIO_AUDIO',  contactEmail:'bookings@thebeat99.fm' },
  { name:'Wazobia FM',                category:'RADIO_AUDIO',  contactEmail:'bookings@wazobiafm.com' },
  { name:'Nigeria Info FM',           category:'RADIO_AUDIO',  contactEmail:'bookings@nigeriainfo.fm' },
  { name:'Classic FM',                category:'RADIO_AUDIO',  contactEmail:'bookings@classicfm.ng' },
  { name:'Inspiration FM',            category:'RADIO_AUDIO',  contactEmail:'bookings@inspiration.fm' },
  { name:'Soundcity Radio',           category:'RADIO_AUDIO',  contactEmail:'bookings@soundcity.fm' },
  { name:'Brila FM',                  category:'RADIO_AUDIO',  contactEmail:'bookings@brila.fm' },
  { name:'Raypower FM',               category:'RADIO_AUDIO',  contactEmail:'bookings@raypower.fm' },
  { name:'Smooth FM',                 category:'RADIO_AUDIO',  contactEmail:'bookings@smoothfm.ng' },
  { name:'City FM',                   category:'RADIO_AUDIO',  contactEmail:'bookings@cityfm.ng' },
  { name:'Max FM',                    category:'RADIO_AUDIO',  contactEmail:'bookings@maxfm.ng' },
  { name:'Naija FM',                  category:'RADIO_AUDIO',  contactEmail:'bookings@naijafm.com' },

  // PODCASTS
  { name:'I Said What I Said',        category:'PODCASTS',     contactEmail:'bookings@iswis.com' },
  { name:'The Honest Bunch Podcast',  category:'PODCASTS',     contactEmail:'bookings@honestbunch.com' },
  { name:'Tea With Tay',              category:'PODCASTS',     contactEmail:'bookings@teawithtay.com' },
  { name:'Menisms',                   category:'PODCASTS',     contactEmail:'bookings@menisms.com' },
  { name:'WithChude',                 category:'PODCASTS',     contactEmail:'bookings@withchude.com' },
  { name:'Loose Talk Podcast',        category:'PODCASTS',     contactEmail:'bookings@loosetalk.com' },
  { name:'Bahd and Boujee Podcast',   category:'PODCASTS',     contactEmail:'bookings@bahdboujee.com' },

  // OUT OF HOME
  { name:'XL Billboards',             category:'OUT_OF_HOME',  contactEmail:'bookings@xlbillboards.com' },
  { name:'Alliance Media',            category:'OUT_OF_HOME',  contactEmail:'bookings@alliancemedia.com' },
  { name:'Optimum Exposures',         category:'OUT_OF_HOME',  contactEmail:'bookings@optimum.com' },
  { name:'Loatsad Promomedia',        category:'OUT_OF_HOME',  contactEmail:'bookings@loatsad.com' },
  { name:'JCDecaux Nigeria',          category:'OUT_OF_HOME',  contactEmail:'bookings@jcdecaux.com' },
  { name:'Afromedia',                 category:'OUT_OF_HOME',  contactEmail:'bookings@afromedia.com' },

  // PRINT
  { name:'Punch Newspapers',          category:'PRINT_MEDIA',  contactEmail:'bookings@punchng.com' },
  { name:'The Guardian Nigeria',      category:'PRINT_MEDIA',  contactEmail:'bookings@guardian.ng' },
  { name:'BusinessDay',               category:'PRINT_MEDIA',  contactEmail:'bookings@businessday.ng' },
  { name:'ThisDay',                   category:'PRINT_MEDIA',  contactEmail:'bookings@thisdaylive.com' },
  { name:'Vanguard Newspapers',       category:'PRINT_MEDIA',  contactEmail:'bookings@vanguardngr.com' },
  { name:'The Nation Newspaper',      category:'PRINT_MEDIA',  contactEmail:'bookings@thenationonlineng.net' },

  // INFLUENCERS
  { name:'Davido',                    category:'INFLUENCERS',  contactEmail:'bookings@davido.com' },
  { name:'Broda Shaggi',              category:'INFLUENCERS',  contactEmail:'bookings@brodashaggi.com' },
  { name:'Taaooma',                   category:'INFLUENCERS',  contactEmail:'bookings@taaooma.com' },
  { name:'Mr Macaroni',               category:'INFLUENCERS',  contactEmail:'bookings@mrmacaroni.com' },
  { name:'Toke Makinwa',              category:'INFLUENCERS',  contactEmail:'bookings@tokemakinwa.com' },
];

async function seedMedia() {
  console.log(`\n🚀 Seeding media to: ${API_URL}\n`);
  let success = 0;
  let failed  = 0;

  for (const media of MEDIA_SEED) {
    try {
      await axios.post(`${API_URL}/media`, {
        name:         media.name,
        category:     media.category,
        contactEmail: media.contactEmail,
        inventory:    {},
      });
      console.log(`  ✅ ${media.name}`);
      success++;
    } catch (error) {
      console.error(`  ❌ ${media.name}: ${JSON.stringify(error.response?.data || error.message)}`);
      failed++;
    }
  }

  console.log(`\n──────────────────────────────`);
  console.log(`✅ Created: ${success}`);
  if (failed) console.log(`❌ Failed:  ${failed}`);
  console.log(`──────────────────────────────\n`);
}

seedMedia();