type Props = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: Props[];
  }
}

export function track(event: string, props?: Props) {
  if (typeof window === "undefined") return;
  const payload = { event, ...props, ts: Date.now() };
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
  console.debug("[analytics]", payload);
}
