import test from "node:test";
import assert from "node:assert/strict";
import { createCheckout, selection, stripeRequest } from "../src/lib/checkout.ts";
import { passes } from "../src/data/dance_passes.ts";

test("rejects invalid passes and missing or forged class selections", () => {
  for (const pass of ["__proto__", "unknown", undefined])
    assert.throws(() => selection(pass, "beginner"));
  for (const pass of ["drop-in", "single-month", "single-three-months"]) {
    for (const value of [undefined, "", "both", "unknown"])
      assert.throws(() => selection(pass, value));
    assert.equal(selection(pass, "beginner").selectedClass, "beginner");
    assert.equal(selection(pass, "choreography").selectedClass, "choreography");
  }
  assert.equal(selection("both-month", "beginner").selectedClass, "both");
});

test("all five passes use server prices, correct billing mode and metadata destination", async (t) => {
  for (const [pass, offer] of Object.entries(passes)) {
    const environment = { STRIPE_SECRET_KEY: "sk_test_example", [offer.variable]: "price_example" };
    const requests = [];
    t.mock.method(globalThis, "fetch", async (url, options) => {
      requests.push({ url, options });
      return Response.json(
        requests.length === 1
          ? {
              active: true,
              currency: "cad",
              unit_amount: offer.amount,
              livemode: false,
              recurring: offer.months ? { interval: "month", interval_count: offer.months } : null,
            }
          : { id: "cs_test_example", url: "https://checkout.stripe.com/example" },
      );
    });
    await createCheckout(environment, "https://example.com", pass, "beginner", "request-id");
    const body = requests[1].options.body;
    assert.equal(body.get("mode"), offer.months ? "subscription" : "payment");
    assert.equal(body.get("line_items[0][price]"), "price_example");
    assert.equal(body.get("metadata[class]"), offer.both ? "both" : "beginner");
    assert.equal(
      body.get(
        `${offer.months ? "subscription_data" : "payment_intent_data"}[metadata][mahol_pass]`,
      ),
      pass,
    );
    assert.equal(
      body.get("success_url"),
      "https://example.com/checkout/success/?session_id={CHECKOUT_SESSION_ID}",
    );
    assert.equal(body.has("subscription_data[billing_cycle_anchor]"), false);
    assert.equal(requests[1].options.headers["Idempotency-Key"], "mahol-request-id");
    t.mock.restoreAll();
  }
});

test("fails closed on wrong amounts, currency, interval, mode, or inactive prices", async (t) => {
  const valid = {
    active: true,
    currency: "cad",
    unit_amount: 8000,
    livemode: false,
    recurring: { interval: "month", interval_count: 1 },
  };
  for (const override of [
    { active: false },
    { currency: "usd" },
    { unit_amount: 9000 },
    { livemode: true },
    { recurring: null },
    { recurring: { interval: "month", interval_count: 3 } },
  ]) {
    let calls = 0;
    t.mock.method(globalThis, "fetch", async () => {
      calls++;
      return Response.json({ ...valid, ...override });
    });
    await assert.rejects(
      createCheckout(
        { STRIPE_SECRET_KEY: "sk_test_example", STRIPE_PRICE_SINGLE_MONTH: "price_example" },
        "https://example.com",
        "single-month",
        "beginner",
        "request-id",
      ),
    );
    assert.equal(calls, 1);
    t.mock.restoreAll();
  }
});

test("missing API key never calls Stripe", async (t) => {
  const mock = t.mock.method(globalThis, "fetch", () => {
    throw new Error("must not call");
  });
  await assert.rejects(
    createCheckout(
      { STRIPE_PRICE_DROP_IN: "price_example" },
      "https://example.com",
      "drop-in",
      "beginner",
      "request-id",
    ),
  );
  assert.equal(mock.mock.callCount(), 0);
});

test("preview configuration rejects live keys before contacting Stripe", async (t) => {
  const mock = t.mock.method(globalThis, "fetch", () => {
    throw new Error("must not call");
  });
  await assert.rejects(
    createCheckout(
      {
        STRIPE_MODE: "test",
        STRIPE_SECRET_KEY: "sk_live_example",
        STRIPE_PRICE_DROP_IN: "price_example",
      },
      "https://example.com",
      "drop-in",
      "beginner",
      "request-id",
    ),
    /test key/,
  );
  assert.equal(mock.mock.callCount(), 0);
});

test("production rejects test keys for checkout and confirmation before contacting Stripe", async (t) => {
  const mock = t.mock.method(globalThis, "fetch", () => {
    throw new Error("must not call");
  });
  for (const key of ["sk_test_example", "rk_test_example"]) {
    const environment = {
      STRIPE_MODE: "live",
      STRIPE_SECRET_KEY: key,
      STRIPE_PRICE_DROP_IN: "price_example",
    };
    await assert.rejects(
      createCheckout(environment, "https://themahol.com", "drop-in", "beginner", "request-id"),
      /live key/,
    );
    await assert.rejects(
      stripeRequest(environment, "checkout/sessions/cs_test_example"),
      /live key/,
    );
  }
  assert.equal(mock.mock.callCount(), 0);
});

test("production permits live secret and restricted keys", async (t) => {
  const mock = t.mock.method(globalThis, "fetch", async () => Response.json({ livemode: true }));
  for (const key of ["sk_live_example", "rk_live_example"]) {
    const result = await stripeRequest(
      { STRIPE_MODE: "live", STRIPE_SECRET_KEY: key },
      "prices/price_example",
    );
    assert.equal(result.livemode, true);
  }
  assert.equal(mock.mock.callCount(), 2);
});

test("Stripe failures include a request ID without exposing response contents", async (t) => {
  t.mock.method(globalThis, "fetch", async () =>
    Response.json(
      { error: { message: "Private provider details" } },
      { status: 400, headers: { "request-id": "req_example" } },
    ),
  );
  await assert.rejects(
    stripeRequest({ STRIPE_SECRET_KEY: "sk_test_example" }, "prices/price_example"),
    (error) => {
      assert.match(error.message, /HTTP 400, request req_example/);
      assert.doesNotMatch(error.message, /Private provider details|sk_test/);
      return true;
    },
  );
});
