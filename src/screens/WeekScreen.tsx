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
import { REGIME_LABEL } from '../data/economicCycles';
import { SHOP_ITEMS } from '../data/advisorEconomy';
import { careerTitle } from '../data/careerRecords';
import { formatMoney } from '../utils/format';
import { FONT_PIXEL, BORDER_W, Palette } from '../theme';
import { makeUseStyles, useTheme } from '../contexts/ThemeContext';

// The firm's workstation: one persistent retro desktop. The background never
// changes — applications (Client Book, News, Phone, Terminal, Shop) open as
// PixelWindows on top of it. HUD above, status bar below, office in between.

export default function WeekScreen() {
  const { state, activeClients, availableClients, canSign, maxClients, advisorBalance, upgrades, setPhase, transitionWeek, advanceWeek, toggleBook, toggleNews, togglePhone, toggleShop, toggleTerminal } = useGame();
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
            // Live readouts so the desk feels staffed without opening anything.
            const endingSoon = activeClients.some((cl) => cl.contractWeeksRemaining === 1);
            let mover: { ticker: string; pct: number } | null = null;
            let movers = 0;
            STOCKS.forEach((s) => {
              const hist = state.stockPriceHistory[s.id];
              if (!hist || hist.length === 0) return;
              const last = hist[hist.length - 1];
              const p = last.startPrice > 0 ? (last.endPrice - last.startPrice) / last.startPrice : 0;
              if (Math.abs(p) >= 0.02) movers++;
              if (!mover || Math.abs(p) > Math.abs(mover.pct)) mover = { ticker: s.ticker, pct: p };
            });
            const headlines = state.weekNews.filter((a) => !a.insider && (!a.exclusive || upgrades.newsTerminal)).length;
            const pendingCalls = state.messages.filter((m) => !m.resolved && m.weekIssued === week).length;
            const upgradesLeft = SHOP_ITEMS.filter((i) => !upgrades[i.id]);
            const affordable = upgradesLeft.filter((i) => advisorBalance >= i.cost).length;
            const m = mover as { ticker: string; pct: number } | null;

            return (
              <>
                <View style={styles.deptRow}>
                  {/* CLIENTS department */}
                  <View style={styles.dept}>
                    <Text style={styles.deptTitle}>▪ CLIENTS</Text>
                    <AppCard
                      big
                      icon="📖"
                      title="CLIENT BOOK"
                      desc="Sign clients & manage their portfolios."
                      stat={`👥 ${activeClients.length} ACTIVE`}
                      stat2={`⭐ ${availableClients.length} WAITING`}
                      statColor={availableClients.length > 0 ? c.gold : c.muted}
                      warn={endingSoon ? '⚠ CONTRACT ENDS THIS WEEK' : undefined}
                      onPress={() => toggleBook(true)}
                    />
                    <AppCard
                      icon="☎"
                      title="TELEPHONE"
                      desc="Requests, tips & client texts."
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
                  </View>

                  {/* MARKET department */}
                  <View style={styles.dept}>
                    <Text style={styles.deptTitle}>▪ MARKET</Text>
                    <AppCard
                      big
                      icon="📈"
                      title="STOCK TERMINAL"
                      desc="Prices, movers & company research."
                      stat={m ? `${m.pct >= 0 ? '▲' : '▼'} ${m.ticker} ${m.pct >= 0 ? '+' : ''}${(m.pct * 100).toFixed(1)}%` : `${STOCKS.length} LISTED`}
                      stat2={m ? `${movers} MOVER${movers === 1 ? '' : 'S'} LAST WEEK` : undefined}
                      statColor={m ? (m.pct >= 0 ? c.success : c.danger) : c.muted}
                      onPress={() => toggleTerminal(true)}
                    />
                    <AppCard
                      icon="📰"
                      title="MARKET NEWS"
                      desc="This week's headlines to interpret."
                      stat={headlines > 0 ? `■ ${headlines} HEADLINE${headlines === 1 ? '' : 'S'}` : 'QUIET WEEK'}
                      statColor={headlines > 0 ? c.gold : c.muted}
                      onPress={() => toggleNews(true)}
                    />
                  </View>
                </View>

                {/* OFFICE department: shop + firm overview */}
                <View style={styles.officeRow}>
                  <View style={styles.officeCol}>
                    <Text style={styles.deptTitle}>▪ OFFICE</Text>
                    <AppCard
                      small
                      icon="🛒"
                      title="SHOP"
                      desc=""
                      stat={
                        upgradesLeft.length === 0
                          ? 'FULLY UPGRADED'
                          : affordable > 0
                            ? `${affordable} AFFORDABLE`
                            : `${upgradesLeft.length} UPGRADE${upgradesLeft.length === 1 ? '' : 'S'}`
                      }
                      statColor={affordable > 0 ? c.success : c.muted}
                      onPress={() => toggleShop(true)}
                    />
                    {/* Desk clutter: decorative only */}
                    <View style={styles.deskClutter}>
                      <View style={styles.deskChip}>
                        <Text style={styles.deskChipText}>📅 WK {week}</Text>
                      </View>
                      <Text style={styles.deskDecor}>☕</Text>
                      <Text style={styles.deskDecor}>🪴</Text>
                      <Text style={styles.deskDecor}>🗄</Text>
                    </View>
                  </View>

                  <View style={styles.firmPanel}>
                    <Text style={styles.deptTitle}>▪ FIRM STATUS</Text>
                    <FirmRow label="Cash" value={formatMoney(Math.round(advisorBalance))} />
                    <FirmRow label="Clients" value={`${activeClients.length} / ${maxClients}`} />
                    <FirmRow
                      label="Weekly P/L"
                      value={weeklyProfit === 0 ? '—' : `${weeklyProfit > 0 ? '+' : '-'}${formatMoney(Math.abs(Math.round(weeklyProfit)))}`}
                      color={weeklyProfit > 0 ? c.success : weeklyProfit < 0 ? c.danger : undefined}
                    />
                    <FirmRow label="Reputation" value={`${Math.round(state.reputation)}/100`} />
                    <FirmRow label="Rank" value={rank} />
                    <FirmRow label="Market" value={REGIME_LABEL[state.regime]} />
                  </View>
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

// A workstation module: framed shortcut card with icon, blurb and one live
// readout. `big` = flagship apps (Client Book, Terminal); `small` = utility
// row (Shop).
function AppCard({
  icon,
  title,
  desc,
  stat,
  stat2,
  statColor,
  warn,
  badge,
  big = false,
  small = false,
  onPress,
}: {
  icon: string;
  title: string;
  desc: string;
  stat: string;
  stat2?: string;
  statColor?: string;
  warn?: string;
  badge?: number;
  big?: boolean;
  small?: boolean;
  onPress: () => void;
}) {
  const styles = useStyles();
  const { c } = useTheme();
  if (small) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.cardSmall, pressed && styles.cardPressed]}>
        <Text style={styles.cardIconSmall}>{icon}</Text>
        <View style={styles.cardSmallBody}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={[styles.cardStat, { color: statColor ?? c.gold }]} numberOfLines={1}>{stat}</Text>
        </View>
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <Text style={big ? styles.cardIconBig : styles.cardIcon}>{icon}</Text>
      <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
      <Text style={styles.cardDesc} numberOfLines={2}>{desc}</Text>
      <Text style={[styles.cardStat, { color: statColor ?? c.gold }]} numberOfLines={1}>{stat}</Text>
      {stat2 ? <Text style={[styles.cardStat, { color: statColor ?? c.gold, marginTop: 2 }]} numberOfLines={1}>{stat2}</Text> : null}
      {warn ? <Text style={styles.cardWarn} numberOfLines={1}>{warn}</Text> : null}
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

  // Desktop surface: department panels + workstation cards
  desktop: { flex: 1 },
  desktopContent: { padding: 10, paddingBottom: 6, flexGrow: 1 },
  deptRow: { flexDirection: 'row' },
  dept: { flex: 1, borderWidth: 2, borderColor: c.border, backgroundColor: c.panelDark, padding: 9, marginHorizontal: 3, marginBottom: 8 },
  deptTitle: { fontFamily: FONT_PIXEL, color: c.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1, marginBottom: 6 },

  card: { backgroundColor: c.panel, borderWidth: 2, borderColor: c.border, paddingVertical: 14, paddingHorizontal: 10, marginBottom: 9, alignItems: 'center' },
  cardPressed: { borderColor: c.gold, transform: [{ translateY: 1 }] },
  cardIconBig: { fontSize: 50, lineHeight: 58 },
  cardIcon: { fontSize: 38, lineHeight: 44 },
  cardTitle: { fontFamily: FONT_PIXEL, color: c.text, fontSize: 11, fontWeight: '900', letterSpacing: 0.5, marginTop: 7, textAlign: 'center' },
  cardDesc: { color: c.muted, fontSize: 10, lineHeight: 14, textAlign: 'center', marginTop: 4, minHeight: 28 },
  cardStat: { fontFamily: FONT_PIXEL, fontSize: 9, fontWeight: '900', letterSpacing: 0.3, marginTop: 7, textAlign: 'center' },
  cardWarn: { fontFamily: FONT_PIXEL, color: c.danger, fontSize: 7, fontWeight: '900', marginTop: 3 },
  cardBadge: { position: 'absolute', top: 5, right: 5, minWidth: 18, height: 18, paddingHorizontal: 3, backgroundColor: c.danger, borderWidth: 2, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
  cardBadgeText: { fontFamily: FONT_PIXEL, color: c.white, fontSize: 10, fontWeight: '900' },

  cardSmall: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.panel, borderWidth: 2, borderColor: c.border, padding: 11 },
  cardIconSmall: { fontSize: 24, marginRight: 8 },
  cardSmallBody: { flex: 1 },

  officeRow: { flexDirection: 'row', alignItems: 'stretch' },
  officeCol: { flex: 1, borderWidth: 2, borderColor: c.border, backgroundColor: c.panelDark, padding: 8, marginHorizontal: 3 },
  deskClutter: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  deskChip: { borderWidth: 2, borderColor: c.border, backgroundColor: c.panel, paddingHorizontal: 6, paddingVertical: 3, marginRight: 8 },
  deskChipText: { fontFamily: FONT_PIXEL, color: c.textDim, fontSize: 8, fontWeight: '900' },
  deskDecor: { fontSize: 17, marginRight: 9, opacity: 0.85 },

  firmPanel: { flex: 1.15, borderWidth: 2, borderColor: c.border, backgroundColor: c.panelDark, padding: 8, marginHorizontal: 3 },
  firmRow: { flexDirection: 'row', alignItems: 'flex-end', paddingVertical: 4.5 },
  firmLabel: { fontFamily: FONT_PIXEL, color: c.textDim, fontSize: 10, fontWeight: '800' },
  firmDots: { flex: 1, borderBottomWidth: 1, borderBottomColor: c.divider, borderStyle: 'dotted' as any, marginHorizontal: 4, marginBottom: 3 },
  firmValue: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 10, fontWeight: '900', maxWidth: '55%' },

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
