// The full client roster: 15 handcrafted people across four tiers. Every new
// career deals a random hand from this roster (pickCareerCast), so no two
// careers meet the same cast. Higher tiers bring more capital but expect
// tighter allocation and react harder to losses.
//
// Every client has a DREAM — a concrete thing the money is for, with a
// portfolio target attached. Money is never the goal; the dream is the goal.
// Their voice (texts, memories, payoffs) lives in clientVoice.ts.

import { ClientProfile } from './gameState';

const ROSTER: ClientProfile[] = [
  // ── TIER 1 ────────────────────────────────────────────────────────────────
  {
    id: 'alex',
    name: 'Alex',
    age: 24,
    occupation: 'Recent College Graduate',
    characterColor: '#D4A574',
    background:
      'Just landed first full-time job and saved up $10k. Looking to grow wealth but still learning about investing. Open to whatever makes sense for their situation.',
    tier: 1,
    recommendedAllocation: { stocks: 0.7, bonds: 0.3 },
    allocationTolerance: 0.2,
    negativeReturnHappinessPenalty: -2,
    initialCapital: 10000,
    unlockedAtReputation: 20,
    signingFee: 250, // small mix: modest signing + modest cut
    returnsFeePct: 0.1,
    dream: {
      label: 'Fried & True',
      blurb: 'Every dollar of this becomes my food truck. Best grilled cheese you will ever have.',
      target: 16000,
    },
    dialogue: [
      "Hey!! I'm Alex. First real job, first real paycheck, first real advisor — that's you!",
      "Okay, so: $10k. Every dollar I've ever saved. No pressure haha. (Some pressure.)",
      "Here's the plan. This money becomes Fried & True — my food truck. Best grilled cheese you'll ever have.",
      'Get me to $16k and you get free sandwiches for life. Deal? Deal.',
    ],
  },
  {
    id: 'rosa',
    name: 'Rosa',
    age: 67,
    occupation: 'Retired School Librarian',
    characterColor: '#B87BA8',
    background:
      'Forty years of story time at Whitfield Elementary, retired with a small pension and $9k in careful savings. Writes texts like handwritten letters. Trusts easily — maybe too easily — and remembers every child who ever fell asleep in her reading corner.',
    tier: 1,
    recommendedAllocation: { stocks: 0.58, bonds: 0.42 },
    allocationTolerance: 0.2,
    negativeReturnHappinessPenalty: -2,
    initialCapital: 9000,
    unlockedAtReputation: 18,
    signingFee: 150,
    returnsFeePct: 0.12,
    dream: {
      label: 'The Reading Room',
      blurb: 'Twenty little free libraries, oak, hand-painted — one on every block of my neighborhood.',
      target: 14000,
    },
    dialogue: [
      "Hello, dear. I'm Rosa. Forty years a librarian, and I still shush people in my sleep.",
      'This is my careful money — $9,000, saved a little at a time, the way you read a long book.',
      'I want to build twenty little free libraries. Oak, hand-painted, one on every block. Children need somewhere to find a door.',
      "My husband thinks I'm silly. He also cried at the blueprints. Take good care of us, won't you? — R.",
    ],
  },
  {
    id: 'dev',
    name: 'Dev',
    age: 31,
    occupation: 'ER Night-Shift Nurse',
    characterColor: '#6FA3A0',
    background:
      'Six years of night shifts in the emergency room, $11k saved and zero vacations taken. Texts at 3 a.m. with deadpan gallows humor. Has seen everything and worries about nothing — except never actually leaving the hospital parking lot.',
    tier: 1,
    recommendedAllocation: { stocks: 0.68, bonds: 0.32 },
    allocationTolerance: 0.2,
    negativeReturnHappinessPenalty: -2,
    initialCapital: 11000,
    unlockedAtReputation: 20,
    signingFee: 300,
    returnsFeePct: 0.09,
    dream: {
      label: 'The Van',
      blurb: 'A camper van and eight weeks of coastline. I have never seen the ocean when I was not on call.',
      target: 17000,
    },
    dialogue: [
      "Dev. ER nurse, nights. Sorry if I text at 3am — that's my noon.",
      "Six years, zero vacations, $11k. I counted it during a quiet shift. We don't say the q-word out loud, by the way.",
      'The plan is a camper van and eight weeks of coastline. I have never once seen the ocean while not on call.',
      "$17k buys the van. Get me there and I'll send you a photo of water. Anyway. Back to the chaos.",
    ],
  },
  {
    id: 'june',
    name: 'June',
    age: 22,
    occupation: 'Wedding Photographer',
    characterColor: '#E2A15C',
    background:
      "Shoots other people's happiest days for a living; $8k saved from two years of weekends. Adopted at eighteen months. Writes long, earnest texts and then apologizes for them. Braver than she believes.",
    tier: 1,
    recommendedAllocation: { stocks: 0.7, bonds: 0.3 },
    allocationTolerance: 0.2,
    negativeReturnHappinessPenalty: -2,
    initialCapital: 8000,
    unlockedAtReputation: 22,
    signingFee: 0,
    returnsFeePct: 0.14,
    dream: {
      label: 'The Flight',
      blurb: 'Seoul, three months, and the courage to knock. My birth mother answered my letter.',
      target: 13000,
    },
    dialogue: [
      "Hi! I'm June. I photograph weddings, which means I professionally cry at strangers' happiness.",
      "So, um. I wrote a letter last spring. To my birth mother, in Seoul. She wrote back. She wrote back!",
      "I need $13k — flights, three months' rent, and a Korean tutor so I don't just stand there holding a fruit basket.",
      "This is every weekend I've worked for two years. Sorry for the essay. Please help me knock on that door.",
    ],
  },

  // ── TIER 2 ────────────────────────────────────────────────────────────────
  {
    id: 'jamie',
    name: 'Jamie',
    age: 29,
    occupation: 'Freelance Designer',
    characterColor: '#8B6F47',
    background:
      "Been freelancing for 5 years with variable but solid income. Has $35k in savings from good years. Wants steady growth but isn't deeply sophisticated about markets yet.",
    tier: 2,
    recommendedAllocation: { stocks: 0.65, bonds: 0.35 },
    allocationTolerance: 0.2,
    negativeReturnHappinessPenalty: -3,
    initialCapital: 35000,
    unlockedAtReputation: 27,
    signingFee: 0, // percentage-only client
    returnsFeePct: 0.18,
    dream: {
      label: 'The studio',
      blurb: 'One year of runway — quit client work, start my own design studio, make things I actually like.',
      target: 50000,
    },
    dialogue: [
      "hey. jamie. freelance designer — logos, mostly. some years are great. some years are ramen.",
      "i've scraped together $35k and i'm honestly a little terrified to touch it.",
      "the dream is a year of runway: quit client work, start my own studio, make things i actually like.",
      "$50k is the number. get me there and i'll design your firm a logo that doesn't look like clip art.",
    ],
  },
  {
    id: 'omar',
    name: 'Omar',
    age: 38,
    occupation: 'Physics Teacher & Robotics Coach',
    characterColor: '#5C8A5C',
    background:
      'Teaches high-school physics by day, coaches the Westside Wolverines robotics team by night. $32k saved across twelve careful years. Explains everything with momentum metaphors and is genetically incapable of skipping a dad joke.',
    tier: 2,
    recommendedAllocation: { stocks: 0.64, bonds: 0.36 },
    allocationTolerance: 0.2,
    negativeReturnHappinessPenalty: -3,
    initialCapital: 32000,
    unlockedAtReputation: 26,
    signingFee: 800,
    returnsFeePct: 0.12,
    dream: {
      label: 'Nationals',
      blurb: 'Flights, hotels and a competition robot for twelve kids. Half my team has never left the state.',
      target: 46000,
    },
    dialogue: [
      "Omar! Physics teacher, robotics coach, owner of exactly one tie. Great to meet you.",
      "Twelve years of saving — $32k. My wife calls it the escape fund. I call it potential energy. She married me anyway.",
      'My robotics kids qualified for Nationals. Flights, hotels, a real competition bot — half of them have never left the state.',
      "$46k gets all twelve there. No child watches this on a phone. Let's give this money some momentum!",
    ],
  },
  {
    id: 'priya',
    name: 'Priya',
    age: 27,
    occupation: 'Medical Resident',
    characterColor: '#C96A6A',
    background:
      "Second-year resident running on tea and a color-coded calendar. Parents ran a corner shop for 26 years — open every single day — to put her through med school. Has $38k from grandmother's inheritance and precisely one goal for it.",
    tier: 2,
    recommendedAllocation: { stocks: 0.66, bonds: 0.34 },
    allocationTolerance: 0.2,
    negativeReturnHappinessPenalty: -3,
    initialCapital: 38000,
    unlockedAtReputation: 28,
    signingFee: 1200,
    returnsFeePct: 0.1,
    dream: {
      label: 'Sunday Shutters',
      blurb: "Clear the shop's debt so my parents can close on Sundays. Twenty-six years without one day off.",
      target: 54000,
    },
    dialogue: [
      "Priya. Medical resident. I have seven minutes between rounds, so I'll be efficient — it's my love language.",
      "My parents' corner shop has opened every day for twenty-six years. Every day. Weddings, funerals, flu — the shutters went up.",
      "They did it to pay for med school. My school. This $38k is my grandmother's — she'd approve of the plan.",
      "$54k clears the shop's debt. Then they close on Sundays. That's the whole prescription. Can you fill it?",
    ],
  },
  {
    id: 'frank',
    name: 'Frank',
    age: 55,
    occupation: 'Long-Haul Trucker',
    characterColor: '#7A7A8C',
    background:
      'Thirty-one years and three million miles behind the wheel. $36k saved a diesel stop at a time. Says little, means all of it, calls everyone "boss". His father died in a cab seat outside Amarillo; Frank intends to die on a porch.',
    tier: 2,
    recommendedAllocation: { stocks: 0.6, bonds: 0.4 },
    allocationTolerance: 0.2,
    negativeReturnHappinessPenalty: -3,
    initialCapital: 36000,
    unlockedAtReputation: 27,
    signingFee: 0,
    returnsFeePct: 0.2,
    dream: {
      label: 'The Porch',
      blurb: "A little house on Lake Chelan where Linda grew up. Promised her a porch at our wedding. 1993.",
      target: 52000,
    },
    dialogue: [
      "Frank. I drive trucks. Thirty-one years, three million miles, no speeches.",
      "That's $36k. Saved it a diesel stop at a time. Don't lose it, boss.",
      'At our wedding I promised Linda a porch on Lake Chelan, where she grew up. That was 1993. She never once brought it up. I never once forgot.',
      "$52k buys the house. My old man died in a cab seat outside Amarillo. I plan to die on that porch. In about forty years. No rush.",
    ],
  },

  // ── TIER 3 ────────────────────────────────────────────────────────────────
  {
    id: 'sarah',
    name: 'Sarah',
    age: 32,
    occupation: 'Senior Software Engineer',
    characterColor: '#C98B5E',
    background:
      'Mid-career tech professional with stable, high income. Has $65k to invest and clear financial goals. Understands markets reasonably well and cares about portfolio construction, not just returns.',
    tier: 3,
    recommendedAllocation: { stocks: 0.6, bonds: 0.4 },
    allocationTolerance: 0.1,
    negativeReturnHappinessPenalty: -4,
    initialCapital: 65000,
    unlockedAtReputation: 34,
    signingFee: 2000, // fee-heavy client: large upfront, small cut
    returnsFeePct: 0.05,
    dream: {
      label: 'The sabbatical',
      blurb: 'A full year off with my daughter while she still thinks I am cool. $90k makes it real.',
      target: 90000,
    },
    dialogue: [
      "Sarah. Senior engineer. I've read three books on portfolio theory, so I'll notice if you're improvising.",
      "$65,000. I want process, not luck — diversified, risk-adjusted, defensible.",
      "The goal is a sabbatical fund. $90k means a full year with my daughter while she still thinks I'm cool.",
      "She turns nine in the fall. The clock is real. Quarterly-grade decisions, please.",
    ],
  },
  {
    id: 'elena',
    name: 'Elena',
    age: 45,
    occupation: 'Restaurant Owner',
    characterColor: '#C2544E',
    background:
      "Owns Mateo's, a 40-seat neighborhood restaurant she ran with her late husband for fifteen years. $70k built plate by plate. Feeds everyone who stands still long enough. Loud when happy, quiet only when it matters.",
    tier: 3,
    recommendedAllocation: { stocks: 0.61, bonds: 0.39 },
    allocationTolerance: 0.1,
    negativeReturnHappinessPenalty: -4,
    initialCapital: 70000,
    unlockedAtReputation: 33,
    signingFee: 1500,
    returnsFeePct: 0.1,
    dream: {
      label: 'Table Two',
      blurb: 'A second restaurant across town, with his name over the door this time. MATEO’S — in the big letters.',
      target: 98000,
    },
    dialogue: [
      "Elena. Sit, sit. Have you eaten? You look like you skipped lunch. We'll fix that after the paperwork.",
      "Fifteen years my husband and I ran Mateo's. Forty seats, one kitchen, zero silence. He died two winters ago. The kitchen still isn't quiet — he'd hate that.",
      "This is $70k, built one plate at a time. I'm opening a second place across town. His name over the door in the BIG letters this time.",
      "$98k opens Table Two. You get us there, you eat free forever. I'm serious. I'll be offended if you pay.",
    ],
  },
  {
    id: 'walt',
    name: 'Walt',
    age: 61,
    occupation: 'Machinist, Retiring',
    characterColor: '#6E8898',
    background:
      'Thirty-eight years at the same tool-and-die plant, precise to the thousandth of an inch. $60k in retirement savings, one wife (Carol, 39 years), one laminated map of all 63 National Parks. Measures twice, invests once.',
    tier: 3,
    recommendedAllocation: { stocks: 0.57, bonds: 0.43 },
    allocationTolerance: 0.1,
    negativeReturnHappinessPenalty: -4,
    initialCapital: 60000,
    unlockedAtReputation: 35,
    signingFee: 2500,
    returnsFeePct: 0.04,
    dream: {
      label: 'All 63',
      blurb: "I promised Carol we'd drive every National Park before our knees give out. All sixty-three.",
      target: 84000,
    },
    dialogue: [
      'Walt. Machinist, thirty-eight years. I hold tolerances of a thousandth of an inch, so forgive me if I ask precise questions.',
      "$60,000. I know exactly how many shifts that is. Don't round it off.",
      "I promised Carol we'd drive every National Park before our knees give out. All sixty-three. She's had the map laminated since 1997.",
      "$84k covers the truck, the camper, and two years of gas. My knees and I would appreciate your urgency.",
    ],
  },
  {
    id: 'naomi',
    name: 'Naomi',
    age: 36,
    occupation: 'Documentary Filmmaker',
    characterColor: '#9B7FB8',
    background:
      "Award-shortlisted documentarian with $62k from a streaming licensing deal. Three years into a film about her grandmother's village — and the three elders left who remember it. Narrates her own life in scene directions when stressed.",
    tier: 3,
    recommendedAllocation: { stocks: 0.59, bonds: 0.41 },
    allocationTolerance: 0.1,
    negativeReturnHappinessPenalty: -4,
    initialCapital: 62000,
    unlockedAtReputation: 34,
    signingFee: 800,
    returnsFeePct: 0.12,
    dream: {
      label: 'The Final Cut',
      blurb: 'Finish the film about my grandmother’s village while the last three elders can still tell it.',
      target: 88000,
    },
    dialogue: [
      "Naomi. Documentarian. INT. ADVISOR'S OFFICE — DAY. A filmmaker sits down, trying to look like she understands finance.",
      "I have $62k from a licensing deal and a film that's three years from done on money I don't have yet.",
      "It's about my grandmother's village. Three elders are left who remember it. Last year there were five. You see the problem with 'someday'.",
      '$88k finishes it — crew, archive rights, the color grade. Help me beat the only deadline that actually matters.',
    ],
  },

  // ── TIER 4 ────────────────────────────────────────────────────────────────
  {
    id: 'marcus',
    name: 'Marcus',
    age: 42,
    occupation: 'Business Owner & Investor',
    characterColor: '#8B6F47',
    background:
      'Established entrepreneur with $120k+ to invest. Highly sophisticated about markets, portfolio construction, and risk management. Demands expert-level strategy and precise asset allocation. No patience for guessing.',
    tier: 4,
    recommendedAllocation: { stocks: 0.55, bonds: 0.45 },
    allocationTolerance: 0.07,
    negativeReturnHappinessPenalty: -5,
    initialCapital: 120000,
    unlockedAtReputation: 40,
    signingFee: 4000, // executive mix: big signing fee AND a big cut
    returnsFeePct: 0.15,
    dream: {
      label: 'Burying Whitmore',
      blurb: 'My brother-in-law brags about his fund manager at every family dinner. That ends at $170k.',
      target: 170000,
    },
    dialogue: [
      "Marcus. You have four minutes. I've built three companies — I know what competence looks like.",
      "$120,000. A rounding error for me. A test for you.",
      "My brother-in-law Whitmore brags about his fund manager at every single family dinner. That ends.",
      "Get me past $170k and outperform that smug golf shirt. Do that, and we'll talk real money.",
    ],
  },
  {
    id: 'vivian',
    name: 'Vivian',
    age: 58,
    occupation: 'Retired Hedge Fund Partner',
    characterColor: '#4E7AC2',
    background:
      'Twenty-six years running risk at a fund whose name you would recognize. Retired, bored, and allocating $140k as — her words — "an anthropological study of retail advisors." Grades everything. Tips generously. Misses nothing.',
    tier: 4,
    recommendedAllocation: { stocks: 0.56, bonds: 0.44 },
    allocationTolerance: 0.07,
    negativeReturnHappinessPenalty: -5,
    initialCapital: 140000,
    unlockedAtReputation: 44,
    signingFee: 5000,
    returnsFeePct: 0.12,
    dream: {
      label: 'The Okafor Scholarship',
      blurb: 'A permanent scholarship in my father’s name at the university whose floors he cleaned for thirty years.',
      target: 196000,
    },
    dialogue: [
      "Vivian. I ran risk at a fund you've heard of for twenty-six years. Yes, that one. No, I won't confirm which.",
      "Here's $140k. Consider this an anthropological study: can a retail advisor survive a client who knows exactly what they're doing?",
      'My father cleaned floors at Halloway University for thirty years. Night shift, so I could study there by day. He never saw me graduate.',
      "$196k endows a scholarship with his name on the wall he polished. Emmanuel Okafor. Don't make me wait another decade.",
    ],
  },
  {
    id: 'gus',
    name: 'Gus',
    age: 72,
    occupation: 'Farmer',
    characterColor: '#A8873C',
    background:
      "Third-generation farmer who sold the east acres to developers — $115k he calls 'the guilt money'. Doesn't trust banks, brokers, or weather forecasts. Speaks in proverbs, half of them invented. Warming to you would take a while. He has a while.",
    tier: 4,
    recommendedAllocation: { stocks: 0.55, bonds: 0.45 },
    allocationTolerance: 0.07,
    negativeReturnHappinessPenalty: -5,
    initialCapital: 115000,
    unlockedAtReputation: 42,
    signingFee: 0,
    returnsFeePct: 0.22,
    dream: {
      label: 'The West Field',
      blurb: "Buy back the field the bank took from my father in '82. My grandson's name goes on that deed.",
      target: 162000,
    },
    dialogue: [
      "Gus. I farm. My father farmed. His father farmed. You move money around. We'll see how that goes.",
      "Sold the east acres to men in soft shoes. $115k. Guilt money. It doesn't sleep well in a bank.",
      "In '82 the bank took the west field off my father. He watched them fence it and never said one word about it again. That silence raised me.",
      "$162k buys it back — the developer'll sell, everything's for sale to them. My grandson's name goes on that deed. Prove me wrong about your kind.",
    ],
  },
];

export const clientsById: Record<string, ClientProfile> = ROSTER.reduce(
  (acc, c) => {
    acc[c.id] = c;
    return acc;
  },
  {} as Record<string, ClientProfile>
);

// How many of each tier a single career meets. The rest of the roster simply
// doesn't exist in that career — so players compare casts, not just scores.
const CAST_PER_TIER: Record<number, number> = { 1: 2, 2: 2, 3: 2, 4: 2 };

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Deal a fresh career's cast: a random handful per tier, ordered tier-first so
// downstream code (unlock gates, book listing) reads naturally.
export function pickCareerCast(): ClientProfile[] {
  const cast: ClientProfile[] = [];
  [1, 2, 3, 4].forEach((tier) => {
    const pool = ROSTER.filter((c) => c.tier === tier);
    cast.push(...shuffled(pool).slice(0, Math.min(CAST_PER_TIER[tier], pool.length)));
  });
  return cast;
}

export default ROSTER;
