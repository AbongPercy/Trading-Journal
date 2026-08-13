// Dropdown options used by the New Trade form.

// Currency pairs, grouped into three sections as required.
export const CURRENCY_GROUPS = [
  {
    label: 'Forex',
    pairs: [
      'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'USD/CAD', 'AUD/USD',
      'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'EUR/AUD', 'EUR/CHF',
      'AUD/JPY', 'CHF/JPY', 'GBP/CHF', 'NZD/JPY', 'CAD/JPY', 'AUD/CAD',
      'AUD/NZD', 'EUR/CAD', 'GBP/AUD', 'GBP/CAD', 'GBP/NZD',
    ],
  },
  {
    label: 'Crypto',
    pairs: ['BTC/USD', 'ETH/USD', 'XRP/USD', 'LTC/USD', 'BCH/USD', 'SOL/USD', 'ADA/USD', 'DOGE/USD', 'BNB/USD'],
  },
  {
    label: 'Metals',
    pairs: ['XAU/USD (Gold)', 'XAG/USD (Silver)', 'XPT/USD (Platinum)', 'XPD/USD (Palladium)'],
  },
];

export const DIRECTIONS = ['Buy', 'Sell'];

// Common preset risk-to-reward ratios. "Other" shows a free-text input.
export const RISK_REWARD_OPTIONS = ['1:1', '1:1.5', '1:2', '1:2.5', '1:3', '1:4', '1:5'];
export const RISK_REWARD_OTHER = 'Other';

// Half-hour slots covering the whole day, e.g. 00:00, 00:30, ... 23:30
export const TIME_SLOTS = (() => {
  const slots = [];
  for (let h = 0; h < 24; h++) {
    const hour = String(h).padStart(2, '0');
    slots.push(`${hour}:00`, `${hour}:30`);
  }
  return slots;
})();
