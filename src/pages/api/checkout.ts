import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { createCheckout, CheckoutInputError, type StripeEnvironment } from "../../lib/checkout";

export const prerender = false;
const json = (data: object, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export const POST: APIRoute = async ({ request, url }) => {
  if (request.headers.get("origin") !== url.origin)
    return json({ error: "Please start checkout from this website." }, 403);

  let input: Record<string, unknown>;
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body))
      return json({ error: "Invalid checkout request." }, 400);
    input = body as Record<string, unknown>;
  } catch {
    return json({ error: "Invalid checkout request." }, 400);
  }
  if (typeof input.requestId !== "string" || !/^[0-9a-f-]{36}$/i.test(input.requestId))
    return json({ error: "Please try checkout again." }, 400);

  try {
    const session = await createCheckout(
      env as unknown as StripeEnvironment,
      url.origin,
      input.pass,
      input.class,
      input.requestId,
    );
    if (!session.url || new URL(session.url).hostname !== "checkout.stripe.com")
      throw new Error("Missing checkout URL.");
    return json({ url: session.url });
  } catch (error) {
    if (error instanceof CheckoutInputError) return json({ error: error.message }, 400);
    console.error("Checkout failed:", error instanceof Error ? error.message : "Unknown error");
    return json(
      { error: "Checkout is unavailable right now. Please try again or email info@themahol.com." },
      503,
    );
  }
};
