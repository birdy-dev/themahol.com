import { passes } from "../data/dance_passes.ts";

export const classes = {
  beginner: "Beginner: 6:00-7:00 PM",
  choreography: "Intermediate-Advanced Choreography: 7:00-8:00 PM",
  both: "Both classes: 6:00-8:00 PM",
} as const;

export type StripeEnvironment = Record<string, string | undefined>;
export type CheckoutSession = {
  id: string;
  url: string | null;
  status: string;
  payment_status: string;
  livemode: boolean;
  metadata: Record<string, string>;
};

type StripePrice = {
  active: boolean;
  currency: string;
  unit_amount: number;
  livemode: boolean;
  recurring: { interval: string; interval_count: number } | null;
};

export class CheckoutInputError extends Error {}

export function selection(pass: unknown, classChoice: unknown) {
  if (typeof pass !== "string" || !Object.hasOwn(passes, pass)) {
    throw new CheckoutInputError("Choose a valid pass.");
  }
  const offer = passes[pass as keyof typeof passes];
  const selectedClass = offer.both ? "both" : classChoice;
  if (
    selectedClass !== "beginner" &&
    selectedClass !== "choreography" &&
    !(offer.both && selectedClass === "both")
  ) {
    throw new CheckoutInputError("Select Beginner or Intermediate-Advanced Choreography.");
  }
  return { offer, pass, selectedClass: selectedClass as keyof typeof classes };
}

export async function stripeRequest<T>(
  environment: StripeEnvironment,
  path: string,
  body?: URLSearchParams,
  idempotencyKey?: string,
): Promise<T> {
  const key = environment.STRIPE_SECRET_KEY;
  if (!key || !/^(sk|rk)_(test|live)_/.test(key)) throw new Error("Stripe is not configured.");
  if (environment.STRIPE_MODE === "test" && !/^(sk|rk)_test_/.test(key)) {
    throw new Error("Preview checkout requires a Stripe test key.");
  }
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${key}`,
      "Stripe-Version": "2026-10-28.endive",
      ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body,
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    const requestId = response.headers.get("request-id") ?? "unavailable";
    throw new Error(`Stripe request failed: HTTP ${response.status}, request ${requestId}.`);
  }
  return response.json() as Promise<T>;
}

export async function createCheckout(
  environment: StripeEnvironment,
  origin: string,
  pass: unknown,
  classChoice: unknown,
  requestId: string,
) {
  const { offer, selectedClass, pass: passId } = selection(pass, classChoice);
  const priceId = environment[offer.variable];
  if (!priceId?.startsWith("price_")) throw new Error("Pass price is not configured.");
  const price = await stripeRequest<StripePrice>(
    environment,
    `prices/${encodeURIComponent(priceId)}`,
  );
  const live = /^(sk|rk)_live_/.test(environment.STRIPE_SECRET_KEY ?? "");
  if (
    !price.active ||
    price.currency !== "cad" ||
    price.unit_amount !== offer.amount ||
    price.livemode !== live ||
    (offer.months
      ? price.recurring?.interval !== "month" || price.recurring.interval_count !== offer.months
      : price.recurring !== null)
  ) {
    throw new Error("Pass price configuration does not match.");
  }
  const body = new URLSearchParams({
    mode: offer.months ? "subscription" : "payment",
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    "allowed_payment_method_types[0]": "card",
    success_url: `${origin}/checkout/success/?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancel/`,
    "custom_text[submit][message]": `${offer.name}. ${classes[selectedClass]}. Starts when payment succeeds.${offer.months ? ` Automatically renews every ${offer.months === 1 ? "month" : "three months"}.` : " One 60-minute class."}`,
  });
  const metadata = { mahol_pass: passId, class: selectedClass, class_name: classes[selectedClass] };
  const destination = offer.months ? "subscription_data" : "payment_intent_data";
  for (const [key, value] of Object.entries(metadata)) {
    body.set(`metadata[${key}]`, value);
    body.set(`${destination}[metadata][${key}]`, value);
  }
  return stripeRequest<CheckoutSession>(
    environment,
    "checkout/sessions",
    body,
    `mahol-${requestId}`,
  );
}
