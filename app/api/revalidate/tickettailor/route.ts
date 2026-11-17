import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { TICKET_TAILOR_EVENTS_CACHE_TAG } from "@/lib/tickettailor";

/** Ticket Tailor recommends rejecting webhooks signed more than 5 minutes ago. */
const SIGNATURE_TOLERANCE_SECONDS = 5 * 60;

interface TicketTailorWebhookPayload {
  id?: string;
  event?: string;
  resource_url?: string;
}

/**
 * Header format: "t=<unix timestamp>,v1=<hex HMAC-SHA256>" (two
 * comma-separated key=value parts, timestamp first). The signed message is
 * the timestamp immediately followed by the raw request body.
 * https://developers.tickettailor.com/docs/webhook/security
 */
function verifySignature(header: string | null, rawBody: string, secret: string): boolean {
  if (!header) return false;
  const [timestampPart, signaturePart] = header.split(",");
  const timestamp = timestampPart?.split("=")[1]?.trim();
  const signature = signaturePart?.split("=")[1]?.trim();
  if (!timestamp || !signature || !/^\d+$/.test(timestamp)) return false;

  const age = Math.floor(Date.now() / 1000) - Number(timestamp);
  if (Math.abs(age) > SIGNATURE_TOLERANCE_SECONDS) return false;

  const expected = createHmac("sha256", secret).update(timestamp + rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  const providedBuf = Buffer.from(signature.toLowerCase(), "utf8");
  return expectedBuf.length === providedBuf.length && timingSafeEqual(expectedBuf, providedBuf);
}

/**
 * Webhook target for Ticket Tailor (Settings → API → Webhooks), pointed at
 * https://www.desiroom909.com/api/revalidate/tickettailor. Subscribe to
 * Event created/updated/deleted (new rooms, edits, sold out) and Order
 * created/updated (availability changes from sales).
 *
 * Event changes expire the cache immediately so the next visitor sees them.
 * Order webhooks use stale-while-revalidate ("max") so a burst of sales on
 * launch night doesn't turn every page view into a blocking API call.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.TICKETTAILOR_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[tickettailor-webhook] TICKETTAILOR_WEBHOOK_SECRET is not set");
    return NextResponse.json({ message: "Webhook not configured" }, { status: 500 });
  }

  // Signature is computed over the exact raw body, so read text before parsing.
  const rawBody = await request.text();
  if (!verifySignature(request.headers.get("tickettailor-webhook-signature"), rawBody, secret)) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  let payload: TicketTailorWebhookPayload = {};
  try {
    payload = JSON.parse(rawBody);
  } catch {
    // Signed but unparseable — still safe to refresh.
  }

  const topic = (payload.event ?? "").toUpperCase();
  const immediate = !topic.startsWith("ORDER");
  revalidateTag(TICKET_TAILOR_EVENTS_CACHE_TAG, immediate ? { expire: 0 } : "max");

  return NextResponse.json({
    revalidated: true,
    tag: TICKET_TAILOR_EVENTS_CACHE_TAG,
    mode: immediate ? "expire" : "stale-while-revalidate",
    event: payload.event ?? null,
    now: Date.now(),
  });
}
