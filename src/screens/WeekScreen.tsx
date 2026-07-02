import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import WeekIntro from './day/WeekIntro';
import ClientIntro from './day/ClientIntro';
import PortfolioBuilder from './day/PortfolioBuilder';
import WeekTransition from './day/WeekTransition';
import WeekSummaryScreen from './WeekSummaryScreen';
import GameOverScreen from './GameOverScreen';
import NewsPopup from './NewsPopup';
import ClientBook from './ClientBook';
import PhoneNotifications from './PhoneNotifications';
import SettingsMenu from './SettingsMenu';
import ShopScreen from './ShopScreen';
import ReputationBar from '../components/ReputationBar';
import { useGame } from '../state/GameContext';
import { REGIME_LABEL } from '../data/economicCycles';
import { formatMoney } from '../utils/format';
import { FONT_PIXEL, BORDER_W, Palette } from '../theme';
import { makeUseStyles, useTheme } from '../contexts/ThemeContext';

// Pixel-scene literal colors (a wooden desk + monitor bezel + a little plant).
const BEZEL = '#3a3a3a';
const WOOD = '#8a5a2b';
const WOOD_TOP = '#a06b33';
const WOOD_DARK = '#6b4420';
const POT = '#b5651d';
const LEAF = '#3f8f4f';
const LEAF_D = '#2f6f3c';

export default function WeekScreen() {
  const { state, activeClients, availableClients, canSign, maxClients, advisorBalance, setPhase, transitionWeek, advanceWeek, toggleBook, toggleNews, togglePhone, toggleShop } = useGame();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { c } = useTheme();
  const [alertSeen, setAlertSeen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pcView, setPcView] = useState<'desktop' | 'terminal'>('desktop');

  // The title screen starts/continues the game. If we somehow land here without
  // a game in progress, go back to the title rather than auto-starting a
  // nameless one.
  useEffect(() => {
    if (!state.started) router.replace('/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.started]);

  // Reset the alert and return the PC to its desktop each new week.
  useEffect(() => {
    setAlertSeen(false);
    setPcView('desktop');
  }, [state.currentWeek]);

  if (!state.started) return <View style={styles.screen} />;

  const showAlert = !alertSeen && availableClients.length > 0 && canSign && state.phase === 'builder';

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
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <View style={styles.hudLeft}>
            <Text style={styles.weekText}>WEEK {state.currentWeek}</Text>
            <View style={styles.clientChip}>
              <Text style={styles.clientChipText}>♟ {activeClients.length}/{maxClients}</Text>
            </View>
            <View style={styles.regimeChip}>
              <Text style={styles.regimeChipText}>{REGIME_LABEL[state.regime]}</Text>
            </View>
          </View>
          <View style={styles.hudRight}>
            <ReputationBar reputation={state.reputation} />
            <Pressable onPress={() => setSettingsOpen(true)} style={styles.gearBtn} hitSlop={8}>
              <Text style={styles.gearText}>⚙</Text>
            </Pressable>
          </View>
        </View>

        {showAlert && (
          <Pressable style={styles.alert} onPress={() => { setAlertSeen(true); toggleBook(true); }}>
            <Text style={styles.alertText}>
              📋 {availableClients.length} Available Client{availableClients.length > 1 ? 's' : ''} — tap to view
            </Text>
            <View style={styles.alertDot} />
          </Pressable>
        )}

        {activeClients.length === 0 && (
          <Pressable style={styles.manageHint} onPress={() => toggleBook(true)}>
            <Text style={styles.manageHintText}>
              {availableClients.length > 0
                ? 'Open the Client Book to sign your first client.'
                : 'No active clients — open the Client Book to manage portfolios.'}
            </Text>
          </Pressable>
        )}

        {/* Desk + pixel PC scene */}
        <View style={styles.scene}>
          <View style={styles.roomRow}>
            {/* The PC monitor */}
            <View style={styles.pc}>
              <View style={styles.pcTitleBar}>
                {pcView === 'terminal' ? (
                  <Pressable onPress={() => setPcView('desktop')} hitSlop={8}>
                    <Text style={styles.pcBack}>◀ DESKTOP</Text>
                  </Pressable>
                ) : (
                  <Text style={styles.pcTitle} numberOfLines={1}>
                    {state.firmName ? `${state.firmName.toUpperCase()} OS` : 'ADVISOR OS'}
                  </Text>
                )}
                <View style={styles.pcDots}>
                  <View style={[styles.pcDot, { backgroundColor: c.success }]} />
                  <View style={[styles.pcDot, { backgroundColor: c.warning }]} />
                  <View style={[styles.pcDot, { backgroundColor: c.danger }]} />
                </View>
              </View>

              <View style={styles.pcScreen}>
                {pcView === 'desktop' ? (
                  <View style={styles.desktop}>
                    <DesktopIcon label="CLIENT BOOK" icon="📖" onPress={() => toggleBook(true)} />
                    <DesktopIcon label="TELEPHONE" icon="☎" onPress={() => togglePhone(true)} badge={state.unreadMessageCount} />
                    <DesktopIcon label="NEWS" icon="📰" onPress={() => toggleNews(true)} />
                    <DesktopIcon label="STOCK TERMINAL" icon="📈" onPress={() => setPcView('terminal')} />
                    <DesktopIcon label="SHOP" icon="🛒" onPress={() => toggleShop(true)} />
                  </View>
                ) : (
                  <PortfolioBuilder analysisOnly embedded />
                )}
              </View>
            </View>

            {/* Little pixel plant beside the monitor (never over the screen) */}
            <View style={styles.plantCol}>
              <View style={styles.plant}>
                <View style={styles.leafTop} />
                <View style={styles.leafRow}>
                  <View style={styles.leafSide} />
                  <View style={styles.leafMid} />
                  <View style={styles.leafSide} />
                </View>
                <View style={styles.stem} />
                <View style={styles.pot} />
              </View>
            </View>
          </View>

          {/* Wooden desk the PC sits on */}
          <View style={styles.desk}>
            <View style={styles.deskEdge} />
          </View>
        </View>

        {/* Advance control + advisor funds — on the desk, outside the PC */}
        <View style={[styles.nextBar, { paddingBottom: insets.bottom + 10 }]}>
          <View style={styles.deskFunds}>
            <Text style={styles.deskFundsLabel}>FUNDS</Text>
            <Text style={styles.deskFundsVal} numberOfLines={1}>{formatMoney(Math.round(advisorBalance))}</Text>
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
  screen: { flex: 1, backgroundColor: c.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10, backgroundColor: c.panelDark, borderBottomWidth: BORDER_W, borderBottomColor: c.border },
  hudLeft: { flexDirection: 'row', alignItems: 'center' },
  hudRight: { flexDirection: 'row', alignItems: 'center' },
  weekText: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  clientChip: { backgroundColor: c.panel, borderWidth: 2, borderColor: c.border, paddingHorizontal: 8, paddingVertical: 4, marginLeft: 8 },
  clientChipText: { fontFamily: FONT_PIXEL, color: c.text, fontSize: 11, fontWeight: '800' },
  regimeChip: { backgroundColor: c.panel, borderWidth: 2, borderColor: c.gold, paddingHorizontal: 8, paddingVertical: 4, marginLeft: 8 },
  regimeChipText: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 10, fontWeight: '900' },
  gearBtn: { width: 28, height: 28, marginLeft: 8, borderWidth: 2, borderColor: c.border, backgroundColor: c.panel, alignItems: 'center', justifyContent: 'center' },
  gearText: { fontSize: 16, color: c.text },
  alert: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: c.panel, borderBottomWidth: 2, borderBottomColor: c.gold, paddingVertical: 10 },
  alertText: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  alertDot: { width: 8, height: 8, backgroundColor: c.danger, marginLeft: 8 },
  manageHint: { backgroundColor: c.panel, borderBottomWidth: 2, borderBottomColor: c.gold, paddingVertical: 9, paddingHorizontal: 16 },
  manageHintText: { color: c.gold, fontSize: 12, fontWeight: '700', textAlign: 'center' },

  // Desk + PC scene
  scene: { flex: 1, backgroundColor: c.bg, paddingHorizontal: 12, paddingTop: 12 },
  roomRow: { flex: 1, flexDirection: 'row' },
  pc: { flex: 1, borderWidth: 10, borderColor: BEZEL, backgroundColor: BEZEL },
  pcTitleBar: { height: 24, backgroundColor: '#2b2b2b', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 },
  pcTitle: { fontFamily: FONT_PIXEL, color: '#dddddd', fontSize: 11, fontWeight: '800', letterSpacing: 1, flex: 1, marginRight: 8 },
  pcBack: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  pcDots: { flexDirection: 'row' },
  pcDot: { width: 8, height: 8, marginLeft: 5 },
  pcScreen: { flex: 1, backgroundColor: c.panelDark },
  desktop: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', padding: 10, alignContent: 'flex-start' },
  icon: { width: '50%', alignItems: 'center', paddingVertical: 14 },
  iconPressed: { opacity: 0.7 },
  iconGlyphBox: { width: 52, height: 52, borderWidth: 2, borderColor: c.border, backgroundColor: c.panel, alignItems: 'center', justifyContent: 'center' },
  iconGlyph: { fontSize: 26 },
  iconLabel: { fontFamily: FONT_PIXEL, color: c.text, fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginTop: 6, textAlign: 'center' },
  iconBadge: { position: 'absolute', top: 10, right: '24%', minWidth: 18, height: 18, paddingHorizontal: 3, backgroundColor: c.danger, borderWidth: 2, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
  iconBadgeText: { fontFamily: FONT_PIXEL, color: c.white, fontSize: 10, fontWeight: '900' },

  // Plant beside the monitor
  plantCol: { width: 44, justifyContent: 'flex-end', alignItems: 'center', paddingLeft: 8, paddingBottom: 0 },
  plant: { alignItems: 'center', marginBottom: 2 },
  leafTop: { width: 10, height: 10, backgroundColor: LEAF },
  leafRow: { flexDirection: 'row' },
  leafSide: { width: 8, height: 12, backgroundColor: LEAF_D },
  leafMid: { width: 12, height: 16, backgroundColor: LEAF },
  stem: { width: 4, height: 10, backgroundColor: LEAF_D },
  pot: { width: 26, height: 18, backgroundColor: POT, borderWidth: 2, borderColor: WOOD_DARK },

  // Wooden desk + advance control
  desk: { height: 26, backgroundColor: WOOD, borderTopWidth: 4, borderTopColor: WOOD_TOP },
  deskEdge: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 6, backgroundColor: WOOD_DARK },
  nextBar: { flexDirection: 'row', backgroundColor: WOOD, paddingTop: 10, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  deskFunds: { backgroundColor: WOOD_DARK, borderWidth: 2, borderColor: '#3a2a14', paddingVertical: 6, paddingHorizontal: 10, marginRight: 10, alignItems: 'center', maxWidth: 130 },
  deskFundsLabel: { fontFamily: FONT_PIXEL, color: '#e8d5b5', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  deskFundsVal: { fontFamily: FONT_PIXEL, color: '#FFD36B', fontSize: 13, fontWeight: '900' },
  nextBtn: { flex: 1, maxWidth: 460, backgroundColor: c.button, borderWidth: BORDER_W, borderColor: c.border, paddingVertical: 14, alignItems: 'center' },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnPressed: { transform: [{ translateY: 1 }] },
  nextText: { fontFamily: FONT_PIXEL, color: c.ink, fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  })
);
