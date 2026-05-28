import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { LoadingBlock, ErrorBlock, EmptyBlock, Toast } from '../components/UI';
import { getMedia } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const authHeader = async () => {
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const GRAD = [
  'linear-gradient(135deg,#6366f1,#a855f7)',
  'linear-gradient(135deg,#14b8a6,#06b6d4)',
  'linear-gradient(135deg,#f59e0b,#f97316)',
  'linear-gradient(135deg,#22c55e,#84cc16)',
  'linear-gradient(135deg,#ec4899,#a855f7)',
  'linear-gradient(135deg,#6366f1,#06b6d4)',
];
const avatarGrad = (name) => GRAD[(name?.charCodeAt(0) || 0) % GRAD.length];

const METRICS = {
  // TV
  'Arise TV':                   { reach:'2.5M+ viewers',   platforms:['TV','YouTube','Facebook'],         impressions:'4M+/month'   },
  'Channels Television':        { reach:'5M+ viewers',     platforms:['TV','YouTube','Twitter'],          impressions:'10M+/month'  },
  'TVC Communications':         { reach:'3M+ viewers',     platforms:['TV','YouTube'],                    impressions:'5M+/month'   },
  'ONTV':                       { reach:'1.5M+ viewers',   platforms:['TV','YouTube'],                    impressions:'2M+/month'   },
  'Soundcity TV':               { reach:'2M+ viewers',     platforms:['TV','YouTube','Instagram'],        impressions:'3.5M+/month' },
  'Spice TV':                   { reach:'1M+ viewers',     platforms:['TV','YouTube'],                    impressions:'1.5M+/month' },
  'Africa Magic Urban':         { reach:'8M+ viewers',     platforms:['TV','DStv','GOtv'],                impressions:'15M+/month'  },
  'Africa Magic Family':        { reach:'6M+ viewers',     platforms:['TV','DStv','GOtv'],                impressions:'10M+/month'  },
  'HIP TV':                     { reach:'2M+ viewers',     platforms:['TV','YouTube','Instagram'],        impressions:'4M+/month'   },
  'Silverbird TV':              { reach:'1.5M+ viewers',   platforms:['TV','YouTube'],                    impressions:'2M+/month'   },
  'EbonyLife TV':               { reach:'3M+ viewers',     platforms:['TV','DStv'],                       impressions:'5M+/month'   },
  'News Central':               { reach:'1M+ viewers',     platforms:['TV','YouTube'],                    impressions:'1.5M+/month' },
  'Lagos Television':           { reach:'2M+ viewers',     platforms:['TV'],                              impressions:'3M+/month'   },
  'Trace Naija':                { reach:'3M+ viewers',     platforms:['TV','DStv','GOtv'],                impressions:'5M+/month'   },
  'Wazobia Max':                { reach:'4M+ viewers',     platforms:['TV','YouTube'],                    impressions:'6M+/month'   },
  'Arewa 24':                   { reach:'2M+ viewers',     platforms:['TV','DStv'],                       impressions:'3M+/month'   },
  'NTA':                        { reach:'10M+ viewers',    platforms:['TV','Nationwide'],                 impressions:'20M+/month'  },
  'Nigerian Television Authority':{ reach:'10M+ viewers', platforms:['TV','Nationwide'],                  impressions:'20M+/month'  },
  'SuperSport':                 { reach:'5M+ viewers',     platforms:['TV','DStv'],                       impressions:'8M+/month'   },
  'Trybe TV':                   { reach:'1.2M+ viewers',   platforms:['TV','YouTube'],                    impressions:'2M+/month'   },
  'Televista':                  { reach:'1M+ viewers',     platforms:['TV','YouTube'],                    impressions:'1.5M+/month' },
  'Access24 TV':                { reach:'800K+ viewers',   platforms:['TV','YouTube'],                    impressions:'1.2M+/month' },
  'Afro Music English':         { reach:'1.5M+ viewers',   platforms:['TV','DStv'],                       impressions:'2.5M+/month' },
  'MiTV':                       { reach:'1M+ viewers',     platforms:['TV'],                              impressions:'1.5M+/month' },
  'WAP TV':                     { reach:'800K+ viewers',   platforms:['TV'],                              impressions:'1.2M+/month' },

  // RADIO — LAGOS
  'Cool FM':                    { reach:'5M+ listeners',   platforms:['Radio','Streaming','Instagram'],   impressions:'8M+/month'   },
  'Cool FM Lagos':              { reach:'5M+ listeners',   platforms:['Radio','Streaming','Instagram'],   impressions:'8M+/month'   },
  'Wazobia FM':                 { reach:'6M+ listeners',   platforms:['Radio','Streaming','Facebook'],    impressions:'10M+/month'  },
  'Wazobia FM Lagos':           { reach:'6M+ listeners',   platforms:['Radio','Streaming','Facebook'],    impressions:'10M+/month'  },
  'Nigeria Info FM':            { reach:'3M+ listeners',   platforms:['Radio','Streaming'],               impressions:'4M+/month'   },
  'Nigeria Info FM Lagos':      { reach:'3M+ listeners',   platforms:['Radio','Streaming'],               impressions:'4M+/month'   },
  'The Beat FM':                { reach:'4M+ listeners',   platforms:['Radio','Streaming','Instagram'],   impressions:'7M+/month'   },
  'The Beat FM Lagos':          { reach:'4M+ listeners',   platforms:['Radio','Streaming','Instagram'],   impressions:'7M+/month'   },
  'Classic FM':                 { reach:'2M+ listeners',   platforms:['Radio','Streaming'],               impressions:'3M+/month'   },
  'Classic FM Lagos':           { reach:'2M+ listeners',   platforms:['Radio','Streaming'],               impressions:'3M+/month'   },
  'Soundcity Radio':            { reach:'3M+ listeners',   platforms:['Radio','YouTube','Instagram'],     impressions:'5M+/month'   },
  'Soundcity Radio Lagos':      { reach:'3M+ listeners',   platforms:['Radio','YouTube','Instagram'],     impressions:'5M+/month'   },
  'Brila FM':                   { reach:'2M+ listeners',   platforms:['Radio','Streaming','Twitter'],     impressions:'3M+/month'   },
  'Brila FM Lagos':             { reach:'2M+ listeners',   platforms:['Radio','Streaming','Twitter'],     impressions:'3M+/month'   },
  'Smooth FM':                  { reach:'2.5M+ listeners', platforms:['Radio','Streaming','Instagram'],   impressions:'4M+/month'   },
  'Smooth FM Lagos':            { reach:'2.5M+ listeners', platforms:['Radio','Streaming','Instagram'],   impressions:'4M+/month'   },
  'Urban96 FM':                 { reach:'2M+ listeners',   platforms:['Radio','YouTube','Instagram'],     impressions:'3M+/month'   },
  'Urban96 FM Lagos':           { reach:'2M+ listeners',   platforms:['Radio','YouTube','Instagram'],     impressions:'3M+/month'   },
  'Naija FM':                   { reach:'1.5M+ listeners', platforms:['Radio','Streaming'],               impressions:'2M+/month'   },
  'Naija FM Lagos':             { reach:'1.5M+ listeners', platforms:['Radio','Streaming'],               impressions:'2M+/month'   },
  'Lagos Talks 91.3 FM':        { reach:'1.8M+ listeners', platforms:['Radio','Streaming'],               impressions:'2.5M+/month' },
  'Raypower FM':                { reach:'1.5M+ listeners', platforms:['Radio','Streaming'],               impressions:'2M+/month'   },
  'Raypower FM Lagos':          { reach:'1.5M+ listeners', platforms:['Radio','Streaming'],               impressions:'2M+/month'   },
  'Inspiration FM':             { reach:'1.5M+ listeners', platforms:['Radio','Streaming'],               impressions:'2M+/month'   },
  'Inspiration FM Lagos':       { reach:'1.5M+ listeners', platforms:['Radio','Streaming'],               impressions:'2M+/month'   },
  'Spice FM Lagos':             { reach:'900K+ listeners', platforms:['Radio','Streaming'],               impressions:'1.2M+/month' },
  'RadioX Lagos':               { reach:'700K+ listeners', platforms:['Radio','Streaming'],               impressions:'1M+/month'   },
  'City FM Lagos':              { reach:'1M+ listeners',   platforms:['Radio','Streaming'],               impressions:'1.5M+/month' },
  'Max FM Lagos':               { reach:'800K+ listeners', platforms:['Radio','Streaming'],               impressions:'1.2M+/month' },
  'Vybz FM Lagos':              { reach:'500K+ listeners', platforms:['Radio','Streaming'],               impressions:'750K+/month' },
  'Kiss FM Lagos':              { reach:'600K+ listeners', platforms:['Radio','Streaming'],               impressions:'900K+/month' },

  // RADIO — ABUJA
  'Cool FM Abuja':              { reach:'1.5M+ listeners', platforms:['Radio','Streaming'],               impressions:'2M+/month'   },
  'Wazobia FM Abuja':           { reach:'1.2M+ listeners', platforms:['Radio','Streaming'],               impressions:'1.8M+/month' },
  'The Beat FM Abuja':          { reach:'900K+ listeners', platforms:['Radio','Streaming'],               impressions:'1.2M+/month' },
  'Classic FM Abuja':           { reach:'700K+ listeners', platforms:['Radio','Streaming'],               impressions:'1M+/month'   },
  'Nigeria Info FM Abuja':      { reach:'800K+ listeners', platforms:['Radio','Streaming'],               impressions:'1.1M+/month' },
  'Brila FM Abuja':             { reach:'600K+ listeners', platforms:['Radio','Streaming'],               impressions:'900K+/month' },
  'Kapital FM 92.9':            { reach:'1M+ listeners',   platforms:['Radio','Streaming'],               impressions:'1.5M+/month' },
  'Aso FM 97.1':                { reach:'600K+ listeners', platforms:['Radio'],                           impressions:'800K+/month' },
  'Sunrise FM Abuja':           { reach:'500K+ listeners', platforms:['Radio'],                           impressions:'700K+/month' },

  // RADIO — PORT HARCOURT
  'Cool FM Port Harcourt':      { reach:'1.2M+ listeners', platforms:['Radio','Streaming'],               impressions:'1.8M+/month' },
  'Wazobia FM Port Harcourt':   { reach:'1M+ listeners',   platforms:['Radio','Streaming'],               impressions:'1.5M+/month' },
  'The Beat FM Port Harcourt':  { reach:'800K+ listeners', platforms:['Radio','Streaming'],               impressions:'1.1M+/month' },
  'Rhythm FM 93.7 PH':          { reach:'1M+ listeners',   platforms:['Radio','Streaming'],               impressions:'1.5M+/month' },
  'Nigeria Info FM PH':         { reach:'700K+ listeners', platforms:['Radio','Streaming'],               impressions:'1M+/month'   },
  'Hot FM PH':                  { reach:'600K+ listeners', platforms:['Radio'],                           impressions:'900K+/month' },
  'Treasure FM':                { reach:'500K+ listeners', platforms:['Radio'],                           impressions:'700K+/month' },

  // RADIO — NORTH
  'Cool FM Kano':               { reach:'1M+ listeners',   platforms:['Radio','Streaming'],               impressions:'1.5M+/month' },
  'Wazobia FM Kano':            { reach:'900K+ listeners', platforms:['Radio','Streaming'],               impressions:'1.2M+/month' },
  'Wazobia FM Onitsha':         { reach:'800K+ listeners', platforms:['Radio','Streaming'],               impressions:'1.1M+/month' },
  'Freedom FM Kano':            { reach:'700K+ listeners', platforms:['Radio'],                           impressions:'1M+/month'   },
  'Rarara FM Kano':             { reach:'500K+ listeners', platforms:['Radio'],                           impressions:'700K+/month' },
  'Royal FM Kano':              { reach:'600K+ listeners', platforms:['Radio'],                           impressions:'900K+/month' },
  'Gombe FM':                   { reach:'300K+ listeners', platforms:['Radio'],                           impressions:'450K+/month' },
  'Minna FM':                   { reach:'250K+ listeners', platforms:['Radio'],                           impressions:'350K+/month' },
  'Adamawa Radio':              { reach:'400K+ listeners', platforms:['Radio'],                           impressions:'600K+/month' },

  // RADIO — SOUTH WEST
  'Fresh FM Ibadan 105.9':      { reach:'1.2M+ listeners', platforms:['Radio','Streaming'],               impressions:'1.8M+/month' },
  'Agidigbo FM Ibadan':         { reach:'900K+ listeners', platforms:['Radio','Streaming'],               impressions:'1.2M+/month' },
  'OGBC Radio Abeokuta':        { reach:'400K+ listeners', platforms:['Radio'],                           impressions:'600K+/month' },
  'Positive FM Ile-Ife':        { reach:'300K+ listeners', platforms:['Radio'],                           impressions:'450K+/month' },
  'BCOS FM Ibadan':             { reach:'600K+ listeners', platforms:['Radio'],                           impressions:'900K+/month' },
  'Splash FM Ibadan':           { reach:'500K+ listeners', platforms:['Radio','Streaming'],               impressions:'750K+/month' },

  // RADIO — SOUTH EAST & SOUTH SOUTH
  'ABS FM Awka':                { reach:'400K+ listeners', platforms:['Radio'],                           impressions:'600K+/month' },
  'Imo State Broadcasting':     { reach:'500K+ listeners', platforms:['Radio'],                           impressions:'700K+/month' },
  'Enugu Broadcasting Service': { reach:'400K+ listeners', platforms:['Radio'],                           impressions:'600K+/month' },
  'Orient FM Enugu':            { reach:'350K+ listeners', platforms:['Radio','Streaming'],               impressions:'500K+/month' },
  'Delta Broadcasting':         { reach:'400K+ listeners', platforms:['Radio'],                           impressions:'600K+/month' },
  'Cross River Broadcasting':   { reach:'300K+ listeners', platforms:['Radio'],                           impressions:'450K+/month' },

  // PODCASTS
  'I Said What I Said':         { reach:'500K+ listeners', platforms:['YouTube','Spotify','Apple Podcasts','TikTok'], impressions:'2M+/month'  },
  'The Honest Bunch Podcast':   { reach:'800K+ listeners', platforms:['YouTube','Spotify','TikTok'],      impressions:'3M+/month'   },
  'Tea With Tay':               { reach:'300K+ listeners', platforms:['YouTube','Spotify','Instagram'],   impressions:'1M+/month'   },
  'Menisms':                    { reach:'250K+ listeners', platforms:['YouTube','Spotify'],               impressions:'800K+/month' },
  'WithChude':                  { reach:'400K+ listeners', platforms:['YouTube','Spotify','Apple'],       impressions:'1.5M+/month' },
  'Loose Talk Podcast':         { reach:'600K+ listeners', platforms:['YouTube','Spotify','Apple'],       impressions:'2M+/month'   },
  'Bahd and Boujee Podcast':    { reach:'350K+ listeners', platforms:['YouTube','TikTok','Instagram'],    impressions:'1.2M+/month' },
  'Road to 30':                 { reach:'200K+ listeners', platforms:['YouTube','Spotify'],               impressions:'700K+/month' },
  '234 Essential':              { reach:'180K+ listeners', platforms:['YouTube','Spotify'],               impressions:'600K+/month' },
  'How Far? Podcast':           { reach:'250K+ listeners', platforms:['YouTube','Spotify','Instagram'],   impressions:'900K+/month' },
  'The Walk With Toke Makinwa': { reach:'300K+ listeners', platforms:['YouTube','Spotify','Instagram'],   impressions:'1M+/month'   },
  'The Uncut Podcast':          { reach:'150K+ listeners', platforms:['YouTube','Spotify'],               impressions:'500K+/month' },
  'Naija Jollof Podcast':       { reach:'100K+ listeners', platforms:['YouTube','Spotify'],               impressions:'350K+/month' },
  'Business Undressed':         { reach:'120K+ listeners', platforms:['YouTube','Spotify','LinkedIn'],    impressions:'400K+/month' },
  'The Toolz Effect':           { reach:'200K+ listeners', platforms:['YouTube','Spotify','Instagram'],   impressions:'700K+/month' },
  'Afripolitics Podcast':       { reach:'80K+ listeners',  platforms:['YouTube','Spotify','Twitter'],     impressions:'250K+/month' },
  'Tech Cabal Podcast':         { reach:'90K+ listeners',  platforms:['YouTube','Spotify','Twitter'],     impressions:'300K+/month' },
  'No Chill Podcast':           { reach:'70K+ listeners',  platforms:['YouTube','Spotify'],               impressions:'220K+/month' },
  'Zikoko Podcast':             { reach:'150K+ listeners', platforms:['YouTube','Spotify','TikTok'],      impressions:'500K+/month' },
  'Married To Lagos Podcast':   { reach:'80K+ listeners',  platforms:['YouTube','Spotify','Instagram'],   impressions:'270K+/month' },
  'Aunty Fifi Podcast':         { reach:'60K+ listeners',  platforms:['YouTube','Spotify'],               impressions:'200K+/month' },
  'Stir It Up Podcast':         { reach:'50K+ listeners',  platforms:['YouTube','Spotify'],               impressions:'160K+/month' },

  // OOH
  'XL Billboards':              { reach:'2M+ eyeballs/day',   platforms:['Lagos','Abuja','PH'],           impressions:'60M+/month'  },
  'Alliance Media':             { reach:'5M+ eyeballs/day',   platforms:['Nationwide','Airports'],        impressions:'150M+/month' },
  'Optimum Exposures':          { reach:'1.5M+ eyeballs/day', platforms:['Lagos','Abuja'],                impressions:'45M+/month'  },
  'Loatsad Promomedia':         { reach:'1M+ eyeballs/day',   platforms:['Lagos','PH'],                   impressions:'30M+/month'  },
  'JCDecaux Nigeria':           { reach:'3M+ eyeballs/day',   platforms:['Airports','Malls','Lagos'],     impressions:'90M+/month'  },
  'Afromedia':                  { reach:'2M+ eyeballs/day',   platforms:['Lagos','Nationwide'],           impressions:'60M+/month'  },
  'Outdoors.ng':                { reach:'3M+ eyeballs/day',   platforms:['Lagos','Abuja','PH','Nationwide'], impressions:'90M+/month'},
  'JMT Communications':         { reach:'2M+ eyeballs/day',   platforms:['Lagos','BRT'],                  impressions:'60M+/month'  },
  'VAAD Media':                 { reach:'1.5M+ eyeballs/day', platforms:['Lagos','Abuja'],                impressions:'45M+/month'  },
  'Alternative Adverts':        { reach:'1M+ eyeballs/day',   platforms:['Lagos'],                        impressions:'30M+/month'  },
  'Unique Billboards':          { reach:'800K+ eyeballs/day', platforms:['Lagos'],                        impressions:'24M+/month'  },
  'Nimbus Media':               { reach:'2M+ eyeballs/day',   platforms:['Malls','Lagos','Abuja'],        impressions:'60M+/month'  },
  'International Billboard Advertising':{ reach:'1.5M+ eyeballs/day', platforms:['Nationwide'],          impressions:'45M+/month'  },

  // PRINT
  'Punch Newspapers':           { reach:'300K+ daily readers', platforms:['Print','Digital','Mobile'],    impressions:'1.5M+/month' },
  'The Guardian Nigeria':       { reach:'200K+ daily readers', platforms:['Print','Digital'],             impressions:'800K+/month' },
  'BusinessDay':                { reach:'150K+ daily readers', platforms:['Print','Digital','LinkedIn'],  impressions:'600K+/month' },
  'ThisDay':                    { reach:'180K+ daily readers', platforms:['Print','Digital'],             impressions:'700K+/month' },
  'Vanguard Newspapers':        { reach:'250K+ daily readers', platforms:['Print','Digital'],             impressions:'1M+/month'   },
  'The Nation Newspaper':       { reach:'180K+ daily readers', platforms:['Print','Digital'],             impressions:'700K+/month' },
  'Daily Trust':                { reach:'200K+ daily readers', platforms:['Print','Digital'],             impressions:'800K+/month' },
  'Leadership Newspaper':       { reach:'120K+ daily readers', platforms:['Print','Digital'],             impressions:'480K+/month' },
  'Nigerian Tribune':           { reach:'150K+ daily readers', platforms:['Print','Digital'],             impressions:'600K+/month' },
  'The Sun Newspapers':         { reach:'200K+ daily readers', platforms:['Print','Digital'],             impressions:'800K+/month' },
  'PM News':                    { reach:'100K+ daily readers', platforms:['Digital','Mobile'],            impressions:'400K+/month' },
  'Complete Sports':            { reach:'120K+ daily readers', platforms:['Print','Digital'],             impressions:'480K+/month' },

  // INFLUENCERS — MACRO
  'Toke Makinwa':               { reach:'4.2M+ followers',  platforms:['Instagram','Twitter','YouTube','Podcast'], impressions:'10M+/month' },
  'Mr Macaroni':                { reach:'6.5M+ followers',  platforms:['Instagram','TikTok','YouTube'],   impressions:'18M+/month'  },
  'Broda Shaggi':               { reach:'5.1M+ followers',  platforms:['Instagram','TikTok','YouTube'],   impressions:'15M+/month'  },
  'Taaooma':                    { reach:'4.3M+ followers',  platforms:['Instagram','TikTok','YouTube'],   impressions:'12M+/month'  },
  'Kiekie':                     { reach:'3.8M+ followers',  platforms:['Instagram','TikTok','YouTube'],   impressions:'10M+/month'  },
  'Sabinus':                    { reach:'5.5M+ followers',  platforms:['Instagram','TikTok','YouTube'],   impressions:'16M+/month'  },
  'Brain Jotter':               { reach:'4M+ followers',    platforms:['TikTok','Instagram','YouTube'],   impressions:'12M+/month'  },
  'Nasboi':                     { reach:'2M+ followers',    platforms:['Instagram','TikTok','YouTube'],   impressions:'6M+/month'   },
  'Layi Wasabi':                { reach:'2.5M+ followers',  platforms:['Instagram','TikTok','YouTube'],   impressions:'7M+/month'   },
  'Aproko Doctor':              { reach:'1.8M+ followers',  platforms:['Instagram','Twitter','YouTube'],  impressions:'5M+/month'   },
  'Korty EO':                   { reach:'1.2M+ followers',  platforms:['YouTube','Instagram','Twitter'],  impressions:'3.5M+/month' },
  'Tomike Adeoye':              { reach:'800K+ followers',  platforms:['Instagram','YouTube'],             impressions:'2M+/month'   },
  'Elozonam':                   { reach:'700K+ followers',  platforms:['Instagram','Twitter'],             impressions:'1.5M+/month' },
  'Enioluwa':                   { reach:'1.5M+ followers',  platforms:['Instagram','TikTok','YouTube'],   impressions:'4M+/month'   },
  'Chef T':                     { reach:'600K+ followers',  platforms:['Instagram','TikTok','YouTube'],   impressions:'1.5M+/month' },
  'Diary of a Naija Girl':      { reach:'500K+ followers',  platforms:['Instagram','Twitter','Blog'],     impressions:'1.2M+/month' },
  'Tunde Onakoya':              { reach:'1M+ followers',    platforms:['Instagram','Twitter','YouTube'],  impressions:'3M+/month'   },
  'Fisayo Fosudo':              { reach:'800K+ followers',  platforms:['YouTube','Instagram','Twitter'],  impressions:'2M+/month'   },
  'Nancy Isime':                { reach:'2.5M+ followers',  platforms:['Instagram','YouTube'],             impressions:'6M+/month'   },
  'Gbemi Olateru-Olagbegi':     { reach:'600K+ followers',  platforms:['Instagram','Twitter','Podcast'],  impressions:'1.5M+/month' },
  'Temi Otedola':               { reach:'1.8M+ followers',  platforms:['Instagram','YouTube'],             impressions:'4.5M+/month' },
  'Falz':                       { reach:'3M+ followers',    platforms:['Instagram','Twitter','YouTube'],  impressions:'8M+/month'   },
  'Simi':                       { reach:'2.2M+ followers',  platforms:['Instagram','Twitter','YouTube'],  impressions:'5M+/month'   },
  'Waje':                       { reach:'1.5M+ followers',  platforms:['Instagram','Twitter','YouTube'],  impressions:'3.5M+/month' },
  'Nedu Wazobia':               { reach:'1.2M+ followers',  platforms:['Instagram','Podcast','YouTube'],  impressions:'3M+/month'   },
  'Daddy Freeze':               { reach:'1M+ followers',    platforms:['Instagram','Twitter','YouTube'],  impressions:'2.5M+/month' },

  // INFLUENCERS — MID-TIER
  'Chude Jideonwo':             { reach:'500K+ followers',  platforms:['Instagram','Twitter','Podcast'],  impressions:'1.2M+/month' },
  'Nkechi Blessing':            { reach:'700K+ followers',  platforms:['Instagram','Twitter'],             impressions:'1.8M+/month' },
  'OC Ukeje':                   { reach:'400K+ followers',  platforms:['Instagram','Twitter'],             impressions:'1M+/month'   },
  'Dorcas Shola Fapson':        { reach:'500K+ followers',  platforms:['Instagram','Twitter'],             impressions:'1.2M+/month' },
  'Deola Smart':                { reach:'350K+ followers',  platforms:['Instagram','YouTube'],             impressions:'900K+/month' },
  'Isoken Obi':                 { reach:'300K+ followers',  platforms:['Instagram','YouTube'],             impressions:'750K+/month' },
  'Onye Eze':                   { reach:'250K+ followers',  platforms:['Instagram','TikTok'],              impressions:'700K+/month' },
  'Folu Storms':                { reach:'400K+ followers',  platforms:['Instagram','Twitter'],             impressions:'1M+/month'   },
  'Latasha Ngwube':             { reach:'350K+ followers',  platforms:['Instagram','Twitter'],             impressions:'900K+/month' },
  'Ozzy Etomi':                 { reach:'200K+ followers',  platforms:['Instagram','Twitter'],             impressions:'550K+/month' },
  'Munachi Abii':               { reach:'300K+ followers',  platforms:['Instagram','YouTube'],             impressions:'750K+/month' },
  'Zara Udofia':                { reach:'200K+ followers',  platforms:['Instagram','YouTube'],             impressions:'550K+/month' },
  'Gbubemi Fregene':            { reach:'180K+ followers',  platforms:['Instagram','Twitter'],             impressions:'500K+/month' },

  // INFLUENCERS — MICRO
  'Jide Awosanya (Segalink)':   { reach:'80K+ followers',   platforms:['Twitter','Instagram'],             impressions:'200K+/month' },
  'Sandra Aguebor':             { reach:'60K+ followers',   platforms:['Instagram','Facebook'],            impressions:'180K+/month' },
  'Modupe Ozolua':              { reach:'50K+ followers',   platforms:['Instagram','LinkedIn'],            impressions:'150K+/month' },
  'Adaeze Onyekachi':           { reach:'45K+ followers',   platforms:['Instagram','TikTok'],              impressions:'130K+/month' },
  'The Food Plug':              { reach:'70K+ followers',   platforms:['Instagram','TikTok'],              impressions:'200K+/month' },
  'Lagos Foodie':               { reach:'65K+ followers',   platforms:['Instagram','TikTok'],              impressions:'180K+/month' },
  'Naija Kitchen Queen':        { reach:'40K+ followers',   platforms:['Instagram','YouTube'],             impressions:'120K+/month' },
  'Tech In Naija':              { reach:'55K+ followers',   platforms:['Twitter','YouTube','LinkedIn'],    impressions:'160K+/month' },
  'Finance With Arese':         { reach:'90K+ followers',   platforms:['Instagram','Twitter','Podcast'],  impressions:'250K+/month' },
  'Invest Naija':               { reach:'50K+ followers',   platforms:['Twitter','Instagram'],             impressions:'150K+/month' },
  'Adeola Fayehun':             { reach:'300K+ followers',  platforms:['YouTube','Instagram'],             impressions:'750K+/month' },
  'Miz Amaka':                  { reach:'45K+ followers',   platforms:['Instagram','TikTok'],              impressions:'130K+/month' },
  'AmaRae':                     { reach:'35K+ followers',   platforms:['Instagram','TikTok'],              impressions:'100K+/month' },
  'Ekene Onu':                  { reach:'40K+ followers',   platforms:['Instagram','Twitter'],             impressions:'120K+/month' },
  'Dr Sid':                     { reach:'500K+ followers',  platforms:['Instagram','Twitter','YouTube'],  impressions:'1.2M+/month' },
  'StylebyTemmy':               { reach:'55K+ followers',   platforms:['Instagram','TikTok'],              impressions:'160K+/month' },
  'Lagos Street Style':         { reach:'45K+ followers',   platforms:['Instagram','TikTok'],              impressions:'130K+/month' },
  'Nigerian Skincare Plug':     { reach:'60K+ followers',   platforms:['Instagram','TikTok'],              impressions:'175K+/month' },
  'Hauwa Mukan':                { reach:'30K+ followers',   platforms:['Instagram','Twitter'],             impressions:'90K+/month'  },
  'Amina Musa':                 { reach:'25K+ followers',   platforms:['Instagram','TikTok'],              impressions:'75K+/month'  },
};

const CAT_LABELS = {
  ALL:'All', TELEVISION:'TV', RADIO_AUDIO:'Radio', PODCASTS:'Podcasts',
  OUT_OF_HOME:'OOH', PRINT_MEDIA:'Print', INFLUENCERS:'Influencers',
  SOCIAL_MEDIA:'Social Media', MUSIC_PROMOTION:'Music Promotion',
  LIVE_STREAMING:'Live Streaming Ads',
};

const PLATFORM_COLORS = {
  'TV':'#6366f1','Radio':'#14b8a6','YouTube':'#ef4444','Instagram':'#ec4899',
  'TikTok':'#06b6d4','Twitter':'#38bdf8','Spotify':'#22c55e','Facebook':'#3b82f6',
  'DStv':'#94a3b8','GOtv':'#94a3b8','Streaming':'#8b5cf6',
  'Print':'#f59e0b','Digital':'#a855f7','LinkedIn':'#0ea5e9','Mobile':'#22d3ee',
  'Apple Podcasts':'#a855f7','Apple':'#a855f7','Podcast':'#a855f7','Blog':'#f59e0b',
  'BRT':'#fcd34d','Malls':'#fb923c','Airports':'#fcd34d',
  'Nationwide':'#94a3b8','Lagos':'#94a3b8','Abuja':'#94a3b8','PH':'#94a3b8',
};

export default function Media() {
  const [media, setMedia]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [toast, setToast]     = useState(null);
  const [deleting, setDeleting] = useState({});
  const { user } = useAuth();
  const isAdmin = (user?.role || '').toUpperCase() === 'ADMIN';
  const [search, setSearch]   = useState('');
  const [catFilter, setCat]   = useState('ALL');

  const fetchMedia = async () => {
    setLoading(true); setError('');
    try {
      const res = await getMedia();
      setMedia(Array.isArray(res) ? res : res.media ?? res.data ?? []);
    } catch (e) { setError(e.message); }
    finally     { setLoading(false); }
  };

  const deleteMedia = async (mediaId, name) => {
    if (!window.confirm(`Delete "${name}" from media inventory? This cannot be undone.`)) return;
    setDeleting(d => ({ ...d, [mediaId]: true }));
    try {
      const headers = await authHeader();
      await axios.delete(`${API}/media/${mediaId}`, { headers });
      setMedia(prev => prev.filter(m => (m.mediaId ?? m.id ?? m._id) !== mediaId));
      setToast({ type:'success', message:`${name} deleted` });
      setTimeout(() => setToast(null), 3000);
    } catch(e) {
      setToast({ type:'error', message: e.response?.data?.error || e.message });
      setTimeout(() => setToast(null), 3000);
    } finally { setDeleting(d => { const n={...d}; delete n[mediaId]; return n; }); }
  };

  useEffect(() => { fetchMedia(); }, []);

  const filtered = media.filter((m) => {
    const matchCat    = catFilter === 'ALL' || m.category === catFilter;
    const matchSearch = !search || m.name?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const getMetrics = (m) => METRICS[m.name] || {
    reach:       m.monthlyReach || 'Contact for details',
    platforms:   Array.isArray(m.markets) ? m.markets : [],
    impressions: 'Contact for details',
  };

  return (
    <Layout
      title="Media Inventory"
      subtitle="Browse service providers across Nigeria's leading media platforms"
      actions={
        <button onClick={fetchMedia} className="btn-secondary" style={{ fontSize:12 }}>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg>
          Refresh
        </button>
      }
    >
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)}/>}

      {/* BrandCasta connector */}
      <div style={{ padding:'14px 18px', borderRadius:14, background:'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(168,85,247,0.08))', border:'1px solid rgba(99,102,241,0.2)', marginBottom:20, display:'flex', alignItems:'flex-start', gap:12 }}>
        <div style={{ width:32, height:32, borderRadius:10, background:'linear-gradient(135deg,#6366f1,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <svg width="15" height="15" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div>
          <p style={{ fontSize:13, fontWeight:700, color:'white', marginBottom:3 }}>BrandCasta connects you directly</p>
          <p style={{ fontSize:12, color:'rgba(165,180,252,0.75)', lineHeight:1.6 }}>
            All bookings are handled exclusively through BrandCasta. Provider contact details are kept confidential to ensure a smooth, protected campaign experience. Pricing is provided upon campaign creation.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ padding:'10px 16px', borderRadius:10, background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.18)', marginBottom:20 }}>
        <p style={{ fontSize:12, color:'#fcd34d' }}>
          ⚠️ Audience metrics are real market estimates and are subject to change from service providers upon registration.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(CAT_LABELS).map(([key, label]) => {
          const count = key === 'ALL' ? media.length : media.filter(m => m.category === key).length;
          return (
            <button key={key} onClick={() => setCat(key)}
              style={{ padding:'6px 14px', borderRadius:20, fontSize:11, fontWeight:700, cursor:'pointer', transition:'all 0.15s',
                background: catFilter === key ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                color:       catFilter === key ? '#a5b4fc' : 'var(--text-muted)',
                border:      catFilter === key ? '1px solid rgba(99,102,241,0.35)' : '1px solid var(--border)',
              }}>
              {label} <span style={{ opacity:0.6, marginLeft:3 }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <input type="text" placeholder="Search service providers..." value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width:'100%', padding:'11px 16px', borderRadius:12, fontSize:13, outline:'none', background:'rgba(255,255,255,0.05)', border:'1px solid var(--border)', color:'white', marginBottom:16 }}
      />

      <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:14 }}>
        {filtered.length} service provider{filtered.length !== 1 ? 's' : ''}{catFilter !== 'ALL' ? ` in ${CAT_LABELS[catFilter]}` : ''}
      </p>

      {loading && <LoadingBlock message="Loading service providers…"/>}
      {error   && <ErrorBlock message={error} onRetry={fetchMedia}/>}
      {!loading && !error && filtered.length === 0 && <EmptyBlock message="No service providers found."/>}

      {!loading && !error && filtered.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))', gap:14 }}>
          {filtered.map((m, i) => {
            const metrics = getMetrics(m);
            return (
              <div key={m.id ?? m._id ?? m.mediaId ?? i}
                style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'18px', transition:'border-color 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor='rgba(99,102,241,0.35)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor='var(--border)'}
              >
                {/* Header */}
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                  <div style={{ width:40, height:40, borderRadius:12, background:avatarGrad(m.name), display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:15, fontWeight:700, flexShrink:0 }}>
                    {(m.name||'?')[0].toUpperCase()}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontWeight:700, color:'white', fontSize:13, lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.name}</p>
                    {m.category && (
                      <span style={{ display:'inline-block', marginTop:3, padding:'2px 7px', borderRadius:6, fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', background:'rgba(99,102,241,0.12)', color:'#a5b4fc', border:'1px solid rgba(99,102,241,0.2)' }}>
                        {m.category.replaceAll('_',' ')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:12 }}>
                  <div style={{ padding:'9px 10px', borderRadius:9, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ fontSize:9, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:3 }}>Reach</p>
                    <p style={{ fontSize:12, fontWeight:700, color:'#a5b4fc' }}>{metrics.reach}</p>
                  </div>
                  <div style={{ padding:'9px 10px', borderRadius:9, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ fontSize:9, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:3 }}>Impressions</p>
                    <p style={{ fontSize:12, fontWeight:700, color:'#86efac' }}>{metrics.impressions}</p>
                  </div>
                </div>

                {/* Platforms */}
                {metrics.platforms?.length > 0 && (
                  <div style={{ marginBottom:12 }}>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                      {metrics.platforms.map((p) => (
                        <span key={p} style={{
                          padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:600,
                          background: PLATFORM_COLORS[p] ? `${PLATFORM_COLORS[p]}20` : 'rgba(255,255,255,0.06)',
                          color:      PLATFORM_COLORS[p] || 'var(--text-muted)',
                          border:     `1px solid ${PLATFORM_COLORS[p] ? `${PLATFORM_COLORS[p]}35` : 'rgba(255,255,255,0.1)'}`,
                        }}>{p}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div style={{ paddingTop:10, borderTop:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <p style={{ fontSize:10, color:'var(--text-muted)' }}>Via BrandCasta only</p>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:4, padding:'3px 9px', borderRadius:20, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)' }}>
                      <div style={{ width:5, height:5, borderRadius:'50%', background:'#86efac' }}/>
                      <p style={{ fontSize:10, fontWeight:700, color:'#a5b4fc' }}>Available</p>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => deleteMedia(m.mediaId ?? m.id ?? m._id, m.name)}
                        disabled={deleting[m.mediaId ?? m.id ?? m._id]}
                        style={{ padding:'3px 9px', borderRadius:20, fontSize:10, fontWeight:700, cursor:'pointer', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#fca5a5', fontFamily:'Manrope,sans-serif' }}>
                        {deleting[m.mediaId ?? m.id ?? m._id] ? '…' : '✕ Delete'}
                      </button>
                    )}
                    {!isAdmin && user?.role !== 'PROVIDER' && (
                      <a href="/register/provider"
                        style={{ padding:'3px 9px', borderRadius:20, fontSize:10, fontWeight:700, cursor:'pointer', background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)', color:'#a5b4fc', fontFamily:'Manrope,sans-serif', textDecoration:'none' }}>
                        Claim Listing
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}