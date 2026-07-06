import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
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

        {/* ── DESKTOP ─────────────────────────────────────────────────── */}
        <View style={styles.desktop}>
          <View style={styles.iconGrid}>
            <DesktopIcon label="CLIENT BOOK" icon="📖" onPress={() => toggleBook(true)} />
            <DesktopIcon label="TELEPHONE" icon="☎" onPress={() => togglePhone(true)} badge={state.unreadMessageCount} />
            <DesktopIcon label="MARKET NEWS" icon="📰" onPress={() => toggleNews(true)} />
            <DesktopIcon label="STOCK TERMINAL" icon="📈" onPress={() => toggleTerminal(true)} />
            <DesktopIcon label="SHOP" icon="🛒" onPress={() => toggleShop(true)} />
          </View>

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
        </View>

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

function DesktopIcon({ label, icon, onPress, badge }: { label: string; icon: string; onPress: () => void; badge?: number }) {
  const styles = useStyles();
  return (
    <Pressable style={({ pressed }) => [styles.icon, pressed && styles.iconPressed]} onPress={onPress}>
      <View style={styles.iconGlyphBox}>
        <Text style={styles.iconGlyph}>{icon}</Text>
      </View>
      <Text style={styles.iconLabel} numberOfLines={1}>{label}</Text>
      {badge ? (
        <View style={styles.iconBadge} pointerEvents="none">
          <Text style={styles.iconBadgeText}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
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

  // Desktop surface
  desktop: { flex: 1, paddingHorizontal: 14, paddingTop: 16 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', alignContent: 'flex-start', flex: 1 },
  icon: { width: '33.33%', alignItems: 'center', paddingVertical: 14 },
  iconPressed: { opacity: 0.7, transform: [{ translateY: 1 }] },
  iconGlyphBox: { width: 54, height: 54, borderWidth: 2, borderColor: c.border, backgroundColor: c.panel, alignItems: 'center', justifyContent: 'center' },
  iconGlyph: { fontSize: 26 },
  iconLabel: { fontFamily: FONT_PIXEL, color: c.text, fontSize: 8, fontWeight: '800', letterSpacing: 0.5, marginTop: 6, textAlign: 'center' },
  iconBadge: { position: 'absolute', top: 8, right: '22%', minWidth: 18, height: 18, paddingHorizontal: 3, backgroundColor: c.danger, borderWidth: 2, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
  iconBadgeText: { fontFamily: FONT_PIXEL, color: c.white, fontSize: 10, fontWeight: '900' },

  // Office shelf (milestones + trophies)
  shelf: { marginBottom: 10 },
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
