// ============================================================
//  quotes.js  —  All quotes for Daily Growth
// ============================================================

const DAILY_QUOTES = [
  "Discipline illa na dreamum illa da 💪",
  "Small steps daily = Big success later 🚀",
  "Insta vida un future important da 📵",
  "Nee than un best version da 🔥",
  "Consistency dhaan real success 🔑",
  "Today effort dhaan tomorrow success 💯",
  "Stop pannadha, start panniruka nu mind set venum 💪",
  "Focus break aana life slow aagum da",
  "Work pannina pain varum, pannalana regret varum 😤",
  "One day nee solluva — I did it 💯",
  "Compare pannatha, compete with yesterday's you 🎯",
  "Procrastinate panna neram waste, action panna results 🚀",
  "Solra maadhiri pannuna — winner aaruvai 🏆",
  "Nee start pannida ready-a? Time waiting illai ⏰",
  "Practice makes perfect — daily pannidu 💪",
];

const DISTRACTION_QUOTES = [
  "Focus da! Un future nee build pannura time ithu 🎯",
  "Distracted feel aana — 5 deep breaths edu, then back to work 💪",
  "Insta scroll panna neram waste. Un dream scroll pannida time illai! 🚀",
  "Un phone keezhey vachu, un future mela focus pannunga 🔥",
  "Today focus = tomorrow freedom 💯",
];

const REWARD_QUOTES = {
  tier1: [  // 50–70
    "Nalla start da! Consistency keep pannu — better days coming 💪",
    "50+ hit pannita! Un potential romba uchiyam iruku. Push harder! 🔥",
    "Good effort! Oru step better aana oru better tomorrow 🚀",
    "Nee try pannura — that itself brave da. Keep going! 💯",
  ],
  tier2: [  // 70–90
    "Romba nalla da! Un consistency show aaguthu 🏆",
    "70+ points! Un future self proud feel aaguvaan 🔥",
    "Almost there da! Oru push more — 90+ possible! 💪",
    "Great work! Un discipline level up aaguthu 🚀",
  ],
  tier3: [  // 90–100
    "WOW! 90+ points — nee exceptional da! 🎉",
    "Un dedication romba inspiring da! Keep this energy! 🏆",
    "Top performer! Un consistency unmatched 🔥💯",
    "90+ hit pannita! Un future bright da! ✨🚀",
  ],
  tier4: [  // 100+
    "LEGENDARY DA! 100+ points — nee absolute beast! 🏆🔥",
    "Un discipline and consistency — UNMATCHABLE! 💯🚀",
    "Perfect score! Un future self coming to thank you! 👑",
    "100+ CLUB! Ellam best version nee than! 🎊🏆🔥",
  ],
};

const LOW_ENERGY_FOLLOWUP = {
  male:   "Enna achu nanba? Sollu — fix pannalam 💪",
  female: "Enna achu nanbi? Sollu — fix pannalam 💪",
};

function getDailyQuote() {
  return DAILY_QUOTES[new Date().getDate() % DAILY_QUOTES.length];
}
function getRandomQuote(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function getDistractionQuote() {
  return getRandomQuote(DISTRACTION_QUOTES);
}
function getRewardQuote(tier) {
  return getRandomQuote(REWARD_QUOTES[tier] || REWARD_QUOTES.tier1);
}
