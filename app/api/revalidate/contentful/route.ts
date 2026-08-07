import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { CONTENTFUL_TAGS_BY_CONTENT_TYPE } from "@/lib/contentful";

interface ContentfulWebhookPayload {
  sys?: { contentType?: { sys?: { id?: string } } };
}

/**
 * Single webhook target for all Contentful content types. Configure this
 * URL on every publish/unpublish webhook in Contentful (Settings > Webhooks),
 * sending the `X-Webhook-Secret` header set to CONTENTFUL_WEBHOOK_SECRET.
 * The payload's sys.contentType.sys.id tells us which cache tag to bust.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.CONTENTFUL_WEBHOOK_SECRET;
  const providedSecret = request.headers.get("x-webhook-secret");

  if (!secret || providedSecret !== secret) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  const payload: ContentfulWebhookPayload = await request.json().catch(() => ({}));
  const contentTypeId = payload.sys?.contentType?.sys?.id;
  const tag = contentTypeId ? CONTENTFUL_TAGS_BY_CONTENT_TYPE[contentTypeId] : undefined;

  if (!tag) {
    return NextResponse.json(
      { revalidated: false, message: `Unknown content type: ${contentTypeId ?? "none"}` },
      { status: 200 }
    );
  }

  revalidateTag(tag, { expire: 0 });
  return NextResponse.json({ revalidated: true, tag, now: Date.now() });
}
