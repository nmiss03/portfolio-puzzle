// Client voice: how each client SOUNDS when things happen to their money.
// These lines arrive as phone texts (informational "client notes", never
// graded) and as testimonials on contract report cards. One bark max per
// client per week, priority: fired > dream > misery > recovery > loss > win.
//
// Voice guide — Alex: exclamatory oversharer. Jamie: lowercase, self-
// deprecating. Sarah: precise, quietly devastating. Marcus: clipped, imperious.

import { ClientMessage } from './clientMessages';
import { ContractGrade } from './contractSystem';

interface Voice {
  win: string[]; // weekly return >= +2.5%
  loss: string[]; // weekly return <= -2.5%
  misery: string; // happiness crosses DOWN through 25 — the warning shot
  recovery: string; // happiness crosses UP through 25 — "I almost walked"
  dream: string; // portfolio first reaches the dream target
  goodbye: string; // fired you — the breakup text
  gradeHigh: string; // report card S/A
  gradeMid: string; // report card B
  gradeLow: string; // report card C/D
}

const VOICES: Record<string, Voice> = {
  alex: {
    win: [
      'DUDE. I just checked the app. Is this real?? I told my roommate you were a wizard!!',
      "Okay I keep refreshing the number and it keeps being big. Grilled cheese fund is COOKING!",
    ],
    loss: [
      'hey so… the app is showing a lot of red? is that normal?? tell me that\'s normal.',
      "I'm not panicking!! I'm just. checking in. very calmly. about the red.",
    ],
    misery: "I keep thinking about the truck. My dad said this would happen. Please tell me it won't.",
    recovery: "Okay. Okokok. We're back?? WE'RE BACK. I never doubted you. (I doubted you a little.)",
    dream: "SIXTEEN THOUSAND. THE TRUCK IS REAL. First grilled cheese has your name on it. I'M NOT CRYING, YOU'RE CRYING.",
    goodbye: 'I trusted you with everything I saved. The truck was the whole plan. Please don\'t call me.',
    gradeHigh: 'Best. Advisor. Ever. I already told literally everyone I know.',
    gradeMid: 'Solid! We\'re getting there. The truck waits for no one though!!',
    gradeLow: 'I mean… we\'re still friends. But my savings account is giving me a look.',
  },
  jamie: {
    win: [
      'ok wow. checked the number twice. maybe i can be one of those people who buys the nice coffee.',
      'the studio fund said a big number today. don\'t make it weird. but thank you.',
    ],
    loss: [
      'saw the number. going to draw sad logos for a bit. it\'s fine. probably fine?',
      'ramen week energy. tell me you have a plan.',
    ],
    misery: 'i keep doing the math on how many client projects this loss equals. it\'s a lot of logos.',
    recovery: 'not gonna lie, i drafted the "we should talk" text. deleting it now. keep going.',
    dream: 'fifty. thousand. i just gave my worst client notice. the studio is happening. you did that.',
    goodbye: 'i did the math. that was three years of freelancing, gone. good luck with everything.',
    gradeHigh: 'ok this deserves the nice coffee. logo\'s in progress. it\'s good. you\'ll cry.',
    gradeMid: 'respectable. the studio remains a future studio, but respectable.',
    gradeLow: 'i\'ve had clients ghost me with better results. we\'re renegotiating my patience.',
  },
  sarah: {
    win: [
      'Reviewed the week. Above benchmark, sensible exposure. Noted, and appreciated.',
      'Good week. My daughter asked why I was smiling at a spreadsheet. Keep it up.',
    ],
    loss: [
      'I ran the drawdown against my model. You\'re inside tolerance — barely. Tighten up.',
      'Volatility I can accept. Sloppiness I can\'t. Which was this?',
    ],
    misery: 'I recalculated the sabbatical timeline tonight. It moved a year out. She\'ll be ten. Fix this.',
    recovery: 'The numbers are recovering. So is my confidence. Both remain on probation.',
    dream: 'The fund is there. $90k. I gave notice this morning — a whole year with her. Thank you. Genuinely.',
    goodbye: 'I computed exactly what your decisions cost: the year with my daughter. We\'re done.',
    gradeHigh: 'Rigorous, defensible, repeatable. If you were a codebase, I\'d approve the merge.',
    gradeMid: 'Adequate. "Adequate" is not a word I enjoy using about my daughter\'s year.',
    gradeLow: 'I\'ve documented my concerns. There are several. Alphabetized.',
  },
  marcus: {
    win: [
      'Saw the number. Acceptable. Whitmore\'s guy did less. Continue.',
      'Good. Do it again.',
    ],
    loss: [
      'Explain the drawdown. One sentence. Choose it carefully.',
      'Whitmore called to ask how my portfolio was doing. Fix this.',
    ],
    misery: 'I have fired better advisors for less. Consider the next few weeks an audition.',
    recovery: 'You climbed out of the hole. Noted. Don\'t dig another.',
    dream: 'Whitmore went quiet at dinner when I said the number. Quiet. Money well spent — yours and mine.',
    goodbye: 'Three companies. Two divorces. One rule: never pay twice for incompetence. Records to my lawyer.',
    gradeHigh: 'Competence. Rarer than it should be. There may be more capital where that came from.',
    gradeMid: 'Passing. Whitmore\'s manager also passes. Do you see the problem?',
    gradeLow: 'I\'ve seen better performance from a savings account. Impress me or lose me.',
  },
};

const FALLBACK: Voice = {
  win: ['Good week. Keep it going.'],
  loss: ['Saw the losses. Watching closely.'],
  misery: 'I\'m losing faith in this arrangement.',
  recovery: 'Better. I was close to leaving.',
  dream: 'We hit the target. I won\'t forget this.',
  goodbye: 'This isn\'t working. I\'m out.',
  gradeHigh: 'Excellent work this contract.',
  gradeMid: 'A fair result.',
  gradeLow: 'I expected more.',
};

function voiceOf(clientId: string): Voice {
  return VOICES[clientId] ?? FALLBACK;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// The client's one-line reaction on a contract report card.
export function gradeQuote(clientId: string, grade: ContractGrade): string {
  const v = voiceOf(clientId);
  if (grade === 'S' || grade === 'A') return v.gradeHigh;
  if (grade === 'B') return v.gradeMid;
  return v.gradeLow;
}

export type BarkEvent = 'win' | 'loss' | 'misery' | 'recovery' | 'dream' | 'goodbye';

export function barkLine(clientId: string, event: BarkEvent): string {
  const v = voiceOf(clientId);
  if (event === 'win') return pick(v.win);
  if (event === 'loss') return pick(v.loss);
  return v[event];
}

// Wrap a bark as an informational phone text (never graded, arrives unread so
// the phone badge pings — the phone is the game's emotional bus).
export function makeClientNote(clientId: string, clientName: string, week: number, text: string): ClientMessage {
  return {
    id: `note-${clientId}-w${week}-${Math.floor(Math.random() * 100000)}`,
    clientId,
    clientName,
    messageType: 'client_note',
    stockId: '',
    stockName: '',
    messageText: text,
    weekIssued: week,
    deadline: week,
    baselineShares: 0,
    read: false,
    resolved: true,
    fulfilled: true,
  };
}
