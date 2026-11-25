"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

interface TicketButtonProps {
  checkoutUrl: string;
  eventName: string;
  label?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Adds the parameters Ticket Tailor's official embed script
 * (cdn.tickettailor.com/js/widgets/min/widget.js) appends to its checkout
 * URL, so the checkout renders in its embedded "widget" mode. Existing
 * params win, and any #hash is preserved.
 */
function toWidgetUrl(url: string, extra: Record<string, string> = {}): string {
  try {
    const [base, hash] = url.split("#");
    const parsed = new URL(base);
    const params: Record<string, string> = {
      widget: "true",
      minimal: "false",
      show_logo: "false",
      bg_fill: "true",
      ref: "website_widget",
      ...extra,
    };
    for (const [key, value] of Object.entries(params)) {
      if (!parsed.searchParams.has(key)) parsed.searchParams.set(key, value);
    }
    return parsed.toString() + (hash ? `#${hash}` : "");
  } catch {
    return url;
  }
}

function originOf(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

interface TicketTailorFrameMessage {
  type?: string;
  url?: string;
}

/**
 * Opens the Ticket Tailor checkout in an on-site popup (native <dialog>, so
 * Esc/focus handling come for free). The iframe only mounts while open, so
 * every open starts a fresh checkout session and nothing loads from Ticket
 * Tailor until someone clicks.
 *
 * The whole purchase stays in the popup only when `checkoutUrl` is on the
 * box office's custom domain (tickets.desiroom909.com, see
 * TICKETTAILOR_CHECKOUT_DOMAIN in lib/tickettailor.ts). On
 * www.tickettailor.com, TT moves checkout to a new tab after ticket
 * selection because browsers block its cookies in a cross-site frame.
 *
 * Safe to render any number of times per page (no shared global script or
 * DOM ids).
 */
export default function TicketButton({ checkoutUrl, eventName, label = "GET TICKETS", className, style }: TicketButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [open, setOpen] = useState(false);
  const [frameSrc, setFrameSrc] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // TT's checkout talks to its host page with postMessage (the protocol
  // widget.js handles). Route "open checkout" requests into this popup
  // instead of letting them navigate the page away, and honor "close".
  useEffect(() => {
    if (!open) return;
    const checkoutOrigin = originOf(checkoutUrl);
    function onMessage(event: MessageEvent<TicketTailorFrameMessage>) {
      // Only trust messages from our own checkout iframe, on its own origin.
      if (!frameRef.current || event.source !== frameRef.current.contentWindow) return;
      if (event.origin !== checkoutOrigin) return;
      const { type, url } = event.data ?? {};
      if ((type === "tt-event-page-checkout-open" || type === "tt-basket-widget-open") && url && originOf(url) === checkoutOrigin) {
        setFrameSrc(toWidgetUrl(url, { modal_widget: "true" }));
      } else if (type === "tt-checkout-overlay-close" || type === "tt-basket-overlay-close") {
        setOpen(false);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [open, checkoutUrl]);

  if (!checkoutUrl) return null;

  function handleOpen() {
    setFrameSrc(toWidgetUrl(checkoutUrl));
    setOpen(true);
  }

  function handleFrameLoad() {
    // Same handshake widget.js sends once its iframe has loaded.
    const origin = originOf(frameSrc);
    if (origin) frameRef.current?.contentWindow?.postMessage({ type: "tt-widget-frame-init" }, origin);
  }

  return (
    <>
      <button type="button" className={className} style={style} onClick={handleOpen}>
        {label}
      </button>
      <dialog
        ref={dialogRef}
        className="ticket-dialog"
        aria-label={`Tickets for ${eventName}`}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          // Clicking the backdrop (the dialog element itself) closes it.
          if (event.target === event.currentTarget) setOpen(false);
        }}
      >
        <div className="ticket-dialog-panel">
          <div className="ticket-dialog-bar">
            <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="ticket-dialog-fallback">
              Trouble loading? Open in a new tab ↗
            </a>
            <button type="button" className="ticket-dialog-close" aria-label="Close checkout" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>
          {open && frameSrc && (
            <iframe
              ref={frameRef}
              src={frameSrc}
              title={`Ticket checkout for ${eventName}`}
              className="ticket-dialog-frame"
              // payment: Apple Pay / Google Pay inside the embedded checkout.
              allow="fullscreen; payment"
              allowFullScreen
              onLoad={handleFrameLoad}
            />
          )}
        </div>
      </dialog>
    </>
  );
}
