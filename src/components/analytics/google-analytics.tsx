"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const initialized = useRef(false);

  // Initialize gtag on mount (configures the GA4 property).
  useEffect(() => {
    if (!GA_MEASUREMENT_ID || initialized.current) return;
    if (typeof window === "undefined" || !(window as Window & { gtag?: Function }).gtag) return;

    (window as Window & { gtag?: Function }).gtag!("js", new Date());
    (window as Window & { gtag?: Function }).gtag!("config", GA_MEASUREMENT_ID, {
      page_path: pathname,
    });
    initialized.current = true;
  }, []);

  // Send a page_view event on every client-side route change.
  useEffect(() => {
    if (!GA_MEASUREMENT_ID || !initialized.current) return;
    if (typeof window === "undefined" || !(window as Window & { gtag?: Function }).gtag) return;

    (window as Window & { gtag?: Function }).gtag!("event", "page_view", {
      page_path: pathname,
    });
  }, [pathname]);

  return null;
}