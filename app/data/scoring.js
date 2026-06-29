// Scoring engine.
//
// The player allocates a percentage to each individual stock. We roll those up
// into three category buckets (growth / dividend / bond) and an asset-class
// split (stock / bond), then compare the category mix to the level's ideal.
//
// Score = "portfolio overlap": for each category, how much of the player's
// weight falls within the ideal weight. Summed across categories this is a
// clean 0–100 number (it equals 100 - (sum of |diff|)/2). 100 = perfect match.

const CATEGORIES = ['growth', 'dividend', 'bond'];

export function summarizeAllocation(allocations, stocks) {
  const byCategory = { growth: 0, dividend: 0, bond: 0 };
  let total = 0;

  stocks.forEach((s) => {
    const v = Number(allocations[s.id]) || 0;
    if (byCategory[s.category] != null) byCategory[s.category] += v;
    total += v;
  });

  const byAssetClass = {
    stock: byCategory.growth + byCategory.dividend,
    bond: byCategory.bond,
  };

  return { byCategory, byAssetClass, total };
}

export function scoreAllocation(allocations, stocks, level) {
  const { byCategory, byAssetClass, total } = summarizeAllocation(allocations, stocks);
  const ideal = level.ideal;

  // Overlap: sum of the per-category minimum of player vs. ideal.
  const overlap = CATEGORIES.reduce(
    (sum, c) => sum + Math.min(byCategory[c], ideal[c] || 0),
    0
  );
  const score = Math.max(0, Math.min(100, Math.round(overlap)));

  const idealAssetClass = {
    stock: (ideal.growth || 0) + (ideal.dividend || 0),
    bond: ideal.bond || 0,
  };

  const feedback = buildFeedback(byCategory, byAssetClass, ideal, idealAssetClass, score);

  return {
    score,
    total,
    byCategory,
    byAssetClass,
    ideal,
    idealAssetClass,
    ...feedback,
  };
}

function ratingFor(score) {
  if (score >= 90) return { rating: 'Excellent', color: '#22C55E' };
  if (score >= 75) return { rating: 'Strong', color: '#84CC16' };
  if (score >= 60) return { rating: 'Decent', color: '#F59E0B' };
  if (score >= 40) return { rating: 'Off Target', color: '#F97316' };
  return { rating: 'Needs Work', color: '#EF4444' };
}

function buildFeedback(byCategory, byAssetClass, ideal, idealAssetClass, score) {
  const { rating, color } = ratingFor(score);
  const messages = [];

  const bondDiff = byAssetClass.bond - idealAssetClass.bond;
  const growthDiff = byCategory.growth - (ideal.growth || 0);
  const dividendDiff = byCategory.dividend - (ideal.dividend || 0);

  // Asset-class (stocks vs bonds) is the headline lesson.
  if (bondDiff <= -10) {
    messages.push({
      tone: 'warning',
      title: 'Too aggressive',
      text:
        "You're light on bonds. Even a young investor keeps a cushion of bonds " +
        'so the whole portfolio is not exposed to a market crash.',
    });
  } else if (bondDiff >= 12) {
    messages.push({
      tone: 'warning',
      title: 'Too conservative',
      text:
        "That's a lot of bonds for someone with a 40-year horizon. They can " +
        'afford more risk — shift weight from bonds into growth.',
    });
  }

  // Within-stocks tilt (growth vs dividend).
  if (growthDiff <= -15) {
    messages.push({
      tone: 'info',
      title: 'Needs more growth',
      text:
        'Lean harder into the high-growth tech names. Over 40 years, compounding ' +
        'growth matters far more than current income.',
    });
  } else if (growthDiff >= 20) {
    messages.push({
      tone: 'info',
      title: 'Very concentrated in growth',
      text:
        'Almost everything is in high-flyers. A slice of steady dividend payers ' +
        'smooths the ride without giving up much upside.',
    });
  }

  if (dividendDiff <= -18 && growthDiff > -15) {
    messages.push({
      tone: 'info',
      title: 'Light on dividend payers',
      text: 'A little exposure to steady dividend stocks adds balance.',
    });
  }

  if (messages.length === 0) {
    messages.push({
      tone: 'success',
      title: 'Well balanced',
      text: 'This matches an aggressive long-term profile nicely — great read of the client.',
    });
  }

  let headline;
  if (score >= 90) headline = 'Nailed it.';
  else if (score >= 75) headline = 'Close — solid portfolio.';
  else if (score >= 60) headline = 'On the right track.';
  else if (score >= 40) headline = 'Not quite — re-read the client.';
  else headline = "This portfolio doesn't fit the client.";

  return { rating, ratingColor: color, headline, messages };
}
