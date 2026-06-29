import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import Button from '../components/Button';
import { getStocksByIds, Stock } from '../data/stocks';
import { Allocations } from '../data/scoring';
import { useGame } from '../state/GameContext';
import { formatMoney, formatPrice, formatPE, formatPercent } from '../utils/format';

type ShareMap = Record<string, number>;
type StringMap = Record<string, string>;

export default function PortfolioBuilder() {
  const router = useRouter();
  const { level, submitAllocations } = useGame();
  const stocks = useMemo(() => getStocksByIds(level.stockIds), [level]);

  const startingCapital = level.customer?.startingCapital ?? 50000;

  // Currency / portfolio state.
  const [holdings, setHoldings] = useState<ShareMap>({});
  const [inputs, setInputs] = useState<StringMap>({});
  const [errors, setErrors] = useState<StringMap>({});

  const spent = useMemo(
    () => stocks.reduce((sum, s) => sum + (holdings[s.id] || 0) * s.price, 0),
    [holdings, stocks]
  );
  const balance = startingCapital - spent;
  const portfolioValue = spent; // prices are static, so value == cost basis
  const hasHoldings = Object.values(holdings).some((n) => n > 0);

  const setInput = (id: string, text: string) => {
    const digits = text.replace(/[^0-9]/g, '');
    setInputs((p) => ({ ...p, [id]: digits }));
    if (errors[id]) setErrors((p) => ({ ...p, [id]: '' }));
  };

  const buy = (stock: Stock) => {
    const shares = parseInt(inputs[stock.id] || '', 10);
    if (!shares || shares <= 0) {
      setErrors((p) => ({ ...p, [stock.id]: 'Enter a number of shares' }));
      return;
    }
    const cost = shares * stock.price;
    if (cost > balance) {
      setErrors((p) => ({ ...p, [stock.id]: 'Insufficient funds' }));
      return;
    }
    setHoldings((p) => ({ ...p, [stock.id]: (p[stock.id] || 0) + shares }));
    setInputs((p) => ({ ...p, [stock.id]: '' }));
    setErrors((p) => ({ ...p, [stock.id]: '' }));
  };

  const allocate = () => {
    // Convert dollar holdings into percent-of-invested, then score.
    const total = spent;
    const pct: Allocations = {};
    stocks.forEach((s) => {
      const cost = (holdings[s.id] || 0) * s.price;
      pct[s.id] = total > 0 ? (cost / total) * 100 : 0;
    });
    submitAllocations(pct);
    router.push('/ResultScreen');
  };

  const ownedStocks = stocks.filter((s) => (holdings[s.id] || 0) > 0);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* ---- Computer monitor ---- */}
        <View style={styles.monitor}>
          {/* Header bar */}
          <View style={styles.headerBar}>
            <Text style={styles.headerText}>Available Balance: {formatMoney(Math.round(balance))}</Text>
            <Text style={styles.headerText}>Portfolio Value: {formatMoney(Math.round(portfolioValue))}</Text>
          </View>

          <View style={styles.monitorScreen}>
            <Text style={styles.sectionHint}>
              Buy shares to build the client's portfolio. Cost = shares × price.
            </Text>

            {stocks.map((stock) => {
              const owned = holdings[stock.id] || 0;
              return (
                <View key={stock.id} style={styles.card}>
                  <Text style={styles.stockName}>{stock.name}</Text>
                  <View style={styles.dataRow}>
                    <Text style={styles.dataItem}>{formatPrice(stock.price)}/sh</Text>
                    <Text style={styles.dataItem}>{stock.sector}</Text>
                  </View>
                  <View style={styles.dataRow}>
                    <Text style={styles.dataItem}>P/E {formatPE(stock.peRatio)}</Text>
                    <Text style={styles.dataItem}>Div {formatPercent(stock.dividendYield)}</Text>
                    {owned > 0 && <Text style={styles.ownedTag}>Owned: {owned}</Text>}
                  </View>

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
              );
            })}
          </View>
        </View>

        {/* Monitor stand */}
        <View style={styles.standNeck} />
        <View style={styles.standBase} />

        {/* ---- Portfolio summary ---- */}
        {hasHoldings && (
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Your Holdings</Text>
            <View style={styles.summaryHeadRow}>
              <Text style={[styles.colName, styles.colHead]}>Stock</Text>
              <Text style={[styles.colNum, styles.colHead]}>Shares</Text>
              <Text style={[styles.colNum, styles.colHead]}>Cost</Text>
              <Text style={[styles.colNum, styles.colHead]}>Value</Text>
            </View>
            {ownedStocks.map((s) => {
              const shares = holdings[s.id] || 0;
              const value = shares * s.price;
              return (
                <View key={s.id} style={styles.summaryRow}>
                  <Text style={[styles.colName, styles.cell]} numberOfLines={1}>
                    {s.ticker}
                  </Text>
                  <Text style={[styles.colNum, styles.cell]}>{shares}</Text>
                  <Text style={[styles.colNum, styles.cell]}>{formatMoney(Math.round(value))}</Text>
                  <Text style={[styles.colNum, styles.cell]}>{formatMoney(Math.round(value))}</Text>
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

      {/* Allocate appears once the player owns something. */}
      {hasHoldings && (
        <View style={styles.footer}>
          <Button title="Allocate & Score  ›" onPress={allocate} />
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
  screen: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },

  // Monitor
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
  headerText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  monitorScreen: {
    backgroundColor: '#f5f5f5',
    padding: 12,
  },
  sectionHint: {
    color: '#4a4a4a',
    fontSize: 14,
    marginBottom: 12,
  },

  // Stock card
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
  },
  stockName: {
    color: BLUE,
    fontSize: 16,
    fontWeight: '800',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  dataItem: {
    color: TEXT,
    fontSize: 14,
    marginRight: 16,
  },
  ownedTag: {
    color: '#2e7d32',
    fontSize: 14,
    fontWeight: '700',
  },
  buyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  buyLabel: {
    color: TEXT,
    fontSize: 14,
    marginRight: 8,
  },
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
  buyBtn: {
    backgroundColor: BLUE,
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  buyBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  error: {
    color: '#c0392b',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },

  // Stand
  standNeck: {
    width: '30%',
    height: 20,
    backgroundColor: DARK,
  },
  standBase: {
    width: '45%',
    height: 10,
    borderRadius: 4,
    backgroundColor: DARK,
    marginBottom: 16,
  },

  // Summary
  summary: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    padding: 12,
  },
  summaryTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  summaryHeadRow: {
    flexDirection: 'row',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  colHead: {
    color: '#888888',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  summaryRow: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  cell: {
    color: TEXT,
    fontSize: 14,
  },
  colName: {
    flex: 1.4,
  },
  colNum: {
    flex: 1,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  totalLabel: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '800',
  },
  totalValue: {
    color: BLUE,
    fontSize: 16,
    fontWeight: '800',
  },

  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    backgroundColor: '#f5f5f5',
  },
});
