import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';

import STOCKS, { Stock, StockLogo, Sector, SECTORS } from '../../data/stocks';
import { useGame } from '../../state/GameContext';
import { formatMoney, formatPrice } from '../../utils/format';
import { FONT_PIXEL, BORDER_W, Palette } from '../../theme';
import { makeUseStyles, useTheme } from '../../contexts/ThemeContext';

type StringMap = Record<string, string>;
type Filter = 'All' | Sector;

const SECTOR_COUNTS: Record<string, number> = STOCKS.reduce(
  (acc, s) => {
    acc[s.sector] = (acc[s.sector] || 0) + 1;
    return acc;
  },
  {} as Record<string, number>
);

function Logo({ logo }: { logo: StockLogo }) {
  const styles = useStyles();
  return (
    <View style={[styles.logo, { backgroundColor: logo.bgColor }]}>
      <Text style={[styles.logoText, { fontSize: logo.type === 'initials' ? 24 : 30 }]}>{logo.value}</Text>
    </View>
  );
}

export default function PortfolioBuilder({
  clientId,
  analysisOnly = false,
  embedded = false,
}: {
  clientId?: string;
  analysisOnly?: boolean;
  embedded?: boolean; // render bare (no monitor bezel/stand) inside the PC screen
}) {
  const { state, buy, sell, availableBalance, priceOf } = useGame();
  const styles = useStyles();
  const { c } = useTheme();
  const client = clientId ? state.clients[clientId] : undefined;
  // Trading is only allowed from the Client Book (a bound client + not analysis-only).
  const tradable = !analysisOnly && !!client && !!clientId;

  const [filter, setFilter] = useState<Filter>('All');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [inputs, setInputs] = useState<StringMap>({});
  const [errors, setErrors] = useState<StringMap>({});

  const stocks = useMemo(() => (filter === 'All' ? STOCKS : STOCKS.filter((s) => s.sector === filter)), [filter]);
  const safePage = Math.min(page, stocks.length - 1);
  const stock = stocks[safePage];

  const balance = client ? availableBalance(client) : 0;
  const holdings = client?.holdings ?? {};
  const holdingsValue = Object.entries(holdings).reduce((s, [id, h]) => s + h.shares * priceOf(id), 0);
  const hasHoldings = Object.values(holdings).some((h) => h.shares > 0);
  const owned = holdings[stock.id]?.shares || 0;

  const chooseFilter = (f: Filter) => {
    setFilter(f);
    setPage(0);
    setDropdownOpen(false);
  };

  const setInput = (id: string, text: string) => {
    const digits = text.replace(/[^0-9]/g, '');
    setInputs((p) => ({ ...p, [id]: digits }));
    if (errors[id]) setErrors((p) => ({ ...p, [id]: '' }));
  };

  const doBuy = (s: Stock) => {
    if (!clientId) return;
    const shares = parseInt(inputs[s.id] || '', 10);
    if (!shares || shares <= 0) return setErrors((p) => ({ ...p, [s.id]: 'Enter a number of shares' }));
    if (shares * priceOf(s.id) > balance) return setErrors((p) => ({ ...p, [s.id]: 'Insufficient funds' }));
    buy(clientId, s.id, shares);
    setInputs((p) => ({ ...p, [s.id]: '' }));
    setErrors((p) => ({ ...p, [s.id]: '' }));
  };

  const doSell = (s: Stock) => {
    if (!clientId) return;
    const have = holdings[s.id]?.shares || 0;
    if (have <= 0) return setErrors((p) => ({ ...p, [s.id]: "You don't own any shares" }));
    let n = parseInt(inputs[s.id] || '', 10);
    if (!n || n <= 0) n = have;
    sell(clientId, s.id, n);
    setInputs((p) => ({ ...p, [s.id]: '' }));
    setErrors((p) => ({ ...p, [s.id]: '' }));
  };

  const goTo = (i: number) => setPage(Math.max(0, Math.min(stocks.length - 1, i)));
  const ownedStocks = STOCKS.filter((s) => (holdings[s.id]?.shares || 0) > 0);

  return (
    <ScrollView contentContainerStyle={embedded ? styles.embeddedContent : styles.content} keyboardShouldPersistTaps="handled">
      <View style={embedded ? styles.embeddedMonitor : styles.monitor}>
        {!embedded && (
          <View style={styles.headerBar}>
            {tradable ? (
              <>
                <Text style={styles.headerText}>Client: {client!.name} | Week {state.currentWeek}</Text>
                <Text style={styles.headerText}>Available: {formatMoney(Math.round(balance))}</Text>
              </>
            ) : (
              <>
                <Text style={styles.headerText}>Market Analysis</Text>
                <Text style={styles.headerText}>Week {state.currentWeek}</Text>
              </>
            )}
          </View>
        )}

        <View style={styles.monitorScreen}>
          {/* Sector filter dropdown */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Filter by sector:</Text>
            <Pressable style={styles.dropdown} onPress={() => setDropdownOpen((o) => !o)}>
              <Text style={styles.dropdownText}>
                {filter} {filter === 'All' ? `(${STOCKS.length})` : `(${SECTOR_COUNTS[filter]})`} ▾
              </Text>
            </Pressable>
          </View>
          {dropdownOpen && (
            <View style={styles.menu}>
              {(['All', ...SECTORS] as Filter[]).map((f) => (
                <Pressable key={f} style={styles.menuItem} onPress={() => chooseFilter(f)}>
                  <Text style={[styles.menuText, f === filter && styles.menuTextActive]}>
                    {f} ({f === 'All' ? STOCKS.length : SECTOR_COUNTS[f]})
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Ticker ribbon */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.ribbon} contentContainerStyle={styles.ribbonContent}>
            {stocks.map((s, i) => {
              const active = i === safePage;
              const has = (holdings[s.id]?.shares || 0) > 0;
              return (
                <Pressable key={s.id} onPress={() => goTo(i)} style={[styles.tab, { borderColor: s.sectorColor }, active && { backgroundColor: s.sectorColor }]}>
                  <Text style={[styles.tabText, active && { color: '#ffffff' }]}>{s.ticker}</Text>
                  {has && <View style={[styles.tabDot, { backgroundColor: active ? '#ffffff' : s.sectorColor }]} />}
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.ribbonNav}>
            <Pressable onPress={() => goTo(safePage - 1)} disabled={safePage === 0} style={({ pressed }) => [styles.arrow, safePage === 0 && styles.arrowDisabled, pressed && { opacity: 0.6 }]}>
              <Text style={styles.arrowText}>‹</Text>
            </Pressable>
            <Text style={styles.ribbonLabel}>Page {safePage + 1} of {stocks.length}</Text>
            <Pressable onPress={() => goTo(safePage + 1)} disabled={safePage === stocks.length - 1} style={({ pressed }) => [styles.arrow, safePage === stocks.length - 1 && styles.arrowDisabled, pressed && { opacity: 0.6 }]}>
              <Text style={styles.arrowText}>›</Text>
            </Pressable>
          </View>

          {/* Stock card */}
          <View style={styles.card}>
            <View style={[styles.cardTop, { backgroundColor: stock.sectorColor }]}>
              <View>
                <Text style={styles.cardTicker}>{stock.ticker}</Text>
                <Text style={styles.cardSector}>{stock.sector}</Text>
              </View>
              <Text style={styles.cardPrice}>{formatPrice(priceOf(stock.id))}</Text>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.leftCol}>
                <Logo logo={stock.logo} />
                <Text style={styles.companyName}>{stock.name}</Text>
              </View>
              <View style={styles.rightCol}>
                <View style={styles.specsRow}>
                  <View style={styles.specsCol}>
                    <Text style={styles.spec}>Founded: {stock.yearFounded}</Text>
                    <Text style={styles.spec}>Employees: {stock.employees.toLocaleString()}</Text>
                    <Text style={styles.spec}>P/E: {stock.pe == null ? 'N/A' : stock.pe}</Text>
                    <Text style={styles.spec}>Beta: {stock.beta.toFixed(1)}</Text>
                  </View>
                  <View style={styles.specsCol}>
                    <Text style={styles.spec}>Mkt Cap: {stock.marketCap}</Text>
                    <Text style={[styles.spec, { color: stock.dividend > 0 ? c.success : c.muted }]}>Div: {stock.dividend.toFixed(1)}%</Text>
                    <Text style={styles.spec}>52wk: {formatPrice(stock.week52Low)}-{formatPrice(stock.week52High)}</Text>
                    <Text style={styles.spec} numberOfLines={1}>HQ: {stock.headquarters}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.divider} />
            <Text style={styles.background} numberOfLines={5}>{stock.background}</Text>

            {!tradable ? (
              <Text style={styles.analysisNote}>
                Analysis only — manage this stock for a client from the Client Book.
              </Text>
            ) : (
            <View style={styles.buySection}>
              <View style={styles.buyRow}>
                <Text style={styles.buyLabel}>Shares:</Text>
                <TextInput
                  style={styles.input}
                  value={inputs[stock.id] || ''}
                  onChangeText={(t) => setInput(stock.id, t)}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={c.muted}
                  maxLength={6}
                />
                <Pressable onPress={() => doBuy(stock)} style={({ pressed }) => [styles.buyBtn, pressed && { opacity: 0.85 }]}>
                  <Text style={styles.buyBtnText}>BUY</Text>
                </Pressable>
                <Pressable onPress={() => doSell(stock)} disabled={owned <= 0} style={({ pressed }) => [styles.sellBtn, owned <= 0 && { opacity: 0.4 }, pressed && owned > 0 && { opacity: 0.85 }]}>
                  <Text style={styles.sellBtnText}>SELL</Text>
                </Pressable>
                <Text style={styles.priceInline}>@ {formatPrice(priceOf(stock.id))}/sh</Text>
              </View>
              {owned > 0 && (
                <View style={styles.quickRow}>
                  <Text style={styles.quickLabel}>Quick sell:</Text>
                  <Pressable onPress={() => clientId && sell(clientId, stock.id, Math.max(1, Math.floor(owned * 0.25)))} style={({ pressed }) => [styles.quickBtn, pressed && { opacity: 0.85 }]}>
                    <Text style={styles.quickBtnText}>25%</Text>
                  </Pressable>
                  <Pressable onPress={() => clientId && sell(clientId, stock.id, Math.max(1, Math.floor(owned * 0.5)))} style={({ pressed }) => [styles.quickBtn, pressed && { opacity: 0.85 }]}>
                    <Text style={styles.quickBtnText}>50%</Text>
                  </Pressable>
                  <Pressable onPress={() => clientId && sell(clientId, stock.id, owned)} style={({ pressed }) => [styles.quickBtn, pressed && { opacity: 0.85 }]}>
                    <Text style={styles.quickBtnText}>All</Text>
                  </Pressable>
                </View>
              )}
              <Text style={styles.available}>Available balance: {formatMoney(Math.round(balance))}</Text>
              {owned > 0 && <Text style={styles.ownedTag}>Holding {owned} share(s) · avg cost {formatPrice((holdings[stock.id]?.cost || 0) / owned)}</Text>}
              {errors[stock.id] ? <Text style={styles.error}>{errors[stock.id]}</Text> : null}
            </View>
            )}
          </View>
        </View>
      </View>

      {!embedded && <View style={styles.standNeck} />}
      {!embedded && <View style={styles.standBase} />}

      {tradable && hasHoldings && (
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>{client!.name}'s Holdings</Text>
          <View style={styles.summaryHeadRow}>
            <Text style={[styles.colName, styles.colHead]}>Stock</Text>
            <Text style={[styles.colNum, styles.colHead]}>Shares</Text>
            <Text style={[styles.colNum, styles.colHead]}>Value</Text>
            <Text style={[styles.colNum, styles.colHead]}>G/L</Text>
            <Text style={styles.colX} />
          </View>
          {ownedStocks.map((s) => {
            const h = holdings[s.id];
            const cur = priceOf(s.id);
            const mv = h.shares * cur;
            const avg = h.cost / h.shares;
            const glPct = avg > 0 ? (cur - avg) / avg : 0;
            const glPos = glPct >= 0;
            return (
              <View key={s.id} style={styles.summaryRow}>
                <Text style={[styles.colName, styles.cell]} numberOfLines={1}>{s.ticker}</Text>
                <Text style={[styles.colNum, styles.cell]}>{h.shares}</Text>
                <Text style={[styles.colNum, styles.cell]}>{formatMoney(Math.round(mv))}</Text>
                <Text style={[styles.colNum, styles.cell, { color: glPos ? c.success : c.danger }]}>
                  {glPos ? '+' : ''}{(glPct * 100).toFixed(1)}%
                </Text>
                <Pressable onPress={() => clientId && sell(clientId, s.id, h.shares)} hitSlop={8} style={styles.colX}>
                  <Text style={styles.removeX}>✕</Text>
                </Pressable>
              </View>
            );
          })}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Holdings market value</Text>
            <Text style={styles.totalValue}>{formatMoney(Math.round(holdingsValue))}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const useStyles = makeUseStyles((c: Palette) =>
  StyleSheet.create({
  content: { padding: 16, alignItems: 'center' },
  embeddedContent: { padding: 0 },
  embeddedMonitor: { width: '100%', backgroundColor: c.panel },
  monitor: { width: '100%', borderWidth: 6, borderColor: c.border, backgroundColor: c.panel, overflow: 'hidden' },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: c.panelDark, borderBottomWidth: BORDER_W, borderBottomColor: c.border, paddingVertical: 10, paddingHorizontal: 12 },
  headerText: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  monitorScreen: { backgroundColor: c.panel, padding: 12 },

  filterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  filterLabel: { color: c.textDim, fontSize: 12, marginRight: 8 },
  dropdown: { backgroundColor: c.button, borderWidth: 2, borderColor: c.border, paddingVertical: 8, paddingHorizontal: 12 },
  dropdownText: { fontFamily: FONT_PIXEL, color: c.ink, fontSize: 12, fontWeight: '800' },
  menu: { backgroundColor: c.panelDark, borderWidth: 2, borderColor: c.border, marginBottom: 10 },
  menuItem: { paddingVertical: 9, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: c.divider },
  menuText: { color: c.text, fontSize: 13, fontWeight: '600' },
  menuTextActive: { color: c.gold, fontWeight: '900' },

  ribbon: { marginBottom: 10 },
  ribbonContent: { paddingRight: 4 },
  tab: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.panelDark, borderWidth: 2, paddingVertical: 6, paddingHorizontal: 10, marginRight: 6 },
  tabText: { fontFamily: FONT_PIXEL, color: c.text, fontSize: 12, fontWeight: '800' },
  tabDot: { width: 6, height: 6, marginLeft: 6 },

  ribbonNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  arrow: { width: 40, height: 36, backgroundColor: c.button, borderWidth: 2, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
  arrowDisabled: { opacity: 0.4 },
  arrowText: { color: c.ink, fontSize: 24, lineHeight: 26, fontWeight: '800' },
  ribbonLabel: { fontFamily: FONT_PIXEL, color: c.text, fontSize: 12, fontWeight: '800' },

  card: { backgroundColor: c.panelLite, borderWidth: BORDER_W, borderColor: c.border, overflow: 'hidden' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderBottomWidth: 2, borderBottomColor: c.border },
  cardTicker: { fontFamily: FONT_PIXEL, color: '#ffffff', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  cardSector: { color: '#ffffff', fontSize: 11, fontWeight: '600', opacity: 0.95, marginTop: 1 },
  cardPrice: { fontFamily: FONT_PIXEL, color: '#ffffff', fontSize: 18, fontWeight: '900' },
  cardChange: { color: '#ffffff', fontSize: 10, fontWeight: '800', opacity: 0.95, marginTop: 1 },
  cardBody: { flexDirection: 'row', padding: 12 },
  leftCol: { width: 90, alignItems: 'center' },
  companyName: { color: c.text, fontSize: 12, fontWeight: '800', textAlign: 'center', marginTop: 8 },
  logo: { width: 70, height: 70, borderWidth: 2, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#ffffff', fontWeight: '900' },
  rightCol: { flex: 1, paddingLeft: 8 },
  specsRow: { flexDirection: 'row' },
  specsCol: { flex: 1 },
  spec: { color: c.textDim, fontSize: 12, marginBottom: 3 },
  divider: { height: 2, backgroundColor: c.divider, marginHorizontal: 12 },
  background: { color: c.textDim, fontSize: 13, fontStyle: 'italic', lineHeight: 18, padding: 12, paddingTop: 8 },
  analysisNote: { color: c.gold, fontSize: 12, fontWeight: '700', fontStyle: 'italic', backgroundColor: c.panelDark, borderTopWidth: 2, borderTopColor: c.border, padding: 12 },

  buySection: { backgroundColor: c.panelDark, borderTopWidth: 2, borderTopColor: c.border, padding: 12 },
  buyRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  buyLabel: { fontFamily: FONT_PIXEL, color: c.text, fontSize: 12, marginRight: 8 },
  input: { width: 56, borderWidth: 2, borderColor: c.border, paddingVertical: 8, paddingHorizontal: 8, fontSize: 16, color: c.text, backgroundColor: c.panel, marginRight: 8, textAlign: 'center' },
  buyBtn: { backgroundColor: c.button, borderWidth: 2, borderColor: c.border, paddingVertical: 9, paddingHorizontal: 16, marginRight: 8 },
  buyBtnText: { fontFamily: FONT_PIXEL, color: c.ink, fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  sellBtn: { backgroundColor: c.panelLite, borderWidth: 2, borderColor: c.danger, paddingVertical: 8, paddingHorizontal: 12, marginRight: 8 },
  sellBtnText: { fontFamily: FONT_PIXEL, color: c.danger, fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  priceInline: { color: c.textDim, fontSize: 12, fontWeight: '700' },
  quickRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  quickLabel: { color: c.textDim, fontSize: 12, fontWeight: '700', marginRight: 8 },
  quickBtn: { borderWidth: 2, borderColor: c.danger, paddingVertical: 5, paddingHorizontal: 10, marginRight: 6 },
  quickBtnText: { fontFamily: FONT_PIXEL, color: c.danger, fontSize: 12, fontWeight: '800' },
  available: { color: c.textDim, fontSize: 12, fontWeight: '700', marginTop: 8 },
  ownedTag: { color: c.success, fontSize: 13, fontWeight: '700', marginTop: 6 },
  error: { color: c.danger, fontSize: 13, fontWeight: '700', marginTop: 6 },

  standNeck: { width: '30%', height: 18, backgroundColor: c.border },
  standBase: { width: '45%', height: 10, backgroundColor: c.border, marginBottom: 16 },

  summary: { width: '100%', backgroundColor: c.panel, borderWidth: BORDER_W, borderColor: c.border, padding: 12 },
  summaryTitle: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 14, fontWeight: '800', marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' },
  summaryHeadRow: { flexDirection: 'row', alignItems: 'center', paddingBottom: 6, borderBottomWidth: 2, borderBottomColor: c.border },
  colHead: { fontFamily: FONT_PIXEL, color: c.textDim, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  summaryRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: c.divider },
  cell: { fontFamily: FONT_PIXEL, color: c.text, fontSize: 13 },
  colName: { flex: 1.4 },
  colNum: { flex: 1, textAlign: 'right' },
  colX: { width: 34, alignItems: 'flex-end' },
  removeX: { color: c.danger, fontSize: 16, fontWeight: '800' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTopWidth: 2, borderTopColor: c.border },
  totalLabel: { fontFamily: FONT_PIXEL, color: c.text, fontSize: 13, fontWeight: '800' },
  totalValue: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 15, fontWeight: '800' },
  })
);
