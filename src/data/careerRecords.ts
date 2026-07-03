// Career records, streaks and fiscal-year ("season") reviews. Pure data and
// functions — the reducer owns when they change, the UI owns how they're shown.

export const WEEKS_PER_YEAR = 52;

export interface CareerRecords {
  bestWeekPct: number; // best single-week book return, as a fraction (>0 only)
  bestWeekDollar: number; // best single-week book P/L in dollars
  greenStreak: number; // current run of consecutive positive weeks
  bestGreenStreak: number;
  swansSurvived: number; // black-swan weeks endured with a career intact
  contractsCompleted: number;
  sGrades: number; // contracts finished at grade S
  dreamsFunded: number;
  trophies: string[]; // funded-dream labels, displayed on the desk shelf
}

export function freshRecords(): CareerRecords {
  return {
    bestWeekPct: 0,
    bestWeekDollar: 0,
    greenStreak: 0,
    bestGreenStreak: 0,
    swansSurvived: 0,
    contractsCompleted: 0,
    sGrades: 0,
    dreamsFunded: 0,
    trophies: [],
  };
}

// Everything a resolved week contributes to the record book.
export interface WeekOutcome {
  bookReturnPct: number; // aggregate return across all active clients
  bookReturnDollar: number;
  hadClients: boolean; // streak/best-week records only count managed weeks
  survivedSwan: boolean;
  contractsCompleted: number;
  sGrades: number;
  dreamsFundedLabels: string[];
}

// Fold a week into the records. `beats` lists the records broken this week,
// phrased for the ★ NEW RECORD banner on the week summary.
export function updateRecords(
  r: CareerRecords,
  w: WeekOutcome
): { records: CareerRecords; beats: string[] } {
  const next: CareerRecords = { ...r, trophies: [...r.trophies] };
  const beats: string[] = [];

  if (w.hadClients) {
    if (w.bookReturnDollar > 0) {
      next.greenStreak = r.greenStreak + 1;
      if (next.greenStreak > r.bestGreenStreak) {
        next.bestGreenStreak = next.greenStreak;
        // A 1-2 week "streak" isn't a story yet; celebrate from 3 up.
        if (next.bestGreenStreak >= 3) beats.push(`${next.bestGreenStreak}-week green streak`);
      }
    } else {
      next.greenStreak = 0;
    }
    if (w.bookReturnPct > r.bestWeekPct && w.bookReturnPct >= 0.01) {
      next.bestWeekPct = w.bookReturnPct;
      beats.push(`Best week ever: +${(w.bookReturnPct * 100).toFixed(2)}%`);
    } else if (w.bookReturnPct > r.bestWeekPct && w.bookReturnPct > 0) {
      next.bestWeekPct = w.bookReturnPct; // track quietly below the 1% bar
    }
    if (w.bookReturnDollar > r.bestWeekDollar) next.bestWeekDollar = w.bookReturnDollar;
  }

  if (w.survivedSwan) {
    next.swansSurvived = r.swansSurvived + 1;
    beats.push(`Black swan survived (#${next.swansSurvived})`);
  }

  next.contractsCompleted = r.contractsCompleted + w.contractsCompleted;
  if (w.sGrades > 0) {
    next.sGrades = r.sGrades + w.sGrades;
    beats.push(`S-grade contract #${next.sGrades}`);
  }

  w.dreamsFundedLabels.forEach((label) => {
    next.dreamsFunded += 1;
    next.trophies.push(label);
  });

  return { records: next, beats };
}

// ---------------------------------------------------------------------------
// Career titles — awarded by cumulative achievement, shown on the title
// screen's Continue line and at every year-end review.

export type CareerTitle =
  | 'Associate'
  | 'Advisor'
  | 'Senior Advisor'
  | 'Partner'
  | 'Managing Partner'
  | 'Legend of the Street';

// Longevity plus achievement: years survived, contracts closed, S-grades,
// dreams funded and crashes weathered all move the needle.
export function careerScore(r: CareerRecords, currentWeek: number): number {
  const years = Math.floor((currentWeek - 1) / WEEKS_PER_YEAR);
  return years * 4 + r.contractsCompleted * 2 + r.sGrades * 3 + r.dreamsFunded * 4 + r.swansSurvived * 2;
}

export function careerTitle(r: CareerRecords, currentWeek: number): CareerTitle {
  const s = careerScore(r, currentWeek);
  if (s >= 60) return 'Legend of the Street';
  if (s >= 36) return 'Managing Partner';
  if (s >= 20) return 'Partner';
  if (s >= 10) return 'Senior Advisor';
  if (s >= 4) return 'Advisor';
  return 'Associate';
}

// ---------------------------------------------------------------------------
// Year in review — the season beat that opens the summary every 52nd week.

export interface YearReview {
  year: number; // 1-based fiscal year just completed
  avgWeeklyReturnPct: number; // mean client-week return over the year
  firmIncome: number; // positive advisor cash-flow during the year
  contractsCompleted: number; // career total at year end
  dreamsFunded: number; // career total at year end
  bestWeekPct: number; // career best at year end
  title: CareerTitle;
}
