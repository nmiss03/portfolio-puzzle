import React, { useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import Button from '../components/Button';
import { getStocksByIds, Stock } from '../data/stocks';
import { Holdings } from '../data/scoring';
import { useGame } from '../state/GameContext';
import { formatMoney, formatPrice, formatPE, formatPercent, volatilityLabel } from '../utils/format';

type StringMap = Record<string, string>;

export default function PortfolioBuilder() {
  const router = useRouter();
  const { level, submitHoldings } = useGame();
  const stocks = useMemo(() => getStocksByIds(level.stockIds), [level]);
  const startingCapital = level.customer?.startingCapital ?? 50000;

  const [page, setPage] = useState(0);
  const [holdings, setHoldings] = useState<Holdings>({});
  const [inputs, setInputs] = useState<StringMap>({});
  const [errors, setErrors] = useState<StringMap>({});
  const tickerRef = useRef<ScrollView>(null);

  const spent = useMemo(
    () => stocks.reduce((sum, s) => sum + (holdings[s.id] || 0) * s.price, 0),
    [holdings, stocks]
  );
  const balance = startingCapital - spent;
  const hasHoldings = Object.values(holdings).some((n) => n > 0);

  const stock = stocks[page];
  const owned = holdings[stock.id] || 0;

  const setInput = (id: string, text: string) => {
    const digits = text.replace(/[^0-9]/g, '');
    setInputs((p) => ({ ...p, [id]: digits }));
    if (errors[id]) setErrors((p) => ({ ...p, [id]: '' }));
  };

  const buy = (s: Stock) => {
    const shares = parseInt(inputs[s.id] || '', 10);
    if (!shares || shares <= 0) {
      setErrors((p) => ({ ...p, [s.id]: 'Enter a number of shares' }));
      return;
    }
    const cost = shares * s.price;
    if (cost > balance) {
      setErrors((p) => ({ ...p, [s.id]: 'Insufficient funds' }));
      return;
    }
    setHoldings((p) => ({ ...p, [s.id]: (p[s.id] || 0) + shares }));
    setInputs((p) => ({ ...p, [s.id]: '' }));
    setErrors((p) => ({ ...p, [s.id]: '' }));
  };

  // Undo a purchase: sell the entered number of shares (or all if none typed).
  const sell = (s: Stock) => {
    const have = holdings[s.id] || 0;
    if (have <= 0) {
      setErrors((p) => ({ ...p, [s.id]: "You don't own any shares" }));
      return;
    }
    let n = parseInt(inputs[s.id] || '', 10);
    if (!n || n <= 0) n = have; // no number entered -> sell all
    n = Math.min(n, have);
    setHoldings((p) => {
      const next = { ...p };
      const left = (next[s.id] || 0) - n;
      if (left <= 0) delete next[s.id];
      else next[s.id] = left;
      return next;
    });
    setInputs((p) => ({ ...p, [s.id]: '' }));
    setErrors((p) => ({ ...p, [s.id]: '' }));
  };

  const removeHolding = (id: string) =>
    setHoldings((p) => {
      const next = { ...p };
      delete next[id];
      return next;
    });

  const goTo = (i: number) => setPage(Math.max(0, Math.min(stocks.length - 1, i)));

  const review = () => {
    submitHoldings(holdings);
    router.push('/ResultScreen');
  };

  const ownedStocks = stocks.filter((s) => (holdings[s.id] || 0) > 0);
  const vol = volatilityLabel(stock.volatility);

  const metrics: { label: string; value: string }[] = [
    { label: 'Sector', value: stock.sector },
    { label: 'P/E', value: formatPE(stock.peRatio) },
    { label: 'Dividend', value: formatPercent(stock.dividendYield) },
    { label: 'Volatility', value: vol.label },
    { label: 'Beta', value: stock.beta.toFixed(1) },
    { label: 'EPS', value: stock.eps == null ? 'N/A' : `$${stock.eps.toFixed(2)}` },
    { label: 'Market Cap', value: stock.marketCap },
    { label: '52-Wk Range', value: `${formatPrice(stock.week52Low)} – ${formatPrice(stock.week52High)}` },
  ];

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* ---- Monitor ---- */}
        <View style={styles.monitor}>
          <View style={styles.headerBar}>
            <Text style={styles.headerText}>Available Balance: {formatMoney(Math.round(balance))}</Text>
            <Text style={styles.headerText}>Portfolio Value: {formatMoney(Math.round(spent))}</Text>
          </View>

          <View style={styles.monitorScreen}>
            {/* Ticker tab ribbon — jump straight to any stock */}
            <ScrollView
              ref={tickerRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.ribbon}
              contentContainerStyle={styles.ribbonContent}
            >
              {stocks.map((s, i) => {
                const active = i === page;
                const has = (holdings[s.id] || 0) > 0;
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => goTo(i)}
                    style={[styles.tab, active && styles.tabActive, has && !active && styles.tabOwned]}
                    accessibilityRole="button"
                    accessibilityLabel={`View ${s.ticker}`}
                  >
                    <Text style={[styles.tabText, active && styles.tabTextActive]}>{s.ticker}</Text>
                    {has && <View style={[styles.tabDot, active && { backgroundColor: '#ffffff' }]} />}
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Prev / next */}
            <View style={styles.ribbonNav}>
              <Pressable
                onPress={() => goTo(page - 1)}
                disabled={page === 0}
                style={({ pressed }) => [styles.arrow, page === 0 && styles.arrowDisabled, pressed && { opacity: 0.6 }]}
                accessibilityLabel="Previous stock"
              >
                <Text style={styles.arrowText}>‹</Text>
              </Pressable>
              <Text style={styles.ribbonLabel}>
                {page + 1} / {stocks.length}
              </Text>
              <Pressable
                onPress={() => goTo(page + 1)}
                disabled={page === stocks.length - 1}
                style={({ pressed }) => [
                  styles.arrow,
                  page === stocks.length - 1 && styles.arrowDisabled,
                  pressed && { opacity: 0.6 },
                ]}
                accessibilityLabel="Next stock"
              >
                <Text style={styles.arrowText}>›</Text>
              </Pressable>
            </View>

            {/* ---- Stock research page ---- */}
            <View style={styles.page}>
              <View style={styles.pageHeader}>
                <Text style={styles.stockName}>{stock.name}</Text>
                <Text style={styles.priceLarge}>{formatPrice(stock.price)}</Text>
              </View>
              <Text style={styles.ticker}>
                {stock.ticker} · {stock.sector}
              </Text>

              <Text style={styles.description}>{stock.description}</Text>

              {/* Metrics grid */}
              <View style={styles.metricsGrid}>
                {metrics.map((m) => (
                  <View key={m.label} style={styles.metricCell}>
                    <Text style={styles.metricLabel}>{m.label}</Text>
                    <Text style={styles.metricValue}>{m.value}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.bgLabel}>Background</Text>
              <Text style={styles.bgText}>{stock.background}</Text>

              {owned > 0 && <Text style={styles.ownedTag}>You own {owned} share(s)</Text>}

              <View style={styles.buyRow}>
                <Text style={styles.buyLabel}>Shares:</Text>
                <TextInput
                  style={styles.input}
                  value={inputs[stock.id] || ''}
                  onChangeText={(t) => setInput(stock.id, t)}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor="#999999"
                  maxLength={6}
                />
                <Pressable
                  onPress={() => buy(stock)}
                  style={({ pressed }) => [styles.buyBtn, pressed && { opacity: 0.85 }]}
                  accessibilityRole="button"
                >
                  <Text style={styles.buyBtnText}>BUY</Text>
                </Pressable>
                <Pressable
                  onPress={() => sell(stock)}
                  disabled={owned <= 0}
                  style={({ pressed }) => [
                    styles.sellBtn,
                    owned <= 0 && styles.sellBtnDisabled,
                    pressed && owned > 0 && { opacity: 0.85 },
                  ]}
                  accessibilityRole="button"
                >
                  <Text style={styles.sellBtnText}>SELL</Text>
                </Pressable>
              </View>
              {errors[stock.id] ? <Text style={styles.error}>{errors[stock.id]}</Text> : null}
            </View>
          </View>
        </View>

        {/* Monitor stand */}
        <View style={styles.standNeck} />
        <View style={styles.standBase} />

        {/* ---- Holdings summary ---- */}
        {hasHoldings && (
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Your Holdings</Text>
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
                  <Text style={[styles.colName, styles.cell]} numberOfLines={1}>
                    {s.ticker}
                  </Text>
                  <Text style={[styles.colNum, styles.cell]}>{shares}</Text>
                  <Text style={[styles.colNum, styles.cell]}>{formatMoney(Math.round(shares * s.price))}</Text>
                  <Pressable
                    onPress={() => removeHolding(s.id)}
                    hitSlop={8}
                    style={styles.colX}
                    accessibilityLabel={`Sell all ${s.ticker}`}
                  >
                    <Text style={styles.removeX}>✕</Text>
                  </Pressable>
                </View>
              );
            })}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total invested</Text>
              <Text style={styles.totalValue}>{formatMoney(Math.round(spent))}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {hasHoldings && (
        <View style={styles.footer}>
          <Button title="Review & Score  ›" onPress={review} />
        </View>
      )}
    </View>
  );
}

const DARK = '#2a2a2a';
const BLUE = '#4a90e2';
const BORDER = '#cccccc';
const TEXT = '#1a1a1a';
const RED = '#c0392b';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, alignItems: 'center' },

  monitor: {
    width: '100%',
    borderWidth: 8,
    borderColor: DARK,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: BLUE,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  headerText: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  monitorScreen: { backgroundColor: '#f5f5f5', padding: 12 },

  // Ticker ribbon
  ribbon: { marginBottom: 10 },
  ribbonContent: { paddingRight: 4 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 6,
  },
  tabActive: { backgroundColor: BLUE, borderColor: BLUE },
  tabOwned: { borderColor: '#2e7d32' },
  tabText: { color: TEXT, fontSize: 13, fontWeight: '800' },
  tabTextActive: { color: '#ffffff' },
  tabDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2e7d32', marginLeft: 6 },

  ribbonNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  arrow: {
    width: 40,
    height: 36,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowDisabled: { opacity: 0.4 },
  arrowText: { color: TEXT, fontSize: 24, lineHeight: 26, fontWeight: '800' },
  ribbonLabel: { color: TEXT, fontSize: 14, fontWeight: '800' },

  page: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: BORDER, borderRadius: 4, padding: 12 },
  pageHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  stockName: { color: BLUE, fontSize: 18, fontWeight: '800', flex: 1, paddingRight: 8 },
  priceLarge: { color: TEXT, fontSize: 22, fontWeight: '900' },
  ticker: { color: '#888888', fontSize: 13, fontWeight: '700', marginTop: 2 },
  description: { color: TEXT, fontSize: 15, lineHeight: 21, marginTop: 10 },

  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 8,
  },
  metricCell: { width: '50%', paddingVertical: 5 },
  metricLabel: { color: '#888888', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.3 },
  metricValue: { color: TEXT, fontSize: 15, fontWeight: '700', marginTop: 1 },

  bgLabel: {
    color: '#888888',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 14,
    marginBottom: 4,
  },
  bgText: { color: '#4a4a4a', fontSize: 15, lineHeight: 22 },
  ownedTag: { color: '#2e7d32', fontSize: 14, fontWeight: '700', marginTop: 10 },

  buyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  buyLabel: { color: TEXT, fontSize: 14, marginRight: 8 },
  input: {
    width: 64,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    color: TEXT,
    backgroundColor: '#ffffff',
    marginRight: 8,
    textAlign: 'center',
  },
  buyBtn: { backgroundColor: BLUE, borderRadius: 4, paddingVertical: 10, paddingHorizontal: 16, marginRight: 8 },
  buyBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  sellBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: RED,
    borderRadius: 4,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  sellBtnDisabled: { opacity: 0.4 },
  sellBtnText: { color: RED, fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  error: { color: RED, fontSize: 14, fontWeight: '700', marginTop: 8 },

  standNeck: { width: '30%', height: 20, backgroundColor: DARK },
  standBase: { width: '45%', height: 10, borderRadius: 4, backgroundColor: DARK, marginBottom: 16 },

  summary: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    padding: 12,
  },
  summaryTitle: { color: TEXT, fontSize: 16, fontWeight: '800', marginBottom: 8 },
  summaryHeadRow: { flexDirection: 'row', alignItems: 'center', paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: BORDER },
  colHead: { color: '#888888', fontSize: 13, fontWeight: '800', textTransform: 'uppercase' },
  summaryRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  cell: { color: TEXT, fontSize: 14 },
  colName: { flex: 1.4 },
  colNum: { flex: 1, textAlign: 'right' },
  colX: { width: 34, alignItems: 'flex-end' },
  removeX: { color: RED, fontSize: 16, fontWeight: '800' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  totalLabel: { color: TEXT, fontSize: 14, fontWeight: '800' },
  totalValue: { color: BLUE, fontSize: 16, fontWeight: '800' },

  footer: { padding: 16, borderTopWidth: 1, borderTopColor: BORDER, backgroundColor: '#f5f5f5' },
});
