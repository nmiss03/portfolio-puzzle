import React, { useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';

import STOCKS, { Stock, StockLogo, Volatility } from '../../data/stocks';
import { useGame } from '../../state/GameContext';
import { formatMoney, formatPrice } from '../../utils/format';

type StringMap = Record<string, string>;

const VOL_COLOR: Record<Volatility, string> = {
  'Very Low': '#14b8a6',
  Low: '#22c55e',
  Medium: '#f59e0b',
  High: '#f97316',
  'Very High': '#ef4444',
};
const volColor = (v: Volatility) => VOL_COLOR[v];

function Logo({ logo }: { logo: StockLogo }) {
  return (
    <View style={[styles.logo, { backgroundColor: logo.bgColor }]}>
      <Text style={[styles.logoText, { fontSize: logo.type === 'initials' ? 20 : 28 }]}>{logo.value}</Text>
    </View>
  );
}

/** Buy/sell research interface for a single client's portfolio. */
export default function PortfolioBuilder({ clientId }: { clientId: string }) {
  const { state, buy, sell, availableBalance } = useGame();
  const client = state.clients[clientId];
  const stocks = STOCKS;

  const [page, setPage] = useState(0);
  const [inputs, setInputs] = useState<StringMap>({});
  const [errors, setErrors] = useState<StringMap>({});
  const tickerRef = useRef<ScrollView>(null);

  const balance = availableBalance(client);
  const invested = client.initialCapital - balance;
  const holdings = client.holdings;
  const hasHoldings = Object.values(holdings).some((n) => n > 0);

  const stock = stocks[page];
  const owned = holdings[stock.id] || 0;

  const setInput = (id: string, text: string) => {
    const digits = text.replace(/[^0-9]/g, '');
    setInputs((p) => ({ ...p, [id]: digits }));
    if (errors[id]) setErrors((p) => ({ ...p, [id]: '' }));
  };

  const doBuy = (s: Stock) => {
    const shares = parseInt(inputs[s.id] || '', 10);
    if (!shares || shares <= 0) return setErrors((p) => ({ ...p, [s.id]: 'Enter a number of shares' }));
    if (shares * s.price > balance) return setErrors((p) => ({ ...p, [s.id]: 'Insufficient funds' }));
    buy(clientId, s.id, shares);
    setInputs((p) => ({ ...p, [s.id]: '' }));
    setErrors((p) => ({ ...p, [s.id]: '' }));
  };

  const doSell = (s: Stock) => {
    const have = holdings[s.id] || 0;
    if (have <= 0) return setErrors((p) => ({ ...p, [s.id]: "You don't own any shares" }));
    let n = parseInt(inputs[s.id] || '', 10);
    if (!n || n <= 0) n = have;
    sell(clientId, s.id, n);
    setInputs((p) => ({ ...p, [s.id]: '' }));
    setErrors((p) => ({ ...p, [s.id]: '' }));
  };

  const goTo = (i: number) => setPage(Math.max(0, Math.min(stocks.length - 1, i)));
  const ownedStocks = stocks.filter((s) => (holdings[s.id] || 0) > 0);

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.monitor}>
        <View style={styles.headerBar}>
          <Text style={styles.headerText}>Client: {client.name} | Week {state.currentWeek}</Text>
          <Text style={styles.headerText}>Available: {formatMoney(Math.round(balance))}</Text>
        </View>

        <View style={styles.monitorScreen}>
          {/* Ticker ribbon */}
          <ScrollView ref={tickerRef} horizontal showsHorizontalScrollIndicator={false} style={styles.ribbon} contentContainerStyle={styles.ribbonContent}>
            {stocks.map((s, i) => {
              const active = i === page;
              const has = (holdings[s.id] || 0) > 0;
              return (
                <Pressable key={s.id} onPress={() => goTo(i)} style={[styles.tab, { borderColor: s.sectorColor }, active && { backgroundColor: s.sectorColor }]}>
                  <Text style={[styles.tabText, active && { color: '#ffffff' }]}>{s.ticker}</Text>
                  {has && <View style={[styles.tabDot, { backgroundColor: active ? '#ffffff' : s.sectorColor }]} />}
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.ribbonNav}>
            <Pressable onPress={() => goTo(page - 1)} disabled={page === 0} style={({ pressed }) => [styles.arrow, page === 0 && styles.arrowDisabled, pressed && { opacity: 0.6 }]}>
              <Text style={styles.arrowText}>‹</Text>
            </Pressable>
            <Text style={styles.ribbonLabel}>{page + 1} / {stocks.length}</Text>
            <Pressable onPress={() => goTo(page + 1)} disabled={page === stocks.length - 1} style={({ pressed }) => [styles.arrow, page === stocks.length - 1 && styles.arrowDisabled, pressed && { opacity: 0.6 }]}>
              <Text style={styles.arrowText}>›</Text>
            </Pressable>
          </View>

          {/* Colorful stock card with full detail */}
          <View style={styles.card}>
            <View style={[styles.cardTop, { backgroundColor: stock.sectorColor }]}>
              <View>
                <Text style={styles.cardTicker}>{stock.ticker}</Text>
                <Text style={styles.cardSector}>{stock.sector}</Text>
              </View>
              <Text style={styles.cardPrice}>{formatPrice(stock.price)}</Text>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardName}>{stock.name}</Text>
              <View style={styles.cardCols}>
                <Logo logo={stock.logo} />
                <View style={styles.cardInfo}>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaGray}>P/E {stock.pe == null ? 'N/A' : stock.pe}</Text>
                    <Text style={[styles.metaGray, { color: stock.dividend > 0 ? '#22c55e' : '#888888' }]}>
                      Div {stock.dividend.toFixed(1)}%
                    </Text>
                  </View>
                  <Text style={styles.metaGray}>
                    52-wk {formatPrice(stock.week52Low)} – {formatPrice(stock.week52High)}
                  </Text>
                  <Text style={styles.metaGray}>Market cap {stock.marketCap}</Text>
                  <Text style={styles.cardDesc} numberOfLines={3}>{stock.description}</Text>
                  <Text style={[styles.vol, { color: volColor(stock.volatility) }]}>
                    Volatility: {stock.volatility}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.buySection}>
              <View style={styles.buyRow}>
                <Text style={styles.buyLabel}>Shares to buy:</Text>
                <TextInput
                  style={styles.input}
                  value={inputs[stock.id] || ''}
                  onChangeText={(t) => setInput(stock.id, t)}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor="#999999"
                  maxLength={6}
                />
                <Pressable onPress={() => doBuy(stock)} style={({ pressed }) => [styles.buyBtn, pressed && { opacity: 0.85 }]}>
                  <Text style={styles.buyBtnText}>BUY</Text>
                </Pressable>
                <Pressable onPress={() => doSell(stock)} disabled={owned <= 0} style={({ pressed }) => [styles.sellBtn, owned <= 0 && { opacity: 0.4 }, pressed && owned > 0 && { opacity: 0.85 }]}>
                  <Text style={styles.sellBtnText}>SELL</Text>
                </Pressable>
              </View>
              <Text style={styles.priceInline}>@ {formatPrice(stock.price)}/share</Text>
              {owned > 0 && <Text style={styles.ownedTag}>Holding {owned} share(s)</Text>}
              {errors[stock.id] ? <Text style={styles.error}>{errors[stock.id]}</Text> : null}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.standNeck} />
      <View style={styles.standBase} />

      {hasHoldings && (
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>{client.name}'s Holdings</Text>
          <View style={styles.summaryHeadRow}>
            <Text style={[styles.colName, styles.colHead]}>Stock</Text>
            <Text style={[styles.colNum, styles.colHead]}>Shares</Text>
            <Text style={[styles.colNum, styles.colHead]}>Cost</Text>
            <Text style={styles.colX} />
          </View>
          {ownedStocks.map((s) => {
            const shares = holdings[s.id] || 0;
            return (
              <View key={s.id} style={styles.summaryRow}>
                <Text style={[styles.colName, styles.cell]} numberOfLines={1}>{s.ticker}</Text>
                <Text style={[styles.colNum, styles.cell]}>{shares}</Text>
                <Text style={[styles.colNum, styles.cell]}>{formatMoney(Math.round(shares * s.price))}</Text>
                <Pressable onPress={() => sell(clientId, s.id, shares)} hitSlop={8} style={styles.colX}>
                  <Text style={styles.removeX}>✕</Text>
                </Pressable>
              </View>
            );
          })}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Portfolio cost basis</Text>
            <Text style={styles.totalValue}>{formatMoney(Math.round(invested))}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const DARK = '#2a2a2a';
const BLUE = '#4a90e2';
const BORDER = '#cccccc';
const TEXT = '#1a1a1a';
const RED = '#ef4444';

const styles = StyleSheet.create({
  content: { padding: 16, alignItems: 'center' },
  monitor: { width: '100%', borderWidth: 8, borderColor: DARK, borderRadius: 10, backgroundColor: '#f5f5f5', overflow: 'hidden' },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: BLUE, paddingVertical: 10, paddingHorizontal: 12 },
  headerText: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
  monitorScreen: { backgroundColor: '#f5f5f5', padding: 12 },

  ribbon: { marginBottom: 10 },
  ribbonContent: { paddingRight: 4 },
  tab: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1.5, borderRadius: 4, paddingVertical: 6, paddingHorizontal: 10, marginRight: 6 },
  tabText: { color: TEXT, fontSize: 13, fontWeight: '800' },
  tabDot: { width: 6, height: 6, borderRadius: 3, marginLeft: 6 },

  ribbonNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  arrow: { width: 40, height: 36, borderRadius: 4, backgroundColor: '#ffffff', borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center' },
  arrowDisabled: { opacity: 0.4 },
  arrowText: { color: TEXT, fontSize: 24, lineHeight: 26, fontWeight: '800' },
  ribbonLabel: { color: TEXT, fontSize: 14, fontWeight: '800' },

  card: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: BORDER, borderRadius: 6, overflow: 'hidden' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12 },
  cardTicker: { color: '#ffffff', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  cardSector: { color: '#ffffff', fontSize: 12, fontWeight: '600', opacity: 0.9, marginTop: 1 },
  cardPrice: { color: '#ffffff', fontSize: 18, fontWeight: '900' },
  cardBody: { padding: 12 },
  cardName: { color: TEXT, fontSize: 15, fontWeight: '800', marginBottom: 8 },
  cardCols: { flexDirection: 'row' },
  logo: { width: 60, height: 60, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#ffffff', fontWeight: '900' },
  cardInfo: { flex: 1, marginLeft: 12 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metaGray: { color: '#888888', fontSize: 12, marginTop: 2 },
  cardDesc: { color: '#666666', fontSize: 13, fontStyle: 'italic', lineHeight: 17, marginTop: 6 },
  vol: { fontSize: 12, fontWeight: '800', marginTop: 6 },

  buySection: { backgroundColor: '#f9fafb', borderTopWidth: 1, borderTopColor: BORDER, padding: 12 },
  buyRow: { flexDirection: 'row', alignItems: 'center' },
  buyLabel: { color: TEXT, fontSize: 13, marginRight: 8 },
  input: { width: 56, borderWidth: 1, borderColor: BORDER, borderRadius: 4, paddingVertical: 8, paddingHorizontal: 8, fontSize: 16, color: TEXT, backgroundColor: '#ffffff', marginRight: 8, textAlign: 'center' },
  buyBtn: { backgroundColor: BLUE, borderRadius: 4, paddingVertical: 10, paddingHorizontal: 16, marginRight: 8 },
  buyBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  sellBtn: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: RED, borderRadius: 4, paddingVertical: 9, paddingHorizontal: 12 },
  sellBtnText: { color: RED, fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  priceInline: { color: '#888888', fontSize: 12, fontWeight: '700', marginTop: 8 },
  ownedTag: { color: '#2e7d32', fontSize: 13, fontWeight: '700', marginTop: 6 },
  error: { color: RED, fontSize: 13, fontWeight: '700', marginTop: 6 },

  standNeck: { width: '30%', height: 20, backgroundColor: DARK },
  standBase: { width: '45%', height: 10, borderRadius: 4, backgroundColor: DARK, marginBottom: 16 },

  summary: { width: '100%', backgroundColor: '#ffffff', borderWidth: 1, borderColor: BORDER, borderRadius: 6, padding: 12 },
  summaryTitle: { color: TEXT, fontSize: 16, fontWeight: '800', marginBottom: 8 },
  summaryHeadRow: { flexDirection: 'row', alignItems: 'center', paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: BORDER },
  colHead: { color: '#888888', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  summaryRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  cell: { color: TEXT, fontSize: 14 },
  colName: { flex: 1.4 },
  colNum: { flex: 1, textAlign: 'right' },
  colX: { width: 34, alignItems: 'flex-end' },
  removeX: { color: RED, fontSize: 16, fontWeight: '800' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: BORDER },
  totalLabel: { color: TEXT, fontSize: 14, fontWeight: '800' },
  totalValue: { color: BLUE, fontSize: 16, fontWeight: '800' },
});
