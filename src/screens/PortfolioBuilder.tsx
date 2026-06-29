import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import Button from '../components/Button';
import { getStocksByIds, Stock } from '../data/stocks';
import { Holdings } from '../data/scoring';
import { useGame } from '../state/GameContext';
import { formatMoney, formatPrice, formatPE, formatPercent } from '../utils/format';

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

  const spent = useMemo(
    () => stocks.reduce((sum, s) => sum + (holdings[s.id] || 0) * s.price, 0),
    [holdings, stocks]
  );
  const balance = startingCapital - spent;
  const hasHoldings = Object.values(holdings).some((n) => n > 0);

  const stock = stocks[page];

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

  const go = (delta: number) =>
    setPage((p) => Math.max(0, Math.min(stocks.length - 1, p + delta)));

  const review = () => {
    submitHoldings(holdings);
    router.push('/ResultScreen');
  };

  const ownedStocks = stocks.filter((s) => (holdings[s.id] || 0) > 0);
  const owned = holdings[stock.id] || 0;

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
            {/* Ribbon navigation */}
            <View style={styles.ribbonNav}>
              <Pressable
                onPress={() => go(-1)}
                disabled={page === 0}
                style={({ pressed }) => [styles.arrow, page === 0 && styles.arrowDisabled, pressed && { opacity: 0.6 }]}
                accessibilityLabel="Previous stock"
              >
                <Text style={styles.arrowText}>‹</Text>
              </Pressable>

              <Text style={styles.ribbonLabel}>
                {stock.ticker} · {page + 1} / {stocks.length}
              </Text>

              <Pressable
                onPress={() => go(1)}
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

            {/* Tab dots */}
            <View style={styles.dots}>
              {stocks.map((s, i) => (
                <Pressable
                  key={s.id}
                  onPress={() => setPage(i)}
                  hitSlop={6}
                  style={[
                    styles.dot,
                    i === page && styles.dotActive,
                    (holdings[s.id] || 0) > 0 && styles.dotOwned,
                  ]}
                  accessibilityLabel={`Go to ${s.ticker}`}
                />
              ))}
            </View>

            {/* ---- Single stock research page ---- */}
            <View style={styles.page}>
              <View style={styles.pageHeader}>
                <Text style={styles.stockName}>{stock.name}</Text>
                <Text style={styles.priceLarge}>{formatPrice(stock.price)}</Text>
              </View>

              <Text style={styles.description}>{stock.description}</Text>

              <Text style={styles.bgLabel}>Background</Text>
              <Text style={styles.bgText}>{stock.background}</Text>

              <Text style={styles.metrics}>
                Sector: {stock.sector}    P/E: {formatPE(stock.peRatio)}    Dividend:{' '}
                {formatPercent(stock.dividendYield)}
              </Text>

              {owned > 0 && <Text style={styles.ownedTag}>You own {owned} share(s)</Text>}

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
                <Pressable
                  onPress={() => buy(stock)}
                  style={({ pressed }) => [styles.buyBtn, pressed && { opacity: 0.85 }]}
                  accessibilityRole="button"
                >
                  <Text style={styles.buyBtnText}>BUY</Text>
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
              <Text style={[styles.colNum, styles.colHead]}>Price</Text>
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
                  <Text style={[styles.colNum, styles.cell]}>{formatPrice(s.price)}</Text>
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

  ribbonNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  arrow: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowDisabled: { opacity: 0.4 },
  arrowText: { color: TEXT, fontSize: 26, lineHeight: 28, fontWeight: '800' },
  ribbonLabel: { color: TEXT, fontSize: 14, fontWeight: '800' },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cccccc',
    margin: 3,
  },
  dotActive: { backgroundColor: BLUE, width: 10, height: 10, borderRadius: 5 },
  dotOwned: { backgroundColor: '#2e7d32' },

  page: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    padding: 12,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stockName: { color: BLUE, fontSize: 18, fontWeight: '800', flex: 1, paddingRight: 8 },
  priceLarge: { color: TEXT, fontSize: 22, fontWeight: '900' },
  description: { color: TEXT, fontSize: 15, lineHeight: 21 },
  bgLabel: {
    color: '#888888',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 4,
  },
  bgText: { color: '#4a4a4a', fontSize: 15, lineHeight: 22 },
  metrics: { color: TEXT, fontSize: 14, marginTop: 12 },
  ownedTag: { color: '#2e7d32', fontSize: 14, fontWeight: '700', marginTop: 8 },

  buyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  buyLabel: { color: TEXT, fontSize: 14, marginRight: 8 },
  input: {
    width: 70,
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
  buyBtn: { backgroundColor: BLUE, borderRadius: 4, paddingVertical: 10, paddingHorizontal: 16 },
  buyBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  error: { color: '#c0392b', fontSize: 14, fontWeight: '700', marginTop: 8 },

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
  summaryHeadRow: { flexDirection: 'row', paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: BORDER },
  colHead: { color: '#888888', fontSize: 13, fontWeight: '800', textTransform: 'uppercase' },
  summaryRow: { flexDirection: 'row', paddingVertical: 6 },
  cell: { color: TEXT, fontSize: 14 },
  colName: { flex: 1.4 },
  colNum: { flex: 1, textAlign: 'right' },
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
