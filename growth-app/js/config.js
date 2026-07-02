// ============================================================
//  config.js  —  Central config for Daily Growth App
//  Change settings here without touching other files
// ============================================================

const APP_CONFIG = {
  supabase: {
    url:  'https://iezjzepzrbzgxbeesuma.supabase.co',
    anon: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imllemp6ZXB6cmJ6Z3hiZWVzdW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MDMyNTYsImV4cCI6MjA5MDE3OTI1Nn0.RjuMlppAKn1u9n39enUAo3lY_p6HxEJxxSZ5BMwn82Y',
  },

  // ── AI English Feature ──────────────────────────────────────
  // Set enabled: false to turn OFF the AI word feature
  ai: {
    enabled:  true,
    apiKey:   'AIzaSyDrXI_sDmzG9nZo3CLBUkH0AxD6QDcOPkY',
    model:    'gemini-pro',
    wordPts:  5,   // points per English word learned
  },

  // ── Scoring ─────────────────────────────────────────────────
  scoring: {
    maxDailyScore:     100,   // questions score out of 100
    extraTaskBonus:    5,     // each extra task = +5 bonus
    rewardMinScore:    50,    // show reward button only above this
    linkedinPts:       10,
    instaPenalty:      { '✅ 0–15 min': 5, '🟡 15–30 min': 0, '🟠 30–60 min': -5, '🔴 1hr+': -15 },
    practicePts:       { '1': 5, '2': 10, '3': 20 },
  },

  // ── Friend Accountability ───────────────────────────────────
  friends: {
    enabled: true,
  },

  // ── Reward Tiers ────────────────────────────────────────────
  rewards: {
    tier1: { min: 50,  max: 70  },   // strong motivational quotes
    tier2: { min: 70,  max: 90  },   // medium motivation
    tier3: { min: 90,  max: 100 },   // quote + chocolate animation
    tier4: { min: 100, max: 999 },   // super quote + song + video + image + fullscreen
  },

  // ── Media paths (add your files here) ──────────────────────
  media: {
    rewardSong:  'assets/sounds/reward.mp3',
    rewardVideo: 'assets/sounds/reward.mp4',
    rewardImage: 'assets/images/reward.jpg',
  },
};

// Init Supabase
const { createClient } = supabase;
const sb = createClient(APP_CONFIG.supabase.url, APP_CONFIG.supabase.anon);
