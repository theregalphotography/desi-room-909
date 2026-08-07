"use client";

import Script from "next/script";
import { useRef, type CSSProperties } from "react";

declare global {
  interface Window {
    EBWidgets?: {
      createWidget: (options: {
        widgetType: "checkout";
        eventId: string;
        modal: true;
        modalTriggerElementId: string;
        onOrderComplete?: () => void;
      }) => void;
    };
  }
}

interface TicketWidgetProps {
  eventId: string;
  label?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Renders a button that opens Eventbrite's embedded checkout in a modal,
 * so the buyer never leaves this site. Loads the shared eb_widgets.js
 * script once and registers this button as its modal trigger.
 */
export default function TicketWidget({ eventId, label = "GET TICKETS", className, style }: TicketWidgetProps) {
  const triggerId = `eventbrite-widget-modal-trigger-${eventId}`;
  const registered = useRef(false);

  function registerWidget() {
    if (registered.current || !window.EBWidgets) return;
    window.EBWidgets.createWidget({
      widgetType: "checkout",
      eventId,
      modal: true,
      modalTriggerElementId: triggerId,
    });
    registered.current = true;
  }

  return (
    <>
      <Script
        src="https://www.eventbrite.com/static/widgets/eb_widgets.js"
        strategy="lazyOnload"
        onReady={registerWidget}
      />
      <button type="button" id={triggerId} className={className} style={style}>
        {label}
      </button>
    </>
  );
}
