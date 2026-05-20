require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.VITE_API_URL;
if (!API_URL) { console.error('❌ VITE_API_URL not set'); process.exit(1); }

const MEDIA_SEED = [

  // ══════════════════════════════════════════
  // TELEVISION
  // ══════════════════════════════════════════
  { name:'Arise TV',                  category:'TELEVISION',   contactEmail:'bookings@arisetv.com' },
  { name:'Channels Television',       category:'TELEVISION',   contactEmail:'bookings@channelstv.com' },
  { name:'TVC Communications',        category:'TELEVISION',   contactEmail:'bookings@tvc.tv' },
  { name:'Wazobia Max',               category:'TELEVISION',   contactEmail:'bookings@wazobiamax.tv' },
  { name:'Nigerian Television Authority', category:'TELEVISION', contactEmail:'bookings@nta.ng' },
  { name:'SuperSport',                category:'TELEVISION',   contactEmail:'bookings@supersport.tv' },
  { name:'ONTV',                      category:'TELEVISION',   contactEmail:'bookings@ontv.ng' },
  { name:'HIP TV',                    category:'TELEVISION',   contactEmail:'bookings@hiptv.com' },
  { name:'Soundcity TV',              category:'TELEVISION',   contactEmail:'sheyesanya@gmail.com' },
  { name:'Arewa 24',                  category:'TELEVISION',   contactEmail:'bookings@arewa24.com' },
  { name:'MiTV',                      category:'TELEVISION',   contactEmail:'bookings@mitv.com' },
  { name:'Silverbird TV',             category:'TELEVISION',   contactEmail:'bookings@silverbirdtv.com' },
  { name:'WAP TV',                    category:'TELEVISION',   contactEmail:'bookings@waptv.tv' },
  { name:'Lagos Television',          category:'TELEVISION',   contactEmail:'bookings@lagostv.ng' },
  { name:'Trace Naija',               category:'TELEVISION',   contactEmail:'bookings@trace.tv' },
  { name:'EbonyLife TV',              category:'TELEVISION',   contactEmail:'bookings@ebonylife.tv' },
  { name:'Afro Music English',        category:'TELEVISION',   contactEmail:'bookings@afromusic.tv' },
  { name:'News Central',              category:'TELEVISION',   contactEmail:'bookings@newscentral.tv' },
  { name:'Spice TV',                  category:'TELEVISION',   contactEmail:'bookings@spicetv.tv' },
  { name:'Africa Magic Urban',        category:'TELEVISION',   contactEmail:'bookings@africamagic.tv' },
  { name:'Africa Magic Family',       category:'TELEVISION',   contactEmail:'bookings@africamagicfamily.tv' },
  { name:'Trybe TV',                  category:'TELEVISION',   contactEmail:'bookings@trybetv.com' },
  { name:'Televista',                 category:'TELEVISION',   contactEmail:'bookings@televista.ng' },
  { name:'Access24 TV',               category:'TELEVISION',   contactEmail:'bookings@access24.tv' },

  // ══════════════════════════════════════════
  // RADIO — LAGOS
  // ══════════════════════════════════════════
  { name:'Cool FM Lagos',             category:'RADIO_AUDIO',  contactEmail:'bookings@coolfm.ng' },
  { name:'The Beat FM Lagos',         category:'RADIO_AUDIO',  contactEmail:'bookings@thebeat99.fm' },
  { name:'Wazobia FM Lagos',          category:'RADIO_AUDIO',  contactEmail:'bookings@wazobiafm.com' },
  { name:'Nigeria Info FM Lagos',     category:'RADIO_AUDIO',  contactEmail:'bookings@nigeriainfo.fm' },
  { name:'Classic FM Lagos',          category:'RADIO_AUDIO',  contactEmail:'bookings@classicfm.ng' },
  { name:'Soundcity Radio Lagos',     category:'RADIO_AUDIO',  contactEmail:'bookings@soundcity.fm' },
  { name:'Brila FM Lagos',            category:'RADIO_AUDIO',  contactEmail:'bookings@brila.fm' },
  { name:'Raypower FM Lagos',         category:'RADIO_AUDIO',  contactEmail:'bookings@raypower.fm' },
  { name:'Urban96 FM Lagos',          category:'RADIO_AUDIO',  contactEmail:'bookings@urban96.fm' },
  { name:'City FM Lagos',             category:'RADIO_AUDIO',  contactEmail:'bookings@cityfm.ng' },
  { name:'Naija FM Lagos',            category:'RADIO_AUDIO',  contactEmail:'bookings@naijafm.com' },
  { name:'Smooth FM Lagos',           category:'RADIO_AUDIO',  contactEmail:'bookings@smoothfm.ng' },
  { name:'Lagos Talks 91.3 FM',       category:'RADIO_AUDIO',  contactEmail:'bookings@lagostalks.fm' },
  { name:'Spice FM Lagos',            category:'RADIO_AUDIO',  contactEmail:'bookings@spicefm.ng' },
  { name:'RadioX Lagos',              category:'RADIO_AUDIO',  contactEmail:'bookings@radiox.ng' },
  { name:'Inspiration FM Lagos',      category:'RADIO_AUDIO',  contactEmail:'bookings@inspiration.fm' },
  { name:'Vybz FM Lagos',             category:'RADIO_AUDIO',  contactEmail:'bookings@vybzfm.ng' },
  { name:'Kiss FM Lagos',             category:'RADIO_AUDIO',  contactEmail:'bookings@kissfm.ng' },
  { name:'Max FM Lagos',              category:'RADIO_AUDIO',  contactEmail:'bookings@maxfm.ng' },

  // ══════════════════════════════════════════
  // RADIO — ABUJA
  // ══════════════════════════════════════════
  { name:'Cool FM Abuja',             category:'RADIO_AUDIO',  contactEmail:'bookings-abuja@coolfm.ng' },
  { name:'Wazobia FM Abuja',          category:'RADIO_AUDIO',  contactEmail:'bookings-abuja@wazobiafm.com' },
  { name:'The Beat FM Abuja',         category:'RADIO_AUDIO',  contactEmail:'bookings-abuja@thebeat99.fm' },
  { name:'Classic FM Abuja',          category:'RADIO_AUDIO',  contactEmail:'bookings-abuja@classicfm.ng' },
  { name:'Nigeria Info FM Abuja',     category:'RADIO_AUDIO',  contactEmail:'bookings-abuja@nigeriainfo.fm' },
  { name:'Brila FM Abuja',            category:'RADIO_AUDIO',  contactEmail:'bookings-abuja@brila.fm' },
  { name:'Kapital FM 92.9',           category:'RADIO_AUDIO',  contactEmail:'bookings@kapitalfm.com.ng' },
  { name:'Wazobia FM Abuja',          category:'RADIO_AUDIO',  contactEmail:'bookings@wazobiafmabuja.com' },
  { name:'Aso FM 97.1',               category:'RADIO_AUDIO',  contactEmail:'bookings@asofm.ng' },
  { name:'Sunrise FM Abuja',          category:'RADIO_AUDIO',  contactEmail:'bookings@sunrisefm.ng' },

  // ══════════════════════════════════════════
  // RADIO — PORT HARCOURT
  // ══════════════════════════════════════════
  { name:'Cool FM Port Harcourt',     category:'RADIO_AUDIO',  contactEmail:'bookings-ph@coolfm.ng' },
  { name:'Wazobia FM Port Harcourt',  category:'RADIO_AUDIO',  contactEmail:'bookings-ph@wazobiafm.com' },
  { name:'The Beat FM Port Harcourt', category:'RADIO_AUDIO',  contactEmail:'bookings-ph@thebeat99.fm' },
  { name:'Rhythm FM 93.7 PH',         category:'RADIO_AUDIO',  contactEmail:'bookings@rhythmfmph.com' },
  { name:'Nigeria Info FM PH',        category:'RADIO_AUDIO',  contactEmail:'bookings-ph@nigeriainfo.fm' },
  { name:'Hot FM PH',                 category:'RADIO_AUDIO',  contactEmail:'bookings@hotfmph.com' },
  { name:'Treasure FM',               category:'RADIO_AUDIO',  contactEmail:'bookings@treasurefm.ng' },

  // ══════════════════════════════════════════
  // RADIO — KANO & NORTH
  // ══════════════════════════════════════════
  { name:'Cool FM Kano',              category:'RADIO_AUDIO',  contactEmail:'bookings-kano@coolfm.ng' },
  { name:'Wazobia FM Kano',           category:'RADIO_AUDIO',  contactEmail:'bookings-kano@wazobiafm.com' },
  { name:'Wazobia FM Onitsha',        category:'RADIO_AUDIO',  contactEmail:'bookings-onitsha@wazobiafm.com' },
  { name:'Freedom FM Kano',           category:'RADIO_AUDIO',  contactEmail:'bookings@freedomfmkano.com' },
  { name:'Rarara FM Kano',            category:'RADIO_AUDIO',  contactEmail:'bookings@rararafm.ng' },
  { name:'Royal FM Kano',             category:'RADIO_AUDIO',  contactEmail:'bookings@royalfmkano.ng' },
  { name:'Gombe FM',                  category:'RADIO_AUDIO',  contactEmail:'bookings@gombefm.ng' },
  { name:'Minna FM',                  category:'RADIO_AUDIO',  contactEmail:'bookings@minnafm.ng' },
  { name:'Adamawa Radio',             category:'RADIO_AUDIO',  contactEmail:'bookings@adamawaradio.ng' },

  // ══════════════════════════════════════════
  // RADIO — SOUTH WEST
  // ══════════════════════════════════════════
  { name:'Fresh FM Ibadan 105.9',     category:'RADIO_AUDIO',  contactEmail:'bookings@freshfmibadan.com' },
  { name:'Agidigbo FM Ibadan',        category:'RADIO_AUDIO',  contactEmail:'bookings@agidigbofm.ng' },
  { name:'OGBC Radio Abeokuta',       category:'RADIO_AUDIO',  contactEmail:'bookings@ogbc.ng' },
  { name:'Positive FM Ile-Ife',       category:'RADIO_AUDIO',  contactEmail:'bookings@positivefm.ng' },
  { name:'BCOS FM Ibadan',            category:'RADIO_AUDIO',  contactEmail:'bookings@bcos.ng' },
  { name:'Splash FM Ibadan',          category:'RADIO_AUDIO',  contactEmail:'bookings@splashfm.ng' },

  // ══════════════════════════════════════════
  // RADIO — SOUTH EAST & SOUTH SOUTH
  // ══════════════════════════════════════════
  { name:'ABS FM Awka',               category:'RADIO_AUDIO',  contactEmail:'bookings@absfm.ng' },
  { name:'Imo State Broadcasting',    category:'RADIO_AUDIO',  contactEmail:'bookings@imosbc.ng' },
  { name:'Enugu Broadcasting Service',category:'RADIO_AUDIO',  contactEmail:'bookings@ebsradio.ng' },
  { name:'Orient FM Enugu',           category:'RADIO_AUDIO',  contactEmail:'bookings@orientfm.ng' },
  { name:'Delta Broadcasting',        category:'RADIO_AUDIO',  contactEmail:'bookings@dbsradio.ng' },
  { name:'Cross River Broadcasting',  category:'RADIO_AUDIO',  contactEmail:'bookings@crbs.ng' },

  // ══════════════════════════════════════════
  // PODCASTS
  // ══════════════════════════════════════════
  { name:'I Said What I Said',        category:'PODCASTS',     contactEmail:'bookings@iswis.com' },
  { name:'Off-Air With Toolz & Gbemi',        category:'PODCASTS',     contactEmail:'bookings@offairshow.com' },
  { name:'The Honest Bunch Podcast',  category:'PODCASTS',     contactEmail:'bookings@honestbunch.com' },
  { name:'Tea With Tay',              category:'PODCASTS',     contactEmail:'bookings@teawithtay.com' },
  { name:'Menisms',                   category:'PODCASTS',     contactEmail:'bookings@menisms.com' },
  { name:'WithChude',                 category:'PODCASTS',     contactEmail:'bookings@withchude.com' },
  { name:'Road to 30',                category:'PODCASTS',     contactEmail:'bookings@roadto30.com' },
  { name:'234 Essential',             category:'PODCASTS',     contactEmail:'bookings@234essential.com' },
  { name:'Loose Talk Podcast',        category:'PODCASTS',     contactEmail:'bookings@loosetalk.com' },
  { name:'Bahd and Boujee Podcast',   category:'PODCASTS',     contactEmail:'bookings@bahdboujee.com' },
  { name:'How Far? Podcast',          category:'PODCASTS',     contactEmail:'bookings@howfarpodcast.com' },
  { name:'The Walk With Toke Makinwa',category:'PODCASTS',     contactEmail:'bookings@tokemakinwa.com' },
  { name:'The Uncut Podcast',         category:'PODCASTS',     contactEmail:'bookings@uncutpodcast.ng' },
  { name:'Naija Jollof Podcast',      category:'PODCASTS',     contactEmail:'bookings@naijajollof.com' },
  { name:'Business Undressed',        category:'PODCASTS',     contactEmail:'bookings@businessundressed.ng' },
  { name:'The Toolz Effect',          category:'PODCASTS',     contactEmail:'bookings@toolzeffect.com' },
  { name:'Afripolitan Podcast',      category:'PODCASTS',     contactEmail:'bookings@afripolitan.com' },
  { name:'Tech Cabal Podcast',        category:'PODCASTS',     contactEmail:'bookings@techcabal.com' },
  { name:'No Chill Podcast',          category:'PODCASTS',     contactEmail:'bookings@nochillpodcast.ng' },
  { name:'Zikoko Podcast',            category:'PODCASTS',     contactEmail:'bookings@zikoko.com' },
  { name:'Married To Lagos Podcast',  category:'PODCASTS',     contactEmail:'bookings@marriedtolagos.com' },
  { name:'Aunty Fifi Podcast',        category:'PODCASTS',     contactEmail:'bookings@auntyfifi.ng' },
  { name:'Stir It Up Podcast',        category:'PODCASTS',     contactEmail:'bookings@stitupodcast.ng' },

  // ══════════════════════════════════════════
  // OUT OF HOME
  // ══════════════════════════════════════════
  { name:'XL Billboards',             category:'OUT_OF_HOME',  contactEmail:'bookings@xlbillboards.com' },
  { name:'Alliance Media',            category:'OUT_OF_HOME',  contactEmail:'bookings@alliancemedia.com' },
  { name:'Optimum Exposures',         category:'OUT_OF_HOME',  contactEmail:'bookings@optimum.com' },
  { name:'Loatsad Promomedia',        category:'OUT_OF_HOME',  contactEmail:'bookings@loatsad.com' },
  { name:'JCDecaux Nigeria',          category:'OUT_OF_HOME',  contactEmail:'bookings@jcdecaux.com' },
  { name:'Afromedia',                 category:'OUT_OF_HOME',  contactEmail:'bookings@afromedia.com' },
  { name:'Outdoors.ng',               category:'OUT_OF_HOME',  contactEmail:'bookings@outdoors.ng' },
  { name:'JMT Communications',        category:'OUT_OF_HOME',  contactEmail:'bookings@jmtcomms.ng' },
  { name:'VAAD Media',                category:'OUT_OF_HOME',  contactEmail:'bookings@vaadmedia.ng' },
  { name:'Alternative Adverts',       category:'OUT_OF_HOME',  contactEmail:'bookings@alternativeadverts.ng' },
  { name:'Unique Billboards',         category:'OUT_OF_HOME',  contactEmail:'bookings@uniquebillboards.ng' },
  { name:'Nimbus Media',              category:'OUT_OF_HOME',  contactEmail:'bookings@nimbusmedia.ng' },
  { name:'International Billboard Advertising', category:'OUT_OF_HOME', contactEmail:'bookings@iba.ng' },

  // ══════════════════════════════════════════
  // PRINT
  // ══════════════════════════════════════════
  { name:'Punch Newspapers',          category:'PRINT_MEDIA',  contactEmail:'bookings@punchng.com' },
  { name:'The Guardian Nigeria',      category:'PRINT_MEDIA',  contactEmail:'bookings@guardian.ng' },
  { name:'BusinessDay',               category:'PRINT_MEDIA',  contactEmail:'bookings@businessday.ng' },
  { name:'ThisDay',                   category:'PRINT_MEDIA',  contactEmail:'bookings@thisdaylive.com' },
  { name:'Vanguard Newspapers',       category:'PRINT_MEDIA',  contactEmail:'bookings@vanguardngr.com' },
  { name:'The Nation Newspaper',      category:'PRINT_MEDIA',  contactEmail:'bookings@thenationonlineng.net' },
  { name:'Daily Trust',               category:'PRINT_MEDIA',  contactEmail:'bookings@dailytrust.com' },
  { name:'Leadership Newspaper',      category:'PRINT_MEDIA',  contactEmail:'bookings@leadership.ng' },
  { name:'Nigerian Tribune',          category:'PRINT_MEDIA',  contactEmail:'bookings@tribuneonlineng.com' },
  { name:'The Sun Newspapers',        category:'PRINT_MEDIA',  contactEmail:'bookings@sunnewsonline.com' },
  { name:'PM News',                   category:'PRINT_MEDIA',  contactEmail:'bookings@pmnewsnigeria.com' },
  { name:'Complete Sports',           category:'PRINT_MEDIA',  contactEmail:'bookings@completesports.com' },

  // ══════════════════════════════════════════
  // INFLUENCERS — MEGA & MACRO
  // ══════════════════════════════════════════
  { name:'Toke Makinwa',              category:'INFLUENCERS',  contactEmail:'bookings@tokemakinwa.com' },
  { name:'Mr Macaroni',               category:'INFLUENCERS',  contactEmail:'bookings@mrmacaroni.com' },
  { name:'Broda Shaggi',              category:'INFLUENCERS',  contactEmail:'bookings@brodashaggi.com' },
  { name:'Taaooma',                   category:'INFLUENCERS',  contactEmail:'bookings@taaooma.com' },
  { name:'Kiekie',                    category:'INFLUENCERS',  contactEmail:'bookings@kiekie.ng' },
  { name:'Sabinus',                   category:'INFLUENCERS',  contactEmail:'bookings@sabinus.ng' },
  { name:'Brain Jotter',              category:'INFLUENCERS',  contactEmail:'bookings@brainjotter.ng' },
  { name:'Nasboi',                    category:'INFLUENCERS',  contactEmail:'bookings@nasboi.ng' },
  { name:'Layi Wasabi',               category:'INFLUENCERS',  contactEmail:'bookings@laywasabi.ng' },
  { name:'Aproko Doctor',             category:'INFLUENCERS',  contactEmail:'bookings@aprokodoctor.ng' },
  { name:'Korty EO',                  category:'INFLUENCERS',  contactEmail:'bookings@kortyeo.com' },
  { name:'Tomike Adeoye',             category:'INFLUENCERS',  contactEmail:'bookings@tomike.ng' },
  { name:'Elozonam',                  category:'INFLUENCERS',  contactEmail:'bookings@elozonam.ng' },
  { name:'Enioluwa',                  category:'INFLUENCERS',  contactEmail:'bookings@enioluwa.ng' },
  { name:'Chef T',                    category:'INFLUENCERS',  contactEmail:'bookings@cheft.ng' },
  { name:'Diary of a Naija Girl',     category:'INFLUENCERS',  contactEmail:'bookings@diaryofanaijagirl.com' },
  { name:'Tunde Onakoya',             category:'INFLUENCERS',  contactEmail:'bookings@tundeonakoya.ng' },
  { name:'Fisayo Fosudo',             category:'INFLUENCERS',  contactEmail:'bookings@fisayofosudo.com' },
  { name:'Nancy Isime',               category:'INFLUENCERS',  contactEmail:'bookings@nancyisime.ng' },
  { name:'Gbemi Olateru-Olagbegi',    category:'INFLUENCERS',  contactEmail:'bookings@gbemi.ng' },
  { name:'Temi Otedola',              category:'INFLUENCERS',  contactEmail:'bookings@temiotedola.com' },
  { name:'Falz',                      category:'INFLUENCERS',  contactEmail:'bookings@falz.ng' },
  { name:'Simi',                      category:'INFLUENCERS',  contactEmail:'bookings@simi.ng' },
  { name:'Waje',                      category:'INFLUENCERS',  contactEmail:'bookings@waje.ng' },
  { name:'Nedu Wazobia',              category:'INFLUENCERS',  contactEmail:'bookings@neduwazobia.com' },
  { name:'Daddy Freeze',              category:'INFLUENCERS',  contactEmail:'bookings@daddyfreeze.ng' },

  // ══════════════════════════════════════════
  // INFLUENCERS — MID-TIER
  // ══════════════════════════════════════════
  { name:'Chude Jideonwo',            category:'INFLUENCERS',  contactEmail:'bookings@chude.ng' },
  { name:'Nkechi Blessing',           category:'INFLUENCERS',  contactEmail:'bookings@nkechiblessingsunday.ng' },
  { name:'OC Ukeje',                  category:'INFLUENCERS',  contactEmail:'bookings@ocukeje.ng' },
  { name:'Dorcas Shola Fapson',       category:'INFLUENCERS',  contactEmail:'bookings@dorcasfapson.ng' },
  { name:'Deola Smart',               category:'INFLUENCERS',  contactEmail:'bookings@deolasmart.ng' },
  { name:'Isoken Obi',                category:'INFLUENCERS',  contactEmail:'bookings@isokenobi.ng' },
  { name:'Onye Eze',                  category:'INFLUENCERS',  contactEmail:'bookings@onyeeze.ng' },
  { name:'Folu Storms',               category:'INFLUENCERS',  contactEmail:'bookings@folustorms.ng' },
  { name:'Latasha Ngwube',            category:'INFLUENCERS',  contactEmail:'bookings@latashangwube.ng' },
  { name:'Ozzy Etomi',                category:'INFLUENCERS',  contactEmail:'bookings@ozzyetomi.ng' },
  { name:'Munachi Abii',              category:'INFLUENCERS',  contactEmail:'bookings@munachiabii.ng' },
  { name:'Zara Udofia',               category:'INFLUENCERS',  contactEmail:'bookings@zaraudofia.ng' },
  { name:'Gbubemi Fregene',           category:'INFLUENCERS',  contactEmail:'bookings@gbubemifregene.ng' },

  // ══════════════════════════════════════════
  // INFLUENCERS — MICRO (10K–100K)
  // ══════════════════════════════════════════
  { name:'Jide Awosanya (Segalink)',   category:'INFLUENCERS',  contactEmail:'bookings@segalink.ng' },
  { name:'Sandra Aguebor',            category:'INFLUENCERS',  contactEmail:'bookings@sandraaguebor.ng' },
  { name:'Modupe Ozolua',             category:'INFLUENCERS',  contactEmail:'bookings@modupeozolua.ng' },
  { name:'Adaeze Onyekachi',          category:'INFLUENCERS',  contactEmail:'bookings@adaeze.ng' },
  { name:'The Food Plug',             category:'INFLUENCERS',  contactEmail:'bookings@thefoodplug.ng' },
  { name:'Lagos Foodie',              category:'INFLUENCERS',  contactEmail:'bookings@lagosfoodie.ng' },
  { name:'Naija Kitchen Queen',       category:'INFLUENCERS',  contactEmail:'bookings@naijafoodqueen.ng' },
  { name:'Tech In Naija',             category:'INFLUENCERS',  contactEmail:'bookings@techinnaija.ng' },
  { name:'Finance With Arese',        category:'INFLUENCERS',  contactEmail:'bookings@areseumuibe.com' },
  { name:'Invest Naija',              category:'INFLUENCERS',  contactEmail:'bookings@investnaija.ng' },
  { name:'Adeola Fayehun',            category:'INFLUENCERS',  contactEmail:'bookings@adeolafayehun.ng' },
  { name:'Miz Amaka',                 category:'INFLUENCERS',  contactEmail:'bookings@mizamaka.ng' },
  { name:'AmaRae',                   category:'INFLUENCERS',  contactEmail:'bookings@amarae.ng' },
  { name:'Ekene Onu',                 category:'INFLUENCERS',  contactEmail:'bookings@ekeneonu.ng' },
  { name:'Dr Sid',                    category:'INFLUENCERS',  contactEmail:'bookings@drsid.ng' },
  { name:'StylebyTemmy',              category:'INFLUENCERS',  contactEmail:'bookings@stylebytemmy.ng' },
  { name:'Lagos Street Style',        category:'INFLUENCERS',  contactEmail:'bookings@lagosstreetstyle.ng' },
  { name:'Nigerian Skincare Plug',    category:'INFLUENCERS',  contactEmail:'bookings@nigerianskincareplug.ng' },
  { name:'Hauwa Mukan',               category:'INFLUENCERS',  contactEmail:'bookings@hauwamukan.ng' },
  { name:'Amina Musa',                category:'INFLUENCERS',  contactEmail:'bookings@aminamusa.ng' },
];

async function seedMedia() {
  console.log(`\n🚀 Seeding ${MEDIA_SEED.length} media providers to: ${API_URL}\n`);
  let success = 0;
  let failed  = 0;
  let skipped = 0;

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
      const msg = error.response?.data?.error || error.message;
      if (msg?.includes('already exists') || msg?.includes('duplicate')) {
        console.log(`  ⏭  ${media.name} (already exists)`);
        skipped++;
      } else {
        console.error(`  ❌ ${media.name}: ${msg}`);
        failed++;
      }
    }
  }

  console.log(`\n──────────────────────────────────`);
  console.log(`✅ Created: ${success}`);
  if (skipped) console.log(`⏭  Skipped: ${skipped}`);
  if (failed)  console.log(`❌ Failed:  ${failed}`);
  console.log(`──────────────────────────────────\n`);
}

seedMedia();
