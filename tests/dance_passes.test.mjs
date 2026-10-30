import assert from "node:assert/strict";
import test from "node:test";

function element(properties = {}) {
  const handlers = new Map();
  return {
    disabled: false,
    hidden: true,
    ...properties,
    addEventListener(name, handler) {
      handlers.set(name, handler);
    },
    setAttribute(name, value) {
      this[name] = value;
    },
    fire(name) {
      return handlers.get(name)?.();
    },
  };
}

async function setup(t, { both = false, failFirst = false } = {}) {
  const input = both ? null : { value: "" };
  const options = both ? [] : [element({ value: "beginner" }), element({ value: "choreography" })];
  const buy = element({ textContent: "Subscribe" });
  const error = element();
  const requests = [];
  const navigations = [];
  const window = element({
    location: {
      assign(url) {
        navigations.push(url);
      },
    },
  });
  const card = {
    dataset: { pass: both ? "both-month" : "single-month" },
    querySelector(selector) {
      return { "[data-class]": input, "[data-buy]": buy, "[data-checkout-error]": error }[selector];
    },
    querySelectorAll() {
      return options;
    },
  };
  globalThis.document = {
    querySelectorAll() {
      return [card];
    },
  };
  globalThis.window = window;
  t.after(() => {
    delete globalThis.document;
    delete globalThis.window;
  });
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "/api/checkout/");
    requests.push(JSON.parse(options.body));
    const failed = failFirst && requests.length === 1;
    return {
      ok: !failed,
      async json() {
        return failed ? { error: "Please retry" } : { url: "https://checkout.stripe.com/example" };
      },
    };
  });
  await import(`../src/scripts/dance_passes.ts?${crypto.randomUUID()}`);
  return { input, options, buy, error, requests, navigations, window };
}

test("checkout retries keep their request ID and browser Back restores the subscription button", async (t) => {
  const page = await setup(t, { failFirst: true });
  assert.equal(page.buy.disabled, true);
  page.options[0].fire("click");
  await page.buy.fire("click");
  assert.equal(page.buy.disabled, false);
  assert.equal(page.buy.textContent, "Subscribe");
  assert.equal(page.error.hidden, false);
  await page.buy.fire("click");
  assert.equal(page.requests[0].requestId, page.requests[1].requestId);
  assert.equal(page.navigations.length, 1);
  assert.equal(page.buy.disabled, true);
  page.window.fire("pageshow");
  assert.equal(page.buy.disabled, false);
  assert.equal(page.options[0].disabled, false);
  assert.equal(page.buy.textContent, "Subscribe");
  page.options[1].fire("click");
  await page.buy.fire("click");
  assert.notEqual(page.requests[2].requestId, page.requests[1].requestId);
  assert.equal(page.requests[2].class, "choreography");
  page.window.fire("pageshow");
  page.options[1].fire("click");
  assert.equal(page.input.value, "");
  assert.equal(page.buy.disabled, true);
});

test("both-class checkout does not require a class selector", async (t) => {
  const page = await setup(t, { both: true });
  assert.equal(page.buy.disabled, false);
  await page.buy.fire("click");
  assert.equal(page.requests[0].pass, "both-month");
  assert.equal(page.requests[0].class, undefined);
  assert.equal(page.navigations.length, 1);
});
