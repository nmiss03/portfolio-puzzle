// Small formatting helpers shared by the stock UI.

export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

export function formatMoney(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`;
}
