export const passes = {
  "drop-in": {
    name: "Drop-in",
    variable: "STRIPE_PRICE_DROP_IN",
    amount: 2500,
    months: 0,
    both: false,
  },
  "single-month": {
    name: "One-Month Pass: Single Class",
    variable: "STRIPE_PRICE_SINGLE_MONTH",
    amount: 8000,
    months: 1,
    both: false,
  },
  "single-three-months": {
    name: "Three-Month Pass: Single Class",
    variable: "STRIPE_PRICE_SINGLE_THREE_MONTHS",
    amount: 18000,
    months: 3,
    both: false,
  },
  "both-month": {
    name: "One-Month Pass: Both Classes",
    variable: "STRIPE_PRICE_BOTH_MONTH",
    amount: 10000,
    months: 1,
    both: true,
  },
  "both-three-months": {
    name: "Three-Month Pass: Both Classes",
    variable: "STRIPE_PRICE_BOTH_THREE_MONTHS",
    amount: 26000,
    months: 3,
    both: true,
  },
} as const;
