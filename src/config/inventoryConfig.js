export const INVENTORY_CONFIG = {

  RADIO_AUDIO: {

    label: "Radio & Audio",

    inventoryGroups: {

      COMMERCIAL_SPOTS: {

        label: "Commercial Spots",

        options: {

          THIRTY_SECONDS_PEAK: {

            label: "30 Seconds Peak",

            markets: {

              LAGOS: { price: 21750 },

              ABUJA: { price: 11750 },

              PH: { price: 11750 },

              KANO: { price: 7500 },
            }
          },

          THIRTY_SECONDS_OFFPEAK: {

            label: "30 Seconds Off-Peak",

            markets: {

              LAGOS: { price: 12500 },

              ABUJA: { price: 9688 },

              PH: { price: 9688 },

              KANO: { price: 6250 },
            }
          },

          SIXTY_SECONDS_PREMIUM: {

            label: "60 Seconds Premium",

            markets: {

              LAGOS: { price: 50000 },

              ABUJA: { price: 30000 },

              PH: { price: 30000 },

              KANO: { price: 20000 },
            }
          }
        }
      },

      PROGRAMME_SPONSORSHIPS: {

        label: "Programme Sponsorships",

        options: {

          MORNING_SHOW: {

            label: "Morning Show Sponsorship",

            markets: {

              LAGOS: { price: 21750 },

              ABUJA: { price: 11750 },

              PH: { price: 11750 },

              KANO: { price: 7500 },
            }
          },

          DRIVE_TIME: {

            label: "Drive Time Sponsorship",

            markets: {

              LAGOS: { price: 21750 },

              ABUJA: { price: 11750 },

              PH: { price: 11750 },

              KANO: { price: 7500 },
            }
          },

          NEWS_SPONSORSHIP: {

            label: "News Sponsorship",

            markets: {

              NATIONAL: { price: 180000 }
            }
          },

          TRAFFIC_SPONSORSHIP: {

            label: "Traffic Sponsorship",

            markets: {

              NATIONAL: { price: 45000 }
            }
          }
        }
      },

      AUDIO_PRODUCTION: {

        label: "Audio Production",

        options: {

          JINGLE_PRODUCTION: {

            label: "Jingle Production",

            markets: {

              LAGOS: { price: 150000 },

              OTHER_CITIES: { price: 100000 },
            }
          },

          SCRIPTWRITING: {

            label: "Scriptwriting",

            markets: {

              NATIONAL: { price: 20000 }
            }
          },

          VOICE_OVER: {

            label: "Voice Over",

            markets: {

              LAGOS: { price: 50000 },

              OTHER_CITIES: { price: 30000 },
            }
          },

          AUDIO_BRANDING: {

            label: "Audio Branding",

            markets: {

              NATIONAL: { price: 250000 }
            }
          }
        }
      }
    }
  },

  TELEVISION: {

    label: "Television & Streaming TV",

    inventoryGroups: {

      COMMERCIAL_AIRTIME: {

        label: "Commercial Airtime",

        options: {

          PRIME_TIME_30: {

            label: "Prime Time 30 Seconds",

            markets: {

              ARISE_TV: { price: 750000 },

              AFRICA_MAGIC_URBAN: { price: 420000 },

              AFRICA_MAGIC_FAMILY: { price: 320000 },

              CHANNELS_TV: { price: 58420 },

              TVC: { price: 80000 },
            }
          },

          PRIME_TIME_60: {

            label: "Prime Time 60 Seconds",

            markets: {

              ARISE_TV: { price: 1200000 },

              AFRICA_MAGIC_URBAN: { price: 750000 },

              AFRICA_MAGIC_FAMILY: { price: 580000 },

              CHANNELS_TV: { price: 88030 },

              TVC: { price: 150000 },
            }
          },

          OFFPEAK_30: {

            label: "Off-Peak 30 Seconds",

            markets: {

              ARISE_TV: { price: 450000 },

              AFRICA_MAGIC_URBAN: { price: 220000 },

              AFRICA_MAGIC_FAMILY: { price: 180000 },

              CHANNELS_TV: { price: 36497 },

              TVC: { price: 60000 },
            }
          }
        }
      },

      SPONSORED_CONTENT: {

        label: "Sponsored Content",

        options: {

          PROGRAMME_SPONSORSHIP: {

            label: "Programme Sponsorship",

            markets: {

              ARISE_TV: { price: 20000000 },

              AFRICA_MAGIC_URBAN: { price: 12000000 },

              AFRICA_MAGIC_FAMILY: { price: 8000000 },

              CHANNELS_TV: { price: 1175040 },

              TVC: { price: 3500000 },
            }
          },

          NEWS_SPONSORSHIP: {

            label: "News Sponsorship",

            markets: {

              ARISE_TV: { price: 25000000 },

              TVC: { price: 3500000 },
            }
          },

          BRAND_INTEGRATION: {

            label: "Brand Integration",

            markets: {

              ARISE_TV: { price: 10000000 },

              AFRICA_MAGIC_URBAN: { price: 6000000 },

              AFRICA_MAGIC_FAMILY: { price: 4000000 },
            }
          }
        }
      }
    }
  },

  PODCASTS: {

    label: "Podcasts",

    inventoryGroups: {

      AUDIO_ADS: {

        label: "Audio Ads",

        options: {

          PRE_ROLL: {

            label: "Pre-Roll Ads",

            markets: {

              TOP_TIER: { price: 1500000 },

              MID_TIER: { price: 400000 },

              EMERGING: { price: 150000 },
            }
          },

          MID_ROLL: {

            label: "Mid-Roll Ads",

            markets: {

              TOP_TIER: { price: 3500000 },

              MID_TIER: { price: 1500000 },

              EMERGING: { price: 300000 },
            }
          },

          POST_ROLL: {

            label: "Post-Roll Ads",

            markets: {

              TOP_TIER: { price: 800000 }
            }
          }
        }
      },

      VIDEO_INTEGRATIONS: {

        label: "Video Integrations",

        options: {

          YOUTUBE_INTEGRATION: {

            label: "YouTube Integration",

            markets: {

              TOP_TIER: { price: 5000000 },

              MID_TIER: { price: 2000000 },
            }
          },

          PRODUCT_PLACEMENT: {

            label: "Product Placement",

            markets: {

              TOP_TIER: { price: 3000000 },

              MID_TIER: { price: 1000000 },
            }
          }
        }
      }
    }
  },

  OUT_OF_HOME: {

    label: "Out-of-Home Advertising",

    inventoryGroups: {

      STATIC_BILLBOARDS: {

        label: "Static Billboards",

        options: {

          SMALL_BOARD: {

            label: "Small Billboard",

            markets: {

              SECONDARY_ROADS: {
                price: 800000
              },

              PRIME_HIGHWAY: {
                price: 2000000
              }
            }
          },

          MEDIUM_BOARD: {

            label: "Medium Billboard",

            markets: {

              SECONDARY_ROADS: {
                price: 1500000
              },

              PRIME_HIGHWAY: {
                price: 5000000
              }
            }
          },

          LARGE_BOARD: {

            label: "Large Billboard",

            markets: {

              SECONDARY_ROADS: {
                price: 3000000
              },

              PRIME_HIGHWAY: {
                price: 15000000
              }
            }
          }
        }
      },

      DIGITAL_LED: {

        label: "Digital LED Boards",

        options: {

          TEN_SECONDS: {

            label: "10 Seconds Rotation",

            markets: {

              STANDARD_LED: {
                price: 2000000
              },

              PREMIUM_LED: {
                price: 5000000
              }
            }
          },

          FIFTEEN_SECONDS: {

            label: "15 Seconds Rotation",

            markets: {

              STANDARD_LED: {
                price: 3500000
              },

              PREMIUM_LED: {
                price: 8000000
              }
            }
          },

          THIRTY_SECONDS: {

            label: "30 Seconds Rotation",

            markets: {

              STANDARD_LED: {
                price: 7000000
              },

              PREMIUM_LED: {
                price: 15000000
              }
            }
          }
        }
      }
    }
  },

  PRINT_MEDIA: {

    label: "Print Media",

    inventoryGroups: {

      NEWSPAPER_ADS: {

        label: "Newspaper Ads",

        options: {

          FULL_PAGE: {

            label: "Full Page Ad",

            markets: {

              COLOUR: {
                price: 6000000
              },

              BLACK_WHITE: {
                price: 2500000
              }
            }
          },

          HALF_PAGE: {

            label: "Half Page Ad",

            markets: {

              COLOUR: {
                price: 3500000
              },

              BLACK_WHITE: {
                price: 1500000
              }
            }
          },

          FRONT_PAGE_SOLUS: {

            label: "Front Page Solus",

            markets: {

              NATIONAL_DAILIES: {
                price: 20000000
              }
            }
          }
        }
      }
    }
  },

  INFLUENCERS: {

    label: "Influencer & Content Marketing",

    inventoryGroups: {

      SOCIAL_MEDIA: {

        label: "Social Media Campaigns",

        options: {

          INSTAGRAM_POST: {

            label: "Instagram Post",

            markets: {

              MEGA: {
                price: 25000000
              },

              MACRO: {
                price: 5000000
              },

              MID_TIER: {
                price: 800000
              },

              MICRO: {
                price: 250000
              }
            }
          },

          INSTAGRAM_REEL: {

            label: "Instagram Reel",

            markets: {

              MEGA: {
                price: 20000000
              },

              MACRO: {
                price: 5000000
              },

              MID_TIER: {
                price: 700000
              },

              MICRO: {
                price: 200000
              }
            }
          },

          TIKTOK_VIDEO: {

            label: "TikTok Video",

            markets: {

              MEGA: {
                price: 20000000
              },

              MACRO: {
                price: 5000000
              },

              MID_TIER: {
                price: 700000
              },

              MICRO: {
                price: 200000
              }
            }
          }
        }
      },

      VIDEO_CONTENT: {

        label: "Video Content",

        options: {

          YOUTUBE_INTEGRATION: {

            label: "YouTube Integration",

            markets: {

              MEGA: {
                price: 30000000
              },

              MACRO: {
                price: 10000000
              },

              MID_TIER: {
                price: 1500000
              }
            }
          },

          COMEDY_SKIT: {

            label: "Comedy Skit Integration",

            markets: {

              PREMIUM_CREATORS: {
                price: 10000000
              },

              MID_TIER_CREATORS: {
                price: 3000000
              }
            }
          }
        }
      }
    }
  }
};