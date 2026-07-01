import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

import { SHOP_ITEMS, ASSISTANT_WEEKLY_CUT } from '../data/advisorEconomy';
import { useGame } from '../state/GameContext';
import { useTheme, Palette } from '../contexts/ThemeContext';
import { MONO } from '../styles/typography';
import { BORDER } from '../styles/spacing';
import { formatMoney } from '../utils/format';

type Tab = 'upgrades' | 'finances';

export default function ShopScreen() {
  const { state, toggleShop, buyUpgrade } = useGame();
  const { c } = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const [tab, setTab] = useState<Tab>('upgrades');

  // Average weekly client return across every recorded week.
  const allReturns = Object.values(state.clients).flatMap((cl) => cl.performanceHistory.map((h) => h.returnPct));
  const avgWeekly = allReturns.length > 0 ? allReturns.reduce((s, r) => s + r, 0) / allReturns.length : 0;
  const avgPos = avgWeekly >= 0;

  // Newest transactions first; keep the list manageable.
  const txs = [...state.advisorTransactions].reverse().slice(0, 40);

  if (!state.shopOpen) return null;

  return (
    <View style={styles.backdrop}>
      <View style={styles.panel}>
        <View style={styles.header}>
          <Text style={styles.title}>SHOP</Text>
          <View style={styles.balanceBox}>
            <Text style={styles.balanceLabel}>BALANCE</Text>
            <Text style={styles.balanceValue}>{formatMoney(Math.round(state.advisorBalance))}</Text>
          </View>
          <Pressable onPress={() => toggleShop(false)} hitSlop={10}>
            <Text style={styles.close}>X</Text>
          </Pressable>
        </View>

        <View style={styles.tabs}>
          {(['upgrades', 'finances'] as Tab[]).map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>

        {tab === 'upgrades' ? (
          <ScrollView contentContainerStyle={styles.list}>
            {SHOP_ITEMS.map((item) => {
              const owned = state.upgrades[item.id];
              const affordable = state.advisorBalance >= item.cost;
              return (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardIcon}>{item.icon}</Text>
                    <View style={styles.cardHead}>
                      <Text style={styles.cardName}>{item.name}</Text>
                      <Text style={styles.cardBlurb}>{item.blurb}</Text>
                    </View>
                    <Text style={styles.cardCost}>{formatMoney(item.cost)}</Text>
                  </View>
                  <Text style={styles.cardDetail}>{item.detail}</Text>
                  {item.id === 'assistant' && (
                    <Text style={styles.cardFine}>Ongoing: {(ASSISTANT_WEEKLY_CUT * 100).toFixed(0)}% of positive client gains per week.</Text>
                  )}
                  <Pressable
                    onPress={() => buyUpgrade(item.id)}
                    disabled={owned || !affordable}
                    style={({ pressed }) => [
                      styles.buyBtn,
                      owned && styles.ownedBtn,
                      !owned && !affordable && styles.disabledBtn,
                      pressed && !owned && affordable && styles.buyPressed,
                    ]}
                  >
                    <Text style={[styles.buyText, owned && styles.ownedText]}>
                      {owned ? '✓ OWNED' : affordable ? 'BUY' : 'INSUFFICIENT FUNDS'}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            <View style={styles.card}>
              <Text style={styles.finLabel}>AVG WEEKLY CLIENT RETURN</Text>
              <Text style={[styles.finBig, { color: avgPos ? c.success : c.danger }]}>
                {avgPos ? '+' : ''}{(avgWeekly * 100).toFixed(2)}%
              </Text>
              <Text style={styles.cardFine}>Across {allReturns.length} client-week{allReturns.length === 1 ? '' : 's'} of performance.</Text>
            </View>

            <Text style={styles.sectionLabel}>TRANSACTION HISTORY</Text>
            {txs.length === 0 ? (
              <Text style={styles.empty}>No transactions yet — sign a client to earn your first fee.</Text>
            ) : (
              txs.map((tx, i) => (
                <View key={i} style={styles.txRow}>
                  <Text style={styles.txWeek}>W{tx.week}</Text>
                  <Text style={styles.txLabel} numberOfLines={1}>{tx.label}</Text>
                  <Text style={[styles.txAmount, { color: tx.amount >= 0 ? c.success : c.danger }]}>
                    {tx.amount >= 0 ? '+' : '-'}{formatMoney(Math.abs(Math.round(tx.amount)))}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    panel: { height: '90%', backgroundColor: c.bg, borderTopWidth: BORDER * 2, borderColor: c.border, overflow: 'hidden' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: BORDER, borderBottomColor: c.border, backgroundColor: c.panelDark },
    title: { fontFamily: MONO, color: c.gold, fontSize: 16, fontWeight: '900', letterSpacing: 1 },
    balanceBox: { alignItems: 'center' },
    balanceLabel: { fontFamily: MONO, color: c.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
    balanceValue: { fontFamily: MONO, color: c.gold, fontSize: 16, fontWeight: '900' },
    close: { fontFamily: MONO, color: c.gold, fontSize: 16, fontWeight: '800' },

    tabs: { flexDirection: 'row', backgroundColor: c.panelDark, borderBottomWidth: BORDER, borderBottomColor: c.border },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
    tabActive: { borderBottomColor: c.gold },
    tabText: { fontFamily: MONO, color: c.muted, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
    tabTextActive: { color: c.gold },

    list: { padding: 12 },
    card: { backgroundColor: c.panel, borderWidth: BORDER, borderColor: c.border, padding: 12, marginBottom: 12 },
    cardTop: { flexDirection: 'row', alignItems: 'center' },
    cardIcon: { fontSize: 24, marginRight: 10 },
    cardHead: { flex: 1 },
    cardName: { fontFamily: MONO, color: c.text, fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },
    cardBlurb: { fontFamily: MONO, color: c.textDim, fontSize: 11, marginTop: 2 },
    cardCost: { fontFamily: MONO, color: c.gold, fontSize: 15, fontWeight: '900', marginLeft: 8 },
    cardDetail: { color: c.textDim, fontSize: 12, lineHeight: 18, marginTop: 10 },
    cardFine: { color: c.muted, fontSize: 11, fontStyle: 'italic', marginTop: 6 },
    buyBtn: { backgroundColor: c.button, borderWidth: BORDER, borderColor: c.border, paddingVertical: 10, alignItems: 'center', marginTop: 10 },
    buyPressed: { transform: [{ translateY: 1 }] },
    ownedBtn: { backgroundColor: c.panelDark },
    disabledBtn: { opacity: 0.45 },
    buyText: { fontFamily: MONO, color: c.ink, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
    ownedText: { color: c.success },

    finLabel: { fontFamily: MONO, color: c.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
    finBig: { fontFamily: MONO, fontSize: 26, fontWeight: '900', marginTop: 4 },
    sectionLabel: { fontFamily: MONO, color: c.gold, fontSize: 12, fontWeight: '900', letterSpacing: 1, marginTop: 4, marginBottom: 8 },
    empty: { color: c.muted, fontSize: 13, fontStyle: 'italic' },
    txRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.panel, borderWidth: 1, borderColor: c.divider, paddingVertical: 8, paddingHorizontal: 10, marginBottom: 6 },
    txWeek: { fontFamily: MONO, color: c.muted, fontSize: 11, fontWeight: '800', width: 40 },
    txLabel: { fontFamily: MONO, color: c.text, fontSize: 12, flex: 1, marginRight: 8 },
    txAmount: { fontFamily: MONO, fontSize: 12, fontWeight: '900' },
  });
