const WEB_PROTOCOLS = ["http:", "https:"];
const LINK_PROTOCOLS = [...WEB_PROTOCOLS, "mailto:", "tel:"];

/**
 * Returns the href when its protocol is allowed, otherwise an empty string.
 * Chat answers come from a language model and admin-edited content, so every
 * link is checked before it is rendered (blocks `javascript:` and friends).
 */
export function safeHref(href: string | undefined, { webOnly = false } = {}): string {
  if (!href) return "";
  try {
    const { protocol } = new URL(href, "https://placeholder.invalid");
    return (webOnly ? WEB_PROTOCOLS : LINK_PROTOCOLS).includes(protocol) ? href : "";
  } catch {
    return "";
  }
}
