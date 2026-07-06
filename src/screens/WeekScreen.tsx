import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import WeekIntro from './day/WeekIntro';
import ClientIntro from './day/ClientIntro';
import WeekTransition from './day/WeekTransition';
import WeekSummaryScreen from './WeekSummaryScreen';
import GameOverScreen from './GameOverScreen';
import NewsPopup from './NewsPopup';
import ClientBook from './ClientBook';
import PhoneNotifications from './PhoneNotifications';
import SettingsMenu from './SettingsMenu';
import ShopScreen from './ShopScreen';
import StockTerminal from './StockTerminal';
import ReputationBar from '../components/ReputationBar';
import { useGame } from '../state/GameContext';
import STOCKS from '../data/stocks';
import { RuntimeClient } from '../data/gameState';
import { REGIME_LABEL } from '../data/economicCycles';
import { SHOP_ITEMS } from '../data/advisorEconomy';
import { careerTitle } from '../data/careerRecords';
import { formatMoney } from '../utils/format';
import { FONT_PIXEL, BORDER_W, Palette } from '../theme';
import { makeUseStyles, useTheme } from '../contexts/ThemeContext';

// The firm's workstation: one persistent retro desktop. The background never
// changes — applications (Client Book, News, Phone, Terminal, Shop) open as
// PixelWindows on top of it. HUD above, status bar below, office in between.
// The desktop itself is an OPERATIONS DASHBOARD: it answers "what should I do
// this week?" before anything is opened.

// Triage one client for the dashboard: a colored dot, a one-line status, and
// (when urgent) a THIS WEEK checklist entry. Red = act now, yellow = watch,
// green = healthy.
function clientAttention(cl: RuntimeClient): {
  level: 2 | 1 | 0;
  note: string;
  priority?: string;
} {
  const invested = Object.values(cl.holdings).some((h) => h.shares > 0);
  if (cl.happiness <= 30) {
    return { level: 2, note: 'unhappy — portfolio review due', priority: `Repair ${cl.name}'s portfolio — they're close to walking` };
  }
  if (cl.contractWeeksRemaining <= 1) {
    return { level: 2, note: 'contract ends THIS WEEK', priority: `${cl.name}'s contract ends this week — finish strong` };
  }
  if (!invested) {
    return { level: 1, note: 'cash sitting idle', priority: `Invest ${cl.name}'s idle cash` };
  }
  if (cl.contractWeeksRemaining <= 2) {
    return { level: 1, note: 'contract ends in 2 weeks' };
  }
  if (cl.happiness < 60) {
    return { level: 1, note: 'relationship needs care' };
  }
  const hist = cl.performanceHistory;
  if (hist.length >= 2 && hist[hist.length - 1].happiness > hist[hist.length - 2].happiness) {
    return { level: 0, note: 'relationship improving' };
  }
  return { level: 0, note: 'on track' };
}

export default function WeekScreen() {
  const { state, activeClients, availableClients, expiredClients, canSign, maxClients, advisorBalance, upgrades, priceOf, setPhase, transitionWeek, advanceWeek, toggleBook, toggleNews, togglePhone, toggleShop, toggleTerminal } = useGame();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { c } = useTheme();
  const [alertSeen, setAlertSeen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // The title screen starts/continues the game. If we somehow land here without
  // a game in progress, go back to the title rather than auto-starting a
  // nameless one.
  useEffect(() => {
    if (!state.started) router.replace('/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.started]);

  // Reset the new-clients alert each week.
  useEffect(() => {
    setAlertSeen(false);
  }, [state.currentWeek]);

  if (!state.started) return <View style={styles.screen} />;

  const showAlert = !alertSeen && availableClients.length > 0 && canSign && state.phase === 'builder';

  const week = state.currentWeek;
  const fiscalYear = Math.floor((week - 1) / 52) + 1;
  const quarter = Math.floor(((week - 1) % 52) / 13) + 1;
  const rank = careerTitle(state.records, week);

  // Last resolved week's advisor cash flow — the WEEKLY P/L readout.
  const weeklyProfit = state.advisorTransactions
    .filter((tx) => tx.week === week - 1)
    .reduce((s, tx) => s + tx.amount, 0);

  // The pull-forward: always show the player what they're working toward.
  const nextLocked = Object.values(state.clients)
    .filter((cl) => cl.status === 'unsigned' && cl.unlockedAtReputation > state.reputation)
    .sort((a, b) => a.unlockedAtReputation - b.unlockedAtReputation)[0];
  const nextUpgrade = SHOP_ITEMS.filter((i) => !upgrades[i.id]).sort((a, b) => a.cost - b.cost)[0];
  const goalText = nextLocked
    ? `GOAL: ${nextLocked.name.toUpperCase()} SIGNS AT ${nextLocked.unlockedAtReputation} REP — NOW ${Math.round(state.reputation)}`
    : nextUpgrade && advisorBalance < nextUpgrade.cost
      ? `GOAL: SAVE ${formatMoney(nextUpgrade.cost)} FOR ${nextUpgrade.name} — ${formatMoney(Math.round(advisorBalance))} SAVED`
      : null;

  let body: React.ReactNode;
  if (state.phase === 'weekIntro') {
    body = <WeekIntro week={state.currentWeek} onContinue={() => setPhase('builder')} />;
  } else if (state.phase === 'clientIntro') {
    body = <ClientIntro onDone={() => setPhase('builder')} />;
  } else if (state.phase === 'transition') {
    body = <WeekTransition onContinue={() => setPhase('summary')} />;
  } else if (state.phase === 'summary') {
    body = <WeekSummaryScreen onContinue={advanceWeek} />;
  } else if (state.phase === 'gameOver') {
    body = <GameOverScreen />;
  } else {
    body = (
      <View style={styles.screen}>
        {/* ── TOP HUD ─────────────────────────────────────────────────── */}
        <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
          <View style={styles.hudLeft}>
            <Text style={styles.weekText}>WEEK {week}</Text>
            <Text style={styles.dateText}>Q{quarter} · YR{fiscalYear}</Text>
          </View>
          <View style={styles.hudRight}>
            <ReputationBar reputation={state.reputation} />
            <Pressable onPress={() => setSettingsOpen(true)} style={styles.gearBtn} hitSlop={8}>
              <Text style={styles.gearText}>⚙</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.rankBar}>
          <Text style={styles.rankText} numberOfLines={1}>{rank.toUpperCase()} · {state.firmName ? `${state.firmName.toUpperCase()} INC` : 'THE FIRM'}</Text>
          <View style={styles.regimeChip}>
            <Text style={styles.regimeChipText}>{REGIME_LABEL[state.regime]}</Text>
          </View>
        </View>
        {goalText && (
          <View style={styles.goalBar}>
            <Text style={styles.goalText} numberOfLines={1}>◆ {goalText}</Text>
          </View>
        )}

        {/* Notification toast: new clients waiting */}
        {showAlert && (
          <Pressable style={styles.alert} onPress={() => { setAlertSeen(true); toggleBook(true); }}>
            <Text style={styles.alertText}>
              📋 {availableClients.length} CLIENT{availableClients.length > 1 ? 'S' : ''} WAITING — TAP TO REVIEW
            </Text>
            <View style={styles.alertDot} />
          </Pressable>
        )}
        {activeClients.length === 0 && !showAlert && (
          <Pressable style={styles.alert} onPress={() => toggleBook(true)}>
            <Text style={styles.alertText}>
              {availableClients.length > 0 ? '📋 OPEN THE CLIENT BOOK TO SIGN YOUR FIRST CLIENT' : '📋 NO ACTIVE CLIENTS — OPEN THE CLIENT BOOK'}
            </Text>
          </Pressable>
        )}

        {/* ── DESKTOP: the firm's departments ─────────────────────────── */}
        <ScrollView style={styles.desktop} contentContainerStyle={styles.desktopContent}>
          {(() => {
            // ── Live intelligence for the operations dashboard ──────────
            // Market tape from last week's resolved prices.
            let gainer: { ticker: string; pct: number } | null = null;
            let loser: { ticker: string; pct: number } | null = null;
            let ups = 0;
            let downs = 0;
            STOCKS.forEach((s) => {
              const hist = state.stockPriceHistory[s.id];
              if (!hist || hist.length === 0) return;
              const last = hist[hist.length - 1];
              const p = last.startPrice > 0 ? (last.endPrice - last.startPrice) / last.startPrice : 0;
              if (p > 0) ups++;
              else if (p < 0) downs++;
              if (p > 0 && (!gainer || p > gainer.pct)) gainer = { ticker: s.ticker, pct: p };
              if (p < 0 && (!loser || p < loser.pct)) loser = { ticker: s.ticker, pct: p };
            });
            const g = gainer as { ticker: string; pct: number } | null;
            const l = loser as { ticker: string; pct: number } | null;

            // News: lead with the biggest story actually visible to the player.
            const visibleNews = state.weekNews.filter((a) => !a.insider && (!a.exclusive || upgrades.newsTerminal));
            const lead = visibleNews.find((a) => a.impactLevel === 'major') ?? visibleNews[0] ?? null;

            const pendingCalls = state.messages.filter((m) => !m.resolved && m.weekIssued === week).length;
            const upgradesLeft = SHOP_ITEMS.filter((i) => !upgrades[i.id]).sort((a, b) => a.cost - b.cost);
            const affordable = upgradesLeft.filter((i) => advisorBalance >= i.cost).length;

            // Assets under management: every active client's cash + holdings.
            const aum = activeClients.reduce(
              (sum, cl) => sum + cl.cash + Object.entries(cl.holdings).reduce((s, [id, h]) => s + h.shares * priceOf(id), 0),
              0
            );

            // Client triage rows, most urgent first.
            const triage = activeClients
              .map((cl) => ({ cl, ...clientAttention(cl) }))
              .sort((a, b) => b.level - a.level);

            // THIS WEEK: the auto-generated checklist (max 4 items).
            const priorities: string[] = [];
            triage.filter((t) => t.priority).slice(0, 2).forEach((t) => priorities.push(t.priority!));
            expiredClients.forEach((cl) => priorities.push(`Decide on ${cl.name} — renew or part ways`));
            if (availableClients.length > 0 && canSign) priorities.push(`${availableClients.length} client${availableClients.length === 1 ? '' : 's'} waiting to be signed`);
            if (pendingCalls > 0) priorities.push(`Answer ${pendingCalls} phone request${pendingCalls === 1 ? '' : 's'} by week-end`);
            if (visibleNews.length > 0) priorities.push(`Interpret ${visibleNews.length} market headline${visibleNews.length === 1 ? '' : 's'}`);
            const shortGoal = nextLocked
              ? `Reach ${nextLocked.unlockedAtReputation} rep — ${nextLocked.name} signs`
              : nextUpgrade && advisorBalance < nextUpgrade.cost
                ? `Save ${formatMoney(nextUpgrade.cost)} for ${nextUpgrade.name}`
                : null;

            const dotColor = (level: number) => (level >= 2 ? c.danger : level === 1 ? c.warning : c.success);

            return (
              <>
                {/* THIS WEEK — the checklist */}
                <View style={styles.panelStatic}>
                  <Text style={styles.deptTitle}>▪ THIS WEEK</Text>
                  {priorities.length === 0 ? (
                    <Text style={styles.priorityLine}>▸ Quiet desk. Hunt for an edge in the terminal.</Text>
                  ) : (
                    priorities.slice(0, 4).map((p, i) => (
                      <Text key={i} style={styles.priorityLine} numberOfLines={1}>▸ {p}</Text>
                    ))
                  )}
                </View>

                {/* CLIENT BOOK — the flagship panel with per-client triage */}
                <Pressable onPress={() => toggleBook(true)} style={({ pressed }) => [styles.panel, pressed && styles.panelPressed]}>
                  <View style={styles.panelHead}>
                    <Text style={styles.panelIcon}>📖</Text>
                    <Text style={styles.panelTitle}>CLIENT BOOK</Text>
                    <Text style={styles.panelHint}>OPEN ›</Text>
                  </View>
                  {triage.length === 0 ? (
                    <Text style={styles.clientEmpty}>No active clients — the waiting room has {availableClients.length || 'no'} candidate{availableClients.length === 1 ? '' : 's'}.</Text>
                  ) : (
                    triage.map(({ cl, level, note }) => (
                      <View key={cl.id} style={styles.clientRow}>
                        <View style={[styles.dot, { backgroundColor: dotColor(level) }]} />
                        <Text style={styles.clientName} numberOfLines={1}>{cl.name}</Text>
                        <Text style={[styles.clientNote, level >= 2 && { color: c.danger }, level === 1 && { color: c.warning }]} numberOfLines={1}>
                          {note}
                        </Text>
                      </View>
                    ))
                  )}
                  {availableClients.length > 0 && (
                    <View style={styles.clientRow}>
                      <View style={[styles.dot, { backgroundColor: c.gold }]} />
                      <Text style={[styles.clientNote, { color: c.gold, flex: 1 }]} numberOfLines={1}>
                        ⭐ {availableClients.length} new client{availableClients.length === 1 ? '' : 's'} in the waiting room
                      </Text>
                    </View>
                  )}
                </Pressable>

                {/* STOCK TERMINAL — market snapshot */}
                <Pressable onPress={() => toggleTerminal(true)} style={({ pressed }) => [styles.panel, pressed && styles.panelPressed]}>
                  <View style={styles.panelHead}>
                    <Text style={styles.panelIcon}>📈</Text>
                    <Text style={styles.panelTitle}>STOCK TERMINAL</Text>
                    <View style={styles.snapRegime}>
                      <Text style={styles.snapRegimeText}>{REGIME_LABEL[state.regime]}</Text>
                    </View>
                  </View>
                  {g || l ? (
                    <View style={styles.snapGrid}>
                      <View style={styles.snapCell}>
                        <Text style={styles.snapLabel}>TOP GAINER</Text>
                        <Text style={[styles.snapValue, { color: c.success }]}>{g ? `${g.ticker} +${(g.pct * 100).toFixed(1)}%` : '—'}</Text>
                      </View>
                      <View style={styles.snapCell}>
                        <Text style={styles.snapLabel}>TOP LOSER</Text>
                        <Text style={[styles.snapValue, { color: c.danger }]}>{l ? `${l.ticker} ${(l.pct * 100).toFixed(1)}%` : '—'}</Text>
                      </View>
                      <View style={styles.snapCell}>
                        <Text style={styles.snapLabel}>UP / DOWN</Text>
                        <Text style={styles.snapValue}>
                          <Text style={{ color: c.success }}>▲{ups}</Text>  <Text style={{ color: c.danger }}>▼{downs}</Text>
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.clientEmpty}>{STOCKS.length} stocks listed — first tape prints at week-end.</Text>
                  )}
                </Pressable>

                {/* MARKET NEWS — the lead headline */}
                <Pressable onPress={() => toggleNews(true)} style={({ pressed }) => [styles.panel, pressed && styles.panelPressed]}>
                  <View style={styles.panelHead}>
                    <Text style={styles.panelIcon}>📰</Text>
                    <Text style={styles.panelTitle}>MARKET NEWS</Text>
                    <Text style={styles.panelHint}>{visibleNews.length > 0 ? `${visibleNews.length} STOR${visibleNews.length === 1 ? 'Y' : 'IES'} ›` : ''}</Text>
                  </View>
                  {lead ? (
                    <View style={styles.newsRow}>
                      {lead.impactLevel === 'major' && (
                        <View style={styles.breakingTag}><Text style={styles.breakingText}>BREAKING</Text></View>
                      )}
                      <Text style={styles.newsHeadline} numberOfLines={2}>■ {lead.headline}</Text>
                    </View>
                  ) : (
                    <Text style={styles.clientEmpty}>Quiet markets — no stories this week.</Text>
                  )}
                </Pressable>

                {/* Utility row: Telephone + Shop */}
                <View style={styles.utilRow}>
                  <UtilityCard
                    icon="☎"
                    title="TELEPHONE"
                    stat={
                      state.unreadMessageCount > 0
                        ? `✉ ${state.unreadMessageCount} UNREAD`
                        : pendingCalls > 0
                          ? `☎ ${pendingCalls} NEED ACTION`
                          : 'NO NEW CALLS'
                    }
                    statColor={state.unreadMessageCount > 0 || pendingCalls > 0 ? c.gold : c.muted}
                    badge={state.unreadMessageCount}
                    onPress={() => togglePhone(true)}
                  />
                  <UtilityCard
                    icon="🛒"
                    title="SHOP"
                    stat={
                      upgradesLeft.length === 0
                        ? 'FULLY UPGRADED'
                        : affordable > 0
                          ? `${affordable} AFFORDABLE`
                          : `NEXT: ${upgradesLeft[0].name.toUpperCase()}`
                    }
                    statColor={affordable > 0 ? c.success : c.muted}
                    onPress={() => toggleShop(true)}
                  />
                </View>

                {/* FIRM STATUS — the CEO dashboard */}
                <View style={styles.panelStatic}>
                  <Text style={styles.deptTitle}>▪ FIRM STATUS</Text>
                  <View style={styles.firmGrid}>
                    <View style={styles.firmCol}>
                      <FirmRow label="Cash" value={formatMoney(Math.round(advisorBalance))} />
                      <FirmRow label="AUM" value={formatMoney(Math.round(aum))} />
                      <FirmRow label="Clients" value={`${activeClients.length} / ${maxClients}`} />
                      <FirmRow
                        label="Wkly P/L"
                        value={weeklyProfit === 0 ? '—' : `${weeklyProfit > 0 ? '+' : '-'}${formatMoney(Math.abs(Math.round(weeklyProfit)))}`}
                        color={weeklyProfit > 0 ? c.success : weeklyProfit < 0 ? c.danger : undefined}
                      />
                    </View>
                    <View style={styles.firmCol}>
                      <FirmRow label="Reputation" value={`${Math.round(state.reputation)}/100`} />
                      <FirmRow label="Rank" value={rank} />
                      <FirmRow label="Market" value={REGIME_LABEL[state.regime]} />
                      <FirmRow label="Week" value={`${week} · Q${quarter} Y${fiscalYear}`} />
                    </View>
                  </View>
                  {shortGoal && <FirmRow label="Goal" value={shortGoal} color={c.gold} />}
                </View>

                {/* Desk clutter: decorative only */}
                <View style={styles.deskClutter}>
                  <View style={styles.deskChip}>
                    <Text style={styles.deskChipText}>📅 WK {week}</Text>
                  </View>
                  <Text style={styles.deskDecor}>☕</Text>
                  <Text style={styles.deskDecor}>🪴</Text>
                  <Text style={styles.deskDecor}>🗄</Text>
                </View>
              </>
            );
          })()}

          {/* Office shelf: wall milestones + funded-dream trophies */}
          {(() => {
            const r = state.records;
            const wall: { glyph: string; label: string }[] = [];
            if (r.contractsCompleted >= 1) wall.push({ glyph: '📜', label: 'LICENSE' });
            if (r.swansSurvived >= 1) wall.push({ glyph: '🗞', label: 'SURVIVED IT' });
            if (r.contractsCompleted >= 5) wall.push({ glyph: '🏅', label: '5 CONTRACTS' });
            if (r.sGrades >= 3) wall.push({ glyph: '⭐', label: 'S-CLASS' });
            if (state.reputation >= 75) wall.push({ glyph: '🎓', label: 'TOP ADVISOR' });
            const trophies = r.trophies.slice(-4);
            if (wall.length === 0 && trophies.length === 0) return null;
            return (
              <View style={styles.shelf}>
                <View style={styles.shelfRow}>
                  {wall.slice(0, 4).map((w) => (
                    <View key={w.label} style={styles.wallFrame}>
                      <Text style={styles.wallGlyph}>{w.glyph}</Text>
                      <Text style={styles.wallLabel} numberOfLines={1}>{w.label}</Text>
                    </View>
                  ))}
                  {trophies.map((label, i) => (
                    <View key={`${label}-${i}`} style={styles.wallFrame}>
                      <Text style={styles.wallGlyph}>🏆</Text>
                      <Text style={[styles.wallLabel, { color: c.warning }]} numberOfLines={1}>{label.toUpperCase()}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.shelfPlank} />
              </View>
            );
          })()}
        </ScrollView>

        {/* ── BOTTOM HUD / STATUS BAR ─────────────────────────────────── */}
        <View style={[styles.statusBar, { paddingBottom: insets.bottom + 8 }]}>
          <View style={styles.statusCell}>
            <Text style={styles.statusLabel}>CASH</Text>
            <Text style={styles.statusValue} numberOfLines={1}>{formatMoney(Math.round(advisorBalance))}</Text>
          </View>
          <View style={styles.statusCell}>
            <Text style={styles.statusLabel}>CLIENTS</Text>
            <Text style={styles.statusValue}>{activeClients.length}/{maxClients}</Text>
          </View>
          <View style={styles.statusCell}>
            <Text style={styles.statusLabel}>WKLY P/L</Text>
            <Text style={[styles.statusValue, { color: weeklyProfit > 0 ? c.success : weeklyProfit < 0 ? c.danger : c.text }]} numberOfLines={1}>
              {weeklyProfit === 0 ? '—' : `${weeklyProfit > 0 ? '+' : '-'}${formatMoney(Math.abs(Math.round(weeklyProfit)))}`}
            </Text>
          </View>
          <Pressable
            onPress={transitionWeek}
            disabled={activeClients.length === 0}
            style={({ pressed }) => [styles.nextBtn, activeClients.length === 0 && styles.nextBtnDisabled, pressed && activeClients.length > 0 && styles.nextBtnPressed]}
          >
            <Text style={styles.nextText}>NEXT WEEK ▶</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {body}
      <ClientBook />
      <NewsPopup />
      <PhoneNotifications />
      <ShopScreen />
      <StockTerminal />
      <SettingsMenu visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </View>
  );
}

// Compact utility module: icon + title + one live readout (Telephone, Shop).
function UtilityCard({
  icon,
  title,
  stat,
  statColor,
  badge,
  onPress,
}: {
  icon: string;
  title: string;
  stat: string;
  statColor?: string;
  badge?: number;
  onPress: () => void;
}) {
  const styles = useStyles();
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.cardSmall, pressed && styles.panelPressed]}>
      <Text style={styles.cardIconSmall}>{icon}</Text>
      <View style={styles.cardSmallBody}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={[styles.cardStat, { color: statColor ?? c.gold }]} numberOfLines={1}>{stat}</Text>
      </View>
      {badge ? (
        <View style={styles.cardBadge} pointerEvents="none">
          <Text style={styles.cardBadgeText}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

// One dotted-leader line of the FIRM STATUS panel.
function FirmRow({ label, value, color }: { label: string; value: string; color?: string }) {
  const styles = useStyles();
  return (
    <View style={styles.firmRow}>
      <Text style={styles.firmLabel}>{label}</Text>
      <View style={styles.firmDots} />
      <Text style={[styles.firmValue, color ? { color } : null]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const useStyles = makeUseStyles((c: Palette) =>
  StyleSheet.create({
  root: { flex: 1, backgroundColor: c.bg },
  screen: { flex: 1, backgroundColor: c.bgDeep },

  // Top HUD
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 8, backgroundColor: c.panelDark, borderBottomWidth: BORDER_W, borderBottomColor: c.border },
  hudLeft: { flexDirection: 'row', alignItems: 'baseline' },
  hudRight: { flexDirection: 'row', alignItems: 'center' },
  weekText: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 17, fontWeight: '900', letterSpacing: 1 },
  dateText: { fontFamily: FONT_PIXEL, color: c.muted, fontSize: 10, fontWeight: '800', marginLeft: 8, letterSpacing: 0.5 },
  gearBtn: { width: 28, height: 28, marginLeft: 8, borderWidth: 2, borderColor: c.border, backgroundColor: c.panel, alignItems: 'center', justifyContent: 'center' },
  gearText: { fontSize: 16, color: c.text },
  rankBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: c.panelDark, borderBottomWidth: 2, borderBottomColor: c.border, paddingVertical: 4, paddingHorizontal: 12 },
  rankText: { fontFamily: FONT_PIXEL, color: c.textDim, fontSize: 9, fontWeight: '900', letterSpacing: 1, flex: 1, marginRight: 8 },
  regimeChip: { borderWidth: 2, borderColor: c.gold, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: c.panel },
  regimeChipText: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 9, fontWeight: '900' },
  goalBar: { backgroundColor: c.panelDark, borderBottomWidth: 2, borderBottomColor: c.border, paddingVertical: 5, paddingHorizontal: 12, alignItems: 'center' },
  goalText: { fontFamily: FONT_PIXEL, color: c.textDim, fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },

  alert: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: c.panel, borderBottomWidth: 2, borderBottomColor: c.gold, paddingVertical: 9, paddingHorizontal: 10 },
  alertText: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  alertDot: { width: 8, height: 8, backgroundColor: c.danger, marginLeft: 8 },

  // Desktop surface: the operations dashboard
  desktop: { flex: 1 },
  desktopContent: { padding: 10, paddingBottom: 6, flexGrow: 1 },
  deptTitle: { fontFamily: FONT_PIXEL, color: c.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1, marginBottom: 6 },

  // Interactive application panels
  panel: { backgroundColor: c.panel, borderWidth: 2, borderColor: c.border, padding: 10, marginBottom: 8 },
  panelPressed: { borderColor: c.gold, transform: [{ translateY: 1 }] },
  panelStatic: { backgroundColor: c.panelDark, borderWidth: 2, borderColor: c.border, padding: 10, marginBottom: 8 },
  panelHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  panelIcon: { fontSize: 20, marginRight: 8 },
  panelTitle: { fontFamily: FONT_PIXEL, color: c.text, fontSize: 12, fontWeight: '900', letterSpacing: 0.5, flex: 1 },
  panelHint: { fontFamily: FONT_PIXEL, color: c.muted, fontSize: 8, fontWeight: '900', letterSpacing: 0.5 },

  // THIS WEEK checklist
  priorityLine: { fontFamily: FONT_PIXEL, color: c.textDim, fontSize: 10, fontWeight: '800', lineHeight: 17 },

  // Client triage rows
  clientRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, borderTopWidth: 1, borderTopColor: c.divider },
  dot: { width: 8, height: 8, marginRight: 8 },
  clientName: { fontFamily: FONT_PIXEL, color: c.text, fontSize: 11, fontWeight: '900', width: 86 },
  clientNote: { fontFamily: FONT_PIXEL, color: c.muted, fontSize: 9, fontWeight: '800', flex: 1 },
  clientEmpty: { color: c.muted, fontSize: 11, fontStyle: 'italic' },

  // Market snapshot grid
  snapRegime: { borderWidth: 2, borderColor: c.gold, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: c.panelDark },
  snapRegimeText: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 8, fontWeight: '900' },
  snapGrid: { flexDirection: 'row' },
  snapCell: { flex: 1, borderWidth: 1, borderColor: c.divider, backgroundColor: c.panelDark, paddingVertical: 6, paddingHorizontal: 6, marginRight: 4 },
  snapLabel: { fontFamily: FONT_PIXEL, color: c.muted, fontSize: 7, fontWeight: '900', letterSpacing: 0.5 },
  snapValue: { fontFamily: FONT_PIXEL, color: c.text, fontSize: 10, fontWeight: '900', marginTop: 3 },

  // News lead headline
  newsRow: {},
  breakingTag: { alignSelf: 'flex-start', backgroundColor: c.danger, paddingHorizontal: 5, paddingVertical: 2, marginBottom: 5 },
  breakingText: { fontFamily: FONT_PIXEL, color: c.white, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  newsHeadline: { fontFamily: FONT_PIXEL, color: c.text, fontSize: 11, fontWeight: '800', lineHeight: 16 },

  // Utility cards (Telephone / Shop)
  utilRow: { flexDirection: 'row', marginBottom: 8 },
  cardSmall: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: c.panel, borderWidth: 2, borderColor: c.border, padding: 10, marginHorizontal: 2 },
  cardIconSmall: { fontSize: 22, marginRight: 8 },
  cardSmallBody: { flex: 1 },
  cardTitle: { fontFamily: FONT_PIXEL, color: c.text, fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  cardStat: { fontFamily: FONT_PIXEL, fontSize: 8, fontWeight: '900', letterSpacing: 0.3, marginTop: 3 },
  cardBadge: { position: 'absolute', top: 4, right: 4, minWidth: 18, height: 18, paddingHorizontal: 3, backgroundColor: c.danger, borderWidth: 2, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
  cardBadgeText: { fontFamily: FONT_PIXEL, color: c.white, fontSize: 10, fontWeight: '900' },

  // Firm status grid
  firmGrid: { flexDirection: 'row' },
  firmCol: { flex: 1, marginRight: 8 },
  firmRow: { flexDirection: 'row', alignItems: 'flex-end', paddingVertical: 3.5 },
  firmLabel: { fontFamily: FONT_PIXEL, color: c.textDim, fontSize: 9, fontWeight: '800' },
  firmDots: { flex: 1, borderBottomWidth: 1, borderBottomColor: c.divider, borderStyle: 'dotted' as any, marginHorizontal: 4, marginBottom: 3 },
  firmValue: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 9, fontWeight: '900', maxWidth: '62%' },

  // Desk clutter
  deskClutter: { flexDirection: 'row', alignItems: 'center', marginTop: 2, marginBottom: 4 },
  deskChip: { borderWidth: 2, borderColor: c.border, backgroundColor: c.panel, paddingHorizontal: 6, paddingVertical: 3, marginRight: 8 },
  deskChipText: { fontFamily: FONT_PIXEL, color: c.textDim, fontSize: 8, fontWeight: '900' },
  deskDecor: { fontSize: 17, marginRight: 9, opacity: 0.85 },

  // Office shelf (milestones + trophies)
  shelf: { marginTop: 6, marginBottom: 4 },
  shelfRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
  wallFrame: { alignItems: 'center', borderWidth: 2, borderColor: c.border, backgroundColor: c.panel, paddingHorizontal: 6, paddingVertical: 3, marginHorizontal: 3, marginBottom: 4, maxWidth: 78 },
  wallGlyph: { fontSize: 13 },
  wallLabel: { fontFamily: FONT_PIXEL, color: c.muted, fontSize: 6, fontWeight: '900', letterSpacing: 0.5, marginTop: 1 },
  shelfPlank: { height: 5, backgroundColor: c.border, marginHorizontal: 30 },

  // Bottom status bar
  statusBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.panelDark, borderTopWidth: BORDER_W, borderTopColor: c.border, paddingTop: 8, paddingHorizontal: 10 },
  statusCell: { flex: 1, alignItems: 'center', borderRightWidth: 1, borderRightColor: c.divider, paddingHorizontal: 4 },
  statusLabel: { fontFamily: FONT_PIXEL, color: c.muted, fontSize: 7, fontWeight: '900', letterSpacing: 1 },
  statusValue: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 12, fontWeight: '900', marginTop: 2 },
  nextBtn: { flex: 1.6, backgroundColor: c.button, borderWidth: BORDER_W, borderColor: c.border, paddingVertical: 12, alignItems: 'center', marginLeft: 8 },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnPressed: { transform: [{ translateY: 1 }] },
  nextText: { fontFamily: FONT_PIXEL, color: c.ink, fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  })
);
